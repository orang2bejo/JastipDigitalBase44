// Error Handler Utility untuk JastipDigital
export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.timestamp = new Date().toISOString();
  }
}

export const ErrorCodes = {
  // Authentication & Authorization
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  
  // Order Related
  ORDER_NOT_FOUND: 'ORDER_NOT_FOUND',
  ORDER_ALREADY_ACCEPTED: 'ORDER_ALREADY_ACCEPTED',
  INVALID_ORDER_STATUS: 'INVALID_ORDER_STATUS',
  
  // Payment
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  INVALID_PAYMENT_METHOD: 'INVALID_PAYMENT_METHOD',
  
  // External Services
  DUITKU_ERROR: 'DUITKU_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  
  // General
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR'
};

export const handleError = (error, context = '') => {
  console.error(`[${context}] Error:`, error);
  
  if (error instanceof AppError) {
    return {
      success: false,
      error: {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        timestamp: error.timestamp
      }
    };
  }
  
  return {
    success: false,
    error: {
      message: error.message || 'Terjadi kesalahan internal',
      code: ErrorCodes.INTERNAL_ERROR,
      statusCode: 500,
      timestamp: new Date().toISOString()
    }
  };
};

export const validateRequired = (data, requiredFields) => {
  const missing = requiredFields.filter(field => !data[field]);
  if (missing.length > 0) {
    throw new AppError(
      `Field wajib tidak ada: ${missing.join(', ')}`,
      400,
      ErrorCodes.MISSING_REQUIRED_FIELD
    );
  }
};