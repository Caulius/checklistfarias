import { Vehicle } from '../types/vehicle';

const VEHICLES_STORAGE_KEY = 'registered_vehicles';

export const saveVehicle = (vehicle: Vehicle): void => {
  const vehicles = getVehicles();
  const existingIndex = vehicles.findIndex(v => v.licensePlate === vehicle.licensePlate);
  
  if (existingIndex >= 0) {
    vehicles[existingIndex] = vehicle;
  } else {
    vehicles.push(vehicle);
  }
  
  localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(vehicles));
};

export const getVehicles = (): Vehicle[] => {
  try {
    const stored = localStorage.getItem(VEHICLES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Erro ao carregar veículos:', error);
    return [];
  }
};

export const deleteVehicle = (licensePlate: string): void => {
  const vehicles = getVehicles().filter(v => v.licensePlate !== licensePlate);
  localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(vehicles));
};

export const getVehicleByPlate = (licensePlate: string): Vehicle | undefined => {
  const vehicles = getVehicles();
  return vehicles.find(v => v.licensePlate === licensePlate);
};
