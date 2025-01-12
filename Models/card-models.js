const Product = require('./product-models');

class Cart {
    constructor(items = [], totalQuantity = 0, totalPrice = 0) {
        this.items = items;
        this.totalQuantity = totalQuantity;
        this.totalPrice = totalPrice;
    }
    async updatePrices() {
        const productIds = this.items.map(function (item) {
          return item.product.id;
        });
    
        const products = await Product.findMultiple(productIds);
    
        const deletableCartItemProductIds = [];
    
        for (const cartItem of this.items) {
          const product = products.find(function (prod) {
            return prod.id === cartItem.product.id;
          });
    
          if (!product) {
            // product was deleted!
            // "schedule" for removal from cart
            deletableCartItemProductIds.push(cartItem.product.id);
            continue;
          }
    
          // product was not deleted
          // set product data and total price to latest price from database
          cartItem.product = product;
          cartItem.totalPrice = cartItem.quantity * cartItem.product.price;
        }
    
        if (deletableCartItemProductIds.length > 0) {
          this.items = this.items.filter(function (item) {
            return deletableCartItemProductIds.indexOf(item.product.id) < 0;
          });
        }
    
        // re-calculate cart totals
        this.totalQuantity = 0;
        this.totalPrice = 0;
    
        for (const item of this.items) {
          this.totalQuantity = this.totalQuantity + item.quantity;
          this.totalPrice = this.totalPrice + item.totalPrice;
        }
      }
    
  
    addItem(product) {
        const cardItem = {
            product: product,
            quantity: 1,
            totalPrice: product.price
        };
        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i];
            if (item.product.id === product.id) {
                cardItem.quantity = item.quantity + 1;
                cardItem.totalPrice = item.totalPrice + product.price;
                this.items[i] = cardItem;

                this.totalQuantity++;
                this.totalPrice = this.totalPrice + product.price;
                return
            }
        }
        this.items.push(cardItem);
        this.totalQuantity++;
        this.totalPrice = this.totalPrice + product.price;
    }
    UpdateItem(productId, newQuantity) {
        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i];
            if (item.product.id === productId && newQuantity > 0) {
                const CartItem = { ...item };
        
                const quant = newQuantity - item.quantity;

                CartItem.quantity = newQuantity;
                CartItem.totalPrice = newQuantity * item.product.price;
                this.items[i] = CartItem;

                this.totalQuantity = this.totalQuantity + quant;
                this.totalPrice += quant * item.product.price;
                return { updatedItemPrice: CartItem.totalPrice };


            } else if (item.product.id === productId && newQuantity <= 0) {
                this.items.slice(i, 1);
                this.totalQuantity = this.totalQuantity - item.quantity;
                this.totalPrice -= this.totalPrice;
                return { updatedItemPrice: 0 };

            }
        }


    }
}

module.exports = Cart;