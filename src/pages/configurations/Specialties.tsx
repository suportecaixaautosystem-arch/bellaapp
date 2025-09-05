import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import { Tables, TablesInsert } from '../../types/database.types';

type Specialty = Tables<'specialties'>;

const Specialties: React.FC = () => {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState<Specialty | null>(null);
  const [newSpecialty, setNewSpecialty] = useState<Omit<TablesInsert<'specialties'>, 'id' | 'company_id' | 'created_at' | 'is_active'>>({ name: '', description: '' });
  const [errors, setErrors] = useState({ name: '' });

  const fetchSpecialties = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('specialties').select('*').order('name');
    if (error) console.error('Error fetching specialties:', error);
    else setSpecialties(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchSpecialties();
  }, []);

  useEffect(() => {
    if (editingSpecialty) {
      setNewSpecialty({ name: editingSpecialty.name, description: editingSpecialty.description || '' });
    } else {
      setNewSpecialty({ name: '', description: '' });
    }
  }, [editingSpecialty]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewSpecialty(prevState => ({ ...prevState, [name]: value }));
    if (value) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = { name: '' };
    let isValid = true;
    if (!newSpecialty.name.trim()) {
      newErrors.name = 'Nome da especialidade é obrigatório';
      isValid = false;
    }
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const specialtyData = { ...newSpecialty, company_id: 1 };

    if (editingSpecialty) {
      const { error } = await supabase.from('specialties').update(specialtyData).eq('id', editingSpecialty.id);
      if (error) alert(`Erro ao atualizar especialidade: ${error.message}`);
    } else {
      const { error } = await supabase.from('specialties').insert(specialtyData);
      if (error) alert(`Erro ao criar especialidade: ${error.message}`);
    }
    closeModal();
    fetchSpecialties();
  };

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    const { error } = await supabase.from('specialties').update({ is_active: !currentStatus }).eq('id', id);
    if (error) alert(`Erro ao alterar status: ${error.message}`);
    else fetchSpecialties();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta especialidade?')) {
      const { error } = await supabase.from('specialties').delete().eq('id', id);
      if (error) alert(`Erro ao excluir especialidade: ${error.message}`);
      else fetchSpecialties();
    }
  };

  const openModal = (specialty: Specialty | null = null) => {
    setEditingSpecialty(specialty);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSpecialty(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Especialidades</h1>
          <p className="text-gray-400 mt-1">Gerencie as especialidades dos funcionários</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-gradient-to-r from-sky-600 to-cyan-500 text-white px-6 py-3 rounded-lg hover:from-sky-700 hover:to-cyan-600 transition-all duration-200 flex items-center space-x-2 shadow-lg"
        >
          <Plus className="h-5 w-5" />
          <span>Nova Especialidade</span>
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
              {specialties.map((specialty) => (
                <tr key={specialty.id} className={`border-b border-gray-800 hover:bg-gray-800/50 ${!specialty.is_active ? 'opacity-50' : ''}`}>
                  <td className="p-4 text-white font-medium">{specialty.name}</td>
                  <td className="p-4 text-gray-300">{specialty.description}</td>
                  <td className="p-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={specialty.is_active ?? false} onChange={() => handleToggleActive(specialty.id, specialty.is_active ?? false)} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                    </label>
                  </td>
                  <td className="p-4 text-white">
                    <div className="flex justify-end space-x-2">
                      <button onClick={() => openModal(specialty)} className="p-2 hover:bg-gray-700 rounded-lg"><Edit className="h-4 w-4 text-blue-400" /></button>
                      <button onClick={() => handleDelete(specialty.id)} className="p-2 hover:bg-gray-700 rounded-lg"><Trash2 className="h-4 w-4 text-red-500" /></button>
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
                <h2 className="text-lg font-semibold text-white">{editingSpecialty ? 'Editar Especialidade' : 'Adicionar Nova Especialidade'}</h2>
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
                    value={newSpecialty.name}
                    onChange={handleInputChange}
                    placeholder="Ex: Quiropraxia"
                    className={`w-full bg-gray-800 border rounded-lg px-3 py-2 focus:ring-2 focus:border-transparent text-white ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-cyan-500'}`}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Descrição</label>
                  <textarea
                    name="description"
                    value={newSpecialty.description}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Ex: Ajustes na coluna e articulações."
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
                    {editingSpecialty ? 'Salvar Alterações' : 'Salvar Especialidade'}
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

export default Specialties;
