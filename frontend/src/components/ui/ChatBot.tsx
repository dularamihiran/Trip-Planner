'use client';

import { useState, useEffect, useRef } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I am your AI Travel Assistant. Ask me anything about attractions in Sri Lanka (e.g. Galle Fort, Sigiriya) or food and history! 🌴',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check login state on mount and keep checking for user
  useEffect(() => {
    const checkLogin = () => {
      const userStr = localStorage.getItem('user');
      setIsLoggedIn(!!userStr);
    };

    checkLogin();
    // Listen for local storage updates to react if user logs in/out
    window.addEventListener('storage', checkLogin);
    
    // Periodically check in case Next.js routing updates storage internally
    const interval = setInterval(checkLogin, 2000);

    return () => {
      window.removeEventListener('storage', checkLogin);
      clearInterval(interval);
    };
  }, []);

  // Auto-scroll messages to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (!isLoggedIn) return null;

  const handleSend = async (textToSend?: string) => {
    const queryText = textToSend || input;
    if (!queryText.trim() || isLoading) return;

    if (!textToSend) setInput('');

    // Append user message
    const updatedMessages = [...messages, { role: 'user', content: queryText } as Message];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // Fetch response from our gpt-3.5-turbo backend chatbot endpoint
      const response = await fetch('http://localhost:5000/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({
            role: m.role,
            content: m.content
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to communicate with travel chatbot');
      }

      const data = await response.json();
      
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: data.reply || 'Sorry, I couldn\'t process that description.' }
      ]);
    } catch (err) {
      console.error('Error talking with chatbot:', err);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: '❌ Connection error. Please make sure your backend server is active and API keys are set.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const suggestionChips = [
    { text: '🏰 Tell me about Galle Fort', query: 'Tell me about Galle Fort, Sri Lanka. What is its history and entrance fee?' },
    { text: '🏛️ Sigiriya Fortress guide', query: 'Tell me about Sigiriya Rock Fortress. Give me a description, history, and tips to visit.' },
    { text: '🍛 Sri Lankan foods to try', query: 'What are the top traditional foods to try in Sri Lanka?' },
    { text: '🚗 Best time to visit Ella', query: 'What is the best time to visit Ella and Nuwara Eliya, and what are key spots there?' }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans antialiased">
      {/* Floating Chat Bubble Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white rounded-full shadow-2xl hover:shadow-emerald-500/20 hover:scale-110 hover:-translate-y-1 active:scale-95 transition-all duration-300 group overflow-hidden border border-emerald-400/20"
          title="Ask Travel Assistant"
        >
          {/* Pulsing glow ring */}
          <span className="absolute inset-0 rounded-full border border-white/20 animate-ping opacity-75"></span>
          
          <svg className="w-7 h-7 text-white transform group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      )}

      {/* Chat Window Popup */}
      {isOpen && (
        <div className="flex flex-col w-[350px] sm:w-[380px] h-[500px] bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl overflow-hidden transform scale-100 origin-bottom-right transition-all duration-300 animate-fadeIn">
          
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-slate-955 border-b border-slate-800/80">
            <div className="flex items-center space-x-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <div>
                <h3 className="font-extrabold text-sm text-white tracking-wide">Antigravity AI Assistant</h3>
                <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">gpt-3.5-turbo active</p>
              </div>
            </div>
            
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/60 transition-colors"
              title="Close Panel"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages Log */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slideIn`}
              >
                <div
                  className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed font-medium ${
                    msg.role === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-none shadow-md shadow-emerald-700/10'
                      : 'bg-slate-800/90 text-slate-100 border border-slate-850 rounded-bl-none'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            
            {/* Thinking typing bubble indicator */}
            {isLoading && (
              <div className="flex justify-start items-center space-x-2 animate-pulse text-[11px] text-slate-400 bg-slate-800/40 px-3 py-1.5 rounded-xl border border-slate-850 w-max">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span>Assistant is thinking...</span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          {messages.length === 1 && (
            <div className="px-4 py-2 border-t border-slate-800/50 bg-slate-900/30">
              <p className="text-[10px] text-slate-500 font-bold mb-1.5 uppercase tracking-wide">Quick Questions</p>
              <div className="flex flex-wrap gap-1.5">
                {suggestionChips.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(chip.query)}
                    className="text-[10px] font-bold text-slate-300 bg-slate-800/70 border border-slate-700/50 hover:bg-slate-700 hover:text-white px-2.5 py-1 rounded-full transition-all active:scale-95 duration-100"
                  >
                    {chip.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Input Footer */}
          <div className="p-4 border-t border-slate-800/80 bg-slate-950/80">
            <div className="flex items-center space-x-2 bg-slate-800/90 border border-slate-700/80 rounded-2xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-emerald-500/55 transition-all">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask about Galle Fort or other places..."
                className="flex-1 bg-transparent text-white text-xs placeholder-slate-500 outline-none w-full"
                disabled={isLoading}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="text-emerald-400 hover:text-emerald-300 disabled:opacity-40 disabled:hover:text-emerald-400 p-1 rounded-lg transition-colors"
                title="Send Message"
              >
                <svg className="w-5 h-5 transform rotate-90" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
