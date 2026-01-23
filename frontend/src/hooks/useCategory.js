import { useState, useEffect, useCallback } from "react";
import axios from "axios";

let cachedCategories = null;

export default function useCategory() {
  const [categories, setCategories] = useState(cachedCategories || []);
  const API = process.env.REACT_APP_API;

  const getCategories = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `${API}/api/v1/category/get-category`
      );
      setCategories(data?.category || []);
      cachedCategories = data?.category || [];
    } catch (error) {
      console.log(error);
    }
  }, [API]);

  useEffect(() => {
    if (!cachedCategories && API) {
      getCategories();
    }
  }, [API, getCategories]);

  return categories;
}
