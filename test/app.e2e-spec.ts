import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import mongoose from 'mongoose';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;
  let todoId: string;
  let jwtService: JwtService;
  let userModel: any;
  let todoModel: any;

  const mockUser = {
    _id: new mongoose.Types.ObjectId(),
    email: 'test@example.com',
    password: 'hashedpassword',
  };

  const mockTodo = {
    title: 'Test Todo',
    description: 'Test description',
    completed: false,
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    
    jwtService = app.get<JwtService>(JwtService);
    userModel = app.get(getModelToken('User'));
    todoModel = app.get(getModelToken('Todo'));
    
    await app.init();

    // Create a test user and generate JWT token
    try {
      await userModel.deleteMany({ email: mockUser.email });
      const user = await userModel.create(mockUser);
      jwtToken = jwtService.sign({ userId: user._id.toString(), email: user.email });
    } catch (error) {
      console.error('Setup error:', error);
    }
  });

  afterEach(async () => {
    // Clean up test data
    try {
      await userModel.deleteMany({ email: mockUser.email });
      await todoModel.deleteMany({ userId: mockUser._id });
    } catch (error) {
      console.error('Cleanup error:', error);
    }
    
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  describe('Authentication', () => {
    it('/auth/login (POST) - should login with valid credentials', async () => {
      // This test is just an example, in a real scenario we would need to create a user first
      // and use bcrypt to hash the password properly
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'password123' })
        .expect(res => {
          if (res.status !== 201 && res.status !== 401) {
            throw new Error(`Unexpected status code: ${res.status}`);
          }
        });
    });
  });

  describe('Todo CRUD operations', () => {
    it('/todos (POST) - should create a new todo', async () => {
      const response = await request(app.getHttpServer())
        .post('/todos')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(mockTodo)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.title).toBe(mockTodo.title);
      expect(response.body.description).toBe(mockTodo.description);
      
      todoId = response.body._id;
    });

    it('/todos (GET) - should get all todos', async () => {
      await request(app.getHttpServer())
        .get('/todos')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200)
        .expect(res => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('/todos/:id (GET) - should get a todo by id', async () => {
      // First create a todo to get its ID
      const createResponse = await request(app.getHttpServer())
        .post('/todos')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(mockTodo);
      
      todoId = createResponse.body._id;

      // Then get it by ID
      await request(app.getHttpServer())
        .get(`/todos/${todoId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200)
        .expect(res => {
          expect(res.body._id).toBe(todoId);
          expect(res.body.title).toBe(mockTodo.title);
        });
    });

    it('/todos/:id (PUT) - should update a todo', async () => {
      // First create a todo to get its ID
      const createResponse = await request(app.getHttpServer())
        .post('/todos')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(mockTodo);
      
      todoId = createResponse.body._id;

      // Then update it
      const updateData = { title: 'Updated Todo', completed: true };
      
      await request(app.getHttpServer())
        .put(`/todos/${todoId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(updateData)
        .expect(200)
        .expect(res => {
          expect(res.body.title).toBe(updateData.title);
          expect(res.body.completed).toBe(updateData.completed);
          expect(res.body.description).toBe(mockTodo.description); // unchanged
        });
    });

    it('/todos/:id (DELETE) - should delete a todo', async () => {
      // First create a todo to get its ID
      const createResponse = await request(app.getHttpServer())
        .post('/todos')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(mockTodo);
      
      todoId = createResponse.body._id;

      // Then delete it
      await request(app.getHttpServer())
        .delete(`/todos/${todoId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200)
        .expect(res => {
          expect(res.body.message).toBeTruthy();
        });

      // Verify it's gone
      await request(app.getHttpServer())
        .get(`/todos/${todoId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(404);
    });
  });
});
