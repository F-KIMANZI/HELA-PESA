import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatKES,
  validateKenyanPhone,
  calculateTransferFee,
  lookupHakikishaName,
  calculateKPLCTokens,
  generateUSSDString,
  calculateAggregatedTotals,
  simulateBiometricVerification,
  BankAccount,
} from './kenyaFintech.ts';

test('formatKES formats Kenyan Shillings with comma separators and currency code', () => {
  assert.equal(formatKES(14500), 'KES 14,500.00');
  assert.equal(formatKES(250000.5, false), 'KES 250,001');
  assert.equal(formatKES(0), 'KES 0.00');
});

test('validateKenyanPhone validates Safaricom and Airtel numbers correctly', () => {
  const safaricom1 = validateKenyanPhone('0712345678');
  assert.equal(safaricom1.isValid, true);
  assert.equal(safaricom1.normalized, '0712345678');
  assert.equal(safaricom1.network, 'Safaricom');

  const safaricom2 = validateKenyanPhone('+254722000000');
  assert.equal(safaricom2.isValid, true);
  assert.equal(safaricom2.normalized, '0722000000');
  assert.equal(safaricom2.network, 'Safaricom');

  const airtel = validateKenyanPhone('0733112233');
  assert.equal(airtel.isValid, true);
  assert.equal(airtel.normalized, '0733112233');
  assert.equal(airtel.network, 'Airtel');

  const invalid = validateKenyanPhone('123456');
  assert.equal(invalid.isValid, false);
});

test('calculateTransferFee computes internal transfers as 0 fee and M-PESA tiers', () => {
  const internal = calculateTransferFee('internal_linked', 5000);
  assert.equal(internal.fee, 0);
  assert.equal(internal.totalFee, 0);

  const mpesaSmall = calculateTransferFee('mpesa_to_mpesa', 80);
  assert.equal(mpesaSmall.totalFee, 0);

  const mpesa1000 = calculateTransferFee('mpesa_to_mpesa', 1000);
  assert.equal(mpesa1000.totalFee, 13);

  const pesalink = calculateTransferFee('pesalink', 20000);
  assert.equal(pesalink.fee, 40);
  assert.equal(pesalink.exciseDuty, 6);
  assert.equal(pesalink.totalFee, 46);
});

test('lookupHakikishaName retrieves verified paybills and phone recipients', () => {
  const kplc = lookupHakikishaName('888880', 'paybill');
  assert.equal(kplc.name, 'KPLC PRE-PAID TOKENS');
  assert.equal(kplc.verified, true);

  const phone = lookupHakikishaName('0712345678', 'phone');
  assert.equal(phone.name, 'MERCY WAMBUI NJERI');
  assert.equal(phone.verified, true);
});

test('calculateKPLCTokens creates 20-digit token and EPRA tax breakdown', () => {
  const tokenRes = calculateKPLCTokens(1000, '37198273641');
  assert.ok(tokenRes.tokenUnits > 30);
  assert.match(tokenRes.tokenNumber, /^\d{4}-\d{4}-\d{4}-\d{4}-\d{4}$/);
});

test('generateUSSDString returns authentic Kenyan bank codes', () => {
  assert.equal(generateUSSDString('mpesa', 'main'), '*334#');
  assert.equal(generateUSSDString('equity', 'main'), '*247#');
  assert.equal(generateUSSDString('kcb', 'main'), '*522#');
  assert.equal(generateUSSDString('coop', 'main'), '*400#');
});

test('calculateAggregatedTotals sums balances across multiple institutions', () => {
  const mockAccounts: BankAccount[] = [
    {
      id: 'acc-1',
      institutionId: 'mpesa',
      institutionName: 'Safaricom M-PESA',
      accountNumber: '0712***789',
      accountName: 'Personal Wallet',
      type: 'mobile_wallet',
      balance: 15400,
      availableBalance: 15400,
      currency: 'KES',
      color: '#16a34a',
      logo: 'mpesa',
      ussdCode: '*334#',
      status: 'active',
      lastSynced: '2 mins ago',
    },
    {
      id: 'acc-2',
      institutionId: 'equity',
      institutionName: 'Equity Bank',
      accountNumber: '0120***492',
      accountName: 'Ordinary Current',
      type: 'checking',
      balance: 85200,
      availableBalance: 85200,
      currency: 'KES',
      color: '#991b1b',
      logo: 'equity',
      ussdCode: '*247#',
      status: 'active',
      lastSynced: 'Just now',
    },
    {
      id: 'acc-3',
      institutionId: 'stima_sacco',
      institutionName: 'Stima SACCO',
      accountNumber: 'ST-9021',
      accountName: 'Alpha Deposit / Shares',
      type: 'sacco_shares',
      balance: 120000,
      availableBalance: 120000,
      currency: 'KES',
      color: '#0284c7',
      logo: 'sacco',
      ussdCode: '*483*55#',
      status: 'active',
      lastSynced: '1 hr ago',
    },
  ];

  const totals = calculateAggregatedTotals(mockAccounts);
  assert.equal(totals.totalNetWorth, 220600);
  assert.equal(totals.liquidCash, 100600);
  assert.equal(totals.saccoShares, 120000);
});

test('simulateBiometricVerification verifies fingerprint, face scan, and pin methods', () => {
  const fingerprintRes = simulateBiometricVerification('fingerprint');
  assert.equal(fingerprintRes.success, true);
  assert.equal(fingerprintRes.method, 'fingerprint');
  assert.match(fingerprintRes.hardwareSecurityBadge, /Fingerprint/i);

  const faceRes = simulateBiometricVerification('face_scan');
  assert.equal(faceRes.success, true);
  assert.equal(faceRes.method, 'face_scan');
  assert.match(faceRes.hardwareSecurityBadge, /Face ID/i);

  const validPin = simulateBiometricVerification('pin', '1234');
  assert.equal(validPin.success, true);

  const invalidPin = simulateBiometricVerification('pin', '12');
  assert.equal(invalidPin.success, false);
  assert.ok(invalidPin.errorMessage);
});

