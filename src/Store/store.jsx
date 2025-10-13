import { configureStore } from '@reduxjs/toolkit'
import { AdminReducer } from './reducers/AdminReducer'
import { UserReducer } from './reducers/UserReducer'
import { CartReducer } from './reducers/CartReducer'
import { OrdersReducer } from './reducers/OrdersReducer'

export const store = configureStore({
  reducer: {
    AdminReducer: AdminReducer,
    UserReducer: UserReducer,
    CartReducer:CartReducer,
    OrdersReducer: OrdersReducer
  },
})