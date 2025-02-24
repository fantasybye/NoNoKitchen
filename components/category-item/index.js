Component({
  properties: {
    image: String,
    title: String,
    intro: String,
    sales: Number,
    likes: Number,
    price: Number
  },
  methods: {
    onAdd() {
      this.triggerEvent('addToCart', { title: this.data.title });
    }
  }
});