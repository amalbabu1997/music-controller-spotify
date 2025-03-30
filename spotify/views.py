from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from requests import Request, post
from django.shortcuts import get_object_or_404
from .credentials import REDIRECT_URI, CLIENT_SECRET, CLIENT_ID
from .util import *
from api.models import Room
from .models import Vote

class AuthURL(APIView):
    def get(self, request, format=None):
        scopes = 'user-read-playback-state user-modify-playback-state user-read-currently-playing'

        url = Request('GET', 'https://accounts.spotify.com/authorize', params={
            'scope': scopes,
            'response_type': 'code',
            'redirect_uri': REDIRECT_URI,
            'client_id': CLIENT_ID
        }).prepare().url

        return Response({'url': url}, status=status.HTTP_200_OK)


def spotify_callback(request, format=None):
    code = request.GET.get('code')
    error = request.GET.get('error')

    if error:
        print(f"[ERROR] Spotify Authentication failed: {error}")
        return redirect('frontend:')

    response = post('https://accounts.spotify.com/api/token', data={
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': REDIRECT_URI,
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET
    }).json()

    access_token = response.get('access_token')
    token_type = response.get('token_type')
    refresh_token = response.get('refresh_token')
    expires_in = response.get('expires_in')

    if not access_token or not expires_in:
        print("[ERROR] Failed to retrieve access token from Spotify API")
        return redirect('frontend:')

    if not request.session.exists(request.session.session_key):
        request.session.create()

    session_id = request.session.session_key  # Unique session ID per user
    
    update_or_create_user_tokens(session_id, access_token, token_type, expires_in, refresh_token)
    
    print(f"[DEBUG] Spotify Authentication Successful for session: {session_id}")
    return redirect('frontend:')


class IsAuthenticated(APIView):
    def get(self, request, format=None):
        is_authenticated = is_spotify_authenticated(self.request.session.session_key)
        return Response({'status': is_authenticated}, status=status.HTTP_200_OK)


class CurrentSong(APIView):
    def get(self, request, format=None):
        room_code = request.session.get("room_code")
        if not room_code:
            return Response({"error": "User is not in a room"}, status=status.HTTP_400_BAD_REQUEST)

        room = get_object_or_404(Room, code=room_code)
        host = room.host
        
        endpoint = "player/currently-playing"
        response = execute_spotify_api_request(host, endpoint)

        if "error" in response or response.get("item") is None:
            return Response({"error": "No song is currently playing"}, status=status.HTTP_204_NO_CONTENT)

        song_id = response["item"]["id"]
        self.update_room_song(room, song_id)

        votes = Vote.objects.filter(room=room, song_id=song_id).count()

        song = {
            "title": response["item"]["name"],
            "artist": ", ".join(artist["name"] for artist in response["item"]["artists"]),
            "album_image": response["item"]["album"]["images"][0]["url"],
            "progress_ms": response["progress_ms"],
            "duration_ms": response["item"]["duration_ms"],
            "votes": votes,
            "votes_required": room.votes_to_skip,
            "song_id": song_id,
        }
        return Response(song, status=status.HTTP_200_OK)

    def update_room_song(self, room, song_id):
        if room.current_song != song_id:
            room.current_song = song_id
            room.save(update_fields=["current_song"])
            Vote.objects.filter(room=room).delete()


class PauseSong(APIView):
    def put(self, request, format=None):
        room_code = request.session.get('room_code')
        
        if not room_code:
            return Response({"error": "Room code not found in session"}, status=status.HTTP_400_BAD_REQUEST)
        
        room = get_object_or_404(Room, code=room_code)
        
        session_key = request.session.session_key
        if session_key is None:
            request.session.save()  # Ensure session key exists
            session_key = request.session.session_key
        
        if session_key == room.host or room.guest_can_pause:
            pause_song(room.host)
            return Response({}, status=status.HTTP_204_NO_CONTENT)

        return Response({"error": "Not authorized to pause song"}, status=status.HTTP_403_FORBIDDEN)

class PlaySong(APIView):
    def put(self, request, format=None):
        room = get_object_or_404(Room, code=self.request.session.get('room_code'))
        if self.request.session.session_key == room.host or room.guest_can_pause:
            play_song(room.host)
            return Response({}, status=status.HTTP_204_NO_CONTENT)
        return Response({"error": "Not a premium User"}, status=status.HTTP_403_FORBIDDEN)


class SkipSong(APIView):
    def post(self, request, format=None):
        room_code = request.session.get("room_code")
        if not room_code:
            return Response({"error": "User is not in a room"}, status=status.HTTP_400_BAD_REQUEST)

        room = get_object_or_404(Room, code=room_code)
        song_id = room.current_song
        if not song_id:
            return Response({"error": "No song is currently playing"}, status=status.HTTP_400_BAD_REQUEST)

        votes = Vote.objects.filter(room=room, song_id=song_id)
        votes_needed = room.votes_to_skip

        print(f"[DEBUG] Current votes for {song_id}: {votes.count()}/{votes_needed}")

        if Vote.objects.filter(room=room, song_id=song_id, user=request.session.session_key).exists():
            return Response({"error": "You have already voted"}, status=status.HTTP_403_FORBIDDEN)

        Vote.objects.create(user=request.session.session_key, room=room, song_id=song_id)

        if votes.count() + 1 >= votes_needed:
            print(f"[DEBUG] Vote threshold reached! Skipping song: {song_id}")
            execute_spotify_api_request(room.host, "player/next", post_=True)
            room.current_song = None
            room.save(update_fields=["current_song"])
            Vote.objects.filter(room=room).delete()

        return Response({}, status=status.HTTP_204_NO_CONTENT)
