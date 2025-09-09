import { configureStore } from '@reduxjs/toolkit'
import { AdminReducer } from './reducers/AdminReducer'
import { UserReducer } from './reducers/UserReducer'

export const store = configureStore({
  reducer: {
    AdminReducer: AdminReducer,
    UserReducer: UserReducer,
  },
})