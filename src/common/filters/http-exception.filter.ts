import { 
  ExceptionFilter, 
  Catch, 
  ArgumentsHost, 
  HttpException 
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from '../../logger/logger.service';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new LoggerService();
  
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    // Get error message
    const errorResponse = exception.getResponse();
    const message = typeof errorResponse === 'object' && 'message' in errorResponse 
      ? Array.isArray(errorResponse['message']) 
        ? errorResponse['message'].join(', ') 
        : errorResponse['message']
      : exception.message;

    // Structured error response
    const responseBody = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: message,
      name: exception.name,
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
      }
    );

    // Send response
    response.status(status).json(responseBody);
  }
} 