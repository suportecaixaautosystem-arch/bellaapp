import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Users, 
  Calendar, 
  Scissors, 
  Settings, 
  X,
  Building,
  DollarSign,
  ChevronDown,
  Archive,
  Briefcase,
  Star,
  CreditCard,
  Package,
  Phone,
  LayoutGrid,
  PlusCircle,
  ShoppingCart,
  BarChart2,
  Download,
  Bot,
  Award,
  LogOut,
  Shield
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Tables } from '../types/database.types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SubMenuItem {
  icon: React.ElementType;
  label: string;
  path: string;
  allowedRoles?: Array<Tables<'profiles'>['role']>;
}

interface MenuItem {
  icon: React.ElementType;
  label: string;
  path?: string;
  subItems?: SubMenuItem[];
  allowedRoles?: Array<Tables<'profiles'>['role']>;
}

const menuItems: MenuItem[] = [
  { icon: Home, label: 'Dashboard', path: '/' },
  { 
    icon: Calendar, 
    label: 'Agendamentos', 
    subItems: [
      { icon: LayoutGrid, label: 'Painel', path: '/appointments/panel' },
      { icon: PlusCircle, label: 'Novo Agendamento', path: '/appointments/new' },
    ]
  },
  { icon: ShoppingCart, label: 'Vendas / PDV', path: '/sales' },
  { 
    icon: DollarSign, 
    label: 'Financeiro', 
    allowedRoles: ['admin', 'manager'],
    subItems: [
      { icon: DollarSign, label: 'Painel', path: '/financial' },
      { icon: Users, label: 'Contas a Pagar', path: '/financial/accounts-payable' },
      { icon: Users, label: 'Contas a Receber', path: '/financial/accounts-receivable' },
    ]
  },
  {
    icon: BarChart2,
    label: 'Relatórios',
    allowedRoles: ['admin', 'manager'],
    subItems: [
        { icon: BarChart2, label: 'Painel Geral', path: '/reports' },
        { icon: ShoppingCart, label: 'Vendas', path: '/reports/sales' },
        { icon: Calendar, label: 'Agendamentos', path: '/reports/appointments' },
        { icon: DollarSign, label: 'Financeiro', path: '/reports/financial' },
        { icon: Award, label: 'Comissões', path: '/reports/commissions' },
        { icon: Archive, label: 'Cadastros', path: '/reports/registrations' },
    ]
  },
  {
    icon: Archive,
    label: 'Cadastros',
    subItems: [
        { icon: Users, label: 'Clientes', path: '/registrations/clients' },
        { icon: Scissors, label: 'Serviços', path: '/registrations/services' },
        { icon: Package, label: 'Produtos', path: '/registrations/products' },
    ]
  },
  { icon: Bot, label: 'WhatsApp Bot', path: '/whatsapp-bot', allowedRoles: ['admin', 'manager'] },
  { icon: Download, label: 'Backup', path: '/backup', allowedRoles: ['admin', 'manager'] },
  {
    icon: Settings,
    label: 'Configurações',
    allowedRoles: ['admin', 'manager'],
    subItems: [
        { icon: Building, label: 'Empresa', path: '/configurations/company' },
        { icon: Briefcase, label: 'Funcionários', path: '/configurations/employees' },
        { icon: Shield, label: 'Usuários', path: '/configurations/users' },
        { icon: Star, label: 'Especialidades', path: '/configurations/specialties' },
        { icon: CreditCard, label: 'Formas de Pag.', path: '/configurations/payment-methods' },
    ]
  },
];

const ExpandedMenuItem: React.FC<{ item: MenuItem; location: any; onClose: () => void; }> = ({ item, location, onClose }) => {
  const { profile } = useAuth();
  const isActive = item.subItems?.some(sub => sub.path === '/' ? location.pathname === '/' : location.pathname.startsWith(sub.path));

  const filteredSubItems = item.subItems?.filter(subItem => 
    !subItem.allowedRoles || (profile && subItem.allowedRoles.includes(profile.role))
  );

  if (!filteredSubItems || filteredSubItems.length === 0) return null;

  return (
    <li>
      <div
        className={`
          flex items-center justify-between w-full px-4 py-3 rounded-lg
          ${isActive 
            ? 'bg-gray-850 text-white' 
            : 'text-gray-300'
          }
        `}
      >
        <div className="flex items-center space-x-3">
          <item.icon className="h-5 w-5" />
          <span className="font-medium">{item.label}</span>
        </div>
        <ChevronDown className="h-5 w-5 rotate-180" />
      </div>
      <ul className="pl-6 mt-1 space-y-1">
        {filteredSubItems.map(subItem => {
          const isSubActive = location.pathname === subItem.path;
          return (
            <li key={subItem.path}>
              <Link
                to={subItem.path}
                onClick={onClose}
                className={`
                  flex items-center space-x-3 pl-5 pr-4 py-2.5 rounded-lg transition-all duration-200 text-sm
                  ${isSubActive
                    ? 'bg-gradient-to-r from-sky-600 to-cyan-500 text-white shadow-sm'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }
                `}
              >
                <subItem.icon className="h-4 w-4" />
                <span>{subItem.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </li>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { signOut, profile } = useAuth();

  const filteredMenuItems = menuItems.filter(item => 
    !item.allowedRoles || (profile && item.allowedRoles.includes(profile.role))
  );

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-70 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gray-900 border-r border-gray-800 z-50 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-r from-sky-600 to-cyan-500 rounded-lg">
              <Scissors className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">BARBER & BELLA</h1>
              <p className="text-xs text-gray-400">APP</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-700 lg:hidden">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-800">
            <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
              <Building className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">BARBER & BELLA SALON</p>
              <p className="text-xs text-gray-400">Nome do Salão</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {filteredMenuItems.map((item) => 
              item.subItems ? (
                <ExpandedMenuItem 
                  key={item.label}
                  item={item}
                  location={location}
                  onClose={onClose}
                />
              ) : (
                <li key={item.path}>
                  <Link
                    to={item.path!}
                    onClick={onClose}
                    className={`
                      flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                      ${location.pathname === item.path 
                        ? 'bg-gradient-to-r from-sky-600 to-cyan-500 text-white shadow-lg' 
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }
                    `}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              )
            )}
            <li>
              <button
                onClick={signOut}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 w-full text-red-400 hover:bg-red-900/50 hover:text-red-300"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Sair</span>
              </button>
            </li>
          </ul>
        </nav>
        
        <div className="p-4 mt-auto border-t border-gray-800">
          <div className="text-center text-xs text-gray-500 space-y-1">
            <p>Desenvolvido por Marlon Ramos</p>
            <p>(53) 99122-9192</p>
            <a href="https://wa.me/5553991229192?text=Olá,%20preciso%20de%20ajuda%20com%20o%20sistema%20Barber%20&%20Bella%20App." target="_blank" rel="noopener noreferrer" className="flex items-center justify-center space-x-1 text-cyan-400 hover:text-cyan-300 transition-colors underline">
              <Phone className="h-3 w-3" />
              <span>Suporte e Comercial</span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
