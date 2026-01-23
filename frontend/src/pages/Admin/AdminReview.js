import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import AdminMenu from "../../components/Layout/AdminMenu";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/auth";
import toast from "react-hot-toast";

const AdminReview = () => {
  const [auth] = useAuth();
  const [products, setProducts] = useState([]);
  const [replyText, setReplyText] = useState({});
  const API = process.env.REACT_APP_API;

const fetchProducts = useCallback(async () => {
  try {
    const { data } = await axios.get(`${API}/api/v1/product/get-product`, {
      headers: { Authorization: auth?.token },
    });
    setProducts((data.products || []).filter(p => p.reviews.length > 0));
  } catch (error) {
    console.error(error);
    toast.error("Failed to fetch products");
  }
}, [API, auth?.token]);

useEffect(() => {
  if (API && auth?.token) {
    fetchProducts();
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [fetchProducts]);



  const handleReplySubmit = async (productId, reviewId) => {
    if (!replyText[reviewId]) {
      toast.error("Please write a reply");
      return;
    }

    try {
      const { data } = await axios.post(
        `${API}/api/v1/reviews/${productId}/review/${reviewId}/reply`,
        { reply: replyText[reviewId] },
        { headers: { Authorization: auth?.token } }
      );

      if (data.success) {
        toast.success(data.message);
        setReplyText({ ...replyText, [reviewId]: "" });
        fetchProducts();
      }
    } catch (error) {
      console.error("Error submitting reply:", error);
      toast.error("Failed to submit reply");
    }
  };

  return (
    <div className="container-fluid p-0">
      <div className="row g-0">
        {/* Sidebar */}
        <div
          className="col-12 col-md-3 col-lg-2 p-0 border-end"
          style={{ minHeight: "100vh" }}
        >
          <AdminMenu />
        </div>

        {/* Main Content */}
        <div
          className="col-12 col-md-9 col-lg-10"
          style={{ backgroundColor: "#f4f5f7", minHeight: "100vh" }}
        >
          {/* Header */}
          <div
            className="d-flex align-items-center px-4 py-3 text-white shadow-sm"
            style={{ background: "#001219", position: "sticky", top: 0, zIndex: 10 }}
          >
            <NavLink
              to="/"
              className="text-white fw-bold"
              style={{ fontSize: "20px", textDecoration: "none" }}
            >
              All Reviews & Ratings
            </NavLink>
          </div>

          <div className="p-4">
            <h2 className="mb-4">Product Reviews</h2>

            {products.length === 0 && (
              <p className="text-muted">No products with reviews found.</p>
            )}

            {products.map((product) => (
              <div
                key={product._id}
                className="mb-5 p-4 rounded shadow bg-white"
              >
                {/* Product header */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="mb-0">{product.name}</h4>
                  <span className="badge bg-dark">
                    ⭐ {product.averageRating.toFixed(1)} / 5
                  </span>
                </div>

                {/* Reviews */}
                {product.reviews.map((r) => (
                  <div key={r._id} className="mb-4">
                    <div className="chat-box p-3 rounded bg-light shadow-sm">
                      {/* User message */}
                      <div className="d-flex flex-column mb-2">
                        <div className="align-self-start p-3 rounded-3 bg-white border shadow-sm" style={{ maxWidth: "75%" }}>
                          <div className="d-flex justify-content-between">
                            <strong>{r.name}</strong>
                            <span className="badge bg-warning text-dark">{r.stars} ★</span>
                          </div>
                          <p className="mb-1">{r.comment}</p>
                          <small className="text-muted">
                            {new Date(r.createdAt).toLocaleDateString()}
                          </small>
                        </div>
                      </div>

                      {/* Admin reply */}
                      {r.reply && (
                        <div className="d-flex flex-column align-items-end mb-2">
                          <div
                            className="align-self-end p-3 rounded-3 text-white shadow-sm"
                            style={{ backgroundColor: "#001219", maxWidth: "75%" }}
                          >
                            <strong>Admin</strong>
                            <p className="mb-0">{r.reply}</p>
                          </div>
                        </div>
                      )}

                      {/* Reply input */}
                      <div className="d-flex gap-2 mt-2">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Write a reply..."
                          value={replyText[r._id] || ""}
                          onChange={(e) =>
                            setReplyText({
                              ...replyText,
                              [r._id]: e.target.value,
                            })
                          }
                        />
                        <button
                          className="btn btn-primary"
                          onClick={() => handleReplySubmit(product._id, r._id)}
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReview;
