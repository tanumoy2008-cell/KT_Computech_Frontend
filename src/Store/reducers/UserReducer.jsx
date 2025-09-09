import { createSlice } from '@reduxjs/toolkit';

const initialState = null;

const userSlice = createSlice({
    name: "user",
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

export const UserReducer = userSlice.reducer;
export const {login, logOut, authData} = userSlice.actions;