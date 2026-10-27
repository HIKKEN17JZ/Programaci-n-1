from rest_framework import serializers
from .models import Facultad, Materia, Examen

class FacultadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Facultad
        fields = '__all__'

class MateriaSerializer(serializers.ModelSerializer):
    creditos_totales = serializers.IntegerField(min_value=0)

    class Meta:
        model = Materia
        fields = '__all__'
        read_only_fields = ['usuario']

    def validate_año_dictado(self, value):
        if value is None or not ((1 <= value <= 10) or (1900 <= value <= 2100)):
            raise serializers.ValidationError(
                "El año debe ser el nivel de la carrera (1 a 10) o un año calendario entre 1900 y 2100."
            )
        return value

class ExamenSerializer(serializers.ModelSerializer):
    class Meta:
        model = Examen
        fields = '__all__'

    def validate_nota(self, value):
        if value is not None and (value < 0 or value > 20):
            raise serializers.ValidationError("La nota debe estar entre 0 y 20.")
        return value