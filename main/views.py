from django.shortcuts import render
from django.contrib.auth.views import(LoginView, LogoutView, TemplateView)
from django.contrib.auth.models import User
from .forms import LoginForm


class Login(LoginView):
    """ログインページ"""
    form_class = LoginForm
    template_name = 'main/index.html'
    
    if User.is_authenticated:
        LogoutView

class Top(TemplateView):
    """TOPページ"""
    template_name = 'main/top.html'