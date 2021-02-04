from django.urls import path
from . import views

app_name ='main'

urlpatterns =[
    path('', views.Login.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('top/', views.Top.as_view(), name='top'),
]