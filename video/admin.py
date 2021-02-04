from django.contrib import admin
from .models import VideoRelation, Video, LinkTag, EndTag

admin.site.register(VideoRelation)
admin.site.register(Video)
admin.site.register(LinkTag)
admin.site.register(EndTag)