from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.views.generic import CreateView
from .models import Project
from video.models import VideoRelation
from .forms import ProjectForm
from django.db import models
from django.urls import reverse_lazy
from config import settings

import shutil

class ProjectCreateView(CreateView):
    template_name = 'project/project_list.html'
    form_class = ProjectForm
    model = Project
    success_url = reverse_lazy('project:project_list')

    def get_context_data(self, **kwargs):
        kwargs['projects'] = Project.objects.all()
        return super(ProjectCreateView, self).get_context_data(**kwargs)

# プロジェクト編集
def editProject(request):
    if request.method == 'GET':
        project = Project.objects.get(id=request.GET['id'])
        # タイトル変更時
        if 'title' in request.GET:
            project.title = request.GET['title']
            project.save()
            return HttpResponse(project.title)

        # 詳細変更時
        if 'description' in request.GET:
            project.description = request.GET['description']
            project.save()
            return HttpResponse(project.description)
    else:
        return HttpResponse("NG")

# プロジェクト削除
def deleteProject(request, pk):
    if request.method == 'GET':
        project = Project.objects.get(id=pk)
        project.delete()
        # ディレクトリのVideo削除
        shutil.rmtree('static/videos/{0}'.format(pk))
        return redirect('project:project_list')