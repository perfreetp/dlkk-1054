import React, { useState } from 'react';
import { View, Text, Input, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useStore } from '@/store';
import { formatPrice } from '@/utils/format';
import type { Customer, Product, OrderItem } from '@/types';

const OrderCreatePage: React.FC = () => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [deposit, setDeposit] = useState('0');
  const [remark, setRemark] = useState('');
  const [searchText, setSearchText] = useState('');
  const [showCustomerPicker, setShowCustomerPicker] = useState(false);

  const addItem = (product: Product, quantity: number) => {
    const price = useStore.getState().getTierPrice(product.id, quantity);
    setItems(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) {
        const newQty = existing.quantity + quantity;
        const newPrice = useStore.getState().getTierPrice(product.id, newQty);
        return prev.map(i =>
          i.productId === product.id
            ? { ...i, quantity: newQty, price: newPrice, amount: newPrice * newQty }
            : i
        );
      }
      return [...prev, {
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        model: product.model,
        price,
        quantity,
        amount: price * quantity,
      }];
    });
  };

  const handleProductClick = (product: Product) => {
    addItem(product, 1);
  };

  const handleScan = () => {
    Taro.scanCode({
      scanType: ['barCode', 'qrCode'],
      success: (res) => {
        const code = res.result;
        const product = useStore.getState().products.find(p =>
          p.model.toLowerCase().includes(code.toLowerCase()) || p.id === code
        );
        if (product) {
          addItem(product, 1);
          Taro.showToast({ title: `已添加：${product.name}`, icon: 'none' });
        } else {
          Taro.showToast({ title: '未找到匹配商品', icon: 'none' });
        }
      },
      fail: () => {
        Taro.showToast({ title: '扫码取消', icon: 'none' });
      }
    });
  };

  const updateItemQty = (productId: string, newQty: number) => {
    if (newQty < 1) return;
    setItems(prev => prev.map(item => {
      if (item.productId === productId) {
        const price = useStore.getState().getTierPrice(productId, newQty);
        return { ...item, quantity: newQty, price, amount: price * newQty };
      }
      return item;
    }));
  };

  const removeItem = (productId: string) => {
    setItems(prev => prev.filter(i => i.productId !== productId));
  };

  const totalAmount = items.reduce((sum, i) => sum + i.amount, 0);
  const depositAmount = Number(deposit) || 0;
  const balanceAmount = Math.max(0, totalAmount - depositAmount);

  const handleCreate = () => {
    if (!selectedCustomer) {
      Taro.showToast({ title: '请选择客户', icon: 'none' });
      return;
    }
    if (items.length === 0) {
      Taro.showToast({ title: '请添加商品', icon: 'none' });
      return;
    }
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const seq = Math.floor(Math.random() * 900 + 100);
    const paymentStatus = depositAmount <= 0 ? 'unpaid' : depositAmount >= totalAmount ? 'paid' : 'partial';
    useStore.getState().addOrder({
      orderNo: `DD${y}${m}${d}${seq}`,
      customerId: selectedCustomer.id,
      customerName: `${selectedCustomer.name} - ${selectedCustomer.company}`,
      items,
      totalAmount,
      deposit: depositAmount,
      balance: balanceAmount,
      status: 'pending',
      paymentStatus,
      deliveryStatus: 'pending',
      remark,
      salesman: '张店长',
    });
    Taro.showToast({ title: '订单创建成功', icon: 'success' });
    setTimeout(() => Taro.navigateBack(), 1500);
  };

  const products = useStore.getState().products;
  const customers = useStore.getState().customers;
  const filteredProducts = searchText.trim()
    ? products.filter(p =>
        p.name.toLowerCase().includes(searchText.toLowerCase()) ||
        p.model.toLowerCase().includes(searchText.toLowerCase())
      )
    : products;

  return (
    <View className={styles.page}>
      <ScrollView className={styles.content} scrollY>
        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>客户信息</Text>
            <Text className={styles.selectBtn} onClick={() => setShowCustomerPicker(true)}>
              {selectedCustomer ? '更换客户' : '选择客户'}
            </Text>
          </View>
          {selectedCustomer ? (
            <View className={styles.selectedCustomer}>
              <Text className={styles.customerName}>{selectedCustomer.name} - {selectedCustomer.company}</Text>
              <Text className={styles.customerPhone}>{selectedCustomer.phone}</Text>
            </View>
          ) : (
            <View className={styles.emptyHint}>
              <Text className={styles.emptyText}>请选择客户</Text>
            </View>
          )}
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>添加商品</Text>
            <Text className={styles.scanBtn} onClick={handleScan}>📷 扫码</Text>
          </View>
          <View className={styles.searchRow}>
            <Input
              className={styles.searchInput}
              placeholder='搜索商品名称/型号'
              value={searchText}
              onInput={e => setSearchText(e.detail.value)}
            />
          </View>
          <ScrollView scrollY className={styles.productListScroll}>
            {filteredProducts.map(p => {
              const added = items.find(i => i.productId === p.id);
              return (
                <View key={p.id} className={styles.productRow} onClick={() => handleProductClick(p)}>
                  <Image className={styles.productImg} src={p.image} mode='aspectFill' />
                  <View className={styles.productInfo}>
                    <Text className={styles.productName}>{p.name}</Text>
                    <Text className={styles.productModel}>{p.model}</Text>
                  </View>
                  {added ? (
                    <Text className={styles.addedQty}>×{added.quantity}</Text>
                  ) : (
                    <Text className={styles.addTag}>+添加</Text>
                  )}
                </View>
              );
            })}
          </ScrollView>
        </View>

        {items.length > 0 && (
          <View className={styles.section}>
            <View className={styles.sectionHeader}>
              <Text className={styles.sectionTitle}>已选商品</Text>
            </View>
            {items.map(item => (
              <View key={item.productId} className={styles.itemRow}>
                <View className={styles.itemInfo}>
                  <Text className={styles.itemName}>{item.productName}</Text>
                  <Text className={styles.itemModel}>{item.model} · {formatPrice(item.price)}/件</Text>
                </View>
                <View className={styles.qtyControl}>
                  <Text className={styles.qtyBtn} onClick={() => updateItemQty(item.productId, item.quantity - 1)}>-</Text>
                  <Text className={styles.qtyValue}>{item.quantity}</Text>
                  <Text className={styles.qtyBtn} onClick={() => updateItemQty(item.productId, item.quantity + 1)}>+</Text>
                </View>
                <Text className={styles.itemAmount}>{formatPrice(item.amount)}</Text>
                <Text className={styles.removeBtn} onClick={() => removeItem(item.productId)}>×</Text>
              </View>
            ))}
          </View>
        )}

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>金额与备注</Text>
          </View>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>商品总额</Text>
            <Text className={styles.formValue}>{formatPrice(totalAmount)}</Text>
          </View>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>订金</Text>
            <Input className={styles.formInput} type='digit' placeholder='选填' value={deposit} onInput={e => setDeposit(e.detail.value)} />
          </View>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>待收尾款</Text>
            <Text className={styles.formValue}>{formatPrice(balanceAmount)}</Text>
          </View>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>备注</Text>
            <Input className={styles.formInput} value={remark} onInput={e => setRemark(e.detail.value)} placeholder='选填' />
          </View>
        </View>
      </ScrollView>

      {showCustomerPicker && (
        <View className={styles.modalOverlay}>
          <View className={styles.modal}>
            <Text className={styles.modalTitle}>选择客户</Text>
            <ScrollView scrollY className={styles.customerListScroll}>
              {customers.map(c => (
                <View
                  key={c.id}
                  className={`${styles.customerOption} ${selectedCustomer?.id === c.id ? styles.selectedOption : ''}`}
                  onClick={() => { setSelectedCustomer(c); setShowCustomerPicker(false); }}
                >
                  <View className={styles.customerAvatar}>
                    <Text className={styles.avatarText}>{c.name.charAt(0)}</Text>
                  </View>
                  <View className={styles.customerInfo}>
                    <Text className={styles.custName}>{c.name} - {c.company}</Text>
                    <Text className={styles.custPhone}>{c.phone}</Text>
                  </View>
                  {selectedCustomer?.id === c.id && <Text className={styles.checkIcon}>✓</Text>}
                </View>
              ))}
            </ScrollView>
            <View className={styles.modalCancel} onClick={() => setShowCustomerPicker(false)}>
              <Text>取消</Text>
            </View>
          </View>
        </View>
      )}

      <View className={styles.bottomBar}>
        <View className={styles.totalInfo}>
          <Text className={styles.totalLabel}>合计：</Text>
          <Text className={styles.totalAmount}>{formatPrice(totalAmount)}</Text>
        </View>
        <View className={styles.createBtn} onClick={handleCreate}>
          <Text>创建订单</Text>
        </View>
      </View>
    </View>
  );
};

export default OrderCreatePage;
