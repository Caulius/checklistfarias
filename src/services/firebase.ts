import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCQQsvgJADYeC3vz__uJmdd5apYxDaHDWc",
  authDomain: "checklistfarias.firebaseapp.com",
  projectId: "checklistfarias",
  storageBucket: "checklistfarias.firebasestorage.app",
  messagingSenderId: "772967991045",
  appId: "1:772967991045:web:04866321865997c38ad96c",
  measurementId: "G-VVCP4J6BGN"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const saveChecklist = async (data: any) => {
  const docRef = await addDoc(collection(db, 'checklists'), data);
  return docRef.id;
};