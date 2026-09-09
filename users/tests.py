from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from core.models import Facultad

User = get_user_model()

class UserAuthenticationTests(APITestCase):
    """
    Tests de integración para el flujo de autenticación, registro y gestión de usuarios.
    """

    def setUp(self):
        self.facultad = Facultad.objects.create(
            nombre="Facultad de Ingeniería",
            sede="Sede Central"
        )
        self.docente = User.objects.create_user(
            username='docente_user',
            email='docente@test.edu.ar',
            password='Password123!',
            role=User.Role.DOCENTE,
            facultad=self.facultad
        )
        self.estudiante = User.objects.create_user(
            username='alumno_user',
            email='alumno@test.edu.ar',
            password='Password123!',
            role=User.Role.ESTUDIANTE,
            facultad=self.facultad
        )

    def test_obtain_jwt_token_pair_success(self):
        """Usuario válido puede obtener par de tokens (access y refresh)."""
        response = self.client.post('/api/token/', {
            'username': 'docente_user',
            'password': 'Password123!'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_obtain_jwt_token_invalid_password(self):
        """Credenciales incorrectas devuelven 401 Unauthorized."""
        response = self.client.post('/api/token/', {
            'username': 'docente_user',
            'password': 'WrongPassword'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_obtain_jwt_token_nonexistent_user(self):
        """Usuario inexistente devuelve 401 Unauthorized."""
        response = self.client.post('/api/token/', {
            'username': 'nadie',
            'password': 'Password123!'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_refresh_jwt_token_success(self):
        """Token refresh válido devuelve nuevo token access."""
        token_resp = self.client.post('/api/token/', {
            'username': 'alumno_user',
            'password': 'Password123!'
        })
        refresh_token = token_resp.data['refresh']

        refresh_resp = self.client.post('/api/token/refresh/', {
            'refresh': refresh_token
        })
        self.assertEqual(refresh_resp.status_code, status.HTTP_200_OK)
        self.assertIn('access', refresh_resp.data)

    def test_refresh_jwt_token_invalid(self):
        """Token refresh inválido devuelve 401 Unauthorized."""
        response = self.client.post('/api/token/refresh/', {
            'refresh': 'token_invalido_12345'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_me_authenticated(self):
        """Usuario autenticado puede consultar su propio perfil."""
        self.client.force_authenticate(user=self.estudiante)
        response = self.client.get('/api/users/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'alumno_user')
        self.assertEqual(response.data['email'], 'alumno@test.edu.ar')
        self.assertEqual(response.data['role'], User.Role.ESTUDIANTE)
        self.assertEqual(response.data['facultad'], self.facultad.id)

    def test_user_me_anonymous_forbidden(self):
        """Petición anónima a /api/users/me/ devuelve 401 Unauthorized."""
        response = self.client.get('/api/users/me/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_register_user_success(self):
        """Registro exitoso crea un nuevo usuario con rol ESTUDIANTE por defecto."""
        payload = {
            'username': 'nuevo_estudiante',
            'email': 'nuevo@test.edu.ar',
            'password': 'Password123!',
            'facultad_id': self.facultad.id
        }
        response = self.client.post('/api/users/register/', payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['username'], 'nuevo_estudiante')
        self.assertNotIn('password', response.data)

        user = User.objects.get(username='nuevo_estudiante')
        self.assertEqual(user.role, User.Role.ESTUDIANTE)
        self.assertEqual(user.facultad, self.facultad)
        self.assertTrue(user.check_password('Password123!'))

    def test_register_user_duplicate_username(self):
        """Intento de registro con username duplicado devuelve 400 Bad Request."""
        payload = {
            'username': 'alumno_user',
            'email': 'otro_email@test.edu.ar',
            'password': 'Password123!'
        }
        response = self.client.post('/api/users/register/', payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('username', response.data)

    def test_register_user_duplicate_email(self):
        """Intento de registro con email duplicado devuelve 400 Bad Request."""
        payload = {
            'username': 'distinto_username',
            'email': 'alumno@test.edu.ar',
            'password': 'Password123!'
        }
        response = self.client.post('/api/users/register/', payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)

