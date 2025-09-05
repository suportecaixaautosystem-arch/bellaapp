import React, { useState, useMemo, useEffect } from 'react';
import Card from '../../components/Card';
import { Filter, Printer, FileDown, BarChart2, Users, Scissors, Package, Briefcase, MessageSquare, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { Tables } from '../../types/database.types';
import { exportToPdf, shareToWhatsApp } from '../../utils/reportExporter';

type RegistrationType = 'clients' | 'products' | 'services' | 'employees';

const RegistrationsReport: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    type: 'clients' as RegistrationType,
    status: 'all',
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data, error } = await supabase.from(filters.type).select('*');
      if (error) alert(`Erro ao buscar ${filters.type}`);
      else setData(data || []);
      setLoading(false);
    };
    fetchData();
  }, [filters.type]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (filters.status === 'all') return true;
      return filters.status === 'active' ? item.is_active : !item.is_active;
    });
  }, [data, filters.status]);

  const { headers, total } = useMemo(() => {
    let headers: string[] = [];
    switch (filters.type) {
      case 'clients': headers = ['Nome', 'Email', 'Telefone', 'Status']; break;
      case 'products': headers = ['Nome', 'Preço Venda', 'Estoque', 'Status']; break;
      case 'services': headers = ['Nome', 'Duração (min)', 'Preço', 'Status']; break;
      case 'employees': headers = ['Nome', 'Email', 'Telefone', 'Status']; break;
    }
    return { headers, total: filteredData.length };
  }, [filters.type, filteredData]);

  const renderRow = (item: any) => {
    switch (filters.type) {
      case 'clients': return <><td className="p-4 text-white">{item.name}</td><td className="p-4 text-white">{item.email}</td><td className="p-4 text-white">{item.phone}</td></>;
      case 'products': return <><td className="p-4 text-white">{item.name}</td><td className="p-4 text-green-400">R$ {item.sale_price.toFixed(2)}</td><td className="p-4 text-white">{item.control_stock ? item.stock_quantity : 'N/A'}</td></>;
      case 'services': return <><td className="p-4 text-white">{item.name}</td><td className="p-4 text-white">{item.duration_minutes}</td><td className="p-4 text-green-400">R$ {item.price.toFixed(2)}</td></>;
      case 'employees': return <><td className="p-4 text-white">{item.name}</td><td className="p-4 text-white">{item.email}</td><td className="p-4 text-white">{item.phone}</td></>;
      default: return null;
    }
  };

  const handleExportPdf = () => {
    const title = `Relatório de ${filters.type}`;
    const pdfData = filteredData.map(item => {
        switch(filters.type) {
            case 'clients': return [item.name, item.email, item.phone, item.is_active ? 'Ativo' : 'Inativo'];
            case 'products': return [item.name, `R$ ${item.sale_price.toFixed(2)}`, item.control_stock ? item.stock_quantity : 'N/A', item.is_active ? 'Ativo' : 'Inativo'];
            case 'services': return [item.name, item.duration_minutes, `R$ ${item.price.toFixed(2)}`, item.is_active ? 'Ativo' : 'Inativo'];
            case 'employees': return [item.name, item.email, item.phone, item.is_active ? 'Ativo' : 'Inativo'];
            default: return [];
        }
    });
    exportToPdf(title, headers, pdfData);
  };

  const handleShareWhatsApp = () => {
    let text = `*Relatório de ${filters.type}*\n\n`;
    text += `*Total de Itens:* ${total}\n`;
    text += `*Status:* ${filters.status === 'all' ? 'Todos' : filters.status === 'active' ? 'Ativos' : 'Inativos'}\n\n`;
    filteredData.slice(0, 15).forEach(item => { text += `- ${item.name}\n`; });
    if (filteredData.length > 15) text += `... e mais ${filteredData.length - 15} itens.\n`;
    shareToWhatsApp(text);
  };

  const reportIcons = { clients: Users, products: Package, services: Scissors, employees: Briefcase };
  const ReportIcon = reportIcons[filters.type];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Relatório de Cadastros</h1>
          <p className="text-gray-400 mt-1">Exporte listas e analise seus cadastros.</p>
        </div>
        <div className="flex space-x-2">
            <button onClick={() => window.print()} className="flex items-center space-x-2 px-4 py-2 border border-gray-700 rounded-lg hover:bg-gray-800 text-gray-300"><Printer className="h-4 w-4" /><span>Imprimir</span></button>
            <button onClick={handleExportPdf} className="flex items-center space-x-2 px-4 py-2 border border-gray-700 rounded-lg hover:bg-gray-800 text-gray-300"><FileDown className="h-4 w-4" /><span>PDF</span></button>
            <button onClick={handleShareWhatsApp} className="flex items-center space-x-2 px-4 py-2 border border-gray-700 rounded-lg hover:bg-gray-800 text-gray-300"><MessageSquare className="h-4 w-4" /><span>Compartilhar</span></button>
        </div>
      </div>
      <Card>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center"><Filter className="h-5 w-5 mr-2 text-cyan-400" />Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Tipo de Cadastro</label>
            <select name="type" value={filters.type} onChange={handleFilterChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white">
              <option value="clients">Clientes</option>
              <option value="products">Produtos</option>
              <option value="services">Serviços</option>
              <option value="employees">Funcionários</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
            <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white">
              <option value="all">Todos</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>
          </div>
        </div>
      </Card>
      
      <Card>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center"><BarChart2 className="h-5 w-5 mr-2 text-cyan-400" />Resultados</h2>
        <div className="flex items-center space-x-4 mb-4 p-4 bg-gray-800 rounded-lg">
            <ReportIcon className="h-8 w-8 text-cyan-400" />
            <div>
                <h3 className="text-sm text-gray-400">Total de Itens</h3>
                <p className="text-2xl font-bold text-white">{total}</p>
            </div>
        </div>
        {loading ? <div className="text-center p-8"><Loader className="animate-spin h-6 w-6 mx-auto"/></div> :
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-800">
                {headers.map(header => <th key={header} className="p-4 text-sm font-medium text-gray-400">{header}</th>)}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => (
                <tr key={item.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                  {renderRow(item)}
                  <td className="p-4">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${item.is_active ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                      {item.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>}
      </Card>
    </div>
  );
};

export default RegistrationsReport;
