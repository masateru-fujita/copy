from django.shortcuts import render
from rest_framework.generics import ListCreateAPIView
from project.models import Project
from video.models import VideoRelation, Video, LinkTag, EndTag
from view.models import UserAnalysis, ActionAnalysis
from project.serializers import *
from video.serializers import *

import json

def report(request):
    return render(request, 'report/report.html')

class ProjectAPIView(ListCreateAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer