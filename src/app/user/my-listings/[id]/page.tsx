"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Loader2, MapPin, Clock, ArrowLeft, CheckCircle, User, MessageSquare, AlertCircle, Package } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Bid {
    id: string;
    listing_id: string;
    kabadiwala_id: string;
    offered_price: number;
    pickup_time_estimate: string;
    message: string;
    status: string;
    created_at: string;
    updated_at: string;
}

interface Listing {
    id: string;
    device_name: string;
    device_type: string;
    description: string;
    condition: string;
    estimated_value_min: number;
    estimated_value_max: number;
    image_urls: string[];
    status: string;
    seller_id: string;
    buyer_id: string | null;
    final_price: number | null;
    created_at: string;
    ai_classification?: {
        confidence_score: number;
        identified_components: string[];
        condition_notes: string;
    };
}

export default function UserListingDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { token } = useAuth();
    const [listing, setListing] = useState<Listing | null>(null);
    const [bids, setBids] = useState<Bid[]>([]);
    const [loading, setLoading] = useState(true);
    const [bidsLoading, setBidsLoading] = useState(true);
    const [acceptingBid, setAcceptingBid] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        fetchListing();
        fetchBids();
    }, [id, token]);

    const fetchListing = async () => {
        try {
            const res = await apiRequest<Listing>(`/listings/${id}`, {
                auth: true,
                token,
            });
            setListing(res);
            setError(null);
        } catch (e: any) {
            console.error("Error fetching listing:", e);
            setError(e?.message || "Failed to load listing");
        } finally {
            setLoading(false);
        }
    };

    const fetchBids = async () => {
        try {
            const res = await apiRequest<Bid[]>(`/bids/listing/${id}`, {
                auth: true,
                token,
            });
            setBids(res || []);
        } catch (e: any) {
            console.error("Error fetching bids:", e);
            // Don't show error if no bids yet
            if (e?.status !== 404) {
                setError(e?.message || "Failed to load bids");
            }
        } finally {
            setBidsLoading(false);
        }
    };

    const handleAcceptBid = async (bidId: string) => {
        if (!confirm("Are you sure you want to accept this bid? This action cannot be undone.")) {
            return;
        }

        setAcceptingBid(bidId);
        try {
            await apiRequest(`/bids/${bidId}/accept`, {
                method: "PATCH",
                auth: true,
                token,
            });
            
            // Refresh listing and bids
            await fetchListing();
            await fetchBids();
            
            alert("Bid accepted successfully! You can now chat with the kabadiwala.");
        } catch (e: any) {
            console.error("Error accepting bid:", e);
            alert(e?.message || "Failed to accept bid");
        } finally {
            setAcceptingBid(null);
        }
    };

    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleString();
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            listed: { bg: "bg-blue-100", text: "text-blue-700", label: "Listed" },
            bidding: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Bidding" },
            accepted: { bg: "bg-green-100", text: "text-green-700", label: "Accepted" },
            picked_up: { bg: "bg-slate-100", text: "text-slate-700", label: "Picked Up" },
        };
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.listed;
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
    };

    const getBidStatusBadge = (status: string) => {
        const statusConfig = {
            pending: { bg: "bg-blue-100", text: "text-blue-700", label: "Pending" },
            accepted: { bg: "bg-green-100", text: "text-green-700", label: "Accepted" },
            rejected: { bg: "bg-red-100", text: "text-red-700", label: "Rejected" },
            withdrawn: { bg: "bg-slate-100", text: "text-slate-700", label: "Withdrawn" },
        };
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
        return (
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
            </div>
        );
    }

    if (error || !listing) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-slate-500">{error || "Listing not found"}</p>
                    <Link href="/user/my-listings" className="text-emerald-600 hover:underline mt-4 inline-block">
                        Back to My Listings
                    </Link>
                </div>
            </div>
        );
    }

    const pendingBids = bids.filter(bid => bid.status === 'pending');
    const acceptedBid = bids.find(bid => bid.status === 'accepted');

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <Link 
                        href="/user/my-listings" 
                        className="inline-flex items-center text-slate-600 hover:text-emerald-600 mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to My Listings
                    </Link>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Left Column - Listing Details */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                                {/* Image Gallery */}
                                <div className="relative h-96 w-full bg-slate-100">
                                    {listing.image_urls?.[0] ? (
                                        <Image
                                            src={listing.image_urls[0]}
                                            alt={listing.device_name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-slate-400">
                                            <Package className="w-16 h-16" />
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-bold text-slate-700 shadow-sm">
                                        {listing.device_type}
                                    </div>
                                    <div className="absolute top-4 right-4">
                                        {getStatusBadge(listing.status)}
                                    </div>
                                </div>

                                <div className="p-8">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h1 className="text-3xl font-bold text-slate-900 mb-2">{listing.device_name}</h1>
                                            <div className="flex items-center gap-4 text-slate-500 text-sm">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="w-4 h-4" />
                                                    {formatTime(listing.created_at)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-slate-500 mb-1">Estimated Value</p>
                                            <p className="text-2xl font-bold text-emerald-600">
                                                ৳{listing.estimated_value_min} - ৳{listing.estimated_value_max}
                                            </p>
                                            {listing.final_price && (
                                                <p className="text-sm text-slate-600 mt-2">
                                                    Final Price: <span className="font-bold text-emerald-700">৳{listing.final_price}</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="prose prose-slate max-w-none mb-8">
                                        <h3 className="text-lg font-semibold text-slate-900 mb-2">Description</h3>
                                        <p className="text-slate-600">{listing.description}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-8">
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <p className="text-sm text-slate-500 mb-1">Condition</p>
                                            <p className="font-semibold text-slate-900 capitalize">{listing.condition}</p>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <p className="text-sm text-slate-500 mb-1">Type</p>
                                            <p className="font-semibold text-slate-900">{listing.device_type}</p>
                                        </div>
                                    </div>

                                    {/* AI Analysis Section */}
                                    {listing.ai_classification && (
                                        <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100">
                                            <h3 className="flex items-center gap-2 font-semibold text-emerald-800 mb-3">
                                                <CheckCircle className="w-5 h-5" />
                                                AI Analysis
                                            </h3>
                                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="text-emerald-600/80 block text-xs uppercase tracking-wide font-bold mb-1">
                                                        Confidence
                                                    </span>
                                                    <span className="text-emerald-900 font-medium">
                                                        {(listing.ai_classification.confidence_score * 100).toFixed(0)}%
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-emerald-600/80 block text-xs uppercase tracking-wide font-bold mb-1">
                                                        Components
                                                    </span>
                                                    <span className="text-emerald-900 font-medium">
                                                        {listing.ai_classification.identified_components?.join(", ")}
                                                    </span>
                                                </div>
                                                <div className="md:col-span-2">
                                                    <span className="text-emerald-600/80 block text-xs uppercase tracking-wide font-bold mb-1">
                                                        Notes
                                                    </span>
                                                    <p className="text-emerald-900">{listing.ai_classification.condition_notes}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons for Accepted Listing */}
                                    {listing.status === 'accepted' && acceptedBid && (
                                        <div className="flex gap-3 pt-6 border-t border-slate-100 mt-8">
                                            <Link 
                                                href={`/chat/${listing.id}`}
                                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                                            >
                                                <MessageSquare className="w-5 h-5" />
                                                Chat with Kabadiwala
                                            </Link>
                                            <Link 
                                                href={`/user/pickup/${listing.id}`}
                                                className="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                                            >
                                                View Pickup QR
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Bids */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-6">
                                <h2 className="text-xl font-bold text-slate-900 mb-4">
                                    Bids ({bids.length})
                                </h2>

                                {bidsLoading ? (
                                    <div className="flex justify-center py-8">
                                        <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
                                    </div>
                                ) : bids.length === 0 ? (
                                    <div className="text-center py-8">
                                        <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                        <p className="text-slate-500 text-sm">No bids yet</p>
                                        <p className="text-slate-400 text-xs mt-1">
                                            Kabadiwalas will place bids soon
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4 max-h-[600px] overflow-y-auto">
                                        {listing.status === 'accepted' && acceptedBid ? (
                                            /* Show only accepted bid */
                                            <div className="border-2 border-emerald-200 bg-emerald-50 rounded-xl p-4">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-10 h-10 bg-emerald-200 rounded-full flex items-center justify-center">
                                                            <User className="w-5 h-5 text-emerald-700" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-slate-900">Kabadiwala</p>
                                                            <p className="text-xs text-slate-500">
                                                                {formatTime(acceptedBid.created_at)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {getBidStatusBadge(acceptedBid.status)}
                                                </div>

                                                <div className="bg-white rounded-lg p-3 mb-3">
                                                    <p className="text-2xl font-bold text-emerald-700">৳{acceptedBid.offered_price}</p>
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        Pickup: {acceptedBid.pickup_time_estimate}
                                                    </p>
                                                </div>

                                                {acceptedBid.message && (
                                                    <div className="bg-white rounded-lg p-3">
                                                        <p className="text-sm text-slate-600">{acceptedBid.message}</p>
                                                    </div>
                                                )}

                                                <div className="mt-3 pt-3 border-t border-emerald-200">
                                                    <CheckCircle className="w-4 h-4 text-emerald-600 inline mr-2" />
                                                    <span className="text-sm text-emerald-700 font-medium">Bid Accepted</span>
                                                </div>
                                            </div>
                                        ) : (
                                            /* Show all pending bids */
                                            pendingBids.map((bid) => (
                                                <div 
                                                    key={bid.id} 
                                                    className="border border-slate-200 rounded-xl p-4 hover:border-emerald-300 transition-all"
                                                >
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                                                                <User className="w-5 h-5 text-slate-600" />
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-slate-900">Kabadiwala</p>
                                                                <p className="text-xs text-slate-500">
                                                                    {formatTime(bid.created_at)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {getBidStatusBadge(bid.status)}
                                                    </div>

                                                    <div className="bg-slate-50 rounded-lg p-3 mb-3">
                                                        <p className="text-2xl font-bold text-slate-900">৳{bid.offered_price}</p>
                                                        <p className="text-xs text-slate-500 mt-1">
                                                            Pickup: {bid.pickup_time_estimate}
                                                        </p>
                                                    </div>

                                                    {bid.message && (
                                                        <div className="bg-slate-50 rounded-lg p-3 mb-3">
                                                            <p className="text-sm text-slate-600">{bid.message}</p>
                                                        </div>
                                                    )}

                                                    {bid.status === 'pending' && listing.status !== 'accepted' && (
                                                        <button
                                                            onClick={() => handleAcceptBid(bid.id)}
                                                            disabled={acceptingBid !== null}
                                                            className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {acceptingBid === bid.id ? (
                                                                <span className="flex items-center justify-center gap-2">
                                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                                    Accepting...
                                                                </span>
                                                            ) : (
                                                                "Accept Bid"
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                            ))
                                        )}

                                        {/* Show rejected/withdrawn bids at the bottom */}
                                        {bids.filter(bid => bid.status !== 'pending' && bid.status !== 'accepted').map((bid) => (
                                            <div 
                                                key={bid.id} 
                                                className="border border-slate-100 rounded-xl p-4 opacity-60"
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                                                            <User className="w-4 h-4 text-slate-600" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-slate-700 text-sm">Kabadiwala</p>
                                                            <p className="text-xs text-slate-400">
                                                                {formatTime(bid.created_at)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {getBidStatusBadge(bid.status)}
                                                </div>

                                                <p className="text-lg font-bold text-slate-600">৳{bid.offered_price}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
