// =====================================================================
// fix-cursoid-inscripciones.js
// Repara el Curso "roto" que quedó en las Secciones/Inscripciones creadas
// por seed-alumnos-1ercurso-seccionA.js: el ID que le pasé al script
// (CURSO_ID_MANUAL) no coincidía con el ID real de "Cocina - 1er Curso",
// así que esos registros quedaron apuntando a un Curso que no existe (por
// eso la columna "Curso" mostraba el ID en crudo en vez del nombre).
//
// Este script busca el Curso correcto por nombre ("1er Curso" dentro de
// la Carrera "Cocina") y reasigna el cursoId de la Sección "A" y de todas
// las Inscripciones que quedaron con el ID viejo/roto.
//
// Cómo usarlo:
// 1. Entrá a la app logueado como Admin.
// 2. Abrí las DevTools (F12) -> pestaña "Console".
// 3. Pegá todo este archivo y presioná Enter.
// 4. Mirá el resumen al final.
//
// Reutiliza `db`, que ya está cargado como variable global por la app.
// =====================================================================

(async function () {
  const CURSO_ID_ROTO = '16zPXBZ1JmCP4ubBa2Ex'; // el que quedó mal cargado
  const CARRERA_NOMBRE = 'Cocina';
  const CURSO_NOMBRE = '1er Curso';

  const norm = (s) => (s || '').trim().toLowerCase();

  // ---------- 1. Encontrar el Curso correcto ----------
  const carrerasSnap = await db.collection('carreras').get();
  const carrera = carrerasSnap.docs.find((c) => norm(c.data().nombre) === norm(CARRERA_NOMBRE));
  if (!carrera) {
    console.error(`❌ No encontré la Carrera "${CARRERA_NOMBRE}".`);
    return;
  }

  const cursosSnap = await db.collection('cursos').get();
  const cursosDeLaCarrera = cursosSnap.docs.filter((c) => c.data().carreraId === carrera.id && norm(c.data().nombre) === norm(CURSO_NOMBRE));
  if (cursosDeLaCarrera.length === 0) {
    console.error(`❌ No encontré un Curso "${CURSO_NOMBRE}" dentro de "${CARRERA_NOMBRE}".`);
    return;
  }
  if (cursosDeLaCarrera.length > 1) {
    console.error(`❌ Hay ${cursosDeLaCarrera.length} Cursos "${CURSO_NOMBRE}" dentro de "${CARRERA_NOMBRE}". IDs:`);
    cursosDeLaCarrera.forEach((c) => console.log(`   - ${c.id}`));
    return;
  }
  const cursoCorrectoId = cursosDeLaCarrera[0].id;

  if (cursoCorrectoId === CURSO_ID_ROTO) {
    console.log('✅ El Curso ya está bien asignado, no hay nada para corregir.');
    return;
  }
  console.log(`Curso roto: ${CURSO_ID_ROTO}  →  Curso correcto: ${cursoCorrectoId}`);

  // ---------- 2. Corregir la Sección "A" ----------
  const seccionesSnap = await db.collection('secciones').where('cursoId', '==', CURSO_ID_ROTO).get();
  let seccionesCorregidas = 0;
  for (const doc of seccionesSnap.docs) {
    await doc.ref.update({ cursoId: cursoCorrectoId });
    console.log(`✅ Sección "${doc.data().nombre}" corregida.`);
    seccionesCorregidas++;
  }

  // ---------- 3. Corregir las Inscripciones ----------
  const inscripcionesSnap = await db.collection('inscripciones').where('cursoId', '==', CURSO_ID_ROTO).get();
  let inscripcionesCorregidas = 0;
  for (const doc of inscripcionesSnap.docs) {
    await doc.ref.update({ cursoId: cursoCorrectoId });
    inscripcionesCorregidas++;
  }

  console.log(`Listo. Secciones corregidas: ${seccionesCorregidas} — Inscripciones corregidas: ${inscripcionesCorregidas}.`);
})();
