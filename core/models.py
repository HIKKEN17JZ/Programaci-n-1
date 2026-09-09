from django.db import models

class Facultad(models.Model):
    nombre = models.CharField(max_length=150)
    sede = models.CharField(max_length=100)

    class Meta:
        verbose_name = 'Facultad'
        verbose_name_plural = 'Facultades'
        ordering = ['nombre']

    def __str__(self):
        return self.nombre

class Materia(models.Model):
    ESTADOS_MATERIA = [
        ('PEN', 'Pendiente'),
        ('CUR', 'Cursando'),
        ('REG', 'Regular'),
        ('APR', 'Aprobada'),
        ('REC', 'Recursando'),
    ]

    usuario = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='materias')
    nombre = models.CharField(max_length=150)
    año_dictado = models.IntegerField()
    creditos_totales = models.IntegerField(default=0)
    estado = models.CharField(max_length=3, choices=ESTADOS_MATERIA, default='PEN')
    es_promocionable = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Materia'
        verbose_name_plural = 'Materias'
        ordering = ['año_dictado', 'nombre']

    def __str__(self):
        return f"{self.nombre} ({self.usuario.username})"

class Examen(models.Model):
    TIPOS_EXAMEN = [
        ('PAR', 'Parcial'),
        ('FIN', 'Final'),
        ('PRO', 'Promoción'),
    ]

    materia = models.ForeignKey(Materia, on_delete=models.CASCADE, related_name='examenes')
    fecha = models.DateField()
    nota = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    tipo = models.CharField(max_length=3, choices=TIPOS_EXAMEN)

    class Meta:
        verbose_name = 'Examen'
        verbose_name_plural = 'Exámenes'
        ordering = ['-fecha']

    def __str__(self):
        return f"{self.tipo} - {self.materia.nombre} - Nota: {self.nota}"