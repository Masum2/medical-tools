import express from "express";
import colors from "colors";
import dotenv from "dotenv";
import morgan from "morgan";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoute.js";
import categoryRoutes from './routes/categoryRoutes.js'
import productRoutes from './routes/productRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import reviewRoutes from './routes/reviewRoutes.js'
import formidable from "express-formidable";
import cors from "cors";
//configure env
dotenv.config();

//databse config
connectDB();

//rest object
const app = express();

//middelwares
// মিডলওয়্যার (formidable এখানে **নেই**)
app.use(cors({
  origin: ["https://medical-tools.vercel.app/"], // Vercel এর frontend link
  credentials: true
}));
app.use(express.json()); // JSON রিকোয়েস্ট পার্স করার জন্য
app.use(express.urlencoded({ extended: true })); // Form ডাটা পার্স করার জন্য
app.use(morgan("dev"));



//routes auth
app.use("/api/v1/auth", authRoutes);
// routes for category
app.use("/api/v1/category",categoryRoutes);
// routes for product
app.use("/api/v1/product",productRoutes);
// routes for order
app.use("/api/v1/order",orderRoutes);
// Routes
app.use("/api/v1/reviews", reviewRoutes);



//rest api
app.get("/", (req, res) => {
  res.send("<h1>Welcome to ecommerce app</h1>");
});

//PORT
const PORT = process.env.PORT || 8080;

//run listen
app.listen(PORT, () => {
  console.log(
    `Server Running on ${process.env.NODE_MODE} mode on port ${PORT}`.bgCyan
      .white
  );
});