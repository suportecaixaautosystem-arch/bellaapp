import React, { useState, useMemo } from 'react';
import Card from '../../components/Card';
import { Filter, Printer, FileDown, BarChart2, CheckCircle, XCircle, Calendar, MessageSquare } from 'lucide-react';
import { appointmentApi, Appointment } from '../../data/mockAppointments';
import { initialClients } from '../../data/mockClients';
import { initialEmployees } from '../../data/mockEmployees';
import { initialServices } from '../../data/mockServices';
import { exportToPdf, shareToWhatsApp } from '../../utils/reportExporter';

const AppointmentsReport: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filters, setFilters] = useState({
    startDate: '2025-08-01',
    endDate: '2025-08-31',
    status: 'all',
  });

  React.useEffect(() => {
    appointmentApi.getAppointments().then(setAppointments);
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
      const aptDate = apt.start;
      const start = new Date(filters.startDate);
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      
      const dateMatch = aptDate >= start && aptDate <= end;
      const statusMatch = filters.status === 'all' || apt.appointmentStatus === filters.status;
      
      return dateMatch && statusMatch;
    });
  }, [appointments, filters]);

  const summary = useMemo(() => {
    const total = filteredAppointments.length;
    const concluded = filteredAppointments.filter(a => a.appointmentStatus === 'concluido').length;
    const canceled = filteredAppointments.filter(a => a.appointmentStatus === 'cancelado').length;
    const conclusionRate = total > 0 ? (concluded / total) * 100 : 0;
    const cancellationRate = total > 0 ? (canceled / total) * 100 : 0;
    return { total, concluded, canceled, conclusionRate, cancellationRate };
  }, [filteredAppointments]);

  const statusConfig = {
    agendado: { color: 'bg-sky-900/50 text-sky-300', label: 'Agendado' },
    cancelado: { color: 'bg-red-900/50 text-red-300', label: 'Cancelado' },
    concluido: { color: 'bg-gray-700 text-gray-400', label: 'Concluído' },
  };

  const handleExportPdf = () => {
    const title = 'Relatório de Agendamentos';
    const headers = ['Data', 'Cliente', 'Serviço', 'Funcionário', 'Status'];
    const data = filteredAppointments.map(apt => [
      apt.start.toLocaleDateString('pt-BR'),
      initialClients.find(c => c.id === apt.clientId)?.name || 'N/A',
      initialServices.find(s => s.id === apt.serviceId)?.name || 'N/A',
      initialEmployees.find(e => e.id === apt.employeeId)?.name || 'N/A',
      statusConfig[apt.appointmentStatus].label
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
        const clientName = initialClients.find(c => c.id === apt.clientId)?.name || 'N/A';
        text += `- ${apt.start.toLocaleDateString('pt-BR')} - ${clientName} (${statusConfig[apt.appointmentStatus].label})\n`;
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
                const client = initialClients.find(c => c.id === apt.clientId);
                const service = initialServices.find(s => s.id === apt.serviceId);
                const employee = initialEmployees.find(e => e.id === apt.employeeId);
                return (
                  <tr key={apt.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="p-4 text-white font-medium">{apt.start.toLocaleDateString('pt-BR')}</td>
                    <td className="p-4 text-white">{client?.name || 'N/A'}</td>
                    <td className="p-4 text-white">{service?.name || 'N/A'}</td>
                    <td className="p-4 text-white">{employee?.name || 'N/A'}</td>
                    <td className="p-4">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusConfig[apt.appointmentStatus].color}`}>
                        {statusConfig[apt.appointmentStatus].label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AppointmentsReport;
