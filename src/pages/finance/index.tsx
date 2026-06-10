import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { mockFinanceRecords, mockProductSalesRanking, mockStaffPerformance, mockStatsSummary } from '@/data/finance';
import { formatPrice, formatDate, formatNumber } from '@/utils/format';
import type { FinanceRecord, SalesRanking } from '@/types';

type TabType = 'records' | 'ranking' | 'staff';

const FinancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('records');
  const [records, setRecords] = useState<FinanceRecord[]>([]);
  const [productRanking, setProductRanking] = useState<SalesRanking[]>([]);
  const [staffPerformance, setStaffPerformance] = useState<SalesRanking[]>([]);

  useEffect(() => {
    setRecords(mockFinanceRecords);
    setProductRanking(mockProductSalesRanking);
    setStaffPerformance(mockStaffPerformance);
  }, []);

  const getRankBadgeClass = (rank: number) => {
    if (rank === 1) return styles.rankGold;
    if (rank === 2) return styles.rankSilver;
    if (rank === 3) return styles.rankBronze;
    return '';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `${rank}`;
  };

  return (
    <View className={styles.financePage}>
      <View className={styles.summarySection}>
        <View className={styles.summaryGradient}>
          <Text className={styles.summaryLabel}>本月利润</Text>
          <Text className={styles.summaryProfit}>{formatPrice(mockStatsSummary.monthProfit)}</Text>
        </View>
        <View className={styles.summaryGrid}>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryItemLabel}>本月收入</Text>
            <Text className={`${styles.summaryItemValue} ${styles.incomeColor}`}>
              {formatPrice(mockStatsSummary.monthIncome)}
            </Text>
          </View>
          <View className={styles.summaryDivider} />
          <View className={styles.summaryItem}>
            <Text className={styles.summaryItemLabel}>本月支出</Text>
            <Text className={`${styles.summaryItemValue} ${styles.expenseColor}`}>
              {formatPrice(mockStatsSummary.monthExpense)}
            </Text>
          </View>
        </View>
        <View className={styles.summaryExtra}>
          <View className={styles.extraItem}>
            <Text className={styles.extraValue}>{mockStatsSummary.monthOrders}</Text>
            <Text className={styles.extraLabel}>订单数</Text>
          </View>
          <View className={styles.extraItem}>
            <Text className={styles.extraValue}>{formatPrice(mockStatsSummary.avgOrderAmount)}</Text>
            <Text className={styles.extraLabel}>客单价</Text>
          </View>
        </View>
      </View>

      <View className={styles.tabBar}>
        <View
          className={`${styles.tabItem} ${activeTab === 'records' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('records')}
        >
          <Text className={styles.tabText}>收支明细</Text>
        </View>
        <View
          className={`${styles.tabItem} ${activeTab === 'ranking' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('ranking')}
        >
          <Text className={styles.tabText}>销售排行</Text>
        </View>
        <View
          className={`${styles.tabItem} ${activeTab === 'staff' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('staff')}
        >
          <Text className={styles.tabText}>员工业绩</Text>
        </View>
      </View>

      <ScrollView className={styles.contentScroll} scrollY>
        {activeTab === 'records' && (
          <View className={styles.recordsList}>
            {records.map(record => (
              <View key={record.id} className={styles.recordCard}>
              <View className={styles.recordLeft}>
                <View className={`${styles.recordIcon} ${record.type === 'income' ? styles.incomeIcon : styles.expenseIcon}`}>
                  <Text className={styles.iconText}>{record.type === 'income' ? '收' : '支'}</Text>
                </View>
                <View className={styles.recordInfo}>
                  <Text className={styles.recordTitle}>{record.category}</Text>
                  <Text className={styles.recordDesc}>{record.description}</Text>
                  {record.orderNo && (
                    <Text className={styles.recordOrder}>{record.orderNo}</Text>
                  )}
                </View>
              </View>
              <View className={styles.recordRight}>
                <Text className={`${styles.recordAmount} ${record.type === 'income' ? styles.incomeText : styles.expenseText}`}>
                  {record.type === 'income' ? '+' : '-'}{formatPrice(record.amount)}
                </Text>
                <Text className={styles.recordDate}>{formatDate(record.createdAt)}</Text>
              </View>
            </View>
            ))}
          </View>
        )}

        {activeTab === 'ranking' && (
          <View className={styles.rankingList}>
            {productRanking.map(item => (
              <View key={item.rank} className={styles.rankingItem}>
              <View className={`${styles.rankBadge} ${getRankBadgeClass(item.rank)}`}>
                <Text className={styles.rankText}>{getRankIcon(item.rank)}</Text>
              </View>
              <View className={styles.rankingInfo}>
                <Text className={styles.rankingName}>{item.name}</Text>
                <Text className={styles.rankingSub}>
                  {item.orderCount}笔订单
                </Text>
              </View>
              <View className={styles.rankingAmount}>
                <Text className={styles.amountText}>{formatPrice(item.amount)}</Text>
              </View>
            </View>
            ))}
          </View>
        )}

        {activeTab === 'staff' && (
          <View className={styles.rankingList}>
            {staffPerformance.map(item => (
              <View key={item.rank} className={styles.rankingItem}>
              <View className={`${styles.rankBadge} ${getRankBadgeClass(item.rank)}`}>
                <Text className={styles.rankText}>{getRankIcon(item.rank)}</Text>
              </View>
              <View className={styles.rankingInfo}>
                <Text className={styles.rankingName}>{item.name}</Text>
                <Text className={styles.rankingSub}>
                  {item.orderCount}笔订单
                </Text>
              </View>
              <View className={styles.rankingAmount}>
                <Text className={styles.amountText}>{formatPrice(item.amount)}</Text>
              </View>
            </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default FinancePage;
