import React, { useState, useMemo } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import { useStore } from '@/store';
import { formatPrice, formatDateTime, getQuotationStatusText } from '@/utils/format';
import type { Quotation } from '@/types';

const QuotationDetailPage: React.FC = () => {
  const router = useRouter();
  const [version, setVersion] = useState(0);
  const allQuotations = useStore((s) => s.quotations);

  useDidShow(() => {
    setVersion((v) => v + 1);
  });

  const quotation = useMemo(() => {
    const id = router.params.id;
    return allQuotations.find((q) => q.id === id) || null;
  }, [allQuotations, router.params.id, version]);

  if (!quotation) {
    return (
      <View className={styles.detailPage}>
        <Text>加载中...</Text>
      </View>
    );
  }

  const handlePrint = () => {
    Taro.showToast({ title: '打印报价单', icon: 'none' });
  };

  const handleShare = async () => {
    const content = useStore.getState().generateQuotationShareContent(quotation.id);
    if (!content) {
      Taro.showToast({ title: '生成失败', icon: 'none' });
      return;
    }
    try {
      await Taro.setClipboardData({ data: content });
      Taro.showModal({
        title: '分享内容已复制',
        content: '报价单详情已复制到剪贴板，可直接粘贴发送给客户。',
        showCancel: false,
      });
    } catch (e) {
      Taro.showToast({ title: '分享失败', icon: 'none' });
    }
  };

  const handleToOrder = () => {
    const orderId = useStore.getState().convertQuotationToOrder(quotation.id);
    if (orderId) {
      Taro.showToast({ title: '已转为订单', icon: 'success' });
      setVersion((v) => v + 1);
      setTimeout(() => {
        Taro.navigateTo({ url: `/pages/order-detail/index?id=${orderId}` });
      }, 1500);
    } else {
      Taro.showToast({ title: '转换失败', icon: 'none' });
    }
  };

  return (
    <ScrollView className={styles.detailPage} scrollY>
      <View className={styles.statusHeader}>
        <Text className={styles.statusTitle}>{getQuotationStatusText(quotation.status)}</Text>
        <Text className={styles.statusDesc}>
          报价单号：{quotation.quotationNo}
        </Text>
      </View>

      <View className={styles.quotationInfo}>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>客户名称</Text>
          <Text className={styles.infoValue}>{quotation.customerName}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>有效期至</Text>
          <Text className={styles.infoValue}>{quotation.validDate}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>创建时间</Text>
          <Text className={styles.infoValue}>{formatDateTime(quotation.createdAt)}</Text>
        </View>
        {quotation.remark && (
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>备注</Text>
            <Text className={styles.infoValue}>{quotation.remark}</Text>
          </View>
        )}
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>商品清单</Text>
          <Text className={styles.itemCount}>共{quotation.items.length}件</Text>
        </View>
        <View className={styles.goodsList}>
          {quotation.items.map((item, index) => (
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
                  <Text className={styles.goodsAmount}>{formatPrice(item.amount)}</Text>
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
            <Text className={styles.value}>{formatPrice(quotation.totalAmount)}</Text>
          </View>
          <View className={`${styles.amountRow} ${styles.totalRow}`}>
            <Text className={styles.label}>报价总额</Text>
            <Text className={styles.value}>{formatPrice(quotation.totalAmount)}</Text>
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
        <View className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleToOrder}>
          <Text>转为订单</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default QuotationDetailPage;
