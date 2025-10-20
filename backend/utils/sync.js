import { WebSocketMongoSync } from 'resilient-node-cache';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

const mongoConfig = {
    uri: process.env.MONGODB_URI,
    dbName: process.env.MONGODB_DB_NAME,
    collectionName: 'res_cache',
};

// Extract host and port from CROW_SERVER_URI
const crowServerUri = process.env.CROW_SERVER_URI || 'http://localhost:18000/v1/transactions';
const crowUrl = new URL(crowServerUri);
const resilientBaseUrl = `resilientdb://${crowUrl.hostname}:${crowUrl.port}`;

const resilientDBConfig = {
    baseUrl: resilientBaseUrl,
    httpSecure: crowUrl.protocol === 'https:',
    wsSecure: crowUrl.protocol === 'https:',
  };
  
  const sync = new WebSocketMongoSync(mongoConfig, resilientDBConfig);
  
  sync.on('connected', () => {
    console.log('WebSocket connected.');
  });
  
  sync.on('data', (newBlocks) => {
    console.log('Received new blocks:', newBlocks);
  });
  
  sync.on('error', (error) => {
    console.error('Error:', error);
  });
  
  sync.on('closed', () => {
    console.log('Connection closed.');
  });


export default sync;
