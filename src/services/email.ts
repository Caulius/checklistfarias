import emailjs from 'emailjs-com';
import { getFieldLabel, formatDateBR } from '../utils/constants';

// CONFIGURAÇÃO DO EMAILJS
const SERVICE_ID = 'service_ynrhfas';
const TEMPLATE_ID = 'template_qfet6bq';
const USER_ID = 'ZhGrczy5X-gDtmM60';

// Inicializar EmailJS
emailjs.init(USER_ID);

// Função para obter URL da foto de um problema específico
const getPhotoUrls = (problems: any[], itemKey: string): string[] => {
  const problem = problems.find(p => p.itemKey === itemKey);
  return problem?.photoUrls || [];
};

// Função para obter link da foto formatado
const getPhotoLink = (problems: any[], itemKey: string): string => {
  const problem = problems.find(p => p.itemKey === itemKey);
  if (problem?.photoUrls && problem.photoUrls.length > 0) {
    return ` - ${problem.photoUrls.join(' | ')}`;
  }
  return '';
};

export const sendChecklistEmail = async (checklistData: any) => {
  try {
    // Função para obter o tipo de veículo em português
    const getVehicleTypeLabel = (type: string) => {
      const types: { [key: string]: string } = {
        'threeFourths': '3/4',
        'toco': 'Toco',
        'truck': 'Truck',
        'bitruck': 'Bitruck',
        'trailer': 'Carreta'
      };
      return types[type] || type;
    };

    // Criar lista de problemas formatada
    const problemsList = checklistData.problems.length > 0 ? 
      checklistData.problems.map((problem: any, index: number) => 
        `${index + 1}. ${getFieldLabel(problem.itemKey)}: ${problem.description}`
      ).join('\n') : 'Nenhum problema encontrado';

    // Criar lista de fotos
    const photosList = checklistData.problems
      .filter((p: any) => p.photoUrls && p.photoUrls.length > 0)
      .map((problem: any, index: number) => {
        const photoLinks = problem.photoUrls.map((url: string, photoIndex: number) => 
          `   Foto ${photoIndex + 1}: ${url}`
        ).join('\n');
        return `${index + 1}. ${problem.description}:\n${photoLinks}`;
      }).join('\n\n') || 'Nenhuma foto anexada';

    // Criar resumo completo
    const checklistSummary = `
CHECKLIST DE VEÍCULO REFRIGERADO
================================

DADOS GERAIS:
- Data: ${checklistData.completedAt.split(' ')[0]}
- Finalizado em: ${checklistData.completedAt}
- Motorista: ${checklistData.driverName}
- Tipo: ${getVehicleTypeLabel(checklistData.vehicleType)}
- Placa: ${checklistData.licensePlate}

VERIFICAÇÃO EXTERNA:
- Pneus: ${checklistData.tiresCalibrated ? 'OK' : 'ANOMALIA'}${getPhotoLink(checklistData.problems, 'tiresCalibrated')}
- Lanternas e Faróis: ${checklistData.lightsWorking ? 'OK' : 'ANOMALIA'}${getPhotoLink(checklistData.problems, 'lightsWorking')}
- Retrovisores e Vidros: ${checklistData.mirrorsGlassOk ? 'OK' : 'ANOMALIA'}${getPhotoLink(checklistData.problems, 'mirrorsGlassOk')}
- Lataria e Baú: ${checklistData.bodyworkOk ? 'OK' : 'ANOMALIA'}${getPhotoLink(checklistData.problems, 'bodyworkOk')}
- Para-choques: ${checklistData.bumpersOk ? 'OK' : 'ANOMALIA'}${getPhotoLink(checklistData.problems, 'bumpersOk')}
- Limpadores: ${checklistData.wipersWorking ? 'OK' : 'ANOMALIA'}${getPhotoLink(checklistData.problems, 'wipersWorking')}

VERIFICAÇÃO INTERNA:
- Combustível: ${checklistData.fuelLevelOk ? 'OK' : 'ANOMALIA'}${getPhotoLink(checklistData.problems, 'fuelLevelOk')}
- Óleo do Motor: ${checklistData.engineOilOk ? 'OK' : 'ANOMALIA'}${getPhotoLink(checklistData.problems, 'engineOilOk')}
- Água/Radiador: ${checklistData.waterRadiatorOk ? 'OK' : 'ANOMALIA'}${getPhotoLink(checklistData.problems, 'waterRadiatorOk')}
- Painel: ${checklistData.dashboardWorking ? 'OK' : 'ANOMALIA'}${getPhotoLink(checklistData.problems, 'dashboardWorking')}
- Extintor: ${checklistData.fireExtinguisherValid ? 'OK' : 'ANOMALIA'}${getPhotoLink(checklistData.problems, 'fireExtinguisherValid')}
- Cintos: ${checklistData.seatbeltsWorking ? 'OK' : 'ANOMALIA'}${getPhotoLink(checklistData.problems, 'seatbeltsWorking')}

SISTEMA DE REFRIGERAÇÃO:
- Temperatura Inicial: ${checklistData.initialTemperature || 'N/A'}°C
- Temperatura Programada: ${checklistData.programmedTemperature || 'N/A'}°C
- Equipamento: ${checklistData.refrigerationWorking ? 'OK' : 'ANOMALIA'}${getPhotoLink(checklistData.problems, 'refrigerationWorking')}
- Baú Limpo: ${checklistData.coldChamberClean ? 'OK' : 'ANOMALIA'}${getPhotoLink(checklistData.problems, 'coldChamberClean')}
- Motor Refrigeração: ${checklistData.refrigeratorMotorOk ? 'OK' : 'ANOMALIA'}${getPhotoLink(checklistData.problems, 'refrigeratorMotorOk')}
- Combustível Refrigerador: ${checklistData.refrigeratorFuelOk ? 'OK' : 'ANOMALIA'}${getPhotoLink(checklistData.problems, 'refrigeratorFuelOk')}

DOCUMENTAÇÃO:
- CRLV: ${checklistData.crlvValid ? 'OK' : 'ANOMALIA'}${getPhotoLink(checklistData.problems, 'crlvValid')}
- CNH: ${checklistData.cnhValid ? 'OK' : 'ANOMALIA'}${getPhotoLink(checklistData.problems, 'cnhValid')}
- Documentos Entrega: ${checklistData.deliveryDocumentsAvailable ? 'OK' : 'ANOMALIA'}${getPhotoLink(checklistData.problems, 'deliveryDocumentsAvailable')}
- Notas e Taxas: ${checklistData.deliveryNotesAvailable ? 'OK' : 'ANOMALIA'}${getPhotoLink(checklistData.problems, 'deliveryNotesAvailable')}
- Tablet: ${checklistData.tabletAvailable ? 'OK' : 'ANOMALIA'}${getPhotoLink(checklistData.problems, 'tabletAvailable')}
- Planilha de Rodagem: ${checklistData.planilhaRodagemFilled ? 'OK' : 'ANOMALIA'}${getPhotoLink(checklistData.problems, 'planilhaRodagemFilled')}

PROBLEMAS ENCONTRADOS: ${checklistData.problems.length}
${problemsList}

OBSERVAÇÕES:
${checklistData.generalObservations || 'Nenhuma observação'}

ID: ${checklistData.id}
    `;

    const templateParams = {
      to_email: 'fariaslogapp@gmail.com',
      from_name: 'Sistema de Checklist',
      reply_to: 'noreply@sistema-checklist.com',
      
      // Dados básicos
      driver_name: checklistData.driverName,
      license_plate: checklistData.licensePlate,
      completion_date: checklistData.completedAt.replace(/\//g, '-'),
      checklist_date: new Date().toLocaleDateString('pt-BR'),
      vehicle_type: getVehicleTypeLabel(checklistData.vehicleType),
      initial_temperature: checklistData.initialTemperature || 'N/A',
      programmed_temperature: checklistData.programmedTemperature || 'N/A',
      
      // Contadores
      problems_count: checklistData.problems.length,
      photos_count: checklistData.problems.reduce((total: number, p: any) => 
        total + (p.photoUrls ? p.photoUrls.length : 0), 0),
      
      // Controle de exibição de seções
      has_problems: checklistData.problems.length > 0 ? 'show' : '',
      no_problems: checklistData.problems.length === 0 ? 'show' : '',
      
      // Listas
      problems_list: problemsList,
      problem_photos: photosList,
      general_observations: checklistData.generalObservations || 'Nenhuma observação',
      checklist_summary: checklistSummary,
      checklist_id: checklistData.id,
      
      // Status dos itens (como texto simples)
      tires_status: checklistData.tiresCalibrated ? 'OK' : 'ANOMALIA',
      lights_status: checklistData.lightsWorking ? 'OK' : 'ANOMALIA',
      mirrors_status: checklistData.mirrorsGlassOk ? 'OK' : 'ANOMALIA',
      bodywork_status: checklistData.bodyworkOk ? 'OK' : 'ANOMALIA',
      bumpers_status: checklistData.bumpersOk ? 'OK' : 'ANOMALIA',
      wipers_status: checklistData.wipersWorking ? 'OK' : 'ANOMALIA',
      
      fuel_status: checklistData.fuelLevelOk ? 'OK' : 'ANOMALIA',
      oil_status: checklistData.engineOilOk ? 'OK' : 'ANOMALIA',
      water_status: checklistData.waterRadiatorOk ? 'OK' : 'ANOMALIA',
      dashboard_status: checklistData.dashboardWorking ? 'OK' : 'ANOMALIA',
      extinguisher_status: checklistData.fireExtinguisherValid ? 'OK' : 'ANOMALIA',
      seatbelts_status: checklistData.seatbeltsWorking ? 'OK' : 'ANOMALIA',
      
      refrigeration_status: checklistData.refrigerationWorking ? 'OK' : 'ANOMALIA',
      chamber_status: checklistData.coldChamberClean ? 'OK' : 'ANOMALIA',
      motor_status: checklistData.refrigeratorMotorOk ? 'OK' : 'ANOMALIA',
      fuel_refrigerator_status: checklistData.refrigeratorFuelOk ? 'OK' : 'ANOMALIA',
      
      crlv_status: checklistData.crlvValid ? 'OK' : 'ANOMALIA',
      cnh_status: checklistData.cnhValid ? 'OK' : 'ANOMALIA',
      documents_status: checklistData.deliveryDocumentsAvailable ? 'OK' : 'ANOMALIA',
      notes_status: checklistData.deliveryNotesAvailable ? 'OK' : 'ANOMALIA',
      tablet_status: checklistData.tabletAvailable ? 'OK' : 'ANOMALIA',
      planilha_rodagem_status: checklistData.planilhaRodagemFilled ? 'OK' : 'ANOMALIA',
      
      // Links das fotos formatados para exibir ao lado do status
      tires_photo_link: getPhotoLink(checklistData.problems, 'tiresCalibrated'),
      lights_photo_link: getPhotoLink(checklistData.problems, 'lightsWorking'),
      mirrors_photo_link: getPhotoLink(checklistData.problems, 'mirrorsGlassOk'),
      bodywork_photo_link: getPhotoLink(checklistData.problems, 'bodyworkOk'),
      bumpers_photo_link: getPhotoLink(checklistData.problems, 'bumpersOk'),
      wipers_photo_link: getPhotoLink(checklistData.problems, 'wipersWorking'),
      
      fuel_photo_link: getPhotoLink(checklistData.problems, 'fuelLevelOk'),
      oil_photo_link: getPhotoLink(checklistData.problems, 'engineOilOk'),
      water_photo_link: getPhotoLink(checklistData.problems, 'waterRadiatorOk'),
      dashboard_photo_link: getPhotoLink(checklistData.problems, 'dashboardWorking'),
      extinguisher_photo_link: getPhotoLink(checklistData.problems, 'fireExtinguisherValid'),
      seatbelts_photo_link: getPhotoLink(checklistData.problems, 'seatbeltsWorking'),
      
      refrigeration_photo_link: getPhotoLink(checklistData.problems, 'refrigerationWorking'),
      chamber_photo_link: getPhotoLink(checklistData.problems, 'coldChamberClean'),
      motor_photo_link: getPhotoLink(checklistData.problems, 'refrigeratorMotorOk'),
      fuel_refrigerator_photo_link: getPhotoLink(checklistData.problems, 'refrigeratorFuelOk'),
      
      crlv_photo_link: getPhotoLink(checklistData.problems, 'crlvValid'),
      cnh_photo_link: getPhotoLink(checklistData.problems, 'cnhValid'),
      documents_photo_link: getPhotoLink(checklistData.problems, 'deliveryDocumentsAvailable'),
      notes_photo_link: getPhotoLink(checklistData.problems, 'deliveryNotesAvailable'),
      tablet_photo_link: getPhotoLink(checklistData.problems, 'tabletAvailable'),
      planilha_rodagem_photo_link: getPhotoLink(checklistData.problems, 'planilhaRodagemFilled')
    };

    console.log('Enviando email com parâmetros:', templateParams);

    const result = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams);
    console.log('E-mail enviado com sucesso:', result);
    return true;
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    throw new Error(`Falha no envio do e-mail: ${error}`);
  }
};
