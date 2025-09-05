import React, { useState, useEffect } from 'react';
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
  Award
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SubMenuItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

interface MenuItem {
  icon: React.ElementType;
  label: string;
  path?: string;
  subItems?: SubMenuItem[];
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
    subItems: [
      { icon: DollarSign, label: 'Painel', path: '/financial' },
      { icon: Users, label: 'Contas a Pagar', path: '/financial/accounts-payable' },
      { icon: Users, label: 'Contas a Receber', path: '/financial/accounts-receivable' },
    ]
  },
  {
    icon: BarChart2,
    label: 'Relatórios',
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
  { icon: Bot, label: 'WhatsApp Bot', path: '/whatsapp-bot' },
  { icon: Download, label: 'Backup', path: '/backup' },
  {
    icon: Settings,
    label: 'Configurações',
    subItems: [
        { icon: Building, label: 'Empresa', path: '/configurations/company' },
        { icon: Briefcase, label: 'Funcionários', path: '/configurations/employees' },
        { icon: Star, label: 'Especialidades', path: '/configurations/specialties' },
        { icon: CreditCard, label: 'Formas de Pag.', path: '/configurations/payment-methods' },
    ]
  },
];

const CollapsibleMenuItem: React.FC<{ item: MenuItem; location: any; onClose: () => void; isOpen: boolean; onToggle: () => void; }> = ({ item, location, onClose, isOpen, onToggle }) => {
  const isActive = item.subItems?.some(sub => sub.path === '/' ? location.pathname === '/' : location.pathname.startsWith(sub.path));

  return (
    <li>
      <button
        onClick={onToggle}
        className={`
          flex items-center justify-between w-full px-4 py-3 rounded-lg transition-all duration-200
          ${isActive 
            ? 'bg-gray-800 text-white' 
            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
          }
        `}
      >
        <div className="flex items-center space-x-3">
          <item.icon className="h-5 w-5" />
          <span className="font-medium">{item.label}</span>
        </div>
        <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.ul
            className="pl-6 mt-1 space-y-1 overflow-hidden"
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {item.subItems?.map(subItem => {
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
          </motion.ul>
        )}
      </AnimatePresence>
    </li>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  useEffect(() => {
    const activeMenu = menuItems.find(item => item.subItems?.some(sub => sub.path === '/' ? location.pathname === '/' : location.pathname.startsWith(sub.path)));
    if (activeMenu && !openMenus.includes(activeMenu.label)) {
      setOpenMenus(prev => [...new Set([...prev, activeMenu.label])]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const toggleMenu = (label: string) => {
    setOpenMenus(prev => prev.includes(label) ? prev.filter(m => m !== label) : [...prev, label]);
  };

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
            {menuItems.map((item) => 
              item.subItems ? (
                <CollapsibleMenuItem 
                  key={item.label}
                  item={item}
                  location={location}
                  onClose={onClose}
                  isOpen={openMenus.includes(item.label)}
                  onToggle={() => toggleMenu(item.label)}
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
