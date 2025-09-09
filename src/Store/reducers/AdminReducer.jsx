import { createSlice } from '@reduxjs/toolkit';

const initialState = null;

const adminSlice = createSlice({
    name: "admin",
    initialState,
    reducers:{
        login: (state, action) => {
            return action.payload;
        },
        logOut: (state, action) => {
            return null;
        },
        authData: (state, action) => {
            return action.payload;
        }
    }
})

export const AdminReducer = adminSlice.reducer;
export const {login, logOut, authData} = adminSlice.actions;