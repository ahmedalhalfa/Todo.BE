import { ApiProperty } from '@nestjs/swagger';

export class TodoResponse {
  @ApiProperty({
    description: 'Todo item ID',
    example: '60d21b4667d0d8992e610c85',
  })
  id: string;

  @ApiProperty({
    description: 'Title of the todo item',
    example: 'Complete project',
  })
  title: string;

  @ApiProperty({
    description: 'Description of the todo item',
    example: 'Finish implementing all required features',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Completion status of the todo item',
    example: false,
  })
  completed: boolean;

  @ApiProperty({
    description: 'ID of the user who owns this todo',
    example: '60d21b4667d0d8992e610c85',
  })
  userId: string;

  @ApiProperty({
    description: 'Todo creation timestamp',
    example: '2023-07-21T15:30:45.123Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Todo last update timestamp',
    example: '2023-07-21T15:30:45.123Z',
  })
  updatedAt: Date;
}

export class TodosArrayResponse {
  @ApiProperty({
    type: [TodoResponse],
    description: 'Array of todo items',
  })
  todos: TodoResponse[];
}

export class DeleteTodoResponse {
  @ApiProperty({
    description: 'Success message',
    example: 'Todo deleted successfully',
  })
  message: string;
} 