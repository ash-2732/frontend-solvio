"use client";

import { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Loader2,
} from "lucide-react";

// Types
interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: string;
  isLoading?: boolean;
  isError?: boolean;
}

// ChatMessage component
interface ChatMessageProps {
  message: Message;
  isBot: boolean;
}

const ChatMessage = ({ message, isBot }: ChatMessageProps) => {
  return (
    <div className={`flex ${isBot ? "justify-start" : "justify-end"} mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      {isBot && (
        <div className="bg-green-100 p-2 rounded-full mr-2 flex-shrink-0">
          <Bot className="h-5 w-5 text-green-600" />
        </div>
      )}
      <div
        className={`max-w-[70%] p-3 rounded-2xl ${
          isBot
            ? "bg-white text-slate-900 border border-slate-200"
            : "bg-gradient-to-r from-green-600 to-emerald-600 text-white"
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">
          {message.isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Thinking...
            </span>
          ) : (
            message.text
          )}
        </p>
        {message.timestamp && !message.isLoading && (
          <p className={`text-xs mt-1 ${isBot ? "text-gray-500" : "text-green-100"}`}>
            {message.timestamp}
          </p>
        )}
      </div>
      {!isBot && (
        <div className="bg-gray-100 p-2 rounded-full ml-2 flex-shrink-0">
          <User className="h-5 w-5 text-gray-600" />
        </div>
      )}
    </div>
  );
};

// Main FloatingChatbot component
export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your EcoAssistant. I can help you with:\n\n• Answer waste management questions\n• Check your quests and stats\n• Provide recycling advice\n\nHow can I help you today?",
      isBot: true,
      timestamp: formatTime(new Date()),
    },
  ]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Voice and TTS
  const [isListening, setIsListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const recognitionRef = useRef<any>(null);
  const messageRef = useRef("");

  // API base URL
  const FASTAPI_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  // Format time helper
  function formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  // Clean markdown-like asterisks from model output
  const cleanBotText = (text: string): string => {
    if (!text) return text;
    let out = String(text);
    try {
      // Remove code ticks and inline code
      out = out.replace(/`{1,3}([^`]*?)`{1,3}/gs, "$1");
      // Remove markdown headings like #, ##, ### at line start
      out = out.replace(/^\s*#{1,6}\s+/gm, "");
      // Remove blockquote markers
      out = out.replace(/^\s*>+\s?/gm, "");
      // Remove bold markers **text**
      out = out.replace(/\*\*(.*?)\*\*/gs, "$1");
      // Remove italics *text* or _text_
      out = out.replace(/\*(.*?)\*/g, "$1").replace(/_(.*?)_/g, "$1");
      // Replace leading '* ' bullets with a bullet char
      out = out.replace(/^\s*\*\s+/gm, "• ");
      // Replace leading '- ' bullets with a bullet char
      out = out.replace(/^\s*-\s+/gm, "• ");
      // Replace numbered list like '1. ' with '• '
      out = out.replace(/^\s*\d+\.\s+/gm, "• ");
      // Remove remaining stray asterisks
      out = out.replace(/\*/g, "");
      // Collapse multiple blank lines
      out = out.replace(/\n{3,}/g, "\n\n");
      // Trim whitespace
      out = out.trim();
    } catch (e) {
      return String(text).replace(/\*/g, "");
    }
    return out;
  };

  // Text-to-speech
  const speak = (text: string) => {
    if (!ttsEnabled || !("speechSynthesis" in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  };

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => {
        setIsListening(false);
        // Automatically submit the message when speech ends
        if (messageRef.current.trim()) {
          handleSubmit(null, messageRef.current);
        }
      };
      recognition.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setMessage(finalTranscript || interimTranscript);
      };
      recognitionRef.current = recognition;
    }
  }, []);

  // Update message ref
  useEffect(() => {
    messageRef.current = message;
  }, [message]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current && isOpen) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  // Send message to backend API
  const sendToBackend = async (text: string) => {
    try {
      const loadingMessage: Message = {
        id: messages.length + 2,
        text: "Thinking...",
        isBot: true,
        timestamp: formatTime(new Date()),
        isLoading: true,
      };

      setMessages((prev) => [...prev, loadingMessage]);

      // Get the auth token from localStorage
      const authData = localStorage.getItem("auth");
      const token = authData ? JSON.parse(authData).token : null;

      // Prepare request body for ReAct Agent
      const requestBody: {
        message: string;
        session_id?: string | null;
      } = {
        message: text,
      };

      if (sessionId) {
        requestBody.session_id = sessionId;
      }

      // Call the ReAct Agent API endpoint
      const response = await fetch(`${FASTAPI_BASE}/agent/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to get response from chatbot");
      }
      const data = await response.json();

      // Extract message and session_id from response
      const rawBotText = data?.response ?? "";
      const botText = cleanBotText(String(rawBotText));

      // Store session_id for future requests
      if (data?.session_id) {
        setSessionId(data.session_id);
      }

      setMessages((prev) => {
        const filtered = prev.filter((msg) => !msg.isLoading);
        return [
          ...filtered,
          {
            id: filtered.length + 1,
            text: botText,
            isBot: true,
            timestamp: formatTime(new Date()),
          },
        ];
      });

      speak(botText);
    } catch (error) {
      console.error("Error:", error);

      setMessages((prev) => {
        const filtered = prev.filter((msg) => !msg.isLoading);
        return [
          ...filtered,
          {
            id: filtered.length + 1,
            text: error instanceof Error ? error.message : "Sorry, I encountered an error. Please try again later.",
            isBot: true,
            timestamp: formatTime(new Date()),
            isError: true,
          },
        ];
      });
    }
  };

  // Handle submit to ReAct Agent backend
  const handleSubmit = async (e: React.FormEvent | null, text = message) => {
    if (e) e.preventDefault();
    if (!text.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text,
      isBot: false,
      timestamp: formatTime(new Date()),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");

    // Send to backend
    await sendToBackend(text);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        {/* Chat Window */}
        <div
          className={`absolute bottom-20 right-0 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 transition-all duration-300 ease-in-out ${
            isOpen
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-95 translate-y-4 pointer-events-none"
          }`}
        >
          {/* Chatbot Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-t-2xl p-4 text-white">
            <div className="flex items-center">
              <div className="bg-white bg-opacity-20 p-2 rounded-full mr-3">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold">EcoAssistant</h3>
                <p className="text-xs text-green-100">Online • Ready to help</p>
              </div>
              <button
                onClick={toggleChat}
                className="ml-auto p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="h-80 overflow-y-auto p-4 bg-slate-50">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} isBot={msg.isBot} />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="border-t border-gray-200 bg-white rounded-b-2xl">
            <div className="p-3">
              {/* Top Row - Action Icons */}
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-2 text-gray-400 hover:text-green-600 transition-colors ${
                    isListening ? "text-red-500" : ""
                  }`}
                  title={isListening ? "Stop listening" : "Start voice input"}
                >
                  {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </button>
                <button
                  type="button"
                  onClick={() => setTtsEnabled(!ttsEnabled)}
                  className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                  title={ttsEnabled ? "Disable text-to-speech" : "Enable text-to-speech"}
                >
                  {ttsEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                </button>
              </div>

              {/* Bottom Row - Text Input and Send Button */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type or say something..."
                  className="flex-1 border-0 focus:ring-0 focus:outline-none px-3 py-2 bg-slate-50 rounded-lg text-sm text-slate-900"
                />
                <button
                  type="submit"
                  className="p-2 text-white bg-green-600 rounded-full hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!message.trim()}
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Helper Text Label */}
        <div
          className={`absolute bottom-20 right-20 transition-all duration-300 ${
            isOpen ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100"
          }`}
        >
          <div className="bg-white px-4 py-2 rounded-full shadow-lg border border-slate-200 whitespace-nowrap">
            <p className="text-sm text-slate-700 font-medium">How can I help you?</p>
          </div>
        </div>

        {/* Chat Bubble Button */}
        <button
          onClick={toggleChat}
          className="w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
        >
          <div className="relative">
            <MessageCircle
              className={`w-7 h-7 transition-all duration-300 ${
                isOpen ? "opacity-0 rotate-90 scale-0" : "opacity-100 rotate-0 scale-100"
              }`}
            />
            <X
              className={`w-7 h-7 absolute top-0 left-0 transition-all duration-300 ${
                isOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-0"
              }`}
            />
          </div>
        </button>

        {/* Pulse Animation Ring */}
        {!isOpen && (
          <div className="absolute inset-0 w-16 h-16 rounded-full bg-green-600 animate-ping opacity-20 pointer-events-none"></div>
        )}
      </div>
    </>
  );
}
