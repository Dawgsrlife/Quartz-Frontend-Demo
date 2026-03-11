import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AccountProvider } from "@/components/providers/AccountProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { AppShell } from "@/components/layout/AppShell";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
    subsets: ["latin"],
    variable: "--font-jetbrains-mono",
});

const spaceGrotesk = Space_Grotesk({
    subsets: ["latin"],
    variable: "--font-space-grotesk",
});

export const metadata = {
    title: "Quartz - Institutional Trading Lab",
    description: "Advanced options & futures trading platform.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable}`}>
            <body className="font-sans bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased selection:bg-rose-500/20 selection:text-rose-200">
                <ThemeProvider>
                    <AccountProvider>
                        <AuthProvider>
                            <AppShell>
                                {children}
                            </AppShell>
                        </AuthProvider>
                    </AccountProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
