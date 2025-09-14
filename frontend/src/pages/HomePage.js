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
  const {
    products,
    setProducts,
    categories,
    setCategories,
    total,
    setTotal,
    loadProducts,
    loadCategories,
    refreshProducts
  } = useProduct();

  const [checked, setChecked] = useState([]); // category filter
  const [subChecked, setSubChecked] = useState([]); // subcategory filter
  const [radio, setRadio] = useState([]); // price filter
  const [page, setPage] = useState(1);
  const [cart, setCart] = useCart();
  const [loading, setLoading] = useState(false);
  const API = process.env.REACT_APP_API;
  const limit = 8;

  // ---------------- INITIAL LOAD ----------------
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([
        loadCategories(),
        products.length === 0 ? loadProducts() : Promise.resolve()
      ]);
      setLoading(false);
    };
    init();
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
        subChecked,
        radio,
      });
      setProducts(data.products);
      setPage(1);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // category filter
  const handleFilter = (value, id) => {
    let all = [...checked];
    if (value) all.push(id);
    else all = all.filter(c => c !== id);
    setChecked(all);
  };

  // subcategory filter
  const handleSubFilter = (value, sub) => {
    let all = [...subChecked];
    if (value) all.push(sub);
    else all = all.filter(s => s !== sub);
    setSubChecked(all);
  };

  // apply filter
  useEffect(() => {
    if (checked.length || subChecked.length || radio.length) filterProduct();
    else refreshProducts();
  }, [checked, subChecked, radio]);

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
      <div className="">
        <div className="row" style={{ backgroundColor: "#eff0f5", padding: "20px" }}>
          {/* Sidebar */}
          <div className="col-md-3">
            <div className="p-3 mb-3 border rounded bg-white">
              <h5 className="text-center mb-3">Filter by Category</h5>
              <div className="d-flex flex-column">
                {categories?.map(c => (
                  <div key={c._id} className="mb-2">
                    <Checkbox
                      onChange={(e) => handleFilter(e.target.checked, c._id)}
                      checked={checked.includes(c._id)}
                    >
                      {c.name}
                    </Checkbox>

                    {checked.includes(c._id) && c.subcategories?.length > 0 && (
                      <div className="ms-3 d-flex flex-column">
                        {c.subcategories.map(sub => (
                          <Checkbox
                            key={sub}
                            onChange={(e) => handleSubFilter(e.target.checked, sub)}
                            checked={subChecked.includes(sub)}
                          >
                            {sub}
                          </Checkbox>
                        ))}
                      </div>
                    )}
                  </div>
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
            {loading && products.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "300px",
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#00a297",
                }}
              >
                Healthproo ...
              </div>
            ) : products.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "300px",
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "#ff4d4f",
                  textAlign: "center",
                }}
              >
                There is no product in this price range or in this subcategory
              </div>
            ) : (
              <>
                <div className="row">
                  {products.map(p => (
                    <div key={p._id} className="col-sm-6 col-md-3 mb-3">
                      <div className="product-card shadow-sm rounded-lg border bg-white h-100 d-flex flex-column">
                        {/* Image */}
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

                        {/* Content */}
                        <div className="px-3 text-left flex-grow-1 d-flex flex-column">
                          <p className="fw-bold mb-1" style={{ fontSize: "14px" }}>
                            {p.name.length > 20 ? p.name.substring(0, 20) + "..." : p.name}
                          </p>

                          {/* Price + Discount */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              marginTop: "8px",
                              paddingBottom: "10px",
                              gap: "8px",
                              flexWrap: "wrap",
                            }}
                          >
                            {p.discountPrice && p.discountPrice > 0 ? (
                              <>
                                <span className="text-danger fw-bold">৳ {p.discountPrice}</span>
                                <small className="text-muted text-decoration-line-through">
                                  ৳ {p.price}
                                </small>
                                <span className="badge bg-danger">
                                  {Math.round(((p.price - p.discountPrice) / p.price) * 100)}% OFF
                                </span>
                              </>
                            ) : (
                              <span className="text-danger fw-bold">৳ {p.price}</span>
                            )}
                          </div>
                        </div>

                        {/* ✅ Add to Cart Button (separate line) */}
                        {/* ✅ Add to Cart Button (inline styled) */}
                        <div className="px-3 pb-3">
                          <button
                            onClick={() => handleAddToCart(p)}
                            style={{
                              width: "100%",
                              backgroundColor: "#00a297",
                              color: "#fff",
                              fontWeight: 600,
                              padding: "8px 0",
                              border: "none",
                              borderRadius: "6px",
                              fontSize: "14px",
                              cursor: "pointer",
                              transition: "all 0.3s ease",
                            }}
                            onMouseOver={e => (e.currentTarget.style.backgroundColor = "#008f82")}
                            onMouseOut={e => (e.currentTarget.style.backgroundColor = "#00a297")}
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                </div>

                {/* Load More */}
                {products.length >= limit && products.length < total && !loading && (
                  <div className="text-center mt-3 mb-5">
                    <button
                      onClick={loadMore}
                      style={{ backgroundColor: "#00a297", color: "#FFF", padding: "8px 20px" }}
                    >
                      Load More
                    </button>
                  </div>
                )}

                {/* Loading below products (Load More) */}
                {loading && products.length > 0 && (
                  <div className="text-center mt-3 mb-5" style={{ fontSize: "18px", color: "#00a297" }}>
                    Healthproo ...
                  </div>
                )}
              </>
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
