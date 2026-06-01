import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Users,
  Calendar,
  MapPin,
  BookOpen,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Clock,
  Map as MapIcon,
  Star,
  Church,
  X,
  Edit2,
} from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { db, auth } from "../../lib/firebase";
import { useNavigate } from "react-router-dom";

interface Group {
  [key: string]: any;
  id: string;
  curso: string;
  status?: string;
  dataInicio: string;
  diaSemana: string;
  horario: string;
  local: string;
  estado: string;
  cidade: string;
  casais: any[];
  liderMaridoNome: string;
  liderMaridoCpf?: string;
  liderMaridoEmail?: string;
  liderMaridoTel?: string;
  liderEsposaNome?: string;
  liderEsposaCpf?: string;
  liderEsposaEmail?: string;
  liderEsposaTel?: string;
  liderCep?: string;
  liderEndereco?: string;
  liderNumero?: string;
  liderBairro?: string;
  liderCidade?: string;
  liderEstado?: string;
  igrejaNome?: string;
  pastorNome?: string;
  pastorTel?: string;
  treiMaridoNome?: string;
  treiMaridoEmail?: string;
  treiEsposaNome?: string;
  treiEsposaEmail?: string;
  createdAt: any;
}

interface GruposCadastradosProps {
  isEmbedded?: boolean;
}

export default function GruposCadastrados({ isEmbedded = false }: GruposCadastradosProps) {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [courseForms, setCourseForms] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "course_forms"), (snap) => {
      const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setCourseForms(list);
    }, (err) => {
      console.error("Erro ao carregar os formulários dos cursos:", err);
    });
    return () => unsub();
  }, []);

  const normalizeCourseTitle = (title: string): string => {
    const t = String(title || "").trim().toLowerCase();
    const legacyMap: Record<string, string> = {
      casados: "casados por deus",
      pais: "apascentando filhos",
      noivos: "antes do sim",
      marido: "marido de valor",
      mulher: "mulher que edifica",
      esposa: "esposa sábia",
    };
    return legacyMap[t] || t;
  };

  const getFieldLabel = (courseTitle: string, fieldId: string) => {
    const form = courseForms.find((f) => normalizeCourseTitle(f.id) === normalizeCourseTitle(courseTitle));
    if (form && Array.isArray(form.fields)) {
      const f = form.fields.find((field: any) => String(field.id).toLowerCase() === String(fieldId).toLowerCase());
      if (f && f.label) return f.label;
    }
    if (String(fieldId).toLowerCase().startsWith("field_")) return "resposta";
    return fieldId;
  };
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [activeTab, setActiveTab] = useState<"relatorios" | "cadastros">(
    "cadastros",
  );

  const fetchGroups = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, "groups"),
        where("liderId", "==", auth.currentUser.uid),
      );
      const querySnapshot = await getDocs(q);
      const groupsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Group[];
      groupsData.sort((a, b) => {
        const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return dateB - dateA;
      });
      setGroups(groupsData);
    } catch (error) {
      console.error("Erro ao buscar grupos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente excluir este grupo?")) return;
    try {
      await deleteDoc(doc(db, "groups", id));
      setGroups(groups.filter((g) => g.id !== id));
      alert("Grupo excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir grupo:", error);
      alert("Erro ao excluir grupo.");
    }
  };

  const filteredGroups = groups.filter((g) => {
    const term = searchTerm.toLowerCase();
    if (!term) return true;
    return (
      (g.curso || "").toLowerCase().includes(term) ||
      (g.cidade || "").toLowerCase().includes(term) ||
      (g.liderMaridoNome || "").toLowerCase().includes(term)
    );
  });

  const getCourseName = (id?: string) => {
    if (!id) return "Curso não informado";
    const courses: Record<string, string> = {
      casados: "Casados por Deus",
      pais: "Apascentando Filhos",
      noivos: "Antes do Sim",
      marido: "Marido de Valor",
      mulher: "Mulher que Edifica",
      esposa: "Esposa Sábia",
    };
    return courses[id] || id;
  };

  const totalCasais = groups.reduce(
    (acc, curr) => acc + (curr.casais?.length || 0),
    0,
  );

  let ultimoRegistro = "--/--/----";
  if (groups.length > 0) {
    const lastGroup = groups[0];
    if (lastGroup.createdAt?.toMillis) {
      ultimoRegistro = new Date(
        lastGroup.createdAt.toMillis(),
      ).toLocaleDateString("pt-BR");
    } else if (lastGroup.dataInicio) {
      // Fallback se não tiver createdAt
      ultimoRegistro = new Date(lastGroup.dataInicio).toLocaleDateString(
        "pt-BR",
        { timeZone: "UTC" },
      );
    }
  }

  const innerContent = (
    <div className="w-full relative">
      <section className="bg-[#f0f2f5] min-h-screen pb-10">
        <div className="max-w-[1200px] mx-auto px-4 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Relatórios Enviados */}
            <div className="bg-white rounded-xl shadow-sm border-l-4 border-l-[#2b5c87] border border-[#e5e7eb] flex items-center p-5 gap-4">
              <div className="w-12 h-12 bg-bg-main rounded-[10px] flex items-center justify-center text-[#2b5c87]">
                <BookOpen size={22} className="opacity-80" />
              </div>
              <div className="flex flex-col">
                <span className="text-[1.75rem] font-bold text-[#1a2f40] leading-none mb-1">
                  0
                </span>
                <span className="text-[0.7rem] font-bold text-gray-500 uppercase tracking-wider">
                  Relatórios Enviados
                </span>
              </div>
            </div>

            {/* Grupos Cadastrados */}
            <div className="bg-white rounded-xl shadow-sm border-l-4 border-l-[#21804f] border border-[#e5e7eb] flex items-center p-5 gap-4">
              <div className="w-12 h-12 bg-[#eaf6f0] rounded-[10px] flex items-center justify-center text-[#21804f]">
                <Users size={22} className="opacity-80" />
              </div>
              <div className="flex flex-col">
                <span className="text-[1.75rem] font-bold text-[#1a2f40] leading-none mb-1">
                  {groups.length}
                </span>
                <span className="text-[0.7rem] font-bold text-gray-500 uppercase tracking-wider">
                  Grupos Cadastrados
                </span>
              </div>
            </div>

            {/* Total de Casais */}
            <div className="bg-white rounded-xl shadow-sm border-l-4 border-l-[#e89b25] border border-[#e5e7eb] flex items-center p-5 gap-4">
              <div className="w-12 h-12 bg-[#fdf5e8] rounded-[10px] flex items-center justify-center text-[#e89b25]">
                <Star size={22} className="opacity-80" fill="currentColor" />
              </div>
              <div className="flex flex-col">
                <span className="text-[1.75rem] font-bold text-[#1a2f40] leading-none mb-1">
                  {totalCasais}
                </span>
                <span className="text-[0.7rem] font-bold text-gray-500 uppercase tracking-wider">
                  Total de Casais
                </span>
              </div>
            </div>

            {/* Último Registro */}
            <div className="bg-white rounded-xl shadow-sm border-l-4 border-l-[#714b9c] border border-[#e5e7eb] flex items-center p-5 gap-4">
              <div className="w-12 h-12 bg-[#f3eef8] rounded-[10px] flex items-center justify-center text-[#714b9c]">
                <Calendar size={22} className="opacity-80" />
              </div>
              <div className="flex flex-col">
                <span className="text-[1.45rem] font-bold text-[#1a2f40] leading-none mb-1">
                  {ultimoRegistro}
                </span>
                <span className="text-[0.7rem] font-bold text-gray-500 uppercase tracking-wider">
                  Último Registro
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 bg-white rounded-[10px] p-1.5 w-max mb-6 shadow-sm border border-[#e5e7eb]">
            <button
              onClick={() => setActiveTab("relatorios")}
              className={`px-6 py-2 rounded-[8px] text-[0.85rem] font-bold transition-colors ${activeTab === "relatorios" ? "bg-[#2b5c87] text-white shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
            >
              Relatórios
            </button>
            <button
              onClick={() => setActiveTab("cadastros")}
              className={`flex items-center gap-2 px-6 py-2 rounded-[8px] text-[0.85rem] font-bold transition-colors ${activeTab === "cadastros" ? "bg-[#2b5c87] text-white shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
            >
              <Users size={16} /> Cadastros de Grupos
            </button>
          </div>

          {/* Main Content Area */}
          {activeTab === "cadastros" && (
            <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-sm overflow-hidden">
              <div className="px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-[#f0f0f0]">
                <div className="flex items-center gap-2 text-[#1a2f40] font-bold text-[1rem]">
                  <Users size={18} className="text-[#2b5c87]" />
                  Turmas Criadas
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="text"
                    placeholder="Buscar por líder ou cidade..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-3 py-1.5 bg-white border border-[#d1d5db] rounded-[6px] text-[0.85rem] focus:outline-none focus:border-[#2b5c87] min-w-[220px]"
                  />
                  <div className="relative">
                    <Calendar
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      placeholder="dd/mm/aaaa"
                      className="px-3 py-1.5 pl-8 bg-white border border-[#d1d5db] rounded-[6px] text-[0.85rem] focus:outline-none focus:border-[#2b5c87] w-[130px]"
                    />
                  </div>
                  <select className="px-3 py-1.5 bg-white border border-[#d1d5db] rounded-[6px] text-[0.85rem] focus:outline-none focus:border-[#2b5c87]">
                    <option>Todos os tipos</option>
                  </select>
                  <button
                    onClick={() => {
                      setSearchTerm("");
                    }}
                    className="flex items-center gap-1.5 px-4 py-1.5 border border-[#d1d5db] rounded-[6px] text-[0.85rem] font-semibold text-gray-600 hover:bg-gray-50 transition-all"
                  >
                    <X size={14} /> Limpar
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-10 h-10 border-4 border-gray-200 border-t-[#2b5c87] rounded-full animate-spin"></div>
                  <p className="text-gray-400 font-medium text-[0.9rem]">
                    Carregando grupos...
                  </p>
                </div>
              ) : filteredGroups.length === 0 ? (
                <div className="p-20 text-center">
                  <p className="text-gray-400 italic text-[0.95rem]">
                    Nenhum grupo encontrado.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="px-6 py-2 bg-[#fcfcfc] text-right text-[0.75rem] text-gray-500 border-b border-[#f0f0f0]">
                    Página 1 de 1, mostrando {filteredGroups.length} registros
                    do total de {filteredGroups.length}
                  </div>

                  <div className="overflow-x-auto text-[0.85rem]">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-[#f8f9fa]">
                          <th className="px-6 py-4 text-[0.72rem] font-bold text-[#4a5568] uppercase tracking-wider text-left border-b border-[#f0f0f0]">
                            Ministério{" "}
                            <span className="ml-1 opacity-40">&#9662;</span>
                          </th>
                          <th className="px-6 py-4 text-[0.72rem] font-bold text-[#4a5568] uppercase tracking-wider text-left border-b border-[#f0f0f0]">
                            Líder{" "}
                            <span className="ml-1 opacity-40">&#9662;</span>
                          </th>
                          <th className="px-6 py-4 text-[0.72rem] font-bold text-[#4a5568] uppercase tracking-wider text-center border-b border-[#f0f0f0]">
                            Casais{" "}
                            <span className="ml-1 opacity-40">&#9662;</span>
                          </th>
                          <th className="px-6 py-4 text-[0.72rem] font-bold text-[#4a5568] uppercase tracking-wider text-left border-b border-[#f0f0f0]">
                            Enviado Em{" "}
                            <span className="ml-1 opacity-40">&#9662;</span>
                          </th>
                          <th className="px-6 py-4 text-[0.72rem] font-bold text-[#4a5568] uppercase tracking-wider text-center border-b border-[#f0f0f0]">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredGroups.map((group) => {
                          const liders = [
                            group.liderMaridoNome,
                            group.liderEsposaNome,
                          ]
                            .filter(Boolean)
                            .join(" & ");
                          return (
                            <tr
                              key={group.id}
                              className="border-b border-[#f0f0f0] hover:bg-[#f8fafc] transition-colors"
                            >
                              <td className="px-6 py-4 text-[#1a2f40] font-bold whitespace-nowrap">
                                {getCourseName(group.curso)}
                              </td>
                              <td className="px-6 py-4 text-[#4a5568]">
                                {liders || "N/A"} <br />
                                <span className="text-gray-400 text-xs font-normal">
                                  {group.cidade}/{group.estado}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-[#1a2f40] font-bold text-center">
                                {group.casais?.length || 0}
                              </td>
                              <td className="px-6 py-4 text-[#718096]">
                                {group.createdAt?.toMillis
                                  ? new Date(
                                      group.createdAt.toMillis(),
                                    ).toLocaleDateString("pt-BR")
                                  : "--/--/----"}
                              </td>
                              <td className="px-6 py-4 text-center">
                                <div className="flex flex-wrap items-center justify-center gap-2">
                                  <button
                                    onClick={() => setSelectedGroup(group)}
                                    className="w-8 h-8 flex items-center justify-center rounded-[6px] border border-[#d1d5db] bg-white text-[#2b5c87] hover:bg-[#ebf4fb] hover:border-[#2b5c87] transition-all"
                                    title="Visualizar"
                                  >
                                    <Eye size={14} />
                                  </button>
                                  <button
                                    onClick={() =>
                                      navigate("/dashboard/cadastrar-turma", {
                                        state: { editData: group },
                                      })
                                    }
                                    className="w-8 h-8 flex items-center justify-center rounded-[6px] border border-[#d1d5db] bg-white text-[#e89b25] hover:bg-[#fdf5e8] hover:border-[#e89b25] transition-all"
                                    title="Editar"
                                  >
                                    <Edit2 size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(group.id)}
                                    className="w-8 h-8 flex items-center justify-center rounded-[6px] border border-[#d1d5db] bg-white text-[#e53e3e] hover:bg-[#fef2f2] hover:border-[#e53e3e] transition-all"
                                    title="Excluir"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Footer */}
                  <div className="px-6 py-4 flex justify-end items-center gap-1.5 bg-white rounded-b-xl border-t border-[#f0f0f0]">
                    <button className="w-8 h-8 flex items-center justify-center bg-white border border-[#d1d5db] rounded-[6px] text-gray-400 opacity-60 cursor-not-allowed">
                      <ChevronLeft size={14} />
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center bg-[#2b5c87] text-white rounded-[6px] font-semibold text-[0.85rem] shadow-sm">
                      1
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center bg-white border border-[#d1d5db] rounded-[6px] text-gray-600 hover:bg-gray-50 transition-colors">
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "relatorios" && (
            <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-sm overflow-hidden p-20 text-center">
              <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
              <h2 className="text-[1.2rem] font-bold text-gray-600 mb-2">
                Nenhum relatório
              </h2>
              <p className="text-gray-400 text-[0.95rem]">
                Ainda não há relatórios gerados ou enviados.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Detalhes Modal */}
      <AnimatePresence>
        {selectedGroup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 print:p-0 print:absolute print:inset-0 print:bg-white">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedGroup(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm print:hidden"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-6xl max-h-[90vh] print:max-h-none overflow-y-auto print:overflow-visible shadow-2xl print:shadow-none px-8 py-10 print:p-0"
              style={{ fontFamily: "Arial, sans-serif" }}
            >
              <div className="flex justify-end mb-4 print:hidden">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1 bg-[#f5f5f5] hover:bg-[#e0e0e0] border border-[#ccc] rounded text-text-main text-[0.8rem] transition-colors shadow-sm"
                >
                  Imprimir <span className="text-[10px]">🖨️</span>
                </button>
              </div>
              <button
                onClick={() => setSelectedGroup(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center print:hidden"
              >
                <X size={20} />
              </button>

              <div className="w-full text-text-main text-[0.75rem] leading-none mb-10 overflow-x-auto">
                <div className="min-w-[800px]">
                  {/* Top Header */}
                  <h2 className="text-[1.15rem] font-bold font-serif text-primary-dark m-0 mb-4 pb-2.5 border-b-2 border-[#e2eaf3] flex items-center gap-2 mt-4">
                    Dados do Grupo
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-0 border-[1.5px] border-[#c8d8e8] rounded-[10px] overflow-hidden mb-5">
                    <div className="px-4 py-3.5 bg-[#f7fafd] border-b sm:border-b-0 sm:border-r border-[#e2eaf3]">
                      <div className="text-[0.76rem] font-bold text-primary-base uppercase tracking-[0.5px] mb-1">
                        Estado
                      </div>
                      <div className="text-[0.96rem] font-semibold text-primary-dark">
                        {selectedGroup.estado || "—"}
                      </div>
                    </div>
                    <div className="px-4 py-3.5 bg-white border-b sm:border-b-0 sm:border-r border-[#e2eaf3]">
                      <div className="text-[0.76rem] font-bold text-primary-base uppercase tracking-[0.5px] mb-1">
                        Cidade
                      </div>
                      <div className="text-[0.96rem] font-semibold text-primary-dark">
                        {selectedGroup.cidade || "—"}
                      </div>
                    </div>
                    <div className="px-4 py-3.5 bg-white border-b sm:border-b-0 sm:border-r border-[#e2eaf3]">
                      <div className="text-[0.76rem] font-bold text-primary-base uppercase tracking-[0.5px] mb-1">
                        Data de Início
                      </div>
                      <div className="text-[0.96rem] font-semibold text-primary-dark">
                        {selectedGroup.dataInicio
                          ? new Date(
                              selectedGroup.dataInicio,
                            ).toLocaleDateString("pt-BR", { timeZone: "UTC" })
                          : "—"}
                      </div>
                    </div>
                    <div className="px-4 py-3.5 bg-[#f7fafd]">
                      <div className="text-[0.76rem] font-bold text-primary-base uppercase tracking-[0.5px] mb-1">
                        Status
                      </div>
                      <div className="text-[0.96rem] font-semibold text-primary-dark capitalize">
                        {selectedGroup.status === "finalizado"
                          ? "Finalizado"
                          : "Em Andamento"}
                      </div>
                    </div>
                  </div>

                  {/* Líderes Section */}
                  <div className="bg-primary-base text-white text-center font-bold font-serif tracking-wide py-1.5 border-b border-primary-dark">
                    Líderes do Grupo
                  </div>

                  <div className="border-b border-[#eee] py-2">
                    <div className="grid grid-cols-4 gap-2 py-1">
                      <div>
                        <span className="font-bold">Nome (Marido):</span>{" "}
                        {selectedGroup.liderMaridoNome || ""}
                      </div>
                      <div>
                        <span className="font-bold">CPF:</span>{" "}
                        {selectedGroup.liderMaridoCpf || ""}
                      </div>
                      <div>
                        <span className="font-bold">Email:</span>{" "}
                        {selectedGroup.liderMaridoEmail
                          ? String(selectedGroup.liderMaridoEmail).toUpperCase()
                          : ""}
                      </div>
                      <div>
                        <span className="font-bold">Telefone:</span>{" "}
                        {selectedGroup.liderMaridoTel || ""}
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 py-1 border-t border-[#f5f5f5]">
                      <div>
                        <span className="font-bold">Nome (Esposa):</span>{" "}
                        {selectedGroup.liderEsposaNome || ""}
                      </div>
                      <div>
                        <span className="font-bold">CPF:</span>{" "}
                        {selectedGroup.liderEsposaCpf || ""}
                      </div>
                      <div>
                        <span className="font-bold">Email:</span>{" "}
                        {selectedGroup.liderEsposaEmail
                          ? String(selectedGroup.liderEsposaEmail).toUpperCase()
                          : ""}
                      </div>
                      <div>
                        <span className="font-bold">Telefone:</span>{" "}
                        {selectedGroup.liderEsposaTel || ""}
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 py-1 border-t border-[#f5f5f5]">
                      <div className="col-span-2">
                        <span className="font-bold">Endereço:</span>{" "}
                        {selectedGroup.liderEndereco || ""}
                      </div>
                      <div>
                        <span className="font-bold">Bairro:</span>{" "}
                        {selectedGroup.liderBairro || ""}
                      </div>
                      <div>
                        <span className="font-bold">Número:</span>{" "}
                        {selectedGroup.liderNumero || ""}{" "}
                        <span className="font-bold ml-2">Complemento:</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 py-1 border-t border-[#f5f5f5]">
                      <div>
                        <span className="font-bold">Cidade:</span>{" "}
                        {selectedGroup.liderCidade || ""}{" "}
                        <span className="font-bold ml-2">Estado:</span>{" "}
                        {selectedGroup.liderEstado || ""}
                      </div>
                      <div>
                        <span className="font-bold">CEP:</span>{" "}
                        {selectedGroup.liderCep || ""}
                      </div>
                      <div>
                        <span className="font-bold">Tel:</span>{" "}
                      </div>
                      <div>
                        <span className="font-bold">Cel:</span>{" "}
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 py-1 border-t border-[#f5f5f5]">
                      <div className="col-span-2">
                        <span className="font-bold">
                          Igreja a que pertence:
                        </span>{" "}
                        {selectedGroup.igrejaNome || ""}
                      </div>
                      <div>
                        <span className="font-bold">Pastor Titular:</span>{" "}
                        {selectedGroup.pastorNome || ""}
                      </div>
                      <div>
                        <span className="font-bold">Telefone:</span>{" "}
                        {selectedGroup.pastorTel || ""}
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 py-1 border-t border-[#f5f5f5]">
                      <div>
                        <span className="font-bold">
                          Endereço da Igreja:
                        </span>{" "}
                      </div>
                      <div>
                        <span className="font-bold">Cidade:</span>{" "}
                        <span className="font-bold ml-2">Estado:</span>{" "}
                      </div>
                      <div>
                        <span className="font-bold">CEP:</span>{" "}
                      </div>
                      <div></div>
                    </div>
                  </div>

                  {/* Líderes em Treinamento (Optional addition so they are not lost) */}
                  {(selectedGroup.treiMaridoNome ||
                    selectedGroup.treiEsposaNome) && (
                    <>
                      <div className="bg-primary-base text-white text-center font-bold font-serif tracking-wide py-1.5 border-b border-primary-dark">
                        Líderes em Treinamento
                      </div>
                      <div className="border-b border-[#eee] py-2">
                        <div className="grid grid-cols-4 gap-2 py-1">
                          <div>
                            <span className="font-bold">Nome (Marido):</span>{" "}
                            {selectedGroup.treiMaridoNome || ""}
                          </div>
                          <div>
                            <span className="font-bold">CPF:</span>{" "}
                            {selectedGroup.treiMaridoCpf || ""}
                          </div>
                          <div>
                            <span className="font-bold">Email:</span>{" "}
                            {selectedGroup.treiMaridoEmail
                              ? String(
                                  selectedGroup.treiMaridoEmail,
                                ).toUpperCase()
                              : ""}
                          </div>
                          <div>
                            <span className="font-bold">Telefone:</span>{" "}
                            {selectedGroup.treiMaridoTel || ""}
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-2 py-1 border-t border-[#f5f5f5]">
                          <div>
                            <span className="font-bold">Nome (Esposa):</span>{" "}
                            {selectedGroup.treiEsposaNome || ""}
                          </div>
                          <div>
                            <span className="font-bold">CPF:</span>{" "}
                            {selectedGroup.treiEsposaCpf || ""}
                          </div>
                          <div>
                            <span className="font-bold">Email:</span>{" "}
                            {selectedGroup.treiEsposaEmail
                              ? String(
                                  selectedGroup.treiEsposaEmail,
                                ).toUpperCase()
                              : ""}
                          </div>
                          <div>
                            <span className="font-bold">Telefone:</span>{" "}
                            {selectedGroup.treiEsposaTel || ""}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Membros do Grupo Header */}
                  <div className="bg-primary-base text-white text-center font-bold font-serif tracking-wide py-1.5 border-b border-primary-dark">
                    Membros do Grupo
                  </div>

                  {/* Looop over casais */}
                  {selectedGroup.casais?.length ? (
                    selectedGroup.casais.map((casal: any, idx: number) => (
                      <div key={idx}>
                        <div className="bg-primary-bg text-primary-dark text-center font-bold font-serif py-1.5 text-[0.7rem] border-y border-[#c8d8e8]">
                          Casal {idx + 1}
                        </div>
                        <div className="py-2 border-b border-[#eee]">
                          <div className="grid grid-cols-4 gap-2 py-1">
                            <div className="col-span-4">
                              <span className="font-bold">Nome (Marido):</span>{" "}
                              {casal.maridoNome || ""}
                            </div>
                          </div>
                          <div className="grid grid-cols-4 gap-2 py-1 border-t border-[#f5f5f5]">
                            <div className="col-span-4">
                              <span className="font-bold">Nome (Esposa):</span>{" "}
                              {casal.esposaNome || ""}
                            </div>
                          </div>
                          <div className="grid grid-cols-4 gap-2 py-1 border-t border-[#f5f5f5]">
                            <div className="col-span-2">
                              <span className="font-bold">Endereço:</span>{" "}
                              {casal.endereco || ""}
                            </div>
                            <div>
                              <span className="font-bold">Bairro:</span>{" "}
                              {casal.bairro || ""}
                            </div>
                            <div>
                              <span className="font-bold">Número:</span>{" "}
                              {casal.numero || ""}{" "}
                              <span className="font-bold ml-2">
                                Complemento:
                              </span>{" "}
                              {casal.complemento || ""}
                            </div>
                          </div>
                          <div className="grid grid-cols-4 gap-2 py-1 border-t border-[#f5f5f5]">
                            <div>
                              <span className="font-bold">Cidade:</span>{" "}
                              {casal.cidade || ""}{" "}
                              <span className="font-bold ml-2">Estado:</span>{" "}
                              {casal.estado || ""}
                            </div>
                            <div>
                              <span className="font-bold">CEP:</span>{" "}
                              {casal.cep || ""}
                            </div>
                            <div>
                              <span className="font-bold">Tel:</span>{" "}
                              {casal.telefone || ""}
                            </div>
                            <div>
                              <span className="font-bold">Cel:</span>{" "}
                              {casal.celular || ""}
                            </div>
                          </div>

                          {/* Dados Adicionais da Inscrição/Ficha de Matrícula */}
                          {casal.formData && Object.keys(casal.formData).length > 0 && (
                            <div className="mt-4 pt-3.5 border-t border-dashed border-[#e2eaf3]">
                              <span className="text-[10px] font-black uppercase tracking-wider text-[#1a6496] bg-[#f0f6fa] px-2.5 py-1 rounded-md block w-fit mb-2.5">
                                Formulário de Matrícula Completo ({Object.keys(casal.formData).filter(key => casal.formData[key] !== "").length} respostas)
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                                {Object.entries(casal.formData)
                                  .filter(([_, value]) => value !== undefined && value !== null && value !== "")
                                  .map(([key, value]: [string, any]) => (
                                    <div key={key} className="p-2.5 bg-gray-50 border border-gray-100 rounded-xl flex flex-col justify-between">
                                      <span className="text-[9.5px] font-black uppercase tracking-wider text-[#1a6496] block mb-1 truncate" title={key}>
                                        {selectedGroup ? getFieldLabel(selectedGroup.curso, key) : key}
                                      </span>
                                      <span className="text-xs font-bold text-primary-dark break-words">
                                        {value === true ? "Sim" : value === false ? "Não" : String(value)}
                                      </span>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-4 text-center text-gray-500 italic border-b border-[#eee]">
                      Nenhum membro cadastrado.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .form-input {
          width: 100%;
          padding: 0.875rem 1.25rem;
          border-radius: 1.25rem;
          background-color: #fcfaf7;
          border: 1.5px solid #eee8df;
          font-size: 0.9375rem;
          transition: all 0.3s ease;
          appearance: none;
        }
        .form-input:focus {
          outline: none;
          border-color: #4a3f35;
          box-shadow: 0 0 0 4px rgba(74, 63, 53, 0.05);
          background-color: #fff;
        }
        select.form-input {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%234a3f35' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 1rem center;
          background-size: 1.2em;
          padding-right: 3rem;
        }
      `}</style>
    </div>
  );

  return isEmbedded ? innerContent : <DashboardLayout>{innerContent}</DashboardLayout>;
}
