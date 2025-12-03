"use client";

import { useState, useEffect } from "react";
import { QrCode, Scan, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import Image from "next/image";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface WeightVerificationProps {
    userRole: "seller" | "kabadiwala";
    listingId: string;
    bidId?: string; // Required for seller to generate QR
    onVerified: (weight: number) => void;
}

export default function WeightVerification({
    userRole,
    listingId,
    bidId,
    onVerified,
}: WeightVerificationProps) {
    const { token } = useAuth();
    const [showQR, setShowQR] = useState(false);
    const [qrData, setQrData] = useState<{ qr_code_url: string; qr_data: string } | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [scannedData, setScannedData] = useState<string | null>(null);
    const [weightInput, setWeightInput] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [confirmExcessive, setConfirmExcessive] = useState(false);

    const handleGenerateQR = async () => {
        if (!bidId) return;
        try {
            const res = await apiRequest(`/bids/${bidId}/generate-pickup-qr`, {
                method: "POST",
                auth: true,
                token,
            }) as any;
            setQrData(res);
            setShowQR(true);
        } catch (e: any) {
            console.error(e);
            setError(e.message || "Failed to generate QR");
        }
    };

    const handleScan = () => {
        setIsScanning(true);
        setError(null);
        // Simulate scanning delay - In real app use a QR scanner library
        setTimeout(() => {
            setIsScanning(false);
            // Backend expects QR data in format: "transaction:{bid_id}:{listing_id}:{amount}:confirm"
            // For simulation, construct the QR data string matching the backend's parse_qr_data format
            if (!bidId) {
                setError("Bid ID is required for weight confirmation");
                return;
            }
            // Amount is set to 0 as placeholder - it's not validated in weight confirmation
            const qrData = `transaction:${bidId}:${listingId}:0:confirm`;
            setScannedData(qrData);
        }, 2000);
    };

    const handleConfirmWeight = async () => {
        if (!weightInput || !scannedData) return;
        setIsVerifying(true);
        setError(null);

        try {
            const res = await apiRequest(`/bids/confirm-weight?confirm_excessive_weight=${confirmExcessive}`, {
                method: "POST",
                body: JSON.stringify({
                    qr_data: scannedData,
                    weight_kg: parseFloat(weightInput),
                }),
                auth: true,
                token,
            }) as any;
            onVerified(res.weight_kg);
        } catch (e: any) {
            console.error(e);
            if (e.message?.includes("significantly above average")) {
                setError(e.message);
                setConfirmExcessive(true); // Allow retry with confirmation
            } else {
                setError(e.message || "Failed to confirm weight");
            }
        } finally {
            setIsVerifying(false);
        }
    };

    if (userRole === "seller") {
        return (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                    Pickup Verification
                </h3>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        {error}
                    </div>
                )}

                {!showQR ? (
                    <div className="text-center">
                        <p className="text-slate-600 mb-6">
                            When the Kabadiwala arrives, show this QR code to verify the pickup and confirm the weight.
                        </p>
                        <button
                            onClick={handleGenerateQR}
                            className="inline-flex items-center justify-center px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors"
                        >
                            <QrCode className="w-5 h-5 mr-2" />
                            Generate Pickup QR
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center animate-in zoom-in duration-300">
                        <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-100 mb-4">
                            {qrData?.qr_code_url ? (
                                <img
                                    src={`data:image/png;base64,${qrData.qr_code_url}`}
                                    alt="Pickup QR Code"
                                    width={200}
                                    height={200}
                                    className="rounded-lg"
                                />
                            ) : (
                                <div className="w-48 h-48 bg-slate-100 flex items-center justify-center rounded-lg">
                                    <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                                </div>
                            )}
                        </div>
                        <p className="text-sm text-slate-500 font-medium">
                            Scan to verify pickup
                        </p>
                        <button
                            onClick={() => setShowQR(false)}
                            className="mt-4 text-slate-400 hover:text-slate-600 text-sm"
                        >
                            Hide QR Code
                        </button>
                    </div>
                )}
            </div>
        );
    }

    // Kabadiwala View
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
                Verify Pickup & Weight
            </h3>

            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <div>{error}</div>
                </div>
            )}

            {!scannedData ? (
                <div className="text-center">
                    <p className="text-slate-600 mb-6">
                        Scan the seller's QR code to confirm you are at the location.
                    </p>
                    <button
                        onClick={handleScan}
                        disabled={isScanning}
                        className="w-full py-4 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                    >
                        {isScanning ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Scanning...
                            </>
                        ) : (
                            <>
                                <Scan className="w-5 h-5" />
                                Scan Seller's QR
                            </>
                        )}
                    </button>
                </div>
            ) : (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                    <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="font-medium">Seller Verified</span>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Measured Weight (kg)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={weightInput}
                            onChange={(e) => {
                                setWeightInput(e.target.value);
                                setConfirmExcessive(false); // Reset confirmation on change
                                setError(null);
                            }}
                            placeholder="e.g. 1.5"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                        />
                        <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Max expected: 3.0 kg. Higher values will be flagged.
                        </p>
                    </div>

                    {confirmExcessive && (
                        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg text-sm">
                            <AlertTriangle className="w-4 h-4" />
                            <span>Please confirm this weight is correct despite the warning.</span>
                        </div>
                    )}

                    <button
                        onClick={handleConfirmWeight}
                        disabled={!weightInput || isVerifying}
                        className={`w-full py-4 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 ${confirmExcessive ? "bg-amber-600 hover:bg-amber-700" : "bg-green-600 hover:bg-green-700"
                            }`}
                    >
                        {isVerifying ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            confirmExcessive ? "Confirm Excessive Weight" : "Confirm Weight & Pay"
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
