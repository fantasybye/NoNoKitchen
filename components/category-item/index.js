Component({
  properties: {
    category: Number,
    active: Boolean,
    icon: String,
    name: String,
    count: {
      type: Number,
      value: 0
    }
  },
  methods: {
    onTap() {
      this.triggerEvent('switchCategory', { category: this.data.category });
    },
  }
});