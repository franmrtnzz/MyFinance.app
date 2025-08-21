import React, { useState, useRef } from 'react';
import { useLocalData } from '../contexts/LocalDataContext';
import { useUserSettings } from '../contexts/UserSettingsContext';
import { Download, Upload, Trash2, Database, Moon, Sun, User, Settings as SettingsIcon } from 'lucide-react';

const Settings: React.FC = () => {
  const { exportData, importData } = useLocalData();
  const { userSettings, updateUserName, updateUserSettings } = useUserSettings();
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result as string;
        importData(data);
        setImportStatus('success');
        setImportMessage('Datos importados correctamente');
        setTimeout(() => setImportStatus('idle'), 3000);
      } catch (error) {
        setImportStatus('error');
        setImportMessage('Error al importar los datos. Verifica el formato del archivo.');
        setTimeout(() => setImportStatus('idle'), 5000);
      }
    };
    reader.readAsText(file);
  };

  const handleExport = () => {
    exportData();
  };

  const clearData = () => {
    if (confirm('¿Estás seguro de que quieres borrar todos los datos? Esta acción no se puede deshacer.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Configuración</h2>
        <p className="text-gray-600">Gestiona tu aplicación y datos</p>
      </div>

      {/* Data Management */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Database size={20} />
          <span>Gestión de Datos</span>
        </h3>
        
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleExport}
              className="btn-primary flex items-center justify-center space-x-2"
            >
              <Download size={20} />
              <span>Exportar Datos</span>
            </button>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary flex items-center justify-center space-x-2"
            >
              <Upload size={20} />
              <span>Importar Datos</span>
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />

          {importStatus !== 'idle' && (
            <div className={`p-3 rounded-lg ${
              importStatus === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {importMessage}
            </div>
          )}

          <div className="border-t pt-4">
            <button
              onClick={clearData}
              className="text-red-600 hover:text-red-800 flex items-center space-x-2"
            >
              <Trash2 size={20} />
              <span>Borrar Todos los Datos</span>
            </button>
            <p className="text-sm text-gray-500 mt-1">
              Esta acción eliminará permanentemente todos tus datos locales
            </p>
          </div>
        </div>
      </div>

      {/* User Settings */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <User size={20} />
          <span>Configuración Personal</span>
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tu nombre
            </label>
            <input
              type="text"
              value={userSettings.userName}
              onChange={(e) => updateUserName(e.target.value)}
              className="input-field"
              placeholder="Ej: Francisco"
            />
            <p className="text-xs text-gray-500 mt-1">
              Se mostrará en el saludo del dashboard
            </p>
          </div>
        </div>
      </div>

      {/* App Settings */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <SettingsIcon size={20} />
          <span>Configuración de la Aplicación</span>
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Moneda Predeterminada
            </label>
            <select 
              className="input-field"
              value={userSettings.defaultCurrency}
              onChange={(e) => updateUserSettings({ defaultCurrency: e.target.value })}
            >
              <option value="EUR">EUR (€) - Euro</option>
              <option value="USD">USD ($) - Dólar Estadounidense</option>
              <option value="GBP">GBP (£) - Libra Esterlina</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Semana Comienza en
            </label>
            <select 
              className="input-field"
              value={userSettings.weekStartsOn}
              onChange={(e) => updateUserSettings({ weekStartsOn: e.target.value as 'monday' | 'sunday' })}
            >
              <option value="monday">Lunes</option>
              <option value="sunday">Domingo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tema
            </label>
            <div className="flex space-x-2">
              <button 
                onClick={() => updateUserSettings({ theme: 'light' })}
                className={`theme-button flex items-center space-x-2 px-3 py-2 border rounded-lg ${
                  userSettings.theme === 'light' ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-white border-gray-300 text-gray-700'
                }`}
              >
                <Sun size={16} />
                <span>Claro</span>
              </button>
              <button 
                onClick={() => updateUserSettings({ theme: 'dark' })}
                className={`theme-button flex items-center space-x-2 px-3 py-2 border rounded-lg ${
                  userSettings.theme === 'dark' ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-white border-gray-300 text-gray-700'
                }`}
              >
                <Moon size={16} />
                <span>Oscuro</span>
              </button>

            </div>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Acerca de</h3>
        
        <div className="space-y-3 text-sm text-gray-600">
          <p><strong>Versión:</strong> 1.0.0</p>
          <p><strong>Desarrollado por:</strong> Finanzas App Team</p>
          <p><strong>Descripción:</strong> Aplicación personal de finanzas para gestionar ingresos, gastos, activos y facturas recurrentes.</p>
        </div>

        <div className="mt-4 pt-4 border-t">
          <h4 className="font-medium text-gray-900 mb-2">Características:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Seguimiento de ingresos y gastos</li>
            <li>• Gestión de portfolio de activos</li>
            <li>• Control de facturas recurrentes</li>
            <li>• Exportación e importación de datos</li>
            <li>• Sincronización en la nube (opcional)</li>
            <li>• Aplicación web progresiva (PWA)</li>
          </ul>
        </div>
      </div>

      {/* PWA Installation */}
      <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
        <h3 className="text-lg font-semibold text-primary-900 mb-2">Instalar Aplicación</h3>
        <p className="text-primary-700 text-sm mb-3">
          Instala esta aplicación en tu dispositivo para acceder más fácilmente
        </p>
        <button className="btn-primary">
          Instalar App
        </button>
      </div>
    </div>
  );
};

export default Settings; 