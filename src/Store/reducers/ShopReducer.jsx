import { createSlice } from "@reduxjs/toolkit";

const initialState = { shopData: null };

const shopSlice = createSlice({
    name: "shop",
    initialState,
    reducers: {
        getData: (state, action) => {
            state.shopData = action.payload;
        },
        adminChangeData: (state, action) => {
            state.shopData = action.payload;
        }
    }
})

export const { getData, adminChangeData } = shopSlice.actions;
export const ShopReducer = shopSlice.reducer;
