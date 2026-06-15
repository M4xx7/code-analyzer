'use client';

import React from 'react';
import Header from '@/components/Header';
import RepoInputForm from '@/components/RepoInputForm';
import AnalysisDashboard from '@/components/AnalysisDashboard';
import {useAnalysis} from '@/hooks/useAnalysis';
import Hero from "@/components/Hero";
import ErrorMessage from "@/components/ErrorMessage";

export default function Home() {

    const {analysis, loading, error, analyzeRepo} = useAnalysis();

    return (
        <div className="min-h-screen bg-black text-zinc-50 relative overflow-hidden">
            <div
                className="absolute top-[15vh] rounded-full pointer-events-none"/>

            <Header/>

            <main className="max-w-6xl mx-auto px-6 py-20 relative z-10">

                <Hero/>

                <div className="max-w-3xl mx-auto">
                    <RepoInputForm onAnalyze={analyzeRepo} loading={loading}/>

                    {error && (
                        <ErrorMessage message={error}/>
                    )}
                </div>

                {analysis && !error && (
                    <div className="mt-24">

                        <div className="flex justify-center mb-10 pb-6 border-b border-zinc-700">
                            <h3 className="text-2xl">
                                {analysis.repository.owner} / {analysis.repository.repoName}
                            </h3>
                        </div>
                        <AnalysisDashboard analysis={analysis}/>
                    </div>
                )}
            </main>
        </div>
    );
}