// =====================================================================
// permissions.js
// Matriz de roles y permisos - SOLO capa de UX (mostrar/ocultar botones).
// La seguridad real vive en firestore.rules. Si cambiás un permiso acá,
// cambialo también allá.
// =====================================================================

const ROLES = {
  ADMIN: 'admin',
  DOCENTE: 'docente',
  ALUMNO: 'alumno',
  COMPRAS: 'compras',
};

const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Administrativo',
  [ROLES.DOCENTE]: 'Docente',
  [ROLES.ALUMNO]: 'Alumno',
  [ROLES.COMPRAS]: 'Compras',
};

// Vistas del menú y qué roles pueden verlas.
const NAV_ITEMS = [
  { key: 'dashboard', label: 'Inicio', roles: [ROLES.ADMIN, ROLES.DOCENTE, ROLES.ALUMNO, ROLES.COMPRAS] },
  { key: 'agenda', label: 'Agenda', roles: [ROLES.ADMIN, ROLES.DOCENTE, ROLES.ALUMNO] },
  { key: 'carreras', label: 'Carreras', roles: [ROLES.ADMIN] },
  { key: 'cursos', label: 'Cursos', roles: [ROLES.ADMIN] },
  { key: 'turnos', label: 'Turnos', roles: [ROLES.ADMIN] },
  { key: 'salas', label: 'Salas', roles: [ROLES.ADMIN] },
  { key: 'cocinas', label: 'Cocinas', roles: [ROLES.ADMIN] },
  { key: 'docentes', label: 'Docentes', roles: [ROLES.ADMIN] },
  { key: 'alumnos', label: 'Alumnos', roles: [ROLES.ADMIN] },
  { key: 'inscripciones', label: 'Inscripciones', roles: [ROLES.ADMIN] },
  { key: 'clases', label: 'Clases', roles: [ROLES.ADMIN, ROLES.DOCENTE, ROLES.ALUMNO] },
  { key: 'ingredientes', label: 'Ingredientes', roles: [ROLES.ADMIN] },
  { key: 'recetas', label: 'Recetas', roles: [ROLES.ADMIN, ROLES.DOCENTE, ROLES.ALUMNO] },
  { key: 'planificacion', label: 'Planificación semanal', roles: [ROLES.ADMIN, ROLES.DOCENTE] },
  { key: 'compras', label: 'Lista de compras', roles: [ROLES.ADMIN, ROLES.COMPRAS] },
  { key: 'asistencia', label: 'Asistencia', roles: [ROLES.ADMIN, ROLES.DOCENTE, ROLES.ALUMNO] },
  { key: 'notas', label: 'Notas', roles: [ROLES.ADMIN, ROLES.DOCENTE, ROLES.ALUMNO] },
  { key: 'usuarios', label: 'Usuarios', roles: [ROLES.ADMIN] },
  { key: 'configuracion', label: 'Configuración', roles: [ROLES.ADMIN] },
];

// Permisos de escritura por colección/acción (para ocultar botones de
// crear/editar/borrar). Debe reflejar firestore.rules.
const PERMISSIONS = {
  carreras: { write: [ROLES.ADMIN] },
  cursos: { write: [ROLES.ADMIN] },
  turnos: { write: [ROLES.ADMIN] },
  salas: { write: [ROLES.ADMIN] },
  cocinas: { write: [ROLES.ADMIN] },
  docentes: { write: [ROLES.ADMIN] },
  alumnos: { write: [ROLES.ADMIN] },
  inscripciones: { write: [ROLES.ADMIN] },
  clases: { write: [ROLES.ADMIN] },
  ingredientes: { write: [ROLES.ADMIN] },
  recetas: { write: [ROLES.ADMIN] },
  planificaciones: { write: [ROLES.ADMIN, ROLES.DOCENTE] },
  listasCompra: { write: [ROLES.ADMIN] },
  asistencias: { write: [ROLES.ADMIN, ROLES.DOCENTE] },
  notas: { write: [ROLES.ADMIN, ROLES.DOCENTE] },
  usuarios: { write: [ROLES.ADMIN] },
  config: { write: [ROLES.ADMIN] },
};

function getNavItemsForRole(rol) {
  return NAV_ITEMS.filter((item) => item.roles.includes(rol));
}

function canWrite(coleccion, rol) {
  const perm = PERMISSIONS[coleccion];
  if (!perm) return false;
  return perm.write.includes(rol);
}

function isAdminRole(rol) {
  return rol === ROLES.ADMIN;
}

function isDocenteRole(rol) {
  return rol === ROLES.DOCENTE;
}

function isAlumnoRole(rol) {
  return rol === ROLES.ALUMNO;
}

function isComprasRole(rol) {
  return rol === ROLES.COMPRAS;
}
