'use client';

import React from 'react';
import {MetricType} from "@/lib/types";

interface MetricCardProps {
    metricName: string;
    score: number;
    description: string;
    metricType: MetricType;
    children?: React.ReactNode;
}

export default function MetricCard({
                                       metricName,
                                       score,
                                       description,
                                       children,
                                   }: MetricCardProps) {
    return (
        <div
            className="group relative bg-white/[0.02] border border-white/10 rounded-2xl p-6 hover:bg-white/[0.04] transition-all duration-300">
            <div
                className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"/>

            <div className="flex justify-between items-start mb-8">
                <div>
                    <h3 className="text-lg font-medium text-zinc-200">{metricName}</h3>
                </div>

                <div
                    className={`text-4xl text-purple-500 font-light tracking-tighter tabular-nums`}>
                    {score}
                </div>
            </div>

            <p className=" text-zinc-400 leading-relaxed mb-6">
                {description}
            </p>
            {children}
        </div>
    );
}