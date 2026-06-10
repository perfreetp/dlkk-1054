import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Input, Picker, Button } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import { useStore } from '@/store';
import { formatPrice, formatDateTime } from '@/utils/format';
import type { Order, PaymentRecord } from '@/types';

const QUICK_OPTIONS = [0.3, 0.5, 0.7, 1];

const PaymentPage: React.FC = () => {
  const router = useRouter();
  const orderId = router.params.orderId as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [paymentType, setPaymentType] = useState<PaymentRecord['type']>('partial');
  const [remark, setRemark] = useState<string>('');
  const [version, setVersion] = useState(0);

  const orders = useStore((s) => s.orders);
  const addPayment = useStore((s) => s.addPayment);

  useDidShow(() => {
    const found = orders.find((o) => o.id === orderId);
    if (found) {
      setOrder({ ...found });
      setAmount('');
      setVersion((v) => v + 1);
    }
  });

  const numAmount = useMemo(() => {
    const n = Number(amount);
    return isNaN(n) ? 0 : Math.max(0, n);
  }, [amount]);

  if (!order) {
    return (
      <View className={styles.page}>
        <Text>加载中...</Text>
      </View>
    );
  }

  const balance = order.balance;
  const remainingAfter = Math.max(0, balance - numAmount);

  const setQuick = (ratio: number) => {
    const v = Math.round(balance * ratio * 100) / 100;
    setAmount(String(v));
    if (ratio >= 1) setPaymentType(order.deposit === 0 ? 'deposit' : 'balance');
    else setPaymentType(order.deposit === 0 && ratio < 1 ? 'deposit' : 'partial');
  };

  const handleSubmit = () => {
    if (numAmount <= 0) {
      Taro.showToast({ title: '请输入收款金额', icon: 'none' });
      return;
    }
    if (numAmount > balance + 0.01) {
      Taro.showToast({ title: `收款金额不能超过待收款 ${formatPrice(balance)}`, icon: 'none' });
      return;
    }
    let type: PaymentRecord['type'] = paymentType;
    if (order.deposit === 0 && numAmount < balance) type = 'deposit';
    else if (numAmount >= balance - 0.01) type = 'balance';
    else if (order.deposit === 0 && numAmount >= balance - 0.01) type = 'deposit';
    else type = 'partial';

    addPayment(order.id, numAmount, type, remark);
    Taro.showToast({ title: '收款成功', icon: 'success' });
    setTimeout(() => {
      Taro.navigateBack();
    }, 800);
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <View className={styles.customerRow}>
          <Text className={styles.customerName}>{order.customerName}</Text>
          <Text className={styles.orderNo}>{order.orderNo}</Text>
        </View>
        <View className={styles.balanceCard}>
          <Text className={styles.balanceLabel}>待收款金额</Text>
          <Text className={styles.balanceValue}>￥{formatPrice(balance)}</Text>
          <Text className={styles.balanceHint}>
            已收款 {formatPrice(order.deposit)} / 总额 {formatPrice(order.totalAmount)}
          </Text>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>收款金额</View>
        <View className={styles.amountInputWrap}>
          <Text className={styles.amountUnit}>￥</Text>
          <Input
            className={styles.amountInput}
            type='digit'
            placeholder='请输入收款金额'
            value={amount}
            onInput={(e) => setAmount(e.detail.value)}
          />
        </View>
        <View className={styles.quickRow}>
          {QUICK_OPTIONS.map((r) => (
            <View
              key={r}
              className={`${styles.quickBtn} ${
                numAmount === Math.round(balance * r * 100) / 100 ? styles.quickActive : ''
              }`}
              onClick={() => setQuick(r)}
            >
              <Text>{r === 1 ? '收全款' : `${r * 100}%`}</Text>
            </View>
          ))}
        </View>
        {numAmount > 0 && (
          <View className={styles.previewRow}>
            <Text className={styles.previewLabel}>收款后剩余待收：</Text>
            <Text
              className={`${styles.previewValue} ${
                remainingAfter <= 0.01 ? styles.green : styles.orange
              }`}
            >
              ￥{formatPrice(remainingAfter)}
            </Text>
          </View>
        )}
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>收款类型</View>
        <View className={styles.typeRow}>
          {[
            { k: 'deposit', label: '订金' },
            { k: 'partial', label: '分期收款' },
            { k: 'balance', label: '尾款' },
          ].map((t) => (
            <View
              key={t.k}
              className={`${styles.typeBtn} ${
                paymentType === t.k ? styles.typeActive : ''
              }`}
              onClick={() => setPaymentType(t.k as PaymentRecord['type'])}
            >
              <Text>{t.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>收款备注（可选）</View>
        <Input
          className={styles.remarkInput}
          placeholder='例如：微信收款、银行转账、现金等'
          value={remark}
          onInput={(e) => setRemark(e.detail.value)}
          maxLength={50}
        />
      </View>

      {(order.paymentRecords || []).length > 0 && (
        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            历史收款记录（{order.paymentRecords.length}笔）
          </View>
          <View className={styles.historyList}>
            {order.paymentRecords.map((p) => (
              <View key={p.id} className={styles.historyItem}>
                <View className={styles.historyLeft}>
                  <Text className={styles.historyType}>
                    {p.type === 'deposit' ? '订金' : p.type === 'balance' ? '尾款' : '分期'}
                  </Text>
                  <Text className={styles.historyTime}>
                    {formatDateTime(p.createdAt)}
                  </Text>
                </View>
                <View className={styles.historyRight}>
                  <Text className={styles.historyAmount}>+{formatPrice(p.amount)}</Text>
                  {p.remark && (
                    <Text className={styles.historyRemark}>{p.remark}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      <View className={styles.footer}>
        <View className={styles.summary}>
          <Text className={styles.summaryLabel}>本次收款：</Text>
          <Text className={styles.summaryValue}>￥{formatPrice(numAmount)}</Text>
        </View>
        <View className={styles.submitBtn} onClick={handleSubmit}>
          <Text>确认收款</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default PaymentPage;
