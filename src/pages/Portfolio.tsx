import React, { useState, useEffect } from 'react';
import { useLocalData } from '../contexts/LocalDataContext';
import { Plus, PieChart, TrendingUp, TrendingDown, Sparkles, Edit, Trash2 } from 'lucide-react';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import { useSearchParams } from 'react-router-dom';
import { parseNaturalLanguageAssetTransaction } from '../config/openai';
import { Asset, AssetTransaction } from '../types';

const Portfolio: React.FC = () => {
  const { assets, portfolio, addAsset, addAssetTransaction, assetTransactions, updateAssetTransaction, deleteAssetTransaction } = useLocalData();
  const [searchParams] = useSearchParams();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAITransactionForm, setShowAITransactionForm] = useState(false);
  const [naturalLanguageText, setNaturalLanguageText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Estados para editar y eliminar transacciones de activos
  const [editingAssetTransaction, setEditingAssetTransaction] = useState<AssetTransaction | null>(null);
  const [showEditAssetTransactionForm, setShowEditAssetTransactionForm] = useState(false);

  // Detectar parámetros de URL para abrir formularios automáticamente
  useEffect(() => {
    const add = searchParams.get('add');
    
    if (add === 'true') {
      setShowAddForm(true);
      
      // Limpiar URL
      window.history.replaceState({}, '', '/portfolio');
    }
  }, [searchParams]);

  const handleAddAsset = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const assetData = {
      name: formData.get('name') as string,
      type: formData.get('type') as any,
      symbol: formData.get('symbol') as string,
      currency: formData.get('currency') as string,
      currentValue: parseFloat(formData.get('currentValue') as string),
      targetAllocation: parseFloat(formData.get('targetAllocation') as string) || undefined,
      notes: formData.get('notes') as string,
    };

    addAsset(assetData);
    setShowAddForm(false);
    (e.target as HTMLFormElement).reset();
  };

  // Función para mapear tipos de IA a tipos de activos válidos
  const mapAssetType = (aiType: string): Asset['type'] => {
    const typeMap: Record<string, Asset['type']> = {
      'crypto': 'crypto',
      'equity': 'equity', 
      'bond': 'bond',
      'commodity': 'commodity',
      'fund': 'fund',
      'forex': 'forex',
      'real_estate': 'real_estate'
    };
    return typeMap[aiType] || 'equity'; // Default a equity si no se encuentra
  };

  // Funciones para editar y eliminar transacciones de activos
  const handleEditAssetTransaction = (assetTransaction: AssetTransaction) => {
    setEditingAssetTransaction(assetTransaction);
    setShowEditAssetTransactionForm(true);
  };

  const handleDeleteAssetTransaction = (assetTransactionId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta transacción de activo? Esta acción no se puede deshacer.')) {
      deleteAssetTransaction(assetTransactionId);
    }
  };

  const handleUpdateAssetTransaction = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingAssetTransaction) return;

    const formData = new FormData(e.currentTarget);
    
    const updatedData = {
      type: formData.get('type') as 'buy' | 'sell' | 'dividend' | 'fee' | 'transfer',
      amount: parseFloat(formData.get('amount') as string),
      quantity: formData.get('quantity') ? parseFloat(formData.get('quantity') as string) : undefined,
      price: formData.get('price') ? parseFloat(formData.get('price') as string) : undefined,
      currency: formData.get('currency') as string,
      date: formData.get('date') as string,
      notes: formData.get('notes') as string,
    };

    updateAssetTransaction(editingAssetTransaction.id, updatedData);
    setShowEditAssetTransactionForm(false);
    setEditingAssetTransaction(null);
    (e.target as HTMLFormElement).reset();
  };

  const handleAIAssetTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!naturalLanguageText.trim()) return;

    setIsProcessing(true);
    try {
      const parsedTransaction = await parseNaturalLanguageAssetTransaction(naturalLanguageText);
      
      if (parsedTransaction) {
        // Verificar si hay error en la respuesta
        if (parsedTransaction.error) {
          alert(`❌ Error de IA: ${parsedTransaction.error}`);
          setIsProcessing(false);
          return;
        }

        // Verificar que los datos sean válidos
        if (parsedTransaction.amount <= 0) {
          alert('❌ No se pudo extraer un monto válido del texto. Intenta ser más específico con la cantidad.');
          setIsProcessing(false);
          return;
        }

        // Buscar si el activo ya existe
        let targetAsset = assets.find(asset => 
          asset.name.toLowerCase().includes(parsedTransaction.assetName.toLowerCase()) ||
          (asset.symbol && asset.symbol.toLowerCase() === parsedTransaction.assetName.toLowerCase())
        );

                          // Si no existe, crear el activo automáticamente
         if (!targetAsset) {
           const mappedType = mapAssetType(parsedTransaction.assetType);
           const newAssetData = {
             name: parsedTransaction.assetName,
             type: mappedType, // Usar el tipo mapeado
             symbol: parsedTransaction.assetName.length <= 5 ? parsedTransaction.assetName.toUpperCase() : undefined,
             currency: parsedTransaction.currency,
             currentValue: parsedTransaction.amount,
             notes: `Creado automáticamente por IA: ${parsedTransaction.notes}`,
           };

           // Generar un ID temporal para usar en la transacción
           const tempAssetId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
           
           // Crear el activo con el ID temporal
           const tempAsset = {
             ...newAssetData,
             id: tempAssetId,
             createdAt: new Date().toISOString(),
             updatedAt: new Date().toISOString(),
           };
           
           // Añadir el activo usando la función del contexto
           addAsset(newAssetData);
           
           // Usar el activo temporal para la transacción
           targetAsset = tempAsset;
         }

                 // Crear la transacción del activo
         if (targetAsset) {
           const assetTransactionData = {
             assetId: targetAsset.id,
             type: parsedTransaction.type,
             amount: parsedTransaction.amount,
             quantity: parsedTransaction.quantity,
             price: parsedTransaction.price,
             currency: parsedTransaction.currency,
             date: new Date().toISOString().split('T')[0],
             notes: parsedTransaction.notes,
           };

           console.log('🚀 Creando transacción de activo:', assetTransactionData);
           console.log('📊 Activo objetivo:', targetAsset);
           
           addAssetTransaction(assetTransactionData);
           
           console.log('✅ Transacción de activo añadida correctamente');
         } else {
           console.error('❌ No se pudo encontrar o crear el activo');
         }
        
        setNaturalLanguageText('');
        setShowAITransactionForm(false);
        
        alert('✅ ¡Transacción de activo creada exitosamente con IA!');
      } else {
        alert('❌ No se pudo procesar el texto. Verifica tu conexión a internet e intenta de nuevo.');
      }
    } catch (error) {
      console.error('Error en handleAIAssetTransaction:', error);
      alert('❌ Error inesperado. Revisa la consola del navegador para más detalles.');
    } finally {
      setIsProcessing(false);
    }
  };

  const assetTypes = [
    { value: 'equity', label: 'Acciones' },
    { value: 'etf', label: 'ETF' },
    { value: 'fund', label: 'Fondos' },
    { value: 'crypto', label: 'Criptomonedas' },
    { value: 'cash', label: 'Efectivo' },
    { value: 'bond', label: 'Bonos' },
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Portfolio</h2>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowAITransactionForm(true)}
            className="btn-secondary flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0"
          >
            <Sparkles size={20} />
            <span>IA Transacción</span>
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Nuevo Activo</span>
          </button>
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Valor Total</p>
              <p className="text-2xl font-bold text-blue-900">
                {formatCurrency(portfolio.totalValue, 'EUR')}
              </p>
            </div>
            <PieChart className="text-blue-600" size={24} />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">P&L Total</p>
              <p className={`text-2xl font-bold ${portfolio.totalPnL >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                {formatCurrency(portfolio.totalPnL, 'EUR')}
              </p>
            </div>
            {portfolio.totalPnL >= 0 ? (
              <TrendingUp className="text-green-600" size={24} />
            ) : (
              <TrendingDown className="text-red-600" size={24} />
            )}
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700">P&L %</p>
              <p className={`text-2xl font-bold ${portfolio.totalPnLPercentage >= 0 ? 'text-purple-900' : 'text-red-900'}`}>
                {formatPercentage(portfolio.totalPnLPercentage)}
              </p>
            </div>
            <PieChart className="text-purple-600" size={24} />
          </div>
        </div>
      </div>

      {/* AI Asset Transaction Form */}
      {showAITransactionForm && (
        <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Sparkles className="text-green-600" size={20} />
            <span>Transacción de Activos con IA</span>
          </h3>
          <p className="text-gray-600 mb-4">
            Describe tu operación con activos en lenguaje natural. Ejemplos:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 text-sm">
            <div className="bg-white p-3 rounded-lg border border-green-200">
              <p className="font-medium text-gray-900">Compras:</p>
              <p className="text-gray-600">"he comprado 10 acciones de Apple a 150 dólares cada una"</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-green-200">
              <p className="font-medium text-gray-900">Ventas:</p>
              <p className="text-gray-600">"he vendido mis acciones de Tesla por 2000 euros"</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-green-200">
              <p className="font-medium text-gray-900">Dividendos:</p>
              <p className="text-gray-600">"he recibido dividendos de Telefónica por 25 euros"</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-green-200">
              <p className="font-medium text-gray-900">Comisiones:</p>
              <p className="text-gray-600">"he pagado 5 euros de comisión por operar"</p>
            </div>
          </div>
          
          <form onSubmit={handleAIAssetTransaction} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Describe tu operación de activos
              </label>
              <textarea
                value={naturalLanguageText}
                onChange={(e) => setNaturalLanguageText(e.target.value)}
                className="input-field"
                rows={3}
                placeholder="Ej: He comprado 10 acciones de Apple a 150 dólares cada una"
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAITransactionForm(false)}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn-primary bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 border-0"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <span className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Procesando...</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-2">
                    <Sparkles size={16} />
                    <span>Procesar con IA</span>
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Asset Form */}
      {showAddForm && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Nuevo Activo</h3>
          <form onSubmit={handleAddAsset} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  name="name"
                  className="input-field"
                  placeholder="Nombre del activo"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <select name="type" className="input-field" required>
                  {assetTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Símbolo (opcional)
                </label>
                <input
                  type="text"
                  name="symbol"
                  className="input-field"
                  placeholder="AAPL, MSFT, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Moneda
                </label>
                <select name="currency" className="input-field" required>
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Actual
                </label>
                <input
                  type="number"
                  name="currentValue"
                  step="0.01"
                  min="0"
                  className="input-field"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  % Objetivo (opcional)
                </label>
                <input
                  type="number"
                  name="targetAllocation"
                  step="0.1"
                  min="0"
                  max="100"
                  className="input-field"
                  placeholder="0.0"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas (opcional)
              </label>
              <textarea
                name="notes"
                rows={3}
                className="input-field"
                placeholder="Notas adicionales..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button type="submit" className="btn-primary">
                Guardar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Asset Transaction Form */}
      {showEditAssetTransactionForm && editingAssetTransaction && (
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Edit className="text-blue-600" size={20} />
            <span>Editar Transacción de Activo</span>
          </h3>
          
          <form onSubmit={handleUpdateAssetTransaction} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Operación
                </label>
                <select
                  name="type"
                  className="input-field"
                  defaultValue={editingAssetTransaction.type}
                  required
                >
                  <option value="buy">Compra</option>
                  <option value="sell">Venta</option>
                  <option value="dividend">Dividendo</option>
                  <option value="fee">Comisión</option>
                  <option value="transfer">Transferencia</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad Total
                </label>
                <input
                  type="number"
                  name="amount"
                  step="0.01"
                  min="0"
                  className="input-field"
                  defaultValue={editingAssetTransaction.amount}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad de Unidades
                </label>
                <input
                  type="number"
                  name="quantity"
                  step="0.01"
                  min="0"
                  className="input-field"
                  defaultValue={editingAssetTransaction.quantity || ''}
                  placeholder="Opcional"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio por Unidad
                </label>
                <input
                  type="number"
                  name="price"
                  step="0.01"
                  min="0"
                  className="input-field"
                  defaultValue={editingAssetTransaction.price || ''}
                  placeholder="Opcional"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Moneda
                </label>
                <select
                  name="currency"
                  className="input-field"
                  defaultValue={editingAssetTransaction.currency}
                  required
                >
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha
                </label>
                <input
                  type="date"
                  name="date"
                  className="input-field"
                  defaultValue={editingAssetTransaction.date}
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  className="input-field"
                  defaultValue={editingAssetTransaction.notes || ''}
                  placeholder="Notas adicionales..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowEditAssetTransactionForm(false);
                  setEditingAssetTransaction(null);
                }}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button type="submit" className="btn-primary">
                Actualizar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Assets List */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Activos ({assets.length})
        </h3>
        
        {assets.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No hay activos aún. ¡Añade tu primer activo!
          </p>
        ) : (
          <div className="space-y-3">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <div>
                      <p className="font-medium text-gray-900">{asset.name}</p>
                      <p className="text-sm text-gray-500">
                        {assetTypes.find(t => t.value === asset.type)?.label} 
                        {asset.symbol && ` • ${asset.symbol}`}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-semibold text-lg text-gray-900">
                    {formatCurrency(asset.currentValue, asset.currency)}
                  </p>
                  {asset.targetAllocation && (
                    <p className="text-xs text-gray-500">
                      Objetivo: {asset.targetAllocation.toFixed(1)}%
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Asset Transactions List */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Transacciones de Activos ({assetTransactions.length})
        </h3>
        
        {assetTransactions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No hay transacciones de activos aún. ¡Añade tu primera transacción!
          </p>
        ) : (
          <div className="space-y-3">
            {assetTransactions.map((assetTransaction) => {
              const asset = assets.find(a => a.id === assetTransaction.assetId);
              return (
                <div
                  key={assetTransaction.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        assetTransaction.type === 'buy' ? 'bg-green-500' : 
                        assetTransaction.type === 'sell' ? 'bg-red-500' : 
                        assetTransaction.type === 'dividend' ? 'bg-blue-500' : 'bg-yellow-500'
                      }`} />
                      <div>
                        <p className="font-medium text-gray-900">
                          {assetTransaction.type === 'buy' ? 'Compra' : 
                           assetTransaction.type === 'sell' ? 'Venta' : 
                           assetTransaction.type === 'dividend' ? 'Dividendo' : 
                           assetTransaction.type === 'fee' ? 'Comisión' : 'Transferencia'}
                          {asset && ` de ${asset.name}`}
                        </p>
                        <p className="text-sm text-gray-500">
                          {assetTransaction.notes || 'Sin notas'}
                          {assetTransaction.quantity && ` • ${assetTransaction.quantity} unidades`}
                          {assetTransaction.price && ` • ${formatCurrency(assetTransaction.price, assetTransaction.currency)}/unidad`}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className={`font-semibold text-lg ${
                        assetTransaction.type === 'buy' ? 'text-red-600' : 
                        assetTransaction.type === 'sell' ? 'text-green-600' : 
                        assetTransaction.type === 'dividend' ? 'text-blue-600' : 'text-yellow-600'
                      }`}>
                        {assetTransaction.type === 'buy' ? '-' : '+'}
                        {formatCurrency(assetTransaction.amount, assetTransaction.currency)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(assetTransaction.date).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    
                    {/* Botones de acción */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditAssetTransaction(assetTransaction)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar transacción"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteAssetTransaction(assetTransaction.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar transacción"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Asset Allocation Chart */}
      {assets.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Tipo</h3>
          <div className="space-y-3">
            {Object.entries(portfolio.allocation).map(([type, percentage]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-gray-700">
                  {assetTypes.find(t => t.value === type)?.label || type}
                </span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-12 text-right">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio; 