const { formatDate, validateOrder, handleError, showLoading, hideLoading } = require('../utils/util');

// 创建订单
const createOrder = async (orderData) => {
  try {
    showLoading('创建订单中...');

    // 验证订单数据
    validateOrder(orderData);

    // 添加创建时间
    orderData.createTime = formatDate(new Date());

    const db = wx.cloud.database();
    const result = await db.collection('orders').add({
      data: orderData
    });

    hideLoading();
    return result;
  } catch (error) {
    hideLoading();
    handleError(error);
    throw error;
  }
};

// 获取订单列表
const getOrders = async (page = 1, pageSize = 20) => {
  try {
    showLoading('加载订单中...');

    const db = wx.cloud.database();
    const result = await db.collection('orders')
      .orderBy('createTime', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get();

    hideLoading();
    return result.data;
  } catch (error) {
    hideLoading();
    handleError(error);
    throw error;
  }
};

// 获取订单详情
const getOrderDetail = async (orderId) => {
  try {
    showLoading('加载订单详情...');

    const db = wx.cloud.database();
    const result = await db.collection('orders').doc(orderId).get();

    hideLoading();
    return result.data;
  } catch (error) {
    hideLoading();
    handleError(error);
    throw error;
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderDetail
};