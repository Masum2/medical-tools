import React, { useEffect, useState } from "react";

import axios from "axios";

import toast from "react-hot-toast";
import { useAuth } from "../../context/auth";
import Layout from "../../components/Layout/Layout";
import { useNavigate } from "react-router-dom";

const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];
const PAYMENT_STATUSES = ["pending", "completed"];

const AdminOrders = () => {
  const [auth] = useAuth();
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, limit: 20, total: 0 });
  const [filters, setFilters] = useState({ status: "", paymentMethod: "", buyerEmail: "" });
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
const [showModal, setShowModal] = useState(false);
const API = process.env.REACT_APP_API;
const navigate = useNavigate();
  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 20,
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.paymentMethod ? { paymentMethod: filters.paymentMethod } : {}),
        ...(filters.buyerEmail ? { buyerEmail: filters.buyerEmail } : {}),
      });
      const { data } = await axios.get(`${API}/api/v1/order/get-orders/all?${params.toString()}`, {
        headers: {  Authorization: auth?.token, },
      });
      if (data?.success) {
        setOrders(data.data);
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

  const updateStatus = async (id, body) => {
    try {
      const { data } = await axios.patch(`${API}/api/v1/order/${id}/status`, body, {
          headers: {  Authorization: auth?.token, },
      });
      if (data?.success) {
        toast.success("Order updated");
        fetchOrders(pagination.page);
      } else {
        toast.error(data?.error || "Update failed");
      }
    } catch (e) {
      console.error(e);
      toast.error("Update failed");
    }
  };

  return (
    <Layout>
      <div className="container py-4">
        <div className="d-flex flex-wrap align-items-end gap-2 mb-3">
          <h4 className="me-auto">All Orders</h4>

          <div>
            <label className="form-label mb-1 small">Status</label>
            <select
              className="form-select form-select-sm"
              value={filters.status}
              onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
            >
              <option value="">All</option>
              {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="form-label mb-1 small">Payment</label>
            <select
              className="form-select form-select-sm"
              value={filters.paymentMethod}
              onChange={e => setFilters(f => ({ ...f, paymentMethod: e.target.value }))}
            >
              <option value="">All</option>
              <option value="bkash">Bkash</option>
              <option value="nogod">Nogod</option>
              <option value="cod">COD</option>
            </select>
          </div>

          <div>
            <label className="form-label mb-1 small">Buyer Email</label>
            <input
              className="form-control form-control-sm"
              placeholder="search email"
              value={filters.buyerEmail}
              onChange={e => setFilters(f => ({ ...f, buyerEmail: e.target.value }))}
            />
          </div>

          <button className="btn btn-sm btn-primary" onClick={() => fetchOrders(1)}>Apply</button>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => { setFilters({ status: "", paymentMethod: "", buyerEmail: "" }); fetchOrders(1); }}
          >
            Reset
          </button>
        </div>

        <div className="table-responsive">
          <table className="table align-middle">
            <thead className="table-light">
              <tr>
                <th>Order</th>
                <th>Date</th>
                <th>Buyer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Pay Method / Status</th>
                <th>Order Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id}>
                  <td className="text-truncate" style={{ maxWidth: 120 }}>#{o._id}</td>
                  <td>{new Date(o.createdAt).toLocaleString()}</td>
                  <td>
                    <div className="small">
                      <div>{o.buyer?.name}</div>
                      <div className="text-muted">{o.buyer?.email}</div>
                    </div>
                  </td>
                  <td>{o.products?.reduce((n, p) => n + (p.quantity || 1), 0)}</td>
                  <td>${Number(o.totalAmount || 0).toFixed(2)}</td>
                  <td>
                    <div className="d-flex flex-column gap-1">
                      <span className="badge bg-light text-dark border">{(o.paymentMethod || "").toUpperCase()}</span>
                      <select
                        className="form-select form-select-sm"
                        value={o.paymentStatus}
                        onChange={(e) => updateStatus(o._id, { paymentStatus: e.target.value })}
                      >
                        {PAYMENT_STATUSES.map(ps => <option key={ps} value={ps}>{ps}</option>)}
                      </select>
                    </div>
                  </td>
                  <td>
                    <select
                      className="form-select form-select-sm"
                      value={o.orderStatus}
                      onChange={(e) => updateStatus(o._id, { orderStatus: e.target.value })}
                    >
                      {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td>
                    {/* Example view button; create a details page if you want */}
<button
  className="btn btn-sm btn-outline-primary"
  onClick={async () => {
    try {
      const { data } = await axios.get(`${API}/api/v1/order/${o._id}`, {
        headers: { Authorization: auth?.token },
      });
      if (data?.success) {
        setSelectedOrder(data.data);
        setShowModal(true);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch order details");
    }
  }}
>
  View
</button>

                  </td>
                </tr>
              ))}
              {!orders.length && !loading && (
                <tr><td colSpan="8" className="text-center text-muted py-4">No orders found.</td></tr>
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
            <span className="align-self-center small">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              className="btn btn-outline-secondary btn-sm"
              disabled={pagination.page >= pagination.pages}
              onClick={() => fetchOrders(pagination.page + 1)}
            >
              Next
            </button>
          </div>
        )}
{showModal && selectedOrder && (
  <div
    className="modal show d-block"
    tabIndex="-1"
    style={{ backgroundColor: "rgba(0,0,0,0.5)" }} // backdrop color
    onClick={() => setShowModal(false)}
  >
    <div
      className="modal-dialog modal-lg modal-dialog-centered"
      style={{ maxWidth: "700px" }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="modal-content shadow-lg rounded-3">
        {/* Header */}
        <div className="modal-header bg-primary text-white">
          <h5 className="modal-title">Order #{selectedOrder._id}</h5>
          <button
            type="button"
            className="btn-close btn-close-white"
            onClick={() => setShowModal(false)}
          ></button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ maxHeight: "400px", overflowY: "auto" }}>
          {selectedOrder.products.map((p, idx) => (
            <div
              key={idx}
              className="d-flex justify-content-between align-items-center border-bottom py-2"
            >
              <div>
                <strong>{p.product?.name || "Deleted Product"}</strong> x {p.quantity}
                {p.product?.description && (
                  <div className="text-muted small">{p.product.description}</div>
                )}
              </div>
              <div>${(p.product?.price * (p.quantity || 1) || 0).toFixed(2)}</div>
            </div>
          ))}

          {/* Total */}
          <div className="text-end mt-3 fs-5 fw-bold">
            Total: ${Number(selectedOrder.totalAmount).toFixed(2)}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
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

export default AdminOrders;

