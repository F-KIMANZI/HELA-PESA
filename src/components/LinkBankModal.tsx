import React, { useState } from 'react';
import { BankAccount } from '../utils/kenyaFintech';
import { AVAILABLE_INSTITUTIONS_TO_LINK } from '../data/mockData';
import { InstitutionType } from '../types';
import {
  X,
  Building2,
  Lock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Smartphone,
  ChevronRight,
} from 'lucide-react';

interface LinkBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccountLinked: (newAccount: BankAccount) => void;
}

export const LinkBankModal: React.FC<LinkBankModalProps> = ({
  isOpen,
  onClose,
  onAccountLinked,
}) => {
  const [selectedInst, setSelectedInst] = useState<any | null>(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('0724 819 042');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState<'select' | 'credentials' | 'otp' | 'success'>('select');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSelectInstitution = (inst: any) => {
    setSelectedInst(inst);
    setStep('credentials');
    setErrorMsg('');
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountNumber || accountNumber.length < 5) {
      setErrorMsg('Please enter a valid account or member number');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
    }, 800);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length < 4) {
      setErrorMsg('Please enter the 4-digit SMS verification code sent by the bank');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);

      // Create new bank account
      const colors: Record<string, string> = {
        absa: '#dc2626',
        stanbic: '#2563eb',
        dtb: '#991b1b',
        scb: '#059669',
        im_bank: '#4f46e5',
        harambee_sacco: '#d97706',
        kenya_police_sacco: '#0284c7',
      };

      const newAccount: BankAccount = {
        id: `acc-${selectedInst.id}-${Date.now()}`,
        institutionId: selectedInst.id as InstitutionType,
        institutionName: selectedInst.name,
        accountNumber: `${accountNumber.slice(0, 4)}***${accountNumber.slice(-3)}`,
        accountName: selectedInst.category === 'Regulated SACCO' ? 'Member Savings & Shares' : 'Mobile Current Account',
        type: selectedInst.category === 'Regulated SACCO' ? 'sacco_shares' : 'checking',
        balance: 62000,
        availableBalance: 62000,
        currency: 'KES',
        color: colors[selectedInst.id] || '#475569',
        logo: selectedInst.id,
        paybillNumber: selectedInst.paybill,
        ussdCode: selectedInst.ussd,
        status: 'active',
        lastSynced: 'Just now',
      };

      onAccountLinked(newAccount);
      setStep('success');
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Link Bank or SACCO
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Central Bank Open Banking & SASRA compliant connector
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Institution selection */}
        {step === 'select' && (
          <div className="p-6 space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Select your Kenyan banking institution or SACCO to aggregate into HelaOne:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-96 overflow-y-auto pr-1">
              {AVAILABLE_INSTITUTIONS_TO_LINK.map((inst) => (
                <button
                  key={inst.id}
                  onClick={() => handleSelectInstitution(inst)}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80 hover:border-emerald-500 dark:hover:border-emerald-500 text-left flex items-center justify-between group transition-colors bg-white dark:bg-slate-800/40"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                      {inst.name}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {inst.category} · Paybill {inst.paybill}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Credentials / Account Number */}
        {step === 'credentials' && selectedInst && (
          <form onSubmit={handleSendOtp} className="p-6 space-y-4">
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {selectedInst.name}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {selectedInst.authType}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Account Number or SACCO Member ID
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="e.g. 01103948210 or ST-9921"
                required
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Registered Mobile Number for OTP
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300">
                {errorMsg}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep('select')}
                className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {loading ? 'Requesting OTP...' : 'Send SMS Verification'}
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Enter OTP */}
        {step === 'otp' && selectedInst && (
          <form onSubmit={handleVerifyOtp} className="p-6 space-y-5 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 mx-auto flex items-center justify-center">
              <Lock className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Enter Bank Verification OTP
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                A 4-digit code was sent to {phoneNumber} from {selectedInst.name}.
              </p>
            </div>

            <div>
              <input
                type="text"
                maxLength={4}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                autoFocus
                className="w-36 mx-auto text-center tracking-widest text-2xl font-bold py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <div className="text-[11px] text-slate-400 mt-1">
                Demo code: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">9941</span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Confirm & Sync Balances'}
            </button>
          </form>
        )}

        {/* Step 4: Success confirmation */}
        {step === 'success' && selectedInst && (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {selectedInst.name} Successfully Connected!
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Your balances, statements, and payment rails have been merged into your unified HelaOne portal.
            </p>
            <button
              onClick={onClose}
              className="py-2.5 px-6 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-xs"
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
