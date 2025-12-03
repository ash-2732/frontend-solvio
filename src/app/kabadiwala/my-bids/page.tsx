"use client";

import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Loader2, MessageSquare, Scan, CheckCircle, Clock, XCircle, ShoppingBag, Package, TrendingUp, DollarSign, Info } from "lucide-react";
import Link from "next/link";

export default function MyBidsPage() {
    const { token } = useAuth();
    const [bids, setBids] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedBidId, setExpandedBidId] = useState<string | null>(null);
    const [weight, setWeight] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [showResponseModal, setShowResponseModal] = useState(false);
    const [weightResponse, setWeightResponse] = useState<any>(null);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorData, setErrorData] = useState<any>(null);

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

    const toggleWeightForm = (bidId: string) => {
        if (expandedBidId === bidId) {
            setExpandedBidId(null);
            setWeight("");
        } else {
            setExpandedBidId(bidId);
            setWeight("");
        }
    };

    const handleConfirmWeight = async (bid: any) => {
        if (!weight || parseFloat(weight) <= 0) {
            alert("Please enter a valid weight");
            return;
        }

        setSubmitting(true);
        try {
            const response = await apiRequest("/bids/confirm-weight", {
                method: "POST",
                auth: true,
                token,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    bid_id: bid.id,
                    weight_kg: parseFloat(weight)
                })
            });

            setWeightResponse(response);
            setExpandedBidId(null);
            setWeight("");
            setShowResponseModal(true);

            // Refresh bids
            const res = await apiRequest("/bids/my-bids", { auth: true, token });
            setBids((res as any) || []);
        } catch (e: any) {
            console.error("Error confirming weight:", e);
            // Check if error has detail object (validation error)
            if (e?.detail) {
                setErrorData(e.detail);
                setShowErrorModal(true);
            } else {
                alert(e?.message || "Failed to confirm weight");
            }
        } finally {
            setSubmitting(false);
        }
    };

    const closeResponseModal = () => {
        setShowResponseModal(false);
        setWeightResponse(null);
    };

    const closeErrorModal = () => {
        setShowErrorModal(false);
        setErrorData(null);
    };

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
                                                <>
                                                    <div className="flex flex-wrap gap-3 pt-4 border-t-2 border-slate-100">
                                                        <Link 
                                                            href={`/chat/${bid.listing_id}`} 
                                                            className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all font-medium border-2 border-slate-200"
                                                        >
                                                            <MessageSquare className="w-4 h-4" />
                                                            Chat with Seller
                                                        </Link>
                                                        <button 
                                                            onClick={() => toggleWeightForm(bid.id)}
                                                            className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
                                                        >
                                                            <Scan className="w-4 h-4" />
                                                            {expandedBidId === bid.id ? 'Cancel' : 'Confirm Weight'}
                                                        </button>
                                                    </div>

                                                    {/* Slide Down Weight Form */}
                                                    {expandedBidId === bid.id && (
                                                        <div className="mt-4 pt-4 border-t-2 border-slate-100 animate-in slide-in-from-top duration-300">
                                                            <div className="bg-linear-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl p-5">
                                                                <div className="flex items-center gap-3 mb-4">
                                                                    <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                                                                        <Scan className="w-5 h-5 text-white" />
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="font-bold text-slate-900">Enter Weight</h4>
                                                                        <p className="text-xs text-slate-600">Confirm the verified weight</p>
                                                                    </div>
                                                                </div>

                                                                <div className="bg-white rounded-lg p-3 mb-4 text-xs">
                                                                    <p className="text-slate-600">Bid ID: <span className="font-mono text-slate-900">{bid.id.slice(0, 16)}...</span></p>
                                                                    <p className="text-slate-600">Listing ID: <span className="font-mono text-slate-900">{bid.listing_id.slice(0, 16)}...</span></p>
                                                                </div>

                                                                <div className="mb-4">
                                                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                                        Weight (kg) <span className="text-red-500">*</span>
                                                                    </label>
                                                                    <input
                                                                        type="number"
                                                                        step="0.01"
                                                                        min="0.01"
                                                                        value={weight}
                                                                        onChange={(e) => setWeight(e.target.value)}
                                                                        placeholder="Enter weight in kg"
                                                                        className="w-full px-4 py-3 border-2 border-emerald-200 rounded-lg focus:outline-none focus:border-emerald-500 text-slate-900 font-semibold"
                                                                    />
                                                                </div>

                                                                <button
                                                                    onClick={() => handleConfirmWeight(bid)}
                                                                    disabled={submitting || !weight}
                                                                    className="w-full px-6 py-3 bg-linear-to-r from-emerald-600 to-green-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                                                >
                                                                    {submitting ? (
                                                                        <>
                                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                                            Confirming...
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <CheckCircle className="w-4 h-4" />
                                                                            Confirm Weight
                                                                        </>
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Response Modal */}
                    {showResponseModal && weightResponse && (
                        <div className="fixed inset-0 backdrop-blur-sm bg-slate-900/30 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all animate-in zoom-in-95 duration-200">
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="w-10 h-10 text-green-600" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Weight Confirmed!</h3>
                                    <p className="text-slate-600">The weight has been successfully verified</p>
                                </div>

                                <div className="bg-slate-50 rounded-lg p-4 space-y-3 mb-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-slate-600">Listing ID:</span>
                                        <span className="text-sm font-mono text-slate-900">{weightResponse.listing_id?.slice(0, 8)}...</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-slate-600">Weight:</span>
                                        <span className="text-lg font-bold text-emerald-600">{weightResponse.weight_kg} kg</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-slate-600">Verified:</span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                            weightResponse.weight_verified 
                                                ? 'bg-green-100 text-green-700' 
                                                : 'bg-red-100 text-red-700'
                                        }`}>
                                            {weightResponse.weight_verified ? 'YES' : 'NO'}
                                        </span>
                                    </div>
                                    {weightResponse.message && (
                                        <div className="pt-3 border-t border-slate-200">
                                            <p className="text-xs text-slate-500 mb-1">Message:</p>
                                            <p className="text-sm text-slate-700">{weightResponse.message}</p>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={closeResponseModal}
                                    className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Error Modal */}
                    {showErrorModal && errorData && (
                        <div className="fixed inset-0 backdrop-blur-sm bg-slate-900/30 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all animate-in zoom-in-95 duration-200">
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <XCircle className="w-10 h-10 text-red-600" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Weight Validation Warning</h3>
                                    <p className="text-slate-600">{errorData.error?.replace(/_/g, ' ').toUpperCase()}</p>
                                </div>

                                <div className="bg-red-50 rounded-lg p-4 mb-6 border-2 border-red-200">
                                    <p className="text-sm text-slate-800 mb-4 leading-relaxed">
                                        {errorData.message}
                                    </p>
                                    
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-600">Entered Weight:</span>
                                            <span className="font-bold text-red-600">{errorData.entered_weight} kg</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-600">Typical Weight:</span>
                                            <span className="font-bold text-slate-900">{errorData.typical_weight} kg</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-600">Max Expected:</span>
                                            <span className="font-bold text-slate-900">{errorData.max_expected_weight} kg</span>
                                        </div>
                                    </div>
                                </div>

                                {errorData.suggestion && (
                                    <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 mb-6">
                                        <p className="text-sm text-amber-800 font-medium flex items-start gap-2">
                                            <Info className="w-4 h-4 mt-0.5 shrink-0" />
                                            <span>{errorData.suggestion}</span>
                                        </p>
                                    </div>
                                )}

                                <button
                                    onClick={closeErrorModal}
                                    className="w-full px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
                                >
                                    Got It
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
