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

    def validate(self, attrs):
        tipo = attrs.get('tipo', getattr(self.instance, 'tipo', None))
        nota = attrs.get('nota', getattr(self.instance, 'nota', None))

        # Al registrar un examen nuevo, la materia no debe estar aprobada previamente
        if not self.instance:
            materia = attrs.get('materia')
            if materia and materia.estado == 'APR':
                raise serializers.ValidationError({
                    'materia': "Esta asignatura ya se encuentra aprobada. No es posible registrar nuevos exámenes para una materia aprobada."
                })

        if tipo == 'PRO':
            if nota is None:
                raise serializers.ValidationError({
                    'nota': "Una promoción debe contar con calificación aprobatoria (mínimo 6)."
                })
            if nota < 6:
                raise serializers.ValidationError({
                    'nota': "La nota de una promoción debe ser igual o mayor a 6. Si no alcanzaste la promoción, regístralo como Examen Final."
                })
        return attrs
