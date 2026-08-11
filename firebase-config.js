// =====================================================================
// firebase-config.js
// Proyecto Firebase: gestionigacde-dda0b
// =====================================================================

const firebaseConfig = {
  apiKey: "AIzaSyDJAZ_QlX7PHkAVLvCIkWLaCQlMfV5W_LQ",
  authDomain: "gestionigacde-dda0b.firebaseapp.com",
  projectId: "gestionigacde-dda0b",
  storageBucket: "gestionigacde-dda0b.firebasestorage.app",
  messagingSenderId: "1039295064561",
  appId: "1:1039295064561:web:72f60480a1d77ad00ffc50",
  measurementId: "G-106M2YJ14G",
};

firebase.initializeApp(firebaseConfig);

// Quedan disponibles como variables globales para permissions.js y app.js
const auth = firebase.auth();
const db = firebase.firestore();
