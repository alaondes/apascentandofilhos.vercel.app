import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  UserCircle,
  ChevronDown,
  User,
  Settings,
  LogOut,
  LayoutDashboard,
  FileText,
  Package,
  Users,
  ChevronRight,
  List,
  Plus,
  ShoppingCart,
  Clock,
  UserPen,
  Home,
  Bell,
  Menu,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useFirebase } from "../context/FirebaseContext";
import { signOut } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import {
  collection,
  query,
  orderBy,
  getDocs,
  onSnapshot,
  where,
  doc,
} from "firebase/firestore";

import DashboardSubNav from "./DashboardSubNav";

interface DashboardLayoutProps {
  children: React.ReactNode;
  hideSubNav?: boolean;
}

export default function DashboardLayout({
  children,
  hideSubNav = false,
}: DashboardLayoutProps) {
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const { user, profile } = useFirebase();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  const [headerLogo, setHeaderLogo] = useState({
    logoUrl: "/logomaf.png",
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

  const isAdmin =
    profile?.papel === "admin" ||
    profile?.papel === "super_admin" ||
    profile?.role === "admin" ||
    user?.email === "alaondez@gmail.com";

  const isSecretary = profile?.role === "secretary";

  const [unreadSupportCount, setUnreadSupportCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    let q;
    if (isAdmin || isSecretary) {
      q = query(collection(db, "support_tickets"));
    } else {
      q = query(
        collection(db, "support_tickets"),
        where("userId", "==", user.uid),
      );
    }

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        let count = 0;
        snap.docs.forEach((doc) => {
          const data = doc.data();
          if ((isAdmin || isSecretary) && data.status === "pending") {
            count++;
          }
          if (
            data.userId === user.uid &&
            data.status === "answered" &&
            data.userRead === false
          ) {
            count++;
          }
        });
        setUnreadSupportCount(count);
      },
      (error) => console.error("Error listening to support tickets:", error),
    );

    return () => unsubscribe();
  }, [user, isAdmin]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;
      try {
        const notifSnap = await getDocs(
          query(collection(db, "notifications"), orderBy("createdAt", "desc")),
        );
        const myNotifs = notifSnap.docs
          .map((t) => ({ id: t.id, ...t.data() }))
          .filter(
            (n: any) => n.targetType === "user" && n.targetUserId === user.uid,
          );

        // Let's assume a notification is unread if readBy array doesn't have the user.uid
        const count = myNotifs.filter(
          (n: any) => !(n.readBy || []).includes(user.uid),
        ).length;
        setUnreadCount(count);
      } catch (error) {
        console.error("Erro ao buscar notificações:", error);
      }
    };
    fetchNotifications();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="min-h-screen bg-bg-main flex flex-col pt-[48px] pb-0 no-scrollbar overflow-y-auto">
      {/* Topbar */}
      <div className="fixed top-0 left-0 right-0 h-12 bg-gray-100 text-gray-600 z-[110] flex items-center justify-between px-7 shadow-sm border-b border-gray-200">
        <NavLink
          to="/dashboard"
          className="flex items-center gap-2 outline-none"
        >
          <img
            src={headerLogo.logoUrl && headerLogo.logoUrl !== "/logo.png" ? headerLogo.logoUrl : "/logomaf.png"}
            alt={headerLogo.title}
            className="h-[34px] w-auto object-contain"
            onError={(e) => {
              e.currentTarget.src = "/logomaf.png";
            }}
          />
          <div className="flex flex-col justify-center leading-none mt-1 shrink-0">
            <span className="font-black text-[#1e3a5f] text-[18px] tracking-wide whitespace-nowrap uppercase">
              {headerLogo.title}
            </span>
            <span className="text-[#64748b] text-[10px] tracking-[0.2em] mt-[2px] font-bold whitespace-nowrap uppercase">
              {headerLogo.subtitle}
            </span>
          </div>
        </NavLink>

        <div className="flex items-center gap-5 sm:gap-6">
          <button
            onClick={() => navigate("/dashboard/meus-dados?tab=notificacoes")}
            className="relative text-gray-400 hover:text-primary-base transition-colors"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          <div className="flex items-center gap-2 text-gray-600 font-medium text-[0.85rem]">
            {profile?.avatar ? (
              <img src={profile.avatar} alt="Avatar" className="w-6 h-6 rounded-full object-cover" />
            ) : (
              <UserCircle size={18} />
            )}
            <span className="hidden sm:block">{profile?.nome || "Líder"}</span>
          </div>

          <button
            onClick={() => navigate("/dashboard/admin")}
            className="relative flex items-center gap-1.5 bg-primary-dark text-white px-3 py-1.5 rounded-md text-[0.85rem] font-bold shadow-sm hover:bg-primary-dark transition-colors cursor-pointer ml-1 sm:ml-2"
          >
            <Settings size={14} />{" "}
            <span className="hidden sm:block">
              Acessar Painel de Controle
            </span>
            {unreadSupportCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                {unreadSupportCount > 9 ? "9+" : unreadSupportCount}
              </span>
            )}
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-gray-500 hover:text-red-600 transition-colors cursor-pointer text-[0.85rem] font-bold ml-1 sm:ml-2"
          >
            <LogOut size={16} /> <span className="hidden sm:block">Sair</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col relative z-0">
        {!hideSubNav && <DashboardSubNav />}
        {children}
      </main>
    </div>
  );
}
