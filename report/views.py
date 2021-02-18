from django.shortcuts import render
from rest_framework.generics import ListAPIView, RetrieveAPIView
from project.models import Project
from video.models import VideoRelation, Video, LinkTag, EndTag
from view.models import UserAnalysis, ActionAnalysis
from project.serializers import *
from video.serializers import *
from view.serializers import *

import json

def report(request):
    return render(request, 'report/report.html')

class ProjectListAPIView(ListAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

class AnalysisAllAPIView(ListAPIView):
    queryset = UserAnalysis.objects.all()
    serializer_class = UserAnalysisSerializer

class ProjectAnalysisAPIView(ListAPIView):
    queryset = UserAnalysis.objects.all()
    serializer_class = UserAnalysisSerializer

    def get_queryset(self):
        relationIds = VideoRelation.objects.filter(project_id=self.kwargs['pk']).values('pk')
        return self.queryset.filter(video_relation_id__in=relationIds)

class VideoRelationAnalysisAPIView(ListAPIView):
    queryset = UserAnalysis.objects.all()
    serializer_class = UserAnalysisSerializer

    def get_queryset(self):
        relationId = VideoRelation.objects.get(pk=self.kwargs['pk']).pk
        return self.queryset.filter(video_relation_id=relationId)