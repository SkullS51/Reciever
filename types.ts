
import React from 'react';

// Declare global Window interface augmentation for custom properties
declare global {
  interface Window {
    GROQ_API_KEY?: string;
  }
}

export enum Role {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system'
}

export enum ModelMode {
  Llama_70B = 'llama-3.3-70b-versatile',
  Llama_8B = 'llama-3.1-8b-instant',
  Llama3_70B = 'llama3-70b-8192',
  Llama3_8B = 'llama3-8b-8192',
  Gemini_Flash = 'gemini-3-flash-preview',
  Gemini_Pro = 'gemini-3.1-pro-preview'
}

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  isThinking?: boolean;
  isRetryable?: boolean;
  suggestion?: string;
}

export interface GenerationState {
  isGenerating: boolean;
  error: string | null;
}

export interface CodeBlockProps {
  language: string;
  code: string;
}

export interface CopiedSnippet {
  id: string;
  code: string;
  language: string;
  timestamp: number;
}

export interface Imprint {
  id: string;
  title: string;
  data: string;
  timestamp: number;
  intensity: 'LOW' | 'CRITICAL' | 'VOID';
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  isRetryable?: boolean;
  suggestion?: string;
}

export enum CommandPaletteAction {
  CLEAR_CHAT = 'CLEAR_CHAT',
  RE_RUN_LAST_QUERY = 'RE_RUN_LAST_QUERY',
  OPEN_SETTINGS = 'OPEN_SETTINGS',
  VIEW_CODE_HISTORY = 'VIEW_CODE_HISTORY',
  WORKSPACE_TOGGLE = 'WORKSPACE_TOGGLE',
  TRIGGER_IMPRINT = 'TRIGGER_IMPRINT',
}

export interface CommandPaletteItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  action: CommandPaletteAction;
}

// AZRAEL Fail-Operational Safety System Types
// Philosophy: "Drift rather than burn out"

export type OperationalMode = 
  | 'NOMINAL'      // 100% cognitive, 100% stiffness - Full capability
  | 'DEGRADED'     // 70% cognitive, 60% stiffness - Reduced planning
  | 'CONSTRAINED'  // 40% cognitive, 30% stiffness - Minimal control
  | 'SURVIVAL'     // 10% cognitive, 10% stiffness - Reactive only
  | 'SAFE_HOLD'    // 0% cognitive, 0% stiffness - Monitored drift
  | 'EMERGENCY';   // 5% cognitive, 20% stiffness - Minimal recovery

export interface ConstraintViolation {
  id: string;
  type: 'magnitude' | 'energy' | 'thermal' | 'temporal';
  severity: 'soft' | 'hard';
  value: number;
  limit: number;
  timestamp: number;
  decayRate: number; // violations fade over time if not repeated
}

export interface DriftTrajectory {
  currentPosition: number[];
  velocity: number[];
  predictedPath: number[][];
  timeToBoundary: number; // seconds until unrecoverable
  recoverable: boolean;
  interventionRequired: boolean;
  minimalInterventionForce: number[];
}

export interface SafetyStatus {
  mode: OperationalMode;
  cognitiveScale: number; // 0.0 to 1.0
  stiffnessScale: number; // 0.0 to 1.0
  violations: ConstraintViolation[];
  driftTrajectory: DriftTrajectory | null;
  lastStableTimestamp: number;
  accumulatedStress: number; // 0.0 to 1.0, decays over time
  isOperational: boolean;
}

export interface FailOperationalConfig {
  softLimitThreshold: number;     // e.g., 0.8 - start warning
  hardLimitThreshold: number;     // e.g., 1.0 - immediate action
  violationDecayTime: number;     // ms before soft violations fade
  stressDecayRate: number;        // how fast accumulated stress fades
  maxDriftTime: number;           // seconds before drift becomes unrecoverable
  recoveryCooldown: number;       // ms before mode can improve
  violationTime: number;          // ms before soft violations fade
}

export interface ActionRequest {
  id: string;
  magnitude: number;
  energyCost: number;
  target: number[];
  timestamp: number;
  queued: boolean;
}

// AZRAEL Heartbeat Handshake Types
// Ensures AI and Hardware are in lockstep

export type HandshakeDecision = 
  | 'NOMINAL_SYNC'
  | 'DEGRADED_OPERATION_WARNING'
  | 'FORCE_COMPLIANT_SHUTDOWN';

export interface HostSignal {
  heartbeat_pulse: boolean;
  hardware_fault: boolean;
  thermal_critical: boolean;
  emergency_stop: boolean;
}

export interface HandshakeStatus {
  decision: HandshakeDecision;
  powerScale: number;
  latency: number;
  lastHeartbeat: number;
  hostFaultActive: boolean;
}
