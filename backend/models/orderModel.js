// models/orderModel.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    products: [
      {
        product: {
          type: mongoose.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
    buyer: {
      type: mongoose.ObjectId,
      ref: "users",
      required: true,
    },
    shippingInfo: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      district: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      enum: ["bkash", "nogod", "cod","bank"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
    paymentScreenshot: {
  type: String, // আমরা URL বা file path store করব
  required: function () {
    return this.paymentMethod !== "cod"; // cod হলে required না
  },
},
    orderStatus: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered"],
      default: "pending",
    },
    totalAmount: {
      type: Number,
      required: true,
    },
  },
  
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
