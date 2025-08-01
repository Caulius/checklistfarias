export const VEHICLE_TYPES = {
  threeFourths: '3/4',
  toco: 'Toco',
  truck: 'Truck',
  bitruck: 'Bitruck',
  trailer: 'Carreta'
};

export const EXTERNAL_CHECKS = [
  { key: 'tiresCalibrated', label: 'Pneus calibrados e em boas condições', shortLabel: 'Pneus' },
  { key: 'lightsWorking', label: 'Lanternas e faróis funcionando', shortLabel: 'Lanternas e Faróis' },
  { key: 'mirrorsGlassOk', label: 'Retrovisores e vidros sem danos', shortLabel: 'Retrovisores e Vidros' },
  { key: 'bodyworkOk', label: 'Lataria e Baú sem avarias visíveis', shortLabel: 'Lataria e Baú' },
  { key: 'bumpersOk', label: 'Para-choques, parabarros e para-lamas', shortLabel: 'Para-choques' },
  { key: 'wipersWorking', label: 'Limpadores de para-brisa funcionando', shortLabel: 'Limpadores' }
];

export const INTERNAL_CHECKS = [
  { key: 'fuelLevelOk', label: 'Nível de combustível adequado', shortLabel: 'Combustível' },
  { key: 'engineOilOk', label: 'Óleo do motor', shortLabel: 'Óleo do Motor' },
  { key: 'waterRadiatorOk', label: 'Nível da água/radiador', shortLabel: 'Água/Radiador' },
  { key: 'dashboardWorking', label: 'Painel de instrumentos', shortLabel: 'Painel' },
  { key: 'fireExtinguisherValid', label: 'Extintor de incêndio válido', shortLabel: 'Extintor' },
  { key: 'seatbeltsWorking', label: 'Cintos de segurança funcionando', shortLabel: 'Cintos' }
];

export const REFRIGERATION_CHECKS = [
  { key: 'refrigerationWorking', label: 'Equipamento funcionando', shortLabel: 'Equipamento Funcionando' },
  { key: 'coldChamberClean', label: 'Baú limpo e sem odores', shortLabel: 'Baú Limpo' },
  { key: 'refrigeratorMotorOk', label: 'Motor da Refrigeração', shortLabel: 'Motor Refrigeração' },
  { key: 'refrigeratorFuelOk', label: 'Combustível específico do refrigerador ok (se aplicável)', shortLabel: 'Combustível Refrigerador' }
];

export const DOCUMENTATION_CHECKS = [
  { key: 'crlvValid', label: 'CRLV em dia', shortLabel: 'CRLV' },
  { key: 'cnhValid', label: 'CNH compatível e válida', shortLabel: 'CNH' },
  { key: 'deliveryDocumentsAvailable', label: 'Pasta com Notas e Taxas de entrega', shortLabel: 'Documentos Entrega' },
  { key: 'tabletAvailable', label: 'Tablet', shortLabel: 'Tablet' },
  { key: 'planilhaRodagemFilled', label: 'Preenchimento Planilha Rodagem', shortLabel: 'Planilha Rodagem' }
];

// Mapeamento para tradução dos campos
export const FIELD_LABELS = {
  // Verificação Externa
  tiresCalibrated: 'Pneus',
  lightsWorking: 'Lanternas e Faróis',
  mirrorsGlassOk: 'Retrovisores e Vidros',
  bodyworkOk: 'Lataria e Baú',
  bumpersOk: 'Para-choques',
  wipersWorking: 'Limpadores',
  
  // Verificação Interna
  fuelLevelOk: 'Combustível',
  engineOilOk: 'Óleo do Motor',
  waterRadiatorOk: 'Água/Radiador',
  dashboardWorking: 'Painel',
  fireExtinguisherValid: 'Extintor',
  seatbeltsWorking: 'Cintos',
  
  // Sistema de Refrigeração
  refrigerationWorking: 'Equipamento Funcionando',
  coldChamberClean: 'Baú Limpo',
  refrigeratorMotorOk: 'Motor Refrigeração',
  refrigeratorFuelOk: 'Combustível Refrigerador',
  
  // Documentação
  crlvValid: 'CRLV',
  cnhValid: 'CNH',
  deliveryDocumentsAvailable: 'Documentos Entrega',
  tabletAvailable: 'Tablet',
  planilhaRodagemFilled: 'Planilha Rodagem'
};

// Função para formatar data em padrão brasileiro
export const formatDateBR = (dateString: string): string => {
  // Se a data já está no formato YYYY-MM-DD, criar a data corretamente
  if (dateString.includes('-')) {
    const [year, month, day] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('pt-BR');
  }
  
  // Para outros formatos, usar o método padrão
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

// Função para obter label em português
export const getFieldLabel = (fieldKey: string): string => {
  return FIELD_LABELS[fieldKey as keyof typeof FIELD_LABELS] || fieldKey;
};
