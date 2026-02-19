
import React, { useState } from 'react';

const Volunteers: React.FC = () => {
  const [volunteers, setVolunteers] = useState([
    { id: '1', name: 'Rahul Patil', rollNo: 'A-22-01', status: 'Active', hours: 120 },
    { id: '2', name: 'Sneha Gupta', rollNo: 'A-22-15', status: 'Active', hours: 95 },
  ]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 p-10">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Volunteer Roster</h3>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Academic Year 2024-25</p>
          </div>
          <button className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-sm shadow-xl shadow-indigo-200 hover:scale-105 transition-all">
            + Add New Volunteer
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                <th className="pb-4 px-2">Roll No</th>
                <th className="pb-4 px-2">Full Name</th>
                <th className="pb-4 px-2 text-center">Service Hours</th>
                <th className="pb-4 px-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {volunteers.map((vol) => (
                <tr key={vol.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="py-6 px-2 font-mono text-sm font-bold text-slate-500">{vol.rollNo}</td>
                  <td className="py-6 px-2 text-slate-900 font-black">{vol.name}</td>
                  <td className="py-6 px-2 text-center">
                    <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-black text-xs">
                      {vol.hours}h
                    </div>
                  </td>
                  <td className="py-6 px-2 text-right">
                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-black text-[10px] uppercase">
                      {vol.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Volunteers;
