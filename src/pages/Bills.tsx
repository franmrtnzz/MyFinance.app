import React, { useState, useEffect } from 'react';
import { useLocalData } from '../contexts/LocalDataContext';
import { Plus, Calendar } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useSearchParams } from 'react-router-dom';

const Bills: React.FC = () => {
  const { bills, addBill } = useLocalData();
  const [searchParams] = useSearchParams();
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddBill = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const noDueDate = formData.get('noDueDate') === 'on';
    const nextDueDate = noDueDate ? null : (formData.get('nextDueDate') as string);
    
    const billData = {
      name: formData.get('name') as string,
      amount: parseFloat(formData.get('amount') as string),
      currency: formData.get('currency') as string,
      category: formData.get('category') as string,
      cadence: formData.get('cadence') as 'weekly' | 'monthly' | 'yearly',
      nextDueDate: nextDueDate || new Date().toISOString().split('T')[0], // Fecha actual si no hay vencimiento
      account: formData.get('account') as string,
      merchant: formData.get('merchant') as string,
      notes: formData.get('notes') as string,
      isActive: true,
      noDueDate: noDueDate, // Nueva propiedad
    };

    addBill(billData);
    setShowAddForm(false);
    (e.target as HTMLFormElement).reset();
  };

  // Calculate cash to keep for different periods
  const calculateCashToKeep = (days: number) => {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);
    
    return bills
      .filter(bill => bill.isActive)
      .filter(bill => !bill.noDueDate) // Excluir suscripciones sin vencimiento
      .filter(bill => {
        const dueDate = new Date(bill.nextDueDate);
        return dueDate <= endDate;
      })
      .reduce((sum, bill) => sum + bill.amount, 0);
  };

  const cash30Days = calculateCashToKeep(30);
  const cash60Days = calculateCashToKeep(60);
  const cash90Days = calculateCashToKeep(90);

  // Detectar parámetros de URL para abrir formularios automáticamente
  useEffect(() => {
    const add = searchParams.get('add');
    
    if (add === 'true') {
      setShowAddForm(true);
      
      // Limpiar URL
      window.history.replaceState({}, '', '/bills');
    }
  }, [searchParams]);

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Facturas Recurrentes</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Nueva Factura</span>
        </button>
      </div>

      {/* Cash to Keep Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-700">Efectivo a Mantener (30 días)</p>
              <p className="text-2xl font-bold text-orange-900">
                {formatCurrency(cash30Days, 'EUR')}
              </p>
            </div>
            <Calendar className="text-orange-600" size={24} />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-700">Efectivo a Mantener (60 días)</p>
              <p className="text-2xl font-bold text-yellow-900">
                {formatCurrency(cash60Days, 'EUR')}
              </p>
            </div>
            <Calendar className="text-yellow-600" size={24} />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-700">Efectivo a Mantener (90 días)</p>
              <p className="text-2xl font-bold text-red-900">
                {formatCurrency(cash90Days, 'EUR')}
              </p>
            </div>
            <Calendar className="text-red-600" size={24} />
          </div>
        </div>
      </div>

      {/* Add Bill Form */}
      {showAddForm && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Nueva Factura Recurrente</h3>
          <form onSubmit={handleAddBill} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  name="name"
                  className="input-field"
                  placeholder="Nombre de la factura"
                  required
                />
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
                  placeholder="Hogar, Servicios, etc."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frecuencia
                </label>
                <select name="cadence" className="input-field" required>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensual</option>
                  <option value="yearly">Anual</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Próxima Fecha de Vencimiento
                </label>
                <div className="space-y-2">
                  <input
                    type="date"
                    name="nextDueDate"
                    className="input-field"
                    required
                  />
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="noDueDate"
                      name="noDueDate"
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="noDueDate" className="text-sm text-gray-600">
                      Sin fecha de vencimiento (suscripciones continuas)
                    </label>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cuenta
                </label>
                <input
                  type="text"
                  name="account"
                  className="input-field"
                  placeholder="Cuenta bancaria"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comercio/Proveedor
                </label>
                <input
                  type="text"
                  name="merchant"
                  className="input-field"
                  placeholder="Nombre del comercio"
                  required
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

      {/* Bills List */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Facturas ({bills.length})
        </h3>
        
        {bills.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No hay facturas recurrentes aún. ¡Añade tu primera factura!
          </p>
        ) : (
          <div className="space-y-3">
            {bills.map((bill) => {
              const daysUntilDue = Math.ceil(
                (new Date(bill.nextDueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
              );
              const isOverdue = daysUntilDue < 0;
              const isDueSoon = daysUntilDue <= 7 && daysUntilDue >= 0;

              return (
                <div
                  key={bill.id}
                  className={`p-4 rounded-lg transition-colors ${
                    isOverdue ? 'bg-red-50 border border-red-200' :
                    isDueSoon ? 'bg-yellow-50 border border-yellow-200' :
                    'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          isOverdue ? 'bg-red-500' :
                          isDueSoon ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`} />
                        <div>
                          <p className="font-medium text-gray-900">{bill.name}</p>
                          <p className="text-sm text-gray-500">
                            {bill.merchant} • {bill.category}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold text-lg text-gray-900">
                        {formatCurrency(bill.amount, bill.currency)}
                      </p>
                                             <div className="flex items-center space-x-2">
                         <Calendar size={16} className="text-gray-400" />
                         <span className={`text-sm font-medium ${
                           bill.noDueDate ? 'text-blue-600' :
                           isOverdue ? 'text-red-600' :
                           isDueSoon ? 'text-yellow-600' :
                           'text-gray-500'
                         }`}>
                           {bill.noDueDate ? 'Suscripción continua' :
                            isOverdue ? `Vencida hace ${Math.abs(daysUntilDue)} días` :
                            isDueSoon ? `Vence en ${daysUntilDue} días` :
                            `Vence en ${daysUntilDue} días`}
                         </span>
                       </div>
                       <p className="text-xs text-gray-500">
                         {bill.noDueDate ? 'Sin vencimiento' : formatDate(bill.nextDueDate)}
                       </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bills; 