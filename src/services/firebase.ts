import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, where, Timestamp } from 'firebase/firestore';
import { ChecklistData } from '../types/checklist';

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

export const getChecklists = async (startDate?: string, endDate?: string): Promise<ChecklistData[]> => {
  try {
    let q = query(collection(db, 'checklists'), orderBy('createdAt', 'desc'));
    
    // Se datas forem fornecidas, adicionar filtro
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      q = query(
        collection(db, 'checklists'),
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', 'desc')
      );
    }
    
    const querySnapshot = await getDocs(q);
    const checklists: ChecklistData[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      checklists.push({
        ...data,
        id: doc.id
      } as ChecklistData);
    });
    
    return checklists;
  } catch (error) {
    console.error('Erro ao buscar checklists:', error);
    throw error;
  }
};

export const syncChecklistsToLocal = async (): Promise<ChecklistData[]> => {
  try {
    const firebaseChecklists = await getChecklists();
    
    // Salvar no localStorage para backup
    localStorage.setItem('checklists', JSON.stringify(firebaseChecklists));
    
    return firebaseChecklists;
  } catch (error) {
    console.error('Erro ao sincronizar checklists:', error);
    
    // Em caso de erro, tentar carregar do localStorage
    const localChecklists = localStorage.getItem('checklists');
    return localChecklists ? JSON.parse(localChecklists) : [];
  }
};
