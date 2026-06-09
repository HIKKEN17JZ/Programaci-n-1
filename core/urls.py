from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FacultadViewSet, MateriaViewSet, ExamenViewSet

router = DefaultRouter()
router.register(r'facultades', FacultadViewSet)
router.register(r'materias', MateriaViewSet, basename='materia')
router.register(r'examenes', ExamenViewSet, basename='examen')

urlpatterns = [
    path('', include(router.urls)),
]