# ============================================
# ResCash Configuration Checker (Windows)
# ============================================

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "ResCash Configuration Checker" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

function Check-Pass {
    param($Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Check-Fail {
    param($Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Check-Warn {
    param($Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

# Check backend .env
Write-Host "Checking Backend Configuration..." -ForegroundColor Cyan
Write-Host "-----------------------------------"

if (Test-Path "backend\.env") {
    Check-Pass "backend\.env exists"
    
    $envContent = Get-Content "backend\.env" -Raw
    
    # Check for required variables
    if ($envContent -match "MONGODB_URI") {
        Check-Pass "MONGODB_URI is set"
    } else {
        Check-Fail "MONGODB_URI is missing"
    }
    
    if ($envContent -match "GRAPHQL_URI") {
        Check-Pass "GRAPHQL_URI is set"
    } else {
        Check-Fail "GRAPHQL_URI is missing"
    }
    
    if ($envContent -match "JWT_SECRET") {
        Check-Pass "JWT_SECRET is set"
    } else {
        Check-Fail "JWT_SECRET is missing"
    }
    
    # Check dev login status
    if ($envContent -match "ENABLE_DEV_LOGIN=true") {
        Check-Warn "ENABLE_DEV_LOGIN=true (Development Mode)"
        Write-Host "  ⚠ This is OK for local testing, but MUST be false in production!" -ForegroundColor Yellow
    } elseif ($envContent -match "ENABLE_DEV_LOGIN=false") {
        Check-Pass "ENABLE_DEV_LOGIN=false (Production Mode)"
    } else {
        Check-Fail "ENABLE_DEV_LOGIN not set"
    }
    
    # Check sync status
    if ($envContent -match "ENABLE_RESILIENT_SYNC=true") {
        Check-Pass "ENABLE_RESILIENT_SYNC=true (Blockchain sync enabled)"
    } elseif ($envContent -match "ENABLE_RESILIENT_SYNC=false") {
        Check-Warn "ENABLE_RESILIENT_SYNC=false (Blockchain sync disabled)"
    } else {
        Check-Fail "ENABLE_RESILIENT_SYNC not set"
    }
    
} else {
    Check-Fail "backend\.env not found!"
    Write-Host "  Run: cd backend; Copy-Item .env.example .env"
}

Write-Host ""

# Check frontend .env.local
Write-Host "Checking Frontend Configuration..." -ForegroundColor Cyan
Write-Host "-----------------------------------"

if (Test-Path "resCash\.env.local") {
    Check-Pass "resCash\.env.local exists"
    
    $envContent = Get-Content "resCash\.env.local" -Raw
    
    # Check dev login status
    if ($envContent -match "REACT_APP_ENABLE_DEV_LOGIN=true") {
        Check-Warn "REACT_APP_ENABLE_DEV_LOGIN=true (Development Mode)"
        Write-Host "  ⚠ This is OK for local testing, but MUST be false in production!" -ForegroundColor Yellow
    } elseif ($envContent -match "REACT_APP_ENABLE_DEV_LOGIN=false") {
        Check-Pass "REACT_APP_ENABLE_DEV_LOGIN=false (Production Mode)"
    } else {
        Check-Fail "REACT_APP_ENABLE_DEV_LOGIN not set"
    }
    
    # Check API URL
    if ($envContent -match "REACT_APP_API_BASE_URL") {
        Check-Pass "REACT_APP_API_BASE_URL is set"
    } else {
        Check-Fail "REACT_APP_API_BASE_URL is missing"
    }
    
} else {
    Check-Fail "resCash\.env.local not found!"
    Write-Host "  Run: cd resCash; Copy-Item .env.example .env.local"
}

Write-Host ""

# Check dependencies
Write-Host "Checking Dependencies..." -ForegroundColor Cyan
Write-Host "-----------------------------------"

if (Test-Path "backend\node_modules") {
    Check-Pass "Backend dependencies installed"
} else {
    Check-Fail "Backend dependencies not installed"
    Write-Host "  Run: cd backend; npm install"
}

if (Test-Path "resCash\node_modules") {
    Check-Pass "Frontend dependencies installed"
} else {
    Check-Fail "Frontend dependencies not installed"
    Write-Host "  Run: cd resCash; npm install"
}

Write-Host ""

# Check MongoDB
Write-Host "Checking MongoDB..." -ForegroundColor Cyan
Write-Host "-----------------------------------"

if (Get-Command mongod -ErrorAction SilentlyContinue) {
    Check-Pass "MongoDB is installed"
    
    $mongoService = Get-Service -Name MongoDB -ErrorAction SilentlyContinue
    if ($mongoService -and $mongoService.Status -eq 'Running') {
        Check-Pass "MongoDB service is running"
    } else {
        Check-Warn "MongoDB is not running"
        Write-Host "  Start with: Start-Service MongoDB"
    }
} else {
    Check-Fail "MongoDB is not installed"
}

Write-Host ""

# Check Node.js version
Write-Host "Checking Node.js..." -ForegroundColor Cyan
Write-Host "-----------------------------------"

if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node -v
    Check-Pass "Node.js installed: $nodeVersion"
    
    # Check if version is >= 16
    $nodeMajor = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    if ($nodeMajor -ge 16) {
        Check-Pass "Node.js version is compatible (>= 16.x)"
    } else {
        Check-Warn "Node.js version is old (< 16.x), consider upgrading"
    }
} else {
    Check-Fail "Node.js is not installed"
}

Write-Host ""

# Summary
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Configuration Check Summary" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "If you see any ✗ errors above, please fix them before running the application."
Write-Host "If you see ⚠ warnings, review them to ensure they match your environment."
Write-Host ""
Write-Host "For development mode:"
Write-Host "  - ENABLE_DEV_LOGIN should be true in both backend and frontend"
Write-Host "  - ENABLE_RESILIENT_SYNC can be false for faster startup"
Write-Host ""
Write-Host "For production mode:"
Write-Host "  - ENABLE_DEV_LOGIN MUST be false in both backend and frontend"
Write-Host "  - ENABLE_RESILIENT_SYNC should be true"
Write-Host "  - Use strong, random secrets for SESSION_SECRET and JWT_SECRET"
Write-Host ""
