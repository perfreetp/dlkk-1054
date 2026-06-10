import type { Message } from '@/types';

export const mockMessages: Message[] = [
  {
    id: '1',
    type: 'market',
    title: '市场通知：6月灯具采购节活动',
    content: '各位商户，华东灯具城2024年中采购节将于6月15日-6月20日举行，届时将有大型促销活动和新品发布会，请各位商户提前备货，积极参与。展位报名请联系市场管理处。',
    isRead: false,
    createdAt: '2024-06-10T09:00:00Z'
  },
  {
    id: '2',
    type: 'order',
    title: '新订单提醒',
    content: '您有一笔新订单 DD20240610001 待处理，客户：张伟 - 光明灯具城，金额：¥6,340.00',
    isRead: false,
    createdAt: '2024-06-10T09:30:00Z'
  },
  {
    id: '3',
    type: 'inventory',
    title: '库存预警提醒',
    content: '您有3款商品库存不足预警：水晶餐厅吊灯（12件）、护眼台灯（78台）、床头壁灯（65只），请及时补货。',
    isRead: false,
    createdAt: '2024-06-10T08:00:00Z'
  },
  {
    id: '4',
    type: 'system',
    title: '系统升级通知',
    content: '系统将于今晚22:00-24:00进行升级维护，期间可能会影响正常使用，请提前保存数据。给您带来的不便，敬请谅解。',
    isRead: true,
    createdAt: '2024-06-09T18:00:00Z'
  },
  {
    id: '5',
    type: 'market',
    title: '市场通知：消防安全检查',
    content: '市场管理处将于6月12日进行消防安全大检查，请各商户检查消防设施，清除安全隐患，确保店铺符合消防安全规范。',
    isRead: true,
    createdAt: '2024-06-08T10:30:00Z'
  },
  {
    id: '6',
    type: 'order',
    title: '订单已发货',
    content: '订单 DD20240609002 已发货，客户：王芳 - 佳美装饰，预计明天上午送达。',
    isRead: true,
    createdAt: '2024-06-09T16:00:00Z'
  },
  {
    id: '7',
    type: 'inventory',
    title: '补货入库通知',
    content: '您的补货单已入库：LED灯带 2835 共1000米，已存入D区-01货架。',
    isRead: true,
    createdAt: '2024-06-08T14:20:00Z'
  },
  {
    id: '8',
    type: 'system',
    title: '新功能上线：扫码开单',
    content: 'App新增扫码开单功能，扫描商品条码即可快速录入商品信息，开单效率提升50%，快来体验吧！',
    isRead: true,
    createdAt: '2024-06-05T09:00:00Z'
  }
];
