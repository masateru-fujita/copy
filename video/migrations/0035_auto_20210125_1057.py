# Generated by Django 3.1.3 on 2021-01-25 01:57

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('video', '0034_auto_20210125_1043'),
    ]

    operations = [
        migrations.RenameField(
            model_name='linktag',
            old_name='popup_image',
            new_name='popup_img',
        ),
        migrations.RemoveField(
            model_name='linktag',
            name='popup_height',
        ),
        migrations.RemoveField(
            model_name='linktag',
            name='popup_width',
        ),
        migrations.RemoveField(
            model_name='linktag',
            name='popup_x_coordinate',
        ),
        migrations.RemoveField(
            model_name='linktag',
            name='popup_y_coordinate',
        ),
    ]
