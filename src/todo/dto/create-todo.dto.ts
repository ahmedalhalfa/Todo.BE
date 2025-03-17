import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTodoDto {
  @ApiProperty({
    description: 'Title of the todo item',
    example: 'Complete project',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Description of the todo item',
    example: 'Finish the backend implementation by Friday',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Completion status of the todo item',
    example: false,
    default: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  completed?: boolean;
}
