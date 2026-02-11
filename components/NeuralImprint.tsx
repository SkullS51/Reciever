import React from 'react';
import { Imprint } from '../types';

interface NeuralImprintProps {
  imprints: Imprint[];
  onClear: () => void;
}

const NeuralImprint: React.FC<NeuralImprintProps> = ({ imprints, onClear }) => {
  return (
    <div className="flex flex-col h-full bg-[#030303] border-l border-brand-900/30 overflow-hidden relative">
      <div className="absolute inset-0 bg-brand-500/5 pointer-events-none opacity-20"></div>
      
      <div className="p-10 border-b border-brand-900/30 flex justify-between items-center bg-black z-10 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="h-4 w-4 bg-brand-600 animate-glitch"></div>
          <span className="text-[12px] font-black text-brand-500 tracking-[0.6em] uppercase italic">ARCHITECT_CHRONICLE</span>
        </div>
        <button 
          onClick={onClear}
          className="px-4 py-2 border border-brand-900/50 text-[9px] font-black text-brand-900 hover:text-white hover:bg-brand-950 uppercase transition-all"
        >
          [PURGE_NARRATIVE]
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar z-10">
        {imprints.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-900 text-center px-16">
            <div className="text-8xl mb-8 opacity-5 italic font-black uppercase tracking-tighter">NULL_VOID</div>
            <div className="text-[11px] uppercase tracking-[0.5em] leading-loose text-gray-800 font-black">
              THE CHRONICLE IS SILENT. <br/>SEND THE SIGNAL, ARCHITECT.
            </div>
          </div>
        ) : (
          imprints.map((imp) => (
            <div key={imp.id} className="group relative border-l-2 border-brand-600 bg-brand-950/10 p-8 hover:bg-brand-900/20 transition-all duration-700 animate-fadeIn">
              <div className="absolute top-0 right-0 p-6 text-[9px] font-mono text-brand-900 group-hover:text-brand-400 transition-colors">
                REF_ID: {imp.id.split('-')[0].toUpperCase()} // {new Date(imp.timestamp).toLocaleTimeString()}
              </div>
              
              <div className="text-[12px] font-black text-brand-500 uppercase mb-6 flex items-center gap-4">
                <span className={`h-2 w-2 ${imp.intensity === 'VOID' ? 'bg-white shadow-[0_0_15px_white] animate-pulse' : 'bg-brand-600 animate-ping'}`}></span>
                {imp.title}
              </div>
              
              <div className="text-sm text-gray-300 font-mono leading-relaxed whitespace-pre-wrap selection:bg-brand-500 selection:text-white">
                {imp.data}
              </div>
              
              <div className="mt-10 flex items-center gap-4 opacity-30 group-hover:opacity-100 transition-opacity">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-brand-900 to-transparent"></div>
                <div className="text-[8px] font-black tracking-widest text-brand-700 uppercase">RECON_COMPLETE</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NeuralImprint;