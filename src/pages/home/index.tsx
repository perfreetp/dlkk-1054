import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import OrderCard from '@/components/OrderCard';
import EmptyState from '@/components/EmptyState';
import { mockOrders } from '@/data/orders';
import { mockMessages } from '@/data/messages';
import { mockInventoryItems } from '@/data/inventory';
import { mockCustomers } from '@/data/customers';
import { formatPrice, formatNumber } from '@/utils/format';
import type { Order, Message } from '@/types';

const HomePage: React.FC = () => {
  const [todayOrders, setTodayOrders] = useState<Order[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [creditWarningCount, setCreditWarningCount] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  useDidShow(() => {
    loadData();
  });

  const loadData = () => {
    setTodayOrders(mockOrders.slice(0, 3));

    const unread = mockMessages.filter(m => !m.isRead).length;
    setUnreadCount(unread);

    const lowStock = mockInventoryItems.filter(item => item.stock <= item.warnStock).length;
    setLowStockCount(lowStock);

    const creditWarning = mockCustomers.filter(c => c.creditUsed >= c.creditLimit * 0.8).length;
    setCreditWarningCount(creditWarning);
  };

  const handlePullDownRefresh = () => {
    loadData();
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 1000);
  };

  const handleActionClick = (action: string) => {
    switch (action) {
      case 'scan':
        Taro.showToast({ title: '扫码开单功能', icon: 'none' });
        break;
      case 'quotation':
        Taro.navigateTo({ url: '/pages/quotations/index' });
        break;
      case 'products':
        Taro.switchTab({ url: '/pages/products/index' });
        break;
      case 'orders':
        Taro.switchTab({ url: '/pages/orders/index' });
        break;
      case 'inventory':
        Taro.navigateTo({ url: '/pages/inventory/index' });
        break;
      case 'customers':
        Taro.switchTab({ url: '/pages/customers/index' });
        break;
      case 'finance':
        Taro.navigateTo({ url: '/pages/finance/index' });
        break;
      case 'logistics':
        Taro.showToast({ title: '一键联系物流', icon: 'none' });
        break;
      default:
        break;
    }
  };

  const statsData = [
    { label: '今日订单', value: '6', color: 'primary' },
    { label: '今日销售', value: formatPrice(16446), color: 'success' },
    { label: '本月销售', value: formatNumber(156800), color: 'primary' },
    { label: '待处理', value: '3', color: 'warning' },
    { label: '库存预警', value: lowStockCount, color: 'error' },
    { label: '赊账提醒', value: creditWarningCount, color: 'error' }
  ];

  const quickActions = [
    { key: 'scan', icon: '📷', label: '扫码开单', color: 'color1' },
    { key: 'quotation', icon: '📋', label: '新建报价', color: 'color2' },
    { key: 'products', icon: '💡', label: '商品管理', color: 'color3' },
    { key: 'orders', icon: '📦', label: '订单管理', color: 'color4' },
    { key: 'inventory', icon: '📊', label: '库存管理', color: 'color5' },
    { key: 'customers', icon: '👥', label: '客户管理', color: 'color6' },
    { key: 'finance', icon: '💰', label: '财务管理', color: 'color7' },
    { key: 'logistics', icon: '🚚', label: '联系物流', color: 'color8' }
  ];

  return (
    <ScrollView
      className={styles.homePage}
      scrollY
      refresherEnabled
      refresherTriggered={false}
      onRefresherRefresh={handlePullDownRefresh}
    >
      <View className={styles.header}>
        <View className={styles.headerTop}>
          <Text className={styles.shopName}>光明灯具批发</Text>
          <View className={styles.messageIcon} onClick={() => Taro.navigateTo({ url: '/pages/messages/index' })}>
            <Text>🔔</Text>
            {unreadCount > 0 && (
              <View className={styles.badge}>
                <Text>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
        <View className={styles.searchBar}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Text className={styles.searchText}>搜索商品 / 订单 / 客户</Text>
        </View>
      </View>

      <View className={styles.statsGrid}>
        {statsData.map((stat, index) => (
          <View key={index} className={styles.statItem}>
            <Text className={`${styles.statValue} ${styles[stat.color]}`}>
              {stat.value}
            </Text>
            <Text className={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View className={styles.quickActions}>
        <View className={styles.sectionTitle}>
          <Text className={styles.titleText}>快捷功能</Text>
        </View>
        <View className={styles.actionGrid}>
          {quickActions.map((action) => (
            <View
              key={action.key}
              className={styles.actionItem}
              onClick={() => handleActionClick(action.key)}
            >
              <View className={`${styles.actionIcon} ${styles[action.color]}`}>
                <Text>{action.icon}</Text>
              </View>
              <Text className={styles.actionLabel}>{action.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.todayOrders}>
        <View className={styles.sectionTitle}>
          <Text className={styles.titleText}>今日订单</Text>
          <Text className={styles.moreLink} onClick={() => Taro.switchTab({ url: '/pages/orders/index' })}>
            查看全部 ›
          </Text>
        </View>
        <View className={styles.orderList}>
          {todayOrders.length > 0 ? (
            todayOrders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))
          ) : (
            <EmptyState title='今日暂无订单' description='点击"扫码开单"快速创建订单' />
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default HomePage;
