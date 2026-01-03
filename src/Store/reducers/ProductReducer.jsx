import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../config/axios";

// 🔍 Async thunk to fetch products from API only if needed
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async ({ start = 0, limit = 15, query = "", Maincategory = "", Subcategory = "" }, { getState }) => {
    const { ProductReducer } = getState();

    // ✅ 1. If searching and already found locally, skip API
    if (query.trim()) {
      const localResults = ProductReducer.items.filter((item) =>
        item.name.toLowerCase().includes(query.toLowerCase())
      );
      if (localResults.length > 0) {
        return { products: localResults, fromCache: true };
      }
    }

    // ✅ 2. Otherwise, fetch from backend (use productSend admin/public endpoint)
    const res = await axios.get("/api/product/productSend", {
      params: { start, limit, Maincategory, Subcategory, query },
    });

    return { products: res.data.product || [], fromCache: false };
  }
);

const initialState = {
  items: [],
  categories: [],
  start: 0,
  hasMore: true,
  Maincategory: "",
  Subcategory: "",
  query: "",
  scrollY: 0,
  loading: false,
  error: null,
};

const productSlice = createSlice({
  name: "ProductReducer",
  initialState,
  reducers: {
    setProducts: (state, action) => {
      const { products, reset } = action.payload;
      if (reset) {
        state.items = products;
      } else {
        const existingIds = new Set(state.items.map((p) => p._id));
        const newItems = products.filter((p) => !existingIds.has(p._id));
        state.items = [...state.items, ...newItems];
      }
    },

    setPagination: (state, action) => {
      const { start, hasMore } = action.payload;
      if (typeof start === "number") state.start = start;
      if (typeof hasMore === "boolean") state.hasMore = hasMore;
    },

    setCategories: (state, action) => {
      state.categories = action.payload || [];
    },

    setFilters: (state, action) => {
      const { Maincategory, Subcategory, query } = action.payload;
      if (Maincategory !== undefined) state.Maincategory = Maincategory;
      if (Subcategory !== undefined) state.Subcategory = Subcategory;
      if (query !== undefined) state.query = query;
    },

    setScrollY: (state, action) => {
      state.scrollY = action.payload;
    },

    clearScrollY: (state) => {
      state.scrollY = 0;
    },

    resetProducts: (state) => {
      state.items = [];
      state.start = 0;
      state.hasMore = true;
      state.scrollY = 0;
      state.query = "";
    },
    resetQuery: (state) => {
      state.query = "";
    },
    // Upsert a single product into the items list (replace or insert)
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

  // Handle async thunk lifecycle
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;

        // Skip appending if data came from cache
        if (action.payload.fromCache) return;

        const newProducts = action.payload.products || [];
        const existingIds = new Set(state.items.map((p) => p._id));
        const uniqueProducts = newProducts.filter((p) => !existingIds.has(p._id));

        state.items = [...state.items, ...uniqueProducts];
        state.hasMore = newProducts.length > 0;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch products";
      });
  },
});

export const {
  setProducts,
  setCategories,
  setPagination,
  setFilters,
  setScrollY,
  clearScrollY,
  resetProducts,
  resetQuery,
  upsertProduct,
} = productSlice.actions;

export const ProductReducer = productSlice.reducer;
