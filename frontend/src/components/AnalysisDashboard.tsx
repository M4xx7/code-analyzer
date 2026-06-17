'use client';

import React from 'react';
import MetricCard from '@/components/MetricCard';
import {AnalysisResponse} from '@/lib/types';
import ProgressBar from "@/components/ProgressBar";
import HotspotItem from "@/components/HotspotItem";
import HotspotList from "@/components/HotspotList";

interface AnalysisDashboardProps {
    analysis: AnalysisResponse;
}

export default function AnalysisDashboard({analysis}: AnalysisDashboardProps) {
    const {metrics} = analysis;
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <MetricCard
                metricName={metrics.duplication.metricName}
                score={metrics.duplication.score}
                description={metrics.duplication.description}
                metricType="duplication"
            />

            <MetricCard
                metricName={metrics.typeSafety.metricName}
                score={metrics.typeSafety.score}
                description={metrics.typeSafety.description}
                metricType="typeSafety"
            >
                <ProgressBar score={metrics.typeSafety.score}></ProgressBar>
            </MetricCard>


            <MetricCard
                metricName={metrics.complexity.metricName}
                score={metrics.complexity.score}
                description={metrics.complexity.description}
                metricType="complexity"
            >
                    <HotspotList
                        issues={metrics.complexity.issuesFound}
                        renderItem={(issue, i) => (
                            <HotspotItem
                                key={i}
                                title={issue.file}
                                subtitle={issue.functionName}
                                values={[issue.complexity, issue.nesting]}
                            />
                        )}
                    />
                
            </MetricCard>

            <MetricCard
                metricName={metrics.coupling.metricName}
                score={metrics.coupling.score}
                description={metrics.coupling.description}
                metricType="coupling"
            >
                <HotspotList
                    issues={metrics.coupling.issuesFound}
                    renderItem={(issue, i) => (
                        <HotspotItem
                            key={i}
                            title={issue.file}
                            values={[issue.uniqueDependencies]}
                        />
                    )}
                />

            </MetricCard>
        </div>
    );
}