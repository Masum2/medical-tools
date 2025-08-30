import React, { useEffect, useState } from "react";
import Layout from "./../components/Layout/Layout";
import { useAuth } from "../context/auth";
import axios from "axios";
import { Checkbox, Radio } from "antd";
import { Prices } from "../components/Prices";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/cart";
import toast from "react-hot-toast";
import { IoCartOutline } from "react-icons/io5";
import { FaRegHeart } from "react-icons/fa";
const HomePage = () => {
  const navigate = useNavigate();
  const [auth, setAuth] = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [checked, setChecked] = useState([]);
  const [radio, setRadio] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [cart, setCart] = useCart();
  const [loading, setLoading] = useState(false);
  const API = process.env.REACT_APP_API;
  // Get all categories
  const getAllCategory = async () => {
    try {
      const { data } = await axios.get(`${API}/api/v1/category/get-category`);
      if (data?.success) setCategories(data?.category);
    } catch (error) {
      console.log(error);
    }
  };

  // Get total count
  const getTotal = async () => {
    try {
      const { data } = await axios.get(`${API}/api/v1/product/product-count`);
      setTotal(data?.total);
    } catch (error) {
      console.log(error);
    }
  };

  const getAllProducts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API}/api/v1/product/product-list/${page}`);
      setLoading(false);
      setProducts(data.products);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  const loadMore = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API}/api/v1/product/product-list/${page}`);
      setLoading(false);
      setProducts([...products, ...data?.products]);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  const filterProduct = async () => {
    try {
      const { data } = await axios.post(`${API}/api/v1/product/product-filters`, {
        checked,
        radio,
      });
      setProducts(data?.products);
    } catch (error) {
      console.log(error);
    }
  };

  const handleFilter = (value, id) => {
    let all = [...checked];
    if (value) {
      all.push(id);
    } else {
      all = all.filter((c) => c !== id);
    }
    setChecked(all);
  };

  useEffect(() => {
    getAllCategory();
    getTotal();
  }, []);

  useEffect(() => {
    if (!checked.length || !radio.length) getAllProducts();
  }, [checked.length, radio.length]);

  useEffect(() => {
    if (checked.length || radio.length) filterProduct();
  }, [checked, radio]);

  useEffect(() => {
    if (page === 1) return;
    loadMore();
  }, [page]);

  return (
    <Layout title={"All Products - Best Offers"}>
      <div className="container ">
        <div className="row" style={{ backgroundColor: '#eff0f5', padding: '10px' }}>
          {/* Filters Sidebar */}
          <div className="col-md-3">
            <div className="p-3 mb-3 border rounded bg-white">
              <h5 className="text-center mb-3">Filter by Category</h5>
              <div className="d-flex flex-column">
                {categories?.map((c) => (
                  <Checkbox
                    key={c._id}
                    onChange={(e) => handleFilter(e.target.checked, c._id)}
                    className="mb-2"
                  >
                    {c.name}
                  </Checkbox>
                ))}
              </div>

              <h5 className="text-center mt-4 mb-3">Filter by Price</h5>
              <div className="d-flex flex-column">
                <Radio.Group onChange={(e) => setRadio(e.target.value)} >
                  {Prices?.map((p) => (
                    <Radio key={p._id} value={p.array} className="mb-2" style={{
                      '--antd-wave-shadow-color': 'red' // sometimes helps with focus border
                    }} >
                      {p.name}
                    </Radio>
                  ))}
                </Radio.Group>
              </div>

              <button
                className="btn  w-100 mt-3"
                onClick={() => window.location.reload()}
                style={{ backgroundColor: '#00a297', color: '#FFF' }}
              >
                RESET FILTERS
              </button>
            </div>
          </div>

          {/* Products List */}
          <div className="col-md-9">
            {/* <h2 className="mb-4 text-center">All Products</h2> */}
            <div className="row">
              {products?.map((p) => (
                <div key={p._id} className="col-sm-6 col-md-3 mb-3">
                  <div className="product-card shadow-sm rounded-lg border bg-white h-100 d-flex flex-column">
                    {/* Favorite (Heart) */}
                    {/* <div className="d-flex justify-content-end p-2">
                      <button className="btn btn-light btn-sm rounded-circle border-0">
                        <FaRegHeart />
                      </button>
                    </div> */}

                    {/* Product Image */}
                    <div
                      className="d-flex justify-content-center align-items-center"
                      style={{ cursor: "pointer", }}
                      onClick={() => navigate(`/product/${p.slug}`)}
                    >
                      <img
                        src={`${API}/api/v1/product/product-photo/${p._id}`}
                        alt={p.name}
                        className="img-fluid"
                        style={{ maxHeight: "150px", objectFit: "contain" }}
                      />
                    </div>

                    {/* Product Details */}
                    <div className="px-3 text-left flex-grow-1 d-flex flex-column">
                      <p className="fw-bold mb-1" style={{ fontSize: "14px" }}>
                        {p.name.length > 20 ? p.name.substring(0, 20) + "..." : p.name}
                      </p>


                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginTop: "8px",
                          paddingBottom: '10px'
                        }}
                      >
                        <h6 style={{ color: "red", fontWeight: "bold", margin: 0 }}>
                          ৳ {p.price}
                        </h6>
                        <div
                          style={{
                            cursor: "pointer",
                            color: "#FFF",
                            fontWeight: "bold",
                            backgroundColor: '#00a297',
                            padding: '4px',
                            borderRadius: '2px'
                          }}
                          onClick={() => {
                            const existingCart = JSON.parse(localStorage.getItem("cart")) || [];

                            // Check if product already exists
                            const found = existingCart.find((item) => item._id === p._id);

                            if (found) {
                              toast.error("Item already added to cart");
                            } else {
                              const cartItem = {
                                _id: p._id,
                                name: p.name,
                                price: p.price,
                                quantity: 1,
                                image: `${API}/api/v1/product/product-photo/${p._id}`,
                              };
                              const updatedCart = [...existingCart, cartItem];
                              setCart(updatedCart);
                              localStorage.setItem("cart", JSON.stringify(updatedCart));
                              toast.success("Item added to cart");
                            }
                          }}
                        >
                          <IoCartOutline />
                        </div>


                      </div>

                      {/* Add to Cart */}
                      {/* <button
                        className="btn  w-100 mt-auto"
                        style={{ backgroundColor: '#00a297', color: '#FFF' }}
                     
                      >
                        
                      </button> */}

                    </div>
                  </div>
                </div>


              ))}
            </div>

            {/* Load More Button */}
            <div className="text-center mt-3 mb-5">
              {products && products.length < total && (
                <button
                  className="btn  px-4 py-2"
                  onClick={(e) => {
                    e.preventDefault();
                    setPage(page + 1);
                  }}
                  style={{ backgroundColor: '#00a297', color: '#FFF' }}
                >
                  {loading ? "Loading ..." : "Load More"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Extra CSS */}
      <style>
        {`
          .product-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.12);
          }
        `}
      </style>
    </Layout>
  );
};

export default HomePage;
