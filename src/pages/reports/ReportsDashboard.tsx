import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/Card';
import { ShoppingCart, Calendar, DollarSign, Archive, BarChart2 } from 'lucide-react';

const reportOptions = [
  {
    title: 'Relatório de Vendas',
    description: 'Analise o desempenho de vendas, produtos e serviços.',
    icon: ShoppingCart,
    path: '/reports/sales',
    color: 'from-sky-600 to-cyan-500'
  },
  {
    title: 'Relatório de Agendamentos',
    description: 'Visualize taxas de comparecimento, cancelamentos e mais.',
    icon: Calendar,
    path: '/reports/appointments',
    color: 'from-purple-600 to-indigo-500'
  },
  {
    title: 'Relatório Financeiro',
    description: 'Acompanhe o fluxo de caixa, contas a pagar e a receber.',
    icon: DollarSign,
    path: '/reports/financial',
    color: 'from-green-600 to-emerald-500'
  },
  {
    title: 'Relatório de Cadastros',
    description: 'Exporte listas de clientes, produtos e serviços.',
    icon: Archive,
    path: '/reports/registrations',
    color: 'from-yellow-600 to-amber-500'
  }
];

const ReportsDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Painel de Relatórios</h1>
        <p className="text-gray-400 mt-1">Selecione um tipo de relatório para começar a análise.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportOptions.map((report, index) => (
          <Card key={report.title} delay={index * 0.1}>
            <Link to={report.path} className="block group">
              <div className="flex items-start space-x-4">
                <div className={`p-3 bg-gradient-to-br ${report.color} rounded-lg`}>
                  <report.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors">{report.title}</h2>
                  <p className="text-sm text-gray-400 mt-1">{report.description}</p>
                </div>
              </div>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ReportsDashboard;
