from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FacultadViewSet, MateriaViewSet, ExamenViewSet
from users.views import RegisterView

router = DefaultRouter()
router.register(r'facultades', FacultadViewSet)
router.register(r'materias', MateriaViewSet, basename='materia')
router.register(r'examenes', ExamenViewSet, basename='examen')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegisterView.as_view(), name='register'),
    path('users/', include('users.urls')),
]
