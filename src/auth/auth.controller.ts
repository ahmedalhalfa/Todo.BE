import { 
  Body, 
  Controller, 
  Post, 
  HttpCode, 
  HttpStatus, 
  Req, 
  UseGuards,
  Ip,
  UseInterceptors,
  ClassSerializerInterceptor,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ThrottlerGuard } from '@nestjs/throttler';

@ApiTags('auth')
@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @UseGuards(ThrottlerGuard)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ 
    status: 201, 
    description: 'User has been successfully registered and tokens generated',
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid data' })
  @ApiResponse({ status: 409, description: 'Conflict - Email already exists' })
  register(@Body() createUserDto: CreateUserDto, @Ip() ip: string) {
    return this.authService.register(createUserDto, ip);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ 
    status: 200, 
    description: 'User has been successfully logged in and tokens generated',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid credentials' })
  @ApiResponse({ status: 403, description: 'Forbidden - Too many login attempts' })
  login(@Body() loginDto: LoginDto, @Ip() ip: string) {
    return this.authService.login(loginDto, ip);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({ 
    status: 200, 
    description: 'Tokens have been successfully refreshed',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid refresh token' })
  refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Logout and invalidate current token' })
  @ApiResponse({ 
    status: 200, 
    description: 'User has been successfully logged out',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid token' })
  logout(@Req() req, @Headers('authorization') token: string) {
    return this.authService.logout(req.user.userId, token);
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Logout from all devices' })
  @ApiResponse({ 
    status: 200, 
    description: 'User has been successfully logged out from all devices',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid token' })
  logoutAll(@Req() req) {
    return this.authService.logoutAll(req.user.userId);
  }
} 