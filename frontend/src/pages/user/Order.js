import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { useAuth } from "../../context/auth";
import Layout from "../../components/Layout/Layout";

const Orders = () => {
  const [auth] = useAuth();
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, limit: 10, total: 0 });
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
 const API = process.env.REACT_APP_API;
  // Color mapping
  const paymentStatusColor = { completed: "success", pending: "secondary" };
  const orderStatusColor = { pending: "secondary", processing: "info", shipped: "warning", delivered: "success", cancelled: "danger" };

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
      <div className="container pt-4">
        <h4 className="mb-3">My Orders</h4>

        <div className="table-responsive">
          <table className="table align-middle">
            <thead className="table-light">
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment Method</th>
                <th>Payment Status</th>
                <th>Order Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {(orders || []).map((o) => (
                <tr key={o._id}>
                  <td className="text-truncate" style={{ maxWidth: 140 }}>#{o._id}</td>
                  <td>{dayjs(o.createdAt).format("DD MMM YYYY, h:mm A")}</td>
                  <td>{o.products?.reduce((n, p) => n + (p.quantity || 1), 0)}</td>
                  <td>${Number(o.totalAmount || 0).toFixed(2)}</td>
                  <td>
                    <span className="badge bg-primary text-white">{(o.paymentMethod || "").toUpperCase()}</span>
                  </td>
                  <td>
                    <span className={`badge bg-${paymentStatusColor[o.paymentStatus] || "secondary"}`}>
                      {o.paymentStatus || "pending"}
                    </span>
                  </td>
                  <td>
                    <span className={`badge bg-${orderStatusColor[o.orderStatus] || "secondary"}`}>
                      {o.orderStatus || "processing"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => { setSelectedOrder(o); setShowModal(true); }}
                    >
                      View Items
                    </button>
                  </td>
                </tr>
              ))}
              {!orders.length && !loading && (
                <tr>
                  <td colSpan="8" className="text-center text-muted py-4">No orders yet.</td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan="8" className="text-center py-4">Loading...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* pagination */}
        {pagination.pages > 1 && (
          <div className="d-flex justify-content-center gap-2">
            <button
              className="btn btn-outline-secondary btn-sm"
              disabled={pagination.page <= 1}
              onClick={() => fetchOrders(pagination.page - 1)}
            >
              Prev
            </button>
            <span className="align-self-center small">Page {pagination.page} of {pagination.pages}</span>
            <button
              className="btn btn-outline-secondary btn-sm"
              disabled={pagination.page >= pagination.pages}
              onClick={() => fetchOrders(pagination.page + 1)}
            >
              Next
            </button>
          </div>
        )}

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
        
        {/* Header with Logo */}
        <div className="modal-header bg-white border-0 d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <img
              src="/images/logo.png" // replace with your company logo
              alt="Company Logo"
              style={{ height: "50px", marginRight: "10px" }}
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
        <div
          className="modal-body p-4"
          style={{ maxHeight: "500px", overflowY: "auto" }}
        >
          {/* Order Info */}
          <div className="d-flex justify-content-between mb-4">
            <div>
              <h6 className="fw-bold mb-1">Order ID:</h6>
              <p className="mb-0">#{selectedOrder._id}</p>
            </div>
            <div className="text-end">
              <h6 className="fw-bold mb-1">Date:</h6>
              <p className="mb-0">
                {new Date(selectedOrder.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Product Table */}
          <table className="table custom-table">
            <thead>
              <tr>
                <th>Product</th>
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
                  <td className="text-center">{p.quantity}</td>
                  <td className="text-end">${p.product?.price?.toFixed(2)}</td>
                  <td className="text-end">
                    ${(p.product?.price * (p.quantity || 1) || 0).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Total */}
          <div className="d-flex justify-content-end mt-3">
            <div className="text-end">
              <h5 className="fw-bold">
                Total: ${Number(selectedOrder.totalAmount).toFixed(2)}
              </h5>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer bg-light border-0 d-flex justify-content-between">
          <small className="text-muted">
            Thank you for shopping with <strong>HealthProo Ltd.</strong>
          </small>
          <button
            className="btn btn-primary px-4"
            onClick={() => setShowModal(false)}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
)}

<style>
{`
  .custom-table {
    width: 100%;
    border-collapse: collapse;
    border-radius: 10px;
    overflow: hidden;
  }
  .custom-table thead {
    background-color: #f8f9fa;
    font-weight: 600;
  }
  .custom-table th, 
  .custom-table td {
    border: 1px solid #e5e7eb;
    padding: 12px 15px;
    vertical-align: middle;
  }
  .custom-table tbody tr:hover {
    background-color: #f9fafb;
  }
`}
</style>


      </div>
    </Layout>
  );
};

export default Orders;
