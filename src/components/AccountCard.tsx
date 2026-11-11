import React from 'react';
import { BankAccount, formatKES } from '../utils/kenyaFintech';
import { ArrowUpRight, ArrowDownLeft, Smartphone, Building2, CheckCircle2 } from 'lucide-react';

interface AccountCardProps {
  account: BankAccount;
  hideBalance: boolean;
  onSelectSend: (account: BankAccount) => void;
  onSelectReceive: (account: BankAccount) => void;
  onRequestBiometricUnlock?: () => void;
  onViewDetails?: (account: BankAccount) => void;
}

export const AccountCard: React.FC<AccountCardProps> = ({
  account,
  hideBalance,
  onSelectSend,
  onSelectReceive,
  onRequestBiometricUnlock,
}) => {
  const getBadgeStyle = (type: BankAccount['type']) => {
    switch (type) {
      case 'mobile_wallet':
        return 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50';
      case 'sacco_shares':
        return 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50';
      case 'savings':
        return 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50';
      default:
        return 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800';
    }
  };

  const getInstitutionIcon = (id: string) => {
    if (id === 'mpesa' || id === 'airtel') {
      return <Smartphone className="w-4 h-4 text-white" />;
    }
    return <Building2 className="w-4 h-4 text-white" />;
  };

  return (
    <div className="group relative bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
      {/* Top row: Brand & Type */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
            style={{ backgroundColor: account.color }}
          >
            {getInstitutionIcon(account.institutionId)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                {account.institutionName}
              </h3>
              {account.status === 'active' && (
                <span title="Linked & Authenticated" className="inline-flex text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5 min-w-0">
              <span className="font-mono whitespace-nowrap">{account.accountNumber}</span>
              <span aria-hidden="true" className="shrink-0">·</span>
              <span className="truncate">{account.accountName}</span>
            </div>
          </div>
        </div>

        {/* Type label */}
        <span
          className={`text-[11px] font-medium px-2 py-0.5 rounded-md capitalize whitespace-nowrap ${getBadgeStyle(
            account.type
          )}`}
        >
          {account.type.replace('_', ' ')}
        </span>
      </div>

      {/* Middle row: Balance & USSD shortcut */}
      <div className="my-3">
        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 flex items-center justify-between">
          <span>Available Balance</span>
          {hideBalance && onRequestBiometricUnlock && (
            <button
              onClick={onRequestBiometricUnlock}
              className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
            >
              Unlock
            </button>
          )}
        </div>
        {hideBalance ? (
          <button
            onClick={onRequestBiometricUnlock}
            title="Authenticate with Biometrics to Reveal Balance"
            className="text-left group flex items-center gap-2 cursor-pointer focus:outline-none"
          >
            <span className="text-2xl font-bold text-slate-400 dark:text-slate-500 tracking-wider">
              ••••••••
            </span>
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded group-hover:bg-emerald-100 transition-colors">
              Scan to reveal
            </span>
          </button>
        ) : (
          <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight tabular-nums">
            {formatKES(account.availableBalance)}
          </div>
        )}
        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-2">
          <span>Synced {account.lastSynced}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300">
            USSD: {account.ussdCode}
          </span>
          {account.paybillNumber && account.paybillNumber !== 'N/A' && (
            <>
              <span aria-hidden="true">·</span>
              <span>Paybill {account.paybillNumber}</span>
            </>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
        <button
          onClick={() => onSelectSend(account)}
          className="flex-1 py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
          aria-label={`Send or Pay from ${account.institutionName}`}
        >
          <ArrowUpRight className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
          <span>Pay / Send</span>
        </button>
        <button
          onClick={() => onSelectReceive(account)}
          className="flex-1 py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
          aria-label={`Deposit into ${account.institutionName}`}
        >
          <ArrowDownLeft className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
          <span>Deposit</span>
        </button>
      </div>
    </div>
  );
};
