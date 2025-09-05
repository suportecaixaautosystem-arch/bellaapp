import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import { supabase } from '../../lib/supabaseClient';
import { Tables, TablesUpdate } from '../../types/database.types';
import { Shield, User, Mail, Loader } from 'lucide-react';

type Profile = Tables<'profiles'>;

const Users: React.FC = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) {
      console.error("Error fetching users:", error);
      alert("Erro ao carregar usuários.");
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: Tables<'profiles'>['role']) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole } as TablesUpdate<'profiles'>)
      .eq('id', userId);

    if (error) {
      alert(`Erro ao alterar o perfil: ${error.message}`);
    } else {
      fetchUsers(); // Refresh the list
    }
  };

  const roleLabels: Record<Tables<'profiles'>['role'], string> = {
    admin: 'Admin (Técnico)',
    manager: 'Gerente (Proprietário)',
    seller: 'Vendedor (Funcionário)',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Gerenciamento de Usuários</h1>
        <p className="text-gray-400 mt-1">Defina os perfis e permissões de acesso da sua equipe.</p>
      </div>

      <Card>
        {loading ? (
          <div className="text-center p-8"><Loader className="animate-spin h-6 w-6 mx-auto"/></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="p-4 text-sm font-medium text-gray-400 flex items-center space-x-2"><User className="h-4 w-4" /><span>Nome</span></th>
                  <th className="p-4 text-sm font-medium text-gray-400 flex items-center space-x-2"><Mail className="h-4 w-4" /><span>Email</span></th>
                  <th className="p-4 text-sm font-medium text-gray-400 flex items-center space-x-2"><Shield className="h-4 w-4" /><span>Perfil</span></th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="p-4 text-white font-medium">{user.full_name}</td>
                    <td className="p-4 text-gray-300">{user.email}</td>
                    <td className="p-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as Tables<'profiles'>['role'])}
                        className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1 text-sm text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      >
                        {Object.keys(roleLabels).map(role => (
                          <option key={role} value={role}>{roleLabels[role as keyof typeof roleLabels]}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Users;
