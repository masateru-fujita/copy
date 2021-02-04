# Generated by Django 3.1.3 on 2020-11-19 10:10

from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('project', '0007_auto_20201119_1910'),
    ]

    operations = [
        migrations.CreateModel(
            name='Videos',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=100)),
                ('video', models.FileField(null=True, upload_to='videos/')),
                ('date_created', models.DateField(default=django.utils.timezone.now)),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='project.projects')),
            ],
            options={
                'db_table': 'Videos',
            },
        ),
    ]