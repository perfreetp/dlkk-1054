import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Input, Picker } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import { useStore } from '@/store';
import { mockProductSalesRanking, mockStaffPerformance, mockStatsSummary } from '@/data/finance';
import { formatPrice, formatDate, formatNumber } from '@/utils/format';
import type { FinanceRecord, SalesRanking, Customer } from '@/types';

type TabType = 'records' | 'ranking' | 'staff';

const pad = (n: number) => String(n).padStart(2, '0');
const now = new Date();
const firstDayOfMonth = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`;
const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

const FinancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('records');
  const [dateFrom, setDateFrom] = useState<string>(firstDayOfMonth);
  const [dateTo, setDateTo] = useState<string>(todayStr);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [orderNoKeyword, setOrderNoKeyword] = useState<string>('');
  const [version, setVersion] = useState(0);

  const customers = useStore((s) => s.customers);
  const allRecords = useStore((s) => s.financeRecords);
  const orders = useStore((s) => s.orders);
  const productRanking = mockProductSalesRanking;
  const staffPerformance = mockStaffPerformance;

  useDidShow(() => {
    setVersion((v) => v + 1);
  });

  const monthlySummary = useMemo(() => {
    const y = now.getFullYear();
    const m = now.getMonth();
    let totalIncome = 0;
    let totalExpense = 0;
    allRecords.forEach((r) => {
      const dt = new Date(r.createdAt);
      if (dt.getFullYear() === y && dt.getMonth() === m) {
        if (r.type === 'income') totalIncome += r.amount;
        else totalExpense += r.amount;
      }
    });
    let unpaid = 0;
    orders.forEach((o) => {
      const dt = new Date(o.createdAt);
      if (dt.getFullYear() === y && dt.getMonth() === m) unpaid += o.balance;
    });
    return { totalIncome, totalExpense, profit: totalIncome - totalExpense, unpaidBalance: unpaid };
  }, [allRecords, orders, version]);

  const filteredRecords = useMemo(() => {
    return allRecords.filter((r) => {
      if (dateFrom && r.createdAt.slice(0, 10) < dateFrom) return false;
      if (dateTo && r.createdAt.slice(0, 10) > dateTo) return false;
      if (selectedCustomerId && r.customerId !== selectedCustomerId) return false;
      if (orderNoKeyword && !(r.orderNo || '').includes(orderNoKeyword)) return false;
      return true;
    });
  }, [allRecords, dateFrom, dateTo, selectedCustomerId, orderNoKeyword, version]);

  const summaryStats = useMemo(() => {
    let income = 0;
    let expense = 0;
    filteredRecords.forEach((r) => {
      if (r.type === 'income') income += r.amount;
      else expense += r.amount;
    });
    return { income, expense, profit: income - expense };
  }, [filteredRecords]);

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

  const handleRecordClick = (record: FinanceRecord) => {
    if (record.orderId) {
      Taro.navigateTo({ url: `/pages/order-detail/index?id=${record.orderId}` });
    } else if (record.orderNo) {
      const found = orders.find((o) => o.orderNo === record.orderNo);
      if (found) Taro.navigateTo({ url: `/pages/order-detail/index?id=${found.id}` });
      else Taro.showToast({ title: '未找到对应订单', icon: 'none' });
    }
  };

  const handleResetFilter = () => {
    setDateFrom(firstDayOfMonth);
    setDateTo(todayStr);
    setSelectedCustomerId('');
    setOrderNoKeyword('');
  };

  const customerRange = useMemo(
    () => [{ id: '', name: '全部客户' }, ...customers].map((c) => c.name),
    [customers]
  );

  return (
    <View className={styles.financePage}>
      <View className={styles.summarySection}>
        <View className={styles.summaryGradient}>
          <Text className={styles.summaryLabel}>本月利润</Text>
          <Text className={styles.summaryProfit}>{formatPrice(monthlySummary.profit)}</Text>
        </View>
        <View className={styles.summaryGrid}>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryItemLabel}>本月收入</Text>
            <Text className={`${styles.summaryItemValue} ${styles.incomeColor}`}>
              {formatPrice(monthlySummary.totalIncome)}
            </Text>
          </View>
          <View className={styles.summaryDivider} />
          <View className={styles.summaryItem}>
            <Text className={styles.summaryItemLabel}>本月支出</Text>
            <Text className={`${styles.summaryItemValue} ${styles.expenseColor}`}>
              {formatPrice(monthlySummary.totalExpense)}
            </Text>
          </View>
        </View>
        <View className={styles.summaryExtra}>
          <View className={styles.extraItem}>
            <Text className={styles.extraValue}>{mockStatsSummary.monthOrders}</Text>
            <Text className={styles.extraLabel}>订单数</Text>
          </View>
          <View className={styles.extraItem}>
            <Text className={styles.extraValue}>{formatPrice(monthlySummary.unpaidBalance)}</Text>
            <Text className={styles.extraLabel}>未收尾款</Text>
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
          <View>
            <View className={styles.filterCard}>
              <View className={styles.filterRow}>
                <Text className={styles.filterLabel}>日期范围</Text>
                <View className={styles.filterDateGroup}>
                  <Picker mode='date' value={dateFrom} onChange={(e) => setDateFrom(e.detail.value)}>
                    <View className={styles.dateInput}>{dateFrom || '开始日期'}</View>
                  </Picker>
                  <Text className={styles.dateSplit}>至</Text>
                  <Picker mode='date' value={dateTo} onChange={(e) => setDateTo(e.detail.value)}>
                    <View className={styles.dateInput}>{dateTo || '结束日期'}</View>
                  </Picker>
                </View>
              </View>
              <View className={styles.filterRow}>
                <Text className={styles.filterLabel}>客户</Text>
                <Picker
                  mode='selector'
                  range={customerRange}
                  value={Math.max(
                    0,
                    customers.findIndex((c) => c.id === selectedCustomerId) + 1
                  )}
                  onChange={(e) => {
                    const idx = Number(e.detail.value);
                    setSelectedCustomerId(idx === 0 ? '' : customers[idx - 1].id);
                  }}
                >
                  <View className={styles.filterPicker}>
                    <Text className={styles.filterPickerText}>
                      {selectedCustomerId
                        ? customers.find((c) => c.id === selectedCustomerId)?.name
                        : '全部客户'}
                    </Text>
                    <Text className={styles.arrow}>▾</Text>
                  </View>
                </Picker>
              </View>
              <View className={styles.filterRow}>
                <Text className={styles.filterLabel}>订单号</Text>
                <Input
                  className={styles.filterInput}
                  placeholder='输入订单号关键字'
                  value={orderNoKeyword}
                  onInput={(e) => setOrderNoKeyword(e.detail.value)}
                />
              </View>
              <View className={styles.filterActions}>
                <View className={styles.resetBtn} onClick={handleResetFilter}>
                  <Text>重置</Text>
                </View>
              </View>
            </View>

            <View className={styles.resultCard}>
              <View className={styles.resultItem}>
                <Text className={styles.resultLabel}>筛选收入</Text>
                <Text className={`${styles.resultValue} ${styles.incomeText}`}>
                  +{formatPrice(summaryStats.income)}
                </Text>
              </View>
              <View className={styles.resultItem}>
                <Text className={styles.resultLabel}>筛选支出</Text>
                <Text className={`${styles.resultValue} ${styles.expenseText}`}>
                  -{formatPrice(summaryStats.expense)}
                </Text>
              </View>
              <View className={styles.resultItem}>
                <Text className={styles.resultLabel}>筛选利润</Text>
                <Text className={styles.resultValue}>{formatPrice(summaryStats.profit)}</Text>
              </View>
              <View className={styles.resultItem}>
                <Text className={styles.resultLabel}>记录数</Text>
                <Text className={styles.resultValue}>{filteredRecords.length}</Text>
              </View>
            </View>

            <View className={styles.recordsList}>
              {filteredRecords.length === 0 && (
                <View className={styles.empty}>
                  <Text>暂无记录</Text>
                </View>
              )}
              {filteredRecords.map((record) => (
                <View
                  key={record.id}
                  className={`${styles.recordCard} ${
                    record.orderId ? styles.clickable : ''
                  }`}
                  onClick={() => handleRecordClick(record)}
                >
                  <View className={styles.recordLeft}>
                    <View
                      className={`${styles.recordIcon} ${
                        record.type === 'income' ? styles.incomeIcon : styles.expenseIcon
                      }`}
                    >
                      <Text className={styles.iconText}>
                        {record.type === 'income' ? '收' : '支'}
                      </Text>
                    </View>
                    <View className={styles.recordInfo}>
                      <Text className={styles.recordTitle}>{record.category}</Text>
                      <Text className={styles.recordDesc}>{record.description}</Text>
                      {record.orderNo && (
                        <Text className={styles.recordOrder}>{record.orderNo}</Text>
                      )}
                      {record.customerName && (
                        <Text className={styles.recordCustomer}>{record.customerName}</Text>
                      )}
                    </View>
                  </View>
                  <View className={styles.recordRight}>
                    <Text
                      className={`${styles.recordAmount} ${
                        record.type === 'income' ? styles.incomeText : styles.expenseText
                      }`}
                    >
                      {record.type === 'income' ? '+' : '-'}
                      {formatPrice(record.amount)}
                    </Text>
                    <Text className={styles.recordDate}>{formatDate(record.createdAt)}</Text>
                    {record.orderId && (
                      <Text className={styles.tapHint}>点击查看订单</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'ranking' && (
          <View className={styles.rankingList}>
            {productRanking.map((item) => (
              <View key={item.rank} className={styles.rankingItem}>
                <View className={`${styles.rankBadge} ${getRankBadgeClass(item.rank)}`}>
                  <Text className={styles.rankText}>{getRankIcon(item.rank)}</Text>
                </View>
                <View className={styles.rankingInfo}>
                  <Text className={styles.rankingName}>{item.name}</Text>
                  <Text className={styles.rankingSub}>{item.orderCount}笔订单</Text>
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
            {staffPerformance.map((item) => (
              <View key={item.rank} className={styles.rankingItem}>
                <View className={`${styles.rankBadge} ${getRankBadgeClass(item.rank)}`}>
                  <Text className={styles.rankText}>{getRankIcon(item.rank)}</Text>
                </View>
                <View className={styles.rankingInfo}>
                  <Text className={styles.rankingName}>{item.name}</Text>
                  <Text className={styles.rankingSub}>{item.orderCount}笔订单</Text>
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
