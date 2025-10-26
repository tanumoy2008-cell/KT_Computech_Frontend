import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  start: 0,
  hasMore: true,
  query: "",
  maincategory: "all",
  subcategory: "",
  scrollY: 0,
};

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    setProducts: (state, action) => {
      if (action.payload.reset) {
        state.items = action.payload.products;
      } else {
        state.items = [...state.items, ...action.payload.products];
      }
    },
    setPagination: (state, action) => {
      state.start = action.payload.start;
      state.hasMore = action.payload.hasMore;
    },
    setFilters: (state, action) => {
      state.query = action.payload.query ?? state.query;
      state.maincategory = action.payload.maincategory ?? state.maincategory;
      state.subcategory = action.payload.subcategory ?? state.subcategory;
      state.start = 0;
      state.hasMore = true;
    },
    setScrollY: (state, action) => {
      state.scrollY = action.payload;
    },
    clearScrollY: (state) => {
      state.scrollY = 0;
    },
  },
});

export const {
  setProducts,
  setPagination,
  setFilters,
  setScrollY,
  clearScrollY,
} = productSlice.actions;

export const ProductReducer = productSlice.reducer;
