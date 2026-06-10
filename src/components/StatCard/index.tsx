import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = 'primary',
  onClick
}) => {
  return (
    <View
      className={`${styles.statCard} ${styles[color]}`}
              onClick={onClick}
            >
              <View className={styles.iconWrapper}>
                <Text className={styles.icon}>{icon}</Text>
              </View>
              <View className={styles.content}>
                <Text className={styles.title}>{title}</Text>
                <Text className={styles.value}>{value}</Text>
                {subtitle && <Text className={styles.subtitle}>{subtitle}</Text>}
              </View>
            </View>
  );
};

export default StatCard;
