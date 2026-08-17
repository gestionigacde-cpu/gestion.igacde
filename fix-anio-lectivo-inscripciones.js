// =====================================================================
// fix-anio-lectivo-inscripciones.js
// Asigna Año lectivo 2026 a todas las Inscripciones que ya estaban
// cargadas sin ese dato (desde la v0.5.1, "Año lectivo" es obligatorio
// al inscribir un Alumno).
//
// Cómo usarlo:
// 1. Entrá a la app logueado como Admin.
// 2. Abrí las DevTools (F12) -> pestaña "Console".
// 3. Pegá todo este archivo y presioná Enter.
// 4. Mirá el resumen al final.
//
// No pisa ninguna Inscripción que ya tenga Año lectivo cargado (por si
// ya corregiste alguna a mano).
//
// Reutiliza `db`, que ya está cargado como variable global por la app.
// =====================================================================

(async function () {
  const ANIO_LECTIVO = '2026';

  const inscripcionesSnap = await db.collection('inscripciones').get();

  let corregidas = 0;
  let salteadas = 0;

  for (const doc of inscripcionesSnap.docs) {
    const insc = doc.data();
    if (insc.anioLectivo) {
      salteadas++;
      continue; // ya tenía Año lectivo, no se pisa
    }
    await doc.ref.update({ anioLectivo: ANIO_LECTIVO });
    corregidas++;
  }

  console.log(`Listo. Inscripciones corregidas (Año lectivo ${ANIO_LECTIVO}): ${corregidas} — ya tenían Año lectivo (sin tocar): ${salteadas}.`);
})();
