# Generated by Django 3.1.3 on 2020-11-19 09:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('project', '0005_auto_20201119_1840'),
    ]

    operations = [
        migrations.AlterField(
            model_name='videos',
            name='video',
            field=models.FileField(null=True, upload_to='videos/<django.db.models.fields.related.ForeignKey>'),
        ),
    ]
