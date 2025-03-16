import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Todo } from './todo.schema';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

@Injectable()
export class TodoService {
  constructor(@InjectModel(Todo.name) private todoModel: Model<Todo>) {}

  async create(createTodoDto: CreateTodoDto, userId: string): Promise<Todo> {
    const newTodo = new this.todoModel({
      ...createTodoDto,
      userId,
    });
    return newTodo.save();
  }

  async findAll(userId: string): Promise<Todo[]> {
    return this.todoModel.find({ userId }).exec();
  }

  async findOne(id: string, userId: string): Promise<Todo> {
    const todo = await this.todoModel.findOne({ _id: id, userId }).exec();
    if (!todo) {
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }
    return todo;
  }

  async update(id: string, updateTodoDto: UpdateTodoDto, userId: string): Promise<Todo> {
    const updatedTodo = await this.todoModel
      .findOneAndUpdate({ _id: id, userId }, updateTodoDto, { new: true })
      .exec();
    
    if (!updatedTodo) {
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }
    
    return updatedTodo;
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.todoModel.deleteOne({ _id: id, userId }).exec();
    
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }
  }
} 