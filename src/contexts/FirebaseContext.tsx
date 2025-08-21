import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../config/firebase';
import { doc, setDoc, deleteDoc, getDocs, collection } from 'firebase/firestore';
import { Transaction, Asset, AssetTransaction, RecurringBill } from '../types';

interface FirebaseContextType {
  syncTransactions: (transactions: Transaction[]) => Promise<void>;
  syncAssets: (assets: Asset[]) => Promise<void>;
  syncAssetTransactions: (assetTransactions: AssetTransaction[]) => Promise<void>;
  syncBills: (bills: RecurringBill[]) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;
  deleteAssetTransaction: (id: string) => Promise<void>;
  deleteBill: (id: string) => Promise<void>;
  loadDataFromFirebase: () => Promise<void>;
  isOnline: boolean;
  isLoading: boolean;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncTransactions = async (transactions: Transaction[]) => {
    if (!isOnline) return;
    
    const batch = transactions.map(transaction => {
      // Filtrar campos undefined antes de enviar a Firebase
      const cleanTransaction = Object.fromEntries(
        Object.entries(transaction).filter(([_, value]) => value !== undefined)
      );
      
      console.log('🔄 Sincronizando transacción limpia:', cleanTransaction);
      return setDoc(doc(db, 'transactions', transaction.id), cleanTransaction);
    });
    
    await Promise.all(batch);
  };

  const syncAssets = async (assets: Asset[]) => {
    if (!isOnline) return;
    
    const batch = assets.map(asset => {
      // Filtrar campos undefined antes de enviar a Firebase
      const cleanAsset = Object.fromEntries(
        Object.entries(asset).filter(([_, value]) => value !== undefined)
      );
      
      console.log('🔄 Sincronizando activo limpio:', cleanAsset);
      return setDoc(doc(db, 'assets', asset.id), cleanAsset);
    });
    
    await Promise.all(batch);
  };

  const syncAssetTransactions = async (assetTransactions: AssetTransaction[]) => {
    if (!isOnline) return;
    
    const batch = assetTransactions.map(assetTransaction => {
      // Filtrar campos undefined antes de enviar a Firebase
      const cleanAssetTransaction = Object.fromEntries(
        Object.entries(assetTransaction).filter(([_, value]) => value !== undefined)
      );
      
      console.log('🔄 Sincronizando transacción de activo limpia:', cleanAssetTransaction);
      return setDoc(doc(db, 'assetTransactions', assetTransaction.id), cleanAssetTransaction);
    });
    
    await Promise.all(batch);
  };

  const syncBills = async (bills: RecurringBill[]) => {
    if (!isOnline) return;
    
    const batch = bills.map(bill => {
      // Filtrar campos undefined antes de enviar a Firebase
      const cleanBill = Object.fromEntries(
        Object.entries(bill).filter(([_, value]) => value !== undefined)
      );
      
      console.log('🔄 Sincronizando factura limpia:', cleanBill);
      return setDoc(doc(db, 'bills', bill.id), cleanBill);
    });
    
    await Promise.all(batch);
  };

  const loadDataFromFirebase = async () => {
    if (!isOnline) {
      console.log('🌐 Sin conexión, no se pueden cargar datos de Firebase');
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔥 Cargando datos desde Firebase...');
      console.log('🔥 Estado de conexión:', isOnline);
      console.log('🔥 Base de datos:', db ? '✅ Configurada' : '❌ No configurada');
      
      // Cargar transacciones
      const transactionsSnapshot = await getDocs(collection(db, 'transactions'));
      const transactions = transactionsSnapshot.docs.map(doc => doc.data() as Transaction);
      console.log('🔥 Transacciones cargadas desde Firebase:', transactions.length);
      
      // Cargar activos
      const assetsSnapshot = await getDocs(collection(db, 'assets'));
      const assets = assetsSnapshot.docs.map(doc => doc.data() as Asset);
      console.log('🔥 Activos cargados desde Firebase:', assets.length);
      
      // Cargar transacciones de activos
      const assetTransactionsSnapshot = await getDocs(collection(db, 'assetTransactions'));
      const assetTransactions = assetTransactionsSnapshot.docs.map(doc => doc.data() as AssetTransaction);
      console.log('🔥 Transacciones de activos cargadas desde Firebase:', assetTransactions.length);
      
      // Cargar facturas
      const billsSnapshot = await getDocs(collection(db, 'bills'));
      const bills = billsSnapshot.docs.map(doc => doc.data() as RecurringBill);
      console.log('🔥 Facturas cargadas desde Firebase:', bills.length);
      
      // Emitir evento para que LocalDataContext actualice su estado
      window.dispatchEvent(new CustomEvent('firebase-data-loaded', {
        detail: { transactions, assets, assetTransactions, bills }
      }));
      
      console.log('🔥 Datos de Firebase cargados exitosamente');
    } catch (error) {
      console.error('❌ Error cargando datos de Firebase:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Funciones de borrado
  const deleteTransaction = async (id: string) => {
    if (!isOnline) return;
    
    try {
      console.log('🗑️ Borrando transacción de Firebase:', id);
      await deleteDoc(doc(db, 'transactions', id));
      console.log('✅ Transacción borrada de Firebase:', id);
    } catch (error) {
      console.error('❌ Error borrando transacción de Firebase:', error);
    }
  };

  const deleteAsset = async (id: string) => {
    if (!isOnline) return;
    
    try {
      console.log('🗑️ Borrando activo de Firebase:', id);
      await deleteDoc(doc(db, 'assets', id));
      console.log('✅ Activo borrado de Firebase:', id);
    } catch (error) {
      console.error('❌ Error borrando activo de Firebase:', error);
    }
  };

  const deleteAssetTransaction = async (id: string) => {
    if (!isOnline) return;
    
    try {
      console.log('🗑️ Borrando transacción de activo de Firebase:', id);
      await deleteDoc(doc(db, 'assetTransactions', id));
      console.log('✅ Transacción de activo borrada de Firebase:', id);
    } catch (error) {
      console.error('❌ Error borrando transacción de activo de Firebase:', error);
    }
  };

  const deleteBill = async (id: string) => {
    if (!isOnline) return;
    
    try {
      console.log('🗑️ Borrando factura de Firebase:', id);
      await deleteDoc(doc(db, 'bills', id));
      console.log('✅ Factura borrada de Firebase:', id);
    } catch (error) {
      console.error('❌ Error borrando factura de Firebase:', error);
    }
  };

  const value: FirebaseContextType = {
    syncTransactions,
    syncAssets,
    syncAssetTransactions,
    syncBills,
    deleteTransaction,
    deleteAsset,
    deleteAssetTransaction,
    deleteBill,
    loadDataFromFirebase,
    isOnline,
    isLoading,
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
}; 