from django.urls import path
from . import views

app_name ='view'

urlpatterns =[
    path('<int:pk>/', views.VideoViewListView.as_view(), name='video_view'),
    path('get_next_video/', views.getNextVideo, name='get_next_video'),
]