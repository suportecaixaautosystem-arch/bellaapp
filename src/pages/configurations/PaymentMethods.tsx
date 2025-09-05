import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import { Tables, TablesInsert } from '../../types/database.types';

type PaymentMethod = Tables<'payment_methods'>;

const PaymentMethods: React.FC = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [newMethod, setNewMethod] = useState<Omit<TablesInsert<'payment_methods'>, 'id' | 'company_id' | 'created_at' | 'is_active'>>({ name: '', description: '' });
  const [errors, setErrors] = useState({ name: '' });

  const fetchPaymentMethods = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('payment_methods').select('*').order('name');
    if (error) console.error('Error fetching payment methods:', error);
    else setPaymentMethods(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  useEffect(() => {
    if (editingMethod) {
      setNewMethod({ name: editingMethod.name, description: editingMethod.description || '' });
    } else {
      setNewMethod({ name: '', description: '' });
    }
  }, [editingMethod]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewMethod(prevState => ({ ...prevState, [name]: value }));
    if (value) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = { name: '' };
    let isValid = true;
    if (!newMethod.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
      isValid = false;
    }
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const methodData = { ...newMethod, company_id: 1 };

    if (editingMethod) {
      const { error } = await supabase.from('payment_methods').update(methodData).eq('id', editingMethod.id);
      if (error) alert(`Erro ao atualizar método: ${error.message}`);
    } else {
      const { error } = await supabase.from('payment_methods').insert(methodData);
      if (error) alert(`Erro ao criar método: ${error.message}`);
    }
    closeModal();
    fetchPaymentMethods();
  };

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    const { error } = await supabase.from('payment_methods').update({ is_active: !currentStatus }).eq('id', id);
    if (error) alert(`Erro ao alterar status: ${error.message}`);
    else fetchPaymentMethods();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este método de pagamento?')) {
      const { error } = await supabase.from('payment_methods').delete().eq('id', id);
      if (error) alert(`Erro ao excluir método: ${error.message}`);
      else fetchPaymentMethods();
    }
  };

  const openModal = (method: PaymentMethod | null = null) => {
    setEditingMethod(method);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingMethod(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Formas de Pagamento</h1>
          <p className="text-gray-400 mt-1">Gerencie os métodos de pagamento aceitos</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-gradient-to-r from-sky-600 to-cyan-500 text-white px-6 py-3 rounded-lg hover:from-sky-700 hover:to-cyan-600 transition-all duration-200 flex items-center space-x-2 shadow-lg"
        >
          <Plus className="h-5 w-5" />
          <span>Novo Método</span>
        </button>
      </div>

      <Card>
        {loading ? <p>Carregando...</p> : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="p-4 text-sm font-medium text-gray-400">Nome</th>
                <th className="p-4 text-sm font-medium text-gray-400">Descrição</th>
                <th className="p-4 text-sm font-medium text-gray-400">Ativo / Inativo</th>
                <th className="p-4 text-sm font-medium text-gray-400 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {paymentMethods.map((method) => (
                <tr key={method.id} className={`border-b border-gray-800 hover:bg-gray-800/50 ${!method.is_active ? 'opacity-50' : ''}`}>
                  <td className="p-4 text-white font-medium">{method.name}</td>
                  <td className="p-4 text-gray-300">{method.description}</td>
                  <td className="p-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={method.is_active ?? false} onChange={() => handleToggleActive(method.id, method.is_active ?? false)} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                    </label>
                  </td>
                  <td className="p-4 text-white">
                    <div className="flex justify-end space-x-2">
                      <button onClick={() => openModal(method)} className="p-2 hover:bg-gray-700 rounded-lg"><Edit className="h-4 w-4 text-blue-400" /></button>
                      <button onClick={() => handleDelete(method.id)} className="p-2 hover:bg-gray-700 rounded-lg"><Trash2 className="h-4 w-4 text-red-500" /></button>
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
                <h2 className="text-lg font-semibold text-white">{editingMethod ? 'Editar Método' : 'Adicionar Novo Método'}</h2>
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
                    value={newMethod.name}
                    onChange={handleInputChange}
                    placeholder="Ex: PIX"
                    className={`w-full bg-gray-800 border rounded-lg px-3 py-2 focus:ring-2 focus:border-transparent text-white ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-cyan-500'}`}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Descrição</label>
                  <textarea
                    name="description"
                    value={newMethod.description}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Ex: Transferência instantânea"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white"
                  />
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
                    {editingMethod ? 'Salvar Alterações' : 'Salvar Método'}
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

export default PaymentMethods;
