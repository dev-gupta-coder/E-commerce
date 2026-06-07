// ============================================================
//  src/routes/auth.routes.js
//
//  Responsibility:
//    Declare every HTTP route for the authentication domain,
//    apply the correct middleware stack to each, and delegate
//    to the corresponding controller function.
//
//    This file contains ZERO business logic — it is purely a
//    wiring layer between HTTP endpoints and handlers.
//
//  Mounted in app.js as:
//    app.use("/api/v1/auth", authRoutes);
//
//  Full URL map:
//    POST   /api/v1/auth/register       → register
//    POST   /api/v1/auth/login          → login (+ strict rate limit)
//    POST   /api/v1/auth/logout         → logout (protected)
//    POST   /api/v1/auth/refresh-token  → refreshAccessToken
//    GET    /api/v1/auth/me             → getMe (protected)
// ============================================================

import { Router }           from "express";
import { rateLimit }        from "express-rate-limit";

import {
  register,
  login,
  logout,
  refreshAccessToken,
  getMe,
}                           from "../controllers/auth.controller.js";

import {
  verifyJWT,
}                           from "../middleware/auth.middleware.js";

// ============================================================
//  ROUTER INSTANCE
//  express.Router() creates a mini-application capable of
//  performing middleware and routing functions.
//  It is mounted at /api/v1/auth in app.js.
// ============================================================
const router = Router();

// ============================================================
//  AUTH-SPECIFIC RATE LIMITER
//  Much stricter than the global 200 req/15 min limiter in app.js.
//  Applies ONLY to the routes below where it is used explicitly.
//
//  windowMs: 15 minutes rolling window.
//
//  max: 10 attempts per IP.
//    An honest user will never hit this.
//    A brute-force attacker trying 10-character PINs can only
//    test 10 combinations per 15 minutes — computationally
//    infeasible to crack even a 6-digit mobile + weak password.
//
//  skipSuccessfulRequests: true
//    A successful login does NOT count against the limit.
//    Only FAILED attempts are counted.
//    This means a user who legitimately logs in 10 times is
//    never locked out — only someone failing repeatedly is.
//
//  standardHeaders / legacyHeaders
//    Sends RateLimit-Remaining, RateLimit-Reset headers so
//    the frontend can show "try again in X seconds" UI.
//
//  message
//    Structured JSON matching ApiError shape so the frontend
//    can handle it identically to other API errors.
// ============================================================
const authRateLimiter = rateLimit({
  windowMs:               15 * 60 * 1000,  // 15 minutes
  max:                    10,              // 10 failed attempts per window
  skipSuccessfulRequests: true,            // only count failures
  standardHeaders:        "draft-7",
  legacyHeaders:          false,
  message: {
    success:    false,
    statusCode: 429,
    message:
      "Too many login attempts from this IP. " +
      "Please try again after 15 minutes.",
  },
});

// ============================================================
//  ROUTES
// ============================================================

// ── POST /register ──────────────────────────────────────────
// Public — no auth required.
// A light rate limit (via the global limiter in app.js) is
// sufficient here; aggressive enumeration is caught by the
// duplicate-mobile check in the controller.
router.post("/register", register);

// ── POST /login ─────────────────────────────────────────────
// Public — no auth required, but STRICT rate limited.
// authRateLimiter runs FIRST; if the limit is exceeded, the
// request never reaches the login controller.
router.post("/login", authRateLimiter, login);

// ── POST /logout ────────────────────────────────────────────
// Protected — verifyJWT extracts req.user from the Access token.
// The controller uses req.user._id to invalidate the DB-stored
// Refresh token and clear the cookie.
router.post("/logout", verifyJWT, logout);

// ── POST /refresh-token ─────────────────────────────────────
// Public — intentionally NO verifyJWT here.
// The client calls this when the Access token has expired.
// The Refresh token (in the HttpOnly cookie) is the credential;
// verifyJWT would look for an Access token, which is exactly
// what we are trying to replace.
router.post("/refresh-token", refreshAccessToken);

// ── GET /me ─────────────────────────────────────────────────
// Protected — returns the full authenticated user profile.
// Called by the frontend on app load to restore session state
// after a page refresh.
router.get("/me", verifyJWT, getMe);

export default router;