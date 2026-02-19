
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export enum FundCategory {
  REGULAR = 'Regular Activity',
  SPECIAL_CAMP = 'Special Camp',
  OTHER = 'Other'
}

export enum AccountHead {
  GRANT = 'Grant Received',
  REFRESHMENT = 'Refreshment/Tea',
  TRAVEL = 'Traveling/Conveyance',
  HONORARIUM = 'Honorarium',
  STATIONERY = 'Stationery/Postage',
  MISC = 'Miscellaneous/Contingency',
  CAMP_FOOD = 'Camp Boarding/Lodging',
  CAMP_TRANS = 'Camp Transport',
  OPENING_BAL = 'Opening Balance'
}

export enum RecurringInterval {
  NONE = 'None',
  MONTHLY = 'Monthly',
  QUARTERLY = 'Quarterly',
  YEARLY = 'Yearly'
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'Admin' | 'Programme Officer' | 'Assistant';
}

export interface CollegeInfo {
  name: string;
  address: string;
  logo: string; // Base64
  unitCode: string;
}

export interface AuditEntry {
  timestamp: string;
  action: 'Created' | 'Modified' | 'Verified' | 'Bank Status Changed';
  user: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: FundCategory;
  accountHead: AccountHead;
  type: TransactionType;
  amount: number;
  voucherNumber: string;
  paymentMode: 'Cash' | 'Cheque' | 'Online';
  isRecurring?: boolean;
  recurringInterval?: RecurringInterval;
  lastProcessedDate?: string;
  billImage?: string;
  isAuditVerified?: boolean;
  clearedInBank?: boolean;
  volunteerCount?: number;
  addedBy?: string; // User email
  auditTrail: AuditEntry[];
}

export interface DashboardStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  regularSpent: number;
  campSpent: number;
  cashInHand: number;
  cashAtBank: number;
}
