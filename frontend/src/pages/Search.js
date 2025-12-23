import React, { useState } from "react";
import Layout from "./../components/Layout/Layout";
import { useSearch } from "../context/search";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useCart } from "../context/cart";

const Search = () => {
  const [values] = useSearch();
  const navigate = useNavigate();
  const API = process.env.REACT_APP_API;
  const [cart, setCart] = useCart();

  // ✅ make sure it's always an array
  const results = Array.isArray(values?.results) ? values.results : [];
  console.log("Search results data:", results);
 const [loading, setLoading] = useState(false);
  // ✅ Function to get product image - সব ধরণের schema support করে
  const getProductImage = (product) => {
    // First try: defaultPhotos (new schema)
    if (product.defaultPhotos && product.defaultPhotos.length > 0) {
      // Check if it's an object with url property or just a string
      const photo = product.defaultPhotos[0];
      return photo.url || photo;
    }
    
    // Second try: photos (old schema)
    if (product.photos && product.photos.length > 0) {
      const photo = product.photos[0];
      return photo.url || photo;
    }
    
    // Third try: API endpoint as fallback
    return `${API}/api/v1/product/product-photo/${product._id}`;
  };

  // ✅ Function to get display price
  const getDisplayPrice = (product) => {
    // Use basePrice/baseDiscountPrice (new schema) or price/discountPrice (old schema)
    const price = product.basePrice || product.price || 0;
    const discountPrice = product.baseDiscountPrice || product.discountPrice || 0;
    
    return {
      price: price,
      discountPrice: discountPrice,
      hasDiscount: discountPrice > 0 && discountPrice < price
    };
  };

  // ✅ Calculate discount percentage
  const calculateDiscount = (basePrice, discountPrice) => {
    if (!basePrice || !discountPrice || basePrice <= discountPrice) return 0;
    return Math.round(((basePrice - discountPrice) / basePrice) * 100);
  };

  // ✅ Add to cart function
  const handleAddToCart = (p) => {
    const existingCart = JSON.parse(localStorage.getItem("cart")) || [];
    const found = existingCart.find((item) => item._id === p._id);

    if (found) {
      toast.error("Item already added to cart");
    } else {
      const priceInfo = getDisplayPrice(p);
      const productImage = getProductImage(p);
      
      const cartItem = {
        _id: p._id,
        name: p.name,
        price: priceInfo.discountPrice || priceInfo.price,
        originalPrice: priceInfo.price,
        quantity: 1,
        image: productImage,
        slug: p.slug,
      };
      
      const updatedCart = [...existingCart, cartItem];
      setCart(updatedCart);
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      toast.success("Item added to cart");
    }
  };

  return (
    <Layout title={"Search results"}>
      <div className="container mx-5 my-5">
        <div className="text-center mb-4">
          <h2 className="fw-bold mb-3">Search Results</h2>
          <h5 className="text-muted">
            {results.length < 1
              ? "No Products Found"
              : `Found ${results.length} product${results.length > 1 ? 's' : ''}`}
          </h5>
        </div>

        {/* Product Grid - Shop page এর মতো */}
        {results.length > 0 && (
          <div className="product-grid">
            {results.map((p) => {
              const priceInfo = getDisplayPrice(p);
              const discountPercent = calculateDiscount(
                priceInfo.price,
                priceInfo.discountPrice
              );
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
                      style={{ cursor: "pointer", height: "200px", backgroundColor: "#f9f9f9" }}
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
                        onError={(e) => {
                          e.target.src = "/images/default-product.jpg";
                          e.target.onerror = null;
                        }}
                      />
                    </a>
                    
                    <div className="card-body d-flex flex-column">
                      {/* Product Name */}
                      <p className="fw-bold mb-2" style={{ fontSize: "14px" }}>
                        {p.name && p.name.length > 30 
                          ? p.name.substring(0, 30) + "..." 
                          : p.name}
                      </p>

                      {/* Price Display */}
                      <div className="mb-2 d-flex align-items-center gap-2 flex-wrap">
                        {priceInfo.hasDiscount ? (
                          <>
                            <span className="text-danger fw-bold">
                              ৳ {priceInfo.discountPrice}
                            </span>
                            <small className="text-muted text-decoration-line-through">
                              ৳ {priceInfo.price}
                            </small>
                            <span className="badge bg-danger" style={{ fontSize: "10px" }}>
                              {discountPercent}% OFF
                            </span>
                          </>
                        ) : (
                          <span className="text-danger fw-bold">
                            ৳ {priceInfo.price || "N/A"}
                          </span>
                        )}
                      </div>

                      {/* Add to Cart Button */}
                      <button
                        onClick={() => handleAddToCart(p)}
                        className="mt-auto w-100 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 rounded transition"
                        style={{ 
                          fontSize: "14px", 
                          border: "none",
                          cursor: "pointer",
                          backgroundColor: "#00a297",
                          transition: "background-color 0.3s"
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = "#00857a"}
                        onMouseLeave={(e) => e.target.style.backgroundColor = "#00a297"}
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

        {/* No Products Message */}
        {!loading && results.length === 0 && (
          <div className="text-center py-5">
            <h4>No products found</h4>
            <p>Try different search terms</p>
          </div>
        )}

        {/* CSS - Shop page এর মতো */}
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
      </div>
    </Layout>
  );
};

export default Search;