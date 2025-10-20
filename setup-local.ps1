# ============================================
# ResCash Local Development Setup Script (Windows)
# ============================================

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "ResCash Local Development Setup" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Function to print colored messages
function Print-Success {
    param($Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Print-Error {
    param($Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Print-Info {
    param($Message)
    Write-Host "ℹ $Message" -ForegroundColor Yellow
}

# Check if command exists
function Test-Command {
    param($Command)
    try {
        if (Get-Command $Command -ErrorAction Stop) {
            return $true
        }
    }
    catch {
        return $false
    }
}

# Step 1: Check Prerequisites
Write-Host "Step 1: Checking Prerequisites..." -ForegroundColor Cyan
Write-Host "-----------------------------------"

# Check Node.js
if (Test-Command node) {
    $nodeVersion = node -v
    Print-Success "Node.js is installed: $nodeVersion"
}
else {
    Print-Error "Node.js is not installed!"
    Write-Host "Please install Node.js from https://nodejs.org/"
    exit 1
}

# Check npm
if (Test-Command npm) {
    $npmVersion = npm -v
    Print-Success "npm is installed: $npmVersion"
}
else {
    Print-Error "npm is not installed!"
    exit 1
}

# Check MongoDB
if (Test-Command mongod) {
    Print-Success "MongoDB is installed"
}
else {
    Print-Error "MongoDB is not installed!"
    Write-Host "Please install MongoDB from https://www.mongodb.com/try/download/community"
    exit 1
}

Write-Host ""

# Step 2: Setup Backend
Write-Host "Step 2: Setting Up Backend..." -ForegroundColor Cyan
Write-Host "-----------------------------------"

Set-Location backend

# Copy environment file if it doesn't exist
if (-Not (Test-Path .env)) {
    if (Test-Path .env.local) {
        Copy-Item .env.local .env
        Print-Success "Created .env from .env.local"
    }
    elseif (Test-Path .env.example) {
        Copy-Item .env.example .env
        Print-Info "Created .env from .env.example - Please update with your settings"
    }
}
else {
    Print-Info ".env file already exists"
}

# Install backend dependencies
Print-Info "Installing backend dependencies..."
npm install

if ($LASTEXITCODE -eq 0) {
    Print-Success "Backend dependencies installed"
}
else {
    Print-Error "Failed to install backend dependencies"
    exit 1
}

Set-Location ..

Write-Host ""

# Step 3: Setup Frontend
Write-Host "Step 3: Setting Up Frontend..." -ForegroundColor Cyan
Write-Host "-----------------------------------"

Set-Location resCash

# Copy environment file if it doesn't exist
if (-Not (Test-Path .env.local)) {
    if (Test-Path .env.local.example) {
        Copy-Item .env.local.example .env.local
        Print-Success "Created .env.local from .env.local.example"
    }
    elseif (Test-Path .env.example) {
        Copy-Item .env.example .env.local
        Print-Info "Created .env.local from .env.example"
    }
}
else {
    Print-Info ".env.local file already exists"
}

# Install frontend dependencies
Print-Info "Installing frontend dependencies..."
npm install

if ($LASTEXITCODE -eq 0) {
    Print-Success "Frontend dependencies installed"
}
else {
    Print-Error "Failed to install frontend dependencies"
    exit 1
}

Set-Location ..

Write-Host ""

# Step 4: Check MongoDB Status
Write-Host "Step 4: Checking MongoDB..." -ForegroundColor Cyan
Write-Host "-----------------------------------"

# Check if MongoDB service is running
$mongoService = Get-Service -Name MongoDB -ErrorAction SilentlyContinue

if ($mongoService) {
    if ($mongoService.Status -eq 'Running') {
        Print-Success "MongoDB service is running"
    }
    else {
        Print-Info "Starting MongoDB service..."
        Start-Service MongoDB
        Start-Sleep -Seconds 2
        Print-Success "MongoDB service started"
    }
}
else {
    Print-Info "MongoDB service not found. Checking if MongoDB is running manually..."
    try {
        $testConnection = mongosh --eval "db.runCommand({ ping: 1 })" --quiet 2>$null
        if ($?) {
            Print-Success "MongoDB is running"
        }
        else {
            Print-Error "MongoDB is not running"
            Print-Info "Please start MongoDB manually"
        }
    }
    catch {
        Print-Error "Cannot connect to MongoDB"
        Print-Info "Please start MongoDB manually"
    }
}

Write-Host ""

# Step 5: Create Startup Scripts
Write-Host "Step 5: Creating Startup Scripts..." -ForegroundColor Cyan
Write-Host "-----------------------------------"

# Create start script
$startScript = @'
# Start ResCash Development Environment

Write-Host "Starting ResCash Development Environment..." -ForegroundColor Cyan

# Start backend
Write-Host "Starting backend server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm start"

# Wait for backend to start
Start-Sleep -Seconds 3

# Start frontend
Write-Host "Starting frontend development server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd resCash; npm start"

Write-Host ""
Write-Host "✓ Development servers started!" -ForegroundColor Green
Write-Host "  Backend: http://localhost:8099" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "To stop servers, run: .\stop-dev.ps1" -ForegroundColor Yellow
'@

$startScript | Out-File -FilePath start-dev.ps1 -Encoding UTF8
Print-Success "Created start-dev.ps1 script"

# Create stop script
$stopScript = @'
# Stop ResCash Development Environment

Write-Host "Stopping ResCash Development Environment..." -ForegroundColor Cyan

# Kill backend (Node.js on port 8099)
Write-Host "Stopping backend..." -ForegroundColor Yellow
$backendProcesses = Get-NetTCPConnection -LocalPort 8099 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
foreach ($pid in $backendProcesses) {
    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
}

# Kill frontend (React dev server on port 3000)
Write-Host "Stopping frontend..." -ForegroundColor Yellow
$frontendProcesses = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
foreach ($pid in $frontendProcesses) {
    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
}

Write-Host "✓ All processes stopped" -ForegroundColor Green
'@

$stopScript | Out-File -FilePath stop-dev.ps1 -Encoding UTF8
Print-Success "Created stop-dev.ps1 script"

Write-Host ""

# Step 6: Summary
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Print-Success "Backend configured in: .\backend"
Print-Success "Frontend configured in: .\resCash"
Write-Host ""
Write-Host "Configuration Files:"
Write-Host "  - backend\.env (Backend environment)"
Write-Host "  - resCash\.env.local (Frontend environment)"
Write-Host ""
Write-Host "Development Mode Settings:"
Write-Host "  ✓ ENABLE_DEV_LOGIN=true (bypasses ResVault)" -ForegroundColor Green
Write-Host "  ✓ ENABLE_RESILIENT_SYNC=false (faster startup)" -ForegroundColor Green
Write-Host "  ✓ MongoDB: Local instance" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "-----------------------------------"
Write-Host "1. Review configuration files if needed:"
Write-Host "   notepad backend\.env"
Write-Host "   notepad resCash\.env.local"
Write-Host ""
Write-Host "2. Start the application:"
Write-Host "   .\start-dev.ps1" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Or start manually in separate terminals:"
Write-Host "   # Terminal 1 - Backend"
Write-Host "   cd backend; npm start"
Write-Host ""
Write-Host "   # Terminal 2 - Frontend"
Write-Host "   cd resCash; npm start"
Write-Host ""
Write-Host "3. Access the application:"
Write-Host "   http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Stop the application:"
Write-Host "   .\stop-dev.ps1" -ForegroundColor Cyan
Write-Host ""
Print-Info "For production deployment, see DEPLOYMENT.md"
Write-Host ""
