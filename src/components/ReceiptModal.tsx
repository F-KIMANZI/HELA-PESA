import React, { useState } from 'react';
import { CompletedReceipt } from '../types';
import { formatKES } from '../utils/kenyaFintech';
import {
  X,
  CheckCircle2,
  Copy,
  Check,
  Share2,
  Download,
  Zap,
  Building2,
  Receipt as ReceiptIcon,
} from 'lucide-react';

interface ReceiptModalProps {
  receipt: CompletedReceipt | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ receipt, onClose }) => {
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);

  if (!receipt) return null;

  const handleCopyToken = () => {
    if (receipt.kplcData?.tokenNumber) {
      navigator.clipboard.writeText(receipt.kplcData.tokenNumber.replace(/-/g, ''));
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  const handleCopyRef = () => {
    navigator.clipboard.writeText(receipt.referenceCode);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-emerald-700 text-white p-6 text-center relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-emerald-100 hover:text-white p-1 rounded-lg transition-colors"
            aria-label="Close receipt"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-xs text-white flex items-center justify-center mx-auto mb-3 shadow-inner">
            <CheckCircle2 className="w-8 h-8 text-emerald-200" />
          </div>

          <div className="text-xs uppercase tracking-wider font-semibold text-emerald-200 mb-1">
            Transaction Confirmed
          </div>
          <div className="text-3xl font-extrabold text-white tabular-nums tracking-tight">
            {formatKES(receipt.amount)}
          </div>
          <div className="text-xs text-emerald-100 mt-1">
            Settled via {receipt.sourceInstitution}
          </div>
        </div>

        {/* Receipt Body */}
        <div className="p-6 space-y-5">
          {/* KPLC Token Highlight (If applicable) */}
          {receipt.kplcData && (
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-amber-900 dark:text-amber-300">
                <span className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>KPLC PRE-PAID TOKEN</span>
                </span>
                <span className="font-mono bg-amber-200 dark:bg-amber-900 px-2 py-0.5 rounded text-[11px]">
                  {receipt.kplcData.tokenUnits} Units
                </span>
              </div>

              {/* Big Token Number */}
              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-amber-200 dark:border-amber-900/60 text-center">
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                  20-Digit Recharge Token
                </div>
                <div className="font-mono font-bold text-base sm:text-lg tracking-wider text-slate-900 dark:text-white select-all">
                  {receipt.kplcData.tokenNumber}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-amber-900 dark:text-amber-300">
                <span>Meter: {receipt.kplcData.meterNumber}</span>
                <button
                  onClick={handleCopyToken}
                  className="flex items-center gap-1 font-semibold text-amber-800 dark:text-amber-200 hover:underline"
                >
                  {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedToken ? 'Copied!' : 'Copy Numbers'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Transaction Metadata Card */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/80 space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400">Reference ID</span>
              <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900 dark:text-white">
                <span>{receipt.referenceCode}</span>
                <button
                  onClick={handleCopyRef}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  title="Copy Reference"
                >
                  {copiedRef ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Recipient</span>
              <span className="font-semibold text-slate-900 dark:text-white text-right">
                {receipt.recipientName}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Destination</span>
              <span className="font-mono text-slate-700 dark:text-slate-300 text-right">
                {receipt.recipientDestination}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Date & Time</span>
              <span className="text-slate-700 dark:text-slate-300">{receipt.date}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Transfer Tariff</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {receipt.fee === 0 ? 'KES 0.00 (Free)' : formatKES(receipt.fee)}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between font-bold text-slate-900 dark:text-white">
              <span>Total Debited</span>
              <span className="tabular-nums">{formatKES(receipt.amount + receipt.fee)}</span>
            </div>
          </div>

          {/* Quick buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                alert(`Receipt for ${receipt.referenceCode} shared to clipboard!`);
              }}
              className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Receipt</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Done</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
