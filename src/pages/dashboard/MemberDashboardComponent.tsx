import React, { useState, useEffect } from "react";
import { useFirebase } from "../../context/FirebaseContext";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { motion } from "framer-motion";
import {
  Bell,
  Calendar,
  Database,
  Edit3,
  Navigation,
  Users,
  Building,
  HelpCircle,
  Video,
  LayoutDashboard,
  Baby,
  BookOpen,
} from "lucide-react";

export default function MemberDashboardComponent() {
  const { user } = useFirebase();
  const [annotation, setAnnotation] = useState("");
  const [isEditingAnnotation, setIsEditingAnnotation] = useState(false);
  const [savedAnnotation, setSavedAnnotation] = useState("");

  useEffect(() => {
    if (user) {
      const unsub = onSnapshot(doc(db, "member_notes", user.uid), (docSnap) => {
        if (docSnap.exists()) {
          setSavedAnnotation(docSnap.data().text || "");
          setAnnotation(docSnap.data().text || "");
        }
      });
      return () => unsub();
    }
  }, [user]);

  const handleSaveAnnotation = async () => {
    if (user) {
      await setDoc(doc(db, "member_notes", user.uid), { text: annotation });
      setIsEditingAnnotation(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-6">
      {/* Banner */}
      <div className="w-full h-[120px] bg-gradient-to-r from-blue-500 to-primary-base rounded-[14px] overflow-hidden relative shadow-sm">
        <div className="absolute inset-0 flex items-center justify-center text-white text-3xl font-black italic tracking-wider">
          ANÚNCIO OU BANNER DA IGREJA
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Mural de avisos */}
        <div className="bg-white rounded-[14px] border border-[#c8d8e8] overflow-hidden shadow-sm flex flex-col items-center justify-center p-6 min-h-[300px]">
          <div className="w-full flex justify-between items-center border-b border-[#e2eaf3] pb-4 mb-auto pt-2 px-2">
            <h3 className="font-bold text-primary-dark">Mural de avisos</h3>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-70 my-8">
            <Database size={48} className="mb-4 text-[#455a64]" />
            <h4 className="text-lg font-black text-[#455a64]">
              Não há dados disponíveis
            </h4>
          </div>
        </div>

        {/* Calendário */}
        <div className="bg-white rounded-[14px] border border-[#c8d8e8] overflow-hidden shadow-sm flex flex-col items-center justify-center p-6 min-h-[300px]">
          <div className="w-full flex justify-between items-center border-b border-[#e2eaf3] pb-4 mb-auto pt-2 px-2">
            <h3 className="font-bold text-primary-dark">Calendário</h3>
            <button className="px-3 py-1 bg-primary-dark text-white text-xs font-bold rounded-full">
              Ver mais
            </button>
          </div>

          <div className="flex-1 w-full flex flex-col items-center justify-center bg-[#f7fafd] border border-[#e2eaf3] mt-4 p-4 text-center">
            <p className="text-gray-500 font-medium text-sm">
              Nenhum resultado encontrado.
            </p>
          </div>
        </div>

        {/* Minhas anotações */}
        <div className="bg-white rounded-[14px] border border-[#c8d8e8] overflow-hidden shadow-sm flex flex-col items-center justify-center p-6 min-h-[300px]">
          <div className="w-full flex justify-between items-center border-b border-[#e2eaf3] pb-4 mb-auto pt-2 px-2">
            <h3 className="font-bold text-primary-dark">Minhas anotações</h3>
            <button className="px-3 py-1 bg-primary-dark text-white text-xs font-bold rounded-full">
              Ver mais
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center text-center w-full mt-4">
            {!isEditingAnnotation && !savedAnnotation ? (
              <>
                <Database size={48} className="mb-4 text-[#455a64]" />
                <h4 className="text-lg font-black text-[#455a64] mb-4">
                  Não há dados disponíveis
                </h4>
                <button
                  onClick={() => setIsEditingAnnotation(true)}
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-full text-sm transition-all shadow-sm"
                >
                  + Criar anotação
                </button>
              </>
            ) : isEditingAnnotation ? (
              <div className="w-full h-full flex flex-col gap-2">
                <textarea
                  value={annotation}
                  onChange={(e) => setAnnotation(e.target.value)}
                  className="flex-1 w-full resize-none border border-[#c8d8e8] rounded-xl p-3 text-sm focus:outline-none focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10"
                  placeholder="Sua anotação secreta..."
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => {
                      setIsEditingAnnotation(false);
                      setAnnotation(savedAnnotation);
                    }}
                    className="px-3 py-1 font-bold text-gray-500 hover:bg-gray-100 rounded-md text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveAnnotation}
                    className="px-3 py-1 font-bold text-white bg-primary-base hover:bg-primary-dark rounded-md text-sm shadow-sm"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-start text-left gap-4">
                <div className="flex-1 w-full bg-[#fcfdfe] p-3 rounded-lg border border-gray-100 text-sm text-gray-600 whitespace-pre-wrap overflow-y-auto">
                  {savedAnnotation}
                </div>
                <button
                  onClick={() => setIsEditingAnnotation(true)}
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-full text-sm transition-all shadow-sm self-center"
                >
                  Editar anotação
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
