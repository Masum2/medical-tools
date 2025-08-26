import React, { useEffect, useState } from "react";
import Layout from "../components/Layout/Layout";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useCart } from "../context/cart";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

import toast from "react-hot-toast";
import { IoCartOutline } from "react-icons/io5";
import { FaRegHeart } from "react-icons/fa";
import useCategory from "../hooks/useCategory";
const Shop = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useCart();
  const categories = useCategory();
    const API = process.env.REACT_APP_API;
  // Main hero slider settings
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

  // Category slider settings (right to left)
  const categorySettings = {
    dots: false,
    infinite: true,
    speed: 5000,          // duration of full scroll
    slidesToShow: 1,      // show one at a time
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 0,     // continuous, no delay
    cssEase: "linear",    // smooth marquee-like scroll
    arrows: false,
    rtl: true,            // right to left
    variableWidth: true,  // allows smooth continuous flow
  };

  // --- Fetch all products
  const getAllProducts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API}/api/v1/product/product-list/${page}`);
      setLoading(false);
      if (page === 1) {
        setProducts(data?.products);
      } else {
        setProducts([...products, ...data?.products]);
      }
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };

  // --- Fetch total product count
  const getTotal = async () => {
    try {
      const { data } = await axios.get(`${API}/api/v1/product/product-count`);
      setTotal(data?.total);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getTotal();
    getAllProducts();
  }, [page]);


  return (
    <Layout>
      <div style={{ backgroundColor: '#eff0f5', padding: '10px' }}>
        {/* Hero Slider */}
        <div className="hero-slider-container">
          <Slider {...heroSettings}>
            <div className="slider-item bg-[#d7f2f2]">
              <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center px-6 py-12 gap-8">
                <div className="flex-1 flex justify-center relative">
                  <img
                    src="/images/banner.png"
                    alt="First slide"
                    className="slider-image"
                    style={{ height: "400px" }}
                  />
                </div>
              </div>
            </div>
            {/* --- Slide 1: Health Tools --- */}
            <div className="slider-item bg-[#d7f2f2]">
              <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center px-6 py-12 gap-8">
                {/* Left: image */}
                <div className="flex-1 flex justify-center relative">
                  <div className="category-tag">Health Tools</div>
                  <img
                    src="/images/slider2.jpg"
                    alt="Health Tools"
                    className="w-full max-w-md object-contain"
                    style={{ height: "400px" }}
                  />
                </div>

                {/* Right: text content */}
                <div className="flex-1 text-center md:text-left space-y-4">
                  <p className="uppercase tracking-wide text-sm text-gray-600">
                    Health Essentials
                  </p>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                    Advanced Health Tools <br /> for Your Wellbeing
                  </h2>
                  <p className="text-gray-600">
                    Explore our collection of premium health monitoring tools and
                    equipment designed to keep you and your family safe.
                  </p>
                  <button style={{ padding: '5px' }} className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white  rounded-full shadow-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105">
                    SHOP NOW
                  </button>
                </div>
              </div>
            </div>

            {/* --- Slide 2: Cosmetics --- */}
            <div className="slider-item bg-[#fce7f3]">
              <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center px-6 py-12 gap-8">
                {/* Left: image */}
                <div className="flex-1 flex justify-center relative">
                  <div className="category-tag">Cosmetics</div>
                  <img
                    src="/images/slider5.jpg"
                    alt="Cosmetics"
                    className="w-full max-w-md object-contain"
                    style={{ height: "400px" }}
                  />
                </div>

                {/* Right: text content */}
                <div className="flex-1 text-center md:text-left space-y-4">
                  <p className="uppercase tracking-wide text-sm text-pink-600">
                    Beauty & Care
                  </p>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                    Discover Premium <br /> Skincare & Cosmetics
                  </h2>
                  <p className="text-gray-600">
                    Enhance your natural glow with our wide range of high-quality
                    beauty and skincare products tailored for every skin type.
                  </p>
                  <button style={{ padding: '5px' }} className="bg-gradient-to-r from-pink-500 to-rose-600 text-white  rounded-full shadow-lg hover:from-pink-600 hover:to-rose-700 transition-all duration-300 transform hover:scale-105">
                    SHOP NOW
                  </button>
                </div>
              </div>
            </div>

            {/* --- Slide 3: Gym Tools --- */}
            <div className="slider-item bg-[#e0f2fe]">
              <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center px-6 py-12 gap-8">
                {/* Left: image */}
                <div className="flex-1 flex justify-center relative">
                  <div className="category-tag">Gym Tools</div>
                  <img
                    src="/images/slider6.png"
                    alt="Gym Tools"
                    className="w-full max-w-md object-contain"
                    style={{ height: "400px" }}
                  />
                </div>

                {/* Right: text content */}
                <div className="flex-1 text-center md:text-left space-y-4">
                  <p className="uppercase tracking-wide text-sm text-blue-600">
                    Fitness Gear
                  </p>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                    Professional Gym Tools <br /> For Your Daily Workout
                  </h2>
                  <p className="text-gray-600">
                    Power up your fitness journey with durable and effective gym
                    tools, perfect for home and professional training sessions.
                  </p>
                  <button style={{ padding: '5px' }} className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105">
                    SHOP NOW
                  </button>
                </div>
              </div>
            </div>
          </Slider>
        </div>

        {/* Product Category section with slider */}
        <div className="container my-5">
          <h2 className="text-center mb-4 fw-bold">Shop by Category</h2>
          <Slider {...categorySettings}>
            {/* --- Card 1 --- */}
            {categories?.map((c) => (
              <div className="px-2" style={{ width: "250px" }} key={c._id}>
                <Link
                  className="dropdown-item"
                  to={`/category/${c.slug}`}
                >
                  <div className="d-flex flex-column align-items-center rounded shadow-sm h-100 text-center">
                    <div className="card-hover position-relative">
                      <div className="category-tag-small">{c.name}</div>
                      <img
                        src="/images/slider2.jpg"
                        alt="Digital Stethoscope"
                        className="img-fluid rounded"
                      />
                    </div>
                    {/* <h5 className="fw-bold text-dark">Medical Devices</h5> */}
                  </div>
                </Link>
              </div>

            ))}






          </Slider>
        </div>

        {/* All product */}


        {/* All Products Section */}
        <div className="container my-5">
          <h2 className="text-center mb-4 fw-bold">All Products</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: "15px",
            }}
          >
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
                {/* Product Card Content */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginBottom: "5px",
                  }}
                >
                  <button
                    style={{
                      background: "#fff",
                      // border: "1px solid #00a297",
                      color: '#00a297',
                      borderRadius: "50%",
                      padding: "5px",
                      cursor: "pointer",
                    }}
                  >
                    <FaRegHeart />
                  </button>
                </div>

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
                    style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
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
                      style={{ cursor: "pointer", color: "#FFF", fontWeight: "bold", backgroundColor: '#00a297', padding: '4px', borderRadius: '2px' }}
                      onClick={() => {
                        setCart([...cart, p]);
                        localStorage.setItem("cart", JSON.stringify([...cart, p]));
                        toast.success("Item added to cart");
                      }}
                    >
                      <IoCartOutline />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>


          {/* Load More Button */}
          <div className="text-center mt-3 mb-5">
            {products && products.length < total && (
              <button
                className="btn btn-warning px-4 py-2"
                onClick={(e) => {
                  e.preventDefault();
                  setPage(page + 1);
                }}
              >
                {loading ? "Loading ..." : "Load More"}
              </button>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .hero-slider-container {
          margin: 0 auto;
          width: 100%;
        }
        
        .category-tag {
          position: absolute;
          top: 15px;
          left: 15px;
          background: rgba(255, 255, 255, 0.9);
          padding: 8px 15px;
          border-radius: 20px;
          font-weight: bold;
          font-size: 14px;
          z-index: 10;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        
        .category-tag-small {
          position: absolute;
          top: 10px;
          left: 10px;
          background: rgba(255, 255, 255, 0.9);
          padding: 5px 10px;
          border-radius: 15px;
          font-weight: bold;
          font-size: 12px;
          z-index: 10;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        
        .card-hover {
          position: relative;
          transition: all 0.3s ease;
          cursor: pointer;
          overflow: hidden;
        }

        .card-hover::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0);
          backdrop-filter: blur(0px);
          transition: all 0.3s ease;
          pointer-events: none;
          z-index: 1;
        }

        .card-hover:hover::after {
          background: rgba(0, 0, 0, 0.4);
        }

        .slider-item {
          height: 400px;
          display: flex;
          align-items: center;
        }

        .slider-item img {
          height: 100%;
          object-fit: contain;
        }

        :global(.slick-slide) {
          user-select: text !important;
        }

        :global(.slick-prev:before, .slick-next:before) {
          color: #000;
          font-size: 24px;
        }

        :global(.slick-dots li button:before) {
          font-size: 12px;
        }

        :global(.slick-dots li.slick-active button:before) {
          color: #000;
        }
        
        // Custom styles for the category slider
        :global(.slick-list) {
          margin: 0 -10px;
        }
        
        :global(.slick-slide > div) {
          margin: 0 10px;
        }
      `}</style>
    </Layout>
  );
};

export default Shop;