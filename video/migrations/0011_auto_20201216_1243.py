# Generated by Django 3.1.3 on 2020-12-16 03:43

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('video', '0010_remove_video_thumbnail'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='linktag',
            name='url',
        ),
        migrations.AddField(
            model_name='linktag',
            name='action_type',
            field=models.CharField(default='link', max_length=20),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='linktag',
            name='link_url',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='linktag',
            name='story_next_video',
            field=models.OneToOneField(blank=True, default=1, on_delete=django.db.models.deletion.CASCADE, related_name='story_next_video', to='video.video'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='linktag',
            name='story_start_flame',
            field=models.IntegerField(blank=True, default='1'),
            preserve_default=False,
        ),
    ]
