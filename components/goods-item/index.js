Component({
  properties: {
    image: String,
    title: String,
    item: Object,
    isAdded: {
      type: Boolean,
      value: false
    }
  },
  methods: {
    onToggle(e) {
      const item = e.currentTarget.dataset.item;
      if (!this.data.isAdded) {
        // 添加商品
        this.setData({
          isAdded: true
        });
        this.triggerEvent('addToCart', { item });
      } else {
        // 从购物车中删除商品
        this.setData({
          isAdded: false
        });
        this.triggerEvent('removeFromCart', { item });
      }
    },

    setAddedState(isAdded) {
      console.log('组件setAddedState被调用', isAdded);
      this.setData({
        isAdded: isAdded
      });
    },

    updateStatus(isAdded) {
      console.log('组件updateStatus被调用', isAdded);
      this.setAddedState(isAdded);
    }
  }
});