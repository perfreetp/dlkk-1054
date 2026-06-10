import React, { useState, useEffect } from 'react';
import { View, Text, Input, Image, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { mockProducts } from '@/data/products';
import type { Product, TierPrice } from '@/types';

const ProductEditPage: React.FC = () => {
  const router = useRouter();
  const isEdit = !!router.params.id;
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    model: '',
    category: '',
    price: 0,
    costPrice: 0,
    stock: 0,
    warnStock: 20,
    unit: '件',
    spec: {},
    tierPrices: [{ minQty: 1, price: 0 }],
    description: '',
    images: ['https://picsum.photos/id/225/300/300']
  });

  useEffect(() => {
    if (isEdit) {
      const id = router.params.id;
      const found = mockProducts.find(p => p.id === id);
      if (found) {
        setFormData(found);
        Taro.setNavigationBarTitle({ title: '编辑商品' });
      }
    } else {
      Taro.setNavigationBarTitle({ title: '新增商品' });
    }
  }, [isEdit, router.params.id]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    if (!formData.name) {
      Taro.showToast({ title: '请输入商品名称', icon: 'none' });
      return;
    }
    Taro.showToast({ title: '保存成功', icon: 'success' });
    setTimeout(() => {
      Taro.navigateBack();
    }, 1500);
  };

  return (
    <ScrollView className={styles.editPage} scrollY>
      <View className={styles.sectionTitle}>
        <Text>商品图片</Text>
      </View>
      <View className={styles.formSection}>
        <View className={styles.imageUpload}>
          {formData.images?.map((img, index) => (
            <View key={index} className={styles.imageItem}>
              <Image className={styles.productImage} src={img} mode='aspectFill' />
            </View>
          ))}
          <View className={styles.imageItem}>
            <Text className={styles.uploadIcon}>+</Text>
          </View>
        </View>
      </View>

      <View className={styles.sectionTitle}>
        <Text>基本信息</Text>
      </View>
      <View className={styles.formSection}>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>商品名称</Text>
          <Input
            className={styles.formInput}
            placeholder='请输入商品名称'
            value={formData.name}
            onInput={(e) => handleInputChange('name', e.detail.value)}
          />
        </View>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>商品型号</Text>
          <Input
            className={styles.formInput}
            placeholder='请输入型号'
            value={formData.model}
            onInput={(e) => handleInputChange('model', e.detail.value)}
          />
        </View>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>商品分类</Text>
          <Text className={styles.formInputText}>{formData.category || '请选择'}</Text>
        </View>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>计量单位</Text>
          <Input
            className={styles.formInput}
            placeholder='件/只/台等'
            value={formData.unit}
            onInput={(e) => handleInputChange('unit', e.detail.value)}
          />
        </View>
      </View>

      <View className={styles.sectionTitle}>
        <Text>价格设置</Text>
      </View>
      <View className={styles.formSection}>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>批发价</Text>
          <Input
            className={styles.formInput}
            type='digit'
            placeholder='请输入价格'
            value={String(formData.price)}
            onInput={(e) => handleInputChange('price', e.detail.value)}
          />
        </View>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>成本价</Text>
          <Input
            className={styles.formInput}
            type='digit'
            placeholder='请输入成本价'
            value={String(formData.costPrice)}
            onInput={(e) => handleInputChange('costPrice', e.detail.value)}
          />
        </View>
      </View>

      <View className={styles.sectionTitle}>
        <Text>阶梯批发价</Text>
      </View>
      <View className={styles.formSection}>
        {formData.tierPrices?.map((tier, index) => (
          <View key={index} className={styles.tierPriceItem}>
            <Input
              className={styles.tierInput}
              type='number'
              placeholder='起批量'
              value={String(tier.minQty)}
            />
            <Text className={styles.formLabel}>件起</Text>
            <Input
              className={styles.tierInput}
              type='digit'
              placeholder='单价'
              value={String(tier.price)}
            />
            <Text className={styles.formLabel}>元</Text>
          </View>
        ))}
      </View>

      <View className={styles.sectionTitle}>
        <Text>库存设置</Text>
      </View>
      <View className={styles.formSection}>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>当前库存</Text>
          <Input
            className={styles.formInput}
            type='number'
            placeholder='请输入库存数量'
            value={String(formData.stock)}
            onInput={(e) => handleInputChange('stock', e.detail.value)}
          />
        </View>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>预警值</Text>
          <Input
            className={styles.formInput}
            type='number'
            placeholder='库存预警数量'
            value={String(formData.warnStock)}
            onInput={(e) => handleInputChange('warnStock', e.detail.value)}
          />
        </View>
      </View>

      <View className={styles.sectionTitle}>
        <Text>商品描述</Text>
      </View>
      <View className={styles.formSection}>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>商品描述</Text>
          <Input
            className={styles.formInput}
            placeholder='请输入描述'
            value={formData.description}
            onInput={(e) => handleInputChange('description', e.detail.value)}
          />
        </View>
      </View>

      <View className={styles.bottomBar}>
        <View className={styles.saveBtn} onClick={handleSave}>
          <Text>保存商品</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default ProductEditPage;
