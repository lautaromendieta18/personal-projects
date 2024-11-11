
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("user/<str:username>", views.user_view, name="user"),
    path("following", views.following_view, name="following"),

    # API
    path("post", views.post_view, name="post"),
    path("posts/<str:section>", views.request_posts, name="request"),
    path("information/<str:username>", views.user_information, name="information"),
    path("like", views.like, name="like"),
    path("follow", views.follow_user, name="follow"),
    path("edit", views.edit_view, name="edit")
]
