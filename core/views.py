from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied
from users.models import User
from users.permissions import IsAdminOrDocente, IsAdminOnly, IsOwnerOrReadOnly
from .models import Facultad, Materia, Examen
from .serializers import FacultadSerializer, MateriaSerializer, ExamenSerializer

class FacultadViewSet(viewsets.ModelViewSet):
    """
    CRUD de Facultades.
    Lectura pública; creación, actualización y eliminación exclusivas para ADMIN.
    """
    queryset = Facultad.objects.all()
    serializer_class = FacultadSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsAdminOnly]

class MateriaViewSet(viewsets.ModelViewSet):
    """
    CRUD de Materias.
    - Lectura: cada usuario autenticado ve exclusivamente sus materias; ADMIN ve todas.
    - Escritura: reservada a ADMIN y DOCENTE. La autoría se asigna automáticamente al creador.
    """
    serializer_class = MateriaSerializer
    permission_classes = [IsAdminOrDocente, IsOwnerOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Materia.objects.none()
        if getattr(user, 'role', None) == User.Role.ADMIN or user.is_superuser:
            return Materia.objects.all()
        return Materia.objects.filter(usuario=user)

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

class ExamenViewSet(viewsets.ModelViewSet):
    """
    CRUD de Exámenes.
    - Lectura: usuarios acceden solo a exámenes de materias propias; ADMIN accede a todos.
    - Creación: DOCENTE solo puede asociar exámenes a materias propias; ADMIN puede asociar a cualquier materia.
    """
    serializer_class = ExamenSerializer
    permission_classes = [IsAdminOrDocente, IsOwnerOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Examen.objects.none()
        if getattr(user, 'role', None) == User.Role.ADMIN or user.is_superuser:
            return Examen.objects.all()
        return Examen.objects.filter(materia__usuario=user)

    def perform_create(self, serializer):
        user = self.request.user
        materia = serializer.validated_data['materia']
        is_admin = getattr(user, 'role', None) == User.Role.ADMIN or user.is_superuser
        if materia.usuario != user and not is_admin:
            raise PermissionDenied("No puedes crear un examen para una materia que no te pertenece.")
        serializer.save()

