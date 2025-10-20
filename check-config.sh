#!/bin/bash

# ============================================
# ResCash Configuration Checker
# ============================================

echo "============================================"
echo "ResCash Configuration Checker"
echo "============================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

check_pass() {
    echo -e "${GREEN}✓ $1${NC}"
}

check_fail() {
    echo -e "${RED}✗ $1${NC}"
}

check_warn() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check backend .env
echo "Checking Backend Configuration..."
echo "-----------------------------------"

if [ -f "backend/.env" ]; then
    check_pass "backend/.env exists"
    
    # Check for required variables
    if grep -q "MONGODB_URI" backend/.env; then
        check_pass "MONGODB_URI is set"
    else
        check_fail "MONGODB_URI is missing"
    fi
    
    if grep -q "GRAPHQL_URI" backend/.env; then
        check_pass "GRAPHQL_URI is set"
    else
        check_fail "GRAPHQL_URI is missing"
    fi
    
    if grep -q "JWT_SECRET" backend/.env; then
        check_pass "JWT_SECRET is set"
    else
        check_fail "JWT_SECRET is missing"
    fi
    
    # Check dev login status
    if grep -q "ENABLE_DEV_LOGIN=true" backend/.env; then
        check_warn "ENABLE_DEV_LOGIN=true (Development Mode)"
        echo "  ⚠ This is OK for local testing, but MUST be false in production!"
    elif grep -q "ENABLE_DEV_LOGIN=false" backend/.env; then
        check_pass "ENABLE_DEV_LOGIN=false (Production Mode)"
    else
        check_fail "ENABLE_DEV_LOGIN not set"
    fi
    
    # Check sync status
    if grep -q "ENABLE_RESILIENT_SYNC=true" backend/.env; then
        check_pass "ENABLE_RESILIENT_SYNC=true (Blockchain sync enabled)"
    elif grep -q "ENABLE_RESILIENT_SYNC=false" backend/.env; then
        check_warn "ENABLE_RESILIENT_SYNC=false (Blockchain sync disabled)"
    else
        check_fail "ENABLE_RESILIENT_SYNC not set"
    fi
    
else
    check_fail "backend/.env not found!"
    echo "  Run: cd backend && cp .env.example .env"
fi

echo ""

# Check frontend .env.local
echo "Checking Frontend Configuration..."
echo "-----------------------------------"

if [ -f "resCash/.env.local" ]; then
    check_pass "resCash/.env.local exists"
    
    # Check dev login status
    if grep -q "REACT_APP_ENABLE_DEV_LOGIN=true" resCash/.env.local; then
        check_warn "REACT_APP_ENABLE_DEV_LOGIN=true (Development Mode)"
        echo "  ⚠ This is OK for local testing, but MUST be false in production!"
    elif grep -q "REACT_APP_ENABLE_DEV_LOGIN=false" resCash/.env.local; then
        check_pass "REACT_APP_ENABLE_DEV_LOGIN=false (Production Mode)"
    else
        check_fail "REACT_APP_ENABLE_DEV_LOGIN not set"
    fi
    
    # Check API URL
    if grep -q "REACT_APP_API_BASE_URL" resCash/.env.local; then
        check_pass "REACT_APP_API_BASE_URL is set"
    else
        check_fail "REACT_APP_API_BASE_URL is missing"
    fi
    
else
    check_fail "resCash/.env.local not found!"
    echo "  Run: cd resCash && cp .env.example .env.local"
fi

echo ""

# Check dependencies
echo "Checking Dependencies..."
echo "-----------------------------------"

if [ -d "backend/node_modules" ]; then
    check_pass "Backend dependencies installed"
else
    check_fail "Backend dependencies not installed"
    echo "  Run: cd backend && npm install"
fi

if [ -d "resCash/node_modules" ]; then
    check_pass "Frontend dependencies installed"
else
    check_fail "Frontend dependencies not installed"
    echo "  Run: cd resCash && npm install"
fi

echo ""

# Check MongoDB
echo "Checking MongoDB..."
echo "-----------------------------------"

if command -v mongod >/dev/null 2>&1; then
    check_pass "MongoDB is installed"
    
    if mongosh --eval "db.runCommand({ ping: 1 })" --quiet >/dev/null 2>&1; then
        check_pass "MongoDB is running"
    else
        check_warn "MongoDB is not running"
        echo "  Start with: sudo systemctl start mongod (Linux)"
        echo "           or: brew services start mongodb-community (macOS)"
    fi
else
    check_fail "MongoDB is not installed"
fi

echo ""

# Check Node.js version
echo "Checking Node.js..."
echo "-----------------------------------"

if command -v node >/dev/null 2>&1; then
    NODE_VERSION=$(node -v)
    check_pass "Node.js installed: $NODE_VERSION"
    
    # Check if version is >= 16
    NODE_MAJOR=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_MAJOR" -ge 16 ]; then
        check_pass "Node.js version is compatible (>= 16.x)"
    else
        check_warn "Node.js version is old (< 16.x), consider upgrading"
    fi
else
    check_fail "Node.js is not installed"
fi

echo ""

# Summary
echo "============================================"
echo "Configuration Check Summary"
echo "============================================"
echo ""
echo "If you see any ✗ errors above, please fix them before running the application."
echo "If you see ⚠ warnings, review them to ensure they match your environment."
echo ""
echo "For development mode:"
echo "  - ENABLE_DEV_LOGIN should be true in both backend and frontend"
echo "  - ENABLE_RESILIENT_SYNC can be false for faster startup"
echo ""
echo "For production mode:"
echo "  - ENABLE_DEV_LOGIN MUST be false in both backend and frontend"
echo "  - ENABLE_RESILIENT_SYNC should be true"
echo "  - Use strong, random secrets for SESSION_SECRET and JWT_SECRET"
echo ""
