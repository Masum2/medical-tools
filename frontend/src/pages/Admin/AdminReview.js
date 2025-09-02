import React, { useEffect, useState } from "react";
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

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get(`${API}/api/v1/product/get-product`, {
        headers: { Authorization: auth?.token },
      });
      setProducts(data.products || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch products");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

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
        <div className="col-12 col-md-3 col-lg-2 p-0 border-end" style={{ minHeight: "100vh" }}>
          <AdminMenu />
        </div>

        {/* Main Content */}
        <div className="col-12 col-md-9 col-lg-10" style={{ backgroundColor: "#f4f5f7", minHeight: "100vh" }}>
          {/* Header */}
          <div className="d-flex align-items-center px-4 py-2 text-white shadow-sm" style={{ background: "#001219", position: "sticky", top: 0 }}>
            <NavLink to="/" className="text-white" style={{ fontSize: "18px", textDecoration: "none" }}>
              All Review and Ratings
            </NavLink>
          </div>

          <div className="p-4">
            <h2 className="mb-4">Product Reviews</h2>

            {products.length === 0 && <p>No products found</p>}

            {products.map((product) => (
              <div key={product._id} className="mb-5 p-4 rounded shadow-sm bg-white">
                <h4 className="mb-2">{product.name}</h4>
                <p className="text-muted mb-3">
                  <strong>Average Rating:</strong> {product.averageRating.toFixed(1)} / 5 ({product.reviews.length} reviews)
                </p>

                {product.reviews.length === 0 && <p>No reviews yet</p>}

                {product.reviews.map((r) => (
                  <div key={r._id} className="border rounded p-3 mb-3" style={{ backgroundColor: "#f9f9f9" }}>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <strong>{r.name}</strong>
                      <span className="badge bg-warning text-dark">{r.stars} ★</span>
                    </div>
                    <p className="mb-1">{r.comment}</p>
                    <small className="text-muted">{new Date(r.createdAt).toLocaleDateString()}</small>

                    {/* Existing Admin Reply */}
                    {r.reply && (
                      <div className="mt-2 p-2 rounded" style={{ backgroundColor: "#e3f2fd" }}>
                        <strong>Admin Reply:</strong>
                        <p className="mb-0">{r.reply}</p>
                      </div>
                    )}

                    {/* Admin Reply Input */}
                    <div className="mt-3 d-flex gap-2">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Write a reply..."
                        value={replyText[r._id] || ""}
                        onChange={(e) => setReplyText({ ...replyText, [r._id]: e.target.value })}
                      />
                      <button
                        className="btn btn-primary"
                        onClick={() => handleReplySubmit(product._id, r._id)}
                      >
                        Reply
                      </button>
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
