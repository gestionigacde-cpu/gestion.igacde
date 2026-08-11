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

  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyDJAZ_QlX7PHkAVLvCIkWLaCQlMfV5W_LQ",
    authDomain: "gestionigacde-dda0b.firebaseapp.com",
    projectId: "gestionigacde-dda0b",
    storageBucket: "gestionigacde-dda0b.firebasestorage.app",
    messagingSenderId: "1039295064561",
    appId: "1:1039295064561:web:72f60480a1d77ad00ffc50",
    measurementId: "G-106M2YJ14G"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
