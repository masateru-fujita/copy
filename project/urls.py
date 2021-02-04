from django.urls import path
from . import views

app_name ='project'

urlpatterns =[
    path('project_list/', views.ProjectCreateView.as_view(), name='project_list'),
    path('edit_project/', views.editProject, name='edit_project'),
    path('delete_project/<int:pk>/', views.deleteProject, name='delete_project'),
]