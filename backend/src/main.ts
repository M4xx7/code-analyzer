'use client';

import express from 'express';
import { RepoService } from './modules/repository/repo.service';
import { AnalysisService } from './modules/analysis/analysis.service';
import cors from 'cors';

const app = express();

app.use(express.json());
app.use(cors());


const repoService = new RepoService();
const analysisService = new AnalysisService(repoService);

app.post('/api/analyze', async (req, res) => {
    const repoInput = req.body.repo as string;

    if (!repoInput?.trim()) {
        return res.status(400).json({
            error: 'Missing "repo" field. Please send a GitHub URL or owner/repo'
        });
    }

    try {
        console.log(`Starting analysis for: ${repoInput.trim()}`);

        const report = await analysisService.analyze(repoInput.trim());

        res.json(report);
    } catch (error: any) {
        console.error('Analysis error:', error);
        res.status(500).json({
            error: error.message || 'Analysis failed'
        });
    }
});



const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Code Quality Analyzer running on http://localhost:${PORT}`);
});