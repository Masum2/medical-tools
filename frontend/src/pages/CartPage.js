import React, { useState, useEffect } from "react";
import Layout from "./../components/Layout/Layout";
import { useCart } from "../context/cart";
import { useAuth } from "../context/auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { RiDeleteBin6Line } from "react-icons/ri";

const CartPage = () => {
  const [auth] = useAuth();
  const [cart, setCart] = useCart();
  const navigate = useNavigate();

  const incrementQty = (pid) => {
    const newCart = cart.map((item) =>
      item._id === pid ? { ...item, quantity: (item.quantity || 1) + 1 } : item
    );
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const decrementQty = (pid) => {
    const newCart = cart.map((item) => {
      if (item._id === pid) {
        const newQty = (item.quantity || 1) - 1;
        return { ...item, quantity: newQty > 0 ? newQty : 1 };
      }
      return item;
    });
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const subtotal = () =>
    cart?.reduce((total, item) => total + item.price * (item.quantity || 1), 0) || 0;

  const removeCartItem = (pid) => {
    const newCart = cart.filter((item) => item._id !== pid);
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    toast.success("Item removed from cart");
  };

  // useEffect(() => {
  //   axios.get("/api/v1/product/braintree/token").catch(console.log);
  // }, [auth?.token]);

  return (
    <Layout>
      <div className="container py-5 " 
      // style={{backgroundColor:'#F5FAFA'}} 
      >
        <div className="row">
          {/* LEFT: Product List */}
          <div className="col-md-8">
            {cart.length > 0 && (
              <>
                {/* Header Row */}
                <div
                  className="d-flex align-items-center justify-content-between px-3 py-2 mb-2"
                  style={{
                    background: "#f9fafb",
                    borderRadius: "8px",
                    fontWeight: "500",
                    fontSize: "14px",
                  }}
                >
                  <div style={{ flex: 1 }}>Product</div>
                  <div style={{ width: "80px", textAlign: "center" }}>Price</div>
                  <div style={{ width: "100px", textAlign: "center" }}>Quantity</div>
                  <div style={{ width: "90px", textAlign: "right" }}>Total</div>
                  <div style={{ width: "50px" }}></div>
                </div>

                {/* Product Items */}
                {cart.map((item) => (
                  <div
                    key={item._id}
                    className="d-flex align-items-center justify-content-between p-3 mb-3"
                    style={{
                      backgroundColor: "#fff",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      boxShadow: "0px 6px 15px rgba(0,0,0,0.08)",
                    }}
                  >
                    {/* Product Info */}
                    <div className="d-flex align-items-center" style={{ flex: 1 }}>
                      <img
                        src={`/api/v1/product/product-photo/${item._id}`}
                        alt={item.name}
                        style={{
                          width: "90px",
                          height: "120px",
                          objectFit: "cover",
                          borderRadius: "4px",
                          marginRight: "15px",
                        }}
                      />
                      <div>
                        <small style={{ color: "#6b7280", fontSize: "12px" }}>{item.categoryName}</small>
                        <h6 style={{ marginBottom: "4px", fontWeight: "500" }}>{item.name}</h6>
                        {/* <p style={{ margin: "0", fontSize: "14px", color: "#555" }}>Color: Blue</p>
                        <p style={{ margin: "0", fontSize: "14px", color: "#555" }}>Size: 42</p> */}
                      </div>
                    </div>

                    {/* Price */}
                    <div style={{ width: "80px", textAlign: "center", fontSize: "14px" }}>
                      ${item.price.toFixed(2)}
                    </div>

                    {/* Quantity */}
                    <div
                      className="d-flex align-items-center"
                      style={{ width: "100px", justifyContent: "center" }}
                    >
                      <button
                        onClick={() => decrementQty(item._id)}
                        style={{
                          background: "#f3f4f6",
                          border: "1px solid #d1d5db",
                          padding: "4px 10px",
                          borderRadius: "4px",
                        }}
                      >
                        -
                      </button>
                      <span style={{ margin: "0 10px" }}>{item.quantity || 1}</span>
                      <button
                        onClick={() => incrementQty(item._id)}
                        style={{
                          background: "#f3f4f6",
                          border: "1px solid #d1d5db",
                          padding: "4px 10px",
                          borderRadius: "4px",
                        }}
                      >
                        +
                      </button>
                    </div>

                    {/* Total Price */}
                    <div
                      style={{
                        width: "90px",
                        textAlign: "right",
                        fontWeight: "500",
                        color: "#42BAC9",
                     
                      }}
                    >
                      ${(item.price * (item.quantity || 1)).toFixed(2)}
                    </div>

                    {/* Remove Button */}
                    <div style={{ width: "50px", textAlign: "center" }}>
                      <button
                        onClick={() => removeCartItem(item._id)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#ef4444",
                          cursor: "pointer",
                        }}
                      >
                        <RiDeleteBin6Line size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}

            {!cart.length && <p>Your cart is empty.</p>}
          </div>

          {/* RIGHT: Order Summary */}
          <div className="col-md-4"
          //  style={{   marginTop:"45px"}}
           >
            {cart.length > 0 && (
              <div
                className="p-4"
                style={{
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0px 6px 15px rgba(0,0,0,0.08)",
                }}
              >
                <h5 style={{ fontWeight: "500" }}>Order Summary</h5>
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
                  onClick={() => navigate(auth?.token ? "/checkout" : "/login")}
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CartPage;
