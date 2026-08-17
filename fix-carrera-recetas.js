// =====================================================================
// fix-carrera-recetas.js
// Asigna una Carrera a todas las Recetas que ya estaban cargadas sin ese
// dato (desde la v0.5.0, "Carrera" es obligatoria al crear una Receta).
//
// Por defecto asigna todas las recetas sin Carrera a "Pastelería". Si
// necesitás repartirlas entre varias Carreras, corré el script varias
// veces cambiando CARRERA_NOMBRE y RECETAS_A_MOVER (dejá RECETAS_A_MOVER
// en null para "todas las que no tengan Carrera todavía").
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
  const CARRERA_NOMBRE = 'Pastelería';

  // null = todas las recetas que todavía no tengan carreraId.
  // O poné una lista de nombres exactos si solo querés mover algunas, ej:
  // const RECETAS_A_MOVER = ['Masa Quebrada', 'Hojaldre Frances'];
  const RECETAS_A_MOVER = null;

  const norm = (s) => (s || '').trim().toLowerCase();

  // ---------- Encontrar la Carrera ----------
  const carrerasSnap = await db.collection('carreras').get();
  const candidatos = carrerasSnap.docs.filter((c) => norm(c.data().nombre) === norm(CARRERA_NOMBRE));
  if (candidatos.length === 0) {
    console.error(`❌ No encontré ninguna Carrera llamada "${CARRERA_NOMBRE}". Carreras existentes:`);
    carrerasSnap.docs.forEach((c) => console.log(`   - ${c.data().nombre}`));
    return;
  }
  if (candidatos.length > 1) {
    console.error(`❌ Hay ${candidatos.length} Carreras llamadas "${CARRERA_NOMBRE}". IDs:`);
    candidatos.forEach((c) => console.log(`   - ${c.id}`));
    return;
  }
  const carreraId = candidatos[0].id;
  console.log(`✅ Carrera: ${CARRERA_NOMBRE} (${carreraId})`);

  // ---------- Corregir las Recetas ----------
  const recetasSnap = await db.collection('recetas').get();
  let corregidas = 0;
  let salteadas = 0;

  for (const doc of recetasSnap.docs) {
    const receta = doc.data();
    const enLaLista = RECETAS_A_MOVER === null || RECETAS_A_MOVER.map(norm).includes(norm(receta.nombre));
    const yaTieneCarrera = !!receta.carreraId;

    if (!enLaLista) continue; // no está en la lista puntual, se ignora
    if (RECETAS_A_MOVER === null && yaTieneCarrera) {
      salteadas++;
      continue; // ya tenía Carrera asignada, no se pisa
    }

    await doc.ref.update({ carreraId });
    console.log(`✅ "${receta.nombre}" → ${CARRERA_NOMBRE}`);
    corregidas++;
  }

  console.log(`Listo. Recetas corregidas: ${corregidas} — ya tenían Carrera (sin tocar): ${salteadas}.`);
})();
