export interface Product {
  id: string;
  name: string;
  model: string;
  category: string;
  image: string;
  images: string[];
  price: number;
  costPrice: number;
  stock: number;
  warnStock: number;
  unit: string;
  spec: Record<string, string>;
  tierPrices: TierPrice[];
  description: string;
  createdAt: string;
}

export interface TierPrice {
  minQty: number;
  price: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  company: string;
  group: string;
  level: string;
  creditLimit: number;
  creditUsed: number;
  totalOrders: number;
  totalAmount: number;
  address: string;
  remark: string;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNo: string;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  totalAmount: number;
  deposit: number;
  balance: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  deliveryStatus: DeliveryStatus;
  createdAt: string;
  remark: string;
  salesman: string;
  paymentRecords: PaymentRecord[];
  returnRecords: ReturnRecord[];
}

export interface PaymentRecord {
  id: string;
  amount: number;
  type: 'deposit' | 'balance' | 'partial';
  remark: string;
  createdAt: string;
  financeRecordId: string;
}

export interface ReturnRecord {
  id: string;
  type: 'return' | 'exchange';
  items: ReturnItem[];
  reason: string;
  refundAmount: number;
  status: 'pending' | 'processed' | 'completed';
  createdAt: string;
}

export interface ReturnItem {
  productId: string;
  productName: string;
  model: string;
  quantity: number;
  price: number;
  amount: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  model: string;
  price: number;
  quantity: number;
  amount: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'completed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'partial' | 'paid';
export type DeliveryStatus = 'pending' | 'shipped' | 'delivered';

export interface Quotation {
  id: string;
  quotationNo: string;
  customerId: string;
  customerName: string;
  items: QuotationItem[];
  totalAmount: number;
  validDate: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  createdAt: string;
  remark: string;
}

export interface QuotationItem {
  productId: string;
  productName: string;
  productImage: string;
  model: string;
  price: number;
  quantity: number;
  amount: number;
}

export interface InventoryItem {
  productId: string;
  productName: string;
  productImage: string;
  model: string;
  category: string;
  stock: number;
  warnStock: number;
  unit: string;
  location: string;
  lastRestockDate: string;
}

export interface RestockRecord {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  supplier: string;
  cost: number;
  createdAt: string;
  status: 'pending' | 'completed';
}

export interface FinanceRecord {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  orderNo?: string;
  orderId?: string;
  customerId?: string;
  customerName?: string;
  description: string;
  createdAt: string;
}

export interface SalesRanking {
  rank: number;
  name: string;
  amount: number;
  orderCount: number;
}

export interface Message {
  id: string;
  type: 'system' | 'order' | 'inventory' | 'market';
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface StatsData {
  todayOrders: number;
  todaySales: number;
  monthSales: number;
  pendingOrders: number;
  lowStockCount: number;
  creditWarning: number;
}
