# Generated by Django 3.1.3 on 2020-12-16 07:27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('video', '0013_auto_20201216_1603'),
    ]

    operations = [
        migrations.AlterField(
            model_name='linktag',
            name='story_start_flame',
            field=models.IntegerField(default=0),
        ),
    ]
