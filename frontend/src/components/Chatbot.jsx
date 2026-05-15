import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, User, Bot, Loader2, Sparkles, Activity } from 'lucide-react';
import { chatbotService } from '../services/api';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hello! I am MediRoute AI. How can I assist you with hospital operations or emergency help today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [radarData, setRadarData] = useState({ hospitals: [], location: null });
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const handleRadarUpdate = (e) => {
      console.log("[CHAT RADAR SYNC]", e.detail);
      setRadarData(e.detail);
    };
    window.addEventListener('medir-radar-update', handleRadarUpdate);
    return () => window.removeEventListener('medir-radar-update', handleRadarUpdate);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { type: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const role = localStorage.getItem('role') || 'patient';
      const res = await chatbotService.sendMessage(userMsg, role, radarData.hospitals, radarData.location);
      setMessages(prev => [...prev, { type: 'bot', text: res.data.response }]);
    } catch (err) {
      console.error("[CHAT ERROR]", err);
      setMessages(prev => [...prev, { type: 'bot', text: "Service temporarily unavailable. Please try again soon." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-8 right-8 z-[200] p-6 rounded-[2rem] shadow-2xl shadow-sky-500/30 transition-all duration-500 flex items-center justify-center hover:scale-110 active:scale-95 group ${isOpen ? 'bg-slate-900 text-white' : 'bg-brand-primary text-white'}`}
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} className="group-hover:rotate-12 transition-transform" />}
        {!isOpen && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-white animate-bounce"></span>
        )}
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 100, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 100 }}
            className="fixed bottom-28 right-8 w-[400px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-10rem)] bg-white/90 backdrop-blur-xl rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] z-[200] flex flex-col overflow-hidden border border-white"
          >
            {/* Header */}
            <div className="p-8 bg-slate-900 text-white flex items-center gap-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/20 to-transparent"></div>
                <div className="bg-brand-primary p-3 rounded-2xl relative z-10 rotate-3">
                    <Activity size={24} />
                </div>
                <div className="relative z-10">
                    <h3 className="font-black text-xl tracking-tight">MediRoute <span className="text-brand-primary">AI</span></h3>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                        <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">Neural Engine v2.0</p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-slate-50/30">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-5 rounded-[2rem] text-sm font-bold shadow-sm ${
                    m.type === 'user' 
                      ? 'bg-brand-primary text-white rounded-tr-none' 
                      : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white p-5 rounded-[2rem] rounded-tl-none border border-slate-100 shadow-sm">
                    <Loader2 className="animate-spin text-brand-primary" size={20} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-8 bg-white border-t border-slate-100">
                <form onSubmit={handleSend} className="relative group">
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message..."
                        className="w-full pl-6 pr-16 py-5 bg-slate-50 border border-slate-200 rounded-[2rem] outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary font-bold transition-all placeholder:text-slate-300"
                    />
                    <button 
                        type="submit"
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-slate-900 text-white rounded-2xl hover:bg-brand-primary transition-all active:scale-90"
                    >
                        <Send size={18} />
                    </button>
                </form>
                <p className="text-center mt-6 text-[9px] font-black text-slate-300 uppercase tracking-widest flex items-center justify-center gap-2">
                    <Sparkles size={10} /> AI Agent may provide medical guidance
                </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
