import type { InventoryItem, RestockRecord } from '@/types';

export const mockInventoryItems: InventoryItem[] = [
  {
    productId: '1',
    productName: '现代简约吸顶灯',
    productImage: 'https://picsum.photos/id/225/200/200',
    model: 'XD-8801-50W',
    category: '吸顶灯',
    stock: 156,
    warnStock: 20,
    unit: '件',
    location: 'A区-01货架',
    lastRestockDate: '2024-06-01'
  },
  {
    productId: '2',
    productName: '北欧风客厅吊灯',
    productImage: 'https://picsum.photos/id/230/200/200',
    model: 'DD-6602-8头',
    category: '吊灯',
    stock: 45,
    warnStock: 10,
    unit: '件',
    location: 'A区-03货架',
    lastRestockDate: '2024-05-28'
  },
  {
    productId: '3',
    productName: 'LED筒灯 5W',
    productImage: 'https://picsum.photos/id/201/200/200',
    model: 'TD-005-5W',
    category: '筒灯',
    stock: 890,
    warnStock: 100,
    unit: '只',
    location: 'B区-02货架',
    lastRestockDate: '2024-06-05'
  },
  {
    productId: '4',
    productName: '护眼台灯',
    productImage: 'https://picsum.photos/id/221/200/200',
    model: 'TD-3012-12W',
    category: '台灯',
    stock: 78,
    warnStock: 15,
    unit: '台',
    location: 'C区-01货架',
    lastRestockDate: '2024-06-02'
  },
  {
    productId: '5',
    productName: '水晶餐厅吊灯',
    productImage: 'https://picsum.photos/id/250/200/200',
    model: 'DJ-8803-6头',
    category: '吊灯',
    stock: 12,
    warnStock: 5,
    unit: '件',
    location: 'A区-05货架',
    lastRestockDate: '2024-05-20'
  },
  {
    productId: '6',
    productName: 'LED灯带 2835',
    productImage: 'https://picsum.photos/id/3/200/200',
    model: 'DD-2835-120D',
    category: '灯带',
    stock: 2500,
    warnStock: 200,
    unit: '米',
    location: 'D区-01货架',
    lastRestockDate: '2024-06-08'
  },
  {
    productId: '7',
    productName: '方形筒灯 12W',
    productImage: 'https://picsum.photos/id/1/200/200',
    model: 'TD-012-12W',
    category: '筒灯',
    stock: 320,
    warnStock: 50,
    unit: '只',
    location: 'B区-03货架',
    lastRestockDate: '2024-06-03'
  },
  {
    productId: '8',
    productName: '床头壁灯',
    productImage: 'https://picsum.photos/id/119/200/200',
    model: 'BD-2025-单头',
    category: '壁灯',
    stock: 65,
    warnStock: 10,
    unit: '只',
    location: 'A区-07货架',
    lastRestockDate: '2024-05-30'
  },
  {
    productId: '9',
    productName: '工业风吊线灯',
    productImage: 'https://picsum.photos/id/160/200/200',
    model: 'DD-9001-单头',
    category: '吊灯',
    stock: 200,
    warnStock: 30,
    unit: '只',
    location: 'A区-02货架',
    lastRestockDate: '2024-06-04'
  },
  {
    productId: '10',
    productName: '卫生间集成吊顶灯',
    productImage: 'https://picsum.photos/id/2/200/200',
    model: 'CJ-300-18W',
    category: '面板灯',
    stock: 500,
    warnStock: 80,
    unit: '只',
    location: 'B区-05货架',
    lastRestockDate: '2024-06-06'
  }
];

export const mockRestockRecords: RestockRecord[] = [
  {
    id: '1',
    productId: '3',
    productName: 'LED筒灯 5W',
    quantity: 500,
    supplier: '佛山照明厂',
    cost: 2600,
    createdAt: '2024-06-05T10:30:00Z',
    status: 'completed'
  },
  {
    id: '2',
    productId: '6',
    productName: 'LED灯带 2835',
    quantity: 1000,
    supplier: '深圳光电子',
    cost: 4200,
    createdAt: '2024-06-08T09:15:00Z',
    status: 'completed'
  },
  {
    id: '3',
    productId: '5',
    productName: '水晶餐厅吊灯',
    quantity: 20,
    supplier: '中山水晶灯厂',
    cost: 10400,
    createdAt: '2024-06-09T14:00:00Z',
    status: 'pending'
  },
  {
    id: '4',
    productId: '7',
    productName: '方形筒灯 12W',
    quantity: 200,
    supplier: '佛山照明厂',
    cost: 2560,
    createdAt: '2024-06-10T08:45:00Z',
    status: 'pending'
  }
];
