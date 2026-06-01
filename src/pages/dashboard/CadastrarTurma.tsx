import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Users,
  Calendar,
  MapPin,
  BookOpen,
  Send,
  ArrowLeft,
  Heart,
  GraduationCap,
  Star,
  User as UserIcon,
  Church,
  Info,
  AlertTriangle,
  PlusCircle,
  Phone,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { db, auth } from "../../lib/firebase";
import { useFirebase } from "../../context/FirebaseContext";
import { cpfMask, phoneMask, cepMask, numberMask } from "../../lib/masks";

interface CoupleData {
  maridoNome: string;
  esposaNome: string;
  email: string;
  celular: string;
  telefone?: string;
  complemento?: string;
  primeiraVez: boolean;
  cep?: string;
  endereco?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  registrationId?: string;
  formData?: any;
}

const FALLBACK_COURSES = [
  "Edificado Matrimônio",
  "Apascentando Filhos",
  "Alcançando a Liberdade Financeira",
  "Marido de Valor",
  "Esposa Sábia",
  "Casados para Sempre",
  "ONE",
  "Crown",
  "Aliança",
  "Veredas Antigas",
  "Liderança MMI",
  "Pais para Toda a Vida",
  "Antes do Sim",
  "Casados por Deus",
];

interface CadastrarTurmaProps {
  isEmbedded?: boolean;
}

export default function CadastrarTurma({ isEmbedded = false }: CadastrarTurmaProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const editData = location.state?.editData;
  const { profile } = useFirebase();
  const [loading, setLoading] = useState(false);
  const [qtdCasais, setQtdCasais] = useState<number>(0);
  const [casais, setCasais] = useState<CoupleData[]>([]);
  const [dynamicCourses, setDynamicCourses] = useState<string[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "content", "cursos"),
      (snap) => {
        if (snap.exists() && snap.data().cursos) {
          const list = snap.data().cursos;
          const titles = list.map((c: any) => c.title).filter(Boolean);
          setDynamicCourses(titles);
        }
      },
      (err) => {
        console.error("Erro carregando cursos na criação de turma:", err);
      }
    );
    return () => unsub();
  }, []);

  const [formData, setFormData] = useState({
    curso: "",
    status: "ativo",
    dataInicio: "",
    diaSemana: "",
    horario: "",
    local: "",
    estado: "",
    cidade: "",
    // Líderes
    liderMaridoNome: "",
    liderMaridoCpf: "",
    liderMaridoEmail: "",
    liderMaridoTel: "",
    liderEsposaNome: "",
    liderEsposaCpf: "",
    liderEsposaEmail: "",
    liderEsposaTel: "",
    // Endereço Líder
    liderCep: "",
    liderEndereco: "",
    liderNumero: "",
    liderBairro: "",
    liderCidade: "",
    liderEstado: "",
    // Igreja
    igrejaNome: "",
    pastorNome: "",
    pastorTel: "",
    // Treinamento
    treiMaridoNome: "",
    treiMaridoCpf: "",
    treiMaridoEmail: "",
    treiMaridoTel: "",
    treiEsposaNome: "",
    treiEsposaCpf: "",
    treiEsposaEmail: "",
    treiEsposaTel: "",
  });

  useEffect(() => {
    if (editData) {
      setFormData({
        ...formData,
        curso: editData.curso || "",
        status: editData.status || "ativo",
        dataInicio: editData.dataInicio || "",
        diaSemana: editData.diaSemana || "",
        horario: editData.horario || "",
        local: editData.local || "",
        estado: editData.estado || "",
        cidade: editData.cidade || "",
        liderMaridoNome: editData.liderMaridoNome || "",
        liderMaridoCpf: editData.liderMaridoCpf || "",
        liderMaridoEmail: editData.liderMaridoEmail || "",
        liderMaridoTel: editData.liderMaridoTel || "",
        liderEsposaNome: editData.liderEsposaNome || "",
        liderEsposaCpf: editData.liderEsposaCpf || "",
        liderEsposaEmail: editData.liderEsposaEmail || "",
        liderEsposaTel: editData.liderEsposaTel || "",
        liderCep: editData.liderCep || "",
        liderEndereco: editData.liderEndereco || "",
        liderNumero: editData.liderNumero || "",
        liderBairro: editData.liderBairro || "",
        liderCidade: editData.liderCidade || "",
        liderEstado: editData.liderEstado || "",
        igrejaNome: editData.igrejaNome || "",
        pastorNome: editData.pastorNome || "",
        pastorTel: editData.pastorTel || "",
        treiMaridoNome: editData.treiMaridoNome || "",
        treiMaridoCpf: editData.treiMaridoCpf || "",
        treiMaridoEmail: editData.treiMaridoEmail || "",
        treiMaridoTel: editData.treiMaridoTel || "",
        treiEsposaNome: editData.treiEsposaNome || "",
        treiEsposaCpf: editData.treiEsposaCpf || "",
        treiEsposaEmail: editData.treiEsposaEmail || "",
        treiEsposaTel: editData.treiEsposaTel || "",
      });
      if (editData.casais) {
        setCasais(editData.casais);
        setQtdCasais(editData.casais.length);
      }
    } else {
      if (profile) {
        setFormData((prev) => ({
          ...prev,
          liderMaridoNome:
            prev.liderMaridoNome ||
            (profile.nomeMarido || profile.sobrenome
              ? `${profile.nomeMarido || ""} ${profile.sobrenome || ""}`.trim()
              : profile.nome || ""),
          liderMaridoCpf: prev.liderMaridoCpf || profile.cpf || "",
          liderMaridoEmail: prev.liderMaridoEmail || profile.email || "",
          liderMaridoTel:
            prev.liderMaridoTel || profile.celular || profile.telefone || "",
          liderEsposaNome:
            prev.liderEsposaNome ||
            (profile.nomeEsposa || profile.sobrenomeEsposa
              ? `${profile.nomeEsposa || ""} ${profile.sobrenomeEsposa || ""}`.trim()
              : ""),
          liderEsposaCpf: prev.liderEsposaCpf || profile.cpfEsposa || "",
          liderEsposaEmail: prev.liderEsposaEmail || profile.emailEsposa || "",
          liderEsposaTel: prev.liderEsposaTel || profile.telefoneEsposa || "",
          liderCep: prev.liderCep || profile.cep || "",
          liderEndereco: prev.liderEndereco || profile.endereco || "",
          liderNumero: prev.liderNumero || profile.numero || "",
          liderBairro: prev.liderBairro || profile.bairro || "",
          liderCidade: prev.liderCidade || profile.cidade || "",
          liderEstado: prev.liderEstado || profile.estado || "",
          igrejaNome: prev.igrejaNome || profile.igreja || "",
          estado: prev.estado || profile.estado || "",
          cidade: prev.cidade || profile.cidade || "",
        }));
      }

      // Handle custom prefilling states passed when creating a group from linked registrations
      const initialCasais = location.state?.initialCasais;
      const initialCurso = location.state?.initialCurso;
      if (initialCasais) {
        setCasais(initialCasais);
        setQtdCasais(initialCasais.length);
      }
      if (initialCurso) {
        setFormData((prev) => ({
          ...prev,
          curso: initialCurso
        }));
      }
    }
  }, [profile, editData, location.state]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    let { id, value } = e.target;

    if (id.toLowerCase().includes("cpf")) {
      value = cpfMask(value);
    } else if (id.toLowerCase().includes("tel") || id === "celular") {
      value = phoneMask(value);
    } else if (id.toLowerCase().includes("cep")) {
      value = cepMask(value);
    } else if (id.toLowerCase().includes("numero")) {
      value = numberMask(value);
    }

    setFormData((prev) => ({ ...prev, [id]: value }));

    if (id === "liderCep" && value.replace(/\D/g, "").length === 8) {
      fetchAddressForLider(value);
    }
  };

  const fetchAddressForLider = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, "");
    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${cleanCep}/json/`,
      );
      const data = await response.json();
      if (!data.erro) {
        setFormData((prev) => ({
          ...prev,
          liderEndereco: data.logradouro || prev.liderEndereco,
          liderBairro: data.bairro || prev.liderBairro,
          liderCidade: data.localidade || prev.liderCidade,
          liderEstado: data.uf || prev.liderEstado,
        }));
      }
    } catch (error) {
      console.error("Erro ao buscar CEP do líder:", error);
    }
  };

  const handleQtdCasaisChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = parseInt(e.target.value);
    setQtdCasais(val);
  };

  const gerarCamposCasais = () => {
    const currentCasais = [...casais];
    if (qtdCasais > currentCasais.length) {
      const diff = qtdCasais - currentCasais.length;
      const newItems = Array(diff)
        .fill(null)
        .map(() => ({
          maridoNome: "",
          esposaNome: "",
          email: "",
          celular: "",
          telefone: "",
          complemento: "",
          primeiraVez: true,
          cep: "",
          endereco: "",
          numero: "",
          bairro: "",
          cidade: "",
          estado: "",
        }));
      setCasais([...currentCasais, ...newItems]);
    } else {
      setCasais(currentCasais.slice(0, qtdCasais));
    }
  };

  const handleCoupleChange = (
    index: number,
    field: keyof CoupleData,
    value: any,
  ) => {
    if (field === "celular" || field === "telefone") {
      value = phoneMask(value);
    } else if (field === "cep") {
      value = cepMask(value);
    }
    const updated = [...casais];
    updated[index] = { ...updated[index], [field]: value };
    setCasais(updated);

    if (
      field === "cep" &&
      typeof value === "string" &&
      value.replace(/\D/g, "").length === 8
    ) {
      fetchAddressForCouple(index, value);
    }
  };

  const fetchAddressForCouple = async (index: number, cep: string) => {
    const cleanCep = cep.replace(/\D/g, "");
    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${cleanCep}/json/`,
      );
      const data = await response.json();
      if (!data.erro) {
        setCasais((prev) => {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            endereco: data.logradouro || updated[index].endereco,
            bairro: data.bairro || updated[index].bairro,
            cidade: data.localidade || updated[index].cidade,
            estado: data.uf || updated[index].estado,
          };
          return updated;
        });
      }
    } catch (error) {
      console.error("Erro ao buscar CEP do casal:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      alert("Você precisa estar logado para cadastrar um grupo.");
      return;
    }

    setLoading(true);
    try {
      if (editData) {
        await updateDoc(doc(db, "groups", editData.id), {
          ...formData,
          casais,
          updatedAt: serverTimestamp(),
        });
        alert("Grupo atualizado com sucesso!");
      } else {
        const groupRef = await addDoc(collection(db, "groups"), {
          ...formData,
          casais,
          liderId: auth.currentUser.uid,
          createdAt: serverTimestamp(),
        });

        // Mark associated course registrations as inserted under this new group
        const initialRegIds = location.state?.initialRegIds;
        if (initialRegIds && Array.isArray(initialRegIds)) {
          for (const regId of initialRegIds) {
            try {
              await updateDoc(doc(db, "course_registrations", regId), {
                insertedInGroupId: groupRef.id,
                insertedInGroupName: formData.curso || "Grupo",
                insertedAt: serverTimestamp()
              });
            } catch (err) {
              console.error(`Erro ao marcar matricula ${regId} como vinculada:`, err);
            }
          }
        }

        alert("Grupo cadastrado com sucesso!");
      }

      navigate("/dashboard/grupos");
    } catch (error: any) {
      console.error("Erro ao salvar grupo:", error);
      alert("Erro ao salvar grupo: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const estados = [
    "AC",
    "AL",
    "AP",
    "AM",
    "BA",
    "CE",
    "DF",
    "ES",
    "GO",
    "MA",
    "MT",
    "MS",
    "MG",
    "PA",
    "PB",
    "PR",
    "PE",
    "PI",
    "RJ",
    "RN",
    "RS",
    "RO",
    "RR",
    "SC",
    "SP",
    "SE",
    "TO",
  ];

  const innerContent = (
    <div className="w-full">
      <section className="bg-gradient-to-br from-primary-base to-primary-light pt-14 pb-10 text-center text-white">
        <h1 className="text-[2.2rem] font-black font-serif tracking-wide mb-2">
          {editData ? "Editar Turma" : "Cadastro"}
        </h1>
        <p className="text-[1.05rem] opacity-90 max-w-[540px] mx-auto">
          {editData
            ? "Atualize os dados do grupo no ministério"
            : "Preencha todos os dados do grupo para realizar o cadastro no ministério"}
        </p>
      </section>

      <section className="max-w-[960px] mx-auto px-5 py-10 pb-16">
        <div className="bg-white rounded-[14px] shadow-[0_4px_28px_rgba(0,0,0,0.10)] px-6 md:px-11 py-10 md:py-12">
          <form onSubmit={handleSubmit}>
            {/* Alertas Iniciais */}
            <div className="bg-primary-bg border-l-4 border-primary-base rounded-lg px-4 py-3.5 mb-2.5 text-[0.89rem] text-primary-dark leading-relaxed">
              <Info className="inline-block mr-2 mb-0.5" size={16} />
              <strong>POR FAVOR PREENCHA TODOS OS DADOS</strong>
              <br />
              Desde Out/2015 não é mais necessário informar nº de ID.
            </div>
            <div className="bg-primary-bg border-l-4 border-primary-base rounded-lg px-4 py-3.5 mb-1.5 text-[0.89rem] text-primary-dark leading-relaxed">
              <Info className="inline-block mr-2 mb-0.5" size={16} />
              Os certificados serão enviados por meio de carta registrada para o
              endereço do líder informado no cadastro. É necessário que tenha
              alguém na residência para recebê-lo. Favor verifique seu endereço.
            </div>
            <div className="bg-[#fff8e1] border-l-4 border-[#f5a623] rounded-lg px-4 py-3.5 mb-7 text-[0.89rem] text-[#6b4200] leading-relaxed">
              <AlertTriangle className="inline-block mr-2 mb-0.5" size={16} />
              Favor efetuar o cadastro dos participantes{" "}
              <strong>apenas depois de iniciar seus grupos</strong>. Casais
              adicionados depois serão cobrado o envio de novos certificados.
            </div>

            {/* Seção 1: Dados do Grupo */}
            <h2 className="text-[1.15rem] font-bold font-serif text-primary-dark m-0 mb-4 pb-2.5 border-b-2 border-[#e2eaf3] flex items-center gap-2">
              <Users className="text-primary-base" size={20} /> Dados do Grupo
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 border-[1.5px] border-[#c8d8e8] rounded-[10px] overflow-hidden mb-5">
              <div className="px-4 py-3.5 bg-[#f7fafd] border-b sm:border-b-0 sm:border-r border-[#e2eaf3]">
                <div className="text-[0.76rem] font-bold text-primary-base uppercase tracking-[0.5px] mb-1">
                  Estado
                </div>
                <div className="text-[0.96rem] font-semibold text-primary-dark">
                  {formData.estado || "—"}
                </div>
              </div>
              <div className="px-4 py-3.5 bg-[#f7fafd] border-b sm:border-b-0 sm:border-r border-[#e2eaf3]">
                <div className="text-[0.76rem] font-bold text-primary-base uppercase tracking-[0.5px] mb-1">
                  Cidade
                </div>
                <div className="text-[0.96rem] font-semibold text-primary-dark">
                  {formData.cidade || "—"}
                </div>
              </div>
              <div className="px-4 py-3.5 bg-[#f7fafd]">
                <div className="text-[0.76rem] font-bold text-primary-base uppercase tracking-[0.5px] mb-1">
                  Data da Reunião
                </div>
                <div className="text-[0.96rem] font-semibold text-primary-dark">
                  {formData.dataInicio
                    ? new Date(formData.dataInicio).toLocaleDateString(
                        "pt-BR",
                        { timeZone: "UTC" },
                      )
                    : "—"}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="flex flex-col min-w-0">
                <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                  Estado <span className="text-[#c0392b] ml-0.5">*</span>
                </label>
                <select
                  id="estado"
                  required
                  value={formData.estado}
                  onChange={handleInputChange}
                  className="w-full border-[1.5px] border-[#c8d8e8] rounded-lg px-3 py-2 text-[0.92rem] text-text-main bg-[#f7fafd] focus:border-primary-base focus:bg-white focus:ring-[3px] focus:ring-primary-base/10 outline-none transition-all"
                >
                  <option value="">Selecione...</option>
                  {estados.map((uf) => (
                    <option key={uf} value={uf}>
                      {uf}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col min-w-0">
                <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                  Cidade <span className="text-[#c0392b] ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  id="cidade"
                  required
                  value={formData.cidade}
                  onChange={handleInputChange}
                  placeholder="Ex: São Paulo"
                  className="w-full border-[1.5px] border-[#c8d8e8] rounded-lg px-3 py-2 text-[0.92rem] text-text-main bg-[#f7fafd] focus:border-primary-base focus:bg-white focus:ring-[3px] focus:ring-primary-base/10 outline-none transition-all placeholder:text-[#b0c4d5]"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                  Data da Reunião{" "}
                  <span className="text-[#c0392b] ml-0.5">*</span>
                </label>
                <input
                  type="date"
                  id="dataInicio"
                  required
                  value={formData.dataInicio}
                  onChange={handleInputChange}
                  className="w-full border-[1.5px] border-[#c8d8e8] rounded-lg px-3 py-2 text-[0.92rem] text-text-main bg-[#f7fafd] focus:border-primary-base focus:bg-white focus:ring-[3px] focus:ring-primary-base/10 outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="flex flex-col min-w-0">
                <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                  Curso <span className="text-[#c0392b] ml-0.5">*</span>
                </label>
                <select
                  id="curso"
                  required
                  value={formData.curso}
                  onChange={handleInputChange}
                  className="w-full border-[1.5px] border-[#c8d8e8] rounded-lg px-3 py-2 text-[0.92rem] text-text-main bg-[#f7fafd] focus:border-primary-base focus:bg-white focus:ring-[3px] focus:ring-primary-base/10 outline-none transition-all"
                >
                  <option value="">Selecione o Curso</option>
                  {(dynamicCourses.length > 0 ? dynamicCourses : FALLBACK_COURSES).map((course) => {
                    // Mapeia chaves legadas caso o banco/estado atual use "casados", "pais", etc.
                    let optionValue = course;
                    if (formData.curso === "casados" && course === "Casados por Deus") {
                      optionValue = "casados";
                    } else if (formData.curso === "pais" && course === "Apascentando Filhos") {
                      optionValue = "pais";
                    } else if (formData.curso === "noivos" && course === "Antes do Sim") {
                      optionValue = "noivos";
                    } else if (formData.curso === "marido" && course === "Marido de Valor") {
                      optionValue = "marido";
                    } else if (formData.curso === "esposa" && course === "Esposa Sábia") {
                      optionValue = "esposa";
                    }
                    return (
                      <option key={course} value={optionValue}>
                        {course}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="flex flex-col min-w-0">
                <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                  Dia da Semana <span className="text-[#c0392b] ml-0.5">*</span>
                </label>
                <select
                  id="diaSemana"
                  required
                  value={formData.diaSemana}
                  onChange={handleInputChange}
                  className="w-full border-[1.5px] border-[#c8d8e8] rounded-lg px-3 py-2 text-[0.92rem] text-text-main bg-[#f7fafd] focus:border-primary-base focus:bg-white focus:ring-[3px] focus:ring-primary-base/10 outline-none transition-all"
                >
                  <option value="">Selecione</option>
                  <option value="Segunda">Segunda-feira</option>
                  <option value="Terça">Terça-feira</option>
                  <option value="Quarta">Quarta-feira</option>
                  <option value="Quinta">Quinta-feira</option>
                  <option value="Sexta">Sexta-feira</option>
                  <option value="Sábado">Sábado</option>
                  <option value="Domingo">Domingo</option>
                </select>
              </div>
              <div className="flex flex-col min-w-0">
                <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                  Horário <span className="text-[#c0392b] ml-0.5">*</span>
                </label>
                <input
                  type="time"
                  id="horario"
                  required
                  value={formData.horario}
                  onChange={handleInputChange}
                  className="w-full border-[1.5px] border-[#c8d8e8] rounded-lg px-3 py-2 text-[0.92rem] text-text-main bg-[#f7fafd] focus:border-primary-base focus:bg-white focus:ring-[3px] focus:ring-primary-base/10 outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="flex flex-col min-w-0">
                <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                  Local de Encontro{" "}
                  <span className="text-[#c0392b] ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  id="local"
                  required
                  value={formData.local}
                  onChange={handleInputChange}
                  placeholder="Ex: Casa do Líder, Igreja, etc."
                  className="w-full border-[1.5px] border-[#c8d8e8] rounded-lg px-3 py-2 text-[0.92rem] text-text-main bg-[#f7fafd] focus:border-primary-base focus:bg-white focus:ring-[3px] focus:ring-primary-base/10 outline-none transition-all placeholder:text-[#b0c4d5]"
                />
              </div>

              <div className="flex flex-col min-w-0">
                <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                  Status do Curso{" "}
                  <span className="text-[#c0392b] ml-0.5">*</span>
                </label>
                <select
                  id="status"
                  required
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full border-[1.5px] border-[#c8d8e8] rounded-lg px-3 py-2 text-[0.92rem] text-text-main bg-[#f7fafd] focus:border-primary-base focus:bg-white focus:ring-[3px] focus:ring-primary-base/10 outline-none transition-all"
                >
                  <option value="ativo">Em Andamento</option>
                  <option value="finalizado">Finalizado / Concluído</option>
                </select>
              </div>
            </div>

            {/* Seção 2: Líderes do Grupo */}
            <h2 className="text-[1.15rem] font-bold font-serif text-primary-dark mt-8 mb-4 pb-2.5 border-b-2 border-[#e2eaf3] flex items-center gap-2">
              <Star className="text-primary-base" size={20} /> Líderes do Grupo
            </h2>

            <div className="border-[1.5px] border-[#c8d8e8] rounded-xl px-6 py-5.5 pb-2 mb-5 bg-[#fafcff] overflow-hidden">
              <div className="font-serif text-[0.95rem] font-bold text-primary-base flex items-center gap-2 mb-4.5 pb-2.5 border-b border-[#e2eaf3]">
                <UserIcon size={16} /> Dados do Marido (Líder)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="flex flex-col min-w-0">
                  <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                    Nome Completo{" "}
                    <span className="text-[#c0392b] ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    id="liderMaridoNome"
                    value={formData.liderMaridoNome}
                    onChange={handleInputChange}
                    className="w-full border-[1.5px] border-[#c8d8e8] rounded-lg px-3 py-2 text-[0.92rem] text-text-main bg-[#f7fafd] focus:border-primary-base focus:bg-white focus:ring-[3px] focus:ring-primary-base/10 outline-none transition-all placeholder:text-[#b0c4d5]"
                    placeholder="Nome do marido"
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                    CPF <span className="text-[#c0392b] ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    id="liderMaridoCpf"
                    value={formData.liderMaridoCpf}
                    onChange={handleInputChange}
                    placeholder="000.000.000-00"
                    className="w-full border-[1.5px] border-[#c8d8e8] rounded-lg px-3 py-2 text-[0.92rem] text-text-main bg-[#f7fafd] focus:border-primary-base focus:bg-white focus:ring-[3px] focus:ring-primary-base/10 outline-none transition-all placeholder:text-[#b0c4d5]"
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                    E-mail <span className="text-[#c0392b] ml-0.5">*</span>
                  </label>
                  <input
                    type="email"
                    id="liderMaridoEmail"
                    value={formData.liderMaridoEmail}
                    onChange={handleInputChange}
                    className="w-full border-[1.5px] border-[#c8d8e8] rounded-lg px-3 py-2 text-[0.92rem] text-text-main bg-[#f7fafd] focus:border-primary-base focus:bg-white focus:ring-[3px] focus:ring-primary-base/10 outline-none transition-all placeholder:text-[#b0c4d5]"
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    id="liderMaridoTel"
                    value={formData.liderMaridoTel}
                    onChange={handleInputChange}
                    placeholder="(00) 00000-0000"
                    className="w-full border-[1.5px] border-[#c8d8e8] rounded-lg px-3 py-2 text-[0.92rem] text-text-main bg-[#f7fafd] focus:border-primary-base focus:bg-white focus:ring-[3px] focus:ring-primary-base/10 outline-none transition-all placeholder:text-[#b0c4d5]"
                  />
                </div>
              </div>

              <div className="h-px bg-[#e2eaf3] my-4 mt-2 mb-5"></div>
              <div className="font-serif text-[0.95rem] font-bold text-primary-base flex items-center gap-2 mb-4.5 pb-2.5 border-b border-[#e2eaf3]">
                <UserIcon size={16} /> Dados do Cônjuge (Líder)
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="flex flex-col min-w-0">
                  <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                    Nome Completo{" "}
                    <span className="text-[#c0392b] ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    id="liderEsposaNome"
                    value={formData.liderEsposaNome}
                    onChange={handleInputChange}
                    className="w-full border-[1.5px] border-[#c8d8e8] rounded-lg px-3 py-2 text-[0.92rem] text-text-main bg-[#f7fafd] focus:border-primary-base focus:bg-white focus:ring-[3px] focus:ring-primary-base/10 outline-none transition-all placeholder:text-[#b0c4d5]"
                    placeholder="Nome do cônjuge"
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                    CPF <span className="text-[#c0392b] ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    id="liderEsposaCpf"
                    value={formData.liderEsposaCpf}
                    onChange={handleInputChange}
                    placeholder="000.000.000-00"
                    className="w-full border-[1.5px] border-[#c8d8e8] rounded-lg px-3 py-2 text-[0.92rem] text-text-main bg-[#f7fafd] focus:border-primary-base focus:bg-white focus:ring-[3px] focus:ring-primary-base/10 outline-none transition-all placeholder:text-[#b0c4d5]"
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                    E-mail <span className="text-[#c0392b] ml-0.5">*</span>
                  </label>
                  <input
                    type="email"
                    id="liderEsposaEmail"
                    value={formData.liderEsposaEmail}
                    onChange={handleInputChange}
                    className="w-full border-[1.5px] border-[#c8d8e8] rounded-lg px-3 py-2 text-[0.92rem] text-text-main bg-[#f7fafd] focus:border-primary-base focus:bg-white focus:ring-[3px] focus:ring-primary-base/10 outline-none transition-all placeholder:text-[#b0c4d5]"
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    id="liderEsposaTel"
                    value={formData.liderEsposaTel}
                    onChange={handleInputChange}
                    placeholder="(00) 00000-0000"
                    className="w-full border-[1.5px] border-[#c8d8e8] rounded-lg px-3 py-2 text-[0.92rem] text-text-main bg-[#f7fafd] focus:border-primary-base focus:bg-white focus:ring-[3px] focus:ring-primary-base/10 outline-none transition-all placeholder:text-[#b0c4d5]"
                  />
                </div>
              </div>

              <div className="h-px bg-[#e2eaf3] my-4 mt-2 mb-5"></div>
              <div className="font-serif text-[0.95rem] font-bold text-primary-base flex items-center gap-2 mb-4.5 pb-2.5 border-b border-[#e2eaf3]">
                <MapPin size={16} /> Endereço do Líder
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr_100px] gap-4 mb-4">
                <div className="flex flex-col min-w-0">
                  <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                    CEP <span className="text-[#c0392b] ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    id="liderCep"
                    value={formData.liderCep}
                    onChange={handleInputChange}
                    className="w-full border-[1.5px] border-[#c8d8e8] rounded-lg px-3 py-2 text-[0.92rem] text-text-main bg-[#f7fafd] focus:border-primary-base focus:bg-white focus:ring-[3px] focus:ring-primary-base/10 outline-none transition-all placeholder:text-[#b0c4d5]"
                    placeholder="00000-000"
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                    Endereço
                  </label>
                  <input
                    type="text"
                    id="liderEndereco"
                    value={formData.liderEndereco}
                    onChange={handleInputChange}
                    className="w-full border-[1.5px] border-[#c8d8e8] rounded-lg px-3 py-2 text-[0.92rem] text-text-main bg-[#f7fafd] focus:border-primary-base focus:bg-white focus:ring-[3px] focus:ring-primary-base/10 outline-none transition-all placeholder:text-[#b0c4d5]"
                    placeholder="Rua, Avenida..."
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                    Número <span className="text-[#c0392b] ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    id="liderNumero"
                    value={formData.liderNumero}
                    onChange={handleInputChange}
                    className="w-full border-[1.5px] border-[#c8d8e8] rounded-lg px-3 py-2 text-[0.92rem] text-text-main bg-[#f7fafd] focus:border-primary-base focus:bg-white focus:ring-[3px] focus:ring-primary-base/10 outline-none transition-all placeholder:text-[#b0c4d5]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div className="flex flex-col min-w-0">
                  <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                    Bairro
                  </label>
                  <input
                    type="text"
                    id="liderBairro"
                    value={formData.liderBairro}
                    onChange={handleInputChange}
                    className="w-full border-[1.5px] border-[#c8d8e8] rounded-lg px-3 py-2 text-[0.92rem] text-text-main bg-[#f7fafd] focus:border-primary-base focus:bg-white focus:ring-[3px] focus:ring-primary-base/10 outline-none transition-all placeholder:text-[#b0c4d5]"
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                    Cidade
                  </label>
                  <input
                    type="text"
                    id="liderCidade"
                    value={formData.liderCidade}
                    onChange={handleInputChange}
                    className="w-full border-[1.5px] border-[#c8d8e8] rounded-lg px-3 py-2 text-[0.92rem] text-text-main bg-[#f7fafd] focus:border-primary-base focus:bg-white focus:ring-[3px] focus:ring-primary-base/10 outline-none transition-all placeholder:text-[#b0c4d5]"
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                    Estado
                  </label>
                  <select
                    id="liderEstado"
                    value={formData.liderEstado}
                    onChange={handleInputChange}
                    className="w-full border-[1.5px] border-[#c8d8e8] rounded-lg px-3 py-2 text-[0.92rem] text-text-main bg-[#f7fafd] focus:border-primary-base focus:bg-white focus:ring-[3px] focus:ring-primary-base/10 outline-none transition-all"
                  >
                    <option value="">Selecione...</option>
                    {estados.map((uf) => (
                      <option key={uf} value={uf}>
                        {uf}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="h-px bg-[#e2eaf3] my-4 mt-2 mb-5"></div>
              <div className="font-serif text-[0.95rem] font-bold text-primary-base flex items-center gap-2 mb-4.5 pb-2.5 border-b border-[#e2eaf3]">
                <Church size={16} /> Igreja
              </div>

              <div className="flex flex-col min-w-0 mb-4">
                <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                  Igreja a que pertence
                </label>
                <input
                  type="text"
                  id="igrejaNome"
                  value={formData.igrejaNome}
                  onChange={handleInputChange}
                  className="w-full border-[1.5px] border-[#c8d8e8] rounded-lg px-3 py-2 text-[0.92rem] text-text-main bg-[#f7fafd] focus:border-primary-base focus:bg-white focus:ring-[3px] focus:ring-primary-base/10 outline-none transition-all placeholder:text-[#b0c4d5]"
                  placeholder="Nome da igreja"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="flex flex-col min-w-0">
                  <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                    Nome do Pastor Titular
                  </label>
                  <input
                    type="text"
                    id="pastorNome"
                    value={formData.pastorNome}
                    onChange={handleInputChange}
                    className="w-full border-[1.5px] border-[#c8d8e8] rounded-lg px-3 py-2 text-[0.92rem] text-text-main bg-[#f7fafd] focus:border-primary-base focus:bg-white focus:ring-[3px] focus:ring-primary-base/10 outline-none transition-all placeholder:text-[#b0c4d5]"
                    placeholder="Nome do pastor"
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                    Telefone do Pastor
                  </label>
                  <input
                    type="tel"
                    id="pastorTel"
                    value={formData.pastorTel}
                    onChange={handleInputChange}
                    className="w-full border-[1.5px] border-[#c8d8e8] rounded-lg px-3 py-2 text-[0.92rem] text-text-main bg-[#f7fafd] focus:border-primary-base focus:bg-white focus:ring-[3px] focus:ring-primary-base/10 outline-none transition-all placeholder:text-[#b0c4d5]"
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>
            </div>

            {/* Seção 3: Líderes em Treinamento */}
            <h2 className="text-[1.15rem] font-bold font-serif text-primary-dark mt-8 mb-4 pb-2.5 border-b-2 border-[#e2eaf3] flex items-center gap-2">
              <GraduationCap className="text-primary-base" size={20} /> Líderes
              em Treinamento
            </h2>

            <div className="border-[1.5px] border-[#c8d8e8] rounded-xl px-6 py-5.5 pb-2 mb-5 bg-[#fafcff] overflow-hidden">
              <div className="font-serif text-[0.95rem] font-bold text-primary-base flex items-center gap-2 mb-4.5 pb-2.5 border-b border-[#e2eaf3]">
                <UserIcon size={16} /> Dados do Marido (Treinamento)
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mb-4">
                <div className="flex flex-col min-w-0">
                  <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                    Nome Completo do Marido
                  </label>
                  <input
                    type="text"
                    id="treiMaridoNome"
                    value={formData.treiMaridoNome}
                    onChange={handleInputChange}
                    className="w-full border-[1.5px] border-[#c8d8e8] rounded-lg px-3 py-2 text-[0.92rem] text-text-main bg-[#f7fafd] focus:border-primary-base focus:bg-white focus:ring-[3px] focus:ring-primary-base/10 outline-none transition-all placeholder:text-[#b0c4d5]"
                    placeholder="Nome do marido"
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                    CPF
                  </label>
                  <input
                    type="text"
                    id="treiMaridoCpf"
                    value={formData.treiMaridoCpf}
                    onChange={handleInputChange}
                    className="w-full border-[1.5px] border-[#c8d8e8] rounded-lg px-3 py-2 text-[0.92rem] text-text-main bg-[#f7fafd] focus:border-primary-base focus:bg-white focus:ring-[3px] focus:ring-primary-base/10 outline-none transition-all placeholder:text-[#b0c4d5]"
                    placeholder="000.000.000-00"
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                    E-mail
                  </label>
                  <input
                    type="email"
                    id="treiMaridoEmail"
                    value={formData.treiMaridoEmail}
                    onChange={handleInputChange}
                    className="w-full border-[1.5px] border-[#c8d8e8] rounded-lg px-3 py-2 text-[0.92rem] text-text-main bg-[#f7fafd] focus:border-primary-base focus:bg-white focus:ring-[3px] focus:ring-primary-base/10 outline-none transition-all placeholder:text-[#b0c4d5]"
                    placeholder="E-mail"
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                    Telefone/Celular
                  </label>
                  <input
                    type="tel"
                    id="treiMaridoTel"
                    value={formData.treiMaridoTel}
                    onChange={handleInputChange}
                    className="w-full border-[1.5px] border-[#c8d8e8] rounded-lg px-3 py-2 text-[0.92rem] text-text-main bg-[#f7fafd] focus:border-primary-base focus:bg-white focus:ring-[3px] focus:ring-primary-base/10 outline-none transition-all placeholder:text-[#b0c4d5]"
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>

              <div className="h-px bg-[#e2eaf3] my-4 mt-2 mb-5"></div>
              <div className="font-serif text-[0.95rem] font-bold text-primary-base flex items-center gap-2 mb-4.5 pb-2.5 border-b border-[#e2eaf3]">
                <UserIcon size={16} /> Dados do Cônjuge (Treinamento)
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mb-4">
                <div className="flex flex-col min-w-0">
                  <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                    Nome Completo do Cônjuge
                  </label>
                  <input
                    type="text"
                    id="treiEsposaNome"
                    value={formData.treiEsposaNome}
                    onChange={handleInputChange}
                    className="w-full border-[1.5px] border-[#c8d8e8] rounded-lg px-3 py-2 text-[0.92rem] text-text-main bg-[#f7fafd] focus:border-primary-base focus:bg-white focus:ring-[3px] focus:ring-primary-base/10 outline-none transition-all placeholder:text-[#b0c4d5]"
                    placeholder="Nome do cônjuge"
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                    CPF
                  </label>
                  <input
                    type="text"
                    id="treiEsposaCpf"
                    value={formData.treiEsposaCpf}
                    onChange={handleInputChange}
                    className="w-full border-[1.5px] border-[#c8d8e8] rounded-lg px-3 py-2 text-[0.92rem] text-text-main bg-[#f7fafd] focus:border-primary-base focus:bg-white focus:ring-[3px] focus:ring-primary-base/10 outline-none transition-all placeholder:text-[#b0c4d5]"
                    placeholder="000.000.000-00"
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                    E-mail
                  </label>
                  <input
                    type="email"
                    id="treiEsposaEmail"
                    value={formData.treiEsposaEmail}
                    onChange={handleInputChange}
                    className="w-full border-[1.5px] border-[#c8d8e8] rounded-lg px-3 py-2 text-[0.92rem] text-text-main bg-[#f7fafd] focus:border-primary-base focus:bg-white focus:ring-[3px] focus:ring-primary-base/10 outline-none transition-all placeholder:text-[#b0c4d5]"
                    placeholder="E-mail"
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                    Telefone/Celular
                  </label>
                  <input
                    type="tel"
                    id="treiEsposaTel"
                    value={formData.treiEsposaTel}
                    onChange={handleInputChange}
                    className="w-full border-[1.5px] border-[#c8d8e8] rounded-lg px-3 py-2 text-[0.92rem] text-text-main bg-[#f7fafd] focus:border-primary-base focus:bg-white focus:ring-[3px] focus:ring-primary-base/10 outline-none transition-all placeholder:text-[#b0c4d5]"
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>
            </div>

            {/* Seção 4: Casais do Grupo */}
            <h2 className="text-[1.15rem] font-bold font-serif text-primary-dark mt-8 mb-4 pb-2.5 border-b-2 border-[#e2eaf3] flex items-center gap-2">
              <Heart className="text-primary-base" size={20} /> Casais do Grupo
            </h2>

            <div className="flex flex-col min-w-0 mb-4 max-w-[280px]">
              <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                Quantidade de Casais{" "}
                <span className="text-[#c0392b] ml-0.5">*</span>
              </label>
              <select
                value={qtdCasais}
                onChange={handleQtdCasaisChange}
                className="w-full border-[1.5px] border-[#c8d8e8] rounded-lg px-3 py-2 text-[0.92rem] text-text-main bg-[#f7fafd] focus:border-primary-base focus:bg-white focus:ring-[3px] focus:ring-primary-base/10 outline-none transition-all"
              >
                <option value="0">Selecione...</option>
                {[...Array(10)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1} Casais
                  </option>
                ))}
              </select>
              <div className="bg-[#fff3cd] border border-[#ffc107] rounded-lg px-3.5 py-2.5 mt-2.5 text-[0.8rem] text-[#6b4200] leading-snug">
                <strong className="block mb-1">
                  <AlertTriangle
                    className="inline-block mr-1 mb-0.5"
                    size={14}
                  />{" "}
                  Atenção!
                </strong>
                Selecione apenas os casais participantes. Não inclua o líder nem
                o líder em treinamento.
              </div>
            </div>

            <button
              type="button"
              onClick={gerarCamposCasais}
              className="bg-primary-bg text-primary-base border-[1.5px] border-primary-base rounded-lg px-5 py-2.5 text-[0.9rem] font-semibold mt-1 inline-flex items-center gap-2 hover:bg-[#d0eaf7] transition-colors"
            >
              <PlusCircle size={18} /> Gerar Campos dos Casais
            </button>

            <div className="mt-4">
              <AnimatePresence>
                {casais.map((casal, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-[#f0f7ff] border-[1.5px] border-[#c0d8ee] rounded-[10px] px-5 py-4.5 pb-1.5 mb-4"
                  >
                    <div className="text-[0.87rem] font-bold text-primary-base mb-3.5 flex items-center gap-1.5">
                      <Heart size={16} /> Casal {index + 1}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div className="flex flex-col min-w-0">
                        <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                          Nome completo do Marido{" "}
                          <span className="text-[#c0392b] ml-0.5">*</span>
                        </label>
                        <input
                          type="text"
                          value={casal.maridoNome}
                          onChange={(e) =>
                            handleCoupleChange(
                              index,
                              "maridoNome",
                              e.target.value,
                            )
                          }
                          required
                          placeholder="Nome completo do marido"
                          className="w-full border-[1.5px] border-[#c8d8e8] rounded-lg px-3 py-2 text-[0.92rem] text-text-main bg-[#f7fafd] focus:border-primary-base focus:bg-white focus:ring-[3px] focus:ring-primary-base/10 outline-none transition-all placeholder:text-[#b0c4d5]"
                        />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                          Nome completo do Cônjuge{" "}
                          <span className="text-[#c0392b] ml-0.5">*</span>
                        </label>
                        <input
                          type="text"
                          value={casal.esposaNome}
                          onChange={(e) =>
                            handleCoupleChange(
                              index,
                              "esposaNome",
                              e.target.value,
                            )
                          }
                          required
                          placeholder="Nome completo do cônjuge"
                          className="w-full border-[1.5px] border-[#c8d8e8] rounded-lg px-3 py-2 text-[0.92rem] text-text-main bg-[#f7fafd] focus:border-primary-base focus:bg-white focus:ring-[3px] focus:ring-primary-base/10 outline-none transition-all placeholder:text-[#b0c4d5]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr_100px_140px] gap-4 mb-4">
                      <div className="flex flex-col min-w-0">
                        <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                          CEP <span className="text-[#c0392b] ml-0.5">*</span>
                        </label>
                        <input
                          type="text"
                          value={casal.cep || ""}
                          onChange={(e) =>
                            handleCoupleChange(index, "cep", e.target.value)
                          }
                          required
                          placeholder="00000-000"
                          className="w-full border-[1.5px] border-[#c8d8e8] rounded-lg px-3 py-2 text-[0.92rem] text-text-main bg-[#f7fafd] focus:border-primary-base focus:bg-white focus:ring-[3px] focus:ring-primary-base/10 outline-none transition-all placeholder:text-[#b0c4d5]"
                        />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                          Endereço
                        </label>
                        <input
                          type="text"
                          value={casal.endereco || ""}
                          onChange={(e) =>
                            handleCoupleChange(
                              index,
                              "endereco",
                              e.target.value,
                            )
                          }
                          placeholder="Rua, Avenida..."
                          className="w-full border-[1.5px] border-[#c8d8e8] rounded-lg px-3 py-2 text-[0.92rem] text-text-main bg-[#f7fafd] focus:border-primary-base focus:bg-white focus:ring-[3px] focus:ring-primary-base/10 outline-none transition-all placeholder:text-[#b0c4d5]"
                        />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                          Número
                        </label>
                        <input
                          type="text"
                          value={casal.numero || ""}
                          onChange={(e) =>
                            handleCoupleChange(index, "numero", e.target.value)
                          }
                          placeholder="Nº"
                          className="w-full border-[1.5px] border-[#c8d8e8] rounded-lg px-3 py-2 text-[0.92rem] text-text-main bg-[#f7fafd] focus:border-primary-base focus:bg-white focus:ring-[3px] focus:ring-primary-base/10 outline-none transition-all placeholder:text-[#b0c4d5]"
                        />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                          Complemento
                        </label>
                        <input
                          type="text"
                          value={casal.complemento || ""}
                          onChange={(e) =>
                            handleCoupleChange(index, "complemento", e.target.value)
                          }
                          placeholder="Apto, Bloco, etc."
                          className="w-full border-[1.5px] border-[#c8d8e8] rounded-lg px-3 py-2 text-[0.92rem] text-text-main bg-[#f7fafd] focus:border-[#407BFF] focus:bg-white focus:ring-[3px] focus:ring-[#407BFF]/10 outline-none transition-all placeholder:text-[#b0c4d5]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                      <div className="flex flex-col min-w-0">
                        <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                          Bairro
                        </label>
                        <input
                          type="text"
                          value={casal.bairro || ""}
                          onChange={(e) =>
                            handleCoupleChange(index, "bairro", e.target.value)
                          }
                          placeholder="Bairro"
                          className="w-full border-[1.5px] border-[#c8d8e8] rounded-lg px-3 py-2 text-[0.92rem] text-text-main bg-[#f7fafd] focus:border-primary-base focus:bg-white focus:ring-[3px] focus:ring-primary-base/10 outline-none transition-all placeholder:text-[#b0c4d5]"
                        />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                          Cidade
                        </label>
                        <input
                          type="text"
                          value={casal.cidade || ""}
                          onChange={(e) =>
                            handleCoupleChange(index, "cidade", e.target.value)
                          }
                          placeholder="Cidade"
                          className="w-full border-[1.5px] border-[#c8d8e8] rounded-lg px-3 py-2 text-[0.92rem] text-text-main bg-[#f7fafd] focus:border-primary-base focus:bg-white focus:ring-[3px] focus:ring-primary-base/10 outline-none transition-all placeholder:text-[#b0c4d5]"
                        />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                          Estado
                        </label>
                        <select
                          value={casal.estado || ""}
                          onChange={(e) =>
                            handleCoupleChange(index, "estado", e.target.value)
                          }
                          className="w-full border-[1.5px] border-[#c8d8e8] rounded-lg px-3 py-2 text-[0.92rem] text-text-main bg-[#f7fafd] focus:border-primary-base focus:bg-white focus:ring-[3px] focus:ring-primary-base/10 outline-none transition-all"
                        >
                          <option value="">Selecione...</option>
                          {estados.map((uf) => (
                            <option key={uf} value={uf}>
                              {uf}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
                      <div className="flex flex-col min-w-0">
                        <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                          Celular / WhatsApp
                        </label>
                        <input
                          type="tel"
                          value={casal.celular}
                          onChange={(e) =>
                            handleCoupleChange(index, "celular", e.target.value)
                          }
                          placeholder="(00) 00000-0000"
                          className="w-full border-[1.5px] border-[#c8d8e8] rounded-lg px-3 py-2 text-[0.92rem] text-text-main bg-[#f7fafd] focus:border-primary-base focus:bg-white focus:ring-[3px] focus:ring-primary-base/10 outline-none transition-all placeholder:text-[#b0c4d5]"
                        />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                          Telefone Fixo
                        </label>
                        <input
                          type="tel"
                          value={casal.telefone || ""}
                          onChange={(e) =>
                            handleCoupleChange(index, "telefone", e.target.value)
                          }
                          placeholder="(00) 0000-0000"
                          className="w-full border-[1.5px] border-[#c8d8e8] rounded-lg px-3 py-2 text-[0.92rem] text-text-main bg-[#f7fafd] focus:border-primary-base focus:bg-white focus:ring-[3px] focus:ring-primary-base/10 outline-none transition-all placeholder:text-[#b0c4d5]"
                        />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                          E-mail
                        </label>
                        <input
                          type="email"
                          value={casal.email}
                          onChange={(e) =>
                            handleCoupleChange(index, "email", e.target.value)
                          }
                          placeholder="email@exemplo.com"
                          className="w-full border-[1.5px] border-[#c8d8e8] rounded-lg px-3 py-2 text-[0.92rem] text-text-main bg-[#f7fafd] focus:border-primary-base focus:bg-white focus:ring-[3px] focus:ring-primary-base/10 outline-none transition-all placeholder:text-[#b0c4d5]"
                        />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                          É a 1ª vez que faz o curso?
                        </label>
                        <select
                          value={casal.primeiraVez ? "sim" : "nao"}
                          onChange={(e) =>
                            handleCoupleChange(
                              index,
                              "primeiraVez",
                              e.target.value === "sim",
                            )
                          }
                          className="w-full border-[1.5px] border-[#c8d8e8] rounded-lg px-3 py-2 text-[0.92rem] text-text-main bg-[#f7fafd] focus:border-primary-base focus:bg-white focus:ring-[3px] focus:ring-primary-base/10 outline-none transition-all"
                        >
                          <option value="sim">Sim</option>
                          <option value="nao">Não</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <div className="pt-8 border-t-2 border-[#e2eaf3] flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="text-primary-base font-bold text-[0.95rem] px-4 py-2 hover:bg-[#f0f7ff] rounded-lg transition-colors flex items-center gap-2"
              >
                <ArrowLeft size={18} /> Voltar ao Início
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-[#27ae60] hover:bg-[#219653] text-white px-9 py-3.5 rounded-lg text-[1.05rem] font-bold tracking-wide shadow-md transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Send size={20} />{" "}
                {loading ? "Processando..." : "Realizar Cadastro"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );

  return isEmbedded ? innerContent : <DashboardLayout>{innerContent}</DashboardLayout>;
}
