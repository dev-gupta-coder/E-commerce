// ============================================================
//  src/models/Product.model.js
//
//  Responsibility:
//    Define the MongoDB document structure for a Product,
//    enforce field-level validation, maintain a denormalised
//    ratings summary (avgRating + numReviews), and expose
//    static query helpers used by the controller.
//
//  Collection: "products"  (Mongoose auto-pluralises)
//
//  Sub-documents (embedded):
//    images[]   — Cloudinary asset references (no separate collection)
//    reviews[]  — customer ratings + comments (embedded for read speed)
//
//  Why embed reviews instead of referencing a Review collection?
//    For a single-owner store the product catalogue is the
//    primary read surface.  Embedding means one DB read returns
//    the product AND its reviews — no $lookup / populate needed.
//    Trade-off: very high-review products (1000+) should be
//    split into a separate Reviews collection; fine for now.
//
//  Exported:
//    Product — the compiled Mongoose Model
// ============================================================

import mongoose from "mongoose";

// ============================================================
//  CONSTANTS
// ============================================================

// Maximum images allowed per product.
// Enforced at the application layer (controller + validator) AND
// via a Mongoose path-level validator below as a safety net.
const MAX_IMAGES = 10;

// Valid category strings.  Centralised here so the enum is the
// single source of truth — routes, validators, and the model
// all import from here if needed.
export const PRODUCT_CATEGORIES = Object.freeze([
  "Electronics",
  "Clothing",
  "Books",
  "Home & Kitchen",
  "Sports",
  "Beauty",
  "Toys",
  "Automotive",
  "Grocery",
  "Other",
]);

// ============================================================
//  IMAGE SUB-SCHEMA
//  Stores a reference to a Cloudinary-hosted image.
//
//  url        — the full HTTPS Cloudinary delivery URL.
//               Never store the raw upload path — always the
//               final delivery URL so the frontend can use it
//               without any transformation.
//
//  publicId   — Cloudinary's asset identifier.
//               Required to call cloudinary.uploader.destroy()
//               when the product is deleted or an image is
//               replaced.  Without this we leak Cloudinary storage.
//
//  altText    — accessibility description for screen readers
//               and SEO.  Optional but strongly encouraged.
// ============================================================
const imageSchema = new mongoose.Schema(
  {
    url: {
      type:     String,
      required: [true, "Image URL is required."],
      trim:     true,
    },
    publicId: {
      type:     String,
      required: [true, "Cloudinary public ID is required."],
      trim:     true,
    },
    altText: {
      type:    String,
      trim:    true,
      default: "",
      maxlength: [200, "Alt text must not exceed 200 characters."],
    },
  },
  { _id: true }
  // _id: true (default) — each image gets its own ObjectId so
  // the controller can update or delete a specific image by ID.
);

// ============================================================
//  REVIEW SUB-SCHEMA
//  Embedded per-product review left by an authenticated customer.
//
//  user       — ObjectId ref to the User who left the review.
//               Used by authorizeOwnership middleware to verify
//               that a delete request comes from the review's author.
//
//  rating     — Integer 1–5.  min/max enforced at schema level.
//
//  comment    — Optional free-text review body.
//
//  createdAt  — Handled by timestamps: true on the sub-schema.
// ============================================================
const reviewSchema = new mongoose.Schema(
  {
    // ── Reviewer reference ─────────────────────────────────
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: [true, "Review must be linked to a user."],
    },

    // ── Star rating ────────────────────────────────────────
    // min/max validators run on every save; a malformed request
    // that bypasses the validation middleware is still rejected.
    rating: {
      type:     Number,
      required: [true, "Rating is required."],
      min:      [1, "Rating must be at least 1."],
      max:      [5, "Rating must not exceed 5."],
    },

    // ── Written review ─────────────────────────────────────
    comment: {
      type:      String,
      trim:      true,
      default:   "",
      maxlength: [1000, "Review comment must not exceed 1000 characters."],
    },
  },
  {
    // Each embedded review gets its own createdAt / updatedAt.
    // Used to display "reviewed 3 days ago" in the UI.
    timestamps: true,
  }
);

// ============================================================
//  PRODUCT SCHEMA
// ============================================================
const productSchema = new mongoose.Schema(
  {
    // ── Name ───────────────────────────────────────────────
    // trim removes accidental whitespace.
    // unique: false — two products can share a name (e.g., same
    // item in different colour/size variants).  SKU or slug
    // should be the unique identifier for deduplication.
    name: {
      type:      String,
      required:  [true, "Product name is required."],
      trim:      true,
      minlength: [3, "Product name must be at least 3 characters."],
      maxlength: [200, "Product name must not exceed 200 characters."],
      // Text index is declared below with productSchema.index()
      // so it can be combined with other fields in a compound index.
    },

    // ── Description ────────────────────────────────────────
    // Long-form HTML or markdown accepted — the frontend renders it.
    // maxlength prevents absurdly large documents that would
    // balloon the collection's average document size.
    description: {
      type:      String,
      required:  [true, "Product description is required."],
      trim:      true,
      minlength: [10, "Description must be at least 10 characters."],
      maxlength: [5000, "Description must not exceed 5000 characters."],
    },

    // ── Category ───────────────────────────────────────────
    // Enum enforced at the schema level — no arbitrary strings
    // can be stored even if validation middleware is bypassed.
    category: {
      type:     String,
      required: [true, "Category is required."],
      enum: {
        values:  PRODUCT_CATEGORIES,
        message: `Category must be one of: ${PRODUCT_CATEGORIES.join(", ")}.`,
      },
    },

    // ── Brand ──────────────────────────────────────────────
    brand: {
      type:      String,
      required:  [true, "Brand is required."],
      trim:      true,
      maxlength: [100, "Brand name must not exceed 100 characters."],
    },

    // ── Price ──────────────────────────────────────────────
    // Stored in the smallest currency unit (paise) to avoid
    // floating-point arithmetic errors:
    //   ₹999.99 → stored as 99999 (paise)
    // The frontend divides by 100 for display.
    //
    // Alternatively, store as a Number with fixed 2 decimal places
    // and use mongoose-currency or a dedicated money library.
    // Paise integers are simpler and safer for a small store.
    price: {
      type:     Number,
      required: [true, "Price is required."],
      min:      [0, "Price cannot be negative."],
      // No max — product prices can be anything.
    },

    // ── Discount Price ─────────────────────────────────────
    // Optional sale price.  Must be less than `price` — enforced
    // by the custom validator below.
    discountPrice: {
      type:    Number,
      default: null,
      min:     [0, "Discount price cannot be negative."],
      validate: {
        // Custom cross-field validator.
        // `this` refers to the current document being validated.
        validator: function (value) {
          // If no discount price is set, it's valid.
          if (value === null || value === undefined) return true;
          // Discount price must be strictly less than the regular price.
          return value < this.price;
        },
        message: "Discount price must be less than the regular price.",
      },
    },

    // ── Stock ──────────────────────────────────────────────
    // Integer unit count.  Mongoose rounds floats with
    // the custom validator below.  Negative stock is meaningless
    // in business terms — the minimum is 0 (out of stock).
    stock: {
      type:     Number,
      required: [true, "Stock quantity is required."],
      min:      [0, "Stock cannot be negative."],
      default:  0,
      validate: {
        validator: Number.isInteger,
        message:   "Stock must be a whole number.",
      },
    },

    // ── Images ─────────────────────────────────────────────
    // Array of imageSchema sub-documents (Cloudinary assets).
    // Path-level validator enforces the max-images cap here
    // as a DB-level safety net (controller also checks this).
    images: {
      type:    [imageSchema],
      default: [],
      validate: {
        validator: function (images) {
          return images.length <= MAX_IMAGES;
        },
        message: `A product can have at most ${MAX_IMAGES} images.`,
      },
    },

    // ── Ratings summary (denormalised) ─────────────────────
    // These two fields are recomputed after every review add/delete
    // by the recalculateRatings() method below.
    //
    // Why denormalise instead of aggregating on read?
    //   Aggregating reviews on every product-list request would
    //   require a $lookup + $group pipeline — expensive on large
    //   collections.  Storing the pre-computed average is an
    //   intentional read-optimisation at the cost of slightly
    //   more complex write logic.
    avgRating: {
      type:    Number,
      default: 0,
      min:     0,
      max:     5,
      // Round to 1 decimal place in the setter before storing.
      set:     (v) => Math.round(v * 10) / 10,
    },

    numReviews: {
      type:    Number,
      default: 0,
      min:     0,
    },

    // ── Reviews ────────────────────────────────────────────
    // Array of embedded reviewSchema sub-documents.
    reviews: {
      type:    [reviewSchema],
      default: [],
    },

    // ── Featured flag ──────────────────────────────────────
    // Admin can pin products to the homepage / featured section.
    isFeatured: {
      type:    Boolean,
      default: false,
    },

    // ── Soft-delete flag ───────────────────────────────────
    // isActive: false hides the product from all public queries
    // without permanently deleting it from the DB.
    // Useful for temporarily pulling a product while keeping
    // its order history intact.
    isActive: {
      type:    Boolean,
      default: true,
    },
  },

  {
    timestamps: true,  // createdAt + updatedAt managed by Mongoose
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ============================================================
//  INDEXES
//  Declared together at the bottom for visibility.
//
//  Text index (name + description)
//    Powers the ?search= query parameter via MongoDB's full-text
//    search.  MongoDB allows only ONE text index per collection,
//    so all searchable fields must be in the same index.
//    The weight gives "name" matches 3× the relevance score
//    of "description" matches — searching "iPhone" surfaces
//    products named "iPhone" above ones that merely mention it.
//
//  Compound index (category, price)
//    Optimises the most common catalogue query:
//    "show me Electronics sorted by price ascending".
//    A compound index serves both the category filter AND
//    the price sort in a single index scan.
//
//  Single-field indexes
//    brand, isFeatured, isActive — common filter dimensions
//    that appear frequently in dashboard and catalogue queries.
// ============================================================

// Full-text search across name and description
productSchema.index(
  { name: "text", description: "text" },
  { weights: { name: 3, description: 1 }, name: "product_text_search" }
);

// Catalogue filter: category + price sort
productSchema.index({ category: 1, price: 1 });

// Dashboard / homepage queries
productSchema.index({ brand: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ isActive: 1 });

// Admin stock management — quickly find low/out-of-stock products
productSchema.index({ stock: 1 });

// ============================================================
//  VIRTUAL — effectivePrice
//  Computed property: returns discountPrice if set, else price.
//  The frontend displays this as the "current price" and uses
//  `price` (if different) as the struck-through original price.
//
//  Virtual = not stored in DB, computed on every access.
//  Included in toJSON / toObject output because virtuals: true.
// ============================================================
productSchema.virtual("effectivePrice").get(function () {
  // `this` is the current document instance.
  return this.discountPrice !== null && this.discountPrice !== undefined
    ? this.discountPrice
    : this.price;
});

// ============================================================
//  VIRTUAL — isInStock
//  Boolean convenience flag consumed by the frontend to show
//  "In Stock" / "Out of Stock" badges without if-else logic.
// ============================================================
productSchema.virtual("isInStock").get(function () {
  return this.stock > 0;
});

// ============================================================
//  INSTANCE METHOD — recalculateRatings
//  Recomputes avgRating and numReviews from the embedded
//  reviews array and saves the product.
//
//  Called by the controller after every addReview / deleteReview
//  operation to keep the denormalised summary in sync.
//
//  Why not use a post-save hook?
//    Post-save hooks fire on every save — including price updates,
//    stock changes, etc. — causing unnecessary recomputation.
//    An explicit method called only when reviews change is cleaner.
//
//  @returns {Promise<void>}
// ============================================================
productSchema.methods.recalculateRatings = async function () {
  if (this.reviews.length === 0) {
    this.avgRating  = 0;
    this.numReviews = 0;
  } else {
    const total = this.reviews.reduce((sum, r) => sum + r.rating, 0);
    this.avgRating  = total / this.reviews.length; // setter rounds to 1dp
    this.numReviews = this.reviews.length;
  }

  // validateBeforeSave: false — we only changed rating fields;
  // no need to re-validate name, price, images, etc.
  await this.save({ validateBeforeSave: false });
};

// ============================================================
//  MODEL COMPILATION
//  Guard against "Cannot overwrite model" errors in test suites
//  where the module may be re-evaluated between test files.
// ============================================================
export const Product = mongoose.models.Product
  ?? mongoose.model("Product", productSchema);