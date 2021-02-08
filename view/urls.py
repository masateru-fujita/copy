from django.urls import path
from . import views

app_name ='view'

urlpatterns =[
    path('<int:pk>/', views.VideoViewListView.as_view(), name='video_view'),
    path('get_next_video/', views.getNextVideo, name='get_next_video'),
    path('set_user_analysis/', views.setUserAnalysis, name='set_user_analysis'),
    path('set_action_analysis/', views.setActionAnalysis, name='set_action_analysis'),
    path('set_popup_action_btn/', views.setPopupActionBtn, name='set_popup_action_btn'),
]