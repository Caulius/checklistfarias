import React, { useState } from 'react';
import { Lock, X, Eye, EyeOff } from 'lucide-react';

interface CodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title: string;
}

export const CodeModal: React.FC<CodeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title
}) => {
  const [code, setCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (code === '15644558') {
      setCode('');
      setError('');
      onSuccess();
      onClose();
    } else {
      setError('Código incorreto. Tente novamente.');
      setCode('');
    }
  };

  const handleClose = () => {
    setCode('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <Lock className="h-6 w-6 text-orange-500" />
            <h2 className="text-xl font-semibold text-white">Acesso Restrito</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <p className="text-gray-300 mb-4">
              Digite o código de acesso para acessar <strong>{title}</strong>:
            </p>
            
            <div className="relative">
              <input
                type={showCode ? 'text' : 'password'}
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setError('');
                }}
                className="w-full px-4 py-3 pr-12 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 placeholder-gray-400 text-center text-lg font-mono"
                placeholder="Digite o código"
                maxLength={8}
                required
              />
              <button
                type="button"
                onClick={() => setShowCode(!showCode)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showCode ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            
            {error && (
              <p className="text-red-400 text-sm mt-2 text-center">{error}</p>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors font-medium"
            >
              Confirmar
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-gray-600 text-gray-100 py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Cancelar
            </button>
          </div>
        </form>
        
        <div className="px-6 pb-6">
          <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-3">
            <p className="text-blue-300 text-sm text-center">
              🔒 Esta seção requer código de acesso para proteção dos dados
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
