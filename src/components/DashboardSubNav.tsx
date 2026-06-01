import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  Package,
  UserCircle,
  Settings,
  Home,
  MessageSquare,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useFirebase } from "../context/FirebaseContext";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function DashboardSubNav() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const navigate = useNavigate();
  const { profile, user } = useFirebase();
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

  return (
    <>
      <div className="bg-[#f7fafd] w-full border-b border-[#e2eaf3] pt-4 pb-4">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center gap-2 md:gap-4 relative z-[100]">
          <button
            onClick={() => navigate("/dashboard")}
            className={`shrink-0 justify-center items-center flex gap-1 sm:gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer bg-white text-primary-dark border border-[#c8d8e8] hover:border-primary-dark hover:bg-[#f7fafd] hover:text-primary-base`}
          >
            <Home size={16} /> Início
          </button>

          <div className="relative group">
            <button
              onClick={() =>
                setActiveDropdown(activeDropdown === "grupos" ? null : "grupos")
              }
              className={`shrink-0 justify-center items-center flex gap-1 sm:gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeDropdown === "grupos"
                  ? "bg-primary-dark text-white shadow-md"
                  : "bg-white text-primary-dark border border-[#c8d8e8] hover:border-primary-dark hover:bg-[#f7fafd] hover:text-primary-base"
              }`}
            >
              <Users size={16} /> Meu Grupo
            </button>
            <AnimatePresence>
              {activeDropdown === "grupos" && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-[0_6px_24px_rgba(0,0,0,0.12)] border border-[#e2eaf3] py-1 z-[110] overflow-hidden"
                >
                  <button
                    onClick={() => {
                      setActiveDropdown(null);
                      navigate("/dashboard/cadastrar-turma");
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-main hover:bg-[#f7fafd] hover:text-primary-base transition-colors"
                  >
                    <Users size={14} /> Cadastrar Turma
                  </button>
                  <button
                    onClick={() => {
                      setActiveDropdown(null);
                      navigate("/dashboard/grupos");
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-main hover:bg-[#f7fafd] hover:text-primary-base transition-colors"
                  >
                    <LayoutDashboard size={14} /> Turmas Criadas
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative group">
            <button
              onClick={() =>
                setActiveDropdown(
                  activeDropdown === "relatorios" ? null : "relatorios",
                )
              }
              className={`shrink-0 justify-center items-center flex gap-1 sm:gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeDropdown === "relatorios"
                  ? "bg-primary-dark text-white shadow-md"
                  : "bg-white text-primary-dark border border-[#c8d8e8] hover:border-primary-dark hover:bg-[#f7fafd] hover:text-primary-base"
              }`}
            >
              <FileText size={16} /> Relatórios
            </button>
            <AnimatePresence>
              {activeDropdown === "relatorios" && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-[0_6px_24px_rgba(0,0,0,0.12)] border border-[#e2eaf3] py-1 z-[110] overflow-hidden"
                >
                  <button
                    onClick={() => {
                      setActiveDropdown(null);
                      navigate("/dashboard/enviar-relatorio");
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-main hover:bg-[#f7fafd] hover:text-primary-base transition-colors"
                  >
                    <FileText size={14} /> Enviar Relatório
                  </button>
                  <button
                    onClick={() => {
                      setActiveDropdown(null);
                      navigate("/dashboard/meus-registros");
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-main hover:bg-[#f7fafd] hover:text-primary-base transition-colors"
                  >
                    <FileText size={14} /> Meus Registros
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative group">
            <button
              onClick={() =>
                setActiveDropdown(
                  activeDropdown === "material" ? null : "material",
                )
              }
              className={`shrink-0 justify-center items-center flex gap-1 sm:gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeDropdown === "material"
                  ? "bg-primary-dark text-white shadow-md"
                  : "bg-white text-primary-dark border border-[#c8d8e8] hover:border-primary-dark hover:bg-[#f7fafd] hover:text-primary-base"
              }`}
            >
              <Package size={16} /> Material
            </button>
            <AnimatePresence>
              {activeDropdown === "material" && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-[0_6px_24px_rgba(0,0,0,0.12)] border border-[#e2eaf3] py-1 z-[110] overflow-hidden"
                >
                  <button
                    onClick={() => {
                      setActiveDropdown(null);
                      navigate("/dashboard/materiais");
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-main hover:bg-[#f7fafd] hover:text-primary-base transition-colors"
                  >
                    <Package size={14} /> Fazer Pedido
                  </button>
                  <button
                    onClick={() => {
                      setActiveDropdown(null);
                      navigate("/dashboard/historico-pedidos");
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-main hover:bg-[#f7fafd] hover:text-primary-base transition-colors"
                  >
                    <FileText size={14} /> Histórico
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={() => navigate("/dashboard/meus-dados")}
            className={`shrink-0 justify-center items-center flex gap-1 sm:gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer bg-white text-primary-dark border border-[#c8d8e8] hover:border-primary-dark hover:bg-[#f7fafd] hover:text-primary-base`}
          >
            <UserCircle size={16} /> Meus Dados
          </button>

          <button
            onClick={() => navigate("/dashboard/duvidas")}
            className={`shrink-0 relative justify-center items-center flex gap-1 sm:gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer bg-white text-primary-dark border border-[#c8d8e8] hover:border-primary-dark hover:bg-[#f7fafd] hover:text-primary-base`}
          >
            <MessageSquare size={16} /> Dúvidas e Respostas
            {unreadSupportCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                {unreadSupportCount > 9 ? "9+" : unreadSupportCount}
              </span>
            )}
          </button>
        </div>
      </div>
      {activeDropdown && (
        <div
          className="fixed inset-0 z-[90]"
          onClick={() => setActiveDropdown(null)}
        />
      )}
    </>
  );
}
