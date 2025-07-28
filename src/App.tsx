import React, { useState, useEffect } from 'react';
import { Truck, FileText, Settings, Thermometer, CheckCircle, User, Calendar, BarChart3 } from 'lucide-react';
import { FormSection } from './components/FormSection';
import { CheckboxWithProblem } from './components/CheckboxWithProblem';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ReportsTab } from './components/ReportsTab';
import { AuthModal } from './components/AuthModal';
import { ChecklistData, Problem } from './types/checklist';
import { saveChecklist, syncChecklistsToLocal } from './services/firebase';
import { sendChecklistEmail } from './services/email';
import { VEHICLE_TYPES, EXTERNAL_CHECKS, INTERNAL_CHECKS, REFRIGERATION_CHECKS, DOCUMENTATION_CHECKS } from './utils/constants';
import { v4 as uuidv4 } from 'uuid';

function App() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<'checklist' | 'reports'>('checklist');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [savedChecklists, setSavedChecklists] = useState<ChecklistData[]>([]);
  const [syncingData, setSyncingData] = useState(false);
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
    coldChamberClean: false,
    refrigeratorMotorOk: false,
    refrigeratorFuelOk: false,

    // Documentação
    crlvValid: false,
    cnhValid: false,
    deliveryDocumentsAvailable: false,
    deliveryNotesAvailable: false,
    tabletAvailable: false,

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
  }, []);

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

  const handleCheckboxChange = (field: keyof ChecklistData, checked: boolean, problemData?: { description: string; photoUrl?: string }) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked
    }));

    if (!checked && problemData) {
      const newProblem: Problem = {
        itemKey: field,
        description: problemData.description,
        photoUrl: problemData.photoUrl
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

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

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

  const handleReportsClick = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    } else {
      // Sincronizar dados ao acessar relatórios
      loadChecklists();
      setActiveTab('reports');
    }
  };

  const handleAuthenticate = () => {
    setIsAuthenticated(true);
    loadChecklists();
    setActiveTab('reports');
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <CheckCircle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Checklist Enviado!</h2>
          <p className="text-gray-300 mb-6">
            Seu checklist foi enviado com sucesso. Os dados foram salvos e um email foi enviado para a equipe de logística.
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
            <div className="bg-gray-800 rounded-lg p-1 border border-gray-700">
              <button
                onClick={() => setActiveTab('checklist')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-md font-medium transition-all ${
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
                className={`flex items-center space-x-2 px-6 py-3 rounded-md font-medium transition-all ${
                  activeTab === 'reports'
                    ? 'bg-orange-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <BarChart3 className="h-5 w-5" />
                <span>Relatórios {syncingData ? '(Sincronizando...)' : ''}</span>
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
                  onChange={(e) => handleInputChange('vehicleType', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                >
                  {Object.entries(VEHICLE_TYPES).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Placa do Veículo *
                </label>
                <input
                  type="text"
                  value={formData.licensePlate}
                  onChange={(e) => handleInputChange('licensePlate', e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 placeholder-gray-400"
                  placeholder="ABC-1234"
                  required
                />
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
                disabled={loading || !formData.declarationAccepted}
                className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white py-4 px-6 rounded-lg hover:from-orange-700 hover:to-orange-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all font-semibold text-lg shadow-lg"
              >
                {loading ? 'Enviando...' : 'Finalizar Checklist'}
              </button>
              
              <div className="text-center mt-6 pt-4 border-t border-gray-700">
                <p className="text-xs text-gray-400">
                  Desenvolvido por Carlos Freitas • © 2025
                </p>
              </div>
            </div>
          </FormSection>
        </form>
        ) : (
          <ReportsTab checklists={savedChecklists} onRefresh={loadChecklists} />
        )}
      </div>
    </div>
  );
}

export default App;
