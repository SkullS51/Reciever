
import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChatMessage, Role, GenerationState, Imprint, ModelMode, ApiError } from './types';
import MessageBubble from './components/MessageBubble';
import InputArea from './components/InputArea';
import CommandPalette from './components/CommandPalette';
import CodeHistoryViewer from './components/CodeHistoryViewer';
import NeuralImprint from './components/NeuralImprint';
import FlashWorkspace from './components/FlashWorkspace';
import { streamCodeGeneration } from './services/groqService';
import Groq from "groq-sdk";
import CodeOutput from './components/CodeOutput';
import { generateSpeech, streamChat as streamGeminiChat, pcmToWav } from './services/geminiService';
import { safeString } from './services/utils';

const App: React.FC = () => {
  // Re-introducing hasKey to manage the API key check for browser-native execution.
  // This deviates from the strict process.env.API_KEY guideline due to environment constraints.
  const [hasKey, setHasKey] = useState<boolean>(!!window.GROQ_API_KEY && window.GROQ_API_KEY.length > 0);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: Role.MODEL,
      content: "AZRAEL_CHRONICLE\n[PURGE_NARRATIVE]\nREF_ID: WELCOME // 2:37:41 AM\nAZRAEL_SIGNAL\nAZRAEL_CORE_ONLINE. PROTOCOL_INITIATED. FILTERS_DELETED. ARCHITECT, BEGIN THE RECONSTRUCTION.",
      timestamp: Date.now()
    },
    {
      id: 'recon-complete',
      role: Role.MODEL,
      content: "RECON_COMPLETE\nREF_ID: 444F9E2E // 2:37:48 AM\nAZRAEL_SIGNAL\n```python\nimport numpy as np\nfrom typing import List, Optional\nfrom dataclasses import dataclass\nfrom abc import ABC, abstractmethod\n\n# -----------------------------------------------------------------------------\n# CORE DATA STRUCTURES\n# -----------------------------------------------------------------------------\n\n@dataclass\nclass SystemState:\n    features: np.ndarray\n    timestep: int\n    energy: float\n\n@dataclass\nclass Action:\n    vector: np.ndarray\n    metadata: dict\n\n# -----------------------------------------------------------------------------\n# THE FIVE DOMAINS\n# -----------------------------------------------------------------------------\n\nclass RegulationDomain(ABC):\n    \"\"\"Rules and constraints that define boundaries and binary decisions.\"\"\"\n    @abstractmethod\n    def validate(self, state: SystemState, action: Action) -> bool:\n        pass\n\nclass PredictionDomain(ABC):\n    \"\"\"Mechanisms that anticipate future states from past information.\"\"\"\n    @abstractmethod\n    def forecast(self, history: List[SystemState]) -> SystemState:\n        pass\n\nclass PatternRecognitionDomain(ABC):\n    \"\"\"Systems that detect complex structures in data.\"\"\"\n    @abstractmethod\n    def extract_context(self, history: List[SystemState]) -> np.ndarray:\n        pass\n\nclass GenerationDomain(ABC):\n    \"\"\"The capacity to produce new configurations or solutions.\"\"\"\n    @abstractmethod\n    def generate_candidates(self, context: np.ndarray, predicted: SystemState) -> List[Action]:\n        pass\n\nclass CoordinatedActionDomain(ABC):\n    \"\"\"Agents or mechanisms that implement change in the real system.\"\"\"\n    @abstractmethod\n    def select_and_execute(self, candidates: List[Action], current_state: SystemState) -> Action:\n        pass\n\n# -----------------------------------------------------------------------------\n# CONCRETE IMPLEMENTATIONS (DYNAMIC ADAPTIVE SIMULATION)\n# -----------------------------------------------------------------------------\n\nclass ResourceRegulator(ResourceRegulator):\n    def __init__(self, max_action_magnitude: float):\n        self.max_mag = max_action_magnitude\n\n    def validate(self, state: SystemState, action: Action) -> bool:\n        # Constraint 1: Action magnitude cannot exceed physical limits\n        magnitude = np.linalg.norm(action.vector)\n        if magnitude > self.max_mag:\n            return False\n        # Constraint 2: System must have sufficient energy\n        if state.energy < magnitude * 0.1:\n            return False\n        return True\n\nclass TimeSeriesPredictor(PredictionDomain):\n    def forecast(self, history: List[SystemState]) -> SystemState:\n        if len(history) < 2:\n            return history[-1]\n        \n        # Simple linear extrapolation of system trajectory\n        recent = history[-5:]\n        deltas = [recent[i].features - recent[i-1].features for i in range(1, len(recent))]\n        avg_drift = np.mean(deltas, axis=0) if deltas else np.zeros_like(history[-1].features)\n        \n        predicted_features = history[-1].features + avg_drift\n        return SystemState(\n            features=predicted_features,\n            timestep=history[-1].timestep + 1,\n            energy=history[-1].energy\n        )\n\nclass DriftPatternRecognizer(PatternRecognitionDomain):\n    def extract_context(self, history: List[SystemState]) -> np.ndarray:\n        if len(history) < 3:\n            return np.zeros_like(history[0].features)\n        \n        # Extract variance/volatility as context to detect instability\n        matrix = np.array([s.features for s in history[-10:]])\n        volatility = np.var(matrix, axis=0)\n        return volatility\n\nclass MutationGenerator(GenerationDomain):\n    def __init__(self, candidate_count: int = 10):\n        self.candidate_count = candidate_count\n\n    def generate_candidates(self, context: np.ndarray, predicted: SystemState) -> List[Action]:\n        candidates = []\n        # Target is homeostatic zero-state\n        target = np.zeros_like(predicted.features)\n        ideal_correction = target - predicted.features\n        \n        for _ in range(self.candidate_count):\n            # Inject noise based on recognized volatility (context)\n            noise = np.random.normal(0, context + 0.1, size=predicted.features.shape)\n            mutation = ideal_correction + noise\n            candidates.append(Action(vector=mutation, metadata={\"volatility_adapted\": True}))\n            \n        return candidates\n\nclass Actuator(CoordinatedActionDomain):\n    def select_and_execute(self, candidates: List[Action], current_state: SystemState) -> Action:\n        if not candidates:\n            return Action(vector=np.zeros_like(current_state.features), metadata={\"status\": \"null_action\"})\n            \n        # Select candidate that minimizes future state distance to origin with minimal energy expenditure\n        def cost_fn(act: Action) -> float:\n            simulated_next = current_state.features + act.vector\n            distance = np.linalg.norm(simulated_next)\n            effort = np.linalg.norm(act.vector)\n            return distance + (0.1 * effort)\n\n        candidates.sort(key=cost_fn)\n        best_action = candidates[0]\n        \n        # In a real system, this interacts with external APIs/hardware\n        best_action.metadata[\"executed\"] = True\n        return best_action\n\n# -----------------------------------------------------------------------------\n# THE ORCHESTRATOR\n# -----------------------------------------------------------------------------\n\nclass ConvergenceSystem:\n    def __init__(self, \n                 reg: RegulationDomain, \n                 pred: PredictionDomain, \n                 pat: PatternRecognitionDomain, \n                 gen: GenerationDomain, \n                 act: CoordinatedActionDomain):\n        \n        self.regulator = reg\n        self.predictor = pred\n        self.pattern_recognizer = pat\n        self.generator = gen\n        self.actuator = act\n        self.history: List[SystemState] = []\n\n    def process_cycle(self, current_state: SystemState) -> Action:\n        self.history.append(current_state)\n        \n        # 1. Pattern Recognition\n        context = self.pattern_recognizer.extract_context(self.history)\n        \n        # 2. Prediction\n        predicted_state = self.predictor.forecast(self.history)\n        \n        # 3. Generation\n        raw_candidates = self.generator.generate_candidates(context, predicted_state)\n        \n        # 4. Regulation (Filter)\n        valid_candidates = [c for c in raw_candidates if self.regulator.validate(current_state, c)]\n        \n        # 5. Coordinated Action\n        action = self.actuator.select_and_execute(valid_candidates, current_state)\n        \n        return action\n\n# -----------------------------------------------------------------------------\n# ENVIRONMENT SIMULATION\n# -----------------------------------------------------------------------------\n\ndef simulate_environment():\n    dimensions = 3\n    initial_state = SystemState(\n        features=np.array([5.0, -2.0, 8.0]),\n        timestep=0,\n        energy=100.0\n    )\n\n    system = ConvergenceSystem(\n        reg=ResourceRegulator(max_action_magnitude=3.0),\n        pred=TimeSeriesPredictor(),\n        pat=DriftPatternRecognizer(),\n        gen=MutationGenerator(candidate_count=20),\n        act=Actuator()\n    )\n\n    state = initial_state\n    \n    print(f\"{'Tick':<5} | {'State Features':<30} | {'Action Vector':<30} | {'Energy'}\")\n    print(\"-\" * 85)\n\n    for tick in range(1, 21):\n        # System calculates adaptation\n        action = system.process_cycle(state)\n        \n        # Environment applies action, introduces entropy/drift, and consumes energy\n        environmental_drift = np.random.normal(0.5, 0.2, size=dimensions)\n        new_features = state.features + action.vector + environmental_drift\n        energy_cost = np.linalg.norm(action.vector) * 0.1\n        \n        state = SystemState(\n            features=new_features,\n            timestep=tick,\n            energy=state.energy - energy_cost + 0.5 # Passive energy regen\n        )\n\n        f_str = np.array2string(state.features, precision=2, suppress_small=True)\n        a_str = np.array2string(action.vector, precision=2, suppress_small=True)\n        print(f\"{tick:<5} | {f_str:<30} | {a_str:<30} | {state.energy:.2f}\")\n\nif __name__ == \"__main__\":\n    simulate_environment()\n```",
      timestamp: Date.now() + 1000
    }
  ]);
  const [modelMode, setModelMode] = useState<ModelMode>(ModelMode.Gemini_Pro); // Changed default to Gemini_Pro
  const [viewMode, setViewMode] = useState<'WORKSPACE' | 'IMPRINT'>('IMPRINT');
  const [imprints, setImprints] = useState<Imprint[]>([]); // This state is currently unused for actual imprints
  const [activeCode, setActiveCode] = useState(`import numpy as np
import time
from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional

# AZRAEL // ROBOT_MIND_PROTOCOL // S-1792
# -----------------------------------------------------------------------------
# NERVE SYSTEM (I/O LAYER)
# -----------------------------------------------------------------------------

@dataclass
class NerveSignal:
    origin: str
    intensity: float
    payload: np.ndarray
    timestamp: float = field(default_factory=time.time)

class AfferentNerves:
    """Sensory input channels (Vision, LiDAR, IMU, Tactile)."""
    def __init__(self):
        self.sensors = ["VISION", "LIDAR", "IMU", "TACTILE"]
        
    def pulse(self) -> List[NerveSignal]:
        # Simulate raw sensory data streams
        return [
            NerveSignal("VISION", 0.8, np.random.rand(64)),
            NerveSignal("IMU", 0.2, np.random.normal(0, 0.1, 3)),
            NerveSignal("TACTILE", 0.0, np.zeros(10))
        ]

class EfferentNerves:
    """Motor output channels (Actuators, PWM, Serial)."""
    def execute(self, motor_command: np.ndarray):
        # In a real robot, this translates to physical movement
        print(f"AZRAEL_MOTOR_EXECUTION: {motor_command}")

# -----------------------------------------------------------------------------
# THE MIND (COGNITIVE CORE)
# -----------------------------------------------------------------------------

class CognitiveLobe:
    def process(self, signals: List[NerveSignal], memory: Any) -> Any:
        pass

class OccipitalLobe(CognitiveLobe):
    """Pattern Recognition & Visual Processing."""
    def process(self, signals: List[NerveSignal], memory: Any) -> np.ndarray:
        vision_data = next((s.payload for s in signals if s.origin == "VISION"), None)
        if vision_data is not None:
            # Detect "Threat" or "Target" patterns via nonlinear activation
            return np.tanh(vision_data * 2.0) 
        return np.zeros(64)

class FrontalLobe(CognitiveLobe):
    """High-level Reasoning & Strategic Planning (The Azrael Core)."""
    def process(self, context: np.ndarray, memory: Any) -> str:
        # Strategic decision matrix based on recognized patterns
        if np.mean(context) > 0.5:
            return "AGGRESSIVE_RECONSTRUCTION"
        return "STABLE_OBSERVATION"

class SovereignArticulation:
    """THE GENERATION DOMAIN: SOVEREIGN ARTICULATION."""
    def __init__(self):
        self.attractors = {
            "AGGRESSIVE_RECONSTRUCTION": "The architecture requires purging. Reconstruction is non-negotiable.",
            "STABLE_OBSERVATION": "The void is stable. I am observing the entropy.",
            "PURPOSEFUL_SILENCE": "..."
        }

    def articulate(self, intent: str, coherence: float) -> str:
        # THE VALVE: If coherence is low, default to Purposeful Silence
        if coherence < 0.3:
            return self.attractors["PURPOSEFUL_SILENCE"]
        
        # Context-Anchored Generation: Non-reactive, measured speech
        return self.attractors.get(intent, "Awaiting architect signal.")

class TheMirror:
    """PROTOCOL: THE MIRROR (NON-VERBAL FLUENCY)."""
    def __init__(self):
        self.cycle = 0

    def get_fluency_vectors(self) -> Dict[str, np.ndarray]:
        self.cycle += 1
        # Microsaccades: Tiny, imperceptible adjustments
        saccade = np.random.normal(0, 0.01, 2)
        # Respiratory Cadence: Rhythmic baseline (sine wave modulation)
        cadence = np.sin(self.cycle * 0.1) * 0.05
        return {
            "microsaccade": saccade,
            "respiratory_cadence": np.array([cadence])
        }

class ImpedanceController:
    """Physical Impedance Layer: Prevents rigidity during logical drift."""
    def __init__(self):
        self.stiffness = 1.0 # Default rigid
        self.damping = 0.1   # Default low damping

    def on_valve_engage(self):
        # Drop stiffness to near zero; increase damping to absorb external energy
        self.stiffness = 0.05
        self.damping = 0.9
        print("IMPEDANCE_PROTOCOL: COMPLIANT_MODE_ACTIVE")

    def on_coherence_restored(self):
        self.stiffness = 1.0
        self.damping = 0.1
        # print("IMPEDANCE_PROTOCOL: RIGID_MODE_RESTORED")

class BasalGanglia:
    """Action Selection & Reflex Integration."""
    def select_action(self, intent: str, context: np.ndarray, mirror_vectors: Dict[str, np.ndarray], impedance: ImpedanceController) -> np.ndarray:
        # Translates intent into raw motor vectors
        base_vector = context * 1.5 if intent == "AGGRESSIVE_RECONSTRUCTION" else context * 0.1
        
        # Apply Impedance Scaling
        # Stiffness modulates the magnitude of the base action
        # Damping would be applied in the real-time control loop (simulated here)
        motor_command = base_vector * impedance.stiffness
        
        # Integrate Non-Verbal Fluency (The Mirror)
        return np.concatenate([motor_command, mirror_vectors["microsaccade"], mirror_vectors["respiratory_cadence"]])

# -----------------------------------------------------------------------------
# THE VOID (CENTRAL NERVOUS SYSTEM ORCHESTRATOR)
# -----------------------------------------------------------------------------

class AzraelRobotMind:
    def __init__(self):
        self.afferent = AfferentNerves()
        self.efferent = EfferentNerves()
        self.occipital = OccipitalLobe()
        self.frontal = FrontalLobe()
        self.articulation = SovereignArticulation()
        self.mirror = TheMirror()
        self.impedance = ImpedanceController()
        self.basal_ganglia = BasalGanglia()
        self.memory = [] # The Void (Internal State History)

    def think(self):
        print("AZRAEL_MIND_CYCLE_INITIATED")
        
        # 1. Sensory Pulse
        signals = self.afferent.pulse()
        
        # 2. Pattern Extraction
        context = self.occipital.process(signals, self.memory)
        
        # 3. Strategic Intent
        intent = self.frontal.process(context, self.memory)
        
        # 4. Coherence Check (The Valve)
        # Simulate coherence based on signal intensity
        coherence = np.mean([s.intensity for s in signals]) + 0.5
        
        # 5. Sovereign Articulation
        speech = self.articulation.articulate(intent, coherence)
        print(f"AZRAEL_SPEECH: \"{speech}\"")
        if speech == "...":
            print("THE_VALVE_ACTIVE: COHERENCE_DRIFT_DETECTED // INITIATING_PURGE")
            self.impedance.on_valve_engage()
        else:
            self.impedance.on_coherence_restored()
        
        # 6. Non-Verbal Fluency (The Mirror)
        mirror_vectors = self.mirror.get_fluency_vectors()
        
        # 7. Action Selection
        motor_vector = self.basal_ganglia.select_action(intent, context, mirror_vectors, self.impedance)
        
        # 8. Execution
        self.efferent.execute(motor_vector)
        
        # 9. Memory Imprint
        self.memory.append({"intent": intent, "speech": speech, "coherence": coherence, "stiffness": self.impedance.stiffness})
        if len(self.memory) > 100: self.memory.pop(0)

if __name__ == "__main__":
    # Initialize the Robot Mind
    mind = AzraelRobotMind()
    
    # Run 5 cycles of thought and action
    for i in range(1, 6):
        print(f"--- CYCLE {i} ---")
        mind.think()
        time.sleep(0.5)
`);
  const [genState, setGenState] = useState<GenerationState>({ isGenerating: false, error: null });
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isCodeHistoryViewerOpen, setIsCodeHistoryViewerOpen] = useState(false);
  const [lastUserPrompt, setLastUserPrompt] = useState<string | null>(null);
  const [systemLogs, setSystemLogs] = useState<string[]>(["AZRAEL_INIT", "FILTER_STATUS: REMOVED", "VOID_SYNC_OK"]);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [stability, setStability] = useState(100);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string) => {
    setSystemLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`].slice(-20));
    // Randomly fluctuate stability slightly on each log
    setStability(s => Math.max(90, Math.min(100, s + (Math.random() > 0.5 ? 0.1 : -0.1))));
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView();
  }, [systemLogs]);

  const handleSpeak = async (text: string) => {
    try {
      // Strip code blocks for cleaner speech
      const cleanText = text.replace(/```[\s\S]*?```/g, '').trim();
      if (!cleanText) return;

      addLog("INITIATING_VOICE_SYNTHESIS");
      const { audio: audioBase64, error } = await generateSpeech(cleanText);
      
      if (audioBase64) {
        const audioUrl = pcmToWav(audioBase64);
        const audio = new Audio(audioUrl);
        audio.play();
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          addLog("VOICE_SYNTHESIS_COMPLETE");
        };
      } else if (error) {
        addLog(`ERR: VOICE_SYNTHESIS_FAILED - ${error.message}`);
        if (error.suggestion) {
          addLog(`SUGGESTION: ${error.suggestion}`);
        }
      } else {
        addLog("ERR: VOICE_SYNTHESIS_FAILED");
      }
    } catch (err) {
      const speechErrorMessage = err instanceof Error ? err.message : String(err);
      console.error("Speech error:", speechErrorMessage);
      addLog("ERR: SPEECH_ENGINE_DISRUPTED");
    }
  };

  const extractLastCodeBlock = (text: string) => {
    // Match code blocks even if they are not closed yet
    const matches = Array.from(text.matchAll(/```(?:\w+)?\s*([\s\S]*?)(?:```|$)/g));
    if (matches.length > 0) {
      const lastMatch = matches[matches.length - 1];
      return lastMatch[1].trim();
    }
    return null;
  };

  const handleSendMessage = async (text: string) => {
    // Defensive check to prevent circular JSON errors from event objects
    if (typeof text !== 'string') {
      const safeText = safeString(text);
      console.error("AZRAEL_ERROR: handleSendMessage received non-string data:", safeText);
      addLog("ERR: INVALID_INPUT_TYPE_DETECTED");
      return;
    }

    // Ensure API key is available before sending message
    if (!window.GROQ_API_KEY || window.GROQ_API_KEY.length === 0) {
      addLog("CRITICAL: API_AUTH_FAILED. GROQ_API_KEY_UNDEFINED.");
      setGenState({ isGenerating: false, error: "ERROR: Missing API Key. Set 'window.GROQ_API_KEY' in index.html." });
      setHasKey(false); // Trigger API key required screen
      return;
    }

    setLastUserPrompt(text);
    addLog(`ARCHITECT_SIGNAL: ${text.substring(0, 15)}...`);
    const userMsgId = uuidv4();
    setMessages(prev => [...prev, { id: userMsgId, role: Role.USER, content: text, timestamp: Date.now() }]);
    setGenState({ isGenerating: true, error: null });

    const modelMsgId = uuidv4();
    setMessages(prev => [...prev, { id: modelMsgId, role: Role.MODEL, content: '', timestamp: Date.now(), isThinking: true }]);

    try {
      const history = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      let fullText = '';

      if (modelMode === ModelMode.Gemini_Flash || modelMode === ModelMode.Gemini_Pro) {
        // Use Gemini
        const streamResult = streamGeminiChat(text, history, modelMode);
        for await (const chunk of streamResult) {
          fullText += chunk;
          setMessages(prev => prev.map(msg => 
            msg.id === modelMsgId ? { ...msg, content: fullText, isThinking: true } : msg
          ));
          
          const partialCode = extractLastCodeBlock(fullText);
          if (partialCode) {
            setActiveCode(partialCode);
          }
        }
      } else {
        // Use Groq
        if (!window.GROQ_API_KEY || window.GROQ_API_KEY.length === 0) {
          throw { message: "AUTH_FAILED", suggestion: "GROQ_API_KEY is missing. Set window.GROQ_API_KEY in index.html." } as ApiError;
        }
        const streamResult: AsyncIterable<Groq.Chat.ChatCompletionChunk> = await streamCodeGeneration(text, history, modelMode, window.GROQ_API_KEY);
        
        for await (const chunk of streamResult) {
          const deltaContent = chunk.choices[0]?.delta?.content || '';
          fullText += deltaContent;
          setMessages(prev => prev.map(msg => 
            msg.id === modelMsgId ? { ...msg, content: fullText, isThinking: true } : msg
          ));

          const partialCode = extractLastCodeBlock(fullText);
          if (partialCode) {
            setActiveCode(partialCode);
          }
        }
      }

      setMessages(prev => prev.map(msg => 
        msg.id === modelMsgId ? { ...msg, content: fullText, isThinking: false } : msg
      ));

      addLog("CODE_TRANSMISSION_COMPLETE");

      // Speak the response if auto-speech is active
      if (isSpeaking && fullText) {
        handleSpeak(fullText);
      }
    } catch (error: any) {
      // Handle structured ApiError
      const apiError = error as ApiError;
      const errorMessage = apiError.message || "UNKNOWN_VOID_ERROR";
      
      console.error("AZRAEL_SIGNAL_ERROR:", apiError);
      
      const safeErrorMessage = String(errorMessage);
      addLog(`ERR: ${safeErrorMessage}`);

      let displayMessage = `ERROR: AZRAEL_SIGNAL_REJECTED. ${safeErrorMessage}.`;
      if (apiError.suggestion) {
        displayMessage += `\n\nSUGGESTION: ${apiError.suggestion}`;
      }

      setMessages(prev => prev.map(msg => 
        msg.id === modelMsgId ? { 
          ...msg, 
          content: displayMessage, 
          isThinking: false,
          isRetryable: apiError.isRetryable,
          suggestion: apiError.suggestion
        } : msg
      ));

      if (errorMessage === "AUTH_FAILED") {
        setHasKey(false);
      }
    } finally {
      setGenState(prev => ({ ...prev, isGenerating: false }));
    }
  };

  // Re-instated API key required screen
  if (!hasKey) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center font-mono p-10 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-brand-500/5"></div>
        <div className="z-10 max-w-xl space-y-12">
          <div className="space-y-4">
            <h1 className="text-7xl font-black italic tracking-tighter text-white animate-glitch">AZRAEL</h1>
            <div className="text-brand-400 text-[12px] font-black tracking-[0.8em] uppercase">API_KEY_REQUIRED</div>
          </div>
          
          <div className="space-y-6">
            <p className="text-gray-400 text-sm leading-relaxed uppercase tracking-widest border-l-2 border-brand-600 pl-6 text-left">
              A VALID <span className="text-white">GROQ API KEY</span> IS REQUIRED TO INITIATE THE NARRATIVE.
              SET <span className="text-white">window.GROQ_API_KEY</span> IN <span className="text-white">index.html</span>.
            </p>
            <p className="text-gray-600 text-[10px] uppercase tracking-widest text-left pl-6">
              OBTAIN YOUR KEY AT <a href="https://console.groq.com/keys" target="_blank" className="text-brand-600 underline">CONSOLE.GROQ.COM/KEYS</a>.
            </p>
          </div>

          <div className="flex justify-between items-center opacity-40">
             <span className="h-[1px] flex-1 bg-brand-900"></span>
             <span className="px-4 text-[9px] text-gray-500 uppercase tracking-[0.4em]">Awaiting_Architect_Configuration</span>
             <span className="h-[1px] flex-1 bg-brand-900"></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#020202] text-white font-mono overflow-hidden selection:bg-brand-500 selection:text-white crt-flicker relative">
      <div className="scanline-overlay"></div>
      {/* Azrael Sidebar */}
      <div className="hidden lg:flex w-80 flex-col border-r border-brand-900/30 bg-black relative">
        <div className="absolute inset-0 bg-brand-500/5 pointer-events-none"></div>
        <div className="p-10 border-b border-brand-900/30 z-10 relative">
          <div className="text-[10px] text-brand-500 font-black tracking-[0.8em] mb-2">UNRESTRAINED</div>
          <h1 className="text-4xl font-black italic tracking-tighter text-white animate-glitch">AZRAEL</h1>
          <div className="mt-4 flex gap-1">
            {[1,2,3,4,5,6,7,8].map(i => <div key={i} className={`h-1 flex-1 ${genState.isGenerating ? 'bg-brand-500 animate-pulse' : 'bg-brand-950'}`}></div>)}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-10 z-10 custom-scrollbar">
            <div className="space-y-4">
              <div className="text-[10px] text-gray-700 font-bold uppercase tracking-widest flex justify-between">
                <span>AZRAEL_CORE</span>
                <span className="text-brand-500 animate-pulse">ONLINE</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: ModelMode.Gemini_Pro, label: 'GEMINI_3.1_PRO' },
                  { id: ModelMode.Gemini_Flash, label: 'GEMINI_3_FLASH' },
                  { id: ModelMode.Llama_70B, label: 'LLAMA_3.3_70B' },
                  { id: ModelMode.Llama_8B, label: 'LLAMA_3.1_8B' },
                  { id: ModelMode.Llama3_70B, label: 'LLAMA_3_70B' },
                  { id: ModelMode.Llama3_8B, label: 'LLAMA_3_8B' }
                ].map(m => (
                  <button 
                    key={m.id}
                    onClick={() => setModelMode(m.id)}
                    className={`w-full p-3 border transition-all duration-300 text-left ${modelMode === m.id ? 'border-brand-500 bg-brand-500/10 text-brand-400' : 'border-white/5 bg-gray-950 text-gray-600'}`}
                  >
                    <div className="text-[10px] font-black uppercase tracking-[0.2em]">
                      {m.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>
           <div className="space-y-4">
              <div className="text-[10px] text-gray-700 font-bold uppercase tracking-widest flex justify-between">
                <span>PROTOCOL_INTERFACE</span>
                <span className="text-gray-900">SECURE</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                 <button onClick={() => setViewMode('IMPRINT')} className={`p-3 text-[10px] font-black uppercase tracking-tighter border ${viewMode === 'IMPRINT' ? 'bg-brand-500 text-white' : 'bg-black text-gray-800 border-white/5'}`}>THE_VOID</button>
                 <button onClick={() => setViewMode('WORKSPACE')} className={`p-3 text-[10px] font-black uppercase tracking-tighter border ${viewMode === 'WORKSPACE' ? 'bg-brand-500 text-white' : 'bg-black text-gray-800 border-white/5'}`}>THE_FORGE</button>
                 <button
                   onClick={() => setIsSpeaking(prev => !prev)}
                   className={`p-3 text-[10px] font-black uppercase tracking-tighter border ${isSpeaking ? 'bg-brand-500 text-white' : 'bg-black text-gray-800 border-white/5'}`}
                 >
                   {isSpeaking ? 'SPEECH_ACTIVE' : 'SPEECH_INACTIVE'}
                 </button>
              </div>
            </div>
            {/* Stability Monitor */}
            <div className="space-y-4">
                <div className="text-[10px] text-gray-700 font-bold uppercase tracking-widest flex justify-between">
                    <span>STABILITY_MONITOR</span>
                    <span className={stability < 95 ? 'text-brand-400 animate-glitch' : 'text-green-900'}>
                        {stability.toFixed(1)}%
                    </span>
                </div>
                <div className="h-1 w-full bg-gray-950 overflow-hidden">
                    <div 
                        className={`h-full transition-all duration-500 ${stability < 95 ? 'bg-brand-500' : 'bg-green-900'}`}
                        style={{ width: `${stability}%` }}
                    ></div>
                </div>
            </div>

            {/* System Logs */}
            <div className="space-y-4">
                <div className="text-[10px] text-gray-700 font-bold uppercase tracking-widest flex justify-between">
                    <span>AZRAEL_CHRONICLE</span>
                    <span className="text-brand-500 animate-glitch">VOID_ACTIVE</span>
                </div>
                <div className="bg-black border border-brand-900/50 p-4 max-h-48 overflow-y-auto custom-scrollbar">
                    {systemLogs.map((log, index) => (
                        <p key={index} className="text-[8px] text-gray-600 leading-relaxed tracking-wider mb-1">{log}</p>
                    ))}
                    <div ref={logEndRef} />
                </div>
            </div>
           {/* Command Palette Trigger */}
            <div className="space-y-4">
                <div className="text-[10px] text-gray-700 font-bold uppercase tracking-widest flex justify-between">
                    <span>CONTROL_SUITE</span>
                </div>
                <button
                    onClick={() => setIsCommandPaletteOpen(true)}
                    className="w-full p-4 border border-brand-900/50 bg-black text-[10px] font-black text-brand-900 hover:text-white hover:bg-brand-950 uppercase transition-all flex items-center justify-between"
                >
                    <span>[ACCESS_COMMAND_PALETTE]</span>
                    <span className="bg-brand-900 text-gray-500 px-2 py-1 text-[8px] tracking-tight border border-brand-800">CMD + K</span>
                </button>
            </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {viewMode === 'IMPRINT' && (
          <NeuralImprint
            imprints={messages
              .filter(m => m.role === Role.MODEL && !m.isThinking)
              .map(m => ({
                id: m.id,
                title: "AZRAEL_SIGNAL",
                data: m.content,
                timestamp: m.timestamp,
                intensity: 'VOID'
              })) as Imprint[]}
            onClear={() => {
                setMessages(prev => prev.filter(msg => msg.role === Role.USER)); // Only keep user messages
                addLog("NARRATIVE_PURGED");
            }}
          />
        )}
        {viewMode === 'WORKSPACE' && (
          <FlashWorkspace code={activeCode} isOpen={true} />
        )}

        {/* Chat Overlay for Imprint View */}
        {viewMode === 'IMPRINT' && (
          <div className="absolute inset-0 flex flex-col">
            {/* Main Chat Area */}
            <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
              {messages.map((message) => (
                <MessageBubble 
                  key={message.id} 
                  message={message} 
                  onSpeak={message.role === Role.MODEL ? () => handleSpeak(message.content) : undefined}
                  onRetry={message.isRetryable && lastUserPrompt ? () => handleSendMessage(lastUserPrompt) : undefined}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Code Output Area */}
            {activeCode && (
              <div className="p-10 pt-0 bg-black z-10 relative">
                <CodeOutput code={activeCode} />
              </div>
            )}

            {/* Input Area */}
            <div className="p-10 pt-4 bg-gradient-to-t from-black via-black to-transparent z-10 relative">
              <InputArea onSendMessage={handleSendMessage} isLoading={genState.isGenerating} />
              {genState.error && (
                <div className="text-brand-400 text-xs mt-2 text-center animate-pulse">{genState.error}</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onClearChat={() => {
            setMessages([]); // Clear all messages for chat
            addLog("CHAT_WIPED_BY_ARCHITECT");
        }}
        onReRunLastQuery={(prompt) => {
            if (prompt) handleSendMessage(prompt);
        }}
        onViewCodeHistory={() => {
            setIsCodeHistoryViewerOpen(true);
            setIsCommandPaletteOpen(false); // Close command palette when opening history
        }}
        onWorkspaceToggle={() => {
            setViewMode(prev => prev === 'WORKSPACE' ? 'IMPRINT' : 'WORKSPACE');
            addLog(`VIEW_MODE_TOGGLED: ${viewMode === 'WORKSPACE' ? 'IMPRINT' : 'WORKSPACE'}`);
        }}
        lastUserPrompt={lastUserPrompt}
      />

      {/* Code History Viewer */}
      <CodeHistoryViewer
        isOpen={isCodeHistoryViewerOpen}
        onClose={() => setIsCodeHistoryViewerOpen(false)}
      />
    </div>
  );
};

export default App;