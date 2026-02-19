
import React, { useState, useEffect } from 'react';
import { exportTransactionsToExcel, downloadUCReport } from '../services/excelService';
import { analyzeAuditData } from '../services/geminiService';
import { Transaction, FundCategory, TransactionType } from '../types';

interface ReportsProps {
  transactions: Transaction[];
  onImport: (newTransactions: any[]) => void;
}

const Reports: React.FC<ReportsProps> = ({ transactions, onImport }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [auditReport, setAuditReport] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      // @ts-ignore
      const active = await window.aistudio.hasSelectedApiKey();
      setHasApiKey(active);
    };
    checkKey();
  }, []);

  const handleAuthorizeAndAudit = async () => {
    // @ts-ignore
    await window.aistudio.openSelectKey();
    setHasApiKey(true);
    // Proceed to audit after a small delay to allow key injection
    setTimeout(() => performAudit(), 1000);
  };

  const performAudit = async () => {
    if (transactions.length === 0) {
      alert("No transactions found to audit. Please add some records first.");
      return;
    }

    setIsAnalyzing(true);
    setAuditReport(null);
    try {
      const result = await analyzeAuditData(transactions);
      
      if (result.startsWith("ERROR_AUTH_REQUIRED")) {
        setHasApiKey(false);
        setAuditReport("The AI Auditor requires a paid project API key to perform advanced Mumbai University compliance checks. Please authorize access.");
      } else {
        setAuditReport(result);
      }
    } catch (err) {
      console.error(err);
      setAuditReport("A technical error occurred during analysis. Manual audit is advised.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSummary = (cat: FundCategory) => {
    const relevant = transactions.filter(t => t.category === cat);
    const income = relevant.filter(t => t.type === TransactionType.INCOME).reduce((s, t) => s + t.amount, 0);
    const expense = relevant.filter(t => t.type === TransactionType.EXPENSE).reduce((s, t) => s + t.amount, 0);
    return { income, expense, balance: income - expense };
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[FundCategory.REGULAR, FundCategory.SPECIAL_CAMP].map((cat) => {
          const s = getSummary(cat);
          return (
            <div key={cat} className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight">{cat} Audit Pack</h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Institutional Compliance Pack</p>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${s.balance < 0 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  {s.balance < 0 ? 'Budget Overrun' : 'Within Budget'}
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-10">
                 <div className="bg-slate-50 p-6 rounded-3xl text-center border border-slate-100">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Receipts</p>
                   <p className="font-black text-xl text-slate-800">₹{s.income.toLocaleString()}</p>
                 </div>
                 <div className="bg-slate-50 p-6 rounded-3xl text-center border border-slate-100">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Payments</p>
                   <p className="font-black text-xl text-slate-800">₹{s.expense.toLocaleString()}</p>
                 </div>
                 <div className="bg-indigo-950 p-6 rounded-3xl text-center text-white shadow-xl shadow-indigo-100">
                   <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">Balance</p>
                   <p className="font-black text-xl">₹{s.balance.toLocaleString()}</p>
                 </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => exportTransactionsToExcel(transactions, cat)} className="flex-1 bg-white border-2 border-slate-100 py-4 rounded-2xl font-black text-xs hover:bg-slate-50 hover:border-indigo-200 transition-all active:scale-95">EXPORT LEDGER</button>
                <button onClick={() => downloadUCReport(transactions, cat)} className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95">DOWNLOAD UC</button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-indigo-950 p-12 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center gap-6 mb-10">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-3xl">🤖</div>
            <div>
               <h3 className="text-3xl font-black uppercase tracking-tight">AI Compliance Auditor</h3>
               <div className="flex items-center gap-3 mt-1">
                  <span className="bg-emerald-500 text-[10px] font-black px-2 py-0.5 rounded text-white uppercase tracking-widest">LIVE SCAN</span>
                  <span className="text-indigo-300 text-xs font-bold">Mumbai University Norms Engine v3.1</span>
               </div>
            </div>
          </div>
          
          <p className="text-indigo-200/80 font-medium max-w-2xl mb-12 text-lg leading-relaxed">
            Automatically verify your records against refreshment caps, honorarium rules, and camp daily rates. 
            Identifies sequence gaps and chronologically suspicious entries.
          </p>
          
          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center gap-6 p-16 bg-white/5 rounded-[2.5rem] border border-white/10 backdrop-blur-md">
              <div className="w-16 h-16 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
              <div className="text-center">
                <p className="font-black uppercase tracking-[0.3em] text-indigo-400">Verifying Ledger Integrity</p>
                <p className="text-[10px] font-bold text-indigo-200/50 mt-2 uppercase tracking-widest">Applying Mumbai University Norms...</p>
              </div>
            </div>
          ) : auditReport ? (
            <div className="bg-white rounded-[2.5rem] p-10 text-slate-900 animate-in zoom-in duration-500 shadow-2xl border-4 border-indigo-100">
               <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-100">
                  <h5 className="font-black text-indigo-900 uppercase tracking-tight">Final AI Audit Report</h5>
                  <button onClick={() => setAuditReport(null)} className="text-[10px] font-black uppercase tracking-widest bg-slate-100 px-4 py-2 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all">Clear Report</button>
               </div>
               <div className="prose prose-sm prose-indigo max-w-none max-h-[600px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-slate-200">
                  <div className="whitespace-pre-wrap font-medium leading-relaxed text-slate-700 text-base">{auditReport}</div>
               </div>
               <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Generated via Gemini 3 Pro Intelligent Auditing</p>
                  <button onClick={() => window.print()} className="bg-indigo-900 text-white px-6 py-2 rounded-xl text-xs font-black">Print Report</button>
               </div>
            </div>
          ) : !hasApiKey ? (
            <div className="space-y-6">
               <button 
                onClick={handleAuthorizeAndAudit} 
                className="bg-indigo-500 text-white px-12 py-5 rounded-[2rem] font-black text-lg hover:bg-indigo-400 transition-all active:scale-95 flex items-center gap-4 shadow-2xl shadow-indigo-950"
              >
                <span>🛡️</span> AUTHORIZE AI AUDITOR
              </button>
              <p className="text-[11px] text-indigo-400 font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                 <span>ℹ️</span> 
                 Requires a paid Google Cloud Project key. 
                 <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline hover:text-white">Learn More</a>
              </p>
            </div>
          ) : (
            <button 
              onClick={performAudit} 
              className="bg-white text-indigo-950 px-12 py-5 rounded-[2rem] font-black text-xl hover:shadow-2xl hover:bg-indigo-50 transition-all active:scale-95 shadow-2xl shadow-indigo-950"
            >
              RUN COMPLIANCE SCAN
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
