import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import { Plus, Search, Edit, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { initialClients as mockClients } from '../../data/mockClients';

interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  active: boolean;
}

const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [newClient, setNewClient] = useState({ name: '', email: '', phone: '' });
  const [errors, setErrors] = useState({ name: '', phone: '' });

  useEffect(() => {
    if (editingClient) {
      setNewClient({ name: editingClient.name, email: editingClient.email, phone: editingClient.phone });
    } else {
      setNewClient({ name: '', email: '', phone: '' });
    }
  }, [editingClient]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewClient(prevState => ({ ...prevState, [name]: value }));
    if (value) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = { name: '', phone: '' };
    let isValid = true;
    if (!newClient.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
      isValid = false;
    }
    if (!newClient.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
      isValid = false;
    }
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingClient) {
      setClients(clients.map(c => c.id === editingClient.id ? { ...editingClient, ...newClient } : c));
    } else {
      const clientToAdd: Client = { id: Date.now(), ...newClient, active: true };
      setClients(prevClients => [clientToAdd, ...prevClients]);
    }
    closeModal();
  };
  
  const handleToggleActive = (id: number) => {
    setClients(clients.map(c => c.id === id ? { ...c, active: !c.active } : c));
  };
  
  const handleDelete = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.')) {
      setClients(clients.filter(c => c.id !== id));
    }
  };

  const openModal = (client: Client | null = null) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
    setNewClient({ name: '', email: '', phone: '' });
    setErrors({ name: '', phone: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Clientes</h1>
          <p className="text-gray-400 mt-1">Gerencie sua base de clientes</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-gradient-to-r from-sky-600 to-cyan-500 text-white px-6 py-3 rounded-lg hover:from-sky-700 hover:to-cyan-600 transition-all duration-200 flex items-center space-x-2 shadow-lg"
        >
          <Plus className="h-5 w-5" />
          <span>Novo Cliente</span>
        </button>
      </div>

      <Card>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar clientes..."
            className="pl-10 pr-4 py-2 w-full bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="p-4 text-sm font-medium text-gray-400">Nome</th>
                <th className="p-4 text-sm font-medium text-gray-400">Email</th>
                <th className="p-4 text-sm font-medium text-gray-400">Telefone</th>
                <th className="p-4 text-sm font-medium text-gray-400">Ativo / Inativo</th>
                <th className="p-4 text-sm font-medium text-gray-400 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className={`border-b border-gray-800 hover:bg-gray-800/50 ${!client.active ? 'opacity-50' : ''}`}>
                  <td className="p-4 text-white">{client.name}</td>
                  <td className="p-4 text-white">{client.email}</td>
                  <td className="p-4 text-white">{client.phone}</td>
                  <td className="p-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={client.active} onChange={() => handleToggleActive(client.id)} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                    </label>
                  </td>
                  <td className="p-4 text-white">
                    <div className="flex justify-end space-x-2">
                      <button onClick={() => openModal(client)} className="p-2 hover:bg-gray-700 rounded-lg"><Edit className="h-4 w-4 text-blue-400" /></button>
                      <button onClick={() => handleDelete(client.id)} className="p-2 hover:bg-gray-700 rounded-lg"><Trash2 className="h-4 w-4 text-red-500" /></button>
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-800">
                <h2 className="text-lg font-semibold text-white">{editingClient ? 'Editar Cliente' : 'Adicionar Novo Cliente'}</h2>
                <button onClick={closeModal} className="p-2 rounded-full hover:bg-gray-700">
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Nome <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="name"
                    value={newClient.name}
                    onChange={handleInputChange}
                    placeholder="Nome completo do cliente"
                    className={`w-full bg-gray-800 border rounded-lg px-3 py-2 focus:ring-2 focus:border-transparent text-white ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-cyan-500'}`}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={newClient.email}
                    onChange={handleInputChange}
                    placeholder="email@example.com"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Telefone <span className="text-red-500">*</span></label>
                  <input
                    type="tel"
                    name="phone"
                    value={newClient.phone}
                    onChange={handleInputChange}
                    placeholder="(00) 90000-0000"
                    className={`w-full bg-gray-800 border rounded-lg px-3 py-2 focus:ring-2 focus:border-transparent text-white ${errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-cyan-500'}`}
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="bg-gray-700 text-gray-300 px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-sky-600 to-cyan-500 text-white px-6 py-2 rounded-lg hover:from-sky-700 hover:to-cyan-600 transition-all"
                  >
                    {editingClient ? 'Salvar Alterações' : 'Salvar Cliente'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Clients;
