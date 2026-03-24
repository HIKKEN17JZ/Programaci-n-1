# Proyecto: Plataforma de Gestion de carrera e Historial academico
## Descripcion
Diseñada para que estudiantes universitarios puedan centralizar la gestión de su trayectoria académica de manera informalmente dinamica y divertida. Permite cargar el plan de estudio completo, realizar el seguimiento de las cursadas (promociones, regularidades) y administrar las mesas de examen final, incluyendo el registro histórico de intentos y calificaciones.

La idea principal es que el sistema no sea solo una lista de materias, sino un monitor de progreso que permita:
* Visualizar qué materias faltan para el título.
* Diferenciar entre cursada aprobada y examen final pendiente.
* Gestionar las fechas de mesas de examen y la cantidad de intentos por materia.
* Centralizar la información según la facultad del estudiante.
# Objetivos del Proyecto
Objetivo General
Desarrollar una plataforma web para la administración integral del progreso académico y la planificación de exámenes.

## Objetivos Específicos
* Implementar registro e inicio de sesión de estudiantes.
* Permitir la carga y edición del plan de estudio personal.
* Gestionar el estado de cada materia (Cursando, Regular, Aprobada, Libre).
* Registrar fechas de exámenes finales y sus resultados (notas, condición).
* Integrar una entidad institucional (Facultad) para la validez de los datos.

# Alcance del Sistema
## Gestión de Usuarios e Institución
* Autenticación: Registro, inicio y cierre de sesión seguro.
* Vinculación Institucional: Posibilidad de asociar el perfil a una Facultad específica o mantenerlo como Personal (configuración básica para mayor flexibilidad).
## Administración del Plan de Estudio
* Carga de Materias: Registro de asignaturas incluyendo nombre y carga de créditos/horas.
* Control de Créditos: * Sumatoria automática de créditos obtenidos por materia aprobada.
* Contador de créditos necesarios para completar cada año académico.
* Seguimiento de Estados:
* Visualización del estado individual (Pendiente, Cursando, Regular, Aprobada).
* Estado general del año lectivo basado en el promedio de sus materias.
## Gestión de Exámenes y Calificaciones
* Historial de Notas: Registro de calificaciones de cursada y promociones.
* Módulo de Finales: * Gestión de mesas de examen y fechas de llamado.
* Contador de intentos fallidos y aprobados.
## Visualización de Progreso (Dashboard)
* Monitor de Carrera: Visualización del año actual con una barra de progreso dinámica.
* Lógica de Semáforo: La barra cambiará de color según el porcentaje de avance del año o carrera:
* 🔴 Crítico/Inicio: (0% - 39%)
* 🟡 En Proceso: (40% - 74%)
* 🟢 Avanzado/Completado: (75% - 100%)
# Modelo de Datos
## 1. Entidades Principales
### A. Facultad (facultades)
* id (PK)
* nombre (ej: "Facultad de Ingeniería")
* sede
---
### B. Usuario (usuarios)
* id (PK)
* facultad_id (FK -> facultades.id)
* username / email
* password_hash
* plan_estudio_nombre (ej: "Ingeniería en Computación 2020")
---
### C. Materia (materias)
Aquí es donde vive la lógica de los créditos.
* id (PK)
* usuario_id (FK -> usuarios.id)
* nombre (ej: "Física I")
* año_dictado (1, 2, 3...)
* creditos_totales (Cuántos puntos suma al aprobarla)
* estado (ENUM: 'Pendiente', 'Cursando', 'Regular', 'Aprobada', 'Recursando')
* es_promocionable (Booleano)
---
### D. Examen / Mesa (examenes)
Para trackear cada intento.
* id (PK)
* materia_id (FK -> materias.id)
* fecha
* nota
tipo (ENUM: 'Parcial', 'Final', 'Promoción')
---
# Relaciones conceptuales
* User ↔ Facultad (N:1): Muchos usuarios pueden pertenecer a una misma Facultad (entidad institucional), pero un usuario solo se registra en una sede/institución a la vez para este plan de estudio.
* User ↔ Materia (1:N): Un Usuario es dueño de su propio plan de estudio. Puede cargar múltiples Materias, y cada materia está vinculada de forma única a su creador para evitar cruce de datos entre estudiantes.
* Materia ↔ Examen (1:N): Una Materia puede tener un historial de múltiples Exámenes (instancias de evaluación). Esto permite registrar tanto los parciales como los distintos intentos en mesas de examen final (fechas de llamado).
## Reglas de Integridad (Constraints)
* ON DELETE CASCADE: Si un usuario elimina su cuenta, se eliminan automáticamente todas sus materias y exámenes asociados para evitar datos huérfanos en MySQL.
* Relación Circular: No existen relaciones circulares; el flujo de datos es siempre descendente desde la Institución hasta el detalle del Examen.
# Diagrama de relaciones
```mermaid
graph TD
    F[Facultad] -- 1:N --> U[User]
    U -- 1:N --> M[Materia]
    M -- 1:N --> E[Examen]             
