// =====================================================================
// seed-ingredientes-pasteleria.js
// Carga masiva de Ingredientes extraidos de las planillas reales
// "CLASE 1..6" (hoja DOCENTE) de Pasteleria, para pegar en la consola
// del navegador. Paso 1 de 2 (correr esto antes que
// seed-recetas-pasteleria.js).
//
// Como usarlo:
// 1. Entra a la app logueado como Admin.
// 2. Abri las DevTools (F12) -> pestaña "Console".
// 3. Pega todo este archivo y presiona Enter.
// 4. Mira el resumen al final: creados / salteados (ya existian).
//
// No duplica nada: compara nombres ignorando mayusculas/minusculas,
// tildes y puntos finales, asi "Almidon de maiz" (esta planilla) no
// duplica a "Almidón de maíz" (si ya la habias cargado antes con
// seed-ingredientes.js).
//
// Reutiliza `db` y `firebase`, que ya estan cargados como variables
// globales por la propia app.
// =====================================================================

(async function () {
  const ingredientes = [
    { nombre: "Agua", unidadMedida: "kg" },
    { nombre: "Almendras", unidadMedida: "kg" },
    { nombre: "Almidon de maiz", unidadMedida: "kg" },
    { nombre: "Azucar", unidadMedida: "kg" },
    { nombre: "Azucar comun", unidadMedida: "kg" },
    { nombre: "Azucar impalpable", unidadMedida: "kg" },
    { nombre: "Azucar negra", unidadMedida: "kg" },
    { nombre: "Cacao amargo", unidadMedida: "kg" },
    { nombre: "Café instantaneo", unidadMedida: "kg" },
    { nombre: "Cereza", unidadMedida: "unidad" },
    { nombre: "Cereza con cabo", unidadMedida: "unidad" },
    { nombre: "Chantipack", unidadMedida: "kg" },
    { nombre: "Chocolate blanco hidrogenado", unidadMedida: "kg" },
    { nombre: "Chocolate hidrogenado (semiamargo-leche-blanco)", unidadMedida: "kg" },
    { nombre: "Chocolate hidrogenado(semi-leche o blanco)", unidadMedida: "kg" },
    { nombre: "Chocolate semi amargo hidro", unidadMedida: "kg" },
    { nombre: "Chocolate semiamargo cobert", unidadMedida: "kg" },
    { nombre: "Chocolate semiamargo o leche", unidadMedida: "kg" },
    { nombre: "Coco rallado", unidadMedida: "kg" },
    { nombre: "Coñac", unidadMedida: "kg" },
    { nombre: "Crema de leche", unidadMedida: "kg" },
    { nombre: "Crema de leche carton", unidadMedida: "kg" },
    { nombre: "Crema de Ricotta", unidadMedida: "kg" },
    { nombre: "Dulce de leche", unidadMedida: "kg" },
    { nombre: "Dulce de leche repostero", unidadMedida: "kg" },
    { nombre: "Durazno", unidadMedida: "rodaja" },
    { nombre: "Esencia de vainila", unidadMedida: "kg" },
    { nombre: "Esencia de vainilla", unidadMedida: "kg" },
    { nombre: "Frambuesa congelada", unidadMedida: "kg" },
    { nombre: "Frutas abrillantadas", unidadMedida: "kg" },
    { nombre: "Frutilla", unidadMedida: "kg" },
    { nombre: "Frutilla frescas", unidadMedida: "bandeja" },
    { nombre: "Gel de brillo", unidadMedida: "kg" },
    { nombre: "Glase real", unidadMedida: "kg" },
    { nombre: "Glucosa", unidadMedida: "kg" },
    { nombre: "Granos de café", unidadMedida: "kg" },
    { nombre: "Harina 0000", unidadMedida: "kg" },
    { nombre: "Huevo", unidadMedida: "unidad" },
    { nombre: "Huevos", unidadMedida: "unidad" },
    { nombre: "Kiwi", unidadMedida: "unidad" },
    { nombre: "Leche", unidadMedida: "kg" },
    { nombre: "Leche condensada", unidadMedida: "kg" },
    { nombre: "Licor de café", unidadMedida: "kg" },
    { nombre: "Licor de chocolate", unidadMedida: "kg" },
    { nombre: "Limon", unidadMedida: "unidad" },
    { nombre: "Manteca", unidadMedida: "kg" },
    { nombre: "Manzana verde", unidadMedida: "unidad" },
    { nombre: "Mermelada de guayaba repostero", unidadMedida: "kg" },
    { nombre: "Mermelada de naranja con piel", unidadMedida: "frasco" },
    { nombre: "Miel", unidadMedida: "kg" },
    { nombre: "Miel de abeja", unidadMedida: "kg" },
    { nombre: "Moldes para budin chico 150", unidadMedida: "unidad" },
    { nombre: "Naranja", unidadMedida: "unidad" },
    { nombre: "Naranjas", unidadMedida: "unidad" },
    { nombre: "Nueces", unidadMedida: "kg" },
    { nombre: "Nueces o almendras", unidadMedida: "unidad" },
    { nombre: "Nuez o almendras", unidadMedida: "kg" },
    { nombre: "Papel manteca", unidadMedida: "unidad" },
    { nombre: "Peras medianas", unidadMedida: "unidad" },
    { nombre: "Phisalis", unidadMedida: "unidad" },
    { nombre: "Pistachos", unidadMedida: "kg" },
    { nombre: "Polvo de hornear", unidadMedida: "kg" },
    { nombre: "Queso crema", unidadMedida: "kg" },
    { nombre: "Sal", unidadMedida: "kg" },
    { nombre: "Sal fina", unidadMedida: "kg" },
    { nombre: "Semilla de sesamo", unidadMedida: "kg" },
    { nombre: "Uvas", unidadMedida: "unidad" },
    { nombre: "Uvas pasas", unidadMedida: "kg" },
    { nombre: "Whisky", unidadMedida: "kg" },
    { nombre: "Yogurt natural", unidadMedida: "kg" },
  ];

  function normalizar(s) {
    return (s || '')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // saca tildes
      .replace(/\./g, '') // saca puntos (ej: "cobert." vs "cobert")
      .trim().toLowerCase();
  }

  console.log(`Cargando ${ingredientes.length} ingredientes...`);

  const existentesSnap = await db.collection('ingredientes').get();
  const existentes = new Set(existentesSnap.docs.map((d) => normalizar(d.data().nombre)));

  let creados = 0;
  let salteados = 0;

  for (const ing of ingredientes) {
    const clave = normalizar(ing.nombre);
    if (existentes.has(clave)) {
      console.log(`\u23ed  Ya existe, salteado: ${ing.nombre}`);
      salteados++;
      continue;
    }
    await db.collection('ingredientes').add({
      nombre: ing.nombre,
      unidadMedida: ing.unidadMedida,
      creadoEn: firebase.firestore.FieldValue.serverTimestamp(),
    });
    existentes.add(clave);
    console.log(`\u2705 Creado: ${ing.nombre} (${ing.unidadMedida})`);
    creados++;
  }

  console.log(`Listo. Creados: ${creados} \u2014 Salteados (ya existian): ${salteados}.`);
})();
