import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Scissors, Mail, Lock, User, AlertTriangle } from 'lucide-react';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            }
          }
        });
        if (error) throw error;
        if (data.user && data.user.identities && data.user.identities.length === 0) {
           setMessage("Usuário já existe. Tente fazer login.");
        } else {
           setMessage("Cadastro realizado! Verifique seu e-mail para confirmar a conta.");
        }
      }
    } catch (error: any) {
      setError(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center space-x-3 mb-8">
          <div className="p-3 bg-gradient-to-r from-sky-600 to-cyan-500 rounded-xl">
            <Scissors className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">BARBER & BELLA</h1>
            <p className="text-sm text-gray-400">APP</p>
          </div>
        </div>

        <motion.div
          className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex border-b border-gray-700 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`w-1/2 py-3 text-sm font-medium transition-colors ${isLogin ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'}`}
            >
              Entrar
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`w-1/2 py-3 text-sm font-medium transition-colors ${!isLogin ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'}`}
            >
              Cadastrar
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={isLogin ? 'login' : 'signup'}
              onSubmit={handleAuth}
              className="space-y-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {!isLogin && (
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Nome Completo"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
              )}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type="password"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              
              {error && (
                <div className="bg-red-900/30 border border-red-700/50 text-red-300 text-sm p-3 rounded-lg flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}

              {message && (
                <div className="bg-green-900/30 border border-green-700/50 text-green-300 text-sm p-3 rounded-lg">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-sky-600 to-cyan-500 text-white py-3 rounded-lg font-bold hover:from-sky-700 hover:to-cyan-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-wait"
              >
                {loading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Criar Conta')}
              </button>
            </motion.form>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
