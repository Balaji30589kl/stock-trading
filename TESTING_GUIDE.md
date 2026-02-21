# Quick Start Guide - Testing Authentication

## Prerequisites
- Node.js and npm installed
- MongoDB running locally or connection string in backend/.env
- Backend and frontend dependencies installed

## Step 1: Start Backend

```powershell
cd backend
npm start
```

You should see:
```
Server is running on port 3002
MongoDB connected successfully
```

## Step 2: Start Frontend

Open a new terminal:

```powershell
cd dashboard
npm start
```

The app will open at http://localhost:3000 and automatically redirect to `/login`

## Step 3: Create Your First Account

1. Click "Register" link at the bottom
2. Fill in:
   - Name: Your Name
   - Email: test@example.com
   - Password: password123
3. Click "Register"
4. You'll be automatically logged in and redirected to the dashboard

## Step 4: Verify Authentication

### Check localStorage
Open browser DevTools (F12) → Application tab → Local Storage → http://localhost:3000

You should see:
- `token`: A long JWT string
- `user`: JSON object with your user data

### Check Profile Display
Look at the bottom left menu - you should see:
- Your initials in the avatar circle
- Your name displayed

### Test Data Access
1. Click "Holdings" in the menu
2. If you have holdings data in the database, it will load
3. Try creating a new order from the WatchList

## Step 5: Test Logout

1. Click on your profile (bottom left)
2. Click "Logout" button
3. You should be redirected to `/login`
4. localStorage should be cleared

## Step 6: Test Login

1. Enter the same credentials you registered with
2. Click "Login"
3. You should be logged in and see the dashboard

## Step 7: Test Token Protection

### Method 1: Manual Token Removal
1. Open DevTools → Application → Local Storage
2. Delete the `token` item
3. Try navigating to Holdings or any other page
4. You should be redirected to `/login`

### Method 2: Direct URL Access
1. Logout
2. Try accessing http://localhost:3000/holdings directly
3. You should be redirected to `/login`

## Step 8: Test Multi-User Data Isolation

### Create Second User
1. Logout from first account
2. Register new account:
   - Name: Test User 2
   - Email: test2@example.com
   - Password: password123

### Verify Data Separation
1. Each user should see only their own holdings/orders
2. Orders created by User 1 won't appear for User 2

## Testing with PowerShell Script

The backend includes a comprehensive test script:

```powershell
cd backend
.\test-auth.ps1
```

This will:
1. Register two test users (Alice and Bob)
2. Login both users
3. Get their profiles
4. Test protected endpoints
5. Verify data isolation

## Common Test Scenarios

### Scenario 1: Invalid Credentials
1. Go to login page
2. Enter wrong password
3. Should see error: "Invalid credentials"

### Scenario 2: Duplicate Registration
1. Register with email: test@example.com
2. Try registering again with same email
3. Should see error: "User already exists with this email"

### Scenario 3: Expired Token (Manual)
1. Login successfully
2. In DevTools, modify the token to be invalid
3. Try loading holdings
4. Should be logged out and redirected to login

### Scenario 4: Network Error
1. Stop the backend server
2. Try to login
3. Should see error message
4. Restart backend and try again

## Verification Checklist

- [ ] Registration creates new user
- [ ] Login works with correct credentials
- [ ] Login fails with wrong credentials
- [ ] Token stored in localStorage after login
- [ ] User name/initials displayed in menu
- [ ] Protected routes redirect to login when not authenticated
- [ ] Holdings/Positions/Orders require authentication
- [ ] Logout clears token and redirects to login
- [ ] Re-login works after logout
- [ ] Users can only see their own data
- [ ] Direct URL access to protected routes redirects to login
- [ ] Invalid token triggers automatic logout

## Troubleshooting

### Problem: Can't login after registration
**Solution**: Check browser console for errors. Verify backend is running and MongoDB is connected.

### Problem: Redirected to login immediately after login
**Solution**: Check if token is being stored in localStorage. Verify no console errors.

### Problem: Holdings/Orders not loading
**Solution**: 
1. Check if you're logged in (token in localStorage)
2. Verify backend is running
3. Check browser console for 401 errors
4. Ensure backend routes are protected with verifyToken middleware

### Problem: CORS errors
**Solution**: Verify backend CORS is configured to allow http://localhost:3000

### Problem: "Cannot read property 'name' of null"
**Solution**: Clear localStorage and login again. User object may be corrupted.

## Next Steps After Testing

Once authentication is working:

1. **Add Real Data**: 
   - Create holdings for your test users via MongoDB or API
   - Test the buy functionality with authenticated users

2. **Test Order Creation**:
   - Login as User A
   - Create an order
   - Verify it appears in their orders
   - Login as User B
   - Verify User A's order doesn't appear

3. **Customize UI**:
   - Update styles for login/register pages
   - Add loading spinners
   - Improve error messages
   - Add password strength indicator

4. **Production Prep**:
   - Change JWT_SECRET to a strong random value
   - Consider httpOnly cookies instead of localStorage
   - Add refresh token mechanism
   - Implement password reset functionality

## API Endpoints Reference

### Public (No Auth Required)
- `POST /register` - Create new user
- `POST /login` - Authenticate user

### Protected (Auth Required)
- `GET /profile` - Get current user profile
- `GET /allHoldings` - Get user's holdings
- `GET /allPositions` - Get user's positions  
- `POST /newOrder` - Create new order

## Environment Variables

### Backend (.env)
```
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:3002
```

## Success Indicators

If everything is working correctly, you should be able to:

1. ✅ Register a new account
2. ✅ Login with email/password
3. ✅ See your name in the sidebar
4. ✅ Access dashboard pages (holdings, positions, etc.)
5. ✅ Create orders (if WatchList has stocks)
6. ✅ Logout successfully
7. ✅ Login again with same credentials
8. ✅ Protected routes redirect to login when logged out
9. ✅ Each user sees only their own data
10. ✅ Invalid tokens trigger automatic logout

Happy Testing! 🚀
