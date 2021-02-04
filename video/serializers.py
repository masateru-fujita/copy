import json
from django.db import models as django_models
from django.db.models.query import QuerySet

class MyJsonEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, django_models.Model) and hasattr(obj, 'to_dict'):
            return obj.to_dict()
        if isinstance(obj, QuerySet):
            return list(obj)
        json.JSONEncoder.default(self, obj)