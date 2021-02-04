# Generated by Django 3.1.3 on 2020-11-19 09:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('project', '0003_auto_20201119_1652'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='videos',
            name='thumb_frame',
        ),
        migrations.AddField(
            model_name='videos',
            name='video',
            field=models.FileField(null=True, upload_to='videos/<django.db.models.fields.related.ForeignKey>'),
        ),
    ]
