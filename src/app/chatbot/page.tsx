"use client";

import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>(
    [{ text: "Hello! How can I help you today?", isUser: false }]
  );

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      setMessages([...messages, { text: message, isUser: true }]);
      setMessage("");

      // Simulate bot response
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            text: "Thank you for your message! Our team will get back to you shortly.",
            isUser: false,
          },
        ]);
      }, 1000);
    }
  };

  return (
    <>
      {/* Floating Chat Bubble */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Chat Window */}
        <div
          className={`absolute bottom-20 right-0 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 transition-all duration-300 ease-in-out ${
            isOpen
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-95 translate-y-4 pointer-events-none"
          }`}
        >
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-t-2xl p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">ZeroBin Assistant</h3>
                <p className="text-xs text-green-100">
                  Online • Typically replies instantly
                </p>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="h-96 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.isUser ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    msg.isUser
                      ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white"
                      : "bg-white text-slate-900 border border-slate-200"
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <form
            onSubmit={handleSend}
            className="p-4 bg-white border-t border-slate-200 rounded-b-2xl"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-100 focus:outline-none text-sm"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white p-2 rounded-lg transition-all"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>

        {/* Helper Text Label */}
        <div
          className={`absolute bottom-20 right-20 transition-all duration-300 ${
            isOpen
              ? "opacity-0 scale-95 pointer-events-none"
              : "opacity-100 scale-100"
          }`}
        >
          <div className="bg-white px-4 py-2 rounded-full shadow-lg border border-slate-200 whitespace-nowrap">
            <p className="text-sm text-slate-700 font-medium">
              How can I help you?
            </p>
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
                isOpen
                  ? "opacity-0 rotate-90 scale-0"
                  : "opacity-100 rotate-0 scale-100"
              }`}
            />
            <X
              className={`w-7 h-7 absolute top-0 left-0 transition-all duration-300 ${
                isOpen
                  ? "opacity-100 rotate-0 scale-100"
                  : "opacity-0 -rotate-90 scale-0"
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
