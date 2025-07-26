export interface ChecklistData {
  // Dados Iniciais
  date: string;
  driverName: string;
  vehicleType: 'threeFourths' | 'toco' | 'truck' | 'bitruck' | 'trailer';
  licensePlate: string;

  // Verificação Externa
  tiresCalibrated: boolean;
  lightsWorking: boolean;
  mirrorsGlassOk: boolean;
  bodyworkOk: boolean;
  bumpersOk: boolean;
  wipersWorking: boolean;

  // Verificação Interna
  fuelLevelOk: boolean;
  engineOilOk: boolean;
  waterRadiatorOk: boolean;
  dashboardWorking: boolean;
  fireExtinguisherValid: boolean;
  seatbeltsWorking: boolean;

  // Sistema de Refrigeração
  refrigerationWorking: boolean;
  initialTemperature: number | null;
  coldChamberClean: boolean;
  refrigeratorMotorOk: boolean;
  refrigeratorFuelOk: boolean;

  // Documentação
  crlvValid: boolean;
  cnhValid: boolean;
  deliveryDocumentsAvailable: boolean;
  deliveryNotesAvailable: boolean;
  tabletAvailable: boolean;

  // Observações
  generalObservations: string;

  // Problemas encontrados
  problems: Problem[];

  // Fotos obrigatórias
  dashboardPhoto?: string;
  bodyPhoto?: string;
  coldChamberPhoto?: string;

  // Confirmação
  declarationAccepted: boolean;

  // Metadata
  createdAt: string;
  id: string;
}

export interface Problem {
  itemKey: string;
  description: string;
  photoUrl?: string;
}

export interface ChecklistItem {
  key: string;
  label: string;
  required?: boolean;
}