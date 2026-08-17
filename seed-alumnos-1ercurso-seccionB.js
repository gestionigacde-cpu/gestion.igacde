// =====================================================================
// seed-alumnos-1ercurso-seccionB.js
// Carga masiva de 9 Alumnos + su Inscripción en Cocina - 1er Curso /
// Sección "B" / Turno "Mañana" / Año lectivo 2026, para pegar en la
// consola del navegador.
//
// Cómo usarlo:
// 1. Entrá a la app logueado como Admin.
// 2. Abrí las DevTools (F12) -> pestaña "Console".
// 3. Pegá todo este archivo y presioná Enter.
// 4. Mirá el resumen al final: Alumnos creados/salteados e Inscripciones
//    creadas/salteadas. No duplica nada: si un Alumno ya existe (mismo
//    Documento) o una Inscripción ya existe (mismo Alumno+Curso+Sección+
//    Turno+Año), se saltea.
//
// Requisitos antes de correrlo:
// - Tiene que existir la Carrera "Cocina" con un Curso "1er Curso".
// - Tiene que existir un Turno llamado exactamente "Mañana".
// - La Sección "B" de ese Curso se crea sola si todavía no existe.
//
// Reutiliza `db` y `firebase`, que ya están cargados como variables
// globales por la propia app (no hace falta nada más).
// =====================================================================

(async function () {
  const CARRERA_NOMBRE = 'Cocina';
  const CURSO_NOMBRE = '1er Curso';
  const SECCION_NOMBRE = 'B';
  const TURNO_NOMBRE = 'Mañana';
  const ANIO_LECTIVO = '2026';

  const alumnos = [
    { documento: '5.520.365', nombre: 'Cabrera, Diana Claribel' },
    { documento: '7.124.419', nombre: 'Cano Ramirez, Evany Clara' },
    { documento: '5.981.594', nombre: 'Cardenas Bogado, Liza Mabel' },
    { documento: '5.879.911', nombre: 'Estigarribia Cardozo, Violeta Nayeli' },
    { documento: '3.685.064', nombre: 'Mereles Fleitas, Cinthia Elizabeth' },
    { documento: '4.796.395', nombre: 'Miranda Aguero, Benjamin Leonardo' },
    { documento: '5.043.019', nombre: 'Ojeda Espinola, Martha' },
    { documento: '4.241.456', nombre: 'Ortiz, Ana Alejandra' },
    { documento: '5.243.027', nombre: 'Sosa Gomez, Camila Nicole' },
  ];

  const norm = (s) => (s || '').trim().toLowerCase();

  // ---------- 1. Resolver Carrera + Curso ----------
  const carrerasSnap = await db.collection('carreras').get();
  const carrera = carrerasSnap.docs.find((c) => norm(c.data().nombre) === norm(CARRERA_NOMBRE));
  if (!carrera) {
    console.error(`❌ No encontré la Carrera "${CARRERA_NOMBRE}".`);
    return;
  }

  const cursosSnap = await db.collection('cursos').get();
  const candidatos = cursosSnap.docs.filter((c) => c.data().carreraId === carrera.id && norm(c.data().nombre) === norm(CURSO_NOMBRE));
  if (candidatos.length === 0) {
    console.error(`❌ No encontré un Curso "${CURSO_NOMBRE}" dentro de "${CARRERA_NOMBRE}".`);
    return;
  }
  if (candidatos.length > 1) {
    console.error(`❌ Hay ${candidatos.length} Cursos "${CURSO_NOMBRE}" dentro de "${CARRERA_NOMBRE}". IDs:`);
    candidatos.forEach((c) => console.log(`   - ${c.id}`));
    return;
  }
  const cursoId = candidatos[0].id;
  console.log(`✅ Curso: ${CARRERA_NOMBRE} - ${CURSO_NOMBRE} (${cursoId})`);

  // ---------- 2. Resolver (o crear) la Sección ----------
  const seccionesSnap = await db.collection('secciones').where('cursoId', '==', cursoId).get();
  let seccionDoc = seccionesSnap.docs.find((d) => norm(d.data().nombre) === norm(SECCION_NOMBRE));
  let seccionId;
  if (seccionDoc) {
    seccionId = seccionDoc.id;
    console.log(`✅ Sección "${SECCION_NOMBRE}" ya existía: ${seccionId}`);
  } else {
    const ref = await db.collection('secciones').add({
      nombre: SECCION_NOMBRE, cursoId, activo: true,
      creadoEn: firebase.firestore.FieldValue.serverTimestamp(),
    });
    seccionId = ref.id;
    console.log(`✅ Sección "${SECCION_NOMBRE}" creada: ${seccionId}`);
  }

  // ---------- 3. Resolver el Turno ----------
  const turnosSnap = await db.collection('turnos').get();
  const turnoDoc = turnosSnap.docs.find((d) => norm(d.data().nombre) === norm(TURNO_NOMBRE));
  if (!turnoDoc) {
    console.error(`❌ No encontré ningún Turno llamado "${TURNO_NOMBRE}". Turnos existentes:`);
    turnosSnap.docs.forEach((d) => console.log(`   - ${d.data().nombre}`));
    return;
  }
  const turnoId = turnoDoc.id;
  console.log(`✅ Turno: ${turnoId}`);

  // ---------- 4. Alumnos: crear los que falten (sin duplicar por Documento) ----------
  const alumnosExistentesSnap = await db.collection('alumnos').get();
  const porDocumento = new Map(
    alumnosExistentesSnap.docs
      .filter((d) => d.data().documento)
      .map((d) => [norm(d.data().documento), d.id])
  );

  let alumnosCreados = 0;
  let alumnosSalteados = 0;
  const alumnoIds = [];

  for (const al of alumnos) {
    const clave = norm(al.documento);
    let id = porDocumento.get(clave);
    if (id) {
      console.log(`⏭  Alumno ya existía, salteado: ${al.nombre} (${al.documento})`);
      alumnosSalteados++;
    } else {
      const ref = await db.collection('alumnos').add({
        nombre: al.nombre, documento: al.documento, email: '', activo: true,
        creadoEn: firebase.firestore.FieldValue.serverTimestamp(),
      });
      id = ref.id;
      porDocumento.set(clave, id); // evita duplicar si la lista trae el mismo documento dos veces
      console.log(`✅ Alumno creado: ${al.nombre} (${al.documento})`);
      alumnosCreados++;
    }
    alumnoIds.push(id);
  }

  // ---------- 5. Inscripciones: Alumno + Curso + Sección + Turno + Año (sin duplicar) ----------
  const inscripcionesSnap = await db.collection('inscripciones')
    .where('cursoId', '==', cursoId).where('seccionId', '==', seccionId)
    .where('turnoId', '==', turnoId).where('anioLectivo', '==', ANIO_LECTIVO)
    .get();
  const yaInscriptos = new Set(inscripcionesSnap.docs.map((d) => d.data().alumnoId));

  let inscCreadas = 0;
  let inscSalteadas = 0;

  for (const alumnoId of alumnoIds) {
    if (yaInscriptos.has(alumnoId)) {
      inscSalteadas++;
      continue;
    }
    await db.collection('inscripciones').add({
      alumnoId, cursoId, seccionId, turnoId, anioLectivo: ANIO_LECTIVO, activo: true,
      fechaAlta: firebase.firestore.FieldValue.serverTimestamp(),
    });
    yaInscriptos.add(alumnoId);
    inscCreadas++;
  }

  console.log(`Listo. Alumnos creados: ${alumnosCreados} — salteados (ya existían): ${alumnosSalteados}.`);
  console.log(`Inscripciones creadas: ${inscCreadas} — salteadas (ya existían): ${inscSalteadas}.`);
})();
