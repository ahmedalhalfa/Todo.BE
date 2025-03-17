import { 
  ExceptionFilter, 
  Catch, 
  ArgumentsHost, 
  HttpException, 
  HttpStatus,
  Logger
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from '../../logger/logger.service';
import mongoose from 'mongoose';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new LoggerService();

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    // Default error details
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorName = 'InternalServerError';
    
    // Get more information based on exception type
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const errorResponse = exception.getResponse();
      
      message = this.extractErrorMessage(errorResponse, exception.message);
      errorName = exception.name;
    } else if (exception instanceof mongoose.Error.ValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = Object.values(exception.errors)
        .map(err => err.message)
        .join(', ');
      errorName = 'ValidationError';
    } else if (exception instanceof mongoose.Error.CastError) {
      status = HttpStatus.BAD_REQUEST;
      message = `Invalid ${exception.path}: ${exception.value}`;
      errorName = 'CastError';
    } else if (exception instanceof Error) {
      message = exception.message;
      errorName = exception.name;
    }
    
    // Prepare error response object
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: message,
      name: errorName,
    };
    
    // Log the error details
    this.logger.error(
      `[${request.method}] ${request.url} - ${status} ${message}`,
      exception instanceof Error ? exception.stack : undefined,
      { 
        errorDetails: errorResponse,
        body: request.body,
        params: request.params,
        query: request.query,
      }
    );
    
    // Send the error response
    response.status(status).json(errorResponse);
  }

  private extractErrorMessage(errorResponse: unknown, defaultMessage: string): string {
    if (typeof errorResponse !== 'object' || !errorResponse) {
      return defaultMessage;
    }

    const resp = errorResponse as Record<string, unknown>;
    if (!('message' in resp)) {
      return defaultMessage;
    }

    const message = resp['message'];
    if (Array.isArray(message)) {
      return message.join(', ');
    } else if (typeof message === 'string') {
      return message;
    }

    return defaultMessage;
  }
} 