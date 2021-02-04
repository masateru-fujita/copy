from django.db import models
from video.models import VideoRelation, Video, LinkTag

# class TagAnalysis(models.Model):
#     tag = models.ForeignKey(LinkTag, on_delete=models.CASCADE)
#     clickCount = models.IntegerField()

#     def __str__(self):
#         return self.tag

#     class Meta:
#         db_table = 'TagAnalysis'

# class VideoRelationAnalysis(models.Model):
#     videoRelation = models.ForeignKey(VideoRelation, on_delete=models.CASCADE)
#     playCount = models.IntegerField()
    

#     def __str__(self):
#         return self.videoRelation

#     class Meta:
#         db_table = 'VideoRelationAnalysis'

# class VideoAnalysis(models.Model):
#     video = models.ForeignKey(Video, on_delete=models.CASCADE)
#     playCount = models.IntegerField()
#     swichingCount = models.IntegerField()
    

#     def __str__(self):
#         return self.video

#     class Meta:
#         db_table = 'VideoAnalysis'