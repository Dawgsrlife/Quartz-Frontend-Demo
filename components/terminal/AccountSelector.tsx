"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChevronDown, Wallet, AlertCircle, Check } from "lucide-react";
import { useAccountStore } from "@/lib/store";
import { useAuthStore } from "@/lib/authStore";
import { apiFetch } from "@/lib/apiClient";

interface Account {
    account_id: string;
    account_type: 'DEMO' | 'LIVE';
    alias?: string;
    balance: number;
}

export function AccountSelector() {
    const [isOpen, setIsOpen] = useState(false);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const [status, setStatus] = useState<'loading' | 'connected' | 'offline'>('loading');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { setAccountData } = useAccountStore();
    const { user } = useAuthStore();

    const fetchAccounts = useCallback(async () => {
        setStatus('loading');
        try {
            // Include our mock demo account that links to our user
            const localDemoAccount: Account = {
                account_id: 'DEMO-LOCAL',
                account_type: 'DEMO',
                alias: user?.name ? `Demo - ${user.name}` : 'Local Demo Account',
                balance: 100000
            };

            const data = await apiFetch<any>("/api/account/summary", {
                signal: AbortSignal.timeout(5000)
            });
            
            // Determine if demo or live based on account ID
            const accountType = data.account_id?.includes('DU') || 
                               data.account_id?.includes('DEMO') ||
                               data.account_id === 'OFFLINE' ? 'DEMO' : 'LIVE';
            
            const account: Account = {
                account_id: data.account_id || 'OFFLINE',
                account_type: accountType,
                alias: data.account_id?.includes('535206') ? 'LH-Competition' : undefined,
                balance: data.net_liquidation || 0
            };
            
            setAccounts([localDemoAccount, account]);
            setSelectedAccount(localDemoAccount); // Default to local demo account for safety and clarity
            setStatus('connected');
            
            // Update global store
            setAccountData({
                netLiquidity: data.net_liquidation || 100000,
                availableFunds: data.available_funds || 100000,
                buyingPower: data.buying_power || 400000,
                dailyPl: data.daily_pl || 0,
                positions: data.open_positions || []
            });
        } catch (error) {
            console.error('Account fetch error:', error);
            setStatus('offline');
            const localFallback: Account = {
                account_id: 'DEMO-LOCAL',
                account_type: 'DEMO',
                alias: user?.name ? `Demo - ${user.name}` : 'Local Demo Account',
                balance: 100000
            };
            setAccounts([localFallback]);
            setSelectedAccount(localFallback);
        }
    }, [setAccountData, user?.name]);

    useEffect(() => {
        fetchAccounts();
        const interval = setInterval(fetchAccounts, 30000);
        return () => clearInterval(interval);
    }, [fetchAccounts]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const formatBalance = (balance: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(balance);
    };

    const getAccountDisplay = () => {
        if (!selectedAccount) return 'Loading...';
        if (selectedAccount.account_id === 'OFFLINE') return 'Disconnected';
        
        // Extract last 6 digits
        const shortId = selectedAccount.account_id.slice(-6);
        return shortId;
    };

    return (
        <div ref={dropdownRef} className="relative no-drag">
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-primary)] hover:border-[var(--accent)]/30 transition-all cursor-pointer group"
            >
                {/* Account Type Badge */}
                <div className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                    selectedAccount?.account_type === 'LIVE' 
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                    {selectedAccount?.account_type || 'DEMO'}
                </div>
                
                {/* Account ID */}
                <span className="font-mono text-[11px] text-[var(--text-primary)] font-medium">
                    {getAccountDisplay()}
                </span>
                
                {/* Status indicator */}
                <div className={`w-1.5 h-1.5 rounded-full ${
                    status === 'connected' ? 'bg-emerald-500' : 
                    status === 'loading' ? 'bg-yellow-500 animate-pulse' : 
                    'bg-rose-500'
                }`} />
                
                <ChevronDown 
                    size={12} 
                    className={`text-[var(--text-muted)] transition-transform ${isOpen ? 'rotate-180' : ''}`} 
                />
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-lg shadow-2xl z-[200] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-semibold">
                            <Wallet size={12} />
                            Trading Account
                        </div>
                    </div>

                    {/* Account List */}
                    <div className="max-h-64 overflow-y-auto">
                        {accounts.length === 0 && status === 'loading' ? (
                            <div className="px-4 py-6 text-center">
                                <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                                <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                                    Connecting...
                                </span>
                            </div>
                        ) : status === 'offline' ? (
                            <div className="px-4 py-6 text-center">
                                <AlertCircle className="w-6 h-6 text-rose-500 mx-auto mb-2" />
                                <span className="text-[11px] text-[var(--text-muted)]">
                                    Unable to connect to IBKR
                                </span>
                                <button 
                                    onClick={fetchAccounts}
                                    className="mt-3 px-3 py-1 text-[10px] bg-[var(--accent)] text-black rounded font-semibold uppercase tracking-wider hover:opacity-90 cursor-pointer"
                                >
                                    Retry
                                </button>
                            </div>
                        ) : (
                            accounts.map((account) => (
                                <button
                                    key={account.account_id}
                                    onClick={() => {
                                        setSelectedAccount(account);
                                        setIsOpen(false);
                                    }}
                                    className="w-full px-4 py-3 flex items-start gap-3 hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer border-b border-[var(--border-subtle)] last:border-b-0"
                                >
                                    {/* Selection indicator */}
                                    <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                        selectedAccount?.account_id === account.account_id
                                            ? 'border-[var(--accent)] bg-[var(--accent)]'
                                            : 'border-[var(--border-subtle)]'
                                    }`}>
                                        {selectedAccount?.account_id === account.account_id && (
                                            <Check size={10} className="text-black" />
                                        )}
                                    </div>
                                    
                                    <div className="flex-1 text-left">
                                        <div className="flex items-center gap-2">
                                            {/* Type badge */}
                                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                                                account.account_type === 'LIVE'
                                                    ? 'bg-rose-500/20 text-rose-400'
                                                    : 'bg-emerald-500/20 text-emerald-400'
                                            }`}>
                                                {account.account_type}
                                            </span>
                                            {/* Alias or ID */}
                                            <span className="font-mono text-[11px] text-[var(--text-primary)] font-medium">
                                                {account.alias || account.account_id}
                                            </span>
                                        </div>
                                        <div className="mt-1 text-[10px] text-[var(--text-muted)]">
                                            Balance: <span className="text-[var(--text-primary)] font-mono">
                                                {formatBalance(account.balance)} USD
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>

                    {/* Footer - Sprint 2: Login */}
                    <div className="px-4 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
                        <button 
                            disabled
                            className="w-full px-3 py-2 text-[10px] text-[var(--text-muted)] border border-dashed border-[var(--border-subtle)] rounded-md uppercase tracking-wider opacity-50 cursor-not-allowed"
                        >
                            + Add Account (Coming Soon)
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
