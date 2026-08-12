# Changelog

## v0.3.0 - Salas, Cocinas y Agenda con calendario real
- Nuevas entidades **Salas** (aula donde se dicta la parte teórica) y **Cocinas** (donde se hace la práctica) — son catálogos distintos, ambos se asignan a una Clase.
- **Clase** cambia de "día de semana recurrente" a **fecha real** (calendario). Cada Clase ahora tiene: Curso, Turno, Fecha, Docente, Sala y Cocina.
- Nueva vista **Agenda**: calendario semanal navegable (← Semana anterior / Hoy / Semana siguiente →) armado solo con las Clases ya cargadas — no hay que ubicar nada a mano. Columnas: día (con fecha) × Cocina. Filas: Turno. Cada celda muestra Sala, Curso, Docente, nombre de la clase y cantidad de alumnos inscriptos (calculada automáticamente, no se carga a mano). Colores por Carrera.
- **Planificación semanal** se simplifica: ya no hay que elegir semana aparte, se deriva sola de la fecha de la Clase elegida (`planificaciones/{claseId}` en vez de `planificaciones/{claseId}_{semanaId}`).
- **Asistencia**: el id del registro pasa a ser `{claseId}_{alumnoId}` (antes incluía la fecha aparte, ahora la fecha ya vive en la Clase).
- `firestore.rules`: agregadas colecciones `salas` y `cocinas` (mismo patrón catálogo que `turnos`).

### Migración de datos ya cargados (importante)
Este cambio no es retrocompatible con los datos de prueba que ya hayas cargado:
1. Las **Clases** viejas no tienen `fecha`, `salaId` ni `cocinaId` — no van a aparecer en la Agenda hasta que las edites y completes esos campos (cargá primero Salas y Cocinas).
2. Las **Planificaciones** guardadas con el id viejo (`claseId_semanaId`) quedan huérfanas — hay que volver a cargarlas para esas clases (ahora con un solo clic, sin elegir semana).
3. Los registros de **Asistencia** viejos (`claseId_fecha_alumnoId`) conviven sin problema con los nuevos, no se pisan ni se pierden, pero un mismo alumno/clase de antes y de ahora podría aparecer duplicado si se vuelve a tomar asistencia — no es grave, es solo por el cambio de formato de id.

## v0.2.1 - Buscador de alumnos + campo Documento
- El campo "DNI" de Alumnos pasó a llamarse **Documento**.
- Nuevo componente `AutocompleteSelect`: campo de texto que filtra a medida que se escribe, en vez de un `<select>` tradicional. Se usa para elegir Alumno en **Inscripciones** y en **Usuarios** (al vincular una ficha de alumno a un login).

## v0.2.0 - Cursos + Logo/Branding + Impresión
- Nueva entidad **Cursos**: cada Carrera tiene uno o más Cursos (ej: "Pastelería 1er Curso"). Las Inscripciones son Alumno + Curso + Turno (antes era directo sobre Carrera).
- Nuevo módulo **Configuración** (solo Admin): subir el logo del instituto (base64 en Firestore, sin Storage). Se usa en login, sidebar y lista de compras.
- Botón **Imprimir** en Lista de Compras con vista `@media print`.
- `firestore.rules`: agregadas colecciones `cursos` y `config`.
- `index.html`: Babel Standalone fijado en `7.24.7` (antes "latest").

## v0.1.0 - Primer scaffold funcional
- Login con Firebase Authentication + roles (Administrativo, Docente, Alumno, Compras).
- CRUD de catálogos: Carreras, Turnos, Docentes, Alumnos, Ingredientes, Clases.
- Recetas con ingredientes embebidos.
- Planificación semanal (grupos + receta) y generación automática de Lista de Compras.
- Asistencia y Notas por clase.
- Alta de usuarios desde la app sin cerrar la sesión del Admin.
