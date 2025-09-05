import React from 'react';
import { Menu, Bell, Search, Scissors } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <motion.header
      className="bg-gray-900 border-b border-gray-800 px-4 lg:px-8 py-4"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-gray-800 lg:hidden"
          >
            <Menu className="h-6 w-6 text-gray-400" />
          </button>

          <div className="flex items-center space-x-2 lg:hidden">
            <div className="p-1.5 bg-gradient-to-r from-sky-600 to-cyan-500 rounded-md">
                <Scissors className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-md font-bold text-white">BARBER & BELLA APP</h1>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button className="relative p-2 rounded-lg hover:bg-gray-800">
            <Bell className="h-6 w-6 text-gray-400" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-gray-900"></span>
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-sky-600 to-cyan-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">A</span>
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-white">Admin</p>
              <p className="text-xs text-gray-400">Proprietário</p>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
