// =====================================================================
// seed-recetas.js
// Carga masiva de 6 Recetas (con sus ingredientes y cantidades), para
// pegar en la consola del navegador.
//
// Cómo usarlo:
// 1. Entrá a la app logueado como Admin.
// 2. Primero tienen que existir los Ingredientes que usan estas recetas
//    (Huevo, Almidón de maíz, Azúcar impalpable, Harina 0000, Manteca,
//    Sal, Azúcar, Gelatina, Dulce de leche, Crema de leche, Chocolate
//    semiamargo cobert., Polvo de hornear, Leche) — si ya corriste
//    seed-ingredientes.js, están todos.
// 3. Abrí las DevTools (F12) -> pestaña "Console".
// 4. Pegá todo este archivo y presioná Enter.
// 5. Mirá el resumen al final: Recetas creadas/salteadas (por nombre) y
//    si algún ingrediente no se encontró (avisa cuál, no rompe el resto).
//
// Reutiliza `db` y `firebase`, que ya están cargados como variables
// globales por la propia app.
// =====================================================================

(async function () {
  const recetas = [
    {
      nombre: 'Crema Pastelera y Crema Inglesa',
      ingredientes: [
        { nombre: 'Huevo', cantidad: 3 },
        { nombre: 'Almidón de maíz', cantidad: 0.015 },
        { nombre: 'Leche', cantidad: 0.15 },
        { nombre: 'Azúcar', cantidad: 0.025 },
      ],
    },
    {
      nombre: 'Masa Quebrada',
      ingredientes: [
        { nombre: 'Huevo', cantidad: 1 },
        { nombre: 'Azúcar impalpable', cantidad: 0.05 },
        { nombre: 'Harina 0000', cantidad: 0.16 },
        { nombre: 'Manteca', cantidad: 0.08 },
        { nombre: 'Sal', cantidad: 0.001 },
      ],
    },
    {
      nombre: 'Merengues Italiano, Suizo, Francés',
      ingredientes: [
        { nombre: 'Huevo', cantidad: 6 },
        { nombre: 'Azúcar', cantidad: 0.5 },
      ],
    },
    {
      nombre: 'Gelatina - Hidratar',
      ingredientes: [
        { nombre: 'Gelatina', cantidad: 0.004 },
      ],
    },
    {
      nombre: 'Bizcochuelo / Genoise / Biscuit',
      ingredientes: [
        { nombre: 'Huevo', cantidad: 3 },
        { nombre: 'Dulce de leche', cantidad: 0.2 },
        { nombre: 'Harina 0000', cantidad: 0.09 },
        { nombre: 'Crema de leche', cantidad: 0.5 },
        { nombre: 'Azúcar', cantidad: 0.09 },
      ],
    },
    {
      nombre: 'Budín Marmolado Cremado',
      ingredientes: [
        { nombre: 'Huevo', cantidad: 2 },
        { nombre: 'Azúcar impalpable', cantidad: 0.13 },
        { nombre: 'Chocolate semiamargo cobert.', cantidad: 0.04 },
        { nombre: 'Polvo de hornear', cantidad: 0.008 },
        { nombre: 'Harina 0000', cantidad: 0.17 },
        { nombre: 'Manteca', cantidad: 0.13 },
      ],
    },
  ];

  const norm = (s) => (s || '').trim().toLowerCase();

  // ---------- Catálogo de Ingredientes (para resolver ingredienteId) ----------
  const ingredientesSnap = await db.collection('ingredientes').get();
  const catalogoIngredientes = new Map(
    ingredientesSnap.docs.map((d) => [norm(d.data().nombre), { id: d.id, ...d.data() }])
  );

  // ---------- Recetas ya cargadas (para no duplicar por nombre) ----------
  const recetasSnap = await db.collection('recetas').get();
  const recetasExistentes = new Set(recetasSnap.docs.map((d) => norm(d.data().nombre)));

  let creadas = 0;
  let salteadas = 0;
  const avisos = [];

  for (const receta of recetas) {
    const clave = norm(receta.nombre);
    if (recetasExistentes.has(clave)) {
      console.log(`⏭  Receta ya existía, salteada: ${receta.nombre}`);
      salteadas++;
      continue;
    }

    const ingredientesResueltos = [];
    for (const ing of receta.ingredientes) {
      const cat = catalogoIngredientes.get(norm(ing.nombre));
      if (!cat) {
        const aviso = `⚠ "${ing.nombre}" no está en Ingredientes — se salteó ese ingrediente en "${receta.nombre}".`;
        console.warn(aviso);
        avisos.push(aviso);
        continue;
      }
      ingredientesResueltos.push({
        ingredienteId: cat.id,
        nombre: cat.nombre,
        unidad: cat.unidadMedida,
        cantidad: Number(ing.cantidad),
      });
    }

    await db.collection('recetas').add({
      nombre: receta.nombre,
      procedimiento: '',
      ingredientes: ingredientesResueltos,
      creadoEn: firebase.firestore.FieldValue.serverTimestamp(),
    });
    recetasExistentes.add(clave); // evita duplicar si la lista trae el mismo nombre dos veces
    console.log(`✅ Receta creada: ${receta.nombre} (${ingredientesResueltos.length} ingredientes)`);
    creadas++;
  }

  console.log(`Listo. Recetas creadas: ${creadas} — salteadas (ya existían): ${salteadas}.`);
  if (avisos.length > 0) {
    console.log(`Avisos (${avisos.length}): revisá esas recetas en "Recetas" y agregá el ingrediente a mano si hace falta.`);
  }
})();
