# Generated by Django 3.1.3 on 2021-02-05 02:05

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('view', '0002_auto_20210205_1051'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='actionanalysis',
            name='deleted_at',
        ),
        migrations.RemoveField(
            model_name='useranalysis',
            name='deleted_at',
        ),
        migrations.AlterModelTable(
            name='actionanalysis',
            table='ActionAnalysis',
        ),
    ]