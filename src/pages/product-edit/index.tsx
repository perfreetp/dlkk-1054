import React, { useState, useEffect } from 'react';
import { View, Text, Input, Image, ScrollView } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import { useStore } from '@/store';
import { productCategories } from '@/data/products';
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
    images: []
  });

  const loadProduct = () => {
    if (isEdit) {
      const id = router.params.id;
      const found = useStore.getState().products.find(p => p.id === id);
      if (found) {
        setFormData(found);
        Taro.setNavigationBarTitle({ title: '编辑商品' });
      }
    } else {
      Taro.setNavigationBarTitle({ title: '新增商品' });
    }
  };

  useEffect(() => {
    loadProduct();
  }, [isEdit, router.params.id]);

  useDidShow(() => {
    if (isEdit) {
      const id = router.params.id;
      const found = useStore.getState().products.find(p => p.id === id);
      if (found) {
        setFormData(found);
      }
    }
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNumberInput = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: Number(value) || 0
    }));
  };

  const handleChooseImage = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        setFormData(prev => ({
          ...prev,
          images: [...(prev.images || []), tempFilePath]
        }));
      }
    });
  };

  const handleCategorySelect = () => {
    const categories = productCategories
      .filter(c => c.id !== 'all')
      .map(c => c.name);
    Taro.showActionSheet({
      itemList: categories,
      success: (res) => {
        setFormData(prev => ({
          ...prev,
          category: categories[res.tapIndex]
        }));
      }
    });
  };

  const handleAddSpec = () => {
    setFormData(prev => ({
      ...prev,
      spec: { ...prev.spec, '': '' }
    }));
  };

  const handleSpecKeyChange = (oldKey: string, newKey: string) => {
    setFormData(prev => {
      const newSpec: Record<string, string> = {};
      Object.entries(prev.spec || {}).forEach(([k, v]) => {
        if (k === oldKey) {
          newSpec[newKey] = v;
        } else {
          newSpec[k] = v;
        }
      });
      return { ...prev, spec: newSpec };
    });
  };

  const handleSpecValueChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      spec: { ...prev.spec, [key]: value }
    }));
  };

  const handleDeleteSpec = (key: string) => {
    setFormData(prev => {
      const newSpec = { ...prev.spec };
      delete newSpec[key];
      return { ...prev, spec: newSpec };
    });
  };

  const handleTierChange = (index: number, field: keyof TierPrice, value: string) => {
    setFormData(prev => {
      const tierPrices = [...(prev.tierPrices || [])];
      tierPrices[index] = { ...tierPrices[index], [field]: Number(value) || 0 };
      return { ...prev, tierPrices };
    });
  };

  const handleAddTier = () => {
    setFormData(prev => ({
      ...prev,
      tierPrices: [...(prev.tierPrices || []), { minQty: 1, price: 0 }]
    }));
  };

  const handleDeleteTier = (index: number) => {
    setFormData(prev => {
      const tierPrices = [...(prev.tierPrices || [])];
      tierPrices.splice(index, 1);
      return { ...prev, tierPrices };
    });
  };

  const handleSave = () => {
    if (!formData.name) {
      Taro.showToast({ title: '请输入商品名称', icon: 'none' });
      return;
    }
    if (isEdit) {
      const id = router.params.id;
      useStore.getState().updateProduct(id, formData);
    } else {
      useStore.getState().addProduct(formData as any);
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
          <View className={styles.imageItem} onClick={handleChooseImage}>
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
        <View className={styles.formItem} onClick={handleCategorySelect}>
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
            onInput={(e) => handleNumberInput('price', e.detail.value)}
          />
        </View>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>成本价</Text>
          <Input
            className={styles.formInput}
            type='digit'
            placeholder='请输入成本价'
            value={String(formData.costPrice)}
            onInput={(e) => handleNumberInput('costPrice', e.detail.value)}
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
              onInput={(e) => handleTierChange(index, 'minQty', e.detail.value)}
            />
            <Text className={styles.formLabel}>件起</Text>
            <Input
              className={styles.tierInput}
              type='digit'
              placeholder='单价'
              value={String(tier.price)}
              onInput={(e) => handleTierChange(index, 'price', e.detail.value)}
            />
            <Text className={styles.formLabel}>元</Text>
            {formData.tierPrices!.length > 1 && (
              <Text className={styles.deleteBtn} onClick={() => handleDeleteTier(index)}>×</Text>
            )}
          </View>
        ))}
        <View className={styles.addRow} onClick={handleAddTier}>
          <Text className={styles.addBtn}>+ 添加阶梯</Text>
        </View>
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
            onInput={(e) => handleNumberInput('stock', e.detail.value)}
          />
        </View>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>预警值</Text>
          <Input
            className={styles.formInput}
            type='number'
            placeholder='库存预警数量'
            value={String(formData.warnStock)}
            onInput={(e) => handleNumberInput('warnStock', e.detail.value)}
          />
        </View>
      </View>

      <View className={styles.sectionTitle}>
        <Text>商品规格</Text>
      </View>
      <View className={styles.formSection}>
        {Object.entries(formData.spec || {}).map(([key, value], index) => (
          <View key={index} className={styles.specRow}>
            <Input
              className={styles.specInput}
              placeholder='规格名'
              value={key}
              onInput={(e) => handleSpecKeyChange(key, e.detail.value)}
            />
            <Input
              className={styles.specInput}
              placeholder='规格值'
              value={value}
              onInput={(e) => handleSpecValueChange(key, e.detail.value)}
            />
            <Text className={styles.deleteBtn} onClick={() => handleDeleteSpec(key)}>×</Text>
          </View>
        ))}
        <View className={styles.addRow} onClick={handleAddSpec}>
          <Text className={styles.addBtn}>+ 添加规格</Text>
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
