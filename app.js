// =====================================================================
// app.js - IGA · Administración de Cocina
// Toda la app: componentes React, lógica, pantallas. Sin build, sin
// router, sin Context/Redux (estado por props desde AppShell).
// Requiere que firebase-config.js y permissions.js se hayan cargado
// antes (dejan auth, db, ROLES, PERMISSIONS, etc. como globales).
//
// Jerarquía académica: Carrera -> Curso (ej: "Pastelería 1er Curso") ->
// Clase (Curso + Sección opcional + Turno + Fecha real + Docente + Sala +
// Cocina). Los Alumnos se inscriben en un Curso (+ Sección opcional) + Turno.
//
// Sección = subdivisión de un Curso (ej: 1er Curso Sección A, Sección B,
// sin límite), independiente del Turno: varias Secciones pueden compartir
// el mismo horario (mismo Curso+Turno, distinto docente/aula/cocina).
// Sala = aula donde se dicta la parte teórica de la clase.
// Cocina = donde se hace la práctica.
// =====================================================================

const { useState, useEffect } = React;

const APP_VERSION = '0.4.2';

const UNIDADES = ['kg', 'g', 'l', 'ml', 'unidad', 'docena', 'atado', 'paquete', 'vaina'];

const DIAS_CORTOS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

// Semana en formato "YYYY-Www" (compatible con <input type="week">).
// Es una aproximación práctica, no un cálculo ISO-8601 estricto — alcanza
// para agrupar clases/compras semana a semana en una herramienta interna.
function inputWeekFromDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const dayNum = Math.floor((d - jan1) / 86400000);
  const week = Math.ceil((dayNum + jan1.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

// Devuelve el lunes de la semana de una fecha dada (para navegar la Agenda).
function getMonday(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0 = domingo
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatFechaCorta(date) {
  return `${String(date.getDate()).padStart(2, '0')}-${MESES_CORTOS[date.getMonth()]}`;
}

// Color determinístico por id (ej: por Carrera), sin necesidad de que
// alguien elija un color a mano. Mismo id -> mismo color siempre.
const AGENDA_PALETTE = ['#2f9e64', '#e0791f', '#8e6fb0', '#c9a300', '#c0392b', '#3f7cac', '#00897b', '#c2185b', '#6d5842'];
function colorForId(id) {
  if (!id) return '#9a9a9a';
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return AGENDA_PALETTE[Math.abs(hash) % AGENDA_PALETTE.length];
}

// Redimensiona/comprime una imagen en el navegador (canvas) y la devuelve
// como base64, sin usar Firebase Storage (se guarda como texto en
// Firestore, ver config/branding). Alcanza para un logo, no para fotos
// de alta resolución.
function resizeImageToBase64(file, maxWidth) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round(height * (maxWidth / width));
          width = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => reject(new Error('No se pudo leer la imagen.'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
    reader.readAsDataURL(file);
  });
}

// ---------------------------------------------------------------------
// Hook genérico: suscripción en tiempo real a una colección de Firestore.
// deps controla cuándo se vuelve a suscribir (ej: cambió un filtro).
// ---------------------------------------------------------------------
function useCollection(path, queryFn, deps) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    let ref = db.collection(path);
    if (queryFn) ref = queryFn(ref);
    const unsub = ref.onSnapshot(
      (snap) => {
        setData(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error(`Error leyendo ${path}:`, err);
        setLoading(false);
      }
    );
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps || [path]);

  return [data, loading];
}

// Logo del instituto (config/branding). Lectura pública en las reglas,
// así se puede mostrar hasta en la pantalla de login.
function useBranding() {
  const [logo, setLogo] = useState(null);
  useEffect(() => {
    const unsub = db.collection('config').doc('branding').onSnapshot(
      (snap) => setLogo(snap.exists ? snap.data().logoBase64 || null : null),
      () => setLogo(null)
    );
    return unsub;
  }, []);
  return logo;
}

// ---------------------------------------------------------------------
// Componentes genéricos de UI
// ---------------------------------------------------------------------
function LoadingSpinner({ full }) {
  return <div className={full ? 'loading-full' : 'loading'}>Cargando...</div>;
}

function Modal({ title, onClose, children, wide }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal ${wide ? 'modal-wide' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="btn-icon" onClick={onClose} type="button">✕</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

// Select con búsqueda por texto (filtra a medida que se escribe). Pensado
// para listas que pueden crecer mucho (ej: Alumnos) donde un <select>
// tradicional se vuelve difícil de usar.
function AutocompleteSelect({ options, value, onChange, placeholder }) {
  const selected = options.find((o) => o.value === value);
  const [query, setQuery] = useState(selected ? selected.label : '');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const match = options.find((o) => o.value === value);
    setQuery(match ? match.label : '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const filtered = query.trim() === ''
    ? options
    : options.filter((o) => o.label.toLowerCase().includes(query.trim().toLowerCase()));

  function elegir(opt) {
    onChange(opt.value);
    setQuery(opt.label);
    setOpen(false);
  }

  function handleChange(e) {
    setQuery(e.target.value);
    setOpen(true);
    if (value) onChange('');
  }

  function handleBlur() {
    setOpen(false);
    const stillValid = options.find((o) => o.label === query);
    if (!stillValid) {
      const match = options.find((o) => o.value === value);
      setQuery(match ? match.label : '');
    }
  }

  return (
    <div className="autocomplete">
      <input
        type="text"
        value={query}
        placeholder={placeholder || 'Escribí para buscar...'}
        onChange={handleChange}
        onFocus={() => setOpen(true)}
        onBlur={handleBlur}
      />
      {open && (
        <div className="autocomplete-menu" onMouseDown={(e) => e.preventDefault()}>
          {filtered.length === 0 && <div className="autocomplete-empty">Sin resultados</div>}
          {filtered.slice(0, 50).map((o) => (
            <div key={o.value} className="autocomplete-option" onClick={() => elegir(o)}>{o.label}</div>
          ))}
        </div>
      )}
    </div>
  );
}

function FormField({ field, value, onChange, form }) {
  if (field.type === 'textarea') {
    return (
      <label>{field.label}
        <textarea value={value || ''} onChange={(e) => onChange(e.target.value)} rows={3} required={field.required} />
      </label>
    );
  }
  if (field.type === 'select') {
    // dynamicOptions: para selects que dependen de otro campo del mismo
    // formulario (ej: Sección depende del Curso elegido).
    const opts = field.dynamicOptions ? field.dynamicOptions(form || {}) : (field.options || []);
    return (
      <label>{field.label}
        <select value={value || ''} onChange={(e) => onChange(e.target.value)} required={field.required}>
          <option value="">Elegir...</option>
          {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </label>
    );
  }
  if (field.type === 'checkbox') {
    return (
      <label className="checkbox-label">
        <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} /> {field.label}
      </label>
    );
  }
  if (field.type === 'number') {
    return (
      <label>{field.label}
        <input type="number" value={value || ''} onChange={(e) => onChange(e.target.value)} required={field.required} />
      </label>
    );
  }
  if (field.type === 'date') {
    return (
      <label>{field.label}
        <input type="date" value={value || ''} onChange={(e) => onChange(e.target.value)} required={field.required} />
      </label>
    );
  }
  return (
    <label>{field.label}
      <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)} required={field.required} />
    </label>
  );
}

function renderCellValue(val, field, item) {
  if (field.type === 'checkbox') return val ? 'Sí' : 'No';
  if (field.type === 'select') {
    // dynamicOptions (ej: Sección, que depende del Curso): se calcula
    // usando la fila entera como "form", porque comparte la misma clave
    // (cursoId) que usa el select en el formulario de alta/edición.
    const opts = field.dynamicOptions ? field.dynamicOptions(item || {}) : (field.options || []);
    if (!val) return '—';
    const opt = opts.find((o) => o.value === val);
    return opt ? opt.label : '⚠ no encontrado';
  }
  return val;
}

// ---------------------------------------------------------------------
// CrudTable: tabla + modal de alta/edición genérico para colecciones
// "catálogo" simples (carreras, cursos, turnos, salas, cocinas, docentes,
// alumnos, ingredientes, clases). filterFn es opcional y solo acota qué
// se MUESTRA en pantalla (no reemplaza las reglas de seguridad reales,
// que viven en Firestore).
// ---------------------------------------------------------------------
function CrudTable({ title, collectionName, fields, role, extraDefault, filterFn }) {
  const [items, loading] = useCollection(collectionName, null, [collectionName]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const puedeEscribir = canWrite(collectionName, role);
  const visibles = filterFn ? items.filter(filterFn) : items;

  function openNew() {
    const initial = {};
    fields.forEach((f) => { initial[f.key] = f.type === 'checkbox' ? true : ''; });
    setForm({ ...initial, ...extraDefault });
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(item) {
    setForm({ ...item });
    setEditing(item);
    setModalOpen(true);
  }

  // Si un campo tiene `clears` (ej: cursoId limpia seccionId), al cambiarlo
  // se vacían esos otros campos para no dejar una combinación inválida.
  function setFieldValue(key, val) {
    const field = fields.find((f) => f.key === key);
    setForm((prev) => {
      const next = { ...prev, [key]: val };
      if (field && field.clears) field.clears.forEach((k) => { next[k] = ''; });
      return next;
    });
  }

  async function guardar(e) {
    e.preventDefault();
    const data = {};
    fields.forEach((f) => { data[f.key] = form[f.key] ?? (f.type === 'checkbox' ? false : ''); });
    try {
      if (editing) {
        await db.collection(collectionName).doc(editing.id).update(data);
      } else {
        await db.collection(collectionName).add({
          ...data, ...extraDefault,
          creadoEn: firebase.firestore.FieldValue.serverTimestamp(),
        });
      }
      setModalOpen(false);
    } catch (err) {
      alert('Error al guardar: ' + err.message);
    }
  }

  async function eliminar(item) {
    if (!confirm(`¿Eliminar "${item.nombre || item.id}"?`)) return;
    try {
      await db.collection(collectionName).doc(item.id).delete();
    } catch (err) {
      alert('Error al eliminar: ' + err.message);
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="view">
      <div className="view-header">
        <h2>{title}</h2>
        {puedeEscribir && <button className="btn btn-primary" onClick={openNew} type="button">+ Nuevo</button>}
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {fields.map((f) => <th key={f.key}>{f.label}</th>)}
              {puedeEscribir && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {visibles.map((item) => (
              <tr key={item.id}>
                {fields.map((f) => <td key={f.key}>{renderCellValue(item[f.key], f, item)}</td>)}
                {puedeEscribir && (
                  <td className="actions">
                    <button className="btn-icon" onClick={() => openEdit(item)} type="button">Editar</button>
                    <button className="btn-icon btn-danger" onClick={() => eliminar(item)} type="button">Borrar</button>
                  </td>
                )}
              </tr>
            ))}
            {visibles.length === 0 && (
              <tr><td colSpan={fields.length + 1} className="empty">Sin registros todavía.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <Modal title={editing ? 'Editar' : 'Nuevo'} onClose={() => setModalOpen(false)}>
          <form onSubmit={guardar} className="form">
            {fields.map((f) => (
              <FormField key={f.key} field={f} value={form[f.key]} onChange={(v) => setFieldValue(f.key, v)} form={form} />
            ))}
            <div className="form-actions">
              <button type="button" className="btn" onClick={() => setModalOpen(false)}>Cancelar</button>
              <button type="submit" className="btn btn-primary">Guardar</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------
// Vistas de catálogo simple
// ---------------------------------------------------------------------
function CarrerasView({ role }) {
  const fields = [
    { key: 'nombre', label: 'Nombre', type: 'text', required: true },
    { key: 'descripcion', label: 'Descripción', type: 'textarea' },
    { key: 'activo', label: 'Activo', type: 'checkbox' },
  ];
  return <CrudTable title="Carreras" collectionName="carreras" fields={fields} role={role} extraDefault={{ activo: true }} />;
}

// Curso = nivel/año dentro de una Carrera. Ej: Carrera "Pastelería" ->
// Cursos "1er Curso", "2do Curso".
function CursosView({ role }) {
  const [carreras] = useCollection('carreras', null, []);
  const fields = [
    { key: 'nombre', label: 'Nombre (ej: 1er Curso)', type: 'text', required: true },
    { key: 'carreraId', label: 'Carrera', type: 'select', options: carreras.map((c) => ({ value: c.id, label: c.nombre })) },
    { key: 'activo', label: 'Activo', type: 'checkbox' },
  ];
  return <CrudTable title="Cursos" collectionName="cursos" fields={fields} role={role} extraDefault={{ activo: true }} />;
}

// Sección = subdivisión de un Curso (ej: 1er Curso Sección A, Sección B...),
// sin límite de cantidad. Independiente del Turno: la misma Sección puede
// compartir horario con otra (mismo Turno, distinto docente/aula/cocina).
function SeccionesView({ role }) {
  const [cursos] = useCollection('cursos', null, []);
  const [carreras] = useCollection('carreras', null, []);
  const nombreCurso = (curso) => {
    const carrera = carreras.find((c) => c.id === curso.carreraId);
    return carrera ? `${carrera.nombre} - ${curso.nombre}` : curso.nombre;
  };
  const fields = [
    { key: 'nombre', label: 'Nombre (ej: A)', type: 'text', required: true },
    { key: 'cursoId', label: 'Curso', type: 'select', options: cursos.map((c) => ({ value: c.id, label: nombreCurso(c) })), required: true },
    { key: 'activo', label: 'Activo', type: 'checkbox' },
  ];
  return <CrudTable title="Secciones" collectionName="secciones" fields={fields} role={role} extraDefault={{ activo: true }} />;
}

function TurnosView({ role }) {
  const fields = [
    { key: 'nombre', label: 'Nombre (ej: Mañana)', type: 'text', required: true },
    { key: 'activo', label: 'Activo', type: 'checkbox' },
  ];
  return <CrudTable title="Turnos" collectionName="turnos" fields={fields} role={role} extraDefault={{ activo: true }} />;
}

// Sala = aula donde se dicta la parte teórica antes de entrar a la Cocina.
function SalasView({ role }) {
  const fields = [
    { key: 'nombre', label: 'Nombre (ej: Sala 2)', type: 'text', required: true },
    { key: 'activo', label: 'Activo', type: 'checkbox' },
  ];
  return <CrudTable title="Salas" collectionName="salas" fields={fields} role={role} extraDefault={{ activo: true }} />;
}

// Cocina = donde se hace la práctica.
function CocinasView({ role }) {
  const fields = [
    { key: 'nombre', label: 'Nombre (ej: Cocina 1)', type: 'text', required: true },
    { key: 'activo', label: 'Activo', type: 'checkbox' },
  ];
  return <CrudTable title="Cocinas" collectionName="cocinas" fields={fields} role={role} extraDefault={{ activo: true }} />;
}

function DocentesView({ role }) {
  const fields = [
    { key: 'nombre', label: 'Nombre', type: 'text', required: true },
    { key: 'email', label: 'Email', type: 'text' },
    { key: 'activo', label: 'Activo', type: 'checkbox' },
  ];
  return <CrudTable title="Docentes" collectionName="docentes" fields={fields} role={role} extraDefault={{ activo: true }} />;
}

function AlumnosView({ role }) {
  const fields = [
    { key: 'nombre', label: 'Nombre', type: 'text', required: true },
    { key: 'email', label: 'Email', type: 'text' },
    { key: 'documento', label: 'Documento', type: 'text' },
    { key: 'activo', label: 'Activo', type: 'checkbox' },
  ];
  return <CrudTable title="Alumnos" collectionName="alumnos" fields={fields} role={role} extraDefault={{ activo: true }} />;
}

function IngredientesView({ role }) {
  const fields = [
    { key: 'nombre', label: 'Nombre', type: 'text', required: true },
    { key: 'unidadMedida', label: 'Unidad', type: 'select', options: UNIDADES.map((u) => ({ value: u, label: u })) },
  ];
  return <CrudTable title="Ingredientes" collectionName="ingredientes" fields={fields} role={role} />;
}

// Clase = Curso + (Sección opcional) + Turno + Fecha real + Docente + Sala + Cocina.
function ClasesView({ role, usuario }) {
  const [carreras] = useCollection('carreras', null, []);
  const [cursos] = useCollection('cursos', null, []);
  const [secciones] = useCollection('secciones', null, []);
  const [turnos] = useCollection('turnos', null, []);
  const [salas] = useCollection('salas', null, []);
  const [cocinas] = useCollection('cocinas', null, []);
  const [docentes] = useCollection('docentes', null, []);
  const [misInscripciones] = useCollection(
    'inscripciones',
    (ref) => (role === ROLES.ALUMNO && usuario.alumnoId ? ref.where('alumnoId', '==', usuario.alumnoId) : ref.where('alumnoId', '==', '__none__')),
    [role, usuario.alumnoId]
  );

  const nombreCurso = (curso) => {
    const carrera = carreras.find((c) => c.id === curso.carreraId);
    return carrera ? `${carrera.nombre} - ${curso.nombre}` : curso.nombre;
  };

  const fields = [
    { key: 'nombre', label: 'Nombre de la clase', type: 'text', required: true },
    { key: 'cursoId', label: 'Curso', type: 'select', options: cursos.map((c) => ({ value: c.id, label: nombreCurso(c) })), clears: ['seccionId'] },
    { key: 'seccionId', label: 'Sección (opcional)', type: 'select', dynamicOptions: (form) => secciones.filter((s) => s.cursoId === form.cursoId).map((s) => ({ value: s.id, label: s.nombre })) },
    { key: 'turnoId', label: 'Turno', type: 'select', options: turnos.map((t) => ({ value: t.id, label: t.nombre })) },
    { key: 'fecha', label: 'Fecha', type: 'date', required: true },
    { key: 'salaId', label: 'Sala (teórica)', type: 'select', options: salas.map((s) => ({ value: s.id, label: s.nombre })) },
    { key: 'cocinaId', label: 'Cocina', type: 'select', options: cocinas.map((c) => ({ value: c.id, label: c.nombre })) },
    { key: 'docenteId', label: 'Docente', type: 'select', options: docentes.map((d) => ({ value: d.id, label: d.nombre })) },
    { key: 'activo', label: 'Activo', type: 'checkbox' },
  ];

  let filterFn = null;
  if (role === ROLES.DOCENTE) filterFn = (c) => c.docenteId === usuario.docenteId;
  if (role === ROLES.ALUMNO) {
    const combos = misInscripciones.map((i) => `${i.cursoId}_${i.turnoId}_${i.seccionId || ''}`);
    filterFn = (c) => combos.includes(`${c.cursoId}_${c.turnoId}_${c.seccionId || ''}`);
  }

  return <CrudTable title="Clases" collectionName="clases" fields={fields} role={role} extraDefault={{ activo: true }} filterFn={filterFn} />;
}

// ---------------------------------------------------------------------
// Agenda semanal: calendario real, navegable semana a semana. Se arma
// sola a partir de las Clases que ya se van cargando (no hay que ubicar
// nada a mano). Columnas = Días (con fecha) x Cocina. Filas = Turno.
// ---------------------------------------------------------------------
function AgendaView() {
  const [inicioSemana, setInicioSemana] = useState(() => getMonday(new Date()));
  const dias = [0, 1, 2, 3, 4, 5].map((i) => addDays(inicioSemana, i)); // Lunes a Sábado
  const inicioStr = toISODate(dias[0]);
  const finStr = toISODate(dias[5]);

  const [clases] = useCollection('clases', (ref) => ref.where('fecha', '>=', inicioStr).where('fecha', '<=', finStr), [inicioStr, finStr]);
  const [cocinas] = useCollection('cocinas', null, []);
  const [salas] = useCollection('salas', null, []);
  const [turnos] = useCollection('turnos', null, []);
  const [cursos] = useCollection('cursos', null, []);
  const [secciones] = useCollection('secciones', null, []);
  const [carreras] = useCollection('carreras', null, []);
  const [docentes] = useCollection('docentes', null, []);
  const [inscripciones] = useCollection('inscripciones', (ref) => ref.where('activo', '==', true), []);

  const nombreSala = (id) => (salas.find((s) => s.id === id) || {}).nombre || '';
  const nombreSeccion = (id) => (secciones.find((s) => s.id === id) || {}).nombre || '';
  const nombreDocente = (id) => (docentes.find((d) => d.id === id) || {}).nombre || '';
  const cursoDe = (id) => cursos.find((c) => c.id === id);
  const nombreCursoCompleto = (cursoId) => {
    const curso = cursoDe(cursoId);
    if (!curso) return '';
    const carrera = carreras.find((c) => c.id === curso.carreraId);
    return carrera ? `${carrera.nombre} - ${curso.nombre}` : curso.nombre;
  };
  const cantidadAlumnos = (cursoId, turnoId, seccionId) =>
    inscripciones.filter((i) => i.cursoId === cursoId && i.turnoId === turnoId && (i.seccionId || '') === (seccionId || '')).length;
  const colorDeClase = (cl) => {
    const curso = cursoDe(cl.cursoId);
    return colorForId(curso ? curso.carreraId : cl.cursoId);
  };

  const cocinasActivas = cocinas.filter((c) => c.activo !== false);
  const columnas = cocinasActivas.length > 0 ? cocinasActivas : [null];

  return (
    <div className="view">
      <div className="view-header">
        <h2>Agenda</h2>
        <div className="agenda-nav">
          <button className="btn" onClick={() => setInicioSemana(addDays(inicioSemana, -7))} type="button">← Semana anterior</button>
          <button className="btn" onClick={() => setInicioSemana(getMonday(new Date()))} type="button">Hoy</button>
          <button className="btn" onClick={() => setInicioSemana(addDays(inicioSemana, 7))} type="button">Semana siguiente →</button>
        </div>
      </div>

      {turnos.length === 0 && <p className="empty">Cargá al menos un Turno para poder ver la agenda.</p>}

      <div className="agenda-wrap">
        <table className="agenda-table">
          <thead>
            <tr>
              <th className="agenda-corner"></th>
              {dias.map((d, i) => (
                <th key={i} colSpan={columnas.length} className="agenda-day-header">
                  <div>{formatFechaCorta(d)}</div>
                  <div className="agenda-day-name">{DIAS_CORTOS[d.getDay()]}</div>
                </th>
              ))}
            </tr>
            <tr>
              <th className="agenda-corner"></th>
              {dias.map((d, i) => (
                columnas.map((coc, ci) => (
                  <th key={`${i}_${coc ? coc.id : ci}`} className="agenda-cocina-header">{coc ? coc.nombre : '—'}</th>
                ))
              ))}
            </tr>
          </thead>
          <tbody>
            {turnos.map((turno) => (
              <tr key={turno.id}>
                <th className="agenda-turno-label">{turno.nombre}</th>
                {dias.map((d) => {
                  const fechaStr = toISODate(d);
                  return columnas.map((coc, ci) => {
                    const items = clases.filter((c) => c.fecha === fechaStr && c.turnoId === turno.id && (coc ? c.cocinaId === coc.id : true));
                    return (
                      <td key={`${fechaStr}_${coc ? coc.id : ci}`} className="agenda-cell">
                        {items.map((cl) => (
                          <div key={cl.id} className="agenda-item" style={{ background: colorDeClase(cl) }}>
                            {cl.salaId && <div className="agenda-sala">{nombreSala(cl.salaId)}</div>}
                            <div className="agenda-curso">{nombreCursoCompleto(cl.cursoId)}</div>
                            {cl.seccionId && <div className="agenda-seccion">Sección {nombreSeccion(cl.seccionId)}</div>}
                            <div className="agenda-docente">{nombreDocente(cl.docenteId)}</div>
                            <div className="agenda-nombreclase">{cl.nombre}</div>
                            <div className="agenda-cantidad">{cantidadAlumnos(cl.cursoId, cl.turnoId, cl.seccionId)} alumnos</div>
                          </div>
                        ))}
                      </td>
                    );
                  });
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// Inscripciones (Alumno + Curso + Sección opcional + Turno) - vista a medida
// ---------------------------------------------------------------------
function InscripcionesView({ role }) {
  const [inscripciones] = useCollection('inscripciones', null, []);
  const [alumnos] = useCollection('alumnos', null, []);
  const [carreras] = useCollection('carreras', null, []);
  const [cursos] = useCollection('cursos', null, []);
  const [secciones] = useCollection('secciones', null, []);
  const [turnos] = useCollection('turnos', null, []);
  const formVacio = { alumnoId: '', cursoId: '', seccionId: '', turnoId: '' };
  const [form, setForm] = useState(formVacio);
  const [editingId, setEditingId] = useState(null);
  const puedeEscribir = canWrite('inscripciones', role);

  const alumnoOptions = alumnos
    .slice()
    .sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''))
    .map((a) => ({ value: a.id, label: a.documento ? `${a.nombre} (${a.documento})` : a.nombre }));

  const nombreAlumno = (id) => (alumnos.find((a) => a.id === id) || {}).nombre || (id ? '(alumno no encontrado)' : '—');
  const nombreCurso = (id) => {
    if (!id) return '—';
    const curso = cursos.find((c) => c.id === id);
    if (!curso) return '⚠ Curso no encontrado';
    const carrera = carreras.find((c) => c.id === curso.carreraId);
    return carrera ? `${carrera.nombre} - ${curso.nombre}` : curso.nombre;
  };
  const nombreSeccion = (id) => {
    if (!id) return '—';
    const s = secciones.find((s) => s.id === id);
    return s ? s.nombre : '⚠ Sección no encontrada';
  };
  const nombreTurno = (id) => {
    if (!id) return '—';
    const t = turnos.find((t) => t.id === id);
    return t ? t.nombre : '⚠ Turno no encontrado';
  };
  const seccionesDelCurso = secciones.filter((s) => s.cursoId === form.cursoId);

  function empezarEdicion(insc) {
    setEditingId(insc.id);
    setForm({
      alumnoId: insc.alumnoId || '', cursoId: insc.cursoId || '',
      seccionId: insc.seccionId || '', turnoId: insc.turnoId || '',
    });
  }

  function cancelarEdicion() {
    setEditingId(null);
    setForm(formVacio);
  }

  async function guardar(e) {
    e.preventDefault();
    if (!form.alumnoId || !form.cursoId || !form.turnoId) return alert('Completá alumno, curso y turno.');
    try {
      if (editingId) {
        await db.collection('inscripciones').doc(editingId).update({
          alumnoId: form.alumnoId, cursoId: form.cursoId, seccionId: form.seccionId || '', turnoId: form.turnoId,
        });
        setEditingId(null);
      } else {
        await db.collection('inscripciones').add({ ...form, activo: true, fechaAlta: firebase.firestore.FieldValue.serverTimestamp() });
      }
      setForm(formVacio);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }

  async function toggleActivo(insc) {
    try {
      await db.collection('inscripciones').doc(insc.id).update({ activo: !insc.activo });
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }

  return (
    <div className="view">
      <h2>Inscripciones</h2>
      {puedeEscribir && (
        <form className="form form-inline" onSubmit={guardar}>
          <AutocompleteSelect
            options={alumnoOptions}
            value={form.alumnoId}
            onChange={(v) => setForm({ ...form, alumnoId: v })}
            placeholder="Buscar alumno..."
          />
          <select value={form.cursoId} onChange={(e) => setForm({ ...form, cursoId: e.target.value, seccionId: '' })}>
            <option value="">Curso...</option>
            {cursos.map((c) => <option key={c.id} value={c.id}>{nombreCurso(c.id)}</option>)}
          </select>
          {seccionesDelCurso.length > 0 && (
            <select value={form.seccionId} onChange={(e) => setForm({ ...form, seccionId: e.target.value })}>
              <option value="">Sección (opcional)...</option>
              {seccionesDelCurso.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
            </select>
          )}
          <select value={form.turnoId} onChange={(e) => setForm({ ...form, turnoId: e.target.value })}>
            <option value="">Turno...</option>
            {turnos.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
          </select>
          <button className="btn btn-primary" type="submit">{editingId ? 'Guardar cambios' : 'Inscribir'}</button>
          {editingId && <button className="btn" type="button" onClick={cancelarEdicion}>Cancelar edición</button>}
        </form>
      )}
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Alumno</th><th>Curso</th><th>Sección</th><th>Turno</th><th>Activo</th>{puedeEscribir && <th>Acciones</th>}</tr>
          </thead>
          <tbody>
            {inscripciones.map((i) => (
              <tr key={i.id} className={editingId === i.id ? 'row-editing' : ''}>
                <td>{nombreAlumno(i.alumnoId)}</td>
                <td>{nombreCurso(i.cursoId)}</td>
                <td>{nombreSeccion(i.seccionId)}</td>
                <td>{nombreTurno(i.turnoId)}</td>
                <td>{i.activo ? 'Sí' : 'No'}</td>
                {puedeEscribir && (
                  <td className="actions">
                    <button className="btn-icon" onClick={() => empezarEdicion(i)} type="button">Editar</button>
                    <button className="btn-icon" onClick={() => toggleActivo(i)} type="button">{i.activo ? 'Dar de baja' : 'Reactivar'}</button>
                  </td>
                )}
              </tr>
            ))}
            {inscripciones.length === 0 && <tr><td colSpan={6} className="empty">Sin inscripciones todavía.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// Recetas: ingredientes embebidos (patrón "catálogo con array embebido")
// ---------------------------------------------------------------------
function RecetasView({ role }) {
  const [recetas, loading] = useCollection('recetas', null, []);
  const [ingredientesCat] = useCollection('ingredientes', null, []);
  const puedeEscribir = canWrite('recetas', role);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [nombre, setNombre] = useState('');
  const [procedimiento, setProcedimiento] = useState('');
  const [items, setItems] = useState([]);

  function openNew() {
    setNombre(''); setProcedimiento(''); setItems([]); setEditing(null); setModalOpen(true);
  }
  function openEdit(r) {
    setNombre(r.nombre); setProcedimiento(r.procedimiento || ''); setItems(r.ingredientes || []); setEditing(r); setModalOpen(true);
  }
  function addIngredienteRow() { setItems([...items, { ingredienteId: '', cantidad: '' }]); }
  function updateRow(i, patch) { setItems(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it))); }
  function removeRow(i) { setItems(items.filter((_, idx) => idx !== i)); }

  async function guardar(e) {
    e.preventDefault();
    if (!nombre.trim()) return alert('Poné un nombre.');
    const ingredientesLimpios = items
      .filter((it) => it.ingredienteId && it.cantidad)
      .map((it) => {
        const cat = ingredientesCat.find((ic) => ic.id === it.ingredienteId);
        return {
          ingredienteId: it.ingredienteId,
          nombre: cat ? cat.nombre : '',
          unidad: cat ? cat.unidadMedida : '',
          cantidad: Number(it.cantidad),
        };
      });
    const data = { nombre: nombre.trim(), procedimiento, ingredientes: ingredientesLimpios };
    try {
      if (editing) await db.collection('recetas').doc(editing.id).update(data);
      else await db.collection('recetas').add({ ...data, creadoEn: firebase.firestore.FieldValue.serverTimestamp() });
      setModalOpen(false);
    } catch (err) {
      alert('Error al guardar: ' + err.message);
    }
  }

  async function eliminar(r) {
    if (!confirm(`¿Eliminar la receta "${r.nombre}"?`)) return;
    try {
      await db.collection('recetas').doc(r.id).delete();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="view">
      <div className="view-header">
        <h2>Recetas</h2>
        {puedeEscribir && <button className="btn btn-primary" onClick={openNew} type="button">+ Nueva receta</button>}
      </div>
      <div className="cards-grid">
        {recetas.map((r) => (
          <div className="card" key={r.id}>
            <h3>{r.nombre}</h3>
            <p className="muted">{(r.ingredientes || []).length} ingredientes</p>
            <ul className="mini-list">
              {(r.ingredientes || []).slice(0, 4).map((ing, i) => <li key={i}>{ing.nombre}: {ing.cantidad} {ing.unidad}</li>)}
              {(r.ingredientes || []).length > 4 && <li>...</li>}
            </ul>
            {puedeEscribir && (
              <div className="card-actions">
                <button className="btn-icon" onClick={() => openEdit(r)} type="button">Editar</button>
                <button className="btn-icon btn-danger" onClick={() => eliminar(r)} type="button">Borrar</button>
              </div>
            )}
          </div>
        ))}
        {recetas.length === 0 && <p className="empty">Todavía no hay recetas cargadas.</p>}
      </div>

      {modalOpen && (
        <Modal title={editing ? 'Editar receta' : 'Nueva receta'} onClose={() => setModalOpen(false)} wide>
          <form onSubmit={guardar} className="form">
            <label>Nombre<input value={nombre} onChange={(e) => setNombre(e.target.value)} required /></label>
            <label>Procedimiento<textarea value={procedimiento} onChange={(e) => setProcedimiento(e.target.value)} rows={4} /></label>
            <div className="ingredientes-editor">
              <div className="view-header">
                <strong>Ingredientes</strong>
                <button type="button" className="btn" onClick={addIngredienteRow}>+ Agregar ingrediente</button>
              </div>
              {items.map((it, i) => (
                <div className="ingrediente-row" key={i}>
                  <select value={it.ingredienteId} onChange={(e) => updateRow(i, { ingredienteId: e.target.value })}>
                    <option value="">Elegir ingrediente...</option>
                    {ingredientesCat.map((ic) => <option key={ic.id} value={ic.id}>{ic.nombre} ({ic.unidadMedida})</option>)}
                  </select>
                  <input type="number" min="0" step="0.0001" placeholder="Cantidad por ejecución" value={it.cantidad} onChange={(e) => updateRow(i, { cantidad: e.target.value })} />
                  <button type="button" className="btn-icon btn-danger" onClick={() => removeRow(i)}>Quitar</button>
                </div>
              ))}
              {items.length === 0 && <p className="muted">Agregá los ingredientes que necesita esta receta (cantidad por cada vez que un grupo la prepara, hasta 4 decimales).</p>}
            </div>
            <div className="form-actions">
              <button type="button" className="btn" onClick={() => setModalOpen(false)}>Cancelar</button>
              <button type="submit" className="btn btn-primary">Guardar</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------
// Planificación semanal: por Clase (la Clase ya tiene su propia fecha),
// cuántos Grupos hay y qué Receta prepara cada uno. Acá nace el dato que
// arma la lista de compras. ID de documento = claseId.
// ---------------------------------------------------------------------
function PlanificacionView({ usuario, role }) {
  const [clases] = useCollection('clases', null, []);
  const [recetas] = useCollection('recetas', null, []);
  const [claseId, setClaseId] = useState('');
  const [grupos, setGrupos] = useState([]);
  const [cargando, setCargando] = useState(false);

  const clasesVisibles = (role === ROLES.DOCENTE ? clases.filter((c) => c.docenteId === usuario.docenteId) : clases)
    .slice()
    .sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''));

  useEffect(() => {
    if (!claseId) { setGrupos([]); return; }
    setCargando(true);
    db.collection('planificaciones').doc(claseId).get().then((snap) => {
      setGrupos(snap.exists ? snap.data().grupos || [] : []);
      setCargando(false);
    });
  }, [claseId]);

  function addGrupo() { setGrupos([...grupos, { numero: grupos.length + 1, recetaId: '' }]); }
  function updateGrupo(i, recetaId) { setGrupos(grupos.map((g, idx) => (idx === i ? { ...g, recetaId } : g))); }
  function removeGrupo(i) { setGrupos(grupos.filter((_, idx) => idx !== i).map((g, idx) => ({ ...g, numero: idx + 1 }))); }

  async function guardar() {
    if (!claseId) return alert('Elegí una clase.');
    const clase = clases.find((c) => c.id === claseId);
    const gruposLimpios = grupos.filter((g) => g.recetaId);
    const semanaId = clase.fecha ? inputWeekFromDate(clase.fecha) : null;
    try {
      await db.collection('planificaciones').doc(claseId).set({
        claseId, semanaId, docenteId: clase.docenteId, cursoId: clase.cursoId, fecha: clase.fecha || null,
        grupos: gruposLimpios,
        actualizadoEn: firebase.firestore.FieldValue.serverTimestamp(),
      });
      alert('Planificación guardada.');
    } catch (err) {
      alert('Error al guardar: ' + err.message);
    }
  }

  return (
    <div className="view">
      <h2>Planificación semanal</h2>
      <p className="muted">Elegí una clase (ya con su fecha propia) y definí cuántos grupos hay y qué receta prepara cada uno. De acá sale la lista de compras.</p>
      <div className="filters">
        <label>Clase
          <select value={claseId} onChange={(e) => setClaseId(e.target.value)}>
            <option value="">Elegir clase...</option>
            {clasesVisibles.map((c) => <option key={c.id} value={c.id}>{c.fecha ? `${c.fecha} — ` : ''}{c.nombre}</option>)}
          </select>
        </label>
      </div>

      {claseId && !cargando && (
        <div className="grupos-editor">
          <div className="view-header"><strong>Grupos</strong><button className="btn" onClick={addGrupo} type="button">+ Agregar grupo</button></div>
          {grupos.map((g, i) => (
            <div className="grupo-row" key={i}>
              <span className="grupo-num">Grupo {g.numero}</span>
              <select value={g.recetaId} onChange={(e) => updateGrupo(i, e.target.value)}>
                <option value="">Elegir receta...</option>
                {recetas.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
              </select>
              <button className="btn-icon btn-danger" onClick={() => removeGrupo(i)} type="button">Quitar</button>
            </div>
          ))}
          {grupos.length === 0 && <p className="muted">Todavía no hay grupos para esta clase.</p>}
          <button className="btn btn-primary" onClick={guardar} type="button">Guardar planificación</button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------
// Lista de compras semanal: agrega ingredientes de todas las
// planificaciones de la semana (semanaId se calcula solo, a partir de la
// fecha de cada Clase). Se genera/regenera a demanda (no hay Cloud
// Functions), y se guarda como snapshot en listasCompra/{semanaId}.
// Incluye vista imprimible (con logo) para llevar en papel a compras.
// ---------------------------------------------------------------------
function ComprasView({ role }) {
  const logo = useBranding();
  const [semana, setSemana] = useState(() => inputWeekFromDate(toISODate(new Date())));
  const [lista, setLista] = useState(null);
  const [generando, setGenerando] = useState(false);
  const puedeGenerar = role === ROLES.ADMIN;

  useEffect(() => {
    if (!semana) return;
    const unsub = db.collection('listasCompra').doc(semana).onSnapshot((snap) => {
      setLista(snap.exists ? snap.data() : null);
    });
    return unsub;
  }, [semana]);

  async function generar() {
    setGenerando(true);
    try {
      const planSnap = await db.collection('planificaciones').where('semanaId', '==', semana).get();
      const conteoRecetas = {};
      planSnap.forEach((doc) => {
        (doc.data().grupos || []).forEach((g) => {
          if (!g.recetaId) return;
          conteoRecetas[g.recetaId] = (conteoRecetas[g.recetaId] || 0) + 1;
        });
      });
      const recetaIds = Object.keys(conteoRecetas);

      if (recetaIds.length === 0) {
        await db.collection('listasCompra').doc(semana).set({
          semanaId: semana, fechaGeneracion: firebase.firestore.FieldValue.serverTimestamp(), detalle: [],
        });
        setGenerando(false);
        return;
      }

      // Firestore 'in' soporta hasta 30 valores por consulta -> se piden de a tandas.
      const recetasDocs = [];
      for (let i = 0; i < recetaIds.length; i += 30) {
        const tanda = recetaIds.slice(i, i + 30);
        const snap = await db.collection('recetas').where(firebase.firestore.FieldPath.documentId(), 'in', tanda).get();
        snap.forEach((d) => recetasDocs.push({ id: d.id, ...d.data() }));
      }

      const totales = {};
      recetasDocs.forEach((receta) => {
        const veces = conteoRecetas[receta.id] || 0;
        (receta.ingredientes || []).forEach((ing) => {
          if (!totales[ing.ingredienteId]) totales[ing.ingredienteId] = { nombre: ing.nombre, unidad: ing.unidad, cantidadTotal: 0 };
          totales[ing.ingredienteId].cantidadTotal += (Number(ing.cantidad) || 0) * veces;
        });
      });

      const detalle = Object.entries(totales)
        .map(([ingredienteId, v]) => ({ ingredienteId, ...v }))
        .sort((a, b) => a.nombre.localeCompare(b.nombre));

      await db.collection('listasCompra').doc(semana).set({
        semanaId: semana, fechaGeneracion: firebase.firestore.FieldValue.serverTimestamp(), detalle,
      });
    } catch (err) {
      alert('Error al generar la lista: ' + err.message);
    }
    setGenerando(false);
  }

  function exportarExcel() {
    if (!lista || !lista.detalle || lista.detalle.length === 0) return;
    const rows = lista.detalle.map((d) => ({ Ingrediente: d.nombre, 'Cantidad total': d.cantidadTotal, Unidad: d.unidad }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Lista de compras');
    XLSX.writeFile(wb, `lista-compras-${semana}.xlsx`);
  }

  return (
    <div className="view">
      <div className="print-header">
        {logo && <img src={logo} alt="IGA" />}
        <div>
          <h2>Lista de compras — Semana {semana}</h2>
          <p className="muted">Instituto Gastronómico de las Américas</p>
        </div>
      </div>

      <h2 className="no-print">Lista de compras semanal</h2>
      <div className="filters no-print">
        <label>Semana<input type="week" value={semana} onChange={(e) => setSemana(e.target.value)} /></label>
        {puedeGenerar && (
          <button className="btn btn-primary" onClick={generar} disabled={generando} type="button">
            {generando ? 'Generando...' : 'Generar / Regenerar lista'}
          </button>
        )}
        {lista && lista.detalle && lista.detalle.length > 0 && (
          <React.Fragment>
            <button className="btn" onClick={exportarExcel} type="button">Exportar a Excel</button>
            <button className="btn" onClick={() => window.print()} type="button">Imprimir</button>
          </React.Fragment>
        )}
      </div>

      {!lista && <p className="empty">Todavía no se generó la lista de esta semana.</p>}
      {lista && (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Ingrediente</th><th>Cantidad total</th><th>Unidad</th></tr></thead>
            <tbody>
              {(lista.detalle || []).map((d) => (
                <tr key={d.ingredienteId}><td>{d.nombre}</td><td>{d.cantidadTotal}</td><td>{d.unidad}</td></tr>
              ))}
              {(lista.detalle || []).length === 0 && <tr><td colSpan={3} className="empty">No hay planificación cargada para esta semana.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------
// Asistencia (transaccional: se corrige con un registro nuevo, no se
// borra). ID predecible `${claseId}_${alumnoId}` (la Clase ya tiene su
// propia fecha, no hace falta agregarla al id).
// ---------------------------------------------------------------------
function AsistenciaView({ usuario, role }) {
  const [clases] = useCollection('clases', null, []);
  const [claseId, setClaseId] = useState('');
  const [alumnosClase, setAlumnosClase] = useState([]);
  const [presentes, setPresentes] = useState({});
  const [misAsistencias] = useCollection(
    'asistencias',
    (ref) => (role === ROLES.ALUMNO && usuario.alumnoId ? ref.where('alumnoId', '==', usuario.alumnoId) : ref.where('alumnoId', '==', '__none__')),
    [role, usuario.alumnoId]
  );

  const clasesVisibles = (role === ROLES.DOCENTE ? clases.filter((c) => c.docenteId === usuario.docenteId) : clases)
    .slice()
    .sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''));

  useEffect(() => {
    if (role === ROLES.ALUMNO) return;
    if (!claseId) { setAlumnosClase([]); return; }
    const clase = clases.find((c) => c.id === claseId);
    if (!clase) return;
    // Si la Clase tiene Sección asignada, solo entran los alumnos
    // inscriptos en esa Sección; si no tiene (clase vieja o Curso sin
    // secciones), entran todos los del Curso+Turno como antes.
    let query = db.collection('inscripciones')
      .where('cursoId', '==', clase.cursoId).where('turnoId', '==', clase.turnoId).where('activo', '==', true);
    if (clase.seccionId) query = query.where('seccionId', '==', clase.seccionId);
    query
      .get()
      .then((snap) => {
        const insc = snap.docs.map((d) => d.data());
        Promise.all(insc.map((i) => db.collection('alumnos').doc(i.alumnoId).get())).then((alSnaps) => {
          const list = alSnaps.filter((s) => s.exists).map((s) => ({ id: s.id, ...s.data() }));
          setAlumnosClase(list);
          db.collection('asistencias').where('claseId', '==', claseId).get().then((asnap) => {
            const p = {};
            asnap.forEach((d) => { p[d.data().alumnoId] = d.data().presente; });
            setPresentes(p);
          });
        });
      });
  }, [claseId, clases, role]);

  async function guardarAsistencia() {
    const clase = clases.find((c) => c.id === claseId);
    if (!clase) return;
    const fecha = clase.fecha;
    const semanaId = fecha ? inputWeekFromDate(fecha) : null;
    try {
      await Promise.all(alumnosClase.map((al) => {
        const id = `${claseId}_${al.id}`;
        return db.collection('asistencias').doc(id).set({
          claseId, docenteId: clase.docenteId, alumnoId: al.id, fecha, semanaId,
          presente: !!presentes[al.id],
        });
      }));
      alert('Asistencia guardada.');
    } catch (err) {
      alert('Error al guardar: ' + err.message);
    }
  }

  if (role === ROLES.ALUMNO) {
    return (
      <div className="view">
        <h2>Mi asistencia</h2>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Fecha</th><th>Presente</th></tr></thead>
            <tbody>
              {misAsistencias.map((a) => <tr key={a.id}><td>{a.fecha}</td><td>{a.presente ? 'Sí' : 'No'}</td></tr>)}
              {misAsistencias.length === 0 && <tr><td colSpan={2} className="empty">Sin registros todavía.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="view">
      <h2>Asistencia</h2>
      <div className="filters">
        <label>Clase
          <select value={claseId} onChange={(e) => setClaseId(e.target.value)}>
            <option value="">Elegir clase...</option>
            {clasesVisibles.map((c) => <option key={c.id} value={c.id}>{c.fecha ? `${c.fecha} — ` : ''}{c.nombre}</option>)}
          </select>
        </label>
      </div>
      {claseId && (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Alumno</th><th>Presente</th></tr></thead>
            <tbody>
              {alumnosClase.map((al) => (
                <tr key={al.id}>
                  <td>{al.nombre}</td>
                  <td><input type="checkbox" checked={!!presentes[al.id]} onChange={(e) => setPresentes({ ...presentes, [al.id]: e.target.checked })} /></td>
                </tr>
              ))}
              {alumnosClase.length === 0 && <tr><td colSpan={2} className="empty">No hay alumnos inscriptos en este curso/turno.</td></tr>}
            </tbody>
          </table>
          {alumnosClase.length > 0 && <button className="btn btn-primary" onClick={guardarAsistencia} type="button">Guardar asistencia</button>}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------
// Notas / calificaciones (transaccional: cada evaluación es un registro
// nuevo, se acumula historial en vez de sobrescribir).
// ---------------------------------------------------------------------
function NotasView({ usuario, role }) {
  const [clases] = useCollection('clases', null, []);
  const [claseId, setClaseId] = useState('');
  const [alumnosClase, setAlumnosClase] = useState([]);
  const [notasClase, setNotasClase] = useState([]);
  const [tipoEvaluacion, setTipoEvaluacion] = useState('');
  const [valores, setValores] = useState({});
  const [misNotas] = useCollection(
    'notas',
    (ref) => (role === ROLES.ALUMNO && usuario.alumnoId ? ref.where('alumnoId', '==', usuario.alumnoId) : ref.where('alumnoId', '==', '__none__')),
    [role, usuario.alumnoId]
  );

  const clasesVisibles = (role === ROLES.DOCENTE ? clases.filter((c) => c.docenteId === usuario.docenteId) : clases)
    .slice()
    .sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''));

  useEffect(() => {
    if (role === ROLES.ALUMNO || !claseId) { setAlumnosClase([]); return; }
    const clase = clases.find((c) => c.id === claseId);
    if (!clase) return;
    let query = db.collection('inscripciones')
      .where('cursoId', '==', clase.cursoId).where('turnoId', '==', clase.turnoId).where('activo', '==', true);
    if (clase.seccionId) query = query.where('seccionId', '==', clase.seccionId);
    query
      .get()
      .then((snap) => {
        const insc = snap.docs.map((d) => d.data());
        Promise.all(insc.map((i) => db.collection('alumnos').doc(i.alumnoId).get())).then((alSnaps) => {
          setAlumnosClase(alSnaps.filter((s) => s.exists).map((s) => ({ id: s.id, ...s.data() })));
        });
      });
    const unsub = db.collection('notas').where('claseId', '==', claseId).onSnapshot((snap) => {
      setNotasClase(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [claseId, clases, role]);

  async function guardarNotas() {
    if (!tipoEvaluacion.trim()) return alert('Poné un nombre para la evaluación (ej: "Parcial 1").');
    const clase = clases.find((c) => c.id === claseId);
    const aGuardar = alumnosClase.filter((al) => valores[al.id] !== undefined && valores[al.id] !== '');
    if (aGuardar.length === 0) return alert('Cargá al menos una nota.');
    try {
      await Promise.all(aGuardar.map((al) => db.collection('notas').add({
        claseId, docenteId: clase.docenteId, alumnoId: al.id,
        tipoEvaluacion: tipoEvaluacion.trim(), valor: Number(valores[al.id]),
        fecha: new Date().toISOString().slice(0, 10),
      })));
      setValores({});
      setTipoEvaluacion('');
      alert('Notas guardadas.');
    } catch (err) {
      alert('Error al guardar: ' + err.message);
    }
  }

  if (role === ROLES.ALUMNO) {
    return (
      <div className="view">
        <h2>Mis notas</h2>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Evaluación</th><th>Nota</th><th>Fecha</th></tr></thead>
            <tbody>
              {misNotas.map((n) => <tr key={n.id}><td>{n.tipoEvaluacion}</td><td>{n.valor}</td><td>{n.fecha}</td></tr>)}
              {misNotas.length === 0 && <tr><td colSpan={3} className="empty">Sin notas cargadas todavía.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="view">
      <h2>Notas</h2>
      <div className="filters">
        <label>Clase
          <select value={claseId} onChange={(e) => setClaseId(e.target.value)}>
            <option value="">Elegir clase...</option>
            {clasesVisibles.map((c) => <option key={c.id} value={c.id}>{c.fecha ? `${c.fecha} — ` : ''}{c.nombre}</option>)}
          </select>
        </label>
      </div>
      {claseId && (
        <React.Fragment>
          <div className="filters">
            <label>Evaluación<input value={tipoEvaluacion} onChange={(e) => setTipoEvaluacion(e.target.value)} placeholder="Ej: Parcial 1" /></label>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Alumno</th><th>Nota</th></tr></thead>
              <tbody>
                {alumnosClase.map((al) => (
                  <tr key={al.id}>
                    <td>{al.nombre}</td>
                    <td><input type="number" min="0" max="10" step="0.1" value={valores[al.id] || ''} onChange={(e) => setValores({ ...valores, [al.id]: e.target.value })} /></td>
                  </tr>
                ))}
                {alumnosClase.length === 0 && <tr><td colSpan={2} className="empty">No hay alumnos inscriptos en este curso/turno.</td></tr>}
              </tbody>
            </table>
            {alumnosClase.length > 0 && <button className="btn btn-primary" onClick={guardarNotas} type="button">Guardar notas</button>}
          </div>
          <h3>Historial de esta clase</h3>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Alumno</th><th>Evaluación</th><th>Nota</th><th>Fecha</th></tr></thead>
              <tbody>
                {notasClase.map((n) => {
                  const al = alumnosClase.find((a) => a.id === n.alumnoId);
                  return <tr key={n.id}><td>{al ? al.nombre : n.alumnoId}</td><td>{n.tipoEvaluacion}</td><td>{n.valor}</td><td>{n.fecha}</td></tr>;
                })}
                {notasClase.length === 0 && <tr><td colSpan={4} className="empty">Sin evaluaciones cargadas.</td></tr>}
              </tbody>
            </table>
          </div>
        </React.Fragment>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------
// Usuarios (solo admin): alta de cuentas de login sin cerrar la sesión
// del Admin, usando una segunda instancia de Firebase ("Secondary").
// ---------------------------------------------------------------------
function UsuariosView() {
  const [usuarios] = useCollection('usuarios', null, []);
  const [docentes] = useCollection('docentes', null, []);
  const [alumnos] = useCollection('alumnos', null, []);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ nombre: '', email: '', password: '', rol: ROLES.DOCENTE, docenteId: '', alumnoId: '' });
  const [creando, setCreando] = useState(false);

  const alumnoOptions = alumnos
    .slice()
    .sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''))
    .map((a) => ({ value: a.id, label: a.documento ? `${a.nombre} (${a.documento})` : a.nombre }));

  async function crearUsuario(e) {
    e.preventDefault();
    setCreando(true);
    const secondary = firebase.apps.find((a) => a.name === 'Secondary') || firebase.initializeApp(firebaseConfig, 'Secondary');
    try {
      const cred = await secondary.auth().createUserWithEmailAndPassword(form.email, form.password);
      const uid = cred.user.uid;
      await db.collection('usuarios').doc(uid).set({
        nombre: form.nombre, email: form.email, rol: form.rol, activo: true,
        docenteId: form.rol === ROLES.DOCENTE ? form.docenteId : null,
        alumnoId: form.rol === ROLES.ALUMNO ? form.alumnoId : null,
        creadoEn: firebase.firestore.FieldValue.serverTimestamp(),
      });
      await secondary.auth().signOut();
      setModalOpen(false);
      setForm({ nombre: '', email: '', password: '', rol: ROLES.DOCENTE, docenteId: '', alumnoId: '' });
    } catch (err) {
      alert('Error al crear usuario: ' + err.message);
    }
    setCreando(false);
  }

  async function toggleActivo(u) {
    try {
      await db.collection('usuarios').doc(u.id).update({ activo: !u.activo });
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }

  return (
    <div className="view">
      <div className="view-header">
        <h2>Usuarios</h2>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)} type="button">+ Nuevo usuario</button>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Activo</th><th>Acciones</th></tr></thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td>{u.nombre}</td><td>{u.email}</td><td>{ROLE_LABELS[u.rol] || u.rol}</td><td>{u.activo ? 'Sí' : 'No'}</td>
                <td><button className="btn-icon" onClick={() => toggleActivo(u)} type="button">{u.activo ? 'Desactivar' : 'Activar'}</button></td>
              </tr>
            ))}
            {usuarios.length === 0 && <tr><td colSpan={5} className="empty">Sin usuarios todavía (además de este Admin).</td></tr>}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <Modal title="Nuevo usuario" onClose={() => setModalOpen(false)}>
          <form onSubmit={crearUsuario} className="form">
            <label>Nombre<input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required /></label>
            <label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label>
            <label>Contraseña inicial<input type="password" minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></label>
            <label>Rol
              <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}>
                <option value={ROLES.ADMIN}>Administrativo</option>
                <option value={ROLES.DOCENTE}>Docente</option>
                <option value={ROLES.ALUMNO}>Alumno</option>
                <option value={ROLES.COMPRAS}>Compras</option>
              </select>
            </label>
            {form.rol === ROLES.DOCENTE && (
              <label>Ficha de docente vinculada
                <select value={form.docenteId} onChange={(e) => setForm({ ...form, docenteId: e.target.value })}>
                  <option value="">Elegir...</option>
                  {docentes.map((d) => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                </select>
              </label>
            )}
            {form.rol === ROLES.ALUMNO && (
              <label>Ficha de alumno vinculada
                <AutocompleteSelect
                  options={alumnoOptions}
                  value={form.alumnoId}
                  onChange={(v) => setForm({ ...form, alumnoId: v })}
                  placeholder="Buscar alumno..."
                />
              </label>
            )}
            <div className="form-actions">
              <button type="button" className="btn" onClick={() => setModalOpen(false)}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={creando}>{creando ? 'Creando...' : 'Crear usuario'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------
// Configuración: logo del instituto (config/branding). Se guarda como
// base64 en Firestore, redimensionado por canvas en el navegador (sin
// Firebase Storage). Se usa en login, sidebar, y encabezado imprimible.
// ---------------------------------------------------------------------
function ConfiguracionView() {
  const logo = useBranding();
  const [subiendo, setSubiendo] = useState(false);

  async function onFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Elegí un archivo de imagen (PNG, JPG, etc).'); return; }
    setSubiendo(true);
    try {
      const base64 = await resizeImageToBase64(file, 500);
      await db.collection('config').doc('branding').set({
        logoBase64: base64, actualizadoEn: firebase.firestore.FieldValue.serverTimestamp(),
      });
    } catch (err) {
      alert('Error al subir el logo: ' + err.message);
    }
    setSubiendo(false);
    e.target.value = '';
  }

  async function quitarLogo() {
    if (!confirm('¿Quitar el logo actual?')) return;
    try {
      await db.collection('config').doc('branding').set({ logoBase64: null });
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }

  return (
    <div className="view">
      <h2>Configuración</h2>
      <div className="card branding-card">
        <h3>Logo del instituto</h3>
        <p className="muted">Se usa en el login, el menú lateral, y en el encabezado de la lista de compras cuando se imprime — así queda listo para presentaciones e impresiones sin tener que pegarlo a mano cada vez.</p>
        {logo && <img src={logo} alt="Logo IGA" className="branding-preview" />}
        <input type="file" accept="image/*" onChange={onFileChange} disabled={subiendo} />
        {subiendo && <p className="muted">Subiendo...</p>}
        {logo && <button className="btn" onClick={quitarLogo} type="button">Quitar logo</button>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------
function DashboardView({ usuario }) {
  const [carreras] = useCollection('carreras', null, []);
  const [alumnos] = useCollection('alumnos', null, []);
  const [clases] = useCollection('clases', null, []);
  return (
    <div className="view">
      <h2>Hola, {(usuario.nombre || '').split(' ')[0] || usuario.email}</h2>
      <p className="muted">{ROLE_LABELS[usuario.rol]} · Instituto Gastronómico de las Américas</p>
      {usuario.rol === ROLES.ADMIN && (
        <div className="cards-grid">
          <div className="card stat"><div className="stat-num">{carreras.length}</div><div>Carreras</div></div>
          <div className="card stat"><div className="stat-num">{alumnos.length}</div><div>Alumnos</div></div>
          <div className="card stat"><div className="stat-num">{clases.length}</div><div>Clases</div></div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------
function LoginScreen() {
  const logo = useBranding();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  async function entrar(e) {
    e.preventDefault();
    setError(''); setCargando(true);
    try {
      await auth.signInWithEmailAndPassword(email, password);
    } catch (err) {
      setError('No se pudo iniciar sesión: ' + err.message);
    }
    setCargando(false);
  }

  async function recuperar() {
    if (!email) { setError('Escribí tu email arriba primero.'); return; }
    try {
      await auth.sendPasswordResetEmail(email);
      alert('Te enviamos un mail para restablecer la contraseña.');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={entrar}>
        {logo ? <img src={logo} alt="IGA" className="login-logo" /> : <h1>IGA</h1>}
        <p className="muted">Administración de Cocina</p>
        <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <label>Contraseña<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
        {error && <p className="error">{error}</p>}
        <button className="btn btn-primary" type="submit" disabled={cargando}>{cargando ? 'Ingresando...' : 'Ingresar'}</button>
        <button className="btn-link" type="button" onClick={recuperar}>Olvidé mi contraseña</button>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------
// AppShell: auth + doc de usuario + navegación (sin router)
// ---------------------------------------------------------------------
function VistaActual({ vista, usuario }) {
  const role = usuario.rol;
  switch (vista) {
    case 'dashboard': return <DashboardView usuario={usuario} />;
    case 'agenda': return <AgendaView />;
    case 'carreras': return <CarrerasView role={role} />;
    case 'cursos': return <CursosView role={role} />;
    case 'secciones': return <SeccionesView role={role} />;
    case 'turnos': return <TurnosView role={role} />;
    case 'salas': return <SalasView role={role} />;
    case 'cocinas': return <CocinasView role={role} />;
    case 'docentes': return <DocentesView role={role} />;
    case 'alumnos': return <AlumnosView role={role} />;
    case 'inscripciones': return <InscripcionesView role={role} />;
    case 'clases': return <ClasesView role={role} usuario={usuario} />;
    case 'ingredientes': return <IngredientesView role={role} />;
    case 'recetas': return <RecetasView role={role} />;
    case 'planificacion': return <PlanificacionView role={role} usuario={usuario} />;
    case 'compras': return <ComprasView role={role} />;
    case 'asistencia': return <AsistenciaView role={role} usuario={usuario} />;
    case 'notas': return <NotasView role={role} usuario={usuario} />;
    case 'usuarios': return <UsuariosView />;
    case 'configuracion': return <ConfiguracionView />;
    default: return <DashboardView usuario={usuario} />;
  }
}

function AppShell() {
  const logo = useBranding();
  const [authUser, setAuthUser] = useState(undefined);
  const [usuario, setUsuario] = useState(null);
  const [vista, setVista] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => setAuthUser(u));
    return unsub;
  }, []);

  useEffect(() => {
    if (!authUser) { setUsuario(null); return; }
    const unsub = db.collection('usuarios').doc(authUser.uid).onSnapshot((snap) => {
      setUsuario(snap.exists ? { id: snap.id, ...snap.data() } : null);
    });
    return unsub;
  }, [authUser]);

  if (authUser === undefined) return <LoadingSpinner full />;
  if (!authUser) return <LoginScreen />;

  if (!usuario) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <p>Tu cuenta todavía no tiene un rol asignado. Pedile a un administrativo que te dé de alta en "Usuarios".</p>
          <button className="btn" onClick={() => auth.signOut()} type="button">Salir</button>
        </div>
      </div>
    );
  }
  if (!usuario.activo) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <p>Tu cuenta está desactivada.</p>
          <button className="btn" onClick={() => auth.signOut()} type="button">Salir</button>
        </div>
      </div>
    );
  }

  const items = getNavItemsForRole(usuario.rol);

  return (
    <div className={`app-shell ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
      <button
        className="sidebar-toggle no-print"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        type="button"
        title={sidebarOpen ? 'Ocultar menú' : 'Mostrar menú'}
      >
        {sidebarOpen ? '‹' : '›'}
      </button>
      <aside className="sidebar">
        <div className="sidebar-brand">
          {logo ? <img src={logo} alt="IGA" className="sidebar-logo" /> : 'IGA'}
        </div>
        <nav>
          {items.map((item) => (
            <button key={item.key} className={`nav-item ${vista === item.key ? 'active' : ''}`} onClick={() => setVista(item.key)} type="button">
              {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div>{usuario.nombre}</div>
          <div className="muted">{ROLE_LABELS[usuario.rol]}</div>
          <button className="btn-link" onClick={() => auth.signOut()} type="button">Cerrar sesión</button>
          <div className="version">v{APP_VERSION}</div>
        </div>
      </aside>
      <main className="content">
        <VistaActual vista={vista} usuario={usuario} />
      </main>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<AppShell />);
