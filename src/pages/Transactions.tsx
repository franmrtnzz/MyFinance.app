import React, { useState, useEffect } from 'react';
import { useLocalData } from '../contexts/LocalDataContext';
import { Plus, Search, Sparkles, Edit, Trash2 } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import { parseNaturalLanguageTransaction } from '../config/openai';
import { useSearchParams } from 'react-router-dom';
import { Transaction } from '../types';

const Transactions: React.FC = () => {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useLocalData();
  const [searchParams] = useSearchParams();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showNaturalLanguage, setShowNaturalLanguage] = useState(false);
  const [naturalLanguageText, setNaturalLanguageText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  
  // Estados para editar y eliminar
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || transaction.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleAddTransaction = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const transactionData = {
      type: formData.get('type') as 'income' | 'expense',
      amount: parseFloat(formData.get('amount') as string),
      currency: formData.get('currency') as string,
      category: formData.get('category') as string,
      description: formData.get('description') as string,
      date: formData.get('date') as string,
      isRecurring: formData.get('isRecurring') === 'on',
      recurringInterval: formData.get('recurringInterval') as 'weekly' | 'monthly' | 'yearly' | undefined,
    };

    addTransaction(transactionData);
    setShowAddForm(false);
    (e.target as HTMLFormElement).reset();
  };

  // Detectar parámetros de URL para abrir formularios automáticamente
  useEffect(() => {
    const type = searchParams.get('type');
    const quick = searchParams.get('quick');
    
    if (quick === 'true' && type) {
      setFilterType(type as 'income' | 'expense');
      setShowAddForm(true);
      
      // Limpiar URL
      window.history.replaceState({}, '', '/transactions');
    }
  }, [searchParams]);

  // Funciones para editar y eliminar
  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowEditForm(true);
  };

  const handleDeleteTransaction = (transactionId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta transacción? Esta acción no se puede deshacer.')) {
      deleteTransaction(transactionId);
    }
  };

  const handleUpdateTransaction = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingTransaction) return;

    const formData = new FormData(e.currentTarget);
    
    const updatedData = {
      type: formData.get('type') as 'income' | 'expense',
      amount: parseFloat(formData.get('amount') as string),
      currency: formData.get('currency') as string,
      category: formData.get('category') as string,
      description: formData.get('description') as string,
      date: formData.get('date') as string,
      isRecurring: formData.get('isRecurring') === 'on',
      recurringInterval: formData.get('recurringInterval') as 'weekly' | 'monthly' | 'yearly' | undefined,
    };

    updateTransaction(editingTransaction.id, updatedData);
    setShowEditForm(false);
    setEditingTransaction(null);
    (e.target as HTMLFormElement).reset();
  };

  const handleNaturalLanguageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!naturalLanguageText.trim()) return;

    setIsProcessing(true);
    try {
      const parsedTransaction = await parseNaturalLanguageTransaction(naturalLanguageText);
      
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

        const transactionData = {
          type: parsedTransaction.type,
          amount: parsedTransaction.amount,
          currency: 'EUR',
          category: parsedTransaction.category,
          description: parsedTransaction.description,
          date: new Date().toISOString().split('T')[0],
          isRecurring: parsedTransaction.isRecurring || false,
          recurringInterval: parsedTransaction.recurringInterval || undefined, // Usar undefined en lugar de null
        };

        console.log('🚀 Creando transacción:', transactionData);
        
        addTransaction(transactionData);
        
        console.log('✅ Transacción añadida correctamente');
        
        setNaturalLanguageText('');
        setShowNaturalLanguage(false);
        
        // Mostrar confirmación
        alert('✅ ¡Transacción creada exitosamente con IA!');
      } else {
        alert('❌ No se pudo procesar el texto. Verifica tu conexión a internet e intenta de nuevo.');
      }
    } catch (error) {
      console.error('Error en handleNaturalLanguageSubmit:', error);
      alert('❌ Error inesperado. Revisa la consola del navegador para más detalles.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Transacciones</h2>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowNaturalLanguage(true)}
            className="btn-secondary flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
          >
            <Sparkles size={20} />
            <span>IA</span>
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Nueva</span>
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar transacciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as 'all' | 'income' | 'expense')}
          className="input-field"
        >
          <option value="all">Todas</option>
          <option value="income">Ingresos</option>
          <option value="expense">Gastos</option>
        </select>
      </div>

      {/* Natural Language Form */}
      {showNaturalLanguage && (
        <div className="card bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Sparkles className="text-purple-600" size={20} />
            <span>Captura con Inteligencia Artificial</span>
          </h3>
          <p className="text-gray-600 mb-4">
            Describe tu transacción en lenguaje natural. Ejemplos:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 text-sm">
            <div className="bg-white p-3 rounded-lg border border-purple-200">
              <p className="font-medium text-gray-900">Gastos:</p>
              <p className="text-gray-600">"hoy he ido a comer con mis amigos y he gastado 25 euros"</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-purple-200">
              <p className="font-medium text-gray-900">Ingresos:</p>
              <p className="text-gray-600">"he recibido la nómina y me han ingresado 807,60 euros"</p>
            </div>
          </div>
          
          <form onSubmit={handleNaturalLanguageSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Describe tu transacción
              </label>
              <textarea
                value={naturalLanguageText}
                onChange={(e) => setNaturalLanguageText(e.target.value)}
                className="input-field"
                rows={3}
                placeholder="Ej: Hoy he ido a comer con mis amigos y he gastado 25 euros"
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowNaturalLanguage(false)}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn-primary bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-0"
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

      {/* Add Transaction Form */}
      {showAddForm && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Nueva Transacción</h3>
          <form onSubmit={handleAddTransaction} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <select name="type" className="input-field" required defaultValue={filterType}>
                  <option value="income">Ingreso</option>
                  <option value="expense">Gasto</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad
                </label>
                <input
                  type="number"
                  name="amount"
                  step="0.01"
                  min="0"
                  className="input-field"
                  placeholder="0.00"
                  required
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
                  Categoría
                </label>
                <input
                  type="text"
                  name="category"
                  className="input-field"
                  placeholder="Comida, Transporte, etc."
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <input
                type="text"
                name="description"
                className="input-field"
                placeholder="Descripción de la transacción"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha
                </label>
                <input
                  type="date"
                  name="date"
                  className="input-field"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recurrente
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="isRecurring"
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-600">Es recurrente</span>
                </div>
              </div>
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

      {/* Edit Transaction Form */}
      {showEditForm && editingTransaction && (
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Edit className="text-blue-600" size={20} />
            <span>Editar Transacción</span>
          </h3>
          
          <form onSubmit={handleUpdateTransaction} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <select
                  name="type"
                  className="input-field"
                  defaultValue={editingTransaction.type}
                  required
                >
                  <option value="income">Ingreso</option>
                  <option value="expense">Gasto</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad
                </label>
                <input
                  type="number"
                  name="amount"
                  step="0.01"
                  min="0"
                  className="input-field"
                  defaultValue={editingTransaction.amount}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Moneda
                </label>
                <select
                  name="currency"
                  className="input-field"
                  defaultValue={editingTransaction.currency}
                  required
                >
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría
                </label>
                <input
                  type="text"
                  name="category"
                  className="input-field"
                  defaultValue={editingTransaction.category}
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <input
                  type="text"
                  name="description"
                  className="input-field"
                  defaultValue={editingTransaction.description}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha
                </label>
                <input
                  type="date"
                  name="date"
                  className="input-field"
                  defaultValue={editingTransaction.date}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recurrente
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="isRecurring"
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    defaultChecked={editingTransaction.isRecurring}
                  />
                  <span className="text-sm text-gray-600">Es recurrente</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowEditForm(false);
                  setEditingTransaction(null);
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

      {/* Transactions List */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Transacciones ({filteredTransactions.length})
        </h3>
        
        {filteredTransactions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            {transactions.length === 0 
              ? 'No hay transacciones aún. ¡Añade tu primera transacción!' 
              : 'No se encontraron transacciones con los filtros aplicados.'}
          </p>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-sm text-gray-500">{transaction.category}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className={`font-semibold text-lg ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(transaction.date)}
                    </p>
                    {transaction.isRecurring && (
                      <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        Recurrente
                      </span>
                    )}
                  </div>
                  
                  {/* Botones de acción */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditTransaction(transaction)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar transacción"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteTransaction(transaction.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar transacción"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions; 