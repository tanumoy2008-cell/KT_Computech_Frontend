import { createSlice } from "@reduxjs/toolkit";

const initialState = [];

const CartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addProductToCart: (state, action) => {
      return action.payload.map(item => ({
    ...item,
    quantity: item.quantity || 1,
  }));
    },

    removeProductFromCart: (state, action) => {
      return state.filter(product => product._id !== action.payload._id);
    },

    addQuantity: (state, action) => {
      const updatedProduct = action.payload.data;
      return state.map(product =>
        product._id === updatedProduct._id
          ? { ...updatedProduct }
          : product
      );
    },

    reduceQuantity: (state, action) => {
     const updatedProduct = action.payload.data;
      return state.map(product =>
        product._id === updatedProduct._id
          ? { ...updatedProduct }
          : product
      );
    },
    setCart: (state, action) => {
      return action.payload.map(item => ({
        ...item,
        quantity: item.quantity || 1,
      }));
    },
  },
});

export const CartReducer = CartSlice.reducer;
export const {
  addProductToCart,
  removeProductFromCart,
  addQuantity,
  reduceQuantity,
  setCart,
} = CartSlice.actions;
