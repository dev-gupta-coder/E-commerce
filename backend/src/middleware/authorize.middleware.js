// ============================================================
//  src/middleware/authorize.middleware.js
//
//  Responsibility:
//    Role-Based Access Control (RBAC) — enforce WHAT an
//    authenticated user is ALLOWED to do, not who they are.
//    Identity (authentication) is handled by verifyJWT in
//    auth.middleware.js.  This file only handles authorization.
//
//  Mental model — two separate gates on every protected route:
//
//    ┌──────────────┐     ┌──────────────────┐     ┌─────────┐
//    │  verifyJWT   │────▶│  authorizeRoles   │────▶│ Handler │
//    │ (who are you?)│     │ (what can you do?)│     │         │
//    └──────────────┘     └──────────────────┘     └─────────┘
//
//    verifyJWT  → sets req.user = { _id, mobile, role, … }
//    authorize  → reads req.user.role and allows/blocks
//
//  Roles in this platform:
//    "admin"    — store administrator (previously "owner").
//                 Can manage products, view all orders, manage users.
//    "customer" — registered buyer.
//                 Can browse products, place orders, manage own profile.
//
//  Exported:
//    ROLES              — frozen enum of valid role strings
//    authorizeRoles     — factory: authorizeRoles("admin")
//    requireAdmin       — shorthand for authorizeRoles("admin")
//    requireCustomer    — shorthand for authorizeRoles("customer")
//    requireAnyRole     — allows any authenticated user (admin or customer)
//    authorizeOwnership — ensures the requesting user owns the resource
// ============================================================

import { ApiError }     from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// ============================================================
//  ROLES ENUM
//  A frozen object used as a type-safe enum for role strings.
//
//  Why Object.freeze()?
//    Prevents accidental mutation anywhere in the codebase:
//      ROLES.admin = "superuser"  // silently ignored in strict mode,
//                                 // throws in non-strict — either way, safe
//
//  Why a centralised enum instead of raw strings?
//    • Typos become immediate ReferenceErrors instead of silent
//      authorization bugs.  ROLES.admni → undefined → TypeError.
//    • A single place to add new roles (moderator, vendor, etc.)
//      without hunting string literals across 20 files.
//    • IDE autocomplete works correctly.
//
//  Usage:
//    authorizeRoles(ROLES.admin)
//    if (req.user.role === ROLES.customer) { ... }
// ============================================================
export const ROLES = Object.freeze({
  ADMIN:    "admin",
  CUSTOMER: "customer",
});

// ============================================================
//  authorizeRoles  (Factory Function)
//
//  Returns an Express middleware function that allows the request
//  to proceed ONLY if req.user.role is one of the roles passed
//  as arguments.  Blocks all others with 403 Forbidden.
//
//  Design pattern — factory (higher-order function):
//    The factory accepts the allowed roles at route-definition
//    time, closes over them, and returns the actual middleware.
//    This makes route declarations read like English:
//
//      router.post("/products", verifyJWT, authorizeRoles("admin"), createProduct);
//      router.get("/products",  verifyJWT, authorizeRoles("admin", "customer"), getProducts);
//
//  Why variadic (...roles)?
//    A route may be accessible to more than one role.
//    The spread operator collects all arguments into an array,
//    so calling authorizeRoles("admin", "customer") works
//    identically to authorizeRoles(ROLES.ADMIN, ROLES.CUSTOMER).
//
//  Why 403 and not 404?
//    403 Forbidden — the server understood the request, the user
//    is authenticated, but the user lacks permission.
//    404 Not Found is sometimes used to hide resource existence
//    from unauthorized users ("security through obscurity").
//    This codebase uses explicit 403 for clarity; use 404 variant
//    if you need to hide that a route exists.
//
//  Why not 401?
//    401 Unauthorized means the client is NOT authenticated —
//    i.e., no valid token.  Here the user IS authenticated (JWT
//    was valid), they just lack the required role.  401 would
//    wrongly instruct the client to re-authenticate.
//
//  Dependency on verifyJWT:
//    This middleware MUST be placed after verifyJWT in the chain.
//    If used standalone (without verifyJWT), req.user is undefined
//    and the safety check below catches it explicitly.
//
//  @param  {...string} roles  — one or more allowed role strings
//  @returns {Function}         — Express middleware (req, res, next)
// ============================================================
export const authorizeRoles = (...roles) => {

  // ── Input validation at route-definition time ─────────────
  // Validate the roles the developer passed in when wiring the
  // route — catch typos immediately when the server starts, not
  // at the moment a real user hits the endpoint.
  const validRoleValues = Object.values(ROLES);

  roles.forEach((role) => {
    if (!validRoleValues.includes(role)) {
      // This throws when the route file is first imported —
      // a misconfigured route crashes the server on startup,
      // which is far better than silently allowing everyone through.
      throw new Error(
        `[authorize] Invalid role "${role}" passed to authorizeRoles(). ` +
        `Valid roles are: ${validRoleValues.join(", ")}.`
      );
    }
  });

  // ── Return the actual middleware ──────────────────────────
  // asyncHandler wraps the middleware so any thrown ApiError
  // propagates to the global error handler in app.js.
  return asyncHandler(async (req, _res, next) => {

    // ── Safety guard — verifyJWT must run first ─────────────
    // If req.user is missing, verifyJWT was not in the chain.
    // Treat as unauthenticated rather than silently passing.
    if (!req.user) {
      return next(
        new ApiError(
          401,
          "Authentication required. Please log in."
        )
      );
    }

    // ── Role check ──────────────────────────────────────────
    // Array.includes() is O(1) for small arrays — no performance
    // concern.  For large role sets, use a Set for O(1) lookups.
    const hasPermission = roles.includes(req.user.role);

    if (!hasPermission) {
      // Log the violation for audit/monitoring.
      // In production, pipe this to your logging service
      // (Datadog, CloudWatch, Sentry) with user ID and endpoint.
      console.warn(
        `[RBAC] Access denied — ` +
        `user: ${req.user._id} | ` +
        `role: "${req.user.role}" | ` +
        `required: [${roles.join(", ")}] | ` +
        `path: ${req.method} ${req.originalUrl}`
      );

      return next(
        new ApiError(
          403,
          `Access denied. This action requires one of the following roles: ` +
          `[${roles.join(", ")}].`
        )
      );
    }

    // ── Permission granted ──────────────────────────────────
    // Log successful privileged access (admin-only routes).
    // Useful for audit trails without a separate audit-log service.
    if (roles.includes(ROLES.ADMIN)) {
      console.info(
        `[RBAC] Admin action — ` +
        `user: ${req.user._id} | ` +
        `path: ${req.method} ${req.originalUrl}`
      );
    }

    next();
  });
};

// ============================================================
//  SHORTHAND MIDDLEWARE — requireAdmin
//
//  Pre-composed version of authorizeRoles(ROLES.ADMIN).
//  Use this on any route that only admins can access:
//
//    router.post("/products",       verifyJWT, requireAdmin, createProduct);
//    router.put("/products/:id",    verifyJWT, requireAdmin, updateProduct);
//    router.delete("/products/:id", verifyJWT, requireAdmin, deleteProduct);
//    router.get("/admin/users",     verifyJWT, requireAdmin, listAllUsers);
//    router.get("/admin/orders",    verifyJWT, requireAdmin, listAllOrders);
//
//  Identical to: authorizeRoles("admin")
//  Provided as a named export for readability at the route level.
// ============================================================
export const requireAdmin = authorizeRoles(ROLES.ADMIN);

// ============================================================
//  SHORTHAND MIDDLEWARE — requireCustomer
//
//  Pre-composed version of authorizeRoles(ROLES.CUSTOMER).
//  Use this on routes that authenticated customers can access
//  but admins should be explicitly blocked from (e.g., placing
//  an order from an admin account would pollute sales reports).
//
//    router.post("/orders",  verifyJWT, requireCustomer, placeOrder);
//    router.get("/wishlist", verifyJWT, requireCustomer, getWishlist);
//
//  If admins should ALSO be able to place orders (e.g., for
//  testing purposes), use requireAnyRole instead.
// ============================================================
export const requireCustomer = authorizeRoles(ROLES.CUSTOMER);

// ============================================================
//  requireAnyRole
//
//  Allows any user with a valid, recognised role (admin OR
//  customer) to proceed.  Effectively the same as just using
//  verifyJWT alone, but makes the intent explicit in the route
//  declaration and validates that the role stored in the token
//  is a known value — not an arbitrary string that somehow
//  got into the DB.
//
//  Use on routes that all authenticated users can access but
//  where the controller needs to branch behaviour by role:
//
//    router.get("/orders/:id", verifyJWT, requireAnyRole, getOrderById);
//    // Controller: admin sees any order; customer sees only their own.
//
//  Spreads all ROLES values into authorizeRoles().
// ============================================================
export const requireAnyRole = authorizeRoles(...Object.values(ROLES));

// ============================================================
//  authorizeOwnership
//  Resource-level authorization — ensures the requesting user
//  owns the resource they are trying to access or modify.
//
//  Problem it solves:
//    verifyJWT + requireCustomer confirms the user is an
//    authenticated customer, but does NOT prevent customer A
//    from modifying customer B's order by guessing the order ID.
//    This middleware closes that IDOR (Insecure Direct Object
//    Reference) vulnerability.
//
//  How it works:
//    It accepts a selector function that extracts the owner ID
//    from the already-fetched resource and compares it against
//    req.user._id.  The resource fetch happens in the controller;
//    this middleware reads it from res.locals (the standard
//    Express mechanism for passing data between middleware).
//
//  Admin bypass:
//    Admins are exempt — they can access any resource.
//    This mirrors real-world platforms where support staff can
//    look up any customer's order to handle a complaint.
//
//  Contract with the controller / upstream middleware:
//    The upstream middleware (or the same route handler in a
//    preceding step) must place the fetched resource on:
//      res.locals.resource = <fetched document>
//
//  Example (order ownership check):
//    router.put(
//      "/orders/:id",
//      verifyJWT,
//      requireAnyRole,
//      fetchOrderMiddleware,       // sets res.locals.resource = order
//      authorizeOwnership((resource) => resource.user.toString()),
//      updateOrder
//    );
//
//  @param  {Function} getOwnerId
//          A function that receives the resource document and
//          returns the owner's ID as a string.
//          Example: (order) => order.user.toString()
//
//  @returns {Function} Express middleware
// ============================================================
export const authorizeOwnership = (getOwnerId) => {

  // Validate at route-definition time that a selector was provided.
  if (typeof getOwnerId !== "function") {
    throw new Error(
      "[authorize] authorizeOwnership() requires a selector function. " +
      "Example: authorizeOwnership((resource) => resource.user.toString())"
    );
  }

  return asyncHandler(async (req, res, next) => {

    // ── Safety guard ─────────────────────────────────────────
    if (!req.user) {
      return next(new ApiError(401, "Authentication required."));
    }

    // ── Admin bypass ─────────────────────────────────────────
    // Admins can access any resource — no ownership check needed.
    // Return early to skip the comparison below.
    if (req.user.role === ROLES.ADMIN) {
      return next();
    }

    // ── Read the resource from res.locals ────────────────────
    // res.locals is Express's built-in bag for sharing data
    // between middleware in the same request-response cycle.
    // The upstream fetchResource middleware must populate this.
    const resource = res.locals.resource;

    if (!resource) {
      // Developer error — the fetch middleware was not chained.
      // This is a 500 because it's a server-side configuration
      // mistake, not a client error.
      return next(
        new ApiError(
          500,
          "[authorize] res.locals.resource is not set. " +
          "Chain a resource-fetching middleware before authorizeOwnership()."
        )
      );
    }

    // ── Extract the owner ID using the provided selector ─────
    let ownerId;
    try {
      ownerId = getOwnerId(resource);
    } catch (selectorError) {
      return next(
        new ApiError(
          500,
          "[authorize] getOwnerId selector threw an error: " +
          selectorError.message
        )
      );
    }

    // ── Compare owner ID with authenticated user ID ───────────
    // Both values are cast to string before comparison because:
    //   • req.user._id comes from the JWT payload (already a string).
    //   • ownerId may be a Mongoose ObjectId instance (object type).
    //   • Strict equality (===) between a string and an ObjectId
    //     object always returns false even when the values match.
    const requesterId = req.user._id.toString();
    const resourceOwner = ownerId?.toString();

    if (!resourceOwner || requesterId !== resourceOwner) {
      console.warn(
        `[RBAC] Ownership violation — ` +
        `requester: ${requesterId} | ` +
        `owner: ${resourceOwner} | ` +
        `path: ${req.method} ${req.originalUrl}`
      );

      return next(
        new ApiError(
          403,
          "Access denied. You do not have permission to access this resource."
        )
      );
    }

    // ── Ownership confirmed — proceed ─────────────────────────
    next();
  });
};