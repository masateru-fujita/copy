from django.shortcuts import render
from django.http import HttpResponse
from django.views.generic import ListView
from .models import UserAnalysis, ActionAnalysis
from video.models import VideoRelation, Video, LinkTag, EndTag
from django.core import serializers
from django.views.decorators.clickjacking import xframe_options_exempt
from django.utils.decorators import method_decorator
from datetime import datetime
from django.utils.timezone import make_aware

import json
import secrets

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
        print(request.POST.get('video_relation_id'))
        userAnalysis = UserAnalysis()
        userAnalysis.user_agent = request.META['HTTP_USER_AGENT']
        userAnalysis.user_cookie = request.COOKIES.get('conlad_v_u')
        userAnalysis.video_relation = VideoRelation.objects.get(pk=request.POST.get('video_relation_id'))
        userAnalysis.access_time = make_aware(datetime.strptime(request.POST.get('access_time'), "%Y-%m-%d %H:%M:%S"))
        userAnalysis.leave_time = make_aware(datetime.strptime(request.POST.get('leave_time'), "%Y-%m-%d %H:%M:%S"))
        userAnalysis.start_time = make_aware(datetime.strptime(request.POST.get('start_time'), "%Y-%m-%d %H:%M:%S"))
        userAnalysis.end_time = make_aware(datetime.strptime(request.POST.get('end_time'), "%Y-%m-%d %H:%M:%S"))
        userAnalysis.save()

        return HttpResponse('OK')

    return HttpResponse('NG')