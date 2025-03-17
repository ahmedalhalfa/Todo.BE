import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';
import { RedisService } from '../redis/redis.service';
import { Request } from 'express';
import { AppException } from '../common/exceptions/app-exception';
import { AUTH_ERRORS } from '../common/constants/error-codes';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private usersService: UsersService,
    private redisService: RedisService,
  ) {
    // Make sure we have a non-undefined secret key
    const secret = configService.get<string>('JWT_SECRET') || 'fallback_secret_do_not_use_in_production';
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: any) {
    // Get the token from the Authorization header
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw AppException.unauthorized({
        message: AUTH_ERRORS.TOKEN_INVALID.message,
        code: AUTH_ERRORS.TOKEN_INVALID.code,
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Check if token is blacklisted
    const isBlacklisted = await this.redisService.isBlacklisted(token);
    if (isBlacklisted) {
      throw AppException.unauthorized({
        message: AUTH_ERRORS.TOKEN_REVOKED.message,
        code: AUTH_ERRORS.TOKEN_REVOKED.code,
      });
    }
    
    // Verify user exists
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw AppException.unauthorized({
        message: AUTH_ERRORS.INVALID_CREDENTIALS.message,
        code: AUTH_ERRORS.INVALID_CREDENTIALS.code,
      });
    }
    
    return { userId: payload.sub, email: payload.email };
  }
} 