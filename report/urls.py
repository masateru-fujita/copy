from django.urls import path
from . import views

app_name ='report'

urlpatterns =[
    path('report/', views.report, name='report'),
    path('report/get_project_list/', views.ProjectListAPIView.as_view(), name='get_project_list'),
    path('report/get_analysis_all/', views.AnalysisAllAPIView.as_view(), name='get_analysis_all'),
    path('report/get_project_analysis/<int:pk>/', views.ProjectAnalysisAPIView.as_view(), name='get_project_analysis'),
    path('report/get_videorelation_analysis/<int:pk>/', views.VideoRelationAnalysisAPIView.as_view(), name='get_videorelation_analysis'),
]