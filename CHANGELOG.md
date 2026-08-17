# Changelog

## v0.5.2 - Filtros en Inscripciones
- Nueva barra de filtros en **Inscripciones**: Curso, Sección (se acota sola según el Curso elegido), Turno, Año lectivo y Activo. Se pueden combinar, y hay un botón "Limpiar filtros" cuando hay alguno aplicado.
- No requiere cambios en `firestore.rules` ni republicar nada en Firebase Console.

## v0.5.1 - Año lectivo en Inscripciones
- Nuevo campo **Año lectivo** (obligatorio) al inscribir un Alumno, con el año actual puesto por defecto. Se muestra como columna en la tabla y se puede editar con el botón "Editar".
- Sirve para distinguir, por ejemplo, si un Alumno repite el mismo Curso+Sección+Turno en otro año.
- No requiere cambios en `firestore.rules` ni republicar nada en Firebase Console.

### Migración de datos ya cargados (importante)
1. Las **Inscripciones** viejas no tienen Año lectivo — van a mostrar "—" en esa columna hasta que las corrijas con "Editar".

## v0.5.0 - Carrera en Recetas + buscador
- Al crear o editar una **Receta** ahora hay que elegir a qué **Carrera** pertenece (obligatorio para recetas nuevas). Se muestra en cada tarjeta ("Pastelería · 4 ingredientes").
- Nuevo **buscador de recetas** en la vista "Recetas" (filtra por nombre a medida que escribís).
- Se agregó `fix-carrera-recetas.js`: script de consola para asignar Carrera a las recetas que ya estaban cargadas sin ese dato.

### Migración de datos ya cargados (importante)
1. Las **Recetas** viejas no tienen Carrera — van a mostrar "Sin carrera asignada" en la tarjeta hasta que las corrijas.
2. Corré `fix-carrera-recetas.js` en la consola (ver instrucciones dentro del archivo) para asignarlas todas a una Carrera de una sola vez, o editalas una por una desde "Recetas".
3. No requiere cambios en `firestore.rules` ni republicar nada en Firebase Console.

## v0.4.4 - Orden de Turnos en la Agenda
- Las filas de la **Agenda** ahora siguen un orden fijo y lógico: Mañana, Tarde, Noche, y cualquier otro Turno (ej: Sábado) al final — antes se mostraban en el orden en que se habían cargado los Turnos, sin ningún criterio.
- No requiere cambios en `firestore.rules` ni republicar nada en Firebase Console.

## v0.4.3 - Encontrar planificaciones ya guardadas
- El desplegable de Clase en **Planificación semanal** ahora marca con "✓" las clases que ya tienen una planificación guardada, para encontrarlas fácil y modificarlas (antes había que elegir clase por clase para saber cuál ya estaba planificada).
- Al elegir una clase, un mensaje aclara si ya tenía planificación guardada o si es nueva.
- Recordatorio de cómo editar una planificación existente: elegí la clase (con el "✓") en el desplegable — los grupos guardados se cargan solos, los modificás y le das "Guardar planificación" de nuevo (sobreescribe lo anterior, no crea uno nuevo).
- No requiere cambios en `firestore.rules` ni republicar nada en Firebase Console.

## v0.4.2 - Corrección: columna Sección en Clases mostraba el ID
- En la tabla de **Clases**, la columna "Sección (opcional)" mostraba el ID en crudo en vez del nombre (ej: "0TfJZdj37Lq9ebv1LobR" en vez de "A"). Ahora muestra el nombre correctamente, y si la Sección no existe muestra "⚠ no encontrado" en vez del ID.
- Esta corrección aplica a cualquier columna de tipo selección que dependa de otro campo (por ahora, Sección en Clases); antes solo funcionaba para columnas con opciones fijas (Curso, Turno, Sala, Cocina, Docente).
- No requiere cambios en `firestore.rules` ni republicar nada en Firebase Console.

## v0.4.1 - Editar Inscripciones
- La tabla de **Inscripciones** ahora tiene botón **Editar** por fila: reabre el mismo formulario de arriba con los datos cargados, permite corregir Alumno/Curso/Sección/Turno y guardar los cambios (antes solo se podía dar de baja/reactivar).
- Si una Inscripción quedó con un Curso, Sección o Turno que ya no existe (por ejemplo, un ID mal cargado desde un seed), la tabla ahora lo marca claramente como "⚠ ... no encontrado/a" en vez de mostrar el ID en crudo — así es fácil detectar qué filas hay que corregir con el nuevo botón Editar.
- No requiere cambios en `firestore.rules` ni republicar nada en Firebase Console.

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
