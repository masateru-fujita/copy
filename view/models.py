from django.db import models
from django.utils import timezone
from video.models import VideoRelation, Video, LinkTag

class UserAnalysis(models.Model):
    user_agent = models.CharField(max_length=200)
    video_relation = models.ForeignKey(VideoRelation, on_delete=models.SET_NULL, null=True)
    user_cookie = models.CharField(max_length=100)
    access_time = models.DateTimeField(default=timezone.now)
    leave_time = models.DateTimeField(null=True)
    start_time = models.DateTimeField(null=True)
    end_time = models.DateTimeField(null=True)

    def __str__(self):
        return str(self.pk)

    class Meta:
        db_table = 'UserAnalysis'

class ActionAnalysis(models.Model):
    user_analysis = models.ForeignKey(UserAnalysis, on_delete=models.SET_NULL, null=True)
    tag = models.ForeignKey(LinkTag, on_delete=models.SET_NULL, null=True, blank=True)
    action_type = models.CharField(max_length=10)
    action_time = models.TimeField(default=timezone.now, blank=True)
    switch_video = models.ForeignKey(Video, on_delete=models.SET_NULL, null=True, blank=True)
    story_play_time = models.DateField(null=True, blank=True)
    popup_btn_flg = models.BooleanField(default=False)

    def __str__(self):
        return str(self.pk)

    class Meta:
        db_table = 'ActionAnalysis'