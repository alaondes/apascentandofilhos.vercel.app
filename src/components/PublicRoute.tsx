import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useFirebase } from "../context/FirebaseContext";
import { Loader2 } from "lucide-react";

export default function PublicRoute() {
  const { user, profile, loading } = useFirebase();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfaf7]">
        <Loader2 className="w-10 h-10 text-[#4a3f35] animate-spin" />
      </div>
    );
  }

  // If user is already logged in, redirect them away from public pages like login/cadastro
  if (user) {
    const intendedLoginMode = sessionStorage.getItem("intendedLoginMode");
    const isAdmin =
      profile?.role === "admin" ||
      user.email?.toLowerCase() === "alaondez@gmail.com";

    if (intendedLoginMode === "admin" && isAdmin) {
      return <Navigate to="/dashboard/admin" replace />;
    } else if (isAdmin && !intendedLoginMode) {
      // Default to admin if they are an admin and no specific mode was selected (e.g. auto login)
      return <Navigate to="/dashboard/admin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
