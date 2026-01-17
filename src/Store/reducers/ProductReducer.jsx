import { createSlice } from "@reduxjs/toolkit";
import { fetchProducts } from "../actions/productActions";


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
        const existing = new Set(state.items.map(p => p._id));
        const unique = products.filter(p => !existing.has(p._id));
        state.items = [...state.items, ...unique];
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

    upsertProduct: (state, action) => {
      const prod = action.payload;
      if (!prod || !prod._id) return;

      const idx = state.items.findIndex(p => p._id === prod._id);

      if (idx === -1) {
        state.items = [prod, ...state.items];
      } else {
        state.items[idx] = { ...state.items[idx], ...prod };
      }
    },
  },


  extraReducers: (builder) => {
    builder

      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })


      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;

        const newProducts = action.payload.products || [];

        // 🔎 SEARCH MODE → replace list (ranked results)
        if (action.payload.fromSearch) {
          state.items = newProducts;
          state.hasMore = false; // search results are not paginated
          state.start = 0;
          return;
        }

        // 📦 BROWSE MODE → append infinite scroll results
        const existingIds = new Set(state.items.map(p => p._id));
        const unique = newProducts.filter(p => !existingIds.has(p._id));

        state.items = [...state.items, ...unique];
        state.hasMore = action.payload.hasMore;
        state.start = action.payload.nextStart;
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
