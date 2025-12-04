"use client";

import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Loader2, MessageSquare, QrCode, Clock, CheckCircle, User, DollarSign, Weight, MapPin, Sparkles, ChevronDown, ChevronUp, Package } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function MyListingsPage() {
    const { token } = useAuth();
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedListings, setExpandedListings] = useState<Set<string>>(new Set());
    const router = useRouter();

    useEffect(() => {
        const fetchListings = async () => {
            if (!token) {
                console.log("No token available");
                setError("Not authenticated. Please log in.");
                setLoading(false);
                return;
            }
            try {
                console.log("Fetching listings with token:", token?.substring(0, 20) + "...");
                const res = await apiRequest("/listings/my", { auth: true, token }) as any;
                console.log("API Response:", res);
                console.log("Items:", res.items);
                console.log("Items length:", res.items?.length);
                setListings(res.items || []);
                setError(null);
            } catch (e: any) {
                console.error("Error fetching listings:", e);
                setError(e?.message || "Failed to fetch listings");
            } finally {
                setLoading(false);
            }
        };
        fetchListings();
    }, [token]);

    const toggleExpanded = (listingId: string) => {
        setExpandedListings(prev => {
            const newSet = new Set(prev);
            if (newSet.has(listingId)) {
                newSet.delete(listingId);
            } else {
                newSet.add(listingId);
            }
            return newSet;
        });
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-linear-to-br from-green-50 via-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-3xl font-bold text-slate-900">My Listings</h1>
                        <Link href="/user/listings" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium">
                            + New Listing
                        </Link>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-20 bg-red-50 rounded-2xl border border-red-200">
                            <p className="text-red-600 font-medium">{error}</p>
                        </div>
                    ) : listings.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
                            <p className="text-slate-500">You haven't listed any items yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {listings.map((listing) => {
                                const isExpanded = expandedListings.has(listing.id);
                                
                                return (
                                <div 
                                    key={listing.id}
                                    className="bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all overflow-hidden"
                                    onClick={() => router.push(`/user/my-listings/${listing.id}`)}
                                >
                                    {/* Main Card */}
                                    <div className="p-6">
                                        <div className="flex flex-col md:flex-row gap-6">
                                            {/* Image */}
                                            <div className="relative w-full md:w-40 h-40 shrink-0 bg-slate-100 rounded-lg overflow-hidden">
                                                {listing.image_urls?.[0] ? (
                                                    <Image src={listing.image_urls[0]} alt={listing.device_name} fill className="object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Package className="w-12 h-12 text-slate-300" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Main Info */}
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h3 className="text-xl font-bold text-slate-900 mb-1">{listing.device_name}</h3>
                                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                                            <span className="capitalize">{listing.device_type}</span>
                                                            <span>•</span>
                                                            <span className={`capitalize font-medium ${
                                                                listing.condition === 'working' ? 'text-green-600' : 'text-red-600'
                                                            }`}>
                                                                {listing.condition.replace('_', ' ')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                                        listing.status === 'listed' ? 'bg-blue-100 text-blue-700' :
                                                        listing.status === 'bidding' ? 'bg-yellow-100 text-yellow-700' :
                                                        listing.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                                        listing.status === 'picked_up' ? 'bg-purple-100 text-purple-700' :
                                                        'bg-slate-100 text-slate-700'
                                                    }`}>
                                                        {listing.status.replace('_', ' ')}
                                                    </span>
                                                </div>

                                                <p className="text-slate-600 text-sm mb-4 line-clamp-2">{listing.description}</p>

                                                {/* Quick Stats Grid */}
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                                                    {/* Price Range */}
                                                    <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                                                        <p className="text-xs text-emerald-700 mb-1">Est. Value</p>
                                                        <p className="text-sm font-bold text-emerald-600">
                                                            ৳{listing.estimated_value_min} - ৳{listing.estimated_value_max}
                                                        </p>
                                                    </div>

                                                    {/* Final Price */}
                                                    {listing.final_price && (
                                                        <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                                                            <p className="text-xs text-purple-700 mb-1">Final Price</p>
                                                            <p className="text-sm font-bold text-purple-600">৳{listing.final_price}</p>
                                                        </div>
                                                    )}

                                                    {/* Weight */}
                                                    {listing.weight_kg && (
                                                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                                            <p className="text-xs text-blue-700 mb-1 flex items-center gap-1">
                                                                Weight
                                                                {listing.weight_verified && <CheckCircle className="w-3 h-3" />}
                                                            </p>
                                                            <p className="text-sm font-bold text-blue-600">{listing.weight_kg} kg</p>
                                                        </div>
                                                    )}

                                                    {/* AI Confidence */}
                                                    {listing.ai_classification?.confidence_score && (
                                                        <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                                                            <p className="text-xs text-orange-700 mb-1">AI Confidence</p>
                                                            <p className="text-sm font-bold text-orange-600">
                                                                {(listing.ai_classification.confidence_score * 100).toFixed(0)}%
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Buyer Info */}
                                                {listing.buyer && (
                                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 mb-4">
                                                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                                                            <User className="w-5 h-5 text-white" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-sm font-semibold text-slate-900">
                                                                Buyer: {listing.buyer.full_name}
                                                            </p>
                                                            <p className="text-xs text-slate-600 capitalize">
                                                                {listing.buyer.user_type} • Reputation: {listing.buyer.reputation_score}
                                                            </p>
                                                        </div>
                                                        {listing.buyer.is_sponsor && (
                                                            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded">
                                                                SPONSOR
                                                            </span>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Toggle Details Button */}
                                                <button
                                                    onClick={() => toggleExpanded(listing.id)}
                                                    className="flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                                                >
                                                    {isExpanded ? (
                                                        <>
                                                            <ChevronUp className="w-4 h-4" />
                                                            Hide Details
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ChevronDown className="w-4 h-4" />
                                                            Show Full Details
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    {isExpanded && (
                                        <div className="border-t border-slate-100 bg-slate-50 p-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* AI Classification */}
                                                {listing.ai_classification && (
                                                    <div className="bg-white p-4 rounded-lg border border-slate-200">
                                                        <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                                            <Sparkles className="w-4 h-4 text-purple-600" />
                                                            AI Classification
                                                        </h4>
                                                        
                                                        <div className="space-y-3">
                                                            <div>
                                                                <p className="text-xs text-slate-500 mb-1">Identified Device</p>
                                                                <p className="text-sm font-semibold text-slate-900">
                                                                    {listing.ai_classification.device_name}
                                                                </p>
                                                            </div>

                                                            {listing.ai_classification.identified_components && (
                                                                <div>
                                                                    <p className="text-xs text-slate-500 mb-2">Components Identified</p>
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {listing.ai_classification.identified_components.map((comp: string, idx: number) => (
                                                                            <span 
                                                                                key={idx}
                                                                                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                                                                            >
                                                                                {comp}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {listing.ai_classification.condition_notes && (
                                                                <div>
                                                                    <p className="text-xs text-slate-500 mb-1">Condition Notes</p>
                                                                    <p className="text-xs text-slate-700 leading-relaxed">
                                                                        {listing.ai_classification.condition_notes}
                                                                    </p>
                                                                </div>
                                                            )}

                                                            {listing.ai_classification.recycling_value_notes && (
                                                                <div>
                                                                    <p className="text-xs text-slate-500 mb-1">Recycling Value Notes</p>
                                                                    <p className="text-xs text-slate-700 leading-relaxed">
                                                                        {listing.ai_classification.recycling_value_notes}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Additional Info */}
                                                <div className="space-y-4">
                                                    {/* Location */}
                                                    {listing.location?.coordinates && (
                                                        <div className="bg-white p-4 rounded-lg border border-slate-200">
                                                            <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                                                                <MapPin className="w-4 h-4 text-red-600" />
                                                                Location
                                                            </h4>
                                                            <p className="text-xs text-slate-600">
                                                                Lat: {listing.location.coordinates[1]?.toFixed(6)}<br />
                                                                Lng: {listing.location.coordinates[0]?.toFixed(6)}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {/* Timestamps */}
                                                    <div className="bg-white p-4 rounded-lg border border-slate-200">
                                                        <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                                                            <Clock className="w-4 h-4 text-blue-600" />
                                                            Timeline
                                                        </h4>
                                                        <div className="space-y-1 text-xs text-slate-600">
                                                            <p>Created: {new Date(listing.created_at).toLocaleString()}</p>
                                                            <p>Updated: {new Date(listing.updated_at).toLocaleString()}</p>
                                                            {listing.completed_at && (
                                                                <p>Completed: {new Date(listing.completed_at).toLocaleString()}</p>
                                                            )}
                                                            {listing.pickup_scheduled_at && (
                                                                <p>Pickup Scheduled: {new Date(listing.pickup_scheduled_at).toLocaleString()}</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Seller Info */}
                                                    {listing.seller && (
                                                        <div className="bg-white p-4 rounded-lg border border-slate-200">
                                                            <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                                                                <User className="w-4 h-4 text-slate-600" />
                                                                Seller Info
                                                            </h4>
                                                            <p className="text-sm text-slate-700">{listing.seller.full_name}</p>
                                                            <p className="text-xs text-slate-600 capitalize">
                                                                {listing.seller.user_type} • Rep: {listing.seller.reputation_score}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
