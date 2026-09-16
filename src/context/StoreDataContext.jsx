import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';

const StoreDataContext = createContext();

export function StoreDataProvider({ children }) {
  const [products, setProducts] = useState(() => apiService.getProducts());
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
      const [fetchedOrders, fetchedTx, fetchedFinance, status] = await Promise.all([
        apiService.getOrders(),
        apiService.getTransactions(),
        apiService.getFinanceSummary(),
        apiService.getDbStatus()
      ]);
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
  const addProduct = (productData) => {
    const created = apiService.addProduct(productData);
    setProducts([...apiService.getProducts()]);
    return created;
  };

  const updateProduct = (code, data) => {
    const updated = apiService.updateProduct(code, data);
    setProducts([...apiService.getProducts()]);
    return updated;
  };

  const deleteProduct = (code) => {
    apiService.deleteProduct(code);
    setProducts([...apiService.getProducts()]);
  };

  const adjustStock = (code, delta) => {
    const newStock = apiService.adjustStock(code, delta);
    setProducts([...apiService.getProducts()]);
    return newStock;
  };

  // Order actions
  const createOrder = async (orderData) => {
    const created = await apiService.createOrder(orderData);
    await loadData();
    setProducts([...apiService.getProducts()]);
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
