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

## Jerarquía académica

**Carrera** (ej: Pastelería) → **Curso** (ej: 1er Curso, 2do Curso) →
**Clase** (Curso + Turno + Fecha real + Docente + Sala + Cocina).

- **Sala**: aula donde se dicta la parte teórica.
- **Cocina**: donde se hace la práctica.
- Los **Alumnos** se inscriben en un Curso + Turno (una misma persona puede
  tener varias inscripciones activas a la vez).
- Cada **Clase** es una ocurrencia con fecha concreta (no una plantilla que
  se repite sola) — así se arma la Agenda con calendario real y se pueden
  manejar recuperatorios/cambios de sala sin romper nada.

## Puesta en marcha

### 1. Crear el proyecto en Firebase

1. Andá a [console.firebase.google.com](https://console.firebase.google.com) → **Agregar proyecto**.
2. Dentro del proyecto: **Build → Authentication → Comenzar** → pestaña "Sign-in method" → habilitá **Correo electrónico/contraseña**.
3. **Build → Firestore Database → Crear base de datos** → modo producción → elegí una región (ej. `southamerica-east1`).

### 2. Conectar la app al proyecto

1. En Firebase Console: ⚙ **Configuración del proyecto** → pestaña "General" → sección "Tus apps" → ícono `</>` (Web) → registrá una app.
2. **Importante:** si Firebase te muestra un snippet con `import ... from "firebase/app"`, no lo copies tal cual — nuestro `firebase-config.js` usa el SDK "compat" (scripts sueltos, sin `import`). Copiá solo los valores (`apiKey`, `authDomain`, etc.) al objeto `firebaseConfig` de `firebase-config.js`, dejando el resto del archivo tal cual.

### 3. Publicar las reglas de seguridad

1. **Build → Firestore Database → Reglas** → pegá el contenido de `firestore.rules` → **Publicar**.
2. Cada vez que cambies `firestore.rules` en el repo, hay que volver a pegarlo y publicarlo acá.

### 4. Crear el primer usuario Admin (a mano)

1. **Authentication → Users → Add user** → cargá email y contraseña → copiá el **UID**.
2. **Firestore Database → Iniciar colección** `usuarios` → documento con ID = ese UID → campos `nombre`, `email`, `rol: "admin"`, `activo: true`.
3. Ya podés loguearte y crear al resto de usuarios desde "Usuarios" en la app.

### 5. Subir el código a GitHub y activar GitHub Pages

1. Subí todos los archivos de este proyecto a un repo.
2. **Settings → Pages** → Source: **Deploy from a branch** → `main` / `/ (root)`.
3. Esperá 1-2 minutos a que se publique la URL.

### 6. Autorizar el dominio en Firebase

**Authentication → Settings → Authorized domains → Add domain** → `tu-usuario.github.io`.

### 7. Probar

1. Cargá: Carreras, Cursos, Turnos, Salas, Cocinas, Docentes, Ingredientes y Recetas.
2. Cargá Clases con fecha real, sala y cocina → mirá que aparezcan en "Agenda".
3. Inscribí Alumnos en Curso+Turno.
4. Probá el flujo completo: Planificación semanal → Lista de compras.
5. Desde "Configuración" subí el logo del instituto.

## Flujo funcional (resumen)

1. Admin carga catálogos: Carreras, Cursos, Turnos, Salas, Cocinas, Docentes, Alumnos, Ingredientes, Recetas.
2. Admin (o quien organiza el cronograma) va cargando las Clases semana a semana, cada una con su fecha, sala y cocina — la **Agenda** las va mostrando solas, ordenadas por día y cocina, sin tener que armar nada a mano.
3. Admin inscribe Alumnos en Curso + Turno (buscándolos por nombre con autocompletado).
4. El Docente (o Admin) entra a "Planificación semanal", elige la Clase, y define cuántos Grupos hay y qué Receta prepara cada uno.
5. Admin entra a "Lista de compras", elige la semana, y genera la lista sumando ingredientes de todas las clases planificadas esa semana. Se puede exportar a Excel o imprimir (con el logo del instituto).
6. El rol Compras entra con su propio usuario y ve/exporta esa lista.
7. Docente registra Asistencia y Notas por clase; Alumno consulta su horario, notas y asistencia.

## Logo / branding

Desde "Configuración" (solo Admin) se sube una imagen; se redimensiona y
comprime en el navegador (sin Firebase Storage) y se guarda en Firestore.
Se usa en: login, menú lateral, y encabezado de la Lista de Compras al
imprimir.

## Iterar

No hay build: cada cambio se edita directo en los archivos, se sube al repo
y GitHub Pages lo publica en un par de minutos. Si seguís viendo la versión
vieja después de subir un cambio, subí el número de `?v=N` en los
`<script src="...">` de `index.html`.

## Próximos pasos posibles (no incluidos en este scaffold)

- Control de stock/inventario de ingredientes.
- Trazabilidad de ingredientes por clase.
- Proveedor y costo estimado en la lista de compras.
- Reportes/estadísticas.
- Copiar/duplicar una Clase para la semana siguiente con un clic (hoy hay que cargarla de nuevo).
