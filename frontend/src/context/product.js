import { createContext, useContext, useState } from "react";
import axios from "axios";

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const API = process.env.REACT_APP_API;

  // Refresh products from backend (1st page)
  const refreshProducts = async () => {
    try {
      const { data } = await axios.get(`${API}/api/v1/product/product-list/1?limit=12`);
      setProducts(data.products);
      setTotal(data.total || data?.count);
    } catch (err) {
      console.log("Error refreshing products:", err);
    }
  };

  return (
    <ProductContext.Provider value={{ products, setProducts, total, setTotal, refreshProducts }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProduct = () => useContext(ProductContext);
