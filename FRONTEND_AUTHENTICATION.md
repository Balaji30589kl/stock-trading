# Frontend Authentication Integration

## Overview
JWT authentication has been integrated into the React dashboard. Users must register/login to access the trading platform.

## Files Created/Modified

### New Files Created

1. **dashboard/.env**
   - Environment configuration
   - Contains: `REACT_APP_API_URL=http://localhost:3002`

2. **dashboard/src/api/axios.js**
   - Centralized axios instance with interceptors
   - **Request Interceptor**: Automatically adds `Authorization: Bearer <token>` header from localStorage
   - **Response Interceptor**: Handles 401 errors by clearing localStorage and redirecting to login

3. **dashboard/src/components/Login.js**
   - Login form with email and password
   - On success: stores token and user data in localStorage, redirects to dashboard
   - Includes link to register page

4. **dashboard/src/components/Register.js**
   - Registration form with name, email, and password
   - On success: stores token and user data in localStorage, redirects to dashboard
   - Includes link to login page

5. **dashboard/src/components/ProtectedRoute.js**
   - Route wrapper component
   - Checks for token in localStorage
   - Redirects to /login if no token found

### Modified Files

1. **dashboard/src/index.js**
   - Added routes for `/login` and `/register`
   - Wrapped main dashboard route with ProtectedRoute component
   - All dashboard routes now require authentication

2. **dashboard/src/components/Menu.js**
   - Added logout functionality
   - Displays user name and initials from localStorage
   - Logout button clears token and redirects to login
   - Dropdown menu on profile click

3. **dashboard/src/components/Holdings.js**
   - Changed from `axios` to `api` instance (from ../api/axios)
   - Now automatically includes Authorization header

4. **dashboard/src/components/BuyActionWindow.js**
   - Changed from `axios` to `api` instance
   - Order creation now authenticated

## Authentication Flow

### Registration Flow
1. User fills registration form (name, email, password)
2. POST request to `/register` endpoint
3. Backend creates user with hashed password
4. Backend returns JWT token and user data
5. Frontend stores token and user in localStorage
6. User redirected to dashboard

### Login Flow
1. User fills login form (email, password)
2. POST request to `/login` endpoint
3. Backend validates credentials
4. Backend returns JWT token and user data
5. Frontend stores token and user in localStorage
6. User redirected to dashboard

### Authenticated Requests
1. User makes API request (e.g., get holdings)
2. Axios request interceptor adds `Authorization: Bearer <token>` header
3. Backend verifies token via middleware
4. Backend returns user-specific data

### Token Expiration Handling
1. User makes API request with expired token
2. Backend returns 401 Unauthorized
3. Axios response interceptor catches 401
4. Token and user data cleared from localStorage
5. User redirected to login page

### Logout Flow
1. User clicks profile dropdown
2. User clicks "Logout" button
3. Token and user data cleared from localStorage
4. User redirected to login page

## localStorage Data

The application stores the following in localStorage:

- **token**: JWT authentication token (string)
- **user**: User object containing { name, email, _id } (JSON string)

## API Integration

### Base URL
All API requests use the base URL from environment variable:
- Development: `REACT_APP_API_URL=http://localhost:3002`

### Authenticated Endpoints
The following endpoints require authentication (automatically handled):
- `GET /allHoldings` - Get user's holdings
- `GET /allPositions` - Get user's positions
- `POST /newOrder` - Create new order

### Public Endpoints (no token required)
- `POST /register` - User registration
- `POST /login` - User login

## Usage

### Starting the Application

1. **Start Backend** (in terminal 1):
   ```bash
   cd backend
   npm start
   ```

2. **Start Frontend** (in terminal 2):
   ```bash
   cd dashboard
   npm start
   ```

3. Navigate to http://localhost:3000

### First Time Use
1. Click "Register" to create an account
2. Fill in name, email, and password
3. Automatically logged in and redirected to dashboard

### Returning Users
1. Navigate to http://localhost:3000
2. Automatically redirected to /login if not authenticated
3. Enter email and password
4. Redirected to dashboard on success

### Logging Out
1. Click on profile avatar/name in bottom left
2. Click "Logout" button
3. Redirected to login page

## Security Features

1. **Password Hashing**: Passwords hashed with bcrypt (10 salt rounds) on backend
2. **JWT Tokens**: 7-day expiration, signed with secret key
3. **Protected Routes**: All dashboard routes require valid token
4. **Automatic Token Validation**: Every request validates token on backend
5. **User Data Isolation**: Each user can only access their own data
6. **Token Storage**: Tokens stored in localStorage (consider httpOnly cookies for production)
7. **Automatic Logout**: Invalid/expired tokens trigger automatic logout

## Error Handling

### Authentication Errors
- Invalid credentials: Error message displayed on login/register form
- Duplicate email: Error message displayed on register form
- Network errors: Error message displayed on form

### API Request Errors
- 401 Unauthorized: Automatic logout and redirect to login
- Other errors: Handled by individual components

## Testing Authentication

### Test User Creation
Use the PowerShell test script in backend:
```powershell
cd backend
.\test-auth.ps1
```

This creates test users and validates the authentication flow.

### Manual Testing
1. Register a new user
2. Logout
3. Login with the same credentials
4. Verify holdings and positions load
5. Create a new order
6. Logout and login as different user
7. Verify data isolation (each user sees only their data)

## Production Considerations

1. **JWT Secret**: Change JWT_SECRET in backend/.env to a strong random string
2. **Token Storage**: Consider httpOnly cookies instead of localStorage
3. **HTTPS**: Use HTTPS in production
4. **CORS**: Configure CORS properly for production domain
5. **Token Expiration**: Consider shorter expiration for production
6. **Refresh Tokens**: Implement refresh token mechanism for better UX
7. **Rate Limiting**: Add rate limiting on authentication endpoints
8. **Password Requirements**: Enforce strong password requirements

## Troubleshooting

### "Unauthorized" errors after login
- Check token is stored in localStorage
- Verify backend is running
- Check backend JWT_SECRET matches
- Clear localStorage and login again

### Infinite redirect loop
- Clear localStorage
- Check ProtectedRoute logic
- Verify routes are configured correctly

### API calls fail with CORS errors
- Verify backend CORS configuration
- Check API URL in .env matches backend

### User data not loading
- Check authentication token is valid
- Verify backend middleware is working
- Check database has user-specific data with userId field

## Next Steps

Consider implementing:
1. Password reset functionality
2. Email verification
3. Remember me functionality
4. Session timeout warnings
5. Multi-factor authentication
6. OAuth integration (Google, GitHub, etc.)
7. Account settings page
8. Profile management
