'use client';

import express from 'express';
import { RepoService } from './modules/repository/repo.service';
import { AnalysisService } from './modules/analysis/analysis.service';
import cors from 'cors';
import { CloneError } from './errors/clone.error';
import { ValidationError } from './errors/validation.error';

const app = express();

app.use(express.json());
app.use(cors());


const repoService = new RepoService();
const analysisService = new AnalysisService(repoService);

app.post('/api/analyze', async (req, res) => {
    const repoInput = req.body.repo as string;

    if (!repoInput?.trim()) {
        return res.status(400).json({
            message: 'Missing "repo" field. Please send a GitHub URL or owner/repo'
        });
    }

    try {
        console.log(`Starting analysis for: ${repoInput.trim()}`);

        const report = await analysisService.analyze(repoInput.trim());

        res.json(report);
    } catch (error: any) {
        console.error('Analysis error:', error.message);

        if (error instanceof ValidationError){
            return res.status(400).json({
                message:error.message
            });
        }

        if (error instanceof CloneError) {
            return res.status(404).json({ 
                message: error.message 
            });
        }

        res.status(500).json({
            message: 'An unexpected internal server error occurred.'
        });
       
    }
});



const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Code Quality Analyzer running on http://localhost:${PORT}`);
});