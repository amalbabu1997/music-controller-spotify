from django.shortcuts import render
from rest_framework import generics, status
from .serializers import RoomSerializer, CreateRoomSerializer,UpdateRoomSerializer
from .models import Room
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import JsonResponse

class RoomView(generics.ListAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    
class GetRoom(APIView):
    serializer_class = RoomSerializer
    lookup_url_kwarg = 'code'

    def get(self, request, format=None):
        code = request.GET.get(self.lookup_url_kwarg)
        if code != None:
            room = Room.objects.filter(code=code)
            if len(room) > 0:
                data = RoomSerializer(room[0]).data
                data['is_host'] = self.request.session.session_key == room[0].host
                
                return Response(data, status=status.HTTP_200_OK)
            return Response({'Room Not Found': 'Invalid Room Code.'}, status=status.HTTP_404_NOT_FOUND)

        return Response({'Bad Request': 'Code paramater not found in request'}, status=status.HTTP_400_BAD_REQUEST)

class JoinRoom(APIView):
    lookup_url_kwarg = 'code'

    def post(self,request,format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        code=request.data.get(self.lookup_url_kwarg)
        if code!=None:
            roomResult= Room.objects.filter(code=code)
            if len(roomResult) > 0:
                
                room=roomResult[0]
                self.request.session['room_code'] =code
                return Response({'message':'Room Joined !'}, status=status.HTTP_200_OK)
            return Response({'Bad Request':'Invalid room Code'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'Bad Request':'Invalid post data, did not find a code key'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    
class CreateRoomView(APIView):
    serializer_class = CreateRoomSerializer

    def post(self, request, format=None):
        # Create a new session if it doesn't exist
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        # Deserialize the incoming data
        serializer = self.serializer_class(data=request.data)

        # Check if the data is valid
        if serializer.is_valid():
            guest_can_pause = serializer.data.get("guest_can_pause")
            votes_to_skip = serializer.data.get("votes_to_skip")
            host = self.request.session.session_key  # Use session key as the host

            # Check if the user already has a room
            queryset = Room.objects.filter(host=host)

            if queryset.exists():
                # If room exists for the host, update it
                room = queryset[0]
                room.guest_can_pause = guest_can_pause
                room.votes_to_skip = votes_to_skip
                room.save(update_fields=["guest_can_pause", "votes_to_skip"])
                self.request.session['room_code'] =room.code
            else:
                # If no room exists for the host, create a new one
                room = Room(host=host, guest_can_pause=guest_can_pause, votes_to_skip=votes_to_skip)
                room.save()
                self.request.session['room_code'] =room.code

            # Return the room details in the response
            return Response(RoomSerializer(room).data, status=status.HTTP_201_CREATED)
        else:
            # If the serializer data is not valid
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserInRoom(APIView):
    def get(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
        
        # Debug log to check session content
        print("Session data:", self.request.session.items())
        
        # Retrieve room_code from session
        room_code = self.request.session.get('room_code')
        
        # Return the room code or None if not found
        data = {
            'code': room_code
        }
        return JsonResponse(data, status=status.HTTP_200_OK)


class LeaveRoom(APIView):
    def post(self,request,format=None):
        if 'room_code' in self.request.session:
            self.request.session.pop('room_code')
            host_id=self.request.session.session_key
            room_results=Room.objects.filter(host=host_id)
            if len(room_results) >0:
                room=room_results[0]
                room.delete()
        return Response({'Message':'Success'},status=status.HTTP_200_OK)


class UpdateRoom(APIView):
    serializer_class = UpdateRoomSerializer

    def patch(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        # Deserialize the incoming data
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            guest_can_pause = serializer.data.get('guest_can_pause')
            votes_to_skip = serializer.data.get('votes_to_skip')
            code = serializer.data.get('code')

            # Check if the room exists
            queryset = Room.objects.filter(code=code)
            if not queryset.exists():  # Corrected to .exists()
                return Response({'msg': 'Room Not Found.'}, status=status.HTTP_404_NOT_FOUND)
            
            room = queryset[0]
            user_id = self.request.session.session_key
            
            # Check if the current user is the host
            if room.host != user_id:
                return Response({'msg': 'You are not authorized to update this room.'}, status=status.HTTP_403_FORBIDDEN)
            
            # Update the room details
            room.guest_can_pause = guest_can_pause
            room.votes_to_skip = votes_to_skip
            room.save(update_fields=['guest_can_pause', 'votes_to_skip'])

            # Return the updated room details
            return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)

        # If serializer data is not valid
        return Response({'msg': 'Invalid Data'}, status=status.HTTP_400_BAD_REQUEST)