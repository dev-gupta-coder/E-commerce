// // ============================================================
// //  server.js
// //  Responsibility: Application entry point.
// //  1. Load environment variables FIRST (before any other import
// //     resolves, because modules read process.env at import time).
// //  2. Connect to MongoDB.
// //  3. Start the HTTP server.
// //  4. Handle fatal process signals gracefully.
// //
// //  This file intentionally has no Express logic — that all lives
// //  in app.js. server.js only cares about the process lifecycle.
// // ============================================================

// // ─── Step 1: Load Environment Variables ───────────────────────
// // dotenv reads the .env file and copies every KEY=VALUE pair
// // into process.env BEFORE any other module executes.
// // MUST be the very first statement — if you import app.js first,
// // its top-level code runs before dotenv, and process.env is empty.
// import "dotenv/config";

// // ─── Step 2: Import App and DB Connector ──────────────────────
// import app from "./app.js";
// import mongoose from "mongoose";

// // ============================================================
// //  CONSTANTS
// //  Read from environment — never hardcode these values.
// //
// //  PORT         — HTTP port to listen on. Cloud platforms (Railway,
// //                 Render, Heroku) inject PORT automatically.
// //                 Fallback to 8000 for local development.
// //
// //  MONGO_URI    — Full MongoDB connection string including credentials.
// //                 Example: mongodb+srv://user:pass@cluster.mongodb.net/shop
// // ============================================================
// const PORT = process.env.PORT || 8000;
// const MONGO_URI = process.env.MONGO_URI;

// // ============================================================
// //  MONGODB CONNECTION OPTIONS
// //  Mongoose passes these to the underlying MongoDB Node driver.
// //
// //  serverSelectionTimeoutMS — how long Mongoose waits to find a
// //    responsive server before throwing a connection error (ms).
// //    Default is 30 000 ms; 5 000 ms fails fast in dev.
// //
// //  socketTimeoutMS — how long a send/receive on the socket can
// //    sit idle before the connection is closed. 45 s is a safe
// //    default that outlasts most slow queries.
// //
// //  maxPoolSize — number of connections Mongoose keeps open in
// //    the pool. Reusing connections is far faster than creating
// //    new ones per request. 10 is a solid default for a small
// //    single-owner store; scale up for high concurrency.
// // ============================================================
// const MONGO_OPTIONS = {
//   serverSelectionTimeoutMS: 5000,
//   socketTimeoutMS: 45000,
//   maxPoolSize: 10,
// };

// // ============================================================
// //  connectDB — Establishes the Mongoose connection.
// //  Extracted into its own async function so it can be awaited
// //  cleanly and errors surface with a clear stack trace.
// //
// //  mongoose.connection.host is the resolved hostname of the
// //  MongoDB server — useful for confirming which cluster/replica
// //  the app actually connected to (Atlas vs localhost).
// // ============================================================
// async function connectDB() {
//   if (!MONGO_URI) {
//     // Fail loudly — a missing URI is a configuration error, not a
//     // runtime error. No point starting the HTTP server without a DB.
//     throw new Error("MONGO_URI is not defined in environment variables.");
//   }

//   const connection = await mongoose.connect(MONGO_URI, MONGO_OPTIONS);

//   console.log(
//     `✅ MongoDB connected — host: ${connection.connection.host}`
//   );
// }

// // ============================================================
// //  startServer — Orchestrates startup in the correct order:
// //    1. Connect DB  (if this fails, we never start HTTP — safe)
// //    2. Listen on PORT
// //    3. Register graceful shutdown handlers
// //
// //  Why await DB before listen?
// //  If the DB is down and you start accepting HTTP requests,
// //  controllers will throw on the first DB call. Better to refuse
// //  traffic entirely until the app is fully ready.
// // ============================================================
// async function startServer() {
//   // ── Connect to DB first ─────────────────────────────────────
//   await connectDB();

//   // ── Start HTTP Server ────────────────────────────────────────
//   // app.listen() returns an http.Server instance, which we keep
//   // so we can close it cleanly during shutdown.
//   const server = app.listen(PORT, () => {
//     console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
//     console.log(`🔗 Health check → http://localhost:${PORT}/health`);
//   });

//   // ============================================================
//   //  GRACEFUL SHUTDOWN
//   //  When the process receives a termination signal (from the OS,
//   //  a container orchestrator like Kubernetes, or PM2), we should:
//   //    1. Stop accepting NEW connections (server.close)
//   //    2. Let IN-FLIGHT requests finish naturally
//   //    3. Close the DB connection pool cleanly
//   //    4. Exit with code 0 (success) — not 1 (crash)
//   //
//   //  Without this, the process kills mid-request: DB writes can be
//   //  left half-done, response streams cut, connection pools leaked.
//   //
//   //  SIGTERM — sent by Kubernetes, Docker, PM2, Heroku for planned
//   //            shutdowns. This is the normal "please stop" signal.
//   //
//   //  SIGINT  — sent when a developer presses Ctrl+C in the terminal.
//   // ============================================================
//   async function gracefulShutdown(signal) {
//     console.log(`\n⚠️  ${signal} received. Shutting down gracefully…`);

//     // 1. Stop accepting new connections.
//     //    Existing keep-alive connections stay open until they complete.
//     server.close(async () => {
//       console.log("🔌 HTTP server closed.");

//       try {
//         // 2. Flush and close all Mongoose connections in the pool.
//         await mongoose.connection.close();
//         console.log("🗄️  MongoDB connection closed.");
//         console.log("👋 Process exiting cleanly. Goodbye.");
//         process.exit(0);  // 0 = intentional, clean exit
//       } catch (err) {
//         console.error("❌ Error during DB disconnect:", err.message);
//         process.exit(1);  // 1 = error exit — lets process managers restart
//       }
//     });

//     // Safety net: if server.close() hangs for >10 s (e.g. a stuck
//     // keep-alive connection), force exit rather than hang forever.
//     setTimeout(() => {
//       console.error("⏱️  Shutdown timed out after 10 s. Forcing exit.");
//       process.exit(1);
//     }, 10_000).unref();
//     // .unref() means this timer won't keep the event loop alive by itself.
//   }

//   process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
//   process.on("SIGINT",  () => gracefulShutdown("SIGINT"));

//   // ============================================================
//   //  UNHANDLED PROMISE REJECTIONS
//   //  Fires when a Promise rejects and no .catch() or try/catch
//   //  handles it. In older Node versions this was silently swallowed;
//   //  since Node 15 it crashes the process by default.
//   //
//   //  We log the error and exit cleanly so a process manager
//   //  (PM2, systemd, Kubernetes) can restart the app.
//   //  Continuing to run after an unhandled rejection risks
//   //  corrupt state — better to restart clean.
//   // ============================================================
//   process.on("unhandledRejection", (reason, promise) => {
//     console.error("🔥 Unhandled Promise Rejection:");
//     console.error("   Promise:", promise);
//     console.error("   Reason:", reason);
//     // Trigger graceful shutdown instead of an abrupt crash.
//     gracefulShutdown("unhandledRejection");
//   });

//   // ============================================================
//   //  UNCAUGHT EXCEPTIONS
//   //  Fires when synchronous code throws and nobody catches it
//   //  (e.g. JSON.parse() on malformed data outside try/catch,
//   //  or a TypeError deep in a library).
//   //
//   //  At this point the process is in an UNDEFINED STATE.
//   //  The Node.js docs explicitly say you should not try to resume
//   //  normal operation — exit immediately and let the supervisor restart.
//   // ============================================================
//   process.on("uncaughtException", (err) => {
//     console.error("💥 Uncaught Exception — process is in an undefined state:");
//     console.error(err);
//     process.exit(1);
//   });
// }

// // ─── Kick Everything Off ──────────────────────────────────────
// // Top-level await is available in ES modules (type: "module" in
// // package.json). If you're using CommonJS (require), wrap this
// // in an IIFE: (async () => { await startServer(); })();
// startServer();





// ============================================================
//  server.js  (updated to use config/db.js)
//  All DB logic now lives in config/db.js.
//  server.js only orchestrates the startup sequence and
//  handles process-level signals.
// ============================================================

// Step 1 — Load .env FIRST, before any other import reads process.env
import "dotenv/config";

import app  from "./app.js";
import {
  connectDB,
  disconnectDB,
  getConnectionStatus,
}                   from "./src/config/db.js";

const PORT = process.env.PORT || 8000;

// ── Health check route (wired to real DB status) ──────────────
// Overrides the placeholder in app.js with live DB state.
app.get("/health", (_req, res) => {
  const db = getConnectionStatus();
  const healthy = db.readyState === 1;

  res.status(healthy ? 200 : 503).json({
    success:     healthy,
    environment: process.env.NODE_ENV,
    timestamp:   new Date().toISOString(),
    database:    db,
  });
});

// ── Graceful shutdown ─────────────────────────────────────────
async function gracefulShutdown(signal, server) {
  console.log(`\n⚠️  ${signal} received. Shutting down…`);

  server.close(async () => {
    console.log("🔌 HTTP server closed.");
    try {
      await disconnectDB();           // ← uses our exported helper
      console.log("👋 Exiting cleanly.");
      process.exit(0);
    } catch {
      process.exit(1);
    }
  });

  setTimeout(() => {
    console.error("⏱️  Shutdown timed out. Forcing exit.");
    process.exit(1);
  }, 10_000).unref();
}

// ── Startup ───────────────────────────────────────────────────
async function startServer() {
  // Connect to DB first — HTTP server only starts on success.
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`🔗 Health → http://localhost:${PORT}/health`);
  });

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM", server));
  process.on("SIGINT",  () => gracefulShutdown("SIGINT",  server));

  process.on("unhandledRejection", (reason) => {
    console.error("🔥 Unhandled Rejection:", reason);
    gracefulShutdown("unhandledRejection", server);
  });

  process.on("uncaughtException", (err) => {
    console.error("💥 Uncaught Exception:", err);
    process.exit(1);
  });
}

startServer();