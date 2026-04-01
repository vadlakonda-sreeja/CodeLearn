
// 🔥 Import Firebase App
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

// 🔥 Import Auth
import {
getAuth,
createUserWithEmailAndPassword,
signInWithEmailAndPassword,
GoogleAuthProvider,
signInWithPopup,
signOut,
onAuthStateChanged,
sendEmailVerification
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// 🔥 Import Firestore (VERY IMPORTANT FOR LEADERBOARD + PROGRESS)
import {
getFirestore,
doc,
setDoc,
getDoc,
updateDoc,
collection,
getDocs,
increment
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ========================
// FIREBASE CONFIG
// ========================
const firebaseConfig = {
  apiKey: "AIzaSyD_LlKijxp99wMMF93c_CRJ9sNdJgcjN6U",
  authDomain: "codelearn-70082.firebaseapp.com",
  projectId: "codelearn-70082",
  storageBucket: "codelearn-70082.firebasestorage.app",
  messagingSenderId: "93377446954",
  appId: "1:93377446954:web:042ed8e5e9b3ccf1e56f53"
};

// ========================
// INITIALIZE FIREBASE
// ========================

const app = initializeApp(firebaseConfig);


// ========================
// AUTH
// ========================

const auth = getAuth(app);
const provider = new GoogleAuthProvider();


// ========================
// FIRESTORE DATABASE
// ========================

const db = getFirestore(app);


// ========================
// MAKE GLOBAL (IMPORTANT)
// ========================

window.auth = auth;
window.provider = provider;

window.createUserWithEmailAndPassword = createUserWithEmailAndPassword;
window.signInWithEmailAndPassword = signInWithEmailAndPassword;
window.signInWithPopup = signInWithPopup;
window.signOut = signOut;
window.onAuthStateChanged = onAuthStateChanged;
window.sendEmailVerification = sendEmailVerification;

// Firestore globals (for dashboard)
window.db = db;
window.doc = doc;
window.setDoc = setDoc;
window.getDoc = getDoc;
window.updateDoc = updateDoc;
window.collection = collection;
window.getDocs = getDocs;
window.increment=increment;

