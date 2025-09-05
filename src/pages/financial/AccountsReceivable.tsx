import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import { Plus, Edit, Trash2, Search, Filter, Calendar, Repeat, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AccountReceivable {
  id: number;
  description: string;
  amount: number;
  dueDate: string;
  category: string;
  status: 'pendente' | 'recebido' | 'vencido';
  recurring: boolean;
}

const initialAccounts: AccountReceivable[] = [
    { id: 1, description: 'Corte Feminino - Ana Silva', amount: 60.00, dueDate: '2025-07-25', category: 'Serviços', status: 'pendente', recurring: false },
    { id: 2, description: 'Pacote Mensal - Carlos Souza', amount: 200.00, dueDate: '2025-08-01', category: 'Pacotes', status: 'pendente', recurring: true },
    { id: 3, description: 'Manicure - Mariana Costa', amount: 45.00, dueDate: '2025-07-24', category: 'Serviços', status: 'recebido', recurring: false },
    { id: 4, description: 'Massagem - Pedro Almeida', amount: 80.00, dueDate: '2025-07-20', category: 'Serviços', status: 'vencido', recurring: false },
    { id: 5, description: 'Plano VIP - Julia Santos', amount: 350.00, dueDate: '2025-08-15', category: 'Planos', status: 'pendente', recurring: true },
];

const AccountsReceivable: React.FC = () => {
  const [accounts, setAccounts] = useState<AccountReceivable[]>(initialAccounts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountReceivable | null>(null);

  const [formState, setFormState] = useState({
    description: '', amount: '', dueDate: '', category: '', status: 'pendente', recurring: false
  });
  const [errors, setErrors] = useState({ description: '', amount: '', dueDate: '', category: '' });

  useEffect(() => {
    if (editingAccount) {
      setFormState({
        description: editingAccount.description,
        amount: editingAccount.amount.toString(),
        dueDate: editingAccount.dueDate,
        category: editingAccount.category,
        status: editingAccount.status,
        recurring: editingAccount.recurring,
      });
    } else {
      setFormState({ description: '', amount: '', dueDate: '', category: '', status: 'pendente', recurring: false });
    }
  }, [editingAccount]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
    if (value) setErrors(prev => ({ ...prev, [name]: '' }));
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormState(prev => ({ ...prev, [name]: checked }));
  };

  const validateForm = () => {
    const newErrors = { description: '', amount: '', dueDate: '', category: '' };
    let isValid = true;
    if (!formState.description.trim()) { newErrors.description = 'Descrição é obrigatória'; isValid = false; }
    if (!formState.amount.trim() || isNaN(Number(formState.amount))) { newErrors.amount = 'Valor é obrigatório'; isValid = false; }
    if (!formState.dueDate.trim()) { newErrors.dueDate = 'Data de vencimento é obrigatória'; isValid = false; }
    if (!formState.category.trim()) { newErrors.category = 'Categoria é obrigatória'; isValid = false; }
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const accountData = {
      description: formState.description,
      amount: Number(formState.amount),
      dueDate: formState.dueDate,
      category: formState.category,
      status: formState.status as 'pendente' | 'recebido' | 'vencido',
      recurring: formState.recurring,
    };

    if (editingAccount) {
      setAccounts(accounts.map(acc => acc.id === editingAccount.id ? { ...editingAccount, ...accountData } : acc));
    } else {
      const newAccount: AccountReceivable = { id: Date.now(), ...accountData };
      setAccounts(prev => [newAccount, ...prev]);
    }
    closeModal();
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta conta?')) {
      setAccounts(accounts.filter(acc => acc.id !== id));
    }
  };

  const openModal = (account: AccountReceivable | null = null) => {
    setEditingAccount(account);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAccount(null);
    setFormState({ description: '', amount: '', dueDate: '', category: '', status: 'pendente', recurring: false });
    setErrors({ description: '', amount: '', dueDate: '', category: '' });
  };
  
  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const AccountForm = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4" onClick={closeModal}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20, opacity: 0 }} className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">{editingAccount ? 'Editar Conta a Receber' : 'Nova Conta a Receber'}</h2>
          <button onClick={closeModal} className="p-2 rounded-full hover:bg-gray-700"><X className="h-5 w-5 text-gray-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Descrição</label>
              <input type="text" name="description" value={formState.description} onChange={handleInputChange} placeholder="Ex: Corte feminino - Cliente" className={`w-full bg-gray-800 border rounded-lg px-3 py-2 focus:ring-2 focus:border-transparent text-white ${errors.description ? 'border-red-500 focus:ring-green-500' : 'border-gray-700 focus:ring-green-500'}`} />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Valor (R$)</label>
              <input type="number" name="amount" value={formState.amount} onChange={handleInputChange} step="0.01" placeholder="0,00" className={`w-full bg-gray-800 border rounded-lg px-3 py-2 focus:ring-2 focus:border-transparent text-white ${errors.amount ? 'border-red-500 focus:ring-green-500' : 'border-gray-700 focus:ring-green-500'}`} />
              {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Data de Vencimento</label>
              <input type="date" name="dueDate" value={formState.dueDate} onChange={handleInputChange} className={`w-full bg-gray-800 border rounded-lg px-3 py-2 focus:ring-2 focus:border-transparent text-white ${errors.dueDate ? 'border-red-500 focus:ring-green-500' : 'border-gray-700 focus:ring-green-500'}`} />
              {errors.dueDate && <p className="text-red-500 text-xs mt-1">{errors.dueDate}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Categoria</label>
              <select name="category" value={formState.category} onChange={handleInputChange} className={`w-full bg-gray-800 border rounded-lg px-3 py-2 focus:ring-2 focus:border-transparent text-white ${errors.category ? 'border-red-500 focus:ring-green-500' : 'border-gray-700 focus:ring-green-500'}`}>
                <option value="">Selecione</option><option>Serviços</option><option>Pacotes</option><option>Planos</option><option>Produtos</option><option>Outros</option>
              </select>
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
              <select name="status" value={formState.status} onChange={handleInputChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent text-white">
                <option value="pendente">Pendente</option><option value="recebido">Recebido</option><option value="vencido">Vencido</option>
              </select>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-4">
            <div className="flex items-center space-x-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name="recurring" checked={formState.recurring} onChange={handleCheckboxChange} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
              <span className="text-white font-medium flex items-center space-x-2"><Repeat className="h-4 w-4" /><span>Recebimento recorrente</span></span>
            </div>
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={closeModal} className="bg-gray-700 text-gray-300 px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors">Cancelar</button>
            <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">{editingAccount ? 'Salvar Alterações' : 'Salvar Conta'}</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Contas a Receber</h1>
          <p className="text-gray-400 mt-1">Gerencie seus recebimentos e vendas</p>
        </div>
        <button onClick={() => openModal()} className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-all duration-200 flex items-center space-x-2 shadow-lg">
          <Plus className="h-5 w-5" />
          <span>Nova Conta</span>
        </button>
      </div>

      <AnimatePresence>{isModalOpen && <AccountForm />}</AnimatePresence>

      <Card>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" /><input type="text" placeholder="Buscar contas..." className="pl-10 pr-4 py-2 w-full md:w-80 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white" /></div>
          <div className="flex space-x-2"><button className="flex items-center space-x-2 px-4 py-2 border border-gray-700 rounded-lg hover:bg-gray-800 text-gray-300"><Filter className="h-4 w-4" /><span>Filtros</span></button><button className="flex items-center space-x-2 px-4 py-2 border border-gray-700 rounded-lg hover:bg-gray-800 text-gray-300"><Calendar className="h-4 w-4" /><span>Este Mês</span></button></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="p-4 text-sm font-medium text-gray-400">Descrição</th>
                <th className="p-4 text-sm font-medium text-gray-400">Categoria</th>
                <th className="p-4 text-sm font-medium text-gray-400">Valor</th>
                <th className="p-4 text-sm font-medium text-gray-400">Vencimento</th>
                <th className="p-4 text-sm font-medium text-gray-400">Status</th>
                <th className="p-4 text-sm font-medium text-gray-400 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="p-4 text-white"><div className="flex items-center space-x-2"><span>{account.description}</span>{account.recurring && (<Repeat className="h-4 w-4 text-cyan-400" title="Recebimento recorrente" />)}</div></td>
                  <td className="p-4 text-white">{account.category}</td>
                  <td className="p-4 text-green-400 font-semibold">R$ {account.amount.toFixed(2)}</td>
                  <td className="p-4 text-white">{formatDate(account.dueDate)}</td>
                  <td className="p-4"><span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${account.status === 'recebido' ? 'bg-green-900/50 text-green-300' : account.status === 'vencido' ? 'bg-red-900/50 text-red-300' : 'bg-yellow-900/50 text-yellow-300'}`}>{account.status.charAt(0).toUpperCase() + account.status.slice(1)}</span></td>
                  <td className="p-4 text-white"><div className="flex justify-end space-x-2"><button onClick={() => openModal(account)} className="p-2 hover:bg-gray-700 rounded-lg"><Edit className="h-4 w-4 text-blue-400" /></button><button onClick={() => handleDelete(account.id)} className="p-2 hover:bg-gray-700 rounded-lg"><Trash2 className="h-4 w-4 text-red-500" /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AccountsReceivable;
