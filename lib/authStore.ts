/**
 * authStore — MOCK VERSION for frontend demo.
 *
 * Pre-seeded with a mock token + user so the app starts logged in.
 * Login/signup accept any credentials instantly.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthService, UserProfile } from "@/services/AuthService";

export interface AuthState {
    token: string | null;
    refreshToken: string | null;
    user: UserProfile | null;
    isLoading: boolean;

    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, username?: string) => Promise<void>;
    logout: () => Promise<void>;
    setToken: (token: string | null) => void;
    setUser: (user: UserProfile | null) => void;
}

/* Default mock user — app starts logged in with this */
const MOCK_USER: UserProfile = {
    id: "demo-user",
    email: "demo@quartz.io",
    name: "Demo Operator",
    created_at: "2026-01-01T00:00:00Z",
};

const MOCK_TOKEN = "mock-demo-token-quartz-2026";

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            // ── Pre-seeded for auto-login ────────────────────────────────
            token: MOCK_TOKEN,
            refreshToken: "mock-refresh-token",
            user: MOCK_USER,
            isLoading: false,

            setToken: (token) => set({ token }),
            setUser: (user) => set({ user }),

            login: async (email, password) => {
                set({ isLoading: true });
                try {
                    const tokens = await AuthService.login({ email, password });
                    set({ token: tokens.access_token, refreshToken: tokens.refresh_token });

                    const fallbackProfile: UserProfile = {
                        id: "demo-user",
                        email,
                        name: email.split("@")[0],
                        created_at: new Date().toISOString(),
                    };
                    set({ user: fallbackProfile });
                } finally {
                    set({ isLoading: false });
                }
            },

            signup: async (email, password, username) => {
                set({ isLoading: true });
                try {
                    const tokens = await AuthService.signup({ email, password, username });
                    set({ token: tokens.access_token, refreshToken: tokens.refresh_token });

                    const fallbackProfile: UserProfile = {
                        id: "demo-user",
                        email,
                        name: username || email.split("@")[0],
                        created_at: new Date().toISOString(),
                    };
                    set({ user: fallbackProfile });
                } finally {
                    set({ isLoading: false });
                }
            },

            logout: async () => {
                await AuthService.logout();
                set({ token: null, refreshToken: null, user: null });
            },
        }),
        {
            name: "quartz-auth",
            partialize: (state) => ({
                token: state.token,
                refreshToken: state.refreshToken,
                user: state.user,
            }),
        }
    )
);
