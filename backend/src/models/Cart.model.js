// ============================================================
//  src/models/Cart.model.js
//
//  Responsibility:
//    Define the MongoDB document structure for a shopping cart.
//    One cart document per user (1-to-1, enforced by unique index).
//
//  Reference strategy — HYBRID:
//    items[].product        → ObjectId ref to Product
//      Why ref: always reflects current product state (name, images,
//               stock, isActive) when populated.
//
//    items[].priceAtAddition → Number snapshot
//      Why snapshot: price the customer saw when clicking "Add to Cart".
//                    If the admin raises the price later, the cart total
//                    still reflects the agreed price. This is the
//                    authoritative price for order totals at checkout.
//
//  No totals persisted in the document.
//    Computed on-the-fly via instance methods / virtuals.
//    Persisting totals creates a sync problem when product prices change.
//
//  Exported:
//    cartItemSchema  — reusable sub-schema (also used by Order model)
//    Cart            — compiled Mongoose Model
// ============================================================

import mongoose from "mongoose";

// ============================================================
//  CONSTANTS
// ============================================================
const MAX_CART_ITEMS = 50;   // cap unique product lines in the cart
const MAX_ITEM_QTY   = 10;   // max units of one product per cart
const MIN_ITEM_QTY   = 1;    // quantity must be at least 1

// ============================================================
//  CART ITEM SUB-SCHEMA
//  Exported so Order.model.js can reuse the same line-item
//  structure without duplicating the schema definition.
// ============================================================
export const cartItemSchema = new mongoose.Schema(
  {
    // ── product reference ──────────────────────────────────
    // ObjectId FK into "products".  Not embedded because products
    // change independently (price, stock, name, isActive).
    // The controller enforces one entry per product per cart
    // (Mongoose cannot enforce array-element uniqueness natively).
    product: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Product",
      required: [true, "Product reference is required."],
    },

    // ── quantity ───────────────────────────────────────────
    // Whole-number units.  Stock availability is validated in the
    // controller — the schema only enforces structural bounds.
    quantity: {
      type:     Number,
      required: [true, "Quantity is required."],
      min:      [MIN_ITEM_QTY, `Minimum quantity is ${MIN_ITEM_QTY}.`],
      max:      [MAX_ITEM_QTY, `Maximum quantity per item is ${MAX_ITEM_QTY}.`],
      validate: {
        validator: Number.isInteger,
        message:   "Quantity must be a whole number.",
      },
    },

    // ── priceAtAddition ────────────────────────────────────
    // Snapshot of the product's effectivePrice at add-to-cart time.
    // Source of truth for cart subtotal and checkout order total.
    // Unit: paise (₹1 = 100 paise), matching Product.model.js.
    priceAtAddition: {
      type:     Number,
      required: [true, "Price at time of addition is required."],
      min:      [0, "Price cannot be negative."],
    },
  },
  {
    _id:        true,    // each item gets its own _id for targeted updates
    timestamps: false,   // cart-level updatedAt is sufficient
  }
);

// ============================================================
//  CART SCHEMA
// ============================================================
const cartSchema = new mongoose.Schema(
  {
    // ── user ──────────────────────────────────────────────
    // 1-to-1 FK into "users".  unique:true enforces one cart
    // per user at the database level.
    // Cart is created lazily on first "add to cart" via upsert.
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: [true, "Cart must belong to a user."],
      unique:   true,
    },

    // ── items ─────────────────────────────────────────────
    // Array of cartItemSchema sub-documents.
    // MAX_CART_ITEMS cap is enforced in the controller rather than
    // here because schema validators run before the array is written
    // and cannot easily count existing + incoming items together.
    items: {
      type:    [cartItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,    // createdAt (first add), updatedAt (last change)
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ============================================================
//  INDEXES
// ============================================================

// Already created by unique:true on user, but declared here
// explicitly so the index appears with a readable name in
// MongoDB Atlas and Compass dashboards.
cartSchema.index({ user: 1 }, { unique: true, name: "cart_user_unique" });

// Abandoned-cart recovery index:
//   db.carts.find({ updatedAt: { $lt: <24h ago> } })
// Powers scheduled jobs that email users who left items in cart.
cartSchema.index({ updatedAt: 1 });

// ============================================================
//  VIRTUALS
// ============================================================

// Number of unique product lines (cart badge: "🛒 3 items")
cartSchema.virtual("itemCount").get(function () {
  return this.items?.length ?? 0;
});

// Total units across all lines (alternative badge: "🛒 5 units")
cartSchema.virtual("totalQuantity").get(function () {
  return (this.items ?? []).reduce((sum, i) => sum + i.quantity, 0);
});

// Cart subtotal in paise — uses priceAtAddition snapshot,
// not the live product price, for checkout consistency.
cartSchema.virtual("subtotal").get(function () {
  return (this.items ?? []).reduce(
    (sum, i) => sum + i.priceAtAddition * i.quantity,
    0
  );
});

// ============================================================
//  INSTANCE METHOD — getItemByProductId
//  Finds a cart item by its product ObjectId.
//  Returns undefined when not found — callers handle the null case.
//
//  @param  {string|ObjectId} productId
//  @returns {CartItem|undefined}
// ============================================================
cartSchema.methods.getItemByProductId = function (productId) {
  return this.items.find(
    (item) => item.product.toString() === productId.toString()
  );
};

// ============================================================
//  MODEL COMPILATION
// ============================================================
export const Cart = mongoose.models.Cart
  ?? mongoose.model("Cart", cartSchema);