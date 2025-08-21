import React, { createContext, useContext, useEffect, useState } from 'react';
import { Transaction, Asset, AssetTransaction, RecurringBill, Portfolio } from '../types';
import { useFirebase } from './FirebaseContext';

interface LocalDataContextType {
  transactions: Transaction[];
  assets: Asset[];
  assetTransactions: AssetTransaction[];
  bills: RecurringBill[];
  portfolio: Portfolio;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addAsset: (asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateAsset: (id: string, updates: Partial<Asset>) => void;
  deleteAsset: (id: string) => void;
  addAssetTransaction: (assetTransaction: Omit<AssetTransaction, 'id' | 'createdAt'>) => void;
  updateAssetTransaction: (id: string, updates: Partial<AssetTransaction>) => void;
  deleteAssetTransaction: (id: string) => void;
  addBill: (bill: Omit<RecurringBill, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBill: (id: string, updates: Partial<RecurringBill>) => void;
  deleteBill: (id: string) => void;
  exportData: () => void;
  importData: (data: string) => void;
}

const LocalDataContext = createContext<LocalDataContextType | undefined>(undefined);

export const useLocalData = () => {
  const context = useContext(LocalDataContext);
  if (context === undefined) {
    throw new Error('useLocalData must be used within a LocalDataProvider');
  }
  return context;
};

export const LocalDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [assetTransactions, setAssetTransactions] = useState<AssetTransaction[]>([]);
  const [bills, setBills] = useState<RecurringBill[]>([]);
  const { 
    syncTransactions, 
    syncAssets, 
    syncAssetTransactions, 
    syncBills, 
    deleteTransaction: deleteTransactionFromFirebase,
    deleteAsset: deleteAssetFromFirebase,
    deleteAssetTransaction: deleteAssetTransactionFromFirebase,
    deleteBill: deleteBillFromFirebase,
    loadDataFromFirebase, 
    isOnline 
  } = useFirebase();

  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = () => {
      try {
        console.log('📂 Cargando datos del localStorage...');
        
        const storedTransactions = localStorage.getItem('finanzas-transactions');
        const storedAssets = localStorage.getItem('finanzas-assets');
        const storedAssetTransactions = localStorage.getItem('finanzas-asset-transactions');
        const storedBills = localStorage.getItem('finanzas-bills');

        if (storedTransactions) {
          const parsedTransactions = JSON.parse(storedTransactions);
          console.log('📂 Transacciones cargadas desde localStorage:', parsedTransactions.length);
          console.log('📂 Contenido de transacciones:', parsedTransactions);
          setTransactions(parsedTransactions);
        } else {
          console.log('📂 No hay transacciones en localStorage');
        }
        
        if (storedAssets) {
          const parsedAssets = JSON.parse(storedAssets);
          console.log('📂 Activos cargados desde localStorage:', parsedAssets.length);
          setAssets(parsedAssets);
        } else {
          console.log('📂 No hay activos en localStorage');
        }
        
        if (storedAssetTransactions) {
          const parsedAssetTransactions = JSON.parse(storedAssetTransactions);
          console.log('📂 Transacciones de activos cargadas desde localStorage:', parsedAssetTransactions.length);
          console.log('📂 Detalle de transacciones cargadas:', parsedAssetTransactions);
          setAssetTransactions(parsedAssetTransactions);
        } else {
          console.log('📂 No hay transacciones de activos en localStorage');
        }
        
        if (storedBills) {
          const parsedBills = JSON.parse(storedBills);
          console.log('📂 Facturas cargadas desde localStorage:', parsedBills.length);
          setBills(parsedBills);
        } else {
          console.log('📂 No hay facturas en localStorage');
        }
        
        console.log('📂 Carga de datos completada');
      } catch (error) {
        console.error('❌ Error loading data:', error);
      }
    };

    loadData();
  }, []);

  // Cargar datos de Firebase al montar el componente (solo una vez)
  useEffect(() => {
    console.log('🚀 Intentando cargar datos de Firebase...');
    console.log('🌐 Estado de conexión Firebase:', isOnline);
    if (isOnline) {
      loadDataFromFirebase();
    } else {
      console.log('🌐 Sin conexión, saltando carga de Firebase');
    }
  }, [isOnline]); // Solo se ejecuta cuando cambia el estado de conexión

  // Escuchar datos cargados desde Firebase
  useEffect(() => {
    const handleFirebaseDataLoaded = (event: CustomEvent) => {
      const { transactions: fbTransactions, assets: fbAssets, assetTransactions: fbAssetTransactions, bills: fbBills } = event.detail;
      
      console.log('🔥 Datos recibidos de Firebase:', {
        transactions: fbTransactions.length,
        assets: fbAssets.length,
        assetTransactions: fbAssetTransactions.length,
        bills: fbBills.length
      });

      // Combinar datos locales con datos de Firebase (Firebase tiene prioridad)
      setTransactions(prev => {
        const combined = [...prev];
        fbTransactions.forEach((fbTransaction: Transaction) => {
          const existingIndex = combined.findIndex(t => t.id === fbTransaction.id);
          if (existingIndex >= 0) {
            combined[existingIndex] = fbTransaction; // Firebase tiene prioridad
          } else {
            combined.push(fbTransaction);
          }
        });
        return combined;
      });

      setAssets(prev => {
        const combined = [...prev];
        fbAssets.forEach((fbAsset: Asset) => {
          const existingIndex = combined.findIndex(a => a.id === fbAsset.id);
          if (existingIndex >= 0) {
            combined[existingIndex] = fbAsset; // Firebase tiene prioridad
          } else {
            combined.push(fbAsset);
          }
        });
        return combined;
      });

      setAssetTransactions(prev => {
        const combined = [...prev];
        console.log('🔄 Combinando transacciones de activos de Firebase:', {
          prevCount: prev.length,
          fbCount: fbAssetTransactions.length,
          combinedCount: combined.length + fbAssetTransactions.length
        });
        
        fbAssetTransactions.forEach((fbAssetTransaction: AssetTransaction) => {
          const existingIndex = combined.findIndex(at => at.id === fbAssetTransaction.id);
          if (existingIndex >= 0) {
            console.log('🔄 Actualizando transacción existente:', fbAssetTransaction.id);
            combined[existingIndex] = fbAssetTransaction; // Firebase tiene prioridad
          } else {
            console.log('🔄 Añadiendo nueva transacción de Firebase:', fbAssetTransaction.id);
            combined.push(fbAssetTransaction);
          }
        });
        
        console.log('🔄 Resultado final combinado:', combined.length);
        return combined;
      });

      setBills(prev => {
        const combined = [...prev];
        fbBills.forEach((fbBill: RecurringBill) => {
          const existingIndex = combined.findIndex(b => b.id === fbBill.id);
          if (existingIndex >= 0) {
            combined[existingIndex] = fbBill; // Firebase tiene prioridad
          } else {
            combined.push(fbBill);
          }
        });
        return combined;
      });

      console.log('🔄 Datos combinados exitosamente');
    };

    window.addEventListener('firebase-data-loaded', handleFirebaseDataLoaded as EventListener);
    
    return () => {
      window.removeEventListener('firebase-data-loaded', handleFirebaseDataLoaded as EventListener);
    };
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    console.log('💾 Guardando en localStorage - Transacciones:', transactions.length);
    console.log('💾 Guardando en localStorage - Activos:', assets.length);
    console.log('💾 Guardando en localStorage - Transacciones de activos:', assetTransactions.length);
    console.log('💾 Guardando en localStorage - Facturas:', bills.length);
    
    try {
      localStorage.setItem('finanzas-transactions', JSON.stringify(transactions));
      localStorage.setItem('finanzas-assets', JSON.stringify(assets));
      localStorage.setItem('finanzas-asset-transactions', JSON.stringify(assetTransactions));
      localStorage.setItem('finanzas-bills', JSON.stringify(bills));
      console.log('✅ Datos guardados en localStorage exitosamente');
    } catch (error) {
      console.error('❌ Error guardando en localStorage:', error);
    }
  }, [transactions, assets, assetTransactions, bills]);

  // Sync to Firebase when online (memoizado para evitar re-renders infinitos)
  useEffect(() => {
    if (transactions.length > 0) {
      console.log('🔄 Sincronizando transacciones con Firebase:', transactions.length);
      syncTransactions(transactions);
    }
  }, [transactions]); // Removido syncTransactions de las dependencias

  useEffect(() => {
    if (assets.length > 0) {
      console.log('🔄 Sincronizando activos con Firebase:', assets.length);
      syncAssets(assets);
    }
  }, [assets]); // Removido syncAssets de las dependencias

  useEffect(() => {
    if (assetTransactions.length > 0) {
      console.log('🔄 Sincronizando transacciones de activos con Firebase:', assetTransactions.length);
      syncAssetTransactions(assetTransactions);
    }
  }, [assetTransactions]); // Removido syncAssetTransactions de las dependencias

  useEffect(() => {
    if (bills.length > 0) {
      console.log('🔄 Sincronizando facturas con Firebase:', bills.length);
      syncBills(bills);
    }
  }, [bills]); // Removido syncBills de las dependencias

  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

  const addTransaction = (transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newTransaction: Transaction = {
      ...transactionData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    
    console.log('📝 Añadiendo transacción al contexto:', newTransaction);
    console.log('📊 Transacciones anteriores:', transactions.length);
    
    setTransactions(prev => {
      const updated = [...prev, newTransaction];
      console.log('📊 Transacciones después de añadir:', updated.length);
      return updated;
    });
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions(prev => prev.map(t => 
      t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
    ));
  };

  const deleteTransaction = async (id: string) => {
    console.log('🗑️ Borrando transacción:', id);
    setTransactions(prev => prev.filter(t => t.id !== id));
    
    // También borrar de Firebase
    if (isOnline) {
      await deleteTransactionFromFirebase(id);
    }
  };

  const addAsset = (assetData: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newAsset: Asset = {
      ...assetData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    setAssets(prev => [...prev, newAsset]);
  };

  const updateAsset = (id: string, updates: Partial<Asset>) => {
    setAssets(prev => prev.map(a => 
      a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
    ));
  };

  const deleteAsset = async (id: string) => {
    console.log('🗑️ Borrando activo:', id);
    setAssets(prev => prev.filter(a => a.id !== id));
    
    // También borrar de Firebase
    if (isOnline) {
      await deleteAssetFromFirebase(id);
    }
  };

  const addAssetTransaction = (assetTransactionData: Omit<AssetTransaction, 'id' | 'createdAt'>) => {
    const newAssetTransaction: AssetTransaction = {
      ...assetTransactionData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    
    console.log('🚀 Añadiendo transacción de activo al contexto:', newAssetTransaction);
    console.log('📊 Transacciones de activos anteriores:', assetTransactions.length);
    
    setAssetTransactions(prev => {
      const updated = [...prev, newAssetTransaction];
      console.log('📊 Transacciones de activos después de añadir:', updated.length);
      return updated;
    });
  };

  const updateAssetTransaction = (id: string, updates: Partial<AssetTransaction>) => {
    setAssetTransactions(prev => prev.map(t => 
      t.id === id ? { ...t, ...updates } : t
    ));
  };

  const deleteAssetTransaction = async (id: string) => {
    console.log('🗑️ Borrando transacción de activo:', id);
    setAssetTransactions(prev => prev.filter(t => t.id !== id));
    
    // También borrar de Firebase
    if (isOnline) {
      await deleteAssetTransactionFromFirebase(id);
    }
  };

  // Función para recalcular el valor de un activo basándose en sus transacciones
  const recalculateAssetValue = (assetId: string): number => {
    const relevantTransactions = assetTransactions.filter(t => t.assetId === assetId);
    
    // Buscar el nombre del activo para los logs
    const assetName = assets.find(a => a.id === assetId)?.name || 'Desconocido';
    
    console.log(`💰 Recalculando valor para activo ${assetName} (${assetId}):`, {
      totalTransactions: relevantTransactions.length,
      transactions: relevantTransactions
    });
    
    let totalValue = 0;
    let totalQuantity = 0;
    
    relevantTransactions.forEach(transaction => {
      console.log(`📊 Procesando transacción:`, {
        type: transaction.type,
        amount: transaction.amount,
        quantity: transaction.quantity,
        currentTotal: totalValue
      });
      
      switch (transaction.type) {
        case 'buy':
          totalValue += transaction.amount;
          totalQuantity += transaction.quantity || 0;
          break;
        case 'sell':
          totalValue -= transaction.amount;
          totalQuantity -= transaction.quantity || 0;
          break;
        case 'dividend':
          totalValue += transaction.amount;
          break;
        case 'fee':
          totalValue -= transaction.amount;
          break;
        case 'transfer':
          // Las transferencias no afectan el valor total
          break;
      }
      
      console.log(`📊 Después de ${transaction.type}: totalValue = ${totalValue}, totalQuantity = ${totalQuantity}`);
    });
    
    const finalValue = Math.max(0, totalValue);
    console.log(`💰 Valor final calculado para activo ${assetId}: ${finalValue}€`);
    
    return finalValue;
  };

  // Función para actualizar automáticamente todos los valores de activos
  const updateAllAssetValues = () => {
    console.log('🔄 Actualizando todos los valores de activos...');
    console.log('📊 Activos actuales:', assets);
    console.log('📊 Transacciones de activos:', assetTransactions);
    
    setAssets(prev => prev.map(asset => {
      const newValue = recalculateAssetValue(asset.id);
      console.log(`🔄 Actualizando activo ${asset.name}: ${asset.currentValue}€ → ${newValue}€`);
      
      return {
        ...asset,
        currentValue: newValue,
        updatedAt: new Date().toISOString()
      };
    }));
  };

  const addBill = (billData: Omit<RecurringBill, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newBill: RecurringBill = {
      ...billData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    setBills(prev => [...prev, newBill]);
  };

  const updateBill = (id: string, updates: Partial<RecurringBill>) => {
    setBills(prev => prev.map(b => 
      b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b
    ));
  };

  const deleteBill = async (id: string) => {
    console.log('🗑️ Borrando factura:', id);
    setBills(prev => prev.filter(b => b.id !== id));
    
    // También borrar de Firebase
    if (isOnline) {
      await deleteBillFromFirebase(id);
    }
  };

  const exportData = () => {
    const data = {
      transactions,
      assets,
      assetTransactions,
      bills,
      exportedAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finanzas-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (dataString: string) => {
    try {
      const data = JSON.parse(dataString);
      if (data.transactions) setTransactions(data.transactions);
      if (data.assets) setAssets(data.assets);
      if (data.assetTransactions) setAssetTransactions(data.assetTransactions);
      if (data.bills) setBills(data.bills);
    } catch (error) {
      console.error('Error importing data:', error);
      throw new Error('Invalid data format');
    }
  };

  // Calcular portfolio dinámicamente
  const [portfolio, setPortfolio] = useState<Portfolio>({
    totalValue: 0,
    totalPnL: 0,
    totalPnLPercentage: 0,
    assets: [],
    allocation: {},
  });

  // Actualizar valores de activos cuando cambien las transacciones
  useEffect(() => {
    console.log('🔄 Actualizando valores de activos debido a cambios en transacciones...');
    console.log('📊 Total de transacciones de activos:', assetTransactions.length);
    console.log('📊 Detalle de transacciones:', assetTransactions);
    updateAllAssetValues();
  }, [assetTransactions]);

  // Recalcular portfolio cuando cambien los activos
  useEffect(() => {
    const newPortfolio: Portfolio = {
      totalValue: assets.reduce((sum, asset) => sum + asset.currentValue, 0),
      totalPnL: 0, // Esto necesitaría datos históricos para calcular correctamente
      totalPnLPercentage: 0,
      assets,
      allocation: assets.reduce((acc, asset) => {
        const total = assets.reduce((sum, a) => sum + a.currentValue, 0);
        if (total > 0) {
          acc[asset.type] = (acc[asset.type] || 0) + (asset.currentValue / total) * 100;
        }
        return acc;
      }, {} as Record<string, number>),
    };
    
    setPortfolio(newPortfolio);
    console.log('📊 Portfolio recalculado:', newPortfolio);
  }, [assets]);

  const value: LocalDataContextType = {
    transactions,
    assets,
    assetTransactions,
    bills,
    portfolio,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addAsset,
    updateAsset,
    deleteAsset,
    addAssetTransaction,
    updateAssetTransaction,
    deleteAssetTransaction,
    addBill,
    updateBill,
    deleteBill,
    exportData,
    importData,
  };

  return (
    <LocalDataContext.Provider value={value}>
      {children}
    </LocalDataContext.Provider>
  );
}; 