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
} from '@nestjs/common';
import { TodoService } from './todo.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('todos')
@UseGuards(JwtAuthGuard)
export class TodoController {
  constructor(private todoService: TodoService) {}

  @Post()
  create(@Body() createTodoDto: CreateTodoDto, @Request() req) {
    return this.todoService.create(createTodoDto, req.user.userId);
  }

  @Get()
  findAll(@Request() req) {
    return this.todoService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.todoService.findOne(id, req.user.userId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateTodoDto: UpdateTodoDto,
    @Request() req,
  ) {
    return this.todoService.update(id, updateTodoDto, req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.todoService.remove(id, req.user.userId);
  }
} 