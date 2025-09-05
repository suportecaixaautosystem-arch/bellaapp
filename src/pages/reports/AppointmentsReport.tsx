import React, { useState, useMemo, useEffect } from 'react';
import Card from '../../components/Card';
import { Filter, Printer, FileDown, BarChart2, CheckCircle, XCircle, Calendar, MessageSquare, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { Tables } from '../../types/database.types';
import { exportToPdf, shareToWhatsApp } from '../../utils/reportExporter';

type AppointmentWithDetails = Tables<'appointments'> & {
  clients: Pick<Tables<'clients'>, 'name'> | null;
  employees: Pick<Tables<'employees'>, 'name'> | null;
  appointment_items: (Pick<Tables<'appointment_items'>, 'item_name'> & {
      services: Pick<Tables<'services'>, 'name'> | null;
  })[];
};

const AppointmentsReport: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    status: 'all',
  });

  useEffect(() => {
    const fetchAppointments = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('appointments')
            .select(`
                *,
                clients (name),
                employees (name),
                appointment_items (item_name, services(name))
            `);
        if (error) alert('Erro ao buscar agendamentos.');
        else setAppointments(data as any || []);
        setLoading(false);
    };
    fetchAppointments();
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.start_time);
      const start = new Date(filters.startDate);
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      
      const dateMatch = aptDate >= start && aptDate <= end;
      const statusMatch = filters.status === 'all' || apt.status === filters.status;
      
      return dateMatch && statusMatch;
    });
  }, [appointments, filters]);

  const summary = useMemo(() => {
    const total = filteredAppointments.length;
    const concluded = filteredAppointments.filter(a => a.status === 'concluido').length;
    const canceled = filteredAppointments.filter(a => a.status === 'cancelado').length;
    const conclusionRate = total > 0 ? (concluded / total) * 100 : 0;
    const cancellationRate = total > 0 ? (canceled / total) * 100 : 0;
    return { total, concluded, canceled, conclusionRate, cancellationRate };
  }, [filteredAppointments]);

  const statusConfig = {
    agendado: { color: 'bg-sky-900/50 text-sky-300', label: 'Agendado' },
    cancelado: { color: 'bg-red-900/50 text-red-300', label: 'Cancelado' },
    concluido: { color: 'bg-green-900/50 text-green-300', label: 'Concluído' },
    'no-show': { color: 'bg-yellow-900/50 text-yellow-300', label: 'Não Compareceu' },
  };

  const handleExportPdf = () => {
    const title = 'Relatório de Agendamentos';
    const headers = ['Data', 'Cliente', 'Serviço', 'Funcionário', 'Status'];
    const data = filteredAppointments.map(apt => [
      new Date(apt.start_time).toLocaleDateString('pt-BR'),
      apt.clients?.name || 'N/A',
      apt.appointment_items.map(i => i.services?.name).join(', ') || 'N/A',
      apt.employees?.name || 'N/A',
      statusConfig[apt.status].label
    ]);
    exportToPdf(title, headers, data);
  };

  const handleShareWhatsApp = () => {
    let text = `*Relatório de Agendamentos (${filters.startDate} a ${filters.endDate})*\n\n`;
    text += `*Total de Agendamentos:* ${summary.total}\n`;
    text += `*Taxa de Conclusão:* ${summary.conclusionRate.toFixed(1)}%\n`;
    text += `*Taxa de Cancelamento:* ${summary.cancellationRate.toFixed(1)}%\n\n`;
    text += `*Lista de Agendamentos:*\n`;
    filteredAppointments.slice(0, 10).forEach(apt => {
        const clientName = apt.clients?.name || 'N/A';
        text += `- ${new Date(apt.start_time).toLocaleDateString('pt-BR')} - ${clientName} (${statusConfig[apt.status].label})\n`;
    });
    if(filteredAppointments.length > 10) text += `... e mais ${filteredAppointments.length-10} agendamentos.\n`
    shareToWhatsApp(text);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Relatório de Agendamentos</h1>
          <p className="text-gray-400 mt-1">Analise o fluxo de agendamentos.</p>
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
            <label className="block text-sm font-medium text-gray-400 mb-1">Data Início</label>
            <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Data Fim</label>
            <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
            <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white">
              <option value="all">Todos</option>
              <option value="agendado">Agendado</option>
              <option value="concluido">Concluído</option>
              <option value="cancelado">Cancelado</option>
              <option value="no-show">Não Compareceu</option>
            </select>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><h3 className="text-sm text-gray-400 flex items-center space-x-2"><Calendar className="h-4 w-4"/><span>Total de Agendamentos</span></h3><p className="text-2xl font-bold text-white">{summary.total}</p></Card>
        <Card><h3 className="text-sm text-gray-400 flex items-center space-x-2"><CheckCircle className="h-4 w-4"/><span>Taxa de Conclusão</span></h3><p className="text-2xl font-bold text-green-400">{summary.conclusionRate.toFixed(1)}%</p></Card>
        <Card><h3 className="text-sm text-gray-400 flex items-center space-x-2"><XCircle className="h-4 w-4"/><span>Taxa de Cancelamento</span></h3><p className="text-2xl font-bold text-red-400">{summary.cancellationRate.toFixed(1)}%</p></Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center"><BarChart2 className="h-5 w-5 mr-2 text-cyan-400" />Resultados</h2>
        {loading ? <div className="text-center p-8"><Loader className="animate-spin h-6 w-6 mx-auto"/></div> :
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="p-4 text-sm font-medium text-gray-400">Data</th>
                <th className="p-4 text-sm font-medium text-gray-400">Cliente</th>
                <th className="p-4 text-sm font-medium text-gray-400">Serviço</th>
                <th className="p-4 text-sm font-medium text-gray-400">Funcionário</th>
                <th className="p-4 text-sm font-medium text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((apt) => {
                const serviceNames = apt.appointment_items.map(i => i.services?.name).join(', ');
                return (
                  <tr key={apt.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="p-4 text-white font-medium">{new Date(apt.start_time).toLocaleDateString('pt-BR')}</td>
                    <td className="p-4 text-white">{apt.clients?.name || 'N/A'}</td>
                    <td className="p-4 text-white">{serviceNames || 'N/A'}</td>
                    <td className="p-4 text-white">{apt.employees?.name || 'N/A'}</td>
                    <td className="p-4">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusConfig[apt.status].color}`}>
                        {statusConfig[apt.status].label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>}
      </Card>
    </div>
  );
};

export default AppointmentsReport;
