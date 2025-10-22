import React from "react";
import { useSearch } from "../../context/search";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SearchInput = () => {
  const [values, setValues] = useSearch();
  const navigate = useNavigate();
  const API = process.env.REACT_APP_API;

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const { data } = await axios.get(
      `${API}/api/v1/product/search/${values.keyword}?page=1&limit=100`
    );

    // ✅ data.products contains the results
    setValues({ ...values, results: data.products });
    navigate("/search");
  } catch (error) {
    console.log(error);
  }
};


  return (
    <form
      className="d-flex flex-grow-1 mx-3"
      style={{ maxWidth: "600px" }}
      role="search"
      onSubmit={handleSubmit}
    >
      <input
        type="search"
        placeholder="Search..."
        className="form-control rounded-start"
        style={{ border: "1px solid #42BAC9" }}
        aria-label="Search"
        value={values.keyword}
        onChange={(e) => setValues({ ...values, keyword: e.target.value })}
      />
      <button
        className="btn text-white rounded-end"
        type="submit"
        style={{
          backgroundColor: "#00a297",
          border: "1px solid #00a297",
        }}
      >
        Search
      </button>
    </form>
  );
};

export default SearchInput;
