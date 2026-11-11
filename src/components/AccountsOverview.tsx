import React, { useState } from 'react';
import { BankAccount, Transaction, formatKES, calculateAggregatedTotals } from '../utils/kenyaFintech';
import { AccountCard } from './AccountCard';
import {
  Wallet,
  ArrowLeftRight,
  Send,
  Zap,
  Receipt,
  Smartphone,
  HardDrive,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  Clock,
} from 'lucide-react';

interface AccountsOverviewProps {
  accounts: BankAccount[];
  transactions: Transaction[];
  hideBalances: boolean;
  onRequestBiometricUnlock?: () => void;
  onOpenPaymentModal: (mode?: 'self_transfer' | 'send_mobile' | 'paybill_till' | 'pesalink', prefill?: Partial<any>) => void;
  onOpenLinkModal: () => void;
  onViewReceipt: (tx: Transaction) => void;
  onRefreshAll: () => void;
  isSyncing: boolean;
}

export const AccountsOverview: React.FC<AccountsOverviewProps> = ({
  accounts,
  transactions,
  hideBalances,
  onRequestBiometricUnlock,
  onOpenPaymentModal,
  onOpenLinkModal,
  onViewReceipt,
  onRefreshAll,
  isSyncing,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'banks' | 'wallets' | 'saccos'>('all');
  const [txSearch, setTxSearch] = useState('');
  const [txCategory, setTxCategory] = useState<string>('all');

  const totals = calculateAggregatedTotals(accounts);

  const filteredAccounts = accounts.filter((acc) => {
    if (filterType === 'banks') return acc.type === 'checking' || acc.type === 'savings';
    if (filterType === 'wallets') return acc.type === 'mobile_wallet';
    if (filterType === 'saccos') return acc.type === 'sacco_shares';
    return true;
  });

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.recipientName.toLowerCase().includes(txSearch.toLowerCase()) ||
      tx.referenceCode.toLowerCase().includes(txSearch.toLowerCase()) ||
      tx.accountName.toLowerCase().includes(txSearch.toLowerCase());
    const matchesCategory = txCategory === 'all' || tx.category.toLowerCase() === txCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      {/* Top Banner: Storage & Aggregator Value Prop */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-emerald-900/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Unified Open Banking Hub · Central Bank of Kenya Standards</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
              All Your Kenya Accounts, One Single App
            </h1>
            <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
              No more switching between M-PESA, Equity, KCB, Co-op, and SACCO apps. Monitor consolidated balances, move money without double charges, and pay bills instantly.
            </p>

            {/* Storage metric */}
            <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-slate-800/80 text-xs text-slate-300">
              <div className="flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-emerald-400" />
                <span><strong className="text-white font-semibold">{accounts.length} Institutions</strong> Consolidated</span>
              </div>
              <span className="text-slate-600">·</span>
              <div className="flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Saved <strong className="text-white font-semibold">~680 MB</strong> phone storage</span>
              </div>
              <span className="text-slate-600">·</span>
              <div className="flex items-center gap-1.5 text-emerald-300">
                <CheckCircle2 className="w-4 h-4" />
                <span>Live Hakikisha & PesaLink connected</span>
              </div>
            </div>
          </div>

          {/* Quick CTA Actions */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <button
              onClick={() => onOpenPaymentModal('self_transfer')}
              className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>Move Between Accounts (Free)</span>
            </button>
            <button
              onClick={() => onOpenPaymentModal('send_mobile')}
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm flex items-center justify-center gap-2 border border-slate-700 transition-all active:scale-[0.98]"
            >
              <Send className="w-4 h-4" />
              <span>Universal Pay & Send</span>
            </button>
          </div>
        </div>
      </div>

      {/* Aggregate KPI Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Net Worth */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            <span>Aggregated Net Worth</span>
            <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          {hideBalances ? (
            <button
              onClick={onRequestBiometricUnlock}
              title="Authenticate with Biometrics to Reveal Net Worth"
              className="text-left group flex items-center gap-2 cursor-pointer focus:outline-none my-1"
            >
              <span className="text-2xl font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                ••••••••
              </span>
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded group-hover:bg-emerald-100 transition-colors">
                Scan to reveal
              </span>
            </button>
          ) : (
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
              {formatKES(totals.totalNetWorth)}
            </div>
          )}
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Across {accounts.length} active Kenyan services
          </div>
        </div>

        {/* Liquid Cash */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            <span>Liquid Cash (Wallets + Current)</span>
            <span className="text-emerald-700 dark:text-emerald-400 text-[11px] font-semibold">Immediate</span>
          </div>
          {hideBalances ? (
            <div className="text-2xl font-bold text-slate-400 dark:text-slate-500 tracking-wider my-1">
              ••••••••
            </div>
          ) : (
            <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
              {formatKES(totals.liquidCash)}
            </div>
          )}
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Available for daily shopping & transfers
          </div>
        </div>

        {/* Savings & SACCO Shares */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            <span>SACCO Shares & Deposits</span>
            <span className="text-blue-700 dark:text-blue-400 text-[11px] font-semibold">High Dividend</span>
          </div>
          {hideBalances ? (
            <div className="text-2xl font-bold text-slate-400 dark:text-slate-500 tracking-wider my-1">
              ••••••••
            </div>
          ) : (
            <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
              {formatKES(totals.saccoShares)}
            </div>
          )}
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Stima & Kenya Police SACCOs (11.5% p.a.)
          </div>
        </div>

        {/* Quick Utility Shortcut: KPLC Tokens */}
        <div
          onClick={() =>
            onOpenPaymentModal('paybill_till', {
              paybillNumber: '888880',
              accountRef: '37198273641',
              billCategory: 'Utilities',
            })
          }
          className="bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 rounded-2xl p-5 border border-emerald-200 dark:border-emerald-800/60 shadow-xs cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-1">
            <span>Quick KPLC Tokens</span>
            <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-emerald-950 dark:text-emerald-100">
            Buy Tokens (Meter: 371982...)
          </div>
          <div className="text-xs text-emerald-700 dark:text-emerald-400 mt-2 flex items-center gap-1 font-medium">
            <span>Zero Paybill Fee</span>
            <span>·</span>
            <span>Instant Token SMS</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Linked Accounts & Quick Services */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Linked Kenyan Accounts ({filteredAccounts.length})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Balances automatically synchronized via Central Bank API protocols
            </p>
          </div>

          {/* Interactive filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filterType === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All ({accounts.length})
            </button>
            <button
              onClick={() => setFilterType('banks')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filterType === 'banks'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Banks
            </button>
            <button
              onClick={() => setFilterType('wallets')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filterType === 'wallets'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              M-PESA / Wallets
            </button>
            <button
              onClick={() => setFilterType('saccos')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filterType === 'saccos'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              SACCOs
            </button>
          </div>
        </div>

        {/* Accounts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAccounts.map((acc) => (
            <AccountCard
              key={acc.id}
              account={acc}
              hideBalance={hideBalances}
              onRequestBiometricUnlock={onRequestBiometricUnlock}
              onSelectSend={(targetAcc) =>
                onOpenPaymentModal('send_mobile', { sourceAccountId: targetAcc.id })
              }
              onSelectReceive={(targetAcc) =>
                onOpenPaymentModal('self_transfer', { destinationAccountId: targetAcc.id })
              }
            />
          ))}

          {/* Add Bank Card */}
          <div
            onClick={onOpenLinkModal}
            className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-900/30 group min-h-[180px]"
          >
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/50 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors mb-3">
              <HardDrive className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Connect Another Bank / SACCO
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mt-1">
              Link Absa, Stanbic, DTB, SCB, I&M, or Harambee Sacco via secure OTP
            </p>
          </div>
        </div>
      </div>

      {/* Unified Transaction Activity Across All Banks */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Combined Statement & Activity
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Aggregated transactions across all your linked Kenyan banks and mobile wallets
            </p>
          </div>

          {/* Search & Category Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={txSearch}
                onChange={(e) => setTxSearch(e.target.value)}
                placeholder="Search Naivas, KPLC, Chama..."
                className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-56"
              />
            </div>

            <select
              value={txCategory}
              onChange={(e) => setTxCategory(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Categories</option>
              <option value="Utilities">Utilities</option>
              <option value="Groceries">Groceries</option>
              <option value="Chama">Chama & Savings</option>
              <option value="Transport">Transport</option>
              <option value="Transfer">Transfers & Salary</option>
            </select>
          </div>
        </div>

        {/* Transactions Table / List */}
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            No transactions found matching your criteria.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredTransactions.map((tx) => (
              <div
                key={tx.id}
                className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      tx.type === 'transfer_in'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {tx.type === 'transfer_in' ? (
                      <ArrowLeftRight className="w-4 h-4 rotate-180 text-emerald-600 dark:text-emerald-400" />
                    ) : tx.type === 'paybill' || tx.type === 'till' ? (
                      <Receipt className="w-4 h-4" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {tx.recipientName}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {tx.accountName}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-[11px]">{tx.referenceCode}</span>
                      <span aria-hidden="true">·</span>
                      <span>{tx.timestamp}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 flex items-center gap-3">
                  <div>
                    <div
                      className={`text-sm font-bold tabular-nums ${
                        tx.type === 'transfer_in'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {tx.type === 'transfer_in' ? '+' : '-'}
                      {formatKES(tx.amount)}
                    </div>
                    <div className="text-[11px] text-slate-400 dark:text-slate-500">
                      Fee: {tx.fee === 0 ? 'Free' : formatKES(tx.fee)}
                    </div>
                  </div>

                  <button
                    onClick={() => onViewReceipt(tx)}
                    className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    title="View M-PESA / Bank e-Receipt"
                    aria-label={`View receipt for ${tx.referenceCode}`}
                  >
                    <Receipt className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
