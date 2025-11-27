# Generated manually for field additions
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('classes', '0002_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='kelas',
            name='tingkat',
            field=models.CharField(default='X', max_length=10),
        ),
        migrations.AlterField(
            model_name='kelas',
            name='kode',
            field=models.CharField(blank=True, max_length=30, unique=True),
        ),
        migrations.AlterField(
            model_name='kelas',
            name='wali_guru',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='kelas_wali', to=settings.AUTH_USER_MODEL),
        ),
    ]

