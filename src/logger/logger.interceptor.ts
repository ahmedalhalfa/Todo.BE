import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { LoggerService } from './logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly loggerService: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const request = context.switchToHttp().getRequest();
    const methodName = context.getHandler().name;
    const className = context.getClass().name;
    const functionName = `${className}.${methodName}`;
    const args = request.body || {};

    // Log the function call with input parameters
    this.loggerService.log(`Function called: ${functionName}`, { 
      params: args,
      type: 'Function Input'
    });

    return next.handle().pipe(
      tap(data => {
        const responseTime = Date.now() - now;
        
        // Log the function output on success
        this.loggerService.log(`Function completed: ${functionName}`, {
          result: data,
          executionTime: `${responseTime}ms`,
          type: 'Function Output'
        });
      }),
      catchError(error => {
        const responseTime = Date.now() - now;
        
        // Log the error if function execution fails
        this.loggerService.error(`Function failed: ${functionName}`, error.stack, {
          params: args,
          error: error.message,
          executionTime: `${responseTime}ms`,
          type: 'Function Error'
        });
        
        throw error;
      }),
    );
  }
} 