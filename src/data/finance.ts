import type { FinanceRecord, SalesRanking } from '@/types';

export const mockFinanceRecords: FinanceRecord[] = [
  {
    id: '1',
    type: 'income',
    category: '订单收入',
    amount: 6340.00,
    orderNo: 'DD20240610001',
    customerName: '张伟 - 光明灯具城',
    description: '订单订金收入',
    createdAt: '2024-06-10T09:35:00Z'
  },
  {
    id: '2',
    type: 'income',
    category: '订单收入',
    amount: 4270.00,
    orderNo: 'DD20240609002',
    customerName: '王芳 - 佳美装饰',
    description: '订单全款收入',
    createdAt: '2024-06-09T14:25:00Z'
  },
  {
    id: '3',
    type: 'expense',
    category: '进货支出',
    amount: 4200.00,
    description: 'LED灯带进货成本',
    createdAt: '2024-06-08T11:00:00Z'
  },
  {
    id: '4',
    type: 'income',
    category: '订单收入',
    amount: 2176.00,
    orderNo: 'DD20240608003',
    customerName: '陈静 - 美居软装',
    description: '订单全款收入',
    createdAt: '2024-06-08T15:50:00Z'
  },
  {
    id: '5',
    type: 'expense',
    category: '物流费用',
    amount: 280.00,
    description: '发往宁波物流费',
    createdAt: '2024-06-07T10:30:00Z'
  },
  {
    id: '6',
    type: 'income',
    category: '订单收入',
    amount: 2900.00,
    orderNo: 'DD20240607001',
    customerName: '张伟 - 光明灯具城',
    description: '订单全款收入',
    createdAt: '2024-06-07T11:35:00Z'
  },
  {
    id: '7',
    type: 'expense',
    category: '店铺租金',
    amount: 8500.00,
    description: '6月店铺租金',
    createdAt: '2024-06-01T08:00:00Z'
  },
  {
    id: '8',
    type: 'income',
    category: '订单收入',
    amount: 3000.00,
    orderNo: 'DD20240609001',
    customerName: '刘强 - 星辰酒店',
    description: '订单订金收入',
    createdAt: '2024-06-09T10:20:00Z'
  }
];

export const mockProductSalesRanking: SalesRanking[] = [
  { rank: 1, name: 'LED灯带 2835', amount: 23400, orderCount: 28 },
  { rank: 2, name: 'LED筒灯 5W', amount: 18650, orderCount: 35 },
  { rank: 3, name: '现代简约吸顶灯', amount: 15800, orderCount: 18 },
  { rank: 4, name: '方形筒灯 12W', amount: 12400, orderCount: 22 },
  { rank: 5, name: '工业风吊线灯', amount: 9600, orderCount: 15 },
  { rank: 6, name: '卫生间集成吊顶灯', amount: 8200, orderCount: 12 },
  { rank: 7, name: '北欧风客厅吊灯', amount: 7800, orderCount: 8 },
  { rank: 8, name: '护眼台灯', amount: 6500, orderCount: 10 }
];

export const mockStaffPerformance: SalesRanking[] = [
  { rank: 1, name: '张店长', amount: 128600, orderCount: 45 },
  { rank: 2, name: '李销售', amount: 96800, orderCount: 38 },
  { rank: 3, name: '王店员', amount: 52300, orderCount: 25 },
  { rank: 4, name: '刘店员', amount: 35600, orderCount: 18 }
];

export const mockStatsSummary = {
  monthIncome: 156800,
  monthExpense: 68500,
  monthProfit: 88300,
  monthOrders: 126,
  avgOrderAmount: 1244.44
};
