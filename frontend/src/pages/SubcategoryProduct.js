import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/cart";
import toast from "react-hot-toast";
import Layout from "../components/Layout/Layout";
import { FaAngleRight } from "react-icons/fa";

const SubcategoryProducts = () => {
  const { subSlug } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ setCart] = useCart();
  const API = process.env.REACT_APP_API;

  // Fetch products for subcategory
  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log("📌 Fetching products for subcategory:", subSlug);
      
      const { data } = await axios.get(
        `${API}/api/v1/product/subcategory/${subSlug}`
      );
      
      console.log("📌 API Response:", data);
      
      if (data.success) {
        setProducts(data.products || []);
      } else {
        toast.error(data.message || "Failed to load products");
      }
      
      setLoading(false);
    } catch (error) {
      console.error("❌ Error fetching products:", error);
      toast.error("Failed to load products");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (subSlug) {
      fetchProducts();
    }
  }, [subSlug]);

  // ✅ Shop পেজের getDisplayPrice ফাংশন copy করুন
  const getDisplayPrice = (product) => {
    // Check which system the product uses
    if (product.useSimpleProduct === false && product.colorVariations) {
      // ✅ Color Variations System
      const colorKeys = Object.keys(product.colorVariations || {});
      if (colorKeys.length > 0) {
        const firstColor = colorKeys[0];
        const variations = product.colorVariations[firstColor];
        if (variations && variations.length > 0) {
          const firstVariation = variations[0];
          return {
            price: firstVariation.price,
            discountPrice: firstVariation.discountPrice || 0,
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
        discountPrice: firstVariation.discountPrice || 0,
        hasDiscount: firstVariation.discountPrice > 0,
        system: 'variations'
      };
    }

    // ✅ Simple Product System (আপনার ডাটা অনুযায়ী)
    // আপনার ডাটায় price এবং discountPrice fields আছে
    const price = product.price || product.basePrice || 0;
    const discountPrice = product.discountPrice || product.baseDiscountPrice || 0;
    
    return {
      price: price,
      discountPrice: discountPrice,
      hasDiscount: discountPrice > 0 && discountPrice < price,
      system: 'simple'
    };
  };

  // ✅ Shop পেজের getProductImage ফাংশন copy করুন
  const getProductImage = (product) => {
    // First try color-specific images
    if (product.colorImages && product.colorImages.length > 0) {
      return product.colorImages[0].images?.[0]?.url;
    }

    // Then try default photos
    if (product.defaultPhotos && product.defaultPhotos.length > 0) {
      return product.defaultPhotos[0]?.url;
    }

    // Then old photos array (আপনার ডাটায় এটি আছে)
    if (product.photos && product.photos.length > 0) {
      return product.photos[0]?.url;
    }

    // Fallback
    return "/default-image.jpg";
  };

  // Add to cart function
  const handleAddToCart = (product) => {
    const displayPrice = getDisplayPrice(product);
    const imageSrc = getProductImage(product);
    
    if (displayPrice.price === 0) {
      toast.error("This product is currently unavailable");
      return;
    }

    const existingCart = JSON.parse(localStorage.getItem("cart")) || [];
    const alreadyInCart = existingCart.find((item) => item._id === product._id);

    if (alreadyInCart) {
      toast.error("Item already in cart");
      return;
    }

    const cartItem = {
      _id: product._id,
      name: product.name,
      price: displayPrice.price,
      discountPrice: displayPrice.discountPrice,
      quantity: 1,
      image: imageSrc,
      uniqueId: Date.now() + Math.random(),
      slug: product.slug
    };

    const newCart = [...existingCart, cartItem];
    localStorage.setItem("cart", JSON.stringify(newCart));
    setCart(newCart);
    toast.success("Item added to cart");
  };

  return (
    <Layout>
      <div className="container-fluid py-4">
        {/* Breadcrumb */}
        <div
          style={{
            paddingBottom: "10px",
            fontSize: "14px",
            color: "#555",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            justifyContent: "center",
            flexWrap: "wrap"
          }}
        >
          <span
            style={{ cursor: "pointer", color: "#00a297" }}
            onClick={() => navigate("/")}
          >
            Home
          </span>
          <FaAngleRight />
          
          <span style={{ color: "#666" }}>
            Subcategory: <strong className="text-capitalize">
              {decodeURIComponent(subSlug)}
            </strong>
          </span>
        </div>

        {/* Page Header */}
        <div className="text-center mb-4">
          <h3 className="fw-bold text-capitalize">
            {decodeURIComponent(subSlug).replace(/-/g, ' ')}
          </h3>
          <p className="text-muted">
            {loading ? "Loading..." : `${products.length} products found`}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading products...</p>
          </div>
        )}

        {/* Products Grid - Shop পেজের মতো */}
        {!loading && (
          <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-3">
            {products.map((p) => {
              const displayPrice = getDisplayPrice(p);
              const imageSrc = getProductImage(p);
              const discountPercent = displayPrice.hasDiscount 
                ? Math.round(((displayPrice.price - displayPrice.discountPrice) / displayPrice.price) * 100)
                : 0;

              return (
                <div key={p._id} className="col">
                  <div className="card h-100 border-0 shadow-sm hover-shadow">
                    {/* Image */}
                    <div
                      className="position-relative overflow-hidden bg-light"
                      style={{ 
                        height: "180px", 
                        cursor: "pointer",
                        transition: "transform 0.3s"
                      }}
                      onClick={() => navigate(`/product/${p.slug}`)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.02)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                    >
                      <img
                        src={imageSrc}
                        alt={p.name}
                        className="w-100 h-100 object-fit-contain p-3"
                        style={{ objectFit: 'contain' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/default-image.jpg";
                        }}
                      />
                      
                      {/* Discount Badge - Shop পেজের মতো */}
                      {displayPrice.hasDiscount && discountPercent > 0 && (
                        <div 
                          className="position-absolute top-0 start-0 bg-danger text-white px-2 py-1 rounded-end"
                          style={{ 
                            fontSize: "12px", 
                            fontWeight: "bold",
                            zIndex: 1
                          }}
                        >
                          {discountPercent}% OFF
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="card-body p-3 d-flex flex-column">
                      {/* Name */}
                      <p 
                        className="card-title fw-bold mb-2 flex-grow-1" 
                        style={{ 
                          fontSize: "14px",
                          cursor: "pointer",
                          minHeight: "42px",
                          overflow: "hidden",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical"
                        }}
                        onClick={() => navigate(`/product/${p.slug}`)}
                        title={p.name}
                      >
                        {p.name?.length > 40 ? p.name.substring(0, 40) + "..." : p.name}
                      </p>

                      {/* Price - EXACTLY SAME AS SHOP PAGE */}
                      <div className="mb-3">
                        {displayPrice.hasDiscount ? (
                          <div className="d-flex align-items-center flex-wrap">
                            <span className="text-danger fw-bold fs-5">
                              ৳ {displayPrice.discountPrice.toLocaleString()}
                            </span>
                            <small className="text-muted text-decoration-line-through ms-2">
                              ৳ {displayPrice.price.toLocaleString()}
                            </small>
                          </div>
                        ) : (
                          <span className="text-danger fw-bold fs-5">
                            ৳ {displayPrice.price > 0 ? displayPrice.price.toLocaleString() : "N/A"}
                          </span>
                        )}
                        
                        {/* Price Range (যদি color variations হয়) */}
                        {displayPrice.system === 'colorVariations' && displayPrice.minPrice !== displayPrice.maxPrice && (
                          <small className="d-block text-muted mt-1">
                            From ৳ {displayPrice.minPrice?.toLocaleString()}
                          </small>
                        )}
                      </div>

                      {/* Add to Cart - Shop পেজের মতো বাটন */}
                      <button
                        className="btn btn-sm w-100 mt-auto"
                        style={{
                          backgroundColor: "#00a297",
                          color: "white",
                          fontSize: "14px",
                          padding: "8px",
                          border: 'none',
                          fontWeight: "500",
                          transition: "all 0.3s"
                        }}
                        onClick={() => handleAddToCart(p)}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = "#00877d";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = "#00a297";
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
        )}

        {/* যদি কোন প্রোডাক্ট না থাকে */}
        {!loading && products.length === 0 && (
          <div className="text-center py-5">
            <p className="text-muted">No products found in this subcategory</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/shop')}
            >
              Browse All Products
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SubcategoryProducts;