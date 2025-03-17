import { ApiProperty } from '@nestjs/swagger';

export class AuthTokensResponse {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string;

  @ApiProperty({
    description: 'JWT refresh token used to get new access tokens',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refresh_token: string;
}

export class UserResponse {
  @ApiProperty({
    description: 'User ID',
    example: '60d21b4667d0d8992e610c85',
  })
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
    required: false,
  })
  firstName?: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    required: false,
  })
  lastName?: string;

  @ApiProperty({
    description: 'User creation timestamp',
    example: '2023-07-21T15:30:45.123Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'User last update timestamp',
    example: '2023-07-21T15:30:45.123Z',
  })
  updatedAt: Date;
}

export class AuthResponse extends UserResponse {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string;

  @ApiProperty({
    description: 'JWT refresh token used to get new access tokens',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refresh_token: string;
}

export class LogoutResponse {
  @ApiProperty({
    description: 'Success message',
    example: 'Logout successful',
  })
  message: string;
}
