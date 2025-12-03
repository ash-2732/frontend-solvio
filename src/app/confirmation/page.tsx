"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Loader, CheckCircle2, Navigation } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

export default function ConfirmationPage() {
  const router = useRouter();
  const { token, user } = useAuth();
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Check if user is logged in and is a collector
  useEffect(() => {
    if (!token || !user) {
      toast.error("Please login first");
      router.push("/login");
      return;
    }

    if (user.user_type !== "collector") {
      toast.error("This page is only for collectors");
      router.push("/");
      return;
    }
  }, [token, user, router]);

  const handleUseMyLocation = () => {
    setIsGettingLocation(true);
    
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toString());
        setLongitude(position.coords.longitude.toString());
        toast.success("Location retrieved successfully!");
        setIsGettingLocation(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        toast.error("Failed to get your location. Please enter manually.");
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!latitude || !longitude) {
      toast.error("Please provide your location");
      return;
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      toast.error("Please enter valid coordinates");
      return;
    }

    if (lat < -90 || lat > 90) {
      toast.error("Latitude must be between -90 and 90");
      return;
    }

    if (lng < -180 || lng > 180) {
      toast.error("Longitude must be between -180 and 180");
      return;
    }

    setIsLoading(true);

    try {
      if (!token) {
        toast.error("Authentication required. Please login.");
        router.push("/login");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/collectors/me/location`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          latitude: lat,
          longitude: lng,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update location");
      }

      toast.success("Location updated successfully!");
      
      // Redirect to home page (collector dashboard)
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (error: any) {
      console.error("Error updating location:", error);
      toast.error(error.message || "Failed to update location");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-50 via-emerald-50 to-teal-50 px-4 py-12">
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-green-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-green-600 to-emerald-600 rounded-2xl mb-4 shadow-lg shadow-green-600/30">
            <MapPin className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Set Your Location
          </h1>
          <p className="text-slate-600">
            As a collector, we need your location to assign nearby quests
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white/50 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Use My Location Button */}
            <button
              type="button"
              onClick={handleUseMyLocation}
              disabled={isGettingLocation}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGettingLocation ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Getting Location...
                </>
              ) : (
                <>
                  <Navigation className="w-5 h-5" />
                  Use My Current Location
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/50 text-slate-600">or enter manually</span>
              </div>
            </div>

            {/* Latitude Field */}
            <div>
              <label
                htmlFor="latitude"
                className="block text-sm font-semibold text-slate-900 mb-2"
              >
                Latitude
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="latitude"
                  name="latitude"
                  type="number"
                  step="any"
                  required
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="23.8103"
                  min="-90"
                  max="90"
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Must be between -90 and 90
              </p>
            </div>

            {/* Longitude Field */}
            <div>
              <label
                htmlFor="longitude"
                className="block text-sm font-semibold text-slate-900 mb-2"
              >
                Longitude
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="longitude"
                  name="longitude"
                  type="number"
                  step="any"
                  required
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="90.4125"
                  min="-180"
                  max="180"
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Must be between -180 and 180
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-green-900">
                    Why do we need your location?
                  </p>
                  <p className="text-xs text-green-800 mt-1">
                    We use your location to assign you waste collection quests in your area. 
                    This helps you find nearby tasks and earn rewards efficiently.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !latitude || !longitude}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Updating Location...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Confirm & Continue
                </>
              )}
            </button>
          </form>

          {/* Helper Text */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              After confirming your location, you'll be redirected to your dashboard
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
