// src/services/firebaseConfig.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, serverTimestamp } from "firebase/firestore";

// Cole aqui as suas credenciais do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA9UUXIt6psEnOluZg530YBqE35Nkzlp0Y",
  authDomain: "finamceiro-5d9ae.firebaseapp.com",
  databaseURL: "https://finamceiro-5d9ae-default-rtdb.firebaseio.com",
  projectId: "finamceiro-5d9ae",
  storageBucket: "finamceiro-5d9ae.firebasestorage.app",
  messagingSenderId: "90531422877",
  appId: "1:90531422877:web:0b9fee54c03ba81d68aa74",
  measurementId: "G-GQYCPLJ6Q3"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta os serviços que você vai usar
export const auth = getAuth(app);
export const db = getFirestore(app);
export const timestamp = serverTimestamp; // Para usar a hora do servidor