import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import OrderCard from '@/components/OrderCard';
import EmptyState from '@/components/EmptyState';
import { useStore } from '@/store';
import type { Order, OrderStatus } from '@/types';

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待确认' },
  { key: 'processing', label: '备货中' },
  { key: 'shipped', label: '已发货' },
  { key: 'completed', label: '已完成' }
];

const OrdersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    loadOrders();
  }, [activeTab]);

  useDidShow(() => {
    loadOrders();
  });

  const loadOrders = () => {
    let filtered = useStore.getState().orders;
    if (activeTab !== 'all') {
      filtered = filtered.filter(o => o.status === activeTab);
    }
    setOrders(filtered);
  };

  const handlePullDownRefresh = () => {
    loadOrders();
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 1000);
  };

  const handleScanOrder = () => {
    Taro.navigateTo({ url: '/pages/order-create/index' });
  };

  return (
    <View className={styles.ordersPage}>
      <ScrollView
        scrollX
        className={styles.tabs}
        showScrollbar={false}
      >
        {tabs.map(tab => (
          <View
            key={tab.key}
            className={`${styles.tabItem} ${activeTab === tab.key ? styles.active : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <Text>{tab.label}</Text>
          </View>
        ))}
      </ScrollView>

      <ScrollView
        scrollY
        refresherEnabled
        refresherTriggered={false}
        onRefresherRefresh={handlePullDownRefresh}
      >
        <View className={styles.orderList}>
          {orders.length > 0 ? (
            orders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))
          ) : (
            <EmptyState
              icon='📦'
              title='暂无订单'
              description='点击右下角扫码开单'
            />
          )}
        </View>
      </ScrollView>

      <View className={styles.fab} onClick={handleScanOrder}>
        <Text className={styles.fabIcon}>📷</Text>
      </View>
    </View>
  );
};

export default OrdersPage;
