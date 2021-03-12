# Generated by Django 3.1.3 on 2021-03-03 01:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('video', '0042_auto_20210224_1832'),
    ]

    operations = [
        migrations.AddField(
            model_name='linktag',
            name='camera_position_x',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=5),
        ),
        migrations.AddField(
            model_name='linktag',
            name='camera_position_y',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=5),
        ),
        migrations.AddField(
            model_name='linktag',
            name='camera_position_z',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=5),
        ),
    ]
