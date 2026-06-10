import type { Quotation } from '@/types';

export const mockQuotations: Quotation[] = [
  {
    id: '1',
    quotationNo: 'BJ20240610001',
    customerId: '1',
    customerName: '张伟 - 光明灯具城',
    items: [
      {
        productId: '1',
        productName: '现代简约吸顶灯',
        productImage: 'https://picsum.photos/id/225/200/200',
        model: 'XD-8801-50W',
        price: 238.00,
        quantity: 50,
        amount: 11900.00
      },
      {
        productId: '3',
        productName: 'LED筒灯 5W',
        productImage: 'https://picsum.photos/id/201/200/200',
        model: 'TD-005-5W',
        price: 12.80,
        quantity: 200,
        amount: 2560.00
      }
    ],
    totalAmount: 14460.00,
    validDate: '2024-06-20',
    status: 'sent',
    createdAt: '2024-06-10T10:00:00Z',
    remark: '新店装修补货，价格按老客户优惠'
  },
  {
    id: '2',
    quotationNo: 'BJ20240609002',
    customerId: '3',
    customerName: '刘强 - 星辰酒店',
    items: [
      {
        productId: '4',
        productName: '护眼台灯',
        productImage: 'https://picsum.photos/id/221/200/200',
        model: 'TD-3012-12W',
        price: 148.00,
        quantity: 100,
        amount: 14800.00
      },
      {
        productId: '10',
        productName: '卫生间集成吊顶灯',
        productImage: 'https://picsum.photos/id/2/200/200',
        model: 'CJ-300-18W',
        price: 38.00,
        quantity: 80,
        amount: 3040.00
      }
    ],
    totalAmount: 17840.00,
    validDate: '2024-06-19',
    status: 'accepted',
    createdAt: '2024-06-09T15:30:00Z',
    remark: '酒店二期工程报价单'
  },
  {
    id: '3',
    quotationNo: 'BJ20240608001',
    customerId: '2',
    customerName: '王芳 - 佳美装饰',
    items: [
      {
        productId: '2',
        productName: '北欧风客厅吊灯',
        productImage: 'https://picsum.photos/id/230/200/200',
        model: 'DD-6602-8头',
        price: 528.00,
        quantity: 10,
        amount: 5280.00
      }
    ],
    totalAmount: 5280.00,
    validDate: '2024-06-18',
    status: 'draft',
    createdAt: '2024-06-08T11:20:00Z',
    remark: ''
  },
  {
    id: '4',
    quotationNo: 'BJ20240605001',
    customerId: '5',
    customerName: '赵磊 - 鑫辉工程',
    items: [
      {
        productId: '7',
        productName: '方形筒灯 12W',
        productImage: 'https://picsum.photos/id/1/200/200',
        model: 'TD-012-12W',
        price: 21.80,
        quantity: 500,
        amount: 10900.00
      },
      {
        productId: '6',
        productName: 'LED灯带 2835',
        productImage: 'https://picsum.photos/id/3/200/200',
        model: 'DD-2835-120D',
        price: 7.50,
        quantity: 1000,
        amount: 7500.00
      }
    ],
    totalAmount: 18400.00,
    validDate: '2024-06-15',
    status: 'expired',
    createdAt: '2024-06-05T09:00:00Z',
    remark: '办公楼装修项目'
  }
];
