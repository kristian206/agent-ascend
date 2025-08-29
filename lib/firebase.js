import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyAhmDjn32Rhm4Sujd3dZusLISaATXo_4Vc",
  authDomain: "sales-thermometer.firebaseapp.com",
  projectId: "sales-thermometer",
  storageBucket: "sales-thermometer.firebasestorage.app",
  messagingSenderId: "311711253325",
  appId: "1:311711253325:web:7e046a09404c1d880dad04",
  measurementId: "G-Z75N01Q0XZ"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export default app