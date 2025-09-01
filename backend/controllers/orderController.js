import orderModel from "../models/orderModel.js";
import userModels from "../models/userModels.js";

export const createOrderController = async (req, res) => {
  try {
    const {
      cart,
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      postalCode,
      district,
      paymentMethod,
    } = req.fields;  // 🟢 req.fields instead of req.body

    const { paymentScreenshot } = req.files; // 🟢 file আলাদা জায়গায় থাকবে

    if (!cart) {
      return res.status(400).send({ success: false, error: "Cart is empty" });
    }

    let parsedCart = [];
    try {
      parsedCart = JSON.parse(cart); // 🟢 কারণ frontend থেকে string পাঠাবে
    } catch (err) {
      return res.status(400).send({ success: false, error: "Invalid cart format" });
    }

    // calculate total
    const totalAmount = parsedCart.reduce(
      (acc, item) => acc + item.price * (item.quantity || 1),
      0
    );

    const order = await orderModel.create({
      products: parsedCart.map((item) => ({
        product: item._id,
        quantity: item.quantity || 1,
      })),
      buyer: req.user._id,
      shippingInfo: {
        firstName,
        lastName,
        email,
        phone,
        address,
        city,
        postalCode,
        district,
      },
      paymentMethod,
      paymentScreenshot: paymentScreenshot?.path || null, // লোকাল path save
      totalAmount,
    });

    res.status(201).send({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, error: "Failed to create order" });
  }
};

// get user orders
export const getOrdersController = async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const total = await orderModel.countDocuments({ buyer: req.user._id });

    const orders = await orderModel
      .find({ buyer: req.user._id })
      .populate("products.product", "name price")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.status(200).send({
      success: true,
      message: "User orders fetched successfully",
      data: orders, // ✅ matches frontend: setOrders(data.data)
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, error: "Failed to fetch orders" });
  }
};


// get all orders (admin only)
// controllers/orderController.js

export const getAllOrdersController = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};

    // filters
    if (req.query.status) {
      query.orderStatus = req.query.status;
    }
    if (req.query.paymentMethod) {
      query.paymentMethod = req.query.paymentMethod;
    }
    if (req.query.buyerEmail) {
      // we need to filter by buyer email (populated field)
      // -> first find buyer IDs matching that email
      const buyers = await userModels.find({
        email: { $regex: req.query.buyerEmail, $options: "i" }
      }).select("_id");
      query.buyer = { $in: buyers.map(b => b._id) };
    }

    const total = await orderModel.countDocuments(query);

    const orders = await orderModel
      .find(query)
      .populate("buyer", "name email")
      .populate("products.product", "name price")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        limit,
        total,
      },
    });
  } catch (error) {
    console.error("Get all orders error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch orders" });
  }
};
// controllers/orderController.js
export const updateOrderStatusController = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus, paymentStatus } = req.body;

    const order = await orderModel.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    await order.save();

    res.json({ success: true, message: "Order updated", order });
  } catch (error) {
    console.error("Update order error:", error);
    res.status(500).json({ success: false, error: "Failed to update order" });
  }
};
