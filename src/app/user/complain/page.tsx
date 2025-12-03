"use client";

import { useEffect, useMemo, useState } from "react";
import { MessageSquareWarning, CheckCircle, Languages, Sparkles } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type Sentiment = {
  text: string;
  sentiment: "negative" | "neutral" | "positive";
  confidence: number;
};

type Complaint = {
  id: number;
  text: string;
  language: string;
  sentiment: string;
  confidence: number;
  severity: string;
  created_at: string;
};

function detectLanguage(text: string): "bn" | "en" {
  return /[\u0980-\u09FF]/.test(text) ? "bn" : "en";
}

export default function Complain() {
  const { token } = useAuth();
  const [text, setText] = useState("");
  const [language, setLanguage] = useState<"bn" | "en">("en");
  const [result, setResult] = useState<Sentiment | null>(null);
  const [severity, setSeverity] = useState("low");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  useEffect(() => {
    setLanguage(detectLanguage(text));
  }, [text]);

  const analyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/sentiment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Sentiment failed");
      const payload: Sentiment = {
        text: data?.result?.text ?? text,
        sentiment: data?.result?.sentiment ?? "neutral",
        confidence: data?.result?.confidence ?? 0,
      };
      setResult(payload);
      const conf = payload.confidence;
      setSeverity(conf >= 0.8 ? "high" : conf >= 0.5 ? "medium" : "low");
    } catch (e: any) {
      setError(String(e?.message ?? e));
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = useMemo(() => !!text.trim() && !!result, [text, result]);

  const submitComplaint = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      await apiRequest("/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: result!.text,
          language,
          sentiment: result!.sentiment,
          confidence: result!.confidence,
          severity,
        }),
        auth: true,
        token,
      });

      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 2500);
      setText("");
      setResult(null);
      setSeverity("low");
      await loadComplaints();
    } catch (e: any) {
      setError(String(e?.message ?? e));
    } finally {
      setLoading(false);
    }
  };

  const loadComplaints = async () => {
    try {
      const data = await apiRequest<Complaint[]>("/complaints", {
        method: "GET",
        auth: true,
        token,
      });
      setComplaints(data);
    } catch (e) {
      console.error("Failed to load complaints:", e);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "negative":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-500 text-white";
      case "medium":
        return "bg-orange-500 text-white";
      default:
        return "bg-blue-500 text-white";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
              <MessageSquareWarning className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Submit Complaint
              </h1>
              <p className="text-slate-600 mt-1 text-lg">Share your concerns and we'll analyze the sentiment</p>
            </div>
          </div>
          
          {/* Bangla Language Notice */}
          <div className="mt-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-5 rounded-xl shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center shadow-md">
                <Languages className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold text-amber-900 text-lg">বাংলা Sentiment Analysis Only</h3>
                  <Sparkles className="w-5 h-5 text-amber-600" />
                </div>
                <p className="text-sm text-amber-800 leading-relaxed">
                  This system is <strong>specifically designed for Bangla (বাংলা) language</strong> sentiment analysis. 
                  Please write your complaint in Bangla for accurate and reliable results. English text may not be analyzed correctly.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {submitted && (
          <div className="mb-8 p-5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl flex items-center gap-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <CheckCircle className="w-7 h-7 text-green-600 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-green-900 text-lg">Complaint Submitted Successfully!</h3>
              <p className="text-sm text-green-700 mt-1">We will review your complaint and respond within 48 hours.</p>
            </div>
          </div>
        )}

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-8 shadow-xl shadow-slate-200/50">
              <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <MessageSquareWarning className="w-4 h-4 text-emerald-600" />
                    Your Complaint (আপনার অভিযোগ)
                  </label>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="আপনার অভিযোগ লিখুন... (Write your complaint in Bangla)"
                    rows={8}
                    className="w-full px-5 py-4 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 focus:outline-none transition-all text-slate-900 resize-y text-lg placeholder:text-slate-400"
                  />
                  {text && (
                    <div className="mt-3 flex items-center gap-2">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                        language === "bn" 
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-200" 
                          : "bg-amber-100 text-amber-700 border border-amber-200"
                      }`}>
                        <Languages className="w-3.5 h-3.5" />
                        Detected: {language === "bn" ? "বাংলা (Bangla)" : "English"}
                      </div>
                      {language !== "bn" && (
                        <span className="text-xs text-amber-600 font-medium">⚠️ Please use Bangla for better results</span>
                      )}
                    </div>
                  )}
                </div>

                {result && (
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-xl p-6 space-y-4">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2 text-lg">
                      <Sparkles className="w-5 h-5 text-emerald-600" />
                      Analysis Results
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-2">Text</label>
                        <input
                          value={result.text}
                          onChange={(e) => setResult({ ...result!, text: e.target.value })}
                          className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 focus:outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-2">Sentiment</label>
                        <select
                          value={result.sentiment}
                          onChange={(e) => setResult({ ...result!, sentiment: e.target.value as Sentiment["sentiment"] })}
                          className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 focus:outline-none transition-all"
                        >
                          <option value="negative">🔴 Negative</option>
                          <option value="neutral">⚪ Neutral</option>
                          <option value="positive">🟢 Positive</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-2">Confidence</label>
                        <input
                          type="number"
                          step="0.0001"
                          value={result.confidence}
                          onChange={(e) => {
                            const v = parseFloat(e.target.value);
                            const conf = isNaN(v) ? 0 : v;
                            setResult({ ...result!, confidence: conf });
                            setSeverity(conf >= 0.8 ? "high" : conf >= 0.5 ? "medium" : "low");
                          }}
                          className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 focus:outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-2">Severity</label>
                        <select
                          value={severity}
                          onChange={(e) => setSeverity(e.target.value)}
                          className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 focus:outline-none transition-all"
                        >
                          <option value="low">🔵 Low</option>
                          <option value="medium">🟠 Medium</option>
                          <option value="high">🔴 High</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={analyze}
                    disabled={loading || !text.trim()}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-4 px-8 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 transform hover:-translate-y-0.5 duration-200"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                        Analyzing...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        Analyze Sentiment
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={submitComplaint}
                    disabled={loading || !canSubmit}
                    className="px-8 py-4 border-2 border-emerald-500 hover:bg-emerald-50 text-emerald-700 font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transform hover:-translate-y-0.5 duration-200"
                  >
                    {loading ? "Submitting..." : "Submit Complaint"}
                  </button>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-sm text-red-700 font-medium">⚠️ Error: {error}</p>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Right: Previous complaints */}
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-xl shadow-slate-200/50 sticky top-6">
              <h3 className="font-bold text-slate-900 mb-5 text-lg flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                Previous Complaints
              </h3>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {complaints.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <MessageSquareWarning className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-500 text-sm font-medium">No complaints yet.</p>
                    <p className="text-slate-400 text-xs mt-1">Your submissions will appear here.</p>
                  </div>
                ) : (
                  complaints.map((c) => (
                    <div 
                      key={c.id} 
                      className="border-2 border-slate-200 rounded-xl p-4 hover:border-emerald-300 transition-all hover:shadow-md bg-white"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-400">#{c.id}</span>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${getSeverityBadge(c.severity)}`}>
                          {c.severity.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-slate-900 mb-3 line-clamp-3">{c.text}</div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getSentimentColor(c.sentiment)}`}>
                          {c.sentiment}
                        </span>
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          {(c.confidence * 100).toFixed(1)}% conf.
                        </span>
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                          {c.language === "bn" ? "বাংলা" : "EN"}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-2">
                        {new Date(c.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
