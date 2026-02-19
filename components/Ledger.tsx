
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Transaction, TransactionType, FundCategory, AccountHead, RecurringInterval } from '../types';

interface LedgerProps {
  transactions: Transaction[];
  addTransaction: (t: Transaction) => void;
  deleteTransaction: (id: string) => void;
  updateTransaction: (t: Transaction) => void;
}

const Ledger: React.FC<LedgerProps> = ({ transactions, addTransaction, deleteTransaction, updateTransaction }) => {
  const [accountMode, setAccountMode] = useState<FundCategory | 'ALL'>(FundCategory.REGULAR);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState<string>('date-desc');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const rowFileInputRef = useRef<HTMLInputElement>(null);
  const [activeTransactionForUpload, setActiveTransactionForUpload] = useState<Transaction | null>(null);

  const [formData, setFormData] = useState<Partial<Transaction>>({
    date: new Date().toISOString().split('T')[0],
    description: '',
    category: FundCategory.REGULAR,
    accountHead: AccountHead.REFRESHMENT,
    type: TransactionType.EXPENSE,
    amount: 0,
    voucherNumber: '',
    paymentMode: 'Cash',
    volunteerCount: 0,
    clearedInBank: false,
    isAuditVerified: false
  });

  const getNextVoucherSuggestion = useCallback((type: TransactionType) => {
    const prefix = type === TransactionType.INCOME ? 'R-' : 'V-';
    const nums = transactions
      .filter(t => t.voucherNumber.toUpperCase().startsWith(prefix))
      .map(t => parseInt(t.voucherNumber.slice(prefix.length).replace(/\D/g, ''), 10))
      .filter(n => !isNaN(n));
    const maxNum = nums.length > 0 ? Math.max(...nums) : 0;
    return `${prefix}${String(maxNum + 1).padStart(2, '0')}`;
  }, [transactions]);

  const voucherValidation = useMemo(() => {
    const val = (formData.voucherNumber || '').trim().toUpperCase();
    if (!val) return { isDuplicate: false, isGap: false, suggested: '' };

    const prefix = formData.type === TransactionType.INCOME ? 'R-' : 'V-';
    const isDuplicate = transactions.some(t => t.voucherNumber.toUpperCase() === val);
    
    const currentNum = parseInt(val.slice(prefix.length).replace(/\D/g, ''), 10);
    const nums = transactions
      .filter(t => t.voucherNumber.toUpperCase().startsWith(prefix))
      .map(t => parseInt(t.voucherNumber.slice(prefix.length).replace(/\D/g, ''), 10))
      .filter(n => !isNaN(n));
    const maxNum = nums.length > 0 ? Math.max(...nums) : 0;
    const isGap = !isNaN(currentNum) && currentNum > maxNum + 1;
    const suggested = getNextVoucherSuggestion(formData.type as TransactionType);

    return { isDuplicate, isGap, suggested };
  }, [formData.voucherNumber, formData.type, transactions, getNextVoucherSuggestion]);

  const toggleBankStatus = (t: Transaction) => {
    updateTransaction({ ...t, clearedInBank: !t.clearedInBank });
  };

  const toggleAuditStatus = (t: Transaction) => {
    if (window.confirm('Marking as Audit Verified will lock this record from deletion. Proceed?')) {
      updateTransaction({ ...t, isAuditVerified: !t.isAuditVerified });
    }
  };

  const openAddModal = (type: TransactionType) => {
    const sugg = getNextVoucherSuggestion(type);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      description: '',
      category: accountMode !== 'ALL' ? (accountMode as FundCategory) : FundCategory.REGULAR,
      accountHead: type === TransactionType.INCOME ? AccountHead.GRANT : AccountHead.REFRESHMENT,
      type: type,
      amount: 0,
      voucherNumber: sugg,
      paymentMode: 'Cash',
      volunteerCount: 0,
      clearedInBank: false,
      isAuditVerified: false
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (new Date(formData.date!) > new Date()) {
      alert("Error: Future dated transactions are not allowed by NSS audit norms.");
      return;
    }
    if (voucherValidation.isDuplicate) {
      alert("Error: Duplicate voucher number detected. Each entry must have a unique identifier.");
      return;
    }
    const cleanVoucher = (formData.voucherNumber || '').trim().toUpperCase();
    const newTransaction: Transaction = { 
      ...formData as Transaction, 
      id: Date.now().toString(), 
      voucherNumber: cleanVoucher,
      auditTrail: []
    };
    addTransaction(newTransaction);
    setIsModalOpen(false);
  };

  const displayTransactions = useMemo(() => {
    let result = [...transactions];
    if (accountMode !== 'ALL') result = result.filter(t => t.category === accountMode);
    const sorted = result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let bal = 0;
    const withBal = sorted.map(t => {
      if (t.type === TransactionType.INCOME) bal += t.amount;
      else bal -= t.amount;
      return { ...t, runningBalance: bal };
    });
    return sortBy === 'date-desc' ? withBal.reverse() : withBal;
  }, [transactions, accountMode, sortBy]);

  return (
    <div className="space-y-8">
      <input type="file" ref={rowFileInputRef} className="hidden" accept="image/*" onChange={(e) => {
        const file = e.target.files?.[0];
        if (file && activeTransactionForUpload) {
          const reader = new FileReader();
          reader.onloadend = () => updateTransaction({ ...activeTransactionForUpload, billImage: reader.result as string });
          reader.readAsDataURL(file);
        }
      }} />

      <div className="flex bg-white p-2 rounded-[1.5rem] border border-slate-200 shadow-sm max-w-fit">
        {[FundCategory.REGULAR, FundCategory.SPECIAL_CAMP, 'ALL'].map((mode) => (
          <button 
            key={mode}
            onClick={() => setAccountMode(mode as any)}
            className={`px-8 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${accountMode === mode ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            {mode === 'ALL' ? 'Consolidated' : mode}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[3rem] shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-10 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/30">
          <div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Institutional Audit Ledger</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
               Official Account Record: {accountMode}
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => openAddModal(TransactionType.INCOME)}
              className="bg-emerald-600 text-white px-8 py-3.5 rounded-2xl font-black text-xs shadow-lg shadow-emerald-200 hover:scale-105 transition-all flex items-center gap-3"
            >📥 New Receipt</button>
            <button 
              onClick={() => openAddModal(TransactionType.EXPENSE)}
              className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black text-xs shadow-lg shadow-indigo-200 hover:scale-105 transition-all flex items-center gap-3"
            >📑 New Payment</button>
          </div>
        </div>

        {displayTransactions.length === 0 ? (
          <div className="p-24 text-center">
             <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center text-5xl mx-auto mb-8 animate-bounce">📭</div>
             <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight">No Transactions Recorded</h4>
             <p className="text-slate-400 font-medium max-w-xs mx-auto mt-2 leading-relaxed">The audit ledger for {accountMode} is currently empty. Start by recording a receipt or payment.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b">
                  <th className="px-10 py-6">Status</th>
                  <th className="px-10 py-6">Voucher</th>
                  <th className="px-10 py-6">Date</th>
                  <th className="px-10 py-6">Purpose</th>
                  <th className="px-10 py-6 text-right">Debit (Exp)</th>
                  <th className="px-10 py-6 text-right">Credit (Inc)</th>
                  <th className="px-10 py-6 text-right bg-slate-100/30">Balance</th>
                  <th className="px-10 py-6 text-center">Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayTransactions.map((t) => (
                  <React.Fragment key={t.id}>
                    <tr 
                      onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}
                      className={`hover:bg-slate-50 transition-colors cursor-pointer group ${t.isAuditVerified ? 'bg-emerald-50/20' : ''} ${expandedId === t.id ? 'bg-indigo-50/40' : ''}`}
                    >
                      <td className="px-10 py-6">
                        <button onClick={(e) => { e.stopPropagation(); toggleBankStatus(t); }} className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all ${t.clearedInBank ? 'bg-emerald-100 border-emerald-200 text-emerald-700 shadow-sm' : 'bg-slate-100 border-slate-200 text-slate-400 hover:border-indigo-200'}`}>
                          {t.paymentMode === 'Cash' ? '💵' : t.clearedInBank ? '✓' : '⌛'}
                        </button>
                      </td>
                      <td className="px-10 py-6 text-sm font-mono font-black text-indigo-900">{t.voucherNumber}</td>
                      <td className="px-10 py-6 text-sm font-bold text-slate-500">{t.date}</td>
                      <td className="px-10 py-6">
                        <p className="text-[10px] font-black text-indigo-400 uppercase leading-none mb-1 tracking-widest">{t.accountHead}</p>
                        <p className="text-sm font-black text-slate-800">{t.description}</p>
                      </td>
                      <td className="px-10 py-6 text-right text-sm font-black text-rose-600">
                        {t.type === TransactionType.EXPENSE ? `₹${t.amount.toLocaleString()}` : '—'}
                      </td>
                      <td className="px-10 py-6 text-right text-sm font-black text-emerald-600">
                        {t.type === TransactionType.INCOME ? `₹${t.amount.toLocaleString()}` : '—'}
                      </td>
                      <td className="px-10 py-6 text-right text-sm font-black text-slate-900 bg-slate-50/50">
                        ₹{(t as any).runningBalance.toLocaleString()}
                      </td>
                      <td className="px-10 py-6 text-center">
                        <div className="flex items-center justify-center gap-3">
                           <button onClick={(e) => { e.stopPropagation(); toggleAuditStatus(t); }} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${t.isAuditVerified ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-slate-200 text-slate-400 hover:bg-slate-300'}`}>
                             🛡️
                           </button>
                           {!t.isAuditVerified && (
                             <button onClick={(e) => { e.stopPropagation(); if(confirm('Delete record?')) deleteTransaction(t.id); }} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:bg-red-50 hover:text-red-500 transition-colors">🗑️</button>
                           )}
                        </div>
                      </td>
                    </tr>
                    
                    {expandedId === t.id && (
                      <tr>
                        <td colSpan={8} className="px-10 py-12 bg-slate-50/80 backdrop-blur-sm animate-in slide-in-from-top-4 duration-500">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                            {/* Audit Trail */}
                            <div>
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8">Digital Audit Fingerprint</h4>
                              <div className="space-y-8 relative before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-100">
                                {t.auditTrail?.map((audit, idx) => (
                                  <div key={idx} className="relative pl-10">
                                    <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-white border-4 border-indigo-600 z-10 shadow-sm"></div>
                                    <p className="text-sm font-black text-slate-800 uppercase tracking-tight">
                                      {audit.action}
                                      <span className="ml-3 font-bold normal-case text-indigo-400 text-xs">
                                        @{audit.user.split('@')[0]}
                                      </span>
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-bold mt-1.5 uppercase">
                                      {new Date(audit.timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                                    </p>
                                  </div>
                                ))}
                                {(!t.auditTrail || t.auditTrail.length === 0) && (
                                  <p className="text-xs font-bold text-slate-400 italic pl-10">Historical record before audit trail implementation.</p>
                                )}
                              </div>
                            </div>

                            {/* Details & Attachment */}
                            <div className="space-y-8">
                              <div className="grid grid-cols-2 gap-6">
                                <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Payment Method</p>
                                  <p className="text-lg font-black text-indigo-900">{t.paymentMode}</p>
                                </div>
                                <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Fund Channel</p>
                                  <p className="text-lg font-black text-indigo-900">{t.category}</p>
                                </div>
                              </div>
                              
                              {t.volunteerCount! > 0 && (
                                <div className="p-8 bg-indigo-950 text-white rounded-[2rem] shadow-2xl relative overflow-hidden">
                                  <div className="absolute top-0 right-0 p-8 text-4xl opacity-10">👥</div>
                                  <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-2">Volunteer Participation</p>
                                  <p className="text-3xl font-black">{t.volunteerCount} Volunteers</p>
                                  <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                                     <span className="text-[10px] font-black uppercase text-indigo-400">Unit Cost Impact</span>
                                     <span className="font-black text-emerald-400">₹{Math.round(t.amount/t.volunteerCount!)} / head</span>
                                  </div>
                                </div>
                              )}

                              <div className="flex gap-4">
                                 <button 
                                   onClick={(e) => { e.stopPropagation(); setActiveTransactionForUpload(t); rowFileInputRef.current?.click(); }}
                                   className="flex-1 bg-white border-2 border-slate-200 py-4 rounded-[1.5rem] text-xs font-black hover:bg-slate-50 hover:border-indigo-500 transition-all flex items-center justify-center gap-3"
                                 >
                                   📸 {t.billImage ? 'Update Document' : 'Upload Receipt'}
                                 </button>
                                 {t.billImage && (
                                   <button 
                                     onClick={(e) => { e.stopPropagation(); const win = window.open(""); win?.document.write(`
                                       <html><head><title>NSS Receipt - ${t.voucherNumber}</title></head>
                                       <body style="margin:0;display:flex;align-items:center;justify-content:center;background:#000;">
                                         <img src="${t.billImage}" style="max-width:100%;max-height:100%;object-fit:contain;">
                                       </body></html>
                                     `); }}
                                     className="flex-1 bg-indigo-900 text-white py-4 rounded-[1.5rem] text-xs font-black shadow-xl shadow-indigo-100 hover:bg-indigo-800 transition-all"
                                   >
                                     🔍 View Full Receipt
                                   </button>
                                 )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-6">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in slide-in-from-bottom-10 duration-500">
            <div className="px-10 py-8 border-b flex justify-between items-center bg-slate-50/50">
              <div>
                <h4 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Record {formData.type}</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">St. Paul College NSS Unit Audit Entry</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="bg-white w-12 h-12 rounded-full shadow-sm flex items-center justify-center font-bold hover:bg-red-50 hover:text-red-500 transition-all">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2 relative">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Voucher Number</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      required 
                      className={`w-full border-2 p-4 rounded-2xl font-mono text-xl font-bold outline-none transition-all ${
                        voucherValidation.isDuplicate 
                        ? 'border-red-500 bg-red-50 text-red-900' 
                        : voucherValidation.isGap 
                        ? 'border-amber-400 bg-amber-50 text-amber-900' 
                        : 'border-slate-100 focus:border-indigo-500 bg-slate-50/50'
                      }`} 
                      value={formData.voucherNumber} 
                      onChange={(e) => setFormData({...formData, voucherNumber: e.target.value.toUpperCase()})} 
                    />
                    {(voucherValidation.isDuplicate || voucherValidation.isGap) && (
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, voucherNumber: voucherValidation.suggested})}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black bg-indigo-950 text-white px-3 py-1.5 rounded-xl hover:bg-indigo-900 transition-colors"
                      >
                        FIX SEQ
                      </button>
                    )}
                  </div>
                  {voucherValidation.isDuplicate && <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mt-1">Duplicate - Check physical ledger</p>}
                  {voucherValidation.isGap && !voucherValidation.isDuplicate && <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mt-1">Gap Detected (Next: {voucherValidation.suggested})</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entry Date</label>
                  <input type="date" required className="w-full border-2 p-4 rounded-2xl text-xl font-bold outline-none border-slate-100 focus:border-indigo-500 bg-slate-50/50" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Narration / Purpose</label>
                <input type="text" placeholder="Detailed description for audit..." required className="w-full border-2 p-4 rounded-2xl font-bold outline-none border-slate-100 focus:border-indigo-500 bg-slate-50/50" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gross Amount (₹)</label>
                  <input type="number" required className="w-full border-2 p-4 rounded-2xl text-3xl font-black outline-none border-slate-100 focus:border-indigo-500 bg-slate-50/50" value={formData.amount} onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || 0})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Audit Head</label>
                  <select className="w-full border-2 p-4 rounded-2xl font-bold outline-none border-slate-100 bg-slate-50/50 cursor-pointer" value={formData.accountHead} onChange={(e) => setFormData({...formData, accountHead: e.target.value as AccountHead})}>
                    {Object.values(AccountHead).map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              </div>

              {formData.accountHead === AccountHead.REFRESHMENT && (
                <div className="p-6 bg-indigo-50/50 rounded-[2rem] border-2 border-indigo-100/50 flex flex-col md:flex-row items-center gap-6">
                  <div className="flex-1">
                    <label className="text-[10px] font-black text-indigo-400 uppercase block mb-2 tracking-widest">Volunteer Headcount</label>
                    <input type="number" placeholder="No. of volunteers..." className="w-full p-3 bg-white rounded-2xl border-2 border-indigo-100 outline-none font-black text-indigo-900" value={formData.volunteerCount} onChange={(e) => setFormData({...formData, volunteerCount: parseInt(e.target.value) || 0})} />
                  </div>
                  <div className="flex-[2]">
                    <p className="text-[10px] text-indigo-400/80 font-bold italic leading-relaxed">
                      Audit Note: University guidelines cap refreshment at approx. ₹25-30 per head for Regular Activities. 
                      Ensure signature muster matches this count.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button 
                  type="submit" 
                  disabled={voucherValidation.isDuplicate || !formData.description || formData.amount === 0}
                  className={`flex-1 py-5 rounded-[2rem] font-black text-xl shadow-2xl transition-all active:scale-95 ${
                    (voucherValidation.isDuplicate || !formData.description || formData.amount === 0)
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                    : 'bg-indigo-900 text-white shadow-indigo-900/40 hover:bg-indigo-950'
                  }`}
                >
                  POST TO LEDGER
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ledger;
