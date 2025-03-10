const { CACHE_CONFIG } = require('../utils/config');
const { handleError, showLoading, hideLoading } = require('../utils/util');

// 获取所有菜品
const getAllDishes = async (retryCount = 0) => {
  try {
    // 检查缓存
    const cache = wx.getStorageSync(CACHE_CONFIG.DISHES_CACHE_KEY);
    if (cache && Date.now() - cache.timestamp < CACHE_CONFIG.CACHE_EXPIRE) {
      return cache.data;
    }

    showLoading('加载菜品中...');

    const db = wx.cloud.database();
    const result = await db.collection('dishes').get();

    // 更新缓存
    wx.setStorageSync(CACHE_CONFIG.DISHES_CACHE_KEY, {
      data: result.data,
      timestamp: Date.now()
    });

    hideLoading();
    return result.data;
  } catch (error) {
    hideLoading();
    if (retryCount < 3) {
      // 重试机制
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
      return getAllDishes(retryCount + 1);
    }
    handleError(error);
    throw error;
  }
};

// 根据分类获取菜品
const getDishesByCategory = async (categoryId) => {
  try {
    const dishes = await getAllDishes();
    return dishes.filter(dish => dish.categoryId === categoryId);
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// 搜索菜品
const searchDishes = async (keyword) => {
  try {
    showLoading('搜索菜品中...');

    const db = wx.cloud.database();
    const result = await db.collection('dishes')
      .where({
        title: db.RegExp({
          regexp: keyword,
          options: 'i'
        })
      })
      .get();

    hideLoading();
    return result.data;
  } catch (error) {
    hideLoading();
    handleError(error);
    throw error;
  }
};

// 添加菜品
const addDish = async (dishData) => {
  try {
    showLoading('添加菜品中...');

    const db = wx.cloud.database();
    const result = await db.collection('dishes').add({
      data: dishData
    });

    // 清除缓存
    wx.removeStorageSync(CACHE_CONFIG.DISHES_CACHE_KEY);

    hideLoading();
    return result;
  } catch (error) {
    hideLoading();
    handleError(error);
    throw error;
  }
};

// 更新菜品
const updateDish = async (dishId, updateData) => {
  try {
    showLoading('更新菜品中...');

    const db = wx.cloud.database();
    const result = await db.collection('dishes').doc(dishId).update({
      data: updateData
    });

    // 清除缓存
    wx.removeStorageSync(CACHE_CONFIG.DISHES_CACHE_KEY);

    hideLoading();
    return result;
  } catch (error) {
    hideLoading();
    handleError(error);
    throw error;
  }
};

// 删除菜品
const deleteDish = async (dishId) => {
  try {
    showLoading('删除菜品中...');

    const db = wx.cloud.database();
    const result = await db.collection('dishes').doc(dishId).remove();

    // 清除缓存
    wx.removeStorageSync(CACHE_CONFIG.DISHES_CACHE_KEY);

    hideLoading();
    return result;
  } catch (error) {
    hideLoading();
    handleError(error);
    throw error;
  }
};

module.exports = {
  getAllDishes,
  getDishesByCategory,
  searchDishes,
  addDish,
  updateDish,
  deleteDish
};