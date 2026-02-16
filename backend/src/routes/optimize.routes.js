import express from 'express';
import { calculateStress } from '../engine/stressScore.js';
import { optimize } from '../engine/optimizer.js';

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const inputs = req.body; // Assume already normalized by frontend or add normalization here if needed

        // 1. Calculate base state
        const stressData = calculateStress(inputs);

        // 2. Generate recommendations
        const recommendations = await optimize(inputs, stressData);

        // 3. Calculate totals
        const totalSavings = recommendations.reduce((acc, curr) => acc + (curr.potentialSavings || 0), 0);

        res.json({
            base: stressData,
            recommendations,
            totalSavings
        });
    } catch (error) {
        console.error("Optimization error:", error);
        res.status(500).json({ error: "Failed to generate optimizations" });
    }
});

export const optimizeRouter = router;
