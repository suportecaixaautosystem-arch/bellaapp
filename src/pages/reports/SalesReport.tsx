import React, { useState, useMemo } from 'react';
import Card from '../../components/Card';
import { BarChart2, Filter, Printer, FileDown, MessageSquare } from 'lucide-react';
import { mockSales } from '../../data/mockSales';
import { initialClients } from '../../data/mockClients';
import { exportToPdf, shareToWhatsApp } from '../../utils/reportExporter';

type GroupByOption = 'day' | 'paymentMethod' | 'client' | 'employee' | 'service' | 'product';

const SalesReport: React.FC = () => {
  const [filters, setFilters] = useState({
    startDate: '2025-08-01',
    endDate: '2025-08-31',
    groupBy: 'day' as GroupByOption,
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const filteredSales = useMemo(() => {
    return mockSales.filter(sale => {
      const saleDate = sale.date;
      const start = new Date(filters.startDate);
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      return saleDate >= start && saleDate <= end;
    });
  }, [filters.startDate, filters.endDate]);

  const reportData = useMemo(() => {
    const groupedData: Record<string, { count: number; total: number; items: any[] }> = {};
    filteredSales.forEach(sale => {
      let key = '';
      switch (filters.groupBy) {
        case 'day': key = sale.date.toLocaleDateString('pt-BR'); break;
        case 'paymentMethod': key = sale.paymentMethod; break;
        case 'client': key = initialClients.find(c => c.id === sale.clientId)?.name || 'Consumidor Final'; break;
        default: key = sale.date.toLocaleDateString('pt-BR');
      }
      if (!groupedData[key]) groupedData[key] = { count: 0, total: 0, items: [] };
      groupedData[key].count++;
      groupedData[key].total += sale.total;
    });
    return Object.entries(groupedData).map(([key, value]) => ({ key, ...value })).sort((a,b) => b.total - a.total);
  }, [filteredSales, filters.groupBy]);

  const totalSalesValue = useMemo(() => filteredSales.reduce((acc, sale) => acc + sale.total, 0), [filteredSales]);
  const totalSalesCount = filteredSales.length;
  const averageTicket = totalSalesCount > 0 ? totalSalesValue / totalSalesCount : 0;

  const getTableHeaders = () => {
      switch(filters.groupBy) {
          case 'day': return ['Data', 'Nº de Vendas', 'Valor Total (R$)'];
          case 'paymentMethod': return ['Forma de Pagamento', 'Nº de Vendas', 'Valor Total (R$)'];
          case 'client': return ['Cliente', 'Nº de Vendas', 'Valor Total (R$)'];
          default: return ['Data', 'Nº de Vendas', 'Valor Total (R$)'];
      }
  }

  const handleExportPdf = () => {
    const title = 'Relatório de Vendas';
    const headers = getTableHeaders();
    const data = reportData.map(row => [row.key, row.count, `R$ ${row.total.toFixed(2)}`]);
    exportToPdf(title, headers, data);
  };

  const handleShareWhatsApp = () => {
    let text = `*Relatório de Vendas (${filters.startDate} a ${filters.endDate})*\n\n`;
    text += `*Total de Vendas:* ${totalSalesCount}\n`;
    text += `*Valor Total:* R$ ${totalSalesValue.toFixed(2)}\n`;
    text += `*Ticket Médio:* R$ ${averageTicket.toFixed(2)}\n\n`;
    text += `*Detalhes por ${filters.groupBy}:*\n`;
    reportData.forEach(row => {
      text += `- ${row.key}: ${row.count} vendas - R$ ${row.total.toFixed(2)}\n`;
    });
    shareToWhatsApp(text);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Relatório de Vendas</h1>
          <p className="text-gray-400 mt-1">Analise o desempenho de suas vendas.</p>
        </div>
        <div className="flex space-x-2">
            <button onClick={() => window.print()} className="flex items-center space-x-2 px-4 py-2 border border-gray-700 rounded-lg hover:bg-gray-800 text-gray-300"><Printer className="h-4 w-4" /><span>Imprimir</span></button>
            <button onClick={handleExportPdf} className="flex items-center space-x-2 px-4 py-2 border border-gray-700 rounded-lg hover:bg-gray-800 text-gray-300"><FileDown className="h-4 w-4" /><span>PDF</span></button>
            <button onClick={handleShareWhatsApp} className="flex items-center space-x-2 px-4 py-2 border border-gray-700 rounded-lg hover:bg-gray-800 text-gray-300"><MessageSquare className="h-4 w-4" /><span>Compartilhar</span></button>
        </div>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center"><Filter className="h-5 w-5 mr-2 text-cyan-400" />Filtros do Relatório</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Data Início</label>
            <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Data Fim</label>
            <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Agrupar por</label>
            <select name="groupBy" value={filters.groupBy} onChange={handleFilterChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white">
              <option value="day">Dia</option>
              <option value="paymentMethod">Forma de Pagamento</option>
              <option value="client">Cliente</option>
              <option value="employee">Funcionário</option>
              <option value="service">Serviço mais vendido</option>
              <option value="product">Produto mais vendido</option>
            </select>
          </div>
        </div>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><h3 className="text-sm text-gray-400">Valor Total de Vendas</h3><p className="text-2xl font-bold text-green-400">R$ {totalSalesValue.toFixed(2)}</p></Card>
        <Card><h3 className="text-sm text-gray-400">Nº Total de Vendas</h3><p className="text-2xl font-bold text-white">{totalSalesCount}</p></Card>
        <Card><h3 className="text-sm text-gray-400">Ticket Médio</h3><p className="text-2xl font-bold text-sky-400">R$ {averageTicket.toFixed(2)}</p></Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center"><BarChart2 className="h-5 w-5 mr-2 text-cyan-400" />Resultados</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-800">
                {getTableHeaders().map(header => <th key={header} className="p-4 text-sm font-medium text-gray-400">{header}</th>)}
              </tr>
            </thead>
            <tbody>
              {reportData.map((row) => (
                <tr key={row.key} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="p-4 text-white font-medium">{row.key}</td>
                  <td className="p-4 text-white">{row.count}</td>
                  <td className="p-4 text-green-400 font-semibold">R$ {row.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default SalesReport;
