import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import ProductCard from '@/components/ProductCard';
import EmptyState from '@/components/EmptyState';
import { productCategories } from '@/data/products';
import { useStore } from '@/store';
import type { Product } from '@/types';

const ProductsPage: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [version, setVersion] = useState(0);

  const allProducts = useStore((s) => s.products);

  useDidShow(() => {
    setVersion((v) => v + 1);
  });

  const products = useMemo(() => {
    let filtered = allProducts;
    if (activeCategory !== 'all') {
      filtered = filtered.filter((p) => p.category === activeCategory);
    }
    if (searchText.trim()) {
      const keyword = searchText.trim().toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(keyword) ||
          p.model.toLowerCase().includes(keyword)
      );
    }
    return filtered;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allProducts, activeCategory, searchText, version]);

  const handlePullDownRefresh = () => {
    setVersion((v) => v + 1);
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 800);
  };

  const handleAddProduct = () => {
    Taro.navigateTo({ url: '/pages/product-edit/index' });
  };

  return (
    <View className={styles.productsPage}>
      <View className={styles.searchSection}>
        <View className={styles.searchBar}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.searchInput}
            placeholder='搜索商品名称、型号'
            placeholderClass={styles.searchInput}
            value={searchText}
            onInput={(e) => setSearchText(e.detail.value)}
            confirmType='search'
          />
        </View>
      </View>

      <ScrollView scrollX className={styles.categoryTabs} showScrollbar={false}>
        {productCategories.map((cat) => (
          <View
            key={cat.id}
            className={`${styles.categoryTab} ${
              activeCategory === cat.id ? styles.active : ''
            }`}
            onClick={() => setActiveCategory(cat.id)}
          >
            <Text>{cat.name}</Text>
          </View>
        ))}
      </ScrollView>

      <ScrollView
        scrollY
        refresherEnabled
        refresherTriggered={false}
        onRefresherRefresh={handlePullDownRefresh}
      >
        <View className={styles.productList}>
          {products.length > 0 ? (
            products.map((product) => <ProductCard key={product.id} product={product} />)
          ) : (
            <EmptyState
              icon='💡'
              title='暂无商品'
              description='点击右下角按钮添加商品'
            />
          )}
        </View>
      </ScrollView>

      <View className={styles.addButton} onClick={handleAddProduct}>
        <Text className={styles.addIcon}>+</Text>
      </View>
    </View>
  );
};

export default ProductsPage;
