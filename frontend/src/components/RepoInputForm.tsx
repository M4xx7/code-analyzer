'use client';

import React, {useState} from 'react';

interface RepoInputFormProps {
    onAnalyze: (repoInput: string) => void;
    loading: boolean;
}

export default function RepoInputForm({onAnalyze, loading}: RepoInputFormProps) {
    const [repoInput, setRepoInput] = useState('sindresorhus/ky');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = repoInput.trim();
        if (trimmed) {
            onAnalyze(trimmed);
        }
    };

    return (
        <div
            className="bg-zinc-900 rounded-3xl border border-zinc-600 p-8"
        >

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-center text-[14px] font-medium text-zinc-400 mb-2 tracking-widest">
                        GitHub Repository
                    </label>

                    <input
                        type="text"
                        value={repoInput}
                        onChange={(e) => setRepoInput(e.target.value)}
                        onFocus={(e) => e.target.select()}
                        placeholder="https://github.com/username/repository"
                        className="w-full bg-zinc-950 border border-zinc-700 focus:border-violet-500
                                   rounded-3xl px-6 py-3 text-lg outline-none transition-all
                                   font-mono placeholder:text-zinc-500"
                        required={true}
                        disabled={loading}
                    />

                </div>


                <div className="flex justify-center items-center">
                    <button
                        type="submit"
                        disabled={loading || !repoInput.trim()}
                        className="bg-white enabled:hover:bg-violet-500 enabled:hover:text-white cursor-pointer
               text-zinc-950 font-semibold px-5 py-3 rounded-3xl text-lg
               flex items-center justify-center gap-x-3 transition-all
               disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <span
                                    className="animate-spin inline-block w-5 h-5 border-2 border-zinc-950 border-t-transparent rounded-full"/>
                                Analyzing...
                            </>
                        ) : (
                            'Analyze Repository'
                        )}
                    </button>
                </div>
            </form>
        </div>

    );
}