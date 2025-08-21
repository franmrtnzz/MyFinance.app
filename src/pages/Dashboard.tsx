import React, { useState } from 'react';
import { useLocalData } from '../contexts/LocalDataContext';
import { useUserSettings } from '../contexts/UserSettingsContext';
import { TrendingUp, TrendingDown, Wallet, AlertCircle, Edit2 } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const Dashboard: React.FC = () => {
  const { transactions, portfolio, bills } = useLocalData();
  const { userSettings, updateUserName } = useUserSettings();
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');

  // Calculate monthly summary
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() === currentMonth && 
           transactionDate.getFullYear() === currentYear;
  });

  const monthlyIncome = monthlyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyBalance = monthlyIncome - monthlyExpenses;

  // Calculate upcoming bills (next 30 days)
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  
  const upcomingBills = bills
    .filter(bill => bill.isActive)
    .filter(bill => {
      const dueDate = new Date(bill.nextDueDate);
      return dueDate <= thirtyDaysFromNow;
    })
    .reduce((sum, bill) => sum + bill.amount, 0);

  // Quick action buttons
  const quickActions = [
    { 
      label: 'Nuevo Gasto', 
      icon: TrendingDown, 
      color: 'bg-red-500', 
      action: () => window.location.href = '/transactions?type=expense&quick=true'
    },
    { 
      label: 'Nuevo Ingreso', 
      icon: TrendingUp, 
      color: 'bg-green-500', 
      action: () => window.location.href = '/transactions?type=income&quick=true'
    },
    { 
      label: 'Nuevo Activo', 
      icon: Wallet, 
      color: 'bg-blue-500', 
      action: () => window.location.href = '/portfolio?add=true'
    },
    { 
      label: 'Nueva Factura', 
      icon: AlertCircle, 
      color: 'bg-orange-500', 
      action: () => window.location.href = '/bills?add=true'
    },
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Welcome Section */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          {isEditingName ? (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    updateUserName(tempName);
                    setIsEditingName(false);
                  }
                }}
                onBlur={() => {
                  updateUserName(tempName);
                  setIsEditingName(false);
                }}
                className="text-2xl font-bold text-gray-900 bg-transparent border-b-2 border-primary-500 outline-none text-center"
                placeholder="Tu nombre"
                autoFocus
              />
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl font-bold text-gray-900">
                {userSettings.userName 
                  ? `¡Bienvenido, ${userSettings.userName}! 👋`
                  : '¡Hola! 👋'
                }
              </h2>
              <button
                onClick={() => {
                  setTempName(userSettings.userName);
                  setIsEditingName(true);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Editar nombre"
              >
                <Edit2 size={18} />
              </button>
            </div>
          )}
        </div>
        <p className="text-gray-600">
          {new Date().toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
        {!userSettings.userName && !isEditingName && (
          <p className="text-sm text-gray-500 mt-2">
            Haz clic en el icono ✏️ para personalizar tu saludo
          </p>
        )}
      </div>

      {/* Monthly Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Ingresos del Mes</p>
              <p className="text-2xl font-bold text-green-900">
                {formatCurrency(monthlyIncome, 'EUR')}
              </p>
            </div>
            <TrendingUp className="text-green-600" size={24} />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-700">Gastos del Mes</p>
              <p className="text-2xl font-bold text-red-900">
                {formatCurrency(monthlyExpenses, 'EUR')}
              </p>
            </div>
            <TrendingDown className="text-red-600" size={24} />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Balance del Mes</p>
              <p className={`text-2xl font-bold ${monthlyBalance >= 0 ? 'text-blue-900' : 'text-red-900'}`}>
                {formatCurrency(monthlyBalance, 'EUR')}
              </p>
            </div>
            <Wallet className="text-blue-600" size={24} />
          </div>
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen del Portfolio</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Valor Total</span>
            <span className="text-xl font-semibold text-gray-900">
              {formatCurrency(portfolio.totalValue, 'EUR')}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Próximas Facturas (30 días)</span>
            <span className="text-lg font-medium text-orange-600">
              {formatCurrency(upcomingBills, 'EUR')}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className={`${action.color} text-white p-4 rounded-lg flex flex-col items-center space-y-2 hover:opacity-90 transition-opacity`}
            >
              <action.icon size={24} />
              <span className="text-sm font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Transacciones Recientes</h3>
        {transactions.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No hay transacciones aún. ¡Añade tu primera transacción!
          </p>
        ) : (
          <div className="space-y-3">
            {transactions.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{transaction.description}</p>
                  <p className="text-sm text-gray-500">{transaction.category}</p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount, transaction.currency)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(transaction.date).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 