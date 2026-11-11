export type InstitutionId =
  | 'mpesa'
  | 'equity'
  | 'kcb'
  | 'coop'
  | 'ncba'
  | 'airtel'
  | 'absa'
  | 'stima_sacco'
  | 'scb'
  | 'dtb'
  | 'im_bank'
  | 'stanbic'
  | 'harambee_sacco'
  | 'kenya_police_sacco';

export interface BankAccount {
  id: string;
  institutionId: InstitutionId;
  institutionName: string;
  accountNumber: string; // masked or short
  accountName: string;
  type: 'mobile_wallet' | 'checking' | 'savings' | 'sacco_shares';
  balance: number;
  availableBalance: number;
  currency: string;
  color: string;
  logo: string;
  paybillNumber?: string;
  ussdCode: string;
  isDefaultTransferSource?: boolean;
  status: 'active' | 'syncing' | 'unlinked';
  lastSynced: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  accountName: string;
  institutionId: string;
  type: 'transfer_out' | 'transfer_in' | 'paybill' | 'till' | 'pochi' | 'withdrawal' | 'deposit';
  amount: number;
  fee: number;
  recipientName: string;
  recipientAccount: string;
  referenceCode: string; // e.g. "SKH921LQ4J" (M-PESA format)
  category: 'Groceries' | 'Utilities' | 'Transport' | 'Chama' | 'Entertainment' | 'Business' | 'Transfer';
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  notes?: string;
}

export interface ChamaGroup {
  id: string;
  name: string;
  purpose: string;
  totalMembers: number;
  monthlyTargetPerMember: number;
  accumulatedSavings: number;
  cycleMonth: string;
  nextPayoutMember: string;
  userContributionStatus: 'paid' | 'pending' | 'overdue';
  linkedAccountId: string;
  payoutDate: string;
}

export interface PaybillDirectoryItem {
  id: string;
  name: string;
  paybillNumber: string;
  category: 'Utilities' | 'Government' | 'Internet' | 'Education' | 'Fintech';
  accountPromptLabel: string;
  popular?: boolean;
  defaultFeeNote: string;
}

/**
 * Format KES Currency nicely with 2 decimals and commas
 */
export function formatKES(amount: number, includeDecimals = true): string {
  const parts = Math.abs(amount).toFixed(includeDecimals ? 2 : 0).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const sign = amount < 0 ? '-' : '';
  return `${sign}KES ${parts.join('.')}`;
}

/**
 * Validate and normalize Kenyan phone numbers (supports 07..., 01..., +254..., 254...)
 */
export function validateKenyanPhone(phone: string): {
  isValid: boolean;
  normalized: string;
  network: 'Safaricom' | 'Airtel' | 'Telkom' | 'Unknown';
} {
  const cleaned = phone.replace(/[\s-]/g, '');
  let standard = '';

  if (/^(?:\+254|254)(7\d{8}|1\d{8})$/.test(cleaned)) {
    standard = cleaned.replace(/^\+?254/, '0');
  } else if (/^0(7\d{8}|1\d{8})$/.test(cleaned)) {
    standard = cleaned;
  } else {
    return { isValid: false, normalized: phone, network: 'Unknown' };
  }

  // Detect network prefixes
  const prefix = standard.substring(0, 4);
  const prefix3 = standard.substring(0, 3);

  // Safaricom: 0700-0729, 0740-0743, 0745, 0746, 0748, 0757-0759, 0768, 0769, 0790-0799, 0110-0115
  const isSafaricom =
    /^07([0-2]\d|4[0-3]|45|46|48|5[7-9]|6[8-9]|9\d)/.test(standard) ||
    /^011[0-5]/.test(standard);

  // Airtel: 0730-0739, 0750-0756, 0785-0789, 0100-0106
  const isAirtel =
    /^07(3\d|5[0-6]|8[5-9])/.test(standard) || /^010[0-6]/.test(standard);

  // Telkom: 0770-0779
  const isTelkom = /^077\d/.test(standard);

  let network: 'Safaricom' | 'Airtel' | 'Telkom' | 'Unknown' = 'Unknown';
  if (isSafaricom) network = 'Safaricom';
  else if (isAirtel) network = 'Airtel';
  else if (isTelkom) network = 'Telkom';

  return {
    isValid: true,
    normalized: standard,
    network,
  };
}

/**
 * Calculate transaction fees based on Kenyan regulation (CBK guidelines & Excise Duty 15%)
 */
export function calculateTransferFee(
  method: 'internal_linked' | 'mpesa_to_mpesa' | 'pesalink' | 'bank_to_mpesa' | 'till_buygoods' | 'paybill',
  amount: number
): { fee: number; exciseDuty: number; totalFee: number; breakdown: string } {
  if (amount <= 0) {
    return { fee: 0, exciseDuty: 0, totalFee: 0, breakdown: 'Free' };
  }

  // 1. Internal transfers between user's own linked accounts inside HelaOne: ALWAYS ZERO
  if (method === 'internal_linked' || method === 'till_buygoods') {
    return {
      fee: 0,
      exciseDuty: 0,
      totalFee: 0,
      breakdown: method === 'till_buygoods' ? 'Customer zero-rated (Merchant pays)' : 'HelaOne Free Linked Transfer',
    };
  }

  // 2. M-PESA to M-PESA official consumer tariff brackets
  if (method === 'mpesa_to_mpesa') {
    let base = 0;
    if (amount <= 100) base = 0;
    else if (amount <= 500) base = 7;
    else if (amount <= 1000) base = 13;
    else if (amount <= 1500) base = 23;
    else if (amount <= 2500) base = 33;
    else if (amount <= 3500) base = 53;
    else if (amount <= 5000) base = 69;
    else if (amount <= 7500) base = 87;
    else if (amount <= 10000) base = 99;
    else if (amount <= 15000) base = 108;
    else if (amount <= 20000) base = 114;
    else if (amount <= 35000) base = 120;
    else if (amount <= 50000) base = 125;
    else base = 130;

    return {
      fee: base,
      exciseDuty: 0, // already included in M-PESA consumer schedule
      totalFee: base,
      breakdown: base === 0 ? 'Free under KES 100' : `M-PESA Tariff KES ${base}`,
    };
  }

  // 3. PesaLink Interbank (CBK standard switch fee)
  if (method === 'pesalink') {
    let base = 0;
    if (amount <= 500) base = 0;
    else if (amount <= 10000) base = 20;
    else if (amount <= 50000) base = 40;
    else if (amount <= 100000) base = 70;
    else base = 100;

    const excise = Math.round(base * 0.15); // 15% excise duty on financial fees
    return {
      fee: base,
      exciseDuty: excise,
      totalFee: base + excise,
      breakdown: `PesaLink KES ${base} + Excise KES ${excise}`,
    };
  }

  // 4. Bank to M-PESA / Paybill
  if (method === 'bank_to_mpesa' || method === 'paybill') {
    let base = 0;
    if (amount <= 100) base = 0;
    else if (amount <= 1000) base = 12;
    else if (amount <= 5000) base = 25;
    else if (amount <= 20000) base = 45;
    else base = 65;

    const excise = Math.round(base * 0.15);
    return {
      fee: base,
      exciseDuty: excise,
      totalFee: base + excise,
      breakdown: `Bank Settlement KES ${base} + Excise KES ${excise}`,
    };
  }

  return { fee: 0, exciseDuty: 0, totalFee: 0, breakdown: 'Standard Fee' };
}

/**
 * Hakikisha Name lookup simulation for verified Kenyan recipients
 */
export function lookupHakikishaName(
  destination: string,
  type: 'phone' | 'till' | 'paybill' | 'pesalink',
  paybillAcc?: string
): { name: string; verified: boolean; subtitle: string } {
  const clean = destination.replace(/\s+/g, '');

  if (type === 'phone') {
    const phoneMap: Record<string, string> = {
      '0712345678': 'MERCY WAMBUI NJERI',
      '0722000000': 'BRIAN OTIENO ODHIAMBO',
      '0798765432': 'FAITH CHEPKEMOI RUTO',
      '0701234567': 'DENNIS KIPCHUMBA KOECH',
      '0733112233': 'MWALIMU JUMA HASSAN',
    };
    if (phoneMap[clean]) {
      return {
        name: phoneMap[clean],
        verified: true,
        subtitle: 'Verified Safaricom M-PESA Subscriber',
      };
    }
    // Generate deterministic Kenyan name
    const firstNames = ['JOSEPH', 'MARY', 'SAMUEL', 'GRACE', 'KEVIN', 'ESTHER', 'PETER', 'PURITY'];
    const lastNames = ['KIMANI', 'MWANGI', 'MAINA', 'MUTUA', 'ONYANGO', 'CHEPKORIR', 'KIPROTICH', 'WACHIRA'];
    const hash = clean.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const fn = firstNames[hash % firstNames.length];
    const ln = lastNames[(hash + 3) % lastNames.length];
    const masked = `${clean.slice(-3)}`;
    return {
      name: `${fn} ${ln} (***${masked})`,
      verified: true,
      subtitle: 'Verified Mobile Money Recipient',
    };
  }

  if (type === 'till') {
    const tillMap: Record<string, string> = {
      '849201': 'NAIVAS SUPERMARKET - WESTLANDS',
      '553322': 'JAVA HOUSE KENYATTA AVE',
      '174379': 'QUICKMART TOM MBOYA',
      '998877': 'TOTAL ENERGIES UHURU HIGHWAY',
      '300300': 'ARTCAFFE OVAL',
    };
    if (tillMap[clean]) {
      return { name: tillMap[clean], verified: true, subtitle: 'Buy Goods / Till Merchant' };
    }
    return {
      name: `MERCHANT TILL #${clean}`,
      verified: true,
      subtitle: 'Verified KRA PIN Compliant Merchant',
    };
  }

  if (type === 'paybill') {
    const paybillMap: Record<string, { name: string; accName?: string }> = {
      '888880': { name: 'KPLC PRE-PAID TOKENS' },
      '888888': { name: 'KPLC POST-PAID' },
      '222222': { name: 'ECITIZEN (GAVA GOVT SERVICES)' },
      '444444': { name: 'NAIROBI CITY WATER & SEWERAGE CO' },
      '150150': { name: 'SAFARICOM HOME FIBRE' },
      '572572': { name: 'KRA ITAX REVENUE' },
      '247247': { name: 'EQUITY BANK PAYBILL' },
      '522522': { name: 'KCB BANK PAYBILL' },
      '400200': { name: 'CO-OPERATIVE BANK MCOOP' },
      '303030': { name: 'ABSA BANK KENYA' },
    };
    if (paybillMap[clean]) {
      const entry = paybillMap[clean];
      const acc = paybillAcc ? ` (Acc: ${paybillAcc.toUpperCase()})` : '';
      return {
        name: `${entry.name}${acc}`,
        verified: true,
        subtitle: 'Official Bill Issuer Directory',
      };
    }
    return {
      name: `BUSINESS PAYBILL #${clean}`,
      verified: true,
      subtitle: paybillAcc ? `Account Ref: ${paybillAcc}` : 'Verified Business',
    };
  }

  return { name: 'VERIFIED RECIPIENT', verified: true, subtitle: 'PesaLink Real-Time Switch' };
}

/**
 * Real-world Kenya Power (KPLC) token simulation
 */
export function calculateKPLCTokens(amountKES: number, meterNumber: string) {
  // Approximate Kenya EPRA domestic lifeline tariff (~KES 27.50/unit effective with taxes)
  const lifelineRate = 27.5;
  const units = Math.max(0, (amountKES / lifelineRate)).toFixed(2);
  const fuelEnergy = (amountKES * 0.16).toFixed(2);
  const forexAdj = (amountKES * 0.04).toFixed(2);
  const epraLevy = (amountKES * 0.01).toFixed(2);
  const vat = (amountKES * 0.16).toFixed(2);

  // Generate 20-digit token in 4x5 format: 1234-5678-9012-3456-7890
  const seed = (amountKES * 1337 + parseInt(meterNumber.slice(-4) || '1234', 10)).toString();
  const rawToken = (seed + '98765432101234567890').slice(0, 20);
  const formattedToken = `${rawToken.slice(0, 4)}-${rawToken.slice(4, 8)}-${rawToken.slice(8, 12)}-${rawToken.slice(12, 16)}-${rawToken.slice(16, 20)}`;

  return {
    meterNumber,
    tokenUnits: parseFloat(units),
    tokenNumber: formattedToken,
    fuelEnergyCost: parseFloat(fuelEnergy),
    forexAdjustment: parseFloat(forexAdj),
    epraLevy: parseFloat(epraLevy),
    vat: parseFloat(vat),
  };
}

/**
 * Generate USSD dial strings for offline / low data banking
 */
export function generateUSSDString(
  institutionId: string,
  action: 'main' | 'balance' | 'send' | 'paybill'
): string {
  switch (institutionId) {
    case 'mpesa':
      if (action === 'balance') return '*334*1#';
      if (action === 'send') return '*334*2#';
      if (action === 'paybill') return '*334*4#';
      return '*334#';
    case 'equity':
      return '*247#';
    case 'kcb':
      return '*522#';
    case 'coop':
      return '*400#';
    case 'ncba':
      return '*888#';
    case 'absa':
      return '*303#';
    case 'airtel':
      return '*334#';
    case 'stima_sacco':
      return '*483*55#';
    default:
      return '*334#';
  }
}

/**
 * Aggregate summary across all linked banks
 */
export function calculateAggregatedTotals(accounts: BankAccount[]): {
  totalNetWorth: number;
  liquidCash: number;
  savingsDeposit: number;
  saccoShares: number;
} {
  let totalNetWorth = 0;
  let liquidCash = 0;
  let savingsDeposit = 0;
  let saccoShares = 0;

  for (const acc of accounts) {
    if (acc.status !== 'unlinked') {
      totalNetWorth += acc.balance;
      if (acc.type === 'mobile_wallet' || acc.type === 'checking') {
        liquidCash += acc.availableBalance;
      } else if (acc.type === 'savings') {
        savingsDeposit += acc.availableBalance;
      } else if (acc.type === 'sacco_shares') {
        saccoShares += acc.balance;
      }
    }
  }

  return { totalNetWorth, liquidCash, savingsDeposit, saccoShares };
}

export interface BiometricResult {
  success: boolean;
  method: 'fingerprint' | 'face_scan' | 'pin';
  authenticatedUser: string;
  hardwareSecurityBadge: string;
  timestamp: string;
  errorMessage?: string;
}

/**
 * Validate and simulate biometric authentication for sensitive Kenyan banking balances
 */
export function simulateBiometricVerification(
  method: 'fingerprint' | 'face_scan' | 'pin',
  pinInput?: string
): BiometricResult {
  const timestamp = new Date().toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  if (method === 'pin') {
    if (!pinInput || pinInput.length !== 4) {
      return {
        success: false,
        method: 'pin',
        authenticatedUser: '',
        hardwareSecurityBadge: 'Keystore Hardware Guard',
        timestamp,
        errorMessage: 'PIN must be exactly 4 digits',
      };
    }
    // Accept 1234 or any 4 digit pin for demo
    return {
      success: true,
      method: 'pin',
      authenticatedUser: 'Fredrique M. (Verified Device Owner)',
      hardwareSecurityBadge: 'Secured via CBK Mobile Banking Keystore',
      timestamp,
    };
  }

  // Biometric methods (Fingerprint / Face Scan) succeed with certified hardware signature
  return {
    success: true,
    method,
    authenticatedUser: 'Fredrique M. (Verified Device Owner)',
    hardwareSecurityBadge: method === 'face_scan' ? 'Hakikisha 3D Face ID Verified' : 'TEE Android Hardware Fingerprint Sensor Verified',
    timestamp,
  };
}

