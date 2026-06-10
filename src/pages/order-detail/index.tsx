import React, { useState, useMemo } from 'react';
import { View, Text, Image, ScrollView, Input, Picker } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import { useStore } from '@/store';
import { formatPrice, formatDateTime, getOrderStatusText, getPaymentStatusText, getDeliveryStatusText } from '@/utils/format';
import type { Order, OrderItem, ReturnItem, PaymentRecord } from '@/types';

type ReturnType = 'return' | 'exchange';

const OrderDetailPage: React.FC = () => {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [version, setVersion] = useState(0);

  const orders = useStore((s) => s.orders);
  const allOrders = orders;
  const addPayment = useStore((s) => s.addPayment);
  const addReturnRecord = useStore((s) => s.addReturnRecord);
  const processReturn = useStore((s) => s.processReturn);
  const generateOrderShareContent = useStore((s) => s.generateOrderShareContent);

  useDidShow(() => {
    const id = router.params.id;
    const found = allOrders.find((o) => o.id === id);
    if (found) {
      setOrder({ ...found });
      setVersion((v) => v + 1);
    }
  });

  const refresh = () => {
    const id = router.params.id;
    const found = useStore.getState().orders.find((o) => o.id === id);
    if (found) setOrder({ ...found });
  };

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

  const handleShare = async () => {
    const content = generateOrderShareContent(order.id);
    if (!content) {
      Taro.showToast({ title: '生成失败', icon: 'none' });
      return;
    }
    try {
      await Taro.setClipboardData({ data: content });
      Taro.showModal({
        title: '分享内容已复制',
        content: '订单详情已复制到剪贴板，可直接粘贴发送给客户。',
        showCancel: false,
      });
    } catch (e) {
      Taro.showToast({ title: '分享失败', icon: 'none' });
    }
  };

  const handlePay = () => {
    if (order.balance <= 0) {
      Taro.showToast({ title: '订单已全额付款', icon: 'none' });
      return;
    }
    Taro.navigateTo({
      url: `/pages/payment/index?orderId=${order.id}`,
    });
  };

  const handleQuickPay = () => {
    if (order.balance <= 0) return;
    Taro.showModal({
      title: '快速收款',
      editable: true,
      placeholderText: `待收金额 ${formatPrice(order.balance)}，输入收款金额`,
      content: '',
      success: async (res) => {
        if (!res.confirm) return;
        const raw = Number((res as any).content);
        if (!raw || raw <= 0 || isNaN(raw)) {
          Taro.showToast({ title: '请输入有效金额', icon: 'none' });
          return;
        }
        Taro.showModal({
          editable: true,
          placeholderText: '备注（可留空）',
          title: '收款备注',
          content: '',
          success: (res2) => {
            const remark = (res2 as any).content || '';
            const type: PaymentRecord['type'] =
              order.deposit === 0 ? 'deposit' : raw >= order.balance ? 'balance' : 'partial';
            addPayment(order.id, raw, type, remark);
            Taro.showToast({ title: '收款成功', icon: 'success' });
            setTimeout(refresh, 300);
          },
        });
      },
    });
  };

  const handleReturn = () => {
    showReturnFlow('return');
  };

  const handleExchange = () => {
    showReturnFlow('exchange');
  };

  const showReturnFlow = (type: ReturnType) => {
    Taro.showActionSheet({
      itemList: order.items.map((it) => `${it.productName}(${it.model}) 数量${it.quantity}`),
      success: (res) => {
        const idx = res.tapIndex;
        const item = order.items[idx];
        openReturnForm(type, item);
      },
    });
  };

  const openReturnForm = (type: ReturnType, item: OrderItem) => {
    const title = type === 'return' ? '退货登记' : '换货登记';
    Taro.showModal({
      title: `${title}：输入数量`,
      editable: true,
      placeholderText: `最多${item.quantity}件`,
      content: String(item.quantity),
      success: (res) => {
        if (!res.confirm) return;
        const qty = Number((res as any).content);
        if (!qty || qty <= 0 || qty > item.quantity) {
          Taro.showToast({ title: '数量无效', icon: 'none' });
          return;
        }
        const defaultAmount = type === 'return' ? qty * item.price : 0;
        Taro.showModal({
          title: `${title}：${type === 'return' ? '退款' : '补差'}金额`,
          editable: true,
          placeholderText: type === 'return' ? '默认按数量×单价计算' : '正数=客户补差价  负数=退客户差价',
          content: String(defaultAmount),
          success: (res2) => {
            if (!res2.confirm) return;
            const amount = Number((res2 as any).content);
            if (isNaN(amount)) {
              Taro.showToast({ title: '金额无效', icon: 'none' });
              return;
            }
            Taro.showModal({
              title: `${title}原因`,
              editable: true,
              placeholderText: '请输入原因',
              content: '',
              success: (res3) => {
                if (!res3.confirm) return;
                const reason = (res3 as any).content || '未填写';
                const returnItems: ReturnItem[] = [
                  {
                    productId: item.productId,
                    productName: item.productName,
                    model: item.model,
                    quantity: qty,
                    price: item.price,
                    amount: qty * item.price,
                  },
                ];
                addReturnRecord(order.id, {
                  type,
                  items: returnItems,
                  reason,
                  refundAmount: amount,
                });
                Taro.showToast({ title: `${title}已登记`, icon: 'success' });
                setTimeout(refresh, 300);
              },
            });
          },
        });
      },
    });
  };

  const handleProcessReturn = (returnId: string) => {
    Taro.showModal({
      title: '确认处理',
      content: '确认处理后将更新库存、金额状态并写入财务记录。',
      success: (res) => {
        if (res.confirm) {
          processReturn(order.id, returnId);
          Taro.showToast({ title: '处理成功', icon: 'success' });
          setTimeout(refresh, 300);
        }
      },
    });
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
          {order.items.map((it, index) => (
            <View key={index} className={styles.goodsItem}>
              <Image className={styles.goodsImage} src={it.productImage} mode='aspectFill' />
              <View className={styles.goodsInfo}>
                <View>
                  <Text className={styles.goodsName}>{it.productName}</Text>
                  <Text className={styles.goodsModel}>{it.model}</Text>
                </View>
                <View className={styles.goodsBottom}>
                  <Text className={styles.goodsPrice}>{formatPrice(it.price)}</Text>
                  <Text className={styles.goodsQty}>×{it.quantity}</Text>
                </View>
              </View>
              <View className={styles.goodsAmount}>
                <Text>{formatPrice(it.amount)}</Text>
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
            <Text className={styles.label}>已收款</Text>
            <Text className={`${styles.value} ${styles.incomeColor}`}>
              {formatPrice(order.deposit)}
            </Text>
          </View>
          <View className={styles.amountRow}>
            <Text className={styles.label}>待收款</Text>
            <Text className={`${styles.value} ${styles.expenseColor}`}>
              {formatPrice(order.balance)}
            </Text>
          </View>
          <View className={`${styles.amountRow} ${styles.totalRow}`}>
            <Text className={styles.label}>订单总额</Text>
            <Text className={styles.value}>{formatPrice(order.totalAmount)}</Text>
          </View>
        </View>
      </View>

      {(order.paymentRecords || []).length > 0 && (
        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>收款记录</Text>
            <Text className={styles.sectionCount}>{order.paymentRecords.length}笔</Text>
          </View>
          <View className={styles.paymentList}>
            {order.paymentRecords.map((p) => (
              <View key={p.id} className={styles.paymentItem}>
                <View className={styles.paymentIcon}>
                  <Text>收</Text>
                </View>
                <View className={styles.paymentInfo}>
                  <Text className={styles.paymentType}>
                    {p.type === 'deposit' ? '订金' : p.type === 'balance' ? '尾款' : '分期收款'}
                  </Text>
                  <Text className={styles.paymentTime}>
                    {formatDateTime(p.createdAt)}
                  </Text>
                  {p.remark && (
                    <Text className={styles.paymentRemark}>{p.remark}</Text>
                  )}
                </View>
                <View className={styles.paymentAmount}>
                  <Text>+{formatPrice(p.amount)}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {(order.returnRecords || []).length > 0 && (
        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>退换货记录</Text>
            <Text className={styles.sectionCount}>{order.returnRecords.length}笔</Text>
          </View>
          <View className={styles.returnList}>
            {order.returnRecords.map((r) => (
              <View key={r.id} className={styles.returnCard}>
                <View className={styles.returnHeader}>
                  <View
                    className={`${styles.returnBadge} ${
                      r.type === 'return' ? styles.returnBadgeRet : styles.returnBadgeExc
                    }`}
                  >
                    <Text>{r.type === 'return' ? '退货' : '换货'}</Text>
                  </View>
                  <View
                    className={`${styles.returnStatus} ${
                      r.status === 'completed' ? styles.statusDone : styles.statusPending
                    }`}
                  >
                    <Text>{r.status === 'completed' ? '已完成' : '待处理'}</Text>
                  </View>
                </View>
                {r.items.map((it, i) => (
                  <View key={i} className={styles.returnItemRow}>
                    <Text className={styles.returnItemName}>
                      {it.productName} ×{it.quantity}
                    </Text>
                    <Text className={styles.returnItemAmount}>
                      {formatPrice(it.amount)}
                    </Text>
                  </View>
                ))}
                <View className={styles.returnRow}>
                  <Text className={styles.returnLabel}>原因</Text>
                  <Text className={styles.returnValue}>{r.reason}</Text>
                </View>
                <View className={styles.returnRow}>
                  <Text className={styles.returnLabel}>
                    {r.type === 'return' ? '退款金额' : '补差金额'}
                  </Text>
                  <Text className={`${styles.returnValue} ${styles.expenseColor}`}>
                    -{formatPrice(r.refundAmount)}
                  </Text>
                </View>
                <View className={styles.returnRow}>
                  <Text className={styles.returnLabel}>登记时间</Text>
                  <Text className={styles.returnValue}>
                    {formatDateTime(r.createdAt)}
                  </Text>
                </View>
                {r.status !== 'completed' && (
                  <View className={styles.returnAction} onClick={() => handleProcessReturn(r.id)}>
                    <Text>确认处理</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      )}

      <View className={styles.actionRow}>
        <View className={`${styles.actionBtn} ${styles.actionOutline}`} onClick={handleReturn}>
          <Text>发起退货</Text>
        </View>
        <View className={`${styles.actionBtn} ${styles.actionOutline}`} onClick={handleExchange}>
          <Text>发起换货</Text>
        </View>
      </View>

      <View className={styles.bottomBar}>
        <View className={`${styles.btn} ${styles.btnOutline}`} onClick={handlePrint}>
          <Text>打印</Text>
        </View>
        <View className={`${styles.btn} ${styles.btnOutline}`} onClick={handleShare}>
          <Text>分享客户</Text>
        </View>
        {order.balance > 0 && (
          <View className={`${styles.btn} ${styles.btnWarn}`} onClick={handleQuickPay}>
            <Text>快速收款</Text>
          </View>
        )}
        <View className={`${styles.btn} ${styles.btnPrimary}`} onClick={handlePay}>
          <Text>{order.balance > 0 ? '去收款' : '查看详情'}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default OrderDetailPage;
