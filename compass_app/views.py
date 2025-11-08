# compass_app/views.py
from rest_framework import viewsets
from .models import CompassReading
from .serializers import CompassReadingSerializer

class CompassReadingViewSet(viewsets.ModelViewSet):
    queryset = CompassReading.objects.all().order_by('-timestamp')
    serializer_class = CompassReadingSerializer