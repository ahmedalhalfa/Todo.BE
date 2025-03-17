import { Test, TestingModule } from '@nestjs/testing';
import { TodoController } from './todo.controller';
import { TodoService } from './todo.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

describe('TodoController', () => {
  let controller: TodoController;
  let service: TodoService;

  const mockTodo = {
    _id: 'a-mock-id',
    title: 'Test Todo',
    description: 'Test description',
    completed: false,
    userId: 'user-id',
  };

  const mockRequest = {
    user: {
      userId: 'user-id',
      email: 'test@example.com',
    },
  };

  const mockTodoService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TodoController],
      providers: [
        {
          provide: TodoService,
          useValue: mockTodoService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<TodoController>(TodoController);
    service = module.get<TodoService>(TodoService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a todo', async () => {
      const createTodoDto: CreateTodoDto = {
        title: 'Test Todo',
        description: 'Test description',
        completed: false,
      };

      mockTodoService.create.mockResolvedValue(mockTodo);

      const result = await controller.create(createTodoDto, mockRequest);
      expect(result).toEqual(mockTodo);
      expect(mockTodoService.create).toHaveBeenCalledWith(createTodoDto, 'user-id');
    });
  });

  describe('findAll', () => {
    it('should return an array of todos', async () => {
      const mockTodoArray = [mockTodo];
      mockTodoService.findAll.mockResolvedValue(mockTodoArray);

      const result = await controller.findAll(mockRequest);
      expect(result).toEqual(mockTodoArray);
      expect(mockTodoService.findAll).toHaveBeenCalledWith('user-id');
    });
  });

  describe('findOne', () => {
    it('should return a single todo', async () => {
      mockTodoService.findOne.mockResolvedValue(mockTodo);

      const result = await controller.findOne('a-mock-id', mockRequest);
      expect(result).toEqual(mockTodo);
      expect(mockTodoService.findOne).toHaveBeenCalledWith('a-mock-id', 'user-id');
    });
  });

  describe('update', () => {
    it('should update a todo', async () => {
      const updateTodoDto: UpdateTodoDto = {
        title: 'Updated Todo',
        completed: true,
      };

      mockTodoService.update.mockResolvedValue({
        ...mockTodo,
        ...updateTodoDto,
      });

      const result = await controller.update('a-mock-id', updateTodoDto, mockRequest);
      expect(result).toEqual({
        ...mockTodo,
        ...updateTodoDto,
      });
      expect(mockTodoService.update).toHaveBeenCalledWith('a-mock-id', updateTodoDto, 'user-id');
    });
  });

  describe('remove', () => {
    it('should remove a todo', async () => {
      const deleteResponse = { message: 'Todo deleted successfully' };
      mockTodoService.remove.mockResolvedValue(deleteResponse);

      const result = await controller.remove('a-mock-id', mockRequest);
      expect(result).toEqual(deleteResponse);
      expect(mockTodoService.remove).toHaveBeenCalledWith('a-mock-id', 'user-id');
    });
  });
}); 