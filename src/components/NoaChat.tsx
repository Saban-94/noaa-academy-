import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, Sparkles, ShoppingBag, ArrowLeft, Plus, History, Video } from 'lucide-react';
import { Message, Product, MediaItem } from '../types';
import { chatWithNoa } from '../services/geminiService';
import { logChat, fetchChatHistory } from '../services/apiService';

interface NoaChatProps {
  products: Product[];
  currentContext: string;
  mediaItems?: MediaItem[];
  onNavigate?: (id: string) => void;
}

export const NoaChat: React.FC<NoaChatProps> = ({ products, currentContext, mediaItems, onNavigate }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      content: 'שלום! אני נועה, סוכנת ה-AI שלך. אני כאן כדי לעזור לך להפיק את המקסימום מההדרכות ולהגדיל מכירות. על מה נדבר היום?',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load history on mount
  useEffect(() => {
    const loadHistory = async () => {
      const history = await fetchChatHistory();
      if (history && history.length > 0) {
        // Optionally prepend history or show a separate history tab
        console.log("Session History loaded from Sheets:", history);
      }
    };
    loadHistory();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const mediaListString = mediaItems?.map(m => `- ${m.title} (ID: ${m.id})`).join('\n');
    const rawResponse = await chatWithNoa([...messages, userMsg], currentContext, products, mediaListString);
    
    // Parse Navigation Tag
    let cleanResponse = rawResponse;
    const navMatch = rawResponse.match(/\[NAVIGATE:([a-zA-Z0-9_-]+)\]/);
    let targetMedia: MediaItem | undefined;
    if (navMatch) {
      const targetId = navMatch[1];
      targetMedia = mediaItems?.find(m => m.id === targetId);
      cleanResponse = rawResponse.replace(/\[NAVIGATE:[a-zA-Z0-9_-]+\]/g, '').trim();
    }

    // Log to Google Sheets
    await logChat({
      question: input,
      answer: cleanResponse,
      author: 'ישראל ישראלי'
    });

    // Simulate finding products in response
    const suggestedProducts = products.filter(p => cleanResponse.includes(p.name));

    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      content: cleanResponse,
      timestamp: new Date(),
      recommendations: suggestedProducts.length > 0 ? suggestedProducts : undefined,
      navigationId: targetMedia?.id // Add navigationId to Message type
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsTyping(false);
  };

  return (
    <div className="flex flex-col h-full bg-brand-chat border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-gradient-to-tr from-blue-600 to-cyan-400 shadow-lg" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">נועה</span>
              <span className="noa-badge">סוכנת AI</span>
            </div>
            <p className="text-[10px] text-brand-muted font-medium mt-0.5">יועצת אסטרטגית Hub</p>
          </div>
        </div>
        <Sparkles size={16} className="text-brand-blue" />
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'} flex-col gap-2`}>
            <div className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row' : 'flex-row-reverse'}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-inner ${msg.role === 'user' ? 'bg-slate-800' : 'bg-brand-blue/20 text-brand-blue'}`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`max-w-[85%] p-4 rounded-xl text-sm leading-relaxed ${
                msg.role === 'user' 
                ? 'bg-slate-800/50 text-slate-100' 
                : 'glass-item text-brand-text border-white/5 font-medium'
              }`}>
                {msg.content}
              </div>
            </div>

            {/* Navigation Quick Action Card */}
            <AnimatePresence>
              {msg.navigationId && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-3 pr-11"
                >
                  <button 
                    onClick={() => onNavigate && onNavigate(msg.navigationId!)}
                    className="w-full glass-item p-4 border-brand-blue/30 bg-brand-blue/5 hover:bg-brand-blue/10 transition-all flex items-center justify-between group text-right"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-brand-blue/20 rounded-xl flex items-center justify-center text-brand-blue">
                        <Video size={20} />
                      </div>
                      <div>
                        <div className="text-[10px] text-brand-blue font-black uppercase tracking-widest">מצאתי תוכן רלוונטי</div>
                        <div className="text-white font-bold text-sm">לחץ כאן לצפייה במקור הידע</div>
                      </div>
                    </div>
                    <ArrowLeft size={16} className="text-brand-blue group-hover:-translate-x-1 transition-transform" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Recommendations (Upsell Cards) */}
            <AnimatePresence>
              {msg.recommendations && msg.recommendations.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="mt-2 pr-11"
                >
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {msg.recommendations.map(product => (
                      <div key={product.id} className="min-w-[220px] bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-xl p-4 shadow-lg flex flex-col gap-3">
                        <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">הצעת UPSELL מומלצת</div>
                        <h5 className="font-bold text-sm text-slate-900">{product.name}</h5>
                        <div className="flex items-center justify-between mt-auto">
                          <span className="font-black text-brand-blue text-lg">₪{product.price}</span>
                          <button className="bg-brand-dark text-white px-3 py-1.5 rounded-lg text-[11px] font-bold hover:bg-slate-800 transition-colors">
                            הוסף לסל
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-brand-muted text-xs mr-11">
            <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-1.5 h-1.5 bg-brand-blue rounded-full" />
            <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-1.5 h-1.5 bg-brand-blue rounded-full" />
            <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-1.5 h-1.5 bg-brand-blue rounded-full" />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-black/40 border-t border-white/5">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="שאל את נועה על התוכן..."
            className="w-full bg-white/[0.05] border border-white/10 rounded-full py-3 px-6 focus:outline-none focus:border-brand-blue/50 transition-colors text-white text-sm placeholder-brand-muted"
          />
          <button 
            onClick={handleSend}
            className="absolute left-1.5 top-1.5 w-9 h-9 bg-brand-blue hover:bg-cyan-400 rounded-full flex items-center justify-center transition-colors shadow-lg active:scale-90"
          >
            <Send size={16} className="text-brand-dark" />
          </button>
        </div>
      </div>
    </div>
  );
};
