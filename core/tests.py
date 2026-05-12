from django.contrib.auth.models import User
from django.urls.request import RequestFactory
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Facultad, Materia

class UserIsolationTest(APITestCase):
    def setUp(self):
        self.facultad = Facultad.objects.create(nombre="Facultad de Ingeniería", sede="Sede Central")
        self.user1 = User.objects.create_user(username='user1', password='password123', facultad=self.facultad)
        self.user2 = User.objects.create_user(username='user2', password='password123', facultad=self.facultad)
        
        self.materia1 = Materia.objects.create(
            usuario=self.user1, nombre="Materia 1", año_dictado=1, creditos_totales=10
        )
        self.materia2 = Materia.objects.create(
            usuario=self.user2, nombre="Materia 2", año_dictado=1, creditos_totales=10
        )

    def test_user_cannot_see_others_materias(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.get('/api/materias/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['nombre'], "Materia 1")

    def test_user_cannot_access_others_materia_detail(self):
        self.client.force_authenticate(user=self.user1)
        # Try to access user2's materia (assuming ID is 2)
        response = self.client.get(f'/api/materias/{self.materia2.id}/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
