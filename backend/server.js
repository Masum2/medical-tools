import express from "express";
import colors from "colors";
import dotenv from "dotenv";
import morgan from "morgan";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoute.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import cors from "cors";
import session from "express-session";
import passport from "./config/passport.js";

// configure env
dotenv.config();

// database config
connectDB();

// rest object
const app = express();

// ✅ Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || "https://medical-tools.vercel.app",
  credentials: true
}));

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || "ecommerce_secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_MODE === "production",
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

console.log("🔑 CLOUDINARY TEST:", process.env.CLOUDINARY_CLOUD_NAME);

// ✅ Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/order", orderRoutes);
app.use("/api/v1/reviews", reviewRoutes);

// root route
app.get("/", (req, res) => {
  res.send("<h1>Welcome to ecommerce app</h1>");
});

// PORT
const PORT = process.env.PORT || 8080;

// run listen
app.listen(PORT, () => {
  console.log(
    `Server Running on ${process.env.NODE_MODE} mode on port ${PORT}`.bgCyan
      .white
  );
});