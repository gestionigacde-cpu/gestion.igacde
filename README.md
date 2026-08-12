# IGA · Administración de Cocina

App interna sin servidor (Firebase + GitHub Pages) para que el departamento
administrativo del Instituto Gastronómico de las Américas gestione Carreras,
Cursos, Turnos, Salas, Cocinas, Clases, Alumnos, Recetas, la planificación
semanal de grupos/recetas por clase, la Agenda y la Lista de Compras semanal.

Arquitectura: HTML/JS/CSS estáticos, React 18 + Babel Standalone por CDN
(sin build), Firebase Authentication + Firestore como backend. Sin Node,
sin Cloud Functions, sin costo mientras el uso sea moderado (capa gratuita
de Firebase).

## Archivos

- `index.html` — carga todo en orden (ver comentarios adentro).
- `firebase-config.js` — credenciales del proyecto Firebase.
- `permissions.js` — roles y matriz de permisos (solo UX).
- `app.js` — toda la app (componentes React, lógica, pantallas).
- `styles.css` — estilos (incluye Agenda, impresión y buscador con autocompletado).
- `firestore.rules` — reglas de seguridad reales (se publican en Firebase Console).
- `CHANGELOG.md` — historial de versiones.
- `seed-ingredientes.js` — script de carga masiva (pegar en la consola del navegador).

## Jerarquía académica

**Carrera** (ej: Pastelería) → **Curso** (ej: 1er Curso, 2do Curso) →
**Clase** (Curso + Turno + Fecha real + Docente + Sala + Cocina).

- **Sala**: aula donde se dicta la parte teórica.
- **Cocina**: donde se hace la práctica.
- Los **Alumnos** se inscriben en un Curso + Turno.
- Cada **Clase** es una ocurrencia con fecha concreta (no una plantilla que
  se repite sola) — así se arma la Agenda con calendario real.

## Puesta en marcha

### 1. Crear el proyecto en Firebase

1. Andá a [console.firebase.google.com](https://console.firebase.google.com) → **Agregar proyecto**.
2. **Build → Authentication → Comenzar** → "Sign-in method" → habilitá **Correo electrónico/contraseña**.
3. **Build → Firestore Database → Crear base de datos** → modo producción.

### 2. Conectar la app al proyecto

1. ⚙ **Configuración del proyecto** → "Tus apps" → `</>` (Web) → registrá una app.
2. **Importante:** si Firebase te muestra un snippet con `import ... from "firebase/app"`, no lo copies tal cual — usamos el SDK "compat" (scripts sueltos). Copiá solo los valores al objeto `firebaseConfig` de `firebase-config.js`.

### 3. Publicar las reglas de seguridad

**Build → Firestore Database → Reglas** → pegá `firestore.rules` → **Publicar**. Repetir cada vez que el archivo cambie en el repo.

### 4. Crear el primer usuario Admin (a mano)

1. **Authentication → Users → Add user** → copiá el **UID**.
2. **Firestore Database** → colección `usuarios` → documento con ID = ese UID → `nombre`, `email`, `rol: "admin"`, `activo: true`.

### 5. Subir el código a GitHub y activar GitHub Pages

Subí los archivos al repo → **Settings → Pages** → `main` / `/ (root)`.

### 6. Autorizar el dominio en Firebase

**Authentication → Settings → Authorized domains → Add domain** → `tu-usuario.github.io`.

### 7. Probar y cargar datos

1. Cargá: Carreras, Cursos, Turnos, Salas, Cocinas, Docentes, Ingredientes y Recetas.
2. Si tenés muchos ingredientes, usá `seed-ingredientes.js` pegándolo en la consola del navegador logueado como Admin (ver instrucciones dentro del archivo) — no duplica lo que ya exista.
3. Cargá Clases con fecha real, sala y cocina → confirmá que aparezcan en "Agenda".
4. Inscribí Alumnos en Curso+Turno (buscador con autocompletado).
5. Probá el flujo: Planificación semanal → Lista de compras.
6. Desde "Configuración" subí el logo del instituto.

## Flujo funcional (resumen)

1. Admin carga catálogos: Carreras, Cursos, Turnos, Salas, Cocinas, Docentes, Alumnos, Ingredientes, Recetas.
2. Se van cargando las Clases semana a semana, cada una con fecha, sala y cocina — la **Agenda** las muestra solas.
3. Admin inscribe Alumnos en Curso + Turno.
4. El Docente entra a "Planificación semanal", elige la Clase, y define grupos + receta.
5. Admin genera la "Lista de compras" de la semana (Excel o impresión con logo).
6. Compras entra con su propio usuario y ve/exporta esa lista.
7. Docente registra Asistencia y Notas; Alumno consulta su horario, notas y asistencia.

## Logo / branding

Desde "Configuración" (solo Admin) se sube una imagen; se redimensiona y
comprime en el navegador (sin Firebase Storage). Se usa en login, sidebar,
y encabezado de la Lista de Compras al imprimir.

## Iterar

No hay build: se edita, se sube al repo, y GitHub Pages lo publica en un
par de minutos. Si seguís viendo la versión vieja, subí el número de
`?v=N` en los `<script src="...">` de `index.html`.

## Próximos pasos posibles

- Control de stock/inventario de ingredientes.
- Trazabilidad de ingredientes por clase.
- Proveedor y costo estimado en la lista de compras.
- Reportes/estadísticas.
- Duplicar una Clase para la semana siguiente con un clic.
