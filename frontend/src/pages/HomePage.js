import React, { useEffect, useState } from "react";
import Layout from "./../components/Layout/Layout";
import { useAuth } from "../context/auth";
import axios from "axios";
import { Checkbox, Radio, Skeleton } from "antd";
import { Prices } from "../components/Prices";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/cart";
import toast from "react-hot-toast";
import { IoCartOutline } from "react-icons/io5";
import { useProduct } from "../context/product";

const HomePage = () => {
  const navigate = useNavigate();
  const [auth] = useAuth();
  const { products, setProducts, total, setTotal, refreshProducts } = useProduct();
  const [categories, setCategories] = useState([]);
  const [checked, setChecked] = useState([]);
  const [radio, setRadio] = useState([]);
  const [page, setPage] = useState(1);
  const [cart, setCart] = useCart();
  const [loading, setLoading] = useState(false);
  const API = process.env.REACT_APP_API;
  const limit = 8; // Products per page

  // ---------------- INITIAL LOAD ----------------
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [catRes, totalRes, prodRes] = await Promise.all([
          axios.get(`${API}/api/v1/category/get-category`),
          axios.get(`${API}/api/v1/product/product-count`),
          axios.get(`${API}/api/v1/product/product-list/1?limit=${limit}`)
        ]);

        if (catRes.data?.success) setCategories(catRes.data.category);
        setTotal(totalRes.data.total);

        setProducts(prodRes.data.products);
        setPage(1);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  // ---------------- LOAD MORE ----------------
  const loadMore = async () => {
    try {
      setLoading(true);
      const nextPage = page + 1;
      const { data } = await axios.get(
        `${API}/api/v1/product/product-list/${nextPage}?limit=${limit}`
      );

      if (data?.products?.length > 0) {
        setProducts(prev => [...prev, ...data.products]);
        setPage(nextPage);
        setTotal(data.total);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- FILTER ----------------
  const filterProduct = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post(`${API}/api/v1/product/product-filters`, {
        checked,
        radio,
      });
      setProducts(data.products);
      setPage(1); // reset page
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (value, id) => {
    let all = [...checked];
    if (value) all.push(id);
    else all = all.filter(c => c !== id);
    setChecked(all);
  };

  // ---------------- EFFECTS ----------------
  useEffect(() => {
    if (checked.length || radio.length) filterProduct();
    if (!checked.length && !radio.length) refreshProducts();
  }, [checked, radio]);

  // ---------------- ADD TO CART ----------------
  const handleAddToCart = (p) => {
    const existingCart = JSON.parse(localStorage.getItem("cart")) || [];
    const found = existingCart.find(item => item._id === p._id);

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
  };

  return (
    <Layout title={"All Products - Best Offers"}>
      <div className="container">
        <div className="row" style={{ backgroundColor: "#eff0f5", padding: "10px" }}>
          {/* Sidebar */}
          <div className="col-md-3">
            <div className="p-3 mb-3 border rounded bg-white">
              <h5 className="text-center mb-3">Filter by Category</h5>
              <div className="d-flex flex-column">
                {categories?.map(c => (
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
                <Radio.Group onChange={e => setRadio(e.target.value)}>
                  {Prices?.map(p => (
                    <Radio key={p._id} value={p.array} className="mb-2">
                      {p.name}
                    </Radio>
                  ))}
                </Radio.Group>
              </div>

              <button
                className="btn w-100 mt-3"
                onClick={() => window.location.reload()}
                style={{ backgroundColor: "#00a297", color: "#FFF" }}
              >
                RESET FILTERS
              </button>
            </div>
          </div>

          {/* Products */}
          <div className="col-md-9">
            <div className="row">
              {loading && products.length === 0
                ? Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="col-sm-6 col-md-3 mb-3">
                      <Skeleton active paragraph={{ rows: 4 }} />
                    </div>
                  ))
                : products?.map(p => (
                    <div key={p._id} className="col-sm-6 col-md-3 mb-3">
                      <div className="product-card shadow-sm rounded-lg border bg-white h-100 d-flex flex-column">
                        <div
                          className="d-flex justify-content-center align-items-center"
                          style={{ cursor: "pointer" }}
                          onClick={() => navigate(`/product/${p.slug}`)}
                        >
                          <img
                            src={`${API}/api/v1/product/product-photo/${p._id}`}
                            alt={p.name}
                            className="img-fluid"
                            style={{ maxHeight: "150px", objectFit: "contain" }}
                            loading="lazy"
                          />
                        </div>

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
                              paddingBottom: "10px",
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
                                backgroundColor: "#00a297",
                                padding: "4px",
                                borderRadius: "2px",
                              }}
                              onClick={() => handleAddToCart(p)}
                            >
                              <IoCartOutline />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
            </div>

            {/* Load More */}
            {products.length < total && (
              <div className="text-center mt-3 mb-5">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  style={{ backgroundColor: "#00a297", color: "#FFF", padding: "8px 20px" }}
                >
                  {loading ? "Loading ..." : "Load More"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

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
