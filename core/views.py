from rest_framework import viewsets, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from drf_spectacular.utils import extend_schema, OpenApiTypes
from users.models import User
from users.permissions import IsAdminOrDocente, IsAdminOnly, IsOwnerOrReadOnly
from .models import Facultad, Materia, Examen
from .serializers import FacultadSerializer, MateriaSerializer, ExamenSerializer

@extend_schema(
    summary="Health Check del servicio",
    description="Endpoint de monitoreo y health check para servicios en la nube (TP10).",
    responses={200: OpenApiTypes.OBJECT}
)
@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def health_check(request):
    """
    Endpoint de monitoreo y health check para servicios en la nube (TP10).
    Devuelve status 200 OK con el estado del servicio API.
    """
    return Response({
        "status": "ok",
        "service": "api"
    })

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

def sincronizar_estado_aprobacion_materia(materia):
    """
    Garantiza la consistencia bidireccional del estado de la materia (Single Source of Truth):
    - Si cuenta con al menos una mesa de examen (FIN o PRO) con nota >= 6, asegura estado 'APR'.
    - Si estaba en 'APR' pero ya no cuenta con ninguna mesa aprobada (se eliminó o se editó la nota),
      restituye el estado a 'REG' (regular) para evitar estados aprobados huérfanos.
    """
    if not materia:
        return
    tiene_aprobado = materia.examenes.filter(
        tipo__in=['FIN', 'PRO'],
        nota__isnull=False,
        nota__gte=6
    ).exists()

    if tiene_aprobado and materia.estado != 'APR':
        materia.estado = 'APR'
        materia.save(update_fields=['estado'])
    elif not tiene_aprobado and materia.estado == 'APR':
        materia.estado = 'REG'
        materia.save(update_fields=['estado'])

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
        sincronizar_estado_aprobacion_materia(materia)

    def perform_update(self, serializer):
        user = self.request.user
        is_admin = getattr(user, 'role', None) == User.Role.ADMIN or user.is_superuser
        materia_anterior = serializer.instance.materia
        materia_nueva = serializer.validated_data.get('materia', materia_anterior)
        if materia_nueva.usuario != user and not is_admin:
            raise PermissionDenied("No puedes asociar este examen a una materia que no te pertenece.")
        examen = serializer.save()
        sincronizar_estado_aprobacion_materia(examen.materia)
        if materia_anterior.id != examen.materia.id:
            sincronizar_estado_aprobacion_materia(materia_anterior)

    def perform_destroy(self, instance):
        materia = instance.materia
        instance.delete()
        sincronizar_estado_aprobacion_materia(materia)

