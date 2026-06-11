import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  UserCircle,
  ChevronDown,
  LogOut,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useFirebase } from "../context/FirebaseContext";
import { signOut } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const { profile } = useFirebase();
  const navigate = useNavigate();

  const [headerLogo, setHeaderLogo] = useState({
    logoUrl: "/logo.png",
    title: "MINISTÉRIO",
    subtitle: "APASCENTANDO FILHOS",
  });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "content", "header_logo"), (snap) => {
      if (snap.exists()) {
        setHeaderLogo((prev) => ({ ...prev, ...snap.data() }));
      }
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7f9] flex flex-col pt-[48px] pb-0 no-scrollbar overflow-y-auto w-full overflow-x-hidden">
      {/* Topbar */}
      <div className="fixed top-0 left-0 right-0 h-12 bg-gray-100 text-gray-600 z-[110] flex items-center justify-between px-3 sm:px-7 shadow-sm border-b border-gray-200">
        <NavLink
          to="/dashboard"
          className="flex items-center gap-2 outline-none"
        >
          {headerLogo.logoUrl ? (
            <img
              src={headerLogo.logoUrl}
              alt={headerLogo.title}
              className="h-[34px] w-auto object-contain"
              onError={(e) => {
                e.currentTarget.src =
                  "https://ui-avatars.com/api/?name=EM&background=1a6496&color=fff&rounded=true&bold=true";
              }}
            />
          ) : (
            <div className="h-8 w-8 bg-primary-base rounded-lg flex items-center justify-center text-white font-bold text-[10px]">
              EM
            </div>
          )}
          <div className="flex flex-col justify-center leading-none mt-1 shrink-0">
            <span className="font-black text-[#1e3a5f] text-[18px] tracking-wide whitespace-nowrap uppercase">
              {headerLogo.title}
            </span>
            <span className="text-[#64748b] text-[10px] tracking-[0.2em] mt-[2px] font-bold whitespace-nowrap uppercase">
              {headerLogo.subtitle}
            </span>
          </div>
        </NavLink>

        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2 text-gray-600 font-medium text-[0.85rem]">
            <UserCircle size={18} />
            <span className="hidden sm:block">
              {profile?.nome || "Administrador"}
            </span>
          </div>

          <button
            onClick={() => navigate("/")}
            className={`shrink-0 justify-center items-center flex gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer bg-primary-dark text-white shadow-md`}
          >
            <ExternalLink size={16} />{" "}
            <span className="hidden sm:block">Acessar Site</span>
            <span className="sm:hidden">Site</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-gray-500 hover:text-red-600 transition-colors cursor-pointer text-[0.85rem] font-bold ml-2"
          >
            <LogOut size={16} /> <span className="hidden sm:block">Sair</span>
          </button>
        </div>
      </div>

      <main className="flex-grow flex flex-col relative z-0">{children}</main>
    </div>
  );
}
