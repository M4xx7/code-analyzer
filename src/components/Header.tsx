'use client';

import React from 'react';
import { Activity } from 'lucide-react';
export default function Header() {
    return (
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

                <div className="flex items-center gap-x-4">
                    <div className="flex items-center gap-x-3 group cursor-pointer">
                        <div
                            className="w-9 h-9 bg-white/[0.03] border border-white/10 rounded-xl flex items-center justify-center group-hover:border-white/20 transition-all duration-300">
                            <Activity className="w-5 h-5 text-zinc-400 group-hover:text-zinc-100 transition-colors"/>
                        </div>
                        <span className="text-lg font-medium tracking-tight text-zinc-100">CodePulse</span>
                    </div>

                </div>

                <nav className="hidden md:flex items-center gap-x-8 text-sm">
                    <a
                        href="/docs"
                        className="text-zinc-400 hover:text-zinc-100 transition-colors font-medium"
                    >
                        How it works?
                    </a>
                </nav>

            </div>
    );
}