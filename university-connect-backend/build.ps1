# PowerShell Build Script for University Connect Backend

Write-Host "🚀 Starting University Connect Backend Build..." -ForegroundColor Green

# Set error action preference
$ErrorActionPreference = "Stop"

try {
    # Display Node.js and npm versions
    Write-Host "📋 Node.js version:" -ForegroundColor Cyan
    node --version
    
    Write-Host "📋 NPM version:" -ForegroundColor Cyan
    npm --version
    
    # Set npm configuration for better compatibility
    Write-Host "🔧 Setting npm configuration..." -ForegroundColor Yellow
    npm config set legacy-peer-deps true
    npm config set fund false
    npm config set audit false
    
    # Clear npm cache
    Write-Host "🧹 Clearing npm cache..." -ForegroundColor Yellow
    npm cache clean --force
    
    # Remove existing node_modules and package-lock.json for a clean install
    Write-Host "🧹 Removing existing node_modules..." -ForegroundColor Yellow
    if (Test-Path "node_modules") {
        Remove-Item -Recurse -Force "node_modules"
    }
    if (Test-Path "package-lock.json") {
        Remove-Item -Force "package-lock.json"
    }
    
    # Install dependencies with retry logic
    Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
    try {
        npm install --no-optional --prefer-offline
    }
    catch {
        Write-Host "⚠️ First install failed, retrying with fresh cache..." -ForegroundColor Yellow
        npm cache clean --force
        npm install --no-optional --no-shrinkwrap
    }
    
    # Verify critical packages are properly installed
    Write-Host "🔍 Verifying critical packages..." -ForegroundColor Cyan
    
    if (-not (Test-Path "node_modules\bcryptjs")) {
        Write-Host "⚠️ bcryptjs not found, installing individually..." -ForegroundColor Yellow
        npm install bcryptjs@^2.4.3 --force
    }
    
    if (-not (Test-Path "node_modules\mongoose")) {
        Write-Host "⚠️ mongoose not found, installing individually..." -ForegroundColor Yellow
        npm install mongoose@^8.0.0 --force
    }
    
    # Create certificates directory
    Write-Host "📁 Creating certificates directory..." -ForegroundColor Cyan
    if (-not (Test-Path "certificates")) {
        New-Item -ItemType Directory -Path "certificates"
    }
    
    # Test if the main modules can be required
    Write-Host "🧪 Testing module imports..." -ForegroundColor Cyan
    
    $testScript = @"
try {
  require('bcryptjs');
  console.log('✅ bcryptjs import successful');
} catch (e) {
  console.error('❌ bcryptjs import failed:', e.message);
  process.exit(1);
}

try {
  require('mongoose');
  console.log('✅ mongoose import successful');
} catch (e) {
  console.error('❌ mongoose import failed:', e.message);
  process.exit(1);
}
"@
    
    $testScript | node
    
    Write-Host "✅ Build completed successfully!" -ForegroundColor Green
}
catch {
    Write-Host "❌ Build failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
