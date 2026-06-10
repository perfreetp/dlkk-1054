import React, { useState, useMemo } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import { useStore } from '@/store';
import { formatPrice, formatDate, formatDateTime, getOrderStatusText, getPaymentStatusText } from '@/utils/format';
import type { Customer, Order } from '@/types';

const CustomerDetailPage: React.FC = () => {
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [version, setVersion] = useState(0);

  const allOrders = useStore((s) => s.orders);
  const getCustomerStatement = useStore((s) => s.getCustomerStatement);
  const generateCustomerStatementContent = useStore((s) => s.generateCustomerStatementContent);

  useDidShow(() => {
    const id = router.params.id;
    const found = useStore.getState().customers.find(c => c.id === id);
    if (found) {
      setCustomer(found);
      setVersion(v => v + 1);
    }
  });

  const statement = useMemo(() => {
    if (!customer) return null;
    return getCustomerStatement(customer.id);
  }, [customer, allOrders, version, getCustomerStatement]);

  if (!customer || !statement) {
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
    if (statement.orders.length > 0) {
      Taro.switchTab({ url: '/pages/orders/index' });
    } else {
      Taro.showToast({ title: '暂无历史订单', icon: 'none' });
    }
  };

  const handleCopyStatement = async () => {
    const content = generateCustomerStatementContent(customer.id);
    if (!content) {
      Taro.showToast({ title: '生成失败', icon: 'none' });
      return;
    }
    try {
      await Taro.setClipboardData({ data: content });
      Taro.showModal({
        title: '对账单已复制',
        content: '客户对账单已复制到剪贴板，可直接粘贴发送给客户。',
        showCancel: false,
      });
    } catch (e) {
      Taro.showToast({ title: '复制失败', icon: 'none' });
    }
  };

  const handleOrderClick = (orderId: string) => {
    Taro.navigateTo({ url: `/pages/order-detail/index?id=${orderId}` });
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
          <Text className={styles.sectionTitle}>📊 客户对账</Text>
          <View className={styles.copyBtn} onClick={handleCopyStatement}>
            <Text className={styles.copyBtnText}>复制对账单</Text>
          </View>
        </View>
        <View className={styles.statGrid}>
          <View className={styles.statGridItem}>
            <Text className={styles.statGridValue}>{statement.orderCount}</Text>
            <Text className={styles.statGridLabel}>订单数</Text>
          </View>
          <View className={styles.statGridItem}>
            <Text className={styles.statGridValue}>{formatPrice(statement.totalAmount)}</Text>
            <Text className={styles.statGridLabel}>累计订单额</Text>
          </View>
          <View className={styles.statGridItem}>
            <Text className={`${styles.statGridValue} ${styles.incomeColor}`}>
              {formatPrice(statement.totalPaid)}
            </Text>
            <Text className={styles.statGridLabel}>已收款</Text>
          </View>
          <View className={styles.statGridItem}>
            <Text className={`${styles.statGridValue} ${styles.balanceColor}`}>
              {formatPrice(statement.unpaidBalance)}
            </Text>
            <Text className={styles.statGridLabel}>未收尾款</Text>
          </View>
        </View>
        {statement.totalRefund > 0 && (
          <View className={styles.refundRow}>
            <Text className={styles.refundLabel}>累计退款</Text>
            <Text className={styles.refundValue}>-{formatPrice(statement.totalRefund)}</Text>
          </View>
        )}
      </View>

      <View className={styles.infoSection}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>📋 历史订单</Text>
          <Text className={styles.sectionCount}>{statement.orders.length} 单</Text>
        </View>
        <View className={styles.orderList}>
          {statement.orders.length === 0 ? (
            <View className={styles.emptyTip}>
              <Text>暂无历史订单</Text>
            </View>
          ) : (
            statement.orders.map((order: Order) => (
              <View
                key={order.id}
                className={styles.orderRow}
                onClick={() => handleOrderClick(order.id)}
              >
                <View className={styles.orderMain}>
                  <Text className={styles.orderNo}>{order.orderNo}</Text>
                  <Text className={styles.orderAmount}>
                    ￥{order.totalAmount.toFixed(2)}
                  </Text>
                </View>
                <View className={styles.orderSub}>
                  <Text className={styles.orderDate}>
                    {formatDateTime(order.createdAt)}
                  </Text>
                  <Text className={styles.orderStatus}>
                    {getOrderStatusText(order.status)} · {getPaymentStatusText(order.paymentStatus)}
                  </Text>
                </View>
                <View className={styles.orderPayInfo}>
                  <Text className={styles.paidText}>已收：￥{order.deposit.toFixed(2)}</Text>
                  <Text className={styles.balanceText}>待收：￥{order.balance.toFixed(2)}</Text>
                </View>
              </View>
            ))
          )}
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
