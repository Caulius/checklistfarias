import React, { useState, useEffect } from 'react';
import { Truck, Plus, Edit, Trash2, Save, X, Search } from 'lucide-react';
import { Vehicle } from '../types/vehicle';
import { saveVehicle, getVehicles, deleteVehicle } from '../services/vehicleStorage';
import { VEHICLE_TYPES } from '../utils/constants';
import { v4 as uuidv4 } from 'uuid';

interface VehicleRegistrationTabProps {
  onVehicleSelect?: (vehicle: Vehicle) => void;
  onVehicleChange?: () => void;
}

export const VehicleRegistrationTab: React.FC<VehicleRegistrationTabProps> = ({
  onVehicleSelect,
  onVehicleChange
}) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    licensePlate: '',
    vehicleType: 'toco' as Vehicle['vehicleType']
  });

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = () => {
    const savedVehicles = getVehicles();
    setVehicles(savedVehicles);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.licensePlate.trim()) {
      alert('Por favor, informe a placa do veículo.');
      return;
    }

    const vehicle: Vehicle = {
      id: editingVehicle?.id || uuidv4(),
      licensePlate: formData.licensePlate.toUpperCase().trim(),
      vehicleType: formData.vehicleType,
      createdAt: editingVehicle?.createdAt || new Date().toISOString()
    };

    try {
      saveVehicle(vehicle);
      loadVehicles();
      onVehicleChange?.(); // Notificar mudança para atualizar o App
      resetForm();
      alert(editingVehicle ? 'Veículo atualizado com sucesso!' : 'Veículo cadastrado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar veículo:', error);
      alert('Erro ao salvar veículo. Tente novamente.');
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      licensePlate: vehicle.licensePlate,
      vehicleType: vehicle.vehicleType
    });
    setShowForm(true);
  };

  const handleDelete = (vehicle: Vehicle) => {
    if (confirm(`Tem certeza que deseja excluir o veículo ${vehicle.licensePlate}?`)) {
      try {
        deleteVehicle(vehicle.licensePlate);
        loadVehicles();
        onVehicleChange?.(); // Notificar mudança para atualizar o App
        alert('Veículo excluído com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir veículo:', error);
        alert('Erro ao excluir veículo. Tente novamente.');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      licensePlate: '',
      vehicleType: 'toco'
    });
    setEditingVehicle(null);
    setShowForm(false);
  };

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    VEHICLE_TYPES[vehicle.vehicleType].toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleVehicleSelect = (vehicle: Vehicle) => {
    if (onVehicleSelect) {
      onVehicleSelect(vehicle);
      alert(`Veículo ${vehicle.licensePlate} selecionado para o checklist!`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Truck className="h-6 w-6 mr-3" />
              Cadastro de Veículos
            </h3>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Novo Veículo</span>
            </button>
          </div>
        </div>
        <div className="p-6">
          <p className="text-gray-300">
            Cadastre os veículos da frota para facilitar o preenchimento dos checklists. 
            Os veículos cadastrados aparecerão como opções na seção "Dados Iniciais".
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por placa ou tipo de veículo..."
            className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white">
                {editingVehicle ? 'Editar Veículo' : 'Novo Veículo'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Placa do Veículo *
                </label>
                <input
                  type="text"
                  value={formData.licensePlate}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    licensePlate: e.target.value.toUpperCase() 
                  }))}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 placeholder-gray-400"
                  placeholder="ABC-1234"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Tipo de Veículo *
                </label>
                <select
                  value={formData.vehicleType}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    vehicleType: e.target.value as Vehicle['vehicleType']
                  }))}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                >
                  {Object.entries(VEHICLE_TYPES).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center space-x-2 bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors font-medium"
                >
                  <Save className="h-4 w-4" />
                  <span>{editingVehicle ? 'Atualizar' : 'Cadastrar'}</span>
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-600 text-gray-100 py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vehicles List */}
      <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-6 py-4">
          <h4 className="text-md font-semibold text-white">
            Veículos Cadastrados ({filteredVehicles.length})
          </h4>
        </div>
        <div className="p-6">
          {filteredVehicles.length === 0 ? (
            <div className="text-center py-8">
              <Truck className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">
                {searchTerm ? 'Nenhum veículo encontrado' : 'Nenhum veículo cadastrado'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-4 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Cadastrar Primeiro Veículo
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredVehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="flex items-center justify-between p-4 bg-gray-700 rounded-lg border border-gray-600"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h5 className="text-white font-medium">{vehicle.licensePlate}</h5>
                        <p className="text-gray-300 text-sm">
                          {VEHICLE_TYPES[vehicle.vehicleType]}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {onVehicleSelect && (
                      <button
                        onClick={() => handleVehicleSelect(vehicle)}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        title="Usar no checklist"
                      >
                        Selecionar
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(vehicle)}
                      className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                      title="Editar veículo"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(vehicle)}
                      className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                      title="Excluir veículo"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
        <h4 className="text-blue-300 font-medium mb-2">💡 Como usar:</h4>
        <ul className="text-blue-200 text-sm space-y-1">
          <li>• Cadastre os veículos da sua frota com placa e tipo</li>
          <li>• Na aba "Checklist", você poderá selecionar um veículo cadastrado</li>
          <li>• Ao selecionar, a placa e tipo serão preenchidos automaticamente</li>
          <li>• Use a busca para encontrar veículos rapidamente</li>
        </ul>
      </div>
    </div>
  );
};
