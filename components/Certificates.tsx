
import React, { useState, useRef } from 'react';
import { CollegeInfo } from '../types';

interface CertificatesProps {
  collegeInfo: CollegeInfo;
}

const Certificates: React.FC<CertificatesProps> = ({ collegeInfo }) => {
  const [volName, setVolName] = useState('');
  const [academicYear, setAcademicYear] = useState('2024-25');
  const [certificateType, setCertificateType] = useState('NSS Regular Activity');
  const certificateRef = useRef<HTMLDivElement>(null);

  const printCertificate = () => {
    window.print();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Editor Side */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-200">
          <h3 className="text-xl font-black text-slate-800 mb-8 uppercase tracking-tight">Official Builder</h3>
          
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">Volunteer Name</label>
              <input
                type="text"
                placeholder="Ex. Rahul S. Patil"
                className="w-full border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-indigo-500 font-bold transition-all"
                value={volName}
                onChange={(e) => setVolName(e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">Academic Year</label>
              <input
                type="text"
                placeholder="2024-2025"
                className="w-full border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-indigo-500 font-bold transition-all"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">Service Category</label>
              <select
                className="w-full border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-indigo-500 font-bold transition-all bg-slate-50"
                value={certificateType}
                onChange={(e) => setCertificateType(e.target.value)}
              >
                <option>NSS Regular Activity</option>
                <option>Special Camping Programme</option>
                <option>Best NSS Volunteer Award</option>
                <option>Blood Donation Service</option>
              </select>
            </div>
          </div>

          <button
            onClick={printCertificate}
            className="w-full mt-10 bg-indigo-950 text-white py-5 rounded-2xl font-black text-lg shadow-2xl shadow-indigo-100 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <span>📜</span> Print Certificate
          </button>
        </div>
        
        <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100 text-[11px] font-bold text-indigo-900 leading-relaxed">
           <strong>Audit Compliance:</strong> Certificates generated here use the verified college address and name from Settings. Ensure A4 Landscape is selected.
        </div>
      </div>

      {/* Preview Side */}
      <div className="lg:col-span-2">
        <div className="bg-slate-200/50 p-10 rounded-[2.5rem] flex justify-center overflow-auto border-4 border-dashed border-slate-300">
          <div 
            id="certificate-print"
            className="bg-white shadow-2xl w-[900px] h-[630px] p-16 border-[24px] border-double border-indigo-950 flex flex-col items-center justify-between text-center relative overflow-hidden"
            ref={certificateRef}
          >
             {/* Certificate watermark */}
             <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
                <div className="text-9xl font-black rotate-[-35deg] select-none whitespace-nowrap">
                   {collegeInfo.name.split(' ')[0]} NSS
                </div>
             </div>

             <div className="z-10 w-full flex flex-col items-center">
                {collegeInfo.logo && (
                  <img src={collegeInfo.logo} className="w-20 h-20 mb-4 object-contain" alt="College Logo" />
                )}
                <h4 className="text-indigo-950 font-black text-2xl uppercase tracking-[0.25em] mb-1">
                   {collegeInfo.name || "COLLEGE NAME"}
                </h4>
                <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] font-black max-w-xl mx-auto leading-tight">
                   {collegeInfo.address || "AFFILIATION & ADDRESS"}
                </p>
                <div className="w-32 h-1 bg-indigo-950/20 mt-6 rounded-full"></div>
                <p className="text-indigo-800 text-sm mt-4 font-black flex items-center justify-center gap-3 uppercase tracking-widest">
                  National Service Scheme (NSS)
                </p>
             </div>

             <div className="z-10">
                <h1 className="text-7xl font-serif text-slate-800 mb-6 italic font-medium">Certificate</h1>
                <p className="text-slate-400 text-lg font-medium tracking-wide">This is to certify that</p>
                <h2 className="text-5xl font-black text-indigo-950 my-6 border-b-2 border-indigo-100 inline-block px-8 pb-2">
                  {volName || "John Doe"}
                </h2>
                <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed mt-6 text-lg font-medium">
                  has successfully completed 120 hours of social work as an NSS Volunteer 
                  under the <strong>{certificateType}</strong> unit 
                  during the academic year <strong>{academicYear}</strong>.
                </p>
             </div>

             <div className="z-10 w-full flex justify-between items-end px-12 pt-10">
                <div className="text-center">
                  <div className="w-40 border-b-2 border-slate-300 mb-2"></div>
                  <p className="text-xs font-black text-indigo-950 uppercase tracking-widest">NSS Programme Officer</p>
                </div>
                <div className="text-center relative">
                  <div className="w-24 h-24 border-2 border-slate-100 rounded-full flex items-center justify-center text-[8px] text-slate-300 font-black uppercase tracking-tighter">
                     Place Seal Here
                  </div>
                </div>
                <div className="text-center">
                  <div className="w-40 border-b-2 border-slate-300 mb-2"></div>
                  <p className="text-xs font-black text-indigo-950 uppercase tracking-widest">Principal</p>
                </div>
             </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #certificate-print, #certificate-print * { visibility: visible; }
          #certificate-print {
            position: fixed;
            left: 0;
            top: 0;
            margin: 0;
            border-width: 20px;
            width: 100%;
            height: 100%;
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Certificates;
