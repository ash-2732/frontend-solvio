"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, Camera, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface AIResult {
    device_type: string;
    device_name: string;
    condition: string;
    estimated_value_min: number;
    estimated_value_max: number;
    confidence_score: number;
    condition_notes: string;
}

export default function UploadForm() {
    const router = useRouter();
    const [image, setImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiResult, setAiResult] = useState<AIResult | null>(null);
    const [description, setDescription] = useState("");
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            setAiResult(null);
            setError(null);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith("image/")) {
            setImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            setAiResult(null);
            setError(null);
        }
    };

    const analyzeImage = async () => {
        if (!image) return;

        setIsAnalyzing(true);
        setError(null);

        // TODO: Integrate with actual backend API
        // For now, we'll simulate the AI response based on the user request
        // "AI classifies item + estimates value (based on material: Cu, Au, plastic)."

        try {
            // Simulate API delay
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // Mock response
            const mockResult: AIResult = {
                device_type: "Laptop",
                device_name: "Generic Laptop",
                condition: "Used",
                estimated_value_min: 2200,
                estimated_value_max: 2600,
                confidence_score: 0.95,
                condition_notes: "Screen intact, minor scratches on body.",
            };

            setAiResult(mockResult);
        } catch (err) {
            setError("Failed to analyze image. Please try again.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSubmit = async () => {
        if (!aiResult || !image) return;

        try {
            // TODO: Submit to backend to create listing
            // POST /listings

            // Simulate success
            router.push("/flash-trade/listings"); // Or redirect to a "success" or "my listings" page
        } catch (err) {
            setError("Failed to create listing. Please try again.");
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            {!aiResult ? (
                <div className="space-y-6">
                    <div
                        className={`relative border-2 border-dashed rounded-3xl p-8 text-center transition-all duration-300 ${previewUrl
                            ? "border-green-300 bg-green-50/30"
                            : "border-slate-300 hover:border-green-400 hover:bg-slate-50"
                            }`}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                        />

                        {previewUrl ? (
                            <div className="relative aspect-video w-full max-w-md mx-auto rounded-xl overflow-hidden shadow-lg">
                                <Image
                                    src={previewUrl}
                                    alt="Preview"
                                    fill
                                    className="object-cover"
                                />
                                <button
                                    onClick={() => {
                                        setImage(null);
                                        setPreviewUrl(null);
                                    }}
                                    className="absolute top-2 right-2 p-2 bg-white/90 rounded-full text-slate-600 hover:text-red-500 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <div
                                className="cursor-pointer py-8"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Camera className="w-10 h-10 text-green-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                                    Upload Device Photo
                                </h3>
                                <p className="text-slate-500">
                                    Drag & drop or click to browse
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-slate-700">
                            Additional Description (Optional)
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="e.g., Won't turn on, missing charger..."
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none resize-none h-24"
                        />
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            {error}
                        </div>
                    )}

                    <button
                        onClick={analyzeImage}
                        disabled={!image || isAnalyzing}
                        className={`w-full py-4 rounded-xl font-semibold text-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${!image || isAnalyzing
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 hover:shadow-green-200 hover:-translate-y-1"
                            }`}
                    >
                        {isAnalyzing ? (
                            <>
                                <Loader2 className="w-6 h-6 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                Analyze & Estimate Value
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="p-1 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500"></div>
                    <div className="p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <CheckCircle2 className="w-6 h-6 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">
                                Analysis Complete
                            </h2>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 mb-8">
                            <div className="relative aspect-video rounded-xl overflow-hidden shadow-md">
                                {previewUrl && (
                                    <Image
                                        src={previewUrl}
                                        alt="Analyzed Item"
                                        fill
                                        className="object-cover"
                                    />
                                )}
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        Identified Item
                                    </label>
                                    <div className="text-xl font-medium text-slate-900">
                                        {aiResult.device_name}
                                    </div>
                                    <div className="text-sm text-slate-500">
                                        {aiResult.device_type} • {aiResult.condition}
                                    </div>
                                </div>

                                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                                    <label className="text-xs font-semibold text-green-600 uppercase tracking-wider">
                                        Estimated Value
                                    </label>
                                    <div className="text-3xl font-bold text-green-700 mt-1">
                                        Tk {aiResult.estimated_value_min.toLocaleString()} –{" "}
                                        {aiResult.estimated_value_max.toLocaleString()}
                                    </div>
                                    <p className="text-xs text-green-600/80 mt-2">
                                        Based on material composition (Cu, Au, Plastic)
                                    </p>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        Condition Notes
                                    </label>
                                    <p className="text-sm text-slate-600 mt-1">
                                        {aiResult.condition_notes}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setAiResult(null)}
                                className="flex-1 py-3 px-6 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
                            >
                                Retake
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="flex-[2] py-3 px-6 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-green-200 transition-all hover:-translate-y-1"
                            >
                                Post Listing
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
