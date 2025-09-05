import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import { Tables, TablesInsert } from '../../types/database.types';
import { useAuth } from '../../contexts/AuthContext';

type Product = Tables<'products'>;
type ProductCombo = Tables<'product_combos'>;
type ProductComboItem = {
  combo_id: number;
  product_id: number;
};

const Products: React.FC = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'products' | 'combos'>('products');
  
  // Products State
  const [products, setProducts] = useState<Product[]>([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Omit<TablesInsert<'products'>, 'id' | 'company_id' | 'created_at' | 'updated_at' | 'is_active'>>({ name: '', sale_price: 0, control_stock: true, stock_quantity: 0, stock_min_threshold: 0, cost_price: 0 });
  const [productErrors, setProductErrors] = useState({ name: '', sale_price: '' });
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Combos State
  const [combos, setCombos] = useState<(ProductCombo & { product_combo_items: ProductComboItem[] })[]>([]);
  const [isComboModalOpen, setIsComboModalOpen] = useState(false);
  const [editingCombo, setEditingCombo] = useState<(ProductCombo & { product_combo_items: ProductComboItem[] }) | null>(null);
  const [newCombo, setNewCombo] = useState({ name: '', price: 0, productIds: [] as number[] });
  const [comboErrors, setComboErrors] = useState({ name: '', price: '', productIds: '' });
  const [loadingCombos, setLoadingCombos] = useState(true);

  const canEditOrDelete = profile?.role === 'admin' || profile?.role === 'manager';

  const fetchProducts = async () => {
    setLoadingProducts(true);
    const { data, error } = await supabase.from('products').select('*').order('name');
    if (error) console.error('Error fetching products:', error);
    else setProducts(data || []);
    setLoadingProducts(false);
  };

  const fetchCombos = async () => {
    setLoadingCombos(true);
    const { data, error } = await supabase.from('product_combos').select('*, product_combo_items(*)').order('name');
    if (error) console.error('Error fetching product combos:', error);
    else setCombos(data || []);
    setLoadingCombos(false);
  };

  useEffect(() => {
    fetchProducts();
    fetchCombos();
  }, []);

  // --- Products Logic ---
  useEffect(() => {
    if (editingProduct) setNewProduct(editingProduct);
    else setNewProduct({ name: '', sale_price: 0, control_stock: true, stock_quantity: 0, stock_min_threshold: 0, cost_price: 0 });
  }, [editingProduct]);

  const validateProductForm = () => {
    const errors = { name: '', sale_price: '' };
    if (!newProduct.name) errors.name = 'Nome é obrigatório.';
    if (newProduct.sale_price <= 0) errors.sale_price = 'Preço de venda deve ser maior que zero.';
    setProductErrors(errors);
    return !errors.name && !errors.sale_price;
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateProductForm()) return;
    
    const productData = { ...newProduct, company_id: 1 };

    if (editingProduct) {
      if (!canEditOrDelete) { alert("Você não tem permissão para editar."); return; }
      const { error } = await supabase.from('products').update(productData).eq('id', editingProduct.id);
      if (error) alert(`Erro ao atualizar produto: ${error.message}`);
    } else {
      const { error } = await supabase.from('products').insert(productData);
      if (error) alert(`Erro ao criar produto: ${error.message}`);
    }
    closeProductModal();
    fetchProducts();
  };

  const handleDeleteProduct = async (id: number) => {
    if (!canEditOrDelete) { alert("Você não tem permissão para excluir."); return; }
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) alert(`Erro ao excluir produto: ${error.message}`);
      else fetchProducts();
    }
  };

  const handleToggleProductActive = async (id: number, currentStatus: boolean) => {
    if (!canEditOrDelete) { alert("Você não tem permissão para alterar o status."); return; }
    const { error } = await supabase.from('products').update({ is_active: !currentStatus }).eq('id', id);
    if (error) alert(`Erro ao alterar status: ${error.message}`);
    else fetchProducts();
  };
  
  const openProductModal = (product: Product | null = null) => {
    if (product && !canEditOrDelete) { alert("Você não tem permissão para editar."); return; }
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const closeProductModal = () => {
    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  // --- Combos Logic ---
  useEffect(() => {
    if (editingCombo) setNewCombo({ name: editingCombo.name, price: editingCombo.price, productIds: editingCombo.product_combo_items.map(i => i.product_id) });
    else setNewCombo({ name: '', price: 0, productIds: [] });
  }, [editingCombo]);

  const validateComboForm = () => {
    const errors = { name: '', price: '', productIds: '' };
    if (!newCombo.name) errors.name = 'Nome do combo é obrigatório.';
    if (newCombo.price <= 0) errors.price = 'Preço inválido.';
    if (newCombo.productIds.length < 2) errors.productIds = 'Selecione ao menos 2 produtos.';
    setComboErrors(errors);
    return !errors.name && !errors.price && !errors.productIds;
  };

  const handleComboSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateComboForm()) return;

    if (editingCombo) {
      if (!canEditOrDelete) { alert("Você não tem permissão para editar."); return; }
      alert("Edição de combos ainda não implementada.");
    } else {
      const { data: comboData, error: comboError } = await supabase
        .from('product_combos')
        .insert({ name: newCombo.name, price: newCombo.price, company_id: 1 })
        .select()
        .single();
      
      if (comboError || !comboData) {
        alert(`Erro ao criar combo: ${comboError?.message}`);
        return;
      }

      const itemsToInsert = newCombo.productIds.map(product_id => ({
        combo_id: comboData.id,
        product_id: product_id
      }));

      const { error: itemsError } = await supabase.from('product_combo_items').insert(itemsToInsert);

      if (itemsError) {
        alert(`Erro ao adicionar produtos ao combo: ${itemsError.message}`);
        await supabase.from('product_combos').delete().eq('id', comboData.id);
      }
    }
    closeComboModal();
    fetchCombos();
  };

  const handleComboProductSelection = (productId: number) => {
    setNewCombo(prev => {
      const newProductIds = prev.productIds.includes(productId)
        ? prev.productIds.filter(id => id !== productId)
        : [...prev.productIds, productId];
      return { ...prev, productIds: newProductIds };
    });
  };

  const handleDeleteCombo = async (id: number) => {
    if (!canEditOrDelete) { alert("Você não tem permissão para excluir."); return; }
    if (window.confirm('Tem certeza que deseja excluir este combo?')) {
      await supabase.from('product_combo_items').delete().eq('combo_id', id);
      const { error } = await supabase.from('product_combos').delete().eq('id', id);
      if (error) alert(`Erro ao excluir combo: ${error.message}`);
      else fetchCombos();
    }
  };

  const handleToggleComboActive = async (id: number, currentStatus: boolean) => {
    if (!canEditOrDelete) { alert("Você não tem permissão para alterar o status."); return; }
    const { error } = await supabase.from('product_combos').update({ is_active: !currentStatus }).eq('id', id);
    if (error) alert(`Erro ao alterar status: ${error.message}`);
    else fetchCombos();
  };
  
  const openComboModal = (combo: (ProductCombo & { product_combo_items: ProductComboItem[] }) | null = null) => {
    if (combo && !canEditOrDelete) { alert("Você não tem permissão para editar."); return; }
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
              {loadingProducts ? <p>Carregando produtos...</p> : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead><tr className="border-b border-gray-800"><th className="p-4 text-sm font-medium text-gray-400">Produto</th><th className="p-4 text-sm font-medium text-gray-400">Preço Venda (R$)</th><th className="p-4 text-sm font-medium text-gray-400">Estoque</th><th className="p-4 text-sm font-medium text-gray-400">Status</th><th className="p-4 text-sm font-medium text-gray-400 text-right">Ações</th></tr></thead>
                  <tbody>{products.map((product) => (<tr key={product.id} className={`border-b border-gray-800 hover:bg-gray-800/50 ${!product.is_active ? 'opacity-50' : ''}`}><td className="p-4 text-white">{product.name}</td><td className="p-4 text-green-400">{product.sale_price.toFixed(2)}</td><td className="p-4 text-white">{product.control_stock ? product.stock_quantity ?? '0' : 'N/A'}</td><td className="p-4"><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={product.is_active ?? false} onChange={() => handleToggleProductActive(product.id, product.is_active ?? false)} disabled={!canEditOrDelete} className="sr-only peer" /><div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div></label></td><td className="p-4 text-white">{canEditOrDelete && (<div className="flex justify-end space-x-2"><button onClick={() => openProductModal(product)} className="p-2 hover:bg-gray-700 rounded-lg"><Edit className="h-4 w-4 text-blue-400" /></button><button onClick={() => handleDeleteProduct(product.id)} className="p-2 hover:bg-gray-700 rounded-lg"><Trash2 className="h-4 w-4 text-red-500" /></button></div>)}</td></tr>))}</tbody>
                </table>
              </div>
              )}
            </Card>
          ) : (
            <Card>
              {loadingCombos ? <p>Carregando combos...</p> : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead><tr className="border-b border-gray-800"><th className="p-4 text-sm font-medium text-gray-400">Nome do Combo</th><th className="p-4 text-sm font-medium text-gray-400">Produtos Inclusos</th><th className="p-4 text-sm font-medium text-gray-400">Preço (R$)</th><th className="p-4 text-sm font-medium text-gray-400">Status</th><th className="p-4 text-sm font-medium text-gray-400 text-right">Ações</th></tr></thead>
                  <tbody>{combos.map((combo) => (<tr key={combo.id} className={`border-b border-gray-800 hover:bg-gray-800/50 ${!combo.is_active ? 'opacity-50' : ''}`}><td className="p-4 text-white font-medium">{combo.name}</td><td className="p-4 text-gray-300 text-xs">{combo.product_combo_items.map(item => products.find(p=>p.id === item.product_id)?.name).join(', ')}</td><td className="p-4 text-green-400">{combo.price.toFixed(2)}</td><td className="p-4"><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={combo.is_active ?? false} onChange={() => handleToggleComboActive(combo.id, combo.is_active ?? false)} disabled={!canEditOrDelete} className="sr-only peer" /><div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div></label></td><td className="p-4 text-white">{canEditOrDelete && (<div className="flex justify-end space-x-2"><button onClick={() => openComboModal(combo)} className="p-2 hover:bg-gray-700 rounded-lg"><Edit className="h-4 w-4 text-blue-400" /></button><button onClick={() => handleDeleteCombo(combo.id)} className="p-2 hover:bg-gray-700 rounded-lg"><Trash2 className="h-4 w-4 text-red-500" /></button></div>)}</td></tr>))}</tbody>
                </table>
              </div>
              )}
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
                  <div><label className="block text-sm font-medium text-gray-400 mb-2">Preço de Custo (R$)</label><input type="number" step="0.01" value={newProduct.cost_price || ''} onChange={(e) => setNewProduct({...newProduct, cost_price: parseFloat(e.target.value)})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white" /></div>
                  <div><label className="block text-sm font-medium text-gray-400 mb-2">Preço de Venda (R$) <span className="text-red-500">*</span></label><input type="number" step="0.01" value={newProduct.sale_price} onChange={(e) => setNewProduct({...newProduct, sale_price: parseFloat(e.target.value)})} className={`w-full bg-gray-800 border rounded-lg px-3 py-2 text-white ${productErrors.sale_price ? 'border-red-500' : 'border-gray-700'}`} />{productErrors.sale_price && <p className="text-xs text-red-500 mt-1">{productErrors.sale_price}</p>}</div>
                </div>
                <div className="pt-4 border-t border-gray-800 space-y-4">
                  <div className="flex items-center space-x-3"><input type="checkbox" id="controlStock" checked={newProduct.control_stock ?? false} onChange={(e) => setNewProduct({...newProduct, control_stock: e.target.checked})} className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-600" /><label htmlFor="controlStock" className="text-white">Controlar Estoque</label></div>
                  <div className={`grid grid-cols-2 gap-4 transition-opacity ${newProduct.control_stock ? 'opacity-100' : 'opacity-50'}`}>
                    <div><label className="block text-sm font-medium text-gray-400 mb-2">Estoque Atual</label><input type="number" value={newProduct.stock_quantity || ''} onChange={(e) => setNewProduct({...newProduct, stock_quantity: parseInt(e.target.value)})} disabled={!newProduct.control_stock} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white disabled:bg-gray-800/50" /></div>
                    <div><label className="block text-sm font-medium text-gray-400 mb-2">Estoque Mínimo</label><input type="number" value={newProduct.stock_min_threshold || ''} onChange={(e) => setNewProduct({...newProduct, stock_min_threshold: parseInt(e.target.value)})} disabled={!newProduct.control_stock} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white disabled:bg-gray-800/50" /></div>
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
                  <div><label className="block text-sm font-medium text-gray-400 mb-2">Preço Promocional (R$)</label><input type="number" step="0.01" name="price" value={newCombo.price} onChange={(e) => setNewCombo({...newCombo, price: parseFloat(e.target.value)})} placeholder="70.00" className={`w-full bg-gray-800 border rounded-lg px-3 py-2 text-white ${comboErrors.price ? 'border-red-500' : 'border-gray-700'}`} />{comboErrors.price && <p className="text-red-500 text-xs mt-1">{comboErrors.price}</p>}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Selecione os Produtos</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto p-3 bg-gray-950 rounded-lg border border-gray-800">
                    {products.filter(p => p.is_active).map(product => (
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
