from django.shortcuts import render
from django.http import HttpResponse
from django.views.generic import ListView
from .models import UserAnalysis, ActionAnalysis
from video.models import VideoRelation, Video, LinkTag, EndTag
from django.core import serializers
from django.views.decorators.clickjacking import xframe_options_exempt
from django.utils.decorators import method_decorator
from django.utils import timezone

import json
import secrets
import datetime

@method_decorator(xframe_options_exempt, name='dispatch')
class VideoViewListView(ListView):
    template_name = 'view/view.html'
    model = Video

    def render_to_response(self, context, **response_kwargs):
        response = super().render_to_response(context, **response_kwargs)
        if not ('conlad_v_u' in self.request.COOKIES):
            token = secrets.token_hex()
            response.set_cookie('conlad_v_u', token)
        return response

    def get_context_data(self, **kwargs):
        userAgent = self.request.META['HTTP_USER_AGENT']
        kwargs['videos'] = Video.objects.filter(video_relation_id=self.kwargs['pk'])
        kwargs['link_tags_json'] = serializers.serialize('json', LinkTag.objects.filter(video_id=kwargs['videos'][0].id))
        kwargs['end_tag_json'] = serializers.serialize('json', EndTag.objects.filter(video_id=kwargs['videos'][0].id))
        return super(VideoViewListView, self).get_context_data(**kwargs)

# ストーリー先ビデオ情報取得
@xframe_options_exempt
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

# アクセス情報保存
@xframe_options_exempt
def setUserAnalysis(request):
    if request.method == 'POST':
        userAnalysis = UserAnalysis()
        userAnalysis.user_agent = request.META['HTTP_USER_AGENT']
        userAnalysis.user_cookie = request.COOKIES.get('conlad_v_u')
        userAnalysis.video_relation = VideoRelation.objects.get(pk=request.POST.get('video_relation_id'))
        userAnalysis.save()

        return HttpResponse(userAnalysis.pk)

    return HttpResponse('NG')

# アクセス情報保存
@xframe_options_exempt
def setActionAnalysis(request):
    if request.method == 'POST':
        actionAnalysis = ActionAnalysis()
        actionAnalysis.user_analysis = UserAnalysis.objects.get(pk=request.POST.get('user_analysis_id'))
        if((request.POST.get('action_type') != 'switch') and (request.POST.get('action_type') != 'story_back')):
            actionAnalysis.tag = LinkTag.objects.get(pk=request.POST.get('tag_id'))
        actionAnalysis.action_type = request.POST.get('action_type')
        actionAnalysis.action_time = str(datetime.timedelta(seconds=float(request.POST.get('action_time'))))
        if request.POST.get('action_type') == "link":
            pass
        elif request.POST.get('action_type') == "popup":
            pass
        elif request.POST.get('action_type') == "story":
            pass
        elif request.POST.get('action_type') == "switch":
            actionAnalysis.switch_video = Video.objects.get(pk=request.POST.get('switch_video_id'))

        actionAnalysis.save()

        return HttpResponse(actionAnalysis.pk)

    return HttpResponse('NG')

# POPUPボタン押下イベント時
@xframe_options_exempt
def setPopupFlg(request):
    if request.method == 'POST':
        actionAnalysis = ActionAnalysis.objects.get(pk=request.POST.get('popup_analysis_id'))
        actionAnalysis.popup_btn_flg = True
        actionAnalysis.save()

        return HttpResponse(actionAnalysis.pk)

    return HttpResponse('NG')

# 動画再生イベント
@xframe_options_exempt
def setStartTime(request):
    if request.method == 'POST':
        userAnalysis = UserAnalysis.objects.get(pk=request.POST.get('user_analysis_id'))
        userAnalysis.start_time = timezone.datetime.now()
        userAnalysis.save()

        return HttpResponse(userAnalysis.pk)

    return HttpResponse('NG')

# ページ離脱時イベント時
@xframe_options_exempt
def setLeaveTime(request):
    if request.method == 'POST':
        userAnalysis = UserAnalysis.objects.get(pk=request.POST.get('user_analysis_id'))
        userAnalysis.leave_time = timezone.datetime.now()
        userAnalysis.end_time = str(datetime.timedelta(seconds=float(request.POST.get('end_time'))))
        userAnalysis.save()

        return HttpResponse(userAnalysis.pk)

    return HttpResponse('NG')

# ストーリー終了時間格納メソッド
@xframe_options_exempt
def setStoryEndTime(request):
    if request.method == 'POST':
        actionAnalysis = ActionAnalysis.objects.get(pk=request.POST.get('story_analysis_id'))
        actionAnalysis.story_end_time = str(datetime.timedelta(seconds=float(request.POST.get('story_end_time'))))
        actionAnalysis.save()

        return HttpResponse(actionAnalysis.pk)

    return HttpResponse('NG')