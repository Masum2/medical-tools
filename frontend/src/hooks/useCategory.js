import { useState, useEffect } from "react";
import axios from "axios";

export default function useCategory() {
  const [categories, setCategories] = useState([]);
    const API = process.env.REACT_APP_API;
  //get cat
  const getCategories = async () => {
    try {
      const { data } = await axios.get(`${API}/api/v1/category/get-category`);
      setCategories(data?.category);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

  return categories;
}
