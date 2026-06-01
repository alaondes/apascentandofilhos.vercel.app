import React, { useState, useEffect } from "react";
import { useFirebase } from "../../context/FirebaseContext";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Loader2, Edit3, Save, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

export default function RestrictedEditionPanel() {
  const { user, profile } = useFirebase();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // States for the different editing divisions
  const [division1, setDivision1] = useState("");
  const [division2, setDivision2] = useState("");
  const [division3, setDivision3] = useState("");

  const isAdmin =
    profile?.papel === "admin" ||
    profile?.papel === "super_admin" ||
    profile?.role === "admin" ||
    user?.email === "alaondez@gmail.com";
  const isSecretary =
    profile?.role === "secretary" || profile?.role === "secretaria";

  useEffect(() => {
    if (!isAdmin && !isSecretary) {
      setLoading(false);
      return;
    }

    const unsub = onSnapshot(
      doc(db, "content", "restricted_edition"),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setDivision1(data.division1 || "");
          setDivision2(data.division2 || "");
          setDivision3(data.division3 || "");
        }
        setLoading(false);
      },
    );

    return () => unsub();
  }, [isAdmin, isSecretary]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage(null);
    try {
      await setDoc(
        doc(db, "content", "restricted_edition"),
        {
          division1,
          division2,
          division3,
          updatedAt: new Date(),
          updatedBy: user?.email,
        },
        { merge: true },
      );
      setSuccessMessage("Divisões salvas com sucesso!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (e: any) {
      console.error("Error saving restricted edition:", e);
      alert("Erro ao salvar: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 text-primary-base animate-spin" />
      </div>
    );
  }

  if (!isAdmin && !isSecretary) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-red-500 gap-4 bg-white rounded-[14px] border border-[#c8d8e8] shadow-sm">
        <ShieldAlert size={48} />
        <h2 className="text-xl font-bold">Acesso Negado</h2>
        <p className="text-gray-500">
          Você não tem permissão para acessar esta página.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[14px] border-[1.5px] border-[#c8d8e8] shadow-sm overflow-hidden min-h-[500px]">
      <div className="border-b border-[#e2eaf3] p-6 lg:p-8 flex items-center justify-between bg-gradient-to-r from-[#f0f6fb] to-white">
        <div>
          <h2 className="text-xl font-serif text-primary-dark font-black tracking-tight flex items-center gap-2">
            <Edit3 size={24} className="text-primary-base" />
            Divisões de Edição
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Área de edição restrita (Acesso apenas para Administradores e
            Secretários).
          </p>
        </div>
      </div>

      <div className="p-6 lg:p-8">
        <form onSubmit={handleSave} className="space-y-8 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="bg-[#fcfdfe] p-5 rounded-xl border border-gray-100 shadow-sm">
                <label className="text-sm font-bold text-primary-dark block mb-2 uppercase tracking-wide">
                  Divisão 1 - Título
                </label>
                <input
                  type="text"
                  value={division1}
                  onChange={(e) => setDivision1(e.target.value)}
                  placeholder="Conteúdo da primeira divisão"
                  className="w-full px-4 py-3 bg-white border border-[#c8d8e8] rounded-xl focus:outline-none focus:border-primary-base transition-colors text-gray-700"
                />
              </div>

              <div className="bg-[#fcfdfe] p-5 rounded-xl border border-gray-100 shadow-sm">
                <label className="text-sm font-bold text-primary-dark block mb-2 uppercase tracking-wide">
                  Divisão 2 - Descrição
                </label>
                <textarea
                  value={division2}
                  onChange={(e) => setDivision2(e.target.value)}
                  placeholder="Conteúdo da segunda divisão"
                  rows={4}
                  className="w-full px-4 py-3 bg-white border border-[#c8d8e8] rounded-xl focus:outline-none focus:border-primary-base transition-colors text-gray-700 resize-none"
                />
              </div>

              <div className="bg-[#fcfdfe] p-5 rounded-xl border border-gray-100 shadow-sm">
                <label className="text-sm font-bold text-primary-dark block mb-2 uppercase tracking-wide">
                  Divisão 3 - Detalhes
                </label>
                <textarea
                  value={division3}
                  onChange={(e) => setDivision3(e.target.value)}
                  placeholder="Conteúdo descritivo da terceira divisão"
                  rows={4}
                  className="w-full px-4 py-3 bg-white border border-[#c8d8e8] rounded-xl focus:outline-none focus:border-primary-base transition-colors text-gray-700 resize-none"
                />
              </div>
            </div>

            <div className="hidden md:flex flex-col justify-center items-center p-8 bg-gray-50 rounded-2xl border border-gray-100 text-center text-gray-400">
              <ShieldAlert size={64} className="mb-4 opacity-50" />
              <p className="text-sm font-medium">
                As alterações feitas aqui afetam seções críticas do sistema que
                requerem atenção de secretários ou administradores e necessitam
                manter a confidencialidade.
              </p>
            </div>
          </div>

          <div className="flex border-t border-gray-100 pt-6">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-primary-base text-white font-bold rounded-xl hover:bg-primary-dark transition shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Salvando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" /> Salvar Divisões
                </>
              )}
            </button>
            {successMessage && (
              <motion.span
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="ml-4 flex items-center text-green-600 font-bold"
              >
                {successMessage}
              </motion.span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
