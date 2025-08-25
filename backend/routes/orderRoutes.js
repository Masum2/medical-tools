

import express from "express";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import { createOrderController, getAllOrdersController, getOrdersController, updateOrderStatusController } from "../controllers/orderController.js";
import orderModel from "../models/orderModel.js";


const router = express.Router();

// create order route
router.post("/create-order", requireSignIn, createOrderController);
// get my orders
router.get("/get-orders", requireSignIn, getOrdersController);

// get all orders (admin only)
router.get("/get-orders/all", requireSignIn, isAdmin, getAllOrdersController);
router.patch("/:id/status", requireSignIn, isAdmin, updateOrderStatusController);
export default router;
// get single order by id (admin only)
router.get("/:id", requireSignIn, isAdmin, async (req, res) => {
  try {
    const order = await orderModel
      .findById(req.params.id)
      .populate("buyer", "name email")
      .populate("products.product", "name price description"); // চাইলে description বা অন্য ফিল্ডও
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    res.json({ success: true, data: order });
  } catch (error) {
    console.error("Get single order error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
