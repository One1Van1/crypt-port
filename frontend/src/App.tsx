import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Toaster } from 'react-hot-toast';
import { useAppStore } from './store/appStore';
import { useAuthStore } from './store/authStore';
import Layout from './components/Layout/Layout';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import Analytics from './pages/Analytics/Analytics';
import BankAccounts from './pages/BankAccounts/BankAccounts';
import Operators from './pages/Operators/Operators';
import Users from './pages/Users/Users';
import Shifts from './pages/Shifts/Shifts';
import Transactions from './pages/Transactions/Transactions';
import Banks from './pages/Banks/Banks';
import Drops from './pages/Drops/Drops';
import DropNeoBanks from './pages/DropNeoBanks/DropNeoBanks';
import Platforms from './pages/Platforms/Platforms';
import TeamLeadDashboard from './pages/TeamLeadDashboard/TeamLeadDashboard';
import WorkingDepositChart from './pages/WorkingDeposit/WorkingDepositChart';
import Profile from './pages/Profile/Profile';

export const queryClient = new QueryClient();

function App() {
  const theme = useAppStore((state) => state.theme);
  const language = useAppStore((state) => state.language);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language, i18n]);

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster
        position="top-right"
        containerStyle={{
          zIndex: 99999,
        }}
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            zIndex: 99999,
          },
          success: {
            iconTheme: {
              primary: 'var(--success)',
              secondary: 'white',
            },
          },
          error: {
            iconTheme: {
              primary: 'var(--danger)',
              secondary: 'white',
            },
          },
        }}
      />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {isAuthenticated ? (
            <Route path="/*" element={
              <Layout>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/profile/:id" element={<Profile />} />
                  <Route path="/users" element={<Users />} />
                  <Route path="/operators" element={<Operators />} />
                  <Route path="/banks" element={<Banks />} />
                  <Route path="/drops" element={<Drops />} />
                  <Route path="/drop-neo-banks" element={<DropNeoBanks />} />
                  <Route path="/platforms" element={<Platforms />} />
                  <Route path="/teamlead-dashboard" element={<TeamLeadDashboard />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/bank-accounts" element={<BankAccounts />} />
                  <Route path="/shifts" element={<Shifts />} />
                  <Route path="/transactions" element={<Transactions />} />
                  <Route path="/working-deposit" element={<WorkingDepositChart />} />
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Layout>
            } />
          ) : (
            <Route path="/*" element={<Navigate to="/login" replace />} />
          )}
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
