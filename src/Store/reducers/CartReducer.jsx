// Store/reducers/CartReducer.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  totalQuantity: 0,
};

const CartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCart: (state, action) => {
      const cart = action.payload || {};

      // Ensure items is always an array
      if (Array.isArray(cart.items)) {
        state.items = cart.items;
      } else if (Array.isArray(cart)) {
        state.items = cart;
      } else {
        state.items = [];
      }

      state.totalQuantity = state.items.reduce(
        (acc, item) => acc + (item.quantity || 1),
        0
      );
    },

    addProductToCart: (state, action) => {
      const newItem = action.payload;

      const existing = state.items.find(
        (i) => i._id === newItem._id && (i.color || "") === (newItem.color || "")
      );

      if (existing) {
        if (existing.quantity < 20) existing.quantity += 1;
      } else {
        state.items.push({ ...newItem, quantity: 1 });
      }

      state.totalQuantity = state.items.reduce(
        (acc, item) => acc + (item.quantity || 1),
        0
      );
    },

    removeProductFromCart: (state, action) => {
      const { _id, color } = action.payload;

      state.items = state.items.filter(
        (item) =>
          item._id !== _id || (item.color || "") !== (color || "")
      );

      state.totalQuantity = state.items.reduce(
        (acc, item) => acc + (item.quantity || 1),
        0
      );
    },

    addQuantity: (state, action) => {
      const { _id, color } = action.payload;

      const item = state.items.find(
        (i) => i._id === _id && (i.color || "") === (color || "")
      );

      if (item && item.quantity < 20) item.quantity += 1;

      state.totalQuantity = state.items.reduce(
        (acc, i) => acc + (i.quantity || 1),
        0
      );
    },

    reduceQuantity: (state, action) => {
      const { _id, color } = action.payload;

      const item = state.items.find(
        (i) => i._id === _id && (i.color || "") === (color || "")
      );

      if (item && item.quantity > 1) item.quantity -= 1;

      state.totalQuantity = state.items.reduce(
        (acc, i) => acc + (i.quantity || 1),
        0
      );
    },

    clearCart: (state) => {
      state.items = [];
      state.totalQuantity = 0;
    },
  },
});

export const CartReducer = CartSlice.reducer;
export const {
  setCart,
  addProductToCart,
  removeProductFromCart,
  addQuantity,
  reduceQuantity,
  clearCart,
} = CartSlice.actions;
