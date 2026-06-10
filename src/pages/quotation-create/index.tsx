import React, { useState, useEffect } from 'react';
import { View, Text, Input, Image, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { useStore } from '@/store';
import { formatPrice } from '@/utils/format';
import type { Customer, Product, QuotationItem } from '@/types';

const QuotationCreatePage: React.FC = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [items, setItems] = useState<QuotationItem[]>([]);
  const [validDate, setValidDate] = useState('');
  const [remark, setRemark] = useState('');
  const [showQtyModal, setShowQtyModal] = useState(false);
  const [qtyInput, setQtyInput] = useState('1');
  const [addingProduct, setAddingProduct] = useState<Product | null>(null);

  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + 10);
    setValidDate(d.toISOString().split('T')[0]);
    const pid = router.params.productId;
    if (pid) {
      const product = useStore.getState().products.find(p => p.id === pid);
      if (product) {
        addItem(product, 1);
        setStep(2);
      }
    }
  }, [router.params.productId]);

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
    setAddingProduct(product);
    setQtyInput('1');
    setShowQtyModal(true);
  };

  const confirmAddProduct = () => {
    if (addingProduct) {
      const qty = Number(qtyInput) || 1;
      addItem(addingProduct, qty);
    }
    setShowQtyModal(false);
    setAddingProduct(null);
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

  const handleSave = () => {
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
    useStore.getState().addQuotation({
      quotationNo: `BJ${y}${m}${d}${seq}`,
      customerId: selectedCustomer.id,
      customerName: `${selectedCustomer.name} - ${selectedCustomer.company}`,
      items,
      totalAmount,
      validDate,
      status: 'draft',
      remark,
    });
    Taro.showToast({ title: '报价单创建成功', icon: 'success' });
    setTimeout(() => Taro.navigateBack(), 1500);
  };

  const products = useStore.getState().products;
  const customers = useStore.getState().customers;

  return (
    <View className={styles.page}>
      <ScrollView className={styles.content} scrollY>
        <View className={styles.stepBar}>
          {[1, 2, 3, 4].map(s => (
            <View key={s} className={`${styles.stepDot} ${step >= s ? styles.stepActive : ''}`}>
              <Text className={styles.stepNum}>{s}</Text>
            </View>
          ))}
        </View>

        {step === 1 && (
          <View className={styles.section}>
            <View className={styles.sectionHeader}>
              <Text className={styles.sectionTitle}>选择客户</Text>
            </View>
            {customers.map(c => (
              <View
                key={c.id}
                className={`${styles.customerRow} ${selectedCustomer?.id === c.id ? styles.selected : ''}`}
                onClick={() => setSelectedCustomer(c)}
              >
                <View className={styles.customerAvatar}>
                  <Text className={styles.avatarText}>{c.name.charAt(0)}</Text>
                </View>
                <View className={styles.customerInfo}>
                  <Text className={styles.customerName}>{c.name} - {c.company}</Text>
                  <Text className={styles.customerPhone}>{c.phone}</Text>
                </View>
                {selectedCustomer?.id === c.id && <Text className={styles.checkIcon}>✓</Text>}
              </View>
            ))}
          </View>
        )}

        {step === 2 && (
          <View className={styles.section}>
            <View className={styles.sectionHeader}>
              <Text className={styles.sectionTitle}>选择商品</Text>
            </View>
            {products.map(p => {
              const added = items.find(i => i.productId === p.id);
              return (
                <View key={p.id} className={styles.productRow} onClick={() => handleProductClick(p)}>
                  <Image className={styles.productImg} src={p.image} mode='aspectFill' />
                  <View className={styles.productInfo}>
                    <Text className={styles.productName}>{p.name}</Text>
                    <Text className={styles.productModel}>{p.model}</Text>
                    <Text className={styles.productPrice}>{formatPrice(p.price)}/{p.unit}</Text>
                  </View>
                  {added ? (
                    <Text className={styles.addedTag}>已添加</Text>
                  ) : (
                    <Text className={styles.addTag}>+添加</Text>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {step === 3 && (
          <View className={styles.section}>
            <View className={styles.sectionHeader}>
              <Text className={styles.sectionTitle}>确认商品</Text>
            </View>
            {items.map(item => (
              <View key={item.productId} className={styles.itemRow}>
                <Image className={styles.itemImg} src={item.productImage} mode='aspectFill' />
                <View className={styles.itemInfo}>
                  <Text className={styles.itemName}>{item.productName}</Text>
                  <Text className={styles.itemModel}>{item.model}</Text>
                  <Text className={styles.itemPrice}>{formatPrice(item.price)}/件</Text>
                </View>
                <View className={styles.qtyControl}>
                  <Text className={styles.qtyBtn} onClick={() => updateItemQty(item.productId, item.quantity - 1)}>-</Text>
                  <Text className={styles.qtyValue}>{item.quantity}</Text>
                  <Text className={styles.qtyBtn} onClick={() => updateItemQty(item.productId, item.quantity + 1)}>+</Text>
                </View>
                <View className={styles.itemRight}>
                  <Text className={styles.itemAmount}>{formatPrice(item.amount)}</Text>
                  <Text className={styles.removeBtn} onClick={() => removeItem(item.productId)}>删除</Text>
                </View>
              </View>
            ))}
            <View className={styles.totalRow}>
              <Text className={styles.totalLabel}>合计</Text>
              <Text className={styles.totalValue}>{formatPrice(totalAmount)}</Text>
            </View>
          </View>
        )}

        {step === 4 && (
          <View className={styles.section}>
            <View className={styles.summaryCard}>
              <View className={styles.summaryRow}>
                <Text className={styles.summaryLabel}>客户</Text>
                <Text className={styles.summaryValue}>{selectedCustomer?.name} - {selectedCustomer?.company}</Text>
              </View>
              <View className={styles.summaryRow}>
                <Text className={styles.summaryLabel}>商品数</Text>
                <Text className={styles.summaryValue}>{items.length}种</Text>
              </View>
              <View className={styles.summaryRow}>
                <Text className={styles.summaryLabel}>总金额</Text>
                <Text className={styles.summaryAmount}>{formatPrice(totalAmount)}</Text>
              </View>
            </View>
            <View className={styles.formItem}>
              <Text className={styles.formLabel}>有效期至</Text>
              <Input className={styles.formInput} type='text' value={validDate} onInput={e => setValidDate(e.detail.value)} placeholder='YYYY-MM-DD' />
            </View>
            <View className={styles.formItem}>
              <Text className={styles.formLabel}>备注</Text>
              <Input className={styles.formInput} value={remark} onInput={e => setRemark(e.detail.value)} placeholder='选填' />
            </View>
          </View>
        )}
      </ScrollView>

      {showQtyModal && (
        <View className={styles.modalOverlay}>
          <View className={styles.modal}>
            <Text className={styles.modalTitle}>输入数量</Text>
            <Input
              className={styles.modalInput}
              type='number'
              value={qtyInput}
              onInput={e => setQtyInput(e.detail.value)}
              autoFocus
            />
            <View className={styles.modalBtns}>
              <View className={styles.modalCancel} onClick={() => setShowQtyModal(false)}><Text>取消</Text></View>
              <View className={styles.modalConfirm} onClick={confirmAddProduct}><Text>确认</Text></View>
            </View>
          </View>
        </View>
      )}

      <View className={styles.bottomBar}>
        {step > 1 && (
          <View className={styles.prevBtn} onClick={() => setStep(s => s - 1)}>
            <Text>上一步</Text>
          </View>
        )}
        {step < 4 ? (
          <View className={styles.nextBtn} onClick={() => setStep(s => s + 1)}>
            <Text>下一步</Text>
          </View>
        ) : (
          <View className={styles.saveBtn} onClick={handleSave}>
            <Text>保存报价单</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default QuotationCreatePage;
