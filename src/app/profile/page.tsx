"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { getMe } from "@/lib/authApi";
import type { AuthUser } from "@/types/auth";
import {
  User as UserIcon,
  Mail,
  Phone,
  ShieldCheck,
  Award,
  Calendar,
  BadgeCheck,
} from "lucide-react";

export default function ProfilePage() {
  const { token, user } = useAuth();
  const [me, setMe] = useState<AuthUser | null>(user);
  const [loading, setLoading] = useState<boolean>(!user);

  useEffect(() => {
    let mounted = true;
    const fetchMe = async () => {
      if (!token) return;
      try {
        const data = await getMe(token);
        if (mounted) setMe(data);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (!user) fetchMe();
    else setLoading(false);
    return () => {
      mounted = false;
    };
  }, [token, user]);

  return (
    <ProtectedRoute>
      <div className="relative min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        {/* Animated Background Orbs - Behind all content */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative py-8 lg:py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-left mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl mb-4 shadow-lg">
                <UserIcon className="text-white w-8 h-8" />
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
                My Profile
              </h1>
              <p className="text-slate-600">
                Manage your account information and preferences
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600" />
                </div>
              ) : me ? (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-0">
                  {/* Left Column - Main Info */}
                  <div className="xl:col-span-1 bg-gradient-to-br from-green-600 to-emerald-600 p-6 lg:p-8 text-white">
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <UserIcon className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl lg:text-2xl font-bold">
                          {me.full_name}
                        </h2>
                        <p className="text-green-100 capitalize">
                          {me.user_type}
                        </p>
                      </div>
                      <div className="space-y-2 text-green-100 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span>{me.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <span>{me.phone_number}</span>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-green-400/30">
                        <div className="grid grid-cols-2 gap-3 text-center">
                          <div>
                            <div className="text-xl font-bold">
                              {me.reputation_score}
                            </div>
                            <div className="text-xs text-green-200">
                              Reputation
                            </div>
                          </div>
                          <div>
                            <div className="text-xl font-bold">
                              {me.total_transactions}
                            </div>
                            <div className="text-xs text-green-200">
                              Transactions
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Detailed Info */}
                  <div className="xl:col-span-2 p-6 lg:p-8 space-y-6">
                    {/* Account Status */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <div className="w-6 h-6 bg-green-600 rounded-lg flex items-center justify-center">
                          <ShieldCheck className="w-4 h-4 text-white" />
                        </div>
                        Account Status
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="p-3 rounded-lg bg-green-50 border border-green-100 text-center">
                          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                            <BadgeCheck className="w-4 h-4 text-white" />
                          </div>
                          <div className="text-sm font-medium text-slate-700">
                            {me.is_active ? "Active" : "Inactive"}
                          </div>
                          <div className="text-xs text-slate-500">Status</div>
                        </div>
                        <div className="p-3 rounded-lg bg-green-50 border border-green-100 text-center">
                          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                            <BadgeCheck className="w-4 h-4 text-white" />
                          </div>
                          <div className="text-sm font-medium text-slate-700">
                            {me.is_verified ? "Verified" : "Not Verified"}
                          </div>
                          <div className="text-xs text-slate-500">
                            Verification
                          </div>
                        </div>
                        <div className="p-3 rounded-lg bg-green-50 border border-green-100 text-center">
                          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Award className="w-4 h-4 text-white" />
                          </div>
                          <div className="text-sm font-medium text-slate-700">
                            {me.is_sponsor ? "Sponsor" : "Member"}
                          </div>
                          <div className="text-xs text-slate-500">Type</div>
                        </div>
                      </div>
                    </div>

                    {/* Account Details */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <div className="w-6 h-6 bg-green-600 rounded-lg flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-white" />
                        </div>
                        Account Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="w-4 h-4 text-green-600" />
                            <span className="font-medium text-slate-900 text-sm">
                              Created
                            </span>
                          </div>
                          <p className="text-slate-600 text-sm">
                            {new Date(me.created_at).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </p>
                        </div>
                        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="w-4 h-4 text-green-600" />
                            <span className="font-medium text-slate-900 text-sm">
                              Last Updated
                            </span>
                          </div>
                          <p className="text-slate-600 text-sm">
                            {new Date(me.updated_at).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <div className="w-6 h-6 bg-green-600 rounded-lg flex items-center justify-center">
                          <UserIcon className="w-4 h-4 text-white" />
                        </div>
                        Quick Actions
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <button className="p-3 rounded-lg border border-green-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200 text-left">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                              <Mail className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <div className="font-medium text-slate-900 text-sm">
                                Update Email
                              </div>
                              <div className="text-xs text-slate-500">
                                Change email address
                              </div>
                            </div>
                          </div>
                        </button>
                        <button className="p-3 rounded-lg border border-green-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200 text-left">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                              <Phone className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <div className="font-medium text-slate-900 text-sm">
                                Update Phone
                              </div>
                              <div className="text-xs text-slate-500">
                                Change phone number
                              </div>
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-slate-600">
                  <UserIcon className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p>No user data found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
