import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAwX72obWD17oNzxlT1y-IxxJVYKFgBqY0",
  authDomain: "nexuspartners-connect.firebaseapp.com",
  projectId: "nexuspartners-connect",
  storageBucket: "nexuspartners-connect.firebasestorage.app",
  messagingSenderId: "905049465425",
  appId: "1:905049465425:web:b1115bdbcbbf8f5a7c0e70",
  measurementId: "G-LN4RFK73TM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;
