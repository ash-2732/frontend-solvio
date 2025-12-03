"use client";

import { X, AlertTriangle, Globe, Sparkles, ExternalLink } from "lucide-react";
import { useEffect } from "react";

interface FraudDetectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  fraudType: "ai_generated" | "web_image" | "both" | null;
  message: string;
  detailedReason: string;
  confidenceScore: number;
  webMatches?: Array<{
    type: string;
    url: string;
    page_title?: string;
    score: number;
  }> | null;
}

export default function FraudDetectionModal({
  isOpen,
  onClose,
  fraudType,
  message,
  detailedReason,
  confidenceScore,
  webMatches,
}: FraudDetectionModalProps) {
  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      return () => window.removeEventListener("keydown", handleEsc);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (fraudType) {
      case "ai_generated":
        return <Sparkles className="w-12 h-12 text-purple-500" />;
      case "web_image":
        return <Globe className="w-12 h-12 text-blue-500" />;
      case "both":
        return <AlertTriangle className="w-12 h-12 text-red-500" />;
      default:
        return <AlertTriangle className="w-12 h-12 text-orange-500" />;
    }
  };

  const getColor = () => {
    switch (fraudType) {
      case "ai_generated":
        return "purple";
      case "web_image":
        return "blue";
      case "both":
        return "red";
      default:
        return "orange";
    }
  };

  const color = getColor();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
        {/* Header */}
        <div className={`bg-gradient-to-r from-${color}-500 to-${color}-600 p-6 rounded-t-2xl relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all duration-200"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
              {getIcon()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                Image Fraud Detected
              </h2>
              <p className="text-white/80 text-sm">
                We detected potential issues with your uploaded image
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Main Message */}
          <div className={`bg-${color}-50 border border-${color}-200 rounded-lg p-4`}>
            <div className="flex items-start gap-3">
              <AlertTriangle className={`w-5 h-5 text-${color}-600 mt-0.5 flex-shrink-0`} />
              <div>
                <h3 className={`font-semibold text-${color}-900 mb-1`}>
                  {message}
                </h3>
                <p className={`text-sm text-${color}-700`}>
                  {detailedReason}
                </p>
              </div>
            </div>
          </div>

          {/* Confidence Score */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-700">
                Detection Confidence
              </span>
              <span className={`text-sm font-bold text-${color}-600`}>
                {(confidenceScore * 100).toFixed(0)}%
              </span>
            </div>
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r from-${color}-500 to-${color}-600 rounded-full transition-all duration-500`}
                style={{ width: `${confidenceScore * 100}%` }}
              />
            </div>
          </div>

          {/* Fraud Type Details */}
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-800">What We Detected:</h4>
            <div className="space-y-2">
              {(fraudType === "ai_generated" || fraudType === "both") && (
                <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <Sparkles className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="font-medium text-purple-900 text-sm">
                      AI-Generated Image
                    </h5>
                    <p className="text-xs text-purple-700 mt-1">
                      Our analysis suggests this image was created using AI image
                      generation tools (like Midjourney, DALL-E, Stable Diffusion,
                      etc.)
                    </p>
                  </div>
                </div>
              )}

              {(fraudType === "web_image" || fraudType === "both") && (
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Globe className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="font-medium text-blue-900 text-sm">
                      Downloaded from Internet
                    </h5>
                    <p className="text-xs text-blue-700 mt-1">
                      This image was found on the internet, suggesting it wasn't
                      taken by you at the reported location.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Web Matches */}
          {webMatches && webMatches.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-800">
                Found on these websites:
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {webMatches.map((match, idx) => (
                  <a
                    key={idx}
                    href={match.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-all duration-200 group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            match.type === "full_match"
                              ? "bg-red-100 text-red-700"
                              : match.type === "partial_match"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {match.type === "full_match"
                            ? "Exact Match"
                            : match.type === "partial_match"
                            ? "Partial Match"
                            : "Page Match"}
                        </span>
                        <span className="text-xs text-slate-500">
                          {(match.score * 100).toFixed(0)}% confidence
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 mt-1 truncate">
                        {match.page_title || match.url}
                      </p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600 flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Action Guide */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <h4 className="font-semibold text-slate-800 mb-2">
              What you should do:
            </h4>
            <ul className="space-y-1 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Take a new photo yourself at the actual waste location</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Ensure the photo is recent and shows the current state</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Include surrounding context to help with verification</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Enable GPS/location services when taking the photo</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 rounded-b-2xl border-t border-slate-200">
          <button
            onClick={onClose}
            className={`w-full py-3 px-6 bg-gradient-to-r from-${color}-600 to-${color}-700 hover:from-${color}-700 hover:to-${color}-800 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl`}
          >
            I Understand - Upload a New Photo
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
