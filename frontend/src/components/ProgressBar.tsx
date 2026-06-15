import React from 'react';

interface ProgressBarProps {
    score: number;
}

export default function ProgressBar({ score }: ProgressBarProps) {
    return (
        <div className="mt-auto pt-4">
            <div className="h-1.5 bg-black/50 rounded-full overflow-hidden border border-white/5">
                <div
                    className="h-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${score}%` }}
                />
            </div>
        </div>
    );
}