import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import { useStore } from '@/store';
import { formatPrice, formatDate, formatNumber } from '@/utils/format';
import type { Customer } from '@/types';

const CustomerDetailPage: React.FC = () => {
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);

  useDidShow(() => {
    const id = router.params.id;
    const found = useStore.getState().customers.find(c => c.id === id);
    if (found) {
      setCustomer(found);
    }
  });

  if (!customer) {
    return (
      <View className={styles.detailPage}>
        <Text>加载中...</Text>
      </View>
    );
  }

  const creditPercent = Math.min((customer.creditUsed / customer.creditLimit) * 100, 100);
  const isCreditWarning = creditPercent >= 80;

  const handleCall = () => {
    Taro.makePhoneCall({
      phoneNumber: customer.phone
    }).catch(() => {});
  };

  const handleNewOrder = () => {
    Taro.navigateTo({ url: `/pages/order-create/index` });
  };

  const handleViewOrders = () => {
    const customerOrders = useStore.getState().orders.filter(o => o.customerId === customer.id);
    if (customerOrders.length > 0) {
      Taro.switchTab({ url: '/pages/orders/index' });
    } else {
      Taro.showToast({ title: '暂无历史订单', icon: 'none' });
    }
  };

  const handleEditCustomer = () => {
    Taro.showToast({ title: '编辑客户', icon: 'none' });
  };

  return (
    <ScrollView className={styles.detailPage} scrollY>
      <View className={styles.header}>
        <View className={styles.avatar}>
          <Text className={styles.avatarText}>{customer.name.charAt(0)}</Text>
        </View>
        <View className={styles.customerInfo}>
          <View className={styles.nameRow}>
            <Text className={styles.customerName}>{customer.name}</Text>
            <View className={styles.levelTag}>
              <Text className={styles.levelText}>{customer.level}</Text>
            </View>
          </View>
          <Text className={styles.company}>{customer.company}</Text>
          <Text className={styles.group}>{customer.group}</Text>
        </View>
      </View>

      <View className={styles.statsSection}>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{customer.totalOrders}</Text>
          <Text className={styles.statLabel}>订单数</Text>
        </View>
        <View className={styles.statDivider} />
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{formatPrice(customer.totalAmount)}</Text>
          <Text className={styles.statLabel}>累计交易额</Text>
        </View>
        <View className={styles.statDivider} />
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{formatDate(customer.createdAt)}</Text>
          <Text className={styles.statLabel}>合作时间</Text>
        </View>
      </View>

      <View className={styles.creditSection}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>赊账额度</Text>
          {isCreditWarning && (
            <View className={styles.warnTag}>
              <Text className={styles.warnText}>额度预警</Text>
            </View>
          )}
        </View>
        <View className={styles.creditInfo}>
          <View className={styles.creditRow}>
            <Text className={styles.creditLabel}>信用额度</Text>
            <Text className={styles.creditValue}>{formatPrice(customer.creditLimit)}</Text>
          </View>
          <View className={styles.creditRow}>
            <Text className={styles.creditLabel}>已用额度</Text>
            <Text className={`${styles.creditValue} ${isCreditWarning ? styles.warningText : ''}`}>
              {formatPrice(customer.creditUsed)}
            </Text>
          </View>
          <View className={styles.creditRow}>
            <Text className={styles.creditLabel}>可用额度</Text>
            <Text className={styles.creditValue}>
              {formatPrice(customer.creditLimit - customer.creditUsed)}
            </Text>
          </View>
        </View>
        <View className={styles.progressBar}>
          <View
            className={`${styles.progressFill} ${isCreditWarning ? styles.progressWarning : ''}`}
            style={{ width: `${creditPercent}%` }}
          />
        </View>
      </View>

      <View className={styles.infoSection}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>联系信息</Text>
        </View>
        <View className={styles.infoList}>
          <View className={styles.infoItem}>
            <Text className={styles.infoIcon}>📱</Text>
            <View className={styles.infoContent}>
              <Text className={styles.infoLabel}>联系电话</Text>
              <Text className={styles.infoValue}>{customer.phone}</Text>
            </View>
            <View className={styles.infoAction} onClick={handleCall}>
              <Text className={styles.actionText}>拨打</Text>
            </View>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoIcon}>📍</Text>
            <View className={styles.infoContent}>
              <Text className={styles.infoLabel}>详细地址</Text>
              <Text className={styles.infoValue}>{customer.address}</Text>
            </View>
          </View>
        </View>
      </View>

      {customer.remark && (
        <View className={styles.infoSection}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>备注</Text>
          </View>
          <View className={styles.remarkBox}>
            <Text className={styles.remarkText}>{customer.remark}</Text>
          </View>
        </View>
      )}

      <View className={styles.bottomBar}>
        <View className={`${styles.btn} ${styles.btnOutline}`} onClick={handleViewOrders}>
          <Text>历史订单</Text>
        </View>
        <View className={`${styles.btn} ${styles.btnOutline}`} onClick={handleCall}>
          <Text>拨打电话</Text>
        </View>
        <View className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleNewOrder}>
          <Text>新建订单</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default CustomerDetailPage;
