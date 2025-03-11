const { CATEGORIES, CATEGORY_NAMES } = require('../../utils/categoryConfig');

Page({
  data: {
    dishName: '',
    categoryIndex: null,
    categories: CATEGORIES,
    categoryNames: CATEGORY_NAMES,
    tempImagePath: '',
    cloudImagePath: '',
    nameError: false,
    categoryError: false
  },

  onLoad: function(options) {
    wx.setNavigationBarTitle({
      title: '添加菜品'
    });
  },

  onDishNameInput: function(e) {
    this.setData({
      dishName: e.detail.value,
      nameError: false
    });
  },

  onCategoryChange: function(e) {
    this.setData({
      categoryIndex: parseInt(e.detail.value),
      categoryError: false
    });
  },

  chooseImage: function() {
    const that = this;
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success(res) {
        that.setData({
          tempImagePath: res.tempFiles[0].tempFilePath
        });
      }
    });
  },

  validateForm: function() {
    let isValid = true;

    // 验证菜品名称
    if (!this.data.dishName.trim()) {
      this.setData({ nameError: true });
      isValid = false;
    }

    // 验证菜品分类
    if (this.data.categoryIndex === null) {
      this.setData({ categoryError: true });
      isValid = false;
    }

    return isValid;
  },

  uploadImage: function() {
    return new Promise((resolve, reject) => {
      if (!this.data.tempImagePath) {
        // 如果没有上传图片，使用默认图片
        resolve('../../images/food/food.png');
        return;
      }

      const cloudPath = `dishes/${Date.now()}-${Math.floor(Math.random() * 1000)}${this.data.tempImagePath.match(/\.[^.]+?$/)[0]}`;

      wx.cloud.uploadFile({
        cloudPath: cloudPath,
        filePath: this.data.tempImagePath,
        success: res => {
          resolve(res.fileID);
        },
        fail: err => {
          wx.showToast({
            title: '图片上传失败',
            icon: 'none'
          });
          reject(err);
        }
      });
    });
  },

  submitDish: function() {
    if (!this.validateForm()) {
      return;
    }

    wx.showLoading({
      title: '保存中...',
    });

    const that = this;
    this.uploadImage().then(imagePath => {
      const db = wx.cloud.database();
      return db.collection('dishes').add({
        data: {
          title: that.data.dishName,
          categoryId: that.data.categories[that.data.categoryIndex].id,
          image: imagePath || '../../images/food/food.png',
          createTime: new Date()
        }
      });
    }).then(() => {
      wx.hideLoading();
      wx.showToast({
        title: '保存成功',
        icon: 'success',
        duration: 2000
      });

      // 设置刷新菜品目录标记
      wx.setStorageSync('needRefreshDishes', true);

      // 延迟返回上一页
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }).catch(err => {
      wx.hideLoading();
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      });
    });
  }
});