import React, { useState, useEffect } from 'react';
import { Truck, FileText, Settings, Thermometer, CheckCircle, User, Calendar, BarChart3, Loader2, Plus } from 'lucide-react';
import { FormSection } from './components/FormSection';
import { CheckboxWithProblem } from './components/CheckboxWithProblem';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ReportsTab } from './components/ReportsTab';
import { VehicleRegistrationTab } from './components/VehicleRegistrationTab';
import { AuthModal } from './components/AuthModal';
import { ChecklistData, Problem } from './types/checklist';
import { Vehicle } from './types/vehicle';
import { saveChecklist, syncChecklistsToLocal } from './services/firebase';
import { sendChecklistEmail } from './services/email';
import { getVehicleByPlate, getVehicles } from './services/vehicleStorage';
import { VEHICLE_TYPES, EXTERNAL_CHECKS, INTERNAL_CHECKS, REFRIGERATION_CHECKS, DOCUMENTATION_CHECKS, PRODUCT_TYPES } from './utils/constants';
import { v4 as uuidv4 } from 'uuid';

function App() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<'checklist' | 'reports' | 'vehicles'>('checklist');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [savedChecklists, setSavedChecklists] = useState<ChecklistData[]>([]);
  const [syncingData, setSyncingData] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState<Set<string>>(new Set());
  const [registeredVehicles, setRegisteredVehicles] = useState<Vehicle[]>([]);
  const [formData, setFormData] = useState<ChecklistData>({
    // Dados Iniciais
    date: new Date().toISOString().split('T')[0],
    driverName: '',
    vehicleType: 'toco',
    licensePlate: '',

    // Verificação Externa
    tiresCalibrated: false,
    lightsWorking: false,
    mirrorsGlassOk: false,
    bodyworkOk: false,
    bumpersOk: false,
    wipersWorking: false,

    // Verificação Interna
    fuelLevelOk: false,
    engineOilOk: false,
    waterRadiatorOk: false,
    dashboardWorking: false,
    fireExtinguisherValid: false,
    seatbeltsWorking: false,

    // Sistema de Refrigeração
    refrigerationWorking: false,
    initialTemperature: null,
    programmedTemperature: null,
    productTypes: [],
    coldChamberClean: false,
    refrigeratorMotorOk: false,
    refrigeratorFuelOk: false,

    // Documentação
    crlvValid: false,
    cnhValid: false,
    deliveryDocumentsAvailable: false,
    deliveryNotesAvailable: false,
    tabletAvailable: false,
    planilhaRodagemFilled: false,

    // Observações
    generalObservations: '',

    // Problemas
    problems: [],

    // Confirmação
    declarationAccepted: false,

    // Metadata
    createdAt: new Date().toISOString(),
    id: uuidv4()
  });

  // Register service worker for PWA
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }
  }, []);

  // Load saved checklists from localStorage
  useEffect(() => {
    loadChecklists();
    loadRegisteredVehicles();
  }, []);

  const loadRegisteredVehicles = () => {
    const vehicles = getVehicles();
    setRegisteredVehicles(vehicles);
  };

  const loadChecklists = async () => {
    setSyncingData(true);
    try {
      const checklists = await syncChecklistsToLocal();
      setSavedChecklists(checklists);
    } catch (error) {
      console.error('Erro ao carregar checklists:', error);
      // Fallback para localStorage
      const saved = localStorage.getItem('checklists');
      if (saved) {
        try {
          setSavedChecklists(JSON.parse(saved));
        } catch (parseError) {
          console.error('Error parsing saved checklists:', parseError);
        }
      }
    } finally {
      setSyncingData(false);
    }
  };

  const handleInputChange = (field: keyof ChecklistData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCheckboxChange = (field: keyof ChecklistData, checked: boolean, problemData?: { description: string; photoUrls?: string[]; isUploading?: boolean }) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked
    }));

    // Gerenciar estado de upload
    if (problemData?.isUploading === true) {
      setUploadingPhotos(prev => new Set([...prev, field]));
    } else if (problemData?.isUploading === false) {
      setUploadingPhotos(prev => {
        const newSet = new Set(prev);
        newSet.delete(field);
        return newSet;
      });
    }

    if (!checked && problemData) {
      const newProblem: Problem = {
        itemKey: field,
        description: problemData.description,
        photoUrls: problemData.photoUrls || []
      };

      setFormData(prev => ({
        ...prev,
        problems: [...prev.problems.filter(p => p.itemKey !== field), newProblem]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        problems: prev.problems.filter(p => p.itemKey !== field)
      }));
    }
  };

  const validateForm = (): boolean => {
    if (!formData.driverName.trim()) {
      alert('Por favor, informe o nome do motorista.');
      return false;
    }

    if (!formData.licensePlate.trim()) {
      alert('Por favor, informe a placa do veículo.');
      return false;
    }

    if (!formData.declarationAccepted) {
      alert('Por favor, confirme que recebeu o veículo em boas condições.');
      return false;
    }

    if (formData.productTypes.length === 0) {
      alert('Por favor, selecione pelo menos um tipo de produto carregado.');
      return false;
    }

    return true;
  };

  const hasUploadingPhotos = uploadingPhotos.size > 0;
  const isFormDisabled = loading || !formData.declarationAccepted || hasUploadingPhotos;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (hasUploadingPhotos) {
      alert('Aguarde o upload de todas as fotos ser concluído antes de finalizar o checklist.');
      return;
    }

    setLoading(true);

    try {
      const finalData = {
        ...formData,
        problems: formData.problems,
        completedAt: new Date().toLocaleString('pt-BR', {
          timeZone: 'America/Sao_Paulo',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      };

      // Save to Firestore
      await saveChecklist(finalData);

      // Recarregar checklists do Firebase
      await loadChecklists();

      // Send email
      await sendChecklistEmail(finalData);

      setSubmitted(true);
    } catch (error) {
      console.error('Erro ao enviar checklist:', error);
      alert('Erro ao enviar checklist. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleVehicleSelect = (vehicle: Vehicle) => {
    setFormData(prev => ({
      ...prev,
      licensePlate: vehicle.licensePlate,
      vehicleType: vehicle.vehicleType
    }));
    setActiveTab('checklist');
  };

  const handleLicensePlateChange = (licensePlate: string) => {
    const selectedVehicle = registeredVehicles.find(v => v.licensePlate === licensePlate);
    
    setFormData(prev => ({
      ...prev,
      licensePlate: licensePlate,
      vehicleType: selectedVehicle ? selectedVehicle.vehicleType : 'toco'
    }));
  };

  const handleReportsClick = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    } else {
      // Sincronizar dados ao acessar relatórios
      loadChecklists();
      setActiveTab('reports');
    }
  };

  const handleVehiclesClick = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    } else {
      setActiveTab('vehicles');
    }
  };

  const handleAuthenticate = () => {
    setIsAuthenticated(true);
    if (activeTab === 'reports') {
      loadChecklists();
    } else if (activeTab === 'vehicles') {
      loadRegisteredVehicles();
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <CheckCircle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">✅ Checklist concluído com sucesso!</h2>
          <p className="text-gray-300 mb-4">
            Não se esqueça de preencher a Planilha de Rodagem.
          </p>
          <p className="text-gray-300 mb-6">
            Desejamos uma boa viagem — dirija com atenção e tenha um excelente dia de trabalho!
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors font-medium"
          >
            Fazer Novo Checklist
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {loading && <LoadingSpinner message="Enviando checklist..." />}
      {syncingData && <LoadingSpinner message="Sincronizando dados..." />}
      
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthenticate={handleAuthenticate}
      />
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Truck className="h-12 w-12 text-orange-500 mr-3" />
            <h1 className="text-3xl font-bold text-white">
              Checklist de Veículos
            </h1>
          </div>
          <p className="text-gray-300">
            Caminhões Refrigerados - Verificação Pré-Operacional
          </p>
          
          {/* Tab Navigation */}
          <div className="flex justify-center mt-6">
            <div className="bg-gray-800 rounded-lg p-1 border border-gray-700 flex flex-wrap justify-center">
              <button
                onClick={() => setActiveTab('checklist')}
                className={`flex items-center space-x-2 px-4 py-3 rounded-md font-medium transition-all ${
                  activeTab === 'checklist'
                    ? 'bg-orange-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Truck className="h-5 w-5" />
                <span>Checklist</span>
              </button>
              <button
                onClick={handleReportsClick}
                className={`flex items-center space-x-2 px-4 py-3 rounded-md font-medium transition-all ${
                  activeTab === 'reports'
                    ? 'bg-orange-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <BarChart3 className="h-5 w-5" />
                <span>Relatórios {syncingData ? '(Sincronizando...)' : ''}</span>
              </button>
              <button
                onClick={handleVehiclesClick}
                className={`flex items-center space-x-2 px-4 py-3 rounded-md font-medium transition-all ${
                  activeTab === 'vehicles'
                    ? 'bg-orange-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Plus className="h-5 w-5" />
                <span>Cadastro</span>
              </button>
            </div>
          </div>
        </div>

        {activeTab === 'checklist' ? (
          <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados Iniciais */}
          <FormSection
            title="Dados Iniciais"
            icon={<User className="h-6 w-6" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Data
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 placeholder-gray-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Nome do Motorista *
                </label>
                <input
                  type="text"
                  value={formData.driverName}
                  onChange={(e) => handleInputChange('driverName', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 placeholder-gray-400"
                  placeholder="Digite seu nome completo"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Tipo de Veículo *
                </label>
                <select
                  value={formData.vehicleType}
                  className="w-full px-4 py-3 bg-gray-600 border border-gray-500 text-white rounded-lg cursor-not-allowed"
                  disabled={true}
                  required
                >
                  {Object.entries(VEHICLE_TYPES).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
                <p className="text-blue-400 text-sm mt-1">
                  ℹ️ Tipo definido automaticamente pela placa selecionada
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Placa do Veículo *
                </label>
                {registeredVehicles.length > 0 ? (
                  <select
                    value={formData.licensePlate}
                    onChange={(e) => handleLicensePlateChange(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  >
                    <option value="">Selecione um veículo cadastrado</option>
                    {registeredVehicles
                      .sort((a, b) => a.licensePlate.localeCompare(b.licensePlate))
                      .map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.licensePlate}>
                        {vehicle.licensePlate} - {VEHICLE_TYPES[vehicle.vehicleType]}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value=""
                      className="w-full px-4 py-3 bg-gray-600 border border-gray-500 text-gray-400 rounded-lg cursor-not-allowed"
                      placeholder="Nenhum veículo cadastrado"
                      disabled
                      required
                    />
                    <p className="text-yellow-400 text-sm">
                      ⚠️ Cadastre veículos na aba "Cadastro" para poder fazer checklists
                    </p>
                  </div>
                )}
                {formData.licensePlate && (
                  <p className="text-green-400 text-sm mt-1">
                    ✓ Veículo: {formData.licensePlate} - {VEHICLE_TYPES[formData.vehicleType]}
                  </p>
                )}
              </div>
            </div>
          </FormSection>

          {/* Verificação Externa */}
          <FormSection
            title="Verificação Externa do Veículo"
            icon={<Settings className="h-6 w-6" />}
          >
            <div className="space-y-4">
              {EXTERNAL_CHECKS.map((check) => (
                <CheckboxWithProblem
                  key={check.key}
                  label={check.label}
                  checked={formData[check.key as keyof ChecklistData] as boolean}
                  onChange={(checked, problemData) => handleCheckboxChange(check.key as keyof ChecklistData, checked, problemData)}
                  itemKey={check.key}
                />
              ))}
            </div>
          </FormSection>

          {/* Verificação Interna */}
          <FormSection
            title="Verificação Interna / Cabine"
            icon={<FileText className="h-6 w-6" />}
          >
            <div className="space-y-4">
              {INTERNAL_CHECKS.map((check) => (
                <CheckboxWithProblem
                  key={check.key}
                  label={check.label}
                  checked={formData[check.key as keyof ChecklistData] as boolean}
                  onChange={(checked, problemData) => handleCheckboxChange(check.key as keyof ChecklistData, checked, problemData)}
                  itemKey={check.key}
                />
              ))}
            </div>
          </FormSection>

          {/* Sistema de Refrigeração */}
          <FormSection
            title="Verificação do Sistema de Refrigeração"
            icon={<Thermometer className="h-6 w-6" />}
          >
            <div className="space-y-4">
              {REFRIGERATION_CHECKS.map((check) => (
                <CheckboxWithProblem
                  key={check.key}
                  label={check.label}
                  checked={formData[check.key as keyof ChecklistData] as boolean}
                  onChange={(checked, problemData) => handleCheckboxChange(check.key as keyof ChecklistData, checked, problemData)}
                  itemKey={check.key}
                />
              ))}

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Temperatura Inicial (°C)
                </label>
                <input
                  type="text"
                  value={formData.initialTemperature || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow empty string
                    if (value === '') {
                      handleInputChange('initialTemperature', null);
                      return;
                    }
                    
                    // Allow only valid temperature patterns: -15, -15.5, -15,5, 15, 15.5, 15,5
                    if (/^-?\d*[.,]?\d*$/.test(value)) {
                      // Don't parse incomplete inputs like "-" or "15."
                      if (value === '-' || value.endsWith('.') || value.endsWith(',')) {
                        // Just update the display value without parsing
                        handleInputChange('initialTemperature', value);
                      } else {
                        // Parse complete values
                        const normalizedValue = value.replace(',', '.');
                        const numericValue = parseFloat(normalizedValue);
                        if (!isNaN(numericValue)) {
                          handleInputChange('initialTemperature', numericValue);
                        }
                      }
                    }
                  }}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 placeholder-gray-400 text-center text-lg"
                  placeholder="Ex: -18.5 ou -10.2"
                />
                <p className="mt-2 text-sm text-gray-400">
                  Digite a temperatura exata mostrada no display do veículo
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Temperatura Programada (°C)
                </label>
                <input
                  type="text"
                  value={formData.programmedTemperature || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow empty string
                    if (value === '') {
                      handleInputChange('programmedTemperature', null);
                      return;
                    }
                    
                    // Allow only valid temperature patterns: -15, -15.5, -15,5, 15, 15.5, 15,5
                    if (/^-?\d*[.,]?\d*$/.test(value)) {
                      // Don't parse incomplete inputs like "-" or "15."
                      if (value === '-' || value.endsWith('.') || value.endsWith(',')) {
                        // Just update the display value without parsing
                        handleInputChange('programmedTemperature', value);
                      } else {
                        // Parse complete values
                        const normalizedValue = value.replace(',', '.');
                        const numericValue = parseFloat(normalizedValue);
                        if (!isNaN(numericValue)) {
                          handleInputChange('programmedTemperature', numericValue);
                        }
                      }
                    }
                  }}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 placeholder-gray-400 text-center text-lg"
                  placeholder="Ex: -18.0 ou -15.5"
                />
                <p className="mt-2 text-sm text-gray-400">
                  Digite a temperatura programada no equipamento
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-3">
                  Tipo de Produto Carregado *
                </label>
                <div className="space-y-3">
                  <p className="text-sm text-gray-400">
                    Selecione pelo menos um tipo de produto (obrigatório):
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    {Object.entries(PRODUCT_TYPES).map(([key, label]) => (
                      <label key={key} className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg border border-gray-600 hover:bg-gray-600 transition-colors cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.productTypes.includes(key)}
                          onChange={(e) => {
                            const newProductTypes = e.target.checked
                              ? [...formData.productTypes, key]
                              : formData.productTypes.filter(type => type !== key);
                            handleInputChange('productTypes', newProductTypes);
                          }}
                          className="h-5 w-5 text-orange-600 bg-gray-600 border-2 border-gray-500 rounded focus:ring-orange-500"
                        />
                        <span className="text-gray-100 font-medium">{label}</span>
                      </label>
                    ))}
                  </div>
                  {formData.productTypes.length > 0 && (
                    <div className="mt-3 p-3 bg-blue-900/30 border border-blue-700/50 rounded-lg">
                      <p className="text-blue-300 text-sm font-medium">
                        ✓ Produtos selecionados: {formData.productTypes.map(type => PRODUCT_TYPES[type as keyof typeof PRODUCT_TYPES]).join(', ')}
                      </p>
                    </div>
                  )}
                  {formData.productTypes.length === 0 && (
                    <div className="mt-3 p-3 bg-red-900/30 border border-red-700/50 rounded-lg">
                      <p className="text-red-300 text-sm font-medium">
                        ⚠️ Selecione pelo menos um tipo de produto
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </FormSection>

          {/* Documentação */}
          <FormSection
            title="Documentação"
            icon={<FileText className="h-6 w-6" />}
          >
            <div className="space-y-4">
              {DOCUMENTATION_CHECKS.map((check) => (
                <CheckboxWithProblem
                  key={check.key}
                  label={check.label}
                  checked={formData[check.key as keyof ChecklistData] as boolean}
                  onChange={(checked, problemData) => handleCheckboxChange(check.key as keyof ChecklistData, checked, problemData)}
                  itemKey={check.key}
                />
              ))}
            </div>
          </FormSection>

          {/* Observações */}
          <FormSection
            title="Observações Gerais"
            icon={<FileText className="h-6 w-6" />}
          >
            <textarea
              value={formData.generalObservations}
              onChange={(e) => handleInputChange('generalObservations', e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 min-h-[120px] placeholder-gray-400"
              placeholder="Digite aqui observações adicionais sobre o veículo ou carga..."
            />
          </FormSection>

          {/* Confirmação */}
          <FormSection
            title="Confirmação"
            icon={<CheckCircle className="h-6 w-6" />}
          >
            <div className="space-y-6">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="declaration"
                  checked={formData.declarationAccepted}
                  onChange={(e) => handleInputChange('declarationAccepted', e.target.checked)}
                  className="mt-1 h-5 w-5 text-orange-600 bg-gray-700 border-2 border-gray-600 rounded focus:ring-orange-500"
                  required
                />
                <label htmlFor="declaration" className="text-sm text-gray-100 font-medium">
                  Declaro que recebi o veículo em boas condições e que todas as informações prestadas são verdadeiras. *
                </label>
              </div>

              <button
                type="submit"
                disabled={isFormDisabled}
                className={`w-full py-4 px-6 rounded-lg transition-all font-semibold text-lg shadow-lg ${
                  isFormDisabled
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-600 to-orange-700 text-white hover:from-orange-700 hover:to-orange-800'
                }`}
              >
                {loading ? 'Enviando...' : 
                 hasUploadingPhotos ? `Aguardando upload das fotos... (${uploadingPhotos.size} pendente${uploadingPhotos.size !== 1 ? 's' : ''})` : 
                 'Finalizar Checklist'}
              </button>
              
              {hasUploadingPhotos && (
                <div className="mt-3 p-3 bg-yellow-900/30 border border-yellow-700/50 rounded-lg">
                  <div className="flex items-center space-x-2 text-yellow-300">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm font-medium">
                      Upload em andamento - {uploadingPhotos.size} foto{uploadingPhotos.size !== 1 ? 's' : ''} sendo enviada{uploadingPhotos.size !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <p className="text-yellow-200 text-xs mt-1">
                    O checklist será liberado automaticamente quando todas as fotos forem carregadas.
                  </p>
                </div>
              )}
              
              <div className="text-center mt-6 pt-4 border-t border-gray-700">
                <p className="text-xs text-gray-400">
                  Desenvolvido por Carlos Freitas • © 2025
                </p>
              </div>
            </div>
          </FormSection>
        </form>
        ) : activeTab === 'vehicles' ? (
          <VehicleRegistrationTab 
            onVehicleSelect={handleVehicleSelect}
            onVehicleChange={loadRegisteredVehicles}
          />
        ) : (
          <ReportsTab checklists={savedChecklists} onRefresh={loadChecklists} />
        )}
      </div>
    </div>
  );
}

export default App;
