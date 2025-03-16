import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class RedisService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  // Store token in blacklist with expiry time matching the token expiry
  async addToBlacklist(token: string, expiryTimeInSeconds: number): Promise<void> {
    await this.cacheManager.set(`blacklist:${token}`, 'true', expiryTimeInSeconds * 1000);
  }

  // Check if token is blacklisted
  async isBlacklisted(token: string): Promise<boolean> {
    const result = await this.cacheManager.get(`blacklist:${token}`);
    return result === 'true';
  }

  // Store refresh token for a user
  async storeRefreshToken(userId: string, token: string, expiryTimeInSeconds: number): Promise<void> {
    await this.cacheManager.set(`refresh:${userId}:${token}`, userId, expiryTimeInSeconds * 1000);
  }

  // Validate refresh token
  async validateRefreshToken(userId: string, token: string): Promise<boolean> {
    const result = await this.cacheManager.get(`refresh:${userId}:${token}`);
    return result === userId;
  }

  // Delete refresh token (for logout or after use)
  async deleteRefreshToken(userId: string, token: string): Promise<void> {
    await this.cacheManager.del(`refresh:${userId}:${token}`);
  }

  // Delete all refresh tokens for a user (force logout from all devices)
  async deleteAllRefreshTokens(userId: string): Promise<void> {
    // This is a simplified implementation; in production, you'd need a Redis client
    // that supports pattern-based deletion (SCAN + DEL) which the cache manager doesn't easily expose
    // For now, we'd use this as a stub that you'd replace with a direct Redis client implementation
    console.log(`Logout all sessions for user: ${userId}`);
  }

  // Rate limiting helpers
  async incrementLoginAttempts(ip: string): Promise<number> {
    const key = `login_attempts:${ip}`;
    const attempts = await this.cacheManager.get<number>(key) || 0;
    const newAttempts = attempts + 1;
    
    // Store for 15 minutes
    await this.cacheManager.set(key, newAttempts, 15 * 60 * 1000);
    return newAttempts;
  }

  async getLoginAttempts(ip: string): Promise<number> {
    return await this.cacheManager.get<number>(`login_attempts:${ip}`) || 0;
  }

  async resetLoginAttempts(ip: string): Promise<void> {
    await this.cacheManager.del(`login_attempts:${ip}`);
  }
} 