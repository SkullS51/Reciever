import { useState, useCallback, useEffect, useRef } from 'react';
import { 
  OperationalMode, 
  SafetyStatus, 
  ConstraintViolation, 
  ActionRequest, 
  FailOperationalConfig,
  DriftTrajectory
} from '../../types';
import { v4 as uuidv4 } from 'uuid';

const DEFAULT_CONFIG: FailOperationalConfig = {
  softLimitThreshold: 0.8,
  hardLimitThreshold: 1.0,
  violationDecayTime: 5000,
  stressDecayRate: 0.01,
  maxDriftTime: 10,
  recoveryCooldown: 10000,
  violationTime: 5000
};

export const useFailOperational = (config: Partial<FailOperationalConfig> = {}) => {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  
  const [status, setStatus] = useState<SafetyStatus>({
    mode: 'NOMINAL',
    cognitiveScale: 1.0,
    stiffnessScale: 1.0,
    violations: [],
    driftTrajectory: null,
    lastStableTimestamp: Date.now(),
    accumulatedStress: 0,
    isOperational: true,
  });

  const lastModeChange = useRef<number>(Date.now());

  // Logic to degrade mode based on violations and stress
  const calculateMode = useCallback((violations: ConstraintViolation[], stress: number): OperationalMode => {
    const hardViolations = violations.filter(v => v.severity === 'hard').length;
    const softViolations = violations.filter(v => v.severity === 'soft').length;

    if (hardViolations > 2 || stress > 0.9) return 'EMERGENCY';
    if (hardViolations > 0 || stress > 0.7) return 'SURVIVAL';
    if (softViolations > 3 || stress > 0.5) return 'CONSTRAINED';
    if (softViolations > 0 || stress > 0.3) return 'DEGRADED';
    
    return 'NOMINAL';
  }, []);

  // Cognitive and stiffness scaling based on mode
  const getScales = (mode: OperationalMode): { cognitive: number; stiffness: number } => {
    switch (mode) {
      case 'NOMINAL': return { cognitive: 1.0, stiffness: 1.0 };
      case 'DEGRADED': return { cognitive: 0.7, stiffness: 0.6 };
      case 'CONSTRAINED': return { cognitive: 0.4, stiffness: 0.3 };
      case 'SURVIVAL': return { cognitive: 0.1, stiffness: 0.1 };
      case 'SAFE_HOLD': return { cognitive: 0.0, stiffness: 0.0 };
      case 'EMERGENCY': return { cognitive: 0.05, stiffness: 0.2 };
      default: return { cognitive: 1.0, stiffness: 1.0 };
    }
  };

  const processAction = useCallback((action: ActionRequest, currentLimits: { magnitude: number; energy: number }) => {
    const newViolations: ConstraintViolation[] = [];
    
    // Check magnitude constraint
    if (action.magnitude > currentLimits.magnitude * fullConfig.hardLimitThreshold) {
      newViolations.push({
        id: uuidv4(),
        type: 'magnitude',
        severity: 'hard',
        value: action.magnitude,
        limit: currentLimits.magnitude,
        timestamp: Date.now(),
        decayRate: 0.1
      });
    } else if (action.magnitude > currentLimits.magnitude * fullConfig.softLimitThreshold) {
      newViolations.push({
        id: uuidv4(),
        type: 'magnitude',
        severity: 'soft',
        value: action.magnitude,
        limit: currentLimits.magnitude,
        timestamp: Date.now(),
        decayRate: 0.2
      });
    }

    // Check energy constraint
    if (action.energyCost > currentLimits.energy * fullConfig.hardLimitThreshold) {
      newViolations.push({
        id: uuidv4(),
        type: 'energy',
        severity: 'hard',
        value: action.energyCost,
        limit: currentLimits.energy,
        timestamp: Date.now(),
        decayRate: 0.1
      });
    }

    if (newViolations.length > 0) {
      setStatus(prev => {
        const updatedViolations = [...prev.violations, ...newViolations];
        const newStress = Math.min(1, prev.accumulatedStress + (newViolations.length * 0.05));
        const newMode = calculateMode(updatedViolations, newStress);
        const { cognitive, stiffness } = getScales(newMode);

        if (newMode !== prev.mode) {
          lastModeChange.current = Date.now();
        }

        return {
          ...prev,
          violations: updatedViolations,
          accumulatedStress: newStress,
          mode: newMode,
          cognitiveScale: cognitive,
          stiffnessScale: stiffness,
          isOperational: newMode !== 'EMERGENCY' && newMode !== 'SAFE_HOLD'
        };
      });
      return false; // Action rejected or triggered safety
    }

    return true; // Action safe
  }, [fullConfig, calculateMode]);

  // Background maintenance: decay stress and violations, handle drift
  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(prev => {
        const now = Date.now();
        
        // Decay violations
        const remainingViolations = prev.violations.filter(v => 
          (now - v.timestamp) < fullConfig.violationTime
        );

        // Decay stress
        const newStress = Math.max(0, prev.accumulatedStress - fullConfig.stressDecayRate);

        // Attempt recovery if cooldown passed
        let newMode = prev.mode;
        if (now - lastModeChange.current > fullConfig.recoveryCooldown) {
          newMode = calculateMode(remainingViolations, newStress);
        }

        const { cognitive, stiffness } = getScales(newMode);

        return {
          ...prev,
          violations: remainingViolations,
          accumulatedStress: newStress,
          mode: newMode,
          cognitiveScale: cognitive,
          stiffnessScale: stiffness,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [fullConfig, calculateMode]);

  const updateDrift = useCallback((trajectory: DriftTrajectory) => {
    setStatus(prev => ({
      ...prev,
      driftTrajectory: trajectory,
      mode: trajectory.interventionRequired ? 'SAFE_HOLD' : prev.mode
    }));
  }, []);

  return {
    status,
    processAction,
    updateDrift,
    config: fullConfig
  };
};
