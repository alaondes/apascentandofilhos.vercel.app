import React, { useEffect } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useFirebase } from "../context/FirebaseContext";
import { Loader2 } from "lucide-react";
import { auth } from "../lib/firebase";
import { signOut } from "firebase/auth";

export default function ProtectedRoute() {
  const { user, profile, loading } = useFirebase();
  const navigate = useNavigate();

  useEffect(() => {
    if (profile?.status === "bloqueado") {
      signOut(auth).then(() => {
        alert("Sua conta foi bloqueada. Entre em contato com a administração.");
        navigate("/login", { replace: true });
      });
    } else if (user && !profile && user.email !== "alaondez@gmail.com") {
      // User is authenticated in Firebase Auth but has no Firestore profile
      signOut(auth).then(() => {
        alert("Dados do usuário não encontrados. Faça seu cadastro.");
        navigate("/login", { replace: true });
      });
    }
  }, [profile, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfaf7]">
        <Loader2 className="w-10 h-10 text-[#4a3f35] animate-spin" />
      </div>
    );
  }

  if (
    profile?.status === "bloqueado" ||
    (user && !profile && user.email !== "alaondez@gmail.com")
  ) {
    return null; // Will be redirected by useEffect
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
