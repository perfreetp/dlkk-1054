import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { formatPrice } from '@/utils/format';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      Taro.navigateTo({
        url: `/pages/product-detail/index?id=${product.id}`
      });
    }
  };

  const isLowStock = product.stock <= product.warnStock;

  return (
    <View className={styles.productCard} onClick={handleClick}>
      <Image
        className={styles.productImage}
        src={product.image}
        mode='aspectFill'
      />
      <View className={styles.productInfo}>
        <Text className={styles.productName}>{product.name}</Text>
        <Text className={styles.productModel}>型号：{product.model}</Text>
        <View className={styles.productBottom}>
          <Text className={styles.productPrice}>{formatPrice(product.price)}</Text>
          <View className={`${styles.stockTag} ${isLowStock ? styles.lowStock : ''}`}>
            <Text className={styles.stockText}>库存 {product.stock}{product.unit}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ProductCard;
