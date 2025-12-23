import React, { useState, useEffect } from "react";
import Layout from "./../components/Layout/Layout";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FaStar, FaRegStar, FaStarHalfAlt, FaFire } from "react-icons/fa";
import { IoCartOutline } from "react-icons/io5";
import { useCart } from "../context/cart";
import toast from "react-hot-toast";
import "../styles/ProductDetailsStyles.css";
import { useAuth } from "../context/auth";
import { FaAngleRight } from "react-icons/fa";
import { FaRegHeart } from "react-icons/fa";
import { FaPlay } from "react-icons/fa";

const ProductDetails = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [auth] = useAuth();
  const [product, setProduct] = useState({});
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [cart, setCart] = useCart();
  const API = process.env.REACT_APP_API;
  
  // Normalized product data
  const [normalizedProduct, setNormalizedProduct] = useState({});
  
  // States for color-based variations
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [currentVariation, setCurrentVariation] = useState(null);
  
  // Other states
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ name: "", stars: 0, comment: "" });
  const [activeTab, setActiveTab] = useState("details");
  const [selectedImage, setSelectedImage] = useState("");
  const [images, setImages] = useState([]);
 
  // Video modal state
  const [showVideoModal, setShowVideoModal] = useState(false);
  
  // All available sizes and colors from NEW system
  const [allSizes, setAllSizes] = useState([]);
  const [allColors, setAllColors] = useState([]);
  const [colorImages, setColorImages] = useState({}); // Store color-specific images

  // Fetch product
  useEffect(() => {
    if (params?.slug) getProduct();
  }, [params?.slug]);

  // Normalize product data - সমস্ত schema একসাথে handle করার জন্য
  const normalizeProductData = (productData) => {
    if (!productData) return {};
    
    // Photos normalization - defaultPhotos না থাকলে photos থেকে নেবে
    let displayPhotos = [];
    if (productData.defaultPhotos && productData.defaultPhotos.length > 0) {
      displayPhotos = productData.defaultPhotos;
    } else if (productData.photos && productData.photos.length > 0) {
      displayPhotos = productData.photos;
    }
    
    // Colors normalization
    let displayColors = [];
    if (productData.availableColors && productData.availableColors.length > 0) {
      displayColors = productData.availableColors;
    } else if (productData.color && productData.color.length > 0) {
      displayColors = productData.color;
    }
    
    // Sizes normalization
    let displaySizes = [];
    if (productData.availableSizes && productData.availableSizes.length > 0) {
      displaySizes = productData.availableSizes;
    } else if (productData.size && productData.size.length > 0) {
      displaySizes = productData.size;
    }
    
    // Quantity normalization
    let displayQuantity = 0;
    if (productData.baseQuantity !== undefined && productData.baseQuantity !== null) {
      displayQuantity = productData.baseQuantity;
    } else if (productData.quantity !== undefined && productData.quantity !== null) {
      displayQuantity = productData.quantity;
    }
    
    return {
      ...productData,
      // Price normalization
      displayPrice: productData.basePrice || productData.price || 0,
      displayDiscountPrice: productData.baseDiscountPrice || productData.discountPrice || 0,
      
      // Photos normalization
      displayPhotos: displayPhotos,
      
      // Colors normalization
      displayColors: displayColors,
      
      // Sizes normalization
      displaySizes: displaySizes,
      
      // Quantity normalization
      displayQuantity: displayQuantity,
      
      // Check if it's a variation product
      isVariationProduct: !productData.useSimpleProduct && 
                         productData.colorVariations && 
                         Object.keys(productData.colorVariations || {}).length > 0
    };
  };

  const getProduct = async () => {
    try {
      const { data } = await axios.get(`${API}/api/v1/product/get-product-variation/${params.slug}`);
      
      console.log("Raw product data:", data.product);
      console.log("Color images from API:", data.product?.colorImages);
      
      // Normalize the product data
      const normalized = normalizeProductData(data?.product || {});
      setProduct(data?.product || {});
      setNormalizedProduct(normalized);
      
      console.log("Normalized product:", normalized);
      
      // Get first category ID for similar products
      let categoryId;
      if (data?.product?.categories?.[0]?._id) {
        categoryId = data.product.categories[0]._id;
      } else if (data?.product?.categories?.[0]) {
        categoryId = data.product.categories[0];
      } else if (data?.product?.category?._id) {
        categoryId = data.product.category._id;
      } else if (data?.product?.category) {
        categoryId = data.product.category;
      }
      
      if (data?.product?._id && categoryId) {
        getSimilarProduct(data.product._id, categoryId);
      }
    } catch (error) {
      console.log("Error fetching product:", error);
      toast.error("Failed to load product");
    }
  };

  // Initialize variations when product loads
  useEffect(() => {
    console.log("Product in useEffect:", product);
    console.log("Normalized product:", normalizedProduct);
    
    if (!product._id) return;
    
    // Process color images if available
    let colorImgMapping = {}; // Define colorImgMapping here
    if (product.colorImages && product.colorImages.length > 0) {
      console.log("Processing color images:", product.colorImages);
      product.colorImages.forEach(ci => {
        if (ci.color && ci.images) {
          // Extract URLs from images array
          colorImgMapping[ci.color] = ci.images.map(img => img?.url || img).filter(url => url);
        }
      });
      console.log("Color images mapping:", colorImgMapping);
      setColorImages(colorImgMapping);
    }
    
    // Set initial images based on available data
    let displayImages = [];
    if (normalizedProduct.displayPhotos && normalizedProduct.displayPhotos.length > 0) {
      // Extract URLs from photos array
      displayImages = normalizedProduct.displayPhotos.map(photo => {
        return photo.url || photo;
      });
    }
    
    console.log("Initial display images:", displayImages);
    setImages(displayImages);
    if (displayImages.length > 0) {
      setSelectedImage(displayImages[0]);
    }
    
    // Set colors
    if (normalizedProduct.displayColors && normalizedProduct.displayColors.length > 0) {
      setAllColors(normalizedProduct.displayColors);
      setSelectedColor(normalizedProduct.displayColors[0]);
    }
    
    // Set sizes
    if (normalizedProduct.displaySizes && normalizedProduct.displaySizes.length > 0) {
      setAllSizes(normalizedProduct.displaySizes);
      setSelectedSize(normalizedProduct.displaySizes[0]);
    }
    
    // Set brand
    if (product.brand && product.brand.length > 0) {
      setSelectedBrand(product.brand[0]);
    }
    
    // Handle variation products (NEW system)
    if (normalizedProduct.isVariationProduct && product.colorVariations) {
      console.log("Variation product detected");
      
      // Convert colorVariations object to array if needed
      const colorVariations = product.colorVariations;
      const colors = Object.keys(colorVariations || {});
      
      if (colors.length > 0) {
        setAllColors(colors);
        const firstColor = colors[0];
        setSelectedColor(firstColor);
        
        // Get sizes for first color
        const sizesForColor = colorVariations[firstColor]?.map(v => v.size) || [];
        setAllSizes(sizesForColor);
        if (sizesForColor.length > 0) {
          setSelectedSize(sizesForColor[0]);
          
          // Set current variation
          const variation = colorVariations[firstColor]?.find(v => v.size === sizesForColor[0]);
          if (variation) {
            setCurrentVariation({
              color: firstColor,
              size: sizesForColor[0],
              price: variation.price,
              discountPrice: variation.discountPrice || 0,
              quantity: variation.quantity || 0,
              sku: variation.sku
            });
          }
        }
        
        // Set images for first color if available in colorImages
        if (colorImgMapping && colorImgMapping[firstColor]) {
          setImages(colorImgMapping[firstColor]);
          if (colorImgMapping[firstColor].length > 0) {
            setSelectedImage(colorImgMapping[firstColor][0]);
          }
        }
      }
    }
  }, [product, normalizedProduct]);

  // Handle brand selection
  const handleBrandSelect = (brand) => {
    setSelectedBrand(brand);
  };

  // Video modal open/close functions
  const openVideoModal = () => {
    if (!product.videoUrl) {
      toast.error("No video available for this product");
      return;
    }
    setShowVideoModal(true);
  };

  const closeVideoModal = () => {
    setShowVideoModal(false);
  };

  // Handle color selection - WITH IMAGE CHANGE
  const handleColorSelect = (color) => {
    setSelectedColor(color);
    
    // Update images for selected color
    if (colorImages[color] && colorImages[color].length > 0) {
      console.log("Setting images for color:", color, colorImages[color]);
      setImages(colorImages[color]);
      setSelectedImage(colorImages[color][0]);
    } else {
      // If no specific images for this color, use default images
      let defaultImages = [];
      if (normalizedProduct.displayPhotos && normalizedProduct.displayPhotos.length > 0) {
        defaultImages = normalizedProduct.displayPhotos.map(photo => photo.url || photo);
      }
      setImages(defaultImages);
      if (defaultImages.length > 0) {
        setSelectedImage(defaultImages[0]);
      }
    }
    
    // If it's a variation product, update sizes
    if (normalizedProduct.isVariationProduct && product.colorVariations) {
      const sizesForColor = product.colorVariations[color]?.map(v => v.size) || [];
      setAllSizes(sizesForColor);
      
      if (sizesForColor.length > 0) {
        const newSize = sizesForColor[0];
        setSelectedSize(newSize);
        
        // Update variation
        const variation = product.colorVariations[color]?.find(v => v.size === newSize);
        if (variation) {
          setCurrentVariation({
            color: color,
            size: newSize,
            price: variation.price,
            discountPrice: variation.discountPrice || 0,
            quantity: variation.quantity || 0,
            sku: variation.sku
          });
        }
      }
    }
  };

  // Handle size selection
  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    
    // Update variation if it's a variation product
    if (normalizedProduct.isVariationProduct && product.colorVariations) {
      const variation = product.colorVariations[selectedColor]?.find(v => v.size === size);
      if (variation) {
        setCurrentVariation({
          color: selectedColor,
          size: size,
          price: variation.price,
          discountPrice: variation.discountPrice || 0,
          quantity: variation.quantity || 0,
          sku: variation.sku
        });
      }
    }
  };

  // Get current display price
  const getDisplayPrice = () => {
    // For variation products
    if (currentVariation) {
      return {
        price: currentVariation.price,
        discountPrice: currentVariation.discountPrice,
        hasDiscount: (currentVariation.discountPrice || 0) > 0
      };
    }
    
    // For simple products (both old and new schema)
    const price = normalizedProduct.displayPrice || 0;
    const discountPrice = normalizedProduct.displayDiscountPrice || 0;
    
    return {
      price: price,
      discountPrice: discountPrice,
      hasDiscount: discountPrice > 0 && discountPrice < price
    };
  };

  // Get current display quantity - এটা শুধু internal use এর জন্য
  const getDisplayQuantity = () => {
    if (currentVariation) {
      return currentVariation.quantity || 0;
    }
    return normalizedProduct.displayQuantity || 0;
  };

  const getSimilarProduct = async (pid, cid) => {
    try {
      const { data } = await axios.get(`${API}/api/v1/product/related-product/${pid}/${cid}`);
      setRelatedProducts(data?.products || []);
    } catch (error) {
      console.log("Error fetching similar products:", error);
    }
  };

  // Fetch reviews after product loads
  useEffect(() => {
    if (product._id) fetchReviews();
  }, [product._id]);

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get(`${API}/api/v1/reviews/${product._id}`);
      if (data.success) {
        setReviews(data.reviews || []);
        setRating(data.averageRating || 0);
      }
    } catch (error) {
      console.log("Error fetching reviews:", error);
    }
  };

  // Quantity handler
  const handleQuantityChange = (type) => {
    if (type === "inc") {
      setQuantity(quantity + 1);
    } else if (type === "dec" && quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // Render stars
  const renderStars = (value = rating) => {
    const stars = [];
    const fullStars = Math.floor(value);
    const hasHalf = value % 1 !== 0;
    for (let i = 0; i < fullStars; i++) stars.push(<FaStar key={`full-${i}`} color="#f4b400" />);
    if (hasHalf) stars.push(<FaStarHalfAlt key="half" color="#f4b400" />);
    for (let i = stars.length; i < 5; i++) stars.push(<FaRegStar key={`empty-${i}`} color="#f4b400" />);
    return stars;
  };

  // Submit Review
  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (!newReview.stars || !newReview.comment) {
      toast.error("Please select rating and write comment");
      return;
    }

    try {
      const { data } = await axios.post(
        `${API}/api/v1/reviews/${product._id}`,
        {
          stars: newReview.stars,
          comment: newReview.comment,
        },
        {
          headers: {
            Authorization: auth?.token,
          },
        }
      );

      if (data.success) {
        setReviews(data.reviews || []);
        setRating(data.averageRating || 0);
        setNewReview({ name: "", stars: 0, comment: "" });
        toast.success(data.message);
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review");
    }
  };

  const displayPrice = getDisplayPrice();
  const hasVariations = normalizedProduct.isVariationProduct;
  const isSimpleProduct = !normalizedProduct.isVariationProduct;

  return (
    <Layout>
      <div className="container py-4 bg-white">
        {/* Breadcrumb */}
        <div
          style={{
            paddingBottom: "5px",
            fontSize: "14px",
            color: "#555",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "5px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <p
            style={{ margin: 0, cursor: "pointer", color: "#00a297" }}
            onClick={() => navigate("/")}
          >
            Home
          </p>
          <FaAngleRight />

          {/* Show first category if available */}
          {(product?.categories?.[0] || product?.category) && (
            <>
              <p
                style={{ margin: 0, cursor: "pointer", color: "#00a297" }}
                onClick={() => {
                  const cat = product.categories?.[0] || product.category;
                  if (cat.slug) {
                    navigate(`/category/${cat.slug}`);
                  }
                }}
              >
                {product.categories?.[0]?.name || product.category?.name || "Category"}
              </p>
              <FaAngleRight />
            </>
          )}

          {/* Subcategory */}
          {product?.subcategories?.length > 0 && (
            <>
              {product.subcategories.map((sub, idx) => (
                <React.Fragment key={sub}>
                  <p
                    style={{ margin: 0, cursor: "pointer", color: "#00a297" }}
                    onClick={() => navigate(`/subcategory/${sub}`)}
                  >
                    {sub}
                  </p>
                  {idx < product.subcategories.length - 1 && <FaAngleRight />}
                </React.Fragment>
              ))}
              <FaAngleRight />
            </>
          )}

          {/* Product Name */}
          <p style={{ margin: 0 }}>
            {product?.name?.length > 60
              ? product.name.substring(0, 60) + "..."
              : product?.name || ""}
          </p>
        </div>

        <div className="row g-4">
          {/* LEFT IMAGE GALLERY */}
          <div className="col-md-5 px-4">
            <div className="bg-white rounded shadow-sm p-3 text-center">
              {/* Main Image with Zoom */}
              <div className="position-relative">
                <img
                  src={selectedImage || "/default-image.jpg"}
                  alt={product.name}
                  className="img-fluid mb-3 rounded main-image"
                  style={{
                    maxHeight: "400px",
                    objectFit: "contain",
                    transition: "transform 0.3s ease",
                    cursor: images.length > 0 ? "zoom-in" : "default",
                  }}
                  onMouseMove={(e) => {
                    if (images.length > 0) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = ((e.clientX - rect.left) / rect.width) * 100;
                      const y = ((e.clientY - rect.top) / rect.height) * 100;
                      e.currentTarget.style.transformOrigin = `${x}% ${y}%`;
                      e.currentTarget.style.transform = "scale(1.8)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                />
                {images.length === 0 && (
                  <div className="text-muted p-5">No images available</div>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 0 && (
                <div className="d-flex gap-2 justify-content-center mt-3">
                  {images.slice(0, 5).map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`thumb-${index}`}
                      className={`img-thumbnail ${selectedImage === img ? "border border-danger" : ""}`}
                      style={{
                        width: "70px",
                        height: "70px",
                        objectFit: "cover",
                        cursor: "pointer",
                      }}
                      onClick={() => setSelectedImage(img)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* CENTER DETAILS */}
          <div className="col-md-6 px-4">
            <h3 className="fw-bold mb-2">{product.name || "Product Name"}</h3>

            {/* Rating */}
            <div className="d-flex justify-content-between ">
              <div className="d-flex align-items-center gap-2 mb-2">
                {renderStars()} <span className="text-muted">{rating.toFixed(1)}</span>
                <span className="text-secondary">({reviews.length} reviews)</span>
              </div>
              {/* Product Video Button */}
 <div>
  {product.videoUrl ? (
    <>
      <a 
        href={product.videoUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-block',
          backgroundColor: '#2563eb',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '6px',
          textDecoration: 'none',
          fontWeight: '500',
          border: 'none',
          cursor: 'pointer',
          transition: 'background-color 0.2s ease'
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
        onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
      >
        Play Product Video
      </a>
    </>
  ) : (<></>)}
</div>
              {/* <div>
                {product.videoUrl ? (
                  <button 
                    onClick={openVideoModal}
                    className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
                    style={{
                      padding: "6px 12px",
                      fontSize: "14px",
                      fontWeight: "500",
                      borderColor: "#00a297",
                      color: "#00a297",
                      transition: "all 0.3s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#00a297";
                      e.currentTarget.style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "#00a297";
                    }}
                  >
                    <FaPlay /> Play Product Video
                  </button>
                ) : (
                  <button 
                    className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
                    style={{
                      padding: "6px 12px",
                      fontSize: "14px",
                      fontWeight: "500",
                      cursor: "not-allowed",
                    }}
                    disabled
                  >
                    <FaPlay /> No Video
                  </button>
                )}
              </div> */}
            </div>

            {/* Price */}
            <div className="d-flex justify-content-between">
              <h4 className="fw-bold mb-3">
                {displayPrice.hasDiscount ? (
                  <>
                    <span className="text-danger me-2">
                      ৳ {displayPrice.discountPrice}
                    </span>
                    <small className="text-muted text-decoration-line-through">
                      ৳ {displayPrice.price}
                    </small>
                    <span className="badge bg-danger ms-2">
                      {Math.round(((displayPrice.price - displayPrice.discountPrice) / displayPrice.price) * 100)}% OFF
                    </span>
                  </>
                ) : (
                  <span className="text-danger me-2">৳ {displayPrice.price}</span>
                )}
              </h4>

              {/* Stock - শুধু "In Stock" দেখাবে, quantity বা "Out of Stock" দেখাবে না */}
              <div className={`fw-medium mb-3 text-success`}>
                In Stock
              </div>
            </div>

            {/* Color Selector for Variation System with IMAGES */}
            <div className="d-flex justify-between">
            {hasVariations && allColors.length > 0 && (
              <div className="mb-3">
                <strong>Color:</strong>
                <div className="d-flex gap-3 mt-2 flex-wrap">
                  {allColors.map((color, idx) => {
                    const isSelected = selectedColor === color;
                    // Get image for this color
                    const colorImg = colorImages[color]?.[0] || 
                                   normalizedProduct.displayPhotos?.[0]?.url || 
                                   normalizedProduct.displayPhotos?.[0] || 
                                   "/default-image.jpg";
                    
                    return (
                      <div
                        key={idx}
                        onClick={() => handleColorSelect(color)}
                        style={{
                          border: isSelected ? "2px solid #00a297" : "1px solid #ccc",
                          borderRadius: "8px",
                          padding: "3px",
                          display: 'inline-block',
                          cursor: "pointer",
                          backgroundColor: isSelected ? "#f0f9ff" : "white",
                          opacity: isSelected ? 1 : 0.9,
                          position: "relative",
                          transition: "all 0.3s",
                          boxShadow: isSelected ? "0 2px 8px rgba(0, 162, 151, 0.3)" : "none",
                        }}
                        title={`Select ${color}`}
                      >
                        {/* Color Image */}
                        <div style={{ position: "relative" }}>
                          <img
                            src={colorImg}
                            alt={color}
                            style={{
                              width: "50px",
                              height: "45px",
                              objectFit: "cover",
                              borderRadius: "6px",
                              border: "1px solid #eee",
                            }}
                            onMouseMove={(e) => {
                              // Small zoom effect on hover
                              e.currentTarget.style.transform = "scale(1.1)";
                              e.currentTarget.style.transition = "transform 0.2s";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = "scale(1)";
                            }}
                          />
                          {isSelected && (
                            <div 
                              style={{
                                position: "absolute",
                                top: "-5px",
                                right: "-5px",
                                backgroundColor: "#00a297",
                                color: "white",
                                borderRadius: "50%",
                                width: "20px",
                                height: "20px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "12px",
                              }}
                            >
                              ✓
                            </div>
                          )}
                        </div>
                        <p style={{ 
                          textAlign: "center", 
                          fontSize: "12px", 
                          fontWeight: "bold",
                          margin: "4px 0 0 0",
                          maxWidth: "55px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          color: isSelected ? "#00a297" : "#333"
                        }}>
                          {color}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
 {/* Brand Selector */}
            {product.brand && product.brand.length > 0 && (
              <div className="mb-3">
                <strong>Brand:</strong>
                <div className="d-flex gap-2 mt-1 flex-wrap">
                  {product.brand.map((b, idx) => {
                    const isSelected = selectedBrand === b;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleBrandSelect(b)}
                        className="btn btn-sm"
                        style={{
                          border: isSelected ? "2px solid #00a297" : "1px solid #ccc",
                          backgroundColor: isSelected ? "#00a297" : "white",
                          color: isSelected ? "white" : "black",
                          fontWeight: "500",
                          transition: "all 0.2s",
                          padding: "4px 12px",
                        }}
                      >
                        {b}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            </div>
            {/* Color Selector - Simple products WITH IMAGES */}
            {isSimpleProduct && normalizedProduct.displayColors?.length > 0 && (
              <div className="mb-3">
                <strong>Select Color:</strong>
                <div className="d-flex gap-3 mt-2 flex-wrap">
                  {normalizedProduct.displayColors.map((color, idx) => {
                    const isSelected = selectedColor === color;
                    // Try to get color-specific image
                    const colorImg = colorImages[color]?.[0] || 
                                   normalizedProduct.displayPhotos?.[0]?.url || 
                                   normalizedProduct.displayPhotos?.[0] || 
                                   "/default-image.jpg";
                    
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          setSelectedColor(color);
                          // Change main image when color is clicked
                          if (colorImages[color] && colorImages[color].length > 0) {
                            setImages(colorImages[color]);
                            setSelectedImage(colorImages[color][0]);
                          }
                        }}
                        style={{
                          border: isSelected ? "2px solid #00a297" : "1px solid #ccc",
                          borderRadius: "8px",
                          padding: "3px",
                          display: 'inline-block',
                          cursor: "pointer",
                          backgroundColor: isSelected ? "#f0f9ff" : "white",
                          opacity: isSelected ? 1 : 0.9,
                          position: "relative",
                          transition: "all 0.3s",
                          boxShadow: isSelected ? "0 2px 8px rgba(0, 162, 151, 0.3)" : "none",
                        }}
                        title={`Select ${color}`}
                      >
                        <div style={{ position: "relative" }}>
                          {colorImages[color] ? (
                            // Show image if available
                            <img
                              src={colorImg}
                              alt={color}
                              style={{
                                width: "50px",
                                height: "45px",
                                objectFit: "cover",
                                borderRadius: "6px",
                                border: "1px solid #eee",
                              }}
                              onMouseMove={(e) => {
                                e.currentTarget.style.transform = "scale(1.1)";
                                e.currentTarget.style.transition = "transform 0.2s";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "scale(1)";
                              }}
                            />
                          ) : (
                            // Show color name if no image
                            <div
                              style={{
                                width: "50px",
                                height: "45px",
                                backgroundColor: "#f5f5f5",
                                borderRadius: "6px",
                                border: "1px solid #eee",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <span style={{ 
                                fontSize: "10px", 
                                fontWeight: "bold",
                                color: "#666"
                              }}>
                                {color}
                              </span>
                            </div>
                          )}
                          {isSelected && (
                            <div 
                              style={{
                                position: "absolute",
                                top: "-5px",
                                right: "-5px",
                                backgroundColor: "#00a297",
                                color: "white",
                                borderRadius: "50%",
                                width: "20px",
                                height: "20px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "12px",
                              }}
                            >
                              ✓
                            </div>
                          )}
                        </div>
                        <p style={{ 
                          textAlign: "center", 
                          fontSize: "12px", 
                          fontWeight: "bold",
                          margin: "4px 0 0 0",
                          maxWidth: "55px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          color: isSelected ? "#00a297" : "#333"
                        }}>
                          {color}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Size Selector - Simple products */}
            {isSimpleProduct && normalizedProduct.displaySizes?.length > 0 && (
              <div className="mb-3">
                <strong>Select Size:</strong>
                <div className="d-flex gap-2 mt-1 flex-wrap">
                  {normalizedProduct.displaySizes.map((size, idx) => {
                    const isSelected = selectedSize === size;
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedSize(size)}
                        className="btn btn-sm"
                        style={{
                          border: isSelected ? "2px solid #00a297" : "1px solid #ccc",
                          backgroundColor: isSelected ? "#00a297" : "white",
                          color: isSelected ? "white" : "black",
                          fontWeight: "500",
                          transition: "all 0.2s",
                          padding: "6px 12px",
                          minWidth: "60px",
                        }}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            
           
        
            {/* Size Selector for Variation System */}
            {hasVariations && selectedColor && allSizes.length > 0 && (
              <div className="mb-3">
                <strong>Size:</strong>
                <div className="d-flex gap-2 mt-2 flex-wrap">
                  {allSizes.map((size, idx) => {
                    const isSelected = selectedSize === size;
                    const isAvailable = true; // Assuming all sizes shown are available
                    
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSizeSelect(size)}
                        className="btn btn-sm position-relative"
                        style={{
                          border: isSelected ? "2px solid #00a297" : "1px solid #ccc",
                          backgroundColor: isSelected ? "#00a297" : (isAvailable ? "white" : "#f8f9fa"),
                          color: isSelected ? "white" : (isAvailable ? "black" : "#6c757d"),
                          fontWeight: "500",
                          minWidth: "80px",
                          cursor: isAvailable ? "pointer" : "not-allowed",
                          opacity: isAvailable ? 1 : 0.6,
                          transition: "all 0.2s",
                          padding: "6px 12px",
                        }}
                        disabled={!isAvailable}
                        title={size}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            {/* <div className="d-flex align-items-center mb-3">
              <span className="me-2">Quantity:</span>
              <button 
                onClick={() => handleQuantityChange("dec")} 
                className="btn btn-outline-secondary btn-sm"
                disabled={quantity <= 1}
              >
                -
              </button>
              <input 
                type="text" 
                value={quantity} 
                readOnly 
                className="form-control text-center mx-2" 
                style={{ width: "60px" }} 
              />
              <button 
                onClick={() => handleQuantityChange("inc")} 
                className="btn btn-outline-secondary btn-sm"
              >
                +
              </button>
            </div> */}

            {/* Buttons */}
            <div className="d-flex gap-3 mb-4">
              <button 
                className="btn px-4 d-flex align-items-center gap-2 justify-content-center"
                style={{ backgroundColor: '#F77E1B', color: '#FFF', width: '200px', textAlign: 'center' }}
                onClick={() => {
                  if (hasVariations && (!selectedColor || !selectedSize)) {
                    toast.error("Please select color and size");
                    return;
                  }
                  
                  const existingCart = JSON.parse(localStorage.getItem("cart")) || [];
                  
                  const cartItem = {
                    _id: product._id,
                    name: product.name,
                    price: displayPrice.price,
                    discountPrice: displayPrice.discountPrice,
                    color: selectedColor || null,
                    brand: selectedBrand || null,
                    size: selectedSize || null,
                    quantity: quantity,
                    image: selectedImage || images[0] || "/default-image.jpg",
                    variationKey: hasVariations ? `${selectedColor}-${selectedSize}` : null,
                    productType: hasVariations ? "variation" : "simple",
                    uniqueId: Date.now() + Math.random(),
                  };

                  // Check if same variation already in cart
                  const found = existingCart.find((item) => {
                    if (item._id !== product._id) return false;
                    if (hasVariations) {
                      return item.color === selectedColor && item.size === selectedSize;
                    }
                    // Simple product - check brand, color, size if available
                    return (item.color === selectedColor) && 
                           (item.size === selectedSize) && 
                           (item.brand === selectedBrand);
                  });

                  if (found) {
                    toast.error("Already added to cart");
                  } else {
                    existingCart.push(cartItem);
                    setCart(existingCart);
                    localStorage.setItem("cart", JSON.stringify(existingCart));
                    toast.success("Item added to cart");
                    navigate(auth?.token ? "/checkout" : "/login");
                  }
                }}
              >
                Buy Now
              </button>
              
              <button
                className="btn px-4 d-flex align-items-center gap-2 justify-content-center"
                style={{ backgroundColor: "rgb(0, 162, 151)", color: "#FFF", width: "200px", textAlign: "center" }}
                onClick={() => {
                  if (hasVariations && (!selectedColor || !selectedSize)) {
                    toast.error("Please select color and size");
                    return;
                  }
                  
                  const existingCart = JSON.parse(localStorage.getItem("cart")) || [];

                  const cartItem = {
                    _id: product._id,
                    name: product.name,
                    price: displayPrice.price,
                    discountPrice: displayPrice.discountPrice,
                    color: selectedColor || null,
                    brand: selectedBrand || null,
                    size: selectedSize || null,
                    quantity: quantity,
                    image: selectedImage || images[0] || "/default-image.jpg",
                    variationKey: hasVariations ? `${selectedColor}-${selectedSize}` : null,
                    productType: hasVariations ? "variation" : "simple",
                    uniqueId: Date.now() + Math.random(),
                  };

                  const updatedCart = [...existingCart, cartItem];
                  setCart(updatedCart);
                  localStorage.setItem("cart", JSON.stringify(updatedCart));
                  toast.success("Item added to cart");
                }}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
        
        {/* Video Modal */}
        {showVideoModal && (
          <div 
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 9999,
            }}
            onClick={closeVideoModal}
          >
            <div 
              style={{
                backgroundColor: "white",
                padding: "20px",
                borderRadius: "10px",
                maxWidth: "800px",
                width: "90%",
                maxHeight: "90%",
                position: "relative",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={closeVideoModal}
                style={{
                  position: "absolute",
                  top: "-15px",
                  right: "-15px",
                  backgroundColor: "red",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: "30px",
                  height: "30px",
                  cursor: "pointer",
                  fontSize: "18px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                ✕
              </button>
              
              <h4 style={{ marginBottom: "20px", color: "#00a297" }}>Product Video</h4>
              
              <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
                <iframe
                  src={product.videoUrl}
                  title="Product Video"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    border: "none",
                    borderRadius: "5px",
                  }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              
              <p style={{ marginTop: "15px", color: "#666", fontSize: "14px" }}>
                This video demonstrates the features and usage of {product.name}
              </p>
            </div>
          </div>
        )}
        
        {/* TABS SECTION */}
        <div className="container mt-5">
          <ul className="nav nav-tabs justify-content-left" style={{ backgroundColor: "#dee2e6", padding: '8px' }}>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "details" ? "active" : ""}`}
                onClick={() => setActiveTab("details")}
                style={{
                  backgroundColor: activeTab === "details" ? "rgb(0, 162, 151)" : "transparent",
                  color: activeTab === "details" ? "#FFF" : "#000",
                  borderRadius: "6px",
                  margin: "0 5px",
                  fontSize: '13px',
                  fontWeight: '500px',
                }}
              >
                PRODUCT DETAILS
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "policy" ? "active" : ""}`}
                onClick={() => setActiveTab("policy")}
                style={{
                  backgroundColor: activeTab === "policy" ? "rgb(0, 162, 151)" : "transparent",
                  color: activeTab === "policy" ? "#FFF" : "#000",
                  borderRadius: "6px",
                  margin: "0 5px",
                  fontSize: '13px',
                  fontWeight: '500px'
                }}
              >
                POLICY
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "seller" ? "active" : ""}`}
                onClick={() => setActiveTab("seller")}
                style={{
                  backgroundColor: activeTab === "seller" ? "rgb(0, 162, 151)" : "transparent",
                  color: activeTab === "seller" ? "#FFF" : "#000",
                  borderRadius: "6px",
                  margin: "0 5px",
                  fontSize: '13px',
                  fontWeight: '500px'
                }}
              >
                SELLER
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "reviews" ? "active" : ""}`}
                onClick={() => setActiveTab("reviews")}
                style={{
                  backgroundColor: activeTab === "reviews" ? "rgb(0, 162, 151)" : "transparent",
                  color: activeTab === "reviews" ? "#FFF" : "#000",
                  borderRadius: "6px",
                  margin: "0 5px",
                  fontSize: '13px',
                  fontWeight: '500px'
                }}
              >
                REVIEW AND RATINGS
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "questions" ? "active" : ""}`}
                onClick={() => setActiveTab("questions")}
                style={{
                  backgroundColor: activeTab === "questions" ? "rgb(0, 162, 151)" : "transparent",
                  color: activeTab === "questions" ? "#FFF" : "#000",
                  borderRadius: "6px",
                  margin: "0 5px",
                  fontSize: '13px',
                  fontWeight: '500px'
                }}
              >
                QUESTIONS
              </button>
            </li>
          </ul>

          <div className="tab-content border p-4 bg-white shadow-sm">
            {activeTab === "details" && (
              <div
                className="ql-editor"
                dangerouslySetInnerHTML={{ __html: product?.description || "" }}
                style={{
                  paddingLeft: "20px",
                  marginBottom: "1rem",
                  lineHeight: "1.6",
                }}
              />
            )}
            {activeTab === "policy" && <div className="bg-light rounded p-3 shadow-sm">
              <h6 className="fw-bold">Delivery</h6>
              <p className="text-muted small">Fast delivery available in your area</p>
              <h6 className="fw-bold">Return Policy</h6>
              <p className="text-muted small">Free return within 7 days of delivery</p>
            </div>}
            {activeTab === "seller" && <p>Seller info will go here...</p>}
            {activeTab === "reviews" && (
              <>
                <h5 className="fw-bold mb-3">Customer Reviews</h5>
                {reviews.map((r) => (
                  <div key={r._id} className="border-bottom pb-3 mb-3">
                    <strong>{r.name}</strong>
                    <div className="d-flex align-items-center text-warning" style={{ gap: "2px" }}>
                      {renderStars(r.stars)}
                    </div>
                    <p className="mb-1">{r.comment}</p>

                    {/* Admin reply */}
                    {r.reply && (
                      <div className="mt-1 p-2 bg-light rounded">
                        <strong>Admin Reply:</strong>
                        <p className="mb-0">{r.reply}</p>
                      </div>
                    )}

                    <small className="text-muted">{new Date(r.createdAt).toLocaleDateString()}</small>
                  </div>
                ))}

                {/* Review Form */}
                <form onSubmit={handleReviewSubmit} className="mt-3">
                  <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="Your Name"
                    value={newReview.name}
                    onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                  />
                  <div className="mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        onClick={() => setNewReview({ ...newReview, stars: star })}
                        className={`me-1 fs-4 ${newReview.stars >= star ? "text-warning" : "text-secondary"}`}
                        style={{ cursor: "pointer" }}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <textarea
                    className="form-control mb-2"
                    placeholder="Write your review..."
                    rows="3"
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  ></textarea>
                  <button type="submit" className="btn btn-primary">Submit Review</button>
                </form>
              </>
            )}
            {activeTab === "questions" && <p>No questions yet. Be the first to ask!</p>}
          </div>
        </div>
        {/* SIMILAR PRODUCTS */}
        <div className="similar-products container my-5 bg-red">
          <h4 className="fw-bold mb-4">You might also like</h4>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: "15px",
            }}
          >
            {relatedProducts?.map((p) => {
              // Normalize related product data too
              const relatedProductNormalized = normalizeProductData(p);
              
              const mainPhoto = relatedProductNormalized.displayPhotos[0]?.url || 
                               relatedProductNormalized.displayPhotos[0] || 
                               "/default-image.jpg";
              
              return (
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
                  {/* Heart Button */}
                  <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "5px" }}>
                    <button
                      style={{
                        background: "#fff",
                        color: "#00a297",
                        borderRadius: "50%",
                        padding: "5px",
                        cursor: "pointer",
                        border: "none",
                      }}
                    >
                      <FaRegHeart />
                    </button>
                  </div>

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
                      src={mainPhoto}
                      alt={p.name}
                      style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
                    />
                  </div>

                  {/* Product Info */}
                  <div style={{ marginTop: "10px" }}>
                    <p style={{ fontWeight: "bold", fontSize: "14px", margin: 0 }}>
                      {p.name.length > 25 ? p.name.substring(0, 25) + "..." : p.name}
                    </p>

                    {/* Price & Add to Cart */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: "8px",
                      }}
                    >
                      <h6 style={{ color: "red", fontWeight: "bold", margin: 0 }}>
                        ৳ {relatedProductNormalized.displayPrice}
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
                          const existingCart = JSON.parse(localStorage.getItem("cart")) || [];
                          const alreadyInCart = existingCart.find((item) => item._id === p._id);
                          if (alreadyInCart) {
                            toast.error("Item already in cart");
                            return;
                          }
                          const newCart = [...existingCart, { 
                            ...p, 
                            price: relatedProductNormalized.displayPrice,
                            discountPrice: relatedProductNormalized.displayDiscountPrice,
                            quantity: 1 
                          }];
                          localStorage.setItem("cart", JSON.stringify(newCart));
                          setCart(newCart);
                          toast.success("Item added to cart");
                        }}
                      >
                        <IoCartOutline />
                      </div>
                    </div>

                    {/* Discount Badge */}
                    {relatedProductNormalized.displayDiscountPrice < relatedProductNormalized.displayPrice && 
                     relatedProductNormalized.displayDiscountPrice > 0 && (
                      <span
                        style={{
                          backgroundColor: "red",
                          color: "#fff",
                          fontSize: "12px",
                          padding: "2px 4px",
                          borderRadius: "4px",
                          marginTop: "5px",
                          display: "inline-block",
                        }}
                      >
                        {Math.round(((relatedProductNormalized.displayPrice - relatedProductNormalized.displayDiscountPrice) / 
                          relatedProductNormalized.displayPrice) * 100)}% OFF
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {relatedProducts?.length < 1 && <p>No Similar Products found</p>}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetails;