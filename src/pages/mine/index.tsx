import React from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';

const MinePage: React.FC = () => {
  const menuGroups = [
    {
      title: '业务管理',
      items: [
        { icon: '💰', label: '财务管理', path: '/pages/finance/index' },
        { icon: '📊', label: '库存管理', path: '/pages/inventory/index' },
        { icon: '📋', label: '报价单管理', path: '/pages/quotations/index' },
        { icon: '🔔', label: '消息中心', path: '/pages/messages/index' }
      ]
    },
    {
      title: '店铺设置',
      items: [
        { icon: '🏪', label: '店铺信息', path: '' },
        { icon: '👥', label: '员工管理', path: '' },
        { icon: '🚚', label: '物流合作', path: '' },
        { icon: '⚙️', label: '系统设置', path: '' }
      ]
    }
  ];

  const handleMenuClick = (path: string) => {
    if (path) {
      Taro.navigateTo({ url: path });
    } else {
      Taro.showToast({ title: '功能开发中', icon: 'none' });
    }
  };

  return (
    <ScrollView className={styles.minePage} scrollY>
      <View className={styles.userHeader}>
        <View className={styles.avatar}>
          <Text className={styles.avatarText}>张</Text>
        </View>
        <View className={styles.userInfo}>
          <Text className={styles.userName}>张店长</Text>
          <Text className={styles.userRole}>店长 · 管理员权限</Text>
          <Text className={styles.shopInfo}>光明灯具批发档口</Text>
        </View>
      </View>

      <View className={styles.statsRow}>
        <View className={styles.statItem}>
          <Text className={styles.statNumber}>126</Text>
          <Text className={styles.statLabel}>本月订单</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statNumber}>¥15.7万</Text>
          <Text className={styles.statLabel}>本月销售额</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statNumber}>8</Text>
          <Text className={styles.statLabel}>待处理</Text>
        </View>
      </View>

      {menuGroups.map((group, groupIndex) => (
        <View key={groupIndex} className={styles.menuSection}>
          <Text className={styles.menuTitle}>{group.title}</Text>
          <View className={styles.menuList}>
            {group.items.map((item, itemIndex) => (
              <View
                key={itemIndex}
                className={styles.menuItem}
                onClick={() => handleMenuClick(item.path)}
              >
                <Text className={styles.menuIcon}>{item.icon}</Text>
                <Text className={styles.menuText}>{item.label}</Text>
                <Text className={styles.menuArrow}>›</Text>
              </View>
            ))}
          </View>
        </View>
      ))}

      <View className={styles.logoutBtn}>
        <Text className={styles.btnText}>退出登录</Text>
      </View>
    </ScrollView>
  );
};

export default MinePage;
