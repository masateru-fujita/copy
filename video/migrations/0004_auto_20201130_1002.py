# Generated by Django 3.1.3 on 2020-11-30 01:02

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('video', '0003_tags_date_created'),
    ]

    operations = [
        migrations.RenameField(
            model_name='tags',
            old_name='project',
            new_name='video',
        ),
    ]
