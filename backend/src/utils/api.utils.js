// ============================================================
//  src/utils/ApiError.js  &  ApiResponse.js  &  asyncHandler.js
//  (Combined for convenience — split into separate files in prod)
// ============================================================

// ============================================================
//  ApiError
//  Custom Error class that adds HTTP statusCode and a structured
//  errors array to the native Error object.
//
//  Why extend Error instead of using plain objects?
//    • instanceof checks work: if (err instanceof ApiError)
//    • Stack trace is preserved automatically via Error.captureStackTrace
//    • Express's error handler signature expects an Error object
//
//  Usage:
//    throw new ApiError(404, "Product not found.");
//    throw new ApiError(422, "Validation failed.", validationErrors);
// ============================================================
export class ApiError extends Error {
  constructor(
    statusCode,           // HTTP status code (400, 401, 403, 404, 409, 500…)
    message  = "Something went wrong",
    errors   = [],        // array of field-level validation errors (optional)
    stack    = ""         // custom stack trace (used in testing)
  ) {
    // Call the native Error constructor with the message.
    // This sets this.message and begins the prototype chain.
    super(message);

    this.statusCode = statusCode;
    this.success    = false;      // always false for errors — frontend key
    this.errors     = errors;

    // Capture or forward the stack trace.
    if (stack) {
      this.stack = stack;
    } else {
      // Excludes the ApiError constructor itself from the stack —
      // the trace starts at the line that threw the error.
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// ============================================================
//  ApiResponse
//  Uniform success response envelope.
//
//  Every successful API response should have the same shape:
//    { statusCode, success, message, data }
//
//  Why a class instead of a plain object factory?
//    Classes are self-documenting, support instanceof checks,
//    and are easy to find in a codebase-wide search.
//
//  Usage:
//    res.status(200).json(
//      new ApiResponse(200, { user }, "Login successful.")
//    );
// ============================================================
export class ApiResponse {
  constructor(
    statusCode,           // HTTP status code (200, 201, 204…)
    data,                 // response payload (object, array, or null)
    message = "Success"   // human-readable description
  ) {
    this.statusCode = statusCode;
    this.success    = statusCode < 400;  // true for 2xx/3xx, false for 4xx/5xx
    this.message    = message;
    this.data       = data;
  }
}

// ============================================================
//  asyncHandler
//  Higher-order function that wraps an async Express route
//  handler and forwards any rejected Promise to next(err).
//
//  Without this wrapper every async controller needs:
//    try { ... } catch (err) { next(err) }
//
//  With this wrapper:
//    router.get("/", asyncHandler(async (req, res) => { ... }));
//    Any thrown error (including ApiError) automatically reaches
//    the global error handler in app.js.
//
//  The wrapper is transparent — it returns a regular Express
//  middleware function (req, res, next) so Express never knows
//  the difference.
//
//  @param  {Function} fn  — async (req, res, next) => Promise
//  @returns {Function}     — standard Express middleware
// ============================================================
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
  // .catch(next) is equivalent to catch(err) { next(err) }
  // next(err) triggers Express's error handling pipeline,
  // which routes to the 4-argument error middleware in app.js.
};