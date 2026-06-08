// ============================================================
//  config/db.js
//  Responsibility: Establish, monitor, and expose the Mongoose
//  connection to MongoDB. Nothing else in the app calls
//  mongoose.connect() — this is the single source of truth
//  for the database connection lifecycle.
//
//  Usage (in server.js):
//    import { connectDB } from "./src/config/db.js";
//    await connectDB();
// ============================================================

import mongoose from "mongoose";

// ============================================================
//  CONNECTION OPTIONS
//  These are passed directly to the underlying MongoDB Node.js
//  driver. Mongoose merges them with its own defaults.
//
//  serverSelectionTimeoutMS
//    How long (ms) the driver waits to find a reachable MongoDB
//    server before throwing a MongoServerSelectionError.
//    Default: 30 000 ms — too long in dev; 5 000 ms fails fast
//    so you notice a missing DB immediately on startup.
//
//  socketTimeoutMS
//    How long (ms) a send or receive on the TCP socket can sit
//    completely idle before the driver closes that connection.
//    45 000 ms (45 s) comfortably outlasts any realistic query
//    while still recovering from dead sockets promptly.
//
//  maxPoolSize
//    The maximum number of TCP connections Mongoose keeps open
//    and reuses from the connection pool.
//    - Each Node.js process shares one pool.
//    - Creating a new connection per request is ~200 ms overhead.
//    - 10 is a solid default for a low-to-medium traffic store.
//    - Atlas free-tier caps connections per cluster; keep this ≤ 5
//      on M0 clusters to leave headroom for other processes.
//
//  minPoolSize
//    Connections Mongoose keeps open even when idle.
//    2 means there are always two "warm" connections ready,
//    avoiding the cold-start latency of establishing a fresh
//    connection when traffic picks back up after a quiet period.
//
//  connectTimeoutMS
//    How long (ms) the driver waits for a single connection
//    attempt (the TCP handshake + auth) to complete.
//    Different from serverSelectionTimeoutMS: that controls how
//    long to *keep retrying*; this controls one single attempt.
//
//  family
//    Force IPv4 DNS resolution (AF_INET).
//    Some environments resolve MongoDB hostnames to an IPv6
//    address that isn't reachable, causing mysterious ECONNREFUSED
//    errors. Pinning to 4 eliminates that class of bug.
// ============================================================
const MONGO_OPTIONS = {
  serverSelectionTimeoutMS: 5_000,
  socketTimeoutMS:          45_000,
  maxPoolSize:              10,
  minPoolSize:              2,
  connectTimeoutMS:         10_000,
  family:                   4,
};

// ============================================================
//  CONNECTION STATE TRACKER
//  Mongoose internally stores state (0=disconnected, 1=connected,
//  2=connecting, 3=disconnecting). We mirror it here so the rest
//  of the application can ask "are we connected?" without coupling
//  directly to Mongoose internals.
// ============================================================
let isConnected = false;

// ============================================================
//  connectDB
//  Async function that:
//    1. Validates the URI exists in the environment.
//    2. Guards against re-connecting if already connected
//       (important for hot-reload environments and test suites).
//    3. Attempts the connection and logs the resolved host.
//    4. Registers Mongoose connection event listeners.
//    5. Throws on failure so the caller (server.js) can decide
//       whether to abort startup or retry.
// ============================================================
export const connectDB = async () => {

  // ── Guard: URI must exist ─────────────────────────────────
  // Fail immediately with a clear message if the developer
  // forgot to set MONGO_URI in the .env file.
  // A missing URI is a configuration error — there is no point
  // attempting a connection or running the HTTP server.
  if (!process.env.MONGO_URI) {
    throw new Error(
      "[DB] MONGO_URI is not defined in environment variables.\n" +
      "     Add it to your .env file: MONGO_URI=mongodb+srv://..."
    );
  }

  // ── Guard: Skip if already connected ─────────────────────
  // mongoose.connection.readyState === 1 means "connected".
  // During development, tools like nodemon restart the module
  // graph on every file save, but the previous Mongoose connection
  // may still be alive. Re-calling connect() creates a second
  // pool, wastes connections, and causes "topology was destroyed"
  // warnings. We short-circuit here to reuse the existing pool.
  if (isConnected) {
    console.log("[DB] Already connected — reusing existing connection pool.");
    return;
  }

  try {
    // ── Attempt Connection ──────────────────────────────────
    // mongoose.connect() returns a Mongoose instance (not the
    // raw driver connection). We destructure .connection from it
    // to access the resolved host, port, and database name for
    // the confirmation log line below.
    const { connection } = await mongoose.connect(
      process.env.MONGO_URI,
      MONGO_OPTIONS
    );

    // Mark as connected so the guard above works on future calls.
    isConnected = true;

    // Log exactly which server and database we are connected to.
    // This is valuable in production to confirm you hit the right
    // Atlas cluster (staging vs production) and the correct DB name.
    console.log(
      `[DB] ✅ MongoDB connected\n` +
      `     Host : ${connection.host}\n` +
      `     Port : ${connection.port}\n` +
      `     Name : ${connection.name}`
    );

    // ── Register Event Listeners ────────────────────────────
    // Mongoose emits events on the default connection object for
    // the entire lifecycle of the connection. Listening to these
    // lets us react to network blips without crashing the process.
    registerConnectionEvents();

  } catch (error) {
    // ── Connection Failed ───────────────────────────────────
    // Log the specific error message (e.g. "bad auth", "ENOTFOUND",
    // "server selection timed out") before re-throwing.
    // Re-throwing lets server.js catch it and decide whether to
    // exit the process or attempt a retry loop.
    console.error(`[DB] ❌ MongoDB connection failed: ${error.message}`);

    // Reset flag so a future retry attempt is not skipped by the guard.
    isConnected = false;

    // Propagate — do NOT silently swallow DB errors.
    throw error;
  }
};
 
// ============================================================
//  registerConnectionEvents
//  Mongoose emits lifecycle events on mongoose.connection.
//  We register these ONCE after the first successful connect.
//  They fire automatically if the network drops and comes back,
//  so you have full observability without polling.
//
//  Why not put these in connectDB directly?
//  Keeping them in a dedicated function avoids re-registering
//  duplicate listeners if connectDB is somehow called again.
// ============================================================
const registerConnectionEvents = () => {

  const conn = mongoose.connection;

  // ── disconnected ────────────────────────────────────────
  // Fires when the connection is lost (network timeout, Atlas
  // maintenance window, VPC routing change, etc.).
  // Mongoose will automatically attempt to reconnect —
  // you do NOT need to call connectDB() again manually.
  // The log here gives you an observable signal for alerting.
  conn.on("disconnected", () => {
    console.warn("[DB] ⚠️  MongoDB disconnected. Mongoose will auto-reconnect…");
    isConnected = false;
  });

  // ── reconnected ─────────────────────────────────────────
  // Fires after Mongoose successfully re-establishes the
  // connection following a disconnect. At this point the
  // connection pool is healthy again and queries will succeed.
  conn.on("reconnected", () => {
    console.log("[DB] ✅ MongoDB reconnected successfully.");
    isConnected = true;
  });

  // ── error ────────────────────────────────────────────────
  // Fires on connection-level errors AFTER the initial connect
  // (e.g. SSL handshake failures, protocol errors, Atlas IP
  // whitelist changes). This is separate from the try/catch
  // above, which only covers the initial connect() call.
  conn.on("error", (err) => {
    console.error(`[DB] ❌ Mongoose connection error: ${err.message}`);
  });

  // ── close ────────────────────────────────────────────────
  // Fires when the connection is explicitly closed via
  // mongoose.connection.close() — i.e. during graceful shutdown
  // in server.js. Useful for confirming the shutdown sequence
  // completed correctly.
  conn.on("close", () => {
    console.log("[DB] 🔌 MongoDB connection closed.");
    isConnected = false;
  });
};

// ============================================================
//  disconnectDB
//  Cleanly drains and closes the Mongoose connection pool.
//  Call this during graceful shutdown (SIGTERM / SIGINT)
//  AFTER server.close() has stopped accepting new requests.
//
//  mongoose.connection.close() with force=false (the default)
//  waits for in-flight queries to complete before disconnecting.
//  Pass true only if you need an immediate, hard close.
//
//  Usage (in server.js graceful shutdown handler):
//    await disconnectDB();
// ============================================================
export const disconnectDB = async () => {
  if (!isConnected) {
    // Nothing to close — avoids a "topology already closed" error
    // if disconnectDB is called more than once during shutdown.
    console.log("[DB] Already disconnected — nothing to close.");
    return;
  }

  try {
    // Drain active queries, then close all pooled TCP connections.
    await mongoose.connection.close();
    isConnected = false;
    console.log("[DB] 🔌 MongoDB disconnected gracefully.");
  } catch (error) {
    console.error(`[DB] ❌ Error while disconnecting: ${error.message}`);
    throw error; // Let server.js handle the exit code.
  }
};

// ============================================================
//  getConnectionStatus
//  Returns a plain object describing the current connection
//  state. Used by the /health endpoint in app.js to give
//  load balancers and monitoring tools an accurate picture
//  of DB availability without exposing Mongoose internals.
//
//  readyState values (Mongoose constant):
//    0 — disconnected
//    1 — connected
//    2 — connecting
//    3 — disconnecting
//
//  Usage (in health-check route):
//    const dbStatus = getConnectionStatus();
//    res.json({ server: "ok", db: dbStatus });
// ============================================================
export const getConnectionStatus = () => {
  const state = mongoose.connection.readyState;

  // Human-readable label for each numeric state.
  const STATE_LABELS = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  return {
    status:    STATE_LABELS[state] ?? "unknown",
    readyState: state,
    host:      mongoose.connection.host   || null,
    database:  mongoose.connection.name   || null,
  };
};
