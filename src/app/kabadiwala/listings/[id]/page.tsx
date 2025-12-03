"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import BidModal from "@/components/flash-trade/BidModal";
import { Loader2, MapPin, Clock, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function KabadiwalaListingDetailsPage() {
    const { id } = useParams();
    const { token } = useAuth();
    const [listing, setListing] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isBidModalOpen, setIsBidModalOpen] = useState(false);

    useEffect(() => {
        if (!id) return;
        const fetchListing = async () => {
            try {
                const res = await apiRequest(`/listings/${id}`, {
                    auth: true,
                    token,
                });
                setListing(res);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchListing();
    }, [id, token]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
            </div>
        );
    }

    if (!listing) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <p className="text-slate-500">Listing not found.</p>
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <Link href="/kabadiwala/listings" className="inline-flex items-center text-slate-600 hover:text-emerald-600 mb-6 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Listings
                    </Link>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        {/* Image Gallery (Simplified to first image for now) */}
                        <div className="relative h-96 w-full bg-slate-100">
                            {listing.image_urls?.[0] ? (
                                <Image
                                    src={listing.image_urls[0]}
                                    alt={listing.device_name}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-400">No Image</div>
                            )}
                            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-bold text-slate-700 shadow-sm">
                                {listing.device_type}
                            </div>
                        </div>

                        <div className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h1 className="text-3xl font-bold text-slate-900 mb-2">{listing.device_name}</h1>
                                    <div className="flex items-center gap-4 text-slate-500">
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="w-4 h-4" />
                                            Dhaka {/* Placeholder */}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-4 h-4" />
                                            Posted recently
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-slate-500 mb-1">Estimated Value</p>
                                    <p className="text-2xl font-bold text-emerald-600">
                                        Tk {listing.estimated_value_min} - {listing.estimated_value_max}
                                    </p>
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
                                    <p className="text-sm text-slate-500 mb-1">Material</p>
                                    <p className="font-semibold text-slate-900">Mixed E-Waste</p>
                                </div>
                            </div>

                            {/* AI Analysis Section */}
                            {listing.ai_classification && (
                                <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100 mb-8">
                                    <h3 className="flex items-center gap-2 font-semibold text-emerald-800 mb-3">
                                        <CheckCircle className="w-5 h-5" />
                                        AI Analysis
                                    </h3>
                                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-emerald-600/80 block text-xs uppercase tracking-wide font-bold mb-1">Confidence</span>
                                            <span className="text-emerald-900 font-medium">{(listing.ai_classification.confidence_score * 100).toFixed(0)}%</span>
                                        </div>
                                        <div>
                                            <span className="text-emerald-600/80 block text-xs uppercase tracking-wide font-bold mb-1">Components</span>
                                            <span className="text-emerald-900 font-medium">{listing.ai_classification.identified_components?.join(", ")}</span>
                                        </div>
                                        <div className="md:col-span-2">
                                            <span className="text-emerald-600/80 block text-xs uppercase tracking-wide font-bold mb-1">Notes</span>
                                            <p className="text-emerald-900">{listing.ai_classification.condition_notes}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-end pt-6 border-t border-slate-100">
                                <button
                                    onClick={() => setIsBidModalOpen(true)}
                                    className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                                >
                                    I'll Pick Up
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <BidModal
                    isOpen={isBidModalOpen}
                    onClose={() => setIsBidModalOpen(false)}
                    listingId={id as string}
                    estimatedMin={listing.estimated_value_min}
                    estimatedMax={listing.estimated_value_max}
                />
            </div>
        </ProtectedRoute>
    );
}
