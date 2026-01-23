import React, { useEffect, useState } from "react";
import Layout from "./../components/Layout/Layout";

import axios from "axios";
import { Checkbox, Radio } from "antd";
import { Prices } from "../components/Prices";

import { useCart } from "../context/cart";
import toast from "react-hot-toast";

import { useProduct } from "../context/product";
import { motion } from "framer-motion";

const HomePage = () => {
 
  
  const {
    products,
    setProducts,
    categories,
    
    total,
    setTotal,
    loadProducts,
    loadCategories,
    refreshProducts
  } = useProduct();

  const [checked, setChecked] = useState([]);
  const [subChecked, setSubChecked] = useState([]);
  const [radio, setRadio] = useState([]);
  const [page, setPage] = useState(1);
  const [,setCart] = useCart();
  const [loading, setLoading] = useState(false);
  const API = process.env.REACT_APP_API;
  const limit = 10;

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



  // ✅ Check if product has variations
  const hasVariations = (product) => {
    // Color Variations System
    if (product.useSimpleProduct === false && product.colorVariations) {
      return Object.keys(product.colorVariations).length > 0;
    }
    
    // OLD System
    return product.variations && product.variations.length > 0;
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
        image: getProductImage(p),
        hasVariations: variationsExist,
        slug: p.slug,
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

  // slider images
  const images = [
    "/images/book1.jpg",
    "/images/book3.webp",
    "/images/book2.avif",
  ];
  const [,setCurrentIndex] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <Layout title={"All Products - Best Offers"}>
      <div style={{ backgroundColor: "#eff0f5" }}>
        {/* Hero Slider */}
        {/* <section className="relative w-full h-[250px] sm:h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden">
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
        </section> */}

        {/* Filter Section */}
        <div className="row m-0" style={{ padding: "20px" }}>
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

          {/* Products Grid */}
          <div className="col-md-9">
            {loading && products.length === 0 ? (
              // <div
              //   style={{
              //     display: "flex",
              //     justifyContent: "center",
              //     alignItems: "center",
              //     height: "300px",
              //     fontSize: "24px",
              //     fontWeight: "bold",
              //     color: "#00a297",
              //   }}
              // >
              //   Healthproo ...
              // </div>
                 <div className="flex justify-center items-center py-10">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full"
              />
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
                {/* Product Grid - Same as Shop page */}
                <div className="product-grid">
                  {products.map((p) => {
                    
                    const displayPrice = getDisplayPrice(p);
                   
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
                            <p className="fw-bold mb-2" style={{ fontSize: "14px" }}>
                              {p.name.length > 30 ? p.name.substring(0, 30) + "..." : p.name}
                            </p>

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
                  // <div className="text-center mt-3 mb-5" style={{ fontSize: "18px", color: "#00a297" }}>
                  //   Healthproo ...
                  // </div>
                     <div className="flex justify-center items-center py-10">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full"
              />
            </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <style>
        {`
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
        `}
      </style>
    </Layout>
  );
};

export default HomePage;