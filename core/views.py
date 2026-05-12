from rest_framework import viewsets, permissions
from .models import Facultad, Materia, Examen
from .serializers import FacultadSerializer, MateriaSerializer, ExamenSerializer

class FacultadViewSet(viewsets.ModelViewSet):
    queryset = Facultad.objects.all()
    serializer_class = FacultadSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class MateriaViewSet(viewsets.ModelViewSet):
    serializer_class = MateriaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Materia.objects.filter(usuario=self.request.user)

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

class ExamenViewSet(viewsets.ModelViewSet):
    serializer_class = ExamenSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Examen.objects.filter(materia__usuario=self.request.user)

    def perform_create(self, serializer):
        # Note: the user is implicit via the Materia relationship
        serializer.save()
