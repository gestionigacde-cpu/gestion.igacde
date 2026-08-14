// =====================================================================
// seed-alumnos-1ercurso-seccionA.js
// Carga masiva de 18 Alumnos + su Inscripción en "1er Curso" / Sección "A"
// / Turno "Mañana", para pegar en la consola del navegador.
//
// Cómo usarlo:
// 1. Entrá a la app logueado como Admin.
// 2. Abrí las DevTools (F12) -> pestaña "Console".
// 3. Pegá todo este archivo y presioná Enter.
// 4. Mirá el resumen al final: Alumnos creados/salteados e Inscripciones
//    creadas/salteadas. No duplica nada: si un Alumno ya existe (mismo
//    Documento) o una Inscripción ya existe (mismo Alumno+Curso+Sección+
//    Turno), se saltea.
//
// Requisitos antes de correrlo:
// - Tiene que existir un Curso con nombre exactamente "1er Curso" (si hay
//   más de una Carrera con un Curso "1er Curso", el script para y te pide
//   que aclares cuál, ver CURSO_ID_MANUAL más abajo).
// - Tiene que existir un Turno con nombre exactamente "Mañana".
// - La Sección "A" de ese Curso se crea sola si todavía no existe.
//
// Reutiliza `db` y `firebase`, que ya están cargados como variables
// globales por la propia app (no hace falta nada más).
// =====================================================================

(async function () {
  const CURSO_NOMBRE = '1er Curso';
  const SECCION_NOMBRE = 'A';
  const TURNO_NOMBRE = 'Mañana';

  // Si el script te dice que hay más de un Curso "1er Curso" (uno por
  // Carrera, ej. Pastelería y Cocina), pegá acá el ID exacto del que
  // corresponde y volvé a correr el script.
  const CURSO_ID_MANUAL = '16zPXBZ1JmCP4ubBa2Ex'; // 1er Curso — Cocina

  const alumnos = [
    { documento: '4.379.432', nombre: 'Almiron Liedtke, Maria Luana' },
    { documento: '4.650.119', nombre: 'Ayala Alcaraz, Silvia Carmela' },
    { documento: '80.082.137.951', nombre: 'Baez Miah, Ruhani Arami' },
    { documento: '5.980.156', nombre: 'Barreto Gonzalez, Valeria Agustina' },
    { documento: '6.147.119', nombre: 'Caniza Aquino, Gilberto Rafael' },
    { documento: '6.183.545', nombre: 'Cantero Piñanez, Marlyn Vanina' },
    { documento: '6.110.765', nombre: 'Colman Ruiz Diaz, Claudia Magdalena' },
    { documento: '8.126.326', nombre: 'Delgado Florentin, Gloria Camila' },
    { documento: '7.180.545', nombre: 'Espinola Martinez, Jose Julian' },
    { documento: '6.665.900', nombre: 'Fernandez, Cecilia Beatriz' },
    { documento: '6.290.855', nombre: 'Gonzalez Carballo, Jonathan Nahuel' },
    { documento: '1.087.997.000', nombre: 'Ramirez Carvajal, Sebastian' },
    { documento: '6.062.815', nombre: 'Rodriguez Berlt, Helen Jisel' },
    { documento: '3.519.866', nombre: 'Valdovinos Sarubbi, Juan Manuel Laviero' },
    { documento: '6.085.664', nombre: 'Cardozo Peralta, Angel Jesus' },
    { documento: '6.163.879', nombre: 'Servian Valenzuela, Liz Abigail' },
    { documento: '3.889.967', nombre: 'Neves Velazquez, Andrea Gabriela' },
    { documento: '6.156.834', nombre: 'Fariña Neves, Alejandro Ulises' },
  ];

  const norm = (s) => (s || '').trim().toLowerCase();

  // ---------- 1. Resolver el Curso ----------
  let cursoId = CURSO_ID_MANUAL;
  if (!cursoId) {
    const cursosSnap = await db.collection('cursos').get();
    const candidatos = cursosSnap.docs.filter((d) => norm(d.data().nombre) === norm(CURSO_NOMBRE));
    if (candidatos.length === 0) {
      console.error(`❌ No encontré ningún Curso llamado "${CURSO_NOMBRE}". Cargalo primero en "Cursos" y volvé a correr el script.`);
      return;
    }
    if (candidatos.length > 1) {
      const carrerasSnap = await db.collection('carreras').get();
      const nombreCarrera = (id) => (carrerasSnap.docs.find((c) => c.id === id) || { data: () => ({}) }).data().nombre || id;
      console.error(`❌ Hay ${candidatos.length} Cursos llamados "${CURSO_NOMBRE}" (uno por Carrera). Elegí el correcto y pegá su ID en CURSO_ID_MANUAL al principio del script:`);
      candidatos.forEach((c) => console.log(`   - ID: ${c.id} — Carrera: ${nombreCarrera(c.data().carreraId)}`));
      return;
    }
    cursoId = candidatos[0].id;
  }
  console.log(`✅ Curso: ${cursoId}`);

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

  // ---------- 5. Inscripciones: Alumno + Curso + Sección + Turno (sin duplicar) ----------
  const inscripcionesSnap = await db.collection('inscripciones')
    .where('cursoId', '==', cursoId).where('seccionId', '==', seccionId).where('turnoId', '==', turnoId)
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
      alumnoId, cursoId, seccionId, turnoId, activo: true,
      fechaAlta: firebase.firestore.FieldValue.serverTimestamp(),
    });
    yaInscriptos.add(alumnoId);
    inscCreadas++;
  }

  console.log(`Listo. Alumnos creados: ${alumnosCreados} — salteados (ya existían): ${alumnosSalteados}.`);
  console.log(`Inscripciones creadas: ${inscCreadas} — salteadas (ya existían): ${inscSalteadas}.`);
})();
