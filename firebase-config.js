// =====================================================================
// firebase-config.js
//
// 1. Andá a Firebase Console -> tu proyecto -> ⚙ Configuración del
//    proyecto -> pestaña "General" -> sección "Tus apps" -> app Web.
// 2. Elegí la vista "Config" (no "npm" ni "CDN modular") y copiá el
//    objeto tal cual te lo da Firebase, pegándolo abajo en lugar del
//    de ejemplo.
// 3. No hace falta ocultar esta clave: las apiKey de Firebase Web son
//    públicas por diseño. La seguridad real la dan firestore.rules.
// =====================================================================

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  projectId: "TU_PROYECTO",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID",
};

firebase.initializeApp(firebaseConfig);

// Quedan disponibles como variables globales para permissions.js y app.js
const auth = firebase.auth();
const db = firebase.firestore();
