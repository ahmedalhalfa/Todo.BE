import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import pinoHttp from 'pino-http';
import pino from 'pino';
import { IncomingMessage, ServerResponse } from 'http';

@Injectable()
export class PinoHttpMiddleware implements NestMiddleware {
  private logger: ReturnType<typeof pinoHttp>;

  constructor() {
    this.logger = pinoHttp({
      logger: pino({
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
          },
        },
        level: process.env.LOG_LEVEL || 'info',
      }),
      customSuccessMessage: (req: IncomingMessage, res: ServerResponse) => {
        return `${req.method} ${req.url} completed with status ${res.statusCode}`;
      },
      customErrorMessage: (
        req: IncomingMessage,
        res: ServerResponse,
        err: Error,
      ) => {
        return `${req.method} ${req.url} failed with status ${res.statusCode}`;
      },
      customAttributeKeys: {
        req: 'request',
        res: 'response',
        err: 'error',
      },
      serializers: {
        req: (req: any) => ({
          method: req.method,
          url: req.url,
          params: req.params,
          query: req.query,
          headers: req.headers,
          body: req.raw?.body,
        }),
        res: (res: any) => ({
          statusCode: res.statusCode,
          headers: res.headers,
        }),
      },
      autoLogging: true,
      redact: {
        paths: [
          'req.headers.authorization',
          'req.headers.cookie',
          'req.body.password',
        ],
        remove: true,
      },
    });
  }

  use(req: Request, res: Response, next: NextFunction) {
    this.logger(req, res);
    next();
  }
}
