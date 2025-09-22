import React, { useEffect, useState } from "react";

import axios from "axios";
import { useRef } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/auth";
import Layout from "../../components/Layout/Layout";
import { NavLink, useNavigate } from "react-router-dom";
import AdminMenu from "../../components/Layout/AdminMenu";
import { QRCodeCanvas } from "qrcode.react";
import { toWords } from 'number-to-words';
const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered"
  // , "cancelled"
];
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
                      <td className="fw-bold">৳{Number(o.totalAmount || 0).toFixed(2)}</td>
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
      style={{ maxWidth: "900px" }}
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
              position: relative;
              left: 0;
              top: 0;
              width: 100%;
              padding: 0;
              margin: 0;
              box-sizing: border-box;
            }
            .modal, .modal-dialog, .modal-content, .modal-body {
              all: unset;
              display: block;
              margin: 0;
            }
            table, tr, td, th {
              page-break-inside: avoid;
            }
            h6, p {
              margin: 0;
              padding: 0;
            }
            /* Force background colors to print */
            .print-section * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            @page {
              size: A4;
              margin: 20mm;
            }
          }
          `}
        </style>

        <div>
          {/* Print Section Start */}
          <div className="print-section p-4">

            {/* Banner */}
            <div
              style={{
                margin: "20px 0",
                backgroundColor: "rgb(0, 162, 151)",
                padding: "10px",
                display: "flex",
                alignItems: "center",
                borderRadius: "5px",
                position: "relative",
                color: "#fff",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <img
                  src="/images/newlogo.png"
                  style={{ width: "50px", height: "50px" }}
                  alt="logo"
                />
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <p style={{ margin: 0, fontWeight: "bold" }}>HealthProo</p>
                  <p style={{ margin: 0 }}>A reliable path to a healthy life</p>
                </div>
              </div>

              {/* Centered Slogan */}
              <p
                style={{
                  position: "absolute",
                  left: "50%",
                  transform: "translateX(-50%)",
                  margin: 0,
                  fontWeight: "bold",
                  fontSize: "24px",
                  textAlign: "center",
                }}
              >
                Purchase Summary
              </p>
            </div>

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
                  <th>Company</th>
                  <td>HealthProo.com</td>
                  <th>Company Address</th>
                  <td>Topkhana Road, Shegunbagicha, Dhaka-1000.</td>
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
                    <td className="text-center align-middle">{idx + 1}</td>

                    {/* Product Name (2 lines, 25 chars each) */}
                    <td>
                      {(() => {
                        const name = p.product?.name || "Deleted Product";
                        const firstLine = name.slice(0, 25);
                        const secondLine = name.length > 25 ? name.slice(25, 50) : "";
                        const ellipsis = name.length > 50 ? "..." : "";
                        return (
                          <>
                            {firstLine}<br />
                            {secondLine}{ellipsis}
                          </>
                        );
                      })()}
                    </td>

                    <td className="text-center align-middle">{p.color || "-"}</td>
                    <td className="text-center align-middle">{p.size}</td>
                    <td className="text-center align-middle">{p.brand}</td>
                    <td className="text-center align-middle">{p.quantity}</td>

                    <td className="text-center align-middle">
                      {p.discountPrice && p.discountPrice < p.price ? (
                        <span style={{ color: "red", fontWeight: "bold" }}>
                          ৳{(p.discountPrice).toFixed(2)}
                        </span>
                      ) : (
                        <>৳{(p.price * (p.quantity || 1)).toFixed(2)}</>
                      )}
                    </td>

                    <td className="text-center align-middle">
                      {p.discountPrice && p.discountPrice < p.price ? (
                        <span style={{ color: "red", fontWeight: "bold" }}>
                          ৳{(p.discountPrice * (p.quantity || 1)).toFixed(2)}
                        </span>
                      ) : (
                        <>৳{(p.price * (p.quantity || 1)).toFixed(2)}</>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals & QR Code */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div className="my-3 d-flex justify-content-center">
                <QRCodeCanvas
                  value={JSON.stringify({
                    orderId: selectedOrder._id,
                    buyer: selectedOrder.shippingInfo?.firstName + " " + selectedOrder.shippingInfo?.lastName,
                    total: selectedOrder.totalAmount,
                    date: selectedOrder.createdAt,
                  })}
                  size={128}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="H"
                  includeMargin={true}
                />
              </div>

              <div className="d-flex flex-column align-items-end mt-3">
                <div>
                  <strong>Subtotal:</strong> ৳{(
                    Number(selectedOrder.totalAmount) - Number(selectedOrder.shippingFee || 0)
                  ).toFixed(2)}
                </div>
                <div>
                  <strong>Shipping Fee:</strong> ৳{Number(selectedOrder.shippingFee || 0).toFixed(2)}
                </div>
                <div>
                  <strong>Discount:</strong> -৳{Number(selectedOrder.discount || 0).toFixed(2)}
                </div>
                <div className="fs-5 fw-bold border-top pt-2">
                  Total: ৳{Number(selectedOrder.totalAmount).toFixed(2)}
                </div>
                <div style={{ fontSize: '14px', fontStyle: 'italic', marginTop: '5px', fontWeight: 'bold' }}>
                  In Words: {toWords(Number(selectedOrder.totalAmount))} Taka Only
                </div>
              </div>
            </div>

            {/* Message / Special Note */}
            <div className="mt-4 p-3" style={{ border: "1px solid #000", borderRadius: "5px", lineHeight: "1.5" }}>
              <p>Dear {selectedOrder?.shippingInfo?.firstName} {selectedOrder?.shippingInfo?.lastName},</p>
              <p>Haven't got all your product yet? Don't worry!</p>
              <p>Dear Customer, we will deliver your ordered product to your address soon Insha’Allah. Thank you for staying with us.</p>
              <p><strong>Special Note:</strong> Please check your product carefully when receiving it. No complaints will be entertained after delivery. Thank you for your cooperation.</p>
              <p>Sincerely,</p>
              <p><strong>Your HealthProo.com</strong></p>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
                <div>Receiver's Signature ___________________</div>
                <div>HealthProo.com</div>
                <div>Date: {new Date().toLocaleDateString()}</div>
              </div>
            </div>

          </div>
          {/* Print Section End */}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
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

