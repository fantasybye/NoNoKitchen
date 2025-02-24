Component({
  properties: {
    category: Number,
    active: Boolean,
    icon: String,
    name: String,
    item: Object
  },
  methods: {
    onTap() {
      this.triggerEvent('switchCategory', { category: this.data.category });
    },
    onAdd(e) {
      const item = e.currentTarget.dataset.item;
      this.triggerEvent('addToCart', { item });
    }
  }
});