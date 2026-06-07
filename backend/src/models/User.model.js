// ============================================================
//  src/models/User.model.js
//
//  Responsibility:
//    Define the MongoDB document structure for a User, enforce
//    field-level validation, hash passwords before persistence,
//    and expose instance methods for authentication logic.
//
//  Collections: "users"  (Mongoose pluralises the model name)
//
//  Relationships:
//    - wishlist[]  → references Product documents  (ObjectId ref)
//    - addresses[] → embedded sub-documents        (no separate collection)
//
//  Exported:
//    User  — the compiled Mongoose Model
// ============================================================

import mongoose  from "mongoose";
import bcrypt    from "bcryptjs";

// ============================================================
//  CONSTANTS
//  Centralised in one place so a single edit propagates
//  everywhere they are used — no magic numbers scattered across
//  the file.
//
//  SALT_ROUNDS
//    bcrypt's work-factor.  Each increment doubles the hashing
//    time.  12 is the 2024 industry standard:
//      - 10 → ~65 ms  (acceptable, but fast-approaching weak)
//      - 12 → ~250 ms (strong; negligible UX impact on login)
//      - 14 → ~1 s    (overkill for most applications)
//    Never store this as a plain number inline — if you ever
//    need to rotate the cost factor, you change one constant.
//
//  MOBILE_REGEX
//    Validates an Indian mobile number:
//      ^      — start of string
//      [6-9]  — valid first digits (Indian numbers start 6-9)
//      \d{9}  — exactly 9 more digits (total 10 digits)
//      $      — end of string
//    Handles numbers stored without a country code prefix.
//    If you need international support, replace this with a
//    library like libphonenumber-js.
//
//  NAME_MAX_LENGTH / NAME_MIN_LENGTH
//    Reasonable bounds that prevent both empty strings and
//    absurdly long inputs that could indicate injection attempts.
// ============================================================
const SALT_ROUNDS     = 12;
const MOBILE_REGEX    = /^[6-9]\d{9}$/;
const NAME_MIN_LENGTH = 2;
const NAME_MAX_LENGTH = 50;

// ============================================================
//  ADDRESS SUB-SCHEMA
//  Embedded inside the User document — no separate collection.
//
//  Why embedded and not referenced?
//    Addresses are always fetched with the user; they have no
//    independent lifecycle and are never queried in isolation.
//    Embedding avoids an extra round-trip to MongoDB on every
//    profile / checkout page load.
//
//  Fields:
//    label       — user-facing tag: "Home", "Work", "Other"
//    street      — house/flat number + street name
//    city        — city or district
//    state       — full state name
//    pincode     — 6-digit Indian postal code
//    country     — ISO country name (defaults to India)
//    isDefault   — only one address should have this true;
//                  enforced at the application layer, not DB,
//                  because a unique constraint across an array
//                  is not natively supported by MongoDB.
// ============================================================
const addressSchema = new mongoose.Schema(
  {
    // ── Label ──────────────────────────────────────────────
    label: {
      type: String,
      enum: {
        values:  ["Home", "Work", "Other"],
        message: "Address label must be 'Home', 'Work', or 'Other'.",
      },
      default: "Home",
    },

    // ── Street ─────────────────────────────────────────────
    street: {
      type:     String,
      required: [true, "Street address is required."],
      trim:     true,   // removes accidental leading/trailing spaces
      maxlength: [200, "Street address must not exceed 200 characters."],
    },

    // ── City ───────────────────────────────────────────────
    city: {
      type:     String,
      required: [true, "City is required."],
      trim:     true,
      maxlength: [100, "City name must not exceed 100 characters."],
    },

    // ── State ──────────────────────────────────────────────
    state: {
      type:     String,
      required: [true, "State is required."],
      trim:     true,
      maxlength: [100, "State name must not exceed 100 characters."],
    },

    // ── Pincode ────────────────────────────────────────────
    // Stored as String, not Number, for two reasons:
    //   1. Leading zeros are valid in some postal systems.
    //   2. Regex validation is cleaner on strings.
    pincode: {
      type:     String,
      required: [true, "Pincode is required."],
      trim:     true,
      match: [
        /^\d{6}$/,
        "Pincode must be exactly 6 digits.",
      ],
    },

    // ── Country ────────────────────────────────────────────
    country: {
      type:    String,
      trim:    true,
      default: "India",
      maxlength: [100, "Country name must not exceed 100 characters."],
    },

    // ── Default Address Flag ────────────────────────────────
    isDefault: {
      type:    Boolean,
      default: false,
    },
  },
  {
    // Suppress the auto-generated _id on sub-documents if you
    // prefer to reference addresses by array index.
    // Kept true here (the default) so each address has its own
    // _id — makes it trivial to update or delete a specific
    // address by ID without re-sending the entire array.
    _id: true,
  }
);

// ============================================================
//  USER SCHEMA
//  The root schema for the "users" collection.
//
//  Schema options:
//    timestamps: true
//      Mongoose automatically adds and manages two fields:
//        createdAt — set once when the document is first saved
//        updatedAt — updated on every subsequent save
//      These are handled at the ODM layer, not in application
//      code, so they are always accurate regardless of which
//      service or controller performs the write.
//
//    toJSON   / toObject  — see "Schema Options" section below.
// ============================================================
const userSchema = new mongoose.Schema(
  {
    // ── Name ───────────────────────────────────────────────
    // trim:     strips surrounding whitespace before validation.
    // minlength / maxlength: enforced at DB level as a safety net
    //   even if the validation middleware already checked this.
    name: {
      type:      String,
      required:  [true, "Name is required."],
      trim:      true,
      minlength: [NAME_MIN_LENGTH, `Name must be at least ${NAME_MIN_LENGTH} characters.`],
      maxlength: [NAME_MAX_LENGTH, `Name must not exceed ${NAME_MAX_LENGTH} characters.`],
    },

    // ── Mobile Number ──────────────────────────────────────
    // unique: true creates a MongoDB unique index on this field.
    //   This is the database-level guarantee; the application
    //   layer should still catch E11000 duplicate key errors and
    //   return a 409 Conflict rather than a raw 500.
    //
    // match: runs the regex against the stored value.
    //   The array form [regex, message] gives Mongoose the custom
    //   error string to include in ValidationError.
    //
    // Why not trim on mobile?
    //   Trimming is done in the validation middleware before this
    //   schema sees the value.  If a non-trimmed number reached
    //   here, the regex would correctly reject it — no silent
    //   data normalisation inside the model.
    mobile: {
      type:     String,
      required: [true, "Mobile number is required."],
      unique:   true,
      match: [
        MOBILE_REGEX,
        "Mobile number must be a valid 10-digit Indian number starting with 6-9.",
      ],
    },

    // ── Password ───────────────────────────────────────────
    // select: false
    //   Mongoose excludes this field from every query result by
    //   default.  This means User.findOne() will NEVER return
    //   the password hash unless you explicitly opt in with:
    //     User.findOne({ mobile }).select("+password")
    //   This single setting eliminates an entire class of
    //   accidental password-hash exposure bugs.
    //
    // minlength: 8 — enforced at schema level as a last resort.
    //   The real length/strength check happens in the validation
    //   middleware before the document reaches here.
    password: {
      type:      String,
      required:  [true, "Password is required."],
      minlength: [8, "Password must be at least 8 characters."],
      select:    false,   // ← NEVER returned in queries by default
    },

    // ── Role ───────────────────────────────────────────────
    // Single-owner platform has two actors:
    //   "customer" — a buyer; the default for self-registration.
    //   "owner"    — the store administrator; set manually or
    //                via a seeding script, never via public API.
    //
    // Enforced as an enum so no other string can ever be stored,
    // even if someone bypasses the application layer directly.
    role: {
      type:    String,
      enum: {
        values:  ["customer", "owner"],
        message: "Role must be either 'customer' or 'owner'.",
      },
      default: "customer",
    },

    // ── Addresses ──────────────────────────────────────────
    // Array of embedded addressSchema sub-documents.
    // [] default means a new user starts with no saved addresses.
    // Application layer should cap this (e.g. max 5 addresses)
    // to prevent unbounded array growth.
    addresses: {
      type:    [addressSchema],
      default: [],
    },

    // ── Wishlist ───────────────────────────────────────────
    // Array of ObjectId references to the Product collection.
    // Using references (not embedding) because:
    //   - Products have an independent lifecycle (can be deleted,
    //     updated, or go out of stock separately).
    //   - Product documents can be large; embedding them would
    //     bloat the User document significantly.
    //   - You can .populate("wishlist") when you need full
    //     product details, and skip it when you don't.
    //
    // Application layer should enforce a maximum wishlist length
    // (e.g. 50 items) to keep the document size bounded.
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref:  "Product",   // ← tells .populate() which collection to join
      },
    ],

    // ── Refresh Token ──────────────────────────────────────
    // Stores the current valid refresh token for this user.
    // Allows server-side token revocation: if you delete/rotate
    // this field, the next refresh attempt will fail even if the
    // old token hasn't expired yet.
    //
    // select: false — never returned in queries.
    // Only the auth service should ever read or write this field.
    refreshToken: {
      type:   String,
      select: false,
    },

    // ── Password Reset Fields ──────────────────────────────
    // Used by the "Forgot Password" flow:
    //   1. Generate a random token, hash it, store the hash here.
    //   2. Email the raw token to the user.
    //   3. On reset, hash the incoming token and compare to this.
    //   4. Check passwordResetExpires > Date.now().
    //   5. Clear both fields after a successful reset.
    //
    // The hash (not the raw token) is stored so that a DB breach
    // doesn't expose usable reset links.
    passwordResetToken: {
      type:   String,
      select: false,
    },

    passwordResetExpires: {
      type:   Date,
      select: false,
    },

    // ── Account Status ─────────────────────────────────────
    // Allows the owner to suspend a customer account without
    // deleting it.  Auth middleware checks this field and returns
    // 403 Forbidden if false, before any business logic runs.
    isActive: {
      type:    Boolean,
      default: true,
    },
  },

  // ── Schema-Level Options ─────────────────────────────────
  {
    // Adds createdAt and updatedAt automatically.
    timestamps: true,

    // toJSON: transform applied when res.json() serialises the document.
    // toObject: transform applied when .toObject() is called manually.
    //
    // virtuals: true  — include virtual properties (e.g. fullName)
    //                   in serialised output.
    // versionKey: false — removes the __v field Mongoose adds for
    //                     optimistic concurrency.  We don't use it,
    //                     so hiding it keeps API responses clean.
    toJSON:   { virtuals: true, versionKey: false },
    toObject: { virtuals: true, versionKey: false },
  }
);

// ============================================================
//  INDEXES
//  Declared here rather than relying on the unique: true shorthand
//  so all index definitions are visible in one place and options
//  (sparse, expireAfterSeconds, etc.) can be set explicitly.
//
//  mobile index
//    unique: true — one account per phone number.
//    Already created by unique:true on the field above, but
//    declaring it here lets us add options in future without
//    a schema migration.
//
//  passwordResetExpires TTL index
//    MongoDB's TTL feature automatically removes documents where
//    this date is in the past — useful if you store reset tokens
//    as separate documents. On a user document, this does NOT
//    auto-delete users; it's used here only as a query-performance
//    index for the reset-flow lookup.
// ============================================================
userSchema.index({ mobile: 1 }, { unique: true });

// ── Compound index for admin queries ───────────────────────
// Speeds up "find all active customers" queries issued from the
// owner dashboard without a full collection scan.
userSchema.index({ role: 1, isActive: 1 });

// ============================================================
//  VIRTUALS
//  Virtual properties are computed fields that are NOT stored in
//  MongoDB.  They exist only in the application layer and are
//  included in serialised output when virtuals:true is set above.
//
//  addressCount
//    Convenience property so the frontend can show "3 saved
//    addresses" without having to compute .addresses.length.
//
//  wishlistCount
//    Same pattern for the wishlist badge in the UI.
// ============================================================
userSchema.virtual("addressCount").get(function () {
  // Using a regular function (not arrow) because Mongoose binds
  // `this` to the current document instance inside virtuals.
  return this.addresses?.length ?? 0;
});

userSchema.virtual("wishlistCount").get(function () {
  return this.wishlist?.length ?? 0;
});

// ============================================================
//  PRE-SAVE HOOK — PASSWORD HASHING
//  Fires BEFORE every .save() call.
//
//  Why not hash in the controller or service?
//    If hashing lives in the model, it happens regardless of
//    which code path saves the user — registration, admin create,
//    seeder script, password reset — with zero chance of forgetting.
//
//  this.isModified("password")
//    Critical guard.  Without it, every .save() — including
//    innocent updates like changing the user's name — would
//    re-hash the ALREADY-HASHED password string, producing a hash
//    of a hash.  The next login attempt would then always fail.
//
//  bcrypt.genSalt → bcrypt.hash
//    Two-step is slightly more readable than the one-shot
//    bcrypt.hash(password, SALT_ROUNDS) form, and makes it
//    trivial to log the salt for debugging during development.
//
//  next()
//    Must be called to hand control back to Mongoose.
//    Passing an Error to next(err) aborts the save and surfaces
//    the error to the caller.
// ============================================================
userSchema.pre("save", async function (next) {
  // Skip hashing if the password field has not been touched.
  // this.isModified() returns true only when the field value
  // has changed in the current document instance.
  if (!this.isModified("password")) return next();

  try {
    // Generate a random salt with SALT_ROUNDS iterations.
    // The salt is embedded in the resulting hash string, so you
    // do NOT need to store it separately.
    const salt = await bcrypt.genSalt(SALT_ROUNDS);

    // Replace the plain-text password with its bcrypt hash.
    // The hash includes algorithm identifier + cost + salt + digest,
    // e.g.: "$2b$12$<22-char salt><31-char hash>"
    this.password = await bcrypt.hash(this.password, salt);

    next(); // ← proceed to save
  } catch (error) {
    // Surface hashing errors (extremely rare, but possible if
    // bcrypt's native bindings fail) as a proper Mongoose error.
    next(error);
  }
});

// ============================================================
//  INSTANCE METHOD — comparePassword
//  Compares a plain-text candidate password against the stored
//  bcrypt hash.
//
//  Why an instance method instead of a static or standalone fn?
//    It lives on every User document, reads the stored hash via
//    `this.password`, and keeps the auth logic co-located with
//    the model — clear ownership, no import coupling.
//
//  Why not arrow function?
//    Arrow functions do not bind their own `this`.  A Mongoose
//    instance method MUST use a regular function so `this`
//    refers to the current User document.
//
//  bcrypt.compare
//    Timing-safe comparison — it takes the same amount of time
//    regardless of where the strings differ.  This prevents
//    timing-based side-channel attacks where an attacker could
//    measure response time to guess the password character by
//    character.
//
//  Usage (in auth.service.js):
//    const user = await User.findOne({ mobile }).select("+password");
//    const isValid = await user.comparePassword(candidatePassword);
// ============================================================
userSchema.methods.comparePassword = async function (candidatePassword) {
  // this.password is the stored hash.
  // candidatePassword is the plain-text string from the login form.
  // bcrypt.compare returns true if they match, false otherwise.
  return bcrypt.compare(candidatePassword, this.password);
};

// ============================================================
//  INSTANCE METHOD — sanitize
//  Returns a plain object representation of the user safe to
//  send in an API response — no password hash, no tokens.
//
//  Alternative approach: use the toJSON transform defined in
//  schema options to strip sensitive fields automatically.
//  A dedicated method is more explicit and easier to audit.
//
//  Usage (in auth.controller.js):
//    res.json(new ApiResponse(200, user.sanitize(), "Login successful"));
// ============================================================
userSchema.methods.sanitize = function () {
  // .toObject() converts the Mongoose document to a plain JS object
  // (virtuals included, because toObject: { virtuals: true } is set).
  const obj = this.toObject();

  // Delete sensitive fields before returning.
  // These are select:false in the schema, but may be present if
  // the query used .select("+password +refreshToken").
  delete obj.password;
  delete obj.refreshToken;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;

  return obj;
};

// ============================================================
//  STATIC METHOD — findByMobile
//  Convenience query that reads naturally at the call site:
//    const user = await User.findByMobile(mobile);
//
//  Static methods live on the Model itself, not on documents.
//  Use them for common, reusable query patterns so raw Mongoose
//  query strings don't leak into services and controllers.
//
//  Returns null if no match — callers must handle the null case.
// ============================================================
userSchema.statics.findByMobile = function (mobile) {
  // Does NOT select password — callers that need it must chain
  // .select("+password") explicitly, making that intent visible.
  return this.findOne({ mobile });
};

// ============================================================
//  MODEL COMPILATION
//  mongoose.model("User", userSchema) compiles the schema into
//  a Model and binds it to the "users" collection.
//
//  Mongoose pluralises and lowercases the model name:
//    "User" → collection "users"
//
//  The compiled model is exported as a named export so consumers
//  import only what they need:
//    import { User } from "../models/User.model.js";
//
//  Guard against "Cannot overwrite model once compiled" errors
//  in test environments where modules are re-evaluated:
//    mongoose.models.User || mongoose.model("User", userSchema)
// ============================================================
export const User = mongoose.models.User
  ?? mongoose.model("User", userSchema);