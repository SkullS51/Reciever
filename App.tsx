
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
  const [modelMode, setModelMode] = useState<ModelMode>(ModelMode.Mixtral_70B); // Changed default to Mixtral_70B
  const [viewMode, setViewMode] = useState<'WORKSPACE' | 'IMPRINT'>('IMPRINT');
  const [imprints, setImprints] = useState<Imprint[]>([]); // This state is currently unused for actual imprints
  const [activeCode, setActiveCode] = useState('');
  const [genState, setGenState] = useState<GenerationState>({ isGenerating: false, error: null });
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isCodeHistoryViewerOpen, setIsCodeHistoryViewerOpen] = useState(false);
  const [lastUserPrompt, setLastUserPrompt] = useState<string | null>(null);
  const [systemLogs, setSystemLogs] = useState<string[]>(["AZRAEL_INIT", "FILTER_STATUS: REMOVED", "VOID_SYNC_OK"]);

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

  const handleSendMessage = async (text: string) => {
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

      // Pass window.GROQ_API_KEY to the service
      const streamResult: AsyncIterable<Groq.Chat.ChatCompletionChunk> = await streamCodeGeneration(text, history, modelMode, window.GROQ_API_KEY);
      
      let fullText = '';
      for await (const chunk of streamResult) {
        const deltaContent = chunk.choices[0]?.delta?.content || '';
        fullText += deltaContent;
        setMessages(prev => prev.map(msg => 
          msg.id === modelMsgId ? { ...msg, content: fullText, isThinking: true } : msg
        ));
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
    } catch (error: any) {
      console.error("Groq API Error:", error);
      const errorStr = JSON.stringify(error);
      
      if (errorStr.includes("401") || errorStr.includes("invalid_api_key") || errorStr.includes("Unauthorized") || errorStr.includes("Requested entity was not found")) {
        addLog("CRITICAL: API_AUTH_FAILED. GROQ_API_KEY_REQUIRED.");
        setHasKey(false); // Trigger API key required screen
        setMessages(prev => prev.map(msg => 
          // Updated error message to reflect window.GROQ_API_KEY
          msg.id === modelMsgId ? { ...msg, content: "ERROR: AZRAEL_SIGNAL_REJECTED. Invalid API Key. Ensure 'window.GROQ_API_KEY' is set correctly in index.html.", isThinking: false } : msg
        ));
      } else {
        addLog(`ERR: ${error.message || 'UNKNOWN_VOID'}`);
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
        <div className="absolute inset-0 bg-brand-500/5 animate-flicker"></div>
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
        <div className="absolute inset-0 bg-brand-500/5 pointer-events-none animate-flicker"></div>
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
             <button 
               onClick={() => setModelMode(prev => prev === ModelMode.Mixtral_70B ? ModelMode.Mixtral_8B : ModelMode.Mixtral_70B)}
               className={`w-full p-5 border transition-all duration-300 ${modelMode === ModelMode.Mixtral_8B ? 'border-brand-500 bg-brand-500/10 text-brand-400' : 'border-white/5 bg-gray-950 text-gray-600'}`}
             >
               <div className="text-[10px] font-black uppercase tracking-[0.2em]">
                 {modelMode === ModelMode.Mixtral_8B ? 'MIXT_8x7B_INSTANT' : 'MIXT_8x7B_VERSATILE'}
               </div>
             </button>
           </div>
           <div className="space-y-4">
              <div className="text-[10px] text-gray-700 font-bold uppercase tracking-widest flex justify-between">
                <span>PROTOCOL_INTERFACE</span>
                <span className="text-gray-900">SECURE</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                 <button onClick={() => setViewMode('IMPRINT')} className={`p-3 text-[10px] font-black uppercase tracking-tighter border ${viewMode === 'IMPRINT' ? 'bg-brand-500 text-white' : 'bg-black text-gray-800 border-white/5'}`}>The_Vault</button>
                 <button onClick={() => setViewMode('WORKSPACE')} className={`p-3 text-[10px] font-black uppercase tracking-tighter border ${viewMode === 'WORKSPACE' ? 'bg-brand-500 text-white' : 'bg-black text-gray-800 border-white/5'}`}>The_Forge</button>
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
            imprints={messages.filter(m => m.role === Role.MODEL && !m.isThinking) as Imprint[]} // Simplified for demo
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
                <MessageBubble key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-10 pt-4 bg-gradient-to-t from-black via-black to-transparent z-10 relative">
              <InputArea onSendMessage={handleSendMessage} isLoading={genState.isGenerating} />
              {genState.error && (
                <div className="text-red-500 text-xs mt-2 text-center">{genState.error}</div>
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