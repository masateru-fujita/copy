# Generated by Django 3.1.3 on 2021-01-13 05:31

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('video', '0031_auto_20210113_1134'),
    ]

    operations = [
        migrations.AlterField(
            model_name='linktag',
            name='story_next_video',
            field=models.ForeignKey(blank=True, default='', null=True, on_delete=django.db.models.deletion.CASCADE, related_name='story_next_video', to='video.videorelation'),
        ),
    ]
