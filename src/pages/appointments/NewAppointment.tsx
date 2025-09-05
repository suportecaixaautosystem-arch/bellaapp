import React, { useState, useEffect, useMemo } from 'react';
import Card from '../../components/Card';
import { CheckCircle, Calendar as CalendarIcon, Plus, X, Scissors, Briefcase, Tag, Search } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Data Layer
import { appointmentApi, Appointment } from '../../data/mockAppointments';
import { initialEmployees } from '../../data/mockEmployees';
import { initialServices } from '../../data/mockServices';
import { initialClients } from '../../data/mockClients';
import { initialServiceCombos } from '../../data/mockCombos';

// Helper functions
const parseDuration = (duration: string): number => {
    const [value] = duration.split(' ');
    return parseInt(value, 10) || 30;
};
const dayIndexToName = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
const companyWorkingHours = [{ day: 'Segunda-feira', start: '08:00', end: '18:00', active: true, hasBreak: true, breakStart: '12:00', breakEnd: '13:00' },{ day: 'Terça-feira', start: '08:00', end: '18:00', active: true, hasBreak: true, breakStart: '12:00', breakEnd: '13:00' },{ day: 'Quarta-feira', start: '08:00', end: '18:00', active: true, hasBreak: true, breakStart: '12:00', breakEnd: '13:00' },{ day: 'Quinta-feira', start: '08:00', end: '18:00', active: true, hasBreak: true, breakStart: '12:00', breakEnd: '13:00' },{ day: 'Sexta-feira', start: '08:00', end: '18:00', active: true, hasBreak: true, breakStart: '12:00', breakEnd: '13:00' },{ day: 'Sábado', start: '09:00', end: '16:00', active: true, hasBreak: false, breakStart: '12:00', breakEnd: '13:00' },{ day: 'Domingo', start: '10:00', end: '14:00', active: false, hasBreak: false, breakStart: '12:00', breakEnd: '13:00' }];

type SelectableItem = {
    id: string;
    name: string;
    type: 'service' | 'combo';
    price: string;
    duration: string;
    serviceIds: number[];
};

const NewAppointment: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const editingAppointment = location.state?.appointment as Appointment | undefined;

    const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
    const [clients, setClients] = useState(initialClients);
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const [itemSearchTerm, setItemSearchTerm] = useState('');

    const [formState, setFormState] = useState({
        clientId: editingAppointment?.clientId.toString() || '',
        employeeId: editingAppointment?.employeeId.toString() || '',
        selectedItemIds: editingAppointment ? [`service-${editingAppointment.serviceId}`] : [] as string[],
        date: editingAppointment ? new Date(editingAppointment.start) : new Date(),
        time: editingAppointment ? editingAppointment.start.toTimeString().slice(0, 5) : '',
    });
    
    useEffect(() => {
        appointmentApi.getAppointments().then(data => setAllAppointments(data));
    }, []);

    const selectableItems: SelectableItem[] = useMemo(() => {
        const services = initialServices.filter(s => s.active).map(s => ({
            id: `service-${s.id}`, name: s.name, type: 'service' as const, price: s.price, duration: s.duration, serviceIds: [s.id]
        }));
        const combos = initialServiceCombos.filter(c => c.active).map(c => {
            const comboServices = initialServices.filter(s => c.serviceIds.includes(s.id));
            const totalDuration = comboServices.reduce((acc, s) => acc + parseDuration(s.duration), 0);
            return {
                id: `combo-${c.id}`, name: c.name, type: 'combo' as const, price: c.price, duration: `${totalDuration} min`, serviceIds: c.serviceIds
            }
        });
        return [...combos, ...services];
    }, []);

    const filteredSelectableItems = useMemo(() => {
        if (!itemSearchTerm) {
            return selectableItems;
        }
        return selectableItems.filter(item => 
            item.name.toLowerCase().includes(itemSearchTerm.toLowerCase())
        );
    }, [selectableItems, itemSearchTerm]);

    const handleItemSelection = (itemId: string) => {
        setFormState(prev => {
            const newSelection = prev.selectedItemIds.includes(itemId)
                ? prev.selectedItemIds.filter(id => id !== itemId)
                : [...prev.selectedItemIds, itemId];
            
            return {
                ...prev,
                selectedItemIds: newSelection,
                employeeId: '',
                time: '',
            };
        });
    };

    const selectedItems = useMemo(() => {
        return selectableItems.filter(item => formState.selectedItemIds.includes(item.id));
    }, [formState.selectedItemIds, selectableItems]);

    const { totalDuration, totalPrice } = useMemo(() => {
        if (selectedItems.length === 0) return { totalDuration: 0, totalPrice: 0 };
        const duration = selectedItems.reduce((acc, item) => acc + parseDuration(item.duration), 0);
        const price = selectedItems.reduce((acc, item) => acc + parseFloat(item.price), 0);
        return { totalDuration: duration, totalPrice: price };
    }, [selectedItems]);

    const availableEmployees = useMemo(() => {
        if (selectedItems.length === 0) return [];
        const requiredServiceIds = [...new Set(selectedItems.flatMap(item => item.serviceIds))];
        if (requiredServiceIds.length === 0) return [];
        const dayName = dayIndexToName[formState.date.getDay()];
        const companySchedule = companyWorkingHours.find(d => d.day === dayName);
        if (!companySchedule?.active) return [];
        return initialEmployees.filter(emp => {
            const empSchedule = emp.workingHours.find(d => d.day === dayName);
            const canPerformAllServices = requiredServiceIds.every(serviceId => emp.serviceIds.includes(serviceId));
            return emp.active && empSchedule?.active && canPerformAllServices;
        });
    }, [formState.date, selectedItems]);

    const availableSlots = useMemo(() => {
        if (!formState.date || !formState.employeeId || selectedItems.length === 0) return [];
        const employee = initialEmployees.find(e => e.id === parseInt(formState.employeeId));
        if (!employee) return [];
        const dayName = dayIndexToName[formState.date.getDay()];
        const companySchedule = companyWorkingHours.find(d => d.day === dayName);
        const employeeSchedule = employee.workingHours.find(d => d.day === dayName);
        if (!companySchedule?.active || !employeeSchedule?.active) return [];
        const slots: string[] = [];
        const appointmentsOnDate = allAppointments.filter(apt => apt.employeeId === employee.id && new Date(apt.start).toDateString() === formState.date.toDateString() && apt.appointmentStatus === 'agendado' && apt.id !== editingAppointment?.id);
        const timeToMinutes = (time: string) => { const [h, m] = time.split(':').map(Number); return h * 60 + m; };
        const workStart = Math.max(timeToMinutes(companySchedule.start), timeToMinutes(employeeSchedule.start));
        const workEnd = Math.min(timeToMinutes(companySchedule.end), timeToMinutes(employeeSchedule.end));
        for (let t = workStart; t <= workEnd - totalDuration; t += 15) {
            const slotStart = t;
            const slotEnd = t + totalDuration;
            let isOverlapping = false;
            for (const apt of appointmentsOnDate) {
                const aptStart = new Date(apt.start).getHours() * 60 + new Date(apt.start).getMinutes();
                const aptEnd = new Date(apt.end).getHours() * 60 + new Date(apt.end).getMinutes();
                if (slotStart < aptEnd && slotEnd > aptStart) { isOverlapping = true; break; }
            }
            if (companySchedule.hasBreak && slotStart < timeToMinutes(companySchedule.breakEnd) && slotEnd > timeToMinutes(companySchedule.breakStart)) isOverlapping = true;
            if (employeeSchedule.hasBreak && slotStart < timeToMinutes(employeeSchedule.breakEnd) && slotEnd > timeToMinutes(employeeSchedule.breakStart)) isOverlapping = true;
            if (!isOverlapping) {
                const hours = Math.floor(t / 60).toString().padStart(2, '0');
                const minutes = (t % 60).toString().padStart(2, '0');
                slots.push(`${hours}:${minutes}`);
            }
        }
        return slots;
    }, [formState.date, formState.employeeId, selectedItems, allAppointments, editingAppointment, totalDuration]);

    const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value, time: '' }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const { clientId, employeeId, date, time, selectedItemIds } = formState;
        if (!clientId || selectedItemIds.length === 0 || !employeeId || !date || !time) {
            alert('Por favor, preencha todos os campos.');
            return;
        }
        let currentStartTime = new Date(date);
        const [hours, minutes] = time.split(':').map(Number);
        currentStartTime.setHours(hours, minutes, 0, 0);
        const allServiceIds = selectedItems.flatMap(item => item.serviceIds);
        for (const serviceId of allServiceIds) {
            const service = initialServices.find(s => s.id === serviceId);
            if (!service) continue;
            const serviceDuration = parseDuration(service.duration);
            const endDateTime = new Date(currentStartTime.getTime() + serviceDuration * 60000);
            const appointmentData = { clientId: parseInt(clientId), serviceId, employeeId: parseInt(employeeId), start: currentStartTime, end: endDateTime, paymentStatus: 'pendente' as const, appointmentStatus: 'agendado' as const };
            await appointmentApi.addAppointment(appointmentData);
            currentStartTime = endDateTime;
        }
        alert('Agendamento salvo com sucesso!');
        navigate('/appointments/panel');
    };

    const CalendarComponent = ({ currentDate, onDateChange }: { currentDate: Date, onDateChange: (d: Date) => void }) => {
        const [month, setMonth] = useState(currentDate.getMonth());
        const [year, setYear] = useState(currentDate.getFullYear());
        useEffect(() => { setMonth(currentDate.getMonth()); setYear(currentDate.getFullYear()); }, [currentDate]);
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
        const changeMonth = (offset: number) => {
            const newDate = new Date(year, month + offset, 1);
            setMonth(newDate.getMonth());
            setYear(newDate.getFullYear());
        }
        return (
            <div className="bg-gray-950 p-4 rounded-lg"><div className="flex justify-between items-center mb-2"><button type="button" onClick={() => changeMonth(-1)} className="p-2 rounded-lg hover:bg-gray-700">&lt;</button><span className="font-bold text-white">{new Date(year, month).toLocaleString('pt-BR', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase())}</span><button type="button" onClick={() => changeMonth(1)} className="p-2 rounded-lg hover:bg-gray-700">&gt;</button></div><div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400">{['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => <div key={d}>{d}</div>)}</div><div className="grid grid-cols-7 gap-1 mt-1">{Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`}></div>)}{days.map(day => { const date = new Date(year, month, day); const isSelected = date.toDateString() === currentDate.toDateString(); return (<button type="button" key={day} onClick={() => onDateChange(date)} className={`p-2 rounded-full text-sm transition-colors ${isSelected ? 'bg-cyan-500 text-white font-bold' : 'hover:bg-gray-700'}`}>{day}</button>);})}</div></div>
        );
    };

    return (
        <div className="space-y-6">
            <div><h1 className="text-2xl lg:text-3xl font-bold text-white">{editingAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}</h1><p className="text-gray-400 mt-1">Preencha os detalhes para criar um novo horário</p></div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2"><Scissors className="h-5 w-5 text-cyan-400" /><span>1. Selecione os Serviços ou Combos</span></h2>
                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                                <input type="text" placeholder="Pesquisar serviço ou combo..." value={itemSearchTerm} onChange={(e) => setItemSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 w-full bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white" />
                            </div>
                            <div className="max-h-60 overflow-y-auto space-y-2 pr-2 -mr-2">
                                {filteredSelectableItems.map(item => (
                                    <label key={item.id} className={`w-full text-left p-3 rounded-lg transition-colors flex justify-between items-center cursor-pointer ${formState.selectedItemIds.includes(item.id) ? 'bg-cyan-600 text-white font-bold ring-2 ring-cyan-400' : 'bg-gray-800 hover:bg-gray-700'}`}>
                                        <div className="flex items-center space-x-3">
                                            <input type="checkbox" checked={formState.selectedItemIds.includes(item.id)} onChange={() => handleItemSelection(item.id)} className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-600" />
                                            <span>{item.name}</span>
                                        </div>
                                        {item.type === 'combo' && <span className="text-xs bg-sky-800/80 text-sky-300 px-1.5 py-0.5 rounded">COMBO</span>}
                                    </label>
                                ))}
                                {filteredSelectableItems.length === 0 && (<p className="text-center text-gray-500 py-4">Nenhum item encontrado.</p>)}
                            </div>
                        </div>
                    </Card>
                    <AnimatePresence>
                    {selectedItems.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        <Card><h2 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2"><Briefcase className="h-5 w-5 text-cyan-400" /><span>2. Detalhes do Agendamento</span></h2>
                            <div className="space-y-4">
                                <div><label className="block text-sm font-medium text-gray-400 mb-1">Cliente</label><div className="flex items-center space-x-2"><select name="clientId" value={formState.clientId} onChange={handleInputChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 text-white"><option value="">Selecione um cliente</option>{clients.filter(c => c.active).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select><button type="button" onClick={() => setIsClientModalOpen(true)} className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 text-white shrink-0"><Plus className="h-5 w-5" /></button></div></div>
                                <div><label className="block text-sm font-medium text-gray-400 mb-1">Profissional</label><select name="employeeId" value={formState.employeeId} onChange={handleInputChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 text-white" disabled={availableEmployees.length === 0}><option value="">{availableEmployees.length > 0 ? 'Selecione um profissional' : 'Nenhum profissional disponível'}</option>{availableEmployees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</select></div>
                            </div>
                        </Card>
                    </motion.div>
                    )}
                    </AnimatePresence>
                </div>
                <div className="lg:col-span-3 space-y-6">
                    <Card><h2 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2"><Tag className="h-5 w-5 text-cyan-400" /><span>Resumo</span></h2>
                        {selectedItems.length > 0 ? (
                            <div className="space-y-3">
                                <div className="flex justify-between font-medium"><span className="text-gray-300">Tempo Total:</span><span className="text-white">{totalDuration} min</span></div>
                                <div className="flex justify-between font-bold text-lg"><span className="text-white">Total:</span><span className="text-cyan-400">R$ {totalPrice.toFixed(2)}</span></div>
                            </div>
                        ) : (<p className="text-gray-500 text-center py-4">Selecione um ou mais serviços.</p>)}
                    </Card>
                    <Card><h2 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2"><CalendarIcon className="h-5 w-5 text-cyan-400" /><span>3. Data e Hora</span></h2><CalendarComponent currentDate={formState.date} onDateChange={(d) => setFormState(p => ({...p, date: d, time: '', employeeId: ''}))} />
                        <div className="mt-4"><h3 className="text-md font-semibold text-white mb-2">Horários Disponíveis</h3>
                            {availableSlots.length > 0 ? (
                                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto pr-2">
                                    {availableSlots.map(slot => (<button type="button" key={slot} onClick={() => setFormState(p => ({...p, time: slot}))} className={`p-2 rounded-lg text-center transition-colors text-sm ${formState.time === slot ? 'bg-cyan-500 text-white font-bold' : 'bg-gray-800 hover:bg-gray-700'}`}>{slot}</button>))}
                                </div>
                            ) : (<p className="text-gray-500 text-center text-sm py-4">Selecione serviço e profissional.</p>)}
                        </div>
                    </Card>
                    <button type="submit" disabled={!formState.time || !formState.clientId || !formState.employeeId || selectedItems.length === 0} className="w-full bg-gradient-to-r from-sky-600 to-cyan-500 text-white px-8 py-3 rounded-lg hover:from-sky-700 hover:to-cyan-600 transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"><CheckCircle className="h-5 w-5" /><span>{editingAppointment ? 'Salvar Alterações' : 'Confirmar Agendamento'}</span></button>
                </div>
            </form>
        </div>
    );
};

export default NewAppointment;
