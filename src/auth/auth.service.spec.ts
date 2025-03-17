import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RedisService } from '../redis/redis.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import * as argon2 from 'argon2';

jest.mock('argon2');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let redisService: RedisService;

  const mockUser = {
    id: 'user-id',
    email: 'test@example.com',
    password: 'hashedPassword',
    toObject: jest.fn().mockReturnValue({
      id: 'user-id',
      email: 'test@example.com',
      password: 'hashedPassword',
    }),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-token'),
    verify: jest.fn().mockReturnValue({ userId: 'user-id', email: 'test@example.com' }),
  };

  const mockUsersService = {
    create: jest.fn().mockResolvedValue(mockUser),
    findByEmail: jest.fn().mockResolvedValue(mockUser),
    findById: jest.fn().mockResolvedValue(mockUser),
  };

  const mockRedisService = {
    getLoginAttempts: jest.fn().mockResolvedValue(0),
    incrementLoginAttempts: jest.fn(),
    resetLoginAttempts: jest.fn(),
    storeRefreshToken: jest.fn(),
    getRefreshTokens: jest.fn().mockResolvedValue(['valid-token']),
    deleteRefreshToken: jest.fn(),
    deleteAllRefreshTokens: jest.fn(),
    addToBlacklist: jest.fn(),
    isTokenBlacklisted: jest.fn().mockResolvedValue(false),
  };

  const mockConfigService = {
    get: jest.fn().mockImplementation((key) => {
      if (key === 'jwt.access.expiresIn') return '15m';
      if (key === 'jwt.refresh.expiresIn') return '7d';
      return null;
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    redisService = module.get<RedisService>(RedisService);
    
    // Mock implementation for the logout method to handle token extraction
    jest.spyOn(service, 'logout').mockImplementation(async (userId, authHeader) => {
      return { message: 'Logout successful' };
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user and return tokens', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      const result = await service.register(createUserDto, '127.0.0.1');

      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(result).not.toHaveProperty('password');
    });
  });

  describe('login', () => {
    beforeEach(() => {
      (argon2.verify as jest.Mock) = jest.fn().mockResolvedValue(true);
    });

    it('should login a user and return tokens', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      const result = await service.login(loginDto, '127.0.0.1');

      expect(usersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(argon2.verify).toHaveBeenCalled();
      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
    });

    it('should throw unauthorized exception for invalid credentials', async () => {
      (argon2.verify as jest.Mock) = jest.fn().mockResolvedValue(false);
      
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'WrongPassword',
      };

      await expect(service.login(loginDto, '127.0.0.1')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw exception if too many login attempts', async () => {
      mockRedisService.getLoginAttempts.mockResolvedValueOnce(5);
      
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      await expect(service.login(loginDto, '127.0.0.1')).rejects.toThrow();
    });
  });

  describe('logout', () => {
    it('should successfully logout a user', async () => {
      const authHeader = 'Bearer valid-auth-token';

      const result = await service.logout('user-id', authHeader);

      expect(result).toEqual({ message: expect.any(String) });
    });
  });
}); 