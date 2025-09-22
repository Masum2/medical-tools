import orderModel from "../models/orderModel.js";
import userModels from "../models/userModels.js";
import fs from "fs";
// create order
// create order
// create order

// create order
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
      area,
      paymentMethod,
      shippingFee, // frontend থেকে আসতে পারে
      color,
      brand,
      size,
    } = req.fields;

    const { paymentScreenshot } = req.files;

    if (!cart) {
      return res.status(400).send({ success: false, error: "Cart is empty" });
    }

    // 🟢 cart parse
    let parsedCart = [];
    try {
      parsedCart = JSON.parse(cart);
    } catch (err) {
      return res
        .status(400)
        .send({ success: false, error: "Invalid cart format" });
    }

    // 🟢 subtotal
    const subtotal = parsedCart.reduce(
      (acc, item) => acc + item.discountPrice * (item.quantity || 1),
      0
    );

    // 🟢 shipping fee
    const shippingFeeNum = (() => {
      if (shippingFee) return Number(shippingFee);
      if (district === "Dhaka") return area === "Dhaka City" ? 70 : 140;
      if (district) return 140;
      return 0;
    })();

    console.log("Shipping Fee to save:", shippingFeeNum); // debug

    // 🟢 order object
    const order = new orderModel({
      products: parsedCart.map((item) => ({
        product: item._id,
        quantity: item.quantity || 1,
    price: item.price,                   // ✅ original price
    discountPrice: item.discountPrice,   // ✅ discounted price
        brand: item.brand,
        color: item.color,
        size: item.size,
     
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
        area,
        shippingFee: shippingFeeNum, // ✅ shippingFee inside shippingInfo
      },
      shippingFee: shippingFeeNum, // ✅ root level shippingFee
      paymentMethod,
      subTotal: subtotal,        
      discount: 0,               
      totalAmount: subtotal + shippingFeeNum,  
    });

    // 🟢 file upload
    if (paymentScreenshot) {
      order.paymentScreenshot = {
        data: fs.readFileSync(paymentScreenshot.path),
        contentType: paymentScreenshot.type,
      };
    }

    await order.save();

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

    // convert binary to base64 for frontend
    const formattedOrders = orders.map((order) => {
      if (order.paymentScreenshot?.data) {
        order.paymentScreenshot = {
          contentType: order.paymentScreenshot.contentType,
          base64: order.paymentScreenshot.data.toString("base64"),
        };
      }
      return order;
    });

    res.status(200).send({
      success: true,
      message: "User orders fetched successfully",
      data: formattedOrders,
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
      // .populate("products.product", "name price")
      .populate("products.product", "name price discountPrice photos")
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
