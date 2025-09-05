import React, { useState, useMemo } from 'react';
import Card from '../../components/Card';
import { Filter, Printer, FileDown, BarChart2, TrendingUp, TrendingDown, DollarSign, MessageSquare } from 'lucide-react';
import { exportToPdf, shareToWhatsApp } from '../../utils/reportExporter';

const mockPayable = [
    { id: 1, description: 'Aluguel do Salão', amount: 1200.00, dueDate: '2025-08-05', category: 'Aluguel', status: 'pendente' as const, recurring: true },
    { id: 2, description: 'Energia Elétrica', amount: 180.00, dueDate: '2025-08-15', category: 'Utilidades', status: 'pendente' as const, recurring: true },
    { id: 3, description: 'Internet', amount: 89.90, dueDate: '2025-08-10', category: 'Tecnologia', status: 'pago' as const, recurring: true },
];
const mockReceivable = [
    { id: 1, description: 'Corte Feminino - Ana Silva', amount: 60.00, dueDate: '2025-08-25', category: 'Serviços', status: 'pendente' as const, recurring: false },
    { id: 2, description: 'Pacote Mensal - Carlos Souza', amount: 200.00, dueDate: '2025-08-01', category: 'Pacotes', status: 'recebido' as const, recurring: true },
    { id: 3, description: 'Massagem - Pedro Almeida', amount: 80.00, dueDate: '2025-07-20', category: 'Serviços', status: 'vencido' as const, recurring: false },
];

const FinancialReport: React.FC = () => {
  const [filters, setFilters] = useState({
    type: 'all',
    startDate: '2025-08-01',
    endDate: '2025-08-31',
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const combinedData = useMemo(() => {
    const payable = filters.type === 'all' || filters.type === 'payable' ? mockPayable.map(item => ({ ...item, type: 'pagar' as const })) : [];
    const receivable = filters.type === 'all' || filters.type === 'receivable' ? mockReceivable.map(item => ({ ...item, type: 'receber' as const })) : [];
    return [...payable, ...receivable];
  }, [filters.type]);

  const filteredData = useMemo(() => {
    return combinedData.filter(item => {
      const itemDate = new Date(item.dueDate);
      const start = new Date(filters.startDate);
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      return itemDate >= start && itemDate <= end;
    });
  }, [combinedData, filters.startDate, filters.endDate]);

  const summary = useMemo(() => {
    const totalReceivable = filteredData.filter(d => d.type === 'receber').reduce((acc, item) => acc + item.amount, 0);
    const totalPayable = filteredData.filter(d => d.type === 'pagar').reduce((acc, item) => acc + item.amount, 0);
    const balance = totalReceivable - totalPayable;
    return { totalReceivable, totalPayable, balance };
  }, [filteredData]);

  const handleExportPdf = () => {
    const title = 'Relatório Financeiro';
    const headers = ['Descrição', 'Tipo', 'Vencimento', 'Valor', 'Status'];
    const data = filteredData.map(item => [
      item.description,
      item.type === 'receber' ? 'A Receber' : 'A Pagar',
      new Date(item.dueDate).toLocaleDateString('pt-BR'),
      `R$ ${item.amount.toFixed(2)}`,
      item.status
    ]);
    exportToPdf(title, headers, data);
  };

  const handleShareWhatsApp = () => {
    let text = `*Relatório Financeiro (${filters.startDate} a ${filters.endDate})*\n\n`;
    text += `*Total a Receber:* R$ ${summary.totalReceivable.toFixed(2)}\n`;
    text += `*Total a Pagar:* R$ ${summary.totalPayable.toFixed(2)}\n`;
    text += `*Saldo do Período:* R$ ${summary.balance.toFixed(2)}\n`;
    shareToWhatsApp(text);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Relatório Financeiro</h1>
          <p className="text-gray-400 mt-1">Analise suas finanças detalhadamente.</p>
        </div>
        <div className="flex space-x-2">
            <button onClick={() => window.print()} className="flex items-center space-x-2 px-4 py-2 border border-gray-700 rounded-lg hover:bg-gray-800 text-gray-300"><Printer className="h-4 w-4" /><span>Imprimir</span></button>
            <button onClick={handleExportPdf} className="flex items-center space-x-2 px-4 py-2 border border-gray-700 rounded-lg hover:bg-gray-800 text-gray-300"><FileDown className="h-4 w-4" /><span>PDF</span></button>
            <button onClick={handleShareWhatsApp} className="flex items-center space-x-2 px-4 py-2 border border-gray-700 rounded-lg hover:bg-gray-800 text-gray-300"><MessageSquare className="h-4 w-4" /><span>Compartilhar</span></button>
        </div>
      </div>
      <Card>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center"><Filter className="h-5 w-5 mr-2 text-cyan-400" />Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Tipo</label>
            <select name="type" value={filters.type} onChange={handleFilterChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white">
              <option value="all">Contas a Pagar e Receber</option>
              <option value="payable">Contas a Pagar</option>
              <option value="receivable">Contas a Receber</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Data de Vencimento (Início)</label>
            <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Data de Vencimento (Fim)</label>
            <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white" />
          </div>
        </div>
      </Card>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><h3 className="text-sm text-gray-400 flex items-center space-x-2"><TrendingUp className="h-4 w-4"/><span>Total a Receber</span></h3><p className="text-2xl font-bold text-green-400">R$ {summary.totalReceivable.toFixed(2)}</p></Card>
        <Card><h3 className="text-sm text-gray-400 flex items-center space-x-2"><TrendingDown className="h-4 w-4"/><span>Total a Pagar</span></h3><p className="text-2xl font-bold text-red-400">R$ {summary.totalPayable.toFixed(2)}</p></Card>
        <Card><h3 className="text-sm text-gray-400 flex items-center space-x-2"><DollarSign className="h-4 w-4"/><span>Saldo do Período</span></h3><p className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-sky-400' : 'text-red-400'}`}>R$ {summary.balance.toFixed(2)}</p></Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center"><BarChart2 className="h-5 w-5 mr-2 text-cyan-400" />Resultados</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="p-4 text-sm font-medium text-gray-400">Descrição</th>
                <th className="p-4 text-sm font-medium text-gray-400">Tipo</th>
                <th className="p-4 text-sm font-medium text-gray-400">Vencimento</th>
                <th className="p-4 text-sm font-medium text-gray-400">Valor</th>
                <th className="p-4 text-sm font-medium text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => (
                <tr key={`${item.type}-${item.id}`} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="p-4 text-white font-medium">{item.description}</td>
                  <td className="p-4"><span className={`font-semibold ${item.type === 'receber' ? 'text-green-400' : 'text-red-400'}`}>{item.type === 'receber' ? 'A Receber' : 'A Pagar'}</span></td>
                  <td className="p-4 text-white">{new Date(item.dueDate).toLocaleDateString('pt-BR')}</td>
                  <td className={`p-4 font-semibold ${item.type === 'receber' ? 'text-green-400' : 'text-red-400'}`}>R$ {item.amount.toFixed(2)}</td>
                  <td className="p-4"><span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${item.status === 'pago' || item.status === 'recebido' ? 'bg-green-900/50 text-green-300' : item.status === 'vencido' ? 'bg-red-900/50 text-red-300' : 'bg-yellow-900/50 text-yellow-300'}`}>{item.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default FinancialReport;
