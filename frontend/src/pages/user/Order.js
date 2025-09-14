import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { useAuth } from "../../context/auth";
import Layout from "../../components/Layout/Layout";
import UserMenu from "../../components/Layout/UserMenu";

const Orders = () => {
  const [auth] = useAuth();
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, limit: 10, total: 0 });
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const API = process.env.REACT_APP_API;
console.log("All oorder in user dashboard",orders)
  // Color mapping
  const paymentStatusColor = { completed: "success", pending: "secondary" };
  const orderStatusColor = {
    pending: "secondary",
    processing: "info",
    shipped: "warning",
    delivered: "success",
    cancelled: "danger",
  };

  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${API}/api/v1/order/get-orders?page=${page}&limit=${pagination.limit || 10}`,
        { headers: { Authorization: auth?.token } }
      );
      if (data?.success) {
        setOrders(data.data || []);
        setPagination(data.pagination);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth?.token) fetchOrders(1);
    // eslint-disable-next-line
  }, [auth?.token]);

  return (
    <Layout>
      <div className="container-fluid p-0">
        <div className="row g-0">
          {/* Sidebar */}
          <div
            className="col-12 col-md-3 col-lg-2 border-end bg-dark text-white"
            style={{ minHeight: "100vh" }}
          >
            <UserMenu />
          </div>

          {/* Orders Table */}
          <div className="col-12 col-md-9 col-lg-10 p-3">
            <div className="card shadow-sm border-0 rounded-3">
              <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold">My Orders</h5>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Order ID</th>
                        <th>Date</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Payment</th>
                        <th>Payment Slip</th>
                        <th>Payment Status</th>
                        <th>Order Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(orders || []).map((o) => (
                        <tr key={o._id}>
                          <td className="text-truncate" style={{ maxWidth: 140 }}>
                            #{o._id}
                          </td>
                          <td>{dayjs(o.createdAt).format("DD MMM YYYY, h:mm A")}</td>
                          <td>{o.products?.reduce((n, p) => n + (p.quantity || 1), 0)}</td>
                          <td>৳{Number(o.totalAmount || 0).toFixed(2)}</td>
                          <td>
                            <span className="badge bg-primary">
                              {(o.paymentMethod || "").toUpperCase()}
                            </span>
                          </td>
                          <td>
  {o.paymentScreenshot ? (
    <img
      src={`${API}/api/v1/order/payment-screenshot/${o._id}`}
      alt="Payment Proof"
      className="rounded"
      style={{ width: "60px", height: "60px", objectFit: "cover", cursor: "pointer" }}
      onClick={() => window.open(`${API}/api/v1/order/payment-screenshot/${o._id}`, "_blank")}
    />
  ) : (
    <span className="text-muted small">No screenshot</span>
  )}
</td>
                          <td>
                            <span
                              className={`badge bg-${
                                paymentStatusColor[o.paymentStatus] || "secondary"
                              }`}
                            >
                              {o.paymentStatus || "pending"}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`badge bg-${
                                orderStatusColor[o.orderStatus] || "secondary"
                              }`}
                            >
                              {o.orderStatus || "processing"}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-primary rounded-pill"
                              onClick={() => {
                                setSelectedOrder(o);
                                setShowModal(true);
                              }}
                            >
                              View Items
                            </button>
                          </td>
                        </tr>
                      ))}
                      {!orders.length && !loading && (
                        <tr>
                          <td colSpan="8" className="text-center text-muted py-4">
                            No orders yet.
                          </td>
                        </tr>
                      )}
                      {loading && (
                        <tr>
                          <td colSpan="8" className="text-center py-4">
                            Loading...
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="d-flex justify-content-center gap-2 mt-3">
                <button
                  className="btn btn-outline-secondary btn-sm rounded-pill"
                  disabled={pagination.page <= 1}
                  onClick={() => fetchOrders(pagination.page - 1)}
                >
                  Prev
                </button>
                <span className="align-self-center small">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  className="btn btn-outline-secondary btn-sm rounded-pill"
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => fetchOrders(pagination.page + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal */}
        {showModal && selectedOrder && (
          <div
            className="modal show d-block"
            tabIndex="-1"
            style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
            onClick={() => setShowModal(false)}
          >
            <div
              className="modal-dialog modal-lg modal-dialog-centered"
              style={{ maxWidth: "800px" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-content shadow-lg border-0 rounded-4">
                {/* Header */}
                <div className="modal-header bg-light border-0">
                  <div className="d-flex align-items-center">
                    <img
                      src="/images/newlogo.png"
                      alt="Company Logo"
                      style={{ height: "45px", marginRight: "10px" }}
                    />
                    <h5 className="fw-bold mb-0">HealthProo Ltd.</h5>
                  </div>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>

                {/* Body */}
                <div className="modal-body p-4">
                  {/* Order Info */}
                  <div className="row mb-4">
                    <div className="col">
                      <h6 className="fw-bold mb-1">Order ID:</h6>
                      <p className="mb-0">#{selectedOrder._id}</p>
                    </div>
                    <div className="col text-end">
                      <h6 className="fw-bold mb-1">Date:</h6>
                      <p className="mb-0">
                        {new Date(selectedOrder.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Product Table */}
                  <div className="table-responsive">
                    <table className="table table-bordered table-sm align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Product</th>
                             <th>Color</th>
                                <th>Size</th>
                                   <th>Brand</th>
                          <th className="text-center">Qty</th>
                          <th className="text-end">Price</th>
                          <th className="text-end">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.products.map((p, idx) => (
                          <tr key={idx}>
                            <td>
                              <strong>{p.product?.name || "Deleted Product"}</strong>
                              {p.product?.description && (
                                <div className="text-muted small">
                                  {p.product.description}
                                </div>
                              )}
                            </td>
                            <td className="text-center">{p.color}</td>
                            <td className="text-center">{p.size}</td>
                            <td className="text-center">{p.brand}</td>
                            <td className="text-center">{p.quantity}</td>
                            <td className="text-end">
                              ৳{p.product?.price?.toFixed(2)}
                            </td>
                            <td className="text-end">
                              ৳{(p.product?.price * (p.quantity || 1) || 0).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Total */}
                  <div className="d-flex justify-content-end mt-3">
                    <h5 className="fw-bold">
                      Total: ৳{Number(selectedOrder.totalAmount).toFixed(2)}
                    </h5>
                  </div>
                </div>

                {/* Footer */}
                <div className="modal-footer bg-light border-0 d-flex justify-content-between">
                 <small className="d-block text-center mt-2" style={{ color: "#42BAC9", fontWeight: "500" }}>
  Thank you for shopping with <strong style={{ color: "#ff6b6b" }}>healthpro.com</strong>!
</small>

                  <button
                    className="btn btn-primary rounded-pill px-4"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Orders;
