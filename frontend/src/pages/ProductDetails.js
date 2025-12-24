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
import {
  FaFacebook,
  FaTwitter,
  FaWhatsapp,
  FaLinkedin,
  FaTelegram,
  FaShareAlt
} from "react-icons/fa";
import { RiShareForwardLine } from "react-icons/ri";
const ProductDetails = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [auth] = useAuth();
  const [product, setProduct] = useState({});
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [cart, setCart] = useCart();
  const API = process.env.REACT_APP_API;
  console.log("relatedProducts ", relatedProducts)
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
  const [showShareModal, setShowShareModal] = useState(false);

  // Share product function
  const shareProduct = (platform) => {
    const productUrl = window.location.href;
    const productName = encodeURIComponent(product.name || "Check out this amazing product!");
    const productDescription = encodeURIComponent(
      product.description
        ? product.description.replace(/<[^>]+>/g, '').substring(0, 100)
        : "Amazing product at best price!"
    );
    const productImage = images[0] || "/default-image.jpg";

    let shareUrl = "";

    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(productUrl)}&text=${productName}`;
        break;
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${productName}%20${encodeURIComponent(productUrl)}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(productUrl)}&title=${productName}&summary=${productDescription}`;
        break;
      case "telegram":
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(productUrl)}&text=${productName}`;
        break;
      case "copy":
        navigator.clipboard.writeText(productUrl)
          .then(() => toast.success("Link copied to clipboard!"))
          .catch(() => toast.error("Failed to copy link"));
        return;
      default:
        return;
    }

    // Open share window
    window.open(shareUrl, "_blank", "width=600,height=400");
    setShowShareModal(false);
  };

  // Web Share API (for mobile devices)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description
            ? product.description.replace(/<[^>]+>/g, '').substring(0, 100)
            : "Check out this amazing product!",
          url: window.location.href,
        });
        toast.success("Shared successfully!");
      } catch (error) {
        console.log("Sharing cancelled or failed:", error);
      }
    } else {
      // Fallback to custom share modal
      setShowShareModal(true);
    }
  };
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
  // getProduct ফাংশনে
  const getProduct = async () => {
    try {
      const { data } = await axios.get(`${API}/api/v1/product/get-product-variation/${params.slug}`);

      console.log("Full product data:", data.product);
      console.log("Categories array:", data.product?.categories);
      console.log("Category field:", data.product?.category);

      // Test: যদি categories array থাকে
      if (data.product?.categories?.[0]) {
        console.log("First category ID:", data.product.categories[0]._id || data.product.categories[0]);
        console.log("First category:", data.product.categories[0]);
      }

      setProduct(data?.product || {});
      setNormalizedProduct(normalizeProductData(data?.product || {}));

      // Test getSimilarProduct with different approaches
      if (data.product?._id) {
        // Approach 1: Try with categories[0]
        if (data.product.categories?.[0]) {
          const catId = data.product.categories[0]._id || data.product.categories[0];
          console.log("Testing with category ID:", catId);
          getSimilarProduct(data.product._id, catId);
        }
        // Approach 2: Try with category field
        else if (data.product.category) {
          const catId = data.product.category._id || data.product.category;
          console.log("Testing with category field:", catId);
          getSimilarProduct(data.product._id, catId);
        }
      }

    } catch (error) {
      console.log("Error fetching product:", error);
      toast.error("Failed to load product");
    }
  };
  // const getProduct = async () => {
  //   try {
  //     const { data } = await axios.get(`${API}/api/v1/product/get-product-variation/${params.slug}`);

  //     console.log("Raw product data:", data.product);
  //     console.log("Color images from API:", data.product?.colorImages);

  //     // Normalize the product data
  //     const normalized = normalizeProductData(data?.product || {});
  //     setProduct(data?.product || {});
  //     setNormalizedProduct(normalized);

  //     console.log("Normalized product:", normalized);

  //     // Get first category ID for similar products
  //     let categoryId;
  //     if (data?.product?.categories?.[0]?._id) {
  //       categoryId = data.product.categories[0]._id;
  //     } else if (data?.product?.categories?.[0]) {
  //       categoryId = data.product.categories[0];
  //     } else if (data?.product?.category?._id) {
  //       categoryId = data.product.category._id;
  //     } else if (data?.product?.category) {
  //       categoryId = data.product.category;
  //     }

  //     if (data?.product?._id && categoryId) {
  //       getSimilarProduct(data.product._id, categoryId);
  //     }
  //   } catch (error) {
  //     console.log("Error fetching product:", error);
  //     toast.error("Failed to load product");
  //   }
  // };

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

  // ProductDetails.js - getSimilarProduct ফাংশনটি এইভাবে পরিবর্তন করুন
  const getSimilarProduct = async (pid, cid) => {
    try {
      console.log("=== START getSimilarProduct ===");
      console.log("Product ID:", pid);
      console.log("Category ID:", cid);
      console.log("Category ID type:", typeof cid);
      console.log("Category ID value:", JSON.stringify(cid));

      // যদি cid undefined/null হয়
      if (!cid || cid === 'undefined' || cid === 'null') {
        console.log("Category ID is invalid, using fallback");

        // Fallback: শুধু recent products নিয়ে আসুন
        const { data } = await axios.get(
          `${API}/api/v1/product/product-list/1?limit=8`
        );

        console.log("Fallback response:", data);

        if (data?.products) {
          const filteredProducts = data.products.filter(p => p._id !== pid);
          console.log("Fallback products found:", filteredProducts.length);
          setRelatedProducts(filteredProducts);
        }
        return;
      }

      console.log(`Calling API: ${API}/api/v1/product/related-product/${pid}/${cid}`);

      const { data } = await axios.get(`${API}/api/v1/product/related-product/${pid}/${cid}`);

      console.log("API Response Status:", data?.success);
      console.log("API Response Data:", data);

      if (data?.success) {
        const products = data.products || [];
        console.log(`API returned ${products.length} products`);

        // Filter out current product
        const filteredProducts = products.filter(product => {
          return product._id !== pid;
        });

        console.log(`After filtering current product: ${filteredProducts.length} products`);

        // প্রতিটি প্রোডাক্টের ডাটা লগ করুন
        filteredProducts.forEach((p, idx) => {
          console.log(`Product ${idx + 1}:`, {
            id: p._id,
            name: p.name,
            hasDefaultPhotos: p.defaultPhotos?.length > 0,
            hasPhotos: p.photos?.length > 0,
            basePrice: p.basePrice,
            price: p.price,
            defaultPhotos: p.defaultPhotos,
            photos: p.photos
          });
        });

        setRelatedProducts(filteredProducts);
      } else {
        console.log("API returned success false");
        setRelatedProducts([]);
      }

      console.log("=== END getSimilarProduct ===");
    } catch (error) {
      console.log("=== ERROR in getSimilarProduct ===");
      console.log("Error message:", error.message);
      console.log("Error response:", error.response?.data);
      console.log("Error status:", error.response?.status);

      // Fallback
      try {
        const { data } = await axios.get(
          `${API}/api/v1/product/product-list/1?limit=8`
        );

        if (data?.products) {
          const filteredProducts = data.products.filter(p => p._id !== pid);
          console.log("Error fallback products:", filteredProducts.length);
          setRelatedProducts(filteredProducts);
        }
      } catch (fallbackError) {
        console.log("Fallback also failed:", fallbackError);
        setRelatedProducts([]);
      }
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
                <button
                  onClick={() => setShowShareModal(true)}
                  className="btn btn-outline-primary d-flex align-items-center gap-2 justify-content-center"
                  style={{
                    padding: "10px 20px",
                    // borderColor: "#00a297",
                    // color: "#00a297",
                    width: 'auto',
                    minWidth: '120px'
                  }}
                >
                  <RiShareForwardLine /> Share
                </button>
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
              <div>
                {product.videoUrl ? (
                  <>
                    <a
                      href={product.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
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
                      onMouseOver={(e) => e.target.style.backgroundColor = '#FF0000'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#FF0000'}
                    >
                      {/* Play Icon */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        style={{ flexShrink: 0 }}
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>

                    </a>
                  </>
                ) : null}
              </div>




            </div>
          </div>
        </div>
        {/* Share Button in Button Group */}

        {/* Social Share Quick Links (Optional - ছোট আইকন হিসেবে) */}
        <div>
          {/* <div className="mt-3 d-flex align-items-center gap-2">
              <span className="text-muted">Share on:</span>
              <div className="d-flex gap-2">
                <button
                  onClick={() => shareProduct("facebook")}
                  className="btn btn-sm p-1"
                  style={{ backgroundColor: "#1877F2", color: "white", width: "32px", height: "32px" }}
                  title="Share on Facebook"
                >
                  <FaFacebook />
                </button>
                <button
                  onClick={() => shareProduct("whatsapp")}
                  className="btn btn-sm p-1"
                  style={{ backgroundColor: "#25D366", color: "white", width: "32px", height: "32px" }}
                  title="Share on WhatsApp"
                >
                  <FaWhatsapp />
                </button>
                <button
                  onClick={() => shareProduct("twitter")}
                  className="btn btn-sm p-1"
                  style={{ backgroundColor: "#1DA1F2", color: "white", width: "32px", height: "32px" }}
                  title="Share on Twitter"
                >
                  <FaTwitter />
                </button>
                <button
                  onClick={() => shareProduct("copy")}
                  className="btn btn-sm p-1"
                  style={{ backgroundColor: "#6c757d", color: "white", width: "32px", height: "32px" }}
                  title="Copy Link"
                >
                  <FaShareAlt />
                </button>
              </div>
            </div> */}
          {/* Social Media Share Modal */}
       {showShareModal && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.85)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
      backdropFilter: "blur(3px)",
      transition: "all 0.3s ease",
    }}
    onClick={() => setShowShareModal(false)}
  >
    <div
      style={{
        backgroundColor: "white",
        padding: "30px",
        borderRadius: "16px",
        maxWidth: "450px",
        width: "90%",
        position: "relative",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
        transform: "scale(1)",
        animation: "modalAppear 0.3s ease-out",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Close Button */}
      <button
        onClick={() => setShowShareModal(false)}
        style={{
          position: "absolute",
          top: "-10px",
          right: "-10px",
          backgroundColor: "#ff4757",
          color: "white",
          border: "none",
          borderRadius: "50%",
          width: "32px",
          height: "32px",
          cursor: "pointer",
          fontSize: "18px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          boxShadow: "0 3px 10px rgba(255, 71, 87, 0.4)",
          transition: "all 0.2s",
          zIndex: 10,
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = "#ff3838";
          e.target.style.transform = "scale(1.1)";
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = "#ff4757";
          e.target.style.transform = "scale(1)";
        }}
      >
        ✕
      </button>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "25px" }}>
        <h5 style={{ 
          marginBottom: "8px", 
          color: "#00a297",
          fontWeight: "600",
          fontSize: "1.4rem"
        }}>
          Share this product
        </h5>
        <p style={{ 
          color: "#666",
          fontSize: "0.9rem",
          margin: 0
        }}>
          Share with your friends and family
        </p>
      </div>

      {/* Social Icons Grid */}
      <div className="row g-3" style={{ marginBottom: "25px" }}>
        {/* Facebook */}
        <div className="col-4 text-center">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <button
              onClick={() => shareProduct("facebook")}
              className="btn rounded-circle p-0 d-flex align-items-center justify-content-center"
              style={{ 
                width: "70px", 
                height: "70px", 
                fontSize: "26px",
                backgroundColor: "#1877F2",
                color: "white",
                border: "none",
                boxShadow: "0 4px 12px rgba(24, 119, 242, 0.3)",
                transition: "all 0.3s"
              }}
              title="Facebook"
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-5px)";
                e.target.style.boxShadow = "0 8px 20px rgba(24, 119, 242, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 12px rgba(24, 119, 242, 0.3)";
              }}
            >
              <FaFacebook />
            </button>
            <p className="mt-2 small" style={{ marginTop: "8px", color: "#333", fontWeight: "500" }}>Facebook</p>
          </div>
        </div>

        {/* WhatsApp */}
        <div className="col-4 text-center">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <button
              onClick={() => shareProduct("whatsapp")}
              className="btn rounded-circle p-0 d-flex align-items-center justify-content-center"
              style={{ 
                width: "70px", 
                height: "70px", 
                fontSize: "26px",
                backgroundColor: "#25D366",
                color: "white",
                border: "none",
                boxShadow: "0 4px 12px rgba(37, 211, 102, 0.3)",
                transition: "all 0.3s"
              }}
              title="WhatsApp"
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-5px)";
                e.target.style.boxShadow = "0 8px 20px rgba(37, 211, 102, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 12px rgba(37, 211, 102, 0.3)";
              }}
            >
              <FaWhatsapp />
            </button>
            <p className="mt-2 small" style={{ marginTop: "8px", color: "#333", fontWeight: "500" }}>WhatsApp</p>
          </div>
        </div>

        {/* Twitter */}
        <div className="col-4 text-center">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <button
              onClick={() => shareProduct("twitter")}
              className="btn rounded-circle p-0 d-flex align-items-center justify-content-center"
              style={{ 
                width: "70px", 
                height: "70px", 
                fontSize: "26px",
                backgroundColor: "#1DA1F2",
                color: "white",
                border: "none",
                boxShadow: "0 4px 12px rgba(29, 161, 242, 0.3)",
                transition: "all 0.3s"
              }}
              title="Twitter"
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-5px)";
                e.target.style.boxShadow = "0 8px 20px rgba(29, 161, 242, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 12px rgba(29, 161, 242, 0.3)";
              }}
            >
              <FaTwitter />
            </button>
            <p className="mt-2 small" style={{ marginTop: "8px", color: "#333", fontWeight: "500" }}>Twitter</p>
          </div>
        </div>

        {/* LinkedIn */}
        <div className="col-4 text-center">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <button
              onClick={() => shareProduct("linkedin")}
              className="btn rounded-circle p-0 d-flex align-items-center justify-content-center"
              style={{ 
                width: "70px", 
                height: "70px", 
                fontSize: "26px",
                backgroundColor: "#0077B5",
                color: "white",
                border: "none",
                boxShadow: "0 4px 12px rgba(0, 119, 181, 0.3)",
                transition: "all 0.3s"
              }}
              title="LinkedIn"
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-5px)";
                e.target.style.boxShadow = "0 8px 20px rgba(0, 119, 181, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 12px rgba(0, 119, 181, 0.3)";
              }}
            >
              <FaLinkedin />
            </button>
            <p className="mt-2 small" style={{ marginTop: "8px", color: "#333", fontWeight: "500" }}>LinkedIn</p>
          </div>
        </div>

        {/* Telegram */}
        <div className="col-4 text-center">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <button
              onClick={() => shareProduct("telegram")}
              className="btn rounded-circle p-0 d-flex align-items-center justify-content-center"
              style={{ 
                width: "70px", 
                height: "70px", 
                fontSize: "26px",
                backgroundColor: "#0088cc",
                color: "white",
                border: "none",
                boxShadow: "0 4px 12px rgba(0, 136, 204, 0.3)",
                transition: "all 0.3s"
              }}
              title="Telegram"
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-5px)";
                e.target.style.boxShadow = "0 8px 20px rgba(0, 136, 204, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 12px rgba(0, 136, 204, 0.3)";
              }}
            >
              <FaTelegram />
            </button>
            <p className="mt-2 small" style={{ marginTop: "8px", color: "#333", fontWeight: "500" }}>Telegram</p>
          </div>
        </div>

        {/* Copy Link */}
        <div className="col-4 text-center">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <button
              onClick={() => shareProduct("copy")}
              className="btn rounded-circle p-0 d-flex align-items-center justify-content-center"
              style={{ 
                width: "70px", 
                height: "70px", 
                fontSize: "26px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                boxShadow: "0 4px 12px rgba(108, 117, 125, 0.3)",
                transition: "all 0.3s"
              }}
              title="Copy Link"
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-5px)";
                e.target.style.boxShadow = "0 8px 20px rgba(108, 117, 125, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 12px rgba(108, 117, 125, 0.3)";
              }}
            >
              <FaShareAlt />
            </button>
            <p className="mt-2 small" style={{ marginTop: "8px", color: "#333", fontWeight: "500" }}>Copy Link</p>
          </div>
        </div>
      </div>

      {/* Share URL Preview */}
      <div className="mt-4">
        <label className="form-label small text-muted" style={{ fontWeight: "500" }}>Product Link:</label>
        <div className="input-group" style={{ borderRadius: "8px", overflow: "hidden" }}>
          <input
            type="text"
            className="form-control form-control-sm"
            value={window.location.href}
            readOnly
            style={{
              border: "1px solid #ddd",
              padding: "10px 15px",
              fontSize: "0.9rem"
            }}
          />
          <button
            onClick={() => shareProduct("copy")}
            className="btn btn-outline-secondary btn-sm"
            type="button"
            style={{
              backgroundColor: "#00a297",
              color: "white",
              border: "none",
              padding: "10px 20px",
              fontWeight: "500",
              transition: "all 0.3s"
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#00887e";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#00a297";
            }}
          >
            Copy
          </button>
        </div>
        <p className="small text-muted mt-2" style={{ fontSize: "0.8rem", textAlign: "center" }}>
          Click the button above or any icon to share
        </p>
      </div>
    </div>
  </div>
)}
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
        {/* SIMILAR PRODUCTS */}
        {/* SIMPLIFIED VERSION */}
        {/* SIMILAR PRODUCTS - Shop পেজের মতো একই logic ব্যবহার করুন */}
        <div className="similar-products container my-5">
          <h4 className="fw-bold mb-4">You might also like</h4>

          <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-3">
            {relatedProducts?.map((p) => {
              // ✅ Shop পেজের getDisplayPrice ফাংশন copy করুন
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

                // Then old photos array
                if (product.photos && product.photos.length > 0) {
                  return product.photos[0]?.url;
                }

                // Fallback
                return "/default-image.jpg";
              };

              const displayPrice = getDisplayPrice(p);
              const imageSrc = getProductImage(p);

              return (
                <div key={p._id} className="col">
                  <div className="card h-100 border-0 shadow-sm">
                    {/* Image */}
                    <div
                      className="position-relative overflow-hidden bg-light"
                      style={{ height: "150px", cursor: "pointer" }}
                      onClick={() => navigate(`/product/${p.slug}`)}
                    >
                      <img
                        src={imageSrc}
                        alt={p.name}
                        className="w-100 h-100 object-fit-contain p-2"
                        style={{ objectFit: 'contain' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/default-image.jpg";
                        }}
                      />
                    </div>

                    {/* Info */}
                    <div className="card-body p-2 d-flex flex-column">
                      {/* Name */}
                      <p className="card-title fw-bold mb-1 flex-grow-1" style={{ fontSize: "13px" }}>
                        {p.name?.length > 30 ? p.name.substring(0, 30) + "..." : p.name}
                      </p>

                      {/* Price - EXACTLY SAME AS SHOP PAGE */}
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

                      {/* Add to Cart */}
                      <button
                        className="btn btn-sm w-100 mt-auto"
                        style={{
                          backgroundColor: "#00a297",
                          color: "white",
                          fontSize: "12px",
                          padding: "4px",
                          border: 'none'
                        }}
                        onClick={() => {
                          if (displayPrice.price === 0) {
                            toast.error("This product is currently unavailable");
                            return;
                          }

                          const existingCart = JSON.parse(localStorage.getItem("cart")) || [];
                          const alreadyInCart = existingCart.find((item) => item._id === p._id);

                          if (alreadyInCart) {
                            toast.error("Item already in cart");
                            return;
                          }

                          const cartItem = {
                            _id: p._id,
                            name: p.name,
                            price: displayPrice.price,
                            discountPrice: displayPrice.discountPrice,
                            quantity: 1,
                            image: imageSrc,
                            uniqueId: Date.now() + Math.random(),
                            slug: p.slug
                          };

                          const newCart = [...existingCart, cartItem];
                          localStorage.setItem("cart", JSON.stringify(newCart));
                          setCart(newCart);
                          toast.success("Item added to cart");
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
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetails;