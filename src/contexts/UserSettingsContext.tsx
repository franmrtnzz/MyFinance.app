import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserSettings } from '../types';

interface UserSettingsContextType {
  userSettings: UserSettings;
  updateUserName: (name: string) => void;
  updateUserSettings: (settings: Partial<UserSettings>) => void;
}

const defaultSettings: UserSettings = {
  userName: '',
  defaultCurrency: 'EUR',
  weekStartsOn: 'monday',
  categories: ['Comida', 'Transporte', 'Entretenimiento', 'Servicios', 'Salario', 'Freelance'],
  accounts: ['Cuenta Principal', 'Cuenta Ahorro'],
  theme: 'light',
};

const UserSettingsContext = createContext<UserSettingsContextType | undefined>(undefined);

export const useUserSettings = () => {
  const context = useContext(UserSettingsContext);
  if (context === undefined) {
    throw new Error('useUserSettings must be used within a UserSettingsProvider');
  }
  return context;
};

export const UserSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userSettings, setUserSettings] = useState<UserSettings>(defaultSettings);

  // Load settings from localStorage on mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        const storedSettings = localStorage.getItem('finanzas-user-settings');
        if (storedSettings) {
          const parsed = JSON.parse(storedSettings);
          setUserSettings({ ...defaultSettings, ...parsed });
        }
      } catch (error) {
        console.error('Error loading user settings:', error);
      }
    };

    loadSettings();
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('finanzas-user-settings', JSON.stringify(userSettings));
  }, [userSettings]);

  // Aplicar tema cuando cambie
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    
    // Remover clases anteriores
    root.classList.remove('theme-light', 'theme-dark');
    body.classList.remove('theme-light', 'theme-dark');
    
    if (userSettings.theme === 'dark') {
      root.classList.add('theme-dark');
      body.classList.add('theme-dark');
    } else {
      root.classList.add('theme-light');
      body.classList.add('theme-light');
    }
  }, [userSettings.theme]);



  const updateUserName = (name: string) => {
    setUserSettings(prev => ({ ...prev, userName: name }));
  };

  const updateUserSettings = (settings: Partial<UserSettings>) => {
    setUserSettings(prev => ({ ...prev, ...settings }));
  };

  const value: UserSettingsContextType = {
    userSettings,
    updateUserName,
    updateUserSettings,
  };

  return (
    <UserSettingsContext.Provider value={value}>
      {children}
    </UserSettingsContext.Provider>
  );
}; 