import React, { useState } from 'react';
import { ChamaGroup, formatKES, BankAccount } from '../utils/kenyaFintech';
import {
  Users,
  Calendar,
  PiggyBank,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Plus,
  Coins,
} from 'lucide-react';

interface ChamaManagerProps {
  chamas: ChamaGroup[];
  accounts: BankAccount[];
  onPayChamaContribution: (chama: ChamaGroup, fromAccount: BankAccount) => void;
  onOpenCreateChama: () => void;
}

export const ChamaManager: React.FC<ChamaManagerProps> = ({
  chamas,
  accounts,
  onPayChamaContribution,
  onOpenCreateChama,
}) => {
  const [selectedChamaForPay, setSelectedChamaForPay] = useState<ChamaGroup | null>(null);
  const [selectedAccId, setSelectedAccId] = useState<string>(accounts[0]?.id || '');

  const totalMonthlyCommitment = chamas.reduce((sum, c) => sum + c.monthlyTargetPerMember, 0);
  const totalPooledSavings = chamas.reduce((sum, c) => sum + c.accumulatedSavings, 0);

  const handleConfirmPay = () => {
    if (selectedChamaForPay) {
      const source = accounts.find((a) => a.id === selectedAccId) || accounts[0];
      onPayChamaContribution(selectedChamaForPay, source);
      setSelectedChamaForPay(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 border border-teal-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-400 mb-2">
              <Users className="w-4 h-4" />
              <span>Kenyan Table Banking & Chama Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
              Unified Group Savings & Merry-Go-Rounds
            </h1>
            <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
              Never miss a monthly Chama share. Aggregate contributions across your SACCO, KCB, Equity, and M-PESA wallets with automated reminders and payout calendars.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 shrink-0">
            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 border border-white/10 text-right">
              <div className="text-xs text-teal-200">Total Group Capital Pooled</div>
              <div className="text-2xl font-bold text-white tabular-nums">
                {formatKES(totalPooledSavings, false)}
              </div>
              <div className="text-[11px] text-teal-300 mt-1">Across {chamas.length} active circles</div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            Your Monthly Commitment
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
            {formatKES(totalMonthlyCommitment)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Target per cycle month
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            Next Payout Due to You
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
            KES 80,000.00
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Nairobi Tech Founders · Nov 28, 2026
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            Compliance Score
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            100% On-Time
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Zero missed table banking turns
          </div>
        </div>
      </div>

      {/* Chamas List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Your Active Kenyan Chamas ({chamas.length})
          </h2>
          <button
            onClick={onOpenCreateChama}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Join / Register Chama</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {chamas.map((chama) => {
            const linkedAcc = accounts.find((a) => a.id === chama.linkedAccountId) || accounts[0];

            return (
              <div
                key={chama.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                        {chama.name}
                      </h3>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {chama.totalMembers} Members · {chama.cycleMonth}
                      </div>
                    </div>

                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded capitalize ${
                        chama.userContributionStatus === 'paid'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {chama.userContributionStatus === 'paid' ? 'Paid this month' : 'Due for Payment'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 line-clamp-2">
                    {chama.purpose}
                  </p>

                  <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Monthly Share</span>
                      <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                        {formatKES(chama.monthlyTargetPerMember)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Accumulated Pool</span>
                      <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
                        {formatKES(chama.accumulatedSavings)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Next Payout</span>
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400 text-right">
                        {chama.nextPayoutMember}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800">
                  {chama.userContributionStatus === 'paid' ? (
                    <div className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Contribution Up-to-Date</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedChamaForPay(chama)}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                    >
                      <Coins className="w-4 h-4" />
                      <span>Pay {formatKES(chama.monthlyTargetPerMember)} Share</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pay Chama Modal */}
      {selectedChamaForPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Pay Chama Monthly Contribution
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Transferring <strong>{formatKES(selectedChamaForPay.monthlyTargetPerMember)}</strong> to{' '}
              {selectedChamaForPay.name}.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Choose Paying Account
              </label>
              <select
                value={selectedAccId}
                onChange={(e) => setSelectedAccId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.institutionName} ({formatKES(acc.availableBalance)})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setSelectedChamaForPay(null)}
                className="flex-1 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPay}
                className="flex-1 py-2.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
