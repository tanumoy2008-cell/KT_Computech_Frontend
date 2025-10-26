import { configureStore } from '@reduxjs/toolkit'
import { AdminReducer } from './reducers/AdminReducer'
import { UserReducer } from './reducers/UserReducer'
import { CartReducer } from './reducers/CartReducer'
import { OrdersReducer } from './reducers/OrdersReducer'
import { ProductReducer } from './reducers/ProductReducer'
import { adminProductReducer } from './reducers/AdminProductReducer'

export const store = configureStore({
  reducer: {
    AdminReducer: AdminReducer,
    UserReducer: UserReducer,
    CartReducer:CartReducer,
    OrdersReducer: OrdersReducer,
    ProductReducer: ProductReducer,
    adminProductReducer: adminProductReducer
  },
})