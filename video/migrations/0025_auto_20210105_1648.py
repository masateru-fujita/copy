# Generated by Django 3.1.3 on 2021-01-05 07:48

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('video', '0024_auto_20210105_1528'),
    ]

    operations = [
        migrations.RenameField(
            model_name='videorelation',
            old_name='project_id',
            new_name='project',
        ),
        migrations.RemoveField(
            model_name='video',
            name='title',
        ),
    ]
