import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';

// Public Pages
import MainPage from '../Pages/MainPage';
import ProductDets from '../Pages/ProductDets';
import Product from '../Pages/Product';
import About from '../Pages/About';
import Contact from '../Pages/Contact';

// Auth Pages
import UserLogin from '../Pages/UserLogin';
import UserRegister from '../Pages/UserRegister';
import OtpValidationPage from '../Pages/OtpValidationPage';
import AdminLogin from '../Pages/AdminLogin';
import AdminRegister from '../Pages/AdminRegister';

// Protected User Pages
import UserProfle from '../Pages/UserProfle';
import OrderPayment from '../Pages/OrderPayment';

// Protected Admin Pages
import Admin from '../Pages/Admin';
import ProductEditPage from '../Pages/ProductEditPage';

// Components
import Dashboard from '../components/Dashboard';
import Cart from '../components/Cart';
import PlaceOrder from '../components/PlaceOrder';
import AdminProducts from '../components/AdminProducts';
import Settings from '../components/Settings';
import ProductAdder from '../components/ProductAdder';
import Billing from '../components/Billing';
import Order from '../components/Order';
import PinCode from '../components/PinCode';
import Customer from '../components/Customer';
import Accounting from '../components/Accounting';
import BarcodePrint from '../components/BarcodePrint';

// ERP Components
import ERPDashboard from '../components/erp/ERPDashboard';
import Purchase from '../components/erp/Purchase';
import Sale from '../components/erp/Sale';
import Expenses from '../components/erp/Expenses';
import ProfitLoss from '../components/erp/ProfitLoss';
import BalanceSheet from '../components/erp/BalanceSheet';
import Reports from '../components/erp/Reports/Reports';

// Auth Wrappers
import AdminAuth from '../auth/AdminAuth';
import UserAuth from '../auth/UserAuth';

// Utils
import ScrollTop from '../utils/ScrollTop';
import DeliveryDashboard from '../components/DeliveryDashboard';
import DeliveryLogin from '../Pages/DeliveryLogin';
import DeliveryAuth from '../auth/DeliveryAuth';
import DeliveryRegister from '../Pages/DeliveryRegister';
import Error from '../Pages/Error';
import DeliveryAgentOtpPage from '../Pages/DeliveryAgentOtpPage';
import DeliveryIdConfirm from '../components/DeliveryIdConfirm';
import DeliveryOrders from '../components/DeliveryOrders';
import DeliverySettings from '../components/DeliverySettings';
import Delivery from '../Pages/Delivery';

const AllRouter = () => {
  return (
    <>
      <ScrollTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<MainPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/product/:Maincategory" element={<Product />} />
        <Route path="/product-dets/:id" element={<ProductDets />} />

        {/* User Authentication Routes */}
        <Route path="/user">
          <Route path="login" element={<UserLogin />} />
          <Route path="register" element={<UserRegister />} />
          <Route path="otp" element={<OtpValidationPage />} />
        </Route>

        {/* Admin Authentication Routes */}
        <Route path="/admin">
          <Route path="login" element={<AdminLogin />} />
          <Route path="register" element={<AdminRegister />} />
        </Route>

        {/* Protected User Routes */}
        <Route element={<UserAuth />}>
          <Route path="/order-payment" element={<OrderPayment />} />
          <Route path="/user" element={<UserProfle />}>
            <Route index element={<Dashboard />} />
            <Route path="cart" element={<Cart />} />
            <Route path="order-history" element={<PlaceOrder />} />
          </Route>
        </Route>

        {/* Delivery Partner Routes */}
        <Route path="/delivery-otp-verification" element={<DeliveryAgentOtpPage />} />
        <Route path="/delivery-login" element={<DeliveryLogin />} />
        <Route path="/delivery-register" element={<DeliveryRegister />} />
      
        
        {/* Protected Delivery Partner Routes */}
        <Route element={<DeliveryAuth />}>
          <Route path="/delivery" element={<Delivery />} >
          <Route index element={<Navigate to='dashboard' replace />} />
            <Route path="dashboard" element={<DeliveryDashboard />} />
            <Route path="orders" element={<DeliveryOrders />} />
            <Route path="settings" element={<DeliverySettings />} />
          </Route>
        </Route>


        {/* Protected Admin Routes */}
        <Route element={<AdminAuth />}>
          <Route path="/admin" element={<Admin />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ProductAdder />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="deliveryId" element={<DeliveryIdConfirm />} />
            <Route path="orders" element={<Order />} />
            <Route path="settings" element={<Settings />} />
            <Route path="pincode" element={<PinCode />} />
            <Route path="billing" element={<Billing />} />
            <Route path="customers" element={<Customer />} />
            <Route path="barcode" element={<BarcodePrint />} />
            
            {/* Accounting & ERP Routes */}
            <Route path="accounting" element={<Accounting />}>
              <Route index element={<Navigate to="erp" replace />} />
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

        {/* Error Handling Routes */}
        <Route path="/error" element={<Error />} />
        <Route path="*" element={<Error />} />
      </Routes>
    </>
  );
}

export default AllRouter;