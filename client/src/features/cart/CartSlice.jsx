import { createSlice } from "@reduxjs/toolkit";
/**
 * ============================================
 * LOAD CART FROM LOCAL STORAGE
 * ============================================
 */
const loadCartFromStorage = () => {
  try {
    const data = localStorage.getItem("solex_cart");

    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(error);
    return [];
  }
};
/**
 * ============================================
 * SAVE CART TO LOCAL STORAGE
 * ============================================
 */

const saveCartToStorage = (cartItems) => {
  try {
    localStorage.setItem("solex_cart", JSON.stringify(cartItems));
  } catch (error) {
    console.error(error);
  }
};

/**
 * ============================================
 * INITIAL STATE
 * ============================================
 */

const initialState = {
  cartItems: loadCartFromStorage(),
};

/**
 * ============================================
 * CART SLICE
 * ============================================
 */

const cartSlice = createSlice({
  name: "cart",

  initialState,

  reducers: {
    /**
     * ========================================
     * ADD TO CART
     * ========================================
     */

    addToCart: (state, action) => {
      const item = action.payload;

      const existingItem = state.cartItems.find(
        (product) =>
          product.productId === item.productId &&
          product.selectedSize === item.selectedSize,
      );

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.cartItems.push({
          ...item,
          quantity: 1,
        });
      }

      saveCartToStorage(state.cartItems);
    },

    /**
     * ========================================
     * REMOVE FROM CART
     * ========================================
     */

    removeFromCart: (state, action) => {
      const { productId, selectedSize } = action.payload;

      state.cartItems = state.cartItems.filter(
        (item) =>
          !(item.productId === productId && item.selectedSize === selectedSize),
      );

      saveCartToStorage(state.cartItems);
    },

    /**
     * ========================================
     * INCREASE QUANTITY
     * ========================================
     */

    increaseQuantity: (state, action) => {
      const { productId, selectedSize } = action.payload;

      const item = state.cartItems.find(
        (product) =>
          product.productId === productId &&
          product.selectedSize === selectedSize,
      );

      if (item) {
        item.quantity += 1;
      }

      saveCartToStorage(state.cartItems);
    },

    /**
     * ========================================
     * DECREASE QUANTITY
     * ========================================
     */

    decreaseQuantity: (state, action) => {
      const { productId, selectedSize } = action.payload;

      const item = state.cartItems.find(
        (product) =>
          product.productId === productId &&
          product.selectedSize === selectedSize,
      );

      if (item && item.quantity > 1) {
        item.quantity -= 1;
      }

      saveCartToStorage(state.cartItems);
    },

    /**
     * ========================================
     * CLEAR CART
     * ========================================
     */

    clearCart: (state) => {
      state.cartItems = [];

      localStorage.removeItem("solex_cart");
    },
  },
});

/**
 * ============================================
 * EXPORT ACTIONS
 * ============================================
 */

export const {
  addToCart,
  removeFromCart,
  increaseQuantity,
  decreaseQuantity,
  clearCart,
} = cartSlice.actions;

/**
 * ============================================
 * EXPORT REDUCER
 * ============================================
 */

export default cartSlice.reducer;
