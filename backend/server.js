import express from "express";
import bodyParser from "body-parser";
import session from 'express-session';
import cors from "cors";
import dotenv from "dotenv";
import transactionRoutes from "./routes/transactionRoutes.js";
import transactionRoutesReport from "./routes/transactionRoutesReport.js";
import transactionRead from "./routes/transactionRoutesRead.js";
import transactionRoutesUpdate from "./routes/transactionRoutesUpdate.js";
import transactionRoutesDelete from "./routes/transactionRoutesDelete.js";
import sync from "./utils/sync.js";
import connectMongo from "./config/mongodb.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 8099;
const host = process.env.HOST || "0.0.0.0";

const mongoURI = process.env.MONGODB_URI; // Replace with your MongoDB URI
const mongoDbName = process.env.MONGODB_DB_NAME;

if (!mongoURI) {
  throw new Error("MONGODB_URI is not defined");
}

const initializeMongo = async () => {
  try {
    const connection = await connectMongo({ uri: mongoURI, dbName: mongoDbName });
    connection.on(
      "error",
      console.error.bind(console, "MongoDB connection error:")
    );
    connection.once("open", () => {
      console.log("MongoDB connected");
    });
    app.locals.db = connection;
  } catch (error) {
    console.error("Failed to initialize MongoDB connection:", error);
    process.exit(1);
  }
};

await initializeMongo();

app.use(cors());

app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup session middleware
const sessionSecret =
  process.env.SESSION_SECRET ||
  "sl023iknga7lskdjge2twedta1b2c3d4e5f6g7h8i9j0";

app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set to true if using HTTPS
  })
);
// Initialize ResilientDB to MongoDB synchronization (skip when disabled)
if (process.env.ENABLE_RESILIENT_SYNC === "true") {
  (async () => {
    try {
      await sync.initialize();
      console.log("Synchronization initialized.");
    } catch (error) {
      console.error("Error during sync initialization:", error);
    }
  })();
} else {
  console.log("ResilientDB synchronization disabled for this environment.");
}


// Direct Test Routes without any prefix
app.get("/test", (req, res) => {
  console.log("GET /test route hit");
  res.send("Test route working");
});

app.post("/test", (req, res) => {
  console.log("POST /test route hit");
  res.json({ message: "Test route working" });
});

app.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}`);
});

app.use("/api/transactions", transactionRoutes);
app.use("/api/reports", transactionRoutesReport);
app.use("/api/read", transactionRead);
app.use("/api/updateTransactions", transactionRoutesUpdate);
app.use("/api/deleteTransactions", transactionRoutesDelete);
