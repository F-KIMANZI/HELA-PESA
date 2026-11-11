import React, { useState, useEffect } from 'react';
import {
  Fingerprint,
  ScanFace,
  Lock,
  CheckCircle2,
  AlertCircle,
  X,
  ShieldCheck,
  Eye,
  Sparkles,
  Smartphone,
} from 'lucide-react';
import { simulateBiometricVerification, BiometricResult } from '../utils/kenyaFintech';

interface BiometricOverlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (result: BiometricResult) => void;
  title?: string;
  subtitle?: string;
}

export const BiometricOverlayModal: React.FC<BiometricOverlayModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = 'Biometric Balance Protection',
  subtitle = 'Verify your identity to decrypt and view sensitive account balances across all linked Kenyan banks.',
}) => {
  const [method, setMethod] = useState<'fingerprint' | 'face_scan' | 'pin'>('fingerprint');
  const [scanningState, setScanningState] = useState<'idle' | 'scanning' | 'success' | 'failed'>('idle');
  const [scanProgress, setScanProgress] = useState(0);
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setScanningState('idle');
      setScanProgress(0);
      setPinInput('');
      setErrorMsg('');
    }
  }, [isOpen, method]);

  if (!isOpen) return null;

  // Simulate Fingerprint / Touch ID scan
  const handleTriggerFingerprint = () => {
    if (scanningState === 'scanning' || scanningState === 'success') return;
    setScanningState('scanning');
    setErrorMsg('');
    setScanProgress(0);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setScanningState('success');
          setTimeout(() => {
            const res = simulateBiometricVerification('fingerprint');
            onSuccess(res);
          }, 700);
          return 100;
        }
        return prev + 25;
      });
    }, 180);
  };

  // Simulate Face ID scan
  const handleTriggerFaceScan = () => {
    if (scanningState === 'scanning' || scanningState === 'success') return;
    setScanningState('scanning');
    setErrorMsg('');
    setScanProgress(0);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setScanningState('success');
          setTimeout(() => {
            const res = simulateBiometricVerification('face_scan');
            onSuccess(res);
          }, 800);
          return 100;
        }
        return prev + 20;
      });
    }, 160);
  };

  // Submit fallback PIN
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = simulateBiometricVerification('pin', pinInput);
    if (!res.success) {
      setErrorMsg(res.errorMessage || 'Invalid PIN');
      return;
    }
    setScanningState('success');
    setTimeout(() => {
      onSuccess(res);
    }, 600);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="biometric-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
        {/* Top Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="biometric-modal-title"
                className="text-base font-bold text-slate-900 dark:text-white"
              >
                {title}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Central Bank Privacy & Hardware Keystore Guard
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
            aria-label="Close biometric dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="px-6 pt-4">
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMethod('fingerprint');
                setScanningState('idle');
              }}
              className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                method === 'fingerprint'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Fingerprint className="w-4 h-4" />
              <span>Fingerprint</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMethod('face_scan');
                setScanningState('idle');
              }}
              className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                method === 'face_scan'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ScanFace className="w-4 h-4" />
              <span>Face Scan</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMethod('pin');
                setScanningState('idle');
              }}
              className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                method === 'pin'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>PIN Pass</span>
            </button>
          </div>
        </div>

        {/* Method 1: Fingerprint */}
        {method === 'fingerprint' && (
          <div className="p-6 text-center space-y-6">
            <div className="max-w-xs mx-auto">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {subtitle}
              </p>
            </div>

            {/* Interactive Fingerprint Target */}
            <div className="relative py-4 flex flex-col items-center justify-center">
              <button
                type="button"
                onClick={handleTriggerFingerprint}
                disabled={scanningState === 'scanning' || scanningState === 'success'}
                aria-label="Touch fingerprint scanner to unlock balances"
                className={`relative group w-28 h-28 rounded-full flex items-center justify-center transition-all focus:outline-none ${
                  scanningState === 'success'
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105'
                    : scanningState === 'scanning'
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400 scale-102 ring-4 ring-emerald-500/30'
                    : 'bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400 hover:scale-105 cursor-pointer shadow-inner'
                }`}
              >
                {/* Simulated scan beam animation */}
                {scanningState === 'scanning' && (
                  <div
                    className="absolute inset-x-2 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent shadow-sm pointer-events-none transition-all duration-300"
                    style={{ top: `${scanProgress}%` }}
                  />
                )}

                {scanningState === 'success' ? (
                  <CheckCircle2 className="w-14 h-14 text-white animate-in zoom-in-50 duration-300" />
                ) : (
                  <Fingerprint className="w-14 h-14 transition-transform group-active:scale-95" />
                )}
              </button>

              {/* Progress bar */}
              <div className="w-48 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    scanningState === 'success'
                      ? 'bg-emerald-500'
                      : scanningState === 'scanning'
                      ? 'bg-emerald-600 animate-pulse'
                      : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                  style={{ width: `${scanningState === 'idle' ? 0 : scanProgress}%` }}
                />
              </div>

              {/* Status prompt */}
              <div className="mt-3 text-xs font-semibold">
                {scanningState === 'idle' && (
                  <span className="text-slate-700 dark:text-slate-300">
                    Touch sensor or click icon to verify fingerprint
                  </span>
                )}
                {scanningState === 'scanning' && (
                  <span className="text-emerald-600 dark:text-emerald-400 animate-pulse">
                    Scanning biometric ridge patterns ({scanProgress}%)...
                  </span>
                )}
                {scanningState === 'success' && (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    Fingerprint Verified · Decrypting Balances...
                  </span>
                )}
              </div>
            </div>

            {/* Quick action button */}
            <button
              type="button"
              onClick={handleTriggerFingerprint}
              disabled={scanningState === 'scanning' || scanningState === 'success'}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-900/10 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
            >
              <Fingerprint className="w-4 h-4" />
              <span>
                {scanningState === 'scanning'
                  ? 'Verifying...'
                  : scanningState === 'success'
                  ? 'Authenticated!'
                  : 'Scan Fingerprint (Instant)'}
              </span>
            </button>
          </div>
        )}

        {/* Method 2: Face Scan (Hakikisha Face ID) */}
        {method === 'face_scan' && (
          <div className="p-6 text-center space-y-6">
            <div className="max-w-xs mx-auto">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Align your face within the frame to verify Kenyan device credentials.
              </p>
            </div>

            {/* Face Viewfinder Frame */}
            <div className="relative py-2 flex flex-col items-center justify-center">
              <div
                onClick={handleTriggerFaceScan}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') handleTriggerFaceScan();
                }}
                aria-label="Trigger Face ID scan"
                className={`relative w-40 h-44 rounded-3xl border-2 flex flex-col items-center justify-center transition-all cursor-pointer ${
                  scanningState === 'success'
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : scanningState === 'scanning'
                    ? 'border-emerald-500 bg-emerald-950/20 shadow-lg shadow-emerald-500/20'
                    : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:border-emerald-400'
                }`}
              >
                {/* Viewfinder corner brackets */}
                <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-emerald-500 rounded-tl" />
                <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-emerald-500 rounded-tr" />
                <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-emerald-500 rounded-bl" />
                <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-emerald-500 rounded-br" />

                {/* Laser scan line sweeping */}
                {scanningState === 'scanning' && (
                  <div
                    className="absolute inset-x-2 h-0.5 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] transition-all duration-200 pointer-events-none"
                    style={{ top: `${scanProgress}%` }}
                  />
                )}

                {scanningState === 'success' ? (
                  <div className="space-y-2 text-center animate-in zoom-in-75 duration-300">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                    <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 block">
                      Face Matched (99.8%)
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2 text-center">
                    <ScanFace
                      className={`w-16 h-16 mx-auto ${
                        scanningState === 'scanning'
                          ? 'text-emerald-500 animate-pulse'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    />
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
                      {scanningState === 'scanning' ? 'Analyzing Nodes' : 'Hakikisha 3D'}
                    </span>
                  </div>
                )}
              </div>

              {/* Progress and status */}
              <div className="w-48 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-4 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${scanningState === 'idle' ? 0 : scanProgress}%` }}
                />
              </div>

              <div className="mt-2.5 text-xs font-semibold">
                {scanningState === 'idle' && (
                  <span className="text-slate-700 dark:text-slate-300">
                    Tap viewfinder or button to scan face
                  </span>
                )}
                {scanningState === 'scanning' && (
                  <span className="text-emerald-600 dark:text-emerald-400 animate-pulse">
                    Verifying facial geometry landmarks...
                  </span>
                )}
                {scanningState === 'success' && (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    Authenticated: Fredrique M.
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleTriggerFaceScan}
              disabled={scanningState === 'scanning' || scanningState === 'success'}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-900/10 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
            >
              <ScanFace className="w-4 h-4" />
              <span>
                {scanningState === 'scanning'
                  ? 'Scanning Facial Nodes...'
                  : scanningState === 'success'
                  ? 'Authorized'
                  : 'Start Face Scan'}
              </span>
            </button>
          </div>
        )}

        {/* Method 3: Unified PIN fallback */}
        {method === 'pin' && (
          <form onSubmit={handlePinSubmit} className="p-6 text-center space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Enter 4-Digit Security PIN
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Hardware PIN fallback for low-light or biometric sensor error.
              </p>
            </div>

            <div>
              <input
                type="password"
                maxLength={4}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                autoFocus
                className="w-36 mx-auto text-center tracking-widest text-2xl font-bold py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <div className="text-[11px] text-slate-400 mt-1">
                Demo code: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">1234</span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 flex items-center justify-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-900/10 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Unlock Balances</span>
            </button>
          </form>
        )}

        {/* Footer info strip */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Encrypted on Device</span>
          </span>
          <span>Zero Plaintext Over-the-Air</span>
        </div>
      </div>
    </div>
  );
};
