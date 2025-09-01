import React from 'react'
import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import Contact from './pages/Contact'
import About from './pages/About'
import Policy from './pages/Policy'
import PageNotFound from './pages/PageNotFound'
import Register from './pages/auth/Register'
import Login from './pages/auth/Login'
import Dashboard from './pages/user/Dashboard'
import PrivateRoute from './components/Routes/Private.js'
import ForgotPasssword from './pages/auth/ForgotPassword.js'
import AdminRoute from './components/Routes/AdminRoute.js'
import AdminDashboard from './pages/Admin/AdminDashboard.js'
import CreateCategory from './pages/Admin/CreateCategory.js'
import CreateProduct from './pages/Admin/CreateProduct.js'
import Users from './pages/Admin/Users.js'
import Orders from './pages/user/Order.js'
import Profile from './pages/user/Profile.js'
import Products from './pages/Admin/Products.js'
import UpdateProduct from './pages/Admin/UpdateProduct.js'
import Search from './pages/Search.js'
import ProductDetails from './pages/ProductDetails.js'
import Categories from './pages/Categories.js'
import CategoryProduct from './pages/CategoryProduct.js'
import CartPage from './pages/CartPage.js'
import Shop from './pages/Shop.js'
import CheckoutPage from './pages/CheckoutPage.js'
import AdminOrders from './pages/Admin/AdminOrders.js'
import SubcategoryProducts from './pages/SubcategoryProduct.js'


const App = () => {
  return (
    <main>
      <Routes>
             <Route path="/" element={<HomePage />} />
             <Route path="/product/:slug" element={<ProductDetails />} />
              <Route path="/categories" element={<Categories />} />
                  <Route path="/cart" element={<CartPage />} />
               <Route path="/category/:slug" element={<CategoryProduct />} />
                  <Route path="/subcategory/:subSlug" element={<SubcategoryProducts />} />
              <Route path="/search" element={<Search />} />
                 <Route path="/shop" element={<Shop />} />
                 <Route path="/checkout" element={<CheckoutPage />} />
<Route path="/dashboard">
  <Route path="user" element={<PrivateRoute />}>
    <Route path="" element={<Dashboard />} />
      <Route path="orders" element={<Orders />} />
          <Route path="profile" element={<Profile />} />
  </Route>
  
  <Route path="admin" element={<AdminRoute />}>
    <Route path="" element={<AdminDashboard />} />
    <Route path="create-category" element={<CreateCategory />} />
     <Route path="products" element={<Products />} />
     <Route path="product/:slug" element={<UpdateProduct />} />
    <Route path="create-product" element={<CreateProduct />} />
    <Route path="all-users" element={<Users />} />
     <Route path="orders" element={<AdminOrders />} />
      
    
  </Route>
</Route>

        <Route path="/forgot-password" element={<ForgotPasssword />} />
     <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/policy" element={<Policy />} />
       
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </main>
  )
}

export default App
