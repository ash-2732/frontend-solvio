"use client";

import { useState } from "react";
import { Sparkles, MapPin, Activity, Clock, Loader2, CheckCircle, X } from "lucide-react";

type PredictInput = {
	day_of_week: number;
	geohash_6: string;
	hour: number;
	is_weekend: number;
	latitude: number;
	longitude: number;
	month: number;
	reports_last_24h: number;
	reports_last_7d: number;
	severity: number;
	waste_type: string;
};

type PredictResponse = {
	predicted_future_reports_3d: number;
	model_timestamp: string;
};

const defaultInput: PredictInput = {
	day_of_week: 2,
	geohash_6: "tdr22",
	hour: 14,
	is_weekend: 0,
	latitude: 28.62,
	longitude: 77.21,
	month: 11,
	reports_last_24h: 15,
	reports_last_7d: 85,
	severity: 2,
	waste_type: "organic",
};

export default function HotspotPredictPage() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [result, setResult] = useState<PredictResponse | null>(null);
	const [open, setOpen] = useState(false);

		const simulatePrediction = (input: PredictInput): PredictResponse => {
		// Simple heuristic-based dummy model for now
		const base = input.reports_last_7d * 0.4 + input.reports_last_24h * 0.8;
		const timeFactor = (input.hour >= 6 && input.hour <= 10 ? 1.15 : input.hour >= 17 && input.hour <= 21 ? 1.2 : 0.95);
		const weekendFactor = input.is_weekend ? 1.1 : 0.97;
		const severityFactor = 1 + (input.severity * 0.08);
		const wasteTypeFactor = input.waste_type === "organic" ? 1.1 : input.waste_type === "plastic" ? 1.05 : 1.0;
		const noise = Math.random() * 3 - 1.5; // small random noise
		const predicted = Math.max(0, base * timeFactor * weekendFactor * severityFactor * wasteTypeFactor + noise);
		const ts = new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 14);
		return {
			predicted_future_reports_3d: Number(predicted.toFixed(2)),
			model_timestamp: ts,
		};
		}

		const submit = async () => {
		setLoading(true);
		setError(null);
		setResult(null);
		try {
				// For now always use dummy data (defaultInput). Replace with a real call when ready.
				const data = simulatePrediction(defaultInput);
			setResult(data);
				setOpen(true);
		} catch (e: any) {
			setError(String(e?.message ?? e));
		} finally {
			setLoading(false);
		}
	};

	const riskColor = (value?: number) => {
		if (value === undefined) return "bg-slate-100 text-slate-700";
		if (value >= 80) return "bg-red-100 text-red-700";
		if (value >= 40) return "bg-orange-100 text-orange-700";
		return "bg-emerald-100 text-emerald-700";
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
			<div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
				{/* Header */}
				<div className="mb-8 flex items-center gap-4">
					<div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
						<Activity className="w-7 h-7 text-white" />
					</div>
					<div>
						<h1 className="text-3xl font-bold bg-linear-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">Predict Hotspot</h1>
						<p className="text-slate-600">Instantly estimate future reports for the next 3 days</p>
					</div>
				</div>

								{/* Single action layout */}
								<div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-8 shadow-md max-w-3xl">
					<p className="text-slate-600 mb-6">Click the button below to predict the next 3 days' hotspot using current heuristics.</p>

					{/* Dummy input preview */}
					<div className="mb-6 grid sm:grid-cols-2 gap-3">
						<div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
							<div className="text-xs text-slate-500">Location</div>
							<div className="mt-1 text-sm text-slate-900 flex items-center gap-2"><MapPin className="w-4 h-4 text-emerald-600" /> {defaultInput.latitude}, {defaultInput.longitude}</div>
							<div className="text-xs text-slate-600 mt-1">geohash: {defaultInput.geohash_6}</div>
						</div>
						<div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
							<div className="text-xs text-slate-500">Time</div>
							<div className="mt-1 text-sm text-slate-900">hour: {defaultInput.hour} • month: {defaultInput.month} • DOW: {defaultInput.day_of_week}</div>
							<div className="text-xs text-slate-600 mt-1">weekend: {defaultInput.is_weekend ? 'yes' : 'no'}</div>
						</div>
						<div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
							<div className="text-xs text-slate-500">Recent reports</div>
							<div className="mt-1 text-sm text-slate-900">24h: {defaultInput.reports_last_24h} • 7d: {defaultInput.reports_last_7d}</div>
						</div>
						<div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
							<div className="text-xs text-slate-500">Context</div>
							<div className="mt-1 text-sm text-slate-900">severity: {defaultInput.severity} • type: {defaultInput.waste_type}</div>
						</div>
					</div>
									  <button onClick={submit} disabled={loading} className="w-full bg-linear-to-r from-emerald-500 to-teal-600 text-white font-bold py-4 rounded-xl shadow-md hover:shadow-lg hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-50">
										{loading ? (
											<span className="flex items-center justify-center gap-2">
												<Loader2 className="w-5 h-5 animate-spin" /> Predicting...
											</span>
										) : (
											<span className="flex items-center justify-center gap-2">
												<Sparkles className="w-5 h-5" /> Predict Hotspot
											</span>
										)}
									</button>

					{error && (
						<div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
					)}
				</div>

				{/* Modal for results */}
				{open && result && (
					<div className="fixed inset-0 z-30 flex items-center justify-center">
						<div className="absolute inset-0 bg-black/25" onClick={() => setOpen(false)} />
						<div className="relative z-40 bg-white rounded-2xl shadow-lg border border-slate-200 w-full max-w-lg p-6">
							<div className="flex items-center justify-between mb-4">
								<h3 className="font-bold text-slate-900 flex items-center gap-2"><MapPin className="w-5 h-5 text-emerald-600" /> Predicted Hotspot</h3>
								<button onClick={() => setOpen(false)} className="p-2 rounded-lg hover:bg-slate-100"><X className="w-4 h-4 text-slate-600" /></button>
							</div>
							<div className={`p-4 rounded-xl border ${riskColor(result.predicted_future_reports_3d)} border-opacity-50 mb-4`}>
								<div className="text-xs text-slate-500">Predicted reports in 3 days</div>
								<div className="text-3xl font-bold text-slate-900 mt-1">{result.predicted_future_reports_3d}</div>
							</div>
							<div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-4">
								<div className="flex items-center gap-2 text-xs text-slate-600">
									<Clock className="w-4 h-4" /> Model timestamp
								</div>
								<div className="mt-1 font-mono text-slate-900 text-sm">{result.model_timestamp}</div>
							</div>
							<div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm flex items-center gap-2">
								<CheckCircle className="w-4 h-4" /> Prediction ready — allocate resources accordingly.
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
