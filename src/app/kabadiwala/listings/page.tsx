"use client";

import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import ListingCard from "@/components/flash-trade/ListingCard";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Loader2, Filter, Package, TrendingUp, MapPin, Search } from "lucide-react";

export default function KabadiwalaListingsPage() {
    const { token } = useAuth();
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchListings = async () => {
            try {
                const res = await apiRequest("/listings?status_filter=listed", {
                    auth: true,
                    token,
                });
                setListings((res as any).items || []);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchListings();
    }, [token]);

    const filteredListings = listings.filter(listing => 
        listing.device_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.device_type?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <ProtectedRoute>
            <div className="min-h-screen py-8 sm:py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Hero Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white shadow-lg">
                                <Package className="w-7 h-7" />
                            </div>
                            <div>
                                <h1 className="text-3xl sm:text-4xl font-bold text-slate-800">
                                    Available Listings
                                </h1>
                                <p className="text-sm sm:text-base text-slate-600 mt-1">
                                    Discover e-waste opportunities near you and place competitive bids
                                </p>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
                            <div className="bg-white/80 backdrop-blur-sm border-2 border-slate-200 rounded-xl p-4 hover:shadow-lg transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                                        <Package className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-slate-800">{listings.length}</div>
                                        <div className="text-xs text-slate-600">Total Listings</div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/80 backdrop-blur-sm border-2 border-slate-200 rounded-xl p-4 hover:shadow-lg transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-linear-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white">
                                        <TrendingUp className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-slate-800">New</div>
                                        <div className="text-xs text-slate-600">Fresh Today</div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/80 backdrop-blur-sm border-2 border-slate-200 rounded-xl p-4 hover:shadow-lg transition-all col-span-2 sm:col-span-1">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-linear-to-br from-orange-500 to-red-600 flex items-center justify-center text-white">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-slate-800">Dhaka</div>
                                        <div className="text-xs text-slate-600">Your Location</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search & Filter Bar */}
                    <div className="mb-6 flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by device name or type..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-200 bg-white/80 backdrop-blur-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-slate-800 placeholder-slate-400"
                            />
                        </div>
                        <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm border-2 border-slate-200 rounded-xl text-slate-700 hover:bg-white hover:shadow-lg transition-all font-medium">
                            <Filter className="w-5 h-5" />
                            <span className="hidden sm:inline">Filter</span>
                        </button>
                    </div>

                    {/* Listings Grid */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
                            <p className="text-slate-600 font-medium">Loading listings...</p>
                        </div>
                    ) : filteredListings.length === 0 ? (
                        <div className="text-center py-20 bg-white/60 backdrop-blur-sm rounded-2xl border-2 border-slate-200 border-dashed">
                            <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-slate-800 mb-2">
                                {searchQuery ? "No listings found" : "No available listings"}
                            </h3>
                            <p className="text-slate-500">
                                {searchQuery 
                                    ? "Try adjusting your search terms" 
                                    : "Check back soon for new opportunities"}
                            </p>
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredListings.map((listing) => (
                                <ListingCard
                                    key={listing.id}
                                    listing={{
                                        id: listing.id,
                                        device_name: listing.device_name,
                                        device_type: listing.device_type,
                                        condition: listing.condition,
                                        estimated_value_min: listing.estimated_value_min,
                                        estimated_value_max: listing.estimated_value_max,
                                        location: "Dhaka",
                                        time_ago: "Recently",
                                        image_url: listing.image_urls?.[0] || "",
                                        distance: "2.5 km",
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
