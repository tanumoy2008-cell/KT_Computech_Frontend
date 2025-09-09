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

const AllRouter = () => {
  return (
    <Routes>
        <Route path="/" element={<MainPage />}/>
        <Route path="/product/:Maincategory" element={<Product />}/>
        <Route path="/product-dets/:id" element={<ProductDets />}/>
        <Route path="/admin/login" element={<AdminLogin />}/>
        <Route path="/user/login" element={<UserLogin />}/>
        <Route path="/user/register" element={<UserRegister />}/>
        <Route path="/user" element={<UserProfle />}/>

        <Route element={<AdminAuth />}>
        <Route path="/admin" element={<Admin />}/>
        <Route path="/product-edit/:id" element={<ProductEditPage />}/>
        </Route>
    </Routes>
  )
}

export default AllRouter;