import React from 'react';
import { Transaction, formatKES, BankAccount } from '../utils/kenyaFintech';
import {
  TrendingUp,
  TrendingDown,
  PieChart,
  ShoppingBag,
  Zap,
  Car,
  Users,
  Briefcase,
  ArrowRightLeft,
  Calendar,
} from 'lucide-react';

interface ExpenseAnalyticsProps {
  transactions: Transaction[];
  accounts: BankAccount[];
}

export const ExpenseAnalytics: React.FC<ExpenseAnalyticsProps> = ({ transactions, accounts }) => {
  // Aggregate expenses by category
  const categories: Record<string, { total: number; count: number; icon: any; color: string }> = {
    Groceries: { total: 0, count: 0, icon: ShoppingBag, color: '#059669' },
    Utilities: { total: 0, count: 0, icon: Zap, color: '#d97706' },
    Transport: { total: 0, count: 0, icon: Car, color: '#2563eb' },
    Chama: { total: 0, count: 0, icon: Users, color: '#7c3aed' },
    Business: { total: 0, count: 0, icon: Briefcase, color: '#dc2626' },
    Transfer: { total: 0, count: 0, icon: ArrowRightLeft, color: '#64748b' },
  };

  let totalSpent = 0;
  let totalIncome = 0;

  transactions.forEach((tx) => {
    if (tx.type === 'transfer_in') {
      totalIncome += tx.amount;
    } else {
      totalSpent += tx.amount;
      if (categories[tx.category]) {
        categories[tx.category].total += tx.amount;
        categories[tx.category].count += 1;
      } else {
        categories['Transfer'].total += tx.amount;
        categories['Transfer'].count += 1;
      }
    }
  });

  const categoryEntries = Object.entries(categories).sort((a, b) => b[1].total - a[1].total);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Consolidated Cashflow & Spend Analytics
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Real-time aggregated expenditure categorized across all linked Kenyan banks and mobile wallets
        </p>
      </div>

      {/* Top 3 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            <span>Aggregated Inflow / Income</span>
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
            +{formatKES(totalIncome)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Salary, Chama payouts & mobile deposits
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            <span>Aggregated Outflow / Debits</span>
            <TrendingDown className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            -{formatKES(totalSpent)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Paybill, Till & mobile money transfers
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            <span>Net Monthly Surplus</span>
            <PieChart className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
            {formatKES(totalIncome - totalSpent)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Retained liquidity across all accounts
          </div>
        </div>
      </div>

      {/* Categorized Spending Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category list with visual progress bars */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Expenditure by Category (Kenya Ecosystem)
          </h2>

          <div className="space-y-4">
            {categoryEntries.map(([name, data]) => {
              const Icon = data.icon;
              const percentage = totalSpent > 0 ? ((data.total / totalSpent) * 100).toFixed(1) : '0';

              return (
                <div key={name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-md flex items-center justify-center text-white"
                        style={{ backgroundColor: data.color }}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {name}
                      </span>
                      <span className="text-slate-400">({data.count} txns)</span>
                    </div>

                    <div className="flex items-center gap-2 tabular-nums">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {formatKES(data.total)}
                      </span>
                      <span className="text-slate-400 font-medium">({percentage}%)</span>
                    </div>
                  </div>

                  {/* Horizontal bar */}
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, Math.max(2, parseFloat(percentage)))}%`,
                        backgroundColor: data.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bank Contribution Distribution */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Liquidity Distribution Across Accounts
          </h2>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {accounts.map((acc) => {
              const totalPool = accounts.reduce((s, a) => s + a.balance, 0);
              const pct = totalPool > 0 ? ((acc.balance / totalPool) * 100).toFixed(1) : '0';

              return (
                <div key={acc.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: acc.color }}
                    />
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">
                        {acc.institutionName}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {acc.accountNumber}
                      </div>
                    </div>
                  </div>

                  <div className="text-right tabular-nums">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {formatKES(acc.balance)}
                    </div>
                    <div className="text-[11px] text-slate-400">{pct}% of wealth</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
