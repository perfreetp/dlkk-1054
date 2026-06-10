import React, { useState, useMemo } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import { useStore } from '@/store';
import { formatPrice } from '@/utils/format';
import type { Product } from '@/types';

const ProductDetailPage: React.FC = () => {
  const router = useRouter();
  const [version, setVersion] = useState(0);
  const allProducts = useStore((s) => s.products);

  useDidShow(() => {
    setVersion((v) => v + 1);
  });

  const product = useMemo(() => {
    const id = router.params.id;
    return allProducts.find((p) => p.id === id) || null;
  }, [allProducts, router.params.id, version]);

  if (!product) {
    return (
      <View className={styles.detailPage}>
        <Text>加载中...</Text>
      </View>
    );
  }

  const isLowStock = product.stock <= product.warnStock;

  const handleEdit = () => {
    Taro.navigateTo({ url: `/pages/product-edit/index?id=${product.id}` });
  };

  const handleAddCart = () => {
    Taro.navigateTo({ url: '/pages/quotation-create/index?productId=' + product.id });
  };

  return (
    <ScrollView className={styles.detailPage} scrollY>
      <Image
        className={styles.productImage}
        src={product.images[0] || product.image}
        mode='aspectFill'
      />

      <View className={styles.productInfo}>
        <Text className={styles.productName}>{product.name}</Text>
        <Text className={styles.productModel}>型号：{product.model}</Text>
        <View className={styles.priceRow}>
          <Text className={styles.priceLabel}>批发价</Text>
          <Text className={styles.priceValue}>{formatPrice(product.price)}</Text>
        </View>
        <View className={styles.stockInfo}>
          <View className={styles.stockItem}>
            <Text className={`${styles.stockValue} ${isLowStock ? styles.warning : ''}`}>
              {product.stock}{product.unit}
            </Text>
            <Text className={styles.stockLabel}>库存数量</Text>
          </View>
          <View className={styles.stockItem}>
            <Text className={styles.stockValue}>{product.warnStock}{product.unit}</Text>
            <Text className={styles.stockLabel}>预警值</Text>
          </View>
          <View className={styles.stockItem}>
            <Text className={styles.stockValue}>{product.category}</Text>
            <Text className={styles.stockLabel}>分类</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>规格参数</Text>
        </View>
        <View className={styles.specList}>
          {Object.entries(product.spec).map(([key, value]) => (
            <View key={key} className={styles.specItem}>
              <Text className={styles.specLabel}>{key}</Text>
              <Text className={styles.specValue}>{value}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>阶梯批发价</Text>
        </View>
        <View className={styles.tierList}>
          {product.tierPrices.map((tier, index) => (
            <View key={index} className={styles.tierItem}>
              <Text className={styles.tierQty}>
                {tier.minQty}{product.unit}起批
              </Text>
              <Text className={styles.tierPrice}>{formatPrice(tier.price)}/{product.unit}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>商品描述</Text>
        </View>
        <View className={styles.descContent}>
          <Text>{product.description}</Text>
        </View>
      </View>

      <View className={styles.bottomBar}>
        <View className={`${styles.btn} ${styles.btnOutline}`} onClick={handleEdit}>
          <Text>编辑商品</Text>
        </View>
        <View className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleAddCart}>
          <Text>加入报价单</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default ProductDetailPage;
