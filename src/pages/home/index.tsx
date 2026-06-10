import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import OrderCard from '@/components/OrderCard';
import EmptyState from '@/components/EmptyState';
import { useStore } from '@/store';
import { formatPrice, formatNumber } from '@/utils/format';
import type { Order } from '@/types';

const HomePage: React.FC = () => {
  const [version, setVersion] = useState(0);

  const orders = useStore((s) => s.orders);
  const messages = useStore((s) => s.messages);
  const inventoryItems = useStore((s) => s.inventoryItems);
  const customers = useStore((s) => s.customers);
  const financeRecords = useStore((s) => s.financeRecords);

  useDidShow(() => {
    setVersion((v) => v + 1);
  });

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todaysOrders = orders.filter(
      (o) => o.createdAt.slice(0, 10) === today
    );
    const unread = messages.filter((m) => !m.isRead).length;
    const lowStock = inventoryItems.filter(
      (item) => item.stock <= item.warnStock
    ).length;
    const creditWarning = customers.filter(
      (c) => c.creditUsed >= c.creditLimit * 0.8
    ).length;
    const todayIncome = financeRecords
      .filter((r) => r.type === 'income' && r.createdAt.slice(0, 10) === today)
      .reduce((sum, r) => sum + r.amount, 0);
    const monthIncome = financeRecords
      .filter(
        (r) =>
          r.type === 'income' &&
          r.createdAt.slice(0, 7) === today.slice(0, 7)
      )
      .reduce((sum, r) => sum + r.amount, 0);
    return {
      todayOrders: orders.slice(0, 3),
      todayOrdersCount: todaysOrders.length,
      unread,
      lowStock,
      creditWarning,
      todaySales: todayIncome,
      monthSales: monthIncome,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    orders,
    messages,
    inventoryItems,
    customers,
    financeRecords,
    version,
  ]);

  const handlePullDownRefresh = () => {
    setVersion((v) => v + 1);
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 800);
  };

  const handleActionClick = (action: string) => {
    switch (action) {
      case 'scan':
        Taro.navigateTo({ url: '/pages/order-create/index' });
        break;
      case 'quotation':
        Taro.navigateTo({ url: '/pages/quotation-create/index' });
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
        Taro.makePhoneCall({
          phoneNumber: '13800138000',
        }).catch(() => {
          Taro.showToast({ title: '物流电话已复制', icon: 'none' });
          Taro.setClipboardData({ data: '13800138000' });
        });
        break;
      default:
        break;
    }
  };

  return (
    <ScrollView
      className={styles.homePage}
      scrollY
      refresherEnabled
      refresherTriggered={false}
      onRefresherRefresh={handlePullDownRefresh}
    >
      <View className={styles.header}>
        <View className={styles.welcomeSection}>
          <View>
            <Text className={styles.welcomeText}>早上好，张店长</Text>
            <Text className={styles.todayDate}>
              今天是{new Date().toLocaleDateString('zh-CN')}
            </Text>
          </View>
          <View
            className={styles.messageIcon}
            onClick={() => Taro.navigateTo({ url: '/pages/messages/index' })}
          >
            <Text className={styles.messageEmoji}>�</Text>
            {stats.unread > 0 && (
              <View className={styles.badge}>
                <Text className={styles.badgeText}>{stats.unread}</Text>
              </View>
            )}
          </View>
        </View>

        <View className={styles.statsSection}>
          <View className={styles.statsCard}>
            <View className={styles.statsRow}>
              <View className={styles.statsItem}>
                <Text className={styles.statsLabel}>今日销售额</Text>
                <Text className={styles.statsValue}>{formatPrice(stats.todaySales)}</Text>
              </View>
              <View className={styles.statsDivider} />
              <View className={styles.statsItem}>
                <Text className={styles.statsLabel}>本月销售额</Text>
                <Text className={styles.statsValue}>{formatPrice(stats.monthSales)}</Text>
              </View>
            </View>
            <View className={styles.statsRow}>
              <View className={styles.statsItem}>
                <Text className={styles.statsLabel}>今日订单</Text>
                <Text className={styles.statsValueSmall}>{formatNumber(stats.todayOrdersCount)}</Text>
              </View>
              <View className={styles.statsDivider} />
              <View className={styles.statsItem}>
                <Text className={styles.statsLabel}>库存预警</Text>
                <Text className={`${styles.statsValueSmall} ${styles.warningColor}`}>
                  {formatNumber(stats.lowStock)}
                </Text>
              </View>
              <View className={styles.statsDivider} />
              <View className={styles.statsItem}>
                <Text className={styles.statsLabel}>赊账预警</Text>
                <Text className={`${styles.statsValueSmall} ${styles.dangerColor}`}>
                  {formatNumber(stats.creditWarning)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.quickActions}>
        <View className={styles.sectionTitle}>快捷操作</View>
        <View className={styles.actionGrid}>
          {[
            { icon: '📷', label: '扫码开单', action: 'scan' },
            { icon: '📝', label: '新建报价', action: 'quotation' },
            { icon: '💡', label: '商品管理', action: 'products' },
            { icon: '📦', label: '订单管理', action: 'orders' },
            { icon: '📊', label: '库存管理', action: 'inventory' },
            { icon: '👥', label: '客户管理', action: 'customers' },
            { icon: '💰', label: '财务统计', action: 'finance' },
            { icon: '🚚', label: '联系物流', action: 'logistics' },
          ].map((item) => (
            <View
              key={item.action}
              className={styles.actionItem}
              onClick={() => handleActionClick(item.action)}
            >
              <View className={styles.actionIcon}>
                <Text>{item.icon}</Text>
              </View>
              <Text className={styles.actionLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.recentOrders}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>最新订单</Text>
          <View
            className={styles.viewMore}
            onClick={() => Taro.switchTab({ url: '/pages/orders/index' })}
          >
            <Text>查看全部 ›</Text>
          </View>
        </View>

        <View className={styles.orderList}>
          {stats.todayOrders.length > 0 ? (
            stats.todayOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))
          ) : (
            <EmptyState
              icon='📋'
              title='暂无订单'
              description='点击快捷操作开始开单'
              small
            />
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default HomePage;
