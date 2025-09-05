import React, { useState, useEffect, useMemo } from 'react';
import Card from '../../components/Card';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import { Tables, TablesInsert } from '../../types/database.types';
import { useAuth } from '../../contexts/AuthContext';

type Service = Tables<'services'>;
type ServiceCombo = Tables<'service_combos'>;
type ServiceComboItem = {
  combo_id: number;
  service_id: number;
};

const Services: React.FC = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'services' | 'combos'>('services');
  
  // Services State
  const [services, setServices] = useState<Service[]>([]);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [newService, setNewService] = useState<Omit<TablesInsert<'services'>, 'id' | 'company_id' | 'created_at' | 'updated_at' | 'is_active'>>({ name: '', duration_minutes: 30, price: 0 });
  const [serviceErrors, setServiceErrors] = useState({ name: '', duration_minutes: '', price: '' });
  const [loadingServices, setLoadingServices] = useState(true);

  // Combos State
  const [combos, setCombos] = useState<(ServiceCombo & { service_combo_items: ServiceComboItem[] })[]>([]);
  const [isComboModalOpen, setIsComboModalOpen] = useState(false);
  const [editingCombo, setEditingCombo] = useState<(ServiceCombo & { service_combo_items: ServiceComboItem[] }) | null>(null);
  const [newCombo, setNewCombo] = useState<{ name: string; price: number; serviceIds: number[] }>({ name: '', price: 0, serviceIds: [] });
  const [comboErrors, setComboErrors] = useState({ name: '', price: '', serviceIds: '' });
  const [loadingCombos, setLoadingCombos] = useState(true);

  const canEditOrDelete = profile?.role === 'admin' || profile?.role === 'manager';

  const fetchServices = async () => {
    setLoadingServices(true);
    const { data, error } = await supabase.from('services').select('*').order('name');
    if (error) console.error('Error fetching services:', error);
    else setServices(data || []);
    setLoadingServices(false);
  };

  const fetchCombos = async () => {
    setLoadingCombos(true);
    const { data, error } = await supabase.from('service_combos').select('*, service_combo_items(*)').order('name');
    if (error) console.error('Error fetching combos:', error);
    else setCombos(data || []);
    setLoadingCombos(false);
  };

  useEffect(() => {
    fetchServices();
    fetchCombos();
  }, []);

  // --- Services Logic ---
  useEffect(() => {
    if (editingService) setNewService({ name: editingService.name, duration_minutes: editingService.duration_minutes, price: editingService.price });
    else setNewService({ name: '', duration_minutes: 30, price: 0 });
  }, [editingService]);

  const validateServiceForm = () => {
    const errors = { name: '', duration_minutes: '', price: '' };
    if (!newService.name) errors.name = 'Nome é obrigatório.';
    if (!newService.duration_minutes || newService.duration_minutes <= 0) errors.duration_minutes = 'Duração deve ser maior que zero.';
    if (newService.price < 0) errors.price = 'Preço não pode ser negativo.';
    setServiceErrors(errors);
    return !errors.name && !errors.duration_minutes && !errors.price;
  };

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateServiceForm()) return;
    
    const serviceData = { ...newService, company_id: 1 };

    if (editingService) {
      if (!canEditOrDelete) { alert("Você não tem permissão para editar."); return; }
      const { error } = await supabase.from('services').update(serviceData).eq('id', editingService.id);
      if (error) alert(`Erro ao atualizar serviço: ${error.message}`);
    } else {
      const { error } = await supabase.from('services').insert(serviceData);
      if (error) alert(`Erro ao criar serviço: ${error.message}`);
    }
    closeServiceModal();
    fetchServices();
  };

  const handleDeleteService = async (id: number) => {
    if (!canEditOrDelete) { alert("Você não tem permissão para excluir."); return; }
    if (window.confirm('Tem certeza que deseja excluir este serviço?')) {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) alert(`Erro ao excluir serviço: ${error.message}`);
      else fetchServices();
    }
  };

  const handleToggleServiceActive = async (id: number, currentStatus: boolean) => {
    if (!canEditOrDelete) { alert("Você não tem permissão para alterar o status."); return; }
    const { error } = await supabase.from('services').update({ is_active: !currentStatus }).eq('id', id);
    if (error) alert(`Erro ao alterar status: ${error.message}`);
    else fetchServices();
  };

  const openServiceModal = (service: Service | null = null) => {
    if (service && !canEditOrDelete) { alert("Você não tem permissão para editar."); return; }
    setEditingService(service);
    setIsServiceModalOpen(true);
  };

  const closeServiceModal = () => {
    setIsServiceModalOpen(false);
    setEditingService(null);
  };

  // --- Combos Logic ---
  useEffect(() => {
    if (editingCombo) setNewCombo({ name: editingCombo.name, price: editingCombo.price, serviceIds: editingCombo.service_combo_items.map(i => i.service_id) });
    else setNewCombo({ name: '', price: 0, serviceIds: [] });
  }, [editingCombo]);

  const validateComboForm = () => {
    const errors = { name: '', price: '', serviceIds: '' };
    if (!newCombo.name) errors.name = 'Nome do combo é obrigatório.';
    if (newCombo.price <= 0) errors.price = 'Preço deve ser maior que zero.';
    if (newCombo.serviceIds.length < 2) errors.serviceIds = 'Selecione ao menos 2 serviços.';
    setComboErrors(errors);
    return !errors.name && !errors.price && !errors.serviceIds;
  };

  const handleComboSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateComboForm()) return;

    if (editingCombo) {
      if (!canEditOrDelete) { alert("Você não tem permissão para editar."); return; }
      alert("Edição de combos ainda não implementada.");
    } else {
      const { data: comboData, error: comboError } = await supabase
        .from('service_combos')
        .insert({ name: newCombo.name, price: newCombo.price, company_id: 1 })
        .select()
        .single();
      
      if (comboError || !comboData) {
        alert(`Erro ao criar combo: ${comboError?.message}`);
        return;
      }

      const itemsToInsert = newCombo.serviceIds.map(service_id => ({
        combo_id: comboData.id,
        service_id: service_id
      }));

      const { error: itemsError } = await supabase.from('service_combo_items').insert(itemsToInsert);

      if (itemsError) {
        alert(`Erro ao adicionar serviços ao combo: ${itemsError.message}`);
        await supabase.from('service_combos').delete().eq('id', comboData.id);
      }
    }
    closeComboModal();
    fetchCombos();
  };
  
  const handleComboServiceSelection = (serviceId: number) => {
    setNewCombo(prev => {
      const newServiceIds = prev.serviceIds.includes(serviceId)
        ? prev.serviceIds.filter(id => id !== serviceId)
        : [...prev.serviceIds, serviceId];
      return { ...prev, serviceIds: newServiceIds };
    });
  };

  const handleDeleteCombo = async (id: number) => {
    if (!canEditOrDelete) { alert("Você não tem permissão para excluir."); return; }
    if (window.confirm('Tem certeza que deseja excluir este combo?')) {
      await supabase.from('service_combo_items').delete().eq('combo_id', id);
      const { error } = await supabase.from('service_combos').delete().eq('id', id);
      if (error) alert(`Erro ao excluir combo: ${error.message}`);
      else fetchCombos();
    }
  };

  const handleToggleComboActive = async (id: number, currentStatus: boolean) => {
    if (!canEditOrDelete) { alert("Você não tem permissão para alterar o status."); return; }
    const { error } = await supabase.from('service_combos').update({ is_active: !currentStatus }).eq('id', id);
    if (error) alert(`Erro ao alterar status: ${error.message}`);
    else fetchCombos();
  };

  const openComboModal = (combo: (ServiceCombo & { service_combo_items: ServiceComboItem[] }) | null = null) => {
    if (combo && !canEditOrDelete) { alert("Você não tem permissão para editar."); return; }
    setEditingCombo(combo);
    setIsComboModalOpen(true);
  };

  const closeComboModal = () => {
    setIsComboModalOpen(false);
    setEditingCombo(null);
  };

  const comboTotalDuration = useMemo(() => {
    return newCombo.serviceIds.reduce((total, id) => {
      const service = services.find(s => s.id === id);
      return total + (service?.duration_minutes || 0);
    }, 0);
  }, [newCombo.serviceIds, services]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Serviços e Combos</h1>
          <p className="text-gray-400 mt-1">Gerencie os serviços e pacotes oferecidos</p>
        </div>
        <button 
          onClick={() => activeTab === 'services' ? openServiceModal() : openComboModal()}
          className="bg-gradient-to-r from-sky-600 to-cyan-500 text-white px-6 py-3 rounded-lg hover:from-sky-700 hover:to-cyan-600 transition-all duration-200 flex items-center space-x-2 shadow-lg"
        >
          <Plus className="h-5 w-5" />
          <span>{activeTab === 'services' ? 'Novo Serviço' : 'Novo Combo'}</span>
        </button>
      </div>

      <div className="border-b border-gray-800">
        <nav className="-mb-px flex space-x-6">
          <button onClick={() => setActiveTab('services')} className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'services' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'}`}>Serviços Individuais</button>
          <button onClick={() => setActiveTab('combos')} className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'combos' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'}`}>Combos</button>
        </nav>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
          {activeTab === 'services' ? (
            <Card>
              {loadingServices ? <p>Carregando serviços...</p> : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead><tr className="border-b border-gray-800"><th className="p-4 text-sm font-medium text-gray-400">Serviço</th><th className="p-4 text-sm font-medium text-gray-400">Duração</th><th className="p-4 text-sm font-medium text-gray-400">Preço (R$)</th><th className="p-4 text-sm font-medium text-gray-400">Status</th><th className="p-4 text-sm font-medium text-gray-400 text-right">Ações</th></tr></thead>
                  <tbody>{services.map((service) => (<tr key={service.id} className={`border-b border-gray-800 hover:bg-gray-800/50 ${!service.is_active ? 'opacity-50' : ''}`}><td className="p-4 text-white">{service.name}</td><td className="p-4 text-white">{service.duration_minutes} min</td><td className="p-4 text-white">{service.price.toFixed(2)}</td><td className="p-4"><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={service.is_active ?? false} onChange={() => handleToggleServiceActive(service.id, service.is_active ?? false)} disabled={!canEditOrDelete} className="sr-only peer" /><div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div></label></td><td className="p-4 text-white">{canEditOrDelete && (<div className="flex justify-end space-x-2"><button onClick={() => openServiceModal(service)} className="p-2 hover:bg-gray-700 rounded-lg"><Edit className="h-4 w-4 text-blue-400" /></button><button onClick={() => handleDeleteService(service.id)} className="p-2 hover:bg-gray-700 rounded-lg"><Trash2 className="h-4 w-4 text-red-500" /></button></div>)}</td></tr>))}</tbody>
                </table>
              </div>
              )}
            </Card>
          ) : (
            <Card>
              {loadingCombos ? <p>Carregando combos...</p> : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead><tr className="border-b border-gray-800"><th className="p-4 text-sm font-medium text-gray-400">Nome do Combo</th><th className="p-4 text-sm font-medium text-gray-400">Serviços Inclusos</th><th className="p-4 text-sm font-medium text-gray-400">Preço (R$)</th><th className="p-4 text-sm font-medium text-gray-400">Status</th><th className="p-4 text-sm font-medium text-gray-400 text-right">Ações</th></tr></thead>
                  <tbody>{combos.map((combo) => (<tr key={combo.id} className={`border-b border-gray-800 hover:bg-gray-800/50 ${!combo.is_active ? 'opacity-50' : ''}`}><td className="p-4 text-white font-medium">{combo.name}</td><td className="p-4 text-gray-300 text-xs">{combo.service_combo_items.map(item => services.find(s=>s.id === item.service_id)?.name).join(', ')}</td><td className="p-4 text-green-400">{combo.price.toFixed(2)}</td><td className="p-4"><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={combo.is_active ?? false} onChange={() => handleToggleComboActive(combo.id, combo.is_active ?? false)} disabled={!canEditOrDelete} className="sr-only peer" /><div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div></label></td><td className="p-4 text-white">{canEditOrDelete && (<div className="flex justify-end space-x-2"><button onClick={() => openComboModal(combo)} className="p-2 hover:bg-gray-700 rounded-lg"><Edit className="h-4 w-4 text-blue-400" /></button><button onClick={() => handleDeleteCombo(combo.id)} className="p-2 hover:bg-gray-700 rounded-lg"><Trash2 className="h-4 w-4 text-red-500" /></button></div>)}</td></tr>))}</tbody>
                </table>
              </div>
              )}
            </Card>
          )}
        </motion.div>
      </AnimatePresence>
      
      {/* Service Modal */}
       <AnimatePresence>
        {isServiceModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4" onClick={closeServiceModal}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-6 border-b border-gray-800"><h2 className="text-lg font-semibold text-white">{editingService ? 'Editar Serviço' : 'Novo Serviço'}</h2><button onClick={closeServiceModal} className="p-2 rounded-full hover:bg-gray-700"><X className="h-5 w-5 text-gray-400" /></button></div>
              <form onSubmit={handleServiceSubmit} className="p-6 space-y-4">
                <div><label className="block text-sm font-medium text-gray-400 mb-2">Nome do Serviço</label><input type="text" value={newService.name} onChange={(e) => setNewService({...newService, name: e.target.value})} className={`w-full bg-gray-800 border rounded-lg px-3 py-2 text-white ${serviceErrors.name ? 'border-red-500' : 'border-gray-700'}`} />{serviceErrors.name && <p className="text-xs text-red-500 mt-1">{serviceErrors.name}</p>}</div>
                <div><label className="block text-sm font-medium text-gray-400 mb-2">Duração (minutos)</label><input type="number" value={newService.duration_minutes} onChange={(e) => setNewService({...newService, duration_minutes: parseInt(e.target.value) || 0})} className={`w-full bg-gray-800 border rounded-lg px-3 py-2 text-white ${serviceErrors.duration_minutes ? 'border-red-500' : 'border-gray-700'}`} />{serviceErrors.duration_minutes && <p className="text-xs text-red-500 mt-1">{serviceErrors.duration_minutes}</p>}</div>
                <div><label className="block text-sm font-medium text-gray-400 mb-2">Preço (R$)</label><input type="number" step="0.01" value={newService.price} onChange={(e) => setNewService({...newService, price: parseFloat(e.target.value) || 0})} className={`w-full bg-gray-800 border rounded-lg px-3 py-2 text-white ${serviceErrors.price ? 'border-red-500' : 'border-gray-700'}`} />{serviceErrors.price && <p className="text-xs text-red-500 mt-1">{serviceErrors.price}</p>}</div>
                <div className="flex justify-end space-x-4 pt-4"><button type="button" onClick={closeServiceModal} className="bg-gray-700 text-gray-300 px-6 py-2 rounded-lg hover:bg-gray-600">Cancelar</button><button type="submit" className="bg-gradient-to-r from-sky-600 to-cyan-500 text-white px-6 py-2 rounded-lg hover:from-sky-700 hover:to-cyan-600">{editingService ? 'Salvar Alterações' : 'Salvar Serviço'}</button></div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Combo Modal */}
      <AnimatePresence>
        {isComboModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4" onClick={closeComboModal}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20, opacity: 0 }} className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-6 border-b border-gray-800"><h2 className="text-lg font-semibold text-white">{editingCombo ? 'Editar Combo' : 'Novo Combo de Serviços'}</h2><button onClick={closeComboModal} className="p-2 rounded-full hover:bg-gray-700"><X className="h-5 w-5 text-gray-400" /></button></div>
              <form onSubmit={handleComboSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div><label className="block text-sm font-medium text-gray-400 mb-2">Nome do Combo</label><input type="text" name="name" value={newCombo.name} onChange={(e) => setNewCombo({...newCombo, name: e.target.value})} placeholder="Ex: Cabelo + Barba" className={`w-full bg-gray-800 border rounded-lg px-3 py-2 text-white ${comboErrors.name ? 'border-red-500' : 'border-gray-700'}`} />{comboErrors.name && <p className="text-red-500 text-xs mt-1">{comboErrors.name}</p>}</div>
                  <div><label className="block text-sm font-medium text-gray-400 mb-2">Preço Promocional (R$)</label><input type="number" step="0.01" name="price" value={newCombo.price} onChange={(e) => setNewCombo({...newCombo, price: parseFloat(e.target.value) || 0})} placeholder="60.00" className={`w-full bg-gray-800 border rounded-lg px-3 py-2 text-white ${comboErrors.price ? 'border-red-500' : 'border-gray-700'}`} />{comboErrors.price && <p className="text-red-500 text-xs mt-1">{comboErrors.price}</p>}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Selecione os Serviços</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto p-3 bg-gray-950 rounded-lg border border-gray-800">
                    {services.filter(s => s.is_active).map(service => (
                      <label key={service.id} className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-all ${newCombo.serviceIds.includes(service.id) ? 'bg-sky-800/80' : 'bg-gray-800 hover:bg-gray-700'}`}>
                        <input type="checkbox" checked={newCombo.serviceIds.includes(service.id)} onChange={() => handleComboServiceSelection(service.id)} className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-600" />
                        <span className="text-sm text-white">{service.name}</span>
                      </label>
                    ))}
                  </div>
                  {comboErrors.serviceIds && <p className="text-red-500 text-xs mt-1">{comboErrors.serviceIds}</p>}
                  <p className="text-xs text-gray-400 mt-2">Duração total do combo: <span className="font-bold text-white">{comboTotalDuration} min</span></p>
                </div>
                <div className="flex justify-end space-x-4 pt-4"><button type="button" onClick={closeComboModal} className="bg-gray-700 text-gray-300 px-6 py-2 rounded-lg hover:bg-gray-600">Cancelar</button><button type="submit" className="bg-gradient-to-r from-sky-600 to-cyan-500 text-white px-6 py-2 rounded-lg hover:from-sky-700 hover:to-cyan-600">{editingCombo ? 'Salvar Alterações' : 'Salvar Combo'}</button></div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Services;
