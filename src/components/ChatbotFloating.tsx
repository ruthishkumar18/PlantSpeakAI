"use client"

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User, Info, Smartphone, Droplet, Leaf, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { chatbotInteractionAndLanguageSupport } from '@/ai/flows/chatbot-interaction-and-language-support-flow';
import { cn } from '@/lib/utils';

export function ChatbotFloating() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'bot' | 'user'; content: string }[]>([
    { role: 'bot', content: "👋 Hi! I'm your PlantSpeakAI Assistant. Ask me anything about your plant health or ESP32 setup!" },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeLang, setActiveLang] = useState('EN');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (textOverride?: string) => {
    const query = textOverride || input;
    if (!query.trim()) return;

    const userMessage = { role: 'user' as const, content: query };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatbotInteractionAndLanguageSupport({ query });
      setMessages(prev => [...prev, { role: 'bot', content: response.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', content: '⚠️ Service unavailable. Please try again later.' }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    { label: "Stress types", icon: Activity },
    { label: "Watering", icon: Droplet },
    { label: "ESP32", icon: Smartphone },
    { label: "ThingSpeak", icon: Leaf },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <Card className="w-[350px] sm:w-[380px] h-[500px] flex flex-col shadow-2xl mb-4 overflow-hidden border-none rounded-[1.5rem] animate-in slide-in-from-bottom-5">
          <CardHeader className="p-5 bg-primary text-primary-foreground flex flex-row items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-black text-sm tracking-tight">PlantSpeakAI Assistant</h3>
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-400" />
                  <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Active</p>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 text-primary-foreground hover:bg-white/10 rounded-lg">
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>
          
          <div className="bg-white border-b px-4 py-2 flex items-center justify-around shrink-0">
            {['EN', 'தமிழ்', 'हिंदी'].map((lang) => (
              <Button
                key={lang}
                variant="ghost"
                size="sm"
                onClick={() => setActiveLang(lang)}
                className={cn(
                  "h-7 text-[10px] font-black rounded-md px-4",
                  activeLang === lang ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground"
                )}
              >
                {lang}
              </Button>
            ))}
          </div>

          <CardContent className="flex-1 overflow-hidden p-0 bg-zinc-50">
            <ScrollArea className="h-full p-4" viewportRef={scrollRef}>
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <div key={i} className={cn("flex gap-2 max-w-[85%]", msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto")}>
                    <div className={cn("p-3 rounded-2xl text-[13px] font-medium shadow-sm leading-snug", 
                      msg.role === 'bot' 
                        ? "bg-white text-zinc-700 rounded-tl-none border border-zinc-100" 
                        : "bg-primary text-white rounded-tr-none")}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-2 mr-auto max-w-[85%]">
                    <div className="p-3 bg-white border border-zinc-100 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                      <div className="h-1.5 w-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="h-1.5 w-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="h-1.5 w-1.5 bg-zinc-400 rounded-full animate-bounce"></div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 p-4 bg-white border-t shrink-0">
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(s.label)}
                  className="flex items-center gap-1.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-100 text-[10px] font-bold px-3 py-1.5 rounded-full transition-all"
                >
                  <s.icon className="h-3 w-3 text-primary opacity-60" />
                  {s.label}
                </button>
              ))}
            </div>
            
            <div className="flex gap-2 w-full">
              <div className="flex-1 relative">
                <Input 
                  placeholder="Type here..." 
                  value={input} 
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  className="rounded-full bg-zinc-50 border-zinc-100 h-10 pr-10 text-xs font-medium"
                />
              </div>
              <Button size="icon" onClick={() => handleSend()} className="rounded-full h-10 w-10 bg-primary shadow-lg">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
      <Button 
        size="icon" 
        className="h-14 w-14 rounded-full shadow-2xl hover:scale-110 transition-all bg-primary border-4 border-white dark:border-zinc-800"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-7 w-7" /> : <Leaf className="h-7 w-7" />}
      </Button>
    </div>
  );
}
