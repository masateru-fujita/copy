from django.urls import path
from . import views

app_name ='report'

urlpatterns =[
    path('report/', views.report, name='report'),
    path('report/get_projects', views.ProjectAPIView.as_view(), name='get_projects'),
    path('report/get_analysis', views.AnalysisAPIView.as_view(), name='get_analysis'),
]