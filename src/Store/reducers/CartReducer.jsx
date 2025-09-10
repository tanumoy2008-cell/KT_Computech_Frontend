import { createSlice } from "@reduxjs/toolkit";

const initialState = [];

const CartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addProductToCart: (state, action) => {
      const product = action.payload;
      const existingProduct = state.find(item => item._id === product._id);

      if (existingProduct) {
        return state.map(item =>
          item._id === product._id
            ? { ...item, quantity: Math.min(item.quantity + 1, 20) }
            : item
        );
      } else {
        return [...state, { ...product, quantity: 1 }];
      }
    },

    removeProductFromCart: (state, action) => {
      return state.filter(product => product._id !== action.payload._id);
    },

    addQuantity: (state, action) => {
      return state.map(product =>
        product._id === action.payload._id
          ? { ...product, quantity: Math.min(product.quantity + 1, 20) }
          : product
      );
    },

    reduceQuantity: (state, action) => {
      return state
        .map(product =>
          product._id === action.payload._id
            ? { ...product, quantity: product.quantity - 1 }
            : product
        )
        .filter(product => product.quantity > 0);
    }
  }
});

export const CartReducer = CartSlice.reducer;
export const {
  addProductToCart,
  removeProductFromCart,
  addQuantity,
  reduceQuantity
} = CartSlice.actions;
