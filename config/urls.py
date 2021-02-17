from django.contrib import admin
from django.urls import path, include
from django.conf import settings

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('main.urls')),
    path('', include('project.urls')),
    path('', include('video.urls')),
    path('', include('view.urls')),
    path('', include('report.urls')),
]
