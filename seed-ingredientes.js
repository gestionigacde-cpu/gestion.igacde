// =====================================================================
// seed-ingredientes.js
// Carga masiva de Ingredientes, para pegar en la consola del navegador.
//
// Cómo usarlo:
// 1. Entrá a la app logueado como Admin (gestionigacde-cpu.github.io/gestion.igacde/).
// 2. Abrí las DevTools (F12) -> pestaña "Console".
// 3. Pegá todo este archivo y presioná Enter.
// 4. Mirá el resumen al final: cuántos se crearon y cuántos se saltearon
//    por ya existir (no duplica nada, ni contra lo ya cargado en Firestore
//    ni entre sí si la lista trae repetidos).
//
// Reutiliza `db` y `firebase`, que ya están cargados como variables
// globales por la propia app (no hace falta nada más).
// =====================================================================

(async function () {
  const ingredientes = [
    { nombre: 'Huevo', unidadMedida: 'unidad' },
    { nombre: 'Almidón de maíz', unidadMedida: 'kg' },
    { nombre: 'Azúcar impalpable', unidadMedida: 'kg' },
    { nombre: 'Azúcar moreno', unidadMedida: 'kg' },
    { nombre: 'Chocolate semiamargo cobert.', unidadMedida: 'kg' },
    { nombre: 'Dulce de leche', unidadMedida: 'kg' },
    { nombre: 'Gelatina', unidadMedida: 'kg' },
    { nombre: 'Polvo de hornear', unidadMedida: 'kg' },
    { nombre: 'Harina 0000', unidadMedida: 'kg' },
    { nombre: 'Ron blanco', unidadMedida: 'kg' },
    { nombre: 'Vainilla', unidadMedida: 'vaina' },
    { nombre: 'Manteca', unidadMedida: 'kg' },
    { nombre: 'Crema de leche', unidadMedida: 'kg' },
    { nombre: 'Leche', unidadMedida: 'kg' },
    { nombre: 'Azúcar', unidadMedida: 'kg' },
    { nombre: 'Sal', unidadMedida: 'kg' },
    { nombre: 'Papel manteca', unidadMedida: 'unidad' },
  ];

  console.log(`Cargando ${ingredientes.length} ingredientes...`);

  const existentesSnap = await db.collection('ingredientes').get();
  const existentes = new Set(
    existentesSnap.docs.map((d) => (d.data().nombre || '').trim().toLowerCase())
  );

  let creados = 0;
  let salteados = 0;

  for (const ing of ingredientes) {
    const clave = ing.nombre.trim().toLowerCase();
    if (existentes.has(clave)) {
      console.log(`⏭  Ya existe, salteado: ${ing.nombre}`);
      salteados++;
      continue;
    }
    await db.collection('ingredientes').add({
      nombre: ing.nombre.trim(),
      unidadMedida: ing.unidadMedida,
      creadoEn: firebase.firestore.FieldValue.serverTimestamp(),
    });
    existentes.add(clave); // evita duplicar si la lista trae el mismo nombre dos veces
    console.log(`✅ Creado: ${ing.nombre} (${ing.unidadMedida})`);
    creados++;
  }

  console.log(`Listo. Creados: ${creados} — Salteados (ya existían): ${salteados}`);
})();
