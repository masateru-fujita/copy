# Generated by Django 3.1.3 on 2021-03-03 05:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('video', '0043_auto_20210303_1009'),
    ]

    operations = [
        migrations.RenameField(
            model_name='linktag',
            old_name='camera_position_x',
            new_name='z_coordinate',
        ),
        migrations.RemoveField(
            model_name='linktag',
            name='camera_position_y',
        ),
        migrations.RemoveField(
            model_name='linktag',
            name='camera_position_z',
        ),
        migrations.AlterField(
            model_name='linktag',
            name='x_coordinate',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=5),
        ),
        migrations.AlterField(
            model_name='linktag',
            name='y_coordinate',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=5),
        ),
    ]