# Generated by Django 3.1.3 on 2020-12-17 02:20

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('video', '0019_auto_20201216_1813'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='video',
            unique_together={('id', 'video')},
        ),
    ]