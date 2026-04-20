import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number },
    category: { type: String, required: true },
    description: String,
    image: String,
    sizes: [
      {
        label: { type: String, required: true },
        price: { type: Number, required: true },
        isDefault: { type: Boolean, default: false },
      },
    ],
    inStock: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// ✅ for new products
ProductSchema.pre("save", function (next) {
  if (this.sizes && this.sizes.length > 0) {
    const defaults = this.sizes.filter((s) => s.isDefault);

    if (defaults.length > 1) {
      return next(new Error("Only one default size allowed"));
    }

    if (defaults.length === 0) {
      this.sizes[0].isDefault = true;
    }

    this.price = undefined;
  }
});

// ✅ for updates
ProductSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();

  const sizes = update.sizes || update.$set?.sizes;

  if (sizes) {
    const defaults = sizes.filter((s) => s.isDefault);

    if (defaults.length > 1) {
      return next(new Error("Only one default size allowed"));
    }

    if (sizes.length > 0 && defaults.length === 0) {
      sizes[0].isDefault = true;
    }

    if (update.$set) {
      update.$set.price = undefined;
    } else {
      update.price = undefined;
    }
  }
});

export default mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);
