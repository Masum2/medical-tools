import express from "express";
import { 
  forgotPasswordController, 
  loginController, 
  registerController, 
  testController, 
  updateProfileController,
  facebookLoginSuccess,
  facebookLoginFailure
} from "../controllers/authController.js";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import { getAllUsers } from "../controllers/userController.js";
import passport from "../config/passport.js";
import userModels from "../models/userModels.js";
import JWT from "jsonwebtoken";
//router object
const router = express.Router();

//routing
//REGISTER || METHOD POST
router.post("/register", registerController);

//LOGIN || POST
router.post("/login", loginController);

router.get("/facebook", passport.authenticate('facebook', { scope: ['email'] }));

router.get("/facebook/callback",
  passport.authenticate('facebook', { 
    failureRedirect: '/api/v1/auth/facebook/failure',
    session: false 
  }),
  facebookLoginSuccess
);

router.get("/facebook/failure", facebookLoginFailure);

router.get("/facebook/failure", facebookLoginFailure);
// forgot password
router.post('/forgot-password', forgotPasswordController);

//protected user route auth
router.get("/user-auth", requireSignIn, (req, res) => {
  res.status(200).send({ ok: true });
});

//protected admin route auth
router.get("/admin-auth", requireSignIn, isAdmin, (req, res) => {
  res.status(200).send({ ok: true });
});

//update profile
router.put("/profile", requireSignIn, updateProfileController);

router.post("/test", requireSignIn, isAdmin, testController);

// all user
router.get("/all-users", requireSignIn, isAdmin, getAllUsers);
// Facebook token verification route
router.post("/facebook/verify", async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).send({
        success: false,
        message: "Token is required"
      });
    }
    
    // Verify JWT token
    const decoded = JWT.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await userModels.findById(decoded._id);
    
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found"
      });
    }
    
    res.status(200).send({
      success: true,
      message: "Facebook login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        avatar: user.avatar
      },
      token: token
    });
    
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in token verification",
      error
    });
  }
});
//google
// Google login
router.get("/google", passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get("/google/callback",
  passport.authenticate('google', {
    failureRedirect: '/api/v1/auth/google/failure',
    session: false
  }),
  async (req, res) => {
    try {
      const token = await JWT.sign(
        { _id: req.user._id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Redirect to client with token
      res.redirect(`${process.env.CLIENT_URL}/login?token=${token}`);
    } catch (error) {
      console.error('Google callback error:', error);
      res.redirect(`${process.env.CLIENT_URL}/login?error=google_failed`);
    }
  }
);
// routes/authRoute.js
router.post("/social/verify", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: "Token is required" });
    }

    const decoded = JWT.verify(token, process.env.JWT_SECRET);
    const user = await userModels.findById(decoded._id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      user,
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(401).json({ success: false, message: "Invalid token" });
  }
});

router.get("/google/failure", (req, res) => {
  res.redirect(`${process.env.CLIENT_URL}/login?error=google_failed`);
});

export default router;