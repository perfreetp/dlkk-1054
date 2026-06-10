import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { mockOrders } from '@/data/orders';
import { formatPrice, formatDateTime, getOrderStatusText, getPaymentStatusText, getDeliveryStatusText } from '@/utils/format';
import type { Order } from '@/types';

const OrderDetailPage: React.FC = () => {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    const id = router.params.id;
    const found = mockOrders.find(o => o.id === id);
    if (found) {
      setOrder(found);
    }
  }, [router.params.id]);

  if (!order) {
    return (
      <View className={styles.detailPage}>
        <Text>加载中...</Text>
      </View>
    );
  }

  const handlePrint = () => {
    Taro.showToast({ title: '打印单据', icon: 'none' });
  };

  const handleShare = () => {
    Taro.showToast({ title: '分享订单', icon: 'none' });
  };

  const handlePay = () => {
    Taro.showToast({ title: '收款功能', icon: 'none' });
  };

  return (
    <ScrollView className={styles.detailPage} scrollY>
      <View className={styles.statusHeader}>
        <Text className={styles.statusTitle}>{getOrderStatusText(order.status)}</Text>
        <Text className={styles.statusDesc}>
          {getPaymentStatusText(order.paymentStatus)} · {getDeliveryStatusText(order.deliveryStatus)}
        </Text>
      </View>

      <View className={styles.orderInfo}>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>订单编号</Text>
          <Text className={styles.infoValue}>{order.orderNo}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>客户名称</Text>
          <Text className={styles.infoValue}>{order.customerName}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>业务员</Text>
          <Text className={styles.infoValue}>{order.salesman}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>下单时间</Text>
          <Text className={styles.infoValue}>{formatDateTime(order.createdAt)}</Text>
        </View>
        {order.remark && (
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>备注</Text>
            <Text className={styles.infoValue}>{order.remark}</Text>
          </View>
        )}
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>商品清单</Text>
        </View>
        <View className={styles.goodsList}>
          {order.items.map((item, index) => (
            <View key={index} className={styles.goodsItem}>
              <Image
                className={styles.goodsImage}
                src={item.productImage}
                mode='aspectFill'
              />
              <View className={styles.goodsInfo}>
                <View>
                  <Text className={styles.goodsName}>{item.productName}</Text>
                  <Text className={styles.goodsModel}>{item.model}</Text>
                </View>
                <View className={styles.goodsBottom}>
                  <Text className={styles.goodsPrice}>{formatPrice(item.price)}</Text>
                  <Text className={styles.goodsQty}>×{item.quantity}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>金额明细</Text>
        </View>
        <View className={styles.amountSection}>
          <View className={styles.amountRow}>
            <Text className={styles.label}>商品总额</Text>
            <Text className={styles.value}>{formatPrice(order.totalAmount)}</Text>
          </View>
          <View className={styles.amountRow}>
            <Text className={styles.label}>已收订金</Text>
            <Text className={styles.value}>{formatPrice(order.deposit)}</Text>
          </View>
          <View className={styles.amountRow}>
            <Text className={styles.label}>待收尾款</Text>
            <Text className={styles.value}>{formatPrice(order.balance)}</Text>
          </View>
          <View className={`${styles.amountRow} ${styles.totalRow}`}>
            <Text className={styles.label}>订单总额</Text>
            <Text className={styles.value}>{formatPrice(order.totalAmount)}</Text>
          </View>
        </View>
      </View>

      <View className={styles.bottomBar}>
        <View className={`${styles.btn} ${styles.btnOutline}`} onClick={handlePrint}>
          <Text>打印</Text>
        </View>
        <View className={`${styles.btn} ${styles.btnOutline}`} onClick={handleShare}>
          <Text>分享</Text>
        </View>
        <View className={`${styles.btn} ${styles.btnPrimary}`} onClick={handlePay}>
          <Text>收款</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default OrderDetailPage;
