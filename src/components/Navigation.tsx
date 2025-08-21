import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, CreditCard, PieChart, FileText, Settings } from 'lucide-react';

const Navigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Inicio' },
    { path: '/transactions', icon: CreditCard, label: 'Transacciones' },
    { path: '/portfolio', icon: PieChart, label: 'Portfolio' },
    { path: '/bills', icon: FileText, label: 'Facturas' },
    { path: '/settings', icon: Settings, label: 'Ajustes' },
  ];

  return (
    <>
      {/* Top header */}
      <header className="fixed top-0 left-0 right-0 border-b z-50" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        <div className="px-4 py-3">
          <h1 className="text-xl font-semibold text-center" style={{ color: 'var(--text-primary)' }}>
            MyFinance
          </h1>
        </div>
      </header>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 border-t z-50" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        <div className="flex justify-around">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className="flex flex-col items-center py-2 px-3 min-w-0 flex-1 transition-colors duration-200"
                style={{
                  color: isActive ? 'var(--accent-color)' : 'var(--text-secondary)'
                }}
              >
                <Icon
                  size={20}
                  className="mb-1"
                  style={{
                    color: isActive ? 'var(--accent-color)' : 'var(--text-secondary)'
                  }}
                />
                <span className="text-xs font-medium truncate">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default Navigation; 