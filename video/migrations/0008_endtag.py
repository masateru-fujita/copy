# Generated by Django 3.1.3 on 2020-12-03 01:12

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('video', '0007_auto_20201202_1849'),
    ]

    operations = [
        migrations.CreateModel(
            name='EndTag',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=100)),
                ('content', models.CharField(max_length=100)),
                ('video', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='video.video')),
            ],
            options={
                'db_table': 'EndTag',
            },
        ),
    ]