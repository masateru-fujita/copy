# Generated by Django 3.1.3 on 2020-12-16 09:13

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('video', '0018_auto_20201216_1742'),
    ]

    operations = [
        migrations.AlterField(
            model_name='linktag',
            name='link_url',
            field=models.CharField(blank=True, default='', max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name='linktag',
            name='story_next_video',
            field=models.ForeignKey(blank=True, default='', null=True, on_delete=django.db.models.deletion.CASCADE, related_name='story_next_video', to='video.video'),
        ),
        migrations.AlterField(
            model_name='linktag',
            name='story_start_flame',
            field=models.IntegerField(blank=True, default=0, null=True),
        ),
    ]
