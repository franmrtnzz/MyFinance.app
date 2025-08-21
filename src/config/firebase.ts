import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Verificar que las variables de entorno se estén leyendo
console.log('🔧 Variables de entorno Firebase:', {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? '✅ Configurada' : '❌ No configurada',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? '✅ Configurada' : '❌ No configurada',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ? '✅ Configurada' : '❌ No configurada',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ? '✅ Configurada' : '❌ No configurada',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ? '✅ Configurada' : '❌ No configurada',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ? '✅ Configurada' : '❌ No configurada'
});

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
console.log('🚀 Inicializando Firebase...');
const app = initializeApp(firebaseConfig);
console.log('✅ Firebase App inicializado:', app.name);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
console.log('✅ Firestore inicializado:', db ? 'Sí' : 'No');
console.log('✅ Auth inicializado:', auth ? 'Sí' : 'No');

export default app; 