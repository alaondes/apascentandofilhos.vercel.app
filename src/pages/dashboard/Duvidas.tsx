import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { useFirebase } from "../../context/FirebaseContext";
import { db } from "../../lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  addDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import {
  Send,
  MessageSquare,
  AlertCircle,
  Edit2,
  Trash2,
  X,
  Check,
} from "lucide-react";

interface DuvidasProps {
  isEmbedded?: boolean;
}

export default function Duvidas({ isEmbedded = false }: DuvidasProps) {
  const { user, profile } = useFirebase();
  const [questions, setQuestions] = useState<any[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const handleEdit = (ticket: any) => {
    setEditingId(ticket.id);
    setEditContent(ticket.question);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editContent.trim()) return;
    try {
      await updateDoc(doc(db, "support_tickets", id), {
        question: editContent.trim(),
      });
      setEditingId(null);
      setEditContent("");
    } catch (error) {
      console.error("Erro ao editar dúvida:", error);
      alert("Erro ao editar.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Deseja realmente excluir esta dúvida?")) return;
    try {
      await deleteDoc(doc(db, "support_tickets", id));
    } catch (error) {
      console.error("Erro ao excluir dúvida:", error);
      alert("Erro ao excluir.");
    }
  };

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    const q = query(
      collection(db, "support_tickets"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setQuestions(data);
        setLoading(false);

        // Auto mark answers as read for the user
        const unreadAnwers = data.filter(
          (d: any) => d.status === "answered" && d.userRead === false,
        );
        if (unreadAnwers.length > 0) {
          unreadAnwers.forEach((ticket: any) => {
            updateDoc(doc(db, "support_tickets", ticket.id), {
              userRead: true,
            }).catch(console.error);
          });
        }
      },
      (error) => {
        console.error("Erro ao escutar dúvidas:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !user) return;

    try {
      await addDoc(collection(db, "support_tickets"), {
        userId: user.uid,
        userName: profile?.nome || "Usuário",
        userEmail: user.email,
        question: newQuestion.trim(),
        answer: "",
        status: "pending",
        userRead: true, // It's their own question
        createdAt: serverTimestamp(),
      });
      setNewQuestion("");
    } catch (error) {
      console.error("Erro ao enviar dúvida:", error);
      alert("Houve um erro ao enviar sua dúvida. Tente novamente.");
    }
  };

  const innerContent = (
    <div className="w-full">
      <div className="p-4 sm:p-8 max-w-5xl mx-auto w-full">
        <h1 className="text-2xl font-bold text-[#1e3a5f] mb-6 flex items-center gap-2">
          <MessageSquare size={24} className="text-[#2b5c87]" />
          Dúvidas e Respostas
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 border border-[#c8d8e8] bg-white rounded-xl shadow-sm p-6 self-start shadow-sm flex flex-col gap-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <AlertCircle size={20} className="text-[#2b5c87]" />
              Nova Dúvida
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-2">
              Tem alguma dúvida sobre o sistema ou sobre os processos? Envie sua
              pergunta diretamente para os administradores.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <textarea
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Escreva sua dúvida aqui..."
                required
                className="w-full border border-[#c8d8e8] bg-[#f7fafd] rounded-lg px-4 py-3 min-h-[120px] text-sm focus:outline-none focus:border-[#2b5c87] focus:ring-2 focus:ring-[#2b5c87]/20 transition-all resize-none"
              />
              <button
                type="submit"
                disabled={!newQuestion.trim()}
                className="bg-primary-dark text-white px-4 py-2.5 rounded-lg text-sm font-bold shadow-md hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full"
              >
                <Send size={16} /> Enviar Pergunta
              </button>
            </form>
          </div>

          <div className="md:col-span-2 flex flex-col gap-4">
            <h2 className="text-lg font-bold text-gray-800">
              Histórico de Dúvidas
            </h2>
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                Carregando...
              </div>
            ) : questions.length === 0 ? (
              <div className="bg-white border border-[#c8d8e8] rounded-xl p-8 text-center text-gray-500">
                <MessageSquare
                  size={40}
                  className="mx-auto text-gray-400 mb-3 opacity-50"
                />
                <p>Nenhuma dúvida enviada ainda.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {questions.map((q) => (
                  <div
                    key={q.id}
                    className="bg-white border border-[#c8d8e8] rounded-xl overflow-hidden shadow-sm"
                  >
                    <div className="p-4 bg-[#f8fafc] border-b border-[#e2eaf3] flex justify-between items-start gap-4">
                      <div className="flex-1 w-full">
                        <div className="flex items-center justify-between gap-4 mb-1">
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block">
                            Sua Pergunta
                          </span>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider whitespace-nowrap shrink-0 ${
                                q.status === "answered"
                                  ? "bg-green-100/50 text-green-700 border-green-200"
                                  : "bg-orange-100/50 text-orange-700 border-orange-200"
                              }`}
                            >
                              {q.status === "answered"
                                ? "Respondido"
                                : "Pendente"}
                            </span>
                            <button
                              onClick={() => handleEdit(q)}
                              className="p-1 text-gray-400 hover:text-primary-base hover:bg-primary-bg rounded-md transition-colors"
                              title="Editar Pergunta"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(q.id)}
                              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              title="Excluir Pergunta"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        {editingId === q.id ? (
                          <div className="flex flex-col gap-2 mt-2 w-full">
                            <textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="w-full border border-[#c8d8e8] bg-white rounded-lg px-3 py-2 min-h-[80px] text-sm focus:outline-none focus:border-[#2b5c87] focus:ring-2 focus:ring-[#2b5c87]/20 transition-all resize-none"
                            />
                            <div className="flex items-center gap-2 justify-end">
                              <button
                                onClick={() => setEditingId(null)}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                              >
                                <X size={12} /> Cancelar
                              </button>
                              <button
                                onClick={() => handleSaveEdit(q.id)}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-primary-dark rounded hover:bg-primary-dark transition-colors"
                              >
                                <Check size={12} /> Salvar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-[#1e3a5f] font-medium text-sm leading-relaxed break-all">
                            {q.question}
                          </p>
                        )}
                      </div>
                    </div>
                    {q.status === "answered" && q.answer && (
                      <div className="p-4 flex gap-3 items-start bg-green-50/30">
                        <MessageSquare
                          size={16}
                          className="text-green-600 mt-0.5 shrink-0"
                        />
                        <div>
                          <span className="text-xs font-bold text-green-700 uppercase tracking-widest block mb-1">
                            Resposta do Administrador
                          </span>
                          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-all">
                            {q.answer}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return isEmbedded ? innerContent : <DashboardLayout>{innerContent}</DashboardLayout>;
}
