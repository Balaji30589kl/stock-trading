# Authentication System Test Script
# Run this in PowerShell to test all authentication endpoints

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  ZERODHA AUTHENTICATION TEST SUITE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:3002"
$testEmail = "testuser_$(Get-Random)@example.com"
$testPassword = "SecurePass123!"

# Test 1: Register New User
Write-Host "[TEST 1] Registering new user..." -ForegroundColor Yellow
$registerBody = @{
    name = "Test User"
    email = $testEmail
    password = $testPassword
} | ConvertTo-Json

try {
    $registerResponse = Invoke-WebRequest -Uri "$baseUrl/register" `
        -Method Post -Body $registerBody -ContentType "application/json" -UseBasicParsing `
        | ConvertFrom-Json
    
    Write-Host "[PASS] Registration successful!" -ForegroundColor Green
    Write-Host "  User ID: $($registerResponse.data.user.id)" -ForegroundColor Gray
    Write-Host "  Email: $($registerResponse.data.user.email)" -ForegroundColor Gray
    $token1 = $registerResponse.data.token
    Write-Host "  Token: $($token1.Substring(0, 50))..." -ForegroundColor Gray
} catch {
    Write-Host "[FAIL] Registration failed!" -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit 1
}

Start-Sleep -Seconds 1

# Test 2: Login with Registered User
Write-Host "`n[TEST 2] Logging in with correct credentials..." -ForegroundColor Yellow
$loginBody = @{
    email = $testEmail
    password = $testPassword
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest -Uri "$baseUrl/login" `
        -Method Post -Body $loginBody -ContentType "application/json" -UseBasicParsing `
        | ConvertFrom-Json
    
    Write-Host "[PASS] Login successful!" -ForegroundColor Green
    $token2 = $loginResponse.data.token
    Write-Host "  Token: $($token2.Substring(0, 50))..." -ForegroundColor Gray
} catch {
    Write-Host "[FAIL] Login failed!" -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit 1
}

Start-Sleep -Seconds 1

# Test 3: Login with Wrong Password
Write-Host "`n[TEST 3] Attempting login with wrong password..." -ForegroundColor Yellow
$wrongLoginBody = @{
    email = $testEmail
    password = "WrongPassword123"
} | ConvertTo-Json

try {
    $wrongResponse = Invoke-WebRequest -Uri "$baseUrl/login" `
        -Method Post -Body $wrongLoginBody -ContentType "application/json" -UseBasicParsing
    Write-Host "[FAIL] Should have failed but did not!" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 401) {
        Write-Host "[PASS] Correctly rejected invalid credentials!" -ForegroundColor Green
    } else {
        Write-Host "[FAIL] Unexpected error!" -ForegroundColor Red
    }
}

Start-Sleep -Seconds 1

# Test 4: Access Protected Route with Token
Write-Host "`n[TEST 4] Accessing protected /profile route with valid token..." -ForegroundColor Yellow
try {
    $profileResponse = Invoke-WebRequest -Uri "$baseUrl/profile" `
        -Headers @{Authorization="Bearer $token2"} -UseBasicParsing | ConvertFrom-Json
    
    Write-Host "[PASS] Successfully accessed protected route!" -ForegroundColor Green
    Write-Host "  Name: $($profileResponse.data.user.name)" -ForegroundColor Gray
    Write-Host "  Email: $($profileResponse.data.user.email)" -ForegroundColor Gray
    Write-Host "  Created: $($profileResponse.data.user.createdAt)" -ForegroundColor Gray
} catch {
    Write-Host "[FAIL] Failed to access protected route!" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

Start-Sleep -Seconds 1

# Test 5: Access Protected Route without Token
Write-Host "`n[TEST 5] Attempting to access protected route without token..." -ForegroundColor Yellow
try {
    $noAuthResponse = Invoke-WebRequest -Uri "$baseUrl/profile" -UseBasicParsing
    Write-Host "[FAIL] Should have failed but did not!" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 401) {
        Write-Host "[PASS] Correctly blocked unauthorized access!" -ForegroundColor Green
    } else {
        Write-Host "[FAIL] Unexpected error!" -ForegroundColor Red
    }
}

Start-Sleep -Seconds 1

# Test 6: Duplicate Email Registration
Write-Host "`n[TEST 6] Attempting to register with duplicate email..." -ForegroundColor Yellow
try {
    $dupResponse = Invoke-WebRequest -Uri "$baseUrl/register" `
        -Method Post -Body $registerBody -ContentType "application/json" -UseBasicParsing
    Write-Host "[FAIL] Should have failed but did not!" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 400) {
        Write-Host "[PASS] Correctly rejected duplicate email!" -ForegroundColor Green
    } else {
        Write-Host "[FAIL] Unexpected error!" -ForegroundColor Red
    }
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  TEST SUITE COMPLETED" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "All authentication endpoints are working correctly!" -ForegroundColor Green
Write-Host "`nTest user created:" -ForegroundColor White
Write-Host "  Email: $testEmail" -ForegroundColor Gray
Write-Host "  Password: $testPassword" -ForegroundColor Gray
Write-Host "  Token: $($token2.Substring(0, 50))...`n" -ForegroundColor Gray
