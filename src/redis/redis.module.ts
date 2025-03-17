import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisService } from './redis.service';
import { redisStore } from 'cache-manager-redis-store';
import type { RedisClientOptions } from 'redis';

@Module({
  imports: [
    CacheModule.registerAsync<RedisClientOptions>({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get<string>('REDIS_HOST', 'localhost'),
        port: configService.get<number>('REDIS_PORT', 6379),
        ttl: configService.get<number>('REDIS_TTL', 3600),
        password: configService.get<string>('REDIS_PASSWORD'),
        username: configService.get<string>('REDIS_USERNAME'),
        tls: configService.get<boolean>('REDIS_TLS', false),
      }),
      inject: [ConfigService],
      isGlobal: true,
    }),
  ],
  providers: [RedisService],
  exports: [CacheModule, RedisService],
})
export class RedisModule {}
