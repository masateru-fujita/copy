# Generated by Django 3.1.3 on 2021-02-24 09:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('video', '0041_videorelation_three_dimensional_flg'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='videorelation',
            name='three_dimensional_flg',
        ),
        migrations.AddField(
            model_name='video',
            name='three_dimensional_flg',
            field=models.BooleanField(default=False),
        ),
    ]
