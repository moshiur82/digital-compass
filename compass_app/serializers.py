# compass_app/serializers.py
from rest_framework import serializers
from .models import CompassReading

class CompassReadingSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompassReading
        fields = '__all__'