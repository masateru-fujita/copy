# Generated by Django 3.1.3 on 2021-02-05 02:09

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('video', '0040_auto_20210205_1106'),
        ('view', '0003_auto_20210205_1105'),
    ]

    operations = [
        migrations.AlterField(
            model_name='actionanalysis',
            name='switchVideoId',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='video.video'),
        ),
        migrations.AlterField(
            model_name='actionanalysis',
            name='tagId',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='video.linktag'),
        ),
        migrations.AlterField(
            model_name='actionanalysis',
            name='userId',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='view.useranalysis'),
        ),
        migrations.AlterField(
            model_name='useranalysis',
            name='playVideoRelationId',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='video.videorelation'),
        ),
    ]
