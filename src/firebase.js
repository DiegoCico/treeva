import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; 

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBF_iP4XpTsuiiM1i4Z8-9y2pvE2rtCfOQ",
  authDomain: "treeva-16dbd.firebaseapp.com",
  projectId: "treeva-16dbd",
  storageBucket: "treeva-16dbd.appspot.com",
  messagingSenderId: "107545684737",
  appId: "1:107545684737:web:6601133c6fe981484dc900",
  measurementId: "G-4CTVSGE2GP"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);