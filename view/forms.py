from .models import UserAnalysis, ActionAnalysis
from video.models import VideoRelation, Video, LinkTag, EndTag
from django import forms

class UserAnalysisForm(forms.ModelForm):
    class Meta:
        model = UserAnalysis
        fields = ('play_video_relation_id', 'access_time', 'leave_time', 'start_time', 'end_time')