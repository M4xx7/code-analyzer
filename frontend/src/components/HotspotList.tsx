import React from 'react';

interface HotspotListProps {
    issues: any[];
    renderItem: (issue: any, index: number) => React.ReactNode;
}

export default function HotspotList({ issues, renderItem }: HotspotListProps) {
    if (!issues || issues.length === 0) return null;

    return (
        <div className="pt-4 border-t border-white/5">
            <div className="text-[14px] text-center text-zinc-500 mb-3 tracking-wider">
                Hotspots ({issues.length})
            </div>
            <div className="space-y-2">
                {issues.slice(0, 10).map((issue, i) => renderItem(issue, i))}
            </div>
        </div>
    );
}