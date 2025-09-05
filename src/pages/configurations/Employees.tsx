import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import { Plus, Edit, Trash2, Search, X, Scissors } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { initialEmployees as mockEmployees, Employee } from '../../data/mockEmployees';
import { initialServices as mockServices } from '../../data/mockServices';

const defaultWorkingHours = (): Employee['workingHours'] => [
  { day: 'Segunda-feira', start: '08:00', end: '18:00', active: true, hasBreak: true, breakStart: '12:00', breakEnd: '13:00' },
  { day: 'Terça-feira', start: '08:00', end: '18:00', active: true, hasBreak: true, breakStart: '12:00', breakEnd: '13:00' },
  { day: 'Quarta-feira', start: '08:00', end: '18:00', active: true, hasBreak: true, breakStart: '12:00', breakEnd: '13:00' },
  { day: 'Quinta-feira', start: '08:00', end: '18:00', active: true, hasBreak: true, breakStart: '12:00', breakEnd: '13:00' },
  { day: 'Sexta-feira', start: '08:00', end: '18:00', active: true, hasBreak: true, breakStart: '12:00', breakEnd: '13:00' },
  { day: 'Sábado', start: '09:00', end: '16:00', active: true, hasBreak: false, breakStart: '12:00', breakEnd: '13:00' },
  { day: 'Domingo', start: '10:00', end: '14:00', active: false, hasBreak: false, breakStart: '12:00', breakEnd: '13:00' }
];

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [newEmployee, setNewEmployee] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    serviceCommission: '',
    productCommission: '',
    workingHours: defaultWorkingHours(),
    serviceIds: [] as number[],
  });
  const [errors, setErrors] = useState({ name: '', phone: '', serviceCommission: '', productCommission: '' });

  useEffect(() => {
    if (editingEmployee) {
      setNewEmployee({ 
        name: editingEmployee.name, 
        email: editingEmployee.email, 
        phone: editingEmployee.phone, 
        serviceCommission: editingEmployee.serviceCommission,
        productCommission: editingEmployee.productCommission,
        workingHours: editingEmployee.workingHours,
        serviceIds: editingEmployee.serviceIds,
      });
    } else {
      setNewEmployee({ name: '', email: '', phone: '', serviceCommission: '', productCommission: '', workingHours: defaultWorkingHours(), serviceIds: [] });
    }
  }, [editingEmployee]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewEmployee(prevState => ({ ...prevState, [name]: value }));
    if (value) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handleScheduleChange = (index: number, field: string, value: any) => {
    const updatedHours = [...newEmployee.workingHours];
    (updatedHours[index] as any)[field] = value;
    setNewEmployee(prevState => ({ ...prevState, workingHours: updatedHours }));
  };

  const handleServiceSelectionChange = (serviceId: number) => {
    setNewEmployee(prev => {
      const newServiceIds = prev.serviceIds.includes(serviceId)
        ? prev.serviceIds.filter(id => id !== serviceId)
        : [...prev.serviceIds, serviceId];
      return { ...prev, serviceIds: newServiceIds };
    });
  };

  const validateForm = () => {
    const newErrors = { name: '', phone: '', serviceCommission: '', productCommission: '' };
    let isValid = true;
    if (!newEmployee.name.trim()) { newErrors.name = 'Nome é obrigatório'; isValid = false; }
    if (!newEmployee.phone.trim()) { newErrors.phone = 'Telefone é obrigatório'; isValid = false; }
    if (!newEmployee.serviceCommission.trim() || isNaN(Number(newEmployee.serviceCommission))) { newErrors.serviceCommission = 'Comissão de serviço é obrigatória.'; isValid = false; }
    if (!newEmployee.productCommission.trim() || isNaN(Number(newEmployee.productCommission))) { newErrors.productCommission = 'Comissão de produto é obrigatória.'; isValid = false; }
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const employeeData = {
        name: newEmployee.name,
        email: newEmployee.email,
        phone: newEmployee.phone,
        serviceCommission: newEmployee.serviceCommission,
        productCommission: newEmployee.productCommission,
        workingHours: newEmployee.workingHours,
        serviceIds: newEmployee.serviceIds,
    }

    if (editingEmployee) {
      setEmployees(employees.map(emp => emp.id === editingEmployee.id ? { ...editingEmployee, ...employeeData } : emp));
    } else {
      const employeeToAdd: Employee = { id: Date.now(), ...employeeData, active: true };
      setEmployees(prev => [employeeToAdd, ...prev]);
    }
    closeModal();
  };

  const handleToggleActive = (id: number) => {
    setEmployees(employees.map(emp => emp.id === id ? { ...emp, active: !emp.active } : emp));
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este funcionário?')) {
      setEmployees(employees.filter(emp => emp.id !== id));
    }
  };

  const openModal = (employee: Employee | null = null) => {
    setEditingEmployee(employee);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
    setNewEmployee({ name: '', email: '', phone: '', serviceCommission: '', productCommission: '', workingHours: defaultWorkingHours(), serviceIds: [] });
    setErrors({ name: '', phone: '', serviceCommission: '', productCommission: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Funcionários</h1>
          <p className="text-gray-400 mt-1">Gerencie sua equipe de profissionais</p>
        </div>
        <button onClick={() => openModal()} className="bg-gradient-to-r from-sky-600 to-cyan-500 text-white px-6 py-3 rounded-lg hover:from-sky-700 hover:to-cyan-600 transition-all duration-200 flex items-center space-x-2 shadow-lg">
          <Plus className="h-5 w-5" />
          <span>Novo Funcionário</span>
        </button>
      </div>

      <Card>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input type="text" placeholder="Buscar funcionários..." className="pl-10 pr-4 py-2 w-full bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="p-4 text-sm font-medium text-gray-400">Nome</th>
                <th className="p-4 text-sm font-medium text-gray-400">Comissão (Serv./Prod.)</th>
                <th className="p-4 text-sm font-medium text-gray-400">Ativo / Inativo</th>
                <th className="p-4 text-sm font-medium text-gray-400 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id} className={`border-b border-gray-800 hover:bg-gray-800/50 ${!employee.active ? 'opacity-50' : ''}`}>
                  <td className="p-4 text-white">{employee.name}</td>
                  <td className="p-4 text-white">{employee.serviceCommission}% / {employee.productCommission}%</td>
                  <td className="p-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={employee.active} onChange={() => handleToggleActive(employee.id)} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                    </label>
                  </td>
                  <td className="p-4 text-white">
                    <div className="flex justify-end space-x-2">
                      <button onClick={() => openModal(employee)} className="p-2 hover:bg-gray-700 rounded-lg"><Edit className="h-4 w-4 text-blue-400" /></button>
                      <button onClick={() => handleDelete(employee.id)} className="p-2 hover:bg-gray-700 rounded-lg"><Trash2 className="h-4 w-4 text-red-500" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4" onClick={closeModal}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20, opacity: 0 }} className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-6 border-b border-gray-800">
                <h2 className="text-lg font-semibold text-white">{editingEmployee ? 'Editar Funcionário' : 'Novo Funcionário'}</h2>
                <button onClick={closeModal} className="p-2 rounded-full hover:bg-gray-700"><X className="h-5 w-5 text-gray-400" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Nome <span className="text-red-500">*</span></label>
                        <input type="text" name="name" value={newEmployee.name} onChange={handleInputChange} placeholder="Nome completo" className={`w-full bg-gray-800 border rounded-lg px-3 py-2 focus:ring-2 focus:border-transparent text-white ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-cyan-500'}`} />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                        <input type="email" name="email" value={newEmployee.email} onChange={handleInputChange} placeholder="email@example.com" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Telefone <span className="text-red-500">*</span></label>
                        <input type="tel" name="phone" value={newEmployee.phone} onChange={handleInputChange} placeholder="(00) 90000-0000" className={`w-full bg-gray-800 border rounded-lg px-3 py-2 focus:ring-2 focus:border-transparent text-white ${errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-cyan-500'}`} />
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Comissão Serviço (%) <span className="text-red-500">*</span></label>
                            <input type="number" name="serviceCommission" value={newEmployee.serviceCommission} onChange={handleInputChange} placeholder="50" className={`w-full bg-gray-800 border rounded-lg px-3 py-2 focus:ring-2 focus:border-transparent text-white ${errors.serviceCommission ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-cyan-500'}`} />
                            {errors.serviceCommission && <p className="text-red-500 text-xs mt-1">{errors.serviceCommission}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Comissão Produto (%) <span className="text-red-500">*</span></label>
                            <input type="number" name="productCommission" value={newEmployee.productCommission} onChange={handleInputChange} placeholder="10" className={`w-full bg-gray-800 border rounded-lg px-3 py-2 focus:ring-2 focus:border-transparent text-white ${errors.productCommission ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-cyan-500'}`} />
                            {errors.productCommission && <p className="text-red-500 text-xs mt-1">{errors.productCommission}</p>}
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-6">
                    <h3 className="text-md font-semibold text-white mb-4">Serviços Executados</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {mockServices.filter(s => s.active).map(service => (
                            <label key={service.id} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-800 cursor-pointer hover:bg-gray-700">
                                <input 
                                    type="checkbox" 
                                    checked={newEmployee.serviceIds.includes(service.id)}
                                    onChange={() => handleServiceSelectionChange(service.id)}
                                    className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-600"
                                />
                                <span className="text-sm text-white">{service.name}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-6">
                    <h3 className="text-md font-semibold text-white mb-4">Horários de Trabalho</h3>
                    <div className="space-y-3">
                        {newEmployee.workingHours.map((schedule, index) => (
                            <div key={index} className="p-3 border border-gray-800 rounded-lg bg-gray-950/50">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center space-x-3">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" checked={schedule.active} onChange={(e) => handleScheduleChange(index, 'active', e.target.checked)} className="sr-only peer" />
                                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                                        </label>
                                        <span className={`font-medium w-24 ${schedule.active ? 'text-white' : 'text-gray-500'}`}>{schedule.day}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <input type="time" value={schedule.start} onChange={(e) => handleScheduleChange(index, 'start', e.target.value)} disabled={!schedule.active} className="bg-gray-800 border-gray-700 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-cyan-500 text-white disabled:bg-gray-800/50 disabled:text-gray-500" />
                                        <span className="text-gray-500">às</span>
                                        <input type="time" value={schedule.end} onChange={(e) => handleScheduleChange(index, 'end', e.target.value)} disabled={!schedule.active} className="bg-gray-800 border-gray-700 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-cyan-500 text-white disabled:bg-gray-800/50 disabled:text-gray-500" />
                                    </div>
                                </div>
                                {schedule.active && (
                                    <div className="mt-3 pt-3 border-t border-gray-800 flex flex-wrap items-center gap-4">
                                        <div className="flex items-center space-x-3">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" checked={schedule.hasBreak} onChange={(e) => handleScheduleChange(index, 'hasBreak', e.target.checked)} className="sr-only peer" />
                                                <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-600"></div>
                                            </label>
                                            <span className={`text-sm ${schedule.hasBreak ? 'text-white' : 'text-gray-500'}`}>Com intervalo</span>
                                        </div>
                                        {schedule.hasBreak && (
                                            <div className="flex items-center space-x-2">
                                                <input type="time" value={schedule.breakStart} onChange={(e) => handleScheduleChange(index, 'breakStart', e.target.value)} className="bg-gray-800 border-gray-700 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-cyan-500 text-white" />
                                                <span className="text-gray-500">às</span>
                                                <input type="time" value={schedule.breakEnd} onChange={(e) => handleScheduleChange(index, 'breakEnd', e.target.value)} className="bg-gray-800 border-gray-700 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-cyan-500 text-white" />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button type="button" onClick={closeModal} className="bg-gray-700 text-gray-300 px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors">Cancelar</button>
                  <button type="submit" className="bg-gradient-to-r from-sky-600 to-cyan-500 text-white px-6 py-2 rounded-lg hover:from-sky-700 hover:to-cyan-600 transition-all">{editingEmployee ? 'Salvar Alterações' : 'Salvar Funcionário'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Employees;
