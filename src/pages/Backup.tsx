import React from 'react';
import Card from '../components/Card';
import { Download, Upload, Info } from 'lucide-react';

// Import all mock data
import { initialClients } from '../data/mockClients';
import { initialServices } from '../data/mockServices';
import { initialProducts } from '../data/mockProducts';
import { initialServiceCombos, initialProductCombos } from '../data/mockCombos';
import { initialEmployees } from '../data/mockEmployees';
import { initialSpecialties } from '../data/mockSpecialties';
import { initialPaymentMethods } from './configurations/PaymentMethods';
import { appointmentApi } from '../data/mockAppointments';
import { mockSales } from '../data/mockSales';
// Assume financial data is also available for backup
// For this example, we'll just use some static data.
const mockPayable = [{ id: 1, description: 'Aluguel', amount: 1200 }];
const mockReceivable = [{ id: 1, description: 'Venda', amount: 60 }];

const Backup: React.FC = () => {

  const handleBackup = async () => {
    const appointments = await appointmentApi.getAppointments();

    const fullBackup = {
      clients: initialClients,
      services: initialServices,
      products: initialProducts,
      serviceCombos: initialServiceCombos,
      productCombos: initialProductCombos,
      employees: initialEmployees,
      specialties: initialSpecialties,
      paymentMethods: initialPaymentMethods,
      appointments: appointments,
      sales: mockSales,
      accountsPayable: mockPayable,
      accountsReceivable: mockReceivable,
      backupDate: new Date().toISOString(),
    };

    const jsonString = JSON.stringify(fullBackup, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    const date = new Date().toISOString().split('T')[0];
    link.download = `barber_bella_backup_${date}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Backup e Restauração</h1>
        <p className="text-gray-400 mt-1">Mantenha seus dados seguros.</p>
      </div>

      <Card>
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-gradient-to-br from-sky-600 to-cyan-500 rounded-lg">
            <Download className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Realizar Backup Completo</h2>
            <p className="text-sm text-gray-400 mt-1 mb-4">
              Clique no botão abaixo para baixar um arquivo JSON com todos os dados do seu sistema. Guarde este arquivo em um local seguro.
            </p>
            <button
              onClick={handleBackup}
              className="bg-sky-600 text-white px-6 py-2 rounded-lg hover:bg-sky-700 transition-colors flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Baixar Backup Agora</span>
            </button>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-gradient-to-br from-purple-600 to-indigo-500 rounded-lg">
            <Upload className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Restaurar Backup</h2>
            <p className="text-sm text-gray-400 mt-1 mb-4">
              Selecione um arquivo de backup (.json) para restaurar os dados do sistema. Esta ação substituirá todos os dados atuais.
            </p>
            <label
              htmlFor="restore-upload"
              className="cursor-pointer bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>Selecionar Arquivo</span>
            </label>
            <input id="restore-upload" type="file" accept=".json" className="hidden" />
          </div>
        </div>
      </Card>

      <div className="p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg flex items-start space-x-3">
        <Info className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-yellow-300">Importante</h3>
          <p className="text-sm text-yellow-400/80">
            A função de restauração ainda está em desenvolvimento. Por enquanto, apenas o download do backup está disponível.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Backup;
