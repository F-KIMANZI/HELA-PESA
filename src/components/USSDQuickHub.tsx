import React, { useState } from 'react';
import { BankAccount } from '../utils/kenyaFintech';
import {
  PhoneCall,
  Copy,
  Check,
  SignalZero,
  Smartphone,
  ShieldCheck,
  WifiOff,
} from 'lucide-react';

interface USSDQuickHubProps {
  accounts: BankAccount[];
}

export const USSDQuickHub: React.FC<USSDQuickHubProps> = ({ accounts }) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const ussdDirectory = [
    {
      institution: 'Safaricom M-PESA',
      code: '*334#',
      balanceCode: '*334*1#',
      sendCode: '*334*2#',
      paybillCode: '*334*4#',
      desc: 'Safaricom SIM Toolkit alternative & zero-data USSD menu',
      color: '#059669',
    },
    {
      institution: 'Equity Bank (Eazzy 247)',
      code: '*247#',
      balanceCode: '*247*1#',
      sendCode: '*247*2#',
      paybillCode: '*247*3#',
      desc: 'Full mobile banking without data bundle connection',
      color: '#991b1b',
    },
    {
      institution: 'KCB Bank (M-Benki / Vooma)',
      code: '*522#',
      balanceCode: '*522*1#',
      sendCode: '*522*2#',
      paybillCode: '*522*3#',
      desc: 'Instant KCB to M-PESA and interbank clearing',
      color: '#0284c7',
    },
    {
      institution: 'Co-operative Bank (MCo-op Cash)',
      code: '*400#',
      balanceCode: '*400*1#',
      sendCode: '*400*2#',
      paybillCode: '*400*3#',
      desc: 'MCo-op Cash offline USSD portal for retail & SACCO members',
      color: '#047857',
    },
    {
      institution: 'NCBA Loop',
      code: '*888#',
      balanceCode: '*888*1#',
      sendCode: '*888*2#',
      paybillCode: '*888*3#',
      desc: 'NCBA direct mobile banking access code',
      color: '#1e293b',
    },
    {
      institution: 'Absa Bank Kenya',
      code: '*303#',
      balanceCode: '*303*1#',
      sendCode: '*303*2#',
      paybillCode: '*303*3#',
      desc: 'Timiza and Absa mobile offline gateway',
      color: '#dc2626',
    },
    {
      institution: 'Stima SACCO & FOSA',
      code: '*483*55#',
      balanceCode: '*483*55*1#',
      sendCode: '*483*55*2#',
      paybillCode: '*483*55*3#',
      desc: 'SACCO shares dividend inquiry & loan balance USSD',
      color: '#2563eb',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Offline banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-2">
              <WifiOff className="w-4 h-4" />
              <span>Offline / Low-Data Fallback Ready</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
              Kenyan Bank USSD Quick Codes
            </h1>
            <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
              When Safaricom or Airtel data bundles run out or during rural travel with weak reception, tap to copy or dial authentic USSD shortcodes for instant offline transactions.
            </p>
          </div>

          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/80 text-xs text-slate-300 max-w-xs">
            <div className="font-bold text-white mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Telco Regulated Strings</span>
            </div>
            No internet connection required. Dial directly on your phone dialer app.
          </div>
        </div>
      </div>

      {/* Directory cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {ussdDirectory.map((item) => (
          <div
            key={item.institution}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {item.institution}
                </h3>
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between mb-3">
                <span className="font-mono font-bold text-lg text-slate-900 dark:text-white">
                  {item.code}
                </span>
                <button
                  onClick={() => handleCopy(item.code)}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 rounded-lg shadow-2xs hover:bg-slate-100 flex items-center gap-1 transition-colors"
                >
                  {copiedCode === item.code ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedCode === item.code ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                {item.desc}
              </p>

              {/* Sub-actions */}
              <div className="space-y-1.5 text-xs pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                  <span>Balance Inquiry</span>
                  <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                    {item.balanceCode}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                  <span>Send Money</span>
                  <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                    {item.sendCode}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                  <span>Paybill Service</span>
                  <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                    {item.paybillCode}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
              <a
                href={`tel:${encodeURIComponent(item.code)}`}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Launch USSD in Phone Dialer</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
