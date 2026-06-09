from rest_framework import serializers
from users.models import User
from core.models import Facultad

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'facultad', 'plan_estudio_nombre']

class RegisterSerializer(serializers.ModelSerializer):
    facultad_id = serializers.PrimaryKeyRelatedField(
        queryset=Facultad.objects.all(),
        source='facultad',
        required=False
    )

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'facultad_id']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            facultad=validated_data['facultad'],
            role=User.Role.ESTUDIANTE
        )
        return user
