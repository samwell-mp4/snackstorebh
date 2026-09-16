import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';

const StoreDataContext = createContext();

export function StoreDataProvider({ children }) {
  const [products, setProducts] = useState(() => apiService.getStoredProducts());
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [orders, setOrders] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [financeSummary, setFinanceSummary] = useState({
    receitaBruta: 0,
    custoTotal: 0,
    despesasExtras: 0,
    lucroLiquido: 0,
    margem: '0',
    ticketMedio: '0',
    totalPedidos: 0
  });
  const [dbStatus, setDbStatus] = useState({
    connected: false,
    host: 'var_hub_storegress:5432',
    url: 'postgres://storegress:***@var_hub_storegress:5432/storegress?sslmode=disable',
    database: 'storegress',
    mode: 'Inicializando...'
  });
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [fetchedProducts, fetchedCategories, fetchedTags, fetchedOrders, fetchedTx, fetchedFinance, status] = await Promise.all([
        apiService.getProducts(),
        apiService.getCategories(),
        apiService.getTags(),
        apiService.getOrders(),
        apiService.getTransactions(),
        apiService.getFinanceSummary(),
        apiService.getDbStatus()
      ]);
      if (fetchedProducts && Array.isArray(fetchedProducts) && fetchedProducts.length > 0) {
        setProducts(fetchedProducts);
      }
      if (fetchedCategories && Array.isArray(fetchedCategories)) {
        setCategories(fetchedCategories);
      }
      if (fetchedTags && Array.isArray(fetchedTags)) {
        setTags(fetchedTags);
      }
      setOrders(fetchedOrders || []);
      setTransactions(fetchedTx || []);
      setFinanceSummary(fetchedFinance || {});
      setDbStatus(status || {});
    } catch (err) {
      console.warn('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Product management actions
  const addProduct = async (productData) => {
    const created = await apiService.addProduct(productData);
    setProducts(prev => [created, ...prev.filter(p => p.code !== created.code)]);
    return created;
  };

  const updateProduct = async (code, data) => {
    const updated = await apiService.updateProduct(code, data);
    setProducts(prev => prev.map(p => p.code === code ? { ...p, ...data, ...(updated || {}) } : p));
    return updated;
  };

  const deleteProduct = async (code) => {
    await apiService.deleteProduct(code);
    setProducts(prev => prev.filter(p => p.code !== code));
  };

  const adjustStock = async (code, delta) => {
    const newStock = await apiService.adjustStock(code, delta);
    setProducts(prev => prev.map(p => p.code === code ? { ...p, stock: newStock !== null ? newStock : Math.max(0, (p.stock || 0) + delta) } : p));
    return newStock;
  };

  const setStock = async (code, exactStock) => {
    const newStock = await apiService.setProductStock(code, exactStock);
    setProducts(prev => prev.map(p => p.code === code ? { ...p, stock: newStock } : p));
    return newStock;
  };

  const bulkUpdate = async (codes, updates) => {
    const updatedList = await apiService.bulkUpdateProducts(codes, updates);
    if (Array.isArray(updatedList) && updatedList.length > 0) {
      setProducts(updatedList);
    } else {
      await loadData();
    }
  };

  const bulkDelete = async (codes) => {
    const updatedList = await apiService.bulkDeleteProducts(codes);
    if (Array.isArray(updatedList)) {
      setProducts(updatedList);
    } else {
      const set = new Set(codes);
      setProducts(prev => prev.filter(p => !set.has(p.code)));
    }
  };

  // Category management
  const addCategory = async (data) => {
    const created = await apiService.addCategory(data);
    setCategories(prev => [...prev.filter(c => c.slug !== created.slug), created]);
    return created;
  };

  const deleteCategory = async (slug) => {
    await apiService.deleteCategory(slug);
    setCategories(prev => prev.filter(c => c.slug !== slug));
  };

  // Tag management
  const addTag = async (data) => {
    const created = await apiService.addTag(data);
    setTags(prev => [...prev.filter(t => t.slug !== created.slug), created]);
    return created;
  };

  const deleteTag = async (slug) => {
    await apiService.deleteTag(slug);
    setTags(prev => prev.filter(t => t.slug !== slug));
  };

  // Order actions
  const createOrder = async (orderData) => {
    const created = await apiService.createOrder(orderData);
    await loadData();
    return created;
  };

  const updateOrderStatus = async (id, status) => {
    const updated = await apiService.updateOrderStatus(id, status);
    await loadData();
    return updated;
  };

  // Financial actions
  const addTransaction = async (data) => {
    const created = await apiService.addTransaction(data);
    await loadData();
    return created;
  };

  // Low stock counter
  const lowStockCount = products.filter(p => (p.stock || 0) <= (p.min_stock || 5)).length;

  return (
    <StoreDataContext.Provider value={{
      products,
      categories,
      tags,
      orders,
      transactions,
      financeSummary,
      dbStatus,
      loading,
      lowStockCount,
      addProduct,
      updateProduct,
      deleteProduct,
      adjustStock,
      setStock,
      bulkUpdate,
      bulkDelete,
      addCategory,
      deleteCategory,
      addTag,
      deleteTag,
      createOrder,
      updateOrderStatus,
      addTransaction,
      refreshData: loadData
    }}>
      {children}
    </StoreDataContext.Provider>
  );
}

export function useStoreData() {
  const context = useContext(StoreDataContext);
  if (!context) {
    throw new Error('useStoreData deve ser usado dentro de um StoreDataProvider');
  }
  return context;
}
