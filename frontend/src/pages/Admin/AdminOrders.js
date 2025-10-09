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

const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered"];
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
        headers: { Authorization: auth?.token },
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
        headers: { Authorization: auth?.token },
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

  const handlePrint = () => {
    const printContent = document.getElementById('print-section');
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - Order #${selectedOrder._id}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 10mm;
            }
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              font-size: 12px;
              line-height: 1.2;
            }
            .banner {
              background: rgb(0, 162, 151);
              padding: 8px;
              border-radius: 5px;
              color: white;
              margin-bottom: 10px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 8px;
              font-size: 11px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 4px;
              text-align: left;
            }
            .table-light th {
              background-color: #f8f9fa;
            }
            .flex-print {
              display: flex;
              justify-content: space-between;
              margin-top: 10px;
              align-items: flex-start;
            }
            .special-note {
              border: 1px solid #000;
              border-radius: 5px;
              padding: 8px;
              margin-top: 10px;
              font-size: 11px;
            }
            @media print {
              body { margin: 0; padding: 0; }
              // .banner { background: rgb(0, 162, 151) !important; -webkit-print-color-adjust: exact; }
              .table-light th { background-color: #f8f9fa !important; -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      // printWindow.close(); // Uncomment if you want to auto-close after print
    }, 500);
  };

  return (
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
              background: "#001219",
              position: "sticky",
              top: 0,
              zIndex: 100,
            }}
          >
            <NavLink
              to="/"
              style={{
                fontSize: "18px",
                margin: "6px 0 6px 20px",
                textDecoration: 'none',
                color: '#FFF',
                backgroundColor: '#0d1b2a'
              }}
            >
              All Order
            </NavLink>
          </div>

          <div style={{ padding: '20px', marginLeft: '20px' }}>
            {/* Filters */}
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

            {/* Orders Table */}
            <div className="table-responsive">
              {loading ? (
                <div className="d-flex justify-content-center align-items-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <span className="ms-2">Loading orders...</span>
                </div>
              ) : (
                <table className="table table-bordered table-hover align-middle shadow-sm rounded">
                  <thead className="table-dark">
                    <tr>
                      <th>Order</th>
                      <th>Date</th>
                      <th>Buyer</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Pay Method / Status</th>
                      <th>Screenshot</th>
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
                        <td colSpan="9" className="text-center text-muted py-4">
                          No orders found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
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

          {/* Invoice Modal */}
          {showModal && selectedOrder && (
            <div
              className="modal show d-block"
              tabIndex="-1"
              style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
              onClick={() => setShowModal(false)}
            >
              <div
                className="modal-dialog modal-xl modal-dialog-centered"
                style={{ maxWidth: "240mm" }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-content shadow-lg rounded-3">

                  {/* Header */}
                  <div className="modal-header text-black">
                    <h5 className="modal-title">Invoice for Order #{selectedOrder._id}</h5>
                    <button
                      type="button"
                      className="btn-close btn-close-black"
                      onClick={() => setShowModal(false)}
                    ></button>
                  </div>

                  {/* Print Button */}
                  <div style={{ padding: "10px 20px" }}>
                    <button className="btn btn-primary" onClick={handlePrint}>
                      Print Invoice
                    </button>
                  </div>

                  {/* Print Section */}
                  <div className="modal-body" style={{ maxHeight: "70vh", overflowY: "auto" }}>
                    <div id="print-section" className="p-2">
                      
                      {/* Banner */}
                     <div
  className="banner"
  style={{
    margin: "10px 0",
    padding: "10px 15px",
    display: "flex",
    alignItems: "center",
    borderRadius: "8px",
    color: "#fff",
    border: "2px solid #000",
    // backgroundColor: "#00a297",
    position: "relative",
    flexWrap: "wrap",
    justifyContent: "space-between"
  }}
>
  {/* Left: Logo + Company Name */}
  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
    <img
      src="/images/newlg.png"
      style={{ width: "50px", height: "50px" }}
      alt="logo"
    />
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", }}>
      <p style={{ margin: 0, fontWeight: "bold", fontSize: "16px",color:'#000' }}>HealthProo</p>
      <p style={{ margin: 0, fontSize: "12px",color:'#000' }}>Your Health, Our Priority.</p>
    </div>
  </div>

  {/* Centered Purchase Summary */}
  <p
    style={{
      position: "absolute",
      left: "50%",
      transform: "translateX(-50%)",
      margin: 0,
      fontWeight: "bold",
      fontSize: "20px",
      textAlign: "center",
      border: "1px solid #fff",
      padding: "4px 10px",
      borderRadius: "5px",
      backgroundColor: "rgba(0,0,0,0.1)",
      color:'#000',
      border: "2px solid #000",
    }}
  >
    Purchase Summary
  </p>
</div>


                      {/* Order Details */}
                      <h6 className="fw-bold mb-1">Order Details</h6>
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
                            <td>{selectedOrder?.shippingInfo?.firstName} {selectedOrder?.shippingInfo?.lastName}</td>
                            <th>Email</th>
                            <td>{selectedOrder?.shippingInfo?.email}</td>
                          </tr>
                          <tr>
                            <th>Deliver Address</th>
                            <td colSpan="3">
                              {selectedOrder?.shippingInfo?.address}, {selectedOrder?.shippingInfo?.city}, {selectedOrder?.shippingInfo?.postalCode}
                            </td>
                          </tr>
                          <tr>
                            <th>Company</th>
                            <td>HealthProo.com</td>
                            <th>Company Address</th>
                            <td>Topkhana Road, Shegunbagicha, Dhaka-1000</td>
                          </tr>
                        </tbody>
                      </table>

                      {/* Items Table */}
                      <h6 className="fw-bold mt-2 mb-1">Items</h6>
                      <table className="table table-bordered table-striped table-sm">
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
                              <td className="text-center">{p.color || "-"}</td>
                              <td className="text-center">{p.size}</td>
                              <td className="text-center">{p.brand}</td>
                              <td className="text-center">{p.quantity}</td>
                              <td className="text-center">
                                {p.discountPrice && p.discountPrice < p.price
                                  ? <span style={{ color: "red", fontWeight: "bold" }}>৳{p.discountPrice.toFixed(2)}</span>
                                  : <>৳{(p.price * (p.quantity || 1)).toFixed(2)}</>}
                              </td>
                              <td className="text-center">
                                {p.discountPrice && p.discountPrice < p.price
                                  ? <span style={{ color: "red", fontWeight: "bold" }}>৳{(p.discountPrice * (p.quantity || 1)).toFixed(2)}</span>
                                  : <>৳{(p.price * (p.quantity || 1)).toFixed(2)}</>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* Totals + QR */}
                      <div className="flex-print" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', flexWrap: 'wrap' }}>
                        <div>
                          <QRCodeCanvas
                            value={JSON.stringify({
                              orderId: selectedOrder._id,
                              buyer: selectedOrder.shippingInfo?.firstName + " " + selectedOrder.shippingInfo?.lastName,
                              total: selectedOrder.totalAmount,
                              date: selectedOrder.createdAt,
                            })}
                            size={100}
                            bgColor="#ffffff"
                            fgColor="#000000"
                            level="H"
                            includeMargin={true}
                          />
                        </div>
                        <div style={{ textAlign: 'right', minWidth: '150px' }}>
                          <div><strong>Subtotal:</strong> ৳{(Number(selectedOrder.totalAmount) - Number(selectedOrder.shippingFee || 0)).toFixed(2)}</div>
                          <div><strong>Shipping Fee:</strong> ৳{Number(selectedOrder.shippingFee || 0).toFixed(2)}</div>
                          <div><strong>Discount:</strong> -৳{Number(selectedOrder.discount || 0).toFixed(2)}</div>
                          <div className="fs-5 fw-bold border-top pt-1">
                            Total: ৳{Number(selectedOrder.totalAmount).toFixed(2)}
                          </div>
                          <div style={{ fontSize: '12px', fontWeight:'bold', marginTop: '2px' }}>
                            In Words: {toWords(Number(selectedOrder.totalAmount))} Taka Only
                          </div>
                        </div>
                      </div>

                      {/* Special Note */}
                      <div className="special-note" style={{ border: "1px solid #000", borderRadius: "5px", padding: "5px", marginTop: '10px', lineHeight: '1.2', fontSize: '12px' }}>
                        <p>Dear {selectedOrder?.shippingInfo?.firstName} {selectedOrder?.shippingInfo?.lastName},</p>
                        <p>Haven't got all your product yet? Don't worry!</p>
                        <p>We will deliver your ordered product soon Insha'Allah. Thank you for staying with us.</p>
                        <p><strong>Special Note:</strong> Please check your product carefully upon receiving. No complaints will be entertained after delivery.</p>
                        <p>Sincerely,</p>
                        <p><strong>Your HealthProo.com</strong></p>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', fontSize: '12px' }}>
                          <div>Receiver's Signature ___________________</div>
                          <div>HealthProo.com</div>
                          <div>Date: {new Date().toLocaleDateString()}</div>
                        </div>
                      </div>
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
      </div>
    </div>
  );
};

export default AdminOrders;