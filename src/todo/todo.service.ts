import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Todo } from './todo.schema';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { LogFunction } from '../logger/logger.decorator';
import { AppException } from '../common/exceptions/app-exception';
import { TODO_ERRORS } from '../common/constants/error-codes';

@Injectable()
export class TodoService {
  constructor(@InjectModel(Todo.name) private todoModel: Model<Todo>) {}

  @LogFunction()
  async create(createTodoDto: CreateTodoDto, userId: string): Promise<Todo> {
    try {
      const newTodo = new this.todoModel({
        ...createTodoDto,
        userId,
      });
      return await newTodo.save();
    } catch (error) {
      if (error.name === 'MongoServerError' && error.code === 11000) {
        throw AppException.conflict({
          message: TODO_ERRORS.ALREADY_EXISTS.message,
          code: TODO_ERRORS.ALREADY_EXISTS.code,
        });
      }
      throw error;
    }
  }

  @LogFunction()
  async findAll(userId: string): Promise<Todo[]> {
    return this.todoModel.find({ userId }).exec();
  }

  @LogFunction()
  async findOne(id: string, userId: string): Promise<Todo> {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw AppException.badRequest({
        message: `${TODO_ERRORS.INVALID_ID.message}: ${id}`,
        code: TODO_ERRORS.INVALID_ID.code,
      });
    }

    const todo = await this.todoModel.findOne({ _id: id, userId }).exec();
    if (!todo) {
      throw AppException.notFound({
        message: `${TODO_ERRORS.NOT_FOUND.message} with ID ${id}`,
        code: TODO_ERRORS.NOT_FOUND.code,
      });
    }
    return todo;
  }

  @LogFunction()
  async update(id: string, updateTodoDto: UpdateTodoDto, userId: string): Promise<Todo> {
    try {
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
        throw AppException.notFound({
          message: `${TODO_ERRORS.NOT_FOUND.message} with ID ${id}`,
          code: TODO_ERRORS.NOT_FOUND.code,
        });
      }
      
      return updatedTodo;
    } catch (error) {
      // If it's already an AppException, rethrow it
      if (error instanceof AppException) {
        throw error;
      }
      
      // Handle other errors
      if (error.name === 'MongoServerError' && error.code === 11000) {
        throw AppException.conflict({
          message: TODO_ERRORS.ALREADY_EXISTS.message,
          code: TODO_ERRORS.ALREADY_EXISTS.code,
        });
      }
      throw error;
    }
  }

  @LogFunction()
  async remove(id: string, userId: string): Promise<{ message: string }> {
    // First check if the todo exists and belongs to the user
    await this.findOne(id, userId);
    
    await this.todoModel.deleteOne({ _id: id, userId }).exec();
    return { message: 'Todo successfully deleted' };
  }
} 