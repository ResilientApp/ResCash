#!/bin/bash

# ============================================
# ResCash Local Development Setup Script
# ============================================

set -e  # Exit on error

echo "============================================"
echo "ResCash Local Development Setup"
echo "============================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Step 1: Check Prerequisites
echo "Step 1: Checking Prerequisites..."
echo "-----------------------------------"

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node -v)
    print_success "Node.js is installed: $NODE_VERSION"
else
    print_error "Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check npm
if command_exists npm; then
    NPM_VERSION=$(npm -v)
    print_success "npm is installed: $NPM_VERSION"
else
    print_error "npm is not installed!"
    exit 1
fi

# Check MongoDB
if command_exists mongod; then
    print_success "MongoDB is installed"
else
    print_error "MongoDB is not installed!"
    echo "Please install MongoDB from https://www.mongodb.com/try/download/community"
    exit 1
fi

echo ""

# Step 2: Setup Backend
echo "Step 2: Setting Up Backend..."
echo "-----------------------------------"

cd backend

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    if [ -f .env.local ]; then
        cp .env.local .env
        print_success "Created .env from .env.local"
    else
        cp .env.example .env
        print_info "Created .env from .env.example - Please update with your settings"
    fi
else
    print_info ".env file already exists"
fi

# Install backend dependencies
print_info "Installing backend dependencies..."
npm install

if [ $? -eq 0 ]; then
    print_success "Backend dependencies installed"
else
    print_error "Failed to install backend dependencies"
    exit 1
fi

cd ..

echo ""

# Step 3: Setup Frontend
echo "Step 3: Setting Up Frontend..."
echo "-----------------------------------"

cd resCash

# Copy environment file if it doesn't exist
if [ ! -f .env.local ]; then
    if [ -f .env.local.example ]; then
        cp .env.local.example .env.local
        print_success "Created .env.local from .env.local.example"
    else
        cp .env.example .env.local
        print_info "Created .env.local from .env.example"
    fi
else
    print_info ".env.local file already exists"
fi

# Install frontend dependencies
print_info "Installing frontend dependencies..."
npm install

if [ $? -eq 0 ]; then
    print_success "Frontend dependencies installed"
else
    print_error "Failed to install frontend dependencies"
    exit 1
fi

cd ..

echo ""

# Step 4: Check MongoDB Status
echo "Step 4: Checking MongoDB..."
echo "-----------------------------------"

# Try to connect to MongoDB
if mongosh --eval "db.runCommand({ ping: 1 })" --quiet > /dev/null 2>&1; then
    print_success "MongoDB is running"
else
    print_info "MongoDB is not running. Attempting to start..."
    
    # Try to start MongoDB (platform-specific)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command_exists brew; then
            brew services start mongodb-community
            sleep 2
            if mongosh --eval "db.runCommand({ ping: 1 })" --quiet > /dev/null 2>&1; then
                print_success "MongoDB started successfully"
            else
                print_error "Failed to start MongoDB"
                echo "Please start MongoDB manually: brew services start mongodb-community"
            fi
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        sudo systemctl start mongod
        sleep 2
        if mongosh --eval "db.runCommand({ ping: 1 })" --quiet > /dev/null 2>&1; then
            print_success "MongoDB started successfully"
        else
            print_error "Failed to start MongoDB"
            echo "Please start MongoDB manually: sudo systemctl start mongod"
        fi
    else
        print_info "Please start MongoDB manually"
    fi
fi

echo ""

# Step 5: Create Startup Scripts
echo "Step 5: Creating Startup Scripts..."
echo "-----------------------------------"

# Create start script
cat > start-dev.sh << 'EOF'
#!/bin/bash

# Start Backend and Frontend in Development Mode

echo "Starting ResCash Development Environment..."

# Start backend in background
echo "Starting backend server..."
cd backend
npm start &
BACKEND_PID=$!
echo "Backend started (PID: $BACKEND_PID)"

# Wait for backend to be ready
sleep 3

# Start frontend
echo "Starting frontend development server..."
cd ../resCash
npm start

# When frontend stops, kill backend
kill $BACKEND_PID
EOF

chmod +x start-dev.sh
print_success "Created start-dev.sh script"

# Create stop script
cat > stop-dev.sh << 'EOF'
#!/bin/bash

# Stop all ResCash processes

echo "Stopping ResCash Development Environment..."

# Kill backend (Node.js on port 8099)
lsof -ti:8099 | xargs kill -9 2>/dev/null
echo "Backend stopped"

# Kill frontend (React dev server on port 3000)
lsof -ti:3000 | xargs kill -9 2>/dev/null
echo "Frontend stopped"

echo "All processes stopped"
EOF

chmod +x stop-dev.sh
print_success "Created stop-dev.sh script"

echo ""

# Step 6: Summary
echo "============================================"
echo "Setup Complete!"
echo "============================================"
echo ""
print_success "Backend configured in: ./backend"
print_success "Frontend configured in: ./resCash"
echo ""
echo "Configuration Files:"
echo "  - backend/.env (Backend environment)"
echo "  - resCash/.env.local (Frontend environment)"
echo ""
echo "Development Mode Settings:"
echo "  ✓ ENABLE_DEV_LOGIN=true (bypasses ResVault)"
echo "  ✓ ENABLE_RESILIENT_SYNC=false (faster startup)"
echo "  ✓ MongoDB: Local instance"
echo ""
echo "Next Steps:"
echo "-----------------------------------"
echo "1. Review configuration files if needed:"
echo "   nano backend/.env"
echo "   nano resCash/.env.local"
echo ""
echo "2. Start the application:"
echo "   ./start-dev.sh"
echo ""
echo "   Or start manually:"
echo "   # Terminal 1 - Backend"
echo "   cd backend && npm start"
echo ""
echo "   # Terminal 2 - Frontend"
echo "   cd resCash && npm start"
echo ""
echo "3. Access the application:"
echo "   http://localhost:3000"
echo ""
echo "4. Stop the application:"
echo "   ./stop-dev.sh"
echo ""
print_info "For production deployment, see DEPLOYMENT.md"
echo ""
