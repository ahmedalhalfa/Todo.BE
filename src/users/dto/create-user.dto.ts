import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description:
      'User password - must be at least 8 characters with one letter, one number, and one special character',
    example: 'Password1!',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]/, {
    message:
      'Password must contain at least one letter, one number, and one special character',
  })
  password: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
    minLength: 3,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MinLength(3, { message: 'First name must be at least 3 characters long' })
  firstName?: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    minLength: 3,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MinLength(3, { message: 'Last name must be at least 3 characters long' })
  lastName?: string;
}
