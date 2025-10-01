# Test Backend Connection
# Run this to verify backend is accessible

Write-Host "🔍 Testing SafeHorizon Backend Connection..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Check if port 8000 is open
Write-Host "Test 1: Checking if port 8000 is open..." -ForegroundColor Yellow
try {
    $tcpConnection = Test-NetConnection -ComputerName localhost -Port 8000 -WarningAction SilentlyContinue
    if ($tcpConnection.TcpTestSucceeded) {
        Write-Host "✅ Port 8000 is open and listening" -ForegroundColor Green
    } else {
        Write-Host "❌ Port 8000 is not accessible" -ForegroundColor Red
        Write-Host "   Make sure your backend server is running on port 8000" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ Could not check port 8000" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
}

Write-Host ""

# Test 2: Try to access backend API
Write-Host "Test 2: Checking backend API endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend API is responding" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Backend returned status code: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Cannot connect to backend API at http://localhost:8000" -ForegroundColor Red
    Write-Host "   Make sure SafeHorizon backend server is running" -ForegroundColor Yellow
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: Try to access API docs
Write-Host "Test 3: Checking API documentation endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/docs" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ API docs available at http://localhost:8000/docs" -ForegroundColor Green
        Write-Host "   You can open this in your browser to see all API endpoints" -ForegroundColor Cyan
    }
} catch {
    Write-Host "⚠️ API docs not accessible (this is OK if endpoint differs)" -ForegroundColor Yellow
}

Write-Host ""

# Test 4: Check if health endpoint exists
Write-Host "Test 4: Checking health endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/health" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Health endpoint responding" -ForegroundColor Green
        Write-Host "   Response: $($response.Content)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "⚠️ Health endpoint not found (endpoint may be different)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Summary
Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "If all tests passed with ✅, your backend is ready!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Make sure backend is running on port 8000" -ForegroundColor White
Write-Host "2. Open http://localhost:5173 in your browser" -ForegroundColor White
Write-Host "3. Login with authority credentials" -ForegroundColor White
Write-Host "4. Check if green connection dot appears" -ForegroundColor White
Write-Host "5. Test with: http://localhost:5173/ws-test" -ForegroundColor White
Write-Host ""
Write-Host "Frontend dev server: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend API: http://localhost:8000" -ForegroundColor Cyan
Write-Host "Backend docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
