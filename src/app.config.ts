export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/products/index',
    'pages/orders/index',
    'pages/customers/index',
    'pages/mine/index',
    'pages/product-detail/index',
    'pages/product-edit/index',
    'pages/quotations/index',
    'pages/quotation-detail/index',
    'pages/order-detail/index',
    'pages/inventory/index',
    'pages/finance/index',
    'pages/messages/index',
    'pages/customer-detail/index',
    'pages/quotation-create/index',
    'pages/order-create/index',
    'pages/payment/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: '灯具批发管家',
    navigationBarTextStyle: 'black',
    backgroundColor: '#f5f6f8'
  },
  tabBar: {
    color: '#86909c',
    selectedColor: '#ff7a00',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页'
      },
      {
        pagePath: 'pages/products/index',
        text: '商品'
      },
      {
        pagePath: 'pages/orders/index',
        text: '订单'
      },
      {
        pagePath: 'pages/customers/index',
        text: '客户'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
