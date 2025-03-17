import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Todo } from './todo.schema';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { LogFunction } from '../logger/logger.decorator';

@Injectable()
export class TodoService {
  constructor(@InjectModel(Todo.name) private todoModel: Model<Todo>) {}

  @LogFunction()
  async create(createTodoDto: CreateTodoDto, userId: string): Promise<Todo> {
    const newTodo = new this.todoModel({
      ...createTodoDto,
      userId,
    });
    return newTodo.save();
  }

  @LogFunction()
  async findAll(userId: string): Promise<Todo[]> {
    return this.todoModel.find({ userId }).exec();
  }

  @LogFunction()
  async findOne(id: string, userId: string): Promise<Todo> {
    const todo = await this.todoModel.findOne({ _id: id, userId }).exec();
    if (!todo) {
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }
    return todo;
  }

  @LogFunction()
  async update(id: string, updateTodoDto: UpdateTodoDto, userId: string): Promise<Todo> {
    // First check if the todo exists and belongs to the user
    await this.findOne(id, userId);
    
    const updatedTodo = await this.todoModel
      .findOneAndUpdate(
        { _id: id, userId },
        { $set: updateTodoDto },
        { new: true },
      )
      .exec();
    
    if (!updatedTodo) {
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }
    
    return updatedTodo;
  }

  @LogFunction()
  async remove(id: string, userId: string): Promise<{ message: string }> {
    // First check if the todo exists and belongs to the user
    await this.findOne(id, userId);
    
    await this.todoModel.deleteOne({ _id: id, userId }).exec();
    return { message: 'Todo successfully deleted' };
  }
} 