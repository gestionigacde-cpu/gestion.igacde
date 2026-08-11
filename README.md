# IGA · Administración de Cocina

App interna sin servidor (Firebase + GitHub Pages) para que el departamento
administrativo del Instituto Gastronómico de las Américas gestione Carreras,
Cursos, Turnos, Clases, Alumnos, Recetas, la planificación semanal de
grupos/recetas por clase y la Lista de Compras semanal.

Arquitectura: HTML/JS/CSS estáticos, React 18 + Babel Standalone por CDN
(sin build), Firebase Authentication + Firestore como backend. Sin Node,
sin Cloud Functions, sin costo mientras el uso sea moderado (capa gratuita
de Firebase).

## Archivos

- `index.html` — carga todo en orden (ver comentarios adentro).
- `firebase-config.js` — credenciales del proyecto Firebase.
- `permissions.js` — roles y matriz de permisos (solo UX).
- `app.js` — toda la app (componentes React, lógica, pantallas).
- `styles.css` — estilos (incluye vista de impresión y buscador con autocompletado).
- `firestore.rules` — reglas de seguridad reales (se publican en Firebase Console).
- `CHANGELOG.md` — historial de versiones.

## Jerarquía académica

**Carrera** (ej: Pastelería) → **Curso** (ej: 1er Curso, 2do Curso — nivel
dentro de la carrera) → **Clase** (Curso + Turno + Día + Docente, recurrente
semana a semana). Los **Alumnos** se inscriben en un Curso + Turno (una
misma persona puede tener varias inscripciones activas a la vez).

## Puesta en marcha

### 1. Crear el proyecto en Firebase

1. Andá a [console.firebase.google.com](https://console.firebase.google.com) → **Agregar proyecto**.
2. Dentro del proyecto: **Build → Authentication → Comenzar** → pestaña "Sign-in method" → habilitá **Correo electrónico/contraseña**.
3. **Build → Firestore Database → Crear base de datos** → modo producción → elegí una región (ej. `southamerica-east1`).

### 2. Conectar la app al proyecto

1. En Firebase Console: ⚙ **Configuración del proyecto** → pestaña "General" → sección "Tus apps" → ícono `</>` (Web) → registrá una app (nombre, ej. "IGA Web").
2. Te va a mostrar un snippet de configuración. **Importante:** si Firebase te muestra el formato moderno con `import ... from "firebase/app"`, no lo copies tal cual — nuestro `firebase-config.js` usa el SDK "compat" (scripts sueltos, sin `import`). Solo necesitás los valores (`apiKey`, `authDomain`, `projectId`, etc.), que también podés ver más abajo en esa misma pantalla listados individualmente.
3. Abrí `firebase-config.js` en este proyecto y reemplazá los valores del objeto `firebaseConfig` por los tuyos, dejando el resto del archivo (`firebase.initializeApp(...)`, `const auth = ...`, `const db = ...`) tal cual.

### 3. Publicar las reglas de seguridad

1. En Firebase Console: **Build → Firestore Database → Reglas**.
2. Pegá el contenido de `firestore.rules` (de este repo) y publicá.
3. Cada vez que cambies `firestore.rules` en el repo, hay que volver a pegarlo y publicarlo acá — no se sincroniza solo.

### 4. Crear el primer usuario Admin (a mano)

La app no puede crear su propio primer usuario (todavía nadie tiene permiso
para crear usuarios). Se hace una única vez, directo desde la consola:

1. **Authentication → Users → Add user** → cargá email y contraseña.
2. Copiá el **UID** que le asignó.
3. **Firestore Database → Iniciar colección** → ID de colección: `usuarios` → ID de documento: pegá el UID copiado → agregá los campos:
   - `nombre` (string): tu nombre
   - `email` (string): el mismo email
   - `rol` (string): `admin`
   - `activo` (boolean): `true`
4. Guardá. Ya podés loguearte en la app con ese usuario y desde "Usuarios" vas a poder crear al resto (docentes, alumnos, compras) sin volver a tocar la consola.

### 5. Subir el código a GitHub y activar GitHub Pages

1. Creá un repositorio en GitHub y subí todos los archivos de este proyecto (`index.html`, `firebase-config.js` ya con tus credenciales reales, `permissions.js`, `app.js`, `styles.css`, `firestore.rules`, `README.md`, `CHANGELOG.md`).
2. En el repo: **Settings → Pages** → "Build and deployment" → Source: **Deploy from a branch** → Branch: `main` / carpeta `/ (root)` → Save.
3. GitHub te va a dar una URL pública (algo como `https://tu-usuario.github.io/tu-repo/`). Puede tardar 1-2 minutos en estar disponible la primera vez.

### 6. Autorizar el dominio de GitHub Pages en Firebase

Si te saltás este paso, el login funciona en local pero falla en producción.

1. Firebase Console → **Authentication → Settings → Authorized domains → Add domain**.
2. Agregá `tu-usuario.github.io` (sin `https://` ni la ruta del repo).

### 7. Probar

1. Abrí la URL de GitHub Pages.
2. Iniciá sesión con el usuario Admin creado a mano.
3. Cargá al menos: una Carrera, un Curso de esa Carrera, un Turno, un Docente, un Ingrediente y una Receta, para poder probar el flujo completo: Clases → Planificación semanal (grupos + receta) → Lista de compras.
4. Desde "Configuración" subí el logo del instituto (opcional, pero recomendado).

## Flujo funcional (resumen)

1. Admin carga catálogos: Carreras, Cursos (por carrera), Turnos, Docentes, Alumnos, Ingredientes, Recetas (con sus ingredientes y cantidades).
2. Admin define las Clases (Curso + Turno + Día + Docente, recurrente semana a semana).
3. Admin inscribe Alumnos en Curso + Turno (un alumno puede tener varias inscripciones), buscándolos por nombre con el campo de autocompletado.
4. Cada semana, el Docente (o Admin) entra a "Planificación semanal", elige su Clase y la semana, define cuántos Grupos hay y qué Receta prepara cada uno.
5. Admin entra a "Lista de compras", elige la semana, y genera la lista: el sistema suma los ingredientes de todas las recetas planificadas esa semana en todas las clases, en una única lista. Se puede exportar a Excel o imprimir (con el logo del instituto en el encabezado).
6. El rol Compras entra con su propio usuario y ve/exporta esa lista (no genera ni edita catálogos).
7. Docente registra Asistencia y Notas por clase; Alumno consulta su propio horario, notas y asistencia.

## Logo / branding

Desde "Configuración" (solo Admin) se sube una imagen; se redimensiona y
comprime en el navegador (sin Firebase Storage) y se guarda en Firestore.
Se usa automáticamente en: pantalla de login, menú lateral, y encabezado
de la Lista de Compras al imprimir (botón "Imprimir", `@media print` oculta
menú y botones, deja solo el encabezado con logo y la tabla).

## Iterar

No hay build: cada cambio se edita directo en los archivos, se sube al repo
(`git add . && git commit -m "..." && git push`), y GitHub Pages lo publica
solo en un par de minutos. Si después de subir un cambio seguís viendo la
versión vieja, subí el número de `?v=N` en los `<script src="...">` de
`index.html` para forzar que se pida una copia fresca.

## Próximos pasos posibles (no incluidos en este scaffold)

- Control de stock/inventario de ingredientes (descontar lo comprado).
- Trazabilidad de qué cantidad de cada ingrediente corresponde a qué clase.
- Proveedor y costo estimado en la lista de compras.
- Reportes/estadísticas (alumnos por carrera/curso/turno, asistencia agregada, etc.).
