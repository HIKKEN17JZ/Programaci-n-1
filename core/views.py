from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets
from .models import Facultad, Materia, Examen
from .serializers import FacultadSerializer, MateriaSerializer, ExamenSerializer

class FacultadViewSet(viewsets.ModelViewSet):
    queryset = Facultad.objects.all()
    serializer_class = FacultadSerializer

class MateriaViewSet(viewsets.ModelViewSet):
    queryset = Materia.objects.all()
    serializer_class = MateriaSerializer

class ExamenViewSet(viewsets.ModelViewSet):
    queryset = Examen.objects.all()
    serializer_class = ExamenSerializer