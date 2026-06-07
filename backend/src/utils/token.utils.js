// ============================================================
//  src/utils/token.utils.js
//
//  Responsibility:
//    Pure utility functions for creating, verifying, and
//    attaching JWT tokens.  No Express req/res knowledge
//    lives here — this module is framework-agnostic so it
//    can be reused in scheduled jobs, WebSocket handlers,
//    or tests without importing Express.
//
//  Two-token strategy (Access + Refresh):
//    ┌─────────────┬────────────┬──────────────────────────┐
//    │ Token       │ Lifetime   │ Stored in                │
//    ├─────────────┼────────────┼──────────────────────────┤
//    │ Access      │ 15 minutes │ Memory (JS variable)     │
//    │ Refresh     │ 7 days     │ HttpOnly cookie + DB     │
//    └─────────────┴────────────┴──────────────────────────┘
//
//    Why keep Access in memory (not a cookie)?
//      • Not vulnerable to CSRF — JS reads it and sends it
//        in the Authorization header manually.
//      • Short-lived, so theft is low-impact.
//
//    Why keep Refresh in an HttpOnly cookie?
//      • HttpOnly = JavaScript on the page cannot read it,
//        eliminating XSS-based token theft.
//      • Secure = only sent over HTTPS.
//      • SameSite=Strict = not sent on cross-site navigations,
//        mitigating CSRF attacks.
//      • Also persisted in DB so the server can revoke it
//        (logout, suspicious activity) without waiting for
//        natural expiry.
//
//  Exported functions:
//    generateAccessToken(payload)      → signed JWT string
//    generateRefreshToken(payload)     → signed JWT string
//    verifyAccessToken(token)          → decoded payload | throws
//    verifyRefreshToken(token)         → decoded payload | throws
//    setRefreshTokenCookie(res, token) → void (mutates res)
//    clearRefreshTokenCookie(res)      → void (mutates res)
// ============================================================

import jwt from "jsonwebtoken";

// ============================================================
//  ENVIRONMENT VARIABLES
//  All secrets and configuration are read from process.env,
//  never hard-coded.  The validation at module load-time makes
//  missing config a loud startup crash rather than a silent
//  runtime failure at the moment of first token generation.
// ============================================================
const {
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRY   = "15m",   // sensible default if omitted
  JWT_REFRESH_EXPIRY  = "7d",
  NODE_ENV,
} = process.env;

// Crash the process at import time if secrets are missing.
// A server running without JWT secrets is misconfigured and
// should not accept traffic.
if (!JWT_ACCESS_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error(
    "[token.utils] JWT_ACCESS_SECRET and JWT_REFRESH_SECRET " +
    "must be defined in environment variables."
  );
}

// ============================================================
//  COOKIE CONFIGURATION
//  Centralised so every cookie set/clear call uses identical
//  options — no drift between login and logout behaviour.
//
//  httpOnly: true
//    The browser exposes this cookie to the server only.
//    document.cookie (JavaScript on the page) cannot read it.
//    This is the primary defence against XSS token theft.
//
//  secure: true in production
//    The browser sends this cookie only over HTTPS.
//    Must be false in local development (plain HTTP localhost).
//
//  sameSite: "strict"
//    The cookie is not sent on ANY cross-site request — not
//    navigation, not forms, not AJAX.  Strong CSRF protection.
//
//  maxAge: 7 days in milliseconds
//    Tells the browser when to delete the cookie automatically.
//    Matches JWT_REFRESH_EXPIRY so both expire together.
//
//  path: "/api/v1/auth"
//    The browser sends this cookie ONLY to requests whose path
//    starts with /api/v1/auth — not to product or order routes.
//    Reduces attack surface significantly.
// ============================================================
const COOKIE_NAME    = "refreshToken";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

export const COOKIE_OPTIONS = Object.freeze({
  httpOnly: true,
  secure:   NODE_ENV === "production",
  sameSite: "strict",
  maxAge:   COOKIE_MAX_AGE,
  path:     "/api/v1/auth",
});

// ============================================================
//  generateAccessToken
//  Creates a short-lived JWT encoding minimum user info needed
//  by auth middleware to identify the request without a DB hit.
//
//  Payload:
//    _id    — primary key for any DB lookups
//    mobile — for audit log enrichment without a DB round-trip
//    role   — enables RBAC checks without querying the DB
//
//  JWTs are not encrypted (only signed) — anyone can base64-
//  decode the payload.  Keep sensitive data out of tokens.
//
//  @param  {Object} payload  — { _id, mobile, role }
//  @returns {string}          — signed JWT
// ============================================================
export const generateAccessToken = (payload) => {
  return jwt.sign(
    payload,
    JWT_ACCESS_SECRET,
    { expiresIn: JWT_ACCESS_EXPIRY }  // "15m"
  );
};

// ============================================================
//  generateRefreshToken
//  Long-lived JWT used only to obtain new Access tokens.
//  Uses a SEPARATE secret from the Access token so that
//  compromise of one secret does not compromise both.
//
//  Payload is minimal — just _id. Role/mobile omitted because
//  the refresh token's only job is to identify the user for
//  a fresh Access token; it has no other capability.
//
//  @param  {Object} payload  — { _id }
//  @returns {string}          — signed JWT
// ============================================================
export const generateRefreshToken = (payload) => {
  return jwt.sign(
    payload,
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRY }  // "7d"
  );
};

// ============================================================
//  verifyAccessToken
//  Verifies signature and expiry of an Access token.
//  Throws jwt.TokenExpiredError or jwt.JsonWebTokenError on
//  failure — callers (auth middleware) catch these specifically.
//
//  @param  {string} token
//  @returns {Object} decoded payload
//  @throws  {jwt.JsonWebTokenError | jwt.TokenExpiredError}
// ============================================================
export const verifyAccessToken = (token) => {
  return jwt.verify(token, JWT_ACCESS_SECRET);
};

// ============================================================
//  verifyRefreshToken
//  Same as verifyAccessToken but uses the Refresh secret.
//  Called only in the POST /refresh-token route.
//
//  @param  {string} token
//  @returns {Object} decoded payload { _id, iat, exp }
//  @throws  {jwt.JsonWebTokenError | jwt.TokenExpiredError}
// ============================================================
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, JWT_REFRESH_SECRET);
};

// ============================================================
//  setRefreshTokenCookie
//  Attaches the Refresh JWT to the response as an HttpOnly
//  cookie using the centralised COOKIE_OPTIONS.
//
//  @param  {import("express").Response} res
//  @param  {string} token
//  @returns {void}
// ============================================================
export const setRefreshTokenCookie = (res, token) => {
  res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
};

// ============================================================
//  clearRefreshTokenCookie
//  Expires the Refresh token cookie immediately by setting
//  maxAge to 0.  Called during logout.
//
//  Must use the SAME path as setRefreshTokenCookie — a cookie
//  set on /api/v1/auth cannot be cleared via a response on /.
//
//  @param  {import("express").Response} res
//  @returns {void}
// ============================================================
export const clearRefreshTokenCookie = (res) => {
  res.cookie(COOKIE_NAME, "", {
    httpOnly: true,
    secure:   NODE_ENV === "production",
    sameSite: "strict",
    maxAge:   0,               // immediately expire
    path:     "/api/v1/auth",  // must match set-path
  });
};