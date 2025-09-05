import React, { useEffect, useState, useMemo } from 'react';
import Card from '../components/Card';
import { Link } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import { DollarSign, Calendar, Users, BarChart, Star, Target, Clock } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { Tables } from '../types/database.types';

type Sale = Tables<'sales'> & { sale_items: Tables<'sale_items'>[] };
type Appointment = Tables<'appointments'>;

const Dashboard: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [sales, setSales] = useState<Sale[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [clients, setClients] = useState<Tables<'clients'>[]>([]);
    const [services, setServices] = useState<Tables<'services'>[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const today = new Date().toISOString().slice(0, 10);

            const salesPromise = supabase.from('sales').select('*, sale_items(*)');
            const appointmentsPromise = supabase.from('appointments').select('*');
            const clientsPromise = supabase.from('clients').select('*');
            const servicesPromise = supabase.from('services').select('*');

            const [
                { data: salesData, error: salesError },
                { data: appointmentsData, error: appointmentsError },
                { data: clientsData, error: clientsError },
                { data: servicesData, error: servicesError },
            ] = await Promise.all([salesPromise, appointmentsPromise, clientsPromise, servicesPromise]);

            if (salesError) console.error('Error fetching sales:', salesError.message);
            if (appointmentsError) console.error('Error fetching appointments:', appointmentsError.message);
            if (clientsError) console.error('Error fetching clients:', clientsError.message);
            if (servicesError) console.error('Error fetching services:', servicesError.message);

            setSales(salesData || []);
            setAppointments(appointmentsData || []);
            setClients(clientsData || []);
            setServices(servicesData || []);
            setLoading(false);
        };

        fetchData();
    }, []);

    const {
        dailyRevenue,
        dailyAppointmentsCount,
        dailyAverageTicket,
        newClientsToday
    } = useMemo(() => {
        const todayStr = new Date().toDateString();
        const salesToday = sales.filter(s => new Date(s.created_at!).toDateString() === todayStr);
        const revenue = salesToday.reduce((acc, sale) => acc + sale.total, 0);
        const appointmentsToday = appointments.filter(a => new Date(a.start_time).toDateString() === todayStr);
        const clientsToday = clients.filter(c => new Date(c.created_at!).toDateString() === todayStr);

        return {
            dailyRevenue: revenue,
            dailyAppointmentsCount: appointmentsToday.length,
            dailyAverageTicket: salesToday.length > 0 ? revenue / salesToday.length : 0,
            newClientsToday: clientsToday.length
        };
    }, [sales, appointments, clients]);

    const weeklyRevenueData = useMemo(() => {
        const data: Record<string, number> = { 'Dom': 0, 'Seg': 0, 'Ter': 0, 'Qua': 0, 'Qui': 0, 'Sex': 0, 'Sáb': 0 };
        const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        
        sales.forEach(sale => {
            const saleDate = new Date(sale.created_at!);
            const dayName = dayNames[saleDate.getDay()];
            data[dayName] = (data[dayName] || 0) + sale.total;
        });

        return {
            labels: Object.keys(data),
            values: Object.values(data)
        };
    }, [sales]);

    const topServices = useMemo(() => {
        const serviceCounts: Record<string, number> = {};
        sales.forEach(sale => {
            sale.sale_items.forEach(item => {
                if (item.service_id || item.service_combo_id) {
                    serviceCounts[item.item_name] = (serviceCounts[item.item_name] || 0) + 1;
                }
            });
        });
        return Object.entries(serviceCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([name, count]) => ({ name, count }));
    }, [sales]);

    const monthlyGoal = 30000;
    const monthlyRevenue = sales.reduce((acc, sale) => acc + sale.total, 0);
    const goalProgress = (monthlyRevenue / monthlyGoal) * 100;

    const chartOption = {
        grid: { top: '15%', right: '5%', bottom: '15%', left: '12%' },
        xAxis: {
            type: 'category',
            data: weeklyRevenueData.labels,
            axisLabel: { color: '#9ca3af' },
            axisLine: { lineStyle: { color: '#374151' } },
        },
        yAxis: {
            type: 'value',
            axisLabel: { color: '#9ca3af', formatter: 'R$ {value}' },
            splitLine: { lineStyle: { color: '#1f2937' } },
        },
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(17, 24, 39, 0.8)',
            borderColor: '#38bdf8',
            textStyle: { color: '#e5e7eb' },
            formatter: '<b>{b0}</b><br/>Faturamento: R$ {c0}'
        },
        series: [{
            data: weeklyRevenueData.values,
            type: 'bar',
            itemStyle: {
                color: '#0ea5e9',
                borderRadius: [4, 4, 0, 0]
            },
            emphasis: {
                itemStyle: {
                    color: '#0284c7'
                }
            }
        }],
    };

    const todayAppointments = useMemo(() => {
        const todayStr = new Date().toDateString();
        return appointments
            .filter(a => new Date(a.start_time).toDateString() === todayStr && a.status === 'agendado')
            .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
    }, [appointments]);

    if (loading) {
        return <div className="text-center p-8">Carregando dashboard...</div>;
    }

    return (
        <div className="space-y-8">
            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="flex items-center space-x-4">
                    <div className="p-3 bg-green-900/50 rounded-lg"><DollarSign className="h-6 w-6 text-green-400" /></div>
                    <div><p className="text-sm text-gray-400">Faturamento do Dia</p><p className="text-2xl font-bold text-white">R$ {dailyRevenue.toFixed(2)}</p></div>
                </Card>
                <Card className="flex items-center space-x-4">
                    <div className="p-3 bg-sky-900/50 rounded-lg"><Calendar className="h-6 w-6 text-sky-400" /></div>
                    <div><p className="text-sm text-gray-400">Agendamentos Hoje</p><p className="text-2xl font-bold text-white">{dailyAppointmentsCount}</p></div>
                </Card>
                <Card className="flex items-center space-x-4">
                    <div className="p-3 bg-purple-900/50 rounded-lg"><BarChart className="h-6 w-6 text-purple-400" /></div>
                    <div><p className="text-sm text-gray-400">Ticket Médio Dia</p><p className="text-2xl font-bold text-white">R$ {dailyAverageTicket.toFixed(2)}</p></div>
                </Card>
                <Card className="flex items-center space-x-4">
                    <div className="p-3 bg-amber-900/50 rounded-lg"><Users className="h-6 w-6 text-amber-400" /></div>
                    <div><p className="text-sm text-gray-400">Novos Clientes Hoje</p><p className="text-2xl font-bold text-white">{newClientsToday}</p></div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-8">
                     <Card>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-white flex items-center space-x-2"><Clock className="h-5 w-5 text-cyan-400"/><span>Agenda do Dia</span></h2>
                            <Link to="/appointments/panel" className="text-cyan-400 hover:text-cyan-300 text-sm font-medium">Ver todos</Link>
                        </div>
                        <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                            {todayAppointments.length > 0 ? todayAppointments.map((apt) => {
                                const client = clients.find(c => c.id === apt.client_id);
                                return (
                                    <div key={apt.id} className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
                                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-sky-600 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">{client?.name.charAt(0)}</div>
                                        <div><p className="font-medium text-white text-sm">{client?.name}</p><p className="text-xs text-gray-400">Agendamento</p></div>
                                        <p className="ml-auto text-sm font-medium text-white">{new Date(apt.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                );
                            }) : <p className="text-center text-gray-500 py-8">Nenhum agendamento para hoje.</p>}
                        </div>
                    </Card>
                    <Card>
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2"><Star className="h-5 w-5 text-cyan-400"/><span>Serviços Populares</span></h2>
                        <div className="space-y-3">
                            {topServices.map((service, index) => (
                                <div key={index} className="flex justify-between items-center text-sm">
                                    <span className="text-gray-300">{service.name}</span>
                                    <span className="font-bold text-white bg-gray-700 px-2 py-0.5 rounded-md">{service.count}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <h2 className="text-lg font-semibold text-white mb-4">Faturamento Semanal</h2>
                        <ReactECharts option={chartOption} style={{ height: '300px' }} notMerge={true} lazyUpdate={true} theme={"dark"} />
                    </Card>
                    <Card>
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2"><Target className="h-5 w-5 text-cyan-400"/><span>Meta de Faturamento Mensal</span></h2>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm font-medium">
                                <span className="text-green-400">R$ {monthlyRevenue.toFixed(2)}</span>
                                <span className="text-gray-400">R$ {monthlyGoal.toFixed(2)}</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2.5">
                                <div className="bg-gradient-to-r from-sky-500 to-cyan-400 h-2.5 rounded-full" style={{ width: `${Math.min(goalProgress, 100)}%` }}></div>
                            </div>
                            <p className="text-right text-xs text-gray-400">{goalProgress.toFixed(1)}% da meta atingida</p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
