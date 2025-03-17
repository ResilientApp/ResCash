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

1. **Install ResVault Chrome Extension**

   - Follow the instructions [here](https://blog.resilientdb.com/2023/09/21/ResVault.html).
   - Ensure that the ResVault extension is connected to:
     ```
     [76.158.247.201:8070](http://35.193.4.170:8000/)
     ```
     _(You may substitute this URI with your own GraphQL server URI if needed.)_
     _(If you would like to set up your own GraphQL server, make sure it is running on all address (0.0.0.0))_

2. **Install Node.js and npm**
   - Refer to the [official guide](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).
   - Confirm installation by running:
     ```sh
     npm -v
     ```

## Setting Up ResCash

1. **Clone the ResCash Repository**

   ```sh
   git clone https://github.com/quiet98k/resCash
   ```

2. **Navigate to the Root Directory**

   ```sh
   cd resCash
   ```

3. **Set Up the Frontend**

   - Navigate to the frontend directory (same name as the root directory):
     ```sh
     cd resCash
     ```
   - Install dependencies:
     ```sh
     npm install
     ```
   - Start the frontend server:
     ```sh
     npm start
     ```

4. **Set Up the Backend**

   - Open a new terminal and return to the root directory:
     ```sh
     cd resCash
     ```
   - Navigate to the backend directory:
     ```sh
     cd backend
     ```
   - Create a `.env` file with the following configuration:
     ```
     MONGODB_URI=mongodb://76.158.247.201:27017/
     MONGODB_DB_NAME=resilientDB
     GRAPHQL_URI=http://76.158.247.201:8070/graphql
     CROW_SERVER_URI=http://76.158.247.201:18000/v1/transactions
     ```
     - **MONGODB_URI**: MongoDB connection URI (customizable).
     - **MONGODB_DB_NAME**: Database name.
     - **GRAPHQL_URI**: GraphQL server URI (include the `/graphql` suffix).
     - **CROW_SERVER_URI**: Crow server URI (must match the GraphQL URI).
   - Install backend dependencies:
     ```sh
     npm install
     ```
   - Start the backend server:
     ```sh
     npm start
     ```

5. **Access the Application**
   Open your browser and navigate to:
   ```
   http://localhost:3000/
   ```

## Notes

- Ensure all URIs are consistent between `.env` files and the ResVault extension.
- There are also some URL you need to change inside the application.
- Make sure update the URL of all the services used in this app to run it
