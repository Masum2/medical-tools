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
const ProductDetails = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [auth] = useAuth();
  const [product, setProduct] = useState({});
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [cart, setCart] = useCart();
  const API = process.env.REACT_APP_API;
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  console.log("Product list", product)
  // States
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ name: "", stars: 0, comment: "" });
  const [activeTab, setActiveTab] = useState("details");
  const [selectedImage, setSelectedImage] = useState("");
  const [images, setImages] = useState([]);
  const [photosByColor, setPhotosByColor] = useState({});
  // useEffect(() => {
  //   if (product._id) {
  //     const imgs = product.photos?.length
  //       ? product.photos.map((_, index) =>
  //         `${API}/api/v1/product/product-photo/${product._id}?index=${index}`
  //       )
  //       : [`${API}/api/v1/product/product-photo/${product._id}`];

  //     setImages(imgs);
  //     setSelectedImage(imgs[0]);
  //   }
  // }, [product]);

  // useEffect(() => {
  //   if (product._id) {
  //     const imgs = product.photos?.length
  //       ? product.photos.map((_, index) =>
  //           `${API}/api/v1/product/product-photo/${product._id}?index=${index}`
  //         )
  //       : [`${API}/api/v1/product/product-photo/${product._id}`];

  //     setImages(imgs);
  //     setSelectedImage(imgs[0]);

  //     // ✅ Color অনুযায়ী image auto assign
  //     if (product.color?.length > 0) {
  //       const mapping = {};
  //       product.color.forEach((c, idx) => {
  //         mapping[c] = [imgs[idx] || imgs[0]]; // না থাকলে fallback প্রথম image
  //       });
  //       setPhotosByColor(mapping);
  //     }
  //   }
  // }, [product]);

  useEffect(() => {
    if (product._id) {
      const imgs = product.photos?.map(photo => photo.url) || [];
      setImages(imgs);
      setSelectedImage(imgs[0]);

      if (product.color?.length > 0) {
        const mapping = {};
        product.color.forEach((c, idx) => {
          mapping[c] = [imgs[idx] || imgs[0]]; // fallback to first image
        });
        setPhotosByColor(mapping);
      }
    }
  }, [product]);
  // Fetch product
  useEffect(() => {
    if (params?.slug) getProduct();
  }, [params?.slug]);

  const getProduct = async () => {
    try {
      const { data } = await axios.get(`${API}/api/v1/product/get-product/${params.slug}`);
      setProduct(data?.product);
      getSimilarProduct(data?.product._id, data?.product.category._id);

    } catch (error) {
      console.log(error);
    }
  };

  const getSimilarProduct = async (pid, cid) => {
    try {
      const { data } = await axios.get(`${API}/api/v1/product/related-product/${pid}/${cid}`);
      setRelatedProducts(data?.products);
    } catch (error) {
      console.log(error);
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
        setReviews(data.reviews);
        setRating(data.averageRating);
      }
    } catch (error) {
      console.log("Error fetching reviews:", error);
    }
  };

  // Quantity handler
  const handleQuantityChange = (type) => {
    if (type === "inc") setQuantity(quantity + 1);
    else if (quantity > 1) setQuantity(quantity - 1);
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
            Authorization: auth?.token, // ✅ token must be sent
          },
        }
      );

      if (data.success) {
        setReviews(data.reviews); // update reviews in UI
        setRating(data.averageRating); // update rating
        setNewReview({ stars: 0, comment: "" }); // reset form
        toast.success(data.message);
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review");
    }
  };



  return (
    <Layout>
      <div className="container py-4 bg-white">
        {/* Breadcrumb */}
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
          }}
        >
          <p
            style={{ margin: 0, cursor: "pointer", color: "#00a297" }}
            onClick={() => navigate("/")}
          >
            Home
          </p>
          <FaAngleRight />

          {/* Category */}
          {product?.category && (
            <>
              <p
                style={{ margin: 0, cursor: "pointer", color: "#00a297" }}
                onClick={() => navigate(`/category/${product.category.slug}`)}
              >
                {product.category.name}
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
                    onClick={() => navigate(`/subcategory/${sub}`)} // অথবা slug থাকলে `/subcategory/${sub.slug}`
                  >
                    {sub}
                  </p>
                  {idx < product.subcategories.length - 1 && <FaAngleRight />}
                </React.Fragment>
              ))}
            </>
          )}

          {/* Product Name */}
          <FaAngleRight />
          {/* <p style={{ margin: 0 }}>{product?.name}</p> */}
          <p style={{ margin: 0 }}>
            {product?.name?.length > 60
              ? product.name.substring(0, 60) + "..."
              : product?.name || ""}
          </p>

        </div>

        <div className="row g-4">
          {/* LEFT IMAGE GALLERY */}
          {/* LEFT IMAGE GALLERY */}
          <div className="col-md-5 px-4">
            <div className="bg-white rounded shadow-sm p-3 text-center">
              {/* Main Image with Zoom */}
              <div className="position-relative">
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="img-fluid mb-3 rounded main-image"
                  style={{
                    maxHeight: "400px",
                    objectFit: "contain",
                    transition: "transform 0.3s ease",
                    cursor: "zoom-in",
                  }}
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                    const y = ((e.clientY - rect.top) / rect.height) * 100;
                    e.currentTarget.style.transformOrigin = `${x}% ${y}%`;
                    e.currentTarget.style.transform = "scale(1.8)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                />
              </div>

              {/* Thumbnails */}
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
            </div>
          </div>


          {/* CENTER DETAILS */}
          <div className="col-md-6 px-4">
            <h3 className="fw-bold mb-2">{product.name}</h3>

            {/* Rating */}
            <div className="d-flex justify-content-between ">
              <div className="d-flex align-items-center gap-2 mb-2">
                {renderStars()} <span className="text-muted">{rating.toFixed(1)}</span>
                <span className="text-secondary">({reviews.length} reviews)</span>
              </div>
              <div>
                <p>Free shipping</p>
              </div>
            </div>


            {/* Price */}
            <div className="d-flex justify-content-between">

              <h4 className="fw-bold mb-3">
                {product.discountPrice && product.discountPrice > 0 ? (
                  <>
                    {/* Discounted Price */}
                    <span className="text-danger me-2">
                      ৳ {product.discountPrice}
                    </span>

                    {/* Original Price (Strike-through) */}
                    <small className="text-muted text-decoration-line-through">
                      ৳ {product.price}
                    </small>

                    {/* Discount Badge */}
                    <span className="badge bg-danger ms-2">
                      {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
                    </span>
                  </>
                ) : (
                  /* No discount */
                  <span className="text-danger me-2">৳ {product.price}</span>
                )}
              </h4>






              {/* Stock */}
              <div className={`fw-medium mb-3 ${product.stock && product.stock <= 5 ? "text-danger" : "text-success"}`}>
                {product.stock && product.stock <= 5 ? <><FaFire /> Only {product.stock} left — order soon!</> : "In Stock"}
              </div>
            </div>


            {/* Optional brand/color/size */}
            {/* Color Selector */}
            {/* Color Selector */}



            {/* Brand Selector */}
            {/* Brand Selector */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                {product.color && (
                  <div className="mb-3">
                    <strong>Color:</strong>
                    <div className="d-flex gap-3 mt-2 flex-wrap">
                      {product.color?.map((c, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setSelectedColor(c);
                            if (photosByColor[c]) {
                              setSelectedImage(photosByColor[c][0]);
                            }
                          }}
                          style={{
                            border: selectedColor
                              ? selectedColor === c
                                ? `2px solid ${c}`
                                : "1px solid #ccc"
                              : idx === 0
                                ? `2px solid ${c}`
                                : "1px solid #ccc",
                            borderRadius: "6px",
                            padding: "2px",
                            display: "inline-block",
                            cursor: "pointer",
                          }}
                        >
                          <img
                            src={photosByColor?.[c]?.[0] || images[0]}
                            alt={c}
                            style={{
                              width: "45px",
                              height: "40px",
                              objectFit: "cover",
                              borderRadius: "4px",
                              marginBottom: "5px",
                            }}
                          />
                          <p style={{ textAlign: "center", fontSize: "11px", fontWeight: "bold" }}>{c}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div>
                {product.brand && (
                  <div className="mb-3 d-flex flex-wrap">
                    <strong className="d-flex justfy-content-center align-items-center mx-3">Brand:</strong>
                    <div className="d-flex gap-2 mt-1 flex-wrap">
                      {product.brand.map((b, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedBrand(b)}
                          className="btn btn-sm"
                          style={{
                            border: "1px solid #ccc",
                            backgroundColor: selectedBrand === b ? "black" : "white",
                            color: selectedBrand === b ? "white" : "black",
                            fontWeight: "500",
                          }}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {/* brand */}

            </div>


            {/* Size Selector */}
            {product.size && (
              <div className="mb-3 d-flex flex-wrap">
                <strong className="d-flex justfy-content-center align-items-center mx-3">Size:</strong>
                <div className="d-flex gap-2 mt-1 flex-wrap">
                  {product.size.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedSize(s)}
                      className="btn btn-sm"
                      style={{
                        border: "1px solid #ccc",
                        backgroundColor: selectedSize === s ? "black" : "white",
                        color: selectedSize === s ? "white" : "black",
                        fontWeight: "500",
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="d-flex align-items-center mb-3">
              <span className="me-2">Quantity:</span>
              <button onClick={() => handleQuantityChange("dec")} className="btn btn-outline-secondary btn-sm">-</button>
              <input type="text" value={quantity} readOnly className="form-control text-center mx-2" style={{ width: "60px" }} />
              <button onClick={() => handleQuantityChange("inc")} className="btn btn-outline-secondary btn-sm">+</button>
            </div>



            {/* Buttons */}
            <div className="d-flex gap-3">
              <button className="btn  px-4 d-flex align-items-center gap-2 justify-content-center"
                style={{ backgroundColor: '#F77E1B', color: '#FFF', width: '200px', textAlign: 'center' }}
                onClick={() => {
                  const existingCart = JSON.parse(localStorage.getItem("cart")) || [];

                  const cartItem = {
                    _id: product._id,
                    name: product.name,
                    price: product.price,
                    discountPrice: product.discountPrice,
                    color: selectedColor,
                    brand: selectedBrand,
                    size: selectedSize,
                    quantity: quantity,      // User select করা quantity
                    stock: product.quantity, // Admin থেকে আসা stock
                    image: images[0],
                  };

                  // চেক করবো product আগে থেকেই cart এ আছে কিনা
                  const found = existingCart.find((item) => item._id === product._id);

                  if (found) {
                    toast.error("Already added to cart"); // আগেই থাকলে error message
                  } else {
                    existingCart.push(cartItem); // নতুন হলে push হবে
                    setCart(existingCart);
                    localStorage.setItem("cart", JSON.stringify(existingCart));
                    toast.success("Item added to cart");
                    navigate(auth?.token ? "/checkout" : "/login")
                  }
                }}

              >Buy Now</button>
              {/* <button
                className="btn  px-4 d-flex align-items-center gap-2 justify-content-center"
                onClick={() => {
                  setCart([...cart, product]);
                  localStorage.setItem("cart", JSON.stringify([...cart, product]));
                  toast.success("Item added to cart");
                }}
                style={{backgroundColor:'rgb(0, 162, 151)',color:'#FFF', width:'200px',textAlign:'center'}}
              >
                <IoCartOutline /> Add to Cart
              </button> */}
              {/* <button
                className="btn px-4 d-flex align-items-center gap-2 justify-content-center"
                style={{ backgroundColor: "rgb(0, 162, 151)", color: "#FFF", width: "200px", textAlign: "center" }}
                onClick={() => {
                  const existingCart = JSON.parse(localStorage.getItem("cart")) || [];

                  const cartItem = {
                    _id: product._id,
                    name: product.name,
                    price: product.price,
                    discountPrice: product.discountPrice,
                    color: selectedColor,
                    brand: selectedBrand,
                    size: selectedSize,
                    quantity: quantity,      // User select করা quantity
                    stock: product.quantity, // Admin থেকে আসা stock
                    // image: images[0],
                    image: selectedImage || images[0], // ✅ selected color অনুযায়ী image save হবে

                  };

                  // চেক করবো product আগে থেকেই cart এ আছে কিনা
                  const found = existingCart.find((item) => item._id === product._id);

                  if (found) {
                    toast.error("Already added to cart"); // আগেই থাকলে error message
                  } else {
                    existingCart.push(cartItem); // নতুন হলে push হবে
                    setCart(existingCart);
                    localStorage.setItem("cart", JSON.stringify(existingCart));
                    toast.success("Item added to cart");
                  }
                }}
              >
                Add to Cart
              </button> */}
<button
  className="btn px-4 d-flex align-items-center gap-2 justify-content-center"
  style={{ backgroundColor: "rgb(0, 162, 151)", color: "#FFF", width: "200px", textAlign: "center" }}
  onClick={() => {
    const existingCart = JSON.parse(localStorage.getItem("cart")) || [];

    // uniqueId helps to treat different variants as separate cart items
    const cartItem = {
      _id: product._id,
      name: product.name,
      price: product.price,
      discountPrice: product.discountPrice,
      color: selectedColor || "Default",
      brand: selectedBrand || "Default",
      size: selectedSize || "Default",
      quantity: quantity,
      stock: product.quantity,
      image: selectedImage || images[0],
      uniqueId: Date.now() + Math.random(), // ✅ makes each added item unique
    };

    // Allow multiple variants — no duplicate restriction
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
                REEVIEW AND RATINGS
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
            {relatedProducts?.map((p) => (
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
                    // src={`${API}/api/v1/product/product-photo/${p._id}`}
                    src={p.photos?.[0]?.url}
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
                      ৳ {p.price}
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
                        const newCart = [...existingCart, { ...p, quantity: 1 }];
                        localStorage.setItem("cart", JSON.stringify(newCart));
                        setCart(newCart);
                        toast.success("Item added to cart");
                      }}
                    >
                      <IoCartOutline />
                    </div>
                  </div>

                  {/* Discount Badge */}
                  {p.discount && (
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
                      {p.discount}% OFF
                    </span>
                  )}
                </div>
              </div>
            ))}

            {relatedProducts?.length < 1 && <p>No Similar Products found</p>}
          </div>

        </div>
      </div>




    </Layout>
  );
};

export default ProductDetails;
