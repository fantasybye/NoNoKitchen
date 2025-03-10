// 日期格式化
const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

// 防抖函数
const debounce = (fn, delay = 300) => {
  let timer = null;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
};

// 节流函数
const throttle = (fn, delay = 300) => {
  let last = 0;
  return function (...args) {
    const now = Date.now();
    if (now - last > delay) {
      fn.apply(this, args);
      last = now;
    }
  };
};

// 数据验证
const validateOrder = (order) => {
  if (!order.dishes || !Array.isArray(order.dishes) || order.dishes.length === 0) {
    throw new Error('订单必须包含至少一个菜品');
  }
  if (!order.createTime) {
    throw new Error('订单必须包含创建时间');
  }
  return true;
};

// 错误处理
const handleError = (error, showToast = true) => {
  console.error(error);
  if (showToast) {
    wx.showToast({
      title: error.message || '操作失败，请重试',
      icon: 'none',
      duration: 2000
    });
  }
  return false;
};

// 成功提示
const showSuccess = (message = '操作成功') => {
  wx.showToast({
    title: message,
    icon: 'success',
    duration: 2000
  });
};

// 确认对话框
const showConfirm = (title, content) => {
  return new Promise((resolve) => {
    wx.showModal({
      title,
      content,
      success: (res) => {
        resolve(res.confirm);
      }
    });
  });
};

// 加载提示
const showLoading = (title = '加载中...') => {
  wx.showLoading({
    title,
    mask: true
  });
};

const hideLoading = () => {
  wx.hideLoading();
};

module.exports = {
  formatDate,
  debounce,
  throttle,
  validateOrder,
  handleError,
  showSuccess,
  showConfirm,
  showLoading,
  hideLoading
};
