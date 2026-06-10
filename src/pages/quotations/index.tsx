import React, { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import EmptyState from '@/components/EmptyState';
import { useStore } from '@/store';
import { formatPrice, formatDate, getQuotationStatusText } from '@/utils/format';
import type { Quotation } from '@/types';

const QuotationsPage: React.FC = () => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);

  useDidShow(() => {
    setQuotations(useStore.getState().quotations);
  });

  const handleQuotationClick = (id: string) => {
    Taro.navigateTo({ url: `/pages/quotation-detail/index?id=${id}` });
  };

  const handleCreate = () => {
    Taro.navigateTo({ url: '/pages/quotation-create/index' });
  };

  const getStatusClass = (status: string) => {
    const classMap: Record<string, string> = {
      draft: styles.statusDraft,
      sent: styles.statusSent,
      accepted: styles.statusAccepted,
      rejected: styles.statusRejected,
      expired: styles.statusExpired
    };
    return classMap[status] || '';
  };

  return (
    <View className={styles.quotationPage}>
      <ScrollView scrollY>
        <View className={styles.quotationList}>
          {quotations.length > 0 ? (
            quotations.map(q => (
              <View
                key={q.id}
                className={styles.quotationCard}
                onClick={() => handleQuotationClick(q.id)}
              >
                <View className={styles.cardHeader}>
                  <Text className={styles.quotationNo}>{q.quotationNo}</Text>
                  <View className={`${styles.statusTag} ${getStatusClass(q.status)}`}>
                    <Text className={styles.statusText}>
                      {getQuotationStatusText(q.status)}
                    </Text>
                  </View>
                </View>

                <View className={styles.customerInfo}>
                  <Text className={styles.customerName}>{q.customerName}</Text>
                  <Text className={styles.validDate}>有效期至：{q.validDate}</Text>
                </View>

                <View className={styles.quotationItems}>
                  {q.items.slice(0, 2).map((item, idx) => (
                    <View key={idx} className={styles.itemRow}>
                      <Text className={styles.itemName}>{item.productName}</Text>
                      <Text className={styles.itemQty}>×{item.quantity}</Text>
                    </View>
                  ))}
                  {q.items.length > 2 && (
                    <Text className={styles.itemName}>等共{q.items.length}件商品</Text>
                  )}
                </View>

                <View className={styles.cardFooter}>
                  <Text className={styles.createTime}>{formatDate(q.createdAt)}</Text>
                  <View className={styles.totalAmount}>
                    <Text className={styles.amountLabel}>报价金额：</Text>
                    <Text className={styles.amountValue}>{formatPrice(q.totalAmount)}</Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <EmptyState
              icon='📋'
              title='暂无报价单'
              description='点击右下角新建报价单'
            />
          )}
        </View>
      </ScrollView>

      <View className={styles.addFab} onClick={handleCreate}>
        <Text className={styles.addIcon}>+</Text>
      </View>
    </View>
  );
};

export default QuotationsPage;
