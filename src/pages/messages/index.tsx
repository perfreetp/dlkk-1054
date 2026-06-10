import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import EmptyState from '@/components/EmptyState';
import { useStore } from '@/store';
import { formatDateTime } from '@/utils/format';
import type { Message } from '@/types';

type MessageType = 'all' | 'system' | 'order' | 'inventory' | 'market';

const MessagesPage: React.FC = () => {
  const [activeType, setActiveType] = useState<MessageType>('all');
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    setMessages(useStore.getState().messages);
  }, []);

  const filteredMessages = messages.filter(msg =>
    activeType === 'all' ? true : msg.type === activeType
  );

  const unreadCount = messages.filter(msg => !msg.isRead).length;

  const typeTabs = [
    { key: 'all' as MessageType, label: '全部', icon: '📬' },
    { key: 'system' as MessageType, label: '系统', icon: '⚙️' },
    { key: 'order' as MessageType, label: '订单', icon: '📦' },
    { key: 'inventory' as MessageType, label: '库存', icon: '📊' },
    { key: 'market' as MessageType, label: '市场', icon: '📢' }
  ];

  const handleMessageClick = (id: string) => {
    useStore.getState().markMessageRead(id);
    setMessages(useStore.getState().messages);
    Taro.showToast({ title: '查看详情', icon: 'none' });
  };

  const handleMarkAllRead = () => {
    useStore.getState().markAllMessagesRead();
    setMessages(useStore.getState().messages);
    Taro.showToast({ title: '已全部标为已读', icon: 'success' });
  };

  const getTypeIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      system: '⚙️',
      order: '📦',
      inventory: '📊',
      market: '📢'
    };
    return iconMap[type] || '📬';
  };

  const getTypeLabel = (type: string) => {
    const labelMap: Record<string, string> = {
      system: '系统通知',
      order: '订单通知',
      inventory: '库存通知',
      market: '市场通知'
    };
    return labelMap[type] || '消息';
  };

  return (
    <View className={styles.messagePage}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>消息中心</Text>
        {unreadCount > 0 && (
          <View className={styles.markAllBtn} onClick={handleMarkAllRead}>
            <Text className={styles.markAllText}>全部已读</Text>
          </View>
        )}
      </View>

      <View className={styles.typeTabs}>
        <ScrollView scrollX className={styles.tabsScroll}>
          <View className={styles.tabsContainer}>
            {typeTabs.map(tab => {
              const typeUnread = messages.filter(m =>
                (tab.key === 'all' ? true : m.type === tab.key) && !m.isRead
              ).length;
              return (
                <View
                  key={tab.key}
                  className={`${styles.tabItem} ${activeType === tab.key ? styles.tabActive : ''}`}
                  onClick={() => setActiveType(tab.key)}
                >
                  <Text className={styles.tabIcon}>{tab.icon}</Text>
                  <Text className={styles.tabLabel}>{tab.label}</Text>
                  {typeUnread > 0 && (
                    <View className={styles.tabBadge}>
                      <Text className={styles.badgeText}>
                        {typeUnread > 99 ? '99+' : typeUnread}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>

      <ScrollView className={styles.messageList} scrollY>
        {filteredMessages.length > 0 ? (
          filteredMessages.map(msg => (
            <View
              key={msg.id}
              className={`${styles.messageCard} ${!msg.isRead ? styles.unread : ''}`}
              onClick={() => handleMessageClick(msg.id)}
            >
              <View className={styles.messageIcon}>
                <Text className={styles.iconEmoji}>{getTypeIcon(msg.type)}</Text>
              </View>
              <View className={styles.messageContent}>
                <View className={styles.messageHeader}>
                  <Text className={styles.messageTitle}>{msg.title}</Text>
                  {!msg.isRead && <View className={styles.unreadDot} />}
                </View>
                <Text className={styles.messageDesc}>{msg.content}</Text>
                <View className={styles.messageFooter}>
                  <Text className={styles.messageType}>{getTypeLabel(msg.type)}</Text>
                  <Text className={styles.messageTime}>{formatDateTime(msg.createdAt)}</Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <EmptyState
            icon='📭'
            title='暂无消息'
            description='有新消息会在这里显示'
          />
        )}
      </ScrollView>
    </View>
  );
};

export default MessagesPage;
