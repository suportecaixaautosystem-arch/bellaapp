import React, { useState, useMemo, useEffect } from 'react';
import Card from '../../components/Card';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, User, CreditCard, Percent, Tag, Calendar, Check, Printer, MessageSquare, ShoppingCart, Search, DollarSign, Briefcase } from 'lucide-react';

// Mock Data
import { appointmentApi, Appointment } from '../../data/mockAppointments';
import { initialClients } from '../../data/mockClients';
import { initialEmployees } from '../../data/mockEmployees';
import { initialServices } from '../../data/mockServices';
import { initialProducts } from '../../data/mockProducts';
import { initialPaymentMethods } from '../configurations/PaymentMethods';
import { initialServiceCombos, initialProductCombos } from '../../data/mockCombos';

type CartItem = {
    id: string;
    name: string;
    price: number;
    type: 'service' | 'product' | 'combo';
    quantity: number;
};

type Sale = {
    id: string;
    items: (CartItem & { employeeId: number })[];
    clientId?: number;
    employeeId: number;
    paymentMethod: string;
    discount: number;
    discountType: 'fixed' | 'percent';
    surcharge: number;
    surchargeType: 'fixed' | 'percent';
    subtotal: number;
    total: number;
    date: Date;
};

const PDV: React.FC = () => {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [clientId, setClientId] = useState<string>('');
    const [employeeId, setEmployeeId] = useState<string>('');
    const [isEmployeeLocked, setIsEmployeeLocked] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<string>('');
    
    const [discount, setDiscount] = useState<number>(0);
    const [discountType, setDiscountType] = useState<'fixed' | 'percent'>('fixed');
    const [surcharge, setSurcharge] = useState<number>(0);
    const [surchargeType, setSurchargeType] = useState<'fixed' | 'percent'>('fixed');

    const [activeTab, setActiveTab] = useState<'appointments' | 'services' | 'products' | 'combos'>('appointments');
    const [searchTerm, setSearchTerm] = useState('');
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
    const [lastSale, setLastSale] = useState<Sale | null>(null);
    const [appointments, setAppointments] = useState<Appointment[]>([]);

    useEffect(() => {
        appointmentApi.getAppointments().then(setAppointments);
    }, []);

    const subtotal = useMemo(() => cart.reduce((acc, item) => acc + item.price * item.quantity, 0), [cart]);
    
    const total = useMemo(() => {
        const discountAmount = discountType === 'percent' ? (subtotal * discount) / 100 : discount;
        const surchargeAmount = surchargeType === 'percent' ? (subtotal * surcharge) / 100 : surcharge;
        return subtotal - discountAmount + surchargeAmount;
    }, [subtotal, discount, discountType, surcharge, surchargeType]);

    const filteredAppointments = useMemo(() => {
        const pending = appointments.filter(apt => apt.paymentStatus === 'pendente' && apt.appointmentStatus === 'agendado');
        if (!searchTerm) return pending;
        return pending.filter(apt => {
            const client = initialClients.find(c => c.id === apt.clientId);
            return client?.name.toLowerCase().includes(searchTerm.toLowerCase());
        });
    }, [appointments, searchTerm]);

    const filteredServices = useMemo(() => {
        if (!searchTerm) return initialServices.filter(s => s.active);
        return initialServices.filter(s => s.active && s.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [searchTerm]);

    const filteredProducts = useMemo(() => {
        if (!searchTerm) return initialProducts.filter(p => p.active);
        return initialProducts.filter(p => p.active && p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [searchTerm]);
    
    const allCombos = useMemo(() => [
        ...initialServiceCombos.map(c => ({...c, type: 'service' as const})),
        ...initialProductCombos.map(c => ({...c, type: 'product' as const}))
    ], []);

    const filteredCombos = useMemo(() => {
        if (!searchTerm) return allCombos.filter(c => c.active);
        return allCombos.filter(c => c.active && c.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [allCombos, searchTerm]);

    const resetSale = () => {
        setCart([]);
        setClientId('');
        setEmployeeId('');
        setIsEmployeeLocked(false);
        setPaymentMethod('');
        setDiscount(0);
        setSurcharge(0);
        setDiscountType('fixed');
        setSurchargeType('fixed');
        setIsReceiptModalOpen(false);
        setLastSale(null);
    };

    const handleAddFromAppointment = (appointmentId: number) => {
        const appointment = appointments.find(a => a.id === appointmentId);
        if (!appointment) return;
        const service = initialServices.find(s => s.id === appointment.serviceId);
        if (!service) return;

        setClientId(appointment.clientId.toString());
        setEmployeeId(appointment.employeeId.toString());
        setIsEmployeeLocked(true);

        const newCartItem: CartItem = {
            id: `service-${service.id}-${Date.now()}`,
            name: service.name,
            price: parseFloat(service.price),
            type: 'service',
            quantity: 1,
        };
        setCart(prev => [...prev, newCartItem]);
    };

    const handleAddItem = (item: (typeof initialServices)[0] | (typeof initialProducts)[0], type: 'service' | 'product') => {
        setIsEmployeeLocked(false);
        const price = parseFloat('salePrice' in item ? item.salePrice : item.price);
        const newCartItem: CartItem = {
            id: `${type}-${item.id}-${Date.now()}`,
            name: item.name,
            price,
            type,
            quantity: 1,
        };
        setCart(prev => [...prev, newCartItem]);
    };

    const handleAddCombo = (combo: typeof allCombos[0]) => {
        setIsEmployeeLocked(false);
        const newCartItem: CartItem = {
            id: `combo-${combo.id}-${Date.now()}`,
            name: combo.name,
            price: parseFloat(combo.price),
            type: 'combo',
            quantity: 1,
        };
        setCart(prev => [...prev, newCartItem]);
    }

    const handleRemoveItem = (itemId: string) => {
        setCart(prev => prev.filter(item => item.id !== itemId));
    };

    const handleFinalizeSale = () => {
        if (cart.length === 0) { alert("O carrinho está vazio."); return; }
        if (!paymentMethod) { alert("Por favor, selecione uma forma de pagamento."); return; }
        if (!employeeId) { alert("Por favor, selecione um funcionário para a venda."); return; }

        const saleData: Sale = {
            id: `SALE-${Date.now()}`,
            items: cart.map(item => ({ ...item, employeeId: parseInt(employeeId) })),
            clientId: clientId ? parseInt(clientId) : undefined,
            employeeId: parseInt(employeeId),
            paymentMethod,
            discount,
            discountType,
            surcharge,
            surchargeType,
            subtotal,
            total,
            date: new Date(),
        };
        setLastSale(saleData);
        setIsReceiptModalOpen(true);
    };

    const ReceiptModal = () => {
        if (!lastSale) return null;
        const client = initialClients.find(c => c.id === lastSale.clientId);
        
        const generateWhatsAppMessage = () => {
            let message = `*Comprovante de Venda - BARBER & BELLA APP*\n\n`;
            message += `*Data:* ${lastSale.date.toLocaleString('pt-BR')}\n`;
            if (client) message += `*Cliente:* ${client.name}\n\n`;
            message += `*Itens:*\n`;
            lastSale.items.forEach(item => {
                message += `- ${item.name} (x${item.quantity}) - R$ ${item.price.toFixed(2)}\n`;
            });
            message += `\n*Subtotal:* R$ ${lastSale.subtotal.toFixed(2)}\n`;
            if (lastSale.discount > 0) {
                const discountText = lastSale.discountType === 'percent'
                    ? `${lastSale.discount}%`
                    : `R$ ${lastSale.discount.toFixed(2)}`;
                message += `*Desconto:* -${discountText}\n`;
            }
            if (lastSale.surcharge > 0) {
                 const surchargeText = lastSale.surchargeType === 'percent'
                    ? `${lastSale.surcharge}%`
                    : `R$ ${lastSale.surcharge.toFixed(2)}`;
                message += `*Acréscimo:* +${surchargeText}\n`;
            }
            message += `*Total Pago:* *R$ ${lastSale.total.toFixed(2)}*\n`;
            message += `*Forma de Pagamento:* ${lastSale.paymentMethod}\n\n`;
            message += `Obrigado pela preferência!`;
            return encodeURIComponent(message);
        };

        const whatsAppHref = `https://wa.me/${client?.phone.replace(/\D/g, '') || ''}?text=${generateWhatsAppMessage()}`;

        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 w-full max-w-md">
                    <div id="receipt-content" className="p-6 text-white">
                        <h2 className="text-center text-xl font-bold mb-4">BARBER & BELLA SALON</h2>
                        <p className="text-center text-xs text-gray-400 mb-6">Comprovante de Venda</p>
                        <div className="space-y-2 border-b border-dashed border-gray-700 pb-4 mb-4">
                            {lastSale.items.map(item => (
                                <div key={item.id} className="flex justify-between text-sm">
                                    <span>{item.name} (x{item.quantity})</span>
                                    <span>R$ {item.price.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-gray-400">Subtotal</span><span>R$ {lastSale.subtotal.toFixed(2)}</span></div>
                            {lastSale.discount > 0 && <div className="flex justify-between"><span className="text-gray-400">Desconto</span><span className="text-red-400">- R$ {(lastSale.discountType === 'percent' ? (lastSale.subtotal * lastSale.discount / 100) : lastSale.discount).toFixed(2)}</span></div>}
                            {lastSale.surcharge > 0 && <div className="flex justify-between"><span className="text-gray-400">Acréscimo</span><span className="text-green-400">+ R$ {(lastSale.surchargeType === 'percent' ? (lastSale.subtotal * lastSale.surcharge / 100) : lastSale.surcharge).toFixed(2)}</span></div>}
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

    const isFinalizeDisabled = cart.length === 0 || !paymentMethod || !employeeId;

    return (
        <div className="space-y-6">
            <AnimatePresence>{isReceiptModalOpen && <ReceiptModal />}</AnimatePresence>
            <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-white">Vendas / PDV</h1>
                <p className="text-gray-400 mt-1">Realize vendas de serviços e produtos</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Left Column: Cart & Payment */}
                <div className="lg:col-span-2 space-y-6 flex flex-col">
                    <Card className="flex-grow flex flex-col">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center"><ShoppingCart className="h-5 w-5 mr-2 text-cyan-400" />Itens da Venda</h2>
                        <div className="flex-grow space-y-3 pr-2 -mr-2 overflow-y-auto">
                            {cart.length > 0 ? cart.map(item => (
                                <div key={item.id} className="bg-gray-800 p-3 rounded-lg animate-in fade-in-50">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-white">{item.name}</p>
                                            <p className="text-xs text-gray-400">R$ {item.price.toFixed(2)}</p>
                                        </div>
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
                            {initialClients.filter(c => c.active).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </Card>

                    <Card>
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center"><Briefcase className="h-5 w-5 mr-2 text-cyan-400" />Funcionário</h2>
                        <select 
                            value={employeeId} 
                            onChange={e => setEmployeeId(e.target.value)} 
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500"
                            disabled={isEmployeeLocked}
                        >
                            <option value="">Selecione o funcionário...</option>
                            {initialEmployees.filter(e => e.active).map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.name}</option>
                            ))}
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
                            <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500">
                                <option value="">Selecione a forma de pagamento...</option>
                                {initialPaymentMethods.filter(p => p.active).map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                            </select>
                        </div>
                        <button onClick={handleFinalizeSale} disabled={isFinalizeDisabled} className="w-full mt-6 bg-gradient-to-r from-sky-600 to-cyan-500 text-white py-3 rounded-lg font-bold hover:from-sky-700 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed">Finalizar Venda</button>
                    </Card>
                </div>

                {/* Right Column: Add Items */}
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
                                    {activeTab === 'appointments' && (filteredAppointments.length > 0 ? filteredAppointments.map(apt => {
                                        const client = initialClients.find(c => c.id === apt.clientId);
                                        const service = initialServices.find(s => s.id === apt.serviceId);
                                        return (
                                        <div key={apt.id} className="flex items-center justify-between p-3 mb-2 bg-gray-800 rounded-lg">
                                            <div><p className="text-sm text-white">{client?.name}</p><p className="text-xs text-gray-400">{service?.name}</p></div>
                                            <button onClick={() => handleAddFromAppointment(apt.id)} className="p-2 bg-sky-600 rounded-lg hover:bg-sky-700 text-white"><Plus className="h-4 w-4"/></button>
                                        </div>
                                    )}) : <p className="text-center text-gray-500 py-8">Nenhum agendamento pendente.</p>)}
                                    
                                    {activeTab === 'services' && filteredServices.map(service => (
                                        <div key={service.id} className="flex items-center justify-between p-3 mb-2 bg-gray-800 rounded-lg">
                                            <div><p className="text-sm text-white">{service.name}</p><p className="text-xs text-gray-400">R$ {service.price}</p></div>
                                            <button onClick={() => handleAddItem(service, 'service')} className="p-2 bg-sky-600 rounded-lg hover:bg-sky-700 text-white"><Plus className="h-4 w-4"/></button>
                                        </div>
                                    ))}
                                    
                                    {activeTab === 'products' && filteredProducts.map(product => (
                                        <div key={product.id} className="flex items-center justify-between p-3 mb-2 bg-gray-800 rounded-lg">
                                            <div><p className="text-sm text-white">{product.name}</p><p className="text-xs text-gray-400">R$ {product.salePrice}</p></div>
                                            <button onClick={() => handleAddItem(product, 'product')} className="p-2 bg-sky-600 rounded-lg hover:bg-sky-700 text-white"><Plus className="h-4 w-4"/></button>
                                        </div>
                                    ))}

                                    {activeTab === 'combos' && filteredCombos.map(combo => (
                                        <div key={`${combo.type}-${combo.id}`} className="flex items-center justify-between p-3 mb-2 bg-gray-800 rounded-lg">
                                            <div>
                                                <p className="text-sm text-white flex items-center">{combo.name} <span className="ml-2 text-xs bg-cyan-800/80 text-cyan-300 px-1.5 py-0.5 rounded">COMBO</span></p>
                                                <p className="text-xs text-gray-400">R$ {combo.price}</p>
                                            </div>
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
