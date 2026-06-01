import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FileText,
  Send,
  ArrowLeft,
  Users,
  Calendar,
  MapPin,
  BookOpen,
  Clock,
  DollarSign,
  Paperclip,
  CheckCircle,
  AlertCircle,
  PlusCircle,
  User as UserIcon,
  MessageSquare,
  GraduationCap,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import {
  db,
  auth,
  handleFirestoreError,
  OperationType,
} from "../../lib/firebase";

interface CoupleReport {
  nome: string;
  status: string;
  observacao: string;
  concluiuCurso?: string;
}

interface EnviarRelatorioProps {
  isEmbedded?: boolean;
}

export default function EnviarRelatorio({ isEmbedded = false }: EnviarRelatorioProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const editData = location.state?.editData;

  const [loading, setLoading] = useState(false);
  const [userGroups, setUserGroups] = useState<any[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");

  const [formData, setFormData] = useState({
    dataReuniao: "",
    horarioInicio: "",
    horarioTermino: "",
    licao: [] as string[],
    valorOferta: "",
    observacoesGerais: "",
  });

  const [casaisRelatorio, setCasaisRelatorio] = useState<CoupleReport[]>([]);
  const [liderTreinamentoNome, setLiderTreinamentoNome] = useState("");
  const [liderTreinamentoStatus, setLiderTreinamentoStatus] =
    useState("presente");
  const [liderTreinamentoObservacao, setLiderTreinamentoObservacao] =
    useState("");
  const [liderTreinamentoConcluiuCurso, setLiderTreinamentoConcluiuCurso] =
    useState("");
  const [finalizarTurma, setFinalizarTurma] = useState(false);
  const [markedLicoes, setMarkedLicoes] = useState<string[]>([]);

  useEffect(() => {
    const fetchPreviousLicoes = async () => {
      if (!selectedGroupId) {
        setMarkedLicoes([]);
        return;
      }
      try {
        const q = query(
          collection(db, "reports"),
          where("groupId", "==", selectedGroupId),
        );
        const snap = await getDocs(q);
        const licoes = new Set<string>();
        snap.docs.forEach((doc) => {
          if (editData && doc.id === editData.id) return;
          const data = doc.data();
          if (data.licao) {
            data.licao.forEach((l: string) => licoes.add(l));
          }
        });
        setMarkedLicoes(Array.from(licoes));
      } catch (error) {
        console.error("Erro ao buscar lições anteriores:", error);
      }
    };
    fetchPreviousLicoes();
  }, [selectedGroupId, editData]);

  useEffect(() => {
    const fetchGroups = async () => {
      if (!auth.currentUser) return;
      try {
        const q = query(
          collection(db, "groups"),
          where("liderId", "==", auth.currentUser.uid),
        );
        const snap = await getDocs(q);
        const groups = snap.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter(
            (g: any) =>
              g.status !== "finalizado" ||
              (editData && g.id === editData.groupId),
          );
        setUserGroups(groups);
      } catch (error) {
        console.error("Erro ao buscar grupos:", error);
      }
    };
    fetchGroups();
  }, []);

  useEffect(() => {
    if (editData && userGroups.length > 0) {
      setSelectedGroupId(editData.groupId || "");
      setFormData({
        dataReuniao: editData.dataReuniao || "",
        horarioInicio: editData.horarioInicio || "",
        horarioTermino: editData.horarioTermino || "",
        licao: editData.licao || [],
        valorOferta: editData.valorOferta || "",
        observacoesGerais: editData.observacoesGerais || "",
      });
      if (editData.casaisReport) {
        setCasaisRelatorio(editData.casaisReport);
      }
      if (editData.liderTreinamentoReport) {
        setLiderTreinamentoNome(editData.liderTreinamentoReport.nome || "");
        setLiderTreinamentoStatus(
          editData.liderTreinamentoReport.status || "presente",
        );
        setLiderTreinamentoObservacao(
          editData.liderTreinamentoReport.observacao || "",
        );
        setLiderTreinamentoConcluiuCurso(
          editData.liderTreinamentoReport.concluiuCurso || "",
        );
      } else {
        const group = userGroups.find((g) => g.id === editData.groupId);
        if (group && (group.treiMaridoNome || group.treiEsposaNome)) {
          setLiderTreinamentoNome(
            [group.treiMaridoNome, group.treiEsposaNome]
              .filter(Boolean)
              .join(" & "),
          );
        }
      }
    }
  }, [editData, userGroups]);

  const handleGroupSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const groupId = e.target.value;
    setSelectedGroupId(groupId);
    const group = userGroups.find((g) => g.id === groupId);
    if (group && group.casais) {
      setCasaisRelatorio(
        group.casais.map((c: any, index: number) => {
          const hasNomes = c.maridoNome || c.esposaNome;
          return {
            nome: hasNomes
              ? [c.maridoNome, c.esposaNome].filter(Boolean).join(" & ")
              : `Casal ${index + 1}`,
            status: "presente",
            observacao: "",
            concluiuCurso: "",
          };
        }),
      );
    } else {
      setCasaisRelatorio([]);
    }

    if (group && (group.treiMaridoNome || group.treiEsposaNome)) {
      setLiderTreinamentoNome(
        [group.treiMaridoNome, group.treiEsposaNome]
          .filter(Boolean)
          .join(" & "),
      );
      setLiderTreinamentoStatus("presente");
      setLiderTreinamentoObservacao("");
      setLiderTreinamentoConcluiuCurso("");
    } else {
      setLiderTreinamentoNome("");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { id, value } = e.target;

    if (id === "valorOferta") {
      let numericValue = value.replace(/\D/g, "");
      if (numericValue === "") {
        setFormData((prev) => ({ ...prev, [id]: "" }));
        return;
      }

      const numberValue = parseInt(numericValue, 10);
      const formatted = (numberValue / 100).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      setFormData((prev) => ({ ...prev, [id]: formatted }));
      return;
    }

    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleLicaoChange = (licao: string) => {
    setFormData((prev) => {
      const exists = prev.licao.includes(licao);
      if (exists) {
        return { ...prev, licao: prev.licao.filter((l) => l !== licao) };
      }
      return { ...prev, licao: [...prev.licao, licao] };
    });
  };

  const handleCoupleReportChange = (
    index: number,
    field: keyof CoupleReport,
    value: string,
  ) => {
    const updated = [...casaisRelatorio];
    updated[index] = { ...updated[index], [field]: value };
    setCasaisRelatorio(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !selectedGroupId) {
      alert("Por favor, selecione um grupo.");
      return;
    }

    const isLastLicao = formData.licao.some(
      (l) => l.includes("14") || l.toLowerCase().includes("compartilhamento"),
    );

    if (isLastLicao) {
      if (!finalizarTurma) {
        alert(
          "Como esta é a última lição, você deve marcar a opção de finalizar e encerrar a turma.",
        );
        return;
      }

      const missingConclusion = casaisRelatorio.some((c) => !c.concluiuCurso);
      const isMissingLiderConclusion =
        liderTreinamentoNome && !liderTreinamentoConcluiuCurso;
      if (missingConclusion || isMissingLiderConclusion) {
        alert(
          "Por favor, confirme a conclusão do curso para todos os participantes na seção de Finalizar Turma.",
        );
        return;
      }
    }

    setLoading(true);
    const path = "reports";
    const liderTreinamentoData = liderTreinamentoNome
      ? {
          nome: liderTreinamentoNome,
          status: liderTreinamentoStatus,
          observacao: liderTreinamentoObservacao,
          concluiuCurso: liderTreinamentoConcluiuCurso || null,
        }
      : null;

    try {
      if (editData) {
        await updateDoc(doc(db, path, editData.id), {
          groupId: selectedGroupId,
          ...formData,
          casaisReport: casaisRelatorio,
          liderTreinamentoReport: liderTreinamentoData,
          updatedAt: serverTimestamp(),
        });
        alert("Relatório atualizado com sucesso!");
      } else {
        await addDoc(collection(db, path), {
          groupId: selectedGroupId,
          liderId: auth.currentUser.uid,
          ...formData,
          casaisReport: casaisRelatorio,
          liderTreinamentoReport: liderTreinamentoData,
          createdAt: serverTimestamp(),
        });
        alert("Relatório enviado com sucesso!");
      }

      if (isLastLicao && finalizarTurma) {
        await updateDoc(doc(db, "groups", selectedGroupId), {
          status: "finalizado",
          updatedAt: serverTimestamp(),
        });
      }

      navigate("/dashboard/meus-registros");
    } catch (error: any) {
      handleFirestoreError(error, OperationType.WRITE, path);
    } finally {
      setLoading(false);
    }
  };

  const licoes = [
    "01 – Aliança",
    "02 – Uma só carne",
    "03 – Papéis",
    "04 – Semeando e Colhendo",
    "05 – Perdão",
    "06 – Visão de fé",
    "07 – Orando Juntos",
    "08 – Acordo",
    "09 – Fluindo no Espírito",
    "10 – Intimidade",
    "11 – Batalha Espiritual",
    "12 – Estilo de Vida",
    "13 – Uma só-carne",
    "14 – Compartilhamento",
  ];

  const innerContent = (
    <div className="w-full">
      <section className="bg-gradient-to-br from-primary-base to-primary-light pt-14 pb-10 text-center text-white">
        <div className="max-w-5xl mx-auto px-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[2.2rem] font-black font-serif tracking-wide mb-3"
          >
            {editData ? "Editar Relatório Semanal" : "Enviar Relatório Semanal"}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-[1.05rem] opacity-90 max-w-2xl mx-auto mb-10"
          >
            Preencha os dados da reunião realizada nesta semana.
          </motion.p>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate("/dashboard/enviar-relatorio")}
              className="px-6 py-3 rounded-full bg-white text-primary-base font-bold shadow-lg transition-all"
            >
              Enviar Relatório
            </button>
            <button
              onClick={() => navigate("/dashboard/meus-registros")}
              className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold transition-all"
            >
              Meus Registros
            </button>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-12 w-full">
        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Seção 1: Seleção de Grupo e Dados Básicos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white p-8 md:p-10 rounded-[14px] shadow-[0_4px_28px_rgba(0,0,0,0.10)] border border-[#c8d8e8]"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-[#f7fafd] p-3 rounded-xl border border-[#c8d8e8]">
                <Users className="text-primary-base" size={24} />
              </div>
              <h2 className="text-[1.5rem] font-black font-serif text-primary-base">
                1. Identificação do Grupo
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2">
                  Selecione o Grupo *
                </label>
                <select
                  required
                  value={selectedGroupId}
                  onChange={handleGroupSelect}
                  className="form-input"
                >
                  <option value="">Selecione um grupo...</option>
                  {userGroups.map((group) => {
                    const courses: Record<string, string> = {
                      casados: "Casados por Deus",
                      pais: "Apascentando Filhos",
                      noivos: "Antes do Sim",
                      marido: "Marido de Valor",
                      mulher: "Mulher que Edifica",
                      esposa: "Esposa Sábia",
                    };
                    const cursoName = group.curso
                      ? courses[group.curso.toLowerCase()] || group.curso
                      : "Curso Desconhecido";
                    const creationDate = group.createdAt?.toDate
                      ? group.createdAt.toDate().toLocaleDateString("pt-BR")
                      : "Data não informada";
                    return (
                      <option key={group.id} value={group.id}>
                        {cursoName} - {creationDate}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2">
                  Data da Reunião *
                </label>
                <input
                  type="date"
                  id="dataReuniao"
                  required
                  value={formData.dataReuniao}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mt-6">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2">
                  Horário de Início *
                </label>
                <input
                  type="time"
                  id="horarioInicio"
                  required
                  value={formData.horarioInicio}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2">
                  Horário de Término *
                </label>
                <input
                  type="time"
                  id="horarioTermino"
                  required
                  value={formData.horarioTermino}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
            </div>
          </motion.div>

          {/* Seção 2: Lição do Dia */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white p-8 md:p-10 rounded-[14px] shadow-[0_4px_28px_rgba(0,0,0,0.10)] border border-[#c8d8e8]"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-[#f7fafd] p-3 rounded-xl border border-[#c8d8e8]">
                <BookOpen className="text-primary-base" size={24} />
              </div>
              <h2 className="text-[1.5rem] font-black font-serif text-primary-base">
                2. Lição Ministrada
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {licoes.map((licao) => {
                const isMarked = markedLicoes.includes(licao);
                const isSelected = formData.licao.includes(licao);
                const isChecked = isMarked || isSelected;
                return (
                  <button
                    key={licao}
                    type="button"
                    onClick={() => {
                      if (!isMarked) handleLicaoChange(licao);
                    }}
                    disabled={isMarked}
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${
                      isChecked
                        ? "bg-primary-base border-primary-base text-white shadow-[0_4px_12px_rgba(26,100,150,0.25)]"
                        : "bg-[#f7fafd] border-[#c8d8e8] text-[#555] hover:border-primary-base"
                    } ${isMarked ? "opacity-70 cursor-not-allowed" : ""}`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                        isChecked
                          ? "bg-white border-white"
                          : "bg-white border-[#c8d8e8]"
                      }`}
                    >
                      {isChecked && (
                        <div className="w-2.5 h-2.5 bg-primary-base rounded-sm" />
                      )}
                    </div>
                    <span className="text-sm font-medium">
                      {licao} {isMarked ? "(Já ministrada)" : ""}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {liderTreinamentoNome && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white p-8 md:p-10 rounded-[14px] shadow-[0_4px_28px_rgba(0,0,0,0.10)] border border-[#c8d8e8]"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-base shadow-md rounded-full border border-primary-base flex items-center justify-center text-white font-bold">
                    <GraduationCap size={18} />
                  </div>
                  <div>
                    <div className="font-bold text-primary-base text-lg leading-none mb-1">
                      {liderTreinamentoNome}
                    </div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      Acompanhamento: Líderes em Treinamento
                    </p>
                  </div>
                </div>
                <select
                  value={liderTreinamentoStatus}
                  onChange={(e) => setLiderTreinamentoStatus(e.target.value)}
                  className="form-input bg-white md:w-48"
                >
                  <option value="presente">Presente</option>
                  <option value="ausente">Ausente</option>
                  <option value="justificado">Justificado</option>
                  <option value="desistente">Desistente</option>
                </select>
              </div>
              <textarea
                placeholder="Descreva brevemente o acompanhamento do líder em treinamento esta semana..."
                value={liderTreinamentoObservacao}
                onChange={(e) => setLiderTreinamentoObservacao(e.target.value)}
                className="form-input bg-white min-h-[80px]"
                required
              />
            </motion.div>
          )}

          {/* Seção 3: Acompanhamento dos Casais */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white p-8 md:p-10 rounded-[14px] shadow-[0_4px_28px_rgba(0,0,0,0.10)] border border-[#c8d8e8]"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-[#f7fafd] p-3 rounded-xl border border-[#c8d8e8]">
                <MessageSquare className="text-primary-base" size={24} />
              </div>
              <h2 className="text-[1.5rem] font-black font-serif text-primary-base">
                3. Acompanhamento dos Casais
              </h2>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col gap-4 mb-4">
                <p className="text-gray-500 text-sm italic">
                  Compartilhe resumidamente sobre cada casal esta semana.
                  Descreva qualquer acompanhamento.
                </p>
              </div>

              {casaisRelatorio.length === 0 ? (
                <div className="text-center py-10 text-gray-400 italic bg-[#f7fafd] rounded-xl border border-dashed border-[#c8d8e8]">
                  <p>Selecione um grupo para carregar a lista de casais.</p>
                </div>
              ) : (
                casaisRelatorio.map((casal, index) => (
                  <div
                    key={index}
                    className="p-6 bg-[#f7fafd] rounded-xl border border-[#c8d8e8] space-y-4"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-full border border-[#c8d8e8] flex items-center justify-center text-primary-base font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-grow">
                          <input
                            type="text"
                            value={casal.nome}
                            onChange={(e) =>
                              handleCoupleReportChange(
                                index,
                                "nome",
                                e.target.value,
                              )
                            }
                            placeholder="Nome do Casal"
                            className="bg-transparent border-none font-bold text-primary-base focus:outline-none w-full"
                          />
                          <p className="text-[10px] text-gray-400 italic">
                            * Coloque o nome do casal no início do texto
                          </p>
                        </div>
                      </div>
                      <select
                        value={casal.status}
                        onChange={(e) =>
                          handleCoupleReportChange(
                            index,
                            "status",
                            e.target.value,
                          )
                        }
                        className="form-input bg-white md:w-48"
                      >
                        <option value="presente">Presente</option>
                        <option value="ausente">Ausente</option>
                        <option value="justificado">Justificado</option>
                        <option value="desistente">Desistente</option>
                      </select>
                    </div>
                    <textarea
                      placeholder="Descreva brevemente o acompanhamento deste casal esta semana..."
                      value={casal.observacao}
                      onChange={(e) =>
                        handleCoupleReportChange(
                          index,
                          "observacao",
                          e.target.value,
                        )
                      }
                      className="form-input bg-white min-h-[80px]"
                      required
                    />
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* Seção 4: Ofertas e Observações */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white p-8 md:p-10 rounded-[14px] shadow-[0_4px_28px_rgba(0,0,0,0.10)] border border-[#c8d8e8]"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-[#f7fafd] p-3 rounded-xl border border-[#c8d8e8]">
                <DollarSign className="text-primary-base" size={24} />
              </div>
              <h2 className="text-[1.5rem] font-black font-serif text-primary-base">
                4. Ofertas e Comentários
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2">
                  Valor Total das Ofertas
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold pointer-events-none">
                    R$
                  </span>
                  <input
                    type="text"
                    id="valorOferta"
                    value={formData.valorOferta}
                    onChange={handleInputChange}
                    placeholder="0,00"
                    className="form-input"
                    style={{ paddingLeft: "2.5rem" }}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2">
                  Comprovante
                </label>
                <div className="flex items-center gap-4">
                  <label className="bg-[#f7fafd] border border-[#c8d8e8] border-dashed rounded-xl p-4 flex-grow cursor-pointer text-center hover:bg-gray-50 transition-all flex items-center justify-center gap-2 text-gray-500 font-medium">
                    <Paperclip size={18} /> Selecionar Arquivo
                    <input type="file" className="hidden" />
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2">
                Observações Gerais / Testemunhos
              </label>
              <textarea
                id="observacoesGerais"
                value={formData.observacoesGerais}
                onChange={handleInputChange}
                placeholder="Compartilhe algo marcante que aconteceu na reunião..."
                className="form-input min-h-[120px]"
              />
            </div>
          </motion.div>

          {formData.licao.some(
            (l) =>
              l.includes("14") || l.toLowerCase().includes("compartilhamento"),
          ) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 bg-[#fdf8f0] border border-[#e8c07b] rounded-[14px] p-6 text-left shadow-sm mb-4"
            >
              <div className="flex items-center gap-3 mb-2 text-[#9a6f19] font-bold">
                <CheckCircle size={20} />
                <h3 className="text-[1.15rem]">Finalizar Turma</h3>
              </div>
              <p className="text-[0.95rem] text-[#805f1f] mb-4 leading-relaxed font-medium">
                Você marcou a última lição. Deseja encerrar definitivamente as
                atividades desta turma? Ela não aparecerá mais nos relatórios
                pendentes, e será movida para os grupos finalizados.
              </p>
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <div
                  className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${finalizarTurma ? "bg-[#b07d17] border-[#b07d17]" : "bg-white border-[#d2a33c]"}`}
                >
                  {finalizarTurma && (
                    <CheckCircle size={16} className="text-white" />
                  )}
                </div>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={finalizarTurma}
                  onChange={(e) => setFinalizarTurma(e.target.checked)}
                />
                <span className="font-bold text-[#805f1f]">
                  Sim, finalizar e encerrar esta turma
                </span>
              </label>

              {finalizarTurma && (
                <div className="pt-6 mt-6 border-t border-[#e8c07b]/30 space-y-4">
                  <h4 className="font-bold text-[#805f1f] mb-3">
                    Confirme a conclusão do curso para os participantes:
                  </h4>

                  {liderTreinamentoNome && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 bg-white/60 rounded-xl border border-[#e8c07b]/50">
                      <label className="text-sm font-bold text-[#805f1f]">
                        {liderTreinamentoNome} (Líder em Treinamento) concluiu?
                      </label>
                      <select
                        value={liderTreinamentoConcluiuCurso || ""}
                        onChange={(e) =>
                          setLiderTreinamentoConcluiuCurso(e.target.value)
                        }
                        className={`form-input bg-white md:w-48 text-[#805f1f] border-[#d2a33c] focus:border-[#b07d17] focus:ring-[#b07d17]/20 ${!liderTreinamentoConcluiuCurso ? "border-red-400 focus:border-red-500 focus:ring-red-400" : ""}`}
                        required={finalizarTurma}
                      >
                        <option value="" disabled>
                          Selecione...
                        </option>
                        <option value="Sim">Sim, concluiu</option>
                        <option value="Não">Não concluiu</option>
                      </select>
                    </div>
                  )}

                  {casaisRelatorio.map((casal, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 bg-white/60 rounded-xl border border-[#e8c07b]/50"
                    >
                      <label className="text-sm font-bold text-[#805f1f]">
                        {casal.nome} concluiu o curso?
                      </label>
                      <select
                        value={casal.concluiuCurso || ""}
                        onChange={(e) =>
                          handleCoupleReportChange(
                            index,
                            "concluiuCurso",
                            e.target.value,
                          )
                        }
                        className={`form-input bg-white md:w-48 text-[#805f1f] border-[#d2a33c] focus:border-[#b07d17] focus:ring-[#b07d17]/20 ${!casal.concluiuCurso ? "border-red-400 focus:border-red-500 focus:ring-red-400" : ""}`}
                        required={finalizarTurma}
                      >
                        <option value="" disabled>
                          Selecione...
                        </option>
                        <option value="Sim">Sim, concluiu</option>
                        <option value="Não">Não concluiu</option>
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          <div className="pt-8 flex flex-col md:flex-row gap-6">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-grow py-6 flex items-center justify-center gap-3 text-xl disabled:opacity-50"
            >
              <Send size={24} />{" "}
              {loading ? "Enviando..." : "Enviar Relatório Semanal"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard/meus-registros")}
              className="btn-outline px-10 py-6 flex items-center justify-center gap-3 text-lg font-bold"
            >
              <ArrowLeft size={20} /> Voltar
            </button>
          </div>
        </form>
      </section>

      <style>{`
        .form-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          background-color: #f7fafd;
          border: 1.5px solid #c8d8e8;
          font-size: 0.92rem;
          color: #222;
          transition: all 0.3s ease;
          appearance: none;
        }
        .form-input:focus {
          outline: none;
          border-color: #1a6496;
          box-shadow: 0 0 0 3px rgba(26, 100, 150, 0.1);
          background-color: #fff;
        }
        select.form-input {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%231a6496' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
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
