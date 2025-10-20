#!/bin/bash

# ============================================
# ResCash Production Server Deployment Script
# ============================================

set -e  # Exit on error

echo "============================================"
echo "ResCash Production Server Deployment"
echo "============================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_step() {
    echo -e "${BLUE}>>> $1${NC}"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_error "Please do not run this script as root"
    echo "Run as: ./deploy-server.sh"
    exit 1
fi

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Prompt for configuration
prompt_config() {
    echo "============================================"
    echo "Configuration Setup"
    echo "============================================"
    echo ""
    
    read -p "Enter your domain name (or server IP): " DOMAIN_NAME
    read -p "Enter MongoDB database name [rescash_production]: " DB_NAME
    DB_NAME=${DB_NAME:-rescash_production}
    
    echo ""
    echo "ResilientDB Configuration:"
    read -p "Enter ResilientDB GraphQL URI [http://35.193.4.170:8000/graphql]: " GRAPHQL_URI
    GRAPHQL_URI=${GRAPHQL_URI:-http://35.193.4.170:8000/graphql}
    
    read -p "Enter ResilientDB Crow Server URI [http://35.193.4.170:18000/v1/transactions]: " CROW_URI
    CROW_URI=${CROW_URI:-http://35.193.4.170:18000/v1/transactions}
    
    echo ""
    print_info "Generating secure secrets..."
    SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    
    echo ""
    echo "Configuration Summary:"
    echo "-----------------------------------"
    echo "Domain: $DOMAIN_NAME"
    echo "Database: $DB_NAME"
    echo "ResilientDB GraphQL: $GRAPHQL_URI"
    echo "ResilientDB Crow: $CROW_URI"
    echo "Session Secret: [generated]"
    echo "JWT Secret: [generated]"
    echo ""
    
    read -p "Continue with this configuration? (y/n): " CONFIRM
    if [ "$CONFIRM" != "y" ]; then
        echo "Deployment cancelled"
        exit 0
    fi
}

# Step 1: System Update
deploy_step1() {
    print_step "Step 1: Updating System Packages"
    sudo apt update
    sudo apt upgrade -y
    print_success "System updated"
    echo ""
}

# Step 2: Install Dependencies
deploy_step2() {
    print_step "Step 2: Installing Dependencies"
    
    # Install Node.js
    if ! command_exists node; then
        print_info "Installing Node.js 18.x..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt install -y nodejs
        print_success "Node.js installed: $(node -v)"
    else
        print_success "Node.js already installed: $(node -v)"
    fi
    
    # Install MongoDB
    if ! command_exists mongod; then
        print_info "Installing MongoDB..."
        wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
        echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
        sudo apt update
        sudo apt install -y mongodb-org
        sudo systemctl start mongod
        sudo systemctl enable mongod
        print_success "MongoDB installed and started"
    else
        print_success "MongoDB already installed"
        sudo systemctl start mongod || true
    fi
    
    # Install PM2
    if ! command_exists pm2; then
        print_info "Installing PM2..."
        sudo npm install -g pm2
        print_success "PM2 installed"
    else
        print_success "PM2 already installed"
    fi
    
    # Install Nginx
    if ! command_exists nginx; then
        print_info "Installing Nginx..."
        sudo apt install -y nginx
        sudo systemctl enable nginx
        print_success "Nginx installed"
    else
        print_success "Nginx already installed"
    fi
    
    echo ""
}

# Step 3: Deploy Application
deploy_step3() {
    print_step "Step 3: Deploying Application"
    
    APP_DIR="/var/www/rescash"
    
    # Create directory if it doesn't exist
    if [ ! -d "$APP_DIR" ]; then
        print_info "Creating application directory..."
        sudo mkdir -p "$APP_DIR"
        sudo chown $USER:$USER "$APP_DIR"
    fi
    
    # Copy files
    print_info "Copying application files..."
    cp -r backend "$APP_DIR/"
    cp -r resCash "$APP_DIR/"
    
    print_success "Application files copied to $APP_DIR"
    echo ""
}

# Step 4: Configure Backend
deploy_step4() {
    print_step "Step 4: Configuring Backend"
    
    APP_DIR="/var/www/rescash"
    cd "$APP_DIR/backend"
    
    # Create .env file
    print_info "Creating backend .env file..."
    cat > .env << EOF
# MongoDB Configuration
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB_NAME=$DB_NAME

# ResilientDB Configuration
GRAPHQL_URI=$GRAPHQL_URI
CROW_SERVER_URI=$CROW_URI

# Security Configuration
SESSION_SECRET=$SESSION_SECRET
JWT_SECRET=$JWT_SECRET

# Server Configuration
PORT=8099
HOST=0.0.0.0

# Feature Flags
ENABLE_RESILIENT_SYNC=true
ENABLE_DEV_LOGIN=false
DEV_PUBLIC_KEY=
EOF
    
    print_success "Backend .env file created"
    
    # Install dependencies
    print_info "Installing backend dependencies..."
    npm install --production
    print_success "Backend dependencies installed"
    
    echo ""
}

# Step 5: Build and Configure Frontend
deploy_step5() {
    print_step "Step 5: Building Frontend"
    
    APP_DIR="/var/www/rescash"
    cd "$APP_DIR/resCash"
    
    # Create .env.local file
    print_info "Creating frontend .env.local file..."
    cat > .env.local << EOF
# Production Configuration
REACT_APP_ENABLE_DEV_LOGIN=false
REACT_APP_API_BASE_URL=http://$DOMAIN_NAME/api
EOF
    
    print_success "Frontend .env.local file created"
    
    # Install dependencies
    print_info "Installing frontend dependencies..."
    npm install
    
    # Build for production
    print_info "Building frontend for production..."
    npm run build
    
    if [ -d "build" ]; then
        print_success "Frontend built successfully"
    else
        print_error "Frontend build failed"
        exit 1
    fi
    
    echo ""
}

# Step 6: Configure PM2
deploy_step6() {
    print_step "Step 6: Configuring PM2 Process Manager"
    
    APP_DIR="/var/www/rescash"
    cd "$APP_DIR/backend"
    
    # Stop existing PM2 processes
    pm2 delete rescash-backend 2>/dev/null || true
    
    # Start backend with PM2
    print_info "Starting backend with PM2..."
    pm2 start server.js --name rescash-backend
    pm2 save
    
    # Setup PM2 startup script
    print_info "Configuring PM2 auto-start..."
    sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp /home/$USER
    
    print_success "PM2 configured"
    echo ""
}

# Step 7: Configure Nginx
deploy_step7() {
    print_step "Step 7: Configuring Nginx"
    
    APP_DIR="/var/www/rescash"
    
    # Create Nginx configuration
    print_info "Creating Nginx configuration..."
    sudo tee /etc/nginx/sites-available/rescash > /dev/null << EOF
server {
    listen 80;
    server_name $DOMAIN_NAME;

    # Frontend (React build)
    location / {
        root $APP_DIR/resCash/build;
        try_files \$uri \$uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8099/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
EOF
    
    # Enable site
    sudo ln -sf /etc/nginx/sites-available/rescash /etc/nginx/sites-enabled/
    
    # Remove default site if exists
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Test Nginx configuration
    print_info "Testing Nginx configuration..."
    sudo nginx -t
    
    # Restart Nginx
    print_info "Restarting Nginx..."
    sudo systemctl restart nginx
    
    print_success "Nginx configured"
    echo ""
}

# Step 8: Configure Firewall
deploy_step8() {
    print_step "Step 8: Configuring Firewall"
    
    # Check if ufw is installed
    if command_exists ufw; then
        print_info "Configuring UFW firewall..."
        
        # Allow SSH
        sudo ufw allow 22/tcp
        
        # Allow HTTP and HTTPS
        sudo ufw allow 80/tcp
        sudo ufw allow 443/tcp
        
        # Enable firewall (if not already enabled)
        sudo ufw --force enable
        
        print_success "Firewall configured"
    else
        print_info "UFW not installed, skipping firewall configuration"
    fi
    
    echo ""
}

# Step 9: SSL Certificate (Optional)
deploy_step9() {
    print_step "Step 9: SSL Certificate Setup (Optional)"
    
    read -p "Do you want to install SSL certificate with Let's Encrypt? (y/n): " INSTALL_SSL
    
    if [ "$INSTALL_SSL" = "y" ]; then
        # Install Certbot
        if ! command_exists certbot; then
            print_info "Installing Certbot..."
            sudo apt install -y certbot python3-certbot-nginx
        fi
        
        print_info "Obtaining SSL certificate..."
        print_info "Make sure your domain $DOMAIN_NAME points to this server's IP"
        read -p "Press Enter to continue..."
        
        sudo certbot --nginx -d "$DOMAIN_NAME" --non-interactive --agree-tos -m "admin@$DOMAIN_NAME" || {
            print_error "SSL certificate installation failed"
            print_info "You can run this command manually later:"
            echo "sudo certbot --nginx -d $DOMAIN_NAME"
        }
        
        # Setup auto-renewal
        sudo systemctl enable certbot.timer
        print_success "SSL certificate installed"
    else
        print_info "Skipping SSL installation"
        print_info "You can install it later with: sudo certbot --nginx -d $DOMAIN_NAME"
    fi
    
    echo ""
}

# Main deployment function
main() {
    echo ""
    print_info "This script will deploy ResCash to production"
    print_info "Supported: Ubuntu 20.04+ / Debian 10+"
    echo ""
    
    # Prompt for configuration
    prompt_config
    
    # Execute deployment steps
    deploy_step1  # Update system
    deploy_step2  # Install dependencies
    deploy_step3  # Deploy application
    deploy_step4  # Configure backend
    deploy_step5  # Build frontend
    deploy_step6  # Configure PM2
    deploy_step7  # Configure Nginx
    deploy_step8  # Configure firewall
    deploy_step9  # SSL certificate
    
    # Final summary
    echo "============================================"
    echo "Deployment Complete!"
    echo "============================================"
    echo ""
    print_success "ResCash has been deployed successfully!"
    echo ""
    echo "Application Details:"
    echo "-----------------------------------"
    echo "  Domain: http://$DOMAIN_NAME"
    echo "  Backend: http://$DOMAIN_NAME/api"
    echo "  Files: /var/www/rescash"
    echo ""
    echo "Service Management:"
    echo "-----------------------------------"
    echo "  View logs: pm2 logs rescash-backend"
    echo "  Restart backend: pm2 restart rescash-backend"
    echo "  Stop backend: pm2 stop rescash-backend"
    echo "  View status: pm2 status"
    echo ""
    echo "Nginx Commands:"
    echo "-----------------------------------"
    echo "  Restart: sudo systemctl restart nginx"
    echo "  Status: sudo systemctl status nginx"
    echo "  Test config: sudo nginx -t"
    echo ""
    echo "MongoDB Commands:"
    echo "-----------------------------------"
    echo "  Status: sudo systemctl status mongod"
    echo "  Connect: mongosh"
    echo "  View logs: sudo tail -f /var/log/mongodb/mongod.log"
    echo ""
    print_info "Important: Ensure ResVault extension is configured correctly"
    echo "  GraphQL URL: $GRAPHQL_URI"
    echo ""
    print_info "For troubleshooting, see DEPLOYMENT.md"
    echo ""
}

# Run main function
main
