import { HttpException, HttpStatus } from '@nestjs/common';

export interface ErrorResponse {
  message: string;
  code?: string;
  details?: any;
}

export class AppException extends HttpException {
  constructor(
    response: string | ErrorResponse,
    status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
  ) {
    const errorResponse: ErrorResponse =
      typeof response === 'string'
        ? { message: response }
        : response;

    super(errorResponse, status);
  }

  static badRequest(response: string | ErrorResponse): AppException {
    return new AppException(response, HttpStatus.BAD_REQUEST);
  }

  static unauthorized(response: string | ErrorResponse): AppException {
    return new AppException(response, HttpStatus.UNAUTHORIZED);
  }

  static forbidden(response: string | ErrorResponse): AppException {
    return new AppException(response, HttpStatus.FORBIDDEN);
  }

  static notFound(response: string | ErrorResponse): AppException {
    return new AppException(response, HttpStatus.NOT_FOUND);
  }

  static methodNotAllowed(response: string | ErrorResponse): AppException {
    return new AppException(response, HttpStatus.METHOD_NOT_ALLOWED);
  }

  static conflict(response: string | ErrorResponse): AppException {
    return new AppException(response, HttpStatus.CONFLICT);
  }

  static preconditionFailed(response: string | ErrorResponse): AppException {
    return new AppException(response, HttpStatus.PRECONDITION_FAILED);
  }

  static unprocessableEntity(response: string | ErrorResponse): AppException {
    return new AppException(response, HttpStatus.UNPROCESSABLE_ENTITY);
  }

  static tooManyRequests(response: string | ErrorResponse): AppException {
    return new AppException(response, HttpStatus.TOO_MANY_REQUESTS);
  }

  static serverError(response: string | ErrorResponse): AppException {
    return new AppException(response, HttpStatus.INTERNAL_SERVER_ERROR);
  }
} 