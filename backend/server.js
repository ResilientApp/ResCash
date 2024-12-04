import express from "express";
import bodyParser from "body-parser";
import session from 'express-session';
import cors from "cors";
import dotenv from "dotenv";
import db from "./config/mongodb.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import transactionRoutesReport from "./routes/transactionRoutesReport.js";
import transactionRead from "./routes/transactionRoutesRead.js";
import transactionRoutesUpdate from "./routes/transactionRoutesUpdate.js";
import sync from './utils/sync.js';
import mongoose from "mongoose"; // Or MongoDB's native driver

dotenv.config();

const app = express();
const port = 8099;

const mongoURI = process.env.MONGODB_URI; // Replace with your MongoDB URI
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

const db_connect = mongoose.connection;
db_connect.on("error", console.error.bind(console, "MongoDB connection error:"));
db_connect.once("open", () => {
  console.log("MongoDB connected");
  app.locals.db = db_connect; // Assign db to app.locals for global access
});

app.use(cors());

app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup session middleware
app.use(
  session({
    secret: "sl023iknga7lskdjge2twedta1b2c3d4e5f6g7h8i9j0",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set to true if using HTTPS
  })
);
// Initialize ResilientDB to MongoDB synchronization
(async () => {
    try {
        await sync.initialize();
        console.log('Synchronization initialized.');
    } catch (error) {
        console.error('Error during sync initialization:', error);
    }
})();


// Direct Test Routes without any prefix
app.get("/test", (req, res) => {
  console.log("GET /test route hit");
  res.send("Test route working");
});

app.post("/test", (req, res) => {
  console.log("POST /test route hit");
  res.json({ message: "Test route working" });
});

db.once("open", () => {
  console.log("MongoDB connection established");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

app.use("/api/transactions", transactionRoutes);
app.use("/api/reports", transactionRoutesReport);
app.use("/api/read", transactionRead);
app.use("/api/transactions", transactionRoutesUpdate);