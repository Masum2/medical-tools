import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
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
  const [ setCart] = useCart();
  const API = process.env.REACT_APP_API;
  const { products, loadCategories, setProducts, total, setTotal } = useProduct();
  const [page, setPage] = useState(1);
  const limit = 10;
  const [loading, setLoading] = useState(false);
const [isHovered, setIsHovered] = useState(false);
const controls = useAnimation();

useEffect(() => {
  if (isHovered) {
    controls.stop();
  } else {
    controls.start({
      x: ["0%", "-100%"],
      transition: { repeat: Infinity, ease: "linear", duration: 50 }, // slower scroll (was 25)
    });
  }
}, [isHovered, controls]);
  // initial data load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [productData] = await Promise.all([
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



  // Load More function
  const loadMore = async () => {
    if (loading) return;
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

  // ✅ Get display price for product (ALL systems)
  const getDisplayPrice = (product) => {
    // Check which system the product uses
    if (product.useSimpleProduct === false && product.colorVariations) {
      // ✅ Color Variations System
      const colorKeys = Object.keys(product.colorVariations);
      if (colorKeys.length > 0) {
        const firstColor = colorKeys[0];
        const variations = product.colorVariations[firstColor];
        if (variations && variations.length > 0) {
          const firstVariation = variations[0];
          return {
            price: firstVariation.price,
            discountPrice: firstVariation.discountPrice,
            hasDiscount: firstVariation.discountPrice > 0,
            minPrice: product.minPrice,
            maxPrice: product.maxPrice,
            system: 'colorVariations'
          };
        }
      }
      
      // Fallback to min/max price
      return {
        price: product.minPrice || 0,
        discountPrice: 0,
        hasDiscount: false,
        minPrice: product.minPrice,
        maxPrice: product.maxPrice,
        system: 'colorVariations'
      };
    }
    
    // ✅ OLD System: variations array
    if (product.variations && product.variations.length > 0) {
      const firstVariation = product.variations[0];
      return {
        price: firstVariation.price,
        discountPrice: firstVariation.discountPrice,
        hasDiscount: firstVariation.discountPrice > 0,
        system: 'variations'
      };
    }
    
    // ✅ Simple Product System
    return {
      price: product.basePrice || product.price,
      discountPrice: product.baseDiscountPrice || product.discountPrice,
      hasDiscount: (product.baseDiscountPrice || product.discountPrice) > 0,
      system: 'simple'
    };
  };

  // ✅ Get variation summary for display
  const getVariationSummary = (product) => {
    // Color Variations System
    if (product.useSimpleProduct === false && product.colorVariations) {
      const colorKeys = Object.keys(product.colorVariations);
      const colors = colorKeys;
      const sizes = new Set();
      let totalVariations = 0;
      
      colorKeys.forEach(color => {
        const variations = product.colorVariations[color];
        if (variations) {
          totalVariations += variations.length;
          variations.forEach(v => sizes.add(v.size));
        }
      });
      
      return {
        sizes: Array.from(sizes).slice(0, 3),
        colors: colors.slice(0, 2),
        totalVariations,
        system: 'colorVariations'
      };
    }
    
    // OLD System: variations array
    if (product.variations && product.variations.length > 0) {
      const sizes = [...new Set(product.variations.map(v => v.size))];
      const colors = [...new Set(product.variations.map(v => v.color))];
      
      return {
        sizes: sizes.slice(0, 3),
        colors: colors.slice(0, 2),
        totalVariations: product.variations.length,
        system: 'variations'
      };
    }
    
    return null;
  };

  // ✅ Check if product has variations
  const hasVariations = (product) => {
    // Color Variations System
    if (product.useSimpleProduct === false && product.colorVariations) {
      return Object.keys(product.colorVariations).length > 0;
    }
    
    // OLD System
    return product.variations && product.variations.length > 0;
  };

  // ✅ Add to cart function
  const handleAddToCart = (p) => {
    const existingCart = JSON.parse(localStorage.getItem("cart")) || [];
    const found = existingCart.find((item) => item._id === p._id);

    if (found) {
      toast.error("Item already added to cart");
    } else {
      const displayPrice = getDisplayPrice(p);
      const variationsExist = hasVariations(p);
      
      const cartItem = {
        _id: p._id,
        name: p.name,
        price: displayPrice.price,
        discountPrice: displayPrice.discountPrice,
        quantity: 1,
        image: p.defaultPhotos?.[0]?.url || p.photos?.[0]?.url,
        hasVariations: variationsExist,
        slug: p.slug,
        // ✅ নতুন ফিল্ড যোগ করেছি
        useSimpleProduct: p.useSimpleProduct,
        colorVariations: p.colorVariations || null,
        variations: p.variations || null,
        basePrice: p.basePrice,
        baseDiscountPrice: p.baseDiscountPrice,
        availableColors: p.availableColors || [],
        availableSizes: p.availableSizes || []
      };
      
      const updatedCart = [...existingCart, cartItem];
      setCart(updatedCart);
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      toast.success("Item added to cart");
    }
  };

  // ✅ Get product image
  const getProductImage = (product) => {
    // First try color-specific images
    if (product.colorImages && product.colorImages.length > 0) {
      return product.colorImages[0].images?.[0]?.url;
    }
    
    // Then try default photos
    if (product.defaultPhotos && product.defaultPhotos.length > 0) {
      return product.defaultPhotos[0]?.url;
    }
    
    // Then old photos array
    if (product.photos && product.photos.length > 0) {
      return product.photos[0]?.url;
    }
    
    // Fallback
    return "/images/default-product.jpg";
  };

  // slider images
  const images = [
    "/images/newslide.png",
    "/images/slider2.jpeg",
    "/images/slidenew2.png",
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
       <div className="my-3 overflow-hidden">
    <h2 className="text-center mb-4 fw-bold">Shop by Category</h2>

    <motion.div
      className="d-flex"
      animate={controls}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ width: "max-content", cursor: "grab" }}
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
        <div className="mx-5 my-5">
          <h2 className="mb-4 fw-bold">All Product</h2>

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
          <div className="product-grid">
            {products.map((p) => {
              const variationsExist = hasVariations(p);
              const displayPrice = getDisplayPrice(p);
              const variationSummary = variationsExist ? getVariationSummary(p) : null;
              const productImage = getProductImage(p);

              return (
                <div key={p._id} className="product-card">
                  <div className="card h-100 shadow-sm border-0 rounded-lg hover:shadow-md transition-all">
                    {/* Product Image */}
                    <a
                      href={`/product/${p.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="d-flex justify-content-center align-items-center p-3 text-decoration-none"
                      style={{ cursor: "pointer", height: "200px" }}
                    >
                      <img
                        src={productImage}
                        alt={p.name}
                        className="img-fluid"
                        style={{ 
                          maxHeight: "100%", 
                          maxWidth: "100%",
                          objectFit: "contain" 
                        }}
                        loading="lazy"
                      />
                    </a>
                    
                    <div className="card-body d-flex flex-column">
                      {/* Product Name */}
                      <p className="fw-bold " style={{ fontSize: "14px" }}>
                        {p.name.length > 20 ? p.name.substring(0, 20) + "..." : p.name}
                      </p>

                      {/* Price Range for Color Variations */}
                      {/* {displayPrice.system === 'colorVariations' && displayPrice.minPrice !== displayPrice.maxPrice && (
                        <div className="mb-1">
                          <small className="text-success fw-bold">
                            ৳{displayPrice.minPrice} - ৳{displayPrice.maxPrice}
                          </small>
                        </div>
                      )} */}

                      {/* Price Display */}
                      <div className="mb-2 d-flex align-items-center gap-2 flex-wrap">
                        {displayPrice.hasDiscount ? (
                          <>
                            <span className="text-danger fw-bold">৳ {displayPrice.discountPrice}</span>
                            <small className="text-muted text-decoration-line-through">
                              ৳ {displayPrice.price}
                            </small>
                            <span className="badge bg-danger" style={{ fontSize: "10px" }}>
                              {Math.round(((displayPrice.price - displayPrice.discountPrice) / displayPrice.price) * 100)}% OFF
                            </span>
                          </>
                        ) : (
                          displayPrice.system !== 'colorVariations' && (
                            <span className="text-danger fw-bold">৳ {displayPrice.price}</span>
                          )
                        )}
                      </div>

                      {/* Variation Summary */}
                      {/* {variationsExist && variationSummary && (
                        <div className="mb-2 small text-muted">
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <span className="badge bg-info" style={{ fontSize: "10px" }}>
                              {variationSummary.totalVariations} Options
                            </span>
                            {variationSummary.sizes.length > 0 && (
                              <span>
                                <strong>Sizes:</strong> {variationSummary.sizes.join(', ')}
                                {variationSummary.sizes.length > 3 && "..."}
                              </span>
                            )}
                          </div>
                          {variationSummary.colors.length > 0 && (
                            <div>
                              <strong>Colors:</strong> {variationSummary.colors.join(', ')}
                              {variationSummary.colors.length > 2 && "..."}
                            </div>
                          )}
                        </div>
                      )} */}

                      {/* Simple Product Indicator */}
                      {/* {p.useSimpleProduct === true && !variationsExist && (
                        <div className="mb-2">
                          <span className="badge bg-secondary" style={{ fontSize: "10px" }}>
                            Single Price
                          </span>
                        </div>
                      )} */}

                      {/* Add to Cart Button */}
                      <button
                        onClick={() => handleAddToCart(p)}
                        className="mt-auto w-100 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 rounded transition"
                        style={{ 
                          fontSize: "14px", 
                          border: "none",
                          cursor: "pointer"
                        }}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CSS */}
{/* CSS - Updated for mobile optimization */}
<style jsx>{`
  .product-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 20px;
  }
  .product-card {
    transition: transform 0.3s ease;
  }
  .product-card:hover {
    transform: translateY(-5px);
  }
  
  /* Tablet */
  @media (max-width: 1200px) {
    .product-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }
  
  @media (max-width: 992px) {
    .product-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  
  /* Mobile - Main container padding reduce korsi */
  @media (max-width: 768px) {
    .mx-5 {
      margin-left: 15px !important;
      margin-right: 15px !important;
    }
    
    .product-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 12px; /* Gap komay dilam */
    }
    
    .product-card .card {
      margin: 0;
      border-radius: 10px;
      overflow: hidden;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    
    .product-card a {
      height: 170px;
      padding: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .product-card img {
      max-height: 150px;
      max-width: 100%;
      object-fit: contain;
    }
  }
  
  /* Small Mobile - আরও কম স্পেস */
  @media (max-width: 576px) {
    .mx-5 {
      margin-left: 10px !important;
      margin-right: 10px !important;
    }
    
    .product-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 10px; /* আরও কম gap */
    }
    
    .product-card a {
      height: 150px;
      padding: 10px;
    }
    
    .product-card img {
      max-height: 130px;
    }
    
    .product-card .card-body {
      padding: 12px 10px;
      flex-grow: 1;
      display: flex;
      flex-direction: column;
    }
    
    .product-card .card-body p {
      font-size: 13px;
      line-height: 1.3;
      margin-bottom: 8px;
      min-height: 34px;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    
    .product-card .mb-2 {
      margin-bottom: 6px !important;
    }
    
    .product-card button {
      font-size: 13px;
      padding: 8px;
      margin-top: auto;
    }
  }
  
  /* Extra Small Mobile - minimal space */
  @media (max-width: 400px) {
    .mx-5 {
      margin-left: 8px !important;
      margin-right: 8px !important;
    }
    
    .product-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 8px; /* Minimum gap */
    }
    
    .product-card a {
      height: 140px;
      padding: 8px;
    }
    
    .product-card img {
      max-height: 120px;
    }
    
    .product-card .card-body {
      padding: 10px 8px;
    }
    
    .product-card .card-body p {
      font-size: 12px;
      min-height: 32px;
    }
    
    .product-card button {
      font-size: 12px;
      padding: 7px;
    }
    
    /* Price text small korlam */
    .product-card .text-danger {
      font-size: 14px;
    }
    
    .product-card .text-decoration-line-through {
      font-size: 11px;
    }
    
    .product-card .badge {
      font-size: 9px;
      padding: 2px 4px;
    }
  }
  
  /* Product name truncation for all devices */
  .product-card .card-body p {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    min-height: 40px;
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
                    borderRadius: "6px",
                    opacity: 0.7,
                    cursor: "not-allowed",
                    border: "none"
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
                    borderRadius: "6px",
                    border: "none",
                    cursor: "pointer",
                    transition: "background-color 0.3s"
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "#00897b"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "#00a297"}
                >
                  Load More Products
                </button>
              )}
            </div>
          )}

          {/* No Products Message */}
          {!loading && products.length === 0 && (
            <div className="text-center py-5">
              <h4>No products found</h4>
              <p>Check back later for new arrivals!</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Shop;