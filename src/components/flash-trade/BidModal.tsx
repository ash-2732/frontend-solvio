"use client";

import { useState } from "react";
import { X, Loader2, CheckCircle } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface BidModalProps {
    isOpen: boolean;
    onClose: () => void;
    listingId: string;
    estimatedMin: number;
    estimatedMax: number;
}

export default function BidModal({
    isOpen,
    onClose,
    listingId,
    estimatedMin,
    estimatedMax,
}: BidModalProps) {
    const [offerPrice, setOfferPrice] = useState<string>("");
    const [pickupTime, setPickupTime] = useState<string>("2");
    const [message, setMessage] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    if (!isOpen) return null;

    const { token } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage("");

        try {
            await apiRequest("/bids", {
                method: "POST",
                body: JSON.stringify({
                    listing_id: listingId,
                    offered_price: parseFloat(offerPrice),
                    pickup_time_estimate: `${pickupTime} hours`,
                    message: message || undefined,
                }),
                auth: true,
                token,
            });

            setIsSuccess(true);
            setTimeout(() => {
                onClose();
                setIsSuccess(false);
                setOfferPrice("");
                setMessage("");
            }, 2000);
        } catch (e: any) {
            console.error(e);
            // Show error (maybe add error state to UI, but for now just log)
            alert(e.message || "Failed to place bid");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                {!isSuccess ? (
                    <>
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <h3 className="text-xl font-bold text-slate-900">Offer Pickup Service</h3>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                                <p className="text-sm text-green-800 font-medium text-center">
                                    Estimated Value: Tk {estimatedMin} - {estimatedMax}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Your Offer Price (Tk)
                                </label>
                                <input
                                    type="number"
                                    required
                                    value={offerPrice}
                                    onChange={(e) => setOfferPrice(e.target.value)}
                                    placeholder={`e.g. ${(estimatedMin + estimatedMax) / 2}`}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none text-slate-900"
                                />
                                <p className="text-xs text-slate-500 mt-1.5">Enter the amount you'll pay to collect this e-waste</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Pickup Time (Hours)
                                </label>
                                <select
                                    value={pickupTime}
                                    onChange={(e) => setPickupTime(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none text-slate-900"
                                >
                                    <option value="1">Within 1 hour</option>
                                    <option value="2">Within 2 hours</option>
                                    <option value="4">Within 4 hours</option>
                                    <option value="24">Within 24 hours</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Additional Message (Optional)
                                </label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="I can arrive early and provide immediate service..."
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none resize-none h-24 text-slate-900"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Submitting Offer...
                                    </>
                                ) : (
                                    "Submit Pickup Offer"
                                )}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">
                            Offer Submitted!
                        </h3>
                        <p className="text-slate-600">
                            The seller has been notified of your pickup offer.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
