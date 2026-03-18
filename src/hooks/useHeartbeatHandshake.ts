import { useState, useCallback, useRef, useEffect } from 'react';
import { HostSignal, HandshakeStatus, HandshakeDecision } from '../../types';

interface HandshakeConfig {
  watchdogTimeout: number; // seconds
  latencyThreshold: number; // seconds
  minCoherence: number;
}

const DEFAULT_CONFIG: HandshakeConfig = {
  watchdogTimeout: 0.05,
  latencyThreshold: 0.1,
  minCoherence: 0.4
};

export const useHeartbeatHandshake = (config: Partial<HandshakeConfig> = {}) => {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  
  const [status, setStatus] = useState<HandshakeStatus>({
    decision: 'NOMINAL_SYNC',
    powerScale: 1.0,
    latency: 0,
    lastHeartbeat: Date.now(),
    hostFaultActive: false
  });

  const lastHeartbeatRef = useRef<number>(Date.now());

  const sync = useCallback((hostSignal: HostSignal, azraelCoherence: number) => {
    const currentTime = Date.now();
    
    // 1. Check for Host-Side Latency
    if (hostSignal.heartbeat_pulse) {
      lastHeartbeatRef.current = currentTime;
    }
    
    const latency = (currentTime - lastHeartbeatRef.current) / 1000; // in seconds
    const hostFaultActive = hostSignal.hardware_fault || hostSignal.emergency_stop || hostSignal.thermal_critical;

    let decision: HandshakeDecision = 'NOMINAL_SYNC';
    let powerScale = 1.0;

    // 3. Decision Matrix: The Shepherd's Handshake
    if (hostFaultActive || latency > fullConfig.latencyThreshold) {
      decision = 'FORCE_COMPLIANT_SHUTDOWN';
      powerScale = 0.0;
    } else if (azraelCoherence < fullConfig.minCoherence) {
      decision = 'DEGRADED_OPERATION_WARNING';
      powerScale = 0.3;
    }

    setStatus({
      decision,
      powerScale,
      latency,
      lastHeartbeat: lastHeartbeatRef.current,
      hostFaultActive
    });

    return { decision, powerScale };
  }, [fullConfig]);

  // Monitor latency in real-time even without sync calls
  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = Date.now();
      const latency = (currentTime - lastHeartbeatRef.current) / 1000;
      
      if (latency > fullConfig.latencyThreshold) {
        setStatus(prev => ({
          ...prev,
          latency,
          decision: 'FORCE_COMPLIANT_SHUTDOWN',
          powerScale: 0.0
        }));
      } else {
        setStatus(prev => ({ ...prev, latency }));
      }
    }, 50);

    return () => clearInterval(interval);
  }, [fullConfig.latencyThreshold]);

  return {
    status,
    sync
  };
};
