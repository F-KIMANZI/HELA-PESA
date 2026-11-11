export type InstitutionType =
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
  institutionId: InstitutionType;
  institutionName: string;
  accountNumber: string;
  accountName: string;
  type: 'mobile_wallet' | 'checking' | 'savings' | 'sacco_shares';
  balance: number;
  availableBalance: number;
  currency: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  logo: string;
  paybillNumber?: string;
  ussdCode: string;
  status: 'active' | 'syncing' | 'unlinked';
  lastSynced: string;
  features: string[];
}

export type PaymentMode = 'self_transfer' | 'send_mobile' | 'paybill_till' | 'pesalink';

export interface PaymentPayload {
  sourceAccountId: string;
  mode: PaymentMode;
  destination: string;
  accountRef?: string;
  amount: number;
  fee: number;
  exciseDuty: number;
  recipientName: string;
  notes?: string;
  billCategory?: string;
}

export interface CompletedReceipt {
  referenceCode: string;
  date: string;
  amount: number;
  fee: number;
  sourceAccount: string;
  sourceInstitution: string;
  recipientName: string;
  recipientDestination: string;
  accountRef?: string;
  paymentMode: PaymentMode;
  notes?: string;
  kplcData?: {
    tokenNumber: string;
    tokenUnits: number;
    meterNumber: string;
    fuelEnergyCost: number;
    epraLevy: number;
    vat: number;
  };
}
