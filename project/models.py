from django.db import models
from django.utils import timezone

class Project(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    created_at = models.DateField(default=timezone.now)

    def __str__(self):
        return self.title

    class Meta:
        db_table = 'Project'