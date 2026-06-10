export const formatPrice = (price: number): string => {
  return `¥${price.toFixed(2)}`;
};

export const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return `${(num / 10000).toFixed(1)}万`;
  }
  return num.toString();
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hour}:${minute}`;
};

export const getOrderStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: '待确认',
    confirmed: '已确认',
    processing: '备货中',
    shipped: '已发货',
    completed: '已完成',
    cancelled: '已取消'
  };
  return statusMap[status] || status;
};

export const getPaymentStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    unpaid: '未付款',
    partial: '部分付款',
    paid: '已付清'
  };
  return statusMap[status] || status;
};

export const getDeliveryStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: '待发货',
    shipped: '运输中',
    delivered: '已送达'
  };
  return statusMap[status] || status;
};

export const getQuotationStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    draft: '草稿',
    sent: '已发送',
    accepted: '已接受',
    rejected: '已拒绝',
    expired: '已过期'
  };
  return statusMap[status] || status;
};
