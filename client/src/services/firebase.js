import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// Cấu hình Firebase thực tế của dự án food-681ac
const firebaseConfig = {
  apiKey: "AIzaSyBh6U7AeXUg9jMh-b5VvZB63uAAQYoDOi8",
  authDomain: "food-681ac.firebaseapp.com",
  projectId: "food-681ac",
  storageBucket: "food-681ac.firebasestorage.app",
  messagingSenderId: "443216665902",
  appId: "1:443216665902:web:5731772265f2eec50beebf",
  measurementId: "G-R280FQHQHG"
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
