import type {Metadata} from 'next';
import {Inter, Space_Grotesk} from 'next/font/google';
import './globals.css';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
    subsets: ['latin'],
    variable: '--font-space',
    display: 'swap',
    weight: ['500', '600', '700'],
});

export const metadata: Metadata = {
    title: 'CodePulse',
    description: 'Analyze GitHub repositories for complexity, duplication, and type safety',
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
        <body className="bg-zinc-950 text-zinc-100 antialiased">
        {children}
        </body>
        </html>
    );
}