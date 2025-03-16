import { Injectable, UnauthorizedException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RedisService } from '../redis/redis.service';
import { User } from '../users/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private redisService: RedisService,
  ) {}

  async register(createUserDto: CreateUserDto, ip: string) {
    const user = await this.usersService.create(createUserDto);

    // Create tokens
    const tokens = await this.generateTokens(user.id, user.email);
    
    // Store refresh token in Redis
    await this.storeRefreshToken(user.id, tokens.refresh_token);

    // Return user without password
    const { password, ...result } = user.toObject();
    
    return {
      ...result,
      ...tokens,
    };
  }

  async login(loginDto: LoginDto, ip: string) {
    // Check login rate limit
    const loginAttempts = await this.redisService.getLoginAttempts(ip);
    if (loginAttempts >= 5) {
      throw new ForbiddenException('Too many login attempts. Try again later.');
    }

    const { email, password } = loginDto;
    
    // Find user by email
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      await this.redisService.incrementLoginAttempts(ip);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await this.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      await this.redisService.incrementLoginAttempts(ip);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset login attempts on successful login
    await this.redisService.resetLoginAttempts(ip);

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email);
    
    // Store refresh token in Redis
    await this.storeRefreshToken(user.id, tokens.refresh_token);

    // Return user without password
    const { password: _, ...result } = user.toObject();
    
    return {
      ...result,
      ...tokens,
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;
    
    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') || this.configService.get<string>('JWT_SECRET'),
      });
      
      // Check if refresh token is valid in Redis
      const isValid = await this.redisService.validateRefreshToken(payload.sub, refreshToken);
      if (!isValid) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      
      // Delete old refresh token
      await this.redisService.deleteRefreshToken(payload.sub, refreshToken);
      
      // Generate new tokens
      const tokens = await this.generateTokens(payload.sub, payload.email);
      
      // Store new refresh token
      await this.storeRefreshToken(payload.sub, tokens.refresh_token);
      
      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string, token: string) {
    // Extract token from Bearer format
    const accessToken = token.split(' ')[1];
    
    try {
      // Decode token to get expiry
      const decoded = this.jwtService.decode(accessToken);
      if (!decoded || typeof decoded !== 'object') {
        throw new BadRequestException('Invalid token');
      }
      
      // Calculate remaining time to expiry
      const expiresAt = decoded.exp;
      const currentTime = Math.floor(Date.now() / 1000);
      const remainingTime = expiresAt - currentTime;
      
      if (remainingTime > 0) {
        // Add token to blacklist in Redis with TTL equal to remaining time
        await this.redisService.addToBlacklist(accessToken, remainingTime);
      }
      
      return { message: 'Logged out successfully' };
    } catch (error) {
      throw new BadRequestException('Invalid token');
    }
  }

  async logoutAll(userId: string) {
    await this.redisService.deleteAllRefreshTokens(userId);
    return { message: 'Logged out from all devices' };
  }

  private async generateTokens(userId: string, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(userId, email),
      this.generateRefreshToken(userId, email),
    ]);
    
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  private generateAccessToken(userId: string, email: string): string {
    const payload = { sub: userId, email };
    return this.jwtService.sign(payload);
  }

  private async generateRefreshToken(userId: string, email: string): Promise<string> {
    const payload = { sub: userId, email };
    
    // Use separate secret for refresh tokens or default to JWT_SECRET
    const secret = this.configService.get<string>('JWT_REFRESH_SECRET') || this.configService.get<string>('JWT_SECRET');
    
    // Use longer expiration time for refresh tokens
    const expiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d');
    
    return this.jwtService.sign(payload, {
      secret,
      expiresIn,
    });
  }

  private async storeRefreshToken(userId: string, token: string): Promise<void> {
    // Default refresh token expiry (7 days in seconds)
    const expiryTime = parseInt(this.configService.get<string>('JWT_REFRESH_EXPIRATION_SECONDS', '604800'), 10);
    
    await this.redisService.storeRefreshToken(userId, token, expiryTime);
  }

  private async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return argon2.verify(hashedPassword, plainPassword);
  }
} 