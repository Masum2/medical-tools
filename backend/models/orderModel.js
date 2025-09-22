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
        brand: { type: String },
        color: { type: String },
        size: { type: String },

        // 🟢 price fields যোগ করো
        price: { type: Number, required: true },          // original price
        discountPrice: { type: Number, default: 0 },      // discounted price
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
      area: { type: String },
      shippingFee: { type: Number, default: 0 },
    },
    paymentMethod: {
      type: String,
      enum: ["bkash", "nogod", "cod", "bank"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
    paymentScreenshot: {
      data: {
        type: Buffer,
        required: function () {
          return this.paymentMethod !== "cod";
        },
      },
      contentType: {
        type: String,
        required: function () {
          return this.paymentMethod !== "cod";
        },
      },
    },
    orderStatus: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered"],
      default: "pending",
    },
    subTotal: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
