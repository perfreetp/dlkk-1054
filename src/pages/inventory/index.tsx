import React, { useState, useMemo } from 'react';
import { View, Text, Image, ScrollView, Input } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import EmptyState from '@/components/EmptyState';
import { useStore } from '@/store';
import { formatPrice, formatDate, formatNumber } from '@/utils/format';
import type { InventoryItem, RestockRecord } from '@/types';

type TabType = 'stock' | 'restock';

const InventoryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('stock');
  const [searchText, setSearchText] = useState('');
  const [version, setVersion] = useState(0);

  const allInventory = useStore((s) => s.inventoryItems);
  const allRestock = useStore((s) => s.restockRecords);
  const products = useStore((s) => s.products);

  useDidShow(() => {
    setVersion((v) => v + 1);
  });

  const inventoryItems = useMemo(() => allInventory, [allInventory, version]);
  const restockRecords = useMemo(() => allRestock, [allRestock, version]);

  const lowStockItems = inventoryItems.filter((item) => item.stock <= item.warnStock);

  const filteredItems = inventoryItems.filter(
    (item) =>
      item.productName.includes(searchText) || item.model.includes(searchText)
  );

  const handleItemClick = (productId: string) => {
    Taro.navigateTo({ url: `/pages/product-detail/index?id=${productId}` });
  };

  const handleRestock = () => {
    const names = products.map((p) => p.name + ' (' + p.model + ')');
    Taro.showActionSheet({
      itemList: names,
      success: (res) => {
        const product = products[res.tapIndex];
        Taro.showModal({
          title: `补货登记 - ${product.name}`,
          editable: true,
          placeholderText: '补货数量',
          success: (modalRes) => {
            if (modalRes.confirm) {
              const quantity = Number(modalRes.content) || 0;
              if (quantity <= 0) {
                Taro.showToast({ title: '请输入有效数量', icon: 'none' });
                return;
              }
              useStore.getState().addRestockRecord({
                productId: product.id,
                productName: product.name,
                quantity,
                cost: product.costPrice * quantity,
                supplier: '默认供应商',
                status: 'pending',
              });
              Taro.showToast({ title: '补货登记成功', icon: 'success' });
              setVersion((v) => v + 1);
            }
          },
        });
      },
    });
  };

  const handleConfirmRestock = (record: RestockRecord) => {
    Taro.showModal({
      title: '确认入库',
      content: `确认 ${record.productName} ${record.quantity}件 入库？`,
      success: (res) => {
        if (res.confirm) {
          useStore.getState().confirmRestock(record.id);
          Taro.showToast({ title: '入库成功', icon: 'success' });
          setVersion((v) => v + 1);
        }
      },
    });
  };

  const handleContactLogistics = () => {
    Taro.makePhoneCall({
      phoneNumber: '13800138000',
    }).catch(() => {
      Taro.showToast({ title: '物流电话已复制', icon: 'none' });
      Taro.setClipboardData({ data: '13800138000' });
    });
  };

  const getStockWarnClass = (item: InventoryItem) => {
    if (item.stock <= 0) return styles.stockOut;
    if (item.stock <= item.warnStock) return styles.stockLow;
    return '';
  };

  return (
    <View className={styles.inventoryPage}>
      <View className={styles.summaryBar}>
        <View className={styles.summaryItem}>
          <Text className={styles.summaryValue}>{formatNumber(inventoryItems.length)}</Text>
          <Text className={styles.summaryLabel}>总SKU</Text>
        </View>
        <View className={styles.summaryItem}>
          <Text className={`${styles.summaryValue} ${styles.warningColor}`}>
            {formatNumber(lowStockItems.length)}
          </Text>
          <Text className={styles.summaryLabel}>库存预警</Text>
        </View>
        <View className={styles.summaryItem}>
          <Text className={styles.summaryValue}>
            {formatNumber(restockRecords.filter((r) => r.status === 'pending').length)}
          </Text>
          <Text className={styles.summaryLabel}>待入库</Text>
        </View>
      </View>

      {activeTab === 'stock' && (
        <View className={styles.searchSection}>
          <View className={styles.searchBar}>
            <Text className={styles.searchIcon}>🔍</Text>
            <Input
              className={styles.searchInput}
              placeholder='搜索商品名称、型号'
              value={searchText}
              onInput={(e) => setSearchText(e.detail.value)}
            />
          </View>
        </View>
      )}

      <View className={styles.tabBar}>
        <View
          className={`${styles.tabItem} ${activeTab === 'stock' ? styles.active : ''}`}
          onClick={() => setActiveTab('stock')}
        >
          <Text>库存列表</Text>
        </View>
        <View
          className={`${styles.tabItem} ${activeTab === 'restock' ? styles.active : ''}`}
          onClick={() => setActiveTab('restock')}
        >
          <Text>补货记录</Text>
        </View>
      </View>

      <ScrollView scrollY>
        {activeTab === 'stock' && (
          <View className={styles.inventoryList}>
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <View
                  key={item.productId}
                  className={styles.inventoryCard}
                  onClick={() => handleItemClick(item.productId)}
                >
                  <Image
                    className={styles.productImage}
                    src={item.productImage}
                    mode='aspectFill'
                  />
                  <View className={styles.productInfo}>
                    <View className={styles.productHeader}>
                      <Text className={styles.productName}>{item.productName}</Text>
                      <Text
                        className={`${styles.stockQuantity} ${getStockWarnClass(item)}`}
                      >
                        库存: {formatNumber(item.stock)}
                      </Text>
                    </View>
                    <Text className={styles.productModel}>{item.model}</Text>
                    <View className={styles.productMeta}>
                      <Text className={styles.metaItem}>{item.category}</Text>
                      <Text className={styles.metaItem}>
                        预警: {formatNumber(item.warnStock)}
                      </Text>
                      <Text className={styles.metaItem}>库位: {item.location}</Text>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <EmptyState icon='📦' title='暂无库存' description='添加商品后自动创建库存' />
            )}
          </View>
        )}

        {activeTab === 'restock' && (
          <View className={styles.restockList}>
            {restockRecords.length > 0 ? (
              restockRecords.map((record) => (
                <View key={record.id} className={styles.restockCard}>
                  <View className={styles.restockHeader}>
                    <View>
                      <Text className={styles.restockProduct}>{record.productName}</Text>
                      <Text className={styles.restockSupplier}>供应商: {record.supplier}</Text>
                    </View>
                    <View
                      className={`${styles.statusTag} ${
                        record.status === 'completed' ? styles.statusCompleted : styles.statusPending
                      }`}
                    >
                      <Text>
                        {record.status === 'completed' ? '已完成' : '待入库'}
                      </Text>
                    </View>
                  </View>
                  <View className={styles.restockInfo}>
                    <View className={styles.restockRow}>
                      <Text className={styles.restockLabel}>数量</Text>
                      <Text className={styles.restockValue}>
                        {formatNumber(record.quantity)}件
                      </Text>
                    </View>
                    <View className={styles.restockRow}>
                      <Text className={styles.restockLabel}>成本</Text>
                      <Text className={styles.restockValue}>
                        {formatPrice(record.cost)}
                      </Text>
                    </View>
                    <View className={styles.restockRow}>
                      <Text className={styles.restockLabel}>登记时间</Text>
                      <Text className={styles.restockValue}>{formatDate(record.createdAt)}</Text>
                    </View>
                  </View>
                  {record.status === 'pending' && (
                    <View
                      className={styles.confirmBtn}
                      onClick={() => handleConfirmRestock(record)}
                    >
                      <Text className={styles.confirmText}>确认入库</Text>
                    </View>
                  )}
                </View>
              ))
            ) : (
              <EmptyState
                icon='📋'
                title='暂无补货记录'
                description='点击右上角按钮进行补货登记'
              />
            )}
          </View>
        )}
      </ScrollView>

      <View className={styles.actionButtons}>
        {activeTab === 'restock' && (
          <View className={styles.actionButton} onClick={handleContactLogistics}>
            <Text className={styles.actionButtonIcon}>🚚</Text>
            <Text className={styles.actionButtonText}>联系物流</Text>
          </View>
        )}
        <View className={styles.primaryButton} onClick={handleRestock}>
          <Text className={styles.primaryButtonIcon}>+</Text>
          <Text className={styles.primaryButtonText}>补货登记</Text>
        </View>
      </View>
    </View>
  );
};

export default InventoryPage;
