import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, RefreshCw } from 'lucide-react';
import { aiService } from '../lib/ai/aiService';
import type { AIResponse } from '../lib/ai/aiService';
import { useAuthStore } from '../lib/auth';

interface Message {
  id: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  confidence?: string;
}

export const Coach = () => {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'ASSISTANT',
      content: 'How can I help you today? Ask me to build a workout, analyze your week, or suggest a meal based on your current goal.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !user || loading) return;
    
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'USER', content: userMsg }]);
    setLoading(true);

    try {
      const response: AIResponse = await aiService.askCoach(user.id, userMsg);
      setMessages(prev => [...prev, { 
        id: Date.now().toString() + 'r', 
        role: 'ASSISTANT', 
        content: response.content,
        confidence: response.confidence 
      }]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { 
        id: Date.now().toString() + 'e', 
        role: 'ASSISTANT', 
        content: 'I encountered an error analyzing your data. Please try again.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-32 px-4 pt-4 flex flex-col h-screen animate-fade-in relative">
      <div className="mb-6 flex items-center gap-3">
        <div className="bg-purple-500/10 p-3 rounded-xl border border-purple-500/20">
          <Sparkles className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase">ARC</h1>
          <p className="text-textMuted font-bold tracking-widest text-xs mt-1 uppercase">Your Intelligence Layer</p>
        </div>
      </div>

      <div className="flex-1 bg-surface border border-border rounded-2xl overflow-hidden flex flex-col relative mb-4">
        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'USER' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[85%] ${msg.role === 'USER' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className="flex-shrink-0 mt-1">
                  {msg.role === 'USER' ? (
                    <div className="w-8 h-8 bg-surfaceHighlight rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-purple-500/20 border border-purple-500/30 rounded-full flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                    </div>
                  )}
                </div>
                <div className={`p-4 rounded-2xl ${
                  msg.role === 'USER' 
                    ? 'bg-primary text-black rounded-tr-none' 
                    : 'bg-surfaceHighlight border border-border rounded-tl-none'
                }`}>
                  <p className="whitespace-pre-wrap font-medium text-sm">{msg.content}</p>
                </div>
              </div>
            </div>
          ))}
          {loading && (
             <div className="flex justify-start">
               <div className="flex gap-3 max-w-[85%]">
                 <div className="w-8 h-8 bg-purple-500/20 border border-purple-500/30 rounded-full flex items-center justify-center">
                   <RefreshCw className="w-4 h-4 text-purple-400 animate-spin" />
                 </div>
                 <div className="p-4 rounded-2xl bg-surfaceHighlight border border-border rounded-tl-none">
                   <div className="flex gap-1 items-center h-5">
                     <span className="w-1.5 h-1.5 bg-textMuted rounded-full animate-bounce"></span>
                     <span className="w-1.5 h-1.5 bg-textMuted rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                     <span className="w-1.5 h-1.5 bg-textMuted rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                   </div>
                 </div>
               </div>
             </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 bg-background border-t border-border">
          <div className="relative">
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask ARC..."
              disabled={loading}
              className="w-full bg-surface border border-border rounded-xl py-4 pl-4 pr-12 text-white placeholder-textMuted focus:outline-none focus:border-primary/50"
            />
            <button 
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="absolute right-2 top-2 bottom-2 bg-primary/20 text-primary hover:bg-primary hover:text-black rounded-lg w-10 flex items-center justify-center transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
