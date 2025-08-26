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
  const [rating, setRating] = useState(0); // dynamic rating
  const [reviews, setReviews] = useState([]); // dynamic reviews
  const [newReview, setNewReview] = useState({ name: "", stars: 0, comment: "" });

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
    if (product._id) {
      fetchReviews();
    }
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
        setReviews(data.reviews);        // update reviews
        setRating(data.averageRating);    // update average rating
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
      {/* PRODUCT DETAILS */}
      <div className="container py-4">
        <div className="row g-4">
          {/* LEFT IMAGE */}
          <div className="col-md-4 d-flex justify-content-center align-items-center bg-white rounded p-3 shadow-sm">
            <img
              src={`${API}/api/v1/product/product-photo/${product._id}`}
              alt={product.name}
              className="img-fluid rounded"
            />
          </div>

          {/* CENTER DETAILS */}
          <div className="col-md-5">
            <h2 className="fw-bold mb-3">{product.name}</h2>
            <div className="d-flex align-items-center gap-2 mb-2">
              {renderStars()} <span className="text-muted">{rating.toFixed(1)}</span>
              <span className="text-secondary">({reviews.length} reviews)</span>
            </div>
            <p className="text-muted">{product.description}</p>

            {/* Price */}
            <div className="h4 text-primary mb-3">
              {product?.price?.toLocaleString("en-US", { style: "currency", currency: "USD" })}
            </div>

            {/* Quantity Selector */}
            <div className="d-flex align-items-center mb-3">
              <span className="me-2">Quantity:</span>
              <button onClick={() => handleQuantityChange("dec")} className="btn btn-outline-secondary">-</button>
              <input type="text" value={quantity} readOnly className="form-control text-center mx-2" style={{ width: "60px" }} />
              <button onClick={() => handleQuantityChange("inc")} className="btn btn-outline-secondary">+</button>
            </div>

            {/* Stock */}
            <div className={`fw-medium mb-3 ${product.stock && product.stock <= 5 ? "text-danger" : "text-success"}`}>
              {product.stock && product.stock <= 5 ? <><FaFire /> Only {product.stock} left — order soon!</> : "In Stock"}
            </div>

            {/* Buttons */}
            <div className="d-flex gap-3">
              <button className="btn btn-primary px-4">Buy Now</button>
              <button
                className="btn btn-dark d-flex align-items-center gap-2 px-4"
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
          <div className="col-md-3 bg-light rounded p-3 shadow-sm">
            <h5 className="fw-bold">Delivery</h5>
            <p className="text-muted">Fast delivery available in your area</p>
            <h5 className="fw-bold">Return Policy</h5>
            <p className="text-muted">Free return within 7 days of delivery</p>
          </div>
        </div>
      </div>

      {/* CUSTOMER REVIEWS */}
      <div className="container my-5">
        <h3 className="section-title mb-4">Rating & Reviews</h3>
        <div className="row">
          {/* Left Side - Average Rating */}
          <div className="col-md-4 text-center border-end">
            <h1 className="display-3 fw-bold">{rating.toFixed(1)}</h1>
            <div className="d-flex justify-content-center mb-2">{renderStars(rating)}</div>
            <p className="text-muted">({reviews.length} Reviews)</p>

            {/* Star Breakdown */}
            {[5,4,3,2,1].map(star => {
              const count = reviews.filter(r => r.stars === star).length;
              const percent = (count / reviews.length) * 100 || 0;
              return (
                <div key={star} className="d-flex align-items-center mb-1">
                  <span className="me-2">{star} ★</span>
                  <div className="progress flex-grow-1" style={{ height: "6px" }}>
                    <div className="progress-bar bg-warning" style={{ width: `${percent}%` }}></div>
                  </div>
                  <span className="ms-2">{count}</span>
                </div>
              );
            })}
          </div>

          {/* Right Side - Reviews */}
          <div className="col-md-8 ps-4">
            {reviews.map((r, idx) => (
              <div key={idx} className="card mb-3 shadow-sm border-0">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div>
                      <strong>{r.name}</strong>
                      <div className="text-warning d-flex align-items-center mb-1">{renderStars(r.stars)}</div>
                    </div>
                    <small className="text-muted">{new Date(r.createdAt).toLocaleDateString()}</small>
                  </div>
                  <p className="mb-0">{r.comment}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Review Form */}
        <div className="bg-white p-4 rounded shadow-sm mt-4">
          <h5 className="fw-medium mb-3">Leave a Review</h5>
          <form onSubmit={handleReviewSubmit}>
            <input
              type="text"
              className="form-control mb-3"
              placeholder="Your Name"
              value={newReview.name}
              onChange={e => setNewReview({...newReview, name: e.target.value})}
              required
            />
            <div className="mb-3">
              {[1,2,3,4,5].map(star => (
                <span
                  key={star}
                  onClick={() => setNewReview({...newReview, stars: star})}
                  className={`me-1 fs-4 ${newReview.stars >= star ? "text-warning" : "text-secondary"}`}
                  style={{ cursor: "pointer" }}
                >
                  ★
                </span>
              ))}
            </div>
            <textarea
              className="form-control mb-3"
              placeholder="Write your review..."
              rows="4"
              value={newReview.comment}
              onChange={e => setNewReview({...newReview, comment: e.target.value})}
              required
            ></textarea>
            <button type="submit" className="btn btn-primary">Submit Review</button>
          </form>
        </div>
      </div>

      {/* SIMILAR PRODUCTS */}
      <div className="similar-products container my-5">
        <h3 className="section-title mb-4">You might also like</h3>
        <div className="row">
          {relatedProducts?.map(p => (
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
