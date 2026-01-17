import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../config/axios";

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (
    { start = 0, limit = 15, query = "", Maincategory = "", Subcategory = "" }
  ) => {

    const res = await axios.get("/api/product/productSend", {
      params: { start, limit, query, Maincategory, Subcategory },
    });

    return {
      products: res.data.product || [],
      fromSearch: !!query.trim(),
      hasMore: res.data.hasMore ?? false,
      nextStart: res.data.nextStart ?? 0
    };
  }
);
