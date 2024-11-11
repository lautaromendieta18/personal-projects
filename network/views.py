import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import AnonymousUser
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth.decorators import login_required

from .models import User, Post, Like, Follower


def index(request):
    return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")


def post_view(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    
    user = User.objects.get(id=request.user.id)
    data = json.loads(request.body)
    content = data.get("content", "")

    newPost = Post(user=user, body=content)
    newPost.save()

    return JsonResponse({"message": "Post posted successfully."}, status=201)


def request_posts(request, section):
    if section == "posts":
        posts = Post.objects.all()
    
    if section == "following":
        listFollowing = request.user.following.all()
        following = [user.to for user in listFollowing]
        posts = Post.objects.all().filter(user__in=following)
    
    posts = posts.order_by("-timestamp").all()
    return JsonResponse([post.serialize() for post in posts], safe=False)


def like(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    data = json.loads(request.body)

    try:
        user = User.objects.get(id=request.user.id)
    except User.DoesNotExist:
        return JsonResponse({"message": "login required"}, status=400)
    print(user)
    post = Post.objects.get(id=data.get("id", ""))

    try: 
        like = Like.objects.get(user=user, post=post)
        like.delete()
        return JsonResponse({"message": "removed"}, status=201)
    except Like.DoesNotExist:
        like = Like(user=user, post=post)
        like.save()
        return JsonResponse({"message": "succesfull"}, status=201)


def user_view(request, username):
    if not request.user.is_anonymous:
        following = request.user.following.all()
        isFollowing = False
        
        userProf = User.objects.get(username=username)

        for user in following:
            print(f"Checking if {user.user} is equal to {userProf}")
            if user.to == userProf:
                isFollowing = True

        print(isFollowing)
    else:
        isFollowing = False

    return render(request, "network/user.html", {
        "userPage": User.objects.get(username=username),
        "isFollowing": isFollowing
    })
    

def user_information(request, username):
    user = User.objects.get(username=username)
    return JsonResponse(user.serialize(), safe=False)

def follow_user(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    data = json.loads(request.body)

    user = User.objects.get(id=request.user.id)
    target = User.objects.get(username=data.get("username", ""))

    try:
        follow = Follower.objects.get(user=user, to=target)
        follow.delete()
        return JsonResponse({"message": "unfollow"}, status=201)
    except Follower.DoesNotExist:
        follow = Follower(user=user, to=target)
        follow.save()
        return JsonResponse({"message": "succesfull"}, status=201)

@login_required
def following_view(request):
    return render(request, "network/following.html")


def edit_view(request):
    if request.method != "PUT":
        return JsonResponse({"error": "PUT request required."}, status=400)
    
    data = json.loads(request.body)
    post = Post.objects.get(pk=data.get("id", ""))
    
    print(post.body)

    post.body = data.get("body", "")
    print(post.body)
    post.save()

    return JsonResponse({"message": "succesfull"}, status=201)
