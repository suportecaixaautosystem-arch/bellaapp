import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';

// Registration Pages
import Clients from './pages/registrations/Clients';
import Services from './pages/registrations/Services';
import Products from './pages/registrations/Products';

// Configuration Pages
import Employees from './pages/configurations/Employees';
import Specialties from './pages/configurations/Specialties';
import PaymentMethods from './pages/configurations/PaymentMethods';
import CompanySettings from './pages/configurations/Company';

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

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Router>
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
              <Route path="/" element={<Dashboard />} />
              
              {/* Appointments Routes */}
              <Route path="/appointments" element={<Navigate to="/appointments/panel" />} />
              <Route path="/appointments/panel" element={<AppointmentsPanel />} />
              <Route path="/appointments/new" element={<NewAppointment />} />
              
              {/* Sales Route */}
              <Route path="/sales" element={<PDV />} />

              {/* Financial Routes */}
              <Route path="/financial" element={<Navigate to="/financial/dashboard" />} />
              <Route path="/financial/dashboard" element={<FinancialDashboard />} />
              <Route path="/financial/accounts-payable" element={<AccountsPayable />} />
              <Route path="/financial/accounts-receivable" element={<AccountsReceivable />} />

              {/* Reports Routes - Corrected */}
              <Route path="/reports" element={<ReportsDashboard />} />
              <Route path="/reports/sales" element={<SalesReport />} />
              <Route path="/reports/appointments" element={<AppointmentsReport />} />
              <Route path="/reports/financial" element={<FinancialReport />} />
              <Route path="/reports/registrations" element={<RegistrationsReport />} />
              <Route path="/reports/commissions" element={<CommissionReport />} />

              {/* Registration Routes */}
              <Route path="/registrations" element={<Navigate to="/registrations/clients" />} />
              <Route path="/registrations/clients" element={<Clients />} />
              <Route path="/registrations/services" element={<Services />} />
              <Route path="/registrations/products" element={<Products />} />

              {/* WhatsApp Bot Route */}
              <Route path="/whatsapp-bot" element={<WhatsAppBot />} />

              {/* Backup Route */}
              <Route path="/backup" element={<Backup />} />

              {/* Configuration Routes */}
              <Route path="/configurations" element={<Navigate to="/configurations/company" />} />
              <Route path="/configurations/company" element={<CompanySettings />} />
              <Route path="/configurations/employees" element={<Employees />} />
              <Route path="/configurations/specialties" element={<Specialties />} />
              <Route path="/configurations/payment-methods" element={<PaymentMethods />} />
              <Route path="/configurations/clients" element={<Navigate to="/registrations/clients" />} />
              <Route path="/configurations/services" element={<Navigate to="/registrations/services" />} />
              <Route path="/configurations/products" element={<Navigate to="/registrations/products" />} />

              {/* Fallback for old routes */}
              <Route path="/settings" element={<Navigate to="/configurations/company" />} />
            </Routes>
          </motion.main>
        </div>
      </div>
    </Router>
  );
}

export default App;
