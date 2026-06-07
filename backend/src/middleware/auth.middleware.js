// ============================================================
//  src/middleware/auth.middleware.js
//
//  Responsibility:
//    Intercept incoming requests, extract and verify the JWT
//    Access token, attach the authenticated user to req.user,
//    and enforce role-based access control (RBAC).
//
//    Nothing in this file touches the DB for normal request
//    verification — the Access token payload carries enough
//    identity (_id, mobile, role) for auth decisions, keeping
//    every protected route one DB round-trip cheaper.
//
//  Exported middleware:
//    verifyJWT          — gate: must be a valid, non-expired token
//    requireOwner       — gate: role must be "owner"
//    optionalAuth       — enriches req.user when a token exists,
//                         but never blocks unauthenticated requests
//
//  Usage in routes:
//    import { verifyJWT, requireOwner } from "../middleware/auth.middleware.js";
//
//    router.get("/orders",   verifyJWT,                  getOrders);
//    router.post("/products",verifyJWT, requireOwner,    createProduct);
//    router.get("/products", optionalAuth,               getProducts);
// ============================================================

import jwt                from "jsonwebtoken";
import { verifyAccessToken } from "../utils/token.utils.js";
import { ApiError }       from "../utils/ApiError.js";
import { asyncHandler }   from "../utils/asyncHandler.js";

// ============================================================
//  HELPER — extractToken
//  Reads the raw JWT string from the request.
//
//  Token location priority:
//    1. Authorization header (primary) — "Bearer <token>"
//       Used by API clients, mobile apps, and SPA fetch calls.
//
//    2. Cookie (fallback) — "accessToken" cookie
//       Used as a fallback for environments where setting the
//       Authorization header is inconvenient (e.g., server-side
//       rendered pages that rely on browser cookie auto-attach).
//
//  Returns null (not throws) when no token is present —
//  the callers decide whether absence is an error.
//
//  @param  {import("express").Request} req
//  @returns {string|null}
// ============================================================
const extractToken = (req) => {
  // ── 1. Authorization header ─────────────────────────────
  const authHeader = req.headers["authorization"];

  if (authHeader?.startsWith("Bearer ")) {
    // "Bearer eyJhbGci..." → split on " " → take index 1
    // trim() defends against accidental double-spaces.
    return authHeader.split(" ")[1]?.trim() || null;
  }

  // ── 2. Cookie fallback ──────────────────────────────────
  // cookie-parser (mounted in app.js) populates req.cookies.
  // Note: this is the SHORT-LIVED access token cookie,
  // NOT the HttpOnly refresh token cookie.
  if (req.cookies?.accessToken) {
    return req.cookies.accessToken;
  }

  return null;
};

// ============================================================
//  verifyJWT
//  Primary authentication middleware.
//
//  Flow:
//    1. Extract token from header or cookie.
//    2. Verify signature and expiry.
//    3. Attach decoded payload to req.user.
//    4. Call next() to hand off to the route handler.
//
//  On any failure → pass an ApiError to next() so the global
//  error handler in app.js formats the response uniformly.
//
//  req.user shape after this middleware runs:
//    {
//      _id:    "64a1f...",   ← MongoDB ObjectId string
//      mobile: "9876543210",
//      role:   "customer" | "owner",
//      iat:    1718000000,   ← issued-at (Unix timestamp)
//      exp:    1718000900,   ← expiry   (Unix timestamp)
//    }
// ============================================================
export const verifyJWT = asyncHandler(async (req, _res, next) => {

  // ── Step 1: Extract ──────────────────────────────────────
  const token = extractToken(req);

  if (!token) {
    // 401 Unauthorized — no credentials provided at all.
    // "Unauthorized" is the correct HTTP term (despite its name,
    // it means "unauthenticated" — the client is not identified).
    return next(
      new ApiError(401, "Access token is missing. Please log in.")
    );
  }

  // ── Step 2: Verify ───────────────────────────────────────
  try {
    const decoded = verifyAccessToken(token);
    //  decoded = { _id, mobile, role, iat, exp }

    // ── Step 3: Attach to request ─────────────────────────
    // req.user is now available in every downstream middleware
    // and route handler in this request's chain.
    req.user = decoded;

    // ── Step 4: Continue ──────────────────────────────────
    next();

  } catch (error) {

    // jwt.TokenExpiredError — token was valid but has since expired.
    // Instruct the client to use the refresh token to get a new one.
    if (error.name === "TokenExpiredError") {
      return next(
        new ApiError(
          401,
          "Access token has expired. Please refresh your session."
        )
      );
    }

    // jwt.JsonWebTokenError — signature mismatch, malformed token,
    // wrong algorithm, or any other structural problem.
    // This indicates tampering or a bug in the client — reject firmly.
    if (error.name === "JsonWebTokenError") {
      return next(
        new ApiError(401, "Invalid access token. Please log in again.")
      );
    }

    // Unexpected errors (should not normally occur) — let the global
    // error handler format a 500 response.
    return next(error);
  }
});

// ============================================================
//  requireOwner
//  RBAC middleware — must be chained AFTER verifyJWT.
//  Blocks any request where the authenticated user is not
//  the store owner.
//
//  Chain order matters:
//    router.post("/products", verifyJWT, requireOwner, createProduct);
//    verifyJWT runs first and populates req.user.
//    requireOwner reads req.user.role.
//    createProduct only runs if both guards pass.
//
//  403 Forbidden (not 401) — the client IS identified but does
//  not have permission to perform the action.
// ============================================================
export const requireOwner = (req, _res, next) => {
  // Safety check: if requireOwner is somehow used without verifyJWT,
  // req.user will be undefined.  Treat it as unauthenticated.
  if (!req.user) {
    return next(
      new ApiError(401, "Authentication required.")
    );
  }

  if (req.user.role !== "owner") {
    return next(
      new ApiError(
        403,
        "Access denied. This action requires owner privileges."
      )
    );
  }

  // Role check passed — hand off to the next handler.
  next();
};

// ============================================================
//  optionalAuth
//  Non-blocking middleware — enriches req.user when a valid
//  token is present, but never blocks unauthenticated requests.
//
//  Use case: public product listings that want to show
//  personalised data (wishlist status, purchase history) for
//  logged-in visitors but still serve the page to guests.
//
//  Error handling: any token error is silently swallowed and
//  req.user is left undefined — the route handler checks
//  if (req.user) to decide whether to personalise the response.
// ============================================================
export const optionalAuth = (req, _res, next) => {
  const token = extractToken(req);

  // No token — guest request; continue without setting req.user.
  if (!token) return next();

  try {
    req.user = verifyAccessToken(token);
  } catch {
    // Expired or invalid token in optional context — treat as guest.
    // Do not return an error; the route decides what to do.
    req.user = undefined;
  }

  next();
};