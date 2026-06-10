import type { Product } from '@/types';

export const mockProducts: Product[] = [
  {
    id: '1',
    name: '现代简约吸顶灯',
    model: 'XD-8801-50W',
    category: '吸顶灯',
    image: 'https://picsum.photos/id/225/300/300',
    images: [
      'https://picsum.photos/id/225/600/600',
      'https://picsum.photos/id/230/600/600',
      'https://picsum.photos/id/221/600/600'
    ],
    price: 268.00,
    costPrice: 120.00,
    stock: 156,
    warnStock: 20,
    unit: '件',
    spec: {
      '功率': '50W',
      '色温': '三色变光',
      '尺寸': '直径50cm',
      '材质': '亚克力+铁艺',
      '电压': '220V',
      '适用面积': '15-25㎡'
    },
    tierPrices: [
      { minQty: 1, price: 268.00 },
      { minQty: 10, price: 238.00 },
      { minQty: 50, price: 208.00 },
      { minQty: 100, price: 188.00 }
    ],
    description: '现代简约风格，LED节能光源，无极调光调色，遥控控制',
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    name: '北欧风客厅吊灯',
    model: 'DD-6602-8头',
    category: '吊灯',
    image: 'https://picsum.photos/id/230/300/300',
    images: [
      'https://picsum.photos/id/230/600/600',
      'https://picsum.photos/id/225/600/600'
    ],
    price: 688.00,
    costPrice: 280.00,
    stock: 45,
    warnStock: 10,
    unit: '件',
    spec: {
      '光源': '8头E27灯座',
      '风格': '北欧简约',
      '材质': '铁艺+玻璃',
      '直径': '60cm',
      '高度': '可调节',
      '适用面积': '20-30㎡'
    },
    tierPrices: [
      { minQty: 1, price: 688.00 },
      { minQty: 5, price: 598.00 },
      { minQty: 20, price: 528.00 },
      { minQty: 50, price: 468.00 }
    ],
    description: '北欧风格设计，铁艺灯体，玻璃灯罩，可调节高度',
    createdAt: '2024-02-20T14:20:00Z'
  },
  {
    id: '3',
    name: 'LED筒灯 5W',
    model: 'TD-005-5W',
    category: '筒灯',
    image: 'https://picsum.photos/id/201/300/300',
    images: [
      'https://picsum.photos/id/201/600/600'
    ],
    price: 18.80,
    costPrice: 6.50,
    stock: 890,
    warnStock: 100,
    unit: '只',
    spec: {
      '功率': '5W',
      '色温': '正白光6000K',
      '开孔': '7.5cm',
      '材质': '铝材+PC',
      '寿命': '50000小时',
      '显色指数': 'Ra80'
    },
    tierPrices: [
      { minQty: 1, price: 18.80 },
      { minQty: 20, price: 15.80 },
      { minQty: 100, price: 12.80 },
      { minQty: 500, price: 10.80 }
    ],
    description: '高亮LED芯片，一体化散热设计，节能耐用',
    createdAt: '2024-01-08T09:15:00Z'
  },
  {
    id: '4',
    name: '护眼台灯',
    model: 'TD-3012-12W',
    category: '台灯',
    image: 'https://picsum.photos/id/221/300/300',
    images: [
      'https://picsum.photos/id/221/600/600',
      'https://picsum.photos/id/225/600/600'
    ],
    price: 198.00,
    costPrice: 78.00,
    stock: 78,
    warnStock: 15,
    unit: '台',
    spec: {
      '功率': '12W',
      '色温': '无极调光',
      '材质': 'ABS+铝合金',
      '功能': '触摸调光',
      '续航': '插电使用',
      '显色指数': 'Ra95'
    },
    tierPrices: [
      { minQty: 1, price: 198.00 },
      { minQty: 10, price: 168.00 },
      { minQty: 50, price: 148.00 }
    ],
    description: '国AA级护眼，无频闪无蓝光危害，学生学习专用',
    createdAt: '2024-03-01T11:45:00Z'
  },
  {
    id: '5',
    name: '水晶餐厅吊灯',
    model: 'DJ-8803-6头',
    category: '吊灯',
    image: 'https://picsum.photos/id/250/300/300',
    images: [
      'https://picsum.photos/id/250/600/600'
    ],
    price: 1288.00,
    costPrice: 520.00,
    stock: 12,
    warnStock: 5,
    unit: '件',
    spec: {
      '光源': '6头G9灯座',
      '风格': '欧式奢华',
      '材质': '水晶+不锈钢',
      '直径': '55cm',
      '高度': '120cm可调',
      '适用面积': '15-25㎡'
    },
    tierPrices: [
      { minQty: 1, price: 1288.00 },
      { minQty: 3, price: 1088.00 },
      { minQty: 10, price: 888.00 }
    ],
    description: '欧式水晶吊灯，奢华大气，适合餐厅/客厅装饰',
    createdAt: '2024-02-10T16:30:00Z'
  },
  {
    id: '6',
    name: 'LED灯带 2835',
    model: 'DD-2835-120D',
    category: '灯带',
    image: 'https://picsum.photos/id/3/300/300',
    images: [
      'https://picsum.photos/id/3/600/600'
    ],
    price: 12.50,
    costPrice: 4.20,
    stock: 2500,
    warnStock: 200,
    unit: '米',
    spec: {
      '型号': '2835',
      '灯珠密度': '120珠/米',
      '色温': '暖光3000K',
      '电压': '12V',
      '功率': '12W/米',
      '防水等级': 'IP20'
    },
    tierPrices: [
      { minQty: 1, price: 12.50 },
      { minQty: 100, price: 10.50 },
      { minQty: 500, price: 8.80 },
      { minQty: 1000, price: 7.50 }
    ],
    description: '2835高亮灯珠，120珠每米，光色均匀，吊顶装饰首选',
    createdAt: '2024-01-20T08:30:00Z'
  },
  {
    id: '7',
    name: '方形筒灯 12W',
    model: 'TD-012-12W',
    category: '筒灯',
    image: 'https://picsum.photos/id/1/300/300',
    images: [
      'https://picsum.photos/id/1/600/600'
    ],
    price: 35.80,
    costPrice: 12.80,
    stock: 320,
    warnStock: 50,
    unit: '只',
    spec: {
      '功率': '12W',
      '色温': '中性光4000K',
      '开孔': '10x10cm',
      '材质': '铝材+PC',
      '寿命': '50000小时',
      '显色指数': 'Ra80'
    },
    tierPrices: [
      { minQty: 1, price: 35.80 },
      { minQty: 20, price: 29.80 },
      { minQty: 100, price: 24.80 },
      { minQty: 300, price: 21.80 }
    ],
    description: '方形LED筒灯，超薄设计，商照工程首选',
    createdAt: '2024-02-28T10:00:00Z'
  },
  {
    id: '8',
    name: '床头壁灯',
    model: 'BD-2025-单头',
    category: '壁灯',
    image: 'https://picsum.photos/id/119/300/300',
    images: [
      'https://picsum.photos/id/119/600/600'
    ],
    price: 158.00,
    costPrice: 58.00,
    stock: 65,
    warnStock: 10,
    unit: '只',
    spec: {
      '光源': 'E27灯座',
      '风格': '现代简约',
      '材质': '铁艺+布艺',
      '尺寸': '宽20cm高40cm',
      '适用': '卧室/客厅',
      '是否带开关': '是'
    },
    tierPrices: [
      { minQty: 1, price: 158.00 },
      { minQty: 10, price: 128.00 },
      { minQty: 30, price: 108.00 }
    ],
    description: '现代简约床头壁灯，布艺灯罩，柔和光线，保护视力',
    createdAt: '2024-03-10T14:20:00Z'
  },
  {
    id: '9',
    name: '工业风吊线灯',
    model: 'DD-9001-单头',
    category: '吊灯',
    image: 'https://picsum.photos/id/160/300/300',
    images: [
      'https://picsum.photos/id/160/600/600'
    ],
    price: 88.00,
    costPrice: 32.00,
    stock: 200,
    warnStock: 30,
    unit: '只',
    spec: {
      '光源': 'E27灯座',
      '风格': '工业复古',
      '材质': '铁艺+铝线',
      '线长': '1.5米可调',
      '适用': '餐厅/吧台',
      '灯罩直径': '15cm'
    },
    tierPrices: [
      { minQty: 1, price: 88.00 },
      { minQty: 10, price: 72.00 },
      { minQty: 50, price: 58.00 },
      { minQty: 100, price: 48.00 }
    ],
    description: '工业复古风格，个性创意设计，适合餐饮、咖啡等商业空间',
    createdAt: '2024-01-25T09:45:00Z'
  },
  {
    id: '10',
    name: '卫生间集成吊顶灯',
    model: 'CJ-300-18W',
    category: '面板灯',
    image: 'https://picsum.photos/id/2/300/300',
    images: [
      'https://picsum.photos/id/2/600/600'
    ],
    price: 68.00,
    costPrice: 22.00,
    stock: 500,
    warnStock: 80,
    unit: '只',
    spec: {
      '功率': '18W',
      '尺寸': '300x300mm',
      '色温': '正白光',
      '材质': '铝合金框+亚克力',
      '安装方式': '集成吊顶',
      '防水等级': 'IP44'
    },
    tierPrices: [
      { minQty: 1, price: 68.00 },
      { minQty: 10, price: 56.00 },
      { minQty: 50, price: 46.00 },
      { minQty: 200, price: 38.00 }
    ],
    description: '集成吊顶专用，卫生间厨房适用，防水防潮，亮白节能',
    createdAt: '2024-02-05T11:30:00Z'
  }
];

export const productCategories = [
  { id: 'all', name: '全部', count: 0 },
  { id: '吸顶灯', name: '吸顶灯', count: 0 },
  { id: '吊灯', name: '吊灯', count: 0 },
  { id: '筒灯', name: '筒灯', count: 0 },
  { id: '台灯', name: '台灯', count: 0 },
  { id: '灯带', name: '灯带', count: 0 },
  { id: '壁灯', name: '壁灯', count: 0 },
  { id: '面板灯', name: '面板灯', count: 0 }
];
