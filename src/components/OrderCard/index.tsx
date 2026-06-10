import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { formatPrice, formatDateTime, getOrderStatusText } from '@/utils/format';
import type { Order } from '@/types';

interface OrderCardProps {
  order: Order;
  onClick?: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      Taro.navigateTo({
        url: `/pages/order-detail/index?id=${order.id}`
      });
    }
  };

  const getStatusClass = () => {
    switch (order.status) {
      case 'pending':
        return styles.statusWarning;
      case 'confirmed':
      case 'processing':
        return styles.statusInfo;
      case 'shipped':
        return styles.statusPrimary;
      case 'completed':
        return styles.statusSuccess;
      case 'cancelled':
        return styles.statusDisabled;
      default:
        return '';
    }
  };

  return (
    <View className={styles.orderCard} onClick={handleClick}>
      <View className={styles.orderHeader}>
        <Text className={styles.orderNo}>{order.orderNo}</Text>
        <View className={`${styles.statusTag} ${getStatusClass()}`}>
          <Text className={styles.statusText}>{getOrderStatusText(order.status)}</Text>
        </View>
      </View>

      <View className={styles.customerInfo}>
        <Text className={styles.customerName}>{order.customerName}</Text>
        <Text className={styles.salesman}>业务员：{order.salesman}</Text>
      </View>

      <View className={styles.orderItems}>
        {order.items.slice(0, 2).map((item, index) => (
          <View key={index} className={styles.orderItem}>
            <Image
              className={styles.itemImage}
              src={item.productImage}
              mode='aspectFill'
            />
            <View className={styles.itemInfo}>
              <Text className={styles.itemName}>{item.productName}</Text>
              <Text className={styles.itemSpec}>{item.model} × {item.quantity}</Text>
            </View>
          </View>
        ))}
        {order.items.length > 2 && (
          <Text className={styles.moreItems}>等共{order.items.length}件商品</Text>
        )}
      </View>

      <View className={styles.orderFooter}>
        <Text className={styles.orderTime}>{formatDateTime(order.createdAt)}</Text>
        <View className={styles.orderAmount}>
          <Text className={styles.amountLabel}>订单金额：</Text>
          <Text className={styles.amountValue}>{formatPrice(order.totalAmount)}</Text>
        </View>
      </View>
    </View>
  );
};

export default OrderCard;
