// pages/menu/index.js
const { PAGE_CONFIG } = require('../../utils/config');
const { throttle, showConfirm, showSuccess, showLoading, hideLoading, handleError } = require('../../utils/util');
const orderService = require('../../services/orderService');
const dishService = require('../../services/dishService');
const { CATEGORIES } = require('../../utils/categoryConfig');

Page({
  data: {
    // 页面参数
    currentTab: 0,
    windowWidth: 0,
    tabsContentHeight: 0,
    tabHeight: 0,
    categoryBoxScrollTop: 0,
    categoryBoxScrollIntoView: 0,
    isScrollWithAnimation: false,
    isLoaded: false,
    animationData: {},

    // 点餐相关参数
    currentCategory: 0,
    currentCategoryTitle: 0,
    currentCategoryContent: 15,
    isCategoryItemTap: false,
    isAddItemTopArray: true,
    itemTopArray: [],
    isContentCanFloat: [],
    cartItems: [],
    categoryCounts: {},
    // 购物车弹出窗相关参数
    isCartPopupShow: false,

    // 订单相关参数
    orders: [],
    isOrderDetailShow: false,
    currentOrder: null,
    currentPage: 1,
    hasMore: true,

    // 菜品数据
    allDishes: [],
    currentCategoryDishes: [],

    // 使用导入的类目配置
    categories: CATEGORIES,

    imageCache: new Map(), // 用于缓存图片加载状态
  },

  onLoad(options) {
    this.initPage();
  },

  async onShow() {
    // 如果页面刚初始化且未加载数据，确保加载菜品
    if (this.data.allDishes.length === 0) {
      console.log('首次加载菜品数据');
      await this.loadDishes();
    }

    // 检查是否需要刷新菜品列表
    const refreshFlag = wx.getStorageSync('needRefreshDishes');
    if (refreshFlag) {
      console.log('检测到需要刷新菜品列表');
      // 清除刷新标记
      wx.removeStorageSync('needRefreshDishes');
      // 重新加载菜品数据
      this.loadDishes().then(() => {
        wx.showToast({
          title: '菜品已更新',
          icon: 'success',
          duration: 1500
        });
      });
    }
  },

  // 切换标签页
  setCurrentTab(e) {
    const tab = parseInt(e.currentTarget.dataset.tab);
    this.setData({
      currentTab: tab,
      // 切换标签页时关闭所有弹窗
      isCartPopupShow: false,
      isOrderDetailShow: false,
      currentOrder: null
    });
    // 切换到订单标签页时加载订单列表
    if (tab === 1) {
      this.loadOrders();
    }
  },

  // 切换标签页
  changeTab(e) {
    const tab = e.detail.current;
    this.setData({
      currentTab: tab,
      // 切换标签页时关闭所有弹窗
      isCartPopupShow: false,
      isOrderDetailShow: false,
      currentOrder: null
    });
    // 切换到订单标签页时加载订单列表
    if (tab === 1) {
      this.loadOrders();
    }
  },

  // 初始化页面
  async initPage() {
    try {
      // 获取窗口信息
      const res = await wx.getWindowInfo();
      this.setData({ windowWidth: res.windowWidth });

      // 加载菜品数据
      await this.loadDishes();

      // 初始化分类滚动
      this.initCategoryScroll();
    } catch (error) {
      console.error('页面初始化失败:', error);
    }
  },

  // 初始化分类滚动
  initCategoryScroll() {
    const totalCont = 15;
    this.setData({
      currentCategoryContent: totalCont,
      categoryBoxScrollIntoView: totalCont
    });

    const timer = setInterval(() => {
      const currentCont = this.data.currentCategoryContent - 1;
      if (currentCont < 0) {
        clearInterval(timer);
        this.setData({
          isAddItemTopArray: false,
          isLoaded: true
        });
      } else {
        this.setData({
          currentCategoryContent: currentCont,
          categoryBoxScrollIntoView: currentCont
        });
      }
    }, 300);
  },

  // 处理图片加载
  onImageLoad(e) {
    const { index, category } = e.currentTarget.dataset;
    const key = `${category}-${index}`;

    // 更新图片加载状态
    this.setData({
      [`currentCategoryDishes[${index}].imageLoaded`]: true
    });

    // 缓存图片加载状态
    this.data.imageCache.set(key, true);
  },

  // 加载菜品数据
  async loadDishes() {
    try {
      const dishes = await dishService.getAllDishes();
      this.setData({
        allDishes: dishes,
        currentCategoryDishes: this.filterDishesByCategory(this.data.currentCategory)
      });

      // 预加载所有菜品图片
      this.preloadImages(dishes);

      return Promise.resolve();
    } catch (error) {
      console.error('加载菜品失败:', error);
      return Promise.reject(error);
    }
  },

  // 根据分类过滤菜品
  filterDishesByCategory(categoryId) {
    return this.data.allDishes.filter(dish => dish.categoryId === categoryId);
  },

  // 切换分类
  switchCategory(e) {
    const category = e.detail.category;
    if (typeof category === 'number') {
      this.setData({
        currentCategory: category,
        currentCategoryDishes: this.filterDishesByCategory(category)
      });
    }
  },

  // 添加到购物车
  addToCart(e) {
    const item = e.detail.item;
    let cartItems = this.data.cartItems.slice();

    if (cartItems.findIndex(cartItem => cartItem.id === item.id) === -1) {
      let newItem = Object.assign({}, item);
      newItem.quantity = 1;
      cartItems.push(newItem);

      this.setData({ cartItems });
      this.updateCategoryCount(item.categoryId);
      this.updateGoodsItemStatus();
    }
  },

  // 从购物车移除
  removeFromCart(e) {
    const item = e.currentTarget.dataset.item;
    let cartItems = this.data.cartItems.filter(cartItem => cartItem.id !== item.id);

    this.setData({ cartItems });
    this.updateCategoryCount(item.categoryId);
    this.updateGoodsItemStatus();
  },

  // 更新类别计数
  updateCategoryCount(categoryId) {
    const count = this.data.cartItems.filter(item => item.categoryId === categoryId).length;
    const categoryCounts = Object.assign({}, this.data.categoryCounts);
    categoryCounts[categoryId] = count;
    this.setData({ categoryCounts });
  },

  // 更新商品状态
  updateGoodsItemStatus() {
    try {
      const pages = getCurrentPages();
      if (!pages || pages.length === 0) return;

      const page = pages[pages.length - 1];
      if (page.route !== 'pages/menu/index') return;

      const goodsItems = page.selectAllComponents('.goods-item');
      if (!goodsItems || !goodsItems.length) return;

      const cartItemIds = this.data.cartItems.map(item => item.id);
      goodsItems.forEach(component => {
        if (component && component.properties && component.properties.item) {
          const itemId = component.properties.item.id;
          if (typeof component.setAddedState === 'function') {
            component.setAddedState(cartItemIds.includes(itemId));
          }
        }
      });
    } catch (err) {
      console.error('更新商品状态失败', err);
    }
  },

  // 加载订单列表
  async loadOrders(page = 1) {
    try {
      const orders = await orderService.getOrders(page, PAGE_CONFIG.PAGE_SIZE);
      this.setData({
        orders: page === 1 ? orders : this.data.orders.concat(orders),
        hasMore: orders.length === PAGE_CONFIG.PAGE_SIZE,
        currentPage: page
      });
    } catch (error) {
      console.error('加载订单失败:', error);
    }
  },

  // 加载更多订单
  async loadMoreOrders() {
    if (!this.data.hasMore) return;
    await this.loadOrders(this.data.currentPage + 1);
  },

  // 提交订单
  async submitOrder() {
    if (this.data.cartItems.length === 0) {
      wx.showToast({
        title: '请先选择菜品',
        icon: 'none'
      });
      return;
    }

    const confirmed = await showConfirm('确认下单', '确定要提交这个订单吗？');
    if (!confirmed) return;

    try {
      const dishes = this.data.cartItems.map(item => {
        const newItem = Object.assign({}, item);
        delete newItem.quantity;
        return newItem;
      });

      // 只包含菜品和创建时间
      const orderData = {
        dishes,
        createTime: new Date().toISOString()
      };

      await orderService.createOrder(orderData);

      showSuccess('下单成功');

      // 清空购物车
      this.setData({
        cartItems: [],
        isCartPopupShow: false,
        categoryCounts: {}
      });

      // 更新商品状态
      this.updateGoodsItemStatus();

      // 重新加载订单列表
      await this.loadOrders();
    } catch (error) {
      console.error('提交订单失败:', error);
    }
  },

  // 查看订单详情
  async viewOrderDetail(e) {
    const orderId = e.currentTarget.dataset.id;
    try {
      // 先关闭之前的弹窗
      this.setData({
        isOrderDetailShow: false,
        currentOrder: null
      });

      // 获取新订单详情
      const order = await orderService.getOrderDetail(orderId);

      // 显示新订单详情
      this.setData({
        currentOrder: order,
        isOrderDetailShow: true
      });
    } catch (error) {
      console.error('获取订单详情失败:', error);
      // 发生错误时确保弹窗关闭
      this.setData({
        isOrderDetailShow: false,
        currentOrder: null
      });
    }
  },

  // 切换购物车弹出窗
  toggleCartPopup() {
    // 切换购物车时关闭订单详情
    this.setData({
      isCartPopupShow: !this.data.isCartPopupShow,
      isOrderDetailShow: false,
      currentOrder: null
    });
  },

  // 关闭购物车弹出窗
  closeCartPopup() {
    this.setData({
      isCartPopupShow: false
    });
  },

  // 关闭订单详情
  closeOrderDetail() {
    this.setData({
      isOrderDetailShow: false,
      currentOrder: null
    });
  },

  // 页面事件处理
  onPullDownRefresh: async function() {
    try {
      // 刷新时关闭所有弹窗
      this.setData({
        isCartPopupShow: false,
        isOrderDetailShow: false,
        currentOrder: null
      });

      await Promise.all([
        this.loadDishes(),
        this.loadOrders(1)
      ]);
      wx.stopPullDownRefresh();
    } catch (error) {
      console.error('下拉刷新失败:', error);
    }
  },

  onReachBottom: function() {
    if (this.data.currentTab === 1) {
      this.loadMoreOrders();
    }
  },

  // 导航到上传菜品页面
  navigateToUploadDish: function() {
    wx.navigateTo({
      url: '/pages/upload-dish/index'
    });
  },

  // 修改预加载图片的方法
  preloadImages(dishes) {
    if (!dishes || dishes.length === 0) return;

    console.log('开始预加载', dishes.length, '张菜品图片');
    const imageUrls = dishes.map(dish => dish.image).filter(url => url && url.trim() !== '');

    if (imageUrls.length === 0) return;

    // 先将云文件ID转换为临时可访问的URL
    this.getTemporaryUrls(imageUrls).then(tempUrls => {
      console.log('获取到临时URL:', tempUrls.length);

      // 创建计数器跟踪加载进度
      let loadedCount = 0;

      tempUrls.forEach(url => {
        wx.getImageInfo({
          src: url,
          success: () => {
            loadedCount++;
            if (loadedCount === tempUrls.length) {
              console.log('所有菜品图片预加载完成');
            }
          },
          fail: (err) => {
            console.error('图片预加载失败:', url, err);
            loadedCount++;
          }
        });
      });
    }).catch(err => {
      console.error('获取临时URL失败:', err);
    });
  },

  // 添加新方法：将云文件ID转换为临时URL
  getTemporaryUrls(fileIDs) {
    return new Promise((resolve, reject) => {
      // 处理云开发路径
      const cloudIDs = fileIDs.filter(url => url.startsWith('cloud://'));

      // 如果没有云存储路径，直接返回原始URLs
      if (cloudIDs.length === 0) {
        resolve(fileIDs);
        return;
      }

      // 获取临时文件URL
      wx.cloud.getTempFileURL({
        fileList: cloudIDs,
        success: res => {
          // 创建映射表 - 从原始fileID到临时URL
          const urlMap = {};
          res.fileList.forEach(item => {
            if (item.status === 0) { // 0表示成功
              urlMap[item.fileID] = item.tempFileURL;
            } else {
              console.warn('获取临时URL失败:', item.fileID, item.errMsg);
            }
          });

          // 替换原始URL为临时URL
          const resultUrls = fileIDs.map(url => {
            if (url.startsWith('cloud://') && urlMap[url]) {
              return urlMap[url];
            }
            return url; // 保留非云存储URL不变
          });

          resolve(resultUrls);
        },
        fail: err => {
          console.error('获取临时URL批量失败:', err);
          // 即使失败也返回原始URLs，继续尝试加载那些不是云存储的图片
          resolve(fileIDs);
        }
      });
    });
  },

  // 其他页面方法保持不变...
});