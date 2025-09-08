import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false }, // optional for social login
    answer: { type: String, default: "local_login" },
    phone: { type: String, default: "Not provided" },
    address: {
      type: mongoose.Schema.Types.Mixed,
      default: {
        street: "Not provided",
        city: "Not provided",
        state: "Not provided",
        zipCode: "Not provided",
        country: "Not provided",
      },
    },
    role: { type: Number, default: 0 },

    // Social IDs
    facebookId: { type: String, sparse: true },
    googleId: { type: String, sparse: true },

    avatar: { type: String },
    loginMethod: {
      type: String,
      enum: ["local", "facebook", "google"],
      default: "local",
    },
  },
  { timestamps: true }
);

// Indexes
userSchema.index({ facebookId: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ email: 1 });

export default mongoose.model("users", userSchema);
