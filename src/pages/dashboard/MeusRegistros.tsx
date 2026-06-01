import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FileText,
  Download,
  Eye,
  Clock,
  ShieldCheck,
  Search,
  Filter,
  X,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Calendar,
  Users,
  CheckCircle2,
  Edit2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  deleteDoc,
  doc,
} from "firebase/firestore";
import {
  db,
  auth,
  handleFirestoreError,
  OperationType,
} from "../../lib/firebase";

interface Report {
  [key: string]: any;
  id: string;
  dataReuniao: string;
  licao: string[];
  createdAt: any;
  status?: string;
  casaisReport?: any[];
  valorOferta?: string;
  observacoesGerais?: string;
  horarioInicio?: string;
  horarioTermino?: string;
  groupId: string;
}

interface MeusRegistrosProps {
  isEmbedded?: boolean;
}

export default function MeusRegistros({ isEmbedded = false }: MeusRegistrosProps) {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const fetchReports = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    const path = "reports";
    try {
      const q = query(
        collection(db, path),
        where("liderId", "==", auth.currentUser.uid),
      );
      const snap = await getDocs(q);
      const reportsData = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Report[];

      // Sort by createdAt desc in JavaScript to avoid Firestore index requirement
      reportsData.sort((a, b) => {
        const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return dateB - dateA;
      });

      setReports(reportsData);

      // Fetch user's groups to match group names
      const groupsQuery = query(
        collection(db, "groups"),
        where("liderId", "==", auth.currentUser.uid),
      );
      const groupsSnap = await getDocs(groupsQuery);
      setGroups(groupsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente excluir este relatório?")) return;
    const path = "reports";
    try {
      await deleteDoc(doc(db, path, id));
      setReports(reports.filter((r) => r.id !== id));
      alert("Relatório excluído com sucesso!");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${path}/${id}`);
    }
  };

  const filteredReports = reports.filter((r) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      (r.id && r.id.toLowerCase().includes(term)) ||
      (r.licao && r.licao.some((l) => l && l.toLowerCase().includes(term)));
    const matchesDate = !dateFilter || r.dataReuniao === dateFilter;
    const matchesType =
      !typeFilter ||
      typeFilter === "Todos os tipos" ||
      "Relatório Semanal".toLowerCase().includes(typeFilter.toLowerCase());
    return matchesSearch && matchesDate && matchesType;
  });

  const innerContent = (
    <div className="w-full">
      <section className="bg-gradient-to-br from-primary-base to-primary-light pt-10 pb-8 text-center text-white">
        <h1 className="text-[2rem] font-black font-serif tracking-wide mb-2 flex items-center justify-center gap-3">
          <FileText size={28} /> Meus Registros
        </h1>
        <p className="text-[1rem] opacity-90">
          Histórico completo de relatórios e cadastros do seu grupo
        </p>
      </section>

      <section className="max-w-[1100px] mx-auto px-5 py-9 overflow-x-hidden">
        {/* Header Table / Filters - Matching Image */}
        <div className="bg-white rounded-t-[14px] border-x border-t border-[#eee8df] shadow-[0_4px_20px_rgba(0,0,0,0.08)] px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 border-b-2 border-b-[#e2eaf3]">
          <div className="flex items-center gap-2 text-primary-dark font-serif font-bold text-[1.05rem]">
            <FileText size={20} className="text-primary-base" />
            Relatórios
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <input
              type="text"
              placeholder="Buscar por lição ou ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1.5 bg-[#f7fafd] border-[1.5px] border-[#c8d8e8] rounded-md text-[0.85rem] focus:outline-none focus:border-primary-base min-w-[200px]"
            />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-1.5 bg-[#f7fafd] border-[1.5px] border-[#c8d8e8] rounded-md text-[0.85rem] focus:outline-none focus:border-primary-base"
            />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 bg-[#f7fafd] border-[1.5px] border-[#c8d8e8] rounded-md text-[0.85rem] focus:outline-none focus:border-primary-base"
            >
              <option>Todos os tipos</option>
              <option>Relatório Semanal</option>
              <option>Matrícula de Grupo</option>
            </select>
            <button
              onClick={() => {
                setSearchTerm("");
                setDateFilter("");
                setTypeFilter("");
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 border-[1.5px] border-[#c8d8e8] rounded-md text-[0.85rem] font-semibold text-[#667] hover:bg-bg-main transition-all"
            >
              <X size={14} /> Limpar
            </button>
          </div>
        </div>

        {loading ? (
          <div className="bg-white border-x border-b border-[#eee8df] p-20 flex flex-col items-center gap-4 rounded-b-[14px]">
            <div className="w-10 h-10 border-4 border-primary-base/10 border-t-primary-base rounded-full animate-spin"></div>
            <p className="text-gray-400 font-medium">
              Carregando relatórios...
            </p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="bg-white border-x border-b border-[#eee8df] p-20 text-center rounded-b-[14px]">
            <p className="text-gray-400 italic font-medium">
              Nenhum relatório encontrado.
            </p>
          </div>
        ) : (
          <div className="bg-white border-x border-b border-[#eee8df] shadow-sm overflow-hidden rounded-b-[14px]">
            {/* Pagination Info */}
            <div className="px-6 py-2 bg-white text-right text-[0.8rem] text-[#7a95aa]">
              Mostrando {filteredReports.length} registros
            </div>

            <div className="overflow-x-auto text-[0.88rem]">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#f0f6fb]">
                    <th className="px-4 py-3 text-[0.78rem] font-bold text-primary-base uppercase tracking-[0.5px] text-left border-b-2 border-[#dde9f3] whitespace-nowrap cursor-pointer hover:text-[#0d4f7a]">
                      Lição{" "}
                      <span className="ml-1 opacity-50 text-[0.7rem]">
                        &#9662;
                      </span>
                    </th>
                    <th className="px-4 py-3 text-[0.78rem] font-bold text-primary-base uppercase tracking-[0.5px] text-left border-b-2 border-[#dde9f3] whitespace-nowrap cursor-pointer hover:text-[#0d4f7a]">
                      Data{" "}
                      <span className="ml-1 opacity-50 text-[0.7rem]">
                        &#9662;
                      </span>
                    </th>
                    <th className="px-4 py-3 text-[0.78rem] font-bold text-primary-base uppercase tracking-[0.5px] text-left border-b-2 border-[#dde9f3] whitespace-nowrap cursor-pointer hover:text-[#0d4f7a]">
                      Tipo{" "}
                      <span className="ml-1 opacity-50 text-[0.7rem]">
                        &#9662;
                      </span>
                    </th>
                    <th className="px-4 py-3 text-[0.78rem] font-bold text-primary-base uppercase tracking-[0.5px] text-left border-b-2 border-[#dde9f3] whitespace-nowrap cursor-pointer hover:text-[#0d4f7a]">
                      Casais{" "}
                      <span className="ml-1 opacity-50 text-[0.7rem]">
                        &#9662;
                      </span>
                    </th>
                    <th className="px-4 py-3 text-[0.78rem] font-bold text-primary-base uppercase tracking-[0.5px] text-left border-b-2 border-[#dde9f3] whitespace-nowrap cursor-pointer hover:text-[#0d4f7a]">
                      Enviado em{" "}
                      <span className="ml-1 opacity-50 text-[0.7rem]">
                        &#9662;
                      </span>
                    </th>
                    <th className="px-4 py-3 text-[0.78rem] font-bold text-primary-base uppercase tracking-[0.5px] text-left border-b-2 border-[#dde9f3] whitespace-nowrap">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const coursesMap: Record<string, string> = {
                      casados: "Casados por Deus",
                      pais: "Apascentando Filhos",
                      noivos: "Antes do Sim",
                      marido: "Marido de Valor",
                      mulher: "Mulher que Edifica",
                      esposa: "Esposa Sábia",
                    };

                    // Display grouped by group finding logic
                    const groupsWithReports = groups
                      .map((group) => {
                        const groupReports = filteredReports.filter(
                          (r) => r.groupId === group.id,
                        );
                        // Sort by date, oldest to newest or newest to oldest. Actually newest to oldest might be better. Let's do newest to oldest:
                        groupReports.sort(
                          (a, b) =>
                            new Date(b.dataReuniao).getTime() -
                            new Date(a.dataReuniao).getTime(),
                        );
                        return { group, reports: groupReports };
                      })
                      .filter((g) => g.reports.length > 0);

                    // Allow reports without groups to show as well
                    const orphanedReports = filteredReports.filter(
                      (r) => !groups.some((g) => g.id === r.groupId),
                    );
                    if (orphanedReports.length > 0) {
                      groupsWithReports.push({
                        group: { id: "orphaned", curso: "Outros" } as any,
                        reports: orphanedReports,
                      });
                    }

                    return groupsWithReports.map(({ group, reports }) => {
                      const cursoName =
                        coursesMap[group.curso?.toLowerCase()] ||
                        group.curso ||
                        "Grupo Desconhecido";

                      return (
                        <React.Fragment key={group.id}>
                          <tr className="bg-[#e8f4ff] border-b border-[#c8d8e8]">
                            <td
                              colSpan={6}
                              className="px-4 py-2.5 text-primary-base font-bold text-[0.95rem]"
                            >
                              <div className="flex items-center gap-3">
                                <span>
                                  {cursoName}{" "}
                                  <span className="opacity-70 text-[0.8rem] ml-1">
                                    #{group.id.slice(-6).toUpperCase()}
                                  </span>
                                </span>
                                {group.status === "finalizado" && (
                                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[0.7rem] uppercase tracking-wider rounded-md border border-green-200 flex items-center gap-1">
                                    <CheckCircle2 size={12} /> Finalizado
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                          {reports.map((rel) => {
                            const tipoText = "Relatório Semanal";
                            return (
                              <tr
                                key={rel.id}
                                className="border-b border-[#e8f0f7] hover:bg-[#fcfdfef9] transition-colors bg-white"
                              >
                                <td className="px-4 py-3 text-text-main font-normal pl-8">
                                  {rel.licao && rel.licao.length > 0 ? (
                                    <span
                                      className="font-bold text-primary-base block text-[0.85rem] mt-1 truncate max-w-[200px]"
                                      title={rel.licao.join(", ")}
                                    >
                                      Lição:{" "}
                                      {rel.licao
                                        .map((l) => l.split(" – ")[0])
                                        .join(", ")}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400 italic">
                                      Sem lição
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-text-main">
                                  {rel.dataReuniao
                                    ? new Date(
                                        rel.dataReuniao,
                                      ).toLocaleDateString("pt-BR", {
                                        timeZone: "UTC",
                                      })
                                    : "—"}
                                </td>
                                <td className="px-4 py-3 text-text-main">
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.75rem] font-bold bg-[#e8f4ff] text-primary-base">
                                    <FileText size={12} /> {tipoText}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-text-main font-bold text-center">
                                  {rel.casaisReport?.length || 0}
                                </td>
                                <td className="px-4 py-3 text-text-main">
                                  {rel.createdAt?.toDate
                                    ? rel.createdAt
                                        .toDate()
                                        .toLocaleDateString()
                                    : "Pend."}
                                </td>
                                <td className="px-4 py-3 text-text-main">
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      onClick={() => setSelectedReport(rel)}
                                      className="w-8 h-8 flex items-center justify-center rounded-md border-[1.5px] border-[#c8d8e8] bg-[#f7fafd] text-primary-base hover:bg-[#ddeeff] hover:border-primary-base transition-all"
                                      title="Visualizar"
                                    >
                                      <Eye size={14} />
                                    </button>
                                    {group.status !== "finalizado" && (
                                      <button
                                        onClick={() =>
                                          navigate(
                                            "/dashboard/enviar-relatorio",
                                            { state: { editData: rel } },
                                          )
                                        }
                                        className="w-8 h-8 flex items-center justify-center rounded-md border-[1.5px] border-[#c8d8e8] bg-[#f7fafd] text-[#e89b25] hover:bg-[#fdf5e8] hover:border-[#e89b25] transition-all"
                                        title="Editar"
                                      >
                                        <Edit2 size={14} />
                                      </button>
                                    )}
                                    <button
                                      className="w-8 h-8 flex items-center justify-center rounded-md border-[1.5px] border-[#c8d8e8] bg-[#f7fafd] text-primary-base hover:bg-[#ddeeff] hover:border-primary-base transition-all"
                                      title="Download PDF"
                                    >
                                      <Download size={14} />
                                    </button>
                                    {group.status !== "finalizado" && (
                                      <button
                                        onClick={() => handleDelete(rel.id)}
                                        className="w-8 h-8 flex items-center justify-center rounded-md border-[1.5px] border-[#c8d8e8] bg-[#f7fafd] text-[#c0392b] hover:bg-[#ffe8e8] hover:border-[#c0392b] transition-all"
                                        title="Excluir"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="px-6 py-3.5 border-t border-[#e2eaf3] flex justify-end items-center gap-1.5 bg-white">
              <button className="w-8 h-8 flex items-center justify-center bg-[#f7fafd] border-[1.5px] border-[#c8d8e8] rounded-md text-[#445] opacity-50 cursor-not-allowed">
                <ChevronLeft size={14} />
              </button>
              <button className="w-8 h-8 flex items-center justify-center bg-primary-base text-white border-[1.5px] border-primary-base rounded-md font-semibold text-[0.82rem]">
                1
              </button>
              <button className="w-8 h-8 flex items-center justify-center bg-[#f7fafd] border-[1.5px] border-[#c8d8e8] rounded-md text-[#445] hover:bg-primary-base hover:text-white hover:border-primary-base transition-colors">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Modal Visualização */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedReport(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl p-8"
              style={{ fontFamily: "Arial, sans-serif" }}
            >
              <button
                onClick={() => setSelectedReport(null)}
                className="absolute top-4 right-4 text-gray-500 hover:text-primary-base"
              >
                <X size={24} />
              </button>

              <h1 className="text-center text-[2rem] font-serif font-black text-primary-base tracking-wide mb-6">
                Relatório Semanal
              </h1>

              {(() => {
                const group =
                  groups.find((g) => g.id === selectedReport.groupId) || {};
                return (
                  <>
                    {/* Header Section */}

                    <h2 className="text-[1.15rem] font-bold font-serif text-primary-dark m-0 mb-4 pb-2.5 border-b-2 border-[#e2eaf3] flex items-center gap-2">
                      Dados do Relatório
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 border-[1.5px] border-[#c8d8e8] rounded-[10px] overflow-hidden mb-5">
                      <div className="px-4 py-3.5 bg-[#f7fafd] border-b sm:border-b-0 sm:border-r border-[#e2eaf3]">
                        <div className="text-[0.76rem] font-bold text-primary-base uppercase tracking-[0.5px] mb-1">
                          Cidade
                        </div>
                        <div className="text-[0.96rem] font-semibold text-primary-dark">
                          {group.cidade || "—"}
                        </div>
                      </div>
                      <div className="px-4 py-3.5 bg-white border-b sm:border-b-0 sm:border-r border-[#e2eaf3]">
                        <div className="text-[0.76rem] font-bold text-primary-base uppercase tracking-[0.5px] mb-1">
                          Estado
                        </div>
                        <div className="text-[0.96rem] font-semibold text-primary-dark">
                          {group.estado || "—"}
                        </div>
                      </div>
                      <div className="px-4 py-3.5 bg-white">
                        <div className="text-[0.76rem] font-bold text-primary-base uppercase tracking-[0.5px] mb-1">
                          Data da Reunião
                        </div>
                        <div className="text-[0.96rem] font-semibold text-primary-dark">
                          {selectedReport.dataReuniao
                            ? new Date(
                                selectedReport.dataReuniao,
                              ).toLocaleDateString("pt-BR", { timeZone: "UTC" })
                            : "—"}
                        </div>
                      </div>
                    </div>

                    <div className="border-[1.5px] border-[#c8d8e8] rounded-xl px-4 py-3.5 mb-5 bg-[#fafcff] overflow-hidden">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                          <div className="text-[0.76rem] font-bold text-primary-base uppercase tracking-[0.5px] mb-1">
                            Líderes do Grupo
                          </div>
                          <div className="text-[0.96rem] font-semibold text-primary-dark">
                            {auth.currentUser?.email ||
                              [group.liderMaridoNome, group.liderEsposaNome]
                                .filter(Boolean)
                                .join(" e ") ||
                              "—"}
                          </div>
                        </div>
                        <div>
                          <div className="text-[0.76rem] font-bold text-primary-base uppercase tracking-[0.5px] mb-1">
                            CPF do Marido
                          </div>
                          <div className="text-[0.96rem] font-semibold text-primary-dark">
                            {group.liderMaridoCpf || "—"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-[1.5px] border-[#c8d8e8] rounded-xl px-4 py-3.5 mb-8 bg-[#fafcff] overflow-hidden">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                          <div className="text-[0.76rem] font-bold text-primary-base uppercase tracking-[0.5px] mb-1">
                            Líderes em Treinamento
                          </div>
                          <div className="text-[0.96rem] font-semibold text-primary-dark">
                            {[group.treiMaridoNome, group.treiEsposaNome]
                              .filter(Boolean)
                              .join(" e ") || "—"}
                          </div>
                        </div>
                        <div>
                          <div className="text-[0.76rem] font-bold text-primary-base uppercase tracking-[0.5px] mb-1">
                            CPF do Marido
                          </div>
                          <div className="text-[0.96rem] font-semibold text-primary-dark">
                            {group.treiMaridoCpf || "—"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Lição do Dia Section */}
                    <div className="bg-primary-base text-white text-center font-bold font-serif tracking-wide py-1.5 mb-4">
                      Lição do Dia
                    </div>

                    {/* Checkboxes 4 columns */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-y-3 gap-x-2 text-[0.8rem] mb-8 text-primary-dark">
                      {[
                        "Semana 01 - Aliança",
                        "Semana 05 - Perdão",
                        "Semana 09 - Fluindo Juntos no Espírito",
                        "Semana 13 - M. de Uma só-carne",
                        "Semana 02 - Uma só carne",
                        "Semana 06 - Visão de fé e confiança",
                        "Semana 10 - Intimidade",
                        "Semana 14 - Compartilhamento",
                        "Semana 03 - Papéis",
                        "Semana 07 - Orando Juntos",
                        "Semana 11 - Batalha Espiritual",
                        "",
                        "Semana 04 - Semeando e Colhendo",
                        "Semana 08 - Acordo",
                        "Semana 12 - Estilo de Vida",
                        "",
                      ].map((lesson, idx) => {
                        if (!lesson) return <div key={idx}></div>;
                        const weekNumber = lesson
                          .split(" - ")[0]
                          .replace("Semana ", "");
                        const isChecked = selectedReport.licao?.some((l) =>
                          l.startsWith(weekNumber),
                        );
                        return (
                          <div
                            key={lesson}
                            className="flex items-center gap-1.5 whitespace-nowrap overflow-hidden text-ellipsis"
                          >
                            <span className="font-mono text-[0.8rem] text-primary-base font-bold">
                              [{isChecked ? "x" : " "}]
                            </span>
                            <span className="truncate">{lesson}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="w-full border-t border-[#c8d8e8] my-4 mt-6"></div>

                    {/* Casais counts */}
                    <div className="grid grid-cols-3 gap-4 text-[0.85rem] font-bold mb-6 text-primary-base text-center">
                      <div className="text-left">
                        Nº de Casais: {selectedReport.casaisReport?.length || 0}
                      </div>
                      <div>
                        Horário de Início:{" "}
                        {selectedReport.horarioInicio || "00:00"}
                      </div>
                      <div>
                        Horário de Término:{" "}
                        {selectedReport.horarioTermino || "00:00"}
                      </div>
                    </div>

                    {/* Lider em Treinamento resumidamente */}
                    {selectedReport.liderTreinamentoReport && (
                      <>
                        <div className="bg-primary-base text-white px-4 py-2 mt-6 flex justify-between tracking-wide font-serif text-[0.8rem] font-bold mb-0 rounded-t-lg">
                          <div className="uppercase">
                            ACOMPANHAMENTO: LÍDERES EM TREINAMENTO
                          </div>
                          <div className="uppercase">PRESENÇA</div>
                        </div>

                        <div className="bg-[#f7fafd] border-x border-b border-[#c8d8e8] p-5 text-[0.85rem] space-y-4 text-primary-dark rounded-b-lg">
                          <div>
                            <div className="flex justify-between font-bold mb-1.5 px-1 text-primary-base">
                              <span className="font-serif capitalize flex items-center gap-2">
                                {selectedReport.liderTreinamentoReport.nome}
                                {selectedReport.liderTreinamentoReport
                                  .concluiuCurso && (
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-sans uppercase tracking-wider ${
                                      selectedReport.liderTreinamentoReport
                                        .concluiuCurso === "Sim"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                    }`}
                                  >
                                    {selectedReport.liderTreinamentoReport
                                      .concluiuCurso === "Sim"
                                      ? "Concluiu"
                                      : "Não concluiu"}
                                  </span>
                                )}
                              </span>
                              <span className="capitalize">
                                {selectedReport.liderTreinamentoReport
                                  .status === "presente"
                                  ? "Presente"
                                  : "Ausente"}
                              </span>
                            </div>
                            <div className="bg-white p-3 border border-[#c8d8e8] rounded-md min-h-[60px] text-text-main">
                              {selectedReport.liderTreinamentoReport.observacao}
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Compartilhe resumidamente */}
                    <div className="bg-primary-base text-white px-4 py-2 mt-6 flex justify-between tracking-wide font-serif text-[0.8rem] font-bold mb-0 rounded-t-lg">
                      <div className="uppercase">
                        COMPARTILHE RESUMIDAMENTE SOBRE CADA CASAL ESTA SEMANA
                      </div>
                      <div className="uppercase">PRESENÇA</div>
                    </div>

                    <div className="bg-[#f7fafd] border-x border-b border-[#c8d8e8] p-5 text-[0.85rem] space-y-4 mb-8 text-primary-dark">
                      {selectedReport.casaisReport?.map((casal, i) => (
                        <div key={i}>
                          <div className="flex justify-between font-bold mb-1.5 px-1 text-primary-base">
                            <span className="font-serif">Casal {i + 1}</span>
                            <span>
                              {casal.status === "presente"
                                ? "Presente"
                                : "Ausente"}
                            </span>
                          </div>
                          <div className="bg-white p-3 border border-[#c8d8e8] rounded-md min-h-[60px] text-text-main">
                            <strong className="flex items-center gap-2 mb-1 text-primary-light">
                              {casal.nome}
                              {casal.concluiuCurso && (
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-sans uppercase tracking-wider ${
                                    casal.concluiuCurso === "Sim"
                                      ? "bg-green-100 text-green-700"
                                      : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {casal.concluiuCurso === "Sim"
                                    ? "Concluiu"
                                    : "Não concluiu"}
                                </span>
                              )}
                            </strong>
                            {casal.observacao}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Comentários Liderança */}
                    <div className="bg-primary-base text-white px-4 py-2 mt-6 font-serif tracking-wide text-[0.8rem] font-bold mb-0 uppercase">
                      COMENTÁRIOS DA LIDERANÇA COM RELAÇÃO A ESTA LIÇÃO
                    </div>
                    <div className="bg-[#f7fafd] border-x border-b border-[#c8d8e8] p-5 min-h-[80px] text-[0.85rem] text-text-main mb-8">
                      {selectedReport.observacoesGerais || (
                        <span className="text-gray-400 italic">
                          Nenhum comentário adicionado.
                        </span>
                      )}
                    </div>

                    <div className="flex justify-center text-[0.85rem] mt-8">
                      <button
                        onClick={() => setSelectedReport(null)}
                        className="px-8 py-2.5 bg-[#f0f7ff] hover:bg-[#d0eaf7] text-primary-base font-bold border border-[#c0d8ee] rounded-[8px] transition-colors"
                      >
                        Fechar
                      </button>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );

  return isEmbedded ? innerContent : <DashboardLayout>{innerContent}</DashboardLayout>;
}
