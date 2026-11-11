/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { AccountsOverview } from './components/AccountsOverview';
import { UnifiedPaymentModal } from './components/UnifiedPaymentModal';
import { ReceiptModal } from './components/ReceiptModal';
import { LinkBankModal } from './components/LinkBankModal';
import { BiometricOverlayModal } from './components/BiometricOverlayModal';
import { ChamaManager } from './components/ChamaManager';
import { ExpenseAnalytics } from './components/ExpenseAnalytics';
import { USSDQuickHub } from './components/USSDQuickHub';
import { INITIAL_ACCOUNTS, INITIAL_TRANSACTIONS, INITIAL_CHAMAS } from './data/mockData';
import { BankAccount, Transaction, ChamaGroup, formatKES, BiometricResult } from './utils/kenyaFintech';
import { CompletedReceipt, PaymentMode } from './types';
import {
  Wallet,
  Send,
  Users,
  PieChart,
  PhoneCall,
  CheckCircle2,
  HardDrive,
  ShieldCheck,
} from 'lucide-react';

export default function App() {
  const [accounts, setAccounts] = useState<BankAccount[]>(() => {
    const saved = localStorage.getItem('helaone_accounts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return INITIAL_ACCOUNTS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('helaone_transactions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return INITIAL_TRANSACTIONS;
  });

  const [chamas, setChamas] = useState<ChamaGroup[]>(() => {
    const saved = localStorage.getItem('helaone_chamas');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return INITIAL_CHAMAS;
  });

  const [activeTab, setActiveTab] = useState<'overview' | 'payments' | 'chamas' | 'analytics' | 'ussd'>('overview');
  const [hideBalances, setHideBalances] = useState(false);
  const [biometricModalOpen, setBiometricModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentModalMode, setPaymentModalMode] = useState<PaymentMode>('self_transfer');
  const [paymentModalPrefill, setPaymentModalPrefill] = useState<any>(null);

  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<CompletedReceipt | null>(null);

  const handleRequestBiometricUnlock = () => {
    setBiometricModalOpen(true);
  };

  const handleLockBalances = () => {
    setHideBalances(true);
    showToast('Balances locked with Biometric Protection');
  };

  const handleBiometricSuccess = (result: BiometricResult) => {
    setHideBalances(false);
    setBiometricModalOpen(false);
    const methodLabel =
      result.method === 'face_scan'
        ? 'Hakikisha Face ID'
        : result.method === 'fingerprint'
        ? 'Touch ID Fingerprint'
        : 'PIN';
    showToast(`Identity verified via ${methodLabel}. Balances revealed.`);
  };

  // Dark mode
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Save changes
  useEffect(() => {
    localStorage.setItem('helaone_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('helaone_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('helaone_chamas', JSON.stringify(chamas));
  }, [chamas]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync balances across all banks
  const handleRefreshAll = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setAccounts((prev) =>
        prev.map((acc) => ({
          ...acc,
          lastSynced: 'Just now',
        }))
      );
      setIsSyncing(false);
      showToast('All 7 connected banking APIs synchronized successfully');
    }, 1200);
  };

  // Open Payment Modal
  const handleOpenPaymentModal = (mode: PaymentMode = 'self_transfer', prefill?: any) => {
    setPaymentModalMode(mode);
    setPaymentModalPrefill(prefill);
    setPaymentModalOpen(true);
  };

  // Handle completed payment
  const handleCompletePayment = (
    receipt: CompletedReceipt,
    sourceAccId: string,
    destAccId?: string
  ) => {
    const totalDebit = receipt.amount + receipt.fee;

    // Deduct from source account
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === sourceAccId) {
          const newBal = Math.max(0, acc.balance - totalDebit);
          return { ...acc, balance: newBal, availableBalance: newBal, lastSynced: 'Just now' };
        }
        if (destAccId && acc.id === destAccId) {
          const newBal = acc.balance + receipt.amount;
          return { ...acc, balance: newBal, availableBalance: newBal, lastSynced: 'Just now' };
        }
        return acc;
      })
    );

    // Create transaction record
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      accountId: sourceAccId,
      accountName: receipt.sourceInstitution,
      institutionId: receipt.sourceInstitution.toLowerCase().includes('mpesa') ? 'mpesa' : 'bank',
      type:
        receipt.paymentMode === 'self_transfer'
          ? 'transfer_out'
          : receipt.paymentMode === 'paybill_till'
          ? 'paybill'
          : 'transfer_out',
      amount: receipt.amount,
      fee: receipt.fee,
      recipientName: receipt.recipientName,
      recipientAccount: receipt.recipientDestination,
      referenceCode: receipt.referenceCode,
      category: receipt.kplcData
        ? 'Utilities'
        : receipt.recipientName.toLowerCase().includes('chama')
        ? 'Chama'
        : 'Transfer',
      timestamp: 'Just now',
      status: 'completed',
      notes: receipt.kplcData
        ? `Token: ${receipt.kplcData.tokenNumber} (${receipt.kplcData.tokenUnits} units)`
        : receipt.notes,
    };

    setTransactions((prev) => [newTx, ...prev]);
    setActiveReceipt(receipt);
    showToast(`Payment of ${formatKES(receipt.amount)} processed. Ref: ${receipt.referenceCode}`);
  };

  // Handle newly linked bank account
  const handleAccountLinked = (newAcc: BankAccount) => {
    setAccounts((prev) => [...prev, newAcc]);
    showToast(`${newAcc.institutionName} linked! Balance of ${formatKES(newAcc.balance)} added.`);
  };

  // Handle Chama payment
  const handlePayChamaContribution = (chama: ChamaGroup, fromAccount: BankAccount) => {
    const totalDebit = chama.monthlyTargetPerMember;
    if (fromAccount.availableBalance < totalDebit) {
      showToast(`Insufficient balance in ${fromAccount.institutionName}`);
      return;
    }

    // Deduct
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === fromAccount.id
          ? {
              ...acc,
              balance: acc.balance - totalDebit,
              availableBalance: acc.availableBalance - totalDebit,
              lastSynced: 'Just now',
            }
          : acc
      )
    );

    // Update chama
    setChamas((prev) =>
      prev.map((c) =>
        c.id === chama.id
          ? {
              ...c,
              userContributionStatus: 'paid',
              accumulatedSavings: c.accumulatedSavings + totalDebit,
            }
          : c
      )
    );

    // Add transaction
    const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const ref = `CH${letters[Math.floor(Math.random() * letters.length)]}${Math.floor(
      100000 + Math.random() * 900000
    )}M`;

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      accountId: fromAccount.id,
      accountName: fromAccount.institutionName,
      institutionId: fromAccount.institutionId,
      type: 'transfer_out',
      amount: totalDebit,
      fee: 0,
      recipientName: chama.name,
      recipientAccount: `Group ID #${chama.id}`,
      referenceCode: ref,
      category: 'Chama',
      timestamp: 'Just now',
      status: 'completed',
      notes: `Monthly share for ${chama.cycleMonth}`,
    };

    setTransactions((prev) => [newTx, ...prev]);

    setActiveReceipt({
      referenceCode: ref,
      date: new Date().toLocaleString('en-KE', { dateStyle: 'medium', timeStyle: 'short' }),
      amount: totalDebit,
      fee: 0,
      sourceAccount: fromAccount.accountNumber,
      sourceInstitution: fromAccount.institutionName,
      recipientName: chama.name,
      recipientDestination: `Chama Vault (${chama.name})`,
      paymentMode: 'paybill_till',
      notes: `Monthly Table Banking share for ${chama.cycleMonth}`,
    });

    showToast(`Chama share of ${formatKES(totalDebit)} settled successfully!`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-950 py-2.5 px-4 rounded-xl shadow-lg border border-slate-700 dark:border-slate-200 text-xs font-semibold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main App Bar Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hideBalances={hideBalances}
        onRequestBiometricUnlock={handleRequestBiometricUnlock}
        onLockBalances={handleLockBalances}
        isSyncing={isSyncing}
        onRefreshAll={handleRefreshAll}
        onOpenLinkModal={() => setLinkModalOpen(true)}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 md:pb-12">
        {activeTab === 'overview' && (
          <AccountsOverview
            accounts={accounts}
            transactions={transactions}
            hideBalances={hideBalances}
            onRequestBiometricUnlock={handleRequestBiometricUnlock}
            onOpenPaymentModal={handleOpenPaymentModal}
            onOpenLinkModal={() => setLinkModalOpen(true)}
            onViewReceipt={(tx) => {
              setActiveReceipt({
                referenceCode: tx.referenceCode,
                date: tx.timestamp,
                amount: tx.amount,
                fee: tx.fee,
                sourceAccount: tx.accountName,
                sourceInstitution: tx.accountName,
                recipientName: tx.recipientName,
                recipientDestination: tx.recipientAccount,
                paymentMode: tx.type === 'paybill' ? 'paybill_till' : 'send_mobile',
                notes: tx.notes,
              });
            }}
            onRefreshAll={handleRefreshAll}
            isSyncing={isSyncing}
          />
        )}

        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="max-w-xl">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
                  Universal Kenya Payment Gateway
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                  Initiate payments from any of your {accounts.length} linked accounts without switching apps.
                  Compare fees, verify recipient names via Hakikisha, and generate instant tokens.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => handleOpenPaymentModal('self_transfer')}
                    className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 text-left transition-colors"
                  >
                    <div className="text-sm font-bold text-emerald-900 dark:text-emerald-200 mb-1">
                      Move Between Own Accounts
                    </div>
                    <div className="text-xs text-emerald-700 dark:text-emerald-400">
                      Transfer M-PESA to Equity or KCB with zero tariff
                    </div>
                  </button>

                  <button
                    onClick={() => handleOpenPaymentModal('send_mobile')}
                    className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-left transition-colors"
                  >
                    <div className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                      Send to Mobile / Pochi
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Safaricom & Airtel with live Hakikisha name check
                    </div>
                  </button>

                  <button
                    onClick={() => handleOpenPaymentModal('paybill_till')}
                    className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-left transition-colors"
                  >
                    <div className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                      Paybill & Buy Goods (Till)
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      KPLC Tokens, eCitizen, Nairobi Water, Fibre
                    </div>
                  </button>

                  <button
                    onClick={() => handleOpenPaymentModal('pesalink')}
                    className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-left transition-colors"
                  >
                    <div className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                      PesaLink Interbank Direct
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Instant clearing to any Kenyan bank account
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Recent payment records */}
            <AccountsOverview
              accounts={accounts}
              transactions={transactions}
              hideBalances={hideBalances}
              onRequestBiometricUnlock={handleRequestBiometricUnlock}
              onOpenPaymentModal={handleOpenPaymentModal}
              onOpenLinkModal={() => setLinkModalOpen(true)}
              onViewReceipt={(tx) => {
                setActiveReceipt({
                  referenceCode: tx.referenceCode,
                  date: tx.timestamp,
                  amount: tx.amount,
                  fee: tx.fee,
                  sourceAccount: tx.accountName,
                  sourceInstitution: tx.accountName,
                  recipientName: tx.recipientName,
                  recipientDestination: tx.recipientAccount,
                  paymentMode: 'paybill_till',
                  notes: tx.notes,
                });
              }}
              onRefreshAll={handleRefreshAll}
              isSyncing={isSyncing}
            />
          </div>
        )}

        {activeTab === 'chamas' && (
          <ChamaManager
            chamas={chamas}
            accounts={accounts}
            onPayChamaContribution={handlePayChamaContribution}
            onOpenCreateChama={() => {
              const name = prompt('Enter Chama Name (e.g. Ruiru Youth Investment Group):');
              if (name) {
                const newChama: ChamaGroup = {
                  id: `chama-${Date.now()}`,
                  name,
                  purpose: 'Cooperative savings & emergency support pool',
                  totalMembers: 10,
                  monthlyTargetPerMember: 3000,
                  accumulatedSavings: 30000,
                  cycleMonth: 'November 2026',
                  nextPayoutMember: 'You (Next Turn in Line!)',
                  userContributionStatus: 'pending',
                  linkedAccountId: accounts[0]?.id || 'acc-mpesa',
                  payoutDate: 'End of Month',
                };
                setChamas((prev) => [...prev, newChama]);
                showToast(`Chama "${name}" registered into HelaOne!`);
              }
            }}
          />
        )}

        {activeTab === 'analytics' && (
          <ExpenseAnalytics transactions={transactions} accounts={accounts} />
        )}

        {activeTab === 'ussd' && <USSDQuickHub accounts={accounts} />}
      </main>

      {/* Fixed Bottom Tab Bar for Mobile Smartphone Viewport */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 grid grid-cols-5 items-center h-16 pb-safe px-2"
        aria-label="Mobile Bottom Navigation"
      >
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex flex-col items-center justify-center min-h-[44px] ${
            activeTab === 'overview'
              ? 'text-emerald-700 dark:text-emerald-400 font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
          aria-label="Accounts and Balances"
        >
          <Wallet className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1">Accounts</span>
        </button>

        <button
          onClick={() => handleOpenPaymentModal('send_mobile')}
          className={`flex flex-col items-center justify-center min-h-[44px] ${
            activeTab === 'payments'
              ? 'text-emerald-700 dark:text-emerald-400 font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
          aria-label="Make a Payment or Transfer"
        >
          <Send className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1">Pay & Send</span>
        </button>

        <button
          onClick={() => setActiveTab('chamas')}
          className={`flex flex-col items-center justify-center min-h-[44px] ${
            activeTab === 'chamas'
              ? 'text-emerald-700 dark:text-emerald-400 font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
          aria-label="Chama Table Banking"
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1">Chamas</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex flex-col items-center justify-center min-h-[44px] ${
            activeTab === 'analytics'
              ? 'text-emerald-700 dark:text-emerald-400 font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
          aria-label="Consolidated Cashflow Analytics"
        >
          <PieChart className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1">Cashflow</span>
        </button>

        <button
          onClick={() => setActiveTab('ussd')}
          className={`flex flex-col items-center justify-center min-h-[44px] ${
            activeTab === 'ussd'
              ? 'text-emerald-700 dark:text-emerald-400 font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
          aria-label="Offline USSD Shortcodes"
        >
          <PhoneCall className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1">USSD</span>
        </button>
      </nav>

      {/* Modals */}
      <UnifiedPaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        accounts={accounts}
        initialMode={paymentModalMode}
        initialPrefill={paymentModalPrefill}
        onCompletePayment={handleCompletePayment}
      />

      <ReceiptModal
        receipt={activeReceipt}
        onClose={() => setActiveReceipt(null)}
      />

      <LinkBankModal
        isOpen={linkModalOpen}
        onClose={() => setLinkModalOpen(false)}
        onAccountLinked={handleAccountLinked}
      />

      <BiometricOverlayModal
        isOpen={biometricModalOpen}
        onClose={() => setBiometricModalOpen(false)}
        onSuccess={handleBiometricSuccess}
      />
    </div>
  );
}
