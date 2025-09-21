import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "../components/Layout/Layout";
import { useCart } from "../context/cart";
import { useProduct } from "../context/product";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useCategory from "../hooks/useCategory";
import axios from "axios";

const Shop = () => {
  const navigate = useNavigate();
  const categories = useCategory();
  const [cart, setCart] = useCart();
  const API = process.env.REACT_APP_API;
  const { products, loadCategories, setProducts, total, setTotal } = useProduct();

  const [page, setPage] = useState(1);
  const limit = 10;
  const [loading, setLoading] = useState(false);
  console.log("products",products)
useEffect(() => {
  const init = async () => {
    setLoading(true);
    try {
      // Load categories and first page in parallel
      const [catData, productData] = await Promise.all([
        loadCategories(),
        axios.get(`${API}/api/v1/product/product-list/1?limit=${limit}`)
      ]);

      setProducts(productData.data.products);
      setTotal(productData.data.total);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };
  init();
}, []);
  // initial data load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadCategories(), fetchProducts(1)]);
      setLoading(false);
    };
    init();
  }, []);

  // fetch products by page
  const fetchProducts = async (pageNum) => {
    try {
      const { data } = await axios.get(
        `${API}/api/v1/product/product-list/${pageNum}?limit=${limit}`
      );
      if (pageNum === 1) {
        setProducts(data.products);
      } else {
        setProducts((prev) => [...prev, ...data.products]);
      }
      setTotal(data.total);
    } catch (error) {
      console.log(error);
    }
  };

  // load more
// Load More function
const loadMore = async () => {
  if (loading) return; // prevent multiple clicks
  setLoading(true);
  try {
    const nextPage = page + 1;
    const { data } = await axios.get(
      `${API}/api/v1/product/product-list/${nextPage}?limit=${limit}`
    );
    setProducts((prev) => [...prev, ...data.products]);
    setPage(nextPage);
    setTotal(data.total);
  } catch (error) {
    console.log(error);
  }
  setLoading(false);
};

  // slider images
  const images = [
    "https://www.shutterstock.com/image-photo/elegant-health-fitness-product-showcase-260nw-2664388867.jpg",
    "/images/slider4.jpeg",
    "/images/slider3.jpg",
  ];
  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length]);

  // add to cart
  const handleAddToCart = (p) => {
    const existingCart = JSON.parse(localStorage.getItem("cart")) || [];
    const found = existingCart.find((item) => item._id === p._id);

    if (found) {
      toast.error("Item already added to cart");
    } else {
      const cartItem = {
        _id: p._id,
        name: p.name,
        price: p.price,
        discountPrice:p.discountPrice,
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
    <Layout>
      <div style={{ backgroundColor: "#eff0f5" }}>
        {/* Hero Slider */}
        <section className="relative w-full h-[250px] sm:h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden">
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
        </section>

        {/* Product Categories */}
        <div className=" my-3 overflow-hidden">
          <h2 className="text-center mb-4 fw-bold">Shop by Category</h2>
          <motion.div
            className="d-flex"
            animate={{ x: ["0%", "-100%"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 25 }}
            style={{ width: "max-content" }}
          >
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
                          //  src={c.photos?.[0]?.url}
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
        <div className=" mx-5 my-5">
          <h2 className="text-center mb-4 fw-bold">Choose Your Products</h2>

          {/* Initial Loader */}
          {loading && products.length === 0 && (
            <div className="flex justify-center items-center py-10">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full"
              />
            </div>
          )}

          {/* Product Grid */}
          {/* Product Grid */}
          <div className="product-grid">
            {products.map((p) => (
              <div key={p._id} className="product-card">
                <div className="card h-100 shadow-sm border-0 rounded-lg hover:shadow-md transition-all">
                  <div
                    className="d-flex justify-content-center align-items-center p-3"
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate(`/product/${p.slug}`)}
                  >
                    <img
                      // src={`${API}/api/v1/product/product-photo/${p._id}`}
                       src={p.photos?.[0]?.url}
                      alt={p.name}
                      className="img-fluid"
                      style={{ maxHeight: "160px", objectFit: "contain" }}
                      loading="lazy"
                    />
                  </div>
                  <div className="card-body d-flex flex-column">
                    <p className="fw-bold mb-2" style={{ fontSize: "14px" }}>
                      {p.name.length > 20 ? p.name.substring(0, 20) + "..." : p.name}
                    </p>
                    <div className="mb-2 d-flex align-items-center gap-2 flex-wrap">
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
                    <button
                      onClick={() => handleAddToCart(p)}
                      className="mt-auto w-100 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 rounded transition"
                      style={{ fontSize: "14px", border: "none" }}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CSS */}
          <style jsx>{`
  .product-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 20px;
  }
  @media (max-width: 992px) {
    .product-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  @media (max-width: 768px) {
    .product-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  @media (max-width: 576px) {
    .product-grid {
      grid-template-columns: 1fr;
    }
  }
`}</style>


          {/* Load More Button */}
      {products.length < total && (
  <div className="text-center mt-3 mb-5">
    {loading ? (
      <button
        disabled
        style={{
          backgroundColor: "#00a297",
          color: "#FFF",
          padding: "8px 20px",
          opacity: 0.7,
          cursor: "not-allowed",
        }}
      >
        Loading...
      </button>
    ) : (
      <button
        onClick={loadMore}
        style={{
          backgroundColor: "#00a297",
          color: "#FFF",
          padding: "8px 20px",
        }}
      >
        Load More
      </button>
    )}
  </div>
)}

        </div>
      </div>
    </Layout>
  );
};

export default Shop;
