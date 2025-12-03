"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { uploadToFirebase } from "@/lib/upload";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Upload, Camera, X, CheckCircle, MapPin, ChevronDown, ChevronUp, Sparkles } from "lucide-react";

// Dynamically import InteractiveMap to avoid SSR issues with Leaflet
const InteractiveMap = dynamic(() => import("@/components/InteractiveMap"), {
	ssr: false,
	loading: () => (
		<div className="w-full h-[320px] rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center">
			<div className="text-slate-500">Loading map...</div>
		</div>
	),
});

type DeviceType = "laptop" | "mobile" | "tablet" | "desktop" | "monitor" | "other";
type Condition = "working" | "partially_working" | "not_working";

interface AIAnalysisResponse {
	device_name?: string;
	device_type?: string;
	condition?: string;
	ai_description?: string;
	condition_notes?: string;
	estimated_value_min?: number;
	estimated_value_max?: number;
	confidence_score?: number;
	recycling_value_notes?: string;
}

export default function ListingsPage() {
	const { token } = useAuth();
	const router = useRouter();

	// Form state
	const [deviceName, setDeviceName] = useState("");
	const [deviceType, setDeviceType] = useState<DeviceType>("laptop");
	const [condition, setCondition] = useState<Condition>("working");
	const [description, setDescription] = useState("");

	// Optional ML model fields for better price prediction
	const [brand, setBrand] = useState("");
	const [buildQuality, setBuildQuality] = useState<number>(5);
	const [originalPrice, setOriginalPrice] = useState<number | null>(null);
	const [usagePattern, setUsagePattern] = useState<string>("Moderate");
	const [usedDuration, setUsedDuration] = useState<number | null>(null);
	const [userLifespan, setUserLifespan] = useState<number | null>(null);
	const [expiryYears, setExpiryYears] = useState<number | null>(null);

	// Images
	const [files, setFiles] = useState<File[]>([]);
	const [previews, setPreviews] = useState<string[]>([]);
	const [progress, setProgress] = useState<number[]>([]);
	const [imageUrls, setImageUrls] = useState<string[]>([]);

	// Location
	const [lat, setLat] = useState<number | null>(null);
	const [lng, setLng] = useState<number | null>(null);

	// UI state
	const [uploading, setUploading] = useState(false);
	const [analyzing, setAnalyzing] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [message, setMessage] = useState<string | null>(null);
	const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResponse | null>(null);
	const [showAdvanced, setShowAdvanced] = useState(false);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const list = Array.from(e.target.files || []);
		setFiles(list);
		setImageUrls([]);
		setProgress(list.map(() => 0));
		// Generate previews
		const readers = list.map(
			(file) =>
				new Promise<string>((resolve) => {
					const reader = new FileReader();
					reader.onloadend = () => resolve(reader.result as string);
					reader.readAsDataURL(file);
				})
		);
		Promise.all(readers).then(setPreviews);
	};

	const removeImage = (idx: number) => {
		const newFiles = files.filter((_, i) => i !== idx);
		const newPreviews = previews.filter((_, i) => i !== idx);
		const newProgress = progress.filter((_, i) => i !== idx);
		const newUrls = imageUrls.filter((_, i) => i !== idx);
		setFiles(newFiles);
		setPreviews(newPreviews);
		setProgress(newProgress);
		setImageUrls(newUrls);
	};

	const uploadAllImages = async () => {
		if (!files.length) return [] as string[];
		setUploading(true);
		setMessage(null);
		const urls: string[] = [];
		try {
			// Upload sequentially to report per-file progress
			for (let i = 0; i < files.length; i++) {
				const url = await uploadToFirebase(files[i], (p) => {
					setProgress((prev) => {
						const clone = [...prev];
						clone[i] = p;
						return clone;
					});
				});
				urls.push(url);
			}
			setImageUrls(urls);
			setMessage("Images uploaded successfully.");

			// Auto-analyze after upload if not already analyzed
			if (urls.length > 0 && !aiAnalysis) {
				analyzeImage(urls[0]);
			}

		return urls;
	} catch (e: any) {
		setMessage(e?.message || "Failed to upload images");
		throw e;
	} finally {
		setUploading(false);
	}
};

const analyzeImage = async (url: string) => {
	setAnalyzing(true);
	try {
		const res = await apiRequest("/listings/analyze", {
			method: "POST",
			body: JSON.stringify({ image_url: url, description: description || "" }),
			auth: true,
			token,
	}) as AIAnalysisResponse;
	console.log("AI Analysis response:", res);
	setAiAnalysis(res);

	// Auto-fill fields if empty
	if (!deviceName && res.device_name) {
		console.log("Setting device name:", res.device_name);
		setDeviceName(res.device_name);
	}
	if (res.device_type) {
		const backendType = res.device_type.toLowerCase() as DeviceType;
		console.log("Setting device type:", backendType);
		// Validate it's a valid DeviceType
		if (["laptop", "mobile", "tablet", "desktop", "monitor", "other"].includes(backendType)) {
			setDeviceType(backendType);
		}
	}
	if (res.condition) {
		const backendCondition = res.condition.toLowerCase() as Condition;
		console.log("Setting condition:", backendCondition);
		// Validate it's a valid Condition
		if (["working", "partially_working", "not_working"].includes(backendCondition)) {
			setCondition(backendCondition);
		}
	}
	if (!description && res.condition_notes) {
		console.log("Setting description from condition_notes:", res.condition_notes);
		setDescription(res.condition_notes);
	}

} catch (e) {
	console.error("AI Analysis failed", e);
	setMessage("AI analysis failed. Please fill in the details manually.");
} finally {
	setAnalyzing(false);
}
};	const handleUseMyLocation = () => {
		setMessage(null);
		if (!navigator.geolocation) {
			setMessage("Geolocation is not supported by your browser.");
			return;
		}
		navigator.geolocation.getCurrentPosition(
			(pos) => {
				setLat(pos.coords.latitude);
				setLng(pos.coords.longitude);
				setMessage("Location set successfully!");
			},
			(err) => {
				console.error(err);
				setMessage("Couldn't get location. Please allow location access.");
			},
			{ enableHighAccuracy: true, timeout: 10000 }
		);
	};

	const handleMapClick = (latitude: number, longitude: number) => {
		setLat(latitude);
		setLng(longitude);
		setMessage(`Location set: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
	};

	const ensureUploaded = async () => {
		if (files.length && imageUrls.length !== files.length) {
			return await uploadAllImages();
		}
		return imageUrls;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setMessage(null);

		if (!deviceName || !description) {
			setMessage("Please fill in device name and description.");
			return;
		}
		if (lat == null || lng == null) {
			setMessage("Please provide location (use the button to take your location).");
			return;
		}
		if (!token) {
			setMessage("You must be logged in to create a listing. Please login first.");
			return;
		}
		try {
			setSubmitting(true);
			const urls = await ensureUploaded();
			if (!urls.length) {
				setMessage("Please upload at least one image.");
				setSubmitting(false);
				return;
			}

			const payload: any = {
				condition,
				description,
				device_name: deviceName,
				device_type: deviceType,
				image_urls: urls,
				location: { latitude: lat, longitude: lng },
			};

			// Add optional ML fields if provided (for better price prediction)
			if (brand) payload.brand = brand;
			if (buildQuality) payload.build_quality = buildQuality;
			if (originalPrice !== null) payload.original_price = originalPrice;
			if (usagePattern) payload.usage_pattern = usagePattern;
			if (usedDuration !== null) payload.used_duration = usedDuration;
			if (userLifespan !== null) payload.user_lifespan = userLifespan;
			if (expiryYears !== null) payload.expiry_years = expiryYears;

			console.log("=== LISTING CREATION DEBUG ===");
			console.log("Submitting listing with payload:", JSON.stringify(payload, null, 2));
			console.log("API URL:", `${process.env.NEXT_PUBLIC_API_BASE_URL}/listings`);
			console.log("Token available:", !!token);

			const result = await apiRequest("/listings", {
				method: "POST",
				body: JSON.stringify(payload),
				auth: true,
				token,
			});

			console.log("Listing created successfully:", result);

			setMessage("Listing created successfully. Redirecting...");
			// Navigate to my-listings page
			setTimeout(() => {
				router.push("/user/my-listings");
			}, 1000);
		} catch (e: any) {
			console.error("Failed to create listing:", e);
			console.error("Error details:", JSON.stringify(e, null, 2));
			
			// Extract more detailed error information
			let errorMsg = "Failed to create listing";
			
			if (e?.details?.detail) {
				// FastAPI validation errors
				if (Array.isArray(e.details.detail)) {
					errorMsg = e.details.detail.map((err: any) => 
						`${err.loc?.join('.')}: ${err.msg}`
					).join(", ");
				} else {
					errorMsg = e.details.detail;
				}
			} else if (e?.message) {
				errorMsg = e.message;
			}
			
			setMessage(`Error: ${errorMsg}`);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<ProtectedRoute>
			<div className="relative min-h-screen bg-linear-to-br from-green-50 via-emerald-50 to-teal-50">
				{/* Decorative blobs */}
				<div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
					<div className="absolute top-20 left-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
					<div className="absolute top-40 right-10 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
					<div className="absolute bottom-20 left-1/2 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
				</div>

				<div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
					{/* Header */}
					<div className="mb-12">
						<div className="flex items-center gap-4 mb-4">
							<div className="w-12 h-12 bg-linear-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
								<Upload className="w-6 h-6 text-white" />
							</div>
							<div>
								<h1 className="text-4xl font-bold bg-linear-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Create Listing</h1>
								<p className="text-slate-600 mt-1">Post your reusable device for others</p>
							</div>
						</div>
					</div>

					<div className="grid lg:grid-cols-2 gap-8">
						{/* Left: Form */}
						<div className="space-y-6">
							<form onSubmit={handleSubmit} className="space-y-6">
								{/* Images */}
								<div className="bg-white/40 rounded-lg p-6 border border-slate-200/50">
									<label className="block text-sm font-semibold text-slate-800 mb-3">
										<Camera className="w-4 h-4 inline mr-2" />
										Upload Photos
									</label>

									{previews.length === 0 ? (
										<label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-emerald-300 rounded-lg cursor-pointer bg-white/30 hover:bg-emerald-50/30 transition-all duration-300 hover:border-emerald-400">
											<Upload className="w-12 h-12 text-emerald-500 mb-3" />
											<p className="text-sm text-slate-700">
												<span className="font-semibold text-emerald-600">Click to upload</span> or drag and drop
											</p>
											<p className="text-xs text-slate-500 mt-1">PNG, JPG, JPEG up to 10MB. You can select multiple.</p>
											<input
												type="file"
												multiple
												accept="image/*"
												className="hidden"
												onChange={handleFileChange}
												required
											/>
										</label>
									) : (
										<div className="space-y-3">
											<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
												{previews.map((src, i) => (
													<div key={i} className="relative group rounded-lg overflow-hidden border border-slate-200 bg-white/40">
														<img src={src} alt={`Preview ${i + 1}`} className="w-full h-36 object-cover" />
														{progress[i] > 0 && progress[i] < 100 && (
															<div className="absolute bottom-0 left-0 right-0 bg-white/90 p-2">
																<div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
																	<div
																		className="h-1.5 bg-linear-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-300"
																		style={{ width: `${progress[i]}%` }}
																	/>
																</div>
																<div className="text-[10px] text-slate-700 mt-1 font-medium">Uploading {progress[i]}%</div>
															</div>
														)}
														{imageUrls[i] && (
															<div className="absolute top-2 left-2 bg-green-600 text-white text-[10px] px-2 py-1 rounded flex items-center gap-1">
																<CheckCircle className="w-3 h-3" />
																Uploaded
															</div>
														)}
														<button
															type="button"
															onClick={() => removeImage(i)}
															className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-md transition-all duration-200 opacity-0 group-hover:opacity-100"
															aria-label="Remove"
														>
															<X className="w-4 h-4" />
														</button>
													</div>
												))}
											</div>

											<div className="flex gap-3">
												<label className="px-4 py-2.5 border border-slate-300 hover:bg-white/50 text-slate-700 font-semibold rounded-lg transition-all duration-200 cursor-pointer">
													Add more
													<input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
												</label>
												<button
													type="button"
													onClick={uploadAllImages}
													disabled={uploading || files.length === 0}
													className="flex-1 bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
												>
													{uploading ? "Uploading..." : imageUrls.length === files.length && files.length > 0 ? "Re-upload" : "Upload Images"}
												</button>
											</div>
										</div>
									)}
								</div>

								{/* AI Analysis Result */}
								{analyzing && (
									<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3 animate-pulse">
										<div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
										<span className="text-blue-700 font-medium">AI is analyzing your device...</span>
									</div>
								)}

								{aiAnalysis && (
									<div className="bg-linear-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-4 space-y-3">
										<div className="flex items-center gap-2 text-emerald-800 font-semibold">
											<CheckCircle className="w-5 h-5" />
											AI Analysis Complete
										</div>
										<div className="grid grid-cols-2 gap-4 text-sm">
											<div>
												<span className="text-slate-500 block">Estimated Value</span>
												<span className="font-bold text-lg text-emerald-700">
													Tk {aiAnalysis.estimated_value_min ?? 0} - {aiAnalysis.estimated_value_max ?? 0}
												</span>
											</div>
											<div>
												<span className="text-slate-500 block">Confidence</span>
												<span className="font-medium text-slate-700">
													{((aiAnalysis.confidence_score ?? 0) * 100).toFixed(0)}%
												</span>
											</div>
										</div>
										{aiAnalysis.recycling_value_notes && (
											<p className="text-xs text-slate-600 bg-white/50 p-2 rounded">
												{aiAnalysis.recycling_value_notes}
											</p>
										)}
									</div>
								)}

								{/* Details */}
								<div className="bg-white/40 rounded-lg p-6 border border-slate-200/50 space-y-4">
									{message && (
										<div className="text-sm text-slate-700 bg-blue-50 border border-blue-200 rounded-lg p-3">{message}</div>
									)}

									<div className="grid gap-4 md:grid-cols-2">
										<div className="md:col-span-2">
											<label className="block text-sm font-medium text-slate-700 mb-2">Device Name</label>
											<input
												type="text"
												value={deviceName}
												onChange={(e) => setDeviceName(e.target.value)}
												placeholder="Dell Latitude E7450"
												className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/40"
												required
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-slate-700 mb-2">Device Type</label>
											<select
												value={deviceType}
												onChange={(e) => setDeviceType(e.target.value as DeviceType)}
												className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/40"
											>
												<option value="laptop">Laptop</option>
												<option value="mobile">Mobile Phone</option>
												<option value="tablet">Tablet</option>
												<option value="desktop">Desktop</option>
												<option value="monitor">Monitor</option>
												<option value="other">Other</option>
											</select>
										</div>
										<div>
											<label className="block text-sm font-medium text-slate-700 mb-2">Condition</label>
											<select
												value={condition}
												onChange={(e) => setCondition(e.target.value as Condition)}
												className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/40"
											>
												<option value="working">Working</option>
												<option value="partially_working">Partially Working</option>
												<option value="not_working">Not Working</option>
											</select>
										</div>
										<div className="md:col-span-2">
											<label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
											<textarea
												value={description}
												onChange={(e) => setDescription(e.target.value)}
												rows={3}
												placeholder="Good condition laptop, minor scratches on body"
												className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/40"
												required
											/>
										</div>
									</div>

									{/* Advanced Price Prediction Fields */}
									<div className="border-t border-slate-200 pt-4">
										<button
											type="button"
											onClick={() => setShowAdvanced(!showAdvanced)}
											className="flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
										>
											<Sparkles className="w-4 h-4" />
											Advanced Price Prediction (Optional)
											{showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
										</button>
										<p className="text-xs text-slate-500 mt-1 ml-6">
											Fill these fields to get a more accurate AI-powered price prediction
										</p>

										{showAdvanced && (
											<div className="grid gap-4 md:grid-cols-2 mt-4 p-4 bg-emerald-50/30 rounded-lg border border-emerald-200">
												<div>
													<label className="block text-sm font-medium text-slate-700 mb-2">Brand</label>
													<input
														type="text"
														value={brand}
														onChange={(e) => setBrand(e.target.value)}
														placeholder="e.g., Dell, HP, Apple"
														className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/60"
													/>
												</div>
												<div>
													<label className="block text-sm font-medium text-slate-700 mb-2">
														Build Quality (1-10)
													</label>
													<input
														type="number"
														min="1"
														max="10"
														value={buildQuality}
														onChange={(e) => setBuildQuality(Number(e.target.value))}
														className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/60"
													/>
												</div>
												<div>
													<label className="block text-sm font-medium text-slate-700 mb-2">
														Original Price (Tk)
													</label>
													<input
														type="number"
														min="0"
														step="0.01"
														value={originalPrice ?? ""}
														onChange={(e) => setOriginalPrice(e.target.value ? Number(e.target.value) : null)}
														placeholder="e.g., 50000"
														className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/60"
													/>
												</div>
												<div>
													<label className="block text-sm font-medium text-slate-700 mb-2">Usage Pattern</label>
													<select
														value={usagePattern}
														onChange={(e) => setUsagePattern(e.target.value)}
														className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/60"
													>
														<option value="Light">Light</option>
														<option value="Moderate">Moderate</option>
														<option value="Heavy">Heavy</option>
													</select>
												</div>
												<div>
													<label className="block text-sm font-medium text-slate-700 mb-2">
														Used Duration (years)
													</label>
													<input
														type="number"
														min="0"
														step="0.1"
														value={usedDuration ?? ""}
														onChange={(e) => setUsedDuration(e.target.value ? Number(e.target.value) : null)}
														placeholder="e.g., 2"
														className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/60"
													/>
												</div>
												<div>
													<label className="block text-sm font-medium text-slate-700 mb-2">
														Expected Lifespan (years)
													</label>
													<input
														type="number"
														min="0"
														step="0.1"
														value={userLifespan ?? ""}
														onChange={(e) => setUserLifespan(e.target.value ? Number(e.target.value) : null)}
														placeholder="e.g., 5"
														className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/60"
													/>
												</div>
												<div>
													<label className="block text-sm font-medium text-slate-700 mb-2">
														Warranty/Expiry (years)
													</label>
													<input
														type="number"
														min="0"
														step="0.1"
														value={expiryYears ?? ""}
														onChange={(e) => setExpiryYears(e.target.value ? Number(e.target.value) : null)}
														placeholder="e.g., 3"
														className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/60"
													/>
												</div>
											</div>
										)}
									</div>

									<div className="grid gap-4 md:grid-cols-2">
										<div>
											<label className="block text-sm font-medium text-slate-700 mb-2">Latitude</label>
											<input
												type="number"
												value={lat ?? ""}
												onChange={(e) => setLat(e.target.value ? Number(e.target.value) : null)}
												placeholder="23.7808"
												className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/40"
												step="any"
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-slate-700 mb-2">Longitude</label>
											<input
												type="number"
												value={lng ?? ""}
												onChange={(e) => setLng(e.target.value ? Number(e.target.value) : null)}
												placeholder="90.4219"
												className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/40"
												step="any"
											/>
										</div>
									</div>

									<div className="flex gap-3">
										<button
											type="button"
											onClick={handleUseMyLocation}
											className="flex-1 px-4 py-2.5 rounded-lg border border-emerald-300 text-emerald-700 hover:bg-emerald-50/50 transition-all duration-200 font-medium flex items-center justify-center gap-2"
										>
											<MapPin className="w-4 h-4" /> Take my location
										</button>
										<button
											type="submit"
											disabled={submitting}
											className="flex-1 px-4 py-2.5 rounded-lg bg-linear-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 disabled:opacity-60 transition-all duration-200 font-semibold disabled:cursor-not-allowed"
										>
											{submitting ? "Posting..." : "Post Listing"}
										</button>
									</div>
								</div>
							</form>
						</div>

						{/* Right: Map & tips */}
						<div className="space-y-6">
							<div className="bg-white/40 rounded-lg p-6 border border-slate-200/50">
								<h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
									<MapPin className="w-5 h-5 text-emerald-600" /> Location Preview (Interactive)
								</h3>
								<InteractiveMap lat={lat} lng={lng} onLocationSelect={handleMapClick} />
								<p className="text-xs text-slate-600 mt-2">
									💡 <strong>Click anywhere on the map</strong> to set your location, or use "Take my location" button for automatic GPS location.
								</p>
								{lat !== null && lng !== null && (
									<div className="mt-2 text-xs text-emerald-700 font-medium">
										📍 Selected: {lat.toFixed(6)}, {lng.toFixed(6)}
									</div>
								)}
							</div>

							<div className="bg-linear-to-br from-green-600 to-emerald-600 rounded-lg p-6 text-white">
								<h3 className="text-lg font-bold mb-2">Tip</h3>
								<p className="text-sm opacity-95">
									Clear photos and accurate location increase your listing's visibility and chances of reuse.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</ProtectedRoute>
	);
}
