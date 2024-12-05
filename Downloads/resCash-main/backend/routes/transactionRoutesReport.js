import express from "express";
import {
  getCategorySummary,
  getAllSummary,
  getExpenseSummary,
  getIncomeSummary,
} from "../services/summaryController.js";

const router = express.Router();

// Endpoint for category summary
router.get("/categorySummary", async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1]; // Extract the token from the Authorization header
    const summary = await getCategorySummary(token);
    res.json(summary);
  } catch (error) {
    console.error("Error fetching category summary:", error);
    res.status(500).json({ message: "Error fetching category summary", error });
  }
});

// Endpoint for summary (all summary)
router.get("/summary", async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1]; // Extract the token from the Authorization header
    const summary = await getAllSummary(token);
    res.json(summary);
  } catch (error) {
    console.error("Error fetching summary:", error);
    res.status(500).json({ message: "Error fetching summary", error });
  }
});

// Endpoint for expense summary
router.get("/expenseSummary", async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1]; // Extract the token from the Authorization header
    const summary = await getExpenseSummary(token);
    res.json(summary);
  } catch (error) {
    console.error("Error fetching expense summary:", error);
    res.status(500).json({ message: "Error fetching expense summary", error });
  }
});

// Endpoint for income summary
router.get("/incomeSummary", async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1]; // Extract the token from the Authorization header
    const summary = await getIncomeSummary(token);
    res.json(summary);
  } catch (error) {
    console.error("Error fetching income summary:", error);
    res.status(500).json({ message: "Error fetching income summary", error });
  }
});

export default router;
