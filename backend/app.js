// ============================================================
//  app.js
//  Responsibility: Configure and export the Express application.
//  This file is purely about wiring — no server.listen() here.
//  That belongs in server.js (separation of concerns).
// ============================================================

import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { rateLimit } from "express-rate-limit";
// by chat gpt
import { errorHandler } from "./src/middleware/error.middleware.js";
import wishlistRoutes from "./src/routes/wishlist.routes.js";

// ─── Route Imports ────────────────────────────────────────────
// Uncomment and add your routers as you build them out.
import authRoutes    from "./src/routes/auth.routes.js";
import productRoutes from "./src/routes/product.routes.js";
import orderRoutes   from "./src/routes/order.routes.js";
import paymentRoutes from "./src/routes/payment.routes.js"; 
import cartRoutes from "./src/routes/cart.routes.js"; //by chatgpt
import addressRoutes from "./src/routes/address.routes.js"; //by chatgpt 

// ─── Error Handler Import ─────────────────────────────────────
// import { errorHandler } from "./src/middleware/error.middleware.js";

// ─── Create Express Application ───────────────────────────────
const app = express();    
 
// ============================================================
//  1. SECURITY — HELMET
//  Sets ~15 security-related HTTP response headers in one call.
//  Examples: X-DNS-Prefetch-Control, X-Frame-Options (clickjacking),
//  Strict-Transport-Security (force HTTPS), X-Content-Type-Options,
//  Content-Security-Policy, and more.
//  Should be the FIRST middleware so every response gets the headers.
// ============================================================
app.use(helmet());
 
// ============================================================
//  2. CORS — CROSS-ORIGIN RESOURCE SHARING
//  Controls which origins (domains) are allowed to call this API.
//  Without this, browsers will block requests from your frontend.
//
//  origin        — whitelist of allowed client URLs (from .env)
//  credentials   — allows cookies / Authorization headers cross-origin
//  methods        — HTTP verbs this API exposes
//  allowedHeaders — headers the client is allowed to send
// ============================================================
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
  : ["http://localhost:3000"];

app.use(
  // cors({
  //   origin: (incomingOrigin, callback) => {
  //     // Allow server-to-server requests (no origin header) and whitelisted origins.
  //     if (!incomingOrigin || allowedOrigins.includes(incomingOrigin)) {
  //       callback(null, true);
  //     } else {
  //       callback(new Error(`CORS: Origin "${incomingOrigin}" is not allowed.`));
  //     }
  //   },
  //   credentials: true,                        // Required for cookies / JWT in Authorization header
  //   methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  //   allowedHeaders: ["Content-Type", "Authorization"],
  // })

  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })

);

// ============================================================
//  3. BODY PARSERS
//  Express does NOT parse request bodies by default.
//
//  express.json()       — parses "Content-Type: application/json" bodies.
//                         limit: "16kb" prevents payload-based DoS attacks.
//
//  express.urlencoded() — parses HTML form bodies
//                         (Content-Type: application/x-www-form-urlencoded).
//                         extended: true allows nested objects via the qs library.
// ============================================================
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// ============================================================
//  4. COOKIE PARSER
//  Parses the Cookie header and populates req.cookies.
//  The secret signs cookies so you can use req.signedCookies
//  and detect tampering (HMAC signature check).
//  Used for storing refresh tokens in HttpOnly cookies.
// ============================================================
app.use(cookieParser(process.env.COOKIE_SECRET));

// ============================================================
//  5. REQUEST LOGGING — MORGAN
//  Logs every HTTP request to stdout.
//
//  "dev"      — concise colored output: METHOD  URL  STATUS  response-time
//               Great for development — instant visibility.
//
//  "combined" — Apache-style full log including IP, user-agent, referrer.
//               Switch to this (or a custom token) in production,
//               ideally piped to a log aggregator (Datadog, CloudWatch).
//
//  NODE_ENV check ensures noisy dev logs don't appear in production.
// ============================================================
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  // In production use the standard combined log format
  app.use(morgan("combined"));
}

// ============================================================
//  6. GLOBAL RATE LIMITER
//  Limits how many requests a single IP can make in a time window.
//  This acts as the first line of defence against:
//    - Brute-force login attacks
//    - Scraping / enumeration
//    - Accidental request storms from buggy clients
//
//  windowMs     — rolling time window in ms (15 minutes here)
//  max          — maximum requests per IP per window
//  standardHeaders  — sends RateLimit-* headers (RFC 6585)
//  legacyHeaders    — disables old X-RateLimit-* headers
//  message      — JSON body sent when the limit is exceeded
//
//  TIP: Override this with a stricter limiter on /auth routes.
//  See src/middleware/rateLimiter.middleware.js.
// ============================================================
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 200,                    // 200 requests per IP per window (generous global cap)
  standardHeaders: "draft-7",  // Latest IETF standard headers
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP. Please try again after 15 minutes.",
  },
});
app.use(globalLimiter);

// ============================================================
//  7. HEALTH CHECK ENDPOINT
//  A lightweight route used by:
//    - Load balancers (AWS ALB, Nginx) to verify the instance is alive
//    - Container orchestrators (Kubernetes liveness probe)
//    - Uptime monitors (UptimeRobot, Pingdom)
//  Returns 200 immediately — no DB call, no auth, no middleware overhead.
// ============================================================
app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ============================================================
//  8. API ROUTES
//  All application routes live under /api/v1/.
//  Versioning in the URL (/v1/) lets you ship breaking changes
//  as /v2/ without removing v1 — zero downtime migrations.
//
//  Mount order matters: more specific paths first.
// ============================================================
app.use("/api/v1/auth",     authRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/orders",   orderRoutes);   
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/cart", cartRoutes);//by chatgpt
app.use("/api/v1/wishlist", wishlistRoutes); //by chatgpt
app.use("/api/v1/address", addressRoutes); //by chatgpt
 
// ============================================================
//  9. 404 — UNMATCHED ROUTES
//  Any request that doesn't match an existing route falls here.
//  Must be placed AFTER all route definitions.
//  Returns a structured 404 instead of Express's default HTML page.
// ============================================================
console.log("Routes mounted successfully");
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found. Check the URL and HTTP method.",
  });
});

// ============================================================
//  10. GLOBAL ERROR HANDLER
//  The single source of truth for all error responses.
//  Express identifies a 4-argument function as an error handler.
//  Any middleware or controller that calls next(err) or throws
//  (in async handlers) lands here.
//
//  Must be the LAST app.use() — after routes and the 404 handler.
// ============================================================
// app.use(errorHandler);

// ─── Export ──────────────────────────────────────────────────
// Export the configured app — server.js will call app.listen().
export default app;
app.use(errorHandler); 