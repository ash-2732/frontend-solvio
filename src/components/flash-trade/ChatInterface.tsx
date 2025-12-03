"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Phone, AlertCircle, Loader2, Lock, Unlock } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface Message {
    id: string;
    sender_id: string;
    content: string;
    created_at: string;
    is_read: boolean;
}

interface ChatInterfaceProps {
    chatId: string;
    currentUser: any; // User object
}

export default function ChatInterface({ chatId, currentUser }: ChatInterfaceProps) {
    const { token } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [chatStatus, setChatStatus] = useState<string>("unlocked");
    const [unlocking, setUnlocking] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const fetchMessages = async () => {
        try {
            const [msgs, chat] = await Promise.all([
                apiRequest<Message[]>(`/chats/${chatId}/messages`, { auth: true, token }),
                apiRequest<{ status: string }>(`/chats/${chatId}`, { auth: true, token })
            ]);
            setMessages(Array.isArray(msgs) ? msgs : []);
            setChatStatus(typeof chat?.status === "string" ? chat.status : "unlocked");
        } catch (e) {
            console.error("Failed to fetch messages", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, [chatId, token]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const msg = await apiRequest<Message>(`/chats/${chatId}/messages`, {
                method: "POST",
                body: JSON.stringify({ content: newMessage }),
                auth: true,
                token,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            setMessages((prev) => [...prev, msg]);
            setNewMessage("");
        } catch (e) {
            console.error("Failed to send message", e);
            alert("Failed to send message. Please try again.");
        }
    };

    const handleUnlockChat = async () => {
        setUnlocking(true);
        try {
            const updatedChat = await apiRequest<{ status: string }>(`/chats/${chatId}/confirm-deal`, {
                method: "POST",
                body: JSON.stringify({ confirm: true }),
                auth: true,
                token,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            setChatStatus(typeof updatedChat?.status === "string" ? updatedChat.status : chatStatus);
        } catch (e) {
            console.error("Failed to unlock chat", e);
            alert("Failed to unlock chat. Please try again.");
        } finally {
            setUnlocking(false);
        }
    };

    if (loading) {
        return <div className="h-[600px] flex items-center justify-center bg-white rounded-2xl border border-slate-100"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>;
    }

    const isLocked = chatStatus === "locked";
    const isClosed = chatStatus === "closed";
    const canSendMessages = !isLocked && !isClosed;

    return (
        <div className="flex flex-col h-[600px] bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-slate-900">Chat</h3>
                    <p className="text-xs text-slate-500">
                        {isClosed ? "Transaction Completed" : "Transaction in Progress"}
                    </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                    <AlertCircle className="w-3 h-3" />
                    Phone number hidden for privacy
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="text-center text-slate-400 py-10">No messages yet. Start the conversation!</div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.sender_id === currentUser?.id ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.sender_id === currentUser?.id
                                    ? "bg-green-600 text-white rounded-tr-none"
                                    : "bg-slate-100 text-slate-800 rounded-tl-none"
                                    }`}
                            >
                                <p className="text-sm">{msg.content}</p>
                                <p
                                    className={`text-[10px] mt-1 ${msg.sender_id === currentUser?.id ? "text-green-100" : "text-slate-400"
                                        }`}
                                >
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-slate-100 bg-white">
                {isClosed && (
                    <div className="mb-3 p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs text-slate-600 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        This chat has been closed as the transaction is complete.
                    </div>
                )}
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={isClosed ? "Chat is closed..." : "Type a message..."}
                        disabled={isClosed}
                        className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none disabled:bg-slate-50 disabled:text-slate-400"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || isClosed}
                        className="p-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </form>
        </div>
    );
}
