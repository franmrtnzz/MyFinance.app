import React from 'react';
import { useFirebase } from '../contexts/FirebaseContext';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

const SyncStatus: React.FC = () => {
  const { isOnline, isLoading } = useFirebase();

  if (isLoading) {
    return (
      <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-3 py-2 rounded-lg shadow-lg flex items-center space-x-2 z-50">
        <Loader2 className="animate-spin" size={16} />
        <span className="text-sm">Sincronizando...</span>
      </div>
    );
  }

  if (!isOnline) {
    return (
      <div className="fixed bottom-4 right-4 bg-yellow-500 text-white px-3 py-2 rounded-lg shadow-lg flex items-center space-x-2 z-50">
        <WifiOff size={16} />
        <span className="text-sm">Sin conexión</span>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-green-500 text-white px-3 py-2 rounded-lg shadow-lg flex items-center space-x-2 z-50">
      <Wifi size={16} />
      <span className="text-sm">Sincronizado</span>
    </div>
  );
};

export default SyncStatus; 