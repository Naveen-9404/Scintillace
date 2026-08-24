class ApiResponse {
  constructor(
    success,
    message,
    data = null,
    statusCode = 200,
  ) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.statusCode = statusCode;
  }

  /**
   * ============================================================
   * Success Response
   * ============================================================
   */

  static success(
    res,
    data = null,
    message = "Request successful.",
    statusCode = 200,
  ) {
    return res
      .status(statusCode)
      .json({
        success: true,
        message,
        data,
      });
  }

  /**
   * ============================================================
   * Error Response
   * ============================================================
   */

  static error(
    res,
    message = "Something went wrong.",
    statusCode = 500,
    errors = [],
  ) {
    return res
      .status(statusCode)
      .json({
        success: false,
        message,
        data: null,
        errors,
      });
  }
}

export default ApiResponse;