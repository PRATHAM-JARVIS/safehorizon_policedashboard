# SafeHorizon Police Dashboard - Quick Start Script
# This script will help you start the application

Write-Host "🚀 Starting SafeHorizon Police Dashboard..." -ForegroundColor Green
Write-Host ""

# Check if node_modules exists
if (-Not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host "✅ Dependencies installed!" -ForegroundColor Green
    Write-Host ""
}

# Check if .env exists
if (-Not (Test-Path ".env")) {
    Write-Host "❌ Error: .env file not found!" -ForegroundColor Red
    Write-Host "Please make sure .env file exists in the root directory"
    exit 1
}

Write-Host "✅ Configuration file found" -ForegroundColor Green
Write-Host ""

# Display current configuration
Write-Host "📋 Current Configuration:" -ForegroundColor Cyan
Write-Host "------------------------"
Get-Content .env | Where-Object { $_ -match "^VITE_" -and $_ -notmatch "^#" }
Write-Host ""

# Start the development server
Write-Host "🌐 Starting development server..." -ForegroundColor Green
Write-Host "--------------------------------"
Write-Host ""
Write-Host "📍 Application will be available at: http://localhost:5173" -ForegroundColor Yellow
Write-Host "⚠️  Make sure your backend API is running at: http://localhost:8000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

npm run dev
