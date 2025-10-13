import React from 'react'
import { Route, Routes } from 'react-router-dom'
import MainPage from '../Pages/MainPage'
import ProductDets from '../Pages/ProductDets'
import Admin from '../Pages/Admin'
import AdminLogin from '../Pages/AdminLogin'
import AdminAuth from '../auth/AdminAuth'
import Product from '../Pages/Product'
import ProductEditPage from '../Pages/ProductEditPage'
import UserProfle from '../Pages/UserProfle'
import UserLogin from '../Pages/UserLogin'
import UserRegister from '../Pages/UserRegister'
import OtpValidationPage from '../Pages/OtpValidationPage'
import UserAuth from '../auth/UserAuth'
import Dashboard from '../components/Dashboard'
import Cart from '../components/Cart'
import PlaceOrder from '../components/PlaceOrder'
import ScrollTop from '../utils/ScrollTop'
import Contact from '../Pages/Contact'
import Products from '../components/Products'
import Settings from '../components/Settings'
import ProductAdder from '../components/ProductAdder'
import Billing from '../components/Billing'
import Order from '../Pages/Order'
import OrderPayment from '../Pages/OrderPayment'

const AllRouter = () => {
  return (
    <>
    <ScrollTop />
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/product/:Maincategory" element={<Product />} />
      <Route path="/product-dets/:id" element={<ProductDets />} />

      <Route path="/user/login" element={<UserLogin />} />
      <Route path="/user/register" element={<UserRegister />} />
      <Route path="/user/otp" element={<OtpValidationPage />} />

      <Route element={<UserAuth />}>
      <Route path="/order-payment" element={<OrderPayment />} />
        <Route path="/user" element={<UserProfle />}>
          <Route index element={<Dashboard />} />
          <Route path="cart" element={<Cart />} />
          <Route path="order-history" element={<PlaceOrder />} />
        </Route>
      </Route>

      <Route path="/admin/login" element={<AdminLogin />} />

      <Route element={<AdminAuth />}>
        <Route path="/admin" element={<Admin />} >
        <Route index element={<ProductAdder />} />
        <Route path="product" element={<Products />} />
        <Route path="settings" element={<Settings />} />
        <Route path="billing" element={<Billing />} />
        </Route>
        <Route path="/product-edit/:id" element={<ProductEditPage />} />
        <Route path="/orders" element={<Order />} />
      </Route>

    </Routes>
    </>
  )
}

export default AllRouter;