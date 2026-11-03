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
    CRUD de Materias (Gestor Personal y Curricular).
    - Lectura: cada usuario autenticado ve exclusivamente sus materias; ADMIN ve todas.
    - Escritura: usuarios autenticados gestionan su plan de estudio; la autoría se asigna al creador.
    """
    serializer_class = MateriaSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

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
    - Lectura: usuarios acceden a exámenes de materias propias; ADMIN accede a todos.
    - Creación: usuarios pueden registrar y calificar exámenes de sus materias propias; ADMIN sobre cualquier materia.
    """
    serializer_class = ExamenSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

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
        examen = serializer.save()
        # Auto-aprobar materia únicamente si la nota es >= 6 y es examen de mesa (Final o Promoción)
        if examen.tipo in ['FIN', 'PRO'] and examen.nota is not None and float(examen.nota) >= 6:
            if materia.estado != 'APR':
                materia.estado = 'APR'
                materia.save(update_fields=['estado'])

    def perform_update(self, serializer):
        user = self.request.user
        is_admin = getattr(user, 'role', None) == User.Role.ADMIN or user.is_superuser
        materia_nueva = serializer.validated_data.get('materia', serializer.instance.materia)
        if materia_nueva.usuario != user and not is_admin:
            raise PermissionDenied("No puedes asociar este examen a una materia que no te pertenece.")
        examen = serializer.save()
        # Auto-aprobar materia únicamente si la nota es >= 6 y es examen de mesa (Final o Promoción)
        if examen.tipo in ['FIN', 'PRO'] and examen.nota is not None and float(examen.nota) >= 6:
            materia = examen.materia
            if materia.estado != 'APR':
                materia.estado = 'APR'
                materia.save(update_fields=['estado'])

