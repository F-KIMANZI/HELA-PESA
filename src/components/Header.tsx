import React from 'react';
import { Eye, EyeOff, RefreshCw, Moon, Sun, Plus } from 'lucide-react';

interface HeaderProps {
  activeTab: 'overview' | 'payments' | 'chamas' | 'analytics' | 'ussd';
  setActiveTab: (tab: 'overview' | 'payments' | 'chamas' | 'analytics' | 'ussd') => void;
  hideBalances: boolean;
  onRequestBiometricUnlock: () => void;
  onLockBalances: () => void;
  isSyncing: boolean;
  onRefreshAll: () => void;
  onOpenLinkModal: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  hideBalances,
  onRequestBiometricUnlock,
  onLockBalances,
  isSyncing,
  onRefreshAll,
  onOpenLinkModal,
  darkMode,
  setDarkMode,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 md:gap-8 h-16">
          {/* Zone 1: Single text wordmark brand */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('overview')}
              className="text-left group flex items-center gap-2.5 focus:outline-none"
              aria-label="HelaOne Kenya Home"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                H
              </div>
              <div className="flex items-baseline">
                <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
                  HelaOne
                </span>
                <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold ml-1.5 hidden sm:inline">
                  Kenya
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation links */}
          <nav
            className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300"
            aria-label="Main Navigation"
          >
            <button
              onClick={() => setActiveTab('overview')}
              className={`whitespace-nowrap transition-colors py-1 ${
                activeTab === 'overview'
                  ? 'text-emerald-700 dark:text-emerald-400 font-semibold border-b-2 border-emerald-600'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Accounts & Wallets
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`whitespace-nowrap transition-colors py-1 ${
                activeTab === 'payments'
                  ? 'text-emerald-700 dark:text-emerald-400 font-semibold border-b-2 border-emerald-600'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Universal Pay & Transfer
            </button>
            <button
              onClick={() => setActiveTab('chamas')}
              className={`whitespace-nowrap transition-colors py-1 ${
                activeTab === 'chamas'
                  ? 'text-emerald-700 dark:text-emerald-400 font-semibold border-b-2 border-emerald-600'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Chamas & Groups
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`whitespace-nowrap transition-colors py-1 ${
                activeTab === 'analytics'
                  ? 'text-emerald-700 dark:text-emerald-400 font-semibold border-b-2 border-emerald-600'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Consolidated Cashflow
            </button>
            <button
              onClick={() => setActiveTab('ussd')}
              className={`whitespace-nowrap transition-colors py-1 ${
                activeTab === 'ussd'
                  ? 'text-emerald-700 dark:text-emerald-400 font-semibold border-b-2 border-emerald-600'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Offline USSD
            </button>
          </nav>

          {/* Zone 3: Actions & Quick Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Biometric Shield / Balance Masking Toggle */}
            <button
              onClick={hideBalances ? onRequestBiometricUnlock : onLockBalances}
              title={hideBalances ? 'Authenticate via Biometrics to Reveal Balances' : 'Lock Balances (Biometric Protection)'}
              aria-label={hideBalances ? 'Authenticate to reveal balances' : 'Lock balances'}
              className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                hideBalances
                  ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100'
                  : 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100'
              }`}
            >
              {hideBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span className="text-xs font-semibold hidden lg:inline">
                {hideBalances ? 'Locked' : 'Unlocked'}
              </span>
            </button>

            {/* Refresh Sync */}
            <button
              onClick={onRefreshAll}
              title="Sync Balances Across All Banks"
              aria-label="Sync all accounts"
              className={`p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                isSyncing ? 'animate-spin text-emerald-600' : ''
              }`}
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Dark mode toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              title="Toggle Theme"
              aria-label="Toggle dark mode"
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Primary Action Button */}
            <button
              onClick={onOpenLinkModal}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition-all whitespace-nowrap active:scale-[0.98]"
              aria-label="Link another bank or SACCO"
            >
              <Plus className="w-4 h-4" />
              <span>Link Account</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
