from django.db import models
from django.utils import timezone
from project.models import Project
from config import settings
from django.forms.models import model_to_dict
from django.dispatch import receiver
from django.db.models.signals import post_save, pre_save
import os

def get_upload_to(instance, filename):
    root, ext = os.path.splitext(filename)
    return 'static/videos/{0}/{1}/{2}{3}'.format(instance.video_relation.project.pk, instance.video_relation.pk, instance.pk, ext)

class VideoRelation(models.Model):
    title = models.CharField(max_length=100)
    project = models.ForeignKey(Project, on_delete=models.CASCADE)

    def __str__(self):
        return self.title

    class Meta:
        db_table = 'VideoRelation'

class Video(models.Model):
    video_relation = models.ForeignKey(VideoRelation, on_delete=models.CASCADE)
    video = models.FileField(upload_to=get_upload_to, null=True)
    created_at = models.DateField(default=timezone.now)

    class Meta:
        db_table = 'Video'

_UNSAVED_FILEFIELD = 'unsaved_filefield'

@receiver(pre_save, sender=Video)
def skip_saving_file(sender, instance, **kwargs):
    if not instance.pk and not hasattr(instance, _UNSAVED_FILEFIELD):
        setattr(instance, _UNSAVED_FILEFIELD, instance.video)
        instance.video = None

@receiver(post_save, sender=Video)
def save_file(sender, instance, created, **kwargs):
    if created and hasattr(instance, _UNSAVED_FILEFIELD):
        instance.video = getattr(instance, _UNSAVED_FILEFIELD)
        instance.save()
        instance.__dict__.pop(_UNSAVED_FILEFIELD)

def get_popup_upload_to(instance, filename):
    return os.path.join('static/videos/' + str(LinkTag.video_relation) + '/popupImg', filename)

class LinkTag(models.Model):
    video = models.ForeignKey(Video, on_delete=models.CASCADE)
    title = models.CharField(max_length=20)
    action_type = models.CharField(max_length=20)
    link_url = models.CharField(max_length=100, default='', blank=True, null=True)
    story_next_video = models.ForeignKey(VideoRelation, default='', on_delete=models.CASCADE, related_name='story_next_video', blank=True, null=True)
    story_start_flame = models.IntegerField(default=0, null=True, blank=True)
    popup_type = models.CharField(max_length=20, default='', blank=True, null=True)
    popup_img = models.FileField(upload_to=get_popup_upload_to, null=True, blank=True)
    popup_text = models.CharField(max_length=100, default='', blank=True, null=True)
    popup_btn_text = models.CharField(max_length=100, default='', blank=True, null=True)
    popup_btn_url = models.URLField(max_length=100, default='', blank=True, null=True)
    x_coordinate = models.DecimalField(blank=False, null=False, decimal_places=2, max_digits=5)
    y_coordinate = models.DecimalField(blank=False, null=False, decimal_places=2, max_digits=5)
    width = models.DecimalField(blank=False, null=False, decimal_places=2, max_digits=5)
    height = models.DecimalField(blank=False, null=False, decimal_places=2, max_digits=5)
    display_frame = models.IntegerField(blank=False, null=False)
    hide_frame = models.IntegerField(blank=False, null=False)
    created_at = models.DateField(default=timezone.now)

    def filename(self):
        return os.path.basename(self.file.name)
    
    def get_relation_name(self):
        return self.__video_relation

    def set_relation_name(self, value):
        self.__video_relation = value
    
    video_relation = property(get_relation_name, set_relation_name)

    def __str__(self):
        return self.title

    class Meta:
        db_table = 'LinkTag'

class EndTag(models.Model):
    video = models.ForeignKey(Video, on_delete=models.CASCADE)
    title = models.CharField(max_length=100)
    content = models.CharField(max_length=100)

    def __str__(self):
        return self.title

    class Meta:
        db_table = 'EndTag'
