import type { Order } from '@/types';

export const mockOrders: Order[] = [
  {
    id: '1',
    orderNo: 'DD20240610001',
    customerId: '1',
    customerName: '张伟 - 光明灯具城',
    items: [
      {
        productId: '1',
        productName: '现代简约吸顶灯',
        productImage: 'https://picsum.photos/id/225/200/200',
        model: 'XD-8801-50W',
        price: 238.00,
        quantity: 20,
        amount: 4760.00
      },
      {
        productId: '3',
        productName: 'LED筒灯 5W',
        productImage: 'https://picsum.photos/id/201/200/200',
        model: 'TD-005-5W',
        price: 15.80,
        quantity: 100,
        amount: 1580.00
      }
    ],
    totalAmount: 6340.00,
    deposit: 2000.00,
    balance: 4340.00,
    status: 'processing',
    paymentStatus: 'partial',
    deliveryStatus: 'pending',
    createdAt: '2024-06-10T09:30:00Z',
    remark: '客户要求明天上午送货',
    salesman: '李销售'
  },
  {
    id: '2',
    orderNo: 'DD20240609002',
    customerId: '2',
    customerName: '王芳 - 佳美装饰',
    items: [
      {
        productId: '2',
        productName: '北欧风客厅吊灯',
        productImage: 'https://picsum.photos/id/230/200/200',
        model: 'DD-6602-8头',
        price: 598.00,
        quantity: 5,
        amount: 2990.00
      },
      {
        productId: '8',
        productName: '床头壁灯',
        productImage: 'https://picsum.photos/id/119/200/200',
        model: 'BD-2025-单头',
        price: 128.00,
        quantity: 10,
        amount: 1280.00
      }
    ],
    totalAmount: 4270.00,
    deposit: 4270.00,
    balance: 0,
    status: 'shipped',
    paymentStatus: 'paid',
    deliveryStatus: 'shipped',
    createdAt: '2024-06-09T14:20:00Z',
    remark: '',
    salesman: '李销售'
  },
  {
    id: '3',
    orderNo: 'DD20240609001',
    customerId: '3',
    customerName: '刘强 - 星辰酒店',
    items: [
      {
        productId: '6',
        productName: 'LED灯带 2835',
        productImage: 'https://picsum.photos/id/3/200/200',
        model: 'DD-2835-120D',
        price: 8.80,
        quantity: 500,
        amount: 4400.00
      },
      {
        productId: '4',
        productName: '护眼台灯',
        productImage: 'https://picsum.photos/id/221/200/200',
        model: 'TD-3012-12W',
        price: 168.00,
        quantity: 30,
        amount: 5040.00
      }
    ],
    totalAmount: 9440.00,
    deposit: 3000.00,
    balance: 6440.00,
    status: 'pending',
    paymentStatus: 'partial',
    deliveryStatus: 'pending',
    createdAt: '2024-06-09T10:15:00Z',
    remark: '工程单，价格按老客户优惠',
    salesman: '张店长'
  },
  {
    id: '4',
    orderNo: 'DD20240608003',
    customerId: '4',
    customerName: '陈静 - 美居软装',
    items: [
      {
        productId: '5',
        productName: '水晶餐厅吊灯',
        productImage: 'https://picsum.photos/id/250/200/200',
        model: 'DJ-8803-6头',
        price: 1088.00,
        quantity: 2,
        amount: 2176.00
      }
    ],
    totalAmount: 2176.00,
    deposit: 2176.00,
    balance: 0,
    status: 'completed',
    paymentStatus: 'paid',
    deliveryStatus: 'delivered',
    createdAt: '2024-06-08T15:45:00Z',
    remark: '',
    salesman: '李销售'
  },
  {
    id: '5',
    orderNo: 'DD20240608002',
    customerId: '5',
    customerName: '赵磊 - 鑫辉工程',
    items: [
      {
        productId: '7',
        productName: '方形筒灯 12W',
        productImage: 'https://picsum.photos/id/1/200/200',
        model: 'TD-012-12W',
        price: 24.80,
        quantity: 200,
        amount: 4960.00
      },
      {
        productId: '10',
        productName: '卫生间集成吊顶灯',
        productImage: 'https://picsum.photos/id/2/200/200',
        model: 'CJ-300-18W',
        price: 46.00,
        quantity: 50,
        amount: 2300.00
      }
    ],
    totalAmount: 7260.00,
    deposit: 0,
    balance: 7260.00,
    status: 'confirmed',
    paymentStatus: 'unpaid',
    deliveryStatus: 'pending',
    createdAt: '2024-06-08T09:00:00Z',
    remark: '月结客户，月底一起结算',
    salesman: '张店长'
  },
  {
    id: '6',
    orderNo: 'DD20240607001',
    customerId: '1',
    customerName: '张伟 - 光明灯具城',
    items: [
      {
        productId: '9',
        productName: '工业风吊线灯',
        productImage: 'https://picsum.photos/id/160/200/200',
        model: 'DD-9001-单头',
        price: 58.00,
        quantity: 50,
        amount: 2900.00
      }
    ],
    totalAmount: 2900.00,
    deposit: 2900.00,
    balance: 0,
    status: 'completed',
    paymentStatus: 'paid',
    deliveryStatus: 'delivered',
    createdAt: '2024-06-07T11:30:00Z',
    remark: '',
    salesman: '李销售'
  }
];
