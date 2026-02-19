
import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Ledger from './components/Ledger';
import Reports from './components/Reports';
import Certificates from './components/Certificates';
import Settings from './components/Settings';
import Volunteers from './components/Volunteers';
import { Transaction, TransactionType, FundCategory, DashboardStats, AccountHead, RecurringInterval, User, CollegeInfo, AuditEntry } from './types';

const INITIAL_COLLEGE: CollegeInfo = {
  name: "St. Paul College",
  address: "Ulhasnagar-421004, Affiliated to University of Mumbai",
  logo: "",
  unitCode: "B-22"
};

const SIMULATED_USER: User = {
  id: 'u1',
  name: 'Dr. Rahul Mehta',
  email: 'rahul.nss@stpaul.edu',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul',
  role: 'Admin'
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('nss_auth_v3') === 'true';
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('nss_transactions_v3');
    return saved ? JSON.parse(saved) : [];
  });
  const [collegeInfo, setCollegeInfo] = useState<CollegeInfo>(() => {
    const saved = localStorage.getItem('nss_college_v3');
    return saved ? JSON.parse(saved) : INITIAL_COLLEGE;
  });

  useEffect(() => {
    localStorage.setItem('nss_transactions_v3', JSON.stringify(transactions));
    localStorage.setItem('nss_college_v3', JSON.stringify(collegeInfo));
  }, [transactions, collegeInfo]);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('nss_auth_v3', 'true');
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('nss_auth_v3');
  };

  const addTransaction = (t: Transaction) => {
    const audit: AuditEntry = {
      timestamp: new Date().toISOString(),
      action: 'Created',
      user: SIMULATED_USER.email
    };
    setTransactions([{ ...t, auditTrail: [audit], addedBy: SIMULATED_USER.email }, ...transactions]);
  };

  const updateTransaction = (updatedT: Transaction) => {
    setTransactions(transactions.map(t => {
      if (t.id === updatedT.id) {
        let action: AuditEntry['action'] = 'Modified';
        if (t.isAuditVerified !== updatedT.isAuditVerified) action = 'Verified';
        if (t.clearedInBank !== updatedT.clearedInBank) action = 'Bank Status Changed';

        const audit: AuditEntry = {
          timestamp: new Date().toISOString(),
          action,
          user: SIMULATED_USER.email
        };
        const existingAudit = t.auditTrail || [];
        return { ...updatedT, auditTrail: [...existingAudit, audit] };
      }
      return t;
    }));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter(x => x.id !== id));
  };

  const handleImport = (importedData: any[]) => {
    const newTrans: Transaction[] = importedData.map((row, i) => {
      const type = (row.Type === TransactionType.INCOME || (row['Receipt (₹)'] && parseFloat(row['Receipt (₹)']) > 0)) 
        ? TransactionType.INCOME 
        : TransactionType.EXPENSE;
      
      const entry: Transaction = {
        id: `imported-${Date.now()}-${i}`,
        date: row.Date || row.date || new Date().toISOString().split('T')[0],
        description: row.Description || row.description || 'Imported Entry',
        category: row['Fund Category'] === FundCategory.SPECIAL_CAMP ? FundCategory.SPECIAL_CAMP : FundCategory.REGULAR,
        accountHead: row['Account Head'] || AccountHead.MISC,
        type: type,
        amount: parseFloat(row['Amount (₹)'] || row['Receipt (₹)'] || row['Payment (₹)'] || row.amount || 0),
        voucherNumber: row['Voucher/Receipt No'] || row.voucherNumber || `IMP-${i}`,
        paymentMode: row.Mode || 'Cash',
        addedBy: SIMULATED_USER.email,
        auditTrail: [{
          timestamp: new Date().toISOString(),
          action: 'Created',
          user: SIMULATED_USER.email + ' (via Import)'
        }]
      };
      return entry;
    });
    setTransactions([...newTrans, ...transactions]);
  };

  const calculateStats = (): DashboardStats => {
    return transactions.reduce((acc, t) => {
      if (t.type === TransactionType.INCOME) {
        acc.totalIncome += t.amount;
        if (t.paymentMode === 'Cash') acc.cashInHand += t.amount;
        else acc.cashAtBank += t.amount;
      } else {
        acc.totalExpense += t.amount;
        if (t.category === FundCategory.REGULAR) acc.regularSpent += t.amount;
        if (t.category === FundCategory.SPECIAL_CAMP) acc.campSpent += t.amount;
        if (t.paymentMode === 'Cash') acc.cashInHand -= t.amount;
        else acc.cashAtBank -= t.amount;
      }
      acc.balance = acc.totalIncome - acc.totalExpense;
      return acc;
    }, { totalIncome: 0, totalExpense: 0, balance: 0, regularSpent: 0, campSpent: 0, cashInHand: 0, cashAtBank: 0 });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-indigo-950 flex items-center justify-center p-6">
        <div className="bg-white rounded-[3rem] shadow-2xl max-w-md w-full p-12 text-center animate-in fade-in zoom-in duration-500">
           <div className="w-24 h-24 bg-indigo-100 rounded-3xl mx-auto mb-8 flex items-center justify-center text-4xl">
              📈
           </div>
           <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">AuditEasy</h1>
           <p className="text-slate-500 font-medium mb-10">Institutional NSS Finance & Audit Intelligence Hub</p>
           
           <button 
             onClick={handleLogin}
             className="w-full flex items-center justify-center gap-4 border-2 border-slate-100 py-4 rounded-2xl hover:bg-slate-50 transition-all font-bold text-slate-700 active:scale-95"
           >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" alt="Google" />
              Sign in with Google
           </button>
           
           <div className="mt-10 pt-10 border-t border-slate-100">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Official NSS Cell Compliance System</p>
           </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard stats={calculateStats()} recentTransactions={transactions.slice(0, 5)} />;
      case 'ledger':
        return <Ledger transactions={transactions} addTransaction={addTransaction} deleteTransaction={deleteTransaction} updateTransaction={updateTransaction} />;
      case 'reports':
        return <Reports transactions={transactions} onImport={handleImport} />;
      case 'volunteers':
        return <Volunteers />;
      case 'certificates':
        return <Certificates collegeInfo={collegeInfo} />;
      case 'settings':
        return <Settings collegeInfo={collegeInfo} setCollegeInfo={setCollegeInfo} />;
      default:
        return <Dashboard stats={calculateStats()} recentTransactions={transactions.slice(0, 5)} />;
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      collegeInfo={collegeInfo} 
      user={SIMULATED_USER}
      onSignOut={handleSignOut}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
