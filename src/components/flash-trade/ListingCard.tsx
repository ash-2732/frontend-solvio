"use client";

import { MapPin, Clock, ArrowRight, Battery, Cpu } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface ListingProps {
    id: string;
    device_name: string;
    device_type: string;
    condition: string;
    estimated_value_min: number;
    estimated_value_max: number;
    location: string;
    time_ago: string;
    image_url: string;
    distance: string;
}

export default function ListingCard({ listing }: { listing: ListingProps }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
            <div className="flex flex-col">
                {/* Image Section */}
                <div className="relative w-full h-56 overflow-hidden bg-slate-100">
                    {listing.image_url ? (
                        <Image
                            src={listing.image_url}
                            alt={listing.device_name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                            unoptimized
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <span className="text-sm">No Image Available</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-slate-700 shadow-sm border border-slate-100">
                        {listing.device_type}
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-bold text-slate-900 line-clamp-1 group-hover:text-green-700 transition-colors">
                                {listing.device_name}
                            </h3>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${listing.condition === 'Working' ? 'bg-emerald-100 text-emerald-700' :
                                listing.condition === 'Damaged' ? 'bg-amber-100 text-amber-700' :
                                    'bg-slate-100 text-slate-700'
                                }`}>
                                {listing.condition}
                            </span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                            <div className="flex items-center gap-1.5">
                                <MapPin className="w-4 h-4 text-slate-400" />
                                {listing.location} <span className="text-slate-300">•</span> {listing.distance}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-slate-400" />
                                {listing.time_ago}
                            </div>
                        </div>

                        <div className="flex gap-2 mb-4">
                            <div className="px-2.5 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs font-medium text-slate-600 flex items-center gap-1.5">
                                <Cpu className="w-3.5 h-3.5 text-slate-400" />
                                Material: Mixed
                            </div>
                            <div className="px-2.5 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs font-medium text-slate-600 flex items-center gap-1.5">
                                <Battery className="w-3.5 h-3.5 text-slate-400" />
                                Battery: Yes
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-0.5">
                                Estimated Value
                            </p>
                            <p className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                                Tk {listing.estimated_value_min.toLocaleString()} -{" "}
                                {listing.estimated_value_max.toLocaleString()}
                            </p>
                        </div>
                        <Link
                            href={`/kabadiwala/listings/${listing.id}`}
                            className="inline-flex items-center justify-center px-5 py-2.5 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl group-hover:translate-x-1 duration-300"
                        >
                            View Details
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
