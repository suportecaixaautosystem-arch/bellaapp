import React, { useState, useMemo, useEffect } from 'react';
import Card from '../../components/Card';
import { Filter, Printer, FileDown, BarChart2, Award, MessageSquare, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { Tables } from '../../types/database.types';
import { exportToPdf, shareToWhatsApp } from '../../utils/reportExporter';

type SaleWithItems = Tables<'sales'> & { sale_items: Tables<'sale_items'>[] };
type Employee = Tables<'employees'>;

type CommissionData = {
    employeeId: number;
    employeeName: string;
    totalSales: number;
    serviceCommission: number;
    productCommission: number;
    totalCommission: number;
};

const CommissionReport: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [sales, setSales] = useState<SaleWithItems[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    employeeId: 'all',
  });

  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        const salesPromise = supabase.from('sales').select('*, sale_items(*)');
        const employeesPromise = supabase.from('employees').select('*');
        const [{data: salesData}, {data: empData}] = await Promise.all([salesPromise, employeesPromise]);
        setSales(salesData as any || []);
        setEmployees(empData || []);
        setLoading(false);
    };
    fetchData();
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const saleDate = new Date(sale.created_at!);
      const start = new Date(filters.startDate);
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      return saleDate >= start && saleDate <= end;
    });
  }, [sales, filters.startDate, filters.endDate]);

  const reportData = useMemo(() => {
    const commissionMap: Record<number, CommissionData> = {};

    employees.forEach(emp => {
        if (filters.employeeId === 'all' || filters.employeeId === emp.id.toString()) {
            commissionMap[emp.id] = {
                employeeId: emp.id,
                employeeName: emp.name,
                totalSales: 0,
                serviceCommission: 0,
                productCommission: 0,
                totalCommission: 0,
            };
        }
    });

    filteredSales.forEach(sale => {
        const employee = employees.find(e => e.id === sale.employee_id);
        if (!employee || !commissionMap[employee.id]) return;

        commissionMap[employee.id].totalSales += sale.total;
        
        let serviceComm = 0;
        let productComm = 0;

        sale.sale_items.forEach(item => {
            if(item.service_id || item.service_combo_id) {
                serviceComm += item.total_price * (employee.service_commission / 100);
            }
            if(item.product_id || item.product_combo_id) {
                productComm += item.total_price * (employee.product_commission / 100);
            }
        });
        
        commissionMap[employee.id].serviceCommission += serviceComm;
        commissionMap[employee.id].productCommission += productComm;
        commissionMap[employee.id].totalCommission += serviceComm + productComm;
    });

    return Object.values(commissionMap).sort((a,b) => b.totalCommission - a.totalCommission);
  }, [filteredSales, filters.employeeId, employees]);
  
  const grandTotals = useMemo(() => {
    return reportData.reduce((acc, data) => {
        acc.totalSales += data.totalSales;
        acc.serviceCommission += data.serviceCommission;
        acc.productCommission += data.productCommission;
        acc.totalCommission += data.totalCommission;
        return acc;
    }, { totalSales: 0, serviceCommission: 0, productCommission: 0, totalCommission: 0 });
  }, [reportData]);

  const handleExportPdf = () => {
    const title = 'Relatório de Comissões';
    const headers = ['Funcionário', 'Vendas (R$)', 'Comissão Serviço (R$)', 'Comissão Produto (R$)', 'Comissão Total (R$)'];
    const data = reportData.map(row => [
      row.employeeName,
      row.totalSales.toFixed(2),
      row.serviceCommission.toFixed(2),
      row.productCommission.toFixed(2),
      row.totalCommission.toFixed(2)
    ]);
    exportToPdf(title, headers, data);
  };

  const handleShareWhatsApp = () => {
    let text = `*Relatório de Comissões (${filters.startDate} a ${filters.endDate})*\n\n`;
    text += `*Total Geral de Comissão:* R$ ${grandTotals.totalCommission.toFixed(2)}\n\n`;
    reportData.forEach(row => {
      text += `*${row.employeeName}*\n`;
      text += `- Comissão Total: R$ ${row.totalCommission.toFixed(2)}\n`;
    });
    shareToWhatsApp(text);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Relatório de Comissões</h1>
          <p className="text-gray-400 mt-1">Analise as comissões por funcionário.</p>
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
            <label className="block text-sm font-medium text-gray-400 mb-1">Funcionário</label>
            <select name="employeeId" value={filters.employeeId} onChange={handleFilterChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white">
              <option value="all">Todos</option>
              {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>
      
      <Card>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center"><BarChart2 className="h-5 w-5 mr-2 text-cyan-400" />Resultados</h2>
        {loading ? <div className="text-center p-8"><Loader className="animate-spin h-6 w-6 mx-auto"/></div> :
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="p-4 text-sm font-medium text-gray-400">Funcionário</th>
                <th className="p-4 text-sm font-medium text-gray-400">Vendas (R$)</th>
                <th className="p-4 text-sm font-medium text-gray-400">Comissão Serviço (R$)</th>
                <th className="p-4 text-sm font-medium text-gray-400">Comissão Produto (R$)</th>
                <th className="p-4 text-sm font-medium text-gray-400">Comissão Total (R$)</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((row) => (
                <tr key={row.employeeId} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="p-4 text-white font-medium">{row.employeeName}</td>
                  <td className="p-4 text-white">{row.totalSales.toFixed(2)}</td>
                  <td className="p-4 text-sky-400">{row.serviceCommission.toFixed(2)}</td>
                  <td className="p-4 text-purple-400">{row.productCommission.toFixed(2)}</td>
                  <td className="p-4 text-green-400 font-semibold">{row.totalCommission.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
             <tfoot>
                <tr className="border-t-2 border-gray-700 font-bold">
                    <td className="p-4 text-white">Total Geral</td>
                    <td className="p-4 text-white">R$ {grandTotals.totalSales.toFixed(2)}</td>
                    <td className="p-4 text-sky-400">R$ {grandTotals.serviceCommission.toFixed(2)}</td>
                    <td className="p-4 text-purple-400">R$ {grandTotals.productCommission.toFixed(2)}</td>
                    <td className="p-4 text-green-400">R$ {grandTotals.totalCommission.toFixed(2)}</td>
                </tr>
            </tfoot>
          </table>
        </div>}
      </Card>
    </div>
  );
};

export default CommissionReport;
