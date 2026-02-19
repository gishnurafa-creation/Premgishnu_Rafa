
import { Transaction, AccountHead, FundCategory, TransactionType } from '../types';

declare const XLSX: any;

export const exportTransactionsToExcel = (
  transactions: Transaction[], 
  category?: FundCategory,
  fileName: string = 'NSS_Audit_Sheet.xlsx'
) => {
  const filtered = category ? transactions.filter(t => t.category === category) : transactions;
  const titlePrefix = category ? `${category} - ` : '';

  const ledgerRows = filtered.map(t => ({
    'Date': t.date,
    'Voucher/Receipt No': t.voucherNumber,
    'Description': t.description,
    'Fund Category': t.category,
    'Account Head': t.accountHead,
    'Mode': t.paymentMode,
    'Receipt (₹)': t.type === TransactionType.INCOME ? t.amount : 0,
    'Payment (₹)': t.type === TransactionType.EXPENSE ? t.amount : 0,
    'Bank Cleared': t.clearedInBank ? 'Yes' : 'No',
    'Audit Verified': t.isAuditVerified ? 'Verified' : 'Pending',
    'Attendance Ref': t.volunteerCount || 'N/A'
  }));

  const heads = Object.values(AccountHead);
  const summaryRows = heads.map(head => {
    const receipts = filtered.filter(t => t.accountHead === head && t.type === TransactionType.INCOME).reduce((s, t) => s + t.amount, 0);
    const payments = filtered.filter(t => t.accountHead === head && t.type === TransactionType.EXPENSE).reduce((s, t) => s + t.amount, 0);
    return {
      'Account Head': head,
      'Total Receipts (₹)': receipts,
      'Total Payments (₹)': payments,
      'Net Balance (₹)': receipts - payments
    };
  }).filter(row => row['Total Receipts (₹)'] > 0 || row['Total Payments (₹)'] > 0);

  const workbook = XLSX.utils.book_new();
  const wsLedger = XLSX.utils.json_to_sheet(ledgerRows);
  XLSX.utils.book_append_sheet(workbook, wsLedger, "Detailed Ledger");
  const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(workbook, wsSummary, "Summary Account");

  XLSX.writeFile(workbook, `${titlePrefix}${fileName}`);
};

export const downloadUCReport = (transactions: Transaction[], category: FundCategory) => {
  const filtered = transactions.filter(t => t.category === category);
  const income = filtered.filter(t => t.type === TransactionType.INCOME).reduce((s, t) => s + t.amount, 0);
  const expense = filtered.filter(t => t.type === TransactionType.EXPENSE).reduce((s, t) => s + t.amount, 0);
  
  const ucData = [
    ["UTILIZATION CERTIFICATE (UC)", "", ""],
    ["NSS Unit: St. Paul College, Ulhasnagar-4", "", ""],
    ["Category:", category, ""],
    ["", "", ""],
    ["Particulars", "Amount (₹)", "Remarks"],
    ["Opening Balance", filtered.find(t => t.accountHead === AccountHead.OPENING_BAL)?.amount || 0, ""],
    ["Total Grants Received", income, ""],
    ["Total Expenditure Incurred", expense, ""],
    ["Closing Balance", income - expense, ""],
    ["", "", ""],
    ["Certified that I have satisfied myself that the conditions on which the grants-in-aid was sanctioned have been duly fulfilled.", "", ""],
  ];

  const workbook = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(ucData);
  XLSX.utils.book_append_sheet(workbook, ws, "Utilization Certificate");
  XLSX.writeFile(workbook, `UC_${category}_NSS.xlsx`);
};

export const parseExcelFile = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        resolve(jsonData);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
};
