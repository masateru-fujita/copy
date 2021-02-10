from django.urls import path
from . import views

app_name ='view'

urlpatterns =[
    path('<int:pk>/', views.VideoViewListView.as_view(), name='video_view'),
    path('get_next_video/', views.getNextVideo, name='get_next_video'),
    path('set_user_analysis/', views.setUserAnalysis, name='set_user_analysis'),
    path('set_action_analysis/', views.setActionAnalysis, name='set_action_analysis'),
    path('set_popup_flg/', views.setPopupFlg, name='set_popup_flg'),
    path('set_start_time/', views.setStartTime, name='set_start_time'),
    path('set_leave_time/', views.setLeaveTime, name='set_leave_time'),
    path('set_story_end_time/', views.setStoryEndTime, name='set_story_end_time'),
]