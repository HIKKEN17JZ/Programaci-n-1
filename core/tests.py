from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Facultad, Materia, Examen

User = get_user_model()

class BaseAPITestCase(APITestCase):
    """Clase base para configuración de fixtures de prueba."""

    def setUp(self):
        self.facultad = Facultad.objects.create(
            nombre="Facultad de Ingeniería",
            sede="Sede Central"
        )
        self.admin_user = User.objects.create_user(
            username='admin_user',
            email='admin@test.edu.ar',
            password='Password123!',
            role=User.Role.ADMIN,
            facultad=self.facultad
        )
        self.docente1 = User.objects.create_user(
            username='docente1',
            email='docente1@test.edu.ar',
            password='Password123!',
            role=User.Role.DOCENTE,
            facultad=self.facultad
        )
        self.docente2 = User.objects.create_user(
            username='docente2',
            email='docente2@test.edu.ar',
            password='Password123!',
            role=User.Role.DOCENTE,
            facultad=self.facultad
        )
        self.estudiante = User.objects.create_user(
            username='estudiante1',
            email='estudiante1@test.edu.ar',
            password='Password123!',
            role=User.Role.ESTUDIANTE,
            facultad=self.facultad
        )

        self.materia_docente1 = Materia.objects.create(
            usuario=self.docente1,
            nombre="Programación I",
            año_dictado=2024,
            creditos_totales=8,
            estado='CUR'
        )
        self.materia_docente2 = Materia.objects.create(
            usuario=self.docente2,
            nombre="Bases de Datos",
            año_dictado=2024,
            creditos_totales=6,
            estado='CUR'
        )

        self.examen_docente1 = Examen.objects.create(
            materia=self.materia_docente1,
            fecha='2026-06-15',
            nota=8.5,
            tipo='PAR'
        )


class FacultadTests(BaseAPITestCase):
    """Pruebas para el CRUD de Facultad y permisos por rol."""

    def test_list_facultades_anonymous_allowed(self):
        """Lectura pública de facultades sin autenticación."""
        response = self.client.get('/api/facultades/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_get_facultad_detail_anonymous_allowed(self):
        """Detalle de facultad accesible sin autenticación."""
        response = self.client.get(f'/api/facultades/{self.facultad.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['nombre'], self.facultad.nombre)

    def test_create_facultad_as_admin_success(self):
        """ADMIN puede crear facultades."""
        self.client.force_authenticate(user=self.admin_user)
        payload = {'nombre': 'Facultad de Ciencias Económicas', 'sede': 'Sede Este'}
        response = self.client.post('/api/facultades/', payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['nombre'], payload['nombre'])

    def test_create_facultad_as_docente_forbidden(self):
        """DOCENTE no tiene permiso para crear facultades."""
        self.client.force_authenticate(user=self.docente1)
        payload = {'nombre': 'Facultad No Permitida', 'sede': 'Norte'}
        response = self.client.post('/api/facultades/', payload)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_facultad_as_estudiante_forbidden(self):
        """ESTUDIANTE no tiene permiso para crear facultades."""
        self.client.force_authenticate(user=self.estudiante)
        payload = {'nombre': 'Facultad No Permitida', 'sede': 'Sur'}
        response = self.client.post('/api/facultades/', payload)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_update_facultad_as_admin_success(self):
        """ADMIN puede actualizar facultades."""
        self.client.force_authenticate(user=self.admin_user)
        payload = {'nombre': 'Facultad de Ingeniería Modificada', 'sede': 'Sede Central'}
        response = self.client.put(f'/api/facultades/{self.facultad.id}/', payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['nombre'], payload['nombre'])

    def test_delete_facultad_as_docente_forbidden(self):
        """DOCENTE no puede eliminar facultades."""
        self.client.force_authenticate(user=self.docente1)
        response = self.client.delete(f'/api/facultades/{self.facultad.id}/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_facultad_as_admin_success(self):
        """ADMIN puede eliminar facultades."""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.delete(f'/api/facultades/{self.facultad.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)


class MateriaTests(BaseAPITestCase):
    """Pruebas para CRUD de Materias, aislamiento por usuario y validaciones."""

    def test_list_materias_shows_only_own(self):
        """Usuario solo puede ver sus propias materias."""
        self.client.force_authenticate(user=self.docente1)
        response = self.client.get('/api/materias/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], self.materia_docente1.id)

    def test_list_materias_admin_sees_all(self):
        """ADMIN puede ver las materias de todos los usuarios."""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get('/api/materias/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 2)

    def test_list_materias_anonymous_empty(self):
        """Usuario anónimo recibe lista vacía de materias."""
        response = self.client.get('/api/materias/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_create_materia_as_docente_success(self):
        """DOCENTE puede crear materia y se le asigna automáticamente la autoría."""
        self.client.force_authenticate(user=self.docente1)
        payload = {
            'nombre': 'Álgebra Lineal',
            'año_dictado': 2024,
            'creditos_totales': 6,
            'estado': 'CUR',
            'es_promocionable': True
        }
        response = self.client.post('/api/materias/', payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['nombre'], 'Álgebra Lineal')
        materia_creada = Materia.objects.get(id=response.data['id'])
        self.assertEqual(materia_creada.usuario, self.docente1)

    def test_create_materia_as_estudiante_forbidden(self):
        """ESTUDIANTE no puede crear materias (restringido a ADMIN o DOCENTE)."""
        self.client.force_authenticate(user=self.estudiante)
        payload = {
            'nombre': 'Física I',
            'año_dictado': 2024,
            'creditos_totales': 6,
            'estado': 'CUR'
        }
        response = self.client.post('/api/materias/', payload)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_update_own_materia_by_docente_success(self):
        """DOCENTE puede actualizar su propia materia."""
        self.client.force_authenticate(user=self.docente1)
        payload = {
            'nombre': 'Programación I - Avanzada',
            'año_dictado': 2024,
            'creditos_totales': 8,
            'estado': 'REG',
            'es_promocionable': True
        }
        response = self.client.put(f'/api/materias/{self.materia_docente1.id}/', payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['nombre'], 'Programación I - Avanzada')

    def test_update_other_user_materia_by_docente_forbidden(self):
        """DOCENTE no puede actualizar materia de otro docente."""
        self.client.force_authenticate(user=self.docente1)
        payload = {
            'nombre': 'Hack Materia Ajena',
            'año_dictado': 2024,
            'creditos_totales': 6,
            'estado': 'REG'
        }
        # Intenta editar materia del docente 2
        response = self.client.put(f'/api/materias/{self.materia_docente2.id}/', payload)
        self.assertIn(response.status_code, [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND])

    def test_update_other_user_materia_by_admin_success(self):
        """ADMIN puede actualizar materias de cualquier usuario (bypass)."""
        self.client.force_authenticate(user=self.admin_user)
        payload = {
            'nombre': 'Bases de Datos Actualizada por Admin',
            'año_dictado': 2024,
            'creditos_totales': 6,
            'estado': 'APR',
            'es_promocionable': True
        }
        response = self.client.put(f'/api/materias/{self.materia_docente2.id}/', payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_delete_own_materia_by_docente_success(self):
        """DOCENTE puede borrar su propia materia."""
        self.client.force_authenticate(user=self.docente1)
        response = self.client.delete(f'/api/materias/{self.materia_docente1.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_validation_ano_dictado_invalid(self):
        """Año de dictado fuera de rango 1900-2100 es rechazado con 400."""
        self.client.force_authenticate(user=self.docente1)
        payload = {
            'nombre': 'Química',
            'año_dictado': 1800,
            'creditos_totales': 4,
            'estado': 'CUR'
        }
        response = self.client.post('/api/materias/', payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('año_dictado', response.data)

    def test_validation_creditos_negativos(self):
        """Créditos totales negativos son rechazados con 400."""
        self.client.force_authenticate(user=self.docente1)
        payload = {
            'nombre': 'Química',
            'año_dictado': 2024,
            'creditos_totales': -5,
            'estado': 'CUR'
        }
        response = self.client.post('/api/materias/', payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('creditos_totales', response.data)


class ExamenTests(BaseAPITestCase):
    """Pruebas para CRUD de Exámenes, validación de notas y aislamiento via materia."""

    def test_list_examenes_only_own_materia(self):
        """DOCENTE solo ve exámenes asociados a sus materias."""
        self.client.force_authenticate(user=self.docente1)
        response = self.client.get('/api/examenes/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], self.examen_docente1.id)

    def test_list_examenes_admin_sees_all(self):
        """ADMIN ve los exámenes de todas las materias."""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get('/api/examenes/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_create_examen_for_own_materia_success(self):
        """DOCENTE puede crear un examen para una materia propia."""
        self.client.force_authenticate(user=self.docente1)
        payload = {
            'materia': self.materia_docente1.id,
            'fecha': '2026-07-20',
            'nota': 9.0,
            'tipo': 'FIN'
        }
        response = self.client.post('/api/examenes/', payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(float(response.data['nota']), 9.0)

    def test_create_examen_for_other_user_materia_forbidden(self):
        """DOCENTE no puede crear un examen para una materia ajena."""
        self.client.force_authenticate(user=self.docente1)
        payload = {
            'materia': self.materia_docente2.id,
            'fecha': '2026-07-20',
            'nota': 7.0,
            'tipo': 'FIN'
        }
        response = self.client.post('/api/examenes/', payload)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_examen_for_other_user_materia_by_admin_success(self):
        """ADMIN puede crear exámenes para cualquier materia."""
        self.client.force_authenticate(user=self.admin_user)
        payload = {
            'materia': self.materia_docente2.id,
            'fecha': '2026-07-25',
            'nota': 10.0,
            'tipo': 'PRO'
        }
        response = self.client.post('/api/examenes/', payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_create_examen_as_estudiante_forbidden(self):
        """ESTUDIANTE no puede crear exámenes."""
        self.client.force_authenticate(user=self.estudiante)
        payload = {
            'materia': self.materia_docente1.id,
            'fecha': '2026-07-20',
            'nota': 8.0,
            'tipo': 'FIN'
        }
        response = self.client.post('/api/examenes/', payload)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_validation_nota_negative_rejected(self):
        """Nota negativa (<0) es rechazada con 400 Bad Request."""
        self.client.force_authenticate(user=self.docente1)
        payload = {
            'materia': self.materia_docente1.id,
            'fecha': '2026-07-20',
            'nota': -1.0,
            'tipo': 'PAR'
        }
        response = self.client.post('/api/examenes/', payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('nota', response.data)

    def test_validation_nota_greater_than_20_rejected(self):
        """Nota mayor a 20 es rechazada con 400 Bad Request."""
        self.client.force_authenticate(user=self.docente1)
        payload = {
            'materia': self.materia_docente1.id,
            'fecha': '2026-07-20',
            'nota': 25.0,
            'tipo': 'PAR'
        }
        response = self.client.post('/api/examenes/', payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('nota', response.data)

    def test_validation_nota_null_allowed(self):
        """Examen con nota null (sin calificar aún) es permitido (201 Created)."""
        self.client.force_authenticate(user=self.docente1)
        payload = {
            'materia': self.materia_docente1.id,
            'fecha': '2026-07-20',
            'nota': None,
            'tipo': 'FIN'
        }
        response = self.client.post('/api/examenes/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIsNone(response.data['nota'])

    def test_delete_other_user_examen_by_docente_forbidden(self):
        """DOCENTE no puede eliminar exámenes de materias ajenas."""
        self.client.force_authenticate(user=self.docente2)
        response = self.client.delete(f'/api/examenes/{self.examen_docente1.id}/')
        self.assertIn(response.status_code, [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND])

    def test_delete_other_user_examen_by_admin_success(self):
        """ADMIN puede eliminar examen de cualquier materia."""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.delete(f'/api/examenes/{self.examen_docente1.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

