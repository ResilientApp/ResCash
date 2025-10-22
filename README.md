# Introduction

## Solution
In our increasingly digital world, managing finances effectively is critical for both individuals and businesses. ResCash addresses this challenge with a cutting-edge accounting application that is secure, efficient, and intuitive. Designed with individual users and freelancers in mind, ResCash leverages advanced technology to streamline transaction handling, budgeting, and financial reporting. It redefines the way financial management is approached by combining distributed accounting principles, ResilientDB integration, and secure transaction management for a seamless user experience.

## Technology
ResCash is built on a modern and robust tech stack, ensuring scalability, reliability, and ease of use:

- **Frontend with React**: A responsive and seamless user interface, delivering smooth interactions and intuitive navigation.
- **Backend with Node.js**: A high-performance environment for efficient API handling and business logic implementation.
- **Database Integration**:
   1. **ResilientDB**: A distributed database that provides top-notch security and reliability for critical financial data.
   2. **MongoDB**: A secondary database optimized for advanced features like sorting, filtering, and quick data indexing.
- **Authentication via ResVault**: Ensures secure and controlled access to sensitive data, enhancing user trust.
- **Data Visualization**: Interactive charts and dashboards make complex financial metrics, such as cash flow and net worth trends, easy to understand and actionable.
# Usage

## Prerequisites

- **Node.js 20.18.0** – run `nvm use` (see `.nvmrc`) or install manually.
- **Docker & Docker Compose** – required for containerised runs and deployment parity.
- (Optional) **ResVault Chrome Extension** – only required when ResVault-based login is enabled.

## Environment Configuration

Copy the provided example files and fill in environment-specific values:

```sh
cp backend/.env.example backend/.env
cp resCash/.env.example resCash/.env.local
```

Key variables:

- `MONGODB_URI`, `MONGODB_DB_NAME` – database connection.
- `GRAPHQL_URI`, `CROW_SERVER_URI` – ResilientDB endpoints (leave disabled when running purely offline).
- `SESSION_SECRET`, `JWT_SECRET` – secrets that **must** be rotated for non-development environments.
- `REACT_APP_API_BASE_URL` – points the frontend to the deployed backend.
- `REACT_APP_ENABLE_DEV_LOGIN` – set to `true` to bypass ResVault when testing locally.

## Local Development (Node)

```sh
# Backend
cd backend
npm install
npm start

# Frontend (in a second terminal)
cd resCash
npm install
npm start
```

The frontend is exposed at `http://localhost:3000` and calls the backend using the value from `REACT_APP_API_BASE_URL`.  
The backend publishes a `/test` health route on `http://localhost:8099/test`.

## Local Development (Docker Compose)

```sh
docker compose up --build
```

This starts:

- `mongo` – MongoDB 6.0 with a persistent `mongo-data` volume.
- `backend` – Node.js API container (built from `backend/Dockerfile`).

Adjust `backend/.env` when running in Docker so that `MONGODB_URI=mongodb://mongo:27017`.

## Deployment Checklist

- [x] Backend dockerised (`backend/Dockerfile`) and third-party dependencies modelled in `docker-compose.yml`.
- [x] `.env.example` files provided for frontend and backend.
- [x] Backend/server values (port, host, secrets) sourced from environment variables.
- [x] Frontend fetches all API endpoints via `REACT_APP_API_BASE_URL`.
- [x] Health endpoint available at `/test`.

For ExpoLab deployments:

1. Build and push the Docker image produced by `backend/Dockerfile`.
2. Configure secrets in the target environment using the keys described above.
3. Deploy the frontend via Vercel or GitHub Pages, pointing `REACT_APP_API_BASE_URL` to the backend domain.
4. Provision a Cloudflare subdomain and route it to the backend container through Nginx (see lab guide).
