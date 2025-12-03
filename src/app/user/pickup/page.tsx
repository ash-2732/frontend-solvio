"use client";

import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Loader2, Package, CheckCircle, Clock, Truck, User, DollarSign, Star, ChevronDown, ChevronUp, ShoppingBag, MapPin, Sparkles, Weight, Info } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Bid {
    id: string;
    listing_id: string;
    kabadiwala_id: string;
    offered_price: string;
    pickup_time_estimate: string;
    message: string | null;
    status: string;
    created_at: string;
    updated_at: string;
    kabadiwala: {
        id: string;
        full_name: string;
        user_type: string;
        reputation_score: number;
        is_sponsor: boolean;
    };
}

interface ListingWithBids {
    listing: any;
    bids: Bid[];
}

export default function PickupPage() {
    const { token } = useAuth();
    const [listingsWithBids, setListingsWithBids] = useState<ListingWithBids[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedListings, setExpandedListings] = useState<Set<string>>(new Set());

    useEffect(() => {
        const fetchListings = async () => {
            if (!token) {
                setError("Not authenticated. Please log in.");
                setLoading(false);
                return;
            }
            try {
                // Fetch user's listings
                const res = await apiRequest("/listings/my", { auth: true, token }) as any;
                // Filter only listings with accepted bids or picked_up status
                const pickupListings = (res.items || []).filter((listing: any) => 
                    listing.status === 'accepted' || listing.status === 'picked_up'
                );

                // Fetch bids for each listing
                const listingsWithBidsData = await Promise.all(
                    pickupListings.map(async (listing: any) => {
                        try {
                            const bids = await apiRequest(`/bids/listing/${listing.id}`, { 
                                auth: true, 
                                token 
                            }) as Bid[];
                            return { listing, bids };
                        } catch (e) {
                            console.error(`Error fetching bids for listing ${listing.id}:`, e);
                            return { listing, bids: [] };
                        }
                    })
                );

                setListingsWithBids(listingsWithBidsData);
                setError(null);
            } catch (e: any) {
                console.error("Error fetching pickup listings:", e);
                setError(e?.message || "Failed to fetch pickup listings");
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
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">Pickup Requests</h1>
                            <p className="text-slate-600">View your listings with accepted bids ready for pickup</p>
                        </div>
                        <Link 
                            href="/user/my-listings" 
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium flex items-center gap-2"
                        >
                            <Package className="w-4 h-4" />
                            All Listings
                        </Link>
                    </div>

                    {/* Stats Bar */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-emerald-100 rounded-lg">
                                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Total Pickups</p>
                                    <p className="text-2xl font-bold text-slate-900">{listingsWithBids.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-yellow-100 rounded-lg">
                                    <Clock className="w-6 h-6 text-yellow-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Pending Pickup</p>
                                    <p className="text-2xl font-bold text-slate-900">
                                        {listingsWithBids.filter(item => item.listing.status === 'accepted').length}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <Truck className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Completed</p>
                                    <p className="text-2xl font-bold text-slate-900">
                                        {listingsWithBids.filter(item => item.listing.status === 'picked_up').length}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-20 bg-red-50 rounded-2xl border border-red-200">
                            <p className="text-red-600 font-medium">{error}</p>
                        </div>
                    ) : listingsWithBids.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
                            <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500 font-medium mb-2">No pickup requests yet</p>
                            <p className="text-slate-400 text-sm mb-6">Listings with accepted bids will appear here</p>
                            <Link 
                                href="/user/my-listings" 
                                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                            >
                                <Package className="w-4 h-4" />
                                View My Listings
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {listingsWithBids.map(({ listing, bids }) => {
                                const isExpanded = expandedListings.has(listing.id);
                                const acceptedBid = bids.find(bid => bid.status === 'accepted');
                                
                                return (
                                <div 
                                    key={listing.id} 
                                    className="bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all overflow-hidden"
                                >
                                    {/* Main Listing Card */}
                                    <div className="p-6">
                                        <div className="flex flex-col md:flex-row gap-6">
                                            {/* Image */}
                                            <div className="relative w-full md:w-32 h-32 shrink-0 bg-slate-100 rounded-lg overflow-hidden">
                                                {listing.image_urls?.[0] ? (
                                                    <Image 
                                                        src={listing.image_urls[0]} 
                                                        alt={listing.device_name} 
                                                        fill 
                                                        className="object-cover" 
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Package className="w-12 h-12 text-slate-300" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Details */}
                                            <div className="flex-1 w-full">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h3 className="text-xl font-bold text-slate-900 mb-1">{listing.device_name}</h3>
                                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                                            <span className="capitalize">{listing.device_type}</span>
                                                            <span>•</span>
                                                            <span className={`capitalize font-medium ${
                                                                listing.condition === 'working' ? 'text-green-600' : 'text-red-600'
                                                            }`}>
                                                                {listing.condition?.replace('_', ' ')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                                        listing.status === 'accepted' 
                                                            ? 'bg-yellow-100 text-yellow-700' 
                                                            : 'bg-green-100 text-green-700'
                                                    }`}>
                                                        {listing.status === 'accepted' ? 'Awaiting Pickup' : 'Picked Up'}
                                                    </span>
                                                </div>
                                                <p className="text-slate-600 text-sm mb-4 line-clamp-2">{listing.description}</p>

                                                {/* Quick Stats Grid */}
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                                                    {/* Price Range */}
                                                    {listing.estimated_value_min && listing.estimated_value_max && (
                                                        <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                                                            <p className="text-xs text-emerald-700 mb-1">Est. Value</p>
                                                            <p className="text-sm font-bold text-emerald-600">
                                                                ৳{listing.estimated_value_min} - ৳{listing.estimated_value_max}
                                                            </p>
                                                        </div>
                                                    )}

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

                                                {/* Toggle Button */}
                                                <button
                                                    onClick={() => toggleExpanded(listing.id)}
                                                    className="flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                                                >
                                                    {isExpanded ? (
                                                        <>
                                                            <ChevronUp className="w-4 h-4" />
                                                            Hide Full Details
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ChevronDown className="w-4 h-4" />
                                                            Show Full Details & Bids ({bids.length})
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Details Section */}
                                    {isExpanded && (
                                        <div className="border-t border-slate-100 bg-slate-50 p-6">
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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

                                            {/* Bids Section */}
                                            <div className="border-t border-slate-200 pt-6">
                                                <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                                                    <ShoppingBag className="w-4 h-4" />
                                                    Bids Received ({bids.length})
                                                </h4>
                                                
                                                {bids.length === 0 ? (
                                                    <p className="text-slate-500 text-sm">No bids yet</p>
                                                ) : (
                                                    <div className="space-y-3">
                                                        {bids.map((bid) => (
                                                        <div 
                                                            key={bid.id} 
                                                            className={`p-4 rounded-lg border ${
                                                                bid.status === 'accepted' 
                                                                    ? 'bg-emerald-50 border-emerald-200' 
                                                                    : 'bg-white border-slate-200'
                                                            }`}
                                                        >
                                                            <div className="flex items-start justify-between mb-3">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                                                                        <User className="w-5 h-5 text-white" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-semibold text-slate-900 flex items-center gap-2">
                                                                            {bid.kabadiwala.full_name}
                                                                            {bid.kabadiwala.is_sponsor && (
                                                                                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded">
                                                                                    SPONSOR
                                                                                </span>
                                                                            )}
                                                                        </p>
                                                                        <div className="flex items-center gap-1 text-xs text-slate-500">
                                                                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                                            <span>{bid.kabadiwala.reputation_score} reputation</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                                                    bid.status === 'accepted' 
                                                                        ? 'bg-emerald-100 text-emerald-700' 
                                                                        : bid.status === 'pending'
                                                                        ? 'bg-yellow-100 text-yellow-700'
                                                                        : 'bg-slate-100 text-slate-700'
                                                                }`}>
                                                                    {bid.status}
                                                                </span>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-4 mb-3">
                                                                <div className="flex items-center gap-2">
                                                                    <DollarSign className="w-4 h-4 text-emerald-600" />
                                                                    <div>
                                                                        <p className="text-xs text-slate-500">Offered Price</p>
                                                                        <p className="text-lg font-bold text-emerald-600">৳{bid.offered_price}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <Clock className="w-4 h-4 text-blue-600" />
                                                                    <div>
                                                                        <p className="text-xs text-slate-500">Pickup Time</p>
                                                                        <p className="text-sm font-semibold text-slate-900">{bid.pickup_time_estimate}</p>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {bid.message && (
                                                                <div className="bg-white/50 p-3 rounded border border-slate-200">
                                                                    <p className="text-xs text-slate-500 mb-1">Message:</p>
                                                                    <p className="text-sm text-slate-700">{bid.message}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
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
