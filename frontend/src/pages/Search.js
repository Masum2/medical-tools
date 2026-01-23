import React from "react";
import Layout from "./../components/Layout/Layout";
import { useSearch } from "../context/search";
import { useNavigate } from "react-router-dom";

import { IoCartOutline } from "react-icons/io5";
import { toast } from "react-hot-toast";
import { useCart } from "../context/cart";

const Search = () => {
  const [values] = useSearch();
  const navigate = useNavigate();
 
  const [setCart] = useCart();

  // ✅ make sure it's always an array
  const results = Array.isArray(values?.results) ? values.results : [];
  console.log("results data:", results);

  // ✅ Shop পেজের মতো একই getDisplayPrice ফাংশন
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

  // ✅ Shop পেজের মতো একই getProductImage ফাংশন
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
    return "/default-image.jpg";
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

  // ✅ Calculate discount percentage
  const calculateDiscount = (price, discountPrice) => {
    if (!price || !discountPrice || price <= discountPrice) return 0;
    return Math.round(((price - discountPrice) / price) * 100);
  };

  return (
    <Layout title={"Search results"}>
      <div className="container">
        <div className="text-center">
          <h1>Search Results</h1>
          <h6>
            {results.length < 1
              ? "No Products Found"
              : `Found ${results.length}`}
          </h6>

          {/* ✅ GRID DESIGN START */}
          <div className="search-grid">
            {results.map((p) => {
              const displayPrice = getDisplayPrice(p);
              const imageSrc = getProductImage(p);
              const variationsExist = hasVariations(p);
              const discountPercent = calculateDiscount(
                displayPrice.price,
                displayPrice.discountPrice
              );
              
              return (
                <div
                  key={p._id}
                  className="search-card"
                >
                  {/* 🖼️ Product Image */}
                  <div
                    className="product-image"
                    onClick={() => navigate(`/product/${p.slug}`)}
                  >
                    {/* ✅ Discount Badge */}
                    {displayPrice.hasDiscount && discountPercent > 0 && (
                      <div className="discount-badge">
                        {discountPercent}% OFF
                      </div>
                    )}

                    {/* Variation Badge */}
                    {/* {variationsExist && (
                      <div className="variation-badge">
                        {displayPrice.system === 'colorVariations' ? 'Multiple Options' : 'Variations'}
                      </div>
                    )} */}

                    <img
                      src={imageSrc}
                      alt={p.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/default-image.jpg";
                      }}
                    />
                  </div>

                  {/* 📄 Product Details */}
                  <div className="product-info">
                    <p className="product-name">
                      {p.name && p.name.length > 25
                        ? p.name.substring(0, 25) + "..."
                        : p.name}
                    </p>

                    {/* Price Display - Shop পেজের মতো */}
                    <div className="price-cart">
                      <div className="price-display">
                        {displayPrice.hasDiscount ? (
                          <div className=" discount-price-container">
                            <h6 className="current-price">
                              ৳ {displayPrice.discountPrice}
                            </h6>
                            <div className="original-price-container">
                              <span className="original-price">
                                <s>৳ {displayPrice.price}</s>
                              </span>
                              {/* <span className="savings-text">
                                Save {discountPercent}%
                              </span> */}
                            </div>
                          </div>
                        ) : displayPrice.system === 'colorVariations' && displayPrice.minPrice !== displayPrice.maxPrice ? (
                          <div className="price-range">
                            <h6 className="current-price">
                              ৳{displayPrice.minPrice} - ৳{displayPrice.maxPrice}
                            </h6>
                          </div>
                        ) : (
                          <h6 className="current-price">
                            ৳ {displayPrice.price}
                          </h6>
                        )}
                      </div>

                      {/* Cart Button */}
                      <div
                        className="cart-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          const existingCart = JSON.parse(localStorage.getItem("cart")) || [];

                          // Check if product already exists
                          const found = existingCart.find(
                            (item) => item._id === p._id
                          );

                          if (found) {
                            toast.error("Item already added to cart");
                          } else {
                            const cartItem = {
                              _id: p._id,
                              name: p.name,
                              price: displayPrice.hasDiscount ? displayPrice.discountPrice : displayPrice.price,
                              discountPrice: displayPrice.discountPrice || 0,
                              quantity: 1,
                              image: imageSrc,
                              slug: p.slug,
                              hasVariations: variationsExist,
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
                            localStorage.setItem(
                              "cart",
                              JSON.stringify(updatedCart)
                            );
                            toast.success("Item added to cart");
                          }
                        }}
                      >
                        <IoCartOutline />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {/* ✅ GRID DESIGN END */}
        </div>
      </div>

      {/* ✅ Responsive CSS */}
      <style jsx>{`
        .search-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 20px;
          margin-top: 20px;
        }

        .search-card {
          background: #fff;
          border: 1px solid #eee;
          border-radius: 8px;
          padding: 15px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: box-shadow 0.3s ease;
          position: relative;
        }

        .search-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        /* Discount Badge */
        .discount-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          background: #ff4444;
          color: white;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
          z-index: 1;
        }

        /* Variation Badge */
        .variation-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          background: #2196f3;
          color: white;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
          z-index: 1;
        }

        .product-image {
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          height: 180px;
          background: #f9f9f9;
          border-radius: 4px;
          overflow: hidden;
          position: relative;
          margin-bottom: 10px;
        }

        .product-image img {
          max-height: 100%;
          max-width: 100%;
          object-fit: contain;
          transition: transform 0.3s ease;
        }

        .product-image:hover img {
          transform: scale(1.05);
        }

        .product-info {
          margin-top: 10px;
        }

        .product-name {
          font-weight: bold;
          font-size: 14px;
          margin: 0 0 10px 0;
          color: #333;
          min-height: 40px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.4;
        }

        .price-cart {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid #eee;
        }

        .price-display {
          flex: 1;
        }

        .discount-price-container {
          display: flex;
          // flex-direction: column;
          gap: 4px;
        }

        .current-price {
          color: #d32f2f;
          font-weight: bold;
          margin: 0;
          font-size: 18px;
          line-height: 1.2;
        }

        .original-price-container {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .original-price {
          color: #666;
          font-size: 14px;
          text-decoration: line-through;
        }

        .savings-text {
          color: #4caf50;
          font-size: 12px;
          font-weight: 500;
        }

        .price-range {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .cart-btn {
          cursor: pointer;
          color: #fff;
          font-weight: bold;
          background-color: #00a297;
          padding: 8px 12px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.3s ease;
          font-size: 16px;
          margin-left: 10px;
        }

        .cart-btn:hover {
          background-color: #00857a;
        }

        /* Tablet */
        @media (max-width: 1024px) {
          .search-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
          }
          .product-image {
            height: 160px;
          }
        }

        /* Mobile */
        @media (max-width: 768px) {
          .search-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          .product-image {
            height: 140px;
          }
          .current-price {
            font-size: 16px;
          }
          .cart-btn {
            padding: 6px 10px;
            font-size: 14px;
          }
        }

        /* Small Mobile */
        @media (max-width: 480px) {
          .search-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }
          .search-card {
            padding: 10px;
          }
          .product-image {
            height: 120px;
          }
          .product-name {
            font-size: 12px;
            min-height: 34px;
          }
          .current-price {
            font-size: 14px;
          }
          .original-price {
            font-size: 12px;
          }
          .cart-btn {
            padding: 5px 8px;
            font-size: 12px;
          }
        }

        /* Extra Small Mobile */
        @media (max-width: 360px) {
          .search-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </Layout>
  );
};

export default Search;