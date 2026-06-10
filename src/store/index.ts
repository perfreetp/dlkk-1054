import { create } from 'zustand';
import Taro from '@tarojs/taro';
import { mockProducts, productCategories } from '@/data/products';
import { mockOrders } from '@/data/orders';
import { mockCustomers, customerGroups } from '@/data/customers';
import { mockQuotations } from '@/data/quotations';
import { mockInventoryItems, mockRestockRecords } from '@/data/inventory';
import { mockFinanceRecords, mockProductSalesRanking, mockStaffPerformance, mockStatsSummary } from '@/data/finance';
import { mockMessages } from '@/data/messages';
import type { Product, Order, Customer, Quotation, InventoryItem, RestockRecord, FinanceRecord, Message, OrderItem, QuotationItem, TierPrice } from '@/types';

interface StoreState {
  products: Product[];
  orders: Order[];
  customers: Customer[];
  quotations: Quotation[];
  inventoryItems: InventoryItem[];
  restockRecords: RestockRecord[];
  financeRecords: FinanceRecord[];
  messages: Message[];

  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, data: Partial<Product>) => void;

  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => void;
  updateOrder: (id: string, data: Partial<Order>) => void;
  payDeposit: (orderId: string, amount: number) => void;
  payBalance: (orderId: string, amount: number) => void;

  addQuotation: (quotation: Omit<Quotation, 'id' | 'createdAt'>) => void;
  updateQuotation: (id: string, data: Partial<Quotation>) => void;
  convertQuotationToOrder: (quotationId: string) => string | null;

  addRestockRecord: (record: Omit<RestockRecord, 'id' | 'createdAt'>) => void;
  confirmRestock: (id: string) => void;

  addFinanceRecord: (record: Omit<FinanceRecord, 'id' | 'createdAt'>) => void;

  markMessageRead: (id: string) => void;
  markAllMessagesRead: () => void;

  getTierPrice: (productId: string, quantity: number) => number;

  persist: () => void;
  loadFromStorage: () => void;
}

const STORAGE_KEY = 'lamp_wholesale_store';

const generateId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

const generateOrderNo = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const seq = Math.floor(Math.random() * 900 + 100);
  return `DD${y}${m}${d}${seq}`;
};

const generateQuotationNo = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const seq = Math.floor(Math.random() * 900 + 100);
  return `BJ${y}${m}${d}${seq}`;
};

const getDefaultState = () => ({
  products: [...mockProducts],
  orders: [...mockOrders],
  customers: [...mockCustomers],
  quotations: [...mockQuotations],
  inventoryItems: [...mockInventoryItems],
  restockRecords: [...mockRestockRecords],
  financeRecords: [...mockFinanceRecords],
  messages: [...mockMessages],
});

export const useStore = create<StoreState>((set, get) => ({
  ...getDefaultState(),

  addProduct: (productData) => {
    const id = generateId();
    const now = new Date().toISOString();
    const newProduct: Product = {
      ...productData,
      id,
      image: productData.images?.[0] || '',
      createdAt: now,
    };
    set((state) => {
      const products = [newProduct, ...state.products];
      const inventoryItems = [
        {
          productId: id,
          productName: newProduct.name,
          productImage: newProduct.image,
          model: newProduct.model,
          category: newProduct.category,
          stock: newProduct.stock,
          warnStock: newProduct.warnStock,
          unit: newProduct.unit,
          location: '待分配',
          lastRestockDate: now.split('T')[0],
        },
        ...state.inventoryItems,
      ];
      return { products, inventoryItems };
    });
    get().persist();
  },

  updateProduct: (id, data) => {
    set((state) => {
      const products = state.products.map((p) =>
        p.id === id ? { ...p, ...data, image: data.images?.[0] || p.image } : p
      );
      const updatedProduct = products.find((p) => p.id === id);
      const inventoryItems = state.inventoryItems.map((item) => {
        if (item.productId === id && updatedProduct) {
          return {
            ...item,
            productName: updatedProduct.name,
            productImage: updatedProduct.image,
            model: updatedProduct.model,
            category: updatedProduct.category,
            stock: updatedProduct.stock,
            warnStock: updatedProduct.warnStock,
            unit: updatedProduct.unit,
          };
        }
        return item;
      });
      return { products, inventoryItems };
    });
    get().persist();
  },

  addOrder: (orderData) => {
    const id = generateId();
    const now = new Date().toISOString();
    const newOrder: Order = { ...orderData, id, createdAt: now };
    set((state) => ({ orders: [newOrder, ...state.orders] }));
    get().persist();
  },

  updateOrder: (id, data) => {
    set((state) => ({
      orders: state.orders.map((o) => (o.id === id ? { ...o, ...data } : o)),
    }));
    get().persist();
  },

  payDeposit: (orderId, amount) => {
    const state = get();
    const order = state.orders.find((o) => o.id === orderId);
    if (!order) return;

    const newDeposit = order.deposit + amount;
    const newBalance = order.totalAmount - newDeposit;
    const newPaymentStatus: Order['paymentStatus'] =
      newBalance <= 0 ? 'paid' : 'partial';
    const actualBalance = Math.max(0, newBalance);

    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId
          ? { ...o, deposit: newDeposit, balance: actualBalance, paymentStatus: newPaymentStatus }
          : o
      ),
      financeRecords: [
        {
          id: generateId(),
          type: 'income',
          category: '订单收入',
          amount,
          orderNo: order.orderNo,
          customerName: order.customerName,
          description: '订单订金收入',
          createdAt: new Date().toISOString(),
        },
        ...state.financeRecords,
      ],
    }));
    get().persist();
  },

  payBalance: (orderId, amount) => {
    const state = get();
    const order = state.orders.find((o) => o.id === orderId);
    if (!order) return;

    const newBalance = Math.max(0, order.balance - amount);
    const newDeposit = order.deposit + amount;
    const newPaymentStatus: Order['paymentStatus'] =
      newBalance <= 0 ? 'paid' : 'partial';

    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId
          ? { ...o, deposit: newDeposit, balance: newBalance, paymentStatus: newPaymentStatus }
          : o
      ),
      financeRecords: [
        {
          id: generateId(),
          type: 'income',
          category: '订单收入',
          amount,
          orderNo: order.orderNo,
          customerName: order.customerName,
          description: '订单尾款收入',
          createdAt: new Date().toISOString(),
        },
        ...state.financeRecords,
      ],
    }));
    get().persist();
  },

  addQuotation: (quotationData) => {
    const id = generateId();
    const now = new Date().toISOString();
    const newQuotation: Quotation = { ...quotationData, id, createdAt: now };
    set((state) => ({ quotations: [newQuotation, ...state.quotations] }));
    get().persist();
  },

  updateQuotation: (id, data) => {
    set((state) => ({
      quotations: state.quotations.map((q) =>
        q.id === id ? { ...q, ...data } : q
      ),
    }));
    get().persist();
  },

  convertQuotationToOrder: (quotationId) => {
    const state = get();
    const quotation = state.quotations.find((q) => q.id === quotationId);
    if (!quotation) return null;

    const orderId = generateId();
    const now = new Date().toISOString();
    const orderNo = generateOrderNo();
    const newOrder: Order = {
      id: orderId,
      orderNo,
      customerId: quotation.customerId,
      customerName: quotation.customerName,
      items: quotation.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        productImage: item.productImage,
        model: item.model,
        price: item.price,
        quantity: item.quantity,
        amount: item.amount,
      })),
      totalAmount: quotation.totalAmount,
      deposit: 0,
      balance: quotation.totalAmount,
      status: 'pending',
      paymentStatus: 'unpaid',
      deliveryStatus: 'pending',
      createdAt: now,
      remark: `由报价单 ${quotation.quotationNo} 转化`,
      salesman: '张店长',
    };

    set((state) => ({
      orders: [newOrder, ...state.orders],
      quotations: state.quotations.map((q) =>
        q.id === quotationId ? { ...q, status: 'accepted' as const } : q
      ),
    }));
    get().persist();
    return orderId;
  },

  addRestockRecord: (recordData) => {
    const id = generateId();
    const now = new Date().toISOString();
    const newRecord: RestockRecord = { ...recordData, id, createdAt: now };
    set((state) => ({
      restockRecords: [newRecord, ...state.restockRecords],
    }));
    get().persist();
  },

  confirmRestock: (id) => {
    const state = get();
    const record = state.restockRecords.find((r) => r.id === id);
    if (!record || record.status === 'completed') return;

    set((state) => ({
      restockRecords: state.restockRecords.map((r) =>
        r.id === id ? { ...r, status: 'completed' as const } : r
      ),
      products: state.products.map((p) =>
        p.id === record.productId
          ? { ...p, stock: p.stock + record.quantity }
          : p
      ),
      inventoryItems: state.inventoryItems.map((item) =>
        item.productId === record.productId
          ? { ...item, stock: item.stock + record.quantity, lastRestockDate: new Date().toISOString().split('T')[0] }
          : item
      ),
      financeRecords: [
        {
          id: generateId(),
          type: 'expense',
          category: '进货支出',
          amount: record.cost,
          description: `${record.productName}进货${record.quantity}件`,
          createdAt: new Date().toISOString(),
        },
        ...state.financeRecords,
      ],
    }));
    get().persist();
  },

  addFinanceRecord: (recordData) => {
    const id = generateId();
    const now = new Date().toISOString();
    const newRecord: FinanceRecord = { ...recordData, id, createdAt: now };
    set((state) => ({
      financeRecords: [newRecord, ...state.financeRecords],
    }));
    get().persist();
  },

  markMessageRead: (id) => {
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, isRead: true } : m
      ),
    }));
    get().persist();
  },

  markAllMessagesRead: () => {
    set((state) => ({
      messages: state.messages.map((m) => ({ ...m, isRead: true })),
    }));
    get().persist();
  },

  getTierPrice: (productId, quantity) => {
    const product = get().products.find((p) => p.id === productId);
    if (!product) return 0;
    const sorted = [...product.tierPrices].sort((a, b) => b.minQty - a.minQty);
    const matched = sorted.find((t) => quantity >= t.minQty);
    return matched ? matched.price : product.price;
  },

  persist: () => {
    try {
      const state = get();
      const data = {
        products: state.products,
        orders: state.orders,
        customers: state.customers,
        quotations: state.quotations,
        inventoryItems: state.inventoryItems,
        restockRecords: state.restockRecords,
        financeRecords: state.financeRecords,
        messages: state.messages,
      };
      Taro.setStorageSync(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      // ignore storage errors
    }
  },

  loadFromStorage: () => {
    try {
      const raw = Taro.getStorageSync(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        set({
          products: data.products || getDefaultState().products,
          orders: data.orders || getDefaultState().orders,
          customers: data.customers || getDefaultState().customers,
          quotations: data.quotations || getDefaultState().quotations,
          inventoryItems: data.inventoryItems || getDefaultState().inventoryItems,
          restockRecords: data.restockRecords || getDefaultState().restockRecords,
          financeRecords: data.financeRecords || getDefaultState().financeRecords,
          messages: data.messages || getDefaultState().messages,
        });
      }
    } catch (e) {
      // ignore storage errors
    }
  },
}));
