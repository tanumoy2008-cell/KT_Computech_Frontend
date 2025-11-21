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
import AdminProducts from '../components/AdminProducts'
import Settings from '../components/Settings'
import ProductAdder from '../components/ProductAdder'
import Billing from '../components/Billing'
import Order from '../components/Order'
import OrderPayment from '../Pages/OrderPayment'
import PinCode from '../components/PinCode'
import About from '../Pages/About'
import Customer from '../components/Customer'
import Accounting from '../components/Accounting'
import ERPDashboard from '../components/erp/ERPDashboard'
import Purchase from '../components/erp/Purchase'
import Sale from '../components/erp/Sale'
import Expenses from '../components/erp/Expenses'
import ProfitLoss from '../components/erp/ProfitLoss'
import BalanceSheet from '../components/erp/BalanceSheet'
import Reports from '../components/erp/Reports/Reports'

const AllRouter = () => {
  return (
    <>
    <ScrollTop />
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/about" element={<About />} />
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

      // In AllRouter.jsx, replace the admin routes section with this:
    <Route element={<AdminAuth />}>
      <Route path="/admin" element={<Admin />}>
        <Route index element={<ProductAdder />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders" element={<Order />} />
        <Route path="settings" element={<Settings />} />
        <Route path="pincode" element={<PinCode />} />
        <Route path="billing" element={<Billing />} />
        <Route path="customers" element={<Customer />} />
        
        {/* Update the accounting route to include ERP as nested routes */}
        <Route path="accounting" element={<Accounting />}>
          <Route index element={<ERPDashboard />} />
          <Route path="erp" element={<ERPDashboard />} />
          <Route path="erp/purchase" element={<Purchase />} />
          <Route path="erp/sale" element={<Sale />} />
          <Route path="erp/expenses" element={<Expenses />} />
          <Route path="erp/profit-loss" element={<ProfitLoss />} />
          <Route path="erp/balance-sheet" element={<BalanceSheet />} />
          <Route path="erp/reports" element={<Reports />}>
          <Route index element={<div>Select a report</div>} />
            <Route path=":reportType" element={null} />
          </Route>
        </Route>
      </Route>
        <Route path="/product-edit/:id" element={<ProductEditPage />} />
      </Route>

    </Routes>
    </>
  )
}

export default AllRouter;