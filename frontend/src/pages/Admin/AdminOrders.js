import React, { useEffect, useState } from "react";

import axios from "axios";
import { useRef } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/auth";
import Layout from "../../components/Layout/Layout";
import { NavLink, useNavigate } from "react-router-dom";
import AdminMenu from "../../components/Layout/AdminMenu";
import { QRCodeCanvas } from "qrcode.react";
const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];
const PAYMENT_STATUSES = ["pending", "completed"];

const AdminOrders = () => {
  const [auth] = useAuth();
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, limit: 20, total: 0 });
  const [filters, setFilters] = useState({ status: "", paymentMethod: "", buyerEmail: "" });
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  console.log("selectedOrder", selectedOrder)
  const [showModal, setShowModal] = useState(false);

  const handlePrint = () => {
    window.print();
  };
  console.log("All order", orders)
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
        headers: { Authorization: auth?.token, },
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
        headers: { Authorization: auth?.token, },
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
    // <Layout>
    <div className="container-fluid p-0">

      <div className="row g-0">
        {/* Sidebar */}
        <div className="col-12 col-md-3 col-lg-2 p-0 border-end" style={{ minHeight: "100vh" }}>
          <AdminMenu />
        </div>
        {/* Main Content */}
        <div className="col-12 col-md-9 col-lg-10 d-flex flex-column" style={{ backgroundColor: "#f4f5f7", minHeight: "100vh" }}>
          {/* Top Header */}
          <div
            className="d-flex flex-wrap justify-content-center align-items-center px-3 py-2 text-white shadow-sm"
            style={{
              background: "#001219", position: "sticky",
              top: 0,
              overflowY: "auto",
            }}
          >
            <NavLink
              to="/"
              style={{

                fontSize: "18px",
                margin: "6px 0 6px 20px",
                textDecoration: 'none',

                color: '#FFF', backgroundColor: '#0d1b2a'

              }}
            >
              All Order
            </NavLink>

          </div>
          <div style={{ padding: '20px', marginLeft: '20px' }}>
            <div className="d-flex flex-wrap align-items-end gap-2 mb-3">

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
              <table className="table table-bordered table-hover align-middle shadow-sm rounded">
                <thead className="table-dark">
                  <tr>
                    <th>Order</th>
                    <th>Date</th>
                    <th>Buyer</th>
                    <th>Items</th>
                    <th>Total</th>
                    
                    <th>Pay Method / Status</th>
                     <th>Screenshot</th>   {/* 👈 new column */}
                    <th>Order Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o._id}>
                      <td className="fw-semibold text-truncate" style={{ maxWidth: 120 }}>#{o._id}</td>
                      <td>{new Date(o.createdAt).toLocaleString()}</td>
                      <td>
                        <div className="small">
                          <div className="fw-semibold">{o.buyer?.name}</div>
                          <div className="text-muted">{o.buyer?.email}</div>
                        </div>
                      </td>
                      <td><span className="badge bg-secondary">{o.products?.reduce((n, p) => n + (p.quantity || 1), 0)}</span></td>
                      <td className="fw-bold">${Number(o.totalAmount || 0).toFixed(2)}</td>
                      <td>
                        <div className="d-flex flex-column gap-2">
                          <span className="badge bg-light text-dark border">{(o.paymentMethod || "").toUpperCase()}</span>
                          <select
                            className={`form-select form-select-sm fw-semibold 
                  ${o.paymentStatus === "Paid" ? "border-success text-success" :
                                o.paymentStatus === "Pending" ? "border-warning text-warning" :
                                  o.paymentStatus === "Failed" ? "border-danger text-danger" : ""}`}
                            value={o.paymentStatus}
                            onChange={(e) => updateStatus(o._id, { paymentStatus: e.target.value })}
                          >
                            {PAYMENT_STATUSES.map(ps => <option key={ps} value={ps}>{ps}</option>)}
                          </select>
                        </div>
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
                        <select
                          className="form-select form-select-sm fw-semibold"
                          value={o.orderStatus}
                          onChange={(e) => updateStatus(o._id, { orderStatus: e.target.value })}
                        >
                          {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td>
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
                    <tr>
                      <td colSpan="8" className="text-center text-muted py-4">
                        No orders found.
                      </td>
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
          </div>
          {showModal && selectedOrder && (
            <div
              className="modal show d-block"
              tabIndex="-1"
              style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
              onClick={() => setShowModal(false)}
            >
              <div
                className="modal-dialog modal-lg modal-dialog-centered"
                style={{ maxWidth: "800px" }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-content shadow-lg rounded-3">

                  {/* Header */}
                  <div className="modal-header text-black">
                    <h5 className="modal-title">Print Invoice for selected items</h5>
                    <button
                      type="button"
                      className="btn-close btn-close-black"
                      onClick={() => setShowModal(false)}
                    ></button>
                  </div>

                  {/* Print Button */}
                  <div style={{ padding: "10px" }}>
                    <button className="btn btn-primary" onClick={() => window.print()}>
                      Print
                    </button>
                  </div>

                  {/* Print CSS */}
                  <style>
                    {`
            @media print {
              body * {
                visibility: hidden;
              }
              .print-section, .print-section * {
                visibility: visible;
              }
              .print-section {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                padding: 20px;
                box-sizing: border-box;
              }

              /* Force background colors to print */
              .print-section * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
              }

              /* Remove modal restrictions */
              .modal, .modal-dialog, .modal-content, .modal-body {
                all: unset;
              }

              /* Set proper A4 page size */
              @page {
                size: A4;
                margin: 20mm;
              }
            }
          `}
                  </style>
                  <div style={{ margin: 'mx-4' }}>
                    {/* Print Section Start */}
                    <div className="print-section p-4" >
                      {/* Banner */}
                      <div
                        style={{
                          margin: "20px 0",
                          backgroundColor: "rgb(0, 162, 151)",
                          padding: "10px",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          borderRadius: "5px"
                        }}
                        className="text-white"
                      >
                        <img
                          src="/images/newlogo.png"
                          style={{ width: "50px", height: "50px" }}
                          alt="logo"
                        />
                        <div>
                          <p style={{ margin: 0, fontWeight: "bold" }}>HealthProo</p>
                          <p style={{ margin: 0 }}>Purchase Summary</p>
                        </div>
                      </div>

                      {/* Body */}
                      <div>
                        {/* Order Details */}
                        <h6 className="fw-bold mb-2">Order Details</h6>
                        <table className="table table-bordered table-sm">
                          <tbody>
                            <tr>
                              <th>Order Id</th>
                              <td>{selectedOrder._id}</td>
                              <th>Order Date</th>
                              <td>{new Date(selectedOrder.createdAt).toLocaleString()}</td>
                            </tr>
                            <tr>
                              <th>Paid By</th>
                              <td>{selectedOrder.paymentMethod || "Cash on Delivery"}</td>
                              <th>Phone</th>
                              <td>{selectedOrder?.shippingInfo?.phone}</td>
                            </tr>
                            <tr>
                              <th>Deliver To</th>
                              <td>
                                {selectedOrder?.shippingInfo?.firstName}{" "}
                                {selectedOrder?.shippingInfo?.lastName}
                              </td>
                              <th>Email</th>
                              <td>{selectedOrder?.shippingInfo?.email}</td>
                            </tr>
                            <tr>
                              <th>Deliver Address</th>
                              <td colSpan="3">
                                {selectedOrder?.shippingInfo?.address},{" "}
                                {selectedOrder?.shippingInfo?.city},{" "}
                                {selectedOrder?.shippingInfo?.postalCode}
                              </td>
                            </tr>
                            <tr>
                              <th>Seller</th>
                              <td>Md Shamim Ahmed </td>
                              <th>Seller Address</th>
                              <td>123, Polton, Dhaka</td>
                            </tr>
                          </tbody>
                        </table>

                        {/* Items Table */}
                        <h6 className="fw-bold mt-4 mb-2">Items</h6>
                        <table className="table table-bordered table-striped">
                          <thead className="table-light">
                            <tr>
                              <th>#</th>
                              <th>Product Name</th>
                              <th>Color</th>
                               <th>Size</th>
                                <th>Brand</th>
                              <th>Qty</th>
                              <th>Price</th>
                              <th>Item Total</th>

                            </tr>
                          </thead>
                          <tbody>
                            {selectedOrder.products.map((p, idx) => (
                              <tr key={idx}>
                                <td>{idx + 1}</td>
                                <td>{p.product?.name || "Deleted Product"}</td>
                              <td>{p.color || "-"}</td>
                                <td>{p.size}</td>
                                <td>{p.brand}</td>
                                <td>{p.quantity}</td>
                                <td>${(p.product?.price || 0).toFixed(2)}</td>
                                <td>
                                  ${(p.product?.price * (p.quantity || 1) || 0).toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        {/* Totals */}
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <div className="my-3 d-flex justify-content-center">
                            <QRCodeCanvas
                              value={JSON.stringify({
                                orderId: selectedOrder._id,
                                buyer: selectedOrder.shippingInfo?.firstName + " " + selectedOrder.shippingInfo?.lastName,
                                total: selectedOrder.totalAmount,
                                date: selectedOrder.createdAt,
                              })}
                              size={128} // QR code size
                              bgColor="#ffffff"
                              fgColor="#000000"
                              level="H"
                              includeMargin={true}
                            />
                          </div>

                          <div className="d-flex flex-column align-items-end mt-3">
                            <div>
                              <strong>Subtotal:</strong> $
                              {Number(selectedOrder.subTotal || 0).toFixed(2)}
                            </div>
                            <div>
                              <strong>Shipping Fee:</strong> $
                              {Number(selectedOrder.shippingFee || 0).toFixed(2)}
                            </div>
                            <div>
                              <strong>Discount:</strong> -$
                              {Number(selectedOrder.discount || 0).toFixed(2)}
                            </div>
                            <div className="fs-5 fw-bold border-top pt-2">
                              Total: ${Number(selectedOrder.totalAmount).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Print Section End */}
                  </div>


                  {/* Footer */}
                  <div className="modal-footer">
                    <button
                      className="btn btn-secondary"
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
      </div>


    </div>
    // </Layout>
  );
};

export default AdminOrders;

