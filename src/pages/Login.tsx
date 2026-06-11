import React, { useState } from "react";
import {
  Lock,
  LogIn,
  UserPlus,
  AlertTriangle,
  Database,
  Info,
  Users,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import { auth, db } from "../lib/firebase";
import firebaseConfig from "../../firebase-applet-config.json";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [loginData, setLoginData] = useState({
    title: "Você já é líder?",
    subtitle: "E ainda não tem acesso, cadastre-se!",
    boxText:
      "Nesta área você poderá enviar os relatórios de cadastros e semanais de forma fácil e prática.",
    warningText:
      "Atenção: antes de se cadastrar, realize o treinamento de líder para ministrar.",
    infoText: "Seus relatórios ficarão armazenados na sua área pessoal.",
  });

  React.useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(doc(db, "content", "login"));
        if (snap.exists()) {
          setLoginData((prev) => ({ ...prev, ...snap.data() }));
        }
      } catch (err) {
        console.error("error loading login visual data", err);
      }
    }
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      let userCredential;
      try {
        userCredential = await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password,
        );
      } catch (signInError: any) {
        if (
          email.trim().toLowerCase() === "alaondez@gmail.com" &&
          (signInError.code === "auth/invalid-credential" ||
            signInError.code === "auth/user-not-found")
        ) {
          try {
            const { createUserWithEmailAndPassword } =
              await import("firebase/auth");
            userCredential = await createUserWithEmailAndPassword(
              auth,
              email.trim(),
              password,
            );
          } catch (createError: any) {
            if (createError.code === "auth/email-already-in-use") {
              throw signInError;
            }
            throw createError;
          }
        } else {
          throw signInError;
        }
      }

      let isAdmin = email.trim().toLowerCase() === "alaondez@gmail.com";
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));

      if (!userDoc.exists()) {
        try {
          await setDoc(doc(db, "users", userCredential.user.uid), {
            email: email.trim(),
            role: isAdmin ? "admin" : "leader",
            status: "ativo",
            nome: isAdmin ? "Administrador" : "Usuário (Recuperado)",
            createdAt: serverTimestamp(),
          });
        } catch (err) {
          console.error("Erro ao sincronizar Firestore", err);
        }
      }

      const userRole = userDoc.exists() ? userDoc.data()?.role : "leader";
      const userStatus = userDoc.exists() ? userDoc.data()?.status : "ativo";

      if (userStatus === "pendente_aprovacao") {
        await signOut(auth);
        setErrorMsg("Seu cadastro ainda está pendente de aprovação pela secretaria. Por favor, aguarde.");
        setLoading(false);
        return;
      }

      if (userStatus === "inativo") {
        await signOut(auth);
        setErrorMsg("Sua conta está inativa. Entre em contato com o administrador.");
        setLoading(false);
        return;
      }

      let isSecretary = false;
      let isFinancial = false;

      if (!isAdmin) {
        if (userRole === "admin") isAdmin = true;
        if (userRole === "secretary") isSecretary = true;
        if (userRole === "financial") isFinancial = true;
      }

      if (isAdmin || isSecretary || isFinancial) {
        navigate("/dashboard/admin", { replace: true });
      } else if (userRole === "editor") {
        navigate("/dashboard/admin", { replace: true });
      } else if (userRole === "membro" || userRole === "member") {
        navigate("/dashboard/admin", { replace: true });
      } else {
        navigate("/dashboard/admin", { replace: true });
      }
    } catch (error: any) {
      if (
        error.code !== "auth/invalid-credential" &&
        error.code !== "auth/invalid-login-credentials" &&
        error.code !== "auth/user-not-found" &&
        error.code !== "auth/wrong-password"
      ) {
        console.error("Erro no login:", error);
      }
      console.log("Current Firebase Project:", firebaseConfig.projectId);
      if (error.code === "auth/operation-not-allowed") {
        setErrorMsg(
          "O método de login por e-mail e senha não está ativado no seu projeto Firebase. Ative-o no console.",
        );
      } else if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/invalid-login-credentials" ||
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password" ||
        (error.message && error.message.includes("invalid-credential"))
      ) {
        setErrorMsg("E-mail ou senha incorretos.");
      } else if (error.code === "auth/too-many-requests") {
        setErrorMsg(
          "Muitas tentativas sem sucesso. Sua conta foi temporariamente bloqueada por segurança. Tente novamente em alguns minutos ou recupere sua senha.",
        );
      } else {
        setErrorMsg("Erro ao realizar login: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetErrorMsg, setResetErrorMsg] = useState("");
  const [resetSuccessMsg, setResetSuccessMsg] = useState("");

  const handlePasswordReset = async () => {
    setResetErrorMsg("");
    setResetSuccessMsg("");

    if (!resetEmail) {
      setResetErrorMsg("Por favor, digite seu e-mail para recuperar a senha.");
      return;
    }

    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetSuccessMsg(
        "Um link de recuperação foi enviado para o seu e-mail.",
      );
      setTimeout(() => {
        setIsModalOpen(false);
        setResetEmail("");
        setResetSuccessMsg("");
      }, 3000);
    } catch (error: any) {
      console.error("Erro na recuperação de senha:", error);
      setResetErrorMsg("Erro ao enviar e-mail: " + error.message);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-bg-main">
      {/* Page Header */}
      <section className="page-header">
        <h1>Acesso ao Sistema</h1>
        <p>Faça login para acessar o seu painel de controle</p>
      </section>

      <section className="max-w-[500px] mx-auto px-5 py-10 md:py-16 flex flex-col gap-8 items-stretch">
        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl shadow-[0_4px_28px_rgba(0,0,0,0.1)] p-8 md:p-10 flex flex-col w-full"
        >
          <h2 className="font-serif text-[1.4rem] font-bold text-primary-dark mb-6 flex items-center gap-2 border-b-2 border-border-color pb-2.5">
            <Lock size={20} className="text-primary-base" /> Entrar no Sistema
          </h2>

          <form
            onSubmit={handleSubmit}
            className="space-y-5 text-left flex-grow"
          >
            {errorMsg && (
              <div className="bg-red-50 text-danger p-4 rounded-xl border border-red-200 text-sm font-medium">
                <div>{errorMsg}</div>
                {(errorMsg === "E-mail ou senha incorretos." || errorMsg.includes("Muitas tentativas")) && (
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="inline-block mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm transition-colors cursor-pointer border border-red-200/50"
                  >
                    Esqueci minha senha
                  </button>
                )}
              </div>
            )}
            {successMsg && (
              <div className="bg-green-50 text-success p-4 rounded-xl border border-green-200 text-sm font-medium">
                {successMsg}
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-[0.82rem] font-semibold text-text-main block">
                E-mail
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@email.com"
                className="w-full px-3.5 py-2.5 border-[1.5px] border-border-color rounded-xl text-[0.88rem] bg-white focus:outline-none focus:border-primary-base transition-all text-text-main"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[0.82rem] font-semibold text-text-main block">
                Senha
              </label>
              <div className="relative w-full">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  className="w-full px-3.5 py-2.5 pr-10 border-[1.5px] border-border-color rounded-xl text-[0.88rem] bg-white focus:outline-none focus:border-primary-base transition-all text-text-main"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary-base focus:outline-none transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2 py-3 flex items-center justify-center gap-2 disabled:opacity-50 text-[0.95rem]"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Processando...
                </>
              ) : (
                <>
                  <LogIn size={18} /> Acessar Painel
                </>
              )}
            </button>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 text-sm border-t border-border-color mt-6">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-primary-base focus:ring-primary-base"
                />
                <span className="text-gray-600 transition-colors group-hover:text-primary-base font-medium">
                  Lembrar-me
                </span>
              </label>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="text-primary-base font-semibold hover:underline"
              >
                Esqueci minha senha
              </button>
            </div>
          </form>
        </motion.div>
      </section>

      {/* Recovery Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-0">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative bg-white w-full max-w-md p-8 rounded-2xl shadow-2xl z-10 text-center"
          >
            <h3 className="font-serif text-[1.4rem] font-bold text-primary-dark mb-4 flex items-center justify-center gap-2">
              <Lock size={20} className="text-primary-base" /> Recuperar Senha
            </h3>
            <p className="text-sm text-text-muted mb-6 leading-relaxed">
              Digite seu e-mail cadastrado e enviaremos um link para redefinir
              sua senha.
            </p>
            <input
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="seuemail@email.com"
              className="w-full px-4 py-2.5 rounded-xl border-[1.5px] border-border-color focus:outline-none focus:border-primary-base mb-4 text-[0.88rem]"
            />
            {resetErrorMsg && (
              <div className="bg-red-50 text-danger p-3 rounded-xl border border-red-200 text-sm font-medium mb-4">
                {resetErrorMsg}
              </div>
            )}
            {resetSuccessMsg && (
              <div className="bg-green-50 text-success p-3 rounded-xl border border-green-200 text-sm font-medium mb-4">
                {resetSuccessMsg}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handlePasswordReset}
                disabled={resetLoading}
                className="btn-primary flex-grow disabled:opacity-50 !py-2.5"
              >
                {resetLoading ? "Enviando..." : "Enviar"}
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 border-[1.5px] border-border-color rounded-xl font-bold text-text-muted hover:border-primary-base hover:text-primary-base transition-colors"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
