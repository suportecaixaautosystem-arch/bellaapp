import React, { useState, useMemo, useEffect } from 'react';
import Card from '../../components/Card';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, User, CreditCard, Percent, Tag, Calendar, Check, Printer, MessageSquare, ShoppingCart, Search, DollarSign, Briefcase, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { Tables, TablesInsert } from '../../types/database.types';

type CartItem = {
    id: string;
    name: string;
    price: number;
    type: 'service' | 'product' | 'combo';
    typeId: number;
    quantity: number;
};

type Sale = Tables<'sales'> & { sale_items: Tables<'sale_items'>[] };
type AppointmentWithDetails = Tables<'appointments'> & { clients: Tables<'clients'> | null, services: Tables<'services'> | null };

const PDV: React.FC = () => {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [clientId, setClientId] = useState<string>('');
    const [employeeId, setEmployeeId] = useState<string>('');
    const [isEmployeeLocked, setIsEmployeeLocked] = useState(false);
    const [paymentMethodId, setPaymentMethodId] = useState<string>('');
    
    const [discount, setDiscount] = useState<number>(0);
    const [discountType, setDiscountType] = useState<'fixed' | 'percent'>('fixed');
    const [surcharge, setSurcharge] = useState<number>(0);
    const [surchargeType, setSurchargeType] = useState<'fixed' | 'percent'>('fixed');

    const [activeTab, setActiveTab] = useState<'appointments' | 'services' | 'products' | 'combos'>('appointments');
    const [searchTerm, setSearchTerm] = useState('');
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
    const [lastSale, setLastSale] = useState<Sale | null>(null);

    // Data from Supabase
    const [loading, setLoading] = useState(true);
    const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
    const [clients, setClients] = useState<Tables<'clients'>[]>([]);
    const [employees, setEmployees] = useState<Tables<'employees'>[]>([]);
    const [services, setServices] = useState<Tables<'services'>[]>([]);
    const [products, setProducts] = useState<Tables<'products'>[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<Tables<'payment_methods'>[]>([]);
    const [serviceCombos, setServiceCombos] = useState<Tables<'service_combos'>[]>([]);
    const [productCombos, setProductCombos] = useState<Tables<'product_combos'>[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const appointmentsPromise = supabase.from('appointments').select('*, clients(id, name), services(id, name)');
            const clientsPromise = supabase.from('clients').select('*').eq('is_active', true);
            const employeesPromise = supabase.from('employees').select('*').eq('is_active', true);
            const servicesPromise = supabase.from('services').select('*').eq('is_active', true);
            const productsPromise = supabase.from('products').select('*').eq('is_active', true);
            const paymentMethodsPromise = supabase.from('payment_methods').select('*').eq('is_active', true);
            const serviceCombosPromise = supabase.from('service_combos').select('*').eq('is_active', true);
            const productCombosPromise = supabase.from('product_combos').select('*').eq('is_active', true);

            const [ apts, cls, emps, srvs, prods, pms, srvCombos, prodCombos ] = await Promise.all([
                appointmentsPromise, clientsPromise, employeesPromise, servicesPromise, productsPromise, paymentMethodsPromise, serviceCombosPromise, productCombosPromise
            ]);

            setAppointments(apts.data as any || []);
            setClients(cls.data || []);
            setEmployees(emps.data || []);
            setServices(srvs.data || []);
            setProducts(prods.data || []);
            setPaymentMethods(pms.data || []);
            setServiceCombos(srvCombos.data || []);
            setProductCombos(prodCombos.data || []);
            setLoading(false);
        }
        fetchData();
    }, []);

    const subtotal = useMemo(() => cart.reduce((acc, item) => acc + item.price * item.quantity, 0), [cart]);
    
    const total = useMemo(() => {
        const discountAmount = discountType === 'percent' ? (subtotal * discount) / 100 : discount;
        const surchargeAmount = surchargeType === 'percent' ? (subtotal * surcharge) / 100 : surcharge;
        return subtotal - discountAmount + surchargeAmount;
    }, [subtotal, discount, discountType, surcharge, surchargeType]);

    const filteredAppointments = useMemo(() => {
        const pending = appointments.filter(apt => apt.payment_status === 'pendente' && apt.status === 'agendado');
        if (!searchTerm) return pending;
        return pending.filter(apt => apt.clients?.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [appointments, searchTerm]);

    const filteredServices = useMemo(() => {
        if (!searchTerm) return services;
        return services.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [services, searchTerm]);

    const filteredProducts = useMemo(() => {
        if (!searchTerm) return products;
        return products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [products, searchTerm]);

    const filteredCombos = useMemo(() => {
        const allCombos = [
            ...serviceCombos.map(c => ({...c, comboType: 'service' as const})),
            ...productCombos.map(c => ({...c, comboType: 'product' as const}))
        ];
        if (!searchTerm) return allCombos;
        return allCombos.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [serviceCombos, productCombos, searchTerm]);

    const resetSale = () => {
        setCart([]);
        setClientId('');
        setEmployeeId('');
        setIsEmployeeLocked(false);
        setPaymentMethodId('');
        setDiscount(0);
        setSurcharge(0);
        setDiscountType('fixed');
        setSurchargeType('fixed');
        setIsReceiptModalOpen(false);
        setLastSale(null);
    };

    const handleAddFromAppointment = (appointmentId: number) => {
        const appointment = appointments.find(a => a.id === appointmentId);
        if (!appointment || !appointment.services) return;
        
        setClientId(appointment.client_id?.toString() || '');
        setEmployeeId(appointment.employee_id.toString());
        setIsEmployeeLocked(true);

        const newCartItem: CartItem = {
            id: `service-${appointment.services.id}-${Date.now()}`,
            name: appointment.services.name,
            price: appointment.services.price,
            type: 'service',
            typeId: appointment.services.id,
            quantity: 1,
        };
        setCart(prev => [...prev, newCartItem]);
    };

    const handleAddItem = (item: Tables<'services'> | Tables<'products'>, type: 'service' | 'product') => {
        setIsEmployeeLocked(false);
        const price = 'sale_price' in item ? item.sale_price : item.price;
        const newCartItem: CartItem = {
            id: `${type}-${item.id}-${Date.now()}`,
            name: item.name,
            price,
            type,
            typeId: item.id,
            quantity: 1,
        };
        setCart(prev => [...prev, newCartItem]);
    };

    const handleAddCombo = (combo: Tables<'service_combos'> | Tables<'product_combos'>) => {
        setIsEmployeeLocked(false);
        const newCartItem: CartItem = {
            id: `combo-${combo.id}-${Date.now()}`,
            name: combo.name,
            price: combo.price,
            type: 'combo',
            typeId: combo.id,
            quantity: 1,
        };
        setCart(prev => [...prev, newCartItem]);
    }

    const handleRemoveItem = (itemId: string) => {
        setCart(prev => prev.filter(item => item.id !== itemId));
    };

    const handleFinalizeSale = async () => {
        if (cart.length === 0) { alert("O carrinho está vazio."); return; }
        if (!paymentMethodId) { alert("Por favor, selecione uma forma de pagamento."); return; }
        if (!employeeId) { alert("Por favor, selecione um funcionário para a venda."); return; }

        const saleToInsert: TablesInsert<'sales'> = {
            company_id: 1,
            client_id: clientId ? parseInt(clientId) : null,
            employee_id: parseInt(employeeId),
            payment_method_id: parseInt(paymentMethodId),
            subtotal,
            total,
            discount_value: discount,
            discount_type: discountType,
            surcharge_value: surcharge,
            surcharge_type: surchargeType,
        };

        const { data: saleData, error: saleError } = await supabase.from('sales').insert(saleToInsert).select().single();

        if (saleError || !saleData) {
            alert(`Erro ao finalizar venda: ${saleError?.message}`);
            return;
        }

        const saleItemsToInsert: TablesInsert<'sale_items'>[] = cart.map(item => ({
            sale_id: saleData.id,
            item_name: item.name,
            unit_price: item.price,
            quantity: item.quantity,
            total_price: item.price * item.quantity,
            service_id: item.type === 'service' ? item.typeId : null,
            product_id: item.type === 'product' ? item.typeId : null,
            service_combo_id: item.type === 'combo' && services.some(s => s.id === item.typeId) ? item.typeId : null,
            product_combo_id: item.type === 'combo' && products.some(p => p.id === item.typeId) ? item.typeId : null,
        }));
        
        const { error: itemsError } = await supabase.from('sale_items').insert(saleItemsToInsert);

        if (itemsError) {
            alert(`Erro ao salvar itens da venda: ${itemsError.message}. A venda foi revertida.`);
            await supabase.from('sales').delete().eq('id', saleData.id);
            return;
        }

        setLastSale(saleData as Sale);
        setIsReceiptModalOpen(true);
    };

    const ReceiptModal = () => {
        if (!lastSale) return null;
        const client = clients.find(c => c.id === lastSale.client_id);
        const paymentMethod = paymentMethods.find(pm => pm.id === lastSale.payment_method_id);
        
        const generateWhatsAppMessage = () => {
            // ... (implementation is complex, skipping for brevity but logic would be similar to mock)
            return encodeURIComponent(`Comprovante da sua compra no valor de R$ ${lastSale.total.toFixed(2)}`);
        };

        const whatsAppHref = `https://wa.me/${client?.phone?.replace(/\D/g, '') || ''}?text=${generateWhatsAppMessage()}`;

        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 w-full max-w-md">
                    <div id="receipt-content" className="p-6 text-white">
                        <h2 className="text-center text-xl font-bold mb-4">BARBER & BELLA SALON</h2>
                        <p className="text-center text-xs text-gray-400 mb-6">Comprovante de Venda</p>
                        <div className="space-y-2 border-b border-dashed border-gray-700 pb-4 mb-4">
                            {cart.map(item => (
                                <div key={item.id} className="flex justify-between text-sm">
                                    <span>{item.name} (x{item.quantity})</span>
                                    <span>R$ {item.price.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-gray-400">Subtotal</span><span>R$ {lastSale.subtotal.toFixed(2)}</span></div>
                            {lastSale.discount_value && lastSale.discount_value > 0 && <div className="flex justify-between"><span className="text-gray-400">Desconto</span><span className="text-red-400">- R$ {(lastSale.discount_type === 'percent' ? (lastSale.subtotal * lastSale.discount_value / 100) : lastSale.discount_value).toFixed(2)}</span></div>}
                            {lastSale.surcharge_value && lastSale.surcharge_value > 0 && <div className="flex justify-between"><span className="text-gray-400">Acréscimo</span><span className="text-green-400">+ R$ {(lastSale.surcharge_type === 'percent' ? (lastSale.subtotal * lastSale.surcharge_value / 100) : lastSale.surcharge_value).toFixed(2)}</span></div>}
                            <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-700"><span >Total</span><span>R$ {lastSale.total.toFixed(2)}</span></div>
                        </div>
                        <p className="text-xs text-gray-500 text-center mt-6">Venda: {lastSale.id}</p>
                    </div>
                    <div className="p-4 bg-gray-950/50 rounded-b-xl border-t border-gray-800 grid grid-cols-3 gap-2">
                        <button onClick={() => window.print()} className="flex items-center justify-center space-x-2 p-2 bg-gray-700 rounded-lg hover:bg-gray-600"><Printer className="h-4 w-4" /><span>Imprimir</span></button>
                        <a href={whatsAppHref} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center space-x-2 p-2 bg-green-600 rounded-lg hover:bg-green-700"><MessageSquare className="h-4 w-4" /><span>WhatsApp</span></a>
                        <button onClick={resetSale} className="flex items-center justify-center space-x-2 p-2 bg-sky-600 rounded-lg hover:bg-sky-700"><Check className="h-4 w-4" /><span>Nova Venda</span></button>
                    </div>
                </motion.div>
            </motion.div>
        );
    };

    if (loading) return <div className="text-center p-8 flex items-center justify-center space-x-2"><Loader className="animate-spin h-5 w-5" /><span>Carregando PDV...</span></div>;

    const isFinalizeDisabled = cart.length === 0 || !paymentMethodId || !employeeId;

    return (
        <div className="space-y-6">
            <AnimatePresence>{isReceiptModalOpen && <ReceiptModal />}</AnimatePresence>
            <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-white">Vendas / PDV</h1>
                <p className="text-gray-400 mt-1">Realize vendas de serviços e produtos</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2 space-y-6 flex flex-col">
                    <Card className="flex-grow flex flex-col">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center"><ShoppingCart className="h-5 w-5 mr-2 text-cyan-400" />Itens da Venda</h2>
                        <div className="flex-grow space-y-3 pr-2 -mr-2 overflow-y-auto">
                            {cart.length > 0 ? cart.map(item => (
                                <div key={item.id} className="bg-gray-800 p-3 rounded-lg animate-in fade-in-50">
                                    <div className="flex items-center justify-between">
                                        <div><p className="text-sm font-medium text-white">{item.name}</p><p className="text-xs text-gray-400">R$ {item.price.toFixed(2)}</p></div>
                                        <button onClick={() => handleRemoveItem(item.id)} className="p-1 hover:bg-red-900/50 rounded-full"><Trash2 className="h-4 w-4 text-red-400" /></button>
                                    </div>
                                </div>
                            )) : <div className="flex items-center justify-center h-full"><p className="text-center text-gray-500 py-8">Carrinho vazio</p></div>}
                        </div>
                    </Card>
                    <Card>
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center"><User className="h-5 w-5 mr-2 text-cyan-400" />Cliente</h2>
                        <select value={clientId} onChange={e => setClientId(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500">
                            <option value="">Consumidor Final</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </Card>
                    <Card>
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center"><Briefcase className="h-5 w-5 mr-2 text-cyan-400" />Funcionário</h2>
                        <select value={employeeId} onChange={e => setEmployeeId(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500" disabled={isEmployeeLocked}>
                            <option value="">Selecione o funcionário...</option>
                            {employees.map(emp => (<option key={emp.id} value={emp.id}>{emp.name}</option>))}
                        </select>
                        {isEmployeeLocked && <p className="text-xs text-gray-500 mt-1">Funcionário definido pelo agendamento.</p>}
                    </Card>
                    <Card>
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center"><CreditCard className="h-5 w-5 mr-2 text-cyan-400" />Pagamento</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm"><span className="text-gray-400">Subtotal</span><span className="font-medium text-white">R$ {subtotal.toFixed(2)}</span></div>
                            <div className="flex items-center justify-between gap-2">
                                <label className="text-sm text-gray-400 shrink-0">Desconto</label>
                                <div className="flex">
                                    <input type="number" value={discount} onChange={e => setDiscount(parseFloat(e.target.value) || 0)} className="w-full bg-gray-800 border border-gray-700 rounded-l-lg px-2 py-1 text-right text-sm" />
                                    <button type="button" onClick={() => setDiscountType('percent')} className={`p-1.5 border border-l-0 ${discountType === 'percent' ? 'bg-cyan-600 border-cyan-500' : 'bg-gray-700 border-gray-700 hover:bg-gray-600'}`}><Percent className="h-4 w-4" /></button>
                                    <button type="button" onClick={() => setDiscountType('fixed')} className={`p-1.5 border border-l-0 rounded-r-lg ${discountType === 'fixed' ? 'bg-cyan-600 border-cyan-500' : 'bg-gray-700 border-gray-700 hover:bg-gray-600'}`}><DollarSign className="h-4 w-4" /></button>
                                </div>
                            </div>
                             <div className="flex items-center justify-between gap-2">
                                <label className="text-sm text-gray-400 shrink-0">Acréscimo</label>
                                <div className="flex">
                                    <input type="number" value={surcharge} onChange={e => setSurcharge(parseFloat(e.target.value) || 0)} className="w-full bg-gray-800 border border-gray-700 rounded-l-lg px-2 py-1 text-right text-sm" />
                                    <button type="button" onClick={() => setSurchargeType('percent')} className={`p-1.5 border border-l-0 ${surchargeType === 'percent' ? 'bg-cyan-600 border-cyan-500' : 'bg-gray-700 border-gray-700 hover:bg-gray-600'}`}><Percent className="h-4 w-4" /></button>
                                    <button type="button" onClick={() => setSurchargeType('fixed')} className={`p-1.5 border border-l-0 rounded-r-lg ${surchargeType === 'fixed' ? 'bg-cyan-600 border-cyan-500' : 'bg-gray-700 border-gray-700 hover:bg-gray-600'}`}><DollarSign className="h-4 w-4" /></button>
                                </div>
                            </div>
                            <div className="flex justify-between items-center text-xl font-bold pt-2 border-t border-gray-800"><span className="text-white">Total</span><span className="text-cyan-400">R$ {total.toFixed(2)}</span></div>
                            <select value={paymentMethodId} onChange={e => setPaymentMethodId(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500">
                                <option value="">Selecione a forma de pagamento...</option>
                                {paymentMethods.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <button onClick={handleFinalizeSale} disabled={isFinalizeDisabled} className="w-full mt-6 bg-gradient-to-r from-sky-600 to-cyan-500 text-white py-3 rounded-lg font-bold hover:from-sky-700 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed">Finalizar Venda</button>
                    </Card>
                </div>
                <div className="lg:col-span-3">
                     <Card>
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <input type="text" placeholder="Buscar itens..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 w-full bg-gray-950 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 text-white" />
                        </div>
                        <div className="border-b border-gray-800 mb-4">
                            <nav className="-mb-px flex space-x-4 overflow-x-auto">
                                <button onClick={() => setActiveTab('appointments')} className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'appointments' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-white'}`}>Agendamentos</button>
                                <button onClick={() => setActiveTab('services')} className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'services' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-white'}`}>Serviços</button>
                                <button onClick={() => setActiveTab('products')} className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'products' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-white'}`}>Produtos</button>
                                <button onClick={() => setActiveTab('combos')} className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'combos' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-white'}`}>Combos</button>
                            </nav>
                        </div>
                        <div className="max-h-[65vh] overflow-y-auto pr-2 -mr-2">
                            <AnimatePresence mode="wait">
                                <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                                    {activeTab === 'appointments' && (filteredAppointments.length > 0 ? filteredAppointments.map(apt => (
                                        <div key={apt.id} className="flex items-center justify-between p-3 mb-2 bg-gray-800 rounded-lg">
                                            <div><p className="text-sm text-white">{apt.clients?.name}</p><p className="text-xs text-gray-400">{apt.services?.name}</p></div>
                                            <button onClick={() => handleAddFromAppointment(apt.id)} className="p-2 bg-sky-600 rounded-lg hover:bg-sky-700 text-white"><Plus className="h-4 w-4"/></button>
                                        </div>
                                    )) : <p className="text-center text-gray-500 py-8">Nenhum agendamento pendente.</p>)}
                                    {activeTab === 'services' && filteredServices.map(service => (
                                        <div key={service.id} className="flex items-center justify-between p-3 mb-2 bg-gray-800 rounded-lg">
                                            <div><p className="text-sm text-white">{service.name}</p><p className="text-xs text-gray-400">R$ {service.price.toFixed(2)}</p></div>
                                            <button onClick={() => handleAddItem(service, 'service')} className="p-2 bg-sky-600 rounded-lg hover:bg-sky-700 text-white"><Plus className="h-4 w-4"/></button>
                                        </div>
                                    ))}
                                    {activeTab === 'products' && filteredProducts.map(product => (
                                        <div key={product.id} className="flex items-center justify-between p-3 mb-2 bg-gray-800 rounded-lg">
                                            <div><p className="text-sm text-white">{product.name}</p><p className="text-xs text-gray-400">R$ {product.sale_price.toFixed(2)}</p></div>
                                            <button onClick={() => handleAddItem(product, 'product')} className="p-2 bg-sky-600 rounded-lg hover:bg-sky-700 text-white"><Plus className="h-4 w-4"/></button>
                                        </div>
                                    ))}
                                    {activeTab === 'combos' && filteredCombos.map(combo => (
                                        <div key={`${combo.id}`} className="flex items-center justify-between p-3 mb-2 bg-gray-800 rounded-lg">
                                            <div><p className="text-sm text-white flex items-center">{combo.name} <span className="ml-2 text-xs bg-cyan-800/80 text-cyan-300 px-1.5 py-0.5 rounded">COMBO</span></p><p className="text-xs text-gray-400">R$ {combo.price.toFixed(2)}</p></div>
                                            <button onClick={() => handleAddCombo(combo)} className="p-2 bg-sky-600 rounded-lg hover:bg-sky-700 text-white"><Plus className="h-4 w-4"/></button>
                                        </div>
                                    ))}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default PDV;
