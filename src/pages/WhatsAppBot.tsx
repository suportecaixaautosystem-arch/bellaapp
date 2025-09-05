import React, { useState } from 'react';
import Card from '../components/Card';
import { Bot, MessageSquare, Settings, Save, CheckCircle, XCircle, Zap, Wind } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Provider = 'meta' | 'zapi' | 'sleekflow';

const WhatsAppBot: React.FC = () => {
  const [isBotActive, setIsBotActive] = useState(false);
  const [provider, setProvider] = useState<Provider>('meta');
  const [connections, setConnections] = useState({
    meta: false,
    zapi: false,
    sleekflow: false,
  });
  const [apiKeys, setApiKeys] = useState({
    zapiInstance: '',
    zapiToken: '',
    sleekflowKey: '',
  });

  const [messages, setMessages] = useState({
    welcome: 'Olá! Bem-vindo ao [Nome do Salão]. Como posso ajudar? Digite o número da opção desejada:',
    menu: '1. Agendar Horário\n2. Meus Agendamentos\n3. Falar com um atendente',
    confirmation: 'Seu horário para [Serviço] com [Profissional] no dia [Data] às [Hora] foi confirmado! 🎉',
    reminder: 'Olá! Passando para lembrar do seu agendamento amanhã às [Hora]. Para confirmar, responda SIM. Para cancelar, responda NÃO.',
  });

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMessages(prev => ({ ...prev, [name]: value }));
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setApiKeys(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = () => {
    // In a real app, this would save to a backend.
    alert('Configurações salvas com sucesso!');
  };

  const handleConnect = (prov: Provider) => {
    // Mock connection logic
    if (prov === 'zapi' && (!apiKeys.zapiInstance || !apiKeys.zapiToken)) {
      alert('Preencha o ID da Instância e o Token da Z-API.');
      return;
    }
    if (prov === 'sleekflow' && !apiKeys.sleekflowKey) {
      alert('Preencha a Chave de API do SleekFlow.');
      return;
    }
    setConnections(prev => ({ ...prev, [prov]: !prev[prov] }));
  };
  
  const isCurrentProviderConnected = connections[provider];

  const providerConfig = {
    meta: { name: 'API Oficial (Meta)', icon: MessageSquare, color: 'bg-green-600 hover:bg-green-700' },
    zapi: { name: 'Z-API', icon: Zap, color: 'bg-yellow-600 hover:bg-yellow-700' },
    sleekflow: { name: 'SleekFlow', icon: Wind, color: 'bg-blue-600 hover:bg-blue-700' },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center space-x-3">
          <Bot className="h-8 w-8" />
          <span>Bot de Agendamento para WhatsApp</span>
        </h1>
        <p className="text-gray-400 mt-1">Automatize seus agendamentos e comunicação com os clientes.</p>
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
            <Settings className="h-5 w-5 text-cyan-400" />
            <span>Configuração Geral</span>
          </h2>
          <div className="flex items-center space-x-4">
            <span className={`flex items-center space-x-2 text-sm font-medium ${isCurrentProviderConnected ? 'text-green-400' : 'text-yellow-400'}`}>
              {isCurrentProviderConnected ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              <span>{isCurrentProviderConnected ? 'Conectado' : 'Não Conectado'}</span>
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={isBotActive} onChange={(e) => setIsBotActive(e.target.checked)} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
            </label>
            <span className={`font-medium ${isBotActive ? 'text-white' : 'text-gray-500'}`}>
              {isBotActive ? 'Bot Ativo' : 'Bot Inativo'}
            </span>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-md font-semibold text-white mb-4">1. Provedor de Integração</h3>
        <p className="text-sm text-gray-400 mb-4">Escolha qual serviço você usará para conectar o bot ao WhatsApp.</p>
        <div className="border-b border-gray-800">
            <nav className="-mb-px flex space-x-6">
                {Object.keys(providerConfig).map((p) => {
                    const prov = p as Provider;
                    const Icon = providerConfig[prov].icon;
                    return (
                        <button key={prov} onClick={() => setProvider(prov)} className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center space-x-2 ${provider === prov ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-white'}`}>
                            <Icon className="h-4 w-4" />
                            <span>{providerConfig[prov].name}</span>
                        </button>
                    )
                })}
            </nav>
        </div>
      </Card>
      
      <AnimatePresence mode="wait">
        <motion.div key={provider} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            <Card>
                <h3 className="text-md font-semibold text-white mb-4">2. Configuração da Conexão: {providerConfig[provider].name}</h3>
                {provider === 'meta' && (
                    <>
                        <p className="text-sm text-gray-400 mb-4">Para usar o bot, você precisa conectar sua conta do WhatsApp Business API (Meta).</p>
                        <button onClick={() => handleConnect('meta')} className={`w-full py-2 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 ${connections.meta ? 'bg-red-600 hover:bg-red-700' : providerConfig.meta.color} text-white`}>
                            <MessageSquare className="h-5 w-5" />
                            <span>{connections.meta ? 'Desconectar' : 'Conectar com WhatsApp'}</span>
                        </button>
                        <p className="text-xs text-gray-500 mt-2 text-center">Requer uma conta Meta Business aprovada.</p>
                    </>
                )}
                {provider === 'zapi' && (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-400">Insira suas credenciais da Z-API para conectar.</p>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">ID da Instância</label>
                            <input type="text" name="zapiInstance" value={apiKeys.zapiInstance} onChange={handleApiKeyChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Token</label>
                            <input type="password" name="zapiToken" value={apiKeys.zapiToken} onChange={handleApiKeyChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-sm" />
                        </div>
                        <button onClick={() => handleConnect('zapi')} className={`w-full py-2 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 ${connections.zapi ? 'bg-red-600 hover:bg-red-700' : providerConfig.zapi.color} text-white`}>
                            <Zap className="h-5 w-5" />
                            <span>{connections.zapi ? 'Desconectar' : 'Conectar Z-API'}</span>
                        </button>
                    </div>
                )}
                {provider === 'sleekflow' && (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-400">Insira sua chave de API do SleekFlow para conectar.</p>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Chave de API (API Key)</label>
                            <input type="password" name="sleekflowKey" value={apiKeys.sleekflowKey} onChange={handleApiKeyChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-sm" />
                        </div>
                        <button onClick={() => handleConnect('sleekflow')} className={`w-full py-2 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 ${connections.sleekflow ? 'bg-red-600 hover:bg-red-700' : providerConfig.sleekflow.color} text-white`}>
                            <Wind className="h-5 w-5" />
                            <span>{connections.sleekflow ? 'Desconectar' : 'Conectar SleekFlow'}</span>
                        </button>
                    </div>
                )}
            </Card>
        </motion.div>
      </AnimatePresence>

      <Card>
        <h3 className="text-md font-semibold text-white mb-4">3. Mensagens Automáticas</h3>
        <p className="text-sm text-gray-400 mb-4">Personalize as mensagens que seu bot enviará. Use as tags como [Nome do Cliente] para personalizar.</p>
        <div className="text-xs text-cyan-400 bg-cyan-900/30 p-2 rounded-lg mb-4">
            Tags disponíveis: [Nome do Salão], [Nome do Cliente], [Serviço], [Profissional], [Data], [Hora]
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Mensagem de Boas-Vindas</label>
            <textarea name="welcome" value={messages.welcome} onChange={handleMessageChange} rows={4} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Menu Principal</label>
            <textarea name="menu" value={messages.menu} onChange={handleMessageChange} rows={4} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Mensagem de Confirmação</label>
            <textarea name="confirmation" value={messages.confirmation} onChange={handleMessageChange} rows={4} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Mensagem de Lembrete (24h antes)</label>
            <textarea name="reminder" value={messages.reminder} onChange={handleMessageChange} rows={4} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <button
          onClick={handleSaveChanges}
          className="bg-gradient-to-r from-sky-600 to-cyan-500 text-white px-8 py-3 rounded-lg hover:from-sky-700 hover:to-cyan-600 transition-all duration-200 flex items-center space-x-2 shadow-lg"
        >
          <Save className="h-5 w-5" />
          <span>Salvar Configurações</span>
        </button>
      </div>
    </div>
  );
};

export default WhatsAppBot;
