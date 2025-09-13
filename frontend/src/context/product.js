import React, { createContext, useContext, useState } from "react";
import axios from "axios";

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const API = process.env.REACT_APP_API;

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);

  // Load initial products
  const loadProducts = async (page = 1, limit = 8) => {
    try {
      const { data } = await axios.get(
        `${API}/api/v1/product/product-list/${page}?limit=${limit}`
      );
      if (page === 1) setProducts(data.products);
      else setProducts(prev => [...prev, ...data.products]);
      setTotal(data.total);
    } catch (error) {
      console.log(error);
    }
  };

  // Load categories (cached)
  const loadCategories = async () => {
    if (categories.length > 0) return; // already loaded
    try {
      const { data } = await axios.get(`${API}/api/v1/category/get-category`);
      if (data?.success) setCategories(data.category);
    } catch (error) {
      console.log(error);
    }
  };

  // Refresh all products
  const refreshProducts = () => {
    loadProducts();
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        setProducts,
        categories,
        setCategories,
        total,
        setTotal,
        loadProducts,
        loadCategories,
        refreshProducts,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProduct = () => useContext(ProductContext);
