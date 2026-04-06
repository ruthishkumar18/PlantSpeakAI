"use client"

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { chatbotInteractionAndLanguageSupport } from '@/ai/flows/chatbot-interaction-and-language-support-flow';
import { VoiceInput } from './VoiceInput';
import { cn } from '@/lib/utils';

export function ChatbotFloating() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'bot' | 'user'; content: string }[]>([
    { role: 'bot', content: 'Hello! I am your PlantSpeakAI assistant. How can I help you today?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
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
      const response = await chatbotInteractionAndLanguageSupport({
        query,
      });
      setMessages(prev => [...prev, { role: 'bot', content: response.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', content: 'Sorry, I encountered an error. Please try again later.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <Card className="w-[350px] sm:w-[400px] h-[500px] flex flex-col shadow-2xl mb-4 overflow-hidden border-2 animate-in slide-in-from-bottom-5">
          <CardHeader className="p-4 bg-primary text-primary-foreground flex flex-row items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Bot className="h-6 w-6" />
              <div>
                <h3 className="font-bold text-sm">PlantSpeak AI Chat</h3>
                <p className="text-[10px] opacity-80">Qwen AI Powered Assistant</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 text-primary-foreground hover:bg-white/20">
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0 bg-muted/30">
            <ScrollArea className="h-full p-4" viewportRef={scrollRef}>
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <div key={i} className={cn("flex gap-2 max-w-[85%]", msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto")}>
                    <div className={cn("shrink-0 h-8 w-8 rounded-full flex items-center justify-center", msg.role === 'bot' ? "bg-primary text-white" : "bg-secondary text-secondary-foreground")}>
                      {msg.role === 'bot' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    </div>
                    <div className={cn("p-3 rounded-2xl text-sm shadow-sm", msg.role === 'bot' ? "bg-white dark:bg-zinc-800 rounded-tl-none" : "bg-primary text-white rounded-tr-none")}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-2 mr-auto max-w-[85%]">
                    <div className="shrink-0 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="p-3 bg-white dark:bg-zinc-800 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                      <div className="h-1.5 w-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="h-1.5 w-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="h-1.5 w-1.5 bg-zinc-400 rounded-full animate-bounce"></div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="p-4 bg-white dark:bg-zinc-900 border-t shrink-0 flex gap-2">
            <VoiceInput onTranscript={(text) => handleSend(text)} />
            <Input 
              placeholder="Type your question..." 
              value={input} 
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              className="flex-1"
            />
            <Button size="icon" onClick={() => handleSend()} className="rounded-full">
              <Send className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}
      <Button 
        size="icon" 
        className="h-14 w-14 rounded-full shadow-xl hover:scale-110 transition-transform bg-primary"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-7 w-7" /> : <MessageCircle className="h-7 w-7" />}
      </Button>
    </div>
  );
}
