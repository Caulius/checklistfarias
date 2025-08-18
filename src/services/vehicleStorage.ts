import { Vehicle } from '../types/vehicle';
import { saveVehicle as saveVehicleFirebase, getVehicles as getVehiclesFirebase, deleteVehicle as deleteVehicleFirebase, getVehicleByPlate as getVehicleByPlateFirebase } from './firebase';

// Todas as operações agora usam diretamente o Firebase
export const saveVehicle = async (vehicle: Vehicle): Promise<void> => {
  try {
    await saveVehicleFirebase(vehicle);
  } catch (error) {
    console.error('Erro ao salvar veículo:', error);
    throw error;
  }
};

export const getVehicles = async (): Promise<Vehicle[]> => {
  try {
    return await getVehiclesFirebase();
  } catch (error) {
    console.error('Erro ao carregar veículos:', error);
    throw error;
  }
};

export const deleteVehicle = async (vehicleId: string): Promise<void> => {
  try {
    await deleteVehicleFirebase(vehicleId);
  } catch (error) {
    console.error('Erro ao excluir veículo:', error);
    throw error;
  }
};

export const getVehicleByPlate = async (licensePlate: string): Promise<Vehicle | undefined> => {
  try {
    const vehicle = await getVehicleByPlateFirebase(licensePlate);
    return vehicle || undefined;
  } catch (error) {
    console.error('Erro ao buscar veículo por placa:', error);
    throw error;
  }
};
