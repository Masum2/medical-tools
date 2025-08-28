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

  // States
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ name: "", stars: 0, comment: "" });
  const [activeTab, setActiveTab] = useState("details");

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
      <div className="container py-4">
        <div className="row g-4">
          {/* LEFT IMAGE GALLERY */}
          <div className="col-md-4">
            <div className="bg-white rounded shadow-sm p-3">
              <img
                src={`${API}/api/v1/product/product-photo/${product._id}`}
                alt={product.name}
                className="img-fluid mb-3 rounded"
              />
              <div className="d-flex gap-2 justify-content-center">
                {/* Placeholder thumbnails */}
                {[1, 2, 3].map((t) => (
                  <img
                    key={t}
                    src={`${API}/api/v1/product/product-photo/${product._id}`}
                    alt="thumb"
                    className="img-thumbnail"
                    style={{ width: "70px", height: "70px", objectFit: "cover" }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* CENTER DETAILS */}
          <div className="col-md-5">
            <h3 className="fw-bold mb-2">{product.name}</h3>
            <div className="d-flex align-items-center gap-2 mb-2">
              {renderStars()} <span className="text-muted">{rating.toFixed(1)}</span>
              <span className="text-secondary">({reviews.length} reviews)</span>
            </div>
            <h4 className="text-danger fw-bold mb-3">
              ৳ {product.price}
              {product.oldPrice && (
                <small className="text-muted text-decoration-line-through ms-2">৳ {product.oldPrice}</small>
              )}
              {product.discount && <span className="badge bg-danger ms-2">{product.discount}% OFF</span>}
            </h4>

            <p className="text-muted">{product.description}</p>

            {/* Quantity Selector */}
            <div className="d-flex align-items-center mb-3">
              <span className="me-2">Quantity:</span>
              <button onClick={() => handleQuantityChange("dec")} className="btn btn-outline-secondary btn-sm">-</button>
              <input type="text" value={quantity} readOnly className="form-control text-center mx-2" style={{ width: "60px" }} />
              <button onClick={() => handleQuantityChange("inc")} className="btn btn-outline-secondary btn-sm">+</button>
            </div>

            {/* Stock */}
            <div className={`fw-medium mb-3 ${product.stock && product.stock <= 5 ? "text-danger" : "text-success"}`}>
              {product.stock && product.stock <= 5 ? <><FaFire /> Only {product.stock} left — order soon!</> : "In Stock"}
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
          <div className="col-md-3">
            <div className="bg-light rounded p-3 shadow-sm">
              <h6 className="fw-bold">Delivery</h6>
              <p className="text-muted small">Fast delivery available in your area</p>
              <h6 className="fw-bold">Return Policy</h6>
              <p className="text-muted small">Free return within 7 days of delivery</p>
            </div>
          </div>
        </div>
      </div>

      {/* TABS SECTION */}
      <div className="container mt-5">
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <button className={`nav-link ${activeTab === "details" ? "active" : ""}`} onClick={() => setActiveTab("details")}>Product Details</button>
          </li>
          <li className="nav-item">
            <button className={`nav-link ${activeTab === "specs" ? "active" : ""}`} onClick={() => setActiveTab("specs")}>Specifications</button>
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
          {activeTab === "specs" && <p>Specifications will go here...</p>}
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
    </Layout>
  );
};

export default ProductDetails;
