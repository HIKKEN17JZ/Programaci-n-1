from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from users.models import User
from core.models import Facultad

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    default_error_messages = {
        'no_active_account': 'Usuario o contraseña incorrectos. Por favor, verificá tus datos e intentalo nuevamente.'
    }

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'facultad', 'plan_estudio_nombre']
        read_only_fields = ['id', 'role', 'username', 'email']

class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)
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

    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError("El correo electrónico es obligatorio.")
        if User.objects.filter(email__iexact=value.strip()).exists():
            raise serializers.ValidationError("Este correo electrónico ya está registrado.")
        return value.strip().lower()

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            facultad=validated_data.get('facultad'),
            role=User.Role.ESTUDIANTE
        )
        return user
