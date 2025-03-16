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
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ThrottlerGuard } from '@nestjs/throttler';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @UseGuards(ThrottlerGuard)
  register(@Body() createUserDto: CreateUserDto, @Ip() ip: string) {
    return this.authService.register(createUserDto, ip);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  login(@Body() loginDto: LoginDto, @Ip() ip: string) {
    return this.authService.login(loginDto, ip);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  logout(@Req() req, @Headers('authorization') token: string) {
    return this.authService.logout(req.user.userId, token);
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  logoutAll(@Req() req) {
    return this.authService.logoutAll(req.user.userId);
  }
} 