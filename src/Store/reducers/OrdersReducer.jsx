import { createSlice } from "@reduxjs/toolkit";

const initialState = [];

const OrdersSlice = createSlice({
    name: "orders",
    initialState,
    reducers: {
        setOrders: (state, action)=>{
            return action.payload;
        }
    }
})

export const OrdersReducer = OrdersSlice.reducer;
export const {setOrders} = OrdersSlice.actions;