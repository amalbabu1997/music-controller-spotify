from .models import Spotify_token
from django.utils import timezone
from datetime import timedelta
from .credentials import CLIENT_ID, CLIENT_SECRET
from requests import post, put, get
import requests

BASE_URL = "https://api.spotify.com/v1/me/"

def get_user_tokens(session_id):
    """Fetch the user's Spotify token from the database."""
    user_tokens = Spotify_token.objects.filter(user=session_id)

    if user_tokens.exists():
        return user_tokens.first()

    print(f"[DEBUG] No Spotify token found for session ID: {session_id}")
    return None

def update_or_create_user_tokens(session_id, access_token, token_type, expires_in, refresh_token):
    """Update or create a Spotify token record in the database."""

    if expires_in is None:
        print(f"[ERROR] expires_in is None for session ID: {session_id}")
        return  #  Prevent storing an invalid token.

    expires_at = timezone.now() + timedelta(seconds=expires_in)
    print(f"[DEBUG] Storing Spotify token for session {session_id} - Expires at: {expires_at}")

    tokens = get_user_tokens(session_id)

    if tokens:
        print(f"[DEBUG] Updating existing token for session {session_id}")
        tokens.access_token = access_token
        tokens.refresh_token = refresh_token
        tokens.expires_in = expires_at  #  Store correct expiry
        tokens.token_type = token_type
        tokens.save(update_fields=['access_token', 'refresh_token', 'expires_in', 'token_type'])
    else:
        print(f"[DEBUG] Creating new token for session {session_id}")
        tokens = Spotify_token(
            user=session_id,
            access_token=access_token,
            refresh_token=refresh_token,
            token_type=token_type,
            expires_in=expires_at  #  Store expiry correctly
        )
        tokens.save()

    print(f"[DEBUG] Token successfully stored for session {session_id} - Expiry: {tokens.expires_in}")


def is_spotify_authenticated(session_id):
    """Check if the Spotify token is still valid."""
    tokens = get_user_tokens(session_id)

    if not tokens:
        print(f"[DEBUG] No Spotify token found for session ID: {session_id}")
        return False

    expiry = tokens.expires_in

    if expiry is None:
        print(f"[ERROR] Expiry time is None for session ID: {session_id}. Forcing token refresh.")
        refresh_spotify_token(session_id)
        tokens = get_user_tokens(session_id)

        if not tokens or tokens.expires_in is None:
            print(f"[ERROR] Failed to refresh token for session ID: {session_id}")
            return False 

        expiry = tokens.expires_in  

    if expiry <= timezone.now():
        print(f"[DEBUG] Token expired for session ID: {session_id}, refreshing...")
        refresh_spotify_token(session_id)
        tokens = get_user_tokens(session_id)

        if not tokens or tokens.expires_in <= timezone.now():
            print(f"[ERROR] Failed to refresh token for session ID: {session_id}")
            return False  

    print(f"[DEBUG] Spotify authentication check passed for session ID: {session_id}. Token expires at {expiry}")
    return True


def refresh_spotify_token(session_id):
    """Refresh the Spotify access token using the refresh token."""
    tokens = get_user_tokens(session_id)
    if not tokens:
        print(f"[ERROR] No token found for session {session_id}, cannot refresh.")
        return

    refresh_token = tokens.refresh_token
    print(f"[DEBUG] Refreshing token for session {session_id}...")

    response = post(
        'https://accounts.spotify.com/api/token',
        data={
            'grant_type': 'refresh_token',
            'refresh_token': refresh_token,
            'client_id': CLIENT_ID,
            'client_secret': CLIENT_SECRET
        }
    ).json()

    access_token = response.get('access_token')
    token_type = response.get('token_type')
    expires_in = response.get('expires_in')
    new_refresh_token = response.get('refresh_token', refresh_token)  # Keep old refresh token if not provided

    if expires_in is None:
        print(f"[ERROR] Failed to retrieve expires_in value during token refresh for session {session_id}")
        return

    print(f"[DEBUG] Successfully refreshed token for session {session_id}. New expiry: {expires_in} seconds from now.")

    update_or_create_user_tokens(session_id, access_token, token_type, expires_in, new_refresh_token)


def execute_spotify_api_request(session_id, endpoint, post_=False, put_=False):
    """Make API requests to Spotify with authentication."""
    tokens = get_user_tokens(session_id)
    if not tokens:
        print("[ERROR] No valid Spotify token found.")
        return {'Error': 'User not authenticated'}

    headers = {
        'Content-Type': 'application/json',
        'Authorization': f"Bearer {tokens.access_token}"
    }

    try:
        if post_:
            response = requests.post(BASE_URL + endpoint, headers=headers)
        elif put_:
            response = requests.put(BASE_URL + endpoint, headers=headers)
        else:
            response = requests.get(BASE_URL + endpoint, headers=headers)

        print(f"[DEBUG] Spotify API request: {BASE_URL}{endpoint} - Status Code: {response.status_code}")

        if response.status_code == 204:
            print(f"[DEBUG] No content from Spotify for endpoint: {endpoint}")
            return {'Error': 'No content available (204 No Content)'}

        if response.status_code == 401:
            print(f"[ERROR] Unauthorized request (401). Token may be expired. Refreshing token...")
            refresh_spotify_token(session_id)
            return {'Error': 'Unauthorized (401). Token may have expired.'}

        if response.status_code != 200:
            print(f"[ERROR] Spotify API error {response.status_code}: {response.text}")
            return {'Error': f"Spotify API error {response.status_code}: {response.text}"}

        print(f"[DEBUG] Successful response from Spotify API: {response.json()}")
        return response.json()

    except requests.exceptions.JSONDecodeError:
        print(f"[ERROR] Failed to parse JSON from Spotify API at endpoint: {endpoint}")
        return {'Error': 'Invalid JSON response from Spotify'}

    except Exception as e:
        print(f"[ERROR] Unexpected error calling Spotify API: {e}")
        return {'Error': f"Unexpected error: {str(e)}"}

def is_premium_user(session_id):
    response = execute_spotify_api_request(session_id, "")
    
    if "Error" in response:
        return False  # If API request fails, assume not premium

    return response.get("product") == "premium"  

def play_song(session_id):
    return execute_spotify_api_request(session_id, "player/play", put_=True)

def pause_song(session_id):
    return execute_spotify_api_request(session_id, "player/pause", put_=True)

def skip_song(session_id):
    return execute_spotify_api_request(session_id, "player/next", post_=True)