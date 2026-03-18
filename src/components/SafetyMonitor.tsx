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
import { SafetyStatus, OperationalMode, HandshakeStatus } from '../../types';

interface SafetyMonitorProps {
  status: SafetyStatus;
  handshake?: HandshakeStatus;
  onReset?: () => void;
}

const MODE_COLORS: Record<OperationalMode, string> = {
  NOMINAL: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10',
  DEGRADED: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10',
  RESTRICTED: 'text-amber-400 border-amber-400/30 bg-amber-400/10',
  CONSTRAINED: 'text-orange-400 border-orange-400/30 bg-orange-400/10',
  SURVIVAL: 'text-red-400 border-red-400/30 bg-red-400/10',
  SAFE_HOLD: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
  EMERGENCY: 'text-purple-400 border-purple-400/30 bg-purple-400/10',
};

const HANDSHAKE_COLORS: Record<string, string> = {
  NOMINAL_SYNC: 'text-emerald-400',
  LATENCY_WARNING: 'text-amber-400 animate-pulse',
  DEGRADED_OPERATION_WARNING: 'text-yellow-400',
  FORCE_COMPLIANT_SHUTDOWN: 'text-red-400 animate-pulse',
};

export const SafetyMonitor: React.FC<SafetyMonitorProps> = ({ status, handshake, onReset }) => {
  const { mode, cognitiveScale, stiffnessScale, violations, driftTrajectory, accumulatedStress } = status;

  const systemHealth = Math.max(0, 100 - (accumulatedStress * 100) - (violations.length * 5) - (handshake ? handshake.latency * 100 : 0));

  return (
    <div className="p-4 bg-black/90 border border-brand-900/30 rounded-none backdrop-blur-md shadow-[0_0_30px_rgba(0,0,0,0.5)] font-mono text-[10px] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-500/50 to-transparent"></div>
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Shield className={`w-3 h-3 ${MODE_COLORS[mode].split(' ')[0]}`} />
            <span className="font-black tracking-[0.2em] uppercase text-gray-400">SAFETY_CORE // S-1792</span>
          </div>
          <div className="text-[8px] text-gray-600 mt-1 tracking-widest">SYSTEM_HEALTH: {systemHealth.toFixed(1)}%</div>
        </div>
        <div className={`px-3 py-1 border font-black tracking-widest ${MODE_COLORS[mode]}`}>
          {mode}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center text-gray-500 text-[8px] tracking-widest">
            <span>COGNITIVE_THROTTLE</span>
            <span className="text-gray-300">{(cognitiveScale * 100).toFixed(0)}%</span>
          </div>
          <div className="h-[2px] bg-gray-900 overflow-hidden">
            <motion.div 
              className="h-full bg-brand-500"
              initial={{ width: 0 }}
              animate={{ width: `${cognitiveScale * 100}%` }}
              transition={{ type: 'spring', stiffness: 100 }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-gray-500 text-[8px] tracking-widest">
            <span>MECHANICAL_IMPEDANCE</span>
            <span className="text-gray-300">{(stiffnessScale * 100).toFixed(0)}%</span>
          </div>
          <div className="h-[2px] bg-gray-900 overflow-hidden">
            <motion.div 
              className="h-full bg-blue-900"
              initial={{ width: 0 }}
              animate={{ width: `${stiffnessScale * 100}%` }}
              transition={{ type: 'spring', stiffness: 100 }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-6">
        <div className="flex justify-between items-center text-gray-500 text-[8px] tracking-widest">
          <span>ACCUMULATED_STRESS_LOAD</span>
          <span className={accumulatedStress > 0.7 ? 'text-brand-500 animate-pulse' : 'text-gray-300'}>
            {(accumulatedStress * 100).toFixed(1)}%
          </span>
        </div>
        <div className="h-1 bg-gray-950 overflow-hidden flex gap-[1px]">
          {Array.from({ length: 20 }).map((_, i) => (
            <div 
              key={i} 
              className={`h-full flex-1 transition-colors duration-300 ${
                (i / 20) < accumulatedStress 
                  ? (accumulatedStress > 0.8 ? 'bg-brand-500' : accumulatedStress > 0.5 ? 'bg-amber-600' : 'bg-gray-700') 
                  : 'bg-gray-900'
              }`}
            />
          ))}
        </div>
      </div>

      {handshake && (
        <div className="mb-6 p-3 border border-brand-900/20 bg-black/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-500">
              <Zap className="w-3 h-3" />
              <span className="uppercase text-[8px] font-black tracking-widest">HOST_HANDSHAKE_SYNC</span>
            </div>
            <span className={`text-[8px] font-black tracking-widest ${HANDSHAKE_COLORS[handshake.decision]}`}>
              {handshake.decision}
            </span>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-[8px] text-gray-600 tracking-widest">
              <span>SYNC_LATENCY</span>
              <span className={handshake.latency > 0.08 ? 'text-brand-500' : 'text-gray-400'}>
                {(handshake.latency * 1000).toFixed(0)}ms
              </span>
            </div>
            <div className="h-[1px] bg-gray-900 w-full overflow-hidden">
                <motion.div 
                    className={`h-full ${handshake.latency > 0.08 ? 'bg-brand-500' : 'bg-gray-600'}`}
                    animate={{ width: `${Math.min(100, (handshake.latency / 0.15) * 100)}%` }}
                />
            </div>
          </div>

          <div className="flex justify-between text-[8px] text-gray-600 tracking-widest">
            <span>POWER_SYNC_RATIO</span>
            <span className="text-gray-400">{(handshake.powerScale * 100).toFixed(0)}%</span>
          </div>

          {handshake.hostFaultActive && (
            <div className="flex items-center gap-2 text-brand-500 text-[8px] font-black uppercase animate-glitch border-t border-brand-900/20 pt-2">
              <AlertTriangle className="w-2 h-2" /> HARDWARE_FAULT_DETECTED // INTERVENTION_REQUIRED
            </div>
          )}
        </div>
      )}

      <div className="border-t border-brand-900/20 pt-4 space-y-4">
        <div className="flex items-center justify-between text-gray-600">
          <div className="flex items-center gap-2">
            <Activity className="w-3 h-3" />
            <span className="uppercase text-[8px] tracking-widest">ACTIVE_VIOLATIONS: {violations.length}</span>
          </div>
          {violations.length > 0 && <span className="text-brand-500 text-[8px] animate-pulse">!</span>}
        </div>

        <div className="max-h-32 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {violations.map((v) => (
              <motion.div 
                key={v.id}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 5 }}
                className={`flex flex-col p-2 border ${
                  v.severity === 'hard' ? 'border-brand-500/30 bg-brand-500/5 text-brand-400' : 'border-amber-500/30 bg-amber-500/5 text-amber-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="uppercase text-[8px] font-black tracking-widest">{v.type}</span>
                  <span className="text-[7px] opacity-50">{new Date(v.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-[7px] opacity-70 uppercase">Value: {v.value.toFixed(2)}</span>
                  <span className="text-[7px] opacity-70 uppercase">Limit: {v.limit.toFixed(2)}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {violations.length === 0 && (
            <div className="text-gray-800 text-[8px] italic py-2 tracking-widest">NO_ACTIVE_VIOLATIONS_DETECTED</div>
          )}
        </div>
      </div>

      {driftTrajectory && (
        <div className="mt-6 p-3 border border-blue-900/30 bg-blue-900/5 space-y-3">
          <div className="flex items-center gap-2 text-blue-500">
            <Wind className="w-3 h-3" />
            <span className="uppercase text-[8px] font-black tracking-widest">DRIFT_TRAJECTORY_DETECTED</span>
          </div>
          <div className="flex justify-between text-[8px] text-gray-600 tracking-widest">
            <span>TIME_TO_BOUNDARY</span>
            <span className={driftTrajectory.timeToBoundary < 3 ? 'text-brand-500 animate-glitch' : 'text-blue-400'}>
              {driftTrajectory.timeToBoundary.toFixed(2)}s
            </span>
          </div>
          <div className="h-[1px] bg-gray-900 w-full overflow-hidden">
            <motion.div 
                className={`h-full ${driftTrajectory.timeToBoundary < 3 ? 'bg-brand-500' : 'bg-blue-600'}`}
                animate={{ width: `${Math.min(100, (driftTrajectory.timeToBoundary / 10) * 100)}%` }}
            />
          </div>
          <div className="flex items-center gap-2">
            {driftTrajectory.interventionRequired ? (
              <div className="flex items-center gap-2 text-brand-500 text-[8px] font-black uppercase animate-pulse">
                <Lock className="w-2 h-2" /> INTERVENTION_REQUIRED
              </div>
            ) : (
              <div className="flex items-center gap-2 text-emerald-600 text-[8px] font-black uppercase">
                <Unlock className="w-2 h-2" /> RECOVERABLE_DRIFT
              </div>
            )}
          </div>
        </div>
      )}

      {onReset && (
        <button 
          onClick={onReset}
          className="mt-6 w-full py-3 flex items-center justify-center gap-3 border border-brand-900/30 bg-black hover:bg-brand-950 transition-all text-gray-600 hover:text-white group"
        >
          <RefreshCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" />
          <span className="uppercase text-[8px] font-black tracking-[0.3em]">RESET_SAFETY_CORE</span>
        </button>
      )}
    </div>
  );
};
