import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/Card';
import { CreditCard, TrendingDown, TrendingUp, Calendar, DollarSign } from 'lucide-react';

const FinancialDashboard: React.FC = () => {
  const financialSummary = {
    totalReceivable: 4750.00,
    totalPayable: 2850.00,
    overdueReceivable: 350.00,
    overduePayable: 120.00,
    monthlyBalance: 1900.00
  };

  const recentTransactions = [
    { id: 1, description: 'Corte - Ana Silva', amount: 60.00, type: 'receber', date: '25/07/2025', status: 'pendente' },
    { id: 2, description: 'Aluguel do Salão', amount: 1200.00, type: 'pagar', date: '26/07/2025', status: 'pendente' },
    { id: 3, description: 'Manicure - Mariana Costa', amount: 45.00, type: 'receber', date: '24/07/2025', status: 'pago' },
    { id: 4, description: 'Energia Elétrica', amount: 180.00, type: 'pagar', date: '23/07/2025', status: 'vencido' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Painel Financeiro</h1>
        <p className="text-gray-400 mt-1">Controle financeiro do seu negócio</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-900/50 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">A Receber</p>
              <p className="text-lg font-semibold text-green-400">R$ {financialSummary.totalReceivable.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-900/50 rounded-lg">
              <TrendingDown className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">A Pagar</p>
              <p className="text-lg font-semibold text-red-400">R$ {financialSummary.totalPayable.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-900/50 rounded-lg">
              <Calendar className="h-6 w-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Em Atraso</p>
              <p className="text-lg font-semibold text-yellow-400">R$ {(financialSummary.overdueReceivable + financialSummary.overduePayable).toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-sky-900/50 rounded-lg">
              <DollarSign className="h-6 w-6 text-sky-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Saldo do Mês</p>
              <p className="text-lg font-semibold text-sky-400">R$ {financialSummary.monthlyBalance.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-900/50 rounded-lg">
              <CreditCard className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Fluxo Líquido</p>
              <p className="text-lg font-semibold text-blue-400">R$ {(financialSummary.totalReceivable - financialSummary.totalPayable).toFixed(2)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-green-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Contas a Receber</h3>
            <p className="text-gray-400 mb-4">Gerencie seus recebimentos e vendas</p>
            <Link 
              to="/financial/accounts-receivable"
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors inline-block"
            >
              Acessar
            </Link>
          </div>
        </Card>

        <Card>
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-red-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingDown className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Contas a Pagar</h3>
            <p className="text-gray-400 mb-4">Controle seus gastos e despesas</p>
            <Link 
              to="/financial/accounts-payable"
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors inline-block"
            >
              Acessar
            </Link>
          </div>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Transações Recentes</h2>
          <div className="flex space-x-2">
            <Link to="/financial/accounts-receivable" className="text-green-400 hover:text-green-300 text-sm font-medium">
              Ver A Receber
            </Link>
            <span className="text-gray-600">|</span>
            <Link to="/financial/accounts-payable" className="text-red-400 hover:text-red-300 text-sm font-medium">
              Ver A Pagar
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          {recentTransactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-lg ${transaction.type === 'receber' ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
                  {transaction.type === 'receber' ? 
                    <TrendingUp className="h-5 w-5 text-green-400" /> : 
                    <TrendingDown className="h-5 w-5 text-red-400" />
                  }
                </div>
                <div>
                  <p className="font-medium text-white">{transaction.description}</p>
                  <p className="text-sm text-gray-400">{transaction.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${transaction.type === 'receber' ? 'text-green-400' : 'text-red-400'}`}>
                  R$ {transaction.amount.toFixed(2)}
                </p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  transaction.status === 'pago' || transaction.status === 'recebido' ? 'bg-green-900/50 text-green-300' :
                  transaction.status === 'vencido' ? 'bg-red-900/50 text-red-300' :
                  'bg-yellow-900/50 text-yellow-300'
                }`}>
                  {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default FinancialDashboard;
