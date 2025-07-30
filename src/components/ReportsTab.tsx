import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, Filter, Image, FileSpreadsheet, FileImage, AlertTriangle, CheckCircle, List, Eye, X, RefreshCw } from 'lucide-react';
import { ChecklistData } from '../types/checklist';
import { FIELD_LABELS, formatDateBR, getFieldLabel } from '../utils/constants';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  problems: Array<{ description: string; photoUrls?: string[] }>;
  checklistInfo: {
    date: string;
    driverName: string;
    licensePlate: string;
  };
}

const PhotoModal: React.FC<PhotoModalProps> = ({ isOpen, onClose, problems, checklistInfo }) => {
  if (!isOpen) return null;

  const problemsWithPhotos = problems.filter(p => p.photoUrls && p.photoUrls.length > 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-white">Fotos dos Problemas</h2>
            <p className="text-gray-300 text-sm">
              {checklistInfo.driverName} - {checklistInfo.licensePlate} - {checklistInfo.date}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {problemsWithPhotos.length === 0 ? (
            <div className="text-center py-8">
              <Image className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">Nenhuma foto disponível para este checklist</p>
            </div>
          ) : (
            <div className="space-y-6">
              {problemsWithPhotos.map((problem, index) => (
                <div key={index} className="bg-gray-700 rounded-lg p-4">
                  <h3 className="text-white font-medium mb-3">Problema {index + 1}:</h3>
                  <p className="text-gray-300 mb-4">{problem.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {problem.photoUrls?.map((photoUrl, photoIndex) => (
                      <div key={photoIndex} className="relative">
                        <img
                          src={photoUrl}
                          alt={`Foto ${photoIndex + 1} do problema: ${problem.description}`}
                          className="w-full rounded-lg shadow-lg cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(photoUrl, '_blank')}
                        />
                        <div className="absolute top-2 right-2">
                          <button
                            onClick={() => window.open(photoUrl, '_blank')}
                            className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                            title="Abrir em nova aba"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-sm px-2 py-1 rounded">
                          Foto {photoIndex + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface ReportsTabProps {
  checklists: ChecklistData[];
  onRefresh?: () => void;
}

export const ReportsTab: React.FC<ReportsTabProps> = ({ checklists, onRefresh }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredChecklists, setFilteredChecklists] = useState<ChecklistData[]>([]);
  const [anomalyFilter, setAnomalyFilter] = useState<'all' | 'with-anomalies' | 'without-anomalies'>('all');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [photoModal, setPhotoModal] = useState<{
    isOpen: boolean;
    problems: Array<{ description: string; photoUrl?: string }>;
    checklistInfo: { date: string; driverName: string; licensePlate: string };
  }>({
    isOpen: false,
    problems: [],
    checklistInfo: { date: '', driverName: '', licensePlate: '' }
  });

  useEffect(() => {
    // Set default dates (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      let filtered = checklists.filter(checklist => {
        const checklistDate = new Date(checklist.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Include the entire end date
        
        return checklistDate >= start && checklistDate <= end;
      });
      // Apply anomaly filter
      if (anomalyFilter === 'with-anomalies') {
        filtered = filtered.filter(checklist => checklist.problems.length > 0);
      } else if (anomalyFilter === 'without-anomalies') {
        filtered = filtered.filter(checklist => checklist.problems.length === 0);
      }
      setFilteredChecklists(filtered);
    }
  }, [startDate, endDate, checklists, anomalyFilter]);

  // Calculate statistics
  const totalChecklists = checklists.filter(checklist => {
    if (!startDate || !endDate) return false;
    const checklistDate = new Date(checklist.date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    return checklistDate >= start && checklistDate <= end;
  }).length;

  const checklistsWithAnomalies = checklists.filter(checklist => {
    if (!startDate || !endDate) return false;
    const checklistDate = new Date(checklist.date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    return checklistDate >= start && checklistDate <= end && checklist.problems.length > 0;
  }).length;

  const checklistsWithoutAnomalies = totalChecklists - checklistsWithAnomalies;
  const validateDateRange = () => {
    if (!startDate || !endDate) {
      alert('Por favor, selecione as datas de início e fim.');
      return false;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 90) {
      alert('O período máximo permitido é de 90 dias.');
      return false;
    }

    if (start > end) {
      alert('A data de início deve ser anterior à data de fim.');
      return false;
    }

    return true;
  };

  const exportToExcel = async () => {
    if (!validateDateRange()) return;
    
    setLoading(true);
    
    try {
      const workbook = XLSX.utils.book_new();
      
      // Prepare data for Excel
      const excelData = filteredChecklists.map(checklist => ({
        'Data': formatDateBR(checklist.date),
        'Motorista': checklist.driverName,
        'Tipo de Veículo': checklist.vehicleType === 'threeFourths' ? '3/4' :
                           checklist.vehicleType === 'toco' ? 'Toco' :
                           checklist.vehicleType === 'truck' ? 'Truck' :
                           checklist.vehicleType === 'bitruck' ? 'Bitruck' :
                           checklist.vehicleType === 'trailer' ? 'Carreta' : checklist.vehicleType,
        'Placa': checklist.licensePlate,
        'Temperatura Inicial': checklist.initialTemperature ? `${checklist.initialTemperature}°C` : 'N/A',
        [getFieldLabel('tiresCalibrated')]: checklist.tiresCalibrated ? 'OK' : 'PROBLEMA',
        [getFieldLabel('lightsWorking')]: checklist.lightsWorking ? 'OK' : 'PROBLEMA',
        [getFieldLabel('mirrorsGlassOk')]: checklist.mirrorsGlassOk ? 'OK' : 'PROBLEMA',
        [getFieldLabel('bodyworkOk')]: checklist.bodyworkOk ? 'OK' : 'PROBLEMA',
        [getFieldLabel('bumpersOk')]: checklist.bumpersOk ? 'OK' : 'PROBLEMA',
        [getFieldLabel('wipersWorking')]: checklist.wipersWorking ? 'OK' : 'PROBLEMA',
        [getFieldLabel('fuelLevelOk')]: checklist.fuelLevelOk ? 'OK' : 'PROBLEMA',
        [getFieldLabel('engineOilOk')]: checklist.engineOilOk ? 'OK' : 'PROBLEMA',
        [getFieldLabel('waterRadiatorOk')]: checklist.waterRadiatorOk ? 'OK' : 'PROBLEMA',
        [getFieldLabel('dashboardWorking')]: checklist.dashboardWorking ? 'OK' : 'PROBLEMA',
        [getFieldLabel('fireExtinguisherValid')]: checklist.fireExtinguisherValid ? 'OK' : 'PROBLEMA',
        [getFieldLabel('seatbeltsWorking')]: checklist.seatbeltsWorking ? 'OK' : 'PROBLEMA',
        [getFieldLabel('refrigerationWorking')]: checklist.refrigerationWorking ? 'OK' : 'PROBLEMA',
        [getFieldLabel('coldChamberClean')]: checklist.coldChamberClean ? 'OK' : 'PROBLEMA',
        [getFieldLabel('refrigeratorMotorOk')]: checklist.refrigeratorMotorOk ? 'OK' : 'PROBLEMA',
        [getFieldLabel('refrigeratorFuelOk')]: checklist.refrigeratorFuelOk ? 'OK' : 'PROBLEMA',
        [getFieldLabel('crlvValid')]: checklist.crlvValid ? 'OK' : 'PROBLEMA',
        [getFieldLabel('cnhValid')]: checklist.cnhValid ? 'OK' : 'PROBLEMA',
        [getFieldLabel('deliveryDocumentsAvailable')]: checklist.deliveryDocumentsAvailable ? 'OK' : 'PROBLEMA',
        [getFieldLabel('deliveryNotesAvailable')]: checklist.deliveryNotesAvailable ? 'OK' : 'PROBLEMA',
        [getFieldLabel('tabletAvailable')]: checklist.tabletAvailable ? 'OK' : 'PROBLEMA',
        [getFieldLabel('planilhaRodagemFilled')]: checklist.planilhaRodagemFilled ? 'OK' : 'PROBLEMA',
        'Problemas Encontrados': checklist.problems.length,
        'Observações': checklist.generalObservations || 'Nenhuma',
        'Fotos dos Problemas': checklist.problems.filter(p => p.photoUrl).length,
        'ID': checklist.id
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Checklists');

      // Create problems sheet if there are any
      const problemsData = filteredChecklists.flatMap(checklist => 
        checklist.problems.map(problem => ({
          'Data': formatDateBR(checklist.date),
          'Motorista': checklist.driverName,
          'Placa': checklist.licensePlate,
          'Item': getFieldLabel(problem.itemKey),
          'Descrição do Problema': problem.description,
          'Link da Foto': problem.photoUrl || 'Sem foto',
          'ID Checklist': checklist.id
        }))
      );

      if (problemsData.length > 0) {
        const problemsWorksheet = XLSX.utils.json_to_sheet(problemsData);
        XLSX.utils.book_append_sheet(workbook, problemsWorksheet, 'Problemas');
      }

      const filterSuffix = anomalyFilter === 'with-anomalies' ? '-com-anomalias' : 
                          anomalyFilter === 'without-anomalies' ? '-sem-anomalias' : '';
      const fileName = `relatorio-checklists-${startDate}-${endDate}${filterSuffix}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
      alert('Erro ao exportar relatório em Excel.');
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = async () => {
    if (!validateDateRange()) return;
    
    setLoading(true);
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Helper function to load image and convert to base64
      const loadImageAsBase64 = (url: string): Promise<string> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/jpeg', 0.8));
          };
          img.onerror = () => reject(new Error('Failed to load image'));
          img.src = url;
        });
      };
      // Title
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Relatório de Checklists de Veículos', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 10;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Período: ${startDate} a ${endDate}`, pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 6;
      const filterText = anomalyFilter === 'with-anomalies' ? 'Apenas com Anomalias' :
                        anomalyFilter === 'without-anomalies' ? 'Apenas sem Anomalias' : 'Todos os Checklists';
      pdf.text(`Filtro: ${filterText}`, pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 15;

      for (let i = 0; i < filteredChecklists.length; i++) {
        const checklist = filteredChecklists[i];
        
        // Check if we need a new page
        if (yPosition > pageHeight - 50) {
          pdf.addPage();
          yPosition = 20;
        }

        // Checklist header
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Checklist ${i + 1}`, 20, yPosition);
        yPosition += 8;

        // Basic info
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Data: ${formatDateBR(checklist.date)}`, 20, yPosition);
        pdf.text(`Motorista: ${checklist.driverName}`, 80, yPosition);
        pdf.text(`Placa: ${checklist.licensePlate}`, 140, yPosition);
        yPosition += 6;

        pdf.text(`Tipo: ${checklist.vehicleType}`, 20, yPosition);
        pdf.text(`Temperatura: ${checklist.initialTemperature || 'N/A'}°C`, 80, yPosition);
        yPosition += 10;

        // Problems
        if (checklist.problems.length > 0) {
          pdf.setFont('helvetica', 'bold');
          pdf.text('Problemas Encontrados:', 20, yPosition);
          yPosition += 6;
          
          pdf.setFont('helvetica', 'normal');
          for (let idx = 0; idx < checklist.problems.length; idx++) {
            const problem = checklist.problems[idx];
            const text = `${idx + 1}. ${problem.description}`;
            const lines = pdf.splitTextToSize(text, pageWidth - 40);
            pdf.text(lines, 25, yPosition);
            yPosition += lines.length * 4;
            
            if (problem.photoUrl) {
              try {
                // Try to load and embed the image
                const imageBase64 = await loadImageAsBase64(problem.photoUrl);
                
                // Check if we need a new page for the image
                if (yPosition > pageHeight - 80) {
                  pdf.addPage();
                  yPosition = 20;
                }
                
                // Add the image
                const imgWidth = 60; // 6cm width
                const imgHeight = 45; // 4.5cm height (maintaining aspect ratio)
                pdf.addImage(imageBase64, 'JPEG', 25, yPosition, imgWidth, imgHeight);
                yPosition += imgHeight + 5;
                
              } catch (error) {
                // If image loading fails, add clickable link
                console.warn('Failed to load image, adding link instead:', error);
                pdf.setTextColor(0, 0, 255); // Blue color for link
                const linkText = `   📷 Ver Foto: ${problem.photoUrl}`;
                pdf.textWithLink(linkText, 25, yPosition, { url: problem.photoUrl });
                pdf.setTextColor(0, 0, 0); // Reset to black
                yPosition += 6;
              }
            }
          }
        } else if (anomalyFilter === 'without-anomalies') {
          pdf.setFont('helvetica', 'bold');
          pdf.text('Status: Sem Anomalias', 20, yPosition);
          yPosition += 6;
        }

        // Observations
        if (checklist.generalObservations) {
          pdf.setFont('helvetica', 'bold');
          pdf.text('Observações:', 20, yPosition);
          yPosition += 6;
          
          pdf.setFont('helvetica', 'normal');
          const obsLines = pdf.splitTextToSize(checklist.generalObservations, pageWidth - 40);
          pdf.text(obsLines, 25, yPosition);
          yPosition += obsLines.length * 4;
        }

        yPosition += 10;
        
        // Add separator line
        pdf.line(20, yPosition, pageWidth - 20, yPosition);
        yPosition += 10;
      }

      const filterSuffix = anomalyFilter === 'with-anomalies' ? '-com-anomalias' : 
                          anomalyFilter === 'without-anomalies' ? '-sem-anomalias' : '';
      const fileName = `relatorio-checklists-${startDate}-${endDate}${filterSuffix}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      alert('Erro ao exportar relatório em PDF.');
    } finally {
      setLoading(false);
    }
  };

  const quickDateFilter = (days: number) => {
    const today = new Date();
    const pastDate = new Date(today.getTime() - (days * 24 * 60 * 60 * 1000));
    
    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(pastDate.toISOString().split('T')[0]);
  };

  const openPhotoModal = (checklist: ChecklistData) => {
    setPhotoModal({
      isOpen: true,
      problems: checklist.problems,
      checklistInfo: {
        date: checklist.date,
        driverName: checklist.driverName,
        licensePlate: checklist.licensePlate
      }
    });
  };

  const closePhotoModal = () => {
    setPhotoModal({
      isOpen: false,
      problems: [],
      checklistInfo: { date: '', driverName: '', licensePlate: '' }
    });
  };

  const handleRefresh = async () => {
    if (onRefresh) {
      setRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <PhotoModal
        isOpen={photoModal.isOpen}
        onClose={closePhotoModal}
        problems={photoModal.problems}
        checklistInfo={photoModal.checklistInfo}
      />
      
      {/* Header */}
      <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <FileText className="h-6 w-6 mr-3" />
              Relatórios de Checklists
            </h3>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Sincronizando...' : 'Atualizar'}</span>
            </button>
          </div>
        </div>
        <div className="p-6">
          <p className="text-gray-300">
            Exporte relatórios detalhados dos checklists realizados com filtros personalizados de data. Os dados são sincronizados automaticamente entre todos os dispositivos.
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
          <div className="flex items-center space-x-3">
            <List className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold text-white">{totalChecklists}</p>
              <p className="text-gray-300 text-sm">Total de Checklists</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-2xl font-bold text-white">{checklistsWithAnomalies}</p>
              <p className="text-gray-300 text-sm">Com Anomalias</p>
              {totalChecklists > 0 && (
                <p className="text-red-400 text-xs">
                  {((checklistsWithAnomalies / totalChecklists) * 100).toFixed(1)}%
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold text-white">{checklistsWithoutAnomalies}</p>
              <p className="text-gray-300 text-sm">Sem Anomalias</p>
              {totalChecklists > 0 && (
                <p className="text-green-400 text-xs">
                  {((checklistsWithoutAnomalies / totalChecklists) * 100).toFixed(1)}%
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Date Filters */}
      <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-6 py-4">
          <h4 className="text-md font-semibold text-white flex items-center">
            <Filter className="h-5 w-5 mr-3" />
            Filtros de Data
          </h4>
        </div>
        <div className="p-6 space-y-4">
          {/* Quick filters */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-3">
              Filtros Rápidos:
            </label>
            <div className="flex flex-wrap gap-2">
              {[7, 15, 30, 60, 90].map(days => (
                <button
                  key={days}
                  onClick={() => quickDateFilter(days)}
                  className="px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                >
                  Últimos {days} dias
                </button>
              ))}
            </div>
          </div>

          {/* Custom date range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                <Calendar className="h-4 w-4 inline mr-2" />
                Data Inicial
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                <Calendar className="h-4 w-4 inline mr-2" />
                Data Final
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>

          {/* Anomaly Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-3">
              <AlertTriangle className="h-4 w-4 inline mr-2" />
              Filtro por Anomalias:
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={() => setAnomalyFilter('all')}
                className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all ${
                  anomalyFilter === 'all'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-700 text-gray-300 hover:bg-blue-600 hover:text-white'
                }`}
              >
                <List className="h-4 w-4" />
                <span>Todos ({totalChecklists})</span>
              </button>
              
              <button
                onClick={() => setAnomalyFilter('with-anomalies')}
                className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all ${
                  anomalyFilter === 'with-anomalies'
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'bg-gray-700 text-gray-300 hover:bg-red-600 hover:text-white'
                }`}
              >
                <AlertTriangle className="h-4 w-4" />
                <span>Com Anomalias ({checklistsWithAnomalies})</span>
              </button>
              
              <button
                onClick={() => setAnomalyFilter('without-anomalies')}
                className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all ${
                  anomalyFilter === 'without-anomalies'
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-gray-700 text-gray-300 hover:bg-green-600 hover:text-white'
                }`}
              >
                <CheckCircle className="h-4 w-4" />
                <span>Sem Anomalias ({checklistsWithoutAnomalies})</span>
              </button>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            <p>• Período máximo: 90 dias</p>
            <p>• Checklists filtrados: <span className="text-orange-400 font-medium">{filteredChecklists.length}</span></p>
            <p>• Filtro atual: <span className="text-blue-400 font-medium">
              {anomalyFilter === 'all' ? 'Todos os checklists' :
               anomalyFilter === 'with-anomalies' ? 'Apenas com anomalias' : 'Apenas sem anomalias'}
            </span></p>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-6 py-4">
          <h4 className="text-md font-semibold text-white flex items-center">
            <Download className="h-5 w-5 mr-3" />
            Opções de Exportação
          </h4>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={exportToExcel}
              disabled={loading || filteredChecklists.length === 0}
              className="flex items-center justify-center space-x-3 py-4 px-6 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <FileSpreadsheet className="h-5 w-5" />
              <span>{loading ? 'Exportando...' : 'Exportar Excel'}</span>
            </button>

            <button
              onClick={exportToPDF}
              disabled={loading || filteredChecklists.length === 0}
              className="flex items-center justify-center space-x-3 py-4 px-6 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <FileImage className="h-5 w-5" />
              <span>{loading ? 'Exportando...' : 'Exportar PDF'}</span>
            </button>
          </div>

          <div className="text-sm text-gray-400 space-y-1">
            <p>• <strong>Excel:</strong> Inclui dados detalhados em planilhas separadas (Checklists e Problemas)</p>
            <p>• <strong>PDF:</strong> Relatório formatado com informações resumidas e problemas encontrados</p>
            <p>• <strong>Fotos:</strong> As fotos dos problemas são referenciadas nos relatórios quando disponíveis</p>
            <p>• <strong>Filtros:</strong> Os relatórios respeitam o filtro de anomalias selecionado</p>
          </div>
        </div>
      </div>

      {/* Preview */}
      {filteredChecklists.length > 0 && (
        <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-6 py-4">
            <h4 className="text-md font-semibold text-white flex items-center">
              <Image className="h-5 w-5 mr-3" />
              Prévia dos Dados
            </h4>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-gray-300">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-2">Data</th>
                    <th className="text-left py-2">Motorista</th>
                    <th className="text-left py-2">Placa</th>
                    <th className="text-left py-2">Tipo</th>
                    <th className="text-left py-2">Problemas</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredChecklists.slice(0, 10).map((checklist, index) => (
                    <tr key={checklist.id} className="border-b border-gray-700/50">
                      <td className="py-2">{formatDateBR(checklist.date)}</td>
                      <td className="py-2">{checklist.driverName}</td>
                      <td className="py-2">{checklist.licensePlate}</td>
                      <td className="py-2">
                        {checklist.vehicleType === 'threeFourths' ? '3/4' :
                         checklist.vehicleType === 'toco' ? 'Toco' :
                         checklist.vehicleType === 'truck' ? 'Truck' :
                         checklist.vehicleType === 'bitruck' ? 'Bitruck' :
                         checklist.vehicleType === 'trailer' ? 'Carreta' : checklist.vehicleType}
                      </td>
                      <td className="py-2">
                        <button
                          onClick={() => openPhotoModal(checklist)}
                          className={`px-2 py-1 rounded text-xs cursor-pointer hover:opacity-80 transition-opacity ${
                            checklist.problems.length === 0 
                              ? 'bg-green-900 text-green-300' 
                              : 'bg-red-900 text-red-300'
                          }`}
                        >
                          {checklist.problems.length} problema(s)
                          {checklist.problems.some(p => p.photoUrls && p.photoUrls.length > 0) && (
                            <Image className="h-3 w-3 inline ml-1" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredChecklists.length > 10 && (
                <p className="text-gray-400 text-center mt-4">
                  ... e mais {filteredChecklists.length - 10} registros
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
