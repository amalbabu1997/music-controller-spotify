from django.db import models
from api.models import Room

# Create your models here.
class Spotify_token(models.Model):
    user=models.CharField(max_length=50,unique=True)
    created_at=models.DateField(auto_now_add=True)
    refresh_token=models.CharField(max_length=150)
    access_token=models.CharField(max_length=150)
    expires_in=models.DateTimeField()
    token_type=models.CharField(max_length=50)


class Vote(models.Model):
    user=models.CharField(max_length=50,unique=True)
    created_at=models.DateField(auto_now_add=True)
    song_id=models.CharField(max_length=50)
    room =models.ForeignKey(Room, on_delete=models.CASCADE)
    