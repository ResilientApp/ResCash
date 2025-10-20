# ResCash - Complete Installation and Deployment Guide

**Version:** 2.0  
**Last Updated:** October 2025  
**Project:** Blockchain-Based Financial Management Application

---

## Table of Contents

1. [Quick Start](#1-quick-start)
2. [Server Deployment](#2-server-deployment)
3. [Local Installation](#3-local-installation)
4. [Configuration Reference](#4-configuration-reference)
5. [ResilientDB Integration](#5-resilientdb-integration)
6. [ResVault Wallet Setup](#6-resvault-wallet-setup)
7. [Troubleshooting](#7-troubleshooting)
8. [Security Guidelines](#8-security-guidelines)
9. [Architecture Overview](#9-architecture-overview)
10. [Development Scripts](#10-development-scripts)

---

## 1. Quick Start

### Prerequisites

- **Node.js** 16.x or higher
- **MongoDB** 6.x or higher
- **Git**
- **ResVault Chrome Extension** (for production only)

### Installation in 3 Steps

```bash
# 1. Clone repository
git clone https://github.com/quiet98k/ecs189f-final-project.git
cd ecs189f-final-project

# 2. Configure environment
cp local/backend.env.example backend/.env
cp local/frontend.env.example resCash/.env.local
# Edit backend/.env and resCash/.env.local with your settings

# 3. Run setup script
# Windows:
.\setup-local.ps1
# Linux/macOS:
chmod +x setup-local.sh && ./setup-local.sh
```

**Access:** http://localhost:3000

---

## 2. Server Deployment

### 2.1 Server Requirements

- Ubuntu 20.04+ or Debian 10+
- 2+ CPU cores
- 4GB+ RAM
- 20GB+ disk space
- Public IP address or domain name

### 2.2 Automated Deployment

```bash
# On your production server
git clone https://github.com/quiet98k/ecs189f-final-project.git
cd ecs189f-final-project
chmod +x deploy-server.sh
./deploy-server.sh
```

The script will:
1. Install Node.js, MongoDB, PM2, and Nginx
2. Prompt for configuration (domain, ResilientDB URLs)
3. Generate secure secrets
4. Build and deploy the application
5. Configure reverse proxy and firewall
6. Optionally install SSL certificate

### 2.3 Manual Server Deployment

#### Step 1: Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx
sudo systemctl enable nginx
```

#### Step 2: Configure Backend

```bash
cd backend

# Copy configuration template
cp ../local/backend.env.example .env

# Edit configuration
nano .env
```

**Required settings for production:**

```env
# MongoDB
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB_NAME=rescash_production

# ResilientDB - Update with your server URLs
GRAPHQL_URI=http://YOUR_RESILIENTDB_HOST:8000/graphql
CROW_SERVER_URI=http://YOUR_RESILIENTDB_HOST:18000/v1/transactions

# Security - Generate random secrets
SESSION_SECRET=<run: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
JWT_SECRET=<run: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">

# Server
PORT=8099
HOST=0.0.0.0

# Production flags
ENABLE_RESILIENT_SYNC=true
ENABLE_DEV_LOGIN=false
DEV_PUBLIC_KEY=
```

```bash
# Install dependencies
npm install --production

# Start with PM2
pm2 start server.js --name rescash-backend
pm2 save
pm2 startup
```

#### Step 3: Build Frontend

```bash
cd ../resCash

# Copy configuration template
cp ../local/frontend.env.example .env.local

# Edit configuration
nano .env.local
```

**Required settings:**

```env
REACT_APP_ENABLE_DEV_LOGIN=false
REACT_APP_API_BASE_URL=https://your-domain.com/api
```

```bash
# Install dependencies and build
npm install
npm run build
```

#### Step 4: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/rescash
```

**Nginx configuration:**

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/ecs189f-final-project/resCash/build;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8099/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/rescash /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 5: Configure Firewall

```bash
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

#### Step 6: Install SSL Certificate (Optional)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 2.4 Post-Deployment Verification

```bash
# Check backend status
pm2 status
pm2 logs rescash-backend

# Check MongoDB
mongosh
> use rescash_production
> db.transactions.countDocuments()

# Check Nginx
sudo nginx -t
sudo systemctl status nginx

# Test application
curl http://your-domain.com
curl http://your-domain.com/api/test
```

---

## 3. Local Installation

### 3.1 Automated Local Setup

#### Windows

```powershell
# Clone repository
git clone https://github.com/quiet98k/ecs189f-final-project.git
cd ecs189f-final-project

# Configure environment
cp local\backend.env.example backend\.env
cp local\frontend.env.example resCash\.env.local

# Edit configuration files
notepad backend\.env
notepad resCash\.env.local

# Run setup script
.\setup-local.ps1

# Start application
.\start-dev.ps1
```

#### Linux/macOS

```bash
# Clone repository
git clone https://github.com/quiet98k/ecs189f-final-project.git
cd ecs189f-final-project

# Configure environment
cp local/backend.env.example backend/.env
cp local/frontend.env.example resCash/.env.local

# Edit configuration files
nano backend/.env
nano resCash/.env.local

# Make scripts executable
chmod +x *.sh

# Run setup script
./setup-local.sh

# Start application
./start-dev.sh
```

### 3.2 Manual Local Setup

#### Step 1: Install Prerequisites

**MongoDB:**
- Windows: https://www.mongodb.com/try/download/community
- macOS: `brew install mongodb-community`
- Linux: See server deployment section

**Node.js:**
- Download from https://nodejs.org/ (LTS version recommended)

#### Step 2: Start MongoDB

```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

#### Step 3: Configure Backend

```bash
cd backend

# Copy configuration
cp ../local/backend.env.example .env

# Edit .env file
```

**Local development settings:**

```env
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB_NAME=rescash_test

# If you have ResilientDB, update these URLs
# Otherwise, they won't be used with ENABLE_RESILIENT_SYNC=false
GRAPHQL_URI=http://YOUR_RESILIENTDB_HOST:8000/graphql
CROW_SERVER_URI=http://YOUR_RESILIENTDB_HOST:18000/v1/transactions

SESSION_SECRET=local_dev_secret
JWT_SECRET=local_dev_jwt_secret

PORT=8099
HOST=127.0.0.1

# Local development mode (no blockchain required)
ENABLE_RESILIENT_SYNC=false
ENABLE_DEV_LOGIN=true
DEV_PUBLIC_KEY=LOCAL_TEST_PUBLIC_KEY
```

```bash
# Install dependencies
npm install

# Start backend
npm start
```

#### Step 4: Configure Frontend

Open new terminal:

```bash
cd resCash

# Copy configuration
cp ../local/frontend.env.example .env.local

# Edit .env.local file
```

**Settings:**

```env
REACT_APP_ENABLE_DEV_LOGIN=true
REACT_APP_API_BASE_URL=http://localhost:8099
```

```bash
# Install dependencies
npm install

# Start frontend
npm start
```

**Access:** http://localhost:3000

### 3.3 Development Mode vs Production Mode

#### Development Mode (Local Testing)

**Features:**
- ✅ Bypasses ResVault authentication
- ✅ Disables blockchain synchronization
- ✅ Uses local MongoDB only
- ✅ Faster startup
- ❌ No blockchain features

**Configuration:**
```env
# Backend
ENABLE_DEV_LOGIN=true
ENABLE_RESILIENT_SYNC=false

# Frontend
REACT_APP_ENABLE_DEV_LOGIN=true
```

#### Production Mode (Live Deployment)

**Features:**
- ✅ ResVault authentication required
- ✅ Blockchain synchronization enabled
- ✅ Secure transaction signing
- ✅ Full blockchain features

**Configuration:**
```env
# Backend
ENABLE_DEV_LOGIN=false
ENABLE_RESILIENT_SYNC=true

# Frontend
REACT_APP_ENABLE_DEV_LOGIN=false
```

---

## 4. Configuration Reference

### 4.1 Backend Environment Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017` | Yes |
| `MONGODB_DB_NAME` | Database name | `rescash_production` | Yes |
| `GRAPHQL_URI` | ResilientDB GraphQL endpoint | `http://server:8000/graphql` | Yes* |
| `CROW_SERVER_URI` | ResilientDB transaction endpoint | `http://server:18000/v1/transactions` | Yes* |
| `SESSION_SECRET` | Session encryption key | Random 32-byte hex | Yes |
| `JWT_SECRET` | JWT token signing key | Random 32-byte hex | Yes |
| `PORT` | Backend server port | `8099` | No |
| `HOST` | Server bind address | `0.0.0.0` (prod), `127.0.0.1` (dev) | No |
| `ENABLE_RESILIENT_SYNC` | Enable blockchain sync | `true` / `false` | Yes |
| `ENABLE_DEV_LOGIN` | Enable dev mode bypass | `true` / `false` | Yes |
| `DEV_PUBLIC_KEY` | Dev mode public key | Any string | No |

\* Required only when `ENABLE_RESILIENT_SYNC=true`

### 4.2 Frontend Environment Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `REACT_APP_ENABLE_DEV_LOGIN` | Show dev login option | `true` / `false` | Yes |
| `REACT_APP_API_BASE_URL` | Backend API URL | `http://localhost:8099` | Yes |

### 4.3 Configuration Examples

#### Local Development
```env
# backend/.env
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB_NAME=rescash_test
GRAPHQL_URI=http://your-resilientdb:8000/graphql
CROW_SERVER_URI=http://your-resilientdb:18000/v1/transactions
SESSION_SECRET=dev_session_secret
JWT_SECRET=dev_jwt_secret
PORT=8099
HOST=127.0.0.1
ENABLE_RESILIENT_SYNC=false
ENABLE_DEV_LOGIN=true
DEV_PUBLIC_KEY=LOCAL_TEST_PUBLIC_KEY
```

```env
# resCash/.env.local
REACT_APP_ENABLE_DEV_LOGIN=true
REACT_APP_API_BASE_URL=http://localhost:8099
```

#### Production Server
```env
# backend/.env
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB_NAME=rescash_production
GRAPHQL_URI=http://your-resilientdb:8000/graphql
CROW_SERVER_URI=http://your-resilientdb:18000/v1/transactions
SESSION_SECRET=<32-byte-random-hex>
JWT_SECRET=<32-byte-random-hex>
PORT=8099
HOST=0.0.0.0
ENABLE_RESILIENT_SYNC=true
ENABLE_DEV_LOGIN=false
DEV_PUBLIC_KEY=
```

```env
# resCash/.env.local
REACT_APP_ENABLE_DEV_LOGIN=false
REACT_APP_API_BASE_URL=https://your-domain.com/api
```

---

## 5. ResilientDB Integration

### 5.1 What is ResilientDB?

ResilientDB is a high-performance blockchain platform that provides:
- Distributed ledger for immutable transaction records
- Byzantine fault-tolerant consensus
- High throughput and low latency
- GraphQL API for querying
- REST API for transaction submission

### 5.2 ResilientDB Components

ResCash integrates with two ResilientDB services:

1. **GraphQL Server** (Port 8000)
   - Query transaction data
   - Retrieve public keys
   - Read blockchain state

2. **Crow HTTP Server** (Port 18000)
   - Submit new transactions
   - Retrieve transaction lists
   - WebSocket updates

### 5.3 Configuration

All ResilientDB URLs are configured via environment variables:

```env
# In backend/.env
GRAPHQL_URI=http://YOUR_RESILIENTDB_HOST:8000/graphql
CROW_SERVER_URI=http://YOUR_RESILIENTDB_HOST:18000/v1/transactions
```

**Important:** Replace `YOUR_RESILIENTDB_HOST` with your actual ResilientDB server address.

### 5.4 Using Public ResilientDB Instance

If you don't have your own ResilientDB instance, you can use a public one:

```env
GRAPHQL_URI=http://PUBLIC_INSTANCE_IP:8000/graphql
CROW_SERVER_URI=http://PUBLIC_INSTANCE_IP:18000/v1/transactions
```

**Note:** Public instances are suitable for testing only. For production, deploy your own ResilientDB cluster.

### 5.5 WebSocket Synchronization

ResCash uses `resilient-node-cache` to sync blockchain data to MongoDB:

**How it works:**
1. WebSocket connects to ResilientDB Crow server
2. Listens for new block notifications
3. Automatically syncs new transactions to MongoDB
4. Provides fast local queries while maintaining blockchain integrity

**Configuration:**
```env
ENABLE_RESILIENT_SYNC=true  # Enable sync
```

The sync service automatically derives WebSocket URL from `CROW_SERVER_URI`.

### 5.6 Testing ResilientDB Connection

```bash
# Test GraphQL endpoint
curl -X POST http://YOUR_RESILIENTDB_HOST:8000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __typename }"}'

# Test Crow server
curl http://YOUR_RESILIENTDB_HOST:18000/v1/transactions
```

---

## 6. ResVault Wallet Setup

### 6.1 What is ResVault?

ResVault is a Chrome extension that serves as a blockchain wallet for ResilientDB:
- Manages cryptographic key pairs
- Signs transactions securely
- Provides authentication for dApps
- Similar to MetaMask for Ethereum

### 6.2 Installation

1. **Install Chrome/Edge Browser**
   - ResVault requires Chromium-based browser

2. **Install ResVault Extension**
   - Visit: https://blog.resilientdb.com/2023/09/21/ResVault.html
   - Follow installation instructions
   - Or search "ResVault" in Chrome Web Store

3. **Create Wallet**
   - Click ResVault icon in browser
   - Create new wallet or import existing
   - **IMPORTANT:** Backup your seed phrase securely!

4. **Configure ResilientDB Endpoint**
   - Click ResVault settings icon
   - Set GraphQL URL to match your backend configuration:
     ```
     http://YOUR_RESILIENTDB_HOST:8000/graphql
     ```
   - This MUST match the `GRAPHQL_URI` in `backend/.env`

### 6.3 Using ResVault with ResCash

#### Production Mode

When `REACT_APP_ENABLE_DEV_LOGIN=false`:

1. User clicks "Sign In Via ResVault"
2. ResVault popup appears
3. User approves connection
4. ResVault creates authentication transaction on blockchain
5. Backend retrieves transaction and issues JWT
6. User is authenticated

#### Creating Transactions

1. User fills transaction form
2. Clicks "Submit Transaction"
3. ResVault popup shows transaction details
4. User signs transaction with private key
5. Transaction is submitted to ResilientDB
6. Backend caches transaction metadata in MongoDB

### 6.4 Development Mode (Bypass ResVault)

For local testing without ResVault:

```env
# backend/.env
ENABLE_DEV_LOGIN=true

# resCash/.env.local
REACT_APP_ENABLE_DEV_LOGIN=true
```

This enables "Retry Dev Login" button that bypasses ResVault authentication.

**WARNING:** Never use dev mode in production!

---

## 7. Troubleshooting

### 7.1 MongoDB Issues

#### Cannot Connect to MongoDB

```bash
# Check if MongoDB is running
mongosh

# If connection fails:
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
sudo systemctl status mongod
```

#### MongoDB Connection Error in Backend

Check `backend/.env`:
```env
MONGODB_URI=mongodb://127.0.0.1:27017  # Correct format
```

View MongoDB logs:
```bash
# Linux
sudo tail -f /var/log/mongodb/mongod.log

# MongoDB log location varies by OS
```

### 7.2 ResilientDB Connection Issues

#### Error: "Cannot connect to ResilientDB"

**Solution 1:** Disable sync for local development
```env
# backend/.env
ENABLE_RESILIENT_SYNC=false
```

**Solution 2:** Verify ResilientDB URLs
```bash
# Test GraphQL
curl http://YOUR_RESILIENTDB_HOST:8000/graphql

# Test Crow server
curl http://YOUR_RESILIENTDB_HOST:18000/v1/transactions
```

**Solution 3:** Check firewall allows connections to ports 8000 and 18000

#### WebSocket Sync Errors

If you see WebSocket connection errors but don't need blockchain features:
```env
ENABLE_RESILIENT_SYNC=false
```

### 7.3 ResVault Issues

#### ResVault Popup Doesn't Appear

1. Verify ResVault is installed: `chrome://extensions`
2. Ensure ResVault is enabled
3. Check browser console (F12) for errors
4. Try reloading the page

#### "SDK is not initialized" Error

1. Check that ResVault GraphQL URL matches backend:
   - ResVault settings: `http://YOUR_HOST:8000/graphql`
   - backend/.env: `GRAPHQL_URI=http://YOUR_HOST:8000/graphql`
2. Refresh the page after changing settings

#### Dev Login Button Not Showing

Ensure dev mode is enabled:
```env
# backend/.env
ENABLE_DEV_LOGIN=true

# resCash/.env.local
REACT_APP_ENABLE_DEV_LOGIN=true
```

Restart both backend and frontend after changes.

### 7.4 Port Conflicts

#### Port 8099 Already in Use

```bash
# Find and kill process
# Windows
Get-NetTCPConnection -LocalPort 8099 | Select-Object -ExpandProperty OwningProcess | Stop-Process -Force

# Linux/macOS
lsof -ti:8099 | xargs kill -9
```

#### Port 3000 Already in Use

```bash
# Windows
Get-NetTCPConnection -LocalPort 3000 | Select-Object -ExpandProperty OwningProcess | Stop-Process -Force

# Linux/macOS
lsof -ti:3000 | xargs kill -9
```

### 7.5 Frontend Cannot Reach Backend

**Symptom:** Network errors in browser console

**Solutions:**

1. Verify backend is running:
   ```bash
   curl http://localhost:8099/test
   ```

2. Check `resCash/.env.local`:
   ```env
   REACT_APP_API_BASE_URL=http://localhost:8099
   ```

3. Restart frontend after changing `.env.local`

### 7.6 Build Errors

#### Backend Build Errors

```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

#### Frontend Build Errors

```bash
cd resCash
rm -rf node_modules package-lock.json
npm install
```

### 7.7 PM2 Issues (Production)

```bash
# View logs
pm2 logs rescash-backend

# Restart application
pm2 restart rescash-backend

# View status
pm2 status

# Reset PM2
pm2 delete all
pm2 start server.js --name rescash-backend
pm2 save
```

---

## 8. Security Guidelines

### 8.1 Production Checklist

Before deploying to production, verify:

- [ ] `ENABLE_DEV_LOGIN=false` in backend `.env`
- [ ] `REACT_APP_ENABLE_DEV_LOGIN=false` in frontend `.env.local`
- [ ] Strong random `SESSION_SECRET` (32+ bytes)
- [ ] Strong random `JWT_SECRET` (32+ bytes)
- [ ] HTTPS enabled with valid SSL certificate
- [ ] Firewall configured (only ports 80, 443, 22 open)
- [ ] MongoDB not exposed to internet (bind to 127.0.0.1)
- [ ] `.env` files not committed to Git
- [ ] ResVault configured with correct GraphQL URL
- [ ] Regular backups configured for MongoDB
- [ ] PM2 logs rotation enabled
- [ ] Nginx security headers configured

### 8.2 Generate Secure Secrets

```bash
# Generate SESSION_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy output to `.env` file.

### 8.3 Environment File Security

**DO:**
- Use `.env.example` files as templates
- Keep `.env` files local only
- Add `.env` to `.gitignore`
- Use different secrets for dev/prod
- Rotate secrets periodically (every 3-6 months)

**DON'T:**
- Commit `.env` files to Git
- Share `.env` files publicly
- Use default/example secrets in production
- Hardcode secrets in source code

### 8.4 MongoDB Security

```bash
# Bind to localhost only
# In MongoDB config (/etc/mongod.conf):
net:
  bindIp: 127.0.0.1
  port: 27017

# Enable authentication (optional but recommended)
security:
  authorization: enabled
```

### 8.5 Nginx Security Headers

Add to Nginx configuration:

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
```

### 8.6 Regular Maintenance

- **Update dependencies:**
  ```bash
  npm audit
  npm audit fix
  npm update
  ```

- **Monitor logs:**
  ```bash
  pm2 logs rescash-backend
  sudo tail -f /var/log/nginx/error.log
  ```

- **Backup database:**
  ```bash
  mongodump --out /backups/rescash-$(date +%Y%m%d)
  ```

---

## 9. Architecture Overview

### 9.1 System Architecture

```
┌─────────────────────────────────────┐
│          User Browser               │
│   ┌─────────────────────────────┐   │
│   │  React Frontend (Port 3000) │   │
│   └────────────┬────────────────┘   │
│                │                     │
│   ┌────────────▼────────────────┐   │
│   │  ResVault SDK Integration   │   │
│   └────────────┬────────────────┘   │
└────────────────┼────────────────────┘
                 │ HTTP/WebSocket
                 │
┌────────────────▼────────────────────┐
│     ResilientDB Blockchain          │
│  ┌──────────────────────────────┐   │
│  │  GraphQL Server (Port 8000)  │   │
│  └──────────────────────────────┘   │
│  ┌──────────────────────────────┐   │
│  │  Crow Server (Port 18000)    │   │
│  └──────────────────────────────┘   │
└────────────────┬────────────────────┘
                 │ GraphQL / REST
┌────────────────▼────────────────────┐
│   Backend Server (Port 8099)        │
│  ┌──────────────────────────────┐   │
│  │  Express REST API            │   │
│  │  JWT Authentication          │   │
│  │  WebSocket Sync Service      │   │
│  └──────────────────────────────┘   │
└────────────────┬────────────────────┘
                 │ Mongoose ORM
┌────────────────▼────────────────────┐
│   MongoDB (Port 27017)              │
│   - Transaction Cache               │
│   - User Sessions                   │
│   - Query Optimization              │
└─────────────────────────────────────┘
```

### 9.2 Data Flow

#### Transaction Creation
1. User fills form in React frontend
2. Frontend calls ResVault SDK
3. ResVault signs transaction with private key
4. Transaction submitted to ResilientDB
5. Backend receives transaction ID
6. Backend fetches transaction details from ResilientDB
7. Backend caches transaction in MongoDB
8. Frontend displays confirmation

#### Data Query
1. Frontend requests transaction list
2. Backend queries MongoDB (fast)
3. Optional: Sync check with ResilientDB
4. Backend returns JSON response
5. Frontend displays charts and tables

#### Authentication
1. User clicks "Sign In Via ResVault"
2. ResVault creates authentication transaction
3. Transaction includes user's public key
4. Backend retrieves public key from blockchain
5. Backend generates JWT with public key
6. JWT stored in browser session
7. JWT sent with all API requests

### 9.3 Technology Stack

**Frontend:**
- React 19 + TypeScript
- Bootstrap 5 + CoreUI
- ResVault SDK
- Lottie animations
- Custom Canvas charts

**Backend:**
- Node.js 18+
- Express 4
- Mongoose (MongoDB ODM)
- Apollo Client (GraphQL)
- resilient-node-cache (WebSocket sync)
- JWT (authentication)

**Database:**
- MongoDB 6 (local cache)
- ResilientDB (blockchain ledger)

**DevOps:**
- PM2 (process management)
- Nginx (reverse proxy)
- Certbot (SSL certificates)

---

## 10. Development Scripts

### 10.1 Available Scripts

#### Local Setup Scripts

**Windows:**
- `setup-local.ps1` - Install dependencies and configure
- `start-dev.ps1` - Start both servers
- `stop-dev.ps1` - Stop all processes
- `check-config.ps1` - Verify configuration

**Linux/macOS:**
- `setup-local.sh` - Install dependencies and configure
- `start-dev.sh` - Start both servers
- `stop-dev.sh` - Stop all processes
- `check-config.sh` - Verify configuration

#### Production Deployment

- `deploy-server.sh` - Automated server deployment (Linux only)

### 10.2 Script Usage

#### setup-local

**Purpose:** One-time setup for local development

**What it does:**
- Checks prerequisites (Node.js, MongoDB, npm)
- Copies configuration templates
- Installs backend dependencies
- Installs frontend dependencies
- Verifies MongoDB status
- Creates start/stop scripts

**Usage:**
```bash
# Windows
.\setup-local.ps1

# Linux/macOS
chmod +x setup-local.sh
./setup-local.sh
```

#### start-dev

**Purpose:** Start development servers

**What it does:**
- Starts backend on port 8099
- Starts frontend on port 3000
- Opens browser automatically

**Usage:**
```bash
# Windows
.\start-dev.ps1

# Linux/macOS
./start-dev.sh
```

#### stop-dev

**Purpose:** Stop all development servers

**What it does:**
- Kills processes on port 8099
- Kills processes on port 3000

**Usage:**
```bash
# Windows
.\stop-dev.ps1

# Linux/macOS
./stop-dev.sh
```

#### check-config

**Purpose:** Verify configuration before running

**What it does:**
- Checks if `.env` files exist
- Verifies required variables are set
- Warns about dev mode in production
- Checks dependencies installation
- Verifies MongoDB status

**Output:**
- ✓ Green: Configuration correct
- ✗ Red: Missing or incorrect
- ⚠ Yellow: Warning to review

**Usage:**
```bash
# Windows
.\check-config.ps1

# Linux/macOS
./check-config.sh
```

#### deploy-server

**Purpose:** Automated production deployment

**What it does:**
- Interactive configuration wizard
- Installs all server dependencies
- Configures environment variables
- Builds frontend for production
- Sets up PM2 process manager
- Configures Nginx reverse proxy
- Sets up firewall rules
- Optionally installs SSL certificate

**Usage:**
```bash
# On production server (Ubuntu/Debian)
chmod +x deploy-server.sh
./deploy-server.sh
```

### 10.3 Manual Commands

#### Backend

```bash
cd backend

# Development mode
npm start

# Production mode (with PM2)
pm2 start server.js --name rescash-backend
pm2 logs rescash-backend
pm2 restart rescash-backend
pm2 stop rescash-backend
```

#### Frontend

```bash
cd resCash

# Development server
npm start

# Production build
npm run build

# Serve production build (for testing)
npx serve -s build
```

#### MongoDB

```bash
# Start
# Windows: net start MongoDB
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod

# Connect
mongosh

# Use database
use rescash_test

# View collections
show collections

# Count transactions
db.transactions.countDocuments()

# View recent transactions
db.transactions.find().limit(5).pretty()
```

---

## Additional Resources

### Documentation
- **ResilientDB:** https://resilientdb.com/
- **ResVault Guide:** https://blog.resilientdb.com/2023/09/21/ResVault.html
- **MongoDB Docs:** https://www.mongodb.com/docs/
- **React Docs:** https://react.dev/
- **Express Docs:** https://expressjs.com/

### Project Files
- **Configuration Templates:** `local/` directory
- **Example Configurations:** See section 4.3
- **GitHub Repository:** https://github.com/quiet98k/ecs189f-final-project

### Support
- **Issues:** https://github.com/quiet98k/ecs189f-final-project/issues
- **Configuration Check:** Run `check-config.sh` or `check-config.ps1`

---

## Summary

### Key Points

1. **Configuration is Everything**
   - All deployment differences are in `.env` files
   - Copy from `local/` templates
   - Update ResilientDB URLs to match your deployment

2. **Development vs Production**
   - Dev mode: `ENABLE_DEV_LOGIN=true`, no ResVault needed
   - Prod mode: `ENABLE_DEV_LOGIN=false`, ResVault required

3. **ResilientDB URLs**
   - No hardcoded addresses in code
   - All URLs from environment variables
   - Update `GRAPHQL_URI` and `CROW_SERVER_URI` in backend/.env

4. **One-Command Setup**
   - `setup-local.sh/.ps1` for local development
   - `deploy-server.sh` for production
   - Modify .env files as needed

5. **Security First**
   - Generate random secrets for production
   - Disable dev login in production
   - Use HTTPS with SSL certificate
   - Never commit `.env` files

---

**Last Updated:** October 2025  
**Version:** 2.0  
**Project:** ResCash - Blockchain Financial Management  
**Institution:** UC Davis - ECS 189F Fall 2024
