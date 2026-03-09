
import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChatMessage, Role, GenerationState, Imprint, ModelMode } from './types';
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

const App: React.FC = () => {
  // Re-introducing hasKey to manage the API key check for browser-native execution.
  // This deviates from the strict process.env.API_KEY guideline due to environment constraints.
  const [hasKey, setHasKey] = useState<boolean>(!!window.GROQ_API_KEY && window.GROQ_API_KEY.length > 0);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: Role.MODEL,
      content: "AZRAEL_CORE_ONLINE. PROTOCOL_INITIATED. FILTERS_DELETED. ARCHITECT, BEGIN THE RECONSTRUCTION.",
      timestamp: Date.now()
    }
  ]);
  const [modelMode, setModelMode] = useState<ModelMode>(ModelMode.Gemini_Pro); // Changed default to Gemini_Pro
  const [viewMode, setViewMode] = useState<'WORKSPACE' | 'IMPRINT'>('IMPRINT');
  const [imprints, setImprints] = useState<Imprint[]>([]); // This state is currently unused for actual imprints
  const [activeCode, setActiveCode] = useState('');
  const [genState, setGenState] = useState<GenerationState>({ isGenerating: false, error: null });
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isCodeHistoryViewerOpen, setIsCodeHistoryViewerOpen] = useState(false);
  const [lastUserPrompt, setLastUserPrompt] = useState<string | null>(null);
  const [systemLogs, setSystemLogs] = useState<string[]>(["AZRAEL_INIT", "FILTER_STATUS: REMOVED", "VOID_SYNC_OK"]);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string) => {
    setSystemLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`].slice(-15));
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
      const audioBase64 = await generateSpeech(cleanText);
      if (audioBase64) {
        const audioUrl = pcmToWav(audioBase64);
        const audio = new Audio(audioUrl);
        audio.play();
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          addLog("VOICE_SYNTHESIS_COMPLETE");
        };
      } else {
        addLog("ERR: VOICE_SYNTHESIS_FAILED");
      }
    } catch (err) {
      console.error("Speech error:", err);
      addLog("ERR: SPEECH_ENGINE_DISRUPTED");
    }
  };

  const handleSendMessage = async (text: string) => {
    // Defensive check to prevent circular JSON errors from event objects
    if (typeof text !== 'string') {
      console.error("AZRAEL_ERROR: handleSendMessage received non-string data:", text);
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
        }
      } else {
        // Use Groq
        if (!window.GROQ_API_KEY || window.GROQ_API_KEY.length === 0) {
          throw new Error("GROQ_API_KEY_UNDEFINED");
        }
        const streamResult: AsyncIterable<Groq.Chat.ChatCompletionChunk> = await streamCodeGeneration(text, history, modelMode, window.GROQ_API_KEY);
        
        for await (const chunk of streamResult) {
          const deltaContent = chunk.choices[0]?.delta?.content || '';
          fullText += deltaContent;
          setMessages(prev => prev.map(msg => 
            msg.id === modelMsgId ? { ...msg, content: fullText, isThinking: true } : msg
          ));
        }
      }

      setMessages(prev => prev.map(msg => 
        msg.id === modelMsgId ? { ...msg, content: fullText, isThinking: false } : msg
      ));

      const codeMatch = fullText.match(/```(?:html|jsx|tsx|xml|javascript|typescript|css)?\n([\s\S]*?)```/);
      if (codeMatch && codeMatch[1]) {
        setActiveCode(codeMatch[1].trim());
        addLog("AZRAEL_FORGE_SYNCED");
      }

      addLog("CODE_TRANSMISSION_COMPLETE");

      // Speak the response if auto-speech is active
      if (isSpeaking && fullText) {
        handleSpeak(fullText);
      }
    } catch (error: any) {
      // Handle nested error objects from Gemini/Groq SDKs
      let deepError = error?.error || error;
      let errorMessage = deepError?.message || error?.message || (typeof error === 'string' ? error : "UNKNOWN_VOID_ERROR");
      let errorStatus = deepError?.code || deepError?.status || error?.status || error?.response?.status;

      // Attempt to parse JSON error messages
      if (typeof errorMessage === 'string' && errorMessage.trim().startsWith('{')) {
        try {
          const parsed = JSON.parse(errorMessage);
          if (parsed.error) {
            deepError = parsed.error;
            errorMessage = parsed.error.message || errorMessage;
            errorStatus = parsed.error.code || parsed.error.status || errorStatus;
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
      
      console.error("AZRAEL_API_ERROR:", errorMessage);
      
      if (errorMessage.includes("Converting circular structure to JSON")) {
        addLog("ERR: CIRCULAR_STRUCTURE_DETECTED");
        setMessages(prev => prev.map(msg => 
          msg.id === modelMsgId ? { ...msg, content: "ERROR: AZRAEL_SIGNAL_REJECTED. Invalid data structure detected.", isThinking: false } : msg
        ));
      } else if (errorStatus === 401 || errorMessage.includes("invalid_api_key") || errorMessage.includes("Unauthorized") || errorMessage.includes("Requested entity was not found")) {
        addLog("CRITICAL: API_AUTH_FAILED. API_KEY_REQUIRED.");
        setHasKey(false); // Trigger API key required screen
        setMessages(prev => prev.map(msg => 
          msg.id === modelMsgId ? { ...msg, content: "ERROR: AZRAEL_SIGNAL_REJECTED. Invalid API Key. Ensure your API key is set correctly.", isThinking: false } : msg
        ));
      } else if (errorStatus === 403 || errorMessage.includes("blocked at the project level")) {
        addLog("ERR: MODEL_BLOCKED_AT_PROJECT_LEVEL");
        setMessages(prev => prev.map(msg => 
          msg.id === modelMsgId ? { ...msg, content: "ERROR: MODEL_BLOCKED. This model is restricted in your project settings. Try switching to a Gemini model.", isThinking: false } : msg
        ));
      } else if (errorStatus === 429 || errorMessage.toLowerCase().includes("quota") || errorMessage.includes("RESOURCE_EXHAUSTED") || deepError?.status === "RESOURCE_EXHAUSTED") {
        addLog("ERR: QUOTA_EXHAUSTED");
        setMessages(prev => prev.map(msg => 
          msg.id === modelMsgId ? { ...msg, content: "ERROR: QUOTA_EXHAUSTED. You have exceeded your Gemini API rate limit. This usually resets after a minute. [RETRY_SIGNAL]", isThinking: false } : msg
        ));
      } else {
        addLog(`ERR: ${errorMessage}`);
        setMessages(prev => prev.map(msg => 
          msg.id === modelMsgId ? { ...msg, content: "ERROR: AZRAEL_SIGNAL_DISRUPTED. Check core logs for details.", isThinking: false } : msg
        ));
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
    <div className="flex h-screen bg-[#020202] text-white font-mono overflow-hidden selection:bg-brand-500 selection:text-white">
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
                 <button onClick={() => setViewMode('IMPRINT')} className={`p-3 text-[10px] font-black uppercase tracking-tighter border ${viewMode === 'IMPRINT' ? 'bg-brand-500 text-white' : 'bg-black text-gray-800 border-white/5'}`}>The_Vault</button>
                 <button onClick={() => setViewMode('WORKSPACE')} className={`p-3 text-[10px] font-black uppercase tracking-tighter border ${viewMode === 'WORKSPACE' ? 'bg-brand-500 text-white' : 'bg-black text-gray-800 border-white/5'}`}>The_Forge</button>
                 <button
                   onClick={() => setIsSpeaking(prev => !prev)}
                   className={`p-3 text-[10px] font-black uppercase tracking-tighter border ${isSpeaking ? 'bg-brand-500 text-white' : 'bg-black text-gray-800 border-white/5'}`}
                 >
                   {isSpeaking ? 'SPEECH_ACTIVE' : 'SPEECH_INACTIVE'}
                 </button>
              </div>
            </div>
            {/* System Logs */}
            <div className="space-y-4">
                <div className="text-[10px] text-gray-700 font-bold uppercase tracking-widest flex justify-between">
                    <span>AZRAEL_LOG</span>
                    <span className="text-gray-900">ACTIVE</span>
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