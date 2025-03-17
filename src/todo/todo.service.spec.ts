import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TodoService } from './todo.service';
import { Todo } from './todo.schema';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { AppException } from '../common/exceptions/app-exception';
import mongoose from 'mongoose';

// Create a mock for the logger decorator
jest.mock('../logger/logger.decorator', () => ({
  LogFunction: () => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: any[]) {
      return originalMethod.apply(this, args);
    };
    return descriptor;
  }
}));

describe('TodoService', () => {
  let service: TodoService;
  let mockTodoModel: any;

  const mockTodo = {
    _id: new mongoose.Types.ObjectId().toString(),
    title: 'Test Todo',
    description: 'Test description',
    completed: false,
    userId: 'user-id',
  };

  beforeEach(async () => {
    // Create a proper mongoose model mock that can be instantiated with 'new'
    class MockTodoModel {
      constructor(dto) {
        Object.assign(this, mockTodo, dto);
      }
      
      save = jest.fn().mockImplementation(() => {
        return Promise.resolve(this);
      });
      
      static find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockTodo])
      });
      
      static findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockTodo)
      });
      
      static findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ ...mockTodo, title: 'Updated Todo' })
      });
      
      static deleteOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 1 })
      });
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodoService,
        {
          provide: getModelToken(Todo.name),
          useValue: MockTodoModel,
        },
      ],
    }).compile();

    service = module.get<TodoService>(TodoService);
    mockTodoModel = module.get(getModelToken(Todo.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a todo successfully', async () => {
      const createTodoDto: CreateTodoDto = {
        title: 'Test Todo',
        description: 'Test description',
        completed: false,
      };

      const result = await service.create(createTodoDto, 'user-id');
      
      expect(result).toEqual(expect.objectContaining({
        title: createTodoDto.title,
        description: createTodoDto.description,
      }));
    });

    it('should throw conflict exception when todo already exists', async () => {
      // Create a separate test with a custom model mock
      const mockError: any = new Error('Duplicate key error');
      mockError.name = 'MongoServerError';
      mockError.code = 11000;

      // Create a custom test module with a mock that always throws
      const moduleRef = await Test.createTestingModule({
        providers: [
          TodoService,
          {
            provide: getModelToken(Todo.name),
            useValue: {
              new: jest.fn().mockImplementation(() => ({
                save: jest.fn().mockRejectedValue(mockError),
              })),
            },
          },
        ],
      }).compile();

      const testService = moduleRef.get<TodoService>(TodoService);
      
      const createTodoDto: CreateTodoDto = {
        title: 'Duplicate Todo',
        description: 'Test description',
        completed: false,
      };

      await expect(testService.create(createTodoDto, 'user-id')).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    it('should return an array of todos', async () => {
      const userId = 'user-id';
      
      const result = await service.findAll(userId);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual([mockTodo]);
      expect(mockTodoModel.find).toHaveBeenCalledWith({ userId });
    });
  });

  describe('findOne', () => {
    it('should find and return a todo by id', async () => {
      const validMongoId = new mongoose.Types.ObjectId().toString();
      const userId = 'user-id';

      const result = await service.findOne(validMongoId, userId);
      expect(result).toEqual(mockTodo);
      expect(mockTodoModel.findOne).toHaveBeenCalledWith({ _id: validMongoId, userId });
    });

    it('should throw bad request when id is invalid', async () => {
      const invalidId = 'invalid-id';
      const userId = 'user-id';

      await expect(service.findOne(invalidId, userId)).rejects.toThrow();
    });

    it('should throw not found when todo does not exist', async () => {
      const validMongoId = new mongoose.Types.ObjectId().toString();
      const userId = 'user-id';
      
      // Save original findOne method
      const originalFindOne = mockTodoModel.findOne;
      
      // Override for this test to return null
      mockTodoModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne(validMongoId, userId)).rejects.toThrow();
      
      // Restore original method
      mockTodoModel.findOne = originalFindOne;
    });
  });
}); 