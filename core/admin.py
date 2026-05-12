
from django.contrib import admin
from .models import Facultad, User, Materia, Examen

@admin.register(Facultad)
class FacultadAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'sede')
    search_fields = ('nombre',)

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'facultad', 'plan_estudio_nombre')
    list_filter = ('facultad',)
    search_fields = ('username', 'email')

@admin.register(Materia)
class MateriaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'usuario', 'estado', 'año_dictado')
    list_filter = ('estado', 'año_dictado')
    search_fields = ('nombre', 'usuario__username')

@admin.register(Examen)
class ExamenAdmin(admin.ModelAdmin):
    list_display = ('materia', 'fecha', 'nota', 'tipo')
    list_filter = ('tipo', 'fecha')
    search_fields = ('materia__nombre',)