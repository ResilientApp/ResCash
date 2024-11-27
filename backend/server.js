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

dotenv.config();

const app = express();
const port = 8099;

app.use(cors());

app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set to true if using HTTPS
  })
);

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