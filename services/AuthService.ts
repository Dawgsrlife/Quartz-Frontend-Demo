/**
 * AuthService — MOCK VERSION for frontend demo.
 *
 * No backend calls. Accepts any credentials instantly.
 * All data is simulated.
 */

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

export interface SignupRequest {
    email: string;
    password: string;
    username?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthTokens {
    access_token: string;
    refresh_token: string | null;
    token_type: string;
}

export interface UserProfile {
    id: string;
    email: string;
    name: string;
    created_at: string;
}

/* ------------------------------------------------------------------ */
/*  Token Management (client-side)                                    */
/* ------------------------------------------------------------------ */

const TOKEN_KEY = "quartz_access_token";
const REFRESH_TOKEN_KEY = "quartz_refresh_token";

function storeToken(token: string): void {
    if (typeof window !== "undefined") {
        localStorage.setItem(TOKEN_KEY, token);
    }
}

function storeRefreshToken(token: string): void {
    if (typeof window !== "undefined") {
        localStorage.setItem(REFRESH_TOKEN_KEY, token);
    }
}

function clearToken(): void {
    if (typeof window !== "undefined") {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
}

function getStoredToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
}

/* ------------------------------------------------------------------ */
/*  Mock Helpers                                                      */
/* ------------------------------------------------------------------ */

const MOCK_TOKEN = "mock-demo-token-quartz-2026";

function mockTokens(): AuthTokens {
    return {
        access_token: MOCK_TOKEN,
        refresh_token: "mock-refresh-token",
        token_type: "bearer",
    };
}

/* ------------------------------------------------------------------ */
/*  Service (MOCK)                                                    */
/* ------------------------------------------------------------------ */

export const AuthService = {
    /** Mock signup — accepts anything instantly */
    async signup(data: SignupRequest): Promise<AuthTokens> {
        const tokens = mockTokens();
        storeToken(tokens.access_token);
        if (tokens.refresh_token) storeRefreshToken(tokens.refresh_token);
        return tokens;
    },

    /** Mock login — accepts anything instantly */
    async login(data: LoginRequest): Promise<AuthTokens> {
        const tokens = mockTokens();
        storeToken(tokens.access_token);
        if (tokens.refresh_token) storeRefreshToken(tokens.refresh_token);
        return tokens;
    },

    /** No-op refresh (always succeeds) */
    async tryRefresh(): Promise<boolean> {
        return true;
    },

    /** Log out — clears client-side tokens */
    async logout(): Promise<void> {
        clearToken();
    },

    /** Mock profile */
    async getProfile(): Promise<UserProfile> {
        return {
            id: "demo-user",
            email: "demo@quartz.io",
            name: "Demo Operator",
            created_at: new Date().toISOString(),
        };
    },

    /** Check if user has a valid stored token */
    isAuthenticated(): boolean {
        return !!getStoredToken();
    },

    /** Get stored access token */
    getToken(): string | null {
        return getStoredToken();
    },
};