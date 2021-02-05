from .models import VideoRelation, Video, LinkTag, EndTag
from django import forms

class VideoRelationForm(forms.ModelForm):
    class Meta:
        model = VideoRelation
        fields = ('title',)

class VideoForm(forms.ModelForm):
    class Meta:
        model = Video
        fields = ()

class LinkTagForm(forms.ModelForm):
    class Meta:
        model = LinkTag
        fields = ('video', 'title', 'action_type', 'link_url', 'story_next_video', 'story_start_flame', 'popup_type', 'popup_img', 'popup_text', 'popup_btn_text', 'popup_btn_url', 'x_coordinate', 'y_coordinate', 'width', 'height', 'display_frame', 'hide_frame')

class EndTagForm(forms.ModelForm):
    class Meta:
        model = EndTag
        fields = ('video', 'title', 'content')