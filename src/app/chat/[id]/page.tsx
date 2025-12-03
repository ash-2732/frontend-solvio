"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import ChatInterface from "@/components/flash-trade/ChatInterface";
import { Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function ChatPage() {
    const { id } = useParams(); // This is the listing ID
    const router = useRouter();
    const { user, token } = useAuth();
    const [chatId, setChatId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrCreateChat = async () => {
            try {
                // Try to get existing chat by listing ID
                try {
                    const chat = await apiRequest<{ id: string | number }>(`/chats/listing/${id}`, {
                        auth: true,
                        token,
                    });
                    setChatId(String(chat.id));
                } catch (fetchError: any) {
                    // If chat doesn't exist (404), create a new one
                    if (fetchError?.status === 404) {
                        console.log("Chat not found, creating new chat...");
                        const newChat = await apiRequest<{ id: string | number }>(`/chats`, {
                            method: 'POST',
                            auth: true,
                            token,
                            body: JSON.stringify({
                                listing_id: id
                            }),
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        });
                        setChatId(String(newChat.id));
                    } else {
                        // If it's a different error, throw it
                        throw fetchError;
                    }
                }
            } catch (e: any) {
                console.error("Error fetching/creating chat:", e);
                setError(e?.message || "Failed to load chat");
            } finally {
                setLoading(false);
            }
        };

        if (id && token) {
            fetchOrCreateChat();
        }
    }, [id, token]);

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen flex items-center justify-center bg-slate-50">
                    <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
                </div>
            </ProtectedRoute>
        );
    }

    if (error || !chatId) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen flex items-center justify-center bg-slate-50">
                    <div className="text-center">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <p className="text-slate-500 mb-4">{error || "Chat not found"}</p>
                        <Link href="/user/my-listings" className="text-emerald-600 hover:underline">
                            Back to My Listings
                        </Link>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-2xl font-bold text-slate-900 mb-6">Transaction Chat</h1>
                    <ChatInterface chatId={chatId} currentUser={user} />
                </div>
            </div>
        </ProtectedRoute>
    );
}
