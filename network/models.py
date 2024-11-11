from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass

    def serialize(self):
        return {
            "id": self.id,
            "username": self.username,
            "posts": [post.serialize() for post in self.posts.all().order_by("-timestamp")],
            "followers": [follower.user.username for follower in self.followers.all()],
            "following": [follower.to.username for follower in self.following.all()]
        }

class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posts")
    body = models.CharField(max_length=300)
    timestamp = models.DateTimeField(auto_now_add=True)

    def serialize(self):
        return {
            "id": self.id,
            "username": self.user.username,
            "body": self.body,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
            "likes": [like.user.username for like in self.likes.all()]
        }

class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="likes", null=True)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="likes", null=True)
    timestamp = models.DateTimeField(auto_now_add=True, null=True)

class Follower(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="following", null=True)
    to = models.ForeignKey(User, on_delete=models.CASCADE, related_name="followers", null=True)
