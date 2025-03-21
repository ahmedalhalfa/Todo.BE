import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { TodoService } from './todo.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  TodoResponse,
  DeleteTodoResponse,
} from './schemas/todo-response.schema';

@ApiTags('todos')
@Controller('todos')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class TodoController {
  constructor(private todoService: TodoService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new todo' })
  @ApiResponse({
    status: 201,
    description: 'Todo has been successfully created',
    type: TodoResponse,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid data' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Missing or invalid token',
  })
  create(
    @Body() createTodoDto: CreateTodoDto,
    @Request() req: { user: { userId: string } },
  ) {
    return this.todoService.create(createTodoDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all todos for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Returns an array of todos',
    type: [TodoResponse],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Missing or invalid token',
  })
  findAll(@Request() req: { user: { userId: string } }) {
    return this.todoService.findAll(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific todo by ID' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The ID of the todo to retrieve',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the todo with the specified ID',
    type: TodoResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Missing or invalid token',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Todo with specified ID not found',
  })
  findOne(
    @Param('id') id: string,
    @Request() req: { user: { userId: string } },
  ) {
    return this.todoService.findOne(id, req.user.userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a todo' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The ID of the todo to update',
  })
  @ApiResponse({
    status: 200,
    description: 'Todo has been successfully updated',
    type: TodoResponse,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid data' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Missing or invalid token',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Todo with specified ID not found',
  })
  update(
    @Param('id') id: string,
    @Body() updateTodoDto: UpdateTodoDto,
    @Request() req: { user: { userId: string } },
  ) {
    return this.todoService.update(id, updateTodoDto, req.user.userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a todo' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The ID of the todo to delete',
  })
  @ApiResponse({
    status: 200,
    description: 'Todo has been successfully deleted',
    type: DeleteTodoResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Missing or invalid token',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Todo with specified ID not found',
  })
  remove(
    @Param('id') id: string,
    @Request() req: { user: { userId: string } },
  ) {
    return this.todoService.remove(id, req.user.userId);
  }
}
