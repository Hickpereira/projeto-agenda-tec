// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyACxnZdcBVl_V7ELdLQkD21sWOEHakw2ns",
  authDomain: "agendatec-5d7b7.firebaseapp.com",
  projectId: "agendatec-5d7b7",
  storageBucket: "agendatec-5d7b7.firebasestorage.app",
  messagingSenderId: "280981924653",
  appId: "1:280981924653:web:924822e523b4fe3c1381a4",
  measurementId: "G-B0Q28XSFEE"
};


// Inicializa o Firebase usando o modo de compatibilidade
firebase.initializeApp(firebaseConfig);

// Disponibiliza as instâncias do Auth e Firestore para outros scripts (como o app.js)
const auth = firebase.auth();
const db = firebase.firestore();