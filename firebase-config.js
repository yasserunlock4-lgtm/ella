import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBomrlzuQMVrIvEp4Cb5Z_GYq-eIkkTO1U",
  authDomain: "ella-15bb4.firebaseapp.com",
  projectId: "ella-15bb4",
  storageBucket: "ella-15bb4.firebasestorage.app",
  messagingSenderId: "523247551544",
  appId: "1:523247551544:web:070b8f50d800a3f09852cd",
  measurementId: "G-8YQSSQMKL1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const hasFirebaseConfig = true;

export {
  app,
  db,
  hasFirebaseConfig,
  collection,
  getDocs,
  doc,
  getDoc
};
