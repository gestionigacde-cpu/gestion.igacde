// =====================================================================
// seed-recetas-pasteleria.js
// Carga masiva de 28 Recetas extraidas de las planillas reales
// "CLASE 1..6" (hoja DOCENTE) de Pasteleria, con sus ingredientes y
// cantidades por ejecucion (por grupo). Paso 2 de 2 - correr DESPUES de
// seed-ingredientes-pasteleria.js, para que los ingredientes ya existan.
//
// Cada Receta queda nombrada "Clase N (Año) - Nombre del plato" para
// poder rastrear de que planilla salio (podes renombrarlas despues
// desde "Recetas" con Editar). Todas se asignan a la Carrera
// "Pastelería".
//
// Nota: la receta "VAINILLAS No se hace" de Clase 5 (2022) se excluyo
// a proposito (el propio nombre indicaba que esa clase no se hizo).
//
// Como usarlo:
// 1. Entra a la app logueado como Admin, con Ingredientes ya cargados
//    (corriste seed-ingredientes-pasteleria.js primero).
// 2. Abri las DevTools (F12) -> pestaña "Console".
// 3. Pega todo este archivo y presiona Enter.
// 4. Mira el resumen al final: Recetas creadas/salteadas (por nombre) y
//    si algun ingrediente no se encontro (avisa cual, no rompe el resto).
//
// Reutiliza `db` y `firebase`, que ya estan cargados como variables
// globales por la propia app.
// =====================================================================

(async function () {
  const CARRERA_NOMBRE = 'Pastelería';

  const recetas = [
    {
      nombre: "Clase 1 (2023) - Decoracion",
      ingredientes: [
        { nombre: "Chocolate blanco hidrogenado", cantidad: 0.2 },
        { nombre: "Coco rallado", cantidad: 0.05 },
        { nombre: "Dulce de leche repostero", cantidad: 0.2 },
        { nombre: "Semilla de sesamo", cantidad: 0.01 },
        { nombre: "Frambuesa congelada", cantidad: 0.2 },
        { nombre: "Mermelada de naranja con piel", cantidad: 0.7 },
        { nombre: "Pistachos", cantidad: 0.05 },
      ],
    },
    {
      nombre: "Clase 1 (2023) - Variedad De Masitas",
      ingredientes: [
        { nombre: "Almidon de maiz", cantidad: 0.075 },
        { nombre: "Azucar impalpable", cantidad: 0.1 },
        { nombre: "Esencia de vainilla", cantidad: 0.005 },
        { nombre: "Harina 0000", cantidad: 0.175 },
        { nombre: "Manteca", cantidad: 0.125 },
        { nombre: "Huevo", cantidad: 1 },
      ],
    },
    {
      nombre: "Clase 2 (2023) - masa de manga",
      ingredientes: [
        { nombre: "Almidon de maiz", cantidad: 0.025 },
        { nombre: "Azucar impalpable", cantidad: 0.075 },
        { nombre: "Esencia de vainilla", cantidad: 0.005 },
        { nombre: "Harina 0000", cantidad: 0.18 },
        { nombre: "Sal", cantidad: 0.001 },
        { nombre: "Manteca", cantidad: 0.187 },
        { nombre: "Agua", cantidad: 0.03 },
      ],
    },
    {
      nombre: "Clase 2 (2023) - Decoracion",
      ingredientes: [
        { nombre: "Cereza", cantidad: 4 },
        { nombre: "Chocolate hidrogenado (semiamargo-leche-blanco)", cantidad: 0.2 },
        { nombre: "Nueces o almendras", cantidad: 4 },
      ],
    },
    {
      nombre: "Clase 3 (2022) - Tarta De Manzana",
      ingredientes: [
        { nombre: "Azucar impalpable", cantidad: 0.08 },
        { nombre: "Esencia de vainila", cantidad: 0.01 },
        { nombre: "Nuez o almendras", cantidad: 0.01 },
        { nombre: "Harina 0000", cantidad: 0.3 },
        { nombre: "Sal", cantidad: 0.002 },
        { nombre: "Manteca", cantidad: 0.2 },
        { nombre: "Azucar", cantidad: 0.09 },
        { nombre: "Huevo", cantidad: 1 },
        { nombre: "Limon", cantidad: 0.5 },
        { nombre: "Manzana verde", cantidad: 1 },
      ],
    },
    {
      nombre: "Clase 3 (2022) - Tarta De Ricotta",
      ingredientes: [
        { nombre: "Azucar impalpable", cantidad: 0.085 },
        { nombre: "Esencia de vainila", cantidad: 0.005 },
        { nombre: "Polvo de hornear", cantidad: 0.005 },
        { nombre: "Harina 0000", cantidad: 0.2 },
        { nombre: "Manteca", cantidad: 0.085 },
        { nombre: "Leche", cantidad: 0.05 },
        { nombre: "Crema de Ricotta", cantidad: 0.085 },
        { nombre: "Azucar", cantidad: 0.03 },
        { nombre: "Huevo", cantidad: 2.5 },
        { nombre: "Limon", cantidad: 1 },
      ],
    },
    {
      nombre: "Clase 3 (2022) - Pasta Frola",
      ingredientes: [
        { nombre: "Azucar impalpable", cantidad: 0.05 },
        { nombre: "Esencia de vainila", cantidad: 0.005 },
        { nombre: "Mermelada de guayaba repostero", cantidad: 0.1 },
        { nombre: "Polvo de hornear", cantidad: 0.005 },
        { nombre: "Harina 0000", cantidad: 0.16 },
        { nombre: "Sal", cantidad: 0.003 },
        { nombre: "Manteca", cantidad: 0.08 },
        { nombre: "Huevo", cantidad: 1 },
      ],
    },
    {
      nombre: "Clase 3 (2022) - Tarta De Coco Y D Leche",
      ingredientes: [
        { nombre: "Coco rallado", cantidad: 0.05 },
        { nombre: "Dulce de leche", cantidad: 0.085 },
      ],
    },
    {
      nombre: "Clase 3 (2022) - Decoracion",
      ingredientes: [
        { nombre: "Chocolate hidrogenado(semi-leche o blanco)", cantidad: 0.15 },
      ],
    },
    {
      nombre: "Clase 4 (2022) - almibar",
      ingredientes: [
        { nombre: "Azucar comun", cantidad: 0.25 },
      ],
    },
    {
      nombre: "Clase 4 (2022) - Lemon pie",
      ingredientes: [
        { nombre: "Huevos", cantidad: 4 },
        { nombre: "Almidon de maiz", cantidad: 0.015 },
        { nombre: "Azucar impalpable", cantidad: 0.05 },
        { nombre: "Esencia de vainilla", cantidad: 0.005 },
        { nombre: "Harina 0000", cantidad: 0.125 },
        { nombre: "Sal fina", cantidad: 0.001 },
        { nombre: "Manteca", cantidad: 0.1 },
        { nombre: "Azucar comun", cantidad: 0.2 },
        { nombre: "Limon", cantidad: 1.5 },
      ],
    },
    {
      nombre: "Clase 4 (2022) - Cabsha",
      ingredientes: [
        { nombre: "Huevos", cantidad: 2 },
        { nombre: "Azucar impalpable", cantidad: 0.05 },
        { nombre: "Cacao amargo", cantidad: 0.01 },
        { nombre: "Chocolate semi amargo hidro", cantidad: 0.04 },
        { nombre: "Dulce de leche", cantidad: 0.15 },
        { nombre: "Harina 0000", cantidad: 0.1 },
        { nombre: "Licor de chocolate", cantidad: 0.03 },
        { nombre: "Manteca", cantidad: 0.07 },
      ],
    },
    {
      nombre: "Clase 4 (2022) - Tartaletas frutales",
      ingredientes: [
        { nombre: "Huevos", cantidad: 1 },
        { nombre: "Azucar impalpable", cantidad: 0.05 },
        { nombre: "Gel de brillo", cantidad: 0.03 },
        { nombre: "Harina 0000", cantidad: 0.1 },
        { nombre: "Sal fina", cantidad: 0.001 },
        { nombre: "Manteca", cantidad: 0.05 },
        { nombre: "Crema de leche", cantidad: 0.2 },
        { nombre: "Azucar comun", cantidad: 0.05 },
        { nombre: "Durazno", cantidad: 2 },
        { nombre: "Frutilla", cantidad: 0.1 },
        { nombre: "Kiwi", cantidad: 0.5 },
        { nombre: "Phisalis", cantidad: 3 },
        { nombre: "Uvas", cantidad: 5 },
      ],
    },
    {
      nombre: "Clase 4 (2022) - Crujiente de peras",
      ingredientes: [
        { nombre: "Huevos", cantidad: 2 },
        { nombre: "Azucar impalpable", cantidad: 0.05 },
        { nombre: "Esencia de vainilla", cantidad: 0.005 },
        { nombre: "Nueces", cantidad: 0.05 },
        { nombre: "Polvo de hornear", cantidad: 0.007 },
        { nombre: "Harina 0000", cantidad: 0.16 },
        { nombre: "Sal fina", cantidad: 0.001 },
        { nombre: "Manteca", cantidad: 0.1 },
        { nombre: "Azucar comun", cantidad: 0.1 },
        { nombre: "Peras medianas", cantidad: 1 },
      ],
    },
    {
      nombre: "Clase 4 (2022) - Demo Crema pastelera",
      ingredientes: [
        { nombre: "Huevos", cantidad: 2 },
        { nombre: "Almidon de maiz", cantidad: 0.015 },
        { nombre: "Esencia de vainilla", cantidad: 0.005 },
        { nombre: "Leche", cantidad: 0.25 },
        { nombre: "Azucar comun", cantidad: 0.07 },
      ],
    },
    {
      nombre: "Clase 4 (2022) - Crema de Naranja",
      ingredientes: [
        { nombre: "Huevos", cantidad: 1 },
        { nombre: "Almidon de maiz", cantidad: 0.015 },
        { nombre: "Leche", cantidad: 0.125 },
        { nombre: "Azucar comun", cantidad: 0.05 },
        { nombre: "Naranjas", cantidad: 1 },
      ],
    },
    {
      nombre: "Clase 5 (2022) - BIZCOCHUELO BASiCO",
      ingredientes: [
        { nombre: "Huevos", cantidad: 3 },
        { nombre: "Azucar", cantidad: 0.09 },
        { nombre: "Esencia de vainilla", cantidad: 0.005 },
        { nombre: "Harina 0000", cantidad: 0.09 },
        { nombre: "Papel manteca", cantidad: 0.125 },
      ],
    },
    {
      nombre: "Clase 5 (2022) - Crema De Manteca Demo",
      ingredientes: [
        { nombre: "Huevos", cantidad: 4 },
        { nombre: "Azucar", cantidad: 0.125 },
        { nombre: "Esencia de vainilla", cantidad: 0.005 },
        { nombre: "Manteca", cantidad: 0.28 },
      ],
    },
    {
      nombre: "Clase 5 (2022) - DEMO PRALINE y Decoracion",
      ingredientes: [
        { nombre: "Almendras", cantidad: 0.05 },
        { nombre: "Azucar", cantidad: 0.1 },
        { nombre: "Chocolate semiamargo cobert", cantidad: 0.1 },
        { nombre: "Frutilla frescas", cantidad: 0.5 },
      ],
    },
    {
      nombre: "Clase 5 (2022) - Bizcochuelo De Cacao",
      ingredientes: [
        { nombre: "Huevos", cantidad: 3 },
        { nombre: "Azucar", cantidad: 0.09 },
        { nombre: "Cacao amargo", cantidad: 0.02 },
        { nombre: "Harina 0000", cantidad: 0.07 },
      ],
    },
    {
      nombre: "Clase 5 (2022) - Demo relleno Bariloche y chantipack",
      ingredientes: [
        { nombre: "Chocolate semiamargo cobert", cantidad: 0.08 },
        { nombre: "Dulce de leche", cantidad: 0.2 },
        { nombre: "Manteca", cantidad: 0.4 },
        { nombre: "Chantipack", cantidad: 0.3 },
      ],
    },
    {
      nombre: "Clase 5 (2022) - Tronco De Choco",
      ingredientes: [
        { nombre: "Huevos", cantidad: 3 },
        { nombre: "Huevos", cantidad: 3 },
        { nombre: "Azucar", cantidad: 0.12 },
        { nombre: "Azucar", cantidad: 0.12 },
        { nombre: "Cacao amargo", cantidad: 0.01 },
        { nombre: "Chocolate semiamargo cobert", cantidad: 0.175 },
        { nombre: "Chocolate semiamargo cobert", cantidad: 0.175 },
        { nombre: "Dulce de leche", cantidad: 0.15 },
        { nombre: "Dulce de leche", cantidad: 0.15 },
        { nombre: "Esencia de vainilla", cantidad: 0.005 },
        { nombre: "Esencia de vainilla", cantidad: 0.005 },
        { nombre: "Harina 0000", cantidad: 0.05 },
        { nombre: "Harina 0000", cantidad: 0.06 },
        { nombre: "Miel", cantidad: 0.01 },
        { nombre: "Miel", cantidad: 0.01 },
        { nombre: "Crema de leche carton", cantidad: 0.1 },
        { nombre: "Crema de leche carton", cantidad: 0.1 },
      ],
    },
    {
      nombre: "Clase 6 (2022) - Budin ingles",
      ingredientes: [
        { nombre: "Huevo", cantidad: 3 },
        { nombre: "Almendras", cantidad: 0.02 },
        { nombre: "Almidon de maiz", cantidad: 0.01 },
        { nombre: "Azucar impalpable", cantidad: 0.2 },
        { nombre: "Frutas abrillantadas", cantidad: 0.03 },
        { nombre: "Moldes para budin chico 150", cantidad: 4 },
        { nombre: "Nueces", cantidad: 0.02 },
        { nombre: "Polvo de hornear", cantidad: 0.007 },
        { nombre: "Uvas pasas", cantidad: 0.02 },
        { nombre: "Harina 0000", cantidad: 0.125 },
        { nombre: "Cereza con cabo", cantidad: 3 },
        { nombre: "Coñac", cantidad: 0.03 },
        { nombre: "Whisky", cantidad: 0.05 },
        { nombre: "Manteca", cantidad: 0.1 },
        { nombre: "Limon", cantidad: 0.5 },
        { nombre: "Naranja", cantidad: 0.5 },
      ],
    },
    {
      nombre: "Clase 6 (2022) - Budin marmolado",
      ingredientes: [
        { nombre: "Huevo", cantidad: 2 },
        { nombre: "Almidon de maiz", cantidad: 0.012 },
        { nombre: "Azucar impalpable", cantidad: 0.13 },
        { nombre: "Cacao amargo", cantidad: 0.01 },
        { nombre: "Glucosa", cantidad: 0.024 },
        { nombre: "Moldes para budin chico 150", cantidad: 4 },
        { nombre: "Polvo de hornear", cantidad: 0.008 },
        { nombre: "Harina 0000", cantidad: 0.17 },
        { nombre: "Manteca", cantidad: 0.13 },
        { nombre: "Leche", cantidad: 0.06 },
      ],
    },
    {
      nombre: "Clase 6 (2022) - Budin de café",
      ingredientes: [
        { nombre: "Huevo", cantidad: 2 },
        { nombre: "Glase real", cantidad: 0.2 },
        { nombre: "Polvo de hornear", cantidad: 0.005 },
        { nombre: "Harina 0000", cantidad: 0.18 },
        { nombre: "Café instantaneo", cantidad: 0.03 },
        { nombre: "Granos de café", cantidad: 0.005 },
        { nombre: "Licor de café", cantidad: 0.02 },
        { nombre: "Manteca", cantidad: 0.12 },
        { nombre: "Azucar", cantidad: 0.06 },
        { nombre: "Azucar negra", cantidad: 0.06 },
      ],
    },
    {
      nombre: "Clase 6 (2022) - Budin de limon",
      ingredientes: [
        { nombre: "Huevo", cantidad: 2 },
        { nombre: "Almidon de maiz", cantidad: 0.05 },
        { nombre: "Polvo de hornear", cantidad: 0.007 },
        { nombre: "Harina 0000", cantidad: 0.2 },
        { nombre: "Manteca", cantidad: 0.125 },
        { nombre: "Leche", cantidad: 0.04 },
        { nombre: "Azucar", cantidad: 0.185 },
        { nombre: "Limon", cantidad: 2 },
      ],
    },
    {
      nombre: "Clase 6 (2022) - Torta de yogurt y cubierta de queso",
      ingredientes: [
        { nombre: "Huevo", cantidad: 2 },
        { nombre: "Polvo de hornear", cantidad: 0.008 },
        { nombre: "Harina 0000", cantidad: 0.22 },
        { nombre: "Miel de abeja", cantidad: 0.05 },
        { nombre: "Manteca", cantidad: 0.06 },
        { nombre: "Queso crema", cantidad: 0.2 },
        { nombre: "Yogurt natural", cantidad: 0.2 },
        { nombre: "Azucar", cantidad: 0.125 },
        { nombre: "Frutilla", cantidad: 4 },
        { nombre: "Limon", cantidad: 1 },
      ],
    },
    {
      nombre: "Clase 6 (2022) - Brigadeiro demo",
      ingredientes: [
        { nombre: "Almidon de maiz", cantidad: 0.04 },
        { nombre: "Cacao amargo", cantidad: 0.01 },
        { nombre: "Chocolate semiamargo o leche", cantidad: 0.1 },
        { nombre: "Leche condensada", cantidad: 0.395 },
        { nombre: "Crema de leche carton", cantidad: 1 },
        { nombre: "Leche", cantidad: 0.2 },
      ],
    },
  ];

  function normalizar(s) {
    return (s || '')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/\./g, '')
      .trim().toLowerCase();
  }

  // ---------- Resolver la Carrera ----------
  const carrerasSnap = await db.collection('carreras').get();
  const carrera = carrerasSnap.docs.find((c) => normalizar(c.data().nombre) === normalizar(CARRERA_NOMBRE));
  if (!carrera) {
    console.error(`\u274c No encontre la Carrera "${CARRERA_NOMBRE}". Cargala primero en "Carreras".`);
    return;
  }
  const carreraId = carrera.id;
  console.log(`\u2705 Carrera: ${CARRERA_NOMBRE} (${carreraId})`);

  // ---------- Catalogo de Ingredientes (para resolver ingredienteId) ----------
  const ingredientesSnap = await db.collection('ingredientes').get();
  const catalogoIngredientes = new Map(
    ingredientesSnap.docs.map((d) => [normalizar(d.data().nombre), { id: d.id, ...d.data() }])
  );

  // ---------- Recetas ya cargadas (para no duplicar por nombre) ----------
  const recetasSnap = await db.collection('recetas').get();
  const recetasExistentes = new Set(recetasSnap.docs.map((d) => normalizar(d.data().nombre)));

  let creadas = 0;
  let salteadas = 0;
  const avisos = [];

  for (const receta of recetas) {
    const clave = normalizar(receta.nombre);
    if (recetasExistentes.has(clave)) {
      console.log(`\u23ed  Receta ya existia, salteada: ${receta.nombre}`);
      salteadas++;
      continue;
    }

    const ingredientesResueltos = [];
    for (const ing of receta.ingredientes) {
      const cat = catalogoIngredientes.get(normalizar(ing.nombre));
      if (!cat) {
        const aviso = `\u26a0 "${ing.nombre}" no esta en Ingredientes \u2014 se salteo ese ingrediente en "${receta.nombre}".`;
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
      carreraId,
      procedimiento: '',
      ingredientes: ingredientesResueltos,
      creadoEn: firebase.firestore.FieldValue.serverTimestamp(),
    });
    recetasExistentes.add(clave);
    console.log(`\u2705 Receta creada: ${receta.nombre} (${ingredientesResueltos.length} ingredientes)`);
    creadas++;
  }

  console.log(`Listo. Recetas creadas: ${creadas} \u2014 salteadas (ya existian): ${salteadas}.`);
  if (avisos.length > 0) {
    console.log(`Avisos (${avisos.length}): revisa esas recetas en "Recetas" y agrega el ingrediente a mano si hace falta.`);
  }
})();
