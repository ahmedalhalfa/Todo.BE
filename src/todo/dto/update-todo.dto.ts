import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTodoDto {
  @ApiProperty({
    description: 'Title of the todo item',
    example: 'Updated project title',
    required: false,
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: 'Description of the todo item',
    example: 'Updated description with new deadline',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Completion status of the todo item',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  completed?: boolean;
} 