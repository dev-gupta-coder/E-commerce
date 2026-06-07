// ============================================================
//  src/controllers/auth.controller.js
//
//  Responsibility:
//    Handle HTTP layer for authentication — extract data from
//    req, delegate to service/model logic, send responses.
//    No business logic lives here; controllers are thin.
//
//  Routes handled:
//    POST   /api/v1/auth/register        → register
//    POST   /api/v1/auth/login           → login
//    POST   /api/v1/auth/logout          → logout
//    POST   /api/v1/auth/refresh-token   → refreshAccessToken
//    GET    /api/v1/auth/me              → getMe
//
//  Auth pattern — two-token, cookie-based:
//    • Access token  (15 min) → returned in JSON body
//      Client stores in memory (Redux, Zustand, React state)
//      and attaches as "Authorization: Bearer <token>" header.
//
//    • Refresh token (7 days) → set as HttpOnly cookie
//      Client never reads it — browser auto-attaches on every
//      request to /api/v1/auth.
//      Also persisted in DB (user.refreshToken) to enable
//      server-side revocation on logout.
// ============================================================

import { User }                        from "../models/User.model.js";
import { ApiError }                    from "../utils/ApiError.js";
import { ApiResponse }                 from "../utils/ApiResponse.js";
import { asyncHandler }                from "../utils/asyncHandler.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
}                                      from "../utils/token.utils.js";

// ============================================================
//  HELPER — issueTokens
//  Generates a fresh Access + Refresh token pair for a user,
//  persists the Refresh token to the DB, and returns both.
//
//  Extracted into a helper because both login AND refreshToken
//  need to issue a token pair — DRY principle.
//
//  @param  {import("../models/User.model.js").User} user
//  @returns {{ accessToken: string, refreshToken: string }}
// ============================================================
const issueTokens = async (user) => {
  // Payload for the Access token — minimum data the middleware needs
  // to authenticate requests without a DB hit on every call.
  const accessToken = generateAccessToken({
    _id:    user._id,
    mobile: user.mobile,
    role:   user.role,
  });

  // Payload for the Refresh token — only the primary key.
  // The refresh route will look up the full user from the DB.
  const refreshToken = generateRefreshToken({
    _id: user._id,
  });

  // Persist the Refresh token to the User document.
  // This is what makes server-side revocation possible:
  // on logout we clear this field so the token becomes invalid
  // even before its 7-day natural expiry.
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });
  // validateBeforeSave: false — we're only writing one field;
  // we don't want Mongoose to re-run validators for name, mobile,
  // password, etc. which may fail for irrelevant reasons.

  return { accessToken, refreshToken };
};

// ============================================================
//  register
//  POST /api/v1/auth/register
//
//  Flow:
//    1. Check for duplicate mobile number.
//    2. Create user (password is hashed by the pre-save hook
//       in User.model.js — the controller never sees the hash).
//    3. Return the sanitised user; do NOT issue tokens here.
//       User must log in after registering — keeps the flow
//       explicit and consistent with email-verification flows
//       if you add that feature later.
//
//  HTTP 201 Created — a new resource was created.
// ============================================================
export const register = asyncHandler(async (req, res) => {

  // ── Extract & trim inputs ─────────────────────────────────
  // Trimming here (not in the model) keeps the model pure.
  const { name, mobile, password } = req.body;

  // ── Check for existing account ────────────────────────────
  // findByMobile is the static method on User model.
  // Returns null if not found — no throw.
  const existingUser = await User.findByMobile(mobile);

  if (existingUser) {
    // 409 Conflict — the resource (mobile number) already exists.
    throw new ApiError(
      409,
      "An account with this mobile number already exists."
    );
  }

  // ── Create user ───────────────────────────────────────────
  // Mongoose triggers the pre("save") hook which bcrypt-hashes
  // the plain-text password before writing it to MongoDB.
  // The controller never calls bcrypt directly.
  const user = await User.create({
    name:     name.trim(),
    mobile:   mobile.trim(),
    password,               // plain text — hashed by pre-save hook
    role:     "customer",   // never trust the client to set this
  });

  // ── Respond ───────────────────────────────────────────────
  // user.sanitize() strips password, refreshToken, and reset fields.
  // Defined as an instance method on the User model.
  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { user: user.sanitize() },
        "Account created successfully. Please log in."
      )
    );
});

// ============================================================
//  login
//  POST /api/v1/auth/login
//
//  Flow:
//    1. Find user by mobile (with password selected).
//    2. Compare submitted password against stored bcrypt hash.
//    3. Check account is active.
//    4. Issue Access + Refresh tokens.
//    5. Set Refresh token in HttpOnly cookie.
//    6. Return Access token in JSON body + sanitised user.
//
//  Security note on error messages:
//    Both "mobile not found" and "wrong password" return the
//    same generic message to prevent mobile number enumeration
//    attacks — an attacker cannot determine whether a mobile
//    number is registered by reading the error.
// ============================================================
export const login = asyncHandler(async (req, res) => {

  const { mobile, password } = req.body;

  // ── Find user (with password) ─────────────────────────────
  // password is select:false in the schema, so we must explicitly
  // opt in here.  This is the ONLY place in the codebase that
  // should ever call .select("+password").
  const user = await User.findOne({ mobile }).select("+password");

  if (!user) {
    // Generic message — do not reveal "this mobile is not registered".
    throw new ApiError(401, "Invalid mobile number or password.");
  }

  // ── Verify password ───────────────────────────────────────
  // comparePassword is an instance method on the User model that
  // calls bcrypt.compare(candidate, this.password) internally.
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    // Same generic message as above — prevents enumeration.
    throw new ApiError(401, "Invalid mobile number or password.");
  }

  // ── Check account status ──────────────────────────────────
  // Suspended accounts are rejected AFTER password verification
  // intentionally — don't reveal account existence before auth.
  if (!user.isActive) {
    throw new ApiError(
      403,
      "Your account has been suspended. Please contact support."
    );
  }

  // ── Issue tokens ──────────────────────────────────────────
  const { accessToken, refreshToken } = await issueTokens(user);

  // ── Set Refresh token cookie ──────────────────────────────
  // HttpOnly, Secure, SameSite=Strict, path=/api/v1/auth
  // Options defined centrally in token.utils.js.
  setRefreshTokenCookie(res, refreshToken);

  // ── Respond ───────────────────────────────────────────────
  // Access token returned in body — client stores in memory.
  // Refresh token is in the cookie — client never reads it.
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          user:        user.sanitize(),
          accessToken,           // client stores this in memory
          // refreshToken deliberately NOT included in JSON —
          // it's already in the HttpOnly cookie.
        },
        "Logged in successfully."
      )
    );
});

// ============================================================
//  logout
//  POST /api/v1/auth/logout
//  Protected: verifyJWT middleware must run before this.
//
//  Flow:
//    1. Find user by ID from the verified token payload.
//    2. Null out the stored Refresh token in the DB
//       (server-side revocation).
//    3. Clear the Refresh token cookie on the client.
//    4. Respond 200 — no further action needed from the client
//       other than discarding the Access token from memory.
//
//  Why POST, not GET?
//    GET requests are cached by browsers and proxies.
//    Logout is a state-changing operation — POST is correct.
// ============================================================
export const logout = asyncHandler(async (req, res) => {

  // req.user is populated by verifyJWT middleware.
  // _id comes from the verified JWT payload.
  await User.findByIdAndUpdate(
    req.user._id,
    {
      // $unset removes the field entirely instead of setting null —
      // cleaner schema and avoids index entries for null values.
      $unset: { refreshToken: 1 },
    },
    {
      new: true,              // return the updated document
      validateBeforeSave: false,
    }
  );

  // ── Clear the cookie ──────────────────────────────────────
  // Sets maxAge: 0 on the cookie — browser discards it immediately.
  clearRefreshTokenCookie(res);

  return res
    .status(200)
    .json(
      new ApiResponse(200, null, "Logged out successfully.")
    );
});

// ============================================================
//  refreshAccessToken
//  POST /api/v1/auth/refresh-token
//  Public route (no verifyJWT) — the Refresh token IS the auth.
//
//  Flow:
//    1. Read the Refresh token from the HttpOnly cookie.
//    2. Verify its signature and expiry.
//    3. Look up the user and compare the incoming token against
//       the one stored in the DB (guards against reuse of a
//       token that was already logged out).
//    4. Issue a new Access + Refresh pair (token rotation).
//    5. Set the new Refresh token cookie.
//    6. Return the new Access token.
//
//  Token rotation (step 4):
//    Every refresh issues a NEW Refresh token and invalidates
//    the old one.  If an attacker steals a Refresh token and
//    uses it after the legitimate client already refreshed,
//    the stolen token will be rejected (DB mismatch) and the
//    legitimate user is effectively logged out, alerting them.
// ============================================================
export const refreshAccessToken = asyncHandler(async (req, res) => {

  // ── Extract Refresh token from cookie ─────────────────────
  // cookie-parser (in app.js) populates req.cookies.
  // The cookie name must match COOKIE_NAME in token.utils.js.
  const incomingRefreshToken = req.cookies?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(
      401,
      "Refresh token not found. Please log in again."
    );
  }

  // ── Verify Refresh token signature ────────────────────────
  let decoded;
  try {
    decoded = verifyRefreshToken(incomingRefreshToken);
  } catch (error) {
    // TokenExpiredError or JsonWebTokenError
    throw new ApiError(
      401,
      error.name === "TokenExpiredError"
        ? "Refresh token has expired. Please log in again."
        : "Invalid refresh token. Please log in again."
    );
  }

  // ── Fetch user and validate stored token ──────────────────
  // Select refreshToken explicitly (select:false in schema).
  const user = await User.findById(decoded._id).select("+refreshToken");

  if (!user) {
    // User deleted after token was issued.
    throw new ApiError(401, "User not found. Please log in again.");
  }

  // Token rotation validation:
  // Compare the incoming token against what we stored at login.
  // If they differ, the token was already rotated (possible theft).
  if (user.refreshToken !== incomingRefreshToken) {
    // Null out the stored token — forces re-login on all devices.
    user.refreshToken = undefined;
    await user.save({ validateBeforeSave: false });

    throw new ApiError(
      401,
      "Refresh token has already been used. Please log in again."
    );
  }

  // ── Issue new token pair (token rotation) ─────────────────
  const { accessToken, refreshToken: newRefreshToken } = await issueTokens(user);

  // ── Set new Refresh token cookie ──────────────────────────
  setRefreshTokenCookie(res, newRefreshToken);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { accessToken },
        "Access token refreshed successfully."
      )
    );
});

// ============================================================
//  getMe
//  GET /api/v1/auth/me
//  Protected: verifyJWT must run first.
//
//  Returns the authenticated user's profile from the DB.
//  Uses req.user._id (from the JWT payload) to look up the
//  full document — ensures the response reflects the current
//  DB state, not potentially stale token payload data.
//
//  Use case:
//    Called by the frontend on app initialisation to restore
//    session state after a page refresh (the Access token was
//    in memory and was lost; the refresh flow re-issues it
//    and then this route fetches the profile).
// ============================================================
export const getMe = asyncHandler(async (req, res) => {

  // req.user._id comes from the verified Access token.
  // Populate wishlist so the UI gets product titles/thumbnails.
  const user = await User.findById(req.user._id)
    .populate("wishlist", "title price images");  // select only needed fields

  if (!user) {
    // Extremely rare: user was deleted after a valid token was issued.
    throw new ApiError(404, "User account not found.");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, { user: user.sanitize() }, "Profile fetched.")
    );
});