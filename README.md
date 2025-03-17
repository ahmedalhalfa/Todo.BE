# NestJS Todo API with JWT Authentication

A robust RESTful API built with NestJS for todo management with secure authentication, designed for scalability and maintainability.

## 📋 Business Overview

This project provides a secure, scalable backend for todo applications with the following business capabilities:

- **User Management**: Complete authentication system with registration, login, and profile management
- **Todo Management**: CRUD operations for personal todo items with data validation
- **Multi-device Support**: Refresh token system allowing users to stay logged in across devices
- **Security Focused**: Protection against common web vulnerabilities and secure credential management

### Target Use Cases

- Web and mobile todo applications requiring authentication
- Services that need secure user management and data storage
- Integration with frontend frameworks like React, Angular, or Vue.js
- Platforms requiring scalable user-specific data management

## 🔧 Technical Stack

- **Framework**: NestJS (Node.js)
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with refresh token rotation
- **Caching/Token Storage**: Redis
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Jest for unit and e2e testing
- **CI/CD**: GitHub Actions
- **Password Security**: Argon2 hashing algorithm
- **Rate Limiting**: Built-in throttling protection

## ✨ Features

### Authentication System

- **Secure Registration**: New user creation with validation
- **JWT Authentication**: Stateless authentication using access tokens
- **Refresh Token Rotation**: Secure mechanism for maintaining sessions
- **Password Security**: Argon2 hashing (more secure than bcrypt)
- **Multi-device Logout**: Ability to terminate sessions on all devices
- **Token Blacklisting**: Prevention of token reuse after logout

### Todo Management

- **CRUD Operations**: Complete todo lifecycle management
- **User-specific Data**: Todos are isolated to their respective owners
- **Field Validation**: Strict validation rules for todo creation/updates
- **Query Optimization**: Efficient database queries for performance

### API Security

- **Rate Limiting**: Protection against brute-force attacks
- **Input Validation**: Comprehensive validation using class-validator
- **Data Sanitization**: Prevention of data injection attacks
- **CORS Configuration**: Controlled cross-origin resource sharing
- **Helmet Integration**: HTTP header security

### Performance Optimizations

- **Redis Caching**: Improved response times for frequently accessed data
- **Database Indexing**: Optimized MongoDB queries
- **Efficient JWT Handling**: Minimized token size and validation overhead

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or later)
- MongoDB (local or remote)
- Redis (for token management and rate limiting)
- pnpm (recommended) or npm/yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to the project directory
cd backend

# Install dependencies
pnpm install
```

### Configuration

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

### Running the Application

```bash
# Development mode
pnpm start:dev

# Production mode
pnpm build
pnpm start:prod
```

## 📁 Project Structure

```
src/
├── auth/               # Authentication module
│   ├── controllers/    # Authentication endpoints
│   ├── dto/            # Data Transfer Objects
│   ├── guards/         # JWT Authentication guards
│   ├── strategies/     # Passport strategies
│   └── services/       # Authentication business logic
├── todos/              # Todo module
│   ├── controllers/    # Todo CRUD endpoints
│   ├── dto/            # Todo validation schemas
│   ├── schemas/        # Mongoose schemas
│   └── services/       # Todo business logic
├── common/             # Shared resources
│   ├── decorators/     # Custom decorators
│   ├── filters/        # Exception filters
│   ├── interceptors/   # Request/response transformers
│   └── pipes/          # Validation pipes
├── config/             # Application configuration
├── main.ts             # Application entry point
└── app.module.ts       # Root application module
```

## 🧪 Testing

The project includes comprehensive testing:

```bash
# Run unit tests
pnpm test

# Run end-to-end tests
pnpm test:e2e

# Generate test coverage report
pnpm test:cov

# Run all tests with coverage
pnpm test:all
```

### CI/CD Pipeline

The project uses GitHub Actions for Continuous Integration:

- **Linting**: Code quality verification
- **Unit Tests**: Testing individual components 
- **E2E Tests**: Integration testing of the entire system
- **Security Audit**: Checks for dependency vulnerabilities

## 📚 API Documentation

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

This will create a `swagger.json` file in the `swagger` directory at the root of the project.

## 🔐 API Endpoints

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

## 🛡️ Security Features

- **Password Hashing**: Argon2 (OWASP recommended, more secure than bcrypt)
- **JWT Security**: Short-lived access tokens with rotation
- **Refresh Token Management**: Secure session handling
- **Token Blacklisting**: Immediate invalidation via Redis
- **Rate Limiting**: Protection against brute-force attacks
- **Input Validation**: Comprehensive request validation
- **Data Sanitization**: Prevention of injection attacks
- **HTTP Headers Security**: Implemented via Helmet
- **CORS Protection**: Configured access control

## 🔄 Performance Considerations

- **Redis Caching**: Optimized token validation and frequent queries
- **Database Indexing**: Improved query performance
- **Pagination**: Efficient handling of large data sets
- **Connection Pooling**: Optimized database connections
- **Throttling**: Prevention of server overload from excessive requests

## 👥 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## 📄 License

This project is licensed under the [MIT License](LICENSE).

## 📞 Support

For support, email [your-email@example.com](mailto:your-email@example.com) or open an issue on GitHub.