# NestJS Todo API with JWT Authentication

A NestJS application with MongoDB integration for authentication and todo management.

## Features

- User registration and authentication using JWT
- Password security with Argon2 (salt+hash)
- Todo CRUD operations with user-specific access
- MongoDB integration with Mongoose
- Input validation and data sanitization

## Prerequisites

- Node.js (v14 or later)
- MongoDB (local or remote)
- Redis (for token management and rate limiting)
- pnpm (recommended) or npm/yarn

## Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to the project directory
cd backend

# Install dependencies
pnpm install
```

## Configuration

Create a `.env` file in the root directory with the following variables:

```
MONGODB_URI=mongodb://localhost:27017/todo-app
JWT_SECRET=your_secret_jwt_key
JWT_EXPIRATION=3600
JWT_REFRESH_SECRET=your_secret_refresh_key
JWT_REFRESH_EXPIRATION=7d
JWT_REFRESH_EXPIRATION_SECONDS=604800
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password_here
REDIS_USERNAME=default
REDIS_TLS=false
REDIS_TTL=3600
THROTTLE_TTL=60
THROTTLE_LIMIT=10
PORT=3000
```

For Redis Cloud or other hosted Redis services:
- Set `REDIS_PASSWORD` to the provided password
- Set `REDIS_USERNAME` (usually "default" for Redis Cloud)
- Set `REDIS_TLS=true` for secure connections

## Running the Application

```bash
# Development mode
pnpm start:dev

# Production mode
pnpm build
pnpm start:prod
```

## API Documentation

This application includes Swagger API documentation accessible at `/api` when the server is running:

```
http://localhost:3000/api
```

The documentation provides:
- Interactive API exploration
- Endpoint testing capability
- Detailed schema information
- Request/response examples

### Generating Swagger JSON

You can generate a static Swagger JSON file for use in other Swagger tools or for sharing:

```bash
# Generate the Swagger JSON file
pnpm swagger:generate
```

This will create a `swagger.json` file in the `swagger` directory at the root of the project. This file can be used with tools like Swagger UI, Redocly, or imported into API documentation platforms.

## API Endpoints

### Authentication

#### Register a new user
```
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Refresh Token
```
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "your_refresh_token"
}
```

#### Logout
```
POST /auth/logout
Authorization: Bearer <your_jwt_token>
```

#### Logout from all devices
```
POST /auth/logout-all
Authorization: Bearer <your_jwt_token>
```

### Todo Operations (Requires Authentication)

All todo endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

#### Create a todo
```
POST /todos
Content-Type: application/json

{
  "title": "Sample Todo",
  "description": "This is a sample todo item",
  "completed": false
}
```

#### Get all todos
```
GET /todos
```

#### Get a specific todo
```
GET /todos/:id
```

#### Update a todo
```
PUT /todos/:id
Content-Type: application/json

{
  "title": "Updated Todo",
  "description": "This todo has been updated",
  "completed": true
}
```

#### Delete a todo
```
DELETE /todos/:id
```

## Security Features

- Password hashing with Argon2 (more secure than bcrypt)
- JWT authentication with token expiration
- Refresh tokens for maintaining sessions
- Token blacklisting in Redis for secure logout
- Rate limiting for login attempts
- Input validation using class-validator
- Data sanitization with whitelist option
