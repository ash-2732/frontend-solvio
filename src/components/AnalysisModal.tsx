"use client";

import React from "react";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  data: {
    confidence_score: number;
    description: string;
    severity: string;
    waste_type: string;
  } | null;
}

export default function AnalysisModal({ open, onClose, data }: Props) {
  if (!open || !data) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full sm:w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Analysis Result</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-xs text-slate-500">Confidence</div>
              <div className="text-slate-900 font-medium">{(data.confidence_score * 100).toFixed(0)}%</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-xs text-slate-500">Severity</div>
              <div className="text-slate-900 font-medium capitalize">{data.severity}</div>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="text-xs text-slate-500">Waste Type</div>
            <div className="text-slate-900 font-medium capitalize">{data.waste_type}</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="text-xs text-slate-500">Description</div>
            <div className="text-slate-900 text-sm">{data.description}</div>
          </div>
        </div>
      </div>
    </div>
  );
}