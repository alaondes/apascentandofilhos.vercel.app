import React, { useState, ChangeEvent } from "react";
import {
  User,
  MapPin,
  Send,
  ArrowLeft,
  ArrowRight,
  Heart,
  BookOpen,
  Users,
  Star,
  CheckCircle2,
  Calendar,
  Smartphone,
  Info,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { db, auth } from "../lib/firebase";

const steps = [
  { id: 1, title: "Pessoal", icon: User },
  { id: 2, title: "Contato & Endereço", icon: MapPin },
  { id: 3, title: "Vida Cristã", icon: Heart },
  { id: 4, title: "Família", icon: Users },
  { id: 5, title: "Ministérios", icon: Star },
];

export default function CadastroMembro() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Pessoal
    nome: "",
    sobrenome: "",
    cpf: "",
    dataNascimento: "",
    sexo: "",
    estadoCivil: "",
    naturalidade: "",
    escolaridade: "",
    profissao: "",
    senha: "",
    confirmarSenha: "",
    // Contato
    email: "",
    celular: "",
    whatsapp: "",
    // Endereço
    cep: "",
    rua: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    // Espiritual
    dataConversao: "",
    dataBatismoAguas: "",
    igrejaAnterior: "",
    membroDesde: "",
    cargosAnteriores: "",
    // Família
    nomeConjuge: "",
    dataCasamento: "",
    dataNascimentoConjuge: "",
    cpfConjuge: "",
    celularConjuge: "",
    igrejaConjuge: "",
    temFilhos: "não",
    quantidadeFilhos: 0,
    listaFilhos: [] as { nome: string; dataNascimento: string; sexo: string }[],
    // Ministérios e Talentos
    ministeriosInteresse: [] as string[],
    talentos: "",
    observacoes: "",
    dataSolicitacao: new Date().toISOString(),
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    let { id, value } = e.target;

    // Mascaramento simples
    if (id === "cpf" || id === "cpfConjuge") {
      value = value
        .replace(/\D/g, "")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})/, "$1-$2")
        .replace(/(-\d{2})\d+?$/, "$1");
    } else if (id === "celular" || id === "whatsapp" || id === "celularConjuge") {
      value = value
        .replace(/\D/g, "")
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5}|\d{4})(\d)/, "$1-$2")
        .replace(/(-\d{4})\d+?$/, "$1");
    } else if (id === "cep") {
      value = value
        .replace(/\D/g, "")
        .replace(/(\d{5})(\d)/, "$1-$2")
        .replace(/(-\d{3})\d+?$/, "$1");
    } else if (id.includes("data")) {
      value = value
        .replace(/\D/g, "")
        .replace(/(\d{2})(\d)/, "$1/$2")
        .replace(/(\d{2})(\d)/, "$1/$2")
        .replace(/(\/\d{4})\d+?$/, "$1");
    }

    if (id === "quantidadeFilhos") {
      const qtd = parseInt(value) || 0;
      setFormData((prev) => {
        const newList = [...prev.listaFilhos];
        if (qtd > newList.length) {
          for (let i = newList.length; i < qtd; i++) {
            newList.push({ nome: "", dataNascimento: "", sexo: "" });
          }
        } else {
          newList.length = qtd;
        }
        return { ...prev, quantidadeFilhos: qtd, listaFilhos: newList };
      });
      return;
    }

    setFormData((prev) => ({ ...prev, [id]: value }));
    setErrorMsg("");

    if (id === "cep" && value.replace(/\D/g, "").length === 8) {
      fetchAddressByCep(value);
    }
  };

  const fetchAddressByCep = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, "");
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();
      if (!data.erro) {
        setFormData((prev) => ({
          ...prev,
          rua: data.logradouro || prev.rua,
          bairro: data.bairro || prev.bairro,
          cidade: data.localidade || prev.cidade,
          estado: data.uf || prev.estado,
        }));
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    }
  };

  const handleChildChange = (index: number, field: string, value: string) => {
    let finalValue = value;
    if (field === "dataNascimento") {
      finalValue = value
        .replace(/\D/g, "")
        .replace(/(\d{2})(\d)/, "$1/$2")
        .replace(/(\d{2})(\d)/, "$1/$2")
        .replace(/(\/\d{4})\d+?$/, "$1");
    }

    setFormData((prev) => {
      const newList = [...prev.listaFilhos];
      newList[index] = { ...newList[index], [field]: finalValue };
      return { ...prev, listaFilhos: newList };
    });
  };

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      const ministerios = [...prev.ministeriosInteresse];
      if (checked) {
        ministerios.push(value);
      } else {
        const index = ministerios.indexOf(value);
        if (index > -1) ministerios.splice(index, 1);
      }
      return { ...prev, ministeriosInteresse: ministerios };
    });
  };

  const validateStep = (step: number) => {
    if (step === 1) {
      if (!formData.nome || !formData.sobrenome || !formData.dataNascimento || !formData.sexo || !formData.senha) {
        setErrorMsg("Preencha os campos obrigatórios da etapa pessoal, incluindo sua senha.");
        return false;
      }
      if (formData.senha.length < 6) {
        setErrorMsg("A senha deve ter pelo menos 6 caracteres.");
        return false;
      }
      if (formData.senha !== formData.confirmarSenha) {
        setErrorMsg("As senhas não coincidem.");
        return false;
      }
    }
    if (step === 2) {
      if (!formData.email || !formData.celular || !formData.cep || !formData.rua) {
        setErrorMsg("Preencha os campos obrigatórios de contato e endereço.");
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
      setErrorMsg("");
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setErrorMsg("");
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;

    setLoading(true);
    setErrorMsg("");
    try {
      // 0. Ensure signed out
      try { await signOut(auth); } catch (e) { /* ignore */ }

      // 1. Create Auth User
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email.trim(),
        formData.senha
      );
      const user = userCredential.user;

      // 2. Save in Members collection (for admin view)
      await setDoc(doc(db, "membros", user.uid), {
        ...formData,
        id: user.uid,
        status: "pendente_aprovacao",
        permissao: "membro",
        createdAt: serverTimestamp(),
      });

      // 3. Save in Users collection (for authentication status check)
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: formData.email.trim(),
        nome: `${formData.nome} ${formData.sobrenome}`,
        role: "membro",
        status: "pendente_aprovacao",
        createdAt: serverTimestamp(),
      });

      // 4. Log out immediately as they need approval
      await signOut(auth);

      setSuccessMsg("Sua ficha de cadastro foi enviada com sucesso! Você poderá acessar o sistema assim que sua ficha for aprovada pela secretaria.");
      setTimeout(() => navigate("/login"), 5000);
    } catch (error: any) {
      console.error("Registration error:", error);
      if (error.code === "auth/email-already-in-use") {
        setErrorMsg("Este e-mail já está sendo usado por outro usuário.");
      } else if (error.message && error.message.includes("permission")) {
        setErrorMsg("Erro de permissão no banco de dados. Por favor, entre em contato com o administrador.");
      } else {
        setErrorMsg("Erro ao enviar cadastro: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const ministeriosOptions = [
    "Acolhimento / Recepção",
    "Artes / Dança / Teatro",
    "Crianças (Kids)",
    "Comunicação / Mídia",
    "Diaconato",
    "Ensino / Discipulado",
    "Intercessão / Oração",
    "Louvor / Música",
    "Missões / Evangelismo",
    "Social / Beneficência",
    "Tecnologia / Som / Projeção",
    "Casais",
    "Jovens",
    "Adolescentes",
  ];

  return (
    <div className="pt-24 min-h-screen bg-[#f8fafc]">
      <div className="max-w-4xl mx-auto px-5 pb-20">
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-base/10 text-primary-base rounded-full text-xs font-black uppercase tracking-widest mb-4"
          >
            <Info size={14} /> Ficha de Cadastro Institucional
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-4xl font-black font-serif text-primary-dark mb-4"
          >
            Cadastro de Membro
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 max-w-xl mx-auto"
          >
            Seja bem-vindo à nossa família! Este cadastro nos ajuda a conhecer melhor você, sua família e como podemos caminhar juntos na fé.
          </motion.p>
        </div>

        {/* Progress Tracker */}
        <div className="mb-12 relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2 z-0" />
          <div className="relative z-10 flex justify-between items-center">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} className="flex flex-col items-center">
                  <button
                    onClick={() => step.id < currentStep && setCurrentStep(step.id)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border-4 ${
                      isActive
                        ? "bg-primary-base text-white border-primary-base scale-110 shadow-lg"
                        : isCompleted
                        ? "bg-green-500 text-white border-green-500"
                        : "bg-white text-gray-400 border-gray-200"
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 size={20} /> : <Icon size={20} />}
                  </button>
                  <span className={`mt-3 text-[10px] font-bold uppercase tracking-wider ${
                    isActive ? "text-primary-base" : isCompleted ? "text-green-600" : "text-gray-400"
                  }`}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Container */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 md:p-12 border border-blue-50"
        >
          {errorMsg && (
            <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg text-sm font-medium animate-pulse">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-8 p-6 bg-green-50 border-2 border-green-200 text-green-800 rounded-2xl text-center flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center">
                <CheckCircle2 size={32} />
              </div>
              <p className="text-lg font-bold">{successMsg}</p>
            </div>
          )}

          {!successMsg && (
            <form onSubmit={handleSubmit}>
              {/* STEP 1: PESSOAL */}
              {currentStep === 1 && (
                <div className="space-y-8">
                  <h3 className="text-2xl font-bold font-serif text-primary-dark border-b pb-4">Dados Pessoais</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase text-gray-400 ml-1">Nome*</label>
                      <input
                        type="text"
                        id="nome"
                        required
                        value={formData.nome}
                        onChange={handleInputChange}
                        placeholder="João"
                        className="form-input-m"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase text-gray-400 ml-1">Sobrenome*</label>
                      <input
                        type="text"
                        id="sobrenome"
                        required
                        value={formData.sobrenome}
                        onChange={handleInputChange}
                        placeholder="da Silva"
                        className="form-input-m"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase text-gray-400 ml-1">CPF</label>
                      <input
                        type="text"
                        id="cpf"
                        value={formData.cpf}
                        onChange={handleInputChange}
                        placeholder="000.000.000-00"
                        className="form-input-m"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase text-gray-400 ml-1">Data de Nascimento*</label>
                      <input
                        type="text"
                        id="dataNascimento"
                        required
                        value={formData.dataNascimento}
                        onChange={handleInputChange}
                        placeholder="dd/mm/aaaa"
                        className="form-input-m"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase text-gray-400 ml-1">Sexo*</label>
                      <select
                        id="sexo"
                        required
                        value={formData.sexo}
                        onChange={handleInputChange}
                        className="form-input-m"
                      >
                        <option value="">Selecione...</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Feminino">Feminino</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase text-gray-400 ml-1">Estado Civil</label>
                      <select
                        id="estadoCivil"
                        value={formData.estadoCivil}
                        onChange={handleInputChange}
                        className="form-input-m"
                      >
                        <option value="">Selecione...</option>
                        <option value="Solteiro(a)">Solteiro(a)</option>
                        <option value="Casado(a)">Casado(a)</option>
                        <option value="Viúvo(a)">Viúvo(a)</option>
                        <option value="Divorciado(a)">Divorciado(a)</option>
                        <option value="União Estável">União Estável</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase text-gray-400 ml-1">Escolaridade</label>
                      <select
                        id="escolaridade"
                        value={formData.escolaridade}
                        onChange={handleInputChange}
                        className="form-input-m"
                      >
                        <option value="">Selecione...</option>
                        <option value="Fundamental Incompleto">Fundamental Incompleto</option>
                        <option value="Fundamental Completo">Fundamental Completo</option>
                        <option value="Médio Completo">Médio Completo</option>
                        <option value="Superior Completo">Superior Completo</option>
                        <option value="Pós / Mestrado">Pós / Mestrado</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase text-gray-400 ml-1">Profissão</label>
                      <input
                        type="text"
                        id="profissao"
                        value={formData.profissao}
                        onChange={handleInputChange}
                        placeholder="Sua profissão atual"
                        className="form-input-m"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase text-gray-400 ml-1">Naturalidade</label>
                      <input
                        type="text"
                        id="naturalidade"
                        value={formData.naturalidade}
                        onChange={handleInputChange}
                        placeholder="Cidade/Estado onde nasceu"
                        className="form-input-m"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase text-primary-base ml-1">Crie uma Senha para Logar*</label>
                      <input
                        type="password"
                        id="senha"
                        required
                        value={formData.senha}
                        onChange={handleInputChange}
                        placeholder="Mínimo 6 caracteres"
                        className="form-input-m"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase text-primary-base ml-1">Confirme sua Senha*</label>
                      <input
                        type="password"
                        id="confirmarSenha"
                        required
                        value={formData.confirmarSenha}
                        onChange={handleInputChange}
                        placeholder="Repita a senha"
                        className="form-input-m"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: CONTATO E ENDEREÇO */}
              {currentStep === 2 && (
                <div className="space-y-8">
                  <h3 className="text-2xl font-bold font-serif text-primary-dark border-b pb-4">Contato & Endereço</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase text-gray-400 ml-1">E-mail Principal*</label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="exemplo@email.com"
                        className="form-input-m"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase text-gray-400 ml-1">Celular / WhatsApp*</label>
                      <input
                        type="tel"
                        id="celular"
                        required
                        value={formData.celular}
                        onChange={handleInputChange}
                        placeholder="(00) 00000-0000"
                        className="form-input-m"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase text-gray-400 ml-1">CEP*</label>
                      <input
                        type="text"
                        id="cep"
                        required
                        value={formData.cep}
                        onChange={handleInputChange}
                        placeholder="00000-000"
                        className="form-input-m"
                      />
                    </div>
                    <div className="md:col-span-3 space-y-1.5">
                      <label className="text-xs font-black uppercase text-gray-400 ml-1">Rua / Logradouro*</label>
                      <input
                        type="text"
                        id="rua"
                        required
                        value={formData.rua}
                        onChange={handleInputChange}
                        className="form-input-m"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase text-gray-400 ml-1">Número*</label>
                      <input
                        type="text"
                        id="numero"
                        required
                        value={formData.numero}
                        onChange={handleInputChange}
                        className="form-input-m"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase text-gray-400 ml-1">Bairro*</label>
                      <input
                        type="text"
                        id="bairro"
                        required
                        value={formData.bairro}
                        onChange={handleInputChange}
                        className="form-input-m"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase text-gray-400 ml-1">Cidade*</label>
                      <input
                        type="text"
                        id="cidade"
                        required
                        value={formData.cidade}
                        onChange={handleInputChange}
                        className="form-input-m"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase text-gray-400 ml-1">Estado*</label>
                      <select
                        id="estado"
                        required
                        value={formData.estado}
                        onChange={handleInputChange}
                        className="form-input-m"
                      >
                        <option value="">Selecione...</option>
                        <option value="AC">Acre</option>
                        <option value="AL">Alagoas</option>
                        <option value="AP">Amapá</option>
                        <option value="AM">Amazonas</option>
                        <option value="BA">Bahia</option>
                        <option value="CE">Ceará</option>
                        <option value="DF">Distrito Federal</option>
                        <option value="ES">Espírito Santo</option>
                        <option value="GO">Goiás</option>
                        <option value="MA">Maranhão</option>
                        <option value="MT">Mato Grosso</option>
                        <option value="MS">Mato Grosso do Sul</option>
                        <option value="MG">Minas Gerais</option>
                        <option value="PA">Pará</option>
                        <option value="PB">Paraíba</option>
                        <option value="PR">Paraná</option>
                        <option value="PE">Pernambuco</option>
                        <option value="PI">Piauí</option>
                        <option value="RJ">Rio de Janeiro</option>
                        <option value="RN">Rio Grande do Norte</option>
                        <option value="RS">Rio Grande do Sul</option>
                        <option value="RO">Rondônia</option>
                        <option value="RR">Roraima</option>
                        <option value="SC">Santa Catarina</option>
                        <option value="SP">São Paulo</option>
                        <option value="SE">Sergipe</option>
                        <option value="TO">Tocantins</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: VIDA CRISTÃ */}
              {currentStep === 3 && (
                <div className="space-y-8">
                  <h3 className="text-2xl font-bold font-serif text-primary-dark border-b pb-4">Vida Cristã</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase text-gray-400 ml-1">Data de Conversão</label>
                      <input
                        type="text"
                        id="dataConversao"
                        value={formData.dataConversao}
                        onChange={handleInputChange}
                        placeholder="dd/mm/aaaa"
                        className="form-input-m"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase text-gray-400 ml-1">Data de Batismo (Águas)</label>
                      <input
                        type="text"
                        id="dataBatismoAguas"
                        value={formData.dataBatismoAguas}
                        onChange={handleInputChange}
                        placeholder="dd/mm/aaaa"
                        className="form-input-m"
                      />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                       <label className="text-xs font-black uppercase text-gray-400 ml-1">Igreja Anterior</label>
                      <input
                        type="text"
                        id="igrejaAnterior"
                        value={formData.igrejaAnterior}
                        onChange={handleInputChange}
                        placeholder="Nome da última igreja que frequentou"
                        className="form-input-m"
                      />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-black uppercase text-gray-400 ml-1">Cargos / Ministérios na Igreja Anterior</label>
                      <textarea
                        id="cargosAnteriores"
                        rows={3}
                        value={formData.cargosAnteriores}
                        onChange={handleInputChange}
                        placeholder="Quais funções você exercia na igreja anterior?"
                        className="form-input-m pt-3"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: FAMÍLIA */}
              {currentStep === 4 && (
                <div className="space-y-8">
                  <h3 className="text-2xl font-bold font-serif text-primary-dark border-b pb-4">Família</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5 md:col-span-2">
                       <label className="text-xs font-black uppercase text-gray-400 ml-1">Nome do Cônjuge</label>
                      <input
                        type="text"
                        id="nomeConjuge"
                        value={formData.nomeConjuge}
                        onChange={handleInputChange}
                        placeholder="Caso seja casado(a)"
                        className="form-input-m"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase text-gray-400 ml-1">CPF do Cônjuge</label>
                      <input
                        type="text"
                        id="cpfConjuge"
                        value={formData.cpfConjuge}
                        onChange={handleInputChange}
                        placeholder="000.000.000-00"
                        className="form-input-m"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase text-gray-400 ml-1">Nascimento do Cônjuge</label>
                      <input
                        type="text"
                        id="dataNascimentoConjuge"
                        value={formData.dataNascimentoConjuge}
                        onChange={handleInputChange}
                        placeholder="dd/mm/aaaa"
                        className="form-input-m"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase text-gray-400 ml-1">Celular do Cônjuge</label>
                      <input
                        type="tel"
                        id="celularConjuge"
                        value={formData.celularConjuge}
                        onChange={handleInputChange}
                        placeholder="(00) 00000-0000"
                        className="form-input-m"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase text-gray-400 ml-1">Data do Casamento</label>
                      <input
                        type="text"
                        id="dataCasamento"
                        value={formData.dataCasamento}
                        onChange={handleInputChange}
                        placeholder="dd/mm/aaaa"
                        className="form-input-m"
                      />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-black uppercase text-gray-400 ml-1">Igreja / Religião do Cônjuge</label>
                      <input
                        type="text"
                        id="igrejaConjuge"
                        value={formData.igrejaConjuge}
                        onChange={handleInputChange}
                        placeholder="Qual igreja o cônjuge frequenta?"
                        className="form-input-m"
                      />
                    </div>
                    <div className="space-y-4 md:col-span-2 pt-4">
                      <label className="text-xs font-black uppercase text-gray-400 ml-1 block">Você tem filhos?</label>
                      <div className="flex gap-4">
                         <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="temFilhos"
                              value="sim"
                              checked={formData.temFilhos === "sim"}
                              onChange={(e) => setFormData(p => ({...p, temFilhos: e.target.value}))}
                              className="w-4 h-4 text-primary-base"
                            />
                            <span className="text-sm font-bold text-gray-600">Sim</span>
                         </label>
                         <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="temFilhos"
                              value="não"
                              checked={formData.temFilhos === "não"}
                              onChange={(e) => setFormData(p => ({...p, temFilhos: e.target.value}))}
                              className="w-4 h-4 text-primary-base"
                            />
                            <span className="text-sm font-bold text-gray-600">Não</span>
                         </label>
                      </div>
                    </div>

                    {formData.temFilhos === "sim" && (
                      <>
                        <div className="space-y-1.5 md:col-span-2">
                          <label className="text-xs font-black uppercase text-gray-400 ml-1">Quantidade de Filhos</label>
                          <select
                            id="quantidadeFilhos"
                            value={formData.quantidadeFilhos}
                            onChange={handleInputChange}
                            className="form-input-m"
                          >
                            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                              <option key={n} value={n}>{n}</option>
                            ))}
                          </select>
                        </div>

                        {formData.listaFilhos.map((filho, idx) => (
                          <div key={idx} className="md:col-span-2 p-6 bg-gray-50/50 rounded-2xl border border-gray-100 space-y-4">
                            <p className="text-xs font-black text-primary-base uppercase">Dados do {idx + 1}º Filho(a)</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-gray-400">Nome</label>
                                <input
                                  type="text"
                                  placeholder="Nome completo"
                                  value={filho.nome}
                                  onChange={(e) => handleChildChange(idx, "nome", e.target.value)}
                                  className="form-input-m !py-2 !text-xs"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-gray-400">Nascimento</label>
                                <input
                                  type="text"
                                  placeholder="dd/mm/aaaa"
                                  value={filho.dataNascimento}
                                  onChange={(e) => handleChildChange(idx, "dataNascimento", e.target.value)}
                                  className="form-input-m !py-2 !text-xs"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-gray-400">Sexo</label>
                                <select
                                  value={filho.sexo}
                                  onChange={(e) => handleChildChange(idx, "sexo", e.target.value)}
                                  className="form-input-m !py-2 !text-xs"
                                >
                                  <option value="">Sel...</option>
                                  <option value="M">Masculino</option>
                                  <option value="F">Feminino</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 5: MINISTÉRIOS E TALENTOS */}
              {currentStep === 5 && (
                <div className="space-y-8">
                  <h3 className="text-2xl font-bold font-serif text-primary-dark border-b pb-4">Ministérios & Talentos</h3>
                  
                  <div className="space-y-4">
                    <label className="text-sm font-black uppercase text-primary-base mb-2 block">
                      Em quais áreas você possui interesse em servir?
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-blue-50/30 p-6 rounded-2xl border border-blue-100">
                      {ministeriosOptions.map((opt) => (
                        <label key={opt} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg transition-colors cursor-pointer group">
                          <input
                            type="checkbox"
                            value={opt}
                            checked={formData.ministeriosInteresse.includes(opt)}
                            onChange={handleCheckboxChange}
                            className="w-4 h-4 text-primary-base rounded border-gray-300 focus:ring-primary-base"
                          />
                          <span className="text-sm font-medium text-gray-600 group-hover:text-primary-dark">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6 pt-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase text-gray-400 ml-1">Quais são seus principais talentos / habilidades?</label>
                      <textarea
                        id="talentos"
                        rows={4}
                        value={formData.talentos}
                        onChange={handleInputChange}
                        placeholder="Ex: Tocar violão, cozinhar, liderança, artesanato..."
                        className="form-input-m pt-3"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase text-gray-400 ml-1">Observações Gerais</label>
                      <textarea
                        id="observacoes"
                        rows={3}
                        value={formData.observacoes}
                        onChange={handleInputChange}
                        placeholder="Algo que gostaria de nos contar?"
                        className="form-input-m pt-3"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="mt-12 flex items-center justify-between pt-8 border-t border-gray-100">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1 || loading}
                  className={`flex items-center gap-2 font-bold transition-all ${
                    currentStep === 1 || loading
                      ? "opacity-0 pointer-events-none"
                      : "text-gray-400 hover:text-primary-base"
                  }`}
                >
                  <ArrowLeft size={18} /> Etapa Anterior
                </button>

                {currentStep < steps.length ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="bg-primary-base text-white px-8 py-3 rounded-full font-black flex items-center gap-2 hover:bg-primary-dark shadow-lg shadow-primary-base/20 transition-all active:scale-95"
                  >
                    Próxima Etapa <ArrowRight size={18} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-green-600 text-white px-10 py-4 rounded-full font-black flex items-center gap-2 hover:bg-green-700 shadow-xl shadow-green-600/30 transition-all active:scale-95 disabled:opacity-70"
                  >
                    {loading ? "Processando..." : <><Send size={18} /> Finalizar Meu Cadastro</>}
                  </button>
                )}
              </div>
            </form>
          )}
        </motion.div>

        {/* Footer Link */}
        <div className="text-center mt-10">
          <Link to="/login" className="text-sm font-bold text-gray-400 hover:text-primary-base transition-colors flex items-center justify-center gap-2">
            <ArrowLeft size={14} /> Voltar para o início
          </Link>
        </div>
      </div>

      <style>{`
        .form-input-m {
          width: 100%;
          background: #fdfdfe;
          border: 2px solid #e2e8f0;
          border-radius: 1rem;
          padding: 0.85rem 1rem;
          font-size: 0.95rem;
          font-weight: 600;
          color: #1e293b;
          outline: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .form-input-m:focus {
          border-color: #1a6496;
          background: #ffffff;
          box-shadow: 0 0 0 5px rgba(26, 100, 150, 0.1);
        }
        .form-input-m::placeholder {
          color: #94a3b8;
          font-weight: 400;
        }
      `}</style>
    </div>
  );
}
