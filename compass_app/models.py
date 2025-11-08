# compass_app/models.py
from django.db import models
from django.contrib.auth.models import User

class CompassReading(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    latitude = models.FloatField()
    longitude = models.FloatField()
    heading = models.FloatField()  # 0-360 degrees
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.heading}° at {self.timestamp}"