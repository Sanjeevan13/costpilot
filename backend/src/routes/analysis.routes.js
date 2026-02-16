import express from 'express';
import { runFullAnalysis } from '../services/analysis.service.js';

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
