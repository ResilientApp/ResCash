const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 8099;

app.use(bodyParser.json());
app.use(cors());

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

app.post('/api/saveTransaction', async (req, res) => {
  try {
    await client.connect();
    const database = client.db('resilientDB'); // Ensure this matches your database name
    const collection = database.collection('transactions');

    const transactionData = req.body;
    const result = await collection.insertOne(transactionData);

    res.status(200).json({ success: true, message: 'Transaction saved successfully!', result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
});

app.get('/api/transactions', async (req, res) => {
  try {
    await client.connect();
    const database = client.db('resilientDB'); // Ensure this matches your database name
    const collection = database.collection('transactions');

    const transactions = await collection.find({}).toArray();
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});