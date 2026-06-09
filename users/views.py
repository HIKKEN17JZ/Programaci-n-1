from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from users.serializers import RegisterSerializer, UserSerializer
from users.models import User

# El logout en JWT se gestiona invalidando el token mediante la lista negra (blacklist) configurada en settings.py

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

class UserProfileView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user
