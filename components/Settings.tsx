
import React, { useRef } from 'react';
import { CollegeInfo } from '../types';

interface SettingsProps {
  collegeInfo: CollegeInfo;
  setCollegeInfo: (info: CollegeInfo) => void;
}

const Settings: React.FC<SettingsProps> = ({ collegeInfo, setCollegeInfo }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCollegeInfo({ ...collegeInfo, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-10 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">Institutional Profile</h3>
          <p className="text-slate-500 text-sm mt-1">Configure official details for reports, audit workbooks, and certificates.</p>
        </div>

        <div className="p-10 space-y-10">
          {/* Logo Section */}
          <div className="flex flex-col md:flex-row gap-10 items-start">
            <div className="space-y-4">
              <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] block">College Seal / Logo</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-48 h-48 rounded-[2rem] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-all group overflow-hidden relative"
              >
                {collegeInfo.logo ? (
                  <img src={collegeInfo.logo} className="w-full h-full object-cover p-4" alt="Logo Preview" />
                ) : (
                  <div className="text-center p-6">
                    <span className="text-4xl block mb-2">📸</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase leading-tight">Click to Upload Logo</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-indigo-900/0 group-hover:bg-indigo-900/10 transition-colors"></div>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
            </div>

            <div className="flex-1 grid grid-cols-1 gap-6 w-full">
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Full College Name</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold focus:border-indigo-500 focus:bg-white outline-none transition-all"
                  value={collegeInfo.name}
                  onChange={(e) => setCollegeInfo({...collegeInfo, name: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Address & Affiliation</label>
                <textarea 
                  rows={3}
                  className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold focus:border-indigo-500 focus:bg-white outline-none transition-all resize-none"
                  value={collegeInfo.address}
                  onChange={(e) => setCollegeInfo({...collegeInfo, address: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex justify-end">
             <button className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-lg shadow-xl shadow-indigo-200 hover:scale-105 active:scale-95 transition-all">
                Save Institution Info
             </button>
          </div>
        </div>
      </div>

      {/* Collaboration Section */}
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 p-10">
         <div className="flex items-center justify-between mb-8">
            <div>
               <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">Multi-User Collaboration</h3>
               <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Authorized Audit Contributors</p>
            </div>
            <button className="bg-slate-100 text-slate-600 px-6 py-2.5 rounded-xl font-black text-xs hover:bg-slate-200 transition-all">
               + Invite Collaborator
            </button>
         </div>

         <div className="space-y-4">
            {[
              { name: 'Dr. Rahul Mehta', email: 'rahul.nss@stpaul.edu', role: 'Admin', status: 'Online' },
              { name: 'Prof. S. K. Sharma', email: 'sk.sharma@stpaul.edu', role: 'Programme Officer', status: 'Last seen 2h ago' },
            ].map((collab, i) => (
              <div key={i} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-black text-indigo-600">
                       {collab.name[0]}
                    </div>
                    <div>
                       <p className="text-sm font-black text-slate-800">{collab.name}</p>
                       <p className="text-xs font-medium text-slate-500">{collab.email}</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">{collab.role}</p>
                    <p className="text-[10px] font-bold text-slate-400">{collab.status}</p>
                 </div>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default Settings;
