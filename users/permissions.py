from rest_framework import permissions
from users.models import User

class IsAdminOrDocente(permissions.BasePermission):
    """
    Permite las acciones de escritura (POST, PUT, PATCH, DELETE) solo si el usuario
    tiene el rol ADMIN o DOCENTE.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        user = request.user
        if not user or not user.is_authenticated:
            return False
        return getattr(user, 'role', None) in [User.Role.ADMIN, User.Role.DOCENTE]


class IsAdminOnly(permissions.BasePermission):
    """
    Permite lectura a cualquier usuario (SAFE_METHODS), pero restringe modificaciones
    exclusivamente a usuarios con rol ADMIN.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        user = request.user
        if not user or not user.is_authenticated:
            return False
        return getattr(user, 'role', None) == User.Role.ADMIN or user.is_staff or user.is_superuser


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Permite la lectura a cualquier usuario, pero solo permite modificación
    (PUT, PATCH, DELETE) si el objeto pertenece al usuario solicitante.
    El rol ADMIN tiene acceso total (bypass de ownership).
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        user = request.user
        if not user or not user.is_authenticated:
            return False

        # Bypass para administradores
        if getattr(user, 'role', None) == User.Role.ADMIN or user.is_superuser:
            return True

        # Determinar el propietario del recurso (directo en usuario o anidado en materia)
        owner = getattr(obj, 'usuario', None)
        if owner is None and hasattr(obj, 'materia'):
            owner = obj.materia.usuario

        return owner is not None and owner == user

