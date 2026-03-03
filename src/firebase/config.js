// src/firebase/config.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Sua configuração do app web do Firebase
// ATENÇÃO: Substitua os valores abaixo pelos do seu projeto no Firebase!
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

// Inicializa e exporta os serviços que você vai usar
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };