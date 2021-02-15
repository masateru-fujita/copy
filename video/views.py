from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.views import generic
from django.views.generic import CreateView, UpdateView
from .models import VideoRelation, Video, LinkTag, EndTag
from .forms import VideoRelationForm, VideoForm, LinkTagForm, EndTagForm
from project.models import Project
from django.db import models
from django.urls import reverse_lazy
from config import settings
from django.core import serializers
from django.core.files.storage import default_storage, FileSystemStorage
from django.db.models import Q

import ffmpeg
import subprocess
import cv2
import os.path
import json
import shutil
import glob

class VideoCreateView(CreateView, generic.edit.ModelFormMixin):
    template_name = 'video/video_list.html'
    model = Video
    fields = ()

    def get_context_data(self, **kwargs):
        kwargs['videos'] = VideoRelation.objects.filter(project=self.kwargs['pk'])
        kwargs['project'] = Project.objects.get(id=self.kwargs['pk'])
        return super(VideoCreateView, self).get_context_data(**kwargs)

    def post(self, request, *args, **kwargs):
        if 'video-add-btn' in request.POST:
            video_relation_form = VideoRelationForm(** self.get_form_kwargs())
            if video_relation_form.is_valid():
                video_relation_form.instance.project_id = self.kwargs['pk']
                video_relation_form.save()
                videos = request.FILES.getlist('video')
                firstFlg = True
                for video in videos:
                    video_add_form = VideoForm(** self.get_form_kwargs())
                    video_add_form.instance.video = video
                    video_add_form.instance.video_relation_id = video_relation_form.instance.id
                    video_add_form.save()
                    if firstFlg:
                        make_video_thumb(
                            video_add_form.instance.video.name,
                            video_relation_form.instance.project_id,
                            video_add_form.instance.video_relation_id,
                        )
                        firstFlg = False
                
        self.object = VideoRelation.objects.filter(project_id=self.kwargs['pk'])
        return self.form_invalid(video_relation_form)

    def get_success_url(self):
        return reverse_lazy('video:video_list', kwargs={'pk':self.kwargs['pk']})

class VideoDetailTemplateView(UpdateView, generic.edit.ModelFormMixin):
    template_name = 'video/video_detail.html'
    model = VideoRelation
    fields = ()

    def get_context_data(self, **kwargs):
        kwargs['videos'] = Video.objects.filter(video_relation_id=self.kwargs['pk']).select_related('video_relation')
        kwargs['link_tags'] = LinkTag.objects.filter(video_id=kwargs['videos'][0].id)
        kwargs['relation'] = VideoRelation.objects.get(id=self.kwargs['pk'])
        kwargs['project'] = Project.objects.get(id=kwargs['relation'].project.pk)
        kwargs['next_videos'] = VideoRelation.objects.filter(Q(project_id=kwargs['relation'].project_id) & ~Q(id=kwargs['relation'].id))
        kwargs['link_tags_json'] = serializers.serialize('json', LinkTag.objects.filter(video_id=kwargs['videos'][0].id))
        kwargs['end_tags_json'] = serializers.serialize('json', EndTag.objects.filter(video_id=kwargs['videos'][0].id).select_related('video'))
        LinkTag.video_relation = kwargs['relation'].title
        return super(VideoDetailTemplateView, self).get_context_data(**kwargs)

    def get_success_url(self):
        return reverse_lazy('video:video_detail', kwargs={'pk':self.kwargs['pk']})

    def post(self, request, *args, **kwargs):
        # link-tag追加処理
        if 'link-tag-button' in request.POST:
            link_tag_form = LinkTagForm(**self.get_form_kwargs())
            if link_tag_form.is_valid():
                link_tag_form.save()

            self.object = self.get_object()
            return self.form_invalid(link_tag_form)

        # link-tag更新ボタン
        if 'update-tag-btn' in request.POST:
            link_tag_form = LinkTagForm(**self.get_form_kwargs())
            if(link_tag_form.is_valid()):
                target_tag = LinkTag.objects.get(id=request.POST['link_tag_id'])
                target_tag.title = link_tag_form.cleaned_data['title']
                target_tag.action_type = link_tag_form.cleaned_data['action_type']
                target_tag.link_url = link_tag_form.cleaned_data['link_url']
                target_tag.story_next_video = link_tag_form.cleaned_data['story_next_video']
                target_tag.story_start_flame = link_tag_form.cleaned_data['story_start_flame']
                target_tag.popup_type = link_tag_form.cleaned_data['popup_type']
                if link_tag_form.cleaned_data['popup_img'] != None:
                    target_tag.popup_img = link_tag_form.cleaned_data['popup_img']
                target_tag.popup_text = link_tag_form.cleaned_data['popup_text']
                target_tag.x_coordinate = link_tag_form.cleaned_data['x_coordinate']
                target_tag.y_coordinate = link_tag_form.cleaned_data['y_coordinate']
                target_tag.width = link_tag_form.cleaned_data['width']
                target_tag.height = link_tag_form.cleaned_data['height']
                target_tag.display_frame = link_tag_form.cleaned_data['display_frame']
                target_tag.hide_frame = link_tag_form.cleaned_data['hide_frame']
                target_tag.save()

            self.object = self.get_object()
            return self.form_invalid(link_tag_form)

        # end-tag追加処理
        if 'end-tag-button' in request.POST:
            end_tag_form = EndTagForm(**self.get_form_kwargs())
            if end_tag_form.is_valid():
                EndTag.objects.update_or_create(
                    video = end_tag_form.instance.video,
                    defaults = {
                        "title": end_tag_form.instance.title,
                        "content": end_tag_form.instance.content,
                    },
                )

            self.object = self.get_object()
            return self.form_invalid(end_tag_form)

# サムネ作成
def make_video_thumb(filepath, projectId, videoRelationId):
    up_path = 'static/videos/{0}/{1}/thumb/'.format(projectId, videoRelationId)

    # ディレクトリ作成
    if not os.path.exists(up_path):
        os.mkdir(up_path)

    cap_file = cv2.VideoCapture(filepath)
    ret, frame = cap_file.read()
    if ret:
        cv2.imwrite(up_path + str(videoRelationId) + '.jpg', frame)
        cap_file.release()

# プロジェクト編集
def editVideo(request):
    if request.method == 'GET':
        videoRelation = VideoRelation.objects.get(id=request.GET['id'])
        video_title = videoRelation.title
        # タイトル変更時
        if 'title' in request.GET:
            videoRelation.title = request.GET['title']
            videoRelation.save()
            return HttpResponse(videoRelation.title)
    else:
        return HttpResponse("NG")

# ビデオ削除
def deleteVideo(request, pk):
    if request.method == 'GET':
        video = VideoRelation.objects.get(id=pk)
        video.delete()
        # ディレクトリのVideo削除
        shutil.rmtree('static/videos/{0}/{1}'.format(video.project_id, pk))
        return redirect('video:video_list', pk=video.project_id)

# ストーリー先ビデオ情報取得
def getNextVideo(request):
    if request.method == 'GET':
        if 'next_video' in request.GET:
            next_video_id = request.GET['next_video']
            # 値をJSON形式で作成
            video = Video.objects.filter(video_relation_id=next_video_id).select_related('video_relation')
            link_tag = serializers.serialize('json', LinkTag.objects.filter(video_id=video[0].pk))
            end_tag = serializers.serialize('json', EndTag.objects.filter(video_id=video[0].pk).select_related('video'))
            video_all = [{
                'video': serializers.serialize('json', video),
                'link_tag': link_tag,
                'end_tag': end_tag
            }]
            return HttpResponse(json.dumps(video_all))
    else:
        return HttpResponse("NG")

# tag削除
def deleteTag(request, pk, relationId):
    if request.method == 'GET':
        tag = LinkTag.objects.filter(id=pk)
        tag.delete()
        return redirect('video:video_detail', pk=relationId)
    