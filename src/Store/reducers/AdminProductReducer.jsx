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

const adminProductSlice = createSlice({
  name: "adminProduct",
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
    // Upsert single product for immediate UI update after edits
    upsertProduct: (state, action) => {
      const prod = action.payload;
      if (!prod || !prod._id) return;
      const idx = state.items.findIndex((p) => p._id === prod._id);
      if (idx === -1) {
        state.items = [prod, ...state.items];
      } else {
        state.items[idx] = { ...state.items[idx], ...prod };
      }
    },
  },
});

export const {
  setProducts,
  setPagination,
  setFilters,
  setScrollY,
  clearScrollY,
  upsertProduct,
} = adminProductSlice.actions;

export const adminProductReducer = adminProductSlice.reducer;