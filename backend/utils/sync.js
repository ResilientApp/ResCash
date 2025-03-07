import { WebSocketMongoSync } from 'resilient-node-cache';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

const mongoConfig = {
    uri: process.env.MONGODB_URI,
    dbName: process.env.MONGODB_DB_NAME,
    collectionName: 'res_cache',
};

const resilientDBConfig = {
    baseUrl: 'resilientdb://35.193.4.170:18000',
    httpSecure: false,
    wsSecure: false,
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
