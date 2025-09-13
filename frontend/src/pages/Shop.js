import React, { useEffect, useState } from "react";
import Layout from "../components/Layout/Layout";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useCart } from "../context/cart";
import { useProduct } from "../context/product";
import { IoCartOutline } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

const Shop = () => {
  const navigate = useNavigate();
  const { products, setProducts, categories, total, setTotal, loadProducts, loadCategories } = useProduct();
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useCart();
  const API = process.env.REACT_APP_API;

  // Hero slider settings
  const heroSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    arrows: true,
    fade: false,
    cssEase: "linear",
  };

  // Category slider settings
  const categorySettings = {
    dots: false,
    infinite: true,
    speed: 5000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 0,
    cssEase: "linear",
    arrows: false,
    rtl: true,
    variableWidth: true,
  };

  // ---------------- INITIAL LOAD ----------------
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([
        loadCategories(), // cached categories
        products.length === 0 ? loadProducts(page) : Promise.resolve(), // only load if empty
      ]);
      setLoading(false);
    };
    init();
  }, []);

  // ---------------- LOAD MORE ----------------
  useEffect(() => {
    const fetchMore = async () => {
      if (page === 1) return;
      setLoading(true);
      try {
        const { data } = await axios.get(`${API}/api/v1/product/product-list/${page}`);
        if (data?.products?.length > 0) {
          setProducts(prev => [...prev, ...data.products]);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMore();
  }, [page]);

  return (
    <Layout>
      <div style={{ backgroundColor: "#eff0f5", padding: "10px" }}>
        {/* Hero Slider */}
        <div className="hero-slider-container">
          <Slider {...heroSettings}>
            {/* Slide 1 */}
            <div className="slider-item bg-[#d7f2f2]">
              <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center px-6 py-12 gap-8">
                <div className="flex-1 flex justify-center relative">
                  <img
                    src="/images/banner.png"
                    alt="Slide 1"
                    className="slider-image"
                    style={{ height: "400px" }}
                  />
                </div>
              </div>
            </div>

            {/* Slide 2 */}
            <div className="slider-item bg-[#fce7f3]">
              <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center px-6 py-12 gap-8">
                <div className="flex-1 flex justify-center relative">
                  <img
                    src="/images/slider5.jpg"
                    alt="Cosmetics"
                    className="w-full max-w-md object-contain"
                    style={{ height: "400px" }}
                  />
                </div>
              </div>
            </div>

            {/* Slide 3 */}
            <div className="slider-item bg-[#e0f2fe]">
              <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center px-6 py-12 gap-8">
                <div className="flex-1 flex justify-center relative">
                  <img
                    src="/images/slider6.png"
                    alt="Gym Tools"
                    className="w-full max-w-md object-contain"
                    style={{ height: "400px" }}
                  />
                </div>
              </div>
            </div>
          </Slider>
        </div>

        {/* Product Categories */}
        <div className="container my-5">
          <h2 className="text-center mb-4 fw-bold">Shop by Category</h2>
          <Slider {...categorySettings}>
            {categories?.map(c => (
              <div className="px-2" style={{ width: "250px" }} key={c._id}>
                <Link className="dropdown-item" to={`/category/${c.slug}`}>
                  <div className="d-flex flex-column align-items-center rounded shadow-sm h-100 text-center">
                    <div className="card-hover position-relative">
                      <div className="category-tag-small">{c.name}</div>
                      <img
                        src="/images/slider2.jpg"
                        alt={c.name}
                        className="img-fluid rounded"
                      />
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </Slider>
        </div>

        {/* All Products */}
        <div className="container my-5">
          <h2 className="text-center mb-4 fw-bold">All Products</h2>
          <div className="product-grid">
            {products?.map((p) => (
              <div
                key={p._id}
                style={{
                  background: "#fff",
                  border: "1px solid #eee",
                  borderRadius: "8px",
                  padding: "10px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    cursor: "pointer",
                    height: "150px",
                  }}
                  onClick={() => navigate(`/product/${p.slug}`)}
                >
                  <img
                    src={`${API}/api/v1/product/product-photo/${p._id}`}
                    alt={p.name}
                    style={{
                      maxHeight: "100%",
                      maxWidth: "100%",
                      objectFit: "contain",
                    }}
                  />
                </div>

                <div style={{ marginTop: "10px" }}>
                  <p style={{ fontWeight: "bold", fontSize: "14px", margin: 0 }}>
                    {p.name.length > 25 ? p.name.substring(0, 25) + "..." : p.name}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: "8px",
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
                      onClick={() => {
                        const existingCart =
                          JSON.parse(localStorage.getItem("cart")) || [];
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
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          {products.length < total && (
            <div className="text-center mt-3 mb-5">
              <button
                className="btn btn-warning px-4 py-2"
                onClick={() => setPage(page + 1)}
              >
                {loading ? "Loading ..." : "Load More"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Responsive Styles */}
      <style jsx>{`
        .hero-slider-container { margin: 0 auto; width: 100%; }
        .category-tag-small { position: absolute; top: 10px; left: 10px; background: rgba(255,255,255,0.9); padding: 5px 10px; border-radius: 15px; font-weight: bold; font-size: 12px; z-index: 10; box-shadow: 0 2px 5px rgba(0,0,0,0.1);}
        .card-hover { position: relative; transition: all 0.3s ease; cursor: pointer; overflow: hidden; }
        .product-grid { display: grid; grid-template-columns: repeat(5,1fr); gap: 15px; }
        @media(max-width:1024px){ .product-grid{grid-template-columns:repeat(3,1fr);} }
        @media(max-width:768px){ .product-grid{grid-template-columns:repeat(2,1fr);} }
        @media(max-width:480px){ .product-grid{grid-template-columns:repeat(2,1fr);} .slider-item{height:auto;flex-direction:column;text-align:center;padding:20px;} .slider-item img{height:250px !important;} }
      `}</style>
    </Layout>
  );
};

export default Shop;
