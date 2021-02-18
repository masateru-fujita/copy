from .models import UserAnalysis, ActionAnalysis
from video.models import LinkTag
from rest_framework.serializers import Field, SerializerMethodField
from rest_framework import serializers

import datetime

class UserAnalysisSerializer(serializers.ModelSerializer):
    actionAnalysis = SerializerMethodField()
    class Meta:
        model = UserAnalysis
        fields = [
            'id',
            'user_agent',
            'video_relation',
            'user_cookie',
            'access_time',
            'leave_time',
            'start_time',
            'end_time',
            'actionAnalysis',
        ]

    def get_actionAnalysis(self, obj):
        # try:
            action_analysis_abstruct_contents = ActionAnalysisSerializer(ActionAnalysis.objects.all().filter(user_analysis = UserAnalysis.objects.get(id=obj.id)), many=True).data
            return action_analysis_abstruct_contents
        # except:
        #     action_analysis_abstruct_contents = None
        #     return action_analysis_abstruct_contents

class ActionAnalysisSerializer(serializers.ModelSerializer):
    story_play_time = SerializerMethodField()
    class Meta:
        model = ActionAnalysis
        fields = [
            'id',
            'user_analysis',
            'tag',
            'action_type',
            'action_time',
            'switch_video',
            'story_end_time',
            'popup_btn_flg',
            'story_play_time',
        ]

    def get_story_play_time(self, obj):
        try:
            story_start_flame = LinkTag.objects.get(pk=obj.tag.pk).story_start_flame
            start_time = int(story_start_flame) / 30
            print('start_time')
            print(start_time)
            print('obj.story_end_time')
            print(obj.story_end_time)
            print('obj.pk')
            print(obj.pk)
            story_play_time_abstruct_contents = datetime.datetime.combine(datetime.date.today(), obj.story_end_time) - datetime.timedelta(seconds=start_time)
            print('story_play_time_abstruct_contents')
            print(story_play_time_abstruct_contents)
            return story_play_time_abstruct_contents.strftime("%H:%M:%S.%f")
        except:
            story_play_time_abstruct_contents = None
            return story_play_time_abstruct_contents