import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    customerName: String,
    email: String,
    phone: String,
    address: {
      street: String,
      city: String,
      pincode: String,
    },
    orderType: {
      type: String,
      enum: ["normal", "custom"],
      default: "normal",
    },
    pickupDate: String,
    timeSlot: String,
    paymentMethod: String,

    products: [
      {
        name: String,
        price: Number,
        quantity: Number,
        image: String,
        size: {
          type: String,
          required: false,
        },
      },
    ],

    customCake: {
      size: String,
      flavor: String,
      shape: String,
      message: String,
      description: String,
      image: String,

      estimatedPrice: Number,
      finalPrice: Number,
    },

    totalAmount: Number,
    status: {
      type: String,
      default: "Pending",
    },
    rejectionReason: String,
    isNotified: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.models.Order || mongoose.model("Order", orderSchema);
