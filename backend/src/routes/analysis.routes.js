import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { runFullAnalysis } from '../services/analysis.service.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const analysisRouter = express.Router();

analysisRouter.post('/', async (req, res) => {

  try {
    const result = await runFullAnalysis(req.body);
    res.json(result);
  } catch (error) {

    if (error.message.startsWith("Field")) {
      // Validation error
      return res.status(400).json({ error: error.message });
    }
    console.error("Analysis Error:", error);
    res.status(500).json({ error: "Failed to run analysis" });
  }
});
