import React from 'react';

interface HotspotItemProps {
    title: string;
    subtitle?: string;
    values: (number | string)[];
}

export default function HotspotItem({title, subtitle, values}: HotspotItemProps) {
    return (
        <div className="bg-black/50 border border-white/5 rounded-lg px-3 py-2 flex justify-between items-center group">
            <div className="min-w-0 pr-4">
                <div className="font-mono text-zinc-300 truncate">{title}</div>
                {subtitle && (
                    <div className="text-[13px] text-zinc-500 mt-0.5 truncate">{subtitle}</div>
                )}
            </div>

            <div className="flex items-center gap-3 shrink-0">
                {values.map((val, index) => (
                    <React.Fragment key={index}>
                        <div className="text-right flex items-center gap-1.5">
                            <span className="text-pink-400 font-mono">{val}</span>
                        </div>

                        {index < values.length - 1 && (
                            <div className="w-px h-3 bg-white/10"/>
                        )}
                    </React.Fragment>
                ))}
            </div>

        </div>
    );
}