import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { initialProducts as mockProducts, Product } from '../../data/mockProducts';
import { initialProductCombos as mockCombos, ProductCombo } from '../../data/mockCombos';

const Products: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'combos'>('products');
  
  // Products State
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id' | 'active'>>({ name: '', salePrice: '', controlStock: true, stock: 0, stockMin: 0 });
  const [productErrors, setProductErrors] = useState({ name: '', salePrice: '' });

  // Combos State
  const [combos, setCombos] = useState<ProductCombo[]>(mockCombos);
  const [isComboModalOpen, setIsComboModalOpen] = useState(false);
  const [editingCombo, setEditingCombo] = useState<ProductCombo | null>(null);
  const [newCombo, setNewCombo] = useState({ name: '', price: '', productIds: [] as number[] });
  const [comboErrors, setComboErrors] = useState({ name: '', price: '', productIds: '' });

  // --- Products Logic ---
  useEffect(() => {
    if (editingProduct) setNewProduct(editingProduct);
    else setNewProduct({ name: '', salePrice: '', controlStock: true, stock: 0, stockMin: 0 });
  }, [editingProduct]);

  const validateProductForm = () => {
    const errors = { name: '', salePrice: '' };
    if (!newProduct.name) errors.name = 'Nome é obrigatório.';
    if (!newProduct.salePrice || isNaN(parseFloat(newProduct.salePrice))) errors.salePrice = 'Preço de venda inválido.';
    setProductErrors(errors);
    return !errors.name && !errors.salePrice;
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateProductForm()) return;
    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? { ...editingProduct, ...newProduct } : p));
    } else {
      setProducts(prev => [{ id: Date.now(), ...newProduct, active: true }, ...prev]);
    }
    closeProductModal();
  };

  const handleDeleteProduct = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const handleToggleProductActive = (id: number) => {
    setProducts(products.map(p => p.id === id ? { ...p, active: !p.active } : p));
  };
  
  const openProductModal = (product: Product | null = null) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const closeProductModal = () => {
    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  // --- Combos Logic ---
  useEffect(() => {
    if (editingCombo) setNewCombo({ name: editingCombo.name, price: editingCombo.price, productIds: editingCombo.productIds });
    else setNewCombo({ name: '', price: '', productIds: [] });
  }, [editingCombo]);

  const validateComboForm = () => {
    const errors = { name: '', price: '', productIds: '' };
    if (!newCombo.name) errors.name = 'Nome do combo é obrigatório.';
    if (!newCombo.price || isNaN(parseFloat(newCombo.price))) errors.price = 'Preço inválido.';
    if (newCombo.productIds.length < 2) errors.productIds = 'Selecione ao menos 2 produtos.';
    setComboErrors(errors);
    return !errors.name && !errors.price && !errors.productIds;
  };

  const handleComboSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateComboForm()) return;
    if (editingCombo) {
      setCombos(combos.map(c => c.id === editingCombo.id ? { ...editingCombo, ...newCombo } : c));
    } else {
      setCombos(prev => [{ id: Date.now(), ...newCombo, active: true }, ...prev]);
    }
    closeComboModal();
  };

  const handleComboProductSelection = (productId: number) => {
    setNewCombo(prev => {
      const newProductIds = prev.productIds.includes(productId)
        ? prev.productIds.filter(id => id !== productId)
        : [...prev.productIds, productId];
      return { ...prev, productIds: newProductIds };
    });
  };

  const handleDeleteCombo = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este combo?')) {
      setCombos(combos.filter(c => c.id !== id));
    }
  };

  const handleToggleComboActive = (id: number) => {
    setCombos(combos.map(c => c.id === id ? { ...c, active: !c.active } : c));
  };
  
  const openComboModal = (combo: ProductCombo | null = null) => {
    setEditingCombo(combo);
    setIsComboModalOpen(true);
  };

  const closeComboModal = () => {
    setIsComboModalOpen(false);
    setEditingCombo(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Produtos e Combos</h1>
          <p className="text-gray-400 mt-1">Gerencie seu inventário e kits de produtos</p>
        </div>
        <button 
          onClick={() => activeTab === 'products' ? openProductModal() : openComboModal()}
          className="bg-gradient-to-r from-sky-600 to-cyan-500 text-white px-6 py-3 rounded-lg hover:from-sky-700 hover:to-cyan-600 transition-all duration-200 flex items-center space-x-2 shadow-lg"
        >
          <Plus className="h-5 w-5" />
          <span>{activeTab === 'products' ? 'Novo Produto' : 'Novo Combo'}</span>
        </button>
      </div>

      <div className="border-b border-gray-800">
        <nav className="-mb-px flex space-x-6">
          <button onClick={() => setActiveTab('products')} className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'products' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'}`}>Produtos Individuais</button>
          <button onClick={() => setActiveTab('combos')} className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'combos' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'}`}>Combos</button>
        </nav>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
          {activeTab === 'products' ? (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead><tr className="border-b border-gray-800"><th className="p-4 text-sm font-medium text-gray-400">Produto</th><th className="p-4 text-sm font-medium text-gray-400">Preço Venda (R$)</th><th className="p-4 text-sm font-medium text-gray-400">Estoque</th><th className="p-4 text-sm font-medium text-gray-400">Status</th><th className="p-4 text-sm font-medium text-gray-400 text-right">Ações</th></tr></thead>
                  <tbody>{products.map((product) => (<tr key={product.id} className={`border-b border-gray-800 hover:bg-gray-800/50 ${!product.active ? 'opacity-50' : ''}`}><td className="p-4 text-white">{product.name}</td><td className="p-4 text-green-400">{product.salePrice}</td><td className="p-4 text-white">{product.controlStock ? product.stock ?? '0' : 'N/A'}</td><td className="p-4"><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={product.active} onChange={() => handleToggleProductActive(product.id)} className="sr-only peer" /><div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div></label></td><td className="p-4 text-white"><div className="flex justify-end space-x-2"><button onClick={() => openProductModal(product)} className="p-2 hover:bg-gray-700 rounded-lg"><Edit className="h-4 w-4 text-blue-400" /></button><button onClick={() => handleDeleteProduct(product.id)} className="p-2 hover:bg-gray-700 rounded-lg"><Trash2 className="h-4 w-4 text-red-500" /></button></div></td></tr>))}</tbody>
                </table>
              </div>
            </Card>
          ) : (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead><tr className="border-b border-gray-800"><th className="p-4 text-sm font-medium text-gray-400">Nome do Combo</th><th className="p-4 text-sm font-medium text-gray-400">Produtos Inclusos</th><th className="p-4 text-sm font-medium text-gray-400">Preço (R$)</th><th className="p-4 text-sm font-medium text-gray-400">Status</th><th className="p-4 text-sm font-medium text-gray-400 text-right">Ações</th></tr></thead>
                  <tbody>{combos.map((combo) => (<tr key={combo.id} className={`border-b border-gray-800 hover:bg-gray-800/50 ${!combo.active ? 'opacity-50' : ''}`}><td className="p-4 text-white font-medium">{combo.name}</td><td className="p-4 text-gray-300 text-xs">{combo.productIds.map(id => products.find(p=>p.id === id)?.name).join(', ')}</td><td className="p-4 text-green-400">{combo.price}</td><td className="p-4"><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={combo.active} onChange={() => handleToggleComboActive(combo.id)} className="sr-only peer" /><div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div></label></td><td className="p-4 text-white"><div className="flex justify-end space-x-2"><button onClick={() => openComboModal(combo)} className="p-2 hover:bg-gray-700 rounded-lg"><Edit className="h-4 w-4 text-blue-400" /></button><button onClick={() => handleDeleteCombo(combo.id)} className="p-2 hover:bg-gray-700 rounded-lg"><Trash2 className="h-4 w-4 text-red-500" /></button></div></td></tr>))}</tbody>
                </table>
              </div>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Product Modal */}
      <AnimatePresence>
        {isProductModalOpen && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4" onClick={closeProductModal}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-6 border-b border-gray-800"><h2 className="text-lg font-semibold text-white">{editingProduct ? 'Editar Produto' : 'Novo Produto'}</h2><button onClick={closeProductModal} className="p-2 rounded-full hover:bg-gray-700"><X className="h-5 w-5 text-gray-400" /></button></div>
              <form onSubmit={handleProductSubmit} className="p-6 space-y-4">
                <div><label className="block text-sm font-medium text-gray-400 mb-2">Nome do Produto <span className="text-red-500">*</span></label><input type="text" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} className={`w-full bg-gray-800 border rounded-lg px-3 py-2 text-white ${productErrors.name ? 'border-red-500' : 'border-gray-700'}`} />{productErrors.name && <p className="text-xs text-red-500 mt-1">{productErrors.name}</p>}</div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-400 mb-2">Preço de Custo (R$)</label><input type="text" value={newProduct.costPrice || ''} onChange={(e) => setNewProduct({...newProduct, costPrice: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white" /></div>
                  <div><label className="block text-sm font-medium text-gray-400 mb-2">Preço de Venda (R$) <span className="text-red-500">*</span></label><input type="text" value={newProduct.salePrice} onChange={(e) => setNewProduct({...newProduct, salePrice: e.target.value})} className={`w-full bg-gray-800 border rounded-lg px-3 py-2 text-white ${productErrors.salePrice ? 'border-red-500' : 'border-gray-700'}`} />{productErrors.salePrice && <p className="text-xs text-red-500 mt-1">{productErrors.salePrice}</p>}</div>
                </div>
                <div className="pt-4 border-t border-gray-800 space-y-4">
                  <div className="flex items-center space-x-3"><input type="checkbox" id="controlStock" checked={newProduct.controlStock} onChange={(e) => setNewProduct({...newProduct, controlStock: e.target.checked})} className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-600" /><label htmlFor="controlStock" className="text-white">Controlar Estoque</label></div>
                  <div className={`grid grid-cols-2 gap-4 transition-opacity ${newProduct.controlStock ? 'opacity-100' : 'opacity-50'}`}>
                    <div><label className="block text-sm font-medium text-gray-400 mb-2">Estoque Atual</label><input type="number" value={newProduct.stock || ''} onChange={(e) => setNewProduct({...newProduct, stock: parseInt(e.target.value)})} disabled={!newProduct.controlStock} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white disabled:bg-gray-800/50" /></div>
                    <div><label className="block text-sm font-medium text-gray-400 mb-2">Estoque Mínimo</label><input type="number" value={newProduct.stockMin || ''} onChange={(e) => setNewProduct({...newProduct, stockMin: parseInt(e.target.value)})} disabled={!newProduct.controlStock} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white disabled:bg-gray-800/50" /></div>
                  </div>
                </div>
                <div className="flex justify-end space-x-4 pt-4"><button type="button" onClick={closeProductModal} className="bg-gray-700 text-gray-300 px-6 py-2 rounded-lg hover:bg-gray-600">Cancelar</button><button type="submit" className="bg-gradient-to-r from-sky-600 to-cyan-500 text-white px-6 py-2 rounded-lg hover:from-sky-700 hover:to-cyan-600">{editingProduct ? 'Salvar Alterações' : 'Salvar Produto'}</button></div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Combo Modal for Products */}
      <AnimatePresence>
        {isComboModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4" onClick={closeComboModal}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20, opacity: 0 }} className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-6 border-b border-gray-800"><h2 className="text-lg font-semibold text-white">{editingCombo ? 'Editar Combo' : 'Novo Combo de Produtos'}</h2><button onClick={closeComboModal} className="p-2 rounded-full hover:bg-gray-700"><X className="h-5 w-5 text-gray-400" /></button></div>
              <form onSubmit={handleComboSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div><label className="block text-sm font-medium text-gray-400 mb-2">Nome do Combo</label><input type="text" name="name" value={newCombo.name} onChange={(e) => setNewCombo({...newCombo, name: e.target.value})} placeholder="Ex: Kit Hidratação" className={`w-full bg-gray-800 border rounded-lg px-3 py-2 text-white ${comboErrors.name ? 'border-red-500' : 'border-gray-700'}`} />{comboErrors.name && <p className="text-red-500 text-xs mt-1">{comboErrors.name}</p>}</div>
                  <div><label className="block text-sm font-medium text-gray-400 mb-2">Preço Promocional (R$)</label><input type="text" name="price" value={newCombo.price} onChange={(e) => setNewCombo({...newCombo, price: e.target.value})} placeholder="70,00" className={`w-full bg-gray-800 border rounded-lg px-3 py-2 text-white ${comboErrors.price ? 'border-red-500' : 'border-gray-700'}`} />{comboErrors.price && <p className="text-red-500 text-xs mt-1">{comboErrors.price}</p>}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Selecione os Produtos</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto p-3 bg-gray-950 rounded-lg border border-gray-800">
                    {products.filter(p => p.active).map(product => (
                      <label key={product.id} className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-all ${newCombo.productIds.includes(product.id) ? 'bg-sky-800/80' : 'bg-gray-800 hover:bg-gray-700'}`}>
                        <input type="checkbox" checked={newCombo.productIds.includes(product.id)} onChange={() => handleComboProductSelection(product.id)} className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-600" />
                        <span className="text-sm text-white">{product.name}</span>
                      </label>
                    ))}
                  </div>
                  {comboErrors.productIds && <p className="text-red-500 text-xs mt-1">{comboErrors.productIds}</p>}
                </div>
                <div className="flex justify-end space-x-4 pt-4"><button type="button" onClick={closeComboModal} className="bg-gray-700 text-gray-300 px-6 py-2 rounded-lg hover:bg-gray-600">Cancelar</button><button type="submit" className="bg-gradient-to-r from-sky-600 to-cyan-500 text-white px-6 py-2 rounded-lg hover:from-sky-700 hover:to-cyan-600">{editingCombo ? 'Salvar Alterações' : 'Salvar Combo'}</button></div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Products;
