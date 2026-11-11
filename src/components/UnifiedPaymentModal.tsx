import React, { useState, useEffect } from 'react';
import {
  BankAccount,
  formatKES,
  calculateTransferFee,
  validateKenyanPhone,
  lookupHakikishaName,
  calculateKPLCTokens,
} from '../utils/kenyaFintech';
import { POPULAR_PAYBILLS } from '../data/mockData';
import { CompletedReceipt, PaymentMode } from '../types';
import {
  X,
  ArrowLeftRight,
  Send,
  Receipt,
  Building2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Zap,
  Lock,
  Sparkles,
  Smartphone,
} from 'lucide-react';

interface UnifiedPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: BankAccount[];
  initialMode?: PaymentMode;
  initialPrefill?: {
    sourceAccountId?: string;
    destinationAccountId?: string;
    paybillNumber?: string;
    accountRef?: string;
    amount?: number;
    billCategory?: string;
  };
  onCompletePayment: (receipt: CompletedReceipt, sourceAccId: string, destAccId?: string) => void;
}

export const UnifiedPaymentModal: React.FC<UnifiedPaymentModalProps> = ({
  isOpen,
  onClose,
  accounts,
  initialMode = 'self_transfer',
  initialPrefill,
  onCompletePayment,
}) => {
  const [mode, setMode] = useState<PaymentMode>(initialMode);
  const [sourceAccountId, setSourceAccountId] = useState<string>(
    initialPrefill?.sourceAccountId || accounts[0]?.id || ''
  );
  const [destinationAccountId, setDestinationAccountId] = useState<string>(
    initialPrefill?.destinationAccountId || accounts[1]?.id || ''
  );

  // Form fields
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isPochi, setIsPochi] = useState(false);
  const [paybillNumber, setPaybillNumber] = useState(initialPrefill?.paybillNumber || '');
  const [accountRef, setAccountRef] = useState(initialPrefill?.accountRef || '');
  const [isTillNumber, setIsTillNumber] = useState(false);
  const [pesalinkBank, setPesalinkBank] = useState('Equity Bank');
  const [pesalinkAcc, setPesalinkAcc] = useState('');

  const [amount, setAmount] = useState<number | ''>(initialPrefill?.amount || 1000);
  const [notes, setNotes] = useState('');

  // Security authorization step
  const [step, setStep] = useState<'form' | 'auth' | 'processing'>('form');
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialMode) setMode(initialMode);
    if (initialPrefill?.sourceAccountId) setSourceAccountId(initialPrefill.sourceAccountId);
    if (initialPrefill?.destinationAccountId) setDestinationAccountId(initialPrefill.destinationAccountId);
    if (initialPrefill?.paybillNumber) setPaybillNumber(initialPrefill.paybillNumber);
    if (initialPrefill?.accountRef) setAccountRef(initialPrefill.accountRef);
    if (initialPrefill?.amount) setAmount(initialPrefill.amount);
    setStep('form');
    setErrorMsg('');
  }, [isOpen, initialMode, initialPrefill]);

  if (!isOpen) return null;

  const currentSourceAcc = accounts.find((a) => a.id === sourceAccountId) || accounts[0];
  const currentDestAcc = accounts.find((a) => a.id === destinationAccountId) || accounts[1];

  // Fee calculation
  const numericAmount = typeof amount === 'number' ? amount : 0;
  let feeMethod: 'internal_linked' | 'mpesa_to_mpesa' | 'pesalink' | 'bank_to_mpesa' | 'till_buygoods' | 'paybill' =
    'internal_linked';

  if (mode === 'self_transfer') {
    feeMethod = 'internal_linked';
  } else if (mode === 'send_mobile') {
    feeMethod = currentSourceAcc.institutionId === 'mpesa' ? 'mpesa_to_mpesa' : 'bank_to_mpesa';
  } else if (mode === 'paybill_till') {
    feeMethod = isTillNumber ? 'till_buygoods' : 'paybill';
  } else if (mode === 'pesalink') {
    feeMethod = 'pesalink';
  }

  const feeDetails = calculateTransferFee(feeMethod, numericAmount);

  // Live Hakikisha verification
  let recipientVerification = { name: '', verified: false, subtitle: '' };
  if (mode === 'self_transfer') {
    recipientVerification = {
      name: `${currentDestAcc.institutionName} - ${currentDestAcc.accountName}`,
      verified: true,
      subtitle: `Your own verified account (${currentDestAcc.accountNumber})`,
    };
  } else if (mode === 'send_mobile') {
    const phoneCheck = validateKenyanPhone(phoneNumber);
    if (phoneCheck.isValid) {
      recipientVerification = lookupHakikishaName(phoneCheck.normalized, 'phone');
    }
  } else if (mode === 'paybill_till') {
    if (isTillNumber && paybillNumber.length >= 5) {
      recipientVerification = lookupHakikishaName(paybillNumber, 'till');
    } else if (!isTillNumber && paybillNumber.length >= 5) {
      recipientVerification = lookupHakikishaName(paybillNumber, 'paybill', accountRef);
    }
  } else if (mode === 'pesalink') {
    if (pesalinkAcc.length >= 6) {
      recipientVerification = {
        name: `VERIFIED ACCOUNT - ${pesalinkBank.toUpperCase()}`,
        verified: true,
        subtitle: `PesaLink Fast Interbank Direct (${pesalinkAcc})`,
      };
    }
  }

  // Handle Form Submission -> Auth Step
  const handleProceedToAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!numericAmount || numericAmount <= 0) {
      setErrorMsg('Please enter a valid amount greater than 0');
      return;
    }

    const totalRequired = numericAmount + feeDetails.totalFee;
    if (totalRequired > currentSourceAcc.availableBalance) {
      setErrorMsg(
        `Insufficient funds in ${currentSourceAcc.institutionName}. Available: ${formatKES(
          currentSourceAcc.availableBalance
        )}, Needed: ${formatKES(totalRequired)}`
      );
      return;
    }

    if (mode === 'self_transfer' && sourceAccountId === destinationAccountId) {
      setErrorMsg('Source and Destination accounts cannot be the same');
      return;
    }

    if (mode === 'send_mobile') {
      const phoneCheck = validateKenyanPhone(phoneNumber);
      if (!phoneCheck.isValid) {
        setErrorMsg('Please enter a valid Kenyan phone number (e.g. 0712345678)');
        return;
      }
    }

    if (mode === 'paybill_till') {
      if (!paybillNumber || paybillNumber.length < 5) {
        setErrorMsg('Please enter a valid Paybill or Till Number');
        return;
      }
      if (!isTillNumber && !accountRef) {
        setErrorMsg('Account Number / Reference is required for Paybill');
        return;
      }
    }

    if (mode === 'pesalink') {
      if (!pesalinkAcc || pesalinkAcc.length < 6) {
        setErrorMsg('Please enter a valid recipient bank account number');
        return;
      }
    }

    setStep('auth');
  };

  // Final Execution
  const handleAuthorize = () => {
    if (pin.length < 4) {
      setErrorMsg('Please enter your 4-digit security PIN or tap Biometrics');
      return;
    }

    setStep('processing');

    setTimeout(() => {
      // Deterministic Kenya M-PESA / PesaLink Ref Code generator (e.g., SKJ8912PQL)
      const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
      const ref = `SK${letters[Math.floor(Math.random() * letters.length)]}${Math.floor(
        100000 + Math.random() * 900000
      )}${letters[Math.floor(Math.random() * letters.length)]}`;

      let destString = '';
      if (mode === 'self_transfer') {
        destString = `${currentDestAcc.institutionName} (${currentDestAcc.accountNumber})`;
      } else if (mode === 'send_mobile') {
        destString = `${phoneNumber} ${isPochi ? '(Pochi)' : ''}`;
      } else if (mode === 'paybill_till') {
        destString = isTillNumber ? `Till: ${paybillNumber}` : `Paybill: ${paybillNumber} / Acc: ${accountRef}`;
      } else {
        destString = `${pesalinkBank} Acc: ${pesalinkAcc}`;
      }

      // If KPLC pre-paid, generate electricity tokens
      let kplcData;
      if (paybillNumber === '888880' || accountRef.toLowerCase().includes('meter')) {
        kplcData = calculateKPLCTokens(numericAmount, accountRef || '37198273641');
      }

      const receipt: CompletedReceipt = {
        referenceCode: ref,
        date: new Date().toLocaleString('en-KE', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }),
        amount: numericAmount,
        fee: feeDetails.totalFee,
        sourceAccount: currentSourceAcc.accountNumber,
        sourceInstitution: currentSourceAcc.institutionName,
        recipientName: recipientVerification.name || 'Verified Recipient',
        recipientDestination: destString,
        accountRef: accountRef || undefined,
        paymentMode: mode,
        notes: notes || undefined,
        kplcData,
      };

      onCompletePayment(
        receipt,
        currentSourceAcc.id,
        mode === 'self_transfer' ? currentDestAcc.id : undefined
      );
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center">
              <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Universal Kenya Payment Engine
              </h2>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Seamless multi-bank routing with zero double-hop charges
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
            aria-label="Close payment modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'form' ? (
          <form onSubmit={handleProceedToAuth} className="p-6 space-y-5">
            {/* Mode Tabs */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Select Payment Service
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setMode('self_transfer')}
                  className={`py-2 px-2 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap ${
                    mode === 'self_transfer'
                      ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>My Accounts</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMode('send_mobile')}
                  className={`py-2 px-2 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap ${
                    mode === 'send_mobile'
                      ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Send Money</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMode('paybill_till')}
                  className={`py-2 px-2 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap ${
                    mode === 'paybill_till'
                      ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Paybill / Till</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMode('pesalink')}
                  className={`py-2 px-2 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap ${
                    mode === 'pesalink'
                      ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>PesaLink</span>
                </button>
              </div>
            </div>

            {/* Source Account Picker */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Pay From (Source Account)
                </label>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Available:{' '}
                  <strong className="text-slate-900 dark:text-white font-bold tabular-nums">
                    {formatKES(currentSourceAcc.availableBalance)}
                  </strong>
                </span>
              </div>
              <select
                value={sourceAccountId}
                onChange={(e) => setSourceAccountId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.institutionName} · {acc.accountName} ({formatKES(acc.availableBalance)})
                  </option>
                ))}
              </select>
            </div>

            {/* Mode-Specific Destination Inputs */}
            {mode === 'self_transfer' && (
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Deposit Into (Destination Linked Account)
                </label>
                <select
                  value={destinationAccountId}
                  onChange={(e) => setDestinationAccountId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {accounts
                    .filter((a) => a.id !== sourceAccountId)
                    .map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.institutionName} · {acc.accountName} ({acc.accountNumber})
                      </option>
                    ))}
                </select>
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
                  <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>
                    <strong>Zero Transfer Fee</strong>: HelaOne handles direct clearing between your linked banks without passing through costly intermediary SMS brokers.
                  </span>
                </div>
              </div>
            )}

            {mode === 'send_mobile' && (
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Recipient Mobile Number
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isPochi}
                        onChange={(e) => setIsPochi(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Pochi La Biashara</span>
                    </label>
                  </div>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="0712 345 678 or 0110..."
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Hakikisha name preview */}
                {recipientVerification.name && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          Hakikisha: {recipientVerification.name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {recipientVerification.subtitle}
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                      Verified
                    </span>
                  </div>
                )}
              </div>
            )}

            {mode === 'paybill_till' && (
              <div className="space-y-3">
                {/* Popular Billers Quick Select */}
                <div>
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Popular Kenyan Billers
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_PAYBILLS.map((biller) => (
                      <button
                        key={biller.id}
                        type="button"
                        onClick={() => {
                          setIsTillNumber(false);
                          setPaybillNumber(biller.paybillNumber);
                          if (biller.id === 'kplc-prepaid') setAccountRef('37198273641');
                          else if (biller.id === 'ecitizen') setAccountRef('EC-99214-INV');
                          else if (biller.id === 'nairobi-water') setAccountRef('NCW-88120');
                          else if (biller.id === 'safaricom-fibre') setAccountRef('0724819042');
                        }}
                        className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                          paybillNumber === biller.paybillNumber
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700 font-semibold'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {biller.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-medium text-slate-700 dark:text-slate-300 pt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="biller_type"
                      checked={!isTillNumber}
                      onChange={() => setIsTillNumber(false)}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Paybill Number</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="biller_type"
                      checked={isTillNumber}
                      onChange={() => setIsTillNumber(true)}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Buy Goods (Till Number)</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {isTillNumber ? 'Till Number' : 'Paybill Business No.'}
                    </label>
                    <input
                      type="text"
                      value={paybillNumber}
                      onChange={(e) => setPaybillNumber(e.target.value)}
                      placeholder={isTillNumber ? 'e.g. 849201' : 'e.g. 888880'}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  {!isTillNumber && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Account Number / Reference
                      </label>
                      <input
                        type="text"
                        value={accountRef}
                        onChange={(e) => setAccountRef(e.target.value)}
                        placeholder="Meter No / Invoice / Acc"
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                {recipientVerification.name && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">
                        {recipientVerification.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {recipientVerification.subtitle}
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                      Verified Biller
                    </span>
                  </div>
                )}
              </div>
            )}

            {mode === 'pesalink' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Recipient Bank
                    </label>
                    <select
                      value={pesalinkBank}
                      onChange={(e) => setPesalinkBank(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option>Equity Bank</option>
                      <option>KCB Bank Kenya</option>
                      <option>Co-operative Bank</option>
                      <option>NCBA Bank</option>
                      <option>Absa Bank Kenya</option>
                      <option>Stanbic Bank</option>
                      <option>Standard Chartered</option>
                      <option>Diamond Trust Bank (DTB)</option>
                      <option>I&M Bank</option>
                      <option>Family Bank</option>
                      <option>Stima SACCO</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Recipient Bank Account No.
                    </label>
                    <input
                      type="text"
                      value={pesalinkAcc}
                      onChange={(e) => setPesalinkAcc(e.target.value)}
                      placeholder="e.g. 012049182301"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Amount Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Amount to Send / Pay (KES)
                </label>
                <div className="flex gap-1.5">
                  {[500, 1000, 2500, 5000].map((quickAmt) => (
                    <button
                      key={quickAmt}
                      type="button"
                      onClick={() => setAmount(quickAmt)}
                      className="px-2 py-0.5 text-[11px] font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded transition-colors"
                    >
                      {quickAmt}
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-500 text-sm">
                  KES
                </span>
                <input
                  type="number"
                  min="1"
                  max="500000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="0.00"
                  className="w-full pl-14 pr-4 py-3 text-lg font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white tabular-nums focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Live Fee Breakdown Strip */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Central Bank Regulated Tariff</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {feeDetails.breakdown}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>HelaOne Platform Fee</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  KES 0.00 (Zero Surcharge)
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between font-bold text-slate-900 dark:text-white">
                <span>Total Debit Amount</span>
                <span className="text-base text-emerald-700 dark:text-emerald-400 tabular-nums">
                  {formatKES(numericAmount + feeDetails.totalFee)}
                </span>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Submit Action */}
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-900/10 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            >
              <span>Continue to Secure Authorization</span>
            </button>
          </form>
        ) : step === 'auth' ? (
          /* Step 2: PIN / Biometric authorization */
          <div className="p-6 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 mx-auto flex items-center justify-center">
                <Lock className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Authorize Transaction
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Debiting <strong className="text-slate-900 dark:text-white">{formatKES(numericAmount)}</strong> from{' '}
                {currentSourceAcc.institutionName}
              </p>
            </div>

            {/* Summary review box */}
            <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Recipient</span>
                <span className="font-bold text-slate-900 dark:text-white">{recipientVerification.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Routing Channel</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300 uppercase">
                  {mode.replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Fee + Tax</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {feeDetails.totalFee === 0 ? 'Free' : formatKES(feeDetails.totalFee)}
                </span>
              </div>
            </div>

            {/* PIN Entry */}
            <div className="space-y-3">
              <label className="block text-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                Enter your 4-digit HelaOne Unified PIN
              </label>
              <div className="flex justify-center gap-3">
                <input
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  autoFocus
                  className="w-36 text-center tracking-widest text-2xl font-bold py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div className="text-center text-[11px] text-slate-400">
                Default test PIN: <span className="font-mono font-bold text-slate-600 dark:text-slate-300">1234</span>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-center text-xs text-red-700 dark:text-red-300">
                {errorMsg}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep('form')}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Back to Details
              </button>
              <button
                type="button"
                onClick={handleAuthorize}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Confirm Payment</span>
              </button>
            </div>
          </div>
        ) : (
          /* Step 3: Processing */
          <div className="p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin mx-auto" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Communicating with Bank Clearing Switch...
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              Simulating Central Bank of Kenya real-time gross settlement (RTGS) & M-PESA STK Push.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
