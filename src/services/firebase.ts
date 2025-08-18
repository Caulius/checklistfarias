import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, where, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { ChecklistData } from '../types/checklist';
import { Vehicle } from '../types/vehicle';

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

// ===== CHECKLISTS =====
export const saveChecklist = async (data: ChecklistData): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'checklists'), {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    console.log('Checklist salvo no Firebase com ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Erro ao salvar checklist no Firebase:', error);
    throw new Error(`Falha ao salvar checklist. Verifique sua conexão com a internet.`);
  }
};

export const getChecklists = async (startDate?: string, endDate?: string): Promise<ChecklistData[]> => {
  try {
    let q = query(collection(db, 'checklists'), orderBy('createdAt', 'desc'));
    
    // Se datas forem fornecidas, adicionar filtro
    if (startDate && endDate) {
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
    
    console.log(`${checklists.length} checklists carregados do Firebase`);
    return checklists;
  } catch (error) {
    console.error('Erro ao buscar checklists no Firebase:', error);
    throw new Error(`Falha ao carregar checklists. Verifique sua conexão com a internet.`);
  }
};

export const updateChecklist = async (id: string, data: Partial<ChecklistData>): Promise<void> => {
  try {
    const docRef = doc(db, 'checklists', id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString()
    });
    console.log('Checklist atualizado no Firebase:', id);
  } catch (error) {
    console.error('Erro ao atualizar checklist no Firebase:', error);
    throw new Error(`Falha ao atualizar checklist. Verifique sua conexão com a internet.`);
  }
};

export const deleteChecklist = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'checklists', id));
    console.log('Checklist excluído do Firebase:', id);
  } catch (error) {
    console.error('Erro ao excluir checklist do Firebase:', error);
    throw new Error(`Falha ao excluir checklist. Verifique sua conexão com a internet.`);
  }
};

// ===== VEÍCULOS =====
export const saveVehicle = async (vehicle: Vehicle): Promise<string> => {
  try {
    const docRef = doc(db, 'vehicles', vehicle.id);
    await setDoc(docRef, {
      ...vehicle,
      updatedAt: new Date().toISOString()
    });
    console.log('Veículo salvo no Firebase:', vehicle.id);
    return vehicle.id;
  } catch (error) {
    console.error('Erro ao salvar veículo no Firebase:', error);
    throw new Error(`Falha ao salvar veículo. Verifique sua conexão com a internet.`);
  }
};

export const getVehicles = async (): Promise<Vehicle[]> => {
  try {
    const q = query(collection(db, 'vehicles'), orderBy('licensePlate', 'asc'));
    const querySnapshot = await getDocs(q);
    const vehicles: Vehicle[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      vehicles.push({
        ...data,
        id: doc.id
      } as Vehicle);
    });
    
    console.log(`${vehicles.length} veículos carregados do Firebase`);
    return vehicles;
  } catch (error) {
    console.error('Erro ao buscar veículos no Firebase:', error);
    
    // Se for erro de permissão, retorna array vazio em vez de falhar
    if (error instanceof Error && error.message.includes('Missing or insufficient permissions')) {
      console.warn('Permissões insuficientes para acessar veículos. Retornando lista vazia.');
      return [];
    }
    
    // Para outros erros, ainda lança exceção
    throw new Error(`Falha ao carregar veículos. Verifique sua conexão com a internet.`);
  }
};

export const updateVehicle = async (id: string, data: Partial<Vehicle>): Promise<void> => {
  try {
    const docRef = doc(db, 'vehicles', id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString()
    });
    console.log('Veículo atualizado no Firebase:', id);
  } catch (error) {
    console.error('Erro ao atualizar veículo no Firebase:', error);
    throw new Error(`Falha ao atualizar veículo. Verifique sua conexão com a internet.`);
  }
};

export const deleteVehicle = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'vehicles', id));
    console.log('Veículo excluído do Firebase:', id);
  } catch (error) {
    console.error('Erro ao excluir veículo do Firebase:', error);
    throw new Error(`Falha ao excluir veículo. Verifique sua conexão com a internet.`);
  }
};

export const getVehicleByPlate = async (licensePlate: string): Promise<Vehicle | null> => {
  try {
    const q = query(
      collection(db, 'vehicles'), 
      where('licensePlate', '==', licensePlate)
    );
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    return {
      ...doc.data(),
      id: doc.id
    } as Vehicle;
  } catch (error) {
    console.error('Erro ao buscar veículo por placa no Firebase:', error);
    throw new Error(`Falha ao buscar veículo. Verifique sua conexão com a internet.`);
  }
};
