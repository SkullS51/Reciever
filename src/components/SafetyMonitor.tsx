import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  Shield, 
  Activity, 
  Zap, 
  Thermometer, 
  Wind, 
  Lock, 
  Unlock, 
  RefreshCw 
} from 'lucide-react';
import { SafetyStatus, OperationalMode } from '../../types';

interface SafetyMonitorProps {
  status: SafetyStatus;
  onReset?: () => void;
}

const MODE_COLORS: Record<OperationalMode, string> = {
  NOMINAL: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10',
  DEGRADED: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10',
  CONSTRAINED: 'text-orange-400 border-orange-400/30 bg-orange-400/10',
  SURVIVAL: 'text-red-400 border-red-400/30 bg-red-400/10',
  SAFE_HOLD: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
  EMERGENCY: 'text-purple-400 border-purple-400/30 bg-purple-400/10',
};

export const SafetyMonitor: React.FC<SafetyMonitorProps> = ({ status, onReset }) => {
  const { mode, cognitiveScale, stiffnessScale, violations, driftTrajectory, accumulatedStress } = status;

  return (
    <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-xl backdrop-blur-md shadow-2xl font-mono text-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className={`w-4 h-4 ${MODE_COLORS[mode].split(' ')[0]}`} />
          <span className="font-bold tracking-tighter uppercase">Safety System // AZRAEL</span>
        </div>
        <div className={`px-2 py-0.5 rounded border text-[10px] font-bold ${MODE_COLORS[mode]}`}>
          {mode}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center text-zinc-500">
            <span>COGNITIVE_SCALE</span>
            <span className="text-zinc-300">{(cognitiveScale * 100).toFixed(0)}%</span>
          </div>
          <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${cognitiveScale * 100}%` }}
              transition={{ type: 'spring', stiffness: 100 }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-zinc-500">
            <span>STIFFNESS_SCALE</span>
            <span className="text-zinc-300">{(stiffnessScale * 100).toFixed(0)}%</span>
          </div>
          <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${stiffnessScale * 100}%` }}
              transition={{ type: 'spring', stiffness: 100 }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center text-zinc-500">
          <span>ACCUMULATED_STRESS</span>
          <span className={accumulatedStress > 0.7 ? 'text-red-400' : 'text-zinc-300'}>
            {(accumulatedStress * 100).toFixed(1)}%
          </span>
        </div>
        <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
          <motion.div 
            className={`h-full ${accumulatedStress > 0.7 ? 'bg-red-500' : 'bg-zinc-400'}`}
            initial={{ width: 0 }}
            animate={{ width: `${accumulatedStress * 100}%` }}
          />
        </div>
      </div>

      <div className="border-t border-zinc-800 pt-4 space-y-3">
        <div className="flex items-center gap-2 text-zinc-400">
          <Activity className="w-3 h-3" />
          <span className="uppercase text-[10px]">Active Violations: {violations.length}</span>
        </div>

        <div className="max-h-24 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {violations.map((v) => (
              <motion.div 
                key={v.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className={`flex items-center justify-between p-1.5 rounded border ${
                  v.severity === 'hard' ? 'border-red-500/30 bg-red-500/5 text-red-400' : 'border-yellow-500/30 bg-yellow-500/5 text-yellow-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-3 h-3" />
                  <span className="uppercase text-[9px] font-bold">{v.type}</span>
                </div>
                <span className="text-[9px] opacity-70">
                  {v.value.toFixed(1)} / {v.limit.toFixed(1)}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
          {violations.length === 0 && (
            <div className="text-zinc-600 text-[9px] italic py-2">No active constraint violations.</div>
          )}
        </div>
      </div>

      {driftTrajectory && (
        <div className="mt-4 p-2 rounded border border-blue-500/20 bg-blue-500/5 space-y-2">
          <div className="flex items-center gap-2 text-blue-400">
            <Wind className="w-3 h-3" />
            <span className="uppercase text-[10px] font-bold">Drift Detected</span>
          </div>
          <div className="flex justify-between text-[9px] text-zinc-400">
            <span>TIME_TO_BOUNDARY</span>
            <span className={driftTrajectory.timeToBoundary < 3 ? 'text-red-400 animate-pulse' : 'text-blue-300'}>
              {driftTrajectory.timeToBoundary.toFixed(2)}s
            </span>
          </div>
          <div className="flex items-center gap-2">
            {driftTrajectory.interventionRequired ? (
              <div className="flex items-center gap-1 text-red-400 text-[9px] font-bold uppercase">
                <Lock className="w-2 h-2" /> Intervention Required
              </div>
            ) : (
              <div className="flex items-center gap-1 text-emerald-400 text-[9px] font-bold uppercase">
                <Unlock className="w-2 h-2" /> Recoverable
              </div>
            )}
          </div>
        </div>
      )}

      {onReset && (
        <button 
          onClick={onReset}
          className="mt-4 w-full py-2 flex items-center justify-center gap-2 rounded border border-zinc-700 hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-zinc-200"
        >
          <RefreshCw className="w-3 h-3" />
          <span className="uppercase text-[10px] font-bold">Reset Safety Core</span>
        </button>
      )}
    </div>
  );
};
