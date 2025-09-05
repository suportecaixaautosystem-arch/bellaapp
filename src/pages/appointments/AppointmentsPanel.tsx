import React, { useState, useEffect, useMemo } from 'react';
import Card from '../../components/Card';
import { Plus, Edit, Trash2, X, Clock, User, Scissors, DollarSign, Calendar as CalendarIcon, View } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Calendar from '../../components/Calendar';
import { supabase } from '../../lib/supabaseClient';
import { Tables } from '../../types/database.types';
import { useAuth } from '../../contexts/AuthContext';

type AppointmentWithDetails = Tables<'appointments'> & {
  clients: Pick<Tables<'clients'>, 'id' | 'name'> | null;
  employees: Pick<Tables<'employees'>, 'id' | 'name'> | null;
  appointment_items: (Pick<Tables<'appointment_items'>, 'id'> & {
    services: Pick<Tables<'services'>, 'id' | 'name'> | null;
    service_combos: Pick<Tables<'service_combos'>, 'id' | 'name'> | null;
  })[];
};

const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
};

const AppointmentsPanel: React.FC = () => {
    const { profile } = useAuth();
    const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDetails | null>(null);
    
    const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<Date>(new Date());

    const canEditOrDelete = profile?.role === 'admin' || profile?.role === 'manager';

    const fetchAppointments = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('appointments')
            .select(`
                *,
                clients (id, name),
                employees (id, name),
                appointment_items (
                    id,
                    services (id, name),
                    service_combos (id, name)
                )
            `);

        if (error) {
            console.error('Error fetching appointments:', error);
            alert('Erro ao buscar agendamentos.');
        } else {
            setAppointments(data as AppointmentWithDetails[]);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const appointmentsByDay = useMemo(() => {
        return appointments.reduce((acc, apt) => {
            const dateKey = new Date(apt.start_time).toDateString();
            if (!acc[dateKey]) acc[dateKey] = [];
            acc[dateKey].push(apt);
            return acc;
        }, {} as Record<string, AppointmentWithDetails[]>);
    }, [appointments]);

    const appointmentsForSelectedDay = useMemo(() => {
        return (appointmentsByDay[selectedDay.toDateString()] || []).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
    }, [appointmentsByDay, selectedDay]);

    const handleCancelAppointment = async (id: number) => {
        if (!canEditOrDelete) { alert("Você não tem permissão para cancelar agendamentos."); return; }
        if (window.confirm('Tem certeza que deseja cancelar este agendamento? O horário será liberado.')) {
            const { error } = await supabase.from('appointments').update({ status: 'cancelado' }).eq('id', id);
            if (error) alert(`Erro ao cancelar agendamento: ${error.message}`);
            else {
                fetchAppointments();
                closeModal();
            }
        }
    };

    const handleTogglePayment = async (appointment: AppointmentWithDetails) => {
        if (!canEditOrDelete) { alert("Você não tem permissão para alterar o pagamento."); return; }
        const newStatus = appointment.payment_status === 'pago' ? 'pendente' : 'pago';
        const { data, error } = await supabase.from('appointments').update({ payment_status: newStatus }).eq('id', appointment.id).select('*, clients (id, name), employees (id, name), appointment_items (id, services (id, name), service_combos (id, name))').single();
        if (error) alert(`Erro ao alterar status de pagamento: ${error.message}`);
        else {
            setSelectedAppointment(data as AppointmentWithDetails);
            fetchAppointments();
        }
    };

    const openModal = (appointment: AppointmentWithDetails) => {
        setSelectedAppointment(appointment);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedAppointment(null);
    };

    const renderDayForMonth = (day: Date) => {
        const dayAppointments = appointmentsByDay[day.toDateString()] || [];
        const isSelected = day.toDateString() === selectedDay.toDateString();
        const isCurrentMonth = day.getMonth() === currentDate.getMonth();

        return (
            <button 
                onClick={() => setSelectedDay(day)}
                className={`h-24 w-full flex flex-col p-1.5 border rounded-lg transition-all duration-200 text-left
                ${isCurrentMonth ? 'border-gray-800 bg-gray-900 hover:border-cyan-500' : 'border-gray-800/50 bg-gray-950/50 text-gray-600'} 
                ${isSelected ? 'border-cyan-500 ring-2 ring-cyan-500' : ''}`}
            >
                <span className={`text-xs font-medium ${isCurrentMonth ? 'text-white' : 'text-gray-600'}`}>{day.getDate()}</span>
                <div className="flex-1 mt-1 space-y-1 overflow-y-auto">
                    {dayAppointments.filter(apt => apt.status === 'agendado').slice(0, 2).map(apt => (
                        <div key={apt.id} className="w-full text-xs p-1 rounded bg-sky-800/70 text-white truncate">
                            {new Date(apt.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    ))}
                    {dayAppointments.length > 2 && <div className="text-xs text-center text-gray-400">...</div>}
                </div>
            </button>
        );
    };
    
    const WeekView = () => {
        const startOfWeek = getStartOfWeek(currentDate);
        const weekDays = Array.from({ length: 7 }).map((_, i) => {
            const date = new Date(startOfWeek);
            date.setDate(date.getDate() + i);
            return date;
        });

        const changeWeek = (direction: 'prev' | 'next') => {
            const newDate = new Date(currentDate);
            newDate.setDate(newDate.getDate() + (direction === 'prev' ? -7 : 7));
            setCurrentDate(newDate);
        };

        return (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={() => changeWeek('prev')} className="p-2 rounded-lg hover:bg-gray-700"> &lt; </button>
                    <h2 className="text-lg font-semibold text-white">
                        {startOfWeek.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} - {weekDays[6].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </h2>
                    <button onClick={() => changeWeek('next')} className="p-2 rounded-lg hover:bg-gray-700"> &gt; </button>
                </div>
                <div className="grid grid-cols-7 gap-2">
                    {weekDays.map(day => {
                         const dayAppointments = appointmentsByDay[day.toDateString()] || [];
                         const isSelected = day.toDateString() === selectedDay.toDateString();
                         return (
                            <div key={day.toISOString()} onClick={() => setSelectedDay(day)} className={`p-2 border rounded-lg cursor-pointer ${isSelected ? 'border-cyan-500 ring-2 ring-cyan-500' : 'border-gray-800 hover:border-cyan-500'}`}>
                                <p className="text-center font-medium text-white">{day.toLocaleDateString('pt-BR', { weekday: 'short' })}</p>
                                <p className="text-center text-xl font-bold text-white">{day.getDate()}</p>
                                <div className="mt-2 space-y-1">
                                    {dayAppointments.filter(a => a.status === 'agendado').map(apt => (
                                        <div key={apt.id} className="text-xs p-1 rounded bg-sky-800/70 text-white truncate">{new Date(apt.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                                    ))}
                                </div>
                            </div>
                         )
                    })}
                </div>
                 <div className="flex justify-center mt-4">
                    <button onClick={() => setViewMode('month')} className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center space-x-2">
                        <CalendarIcon className="h-4 w-4" />
                        <span>Ver Mês</span>
                    </button>
                </div>
            </div>
        )
    }

    const AppointmentDetailsModal = () => {
        if (!selectedAppointment) return null;
        
        const serviceNames = selectedAppointment.appointment_items.map(item => 
            item.services?.name || item.service_combos?.name || 'Serviço desconhecido'
        ).join(', ');

        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4" onClick={closeModal}>
                <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20, opacity: 0 }} className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between p-6 border-b border-gray-800">
                        <h2 className="text-lg font-semibold text-white">Detalhes do Agendamento</h2>
                        <button onClick={closeModal} className="p-2 rounded-full hover:bg-gray-700"><X className="h-5 w-5 text-gray-400" /></button>
                    </div>
                    <div className="p-6 space-y-3">
                        <p className="flex items-center"><User className="w-4 h-4 mr-3 text-cyan-400"/> <strong>Cliente:</strong><span className="ml-2 text-gray-300">{selectedAppointment.clients?.name || 'Cliente não informado'}</span></p>
                        <p className="flex items-center"><Scissors className="w-4 h-4 mr-3 text-cyan-400"/> <strong>Serviço(s):</strong><span className="ml-2 text-gray-300">{serviceNames}</span></p>
                        <p className="flex items-center"><Clock className="w-4 h-4 mr-3 text-cyan-400"/> <strong>Data e Hora:</strong><span className="ml-2 text-gray-300">{new Date(selectedAppointment.start_time).toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'short' })}</span></p>
                        <div className="flex items-center justify-between pt-2">
                            <strong className="flex items-center"><DollarSign className="w-4 h-4 mr-3 text-cyan-400"/>Pagamento:</strong>
                            <button onClick={() => handleTogglePayment(selectedAppointment)} disabled={!canEditOrDelete} className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${!canEditOrDelete ? 'cursor-not-allowed' : 'cursor-pointer'} ${selectedAppointment.payment_status === 'pago' ? 'bg-green-900/50 text-green-300' : 'bg-yellow-900/50 text-yellow-300'}`}>
                                {selectedAppointment.payment_status === 'pago' ? 'Pago' : 'Pendente'}
                            </button>
                        </div>
                    </div>
                    {canEditOrDelete && (
                    <div className="flex justify-end space-x-4 p-6 bg-gray-950/50 rounded-b-xl border-t border-gray-800">
                        <button onClick={() => handleCancelAppointment(selectedAppointment.id)} className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50" disabled={selectedAppointment.status === 'cancelado'}><Trash2 className="h-4 w-4" /><span>Cancelar</span></button>
                        <Link to="/appointments/new" state={{ appointmentId: selectedAppointment.id }} className="flex items-center space-x-2 bg-gray-700 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"><Edit className="h-4 w-4" /><span>Editar</span></Link>
                    </div>
                    )}
                </motion.div>
            </motion.div>
        );
    };

    if (isLoading) {
        return <div className="text-center p-8">Carregando agendamentos...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-white">Painel de Agendamentos</h1>
                    <p className="text-gray-400 mt-1">Visualize e gerencie seus horários</p>
                </div>
                <Link to="/appointments/new" className="bg-gradient-to-r from-sky-600 to-cyan-500 text-white px-6 py-3 rounded-lg hover:from-sky-700 hover:to-cyan-600 transition-all duration-200 flex items-center space-x-2 shadow-lg">
                    <Plus className="h-5 w-5" />
                    <span>Novo Agendamento</span>
                </Link>
            </div>

            <AnimatePresence>{isModalOpen && <AppointmentDetailsModal />}</AnimatePresence>

            {viewMode === 'week' ? <WeekView /> : (
                <Card>
                    <Calendar 
                        currentDate={currentDate}
                        onDateChange={setCurrentDate}
                        renderDay={renderDayForMonth}
                        headerControl={
                            <button onClick={() => setViewMode('week')} className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center space-x-2">
                                <View className="h-4 w-4" />
                                <span>Ver Semana</span>
                            </button>
                        }
                    />
                </Card>
            )}

            <AnimatePresence>
            {appointmentsForSelectedDay.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <Card>
                        <h2 className="text-lg font-semibold text-white mb-4">
                            Agenda de {selectedDay.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
                        </h2>
                        <div className="space-y-3">
                            {appointmentsForSelectedDay.map(apt => {
                                const statusConfig = {
                                    agendado: { color: 'bg-sky-900/50 text-sky-300', label: 'Agendado' },
                                    cancelado: { color: 'bg-red-900/50 text-red-300', label: 'Cancelado' },
                                    concluido: { color: 'bg-gray-700 text-gray-400', label: 'Concluído' },
                                    'no-show': { color: 'bg-yellow-900/50 text-yellow-300', label: 'Não Compareceu' },
                                };
                                const serviceNames = apt.appointment_items.map(item => item.services?.name || item.service_combos?.name).join(', ');
                                return (
                                    <div key={apt.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                                        <div className="flex-1">
                                            <p className="font-medium text-white">{apt.clients?.name || 'N/A'}</p>
                                            <p className="text-sm text-gray-400">{serviceNames}</p>
                                        </div>
                                        <div className="text-center mx-4">
                                            <p className="font-medium text-white">{new Date(apt.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[apt.status].color}`}>
                                                {statusConfig[apt.status].label}
                                            </span>
                                        </div>
                                        <button onClick={() => openModal(apt)} className="p-2 hover:bg-gray-700 rounded-lg"><Edit className="h-4 w-4 text-blue-400" /></button>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </motion.div>
            )}
            </AnimatePresence>
        </div>
    );
};

export default AppointmentsPanel;
