# Configuration Templates

This folder contains example configuration files for ResCash.

## Files

- **backend.env.example** - Backend environment configuration template
- **frontend.env.example** - Frontend environment configuration template

## Usage

### For Backend Configuration

```bash
# Copy the example file
cp local/backend.env.example backend/.env

# Edit backend/.env with your settings
# Especially update:
# - GRAPHQL_URI
# - CROW_SERVER_URI
# - SESSION_SECRET (generate random)
# - JWT_SECRET (generate random)
```

### For Frontend Configuration

```bash
# Copy the example file
cp local/frontend.env.example resCash/.env.local

# Edit resCash/.env.local with your settings
# Especially update:
# - REACT_APP_API_BASE_URL (your backend URL)
```

## Important Notes

1. **Never commit actual .env files to Git** - They contain sensitive information
2. **Generate secure secrets** for production:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
3. **Update ResilientDB URLs** to match your deployment
4. **Disable dev login** in production (`ENABLE_DEV_LOGIN=false`)
