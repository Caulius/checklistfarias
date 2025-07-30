import React, { useState } from 'react';
import { Camera, AlertTriangle, X, CheckCircle, XCircle, Image, CameraIcon, Upload, Loader2, Plus, Trash2 } from 'lucide-react';
import { uploadToImgBB, convertFileToBase64 } from '../services/imgbb';

interface CheckboxWithProblemProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean, problemData?: { description: string; photoUrls?: string[] }) => void;
  itemKey: string;
}

export const CheckboxWithProblem: React.FC<CheckboxWithProblemProps> = ({
  label,
  checked,
  onChange,
  itemKey
}) => {
  const [showProblemForm, setShowProblemForm] = useState(false);
  const [problemDescription, setProblemDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [status, setStatus] = useState<'none' | 'ok' | 'problem'>('none');

  const handleOkClick = () => {
    setStatus('ok');
    setShowProblemForm(false);
    setProblemDescription('');
    setSelectedFiles([]);
    setPhotoPreviews([]);
    onChange(true);
  };

  const handleProblemClick = () => {
    setStatus('problem');
    setShowProblemForm(true);
  };

  const handleProblemSubmit = async () => {
    if (problemDescription.trim()) {
      let photoUrls: string[] = [];
      
      // Upload images to ImgBB if photos were selected
      if (selectedFiles.length > 0) {
        setUploadingImage(true);
        try {
          for (const file of selectedFiles) {
            const base64Image = await convertFileToBase64(file);
            const uploadedUrl = await uploadToImgBB(base64Image);
            
            if (uploadedUrl) {
              photoUrls.push(uploadedUrl);
            }
          }
          
          if (photoUrls.length === 0 && selectedFiles.length > 0) {
            alert('Erro ao fazer upload das imagens. O problema será registrado sem fotos.');
          }
        } catch (error) {
          console.error('Erro no upload das imagens:', error);
          alert('Erro ao fazer upload das imagens. O problema será registrado sem fotos.');
        } finally {
          setUploadingImage(false);
        }
      }
      
      onChange(false, {
        description: problemDescription,
        photoUrls
      });
      
      setShowProblemForm(false);
    } else {
      alert('Por favor, descreva o problema encontrado.');
    }
  };

  const handleProblemCancel = () => {
    setShowProblemForm(false);
    setProblemDescription('');
    setSelectedFiles([]);
    setPhotoPreviews([]);
    setStatus('none');
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newFiles = [...selectedFiles, ...files];
      setSelectedFiles(newFiles);
      
      // Generate previews for new files
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPhotoPreviews(prev => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
    
    // Reset input
    e.target.value = '';
  };

  const removePhoto = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <label className="text-gray-100 font-medium block">
          {label}
        </label>
        
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={handleOkClick}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all ${
              status === 'ok'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-gray-700 text-gray-300 hover:bg-green-600 hover:text-white'
            }`}
          >
            <CheckCircle className="h-5 w-5" />
            <span>OK</span>
          </button>
          
          <button
            type="button"
            onClick={handleProblemClick}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all ${
              status === 'problem'
                ? 'bg-red-600 text-white shadow-lg'
                : 'bg-gray-700 text-gray-300 hover:bg-red-600 hover:text-white'
            }`}
          >
            <XCircle className="h-5 w-5" />
            <span>Registrar Anomalia</span>
          </button>
        </div>
      </div>

      {showProblemForm && (
        <div className="p-4 bg-red-900/20 border border-red-700/50 rounded-lg space-y-4">
          <div className="flex items-center space-x-2 text-red-400">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">Descreva o problema encontrado:</span>
          </div>

          <textarea
            value={problemDescription}
            onChange={(e) => setProblemDescription(e.target.value)}
            placeholder="Descreva detalhadamente o problema..."
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 min-h-[80px] placeholder-gray-400"
          />

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Camera className="h-5 w-5 text-gray-300" />
              <span className="text-gray-200 font-medium">Fotos do problema (opcional):</span>
              <span className="text-gray-400 text-sm">({photoPreviews.length} foto{photoPreviews.length !== 1 ? 's' : ''})</span>
            </div>

            {/* Botões para adicionar fotos */}
            <div className="space-y-3">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-gray-500 hover:bg-gray-700/30 transition-all">
                    <CameraIcon className="h-6 w-6 text-gray-400 mb-1" />
                    <Plus className="h-6 w-6 text-gray-400 mb-1" />
                    <span className="text-sm text-gray-300 text-center">Tirar Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhotoChange}
                      multiple
                      className="hidden"
                    />
                  </label>
                  
                  <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-gray-500 hover:bg-gray-700/30 transition-all">
                    <Image className="h-6 w-6 text-gray-400 mb-1" />
                    <Plus className="h-6 w-6 text-gray-400 mb-1" />
                    <span className="text-sm text-gray-300 text-center">Da Galeria</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      multiple
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              
              {/* Preview das fotos selecionadas */}
              {photoPreviews.length > 0 && (
                <div className="space-y-3">
                  <div className="text-sm text-gray-300 font-medium">
                    Fotos selecionadas ({photoPreviews.length}):
                  </div>
                  <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                    {photoPreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Foto do problema ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition-colors"
                          title="Remover foto"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                        <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleProblemSubmit}
              disabled={uploadingImage}
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2"
            >
              {uploadingImage ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Enviando fotos...</span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  <span>Confirmar Problema</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleProblemCancel}
              disabled={uploadingImage}
              className="flex-1 bg-gray-600 text-gray-100 py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
