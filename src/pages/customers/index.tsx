import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import CustomerCard from '@/components/CustomerCard';
import EmptyState from '@/components/EmptyState';
import { useStore } from '@/store';
import { customerGroups } from '@/data/customers';
import type { Customer } from '@/types';

const CustomersPage: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [activeGroup, setActiveGroup] = useState('all');
  const [version, setVersion] = useState(0);

  const allCustomers = useStore((s) => s.customers);

  useDidShow(() => {
    setVersion((v) => v + 1);
  });

  const customers = useMemo(() => {
    let filtered = allCustomers;
    if (activeGroup !== 'all') {
      filtered = filtered.filter((c) => c.group === activeGroup);
    }
    if (searchText.trim()) {
      const keyword = searchText.trim().toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(keyword) ||
          c.company.toLowerCase().includes(keyword) ||
          c.phone.includes(keyword)
      );
    }
    return filtered;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allCustomers, activeGroup, searchText, version]);

  const handlePullDownRefresh = () => {
    setVersion((v) => v + 1);
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 800);
  };

  const handleAddCustomer = () => {
    Taro.showToast({ title: '新增客户功能', icon: 'none' });
  };

  return (
    <View className={styles.customersPage}>
      <View className={styles.searchSection}>
        <View className={styles.searchBar}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.searchInput}
            placeholder='搜索客户名称、公司、电话'
            placeholderClass={styles.searchInput}
            value={searchText}
            onInput={(e) => setSearchText(e.detail.value)}
            confirmType='search'
          />
        </View>
      </View>

      <ScrollView scrollX className={styles.groupTabs} showScrollbar={false}>
        {customerGroups.map((group) => (
          <View
            key={group.id}
            className={`${styles.groupTab} ${activeGroup === group.id ? styles.active : ''}`}
            onClick={() => setActiveGroup(group.id)}
          >
            <Text>{group.name}</Text>
          </View>
        ))}
      </ScrollView>

      <ScrollView
        scrollY
        refresherEnabled
        refresherTriggered={false}
        onRefresherRefresh={handlePullDownRefresh}
      >
        <View className={styles.customerList}>
          {customers.length > 0 ? (
            customers.map((customer) => (
              <CustomerCard key={customer.id} customer={customer} />
            ))
          ) : (
            <EmptyState
              icon='👥'
              title='暂无客户'
              description='点击右下角添加新客户'
            />
          )}
        </View>
      </ScrollView>

      <View className={styles.addButton} onClick={handleAddCustomer}>
        <Text className={styles.addIcon}>+</Text>
      </View>
    </View>
  );
};

export default CustomersPage;
