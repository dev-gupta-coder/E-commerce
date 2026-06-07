// ============================================================
//  src/controllers/cart.controller.js
//
//  Responsibility:
//    Handle HTTP layer for the cart domain — validate inputs,
//    coordinate Cart + Product models, send responses.
//    No raw MongoDB queries — all DB access goes through Models.
//
//  Operations:
//    getCart          GET    /api/v1/cart
//    addToCart        POST   /api/v1/cart/items
//    updateCartItem   PATCH  /api/v1/cart/items/:itemId
//    removeCartItem   DELETE /api/v1/cart/items/:itemId
//    clearCart        DELETE /api/v1/cart
//
//  Cart lifecycle:
//    Created LAZILY on the first addToCart call (no dedicated
//    "create cart" endpoint).  Persists between sessions.
//
//  Security:
//    All routes are protected by verifyJWT.  Every DB query is
//    scoped to req.user._id — users cannot access each other's carts.
//
//  Price integrity:
//    priceAtAddition is always taken from the Product document
//    server-side — never from req.body — to prevent price spoofing.
// ============================================================

import mongoose          from "mongoose";
import { Cart }          from "../models/Cart.model.js";
import { Product }       from "../models/Product.model.js";
import { ApiError }      from "../utils/ApiError.js";
import { ApiResponse }   from "../utils/ApiResponse.js";
import { asyncHandler }  from "../utils/asyncHandler.js";

// ============================================================
//  CONSTANTS
// ============================================================
const MAX_CART_ITEMS = 50;
const MAX_ITEM_QTY   = 10;
const MIN_ITEM_QTY   = 1;

// ============================================================
//  HELPER — isValidObjectId
// ============================================================
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// ============================================================
//  HELPER — populateCart
//  Chains .populate() onto any Cart query.
//  Selects only the product fields the cart UI needs —
//  avoids pulling description, reviews, and other heavy fields.
// ============================================================
const populateCart = (query) =>
  query.populate({
    path:   "items.product",
    select: "name images price discountPrice stock isActive",
  });

// ============================================================
//  HELPER — formatCartResponse
//  Shapes a populated Cart document into the API response.
//
//  Adds per-item derived fields:
//    currentPrice    — live price (for "price changed" UI notice)
//    lineTotal       — priceAtAddition × quantity
//    priceChanged    — boolean: product price changed since add
//    isAvailable     — boolean: product still active and in stock
//    hasEnoughStock  — boolean: sufficient stock for chosen qty
//    status          — single string summarising item health
//
//  The status enum lets the frontend drive UI state (disable
//  checkout, show warning banners) with a simple switch.
// ============================================================
const formatCartResponse = (cart) => {
  const items = cart.items.map((item) => {
    const product = item.product;

    // Null guard — product hard-deleted after cart add (rare with soft-delete)
    if (!product) {
      return {
        _id:             item._id,
        product:         null,
        quantity:        item.quantity,
        priceAtAddition: item.priceAtAddition,
        lineTotal:       item.priceAtAddition * item.quantity,
        currentPrice:    null,
        priceChanged:    false,
        isAvailable:     false,
        hasEnoughStock:  false,
        status:          "product_unavailable",
      };
    }

    // Current effective price of the product at this moment.
    const currentPrice =
      product.discountPrice !== null && product.discountPrice < product.price
        ? product.discountPrice
        : product.price;

    const priceChanged     = currentPrice !== item.priceAtAddition;
    const isAvailable      = product.isActive && product.stock > 0;
    const hasEnoughStock   = product.isActive && product.stock >= item.quantity;

    // Determine the item's checkout status — drives UI warnings.
    let status = "available";
    if (!product.isActive)      status = "discontinued";
    else if (product.stock < 1) status = "out_of_stock";
    else if (!hasEnoughStock)   status = "insufficient_stock";
    else if (priceChanged)      status = "price_changed";

    return {
      _id:  item._id,
      product: {
        _id:      product._id,
        name:     product.name,
        image:    product.images?.[0] ?? null,   // first image as thumbnail
        isActive: product.isActive,
        stock:    product.stock,
      },
      quantity:        item.quantity,
      priceAtAddition: item.priceAtAddition,   // snapshot: what user agreed to
      currentPrice,                            // live: for comparison display
      lineTotal:       item.priceAtAddition * item.quantity,
      priceChanged,
      isAvailable,
      hasEnoughStock,
      status,
    };
  });

  // Subtotal from price snapshots — authoritative for checkout.
  const subtotal = items.reduce((sum, i) => sum + (i.lineTotal ?? 0), 0);

  // Checkout is ready only when every item is available or price_changed.
  // (price_changed items are checkoutable — frontend shows a notice.)
  const isCheckoutReady =
    items.length > 0 &&
    items.every((i) => i.status === "available" || i.status === "price_changed");

  return {
    _id:            cart._id,
    user:           cart.user,
    items,
    itemCount:      cart.itemCount,       // virtual: unique product lines
    totalQuantity:  cart.totalQuantity,   // virtual: sum of all quantities
    subtotal,                             // paise — frontend divides by 100
    isCheckoutReady,
    updatedAt:      cart.updatedAt,
    createdAt:      cart.createdAt,
  };
};

// ============================================================
//  getCart
//  GET /api/v1/cart
//
//  Returns the user's cart or a synthetic empty-cart object.
//  Never returns 404 — an empty cart is a valid, normal state.
// ============================================================
export const getCart = asyncHandler(async (req, res) => {

  const cart = await populateCart(
    Cart.findOne({ user: req.user._id })
  );

  if (!cart) {
    // First visit — no cart document exists yet.
    // Return an empty-cart shape so the frontend has a consistent
    // data structure from the first render onward.
    return res.status(200).json(
      new ApiResponse(
        200,
        { _id: null, items: [], itemCount: 0, totalQuantity: 0, subtotal: 0, isCheckoutReady: false },
        "Your cart is empty."
      )
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, formatCartResponse(cart), "Cart fetched successfully."));
});

// ============================================================
//  addToCart
//  POST /api/v1/cart/items
//  Body: { productId, quantity }
//
//  Flow:
//    1. Validate inputs.
//    2. Fetch product — check active + stock.
//    3. Snapshot effectivePrice (server-side, not from body).
//    4. Find or create the cart document.
//    5. If product already in cart → increment quantity.
//       If new → push new item (check MAX_CART_ITEMS cap).
//    6. Save, re-fetch with population, respond.
// ============================================================
export const addToCart = asyncHandler(async (req, res) => {

  const { productId, quantity: rawQty } = req.body;

  // ── Input validation ────────────────────────────────────
  if (!productId || !isValidObjectId(productId)) {
    throw new ApiError(400, "A valid product ID is required.");
  }

  const quantity = parseInt(rawQty, 10);
  if (!Number.isInteger(quantity) || quantity < MIN_ITEM_QTY) {
    throw new ApiError(400, `Quantity must be a whole number ≥ ${MIN_ITEM_QTY}.`);
  }
  if (quantity > MAX_ITEM_QTY) {
    throw new ApiError(400, `Maximum ${MAX_ITEM_QTY} units per product.`);
  }

  // ── Validate product ────────────────────────────────────
  const product = await Product.findById(productId);

  if (!product || !product.isActive) {
    throw new ApiError(404, "Product not found or no longer available.");
  }
  if (product.stock < 1) {
    throw new ApiError(400, `"${product.name}" is out of stock.`);
  }
  if (product.stock < quantity) {
    throw new ApiError(400, `Only ${product.stock} unit(s) of "${product.name}" available.`);
  }

  // ── Snapshot the price (server-side) ────────────────────
  // NEVER trust the client for price — always read from the DB.
  const effectivePrice =
    product.discountPrice !== null && product.discountPrice < product.price
      ? product.discountPrice
      : product.price;

  // ── Find or create cart ─────────────────────────────────
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [] });
  }

  // ── Existing item: increment quantity ───────────────────
  const existingItem = cart.getItemByProductId(productId);

  if (existingItem) {
    const newQty = existingItem.quantity + quantity;

    if (newQty > MAX_ITEM_QTY) {
      throw new ApiError(
        400,
        `Adding ${quantity} unit(s) would exceed the max of ${MAX_ITEM_QTY}. ` +
        `You already have ${existingItem.quantity} in your cart.`
      );
    }
    if (newQty > product.stock) {
      throw new ApiError(
        400,
        `Only ${product.stock} unit(s) available. ` +
        `You already have ${existingItem.quantity} in your cart.`
      );
    }

    existingItem.quantity = newQty;

  } else {
    // ── New item: check cart cap, then push ─────────────────
    if (cart.items.length >= MAX_CART_ITEMS) {
      throw new ApiError(
        400,
        `Cart is full (max ${MAX_CART_ITEMS} unique products). Remove an item first.`
      );
    }

    cart.items.push({
      product:         productId,
      quantity,
      priceAtAddition: effectivePrice,   // snapshot stored here
    });
  }

  await cart.save();

  // Re-fetch with population — .save() returns the un-populated doc.
  const updatedCart = await populateCart(Cart.findById(cart._id));

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        formatCartResponse(updatedCart),
        `"${product.name}" added to cart.`
      )
    );
});

// ============================================================
//  updateCartItem
//  PATCH /api/v1/cart/items/:itemId
//  Body: { quantity }
//
//  Updates quantity of a single line item identified by its
//  sub-document _id.  Uses MongoDB positional $ operator for
//  an atomic single-element update.
// ============================================================
export const updateCartItem = asyncHandler(async (req, res) => {

  const { itemId }           = req.params;
  const { quantity: rawQty } = req.body;

  // ── Validate itemId ─────────────────────────────────────
  if (!itemId || !isValidObjectId(itemId)) {
    throw new ApiError(400, "A valid cart item ID is required.");
  }

  // ── Validate quantity ───────────────────────────────────
  const quantity = parseInt(rawQty, 10);
  if (!Number.isInteger(quantity) || quantity < MIN_ITEM_QTY) {
    throw new ApiError(400, `Quantity must be a whole number ≥ ${MIN_ITEM_QTY}.`);
  }
  if (quantity > MAX_ITEM_QTY) {
    throw new ApiError(400, `Maximum ${MAX_ITEM_QTY} units per item.`);
  }

  // ── Fetch cart + item ────────────────────────────────────
  // Scoped to req.user._id — prevents cross-user item updates.
  const cart = await Cart.findOne({
    user:        req.user._id,
    "items._id": itemId,
  });

  if (!cart) {
    throw new ApiError(404, "Cart item not found.");
  }

  // Locate the item to get its product reference.
  // Mongoose DocumentArray.id() finds a sub-doc by its _id.
  const item = cart.items.id(itemId);

  // ── Validate against live stock ─────────────────────────
  const product = await Product.findById(item.product);

  if (!product || !product.isActive) {
    throw new ApiError(400, "This product is no longer available. Please remove it.");
  }
  if (product.stock < quantity) {
    throw new ApiError(400, `Only ${product.stock} unit(s) of "${product.name}" available.`);
  }

  // ── Atomic update with positional $ operator ─────────────
  // "items.$.quantity" — $ refers to the array element matched
  // by the "items._id": itemId condition in the filter.
  // This avoids a read-modify-write race condition.
  const updatedCart = await populateCart(
    Cart.findOneAndUpdate(
      { user: req.user._id, "items._id": itemId },
      { $set: { "items.$.quantity": quantity } },
      { new: true, runValidators: true }
    )
  );

  return res
    .status(200)
    .json(new ApiResponse(200, formatCartResponse(updatedCart), "Cart updated."));
});

// ============================================================
//  removeCartItem
//  DELETE /api/v1/cart/items/:itemId
//
//  Atomically removes a single item using MongoDB $pull.
//  $pull is preferred over read-modify-splice-save because it
//  avoids a round-trip and is safe under concurrent requests.
// ============================================================
export const removeCartItem = asyncHandler(async (req, res) => {

  const { itemId } = req.params;

  if (!itemId || !isValidObjectId(itemId)) {
    throw new ApiError(400, "A valid cart item ID is required.");
  }

  // $pull atomically removes the element matching { _id: itemId }.
  // Scoped to req.user._id — no cross-user deletions possible.
  const updatedCart = await populateCart(
    Cart.findOneAndUpdate(
      { user: req.user._id },
      { $pull: { items: { _id: itemId } } },
      { new: true }
    )
  );

  if (!updatedCart) {
    throw new ApiError(404, "Cart not found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, formatCartResponse(updatedCart), "Item removed from cart."));
});

// ============================================================
//  clearCart
//  DELETE /api/v1/cart
//
//  Empties the cart without deleting the document.
//  Called by the order controller after a successful checkout.
// ============================================================
export const clearCart = asyncHandler(async (req, res) => {

  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    { $set: { items: [] } },
    { new: true }
  );

  if (!cart) {
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Cart is already empty."));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Cart cleared successfully."));
});