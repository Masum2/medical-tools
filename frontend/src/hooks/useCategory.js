import { useState, useEffect } from "react";
import axios from "axios";

let cachedCategories = null; // cache categories globally

export default function useCategory() {
  const [categories, setCategories] = useState(cachedCategories || []);
  const API = process.env.REACT_APP_API;

  const getCategories = async () => {
    try {
      const { data } = await axios.get(`${API}/api/v1/category/get-category`);
      setCategories(data?.category);
      cachedCategories = data?.category; // save to cache
    } catch (error) {
      console.log(error);
    }
  };

useEffect(() => {
  if (!cachedCategories && API) {
    getCategories();
  }
}, [API]);


  return categories;
}
