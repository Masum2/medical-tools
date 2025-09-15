import React, { useState } from "react";
import Layout from "../components/Layout/Layout";
import { useCart } from "../context/cart";
import { useAuth } from "../context/auth";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const CheckoutPage = () => {
  const [cart, setCart] = useCart();
  const [auth] = useAuth();
  const navigate = useNavigate();
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setScreenshot(file);
      setScreenshotPreview(URL.createObjectURL(file));
    }
  };

  const API = process.env.REACT_APP_API;
  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    district: "",
    paymentMethod: "",
  });

  // subtotal
  const subtotal = () =>
    cart?.reduce((total, item) => total + item.price * (item.quantity || 1), 0) || 0;

  // handle form change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // handle order
// handle order
const handleOrder = async (paymentMethod) => {
  try {
    const formDataToSend = new FormData();

    formDataToSend.append("cart", JSON.stringify(cart));
    formDataToSend.append("firstName", formData.firstName);
    formDataToSend.append("lastName", formData.lastName);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("phone", formData.phone);
    formDataToSend.append("address", formData.address);
    formDataToSend.append("city", formData.city);
    formDataToSend.append("postalCode", formData.postalCode);
    formDataToSend.append("district", formData.district);
    formDataToSend.append("paymentMethod", paymentMethod);

    // শুধুমাত্র cod না হলে screenshot লাগবে
    if (paymentMethod !== "cod" && screenshot) {
      formDataToSend.append("paymentScreenshot", screenshot);
    }

    const { data } = await axios.post(
      `${API}/api/v1/order/create-order`,
      formDataToSend,
      {
        headers: {
          Authorization: auth?.token,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (data?.success) {
      toast.success("Order placed successfully");
      setCart([]);
      localStorage.removeItem("cart");
      navigate("/");
    } else {
      toast.error(data?.error || "Something went wrong");
    }
  } catch (err) {
    console.error(err);
    toast.error("Order failed");
  }
};


  return (
    <Layout>
      <div className="container pt-3">
        <div className="row">
          {/* LEFT SIDE FORM */}
          <div className="col-md-8">
            <div className="card shadow-sm p-4 mb-4 rounded-3">
              <h4 className="mb-3 fw-semibold">Billing Details</h4>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="Enter First Name"
                    className="form-control"
                    value={formData.firstName}
                    onChange={handleChange}
                    style={{ backgroundColor: "#F7FAFC" }}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Enter Last Name"
                    className="form-control"
                    value={formData.lastName}
                    onChange={handleChange}
                    style={{ backgroundColor: "#F7FAFC" }}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter Email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    placeholder="Enter Phone"
                    className="form-control"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Address</label>
                <textarea
                  className="form-control"
                  name="address"
                  placeholder="Street address"
                  rows="2"
                  value={formData.address}
                  onChange={handleChange}
                ></textarea>
              </div>

              <div className="row">
           <div className="col-md-4 mb-3">
  <label className="form-label">District</label>
  <select
    name="district"
    className="form-control"
    value={formData.district}
    onChange={handleChange}
    style={{ backgroundColor: "#F7FAFC" }}
  >
    <option value="">Select District</option>
    <option value="Dhaka">Dhaka</option>
    <option value="Chattogram">Chattogram</option>
    <option value="Khulna">Khulna</option>
    <option value="Barishal">Barishal</option>
    <option value="Sylhet">Sylhet</option>
    <option value="Rajshahi">Rajshahi</option>
    <option value="Rangpur">Rangpur</option>
    <option value="Mymensingh">Mymensingh</option>
  </select>
</div>

                <div className="col-md-4 mb-3">
                  <label className="form-label">Upozila/Thana</label>
                  <input
                    type="text"
                    name="city"
                    placeholder="Upozila/Thana"
                    className="form-control"
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Postal Code</label>
                  <input
                    type="text"
                    name="postalCode"
                    placeholder="Post Code"
                    className="form-control"
                    value={formData.postalCode}
                    onChange={handleChange}
                  />
                </div>

              </div>
            </div>
          </div>

          {/* RIGHT SIDE SUMMARY */}
          <div className="col-md-4">
            <div
              className="p-4"
              style={{
                backgroundColor: "#fff",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                boxShadow: "0px 6px 15px rgba(0,0,0,0.08)",
              }}
            >
              <h5 className="fw-semibold">Order Summary</h5>
              <div className="d-flex justify-content-between my-2">
                <span style={{ fontSize: "14px" }}>Subtotal ({cart.length} items)</span>
                <span style={{ fontSize: "14px" }}>৳{subtotal().toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between my-2">
                <span style={{ fontSize: "14px" }}>Shipping Fee</span>
                <span style={{ fontSize: "14px" }}>৳0.00</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between fw-bold my-2">
                <span>Total</span>
                <span>${subtotal().toFixed(2)}</span>
              </div>

              {/* PLACE ORDER BUTTON */}
              <button
                className="btn w-100 mt-3 text-white"
                style={{
                  backgroundColor: "#42BAC9",
                  borderRadius: "6px",
                }}
                onClick={() => setShowModal(true)}
                disabled={
                  !formData.firstName ||
                  !formData.lastName ||
                  !formData.email ||
                  !formData.phone ||
                  !formData.address ||
                  !formData.city ||
                  !formData.postalCode ||
                  !formData.district
                }
              >
                Place Order
              </button>
            </div>
          </div>
        </div>

        {/* PAYMENT MODAL */}
        {/* PAYMENT MODAL */}
        {/* PAYMENT MODAL */}
        {/* PAYMENT MODAL */}
{showModal && (
  <div
    className="modal show d-block"
    tabIndex="-1"
    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
  >
    <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "800px" }}>
      <div className="modal-content p-4" style={{ borderRadius: "12px" }}>
        <div className="modal-header justify-content-center position-relative border-bottom-0">
          <h5 className="modal-title fw-bold text-center">Select Payment Method</h5>
          <button
            type="button"
            className="btn-close position-absolute end-0"
            onClick={() => setShowModal(false)}
            style={{ right: "16px", top: "16px" }}
          ></button>
        </div>

        <div className="modal-body">
          {/* Payment Method Selection */}
          <div className="d-flex justify-content-center flex-wrap gap-4 mt-3">
            {[
              { id: "bkash", label: "Bkash", img: "/images/bkash.png" },
              { id: "nogod", label: "Nagad", img: "/images/nogod.png" },
              { id: "bank", label: "Bank", img: "/images/bank.jpg" },
              { id: "cod", label: "Cash on Delivery", img: "/images/cash.jpg" },
            ].map((pm) => (
              <div
                key={pm.id}
                className={`p-3 rounded-4 text-center shadow-sm`}
                style={{
                  cursor: "pointer",
                  width: "130px",
                  border:
                    selectedPayment === pm.id
                      ? "2px solid #42BAC9"
                      : "1px solid #e0e0e0",
                  transition: "all 0.3s ease",
                  backgroundColor: selectedPayment === pm.id ? "#f0fcfd" : "#fff",
                }}
                onClick={() => setSelectedPayment(pm.id)}
              >
                <img
                  src={pm.img}
                  alt={pm.label}
                  style={{
                    width: "100%",
                    height: "60px",
                    objectFit: "contain",
                    marginBottom: "6px",
                  }}
                />
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: selectedPayment === pm.id ? "600" : "500",
                    color: selectedPayment === pm.id ? "#42BAC9" : "#333",
                  }}
                >
                  {pm.label}
                </span>
              </div>
            ))}
          </div>

          {/* Payment Info + Screenshot */}
          {selectedPayment && selectedPayment !== "cod" && (
            <div className="mt-4 p-4 border rounded-3 bg-light shadow-sm">
              {selectedPayment === "bkash" && (
                <>
                  <h6 className="fw-semibold">Bkash Payment Info</h6>
                  <p>Bkash Number: <strong>01723-826946</strong></p>
                  <p>Type: <strong>Personal</strong></p>
                </>
              )}
              {selectedPayment === "nogod" && (
                <>
                  <h6 className="fw-semibold">Nagad Payment Info</h6>
                  <p>Nagad Number: <strong>01723-826946</strong></p>
                  <p>Type: <strong>Personal</strong></p>
                </>
              )}
              {selectedPayment === "bank" && (
                <>
                  <h6 className="fw-semibold">Bank Payment Info</h6>
                  <p>Bank: <strong>City Bank Ltd.</strong></p>
                  <p>Account Name: <strong>NF KART.COM</strong></p>
                  <p>Account Number: <strong>1781910005699</strong></p>
                </>
              )}

              <label className="form-label">Upload Transaction Screenshot</label>
              <div
                className="border rounded-3 d-flex flex-column align-items-center justify-content-center p-4"
                style={{
                  width: "100%",
                  height: "180px",
                  cursor: "pointer",
                  backgroundColor: "#f8f9fa",
                  borderStyle: "dashed",
                }}
                onClick={() =>
                  document.getElementById("modalScreenshotInput").click()
                }
              >
                {!screenshotPreview ? (
                  <>
                    <i className="bi bi-cloud-upload fs-1 text-secondary"></i>
                    <span className="text-muted mt-2">Click to Upload</span>
                  </>
                ) : (
                  <img
                    src={screenshotPreview}
                    alt="screenshot preview"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      objectFit: "contain",
                    }}
                  />
                )}
              </div>
              <input
                type="file"
                id="modalScreenshotInput"
                className="d-none"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
          )}
        </div>

        <div className="modal-footer border-top-0 justify-content-end">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowModal(false)}
          >
            Close
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!selectedPayment}
            onClick={() => {
              setShowModal(false);
              handleOrder(selectedPayment);
            }}
          >
            Pay & Confirm
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

export default CheckoutPage;
