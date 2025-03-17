/**
 * This file contains error constants used across the application.
 * Centralizing error codes and messages ensures consistency in error handling.
 */

// Generic errors
export const GENERIC_ERRORS = {
  INTERNAL_SERVER_ERROR: {
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
  },
  VALIDATION_ERROR: {
    code: 'VALIDATION_ERROR',
    message: 'Validation failed',
  },
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    message: 'Authentication is required to access this resource',
  },
  FORBIDDEN: {
    code: 'FORBIDDEN',
    message: 'You do not have permission to access this resource',
  },
  NOT_FOUND: {
    code: 'NOT_FOUND',
    message: 'The requested resource was not found',
  },
  BAD_REQUEST: {
    code: 'BAD_REQUEST',
    message: 'The request is invalid',
  },
};

// Auth-related errors
export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: {
    code: 'INVALID_CREDENTIALS',
    message: 'Invalid email or password',
  },
  TOKEN_EXPIRED: {
    code: 'TOKEN_EXPIRED',
    message: 'Authentication token has expired',
  },
  TOKEN_INVALID: {
    code: 'TOKEN_INVALID',
    message: 'Authentication token is invalid',
  },
  TOKEN_REVOKED: {
    code: 'TOKEN_REVOKED',
    message: 'Authentication token has been revoked',
  },
  EMAIL_ALREADY_EXISTS: {
    code: 'EMAIL_ALREADY_EXISTS',
    message: 'A user with this email already exists',
  },
};

// Todo-related errors
export const TODO_ERRORS = {
  NOT_FOUND: {
    code: 'TODO_NOT_FOUND',
    message: 'Todo not found',
  },
  ALREADY_EXISTS: {
    code: 'TODO_ALREADY_EXISTS',
    message: 'A todo with this title already exists',
  },
  INVALID_ID: {
    code: 'INVALID_TODO_ID',
    message: 'Invalid todo ID format',
  },
  NOT_OWNER: {
    code: 'NOT_TODO_OWNER',
    message: 'You do not own this todo',
  },
}; 