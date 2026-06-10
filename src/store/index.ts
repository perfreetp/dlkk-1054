import { create } from 'zustand';
import Taro from '@tarojs/taro';
import { mockProducts, productCategories } from '@/data/products';
import { mockOrders } from '@/data/orders';
import { mockCustomers, customerGroups } from '@/data/customers';
import { mockQuotations } from '@/data/quotations';
import { mockInventoryItems, mockRestockRecords } from '@/data/inventory';
import { mockFinanceRecords, mockProductSalesRanking, mockStaffPerformance, mockStatsSummary } from '@/data/finance';
import { mockMessages } from '@/data/messages';
import type {
  Product, Order, Customer, Quotation, InventoryItem, RestockRecord, FinanceRecord,
  Message, OrderItem, QuotationItem, TierPrice, PaymentRecord, ReturnRecord
} from '@/types';

interface StoreState {
  products: Product[];
  orders: Order[];
  customers: Customer[];
  quotations: Quotation[];
  inventoryItems: InventoryItem[];
  restockRecords: RestockRecord[];
  financeRecords: FinanceRecord[];
  messages: Message[];
  storageLoaded: boolean;

  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, data: Partial<Product>) => void;

  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'paymentRecords' | 'returnRecords'>) => void;
  updateOrder: (id: string, data: Partial<Order>) => void;
  payDeposit: (orderId: string, amount: number, remark?: string) => void;
  payBalance: (orderId: string, amount: number, remark?: string) => void;
  addPayment: (orderId: string, amount: number, type: PaymentRecord['type'], remark?: string) => void;

  addQuotation: (quotation: Omit<Quotation, 'id' | 'createdAt'>) => void;
  updateQuotation: (id: string, data: Partial<Quotation>) => void;
  convertQuotationToOrder: (quotationId: string) => string | null;

  addRestockRecord: (record: Omit<RestockRecord, 'id' | 'createdAt'>) => void;
  confirmRestock: (id: string) => void;

  addFinanceRecord: (record: Omit<FinanceRecord, 'id' | 'createdAt'>) => void;

  markMessageRead: (id: string) => void;
  markAllMessagesRead: () => void;

  addReturnRecord: (orderId: string, data: Omit<ReturnRecord, 'id' | 'createdAt' | 'status'>) => void;
  processReturn: (orderId: string, returnId: string) => void;

  getTierPrice: (productId: string, quantity: number) => number;
  filterFinanceRecords: (filters: {
    dateFrom?: string;
    dateTo?: string;
    customerId?: string;
    orderNo?: string;
  }) => FinanceRecord[];
  getMonthlySummary: (year?: number, month?: number) => {
    totalIncome: number;
    totalExpense: number;
    profit: number;
    unpaidBalance: number;
  };
  generateOrderShareContent: (orderId: string) => string;
  generateQuotationShareContent: (quotationId: string) => string;

  persist: () => void;
  loadFromStorage: () => boolean;
}

const STORAGE_KEY = 'lamp_wholesale_store_v2';

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

const patchMockOrders = (): Order[] => {
  return mockOrders.map((o) => ({
    ...o,
    paymentRecords: o.paymentRecords || [],
    returnRecords: o.returnRecords || [],
  }));
};

const getDefaultState = () => ({
  products: [...mockProducts],
  orders: patchMockOrders(),
  customers: [...mockCustomers],
  quotations: [...mockQuotations],
  inventoryItems: [...mockInventoryItems],
  restockRecords: [...mockRestockRecords],
  financeRecords: [...mockFinanceRecords],
  messages: [...mockMessages],
  storageLoaded: false,
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
    const newOrder: Order = {
      ...orderData,
      id,
      createdAt: now,
      paymentRecords: [],
      returnRecords: [],
    };
    set((state) => ({ orders: [newOrder, ...state.orders] }));
    get().persist();
  },

  updateOrder: (id, data) => {
    set((state) => ({
      orders: state.orders.map((o) => (o.id === id ? { ...o, ...data } : o)),
    }));
    get().persist();
  },

  addPayment: (orderId, amount, type, remark = '') => {
    if (amount <= 0) return;
    const state = get();
    const order = state.orders.find((o) => o.id === orderId);
    if (!order) return;

    const financeId = generateId();
    const paymentId = generateId();
    const now = new Date().toISOString();

    const actualAmount = Math.min(amount, order.balance);
    const newDeposit = order.deposit + actualAmount;
    const newBalance = Math.max(0, order.balance - actualAmount);
    const newPaymentStatus: Order['paymentStatus'] =
      newBalance <= 0 ? 'paid' : newDeposit > 0 ? 'partial' : 'unpaid';

    const descMap: Record<PaymentRecord['type'], string> = {
      deposit: '订单订金收入',
      balance: '订单尾款收入',
      partial: '订单分期收款',
    };

    const newPayment: PaymentRecord = {
      id: paymentId,
      amount: actualAmount,
      type,
      remark,
      createdAt: now,
      financeRecordId: financeId,
    };

    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              deposit: newDeposit,
              balance: newBalance,
              paymentStatus: newPaymentStatus,
              paymentRecords: [...(o.paymentRecords || []), newPayment],
            }
          : o
      ),
      financeRecords: [
        {
          id: financeId,
          type: 'income',
          category: '订单收入',
          amount: actualAmount,
          orderId,
          orderNo: order.orderNo,
          customerId: order.customerId,
          customerName: order.customerName,
          description: `${descMap[type]}${remark ? ` - ${remark}` : ''}`,
          createdAt: now,
        },
        ...state.financeRecords,
      ],
    }));
    get().persist();
  },

  payDeposit: (orderId, amount, remark) => {
    get().addPayment(orderId, amount, 'deposit', remark);
  },

  payBalance: (orderId, amount, remark) => {
    get().addPayment(orderId, amount, 'balance', remark);
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
      paymentRecords: [],
      returnRecords: [],
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
          customerName: record.supplier,
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

  addReturnRecord: (orderId, data) => {
    const now = new Date().toISOString();
    const newReturn: ReturnRecord = {
      ...data,
      id: generateId(),
      createdAt: now,
      status: 'pending',
    };

    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId
          ? { ...o, returnRecords: [...(o.returnRecords || []), newReturn] }
          : o
      ),
    }));
    get().persist();
  },

  processReturn: (orderId, returnId) => {
    const state = get();
    const order = state.orders.find((o) => o.id === orderId);
    if (!order) return;
    const ret = (order.returnRecords || []).find((r) => r.id === returnId);
    if (!ret || ret.status === 'completed') return;

    const now = new Date().toISOString();
    const financeId = generateId();

    set((s) => {
      const newOrders = s.orders.map((o) => {
        if (o.id !== orderId) return o;
        const updatedReturns = (o.returnRecords || []).map((r) =>
          r.id === returnId ? { ...r, status: 'completed' as const } : r
        );
        const newTotal = Math.max(0, o.totalAmount - ret.refundAmount);
        const newDeposit = Math.min(o.deposit, newTotal);
        const newBalance = Math.max(0, newTotal - newDeposit);
        const newPaymentStatus: Order['paymentStatus'] =
          newBalance <= 0 ? 'paid' : newDeposit > 0 ? 'partial' : 'unpaid';
        return {
          ...o,
          returnRecords: updatedReturns,
          totalAmount: newTotal,
          balance: newBalance,
          deposit: newDeposit,
          paymentStatus: newPaymentStatus,
        };
      });

      const newProducts = s.products.map((p) => {
        if (ret.type === 'return') {
          const match = ret.items.find((it) => it.productId === p.id);
          if (match) return { ...p, stock: p.stock + match.quantity };
        }
        return p;
      });

      const newInventory = s.inventoryItems.map((item) => {
        if (ret.type === 'return') {
          const match = ret.items.find((it) => it.productId === item.productId);
          if (match) return { ...item, stock: item.stock + match.quantity };
        }
        return item;
      });

      const newFinance: FinanceRecord = {
        id: financeId,
        type: 'expense',
        category: '退款支出',
        amount: ret.refundAmount,
        orderId,
        orderNo: order.orderNo,
        customerId: order.customerId,
        customerName: order.customerName,
        description: `${ret.type === 'return' ? '退货' : '换货'}退款 - ${ret.reason}`,
        createdAt: now,
      };

      return {
        orders: newOrders,
        products: newProducts,
        inventoryItems: newInventory,
        financeRecords: [newFinance, ...s.financeRecords],
      };
    });
    get().persist();
  },

  getTierPrice: (productId, quantity) => {
    const product = get().products.find((p) => p.id === productId);
    if (!product) return 0;
    const sorted = [...product.tierPrices].sort((a, b) => b.minQty - a.minQty);
    const matched = sorted.find((t) => quantity >= t.minQty);
    return matched ? matched.price : product.price;
  },

  filterFinanceRecords: (filters) => {
    const { dateFrom, dateTo, customerId, orderNo } = filters;
    return get().financeRecords.filter((r) => {
      if (dateFrom && r.createdAt.slice(0, 10) < dateFrom) return false;
      if (dateTo && r.createdAt.slice(0, 10) > dateTo) return false;
      if (customerId && r.customerId !== customerId) return false;
      if (orderNo && !(r.orderNo || '').includes(orderNo)) return false;
      return true;
    });
  },

  getMonthlySummary: (y, m) => {
    const now = new Date();
    const year = y ?? now.getFullYear();
    const month = m ?? now.getMonth();
    const state = get();

    let totalIncome = 0;
    let totalExpense = 0;

    state.financeRecords.forEach((r) => {
      const dt = new Date(r.createdAt);
      if (dt.getFullYear() === year && dt.getMonth() === month) {
        if (r.type === 'income') totalIncome += r.amount;
        else totalExpense += r.amount;
      }
    });

    let unpaidBalance = 0;
    state.orders.forEach((o) => {
      const dt = new Date(o.createdAt);
      if (dt.getFullYear() === year && dt.getMonth() === month) {
        unpaidBalance += o.balance;
      }
    });

    return {
      totalIncome,
      totalExpense,
      profit: totalIncome - totalExpense,
      unpaidBalance,
    };
  },

  generateOrderShareContent: (orderId) => {
    const order = get().orders.find((o) => o.id === orderId);
    if (!order) return '';
    const lines: string[] = [];
    lines.push(`【订单确认单】`);
    lines.push(`单号：${order.orderNo}`);
    lines.push(`客户：${order.customerName}`);
    lines.push(`开单时间：${order.createdAt.slice(0, 19).replace('T', ' ')}`);
    lines.push('');
    lines.push('📦 商品清单：');
    order.items.forEach((it, i) => {
      lines.push(`${i + 1}. ${it.productName}（${it.model}）`);
      lines.push(`   数量：${it.quantity}  单价：￥${it.price.toFixed(2)}  小计：￥${it.amount.toFixed(2)}`);
    });
    lines.push('');
    lines.push(`💰 应收总额：￥${order.totalAmount.toFixed(2)}`);
    lines.push(`✅ 已收款：￥${order.deposit.toFixed(2)}`);
    lines.push(`⏳ 待收款：￥${order.balance.toFixed(2)}`);
    if (order.remark) {
      lines.push('');
      lines.push(`备注：${order.remark}`);
    }
    lines.push('');
    lines.push('——— 灯具批发中心 ———');
    return lines.join('\n');
  },

  generateQuotationShareContent: (quotationId) => {
    const q = get().quotations.find((x) => x.id === quotationId);
    if (!q) return '';
    const lines: string[] = [];
    lines.push(`【客户报价单】`);
    lines.push(`单号：${q.quotationNo}`);
    lines.push(`客户：${q.customerName}`);
    lines.push(`有效期至：${q.validDate}`);
    lines.push('');
    lines.push('📦 商品清单（阶梯批发价）：');
    q.items.forEach((it, i) => {
      const prod = get().products.find((p) => p.id === it.productId);
      lines.push(`${i + 1}. ${it.productName}（${it.model}）`);
      lines.push(`   数量：${it.quantity}  单价：￥${it.price.toFixed(2)}  小计：￥${it.amount.toFixed(2)}`);
      if (prod && prod.tierPrices.length > 0) {
        lines.push(`   阶梯价参考：${prod.tierPrices
          .sort((a, b) => a.minQty - b.minQty)
          .map((t) => `≥${t.minQty}件￥${t.price.toFixed(2)}`)
          .join(' / ')}`);
      }
    });
    lines.push('');
    lines.push(`💰 报价总额：￥${q.totalAmount.toFixed(2)}`);
    if (q.remark) {
      lines.push('');
      lines.push(`备注：${q.remark}`);
    }
    lines.push('');
    lines.push('——— 灯具批发中心 ———');
    return lines.join('\n');
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
          orders: (data.orders || getDefaultState().orders).map((o: Order) => ({
            ...o,
            paymentRecords: o.paymentRecords || [],
            returnRecords: o.returnRecords || [],
          })),
          customers: data.customers || getDefaultState().customers,
          quotations: data.quotations || getDefaultState().quotations,
          inventoryItems: data.inventoryItems || getDefaultState().inventoryItems,
          restockRecords: data.restockRecords || getDefaultState().restockRecords,
          financeRecords: data.financeRecords || getDefaultState().financeRecords,
          messages: data.messages || getDefaultState().messages,
          storageLoaded: true,
        });
        return true;
      } else {
        set({ storageLoaded: true });
        return false;
      }
    } catch (e) {
      set({ storageLoaded: true });
      return false;
    }
  },
}));
