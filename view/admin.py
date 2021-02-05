from django.contrib import admin
from .models import UserAnalysis, ActionAnalysis

admin.site.register(UserAnalysis)
admin.site.register(ActionAnalysis)