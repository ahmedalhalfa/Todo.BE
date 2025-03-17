import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from '../../logger/logger.service';
import mongoose from 'mongoose';

@Catch(mongoose.Error)
export class MongooseExceptionFilter implements ExceptionFilter {
  private readonly logger = new LoggerService();

  catch(exception: mongoose.Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Database error';
    let errorName = 'MongooseError';

    // Handle specific Mongoose errors
    if (exception instanceof mongoose.Error.ValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = Object.values(exception.errors)
        .map((err) => err.message)
        .join(', ');
      errorName = 'ValidationError';
    } else if (exception instanceof mongoose.Error.CastError) {
      status = HttpStatus.BAD_REQUEST;
      message = `Invalid ${exception.path}: ${exception.value}`;
      errorName = 'CastError';
    } else if (exception instanceof mongoose.Error.DocumentNotFoundError) {
      status = HttpStatus.NOT_FOUND;
      message = 'Document not found';
      errorName = 'DocumentNotFoundError';
    } else if (
      exception.name === 'MongoServerError' &&
      exception['code'] === 11000
    ) {
      // Duplicate key error
      status = HttpStatus.CONFLICT;
      message = 'Duplicate key error';
      errorName = 'DuplicateKeyError';

      // Try to extract the duplicate field
      const keyPattern = exception['keyPattern'];
      if (keyPattern) {
        const field = Object.keys(keyPattern)[0];
        message = `${field} already exists`;
      }
    }

    // Structured error response
    const responseBody = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: message,
      name: errorName,
    };

    // Log the error
    this.logger.error(
      `[${request.method}] ${request.url} - ${status} ${message}`,
      exception.stack,
      {
        errorDetails: responseBody,
        body: request.body,
        params: request.params,
        query: request.query,
      },
    );

    // Send response
    response.status(status).json(responseBody);
  }
}
