from rest_framework import serializers
from .models import Facultad, Materia, Examen
from users.models import User

class FacultadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Facultad
        fields = '__all__'

class MateriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Materia
        fields = '__all__'

class ExamenSerializer(serializers.ModelSerializer):
    class Meta:
        model = Examen
        fields = '__all__'

    def validate_nota(self, value):
        if value is not None and (value < 0 or value > 20):
            raise serializers.ValidationError("La nota debe estar entre 0 y 20.")
        return value