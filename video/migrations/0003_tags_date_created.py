# Generated by Django 3.1.3 on 2020-11-27 11:02

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('video', '0002_auto_20201127_1916'),
    ]

    operations = [
        migrations.AddField(
            model_name='tags',
            name='date_created',
            field=models.DateField(default=django.utils.timezone.now),
        ),
    ]
