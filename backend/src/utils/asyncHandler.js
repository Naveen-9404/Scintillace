/**
 * ============================================================
 * Async Express Handler
 * ============================================================
 *
 * Wraps an asynchronous Express route handler and forwards
 * rejected promises or thrown errors to the global error
 * middleware.
 *
 * @param {Function} fn Express async handler
 * @returns {Function} Wrapped Express handler
 */

const asyncHandler =
  (fn) =>
  (req, res, next) =>
    Promise.resolve(
      fn(req, res, next),
    ).catch(next);

export default Object.freeze(
  asyncHandler,
);