from .models import VideoRelation, Video, LinkTag, EndTag
from rest_framework.serializers import SerializerMethodField
from rest_framework import serializers

class VideoRelationSerializer(serializers.ModelSerializer):
    videos = SerializerMethodField()
    class Meta:
        model = VideoRelation
        fields = [
            'id',
            'title',
            'videos',
        ]

    def get_videos(self, obj):
        try:
            video_abstruct_contents = VideoSerializer(Video.objects.all().filter(video_relation = VideoRelation.objects.get(id=obj.id)), many=True).data
            return video_abstruct_contents
        except:
            video_abstruct_contents = None
            return video_abstruct_contents

class VideoSerializer(serializers.ModelSerializer):
    linktags = SerializerMethodField()
    class Meta:
        model = Video
        fields = [
            'id',
            'video_relation',
            'video',
            'created_at',
            'linktags',
        ]

    def get_linktags(self, obj):
        try:
            linktag_abstruct_contents = LinkTagSerializer(LinkTag.objects.all().filter(video = Video.objects.get(id=obj.id)), many=True).data
            #↑ここを"Comment.objects.all().filter(target_article = Article.objects.get(id=obj.id)"
            #とだけにすると、"Item is not JSON serializable"というエラーが出ますので
            #Serializer(出力させたいもの).data　という処理が必要です。
            return linktag_abstruct_contents
        except:
            linktag_abstruct_contents = None
            return linktag_abstruct_contents

class LinkTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = LinkTag
        fields = [
            'id',
            'video',
            'title',
            'action_type',
            'link_url',
            'story_next_video',
            'story_start_flame',
            'popup_type',
            'popup_img',
            'popup_text',
            'popup_btn_text',
            'popup_btn_url',
            'x_coordinate',
            'y_coordinate',
            'width',
            'height',
            'display_frame',
            'hide_frame',
            'created_at',
        ]