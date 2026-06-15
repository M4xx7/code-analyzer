'use client';

import { useState } from 'react';
import { AnalysisResponse } from '@/lib/types';

const API_URL = 'http://localhost:3001/api/analyze';

export function useAnalysis() {
    const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const analyzeRepo = async (repoInput: string) => {
        const trimmed = repoInput.trim();
        if (!trimmed) return;

        setLoading(true);
        setError(null);
        setAnalysis(null);

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ repo: trimmed }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
            }

            const data: AnalysisResponse = await response.json();
            setAnalysis(data);
        } catch (err) {
            console.error('Analysis failed:', err);
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to analyze repository. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setAnalysis(null);
        setError(null);
    };

    return {
        analysis,
        loading,
        error,
        analyzeRepo,
        reset,
    };
}