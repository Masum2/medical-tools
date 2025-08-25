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
  const handleOrder = async () => {
    try {
      const { data } = await axios.post(
        "/api/v1/order/create-order",
        { cart, ...formData }, 
        {
          headers: { Authorization: auth?.token },
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
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
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
                <div className="col-md-4 mb-3">
                  <label className="form-label">District</label>
                  <input
                    type="text"
                    name="district"
                    placeholder="District"
                    className="form-control"
                    value={formData.district}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-3">
                <label className="form-label d-block">Select Payment Method</label>
                <div className="d-flex gap-3 flex-wrap">
                  {[
                    { id: "bkash", label: "Bkash", img: "/images/bkash.png" },
                    { id: "nogod", label: "Nagad", img: "/images/nogod.png" },
                    { id: "cod", label: "Cash on Delivery", img: "/images/cash.jpg" },
                  ].map((pm) => (
                    <div
                      key={pm.id}
                      className={`p-3  rounded-3 text-center flex-fill`}
                      style={{
                        cursor: "pointer",
                        width: "180px",
                        border:
                          formData.paymentMethod === pm.id
                            ? "2px solid #42BAC9"
                            : "1px solid #e5e7eb",
                        boxShadow:
                          formData.paymentMethod === pm.id
                            ? "12px 4px 12px rgba(66,186,201,0.4)"
                            : "0 2px 6px rgba(0,0,0,0.05)",
                        transition: "all 0.2s ease-in-out",
                      }}
                      onClick={() => setFormData({ ...formData, paymentMethod: pm.id })}
                    >
                      <img
                        src={pm.img}
                        alt={pm.label}
                        style={{
                          width: "100%",
                          height: "80px",
                          objectFit: "contain",
                          marginBottom: "6px",
                        }}
                      />
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight:
                            formData.paymentMethod === pm.id ? "600" : "400",
                          color:
                            formData.paymentMethod === pm.id ? "#42BAC9" : "#333",
                        }}
                      >
                        {pm.label}
                      </span>
                    </div>
                  ))}
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
                <span style={{ fontSize: "14px" }}>${subtotal().toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between my-2">
                <span style={{ fontSize: "14px" }}>Shipping Fee</span>
                <span style={{ fontSize: "14px" }}>$0.00</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between fw-bold my-2">
                <span>Total</span>
                <span>${subtotal().toFixed(2)}</span>
              </div>
              <button
                className="btn w-100 mt-3 text-white"
                style={{
                  backgroundColor: "#42BAC9",
                  borderRadius: "6px",
                }}
                onClick={handleOrder}
                disabled={
                  !formData.firstName ||
                  !formData.lastName ||
                  !formData.email ||
                  !formData.phone ||
                  !formData.address ||
                  !formData.city ||
                  !formData.postalCode ||
                  !formData.district ||
                  !formData.paymentMethod
                }
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutPage;
