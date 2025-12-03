"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import WeightVerification from "@/components/flash-trade/WeightVerification";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function UserPickupPage() {
    const { id } = useParams(); // Listing ID
    const { token } = useAuth();
    const router = useRouter();
    const [listing, setListing] = useState<any>(null);
    const [acceptedBid, setAcceptedBid] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        const fetchData = async () => {
            try {
                // Fetch listing
                const listingRes = await apiRequest(`/listings/${id}`, { auth: true, token });
                setListing(listingRes);

                // Fetch bids to find the accepted one
                // Note: Ideally we should have an endpoint to get the accepted bid directly or it should be in the listing
                // For now, we fetch all bids and filter
                const bidsRes = await apiRequest(`/bids/listing/${id}`, { auth: true, token }) as any;
                const accepted = bidsRes.find((b: any) => b.status === "accepted");
                setAcceptedBid(accepted);

            } catch (e) {
                console.error(e);
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

    if (!listing || !acceptedBid) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <p className="text-slate-500">Listing or accepted bid not found.</p>
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md mx-auto">
                    <Link href="/user/listings" className="inline-flex items-center text-slate-600 hover:text-emerald-600 mb-6 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Link>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">Pickup Confirmation</h1>
                        <p className="text-slate-600 mb-4">
                            Your device: <span className="font-semibold">{listing.device_name}</span>
                        </p>
                        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                            <p className="text-sm text-emerald-800">
                                Kabadiwala is arriving. Please generate the QR code below when they are ready to pickup.
                            </p>
                        </div>
                    </div>

                    <WeightVerification
                        userRole="seller"
                        listingId={id as string}
                        bidId={acceptedBid.id}
                        onVerified={handleVerified}
                    />
                </div>
            </div>
        </ProtectedRoute>
    );
}
