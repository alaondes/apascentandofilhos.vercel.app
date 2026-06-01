import React, { useState, ChangeEvent } from "react";
import {
  User,
  MapPin,
  Send,
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

export default function Cadastro() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    dataNascimento: "",
    senha: "",
    confSenha: "",
    telefone: "",
    celular: "",
    email: "",
    confEmail: "",
    cep: "",
    rua: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    igreja: "",
    treinamento: false,
    termos: false,
    cursos: [] as string[],
    // Esposa
    nomeEsposa: "",
    cpfEsposa: "",
    dataNascimentoEsposa: "",
    telefoneEsposa: "",
    emailEsposa: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfPassword, setShowConfPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    let { id, value } = e.target;

    // Applying masks
    if (id === "cpf" || id === "cpfEsposa") {
      value = value
        .replace(/\D/g, "")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})/, "$1-$2")
        .replace(/(-\d{2})\d+?$/, "$1");
    } else if (
      id === "celular" ||
      id === "telefone" ||
      id === "telefoneEsposa"
    ) {
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
    } else if (id === "dataNascimento" || id === "dataNascimentoEsposa") {
      value = value
        .replace(/\D/g, "")
        .replace(/(\d{2})(\d)/, "$1/$2")
        .replace(/(\d{2})(\d)/, "$1/$2")
        .replace(/(\/\d{4})\d+?$/, "$1");
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
      const response = await fetch(
        `https://viacep.com.br/ws/${cleanCep}/json/`,
      );
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

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, checked, type, value } = e.target;
    setErrorMsg("");
    if (type === "checkbox" && id === "cursos") {
      const currentCursos = [...formData.cursos];
      if (checked) {
        currentCursos.push(value);
      } else {
        const index = currentCursos.indexOf(value);
        if (index > -1) currentCursos.splice(index, 1);
      }
      setFormData((prev) => ({ ...prev, cursos: currentCursos }));
    } else {
      setFormData((prev) => ({ ...prev, [id]: checked }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    if (
      !formData.nome ||
      !formData.cpf ||
      !formData.senha ||
      !formData.email ||
      !formData.celular ||
      !formData.cep ||
      !formData.rua ||
      !formData.bairro ||
      !formData.cidade ||
      !formData.estado ||
      !formData.igreja
    ) {
      setErrorMsg("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    if (formData.senha !== formData.confSenha) {
      setErrorMsg("As senhas não coincidem!");
      return;
    }
    if (!formData.termos) {
      setErrorMsg("Você precisa aceitar os termos.");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.senha,
      );
      const user = userCredential.user;

      // Create user profile in Firestore
      await setDoc(doc(db, "users", user.uid), {
        nome: formData.nome,
        cpf: formData.cpf,
        dataNascimento: formData.dataNascimento,
        email: formData.email,
        celular: formData.celular,
        telefone: formData.telefone,
        cep: formData.cep,
        rua: formData.rua,
        numero: formData.numero,
        complemento: formData.complemento,
        bairro: formData.bairro,
        cidade: formData.cidade,
        estado: formData.estado,
        igreja: formData.igreja,
        cursosMinistrados: formData.cursos,
        treinamentoConcluido: formData.treinamento,
        nomeEsposa: formData.nomeEsposa,
        cpfEsposa: formData.cpfEsposa,
        dataNascimentoEsposa: formData.dataNascimentoEsposa,
        telefoneEsposa: formData.telefoneEsposa,
        emailEsposa: formData.emailEsposa,
        role: "leader",
        status: "ativo",
        createdAt: serverTimestamp(),
      });

      setSuccessMsg("Cadastro realizado com sucesso! Redirecionando...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error: any) {
      if (
        error.code !== "auth/email-already-in-use" &&
        error.code !== "auth/operation-not-allowed"
      ) {
        console.error("Erro no cadastro:", error);
      }
      if (
        error.code === "auth/operation-not-allowed" ||
        (error.message && error.message.includes("operation-not-allowed"))
      ) {
        setErrorMsg(
          "O provedor E-mail/senha NÃO ESTÁ ATIVO no seu projeto Firebase. Ative-o em Authentication > Métodos de Login.",
        );
      } else if (
        error.code === "auth/email-already-in-use" ||
        (error.message && error.message.includes("email-already-in-use"))
      ) {
        setErrorMsg("Este e-mail já está em uso.");
      } else {
        setErrorMsg("Erro ao realizar cadastro: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const estados = [
    { value: "AC", name: "Acre" },
    { value: "AL", name: "Alagoas" },
    { value: "AP", name: "Amapá" },
    { value: "AM", name: "Amazonas" },
    { value: "BA", name: "Bahia" },
    { value: "CE", name: "Ceará" },
    { value: "DF", name: "Distrito Federal" },
    { value: "ES", name: "Espírito Santo" },
    { value: "GO", name: "Goiás" },
    { value: "MA", name: "Maranhão" },
    { value: "MT", name: "Mato Grosso" },
    { value: "MS", name: "Mato Grosso do Sul" },
    { value: "MG", name: "Minas Gerais" },
    { value: "PA", name: "Pará" },
    { value: "PB", name: "Paraíba" },
    { value: "PR", name: "Paraná" },
    { value: "PE", name: "Pernambuco" },
    { value: "PI", name: "Piauí" },
    { value: "RJ", name: "Rio de Janeiro" },
    { value: "RN", name: "Rio Grande do Norte" },
    { value: "RS", name: "Rio Grande do Sul" },
    { value: "RO", name: "Rondônia" },
    { value: "RR", name: "Roraima" },
    { value: "SC", name: "Santa Catarina" },
    { value: "SP", name: "São Paulo" },
    { value: "SE", name: "Sergipe" },
    { value: "TO", name: "Tocantins" },
  ];

  return (
    <div className="pt-20 min-h-screen bg-[#f7fafd]">
      {/* Header */}
      <section className="bg-gradient-to-br from-primary-base to-primary-light pt-14 pb-20 text-center text-white">
        <div className="max-w-[960px] mx-auto px-5">
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-[2.2rem] font-black font-serif tracking-wide mb-2"
          >
            Cadastro de Líder
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[1.05rem] opacity-90 max-w-[540px] mx-auto"
          >
            Preencha os dados abaixo para criar seu acesso à Área do Líder.
          </motion.p>
        </div>
      </section>

      <section className="max-w-[960px] mx-auto px-5 -mt-10 relative z-10 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[14px] shadow-[0_4px_28px_rgba(0,0,0,0.10)] px-6 md:px-11 py-10 md:py-12"
        >
          <form onSubmit={handleSubmit} className="space-y-12">
            {errorMsg && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 font-medium">
                <div>{errorMsg}</div>
                {errorMsg === "Este e-mail já está em uso." && (
                  <Link
                    to="/login"
                    className="inline-block mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm transition-colors cursor-pointer border border-red-200/50"
                  >
                    Ir para Login
                  </Link>
                )}
              </div>
            )}

            {successMsg && (
              <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-200 font-medium">
                {successMsg}
              </div>
            )}

            {/* Dados Pessoais */}
            <h2 className="text-[1.15rem] font-bold font-serif text-primary-dark m-0 mb-4 pb-2.5 border-b-2 border-[#e2eaf3] flex items-center gap-2">
              <User className="text-primary-base" size={20} /> Dados Pessoais
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div className="flex flex-col min-w-0">
                <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                  Nome Completo <span className="text-[#c0392b] ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  id="nome"
                  required
                  value={formData.nome}
                  onChange={handleInputChange}
                  placeholder="Ex.: João da Silva"
                  className="form-input"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                  CPF <span className="text-[#c0392b] ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  id="cpf"
                  required
                  value={formData.cpf}
                  onChange={handleInputChange}
                  placeholder="000.000.000-00"
                  className="form-input"
                />
              </div>

              <div className="flex flex-col min-w-0">
                <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                  Data de Nascimento{" "}
                  <span className="text-[#c0392b] ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  id="dataNascimento"
                  required
                  value={formData.dataNascimento}
                  onChange={handleInputChange}
                  placeholder="dd/mm/aaaa"
                  className="form-input"
                />
              </div>

              <div className="flex flex-col min-w-0">
                <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                  Celular <span className="text-[#c0392b] ml-0.5">*</span>
                </label>
                <input
                  type="tel"
                  id="celular"
                  required
                  value={formData.celular}
                  onChange={handleInputChange}
                  placeholder="(00) 00000-0000"
                  className="form-input"
                />
              </div>

              <div className="flex flex-col min-w-0">
                <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                  Senha <span className="text-[#c0392b] ml-0.5">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    id="senha"
                    value={formData.senha}
                    onChange={handleInputChange}
                    placeholder="Mínimo 6 caracteres"
                    className="form-input pr-12 w-full"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#b0c4d5] hover:text-primary-base focus:outline-none transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="flex flex-col min-w-0">
                <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                  Repetir Senha <span className="text-[#c0392b] ml-0.5">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfPassword ? "text" : "password"}
                    required
                    id="confSenha"
                    value={formData.confSenha}
                    onChange={handleInputChange}
                    placeholder="Confirme sua senha"
                    className="form-input pr-12 w-full"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfPassword(!showConfPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#b0c4d5] hover:text-primary-base focus:outline-none transition-colors"
                  >
                    {showConfPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex flex-col min-w-0 sm:col-span-1">
                <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                  E-mail <span className="text-[#c0392b] ml-0.5">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="seuemail@email.com"
                  className="form-input"
                />
              </div>
              <div className="flex flex-col min-w-0 sm:col-span-1">
                <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                  Igreja <span className="text-[#c0392b] ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  id="igreja"
                  required
                  value={formData.igreja}
                  onChange={handleInputChange}
                  placeholder="Nome da Igreja"
                  className="form-input"
                />
              </div>
            </div>

            {/* Dados do Cônjuge */}
            <h2 className="text-[1.15rem] font-bold font-serif text-primary-dark m-0 mb-4 pb-2.5 border-b-2 border-[#e2eaf3] flex items-center gap-2">
              <User className="text-primary-base" size={20} /> Dados do Cônjuge
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div className="flex flex-col min-w-0 sm:col-span-2">
                <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                  Nome Completo do Cônjuge{" "}
                  <span className="text-[#c0392b] ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  id="nomeEsposa"
                  required
                  value={formData.nomeEsposa}
                  onChange={handleInputChange}
                  placeholder="Ex.: Maria da Silva"
                  className="form-input"
                />
              </div>

              <div className="flex flex-col min-w-0">
                <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                  CPF do Cônjuge <span className="text-[#c0392b] ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  id="cpfEsposa"
                  required
                  value={formData.cpfEsposa}
                  onChange={handleInputChange}
                  placeholder="000.000.000-00"
                  className="form-input"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                  Data de Nascimento do Cônjuge{" "}
                  <span className="text-[#c0392b] ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  id="dataNascimentoEsposa"
                  required
                  value={formData.dataNascimentoEsposa}
                  onChange={handleInputChange}
                  placeholder="dd/mm/aaaa"
                  className="form-input"
                />
              </div>

              <div className="flex flex-col min-w-0">
                <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                  Celular do Cônjuge{" "}
                  <span className="text-[#c0392b] ml-0.5">*</span>
                </label>
                <input
                  type="tel"
                  id="telefoneEsposa"
                  required
                  value={formData.telefoneEsposa}
                  onChange={handleInputChange}
                  placeholder="(00) 00000-0000"
                  className="form-input"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                  E-mail do Cônjuge{" "}
                  <span className="text-[#c0392b] ml-0.5">*</span>
                </label>
                <input
                  type="email"
                  id="emailEsposa"
                  required
                  value={formData.emailEsposa}
                  onChange={handleInputChange}
                  placeholder="emaildoconjuge@email.com"
                  className="form-input"
                />
              </div>
            </div>

            {/* Endereço */}
            <h2 className="text-[1.15rem] font-bold font-serif text-primary-dark m-0 mb-4 mt-8 pb-2.5 border-b-2 border-[#e2eaf3] flex items-center gap-2">
              <MapPin className="text-primary-base" size={20} /> Endereço
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-6 gap-4 mb-4">
              <div className="sm:col-span-2 flex flex-col min-w-0">
                <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                  CEP <span className="text-[#c0392b] ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  id="cep"
                  required
                  value={formData.cep}
                  onChange={handleInputChange}
                  placeholder="00000-000"
                  className="form-input"
                />
              </div>
              <div className="sm:col-span-3 flex flex-col min-w-0">
                <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                  Rua / Logradouro{" "}
                  <span className="text-[#c0392b] ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  id="rua"
                  required
                  value={formData.rua}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
              <div className="sm:col-span-1 flex flex-col min-w-0">
                <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                  Número <span className="text-[#c0392b] ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  id="numero"
                  required
                  value={formData.numero}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
              <div className="flex flex-col min-w-0">
                <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                  Bairro <span className="text-[#c0392b] ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  id="bairro"
                  required
                  value={formData.bairro}
                  onChange={handleInputChange}
                  className="form-input"
                />
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
                  className="form-input"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                  Estado <span className="text-[#c0392b] ml-0.5">*</span>
                </label>
                <select
                  id="estado"
                  required
                  value={formData.estado}
                  onChange={handleInputChange}
                  className="form-input h-[42px]"
                >
                  <option value="">Selecione...</option>
                  {estados.map((e) => (
                    <option key={e.value} value={e.value}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Confirmações */}
            <div className="space-y-4 pt-6 border-t-2 border-[#e2eaf3] mb-8">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="treinamento"
                  required
                  checked={formData.treinamento}
                  onChange={handleCheckboxChange}
                  className="mt-1 w-4 h-4 rounded border-[#c8d8e8] text-primary-base focus:ring-primary-base"
                />
                <label
                  htmlFor="treinamento"
                  className="text-[0.89rem] text-[#2c4a63] leading-relaxed cursor-pointer font-medium"
                >
                  Confirmo que realizei o{" "}
                  <strong>treinamento de liderança</strong> oferecido pelo
                  ministério e estou apto(a) a ministrar grupos.
                </label>
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="termos"
                  required
                  checked={formData.termos}
                  onChange={handleCheckboxChange}
                  className="mt-1 w-4 h-4 rounded border-[#c8d8e8] text-primary-base focus:ring-primary-base"
                />
                <label
                  htmlFor="termos"
                  className="text-[0.89rem] text-[#2c4a63] leading-relaxed cursor-pointer font-medium"
                >
                  Li e aceito os{" "}
                  <a
                    href="#"
                    className="font-bold text-primary-base underline hover:text-primary-light"
                  >
                    Termos de Uso
                  </a>{" "}
                  e a{" "}
                  <a
                    href="#"
                    className="font-bold text-primary-base underline hover:text-primary-light"
                  >
                    Política de Privacidade
                  </a>{" "}
                  do ministério.
                </label>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-base text-white py-3.5 rounded-xl font-bold transition-all hover:bg-[#124b75] active:scale-[0.98] cursor-pointer flex items-center justify-center text-[1.1rem] disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 size={22} className="animate-spin mr-2" />{" "}
                    Processando...
                  </>
                ) : (
                  <>
                    <Send size={22} className="mr-2" /> Finalizar Cadastro
                  </>
                )}
              </button>

              {errorMsg && (
                <div className="mt-4 bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 font-medium text-center">
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="mt-4 bg-green-50 text-green-700 p-4 rounded-xl border border-green-200 font-medium text-center flex items-center justify-center flex-col">
                  {successMsg}
                </div>
              )}

              <Link
                to="/login"
                className="flex items-center justify-center gap-2 mt-6 text-primary-base hover:text-[#124b75] font-bold transition-colors"
              >
                <ArrowLeft size={18} /> Já tenho cadastro — fazer login
              </Link>
            </div>
          </form>
        </motion.div>
      </section>

      {/* Styled JSX for the form-input class */}
      <style>{`
        .form-input {
          width: 100%;
          border: 1.5px solid #c8d8e8;
          border-radius: 0.5rem;
          padding: 0.5rem 0.75rem;
          font-size: 0.92rem;
          color: #222;
          background-color: #f7fafd;
          outline: none;
          transition: all 0.3s ease;
        }
        .form-input::placeholder {
           color: #b0c4d5;
        }
        .form-input:focus {
          border-color: #1a6496;
          background-color: #ffffff;
          box-shadow: 0 0 0 3px rgba(26, 100, 150, 0.1);
        }
      `}</style>
    </div>
  );
}
