import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, Matches } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]/, {
    message: 'Password must contain at least one letter, one number, and one special character',
  })
  password: string;

  @IsString()
  @IsOptional()
  @MinLength(3, { message: 'First name must be at least 3 characters long' })
  firstName?: string;

  @IsString()
  @IsOptional()
  @MinLength(3, { message: 'Last name must be at least 3 characters long' })
  lastName?: string;
} 