import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import AuthPage from './pages/Auth';
import { useAuth } from './contexts/AuthContext';
import { Tables } from './types/database.types';

// Registration Pages
import Clients from './pages/registrations/Clients';
import Services from './pages/registrations/Services';
import Products from './pages/registrations/Products';

// Configuration Pages
import Employees from './pages/configurations/Employees';
import Specialties from './pages/configurations/Specialties';
import PaymentMethods from './pages/configurations/PaymentMethods';
import CompanySettings from './pages/configurations/Company';
import Users from './pages/configurations/Users';

// Financial Pages
import FinancialDashboard from './pages/financial/FinancialDashboard';
import AccountsPayable from './pages/financial/AccountsPayable';
import AccountsReceivable from './pages/financial/AccountsReceivable';

// Appointments Pages
import AppointmentsPanel from './pages/appointments/AppointmentsPanel';
import NewAppointment from './pages/appointments/NewAppointment';

// Sales Page
import PDV from './pages/sales/PDV';

// Reports Pages
import ReportsDashboard from './pages/reports/ReportsDashboard';
import SalesReport from './pages/reports/SalesReport';
import AppointmentsReport from './pages/reports/AppointmentsReport';
import FinancialReport from './pages/reports/FinancialReport';
import RegistrationsReport from './pages/reports/RegistrationsReport';
import CommissionReport from './pages/reports/CommissionReport';

// Backup Page
import Backup from './pages/Backup';

// WhatsApp Bot Page
import WhatsAppBot from './pages/WhatsAppBot';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<Tables<'profiles'>['role']>;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-white">Carregando...</div>;
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles && (!profile || !allowedRoles.includes(profile.role))) {
    // User is logged in but doesn't have permission. Redirect to a safe page.
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { session, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen bg-gray-950 text-white">Carregando Sessão...</div>;
  }

  if (!session) {
    return (
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/auth" />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col lg:ml-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <motion.main 
          className="flex-1 p-4 lg:p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Routes>
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            
            {/* Appointments Routes */}
            <Route path="/appointments" element={<ProtectedRoute><Navigate to="/appointments/panel" /></ProtectedRoute>} />
            <Route path="/appointments/panel" element={<ProtectedRoute><AppointmentsPanel /></ProtectedRoute>} />
            <Route path="/appointments/new" element={<ProtectedRoute><NewAppointment /></ProtectedRoute>} />
            
            {/* Sales Route */}
            <Route path="/sales" element={<ProtectedRoute><PDV /></ProtectedRoute>} />

            {/* Financial Routes */}
            <Route path="/financial" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><Navigate to="/financial/dashboard" /></ProtectedRoute>} />
            <Route path="/financial/dashboard" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><FinancialDashboard /></ProtectedRoute>} />
            <Route path="/financial/accounts-payable" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><AccountsPayable /></ProtectedRoute>} />
            <Route path="/financial/accounts-receivable" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><AccountsReceivable /></ProtectedRoute>} />

            {/* Reports Routes */}
            <Route path="/reports" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><Navigate to="/reports/dashboard" /></ProtectedRoute>} />
            <Route path="/reports/dashboard" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><ReportsDashboard /></ProtectedRoute>} />
            <Route path="/reports/sales" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><SalesReport /></ProtectedRoute>} />
            <Route path="/reports/appointments" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><AppointmentsReport /></ProtectedRoute>} />
            <Route path="/reports/financial" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><FinancialReport /></ProtectedRoute>} />
            <Route path="/reports/registrations" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><RegistrationsReport /></ProtectedRoute>} />
            <Route path="/reports/commissions" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><CommissionReport /></ProtectedRoute>} />

            {/* Registration Routes */}
            <Route path="/registrations" element={<ProtectedRoute><Navigate to="/registrations/clients" /></ProtectedRoute>} />
            <Route path="/registrations/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
            <Route path="/registrations/services" element={<ProtectedRoute><Services /></ProtectedRoute>} />
            <Route path="/registrations/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />

            {/* WhatsApp Bot Route */}
            <Route path="/whatsapp-bot" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><WhatsAppBot /></ProtectedRoute>} />

            {/* Backup Route */}
            <Route path="/backup" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><Backup /></ProtectedRoute>} />

            {/* Configuration Routes */}
            <Route path="/configurations" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><Navigate to="/configurations/company" /></ProtectedRoute>} />
            <Route path="/configurations/company" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><CompanySettings /></ProtectedRoute>} />
            <Route path="/configurations/employees" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><Employees /></ProtectedRoute>} />
            <Route path="/configurations/users" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><Users /></ProtectedRoute>} />
            <Route path="/configurations/specialties" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><Specialties /></ProtectedRoute>} />
            <Route path="/configurations/payment-methods" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><PaymentMethods /></ProtectedRoute>} />
            
            {/* Fallback for old/incorrect routes */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </motion.main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
