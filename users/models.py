from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Admin'
        DOCENTE = 'DOCENTE', 'Docente'
        ESTUDIANTE = 'ESTUDIANTE', 'Estudiante'

    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.ESTUDIANTE,
    )
    facultad = models.ForeignKey('core.Facultad', on_delete=models.SET_NULL, null=True, blank=True)
    plan_estudio_nombre = models.CharField(max_length=150, blank=True)
