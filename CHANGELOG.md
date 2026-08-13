# Changelog

## v0.4.0 - Secciones (subdivisión de Curso)
- Nueva entidad **Secciones**: subdivisión de un Curso cuando hay más de un grupo cursando lo mismo (ej: "1er Curso Sección A", "Sección B"), sin límite de cantidad.
- Independiente del Turno: varias Secciones pueden compartir el mismo horario (mismo Curso+Turno, distinto docente/aula/cocina).
- Es **opcional**: si un Curso no tiene Secciones cargadas, todo sigue funcionando igual que antes con solo Curso+Turno.
- **Clases**: nuevo campo Sección (se filtra solo, según el Curso elegido).
- **Inscripciones**: nuevo campo Sección opcional (aparece solo si el Curso tiene Secciones cargadas).
- **Agenda**: muestra la Sección en cada clase (cuando tiene una asignada) y la cantidad de alumnos ahora se calcula por Curso+Turno+Sección.
- **Asistencia/Notas**: si la Clase tiene Sección asignada, solo aparecen los alumnos inscriptos en esa Sección; si no, se comporta como antes (todos los del Curso+Turno).
- `firestore.rules`: agregada colección `secciones`.

### Migración de datos ya cargados (importante)
1. Las **Clases** e **Inscripciones** viejas no tienen Sección — van a seguir funcionando igual (se tratan como "sin Sección", cuentan todos los alumnos del Curso+Turno).
2. Si en un Curso necesitás separar en grupos, cargá primero las Secciones correspondientes y después editá las Clases/Inscripciones para asignarlas.
3. No requiere republicar `firestore.rules` si no vas a usar Secciones todavía, pero si las usás sí hay que republicar (agregó la colección `secciones`).

## v0.3.2 - Ocultar menú lateral
- Nuevo botón (círculo con `‹` / `›`) para ocultar/mostrar el menú lateral, así vistas anchas como la Agenda pueden usar todo el ancho de la pantalla.
- El botón no aparece al imprimir.
- No requiere cambios en `firestore.rules` ni republicar nada en Firebase Console.

## v0.3.1 - Cantidades con decimales en Recetas
- El campo "Cantidad" de cada ingrediente en una Receta ahora acepta hasta 4 decimales (antes el navegador rechazaba valores como 0.007 porque el paso estaba fijado en 0.01).
- Se agregó "vaina" a la lista de unidades de Ingredientes (para casos como Vainilla), así queda disponible en el desplegable al editar.
- No requiere cambios en `firestore.rules` ni republicar nada en Firebase Console.

## v0.3.0 - Salas, Cocinas y Agenda con calendario real
- Nuevas entidades **Salas** (aula donde se dicta la parte teórica) y **Cocinas** (donde se hace la práctica).
- **Clase** cambia de "día de semana recurrente" a **fecha real** (calendario). Cada Clase ahora tiene: Curso, Turno, Fecha, Docente, Sala y Cocina.
- Nueva vista **Agenda**: calendario semanal navegable armado solo con las Clases ya cargadas. Columnas: día (con fecha) × Cocina. Filas: Turno. Cada celda muestra Sala, Curso, Docente, nombre de la clase y cantidad de alumnos inscriptos (calculada automáticamente). Colores por Carrera.
- **Planificación semanal** se simplifica: ya no hay que elegir semana aparte, se deriva sola de la fecha de la Clase (`planificaciones/{claseId}`).
- **Asistencia**: el id del registro pasa a ser `{claseId}_{alumnoId}`.
- `firestore.rules`: agregadas colecciones `salas` y `cocinas`.

### Migración de datos ya cargados (importante)
1. Las **Clases** viejas no tienen `fecha`, `salaId` ni `cocinaId` — no van a aparecer en la Agenda hasta que las edites y completes esos campos.
2. Las **Planificaciones** guardadas con el id viejo (`claseId_semanaId`) quedan huérfanas — hay que volver a cargarlas.
3. Los registros de **Asistencia** viejos conviven sin problema con los nuevos, no se pisan ni se pierden.

## v0.2.1 - Buscador de alumnos + campo Documento
- El campo "DNI" de Alumnos pasó a llamarse **Documento**.
- Nuevo componente `AutocompleteSelect` para elegir Alumno en Inscripciones y Usuarios.

## v0.2.0 - Cursos + Logo/Branding + Impresión
- Nueva entidad **Cursos**. Inscripciones pasan a ser Alumno + Curso + Turno.
- Módulo **Configuración** (logo del instituto, base64 en Firestore, sin Storage). Se usa en login, sidebar y lista de compras.
- Botón **Imprimir** en Lista de Compras.
- `firestore.rules`: agregadas colecciones `cursos` y `config`.
- Babel Standalone fijado en `7.24.7`.

## v0.1.0 - Primer scaffold funcional
- Login con Firebase Authentication + roles (Administrativo, Docente, Alumno, Compras).
- CRUD de catálogos: Carreras, Turnos, Docentes, Alumnos, Ingredientes, Clases.
- Recetas con ingredientes embebidos.
- Planificación semanal y generación automática de Lista de Compras.
- Asistencia y Notas por clase.
- Alta de usuarios desde la app sin cerrar la sesión del Admin.
