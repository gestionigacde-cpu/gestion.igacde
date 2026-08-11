# Changelog

## v0.1.0 - Primer scaffold funcional
- Login con Firebase Authentication (email/contraseña) + recuperación de contraseña.
- Roles: Administrativo, Docente, Alumno, Compras (usuarios/{uid}.rol).
- CRUD de catálogos: Carreras, Turnos, Docentes, Alumnos, Ingredientes, Clases.
- Inscripciones (Alumno + Carrera + Turno, múltiples por alumno).
- Recetas con ingredientes embebidos (cantidad por ejecución de la receta).
- Planificación semanal por Clase: grupos y receta asignada a cada uno.
- Generación automática de Lista de Compras semanal (agrega ingredientes de
  todas las clases planificadas esa semana) + exportación a Excel.
- Asistencia por clase/fecha (registro por alumno, corrección con nuevo registro).
- Notas/evaluaciones por clase (historial acumulado, no se sobrescribe).
- Alta de usuarios desde la app (Admin) sin cerrar su propia sesión, vía
  instancia secundaria de Firebase.
- firestore.rules reflejando la matriz de roles.
