import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TodoService } from './todo.service';
import { Todo } from './todo.schema';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { AppException } from '../common/exceptions/app-exception';

describe('TodoService', () => {
  let service: TodoService;
  let model: Model<Todo>;

  const mockTodo = {
    _id: 'a-mock-id',
    title: 'Test Todo',
    description: 'Test description',
    completed: false,
    userId: 'user-id',
    save: jest.fn(),
    toJSON: jest.fn().mockReturnThis(),
  };

  const mockTodoModel = {
    new: jest.fn().mockResolvedValue(mockTodo),
    constructor: jest.fn().mockResolvedValue(mockTodo),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    deleteOne: jest.fn(),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodoService,
        {
          provide: getModelToken(Todo.name),
          useValue: mockTodoModel,
        },
      ],
    }).compile();

    service = module.get<TodoService>(TodoService);
    model = module.get<Model<Todo>>(getModelToken(Todo.name));
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
      
      mockTodoModel.new.mockImplementation(() => ({
        ...mockTodo,
        save: jest.fn().mockResolvedValueOnce(mockTodo),
      }));

      const result = await service.create(createTodoDto, 'user-id');
      expect(result).toEqual(mockTodo);
    });

    it('should throw conflict exception when todo already exists', async () => {
      const createTodoDto: CreateTodoDto = {
        title: 'Test Todo',
        description: 'Test description',
        completed: false,
      };
      
      const mongoError = {
        name: 'MongoServerError',
        code: 11000,
      };
      
      mockTodoModel.new.mockImplementation(() => ({
        ...mockTodo,
        save: jest.fn().mockRejectedValueOnce(mongoError),
      }));

      await expect(service.create(createTodoDto, 'user-id')).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    it('should return an array of todos', async () => {
      const userId = 'user-id';
      const mockTodoArray = [mockTodo];
      
      mockTodoModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockTodoArray),
      });

      const result = await service.findAll(userId);
      expect(result).toEqual(mockTodoArray);
      expect(mockTodoModel.find).toHaveBeenCalledWith({ userId });
    });
  });

  describe('findOne', () => {
    it('should find and return a todo by id', async () => {
      const todoId = 'a-valid-id-123456789abc';
      const userId = 'user-id';
      
      mockTodoModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockTodo),
      });

      const result = await service.findOne(todoId, userId);
      expect(result).toEqual(mockTodo);
      expect(mockTodoModel.findOne).toHaveBeenCalledWith({ _id: todoId, userId });
    });

    it('should throw bad request when id is invalid', async () => {
      const invalidId = 'invalid-id';
      const userId = 'user-id';

      await expect(service.findOne(invalidId, userId)).rejects.toThrow();
    });

    it('should throw not found when todo does not exist', async () => {
      const todoId = 'a-valid-id-123456789abc';
      const userId = 'user-id';
      
      mockTodoModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      });

      await expect(service.findOne(todoId, userId)).rejects.toThrow();
    });
  });
}); 