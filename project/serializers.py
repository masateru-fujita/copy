from .models import Project
from rest_framework.serializers import SerializerMethodField
from rest_framework import serializers
from video.serializers import *

class ProjectSerializer(serializers.ModelSerializer):
    videorelations = SerializerMethodField()
    class Meta:
        model = Project
        fields = [
            'id',
            'title',
            'description',
            'created_at',
            'videorelations',
        ]

    def get_videorelations(self, obj):
        try:
            videorelation_abstruct_contents = VideoRelationSerializer(VideoRelation.objects.all().filter(project = Project.objects.get(id=obj.id)), many=True).data
            return videorelation_abstruct_contents
        except:
            videorelation_abstruct_contents = None
            return videorelation_abstruct_contents