from django.urls import path
from . import views

app_name ='video'

urlpatterns =[
    path('video_list/<int:pk>/', views.VideoCreateView.as_view(), name='video_list'),
    path('video_detail/<int:pk>/', views.VideoDetailTemplateView.as_view(), name='video_detail'),
    path('next_video/', views.getNextVideo, name='next_video'),
    path('edit_video/', views.editVideo, name='edit_video'),
    path('delete_video/<int:pk>/', views.deleteVideo, name='delete_video'),
    path('delete_tag/<int:relationId>/<int:pk>/', views.deleteTag, name='delete_tag'),
]