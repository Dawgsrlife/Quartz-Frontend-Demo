"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>("dark");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Check localStorage or system preference
        const savedTheme = localStorage.getItem("quartz-theme") as Theme;
        if (savedTheme) {
            setTheme(savedTheme);
        } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            setTheme("dark");
        }
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(theme);
        
        localStorage.setItem("quartz-theme", theme);
    }, [theme, mounted]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "light" ? "dark" : "light"));
    };

    // Prevent hydration mismatch by returning null until mounted
    // Or render children to avoid layout shift, but theme might be wrong for a split second
    // We must render the Provider even if not mounted, otherwise useTheme() hook fails in children during SSR/First Render.
    // If we are not mounted, we just use default theme (dark) to avoid errors, 
    // but we accept that there might be a flash if client prefers light.
    // Next.js 'suppressHydrationWarning' on the html tag helps, but here we just need Context to exist.

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            <script
                dangerouslySetInnerHTML={{
                    __html: `
                        (function() {
                            try {
                                var theme = localStorage.getItem('quartz-theme');
                                var supportDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches === true;
                                if (!theme && supportDarkMode) theme = 'dark';
                                if (!theme) theme = 'light';
                                document.documentElement.classList.add(theme);
                            } catch (e) {}
                        })();
                    `,
                }}
            />
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
