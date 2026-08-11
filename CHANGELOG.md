# Changelog

## v0.2.0 - Cursos + Logo/Branding + Impresión
- Nueva entidad **Cursos**: cada Carrera tiene uno o más Cursos (ej: "Pastelería 1er Curso"). Las Clases ahora se arman sobre Curso + Turno + Día + Docente, y las Inscripciones son Alumno + Curso + Turno (antes era directo sobre Carrera).
- Nuevo módulo **Configuración** (solo Admin): subir el logo del instituto. Se redimensiona/comprime en el navegador (canvas) y se guarda como base64 en `config/branding` — sin Firebase Storage.
- El logo se muestra en la pantalla de login, en el menú lateral, y en el encabezado de la Lista de Compras.
- Nuevo botón **Imprimir** en Lista de Compras: vista con estilos `@media print` (oculta menú/botones, muestra encabezado con logo) lista para llevar en papel.
- `firestore.rules`: agregadas colecciones `cursos` (catálogo, mismo patrón que carreras/turnos) y `config` (lectura pública, escritura solo Admin — el logo se ve hasta sin loguearse).
- `index.html`: Babel Standalone fijado en versión `7.24.7` (antes apuntaba a "latest", lo que causaba errores intermitentes de parseo). Cache-busting `?v=3` en los archivos propios.

### Migración de datos ya cargados
Si ya habías cargado Carreras/Clases/Inscripciones con la versión anterior:
1. Cargá primero los **Cursos** de cada Carrera (ej: "1er Curso", "2do Curso").
2. Las **Clases** e **Inscripciones** viejas quedaron con `carreraId` en vez de `cursoId` — hay que volver a editarlas/cargarlas apuntando al Curso correspondiente (no hay migración automática en este scaffold).

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
