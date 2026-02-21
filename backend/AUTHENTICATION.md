# Authentication System Documentation

## Overview

The Zerodha backend now includes a complete JWT-based authentication system with the following features:

- User registration with password hashing (bcryptjs)
- User login with JWT token generation
- Protected routes using JWT middleware
- Token expiration and validation

## Architecture

### Components

1. **Auth Service** (`src/services/auth.service.js`)
   - Password hashing and comparison
   - JWT token generation and verification

2. **Auth Controller** (`src/controllers/auth.controller.js`)
   - Register new users
   - Login existing users
   - Get user profile

3. **Auth Middleware** (`src/middleware/auth.middleware.js`)
   - JWT token verification
   - Request authentication

4. **Auth Routes** (`src/routes/auth.routes.js`)
   - `/register` - User registration
   - `/login` - User login
   - `/profile` - Get authenticated user profile

## API Endpoints

### 1. Register User

**POST** `/register`

Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "60d5ec49f1b2c72b8c8e4f1a",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

**Example (PowerShell):**
```powershell
$body = @{name="John Doe"; email="john@example.com"; password="password123"} | ConvertTo-Json
Invoke-WebRequest -Uri http://localhost:3002/register -Method Post -Body $body -ContentType "application/json"
```

**Example (curl):**
```bash
curl -X POST http://localhost:3002/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

---

### 2. Login User

**POST** `/login`

Authenticate a user and receive a JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "60d5ec49f1b2c72b8c8e4f1a",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

**Example (PowerShell):**
```powershell
$body = @{email="john@example.com"; password="password123"} | ConvertTo-Json
Invoke-WebRequest -Uri http://localhost:3002/login -Method Post -Body $body -ContentType "application/json"
```

**Example (curl):**
```bash
curl -X POST http://localhost:3002/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

---

### 3. Get Profile (Protected Route)

**GET** `/profile`

Get the current authenticated user's profile. Requires JWT token.

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "60d5ec49f1b2c72b8c8e4f1a",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2023-06-25T10:30:00.000Z"
    }
  }
}
```

**Example (PowerShell):**
```powershell
$token = "your-jwt-token-here"
Invoke-WebRequest -Uri http://localhost:3002/profile -Headers @{Authorization="Bearer $token"}
```

**Example (curl):**
```bash
curl -X GET http://localhost:3002/profile \
  -H "Authorization: Bearer <your-jwt-token>"
```

---

## Using Authentication in Your Routes

To protect any route with JWT authentication, simply add the `verifyToken` middleware:

```javascript
const { verifyToken } = require("../middleware/auth.middleware");

// Protected route example
router.get("/protected-route", verifyToken, (req, res) => {
  // req.user contains: { id: "user-id", email: "user-email" }
  console.log("Authenticated user:", req.user);
  
  res.json({
    message: "You are authenticated!",
    userId: req.user.id
  });
});
```

### Example: Protecting Orders Routes

```javascript
// src/routes/orders.routes.js
const { verifyToken } = require("../middleware/auth.middleware");

// Only authenticated users can create orders
router.post("/newOrder", verifyToken, ordersController.createOrder);

// Only authenticated users can view their orders
router.get("/myOrders", verifyToken, ordersController.getUserOrders);
```

## Environment Variables

Add these to your `.env` file:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# MongoDB
MONGO_URL=mongodb://127.0.0.1:27017/zerodha

# Server
PORT=3002
```

**Important:** Change `JWT_SECRET` to a strong, random string in production!

## Security Best Practices

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Use strong JWT secrets** - Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
3. **Use HTTPS in production** - Tokens should never be transmitted over HTTP
4. **Set appropriate token expiration** - Default is 7 days
5. **Hash passwords** - Never store plain text passwords (handled by bcryptjs)
6. **Validate input** - Always validate email format and password strength

## Token Expiration

Tokens expire after the duration specified in `JWT_EXPIRES_IN` (default: 7 days).

When a token expires, the user must login again to get a new token.

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Please provide name, email, and password"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error registering user",
  "error": "Detailed error message"
}
```

## Testing the Authentication Flow

Complete test sequence in PowerShell:

```powershell
# 1. Register a new user
$registerBody = @{
    name = "Test User"
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

$registerResponse = Invoke-WebRequest -Uri http://localhost:3002/register `
    -Method Post -Body $registerBody -ContentType "application/json" | ConvertFrom-Json

# 2. Extract token
$token = $registerResponse.data.token

# 3. Access protected route
Invoke-WebRequest -Uri http://localhost:3002/profile `
    -Headers @{Authorization="Bearer $token"}

# 4. Login with existing user
$loginBody = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

$loginResponse = Invoke-WebRequest -Uri http://localhost:3002/login `
    -Method Post -Body $loginBody -ContentType "application/json" | ConvertFrom-Json

$newToken = $loginResponse.data.token
```

## Next Steps

1. **Protect existing routes** - Add `verifyToken` middleware to orders and portfolio routes
2. **User-specific data** - Filter orders/holdings by `req.user.id`
3. **Password reset** - Implement forgot password functionality
4. **Email verification** - Send verification emails on registration
5. **Refresh tokens** - Implement token refresh mechanism
6. **Role-based access** - Add user roles (admin, user, etc.)

## File Structure

```
backend/src/
├── services/
│   └── auth.service.js          # Password hashing, JWT generation
├── controllers/
│   └── auth.controller.js       # Register, login, profile handlers
├── middleware/
│   └── auth.middleware.js       # JWT verification middleware
├── routes/
│   └── auth.routes.js           # Auth endpoints
└── models/
    └── User.js                  # User schema
```

## Support

For issues or questions, please refer to:
- JWT documentation: https://jwt.io/
- bcryptjs documentation: https://github.com/dcodeIO/bcrypt.js
- Express middleware guide: https://expressjs.com/en/guide/using-middleware.html
