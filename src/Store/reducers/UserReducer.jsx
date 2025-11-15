import { createSlice } from '@reduxjs/toolkit';

const initialState = null;

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        login: (state, action) => {
            return action.payload;
        },
        logOut: (state, action) => {
            return null;
        },
        authData: (state, action) => {
            return action.payload;
        },
        updateUser: (state, action) => {
            if (!state) return state;
            
            const updatedFields = action.payload;
            return {
                ...state,
                ...(updatedFields.firstName && { 
                    fullName: {
                        ...state.fullName,
                        firstName: updatedFields.firstName 
                    }
                }),
                ...(updatedFields.lastName && { 
                    fullName: {
                        ...state.fullName,
                        lastName: updatedFields.lastName 
                    }
                }),
                ...(updatedFields.phoneNumber && { phoneNumber: updatedFields.phoneNumber }),
                ...(updatedFields.alternateNumber && { alternateNumber: updatedFields.alternateNumber }),
                ...(updatedFields.pinCode && { pinCode: updatedFields.pinCode }),
                ...(updatedFields.address && { address: updatedFields.address })
            };
        }
    }
});

export const { login, logOut, authData, updateUser } = userSlice.actions;
export const UserReducer = userSlice.reducer;