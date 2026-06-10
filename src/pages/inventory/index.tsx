import React, { useState } from 'react';
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
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [restockRecords, setRestockRecords] = useState<RestockRecord[]>([]);

  useDidShow(() => {
    setInventoryItems(useStore.getState().inventoryItems);
    setRestockRecords(useStore.getState().restockRecords);
  });

  const lowStockItems = inventoryItems.filter(item => item.stock <= item.warnStock);

  const filteredItems = inventoryItems.filter(item =>
    item.productName.includes(searchText) || item.model.includes(searchText)
  );

  const handleItemClick = (productId: string) => {
    Taro.navigateTo({ url: `/pages/product-detail/index?id=${productId}` });
  };

  const handleRestock = () => {
    const products = useStore.getState().products;
    const names = products.map(p => p.name + ' (' + p.model + ')');
    Taro.showActionSheet({
      itemList: names,
      success: (res) => {
        const product = products[res.tapIndex];
        Taro.showModal({
          title: `补货登记 - ${product.name}`,
          content: '请输入补货数量和供应商',
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
              setRestockRecords(useStore.getState().restockRecords);
            }
          }
        });
      }
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
          setRestockRecords(useStore.getState().restockRecords);
          setInventoryItems(useStore.getState().inventoryItems);
        }
      }
    });
  };

  const getStockStatusClass = (item: InventoryItem) => {
    if (item.stock <= item.warnStock) {
      return styles.stockWarning;
    }
    return '';
  };

  return (
    <View className={styles.inventoryPage}>
      <View className={styles.searchBar}>
        <View className={styles.searchInputWrapper}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.searchInput}
            placeholder='搜索商品名称/型号'
            value={searchText}
            onInput={(e) => setSearchText(e.detail.value)}
          />
        </View>
      </View>

      <View className={styles.statsRow}>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{inventoryItems.length}</Text>
          <Text className={styles.statLabel}>商品总数</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={`${styles.statValue} ${styles.warningValue}`}>{lowStockItems.length}</Text>
          <Text className={styles.statLabel}>库存预警</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{restockRecords.filter(r => r.status === 'pending').length}</Text>
          <Text className={styles.statLabel}>待入库</Text>
        </View>
      </View>

      <View className={styles.tabBar}>
        <View
          className={`${styles.tabItem} ${activeTab === 'stock' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('stock')}
        >
          <Text className={styles.tabText}>库存列表</Text>
        </View>
        <View
          className={`${styles.tabItem} ${activeTab === 'restock' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('restock')}
        >
          <Text className={styles.tabText}>补货记录</Text>
        </View>
      </View>

      <ScrollView className={styles.contentScroll} scrollY>
        {activeTab === 'stock' ? (
          <View className={styles.stockList}>
            {filteredItems.length > 0 ? (
              filteredItems.map(item => (
                <View
                  key={item.productId}
                  className={styles.stockCard}
                  onClick={() => handleItemClick(item.productId)}
                >
                  <Image
                    className={styles.productImage}
                    src={item.productImage}
                    mode='aspectFill'
                  />
                  <View className={styles.productInfo}>
                    <View className={styles.productTop}>
                      <Text className={styles.productName}>{item.productName}</Text>
                      {item.stock <= item.warnStock && (
                        <View className={styles.warnTag}>
                          <Text className={styles.warnText}>预警</Text>
                        </View>
                      )}
                    </View>
                    <Text className={styles.productModel}>{item.model}</Text>
                    <View className={styles.productBottom}>
                      <Text className={styles.stockInfo}>
                        库存：<Text className={getStockStatusClass(item)}>{item.stock}{item.unit}</Text>
                      </Text>
                      <Text className={styles.location}>库位：{item.location}</Text>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <EmptyState
                icon='📦'
                title='暂无商品'
                description='添加商品后即可管理库存'
              />
            )}
          </View>
        ) : (
          <View className={styles.restockList}>
            {restockRecords.length > 0 ? (
              restockRecords.map(record => (
                <View key={record.id} className={styles.restockCard}>
                  <View className={styles.restockHeader}>
                    <Text className={styles.restockProduct}>{record.productName}</Text>
                    <View className={`${styles.statusTag} ${record.status === 'completed' ? styles.statusCompleted : styles.statusPending}`}>
                      <Text className={styles.statusText}>
                        {record.status === 'completed' ? '已入库' : '待入库'}
                      </Text>
                    </View>
                  </View>
                  <View className={styles.restockInfo}>
                    <View className={styles.infoRow}>
                      <Text className={styles.infoLabel}>补货数量</Text>
                      <Text className={styles.infoValue}>{record.quantity}件</Text>
                    </View>
                    <View className={styles.infoRow}>
                      <Text className={styles.infoLabel}>供应商</Text>
                      <Text className={styles.infoValue}>{record.supplier}</Text>
                    </View>
                    <View className={styles.infoRow}>
                      <Text className={styles.infoLabel}>补货成本</Text>
                      <Text className={styles.infoValue}>{formatPrice(record.cost)}</Text>
                    </View>
                    <View className={styles.infoRow}>
                      <Text className={styles.infoLabel}>登记时间</Text>
                      <Text className={styles.infoValue}>{formatDate(record.createdAt)}</Text>
                    </View>
                    {record.status === 'pending' && (
                      <View className={styles.confirmBtn} onClick={() => handleConfirmRestock(record)}>
                        <Text className={styles.confirmText}>确认入库</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))
            ) : (
              <EmptyState
                icon='📋'
                title='暂无补货记录'
                description='点击右下角登记补货'
              />
            )}
          </View>
        )}
      </ScrollView>

      {activeTab === 'stock' && (
        <View className={styles.addFab} onClick={handleRestock}>
          <Text className={styles.addIcon}>+</Text>
          <Text className={styles.addText}>补货</Text>
        </View>
      )}
    </View>
  );
};

export default InventoryPage;
