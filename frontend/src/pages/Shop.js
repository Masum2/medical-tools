import React, { useEffect, useState } from "react";

import { motion, AnimatePresence } from "framer-motion";
import Layout from "../components/Layout/Layout";

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
  console.log("All category", categories)
  console.log("All product", products)
  
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

  const images = [
    "/images/slider2.jpeg",
    "/images/slider4.jpeg",
    "/images/slider5.jpeg",
    "/images/slider3.jpeg",
  ];


  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [images.length]);
  return (
    <Layout>
      <div style={{ backgroundColor: "#eff0f5", }}>
        {/* Hero Slider */}
        <section className="relative w-full h-[250px] sm:h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden">
          {/* Background Image Slider */}
          <AnimatePresence>
            <motion.img
              key={currentIndex}
              src={images[currentIndex]}
              alt={`Slide ${currentIndex}`}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="absolute top-0 left-0 w-full h-full object-cover"
            />
          </AnimatePresence>

          {/* Overlay */}
          {/* <div className="absolute inset-0 bg-black/50" /> */}

          {/* Content on Top */}


        </section>



        {/* Product Categories */}
     
      {/* Product Categories */}
{/* Product Categories */}
<div className="container my-5 overflow-hidden">
  <h2 className="text-center mb-4 fw-bold">Shop by Category</h2>

  <motion.div
    className="d-flex"
    animate={{ x: ["0%", "-100%"] }}
    transition={{
      repeat: Infinity,
      ease: "linear",
      duration: 25, // adjust speed
    }}
    style={{ width: "max-content" }}
  >
    {/* 🔥 Duplicate categories to create seamless loop */}
    {[...categories, ...categories]?.map((c, idx) => (
      <div
        className="px-2"
        style={{ width: "250px", flexShrink: 0 }}
        key={c._id + "-" + idx}
      >
        <Link className="dropdown-item" to={`/category/${c.slug}`}>
          <div className="d-flex flex-column align-items-center rounded shadow-sm h-100 text-center">
            <div className="card-hover position-relative">
              <div className="category-tag-small">{c.name}</div>
              <img
                src={`${API}/api/v1/category/category-photo/${c._id}`}
                alt={c.name}
                className="img-fluid rounded"
              />
            </div>
          </div>
        </Link>
      </div>
    ))}
  </motion.div>
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
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
    }}
  >
    {/* Product Image */}
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

    {/* Product Info */}
    <div style={{ marginTop: "10px", flexGrow: 1 }}>
      <p style={{ fontWeight: "bold", fontSize: "14px", margin: 0 }}>
        {p.name.length > 25 ? p.name.substring(0, 25) + "..." : p.name}
      </p>

      {/* Price */}
      <h6 style={{ color: "red", fontWeight: "bold", margin: "8px 0" }}>
        ৳ {p.price}
      </h6>
    </div>

    {/* ✅ Add to Cart Button */}
    <button
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
        marginTop: "auto",
      }}
      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#008f82")}
      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#00a297")}
      onClick={() => {
        const existingCart = JSON.parse(localStorage.getItem("cart")) || [];
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
      Add to Cart
    </button>
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
