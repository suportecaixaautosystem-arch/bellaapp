import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import { Plus, Search, Edit, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import { Tables, TablesInsert, TablesUpdate } from '../../types/database.types';
import { phoneMask } from '../../utils/validators';
import { useAuth } from '../../contexts/AuthContext';

type Client = Tables<'clients'>;

const Clients: React.FC = () => {
  const { profile } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  
  const [formState, setFormState] = useState<Omit<TablesInsert<'clients'>, 'id' | 'company_id' | 'created_at' | 'updated_at' | 'is_active'>>({ name: '', email: '', phone: '' });
  const [errors, setErrors] = useState({ name: '', phone: '' });

  const canEditOrDelete = profile?.role === 'admin' || profile?.role === 'manager';

  const fetchClients = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching clients:', error.message);
      alert('Erro ao buscar clientes.');
    } else {
      setClients(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (editingClient) {
      setFormState({ name: editingClient.name, email: editingClient.email, phone: editingClient.phone });
    } else {
      setFormState({ name: '', email: '', phone: '' });
    }
  }, [editingClient]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const maskedValue = name === 'phone' ? phoneMask(value) : value;
    setFormState(prevState => ({ ...prevState, [name]: maskedValue }));
    if (value) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = { name: '', phone: '' };
    let isValid = true;
    if (!formState.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
      isValid = false;
    }
    const phoneDigits = formState.phone?.replace(/\D/g, '') || '';
    if (phoneDigits.length < 10) {
      newErrors.phone = 'Telefone inválido. Deve ter no mínimo 10 dígitos.';
      isValid = false;
    }
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const clientData = { ...formState, company_id: 1 }; // Assuming company_id 1

    if (editingClient) {
      if (!canEditOrDelete) { alert("Você não tem permissão para editar."); return; }
      const { error } = await supabase.from('clients').update(clientData).eq('id', editingClient.id);
      if (error) {
        alert(`Erro ao atualizar cliente: ${error.message}`);
      }
    } else {
      const { error } = await supabase.from('clients').insert(clientData);
      if (error) {
        alert(`Erro ao criar cliente: ${error.message}`);
      }
    }
    closeModal();
    fetchClients();
  };
  
  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    if (!canEditOrDelete) { alert("Você não tem permissão para alterar o status."); return; }
    const { error } = await supabase.from('clients').update({ is_active: !currentStatus }).eq('id', id);
    if (error) {
      alert(`Erro ao alterar status: ${error.message}`);
    } else {
      fetchClients();
    }
  };
  
  const handleDelete = async (id: number) => {
    if (!canEditOrDelete) { alert("Você não tem permissão para excluir."); return; }
    if (window.confirm('Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.')) {
      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (error) {
        alert(`Erro ao excluir cliente: ${error.message}`);
      } else {
        fetchClients();
      }
    }
  };

  const openModal = (client: Client | null = null) => {
    if (client && !canEditOrDelete) { alert("Você não tem permissão para editar."); return; }
    setEditingClient(client);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
    setFormState({ name: '', email: '', phone: '' });
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
        {loading ? <p>Carregando clientes...</p> : (
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
                <tr key={client.id} className={`border-b border-gray-800 hover:bg-gray-800/50 ${!client.is_active ? 'opacity-50' : ''}`}>
                  <td className="p-4 text-white">{client.name}</td>
                  <td className="p-4 text-white">{client.email}</td>
                  <td className="p-4 text-white">{client.phone}</td>
                  <td className="p-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={client.is_active ?? false} onChange={() => handleToggleActive(client.id, client.is_active ?? false)} disabled={!canEditOrDelete} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                    </label>
                  </td>
                  <td className="p-4 text-white">
                    <div className="flex justify-end space-x-2">
                      {canEditOrDelete && (
                        <>
                          <button onClick={() => openModal(client)} className="p-2 hover:bg-gray-700 rounded-lg"><Edit className="h-4 w-4 text-blue-400" /></button>
                          <button onClick={() => handleDelete(client.id)} className="p-2 hover:bg-gray-700 rounded-lg"><Trash2 className="h-4 w-4 text-red-500" /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
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
                    value={formState.name}
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
                    value={formState.email ?? ''}
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
                    value={formState.phone ?? ''}
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
