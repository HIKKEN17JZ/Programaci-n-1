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
        materia = serializer.validated_data['materia']
        if materia.usuario != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("No puedes crear un examen para una materia que no te pertenece.")
        serializer.save()
