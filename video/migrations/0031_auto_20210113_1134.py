# Generated by Django 3.1.3 on 2021-01-13 02:34

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('video', '0030_auto_20210113_1127'),
    ]

    operations = [
        migrations.AlterField(
            model_name='popupimg',
            name='link_tag',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='popup_imgs', to='video.linktag'),
        ),
        migrations.AlterField(
            model_name='popuptext',
            name='link_tag',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='popup_texts', to='video.linktag'),
        ),
    ]