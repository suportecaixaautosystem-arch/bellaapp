import React, { useState, useEffect, useMemo } from 'react';
import Card from '../../components/Card';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { initialServices as mockServices, Service } from '../../data/mockServices';
import { initialServiceCombos as mockCombos, ServiceCombo } from '../../data/mockCombos';

const Services: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'services' | 'combos'>('services');
  
  // Services State
  const [services, setServices] = useState<Service[]>(mockServices);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [newService, setNewService] = useState({ name: '', duration: '', price: '' });
  const [serviceErrors, setServiceErrors] = useState({ name: '', duration: '', price: '' });

  // Combos State
  const [combos, setCombos] = useState<ServiceCombo[]>(mockCombos);
  const [isComboModalOpen, setIsComboModalOpen] = useState(false);
  const [editingCombo, setEditingCombo] = useState<ServiceCombo | null>(null);
  const [newCombo, setNewCombo] = useState({ name: '', price: '', serviceIds: [] as number[] });
  const [comboErrors, setComboErrors] = useState({ name: '', price: '', serviceIds: '' });

  // --- Services Logic ---
  useEffect(() => {
    if (editingService) setNewService({ name: editingService.name, duration: editingService.duration, price: editingService.price });
    else setNewService({ name: '', duration: '', price: '' });
  }, [editingService]);

  const validateServiceForm = () => {
    const errors = { name: '', duration: '', price: '' };
    if (!newService.name) errors.name = 'Nome é obrigatório.';
    if (!newService.duration || !/^\d+\smin$/.test(newService.duration)) errors.duration = 'Duração inválida (ex: 30 min).';
    if (!newService.price || isNaN(parseFloat(newService.price))) errors.price = 'Preço inválido.';
    setServiceErrors(errors);
    return !errors.name && !errors.duration && !errors.price;
  };

  const handleServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateServiceForm()) return;
    if (editingService) {
      setServices(services.map(s => s.id === editingService.id ? { ...editingService, ...newService } : s));
    } else {
      setServices(prev => [{ id: Date.now(), ...newService, active: true }, ...prev]);
    }
    closeServiceModal();
  };

  const handleDeleteService = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este serviço?')) {
      setServices(services.filter(s => s.id !== id));
    }
  };

  const handleToggleServiceActive = (id: number) => {
    setServices(services.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const openServiceModal = (service: Service | null = null) => {
    setEditingService(service);
    setIsServiceModalOpen(true);
  };

  const closeServiceModal = () => {
    setIsServiceModalOpen(false);
    setEditingService(null);
    setNewService({ name: '', duration: '', price: '' });
    setServiceErrors({ name: '', duration: '', price: '' });
  };

  // --- Combos Logic ---
  useEffect(() => {
    if (editingCombo) setNewCombo({ name: editingCombo.name, price: editingCombo.price, serviceIds: editingCombo.serviceIds });
    else setNewCombo({ name: '', price: '', serviceIds: [] });
  }, [editingCombo]);

  const validateComboForm = () => {
    const errors = { name: '', price: '', serviceIds: '' };
    if (!newCombo.name) errors.name = 'Nome do combo é obrigatório.';
    if (!newCombo.price || isNaN(parseFloat(newCombo.price))) errors.price = 'Preço inválido.';
    if (newCombo.serviceIds.length < 2) errors.serviceIds = 'Selecione ao menos 2 serviços.';
    setComboErrors(errors);
    return !errors.name && !errors.price && !errors.serviceIds;
  };

  const handleComboSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateComboForm()) return;
    if (editingCombo) {
      setCombos(combos.map(c => c.id === editingCombo.id ? { ...editingCombo, ...newCombo } : c));
    } else {
      setCombos(prev => [{ id: Date.now(), ...newCombo, active: true }, ...prev]);
    }
    closeComboModal();
  };
  
  const handleComboServiceSelection = (serviceId: number) => {
    setNewCombo(prev => {
      const newServiceIds = prev.serviceIds.includes(serviceId)
        ? prev.serviceIds.filter(id => id !== serviceId)
        : [...prev.serviceIds, serviceId];
      return { ...prev, serviceIds: newServiceIds };
    });
  };

  const handleDeleteCombo = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este combo?')) {
      setCombos(combos.filter(c => c.id !== id));
    }
  };

  const handleToggleComboActive = (id: number) => {
    setCombos(combos.map(c => c.id === id ? { ...c, active: !c.active } : c));
  };

  const openComboModal = (combo: ServiceCombo | null = null) => {
    setEditingCombo(combo);
    setIsComboModalOpen(true);
  };

  const closeComboModal = () => {
    setIsComboModalOpen(false);
    setEditingCombo(null);
    setNewCombo({ name: '', price: '', serviceIds: [] });
    setComboErrors({ name: '', price: '', serviceIds: '' });
  };

  const comboTotalDuration = useMemo(() => {
    return newCombo.serviceIds.reduce((total, id) => {
      const service = services.find(s => s.id === id);
      const duration = service ? parseInt(service.duration.split(' ')[0]) : 0;
      return total + duration;
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
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead><tr className="border-b border-gray-800"><th className="p-4 text-sm font-medium text-gray-400">Serviço</th><th className="p-4 text-sm font-medium text-gray-400">Duração</th><th className="p-4 text-sm font-medium text-gray-400">Preço (R$)</th><th className="p-4 text-sm font-medium text-gray-400">Status</th><th className="p-4 text-sm font-medium text-gray-400 text-right">Ações</th></tr></thead>
                  <tbody>{services.map((service) => (<tr key={service.id} className={`border-b border-gray-800 hover:bg-gray-800/50 ${!service.active ? 'opacity-50' : ''}`}><td className="p-4 text-white">{service.name}</td><td className="p-4 text-white">{service.duration}</td><td className="p-4 text-white">{service.price}</td><td className="p-4"><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={service.active} onChange={() => handleToggleServiceActive(service.id)} className="sr-only peer" /><div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div></label></td><td className="p-4 text-white"><div className="flex justify-end space-x-2"><button onClick={() => openServiceModal(service)} className="p-2 hover:bg-gray-700 rounded-lg"><Edit className="h-4 w-4 text-blue-400" /></button><button onClick={() => handleDeleteService(service.id)} className="p-2 hover:bg-gray-700 rounded-lg"><Trash2 className="h-4 w-4 text-red-500" /></button></div></td></tr>))}</tbody>
                </table>
              </div>
            </Card>
          ) : (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead><tr className="border-b border-gray-800"><th className="p-4 text-sm font-medium text-gray-400">Nome do Combo</th><th className="p-4 text-sm font-medium text-gray-400">Serviços Inclusos</th><th className="p-4 text-sm font-medium text-gray-400">Preço (R$)</th><th className="p-4 text-sm font-medium text-gray-400">Status</th><th className="p-4 text-sm font-medium text-gray-400 text-right">Ações</th></tr></thead>
                  <tbody>{combos.map((combo) => (<tr key={combo.id} className={`border-b border-gray-800 hover:bg-gray-800/50 ${!combo.active ? 'opacity-50' : ''}`}><td className="p-4 text-white font-medium">{combo.name}</td><td className="p-4 text-gray-300 text-xs">{combo.serviceIds.map(id => services.find(s=>s.id === id)?.name).join(', ')}</td><td className="p-4 text-green-400">{combo.price}</td><td className="p-4"><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={combo.active} onChange={() => handleToggleComboActive(combo.id)} className="sr-only peer" /><div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div></label></td><td className="p-4 text-white"><div className="flex justify-end space-x-2"><button onClick={() => openComboModal(combo)} className="p-2 hover:bg-gray-700 rounded-lg"><Edit className="h-4 w-4 text-blue-400" /></button><button onClick={() => handleDeleteCombo(combo.id)} className="p-2 hover:bg-gray-700 rounded-lg"><Trash2 className="h-4 w-4 text-red-500" /></button></div></td></tr>))}</tbody>
                </table>
              </div>
            </Card>
          )}
        </motion.div>
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
                  <div><label className="block text-sm font-medium text-gray-400 mb-2">Preço Promocional (R$)</label><input type="text" name="price" value={newCombo.price} onChange={(e) => setNewCombo({...newCombo, price: e.target.value})} placeholder="60,00" className={`w-full bg-gray-800 border rounded-lg px-3 py-2 text-white ${comboErrors.price ? 'border-red-500' : 'border-gray-700'}`} />{comboErrors.price && <p className="text-red-500 text-xs mt-1">{comboErrors.price}</p>}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Selecione os Serviços</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto p-3 bg-gray-950 rounded-lg border border-gray-800">
                    {services.filter(s => s.active).map(service => (
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
