# Usage

## Prerequisites

1. **Install ResVault Chrome Extension**

   - Follow the instructions [here](https://blog.resilientdb.com/2023/09/21/ResVault.html).
   - Ensure that the ResVault extension is connected to:
     ```
     76.158.247.201:8070
     ```
     _(You may substitute this URI with your own GraphQL server URI if needed.)_

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
     MONGODB_URI=mongodb://quiet98k:Alsnqtdsswksy1!@76.158.247.201:27017/
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
