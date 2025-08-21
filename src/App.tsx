import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LocalDataProvider } from './contexts/LocalDataContext';
import { FirebaseProvider } from './contexts/FirebaseContext';
import { UserSettingsProvider } from './contexts/UserSettingsContext';
import Navigation from './components/Navigation';
import SyncStatus from './components/SyncStatus';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Portfolio from './pages/Portfolio';
import Bills from './pages/Bills';
import Settings from './pages/Settings';

function App() {
  return (
    <UserSettingsProvider>
      <FirebaseProvider>
        <LocalDataProvider>
          <Router>
            <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <Navigation />
              <main className="pb-20 pt-16">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/transactions" element={<Transactions />} />
                  <Route path="/portfolio" element={<Portfolio />} />
                  <Route path="/bills" element={<Bills />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </main>
              <SyncStatus />
            </div>
          </Router>
        </LocalDataProvider>
      </FirebaseProvider>
    </UserSettingsProvider>
  );
}

export default App; 