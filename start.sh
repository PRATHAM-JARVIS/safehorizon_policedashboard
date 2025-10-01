#!/bin/bash

# SafeHorizon Police Dashboard - Quick Start Script
# This script will help you start the application

echo "🚀 Starting SafeHorizon Police Dashboard..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed!"
    echo ""
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found!"
    echo "Please make sure .env file exists in the root directory"
    exit 1
fi

echo "✅ Configuration file found"
echo ""

# Display current configuration
echo "📋 Current Configuration:"
echo "------------------------"
grep "VITE_" .env | grep -v "^#"
echo ""

# Start the development server
echo "🌐 Starting development server..."
echo "--------------------------------"
echo ""
echo "📍 Application will be available at: http://localhost:5173"
echo "⚠️  Make sure your backend API is running at: http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev
