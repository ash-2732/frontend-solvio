"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import WeightVerification from "@/components/flash-trade/WeightVerification";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function KabadiwalaPickupPage() {
    const { id } = useParams(); // Listing ID
    const { token } = useAuth();
    const router = useRouter();
    const [listing, setListing] = useState<any>(null);
    const [acceptedBid, setAcceptedBid] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        const fetchData = async () => {
            try {
                const listingRes = await apiRequest(`/listings/${id}`, { auth: true, token });
                setListing(listingRes);

                // Fetch bids for this listing to find the accepted one
                const bidsRes = await apiRequest(`/bids/listing/${id}`, { auth: true, token }) as any;
                const accepted = bidsRes?.find((bid: any) => bid.status === "accepted");

                if (!accepted) {
                    setError("No accepted bid found for this listing");
                } else {
                    setAcceptedBid(accepted);
                }
            } catch (e) {
                console.error(e);
                setError("Failed to load pickup details");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, token]);

    const handleVerified = (weight: number) => {
        alert(`Pickup confirmed! Weight: ${weight}kg. Payment initiated.`);
        router.push("/"); // Redirect to dashboard
    };

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

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <p className="text-red-500 mb-4">{error}</p>
                    <Link href="/kabadiwala/my-bids" className="text-emerald-600 hover:underline">
                        Back to My Bids
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md mx-auto">
                    <Link href="/kabadiwala/listings" className="inline-flex items-center text-slate-600 hover:text-emerald-600 mb-6 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Link>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">Pickup Verification</h1>
                        <p className="text-slate-600 mb-4">
                            Picking up: <span className="font-semibold">{listing.device_name}</span>
                        </p>
                        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                            <p className="text-sm text-emerald-800">
                                Please verify the seller by scanning their QR code, then weigh the item.
                            </p>
                        </div>
                    </div>

                    <WeightVerification
                        userRole="kabadiwala"
                        listingId={id as string}
                        bidId={acceptedBid?.id}
                        onVerified={handleVerified}
                    />
                </div>
            </div>
        </ProtectedRoute>
    );
}
