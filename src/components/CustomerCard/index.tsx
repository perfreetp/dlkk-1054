import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { formatNumber, formatPrice } from '@/utils/format';
import type { Customer } from '@/types';

interface CustomerCardProps {
  customer: Customer;
  onClick?: () => void;
}

const CustomerCard: React.FC<CustomerCardProps> = ({ customer, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      Taro.navigateTo({
        url: `/pages/customer-detail/index?id=${customer.id}`
      });
    }
  };

  const isCreditWarning = customer.creditUsed >= customer.creditLimit * 0.8;

  return (
    <View className={styles.customerCard} onClick={handleClick}>
      <View className={styles.customerHeader}>
        <View className={styles.avatar}>
          <Text className={styles.avatarText}>{customer.name.charAt(0)}</Text>
        </View>
        <View className={styles.customerInfo}>
          <View className={styles.nameRow}>
            <Text className={styles.customerName}>{customer.name}</Text>
            <View className={`${styles.levelTag} ${styles.level}${customer.level.charAt(0)}`}>
              <Text className={styles.levelText}>{customer.level}</Text>
            </View>
          </View>
          <Text className={styles.company}>{customer.company}</Text>
          <Text className={styles.phone}>{customer.phone}</Text>
        </View>
      </View>

      <View className={styles.customerStats}>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{customer.totalOrders}笔</Text>
          <Text className={styles.statLabel}>交易次数</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{formatNumber(customer.totalAmount)}</Text>
          <Text className={styles.statLabel}>累计金额</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={`${styles.statValue} ${isCreditWarning ? styles.warning : ''}`}>
            {formatPrice(customer.creditUsed)}
          </Text>
          <Text className={styles.statLabel}>赊账金额</Text>
        </View>
      </View>

      <View className={styles.customerFooter}>
        <View className={styles.groupTag}>
          <Text className={styles.groupText}>{customer.group}</Text>
        </View>
      </View>
    </View>
  );
};

export default CustomerCard;
