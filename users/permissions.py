from rest_framework import permissions

class IsAdminOrDocente(permissions.BasePermission):
    """
    Permite las acciones de escritura (POST, PUT, PATCH, DELETE) solo si el usuario tiene el rol ADMIN o DOCENTE.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated and request.user.role in ['ADMIN', 'DOCENTE']

class IsAdminOnly(permissions.BasePermission):
    """
    Permite lectura a cualquier usuario, pero solo permite escritura a ADMIN.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated and request.user.role == 'ADMIN'

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Permite la lectura (GET, HEAD, OPTIONS) a cualquier usuario autenticado, 
    pero solo permite la modificación (PUT, PATCH, DELETE) si el objeto pertenece al usuario.
    El rol ADMIN puede modificar cualquier objeto.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # ADMIN bypass
        if request.user.role == 'ADMIN':
            return True
        
        # Check for usuario field directly or via materia
        user = getattr(obj, 'usuario', None)
        if user is None and hasattr(obj, 'materia'):
            user = obj.materia.usuario
            
        return user is not None and user == request.user
