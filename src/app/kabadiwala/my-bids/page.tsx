"use client";

import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Loader2, MessageSquare, Scan, CheckCircle, Clock, XCircle, ShoppingBag, Package, TrendingUp, DollarSign } from "lucide-react";
import Link from "next/link";

export default function MyBidsPage() {
    const { token } = useAuth();
    const [bids, setBids] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBids = async () => {
            try {
                const res = await apiRequest("/bids/my-bids", { auth: true, token });
                setBids((res as any) || []);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchBids();
    }, [token]);

    const acceptedBids = bids.filter(bid => bid.status === 'accepted');
    const pendingBids = bids.filter(bid => bid.status === 'pending');
    const rejectedBids = bids.filter(bid => bid.status === 'rejected');

    return (
        <ProtectedRoute>
            <div className="min-h-screen py-8 sm:py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Hero Header */}
                    <div className="mb-8">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-lg">
                                    <ShoppingBag className="w-7 h-7" />
                                </div>
                                <div>
                                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-800">My Bids</h1>
                                    <p className="text-sm sm:text-base text-slate-600 mt-1">
                                        Track and manage all your placed bids
                                    </p>
                                </div>
                            </div>
                            <Link 
                                href="/kabadiwala/listings" 
                                className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
                            >
                                <Package className="w-5 h-5" />
                                Browse Listings
                            </Link>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="bg-white/80 backdrop-blur-sm border-2 border-slate-200 rounded-xl p-4 hover:shadow-lg transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                                        <ShoppingBag className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-slate-800">{bids.length}</div>
                                        <div className="text-xs text-slate-600">Total Bids</div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/80 backdrop-blur-sm border-2 border-green-200 rounded-xl p-4 hover:shadow-lg transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-linear-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white">
                                        <CheckCircle className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-green-600">{acceptedBids.length}</div>
                                        <div className="text-xs text-slate-600">Accepted</div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/80 backdrop-blur-sm border-2 border-amber-200 rounded-xl p-4 hover:shadow-lg transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-linear-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-amber-600">{pendingBids.length}</div>
                                        <div className="text-xs text-slate-600">Pending</div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/80 backdrop-blur-sm border-2 border-red-200 rounded-xl p-4 hover:shadow-lg transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-linear-to-br from-red-500 to-pink-600 flex items-center justify-center text-white">
                                        <XCircle className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-red-600">{rejectedBids.length}</div>
                                        <div className="text-xs text-slate-600">Rejected</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bids List */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mb-4" />
                            <p className="text-slate-600 font-medium">Loading your bids...</p>
                        </div>
                    ) : bids.length === 0 ? (
                        <div className="text-center py-20 bg-white/60 backdrop-blur-sm rounded-2xl border-2 border-slate-200 border-dashed">
                            <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-slate-800 mb-2">No bids yet</h3>
                            <p className="text-slate-500 mb-6">Start bidding on available listings to see them here</p>
                            <Link 
                                href="/kabadiwala/listings" 
                                className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
                            >
                                <Package className="w-5 h-5" />
                                Browse Listings
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {bids.map((bid) => (
                                <div 
                                    key={bid.id} 
                                    className="group bg-white/80 backdrop-blur-sm border-2 border-slate-200 rounded-2xl p-6 hover:shadow-xl hover:border-slate-300 transition-all"
                                >
                                    <div className="flex flex-col lg:flex-row gap-6">
                                        {/* Bid Info */}
                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                                                <div>
                                                    <h3 className="text-lg font-bold text-slate-800 mb-1">
                                                        Listing #{bid.listing_id.slice(0, 8)}...
                                                    </h3>
                                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                                        <Clock className="w-4 h-4" />
                                                        <span>Placed recently</span>
                                                    </div>
                                                </div>
                                                <span className={`px-4 py-2 rounded-xl text-sm font-bold capitalize flex items-center gap-2 ${
                                                    bid.status === 'accepted' 
                                                        ? 'bg-green-100 text-green-700 border-2 border-green-200' 
                                                        : bid.status === 'pending' 
                                                        ? 'bg-amber-100 text-amber-700 border-2 border-amber-200' 
                                                        : 'bg-red-100 text-red-700 border-2 border-red-200'
                                                }`}>
                                                    {bid.status === 'accepted' && <CheckCircle className="w-4 h-4" />}
                                                    {bid.status === 'pending' && <Clock className="w-4 h-4" />}
                                                    {bid.status === 'rejected' && <XCircle className="w-4 h-4" />}
                                                    {bid.status}
                                                </span>
                                            </div>

                                            <div className="space-y-3 mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-linear-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white">
                                                        <DollarSign className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-slate-500">Your Offer</p>
                                                        <p className="text-lg font-bold text-slate-800">৳{bid.offered_price}</p>
                                                    </div>
                                                </div>
                                                {bid.message && (
                                                    <div className="bg-slate-50 border-2 border-slate-100 rounded-xl p-4">
                                                        <p className="text-xs text-slate-500 mb-1 font-medium">Your Message</p>
                                                        <p className="text-sm text-slate-700">{bid.message}</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            {bid.status === 'accepted' && (
                                                <div className="flex flex-wrap gap-3 pt-4 border-t-2 border-slate-100">
                                                    <Link 
                                                        href={`/chat/${bid.listing_id}`} 
                                                        className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all font-medium border-2 border-slate-200"
                                                    >
                                                        <MessageSquare className="w-4 h-4" />
                                                        Chat with Seller
                                                    </Link>
                                                    <Link 
                                                        href={`/kabadiwala/pickup/${bid.listing_id}`} 
                                                        className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
                                                    >
                                                        <Scan className="w-4 h-4" />
                                                        Start Pickup
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
