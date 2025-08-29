import React, { useState, useEffect } from "react";
import Layout from "./../components/Layout/Layout";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { FaStar, FaRegStar, FaStarHalfAlt, FaFire } from "react-icons/fa";
import { IoCartOutline } from "react-icons/io5";
import { useCart } from "../context/cart";
import toast from "react-hot-toast";
import "../styles/ProductDetailsStyles.css";

const ProductDetails = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState({});
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [cart, setCart] = useCart();
  const API = process.env.REACT_APP_API;
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  console.log("Product list",product)
  // States
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ name: "", stars: 0, comment: "" });
  const [activeTab, setActiveTab] = useState("details");
  const [selectedImage, setSelectedImage] = useState("");
  const [images, setImages] = useState([]);

  useEffect(() => {
    if (product._id) {
      const imgs = product.photos?.length
        ? product.photos.map((_, index) =>
          `${API}/api/v1/product/product-photo/${product._id}?index=${index}`
        )
        : [`${API}/api/v1/product/product-photo/${product._id}`];

      setImages(imgs);
      setSelectedImage(imgs[0]);
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
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newReview.name || !newReview.stars || !newReview.comment) {
      toast.error("Please fill out all fields");
      return;
    }
    try {
      const { data } = await axios.post(`${API}/api/v1/reviews/${product._id}`, newReview);
      if (data.success) {
        setReviews(data.reviews);
        setRating(data.averageRating);
        setNewReview({ name: "", stars: 0, comment: "" });
        toast.success("Review submitted!");
      }
    } catch (error) {
      console.log("Error submitting review:", error);
      toast.error("Failed to submit review");
    }
  };

  return (
    <Layout>
      <div className="container py-4 bg-white">
        <div className="row g-4">
          {/* LEFT IMAGE GALLERY */}
          {/* LEFT IMAGE GALLERY */}
          <div className="col-md-5">
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
          <div className="col-md-6">
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

        
            <h4 className="text-danger fw-bold mb-3">
              ৳ {product.price}
              {product.oldPrice && (
                <small className="text-muted text-decoration-line-through ms-2">৳ {product.oldPrice}</small>
              )}
              {product.discount && <span className="badge bg-danger ms-2">{product.discount}% OFF</span>}
            </h4>
       {/* Stock */}
            <div className={`fw-medium mb-3 ${product.stock && product.stock <= 5 ? "text-danger" : "text-success"}`}>
              {product.stock && product.stock <= 5 ? <><FaFire /> Only {product.stock} left — order soon!</> : "In Stock"}
            </div>
    </div>
          

            {/* Optional brand/color/size */}
            {/* Color Selector */}
            {product.color && (
              <div className="mb-3">
                <strong>Color:</strong>
                <div className="d-flex gap-2 mt-1">
                  {product.color.map((c, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedColor(c)}
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                        backgroundColor: c,
                        cursor: "pointer",
                        border: selectedColor === c ? "2px solid red" : "1px solid #ccc",
                        transition: "0.2s",
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            )}

            {/* Brand Selector */}
            {product.brand && (
              <div className="mb-3 d-flex">
                <strong style={{marginRight:'15px'}} >Brand:</strong>
                <div className="d-flex gap-2 mt-1">
                  {product.brand.map((b, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedBrand(b)}
                      className={`btn btn-outline-secondary btn-sm`}
                      style={{
                        borderColor: selectedBrand === b ? "red" : "#ccc",
                        backgroundColor: selectedBrand === b ? "#ffe6e6" : "#fff",
                      }}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {product.size && (
              <div className="mb-3 d-flex">
                <strong style={{marginRight:'15px'}}>Size:</strong>
                <div className="d-flex gap-2 mt-1 ">
                  {product.size.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedSize(s)}
                      className={`btn btn-outline-secondary btn-sm`}
                      style={{
                        borderColor: selectedSize === s ? "red" : "#ccc",
                        backgroundColor: selectedSize === s ? "#ffe6e6" : "#fff",
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
              <button className="btn btn-danger px-4">Buy Now</button>
              <button
                className="btn btn-outline-dark px-4 d-flex align-items-center gap-2"
                onClick={() => {
                  setCart([...cart, product]);
                  localStorage.setItem("cart", JSON.stringify([...cart, product]));
                  toast.success("Item added to cart");
                }}
              >
                <IoCartOutline /> Add to Cart
              </button>
            </div>
          </div>

          {/* RIGHT DELIVERY INFO */}

        </div>
             {/* TABS SECTION */}
      <div className="container mt-5">
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <button className={`nav-link ${activeTab === "details" ? "active" : ""}`} onClick={() => setActiveTab("details")}>Product Details</button>
          </li>
          <li className="nav-item">
            <button className={`nav-link ${activeTab === "policy" ? "active" : ""}`} onClick={() => setActiveTab("policy")}>Policy</button>
          </li>
          <li className="nav-item">
            <button className={`nav-link ${activeTab === "seller" ? "active" : ""}`} onClick={() => setActiveTab("seller")}>Seller</button>
          </li>
          <li className="nav-item">
            <button className={`nav-link ${activeTab === "reviews" ? "active" : ""}`} onClick={() => setActiveTab("reviews")}>Reviews</button>
          </li>
          <li className="nav-item">
            <button className={`nav-link ${activeTab === "questions" ? "active" : ""}`} onClick={() => setActiveTab("questions")}>Questions</button>
          </li>
        </ul>

        <div className="tab-content border p-4 bg-white shadow-sm">
          {activeTab === "details" && <p>{product.description}</p>}
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
              {reviews.map((r, idx) => (
                <div key={idx} className="border-bottom pb-3 mb-3">
                  <strong>{r.name}</strong>
                  <div className="text-warning">{renderStars(r.stars)}</div>
                  <p className="mb-1">{r.comment}</p>
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
      <div className="similar-products container my-5">
        <h4 className="fw-bold mb-4">You might also like</h4>
        <div className="row">
          {relatedProducts?.map((p) => (
            <div key={p._id} className="col-6 col-md-3 mb-4">
              <div className="card h-100 shadow-sm border-0" onClick={() => navigate(`/product/${p.slug}`)}>
                <img src={`${API}/api/v1/product/product-photo/${p._id}`} className="card-img-top" alt={p.name} />
                <div className="card-body text-center">
                  <h6 className="fw-semibold">{p.name}</h6>
                  <div className="text-warning small">{renderStars(p.rating || 4)}</div>
                  <p className="fw-bold mb-1">৳ {p.price}</p>
                  {p.oldPrice && <p className="text-muted text-decoration-line-through small">৳ {p.oldPrice}</p>}
                  {p.discount && <span className="badge bg-danger">{p.discount}% OFF</span>}
                </div>
              </div>
            </div>
          ))}
          {relatedProducts.length < 1 && <p>No Similar Products found</p>}
        </div>
      </div>
      </div>

 


    </Layout>
  );
};

export default ProductDetails;
