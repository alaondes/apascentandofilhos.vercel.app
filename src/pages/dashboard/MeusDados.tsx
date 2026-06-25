import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "motion/react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Church,
  Save,
  Camera,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  ShieldAlert,
  Heart,
  Bell,
  History,
  AlertTriangle,
  Info,
  Calendar,
  X,
} from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import { useFirebase } from "../../context/FirebaseContext";
import {
  auth,
  handleFirestoreError,
  OperationType,
  db,
} from "../../lib/firebase";
import {
  updatePassword,
  updateProfile,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import {
  doc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  arrayUnion,
} from "firebase/firestore";
import { cpfMask, phoneMask, cepMask, numberMask } from "../../lib/masks";

interface MeusDadosProps {
  isEmbedded?: boolean;
}

export default function MeusDados({ isEmbedded = false }: MeusDadosProps) {
  const { user, profile, refreshProfile } = useFirebase();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [loadingAvatar, setLoadingAvatar] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("dados_pessoais");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get("tab");
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [avisos, setAvisos] = useState<any[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [loadingAvisos, setLoadingAvisos] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<any | null>(
    null,
  );

  const handleNotificationClick = async (notif: any) => {
    setSelectedNotification(notif);
    try {
      const uid = auth.currentUser?.uid;
      if (uid && (!notif.readBy || !notif.readBy.includes(uid))) {
        await updateDoc(doc(db, "notifications", notif.id), {
          readBy: arrayUnion(uid),
        });
        // Update local state to reflect read status
        const updateState = (prev: any[]) =>
          prev.map((n) =>
            n.id === notif.id
              ? { ...n, readBy: [...(n.readBy || []), uid] }
              : n,
          );
        setNotifications(updateState);
        setAvisos(updateState);
      }
    } catch (e) {
      console.error("Erro ao marcar notificação como lida", e);
    }
  };

  // Password state
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [membroData, setMembroData] = useState<any>(null);

  const [formData, setFormData] = useState<any>({
    nome: "",
    cpf: "",
    dataNascimento: "",
    telefone: "",
    celular: "",
    email: "",
    profissao: "",
    igreja: "",
    observacoes: "",
    // Cônjuge
    nomeEsposa: "",
    cpfEsposa: "",
    dataNascimentoEsposa: "",
    telefoneEsposa: "",
    emailEsposa: "",
    // Endereço
    cep: "",
    endereco: "",
    numero: "",
    bairro: "",
    cidade: "",
    estado: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        nome:
          profile.nome ||
          (profile.nomeMarido
            ? `${profile.nomeMarido} ${profile.sobrenome || ""}`.trim()
            : ""),
        cpf: profile.cpf || "",
        dataNascimento: profile.dataNascimento || "",
        telefone: profile.telefone || "",
        celular: profile.celular || "",
        email: profile.email || "",
        profissao: profile.profissao || "",
        igreja: profile.igreja || "",
        observacoes: profile.observacoes || "",
        nomeEsposa:
          profile.nomeEsposa ||
          (profile.nomeEsposa
            ? `${profile.nomeEsposa} ${profile.sobrenomeEsposa || ""}`.trim()
            : ""),
        cpfEsposa: profile.cpfEsposa || "",
        dataNascimentoEsposa: profile.dataNascimentoEsposa || "",
        telefoneEsposa: profile.telefoneEsposa || "",
        emailEsposa: profile.emailEsposa || "",
        cep: profile.cep || "",
        endereco: profile.endereco || "",
        numero: profile.numero || "",
        bairro: profile.bairro || "",
        cidade: profile.cidade || "",
        estado: profile.estado || "",
      });
    }
  }, [profile]);

  useEffect(() => {
    let unsubscribe = () => {};
    if (auth.currentUser) {
      // Using onSnapshot to keep it real-time if the secretary updates it while the user is looking
      const docRef = doc(db, "membros", auth.currentUser.uid);
      import("firebase/firestore").then(({ onSnapshot }) => {
        unsubscribe = onSnapshot(docRef, (snap) => {
          if (snap.exists()) {
            setMembroData(snap.data());
          }
        });
      });
    }
    return () => unsubscribe();
  }, [auth.currentUser]);

  
  const validateField = (id: string, value: string) => {
    let err = "";
    if (id === "email" || id === "emailEsposa") {
      if (value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)) {
        err = "E-mail inválido";
      }
    }
    setErrors((prev: any) => ({ ...prev, [id]: err }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
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
    validateField(id, value);

    if (
      id === "cep" &&
      typeof value === "string" &&
      value.replace(/\D/g, "").length === 8
    ) {
      fetchAddressForProfile(value);
    }
  };

  const fetchAddressForProfile = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, "");
    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${cleanCep}/json/`,
      );
      const data = await response.json();
      if (!data.erro) {
        setFormData((prev) => ({
          ...prev,
          endereco: data.logradouro || prev.endereco,
          bairro: data.bairro || prev.bairro,
          cidade: data.localidade || prev.cidade,
          estado: data.uf || prev.estado,
        }));
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !auth.currentUser) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 2MB.");
      return;
    }

    setLoadingAvatar(true);
    setError(null);
    setSuccess(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement("canvas");
        const MAX_SIZE = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/webp", 0.85);

        try {
          const userRef = doc(db, "users", auth.currentUser!.uid);
          await updateDoc(userRef, {
            avatar: dataUrl,
          });
          await refreshProfile();
          toast.success("Foto de perfil atualizada!");
          
        } catch (err: any) {
          handleFirestoreError(
            err,
            OperationType.UPDATE,
            `users/${auth.currentUser?.uid}`,
          );
          toast.error("Erro ao atualizar a foto.");
        } finally {
          setLoadingAvatar(false);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !profile) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const fullName = formData.nome.trim();
      // 1. Update Auth Profile (Display Name)
      if (fullName !== auth.currentUser.displayName) {
        await updateProfile(auth.currentUser, { displayName: fullName });
      }

      // 2. Update Firestore Profile
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        nome: formData.nome,
        cpf: formData.cpf,
        dataNascimento: formData.dataNascimento,
        telefone: formData.telefone,
        celular: formData.celular,
        profissao: formData.profissao,
        igreja: formData.igreja,
        observacoes: formData.observacoes,
        nomeEsposa: formData.nomeEsposa,
        cpfEsposa: formData.cpfEsposa,
        dataNascimentoEsposa: formData.dataNascimentoEsposa,
        telefoneEsposa: formData.telefoneEsposa,
        emailEsposa: formData.emailEsposa,
        cep: formData.cep,
        endereco: formData.endereco,
        numero: formData.numero,
        bairro: formData.bairro,
        cidade: formData.cidade,
        estado: formData.estado,
        updatedAt: new Date().toISOString(),
      });

      await refreshProfile();
      toast.success("Dados salvos com sucesso!");
      
    } catch (err: any) {
      handleFirestoreError(
        err,
        OperationType.UPDATE,
        `users/${auth.currentUser.uid}`,
      );
      toast.error("Erro ao atualizar perfil.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    // ... logic remains the same ...
    if (!auth.currentUser || !auth.currentUser.email) return;

    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setPasswordLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        currentPassword,
      );
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);

      toast.success("Senha alterada com sucesso!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/wrong-password") {
        toast.error("Senha atual incorreta.");
      } else {
        toast.error("Erro ao alterar senha. Verifique sua senha atual.");
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  useEffect(() => {
    const fetchNotificationsAndAvisos = async () => {
      if (!user) return;
      setLoadingNotifications(true);
      setLoadingAvisos(true);
      try {
        const notifSnap = await getDocs(
          query(collection(db, "notifications"), orderBy("createdAt", "desc")),
        );
        const allNotifs = notifSnap.docs.map(
          (t) => ({ id: t.id, ...t.data() }) as any,
        );

        const myNotifs = allNotifs.filter(
          (n: any) => n.targetType === "user" && n.targetUserId === user.uid,
        );
        const myAvisos = allNotifs.filter((n: any) => n.targetType === "all");

        setNotifications(myNotifs);
        setAvisos(myAvisos);
      } catch (error) {
        console.error("Erro ao buscar notificações/avisos:", error);
      } finally {
        setLoadingNotifications(false);
        setLoadingAvisos(false);
      }
    };
    if (activeTab === "notificacoes" || activeTab === "avisos") {
      fetchNotificationsAndAvisos();
    }
  }, [user, activeTab]);

  const sideMenu = [
    { id: "dados_pessoais", label: "Dados Pessoais", icon: User },
    { id: "endereco", label: "Endereço", icon: MapPin },
    { id: "conjuge", label: "Cônjuge", icon: Heart },
    { id: "ficha_ministerial", label: "Ficha Ministerial (Secretaria)", icon: Church },
    { id: "senha_acesso", label: "Senha e Acesso", icon: Lock },
    { id: "avisos", label: "Quadro de Avisos", icon: Info },
    { id: "notificacoes", label: "Notificações", icon: Bell },
    { id: "historico", label: "Histórico", icon: History },
    { id: "minha_conta", label: "Minha Conta", icon: AlertTriangle },
  ];

  const innerContent = (
    <>
      <div className={`bg-bg-main ${isEmbedded ? 'h-full' : 'min-h-screen py-10 px-4 md:px-8'}`}>
      <div className={`mx-auto flex flex-col md:flex-row gap-6 ${isEmbedded ? 'w-full h-full' : 'max-w-6xl'}`}>
          {/* Left Sidebar Layout */}
          <div className="w-full md:w-72 shrink-0">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col">
              {/* User Avatar Section */}
              <div className="bg-[#3b7197] p-8 flex flex-col items-center justify-center text-white">
                <div className="w-24 h-24 bg-[#c8e1f5] rounded-full flex items-center justify-center text-[#3b7197] text-3xl font-medium mb-4 shadow-sm">
                  {profile?.avatar ? (
                    <img
                      src={profile.avatar || undefined}
                      alt="Avatar"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    getInitials(profile?.nome || formData.nomeMarido)
                  )}
                </div>
                <h3 className="font-bold text-lg">
                  {profile?.nome || "Usuário"}
                </h3>
                <p className="text-blue-100 text-sm">Líder de Grupo</p>
              </div>

              {/* Navigation List */}
              <div className="flex flex-col py-2">
                {sideMenu.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors border-l-4 ${
                      activeTab === item.id
                        ? "border-[#3b7197] bg-bg-main text-[#3b7197]"
                        : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm">
              <AnimatePresence mode="wait">
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="m-6 mb-0 bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center gap-3 text-emerald-600 font-medium text-sm"
                  >
                    <CheckCircle2 size={18} /> {success}
                  </motion.div>
                )}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="m-6 mb-0 bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-3 text-red-600 font-medium text-sm"
                  >
                    <ShieldAlert size={18} /> {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {activeTab === "dados_pessoais" && (
                <div className="p-6 md:p-8">
                  <div className="flex items-center gap-2 text-[#3b7197] font-bold text-lg mb-8 pb-4 border-b border-gray-100">
                    <User
                      fill="currentColor"
                      size={20}
                      className="opacity-80"
                    />
                    Dados Pessoais
                  </div>

                  {/* Profile Photo Box */}
                  <div className="bg-bg-main rounded-xl p-5 flex flex-col md:flex-row items-center gap-6 mb-6">
                    <div className="w-20 h-20 shrink-0 bg-[#c8e1f5] rounded-full flex items-center justify-center text-[#3b7197] text-2xl font-medium overflow-hidden">
                      {profile?.avatar ? (
                        <img
                          src={profile.avatar || undefined}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        getInitials(profile?.nome || formData.nomeMarido)
                      )}
                    </div>
                    <div className="flex-1 text-sm text-gray-600">
                      <p className="font-bold text-gray-900 mb-1">
                        Foto de perfil
                      </p>
                      <p>
                        Clique para alterar sua foto. Formatos aceitos: JPG,
                        PNG, WEBP. Máx. 2 MB.
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        Recomendado: imagem quadrada, mín. 200x200 px.
                      </p>
                    </div>

                    <input
                      type="file"
                      id="avatarUpload"
                      className="hidden"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleAvatarChange}
                    />
                    <label
                      htmlFor="avatarUpload"
                      className="flex items-center gap-2 bg-[#3b7197] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#2c5877] transition-colors shrink-0 cursor-pointer"
                    >
                      {loadingAvatar ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Camera size={16} />
                      )}
                      Alterar Foto
                    </label>
                  </div>

                  {/* Info Alert Box */}
                  <div className="bg-bg-main border border-[#d6e4f0] rounded-xl p-4 flex gap-3 text-sm text-[#3b7197] mb-8">
                    <Info size={20} className="shrink-0 mt-0.5" />
                    <p>
                      Seus dados são usados para identificar seu grupo e enviar
                      comunicados do ministério. Mantenha-[os] sempre
                      atualizados.
                    </p>
                  </div>

                  
                  <div className="flex justify-end mb-4">
                    {!isEditing ? (
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-[#3b7197] text-white text-sm font-bold rounded-lg hover:bg-[#2c5877] transition-colors"
                      >
                        Editar Perfil
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Cancelar Edição
                      </button>
                    )}
                  </div>

<form onSubmit={handleSaveProfile} className="space-y-6">
                    <div className="grid md:grid-cols-1 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700">
                          Nome Completo do Marido{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input id="nome" disabled={!isEditing} className={`form-input ${errors.nome ? "border-red-500 bg-red-50" : ""} ${!isEditing ? "opacity-70 bg-gray-50 cursor-not-allowed" : ""}`} value={formData.nome} onChange={handleInputChange} 
                          required
                        />
                        {errors.nome && <span className="text-red-500 text-xs mt-1 block">{errors.nome}</span>}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700">
                          CPF do Marido <span className="text-red-500">*</span>
                        </label>
                        <input id="cpf" disabled={!isEditing} className={`form-input ${errors.cpf ? "border-red-500 bg-red-50" : ""} ${!isEditing ? "opacity-70 bg-gray-50 cursor-not-allowed" : ""}`} value={formData.cpf} onChange={handleInputChange} 
                          placeholder="000.000.000-00"
                          required
                          maxLength={14}
                        />
                        {errors.cpf && <span className="text-red-500 text-xs mt-1 block">{errors.cpf}</span>}
                      </div>
                      <div className="space-y-1.5 relative">
                        <label className="text-sm font-semibold text-gray-700">
                          Data de Nascimento{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input id="dataNascimento" disabled={!isEditing} className={`form-input pr-10 ${errors.dataNascimento ? "border-red-500 bg-red-50" : ""} ${!isEditing ? "opacity-70 bg-gray-50 cursor-not-allowed" : ""}`} value={formData.dataNascimento} onChange={handleInputChange} 
                          required
                        />
                        {errors.dataNascimento && <span className="text-red-500 text-xs mt-1 block">{errors.dataNascimento}</span>}
                        <Calendar
                          size={18}
                          className="absolute right-3.5 top-9 text-gray-400 pointer-events-none"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700">
                          Telefone
                        </label>
                        <input id="telefone" disabled={!isEditing} className={`form-input ${errors.telefone ? "border-red-500 bg-red-50" : ""} ${!isEditing ? "opacity-70 bg-gray-50 cursor-not-allowed" : ""}`} value={formData.telefone} onChange={handleInputChange} 
                          placeholder="(11) 3456-7890"
                          maxLength={15}
                        />
                        {errors.telefone && <span className="text-red-500 text-xs mt-1 block">{errors.telefone}</span>}
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700">
                          Celular <span className="text-red-500">*</span>
                        </label>
                        <input id="celular" disabled={!isEditing} className={`form-input ${errors.celular ? "border-red-500 bg-red-50" : ""} ${!isEditing ? "opacity-70 bg-gray-50 cursor-not-allowed" : ""}`} value={formData.celular} onChange={handleInputChange} 
                          placeholder="(11) 99876-5432"
                          required
                          maxLength={15}
                        />
                        {errors.celular && <span className="text-red-500 text-xs mt-1 block">{errors.celular}</span>}
                      </div>
                    </div>

                    <div className="space-y-1.5 relative">
                      <label className="text-sm font-semibold text-gray-700">
                        E-mail principal <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={formData.email}
                        disabled
                        className="form-input opacity-70 bg-gray-50 cursor-not-allowed pr-10"
                      />
                      <Mail
                        size={18}
                        className="absolute right-3.5 top-9 text-gray-400 pointer-events-none"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700">
                          Profissão
                        </label>
                        <input id="profissao" disabled={!isEditing} className={`form-input ${errors.profissao ? "border-red-500 bg-red-50" : ""} ${!isEditing ? "opacity-70 bg-gray-50 cursor-not-allowed" : ""}`} value={formData.profissao} onChange={handleInputChange} 
                        />
                        {errors.profissao && <span className="text-red-500 text-xs mt-1 block">{errors.profissao}</span>}
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700">
                          Igreja / Congregação
                        </label>
                        <input id="igreja" disabled={!isEditing} className={`form-input ${errors.igreja ? "border-red-500 bg-red-50" : ""} ${!isEditing ? "opacity-70 bg-gray-50 cursor-not-allowed" : ""}`} value={formData.igreja} onChange={handleInputChange} 
                        />
                        {errors.igreja && <span className="text-red-500 text-xs mt-1 block">{errors.igreja}</span>}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700">
                        Sobre mim / Observações
                      </label>
                      <textarea id="observacoes" disabled={!isEditing} className={`form-input resize-y min-h-[100px] ${!isEditing ? "opacity-70 bg-gray-50 cursor-not-allowed" : ""}`} value={formData.observacoes} onChange={handleInputChange} 
                      ></textarea>
                    </div>

                    <div className="pt-4 flex items-center gap-3">
                      {isEditing && (
<button
                        type="submit"
                        disabled={loading}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#3b7197] text-white font-medium rounded-lg hover:bg-[#2c5877] transition-colors disabled:opacity-50"
                      >
                        {loading ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <Save size={18} />
                        )}
                        Salvar Dados Pessoais
                      </button>
)}
                      <button
                        type="button"
                        className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === "endereco" && (
                <div className="p-6 md:p-8">
                  <div className="flex items-center gap-2 text-[#3b7197] font-bold text-lg mb-8 pb-4 border-b border-gray-100">
                    <MapPin
                      fill="currentColor"
                      size={20}
                      className="opacity-80"
                    />
                    Endereço
                  </div>

                  
                  <div className="flex justify-end mb-4">
                    {!isEditing ? (
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-[#3b7197] text-white text-sm font-bold rounded-lg hover:bg-[#2c5877] transition-colors"
                      >
                        Editar Perfil
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Cancelar Edição
                      </button>
                    )}
                  </div>

<form onSubmit={handleSaveProfile} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700">
                          CEP
                        </label>
                        <input id="cep" disabled={!isEditing} className={`form-input ${errors.cep ? "border-red-500 bg-red-50" : ""} ${!isEditing ? "opacity-70 bg-gray-50 cursor-not-allowed" : ""}`} value={formData.cep} onChange={handleInputChange} 
                          placeholder="00000-000"
                          maxLength={9}
                        />
                        {errors.cep && <span className="text-red-500 text-xs mt-1 block">{errors.cep}</span>}
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700">
                          Endereço
                        </label>
                        <input id="endereco" disabled={!isEditing} className={`form-input ${errors.endereco ? "border-red-500 bg-red-50" : ""} ${!isEditing ? "opacity-70 bg-gray-50 cursor-not-allowed" : ""}`} value={formData.endereco} onChange={handleInputChange} 
                        />
                        {errors.endereco && <span className="text-red-500 text-xs mt-1 block">{errors.endereco}</span>}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700">
                          Número
                        </label>
                        <input id="numero" disabled={!isEditing} className={`form-input ${errors.numero ? "border-red-500 bg-red-50" : ""} ${!isEditing ? "opacity-70 bg-gray-50 cursor-not-allowed" : ""}`} value={formData.numero} onChange={handleInputChange} 
                        />
                        {errors.numero && <span className="text-red-500 text-xs mt-1 block">{errors.numero}</span>}
                      </div>
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-sm font-semibold text-gray-700">
                          Bairro
                        </label>
                        <input id="bairro" disabled={!isEditing} className={`form-input ${errors.bairro ? "border-red-500 bg-red-50" : ""} ${!isEditing ? "opacity-70 bg-gray-50 cursor-not-allowed" : ""}`} value={formData.bairro} onChange={handleInputChange} 
                        />
                        {errors.bairro && <span className="text-red-500 text-xs mt-1 block">{errors.bairro}</span>}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700">
                          Cidade
                        </label>
                        <input id="cidade" disabled={!isEditing} className={`form-input ${errors.cidade ? "border-red-500 bg-red-50" : ""} ${!isEditing ? "opacity-70 bg-gray-50 cursor-not-allowed" : ""}`} value={formData.cidade} onChange={handleInputChange} 
                        />
                        {errors.cidade && <span className="text-red-500 text-xs mt-1 block">{errors.cidade}</span>}
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700">
                          Estado
                        </label>
                        <select id="estado" disabled={!isEditing} className={`form-input ${!isEditing ? "opacity-70 bg-gray-50 cursor-not-allowed" : ""}`} value={formData.estado} onChange={handleInputChange} 
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

                    <div className="pt-4 flex items-center gap-3">
                      {isEditing && (
<button
                        type="submit"
                        disabled={loading}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#3b7197] text-white font-medium rounded-lg hover:bg-[#2c5877] transition-colors disabled:opacity-50"
                      >
                        {loading ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <Save size={18} />
                        )}
                        Salvar Endereço
                      </button>
)}
                    </div>
                  </form>
                </div>
              )}

              {activeTab === "conjuge" && (
                <div className="p-6 md:p-8">
                  <div className="flex items-center gap-2 text-[#3b7197] font-bold text-lg mb-8 pb-4 border-b border-gray-100">
                    <Heart
                      fill="currentColor"
                      size={20}
                      className="opacity-80"
                    />
                    Cônjuge
                  </div>

                  
                  <div className="flex justify-end mb-4">
                    {!isEditing ? (
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-[#3b7197] text-white text-sm font-bold rounded-lg hover:bg-[#2c5877] transition-colors"
                      >
                        Editar Perfil
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Cancelar Edição
                      </button>
                    )}
                  </div>

<form onSubmit={handleSaveProfile} className="space-y-6">
                    <div className="grid md:grid-cols-1 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700">
                          Nome Completo da Esposa
                        </label>
                        <input id="nomeEsposa" disabled={!isEditing} className={`form-input ${errors.nomeEsposa ? "border-red-500 bg-red-50" : ""} ${!isEditing ? "opacity-70 bg-gray-50 cursor-not-allowed" : ""}`} value={formData.nomeEsposa} onChange={handleInputChange} 
                        />
                        {errors.nomeEsposa && <span className="text-red-500 text-xs mt-1 block">{errors.nomeEsposa}</span>}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700">
                          CPF da Esposa
                        </label>
                        <input id="cpfEsposa" disabled={!isEditing} className={`form-input ${errors.cpfEsposa ? "border-red-500 bg-red-50" : ""} ${!isEditing ? "opacity-70 bg-gray-50 cursor-not-allowed" : ""}`} value={formData.cpfEsposa} onChange={handleInputChange} 
                          placeholder="000.000.000-00"
                          maxLength={14}
                        />
                        {errors.cpfEsposa && <span className="text-red-500 text-xs mt-1 block">{errors.cpfEsposa}</span>}
                      </div>
                      <div className="space-y-1.5 relative">
                        <label className="text-sm font-semibold text-gray-700">
                          Data de Nascimento da Esposa
                        </label>
                        <input id="dataNascimentoEsposa" disabled={!isEditing} className={`form-input pr-10 ${errors.dataNascimentoEsposa ? "border-red-500 bg-red-50" : ""} ${!isEditing ? "opacity-70 bg-gray-50 cursor-not-allowed" : ""}`} value={formData.dataNascimentoEsposa} onChange={handleInputChange} 
                        />
                        {errors.dataNascimentoEsposa && <span className="text-red-500 text-xs mt-1 block">{errors.dataNascimentoEsposa}</span>}
                        <Calendar
                          size={18}
                          className="absolute right-3.5 top-9 text-gray-400 pointer-events-none"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700">
                          Telefone / Celular da Esposa
                        </label>
                        <input id="telefoneEsposa" disabled={!isEditing} className={`form-input ${errors.telefoneEsposa ? "border-red-500 bg-red-50" : ""} ${!isEditing ? "opacity-70 bg-gray-50 cursor-not-allowed" : ""}`} value={formData.telefoneEsposa} onChange={handleInputChange} 
                          placeholder="(11) 99876-5432"
                          maxLength={15}
                        />
                        {errors.telefoneEsposa && <span className="text-red-500 text-xs mt-1 block">{errors.telefoneEsposa}</span>}
                      </div>
                      <div className="space-y-1.5 relative">
                        <label className="text-sm font-semibold text-gray-700">
                          E-mail da Esposa
                        </label>
                        <input id="emailEsposa" disabled={!isEditing} className={`form-input pr-10 ${errors.emailEsposa ? "border-red-500 bg-red-50" : ""} ${!isEditing ? "opacity-70 bg-gray-50 cursor-not-allowed" : ""}`} value={formData.emailEsposa} onChange={handleInputChange} 
                        />
                        {errors.emailEsposa && <span className="text-red-500 text-xs mt-1 block">{errors.emailEsposa}</span>}
                        <Mail
                          size={18}
                          className="absolute right-3.5 top-9 text-gray-400 pointer-events-none"
                        />
                      </div>
                    </div>

                    <div className="pt-4 flex items-center gap-3">
                      {isEditing && (
<button
                        type="submit"
                        disabled={loading}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#3b7197] text-white font-medium rounded-lg hover:bg-[#2c5877] transition-colors disabled:opacity-50"
                      >
                        {loading ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <Save size={18} />
                        )}
                        Salvar Dados do Cônjuge
                      </button>
)}
                    </div>
                  </form>
                </div>
              )}

              {activeTab === "ficha_ministerial" && (
                <div className="p-6 md:p-8">
                  <div className="flex items-center gap-2 text-[#3b7197] font-bold text-lg mb-8 pb-4 border-b border-gray-100">
                    <Church
                      fill="currentColor"
                      size={20}
                      className="opacity-80"
                    />
                    Ficha Ministerial
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8 text-sm text-blue-800 flex gap-3">
                    <Info size={20} className="flex-shrink-0 text-blue-600" />
                    <div>
                      <p className="font-bold mb-1">Apenas visualização</p>
                      <p>Estes dados são preenchidos e gerenciados exclusivamente pela secretaria da igreja. Para qualquer alteração, entre em contato com a administração.</p>
                    </div>
                  </div>

                  {membroData ? (
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Status de Consagração</h4>
                          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <p className="text-xs text-gray-500 font-bold mb-1">Possui consagração?</p>
                            <p className="text-sm font-medium text-gray-800 mb-4 capitalize">{membroData.consagrado || "Não"}</p>
                            
                            {membroData.consagrado === "sim" && (
                              <>
                                <p className="text-xs text-gray-500 font-bold mb-1">Cargo de Consagração</p>
                                <p className="text-sm font-medium text-[#3b7197] bg-blue-50 px-3 py-1.5 rounded-lg inline-block">{membroData.cargoConsagracao || "Não especificado"}</p>
                              </>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Classificação</h4>
                          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 h-[calc(100%-2.25rem)]">
                            <p className="text-xs text-gray-500 font-bold mb-2">Categorias Atuais</p>
                            {membroData.categorias && membroData.categorias.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {membroData.categorias.map((cat: string) => (
                                  <span key={cat} className="px-3 py-1 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-lg shadow-sm">
                                    {cat}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-400 italic">Nenhuma categoria atribuída.</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Atuações e Cargos (Departamentos/Ministérios)</h4>
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 min-h-[5rem]">
                          {membroData.cargos && membroData.cargos.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {membroData.cargos.map((cargo: string) => (
                                <span key={cargo} className="px-3 py-1.5 bg-[#3b7197]/10 border border-[#3b7197]/20 text-[#3b7197] text-xs font-bold rounded-lg">
                                  {cargo}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-400 italic pt-2">Nenhum cargo ativo no momento.</p>
                          )}
                        </div>
                      </div>

                      {membroData.camposAdicionais && membroData.camposAdicionais.length > 0 && (
                        <div className="min-w-0 w-full">
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Outras Informações</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0 w-full">
                            {membroData.camposAdicionais.map((campo: any, index: number) => (
                              <div key={campo.id || index} className="bg-gray-50 rounded-xl p-4 border border-gray-100 min-w-0 w-full overflow-hidden break-all break-words">
                                <p className="text-xs text-gray-500 font-bold mb-2 uppercase break-all break-words">{campo.titulo || "Informação"}</p>
                                <p className="text-sm font-medium text-gray-800 whitespace-pre-wrap break-all break-words">{campo.valor}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {membroData.anotacoesSecretaria && (
                        <div className="min-w-0 w-full">
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Anotações Relevantes</h4>
                          <div className="bg-orange-50 rounded-xl p-5 border border-orange-100 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed break-all break-words min-w-0 w-full overflow-hidden">
                            {membroData.anotacoesSecretaria}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12 flex flex-col items-center">
                      <Loader2 className="w-8 h-8 text-[#3b7197] animate-spin mb-4" />
                      <p className="text-gray-500">Carregando informações ministeriais...</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "senha_acesso" && (
                <div className="p-6 md:p-8">
                  <div className="flex items-center gap-2 text-[#3b7197] font-bold text-lg mb-8 pb-4 border-b border-gray-100">
                    <Lock
                      fill="currentColor"
                      size={20}
                      className="opacity-80"
                    />
                    Senha e Acesso
                  </div>

                  <form onSubmit={handleChangePassword} className="space-y-6">
                    <div className="space-y-1.5 relative max-w-md">
                      <label className="text-sm font-semibold text-gray-700">
                        Senha Atual
                      </label>
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="form-input"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        className="absolute right-3.5 top-9 text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        {showCurrentPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>

                    <div className="space-y-1.5 relative max-w-md">
                      <label className="text-sm font-semibold text-gray-700">
                        Nova Senha
                      </label>
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="form-input"
                        placeholder="Mínimo 6 caracteres"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3.5 top-9 text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        {showNewPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>

                    <div className="space-y-1.5 max-w-md">
                      <label className="text-sm font-semibold text-gray-700">
                        Confirmar Nova Senha
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="form-input"
                        placeholder="Repita a nova senha"
                        required
                      />
                    </div>

                    <div className="pt-4 flex items-center gap-3">
                      <button
                        type="submit"
                        disabled={passwordLoading}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#3b7197] text-white font-medium rounded-lg hover:bg-[#2c5877] transition-colors disabled:opacity-50"
                      >
                        {passwordLoading ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <Lock size={18} />
                        )}
                        Atualizar Senha
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === "avisos" && (
                <div className="p-6 md:p-8">
                  <div className="mb-8">
                    <h2 className="text-2xl font-serif text-[#1e293b] flex items-center gap-2">
                      <Info className="text-[#3b7197]" size={24} />
                      Quadro de Avisos
                    </h2>
                    <p className="text-gray-500 mt-1">
                      Avisos e comunicados gerais da liderança.
                    </p>
                  </div>

                  {loadingAvisos ? (
                    <div className="py-20 flex justify-center text-gray-400">
                      <Loader2 size={32} className="animate-spin" />
                    </div>
                  ) : avisos.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                      <Info size={48} className="mb-4 text-gray-300" />
                      <p>Você não tem avisos no momento.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {avisos.map((n) => {
                        const uid = auth.currentUser?.uid;
                        const isRead =
                          uid && n.readBy && n.readBy.includes(uid);
                        return (
                          <div
                            key={n.id}
                            onClick={() => handleNotificationClick(n)}
                            className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-start gap-4 cursor-pointer hover:border-gray-300 hover:shadow-md transition-all group"
                          >
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isRead ? "bg-gray-100 text-gray-400" : "bg-blue-50 text-blue-600"}`}
                            >
                              <Info size={20} />
                            </div>
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1 mb-1">
                                <div className="flex items-center gap-2">
                                  {!isRead && (
                                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                                  )}
                                  <h4
                                    className={`font-bold transition-colors ${isRead ? "text-gray-600" : "text-[#1e293b] group-hover:text-blue-600"}`}
                                  >
                                    {n.title}
                                  </h4>
                                </div>
                                <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
                                  {n.createdAt?.toDate
                                    ? n.createdAt
                                        .toDate()
                                        .toLocaleDateString("pt-BR")
                                    : ""}
                                </span>
                              </div>
                              <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                                {n.message}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "notificacoes" && (
                <div className="p-6 md:p-8">
                  <div className="mb-8">
                    <h2 className="text-2xl font-serif text-[#1e293b] flex items-center gap-2">
                      <Bell className="text-[#3b7197]" size={24} />
                      Notificações Individuais
                    </h2>
                    <p className="text-gray-500 mt-1">
                      Mensagens diretas e importantes da liderança para você.
                    </p>
                  </div>

                  {loadingNotifications ? (
                    <div className="py-20 flex justify-center text-gray-400">
                      <Loader2 size={32} className="animate-spin" />
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                      <Bell size={48} className="mb-4 text-gray-300" />
                      <p>Você não tem notificações no momento.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {notifications.map((n) => {
                        const uid = auth.currentUser?.uid;
                        const isRead =
                          uid && n.readBy && n.readBy.includes(uid);
                        return (
                          <div
                            key={n.id}
                            onClick={() => handleNotificationClick(n)}
                            className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-start gap-4 cursor-pointer hover:border-gray-300 hover:shadow-md transition-all group"
                          >
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isRead ? "bg-gray-100 text-gray-400" : "bg-blue-50 text-blue-600"}`}
                            >
                              <Bell size={20} />
                            </div>
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1 mb-1">
                                <div className="flex items-center gap-2">
                                  <h3
                                    className={`font-bold group-hover:text-blue-600 transition-colors ${isRead ? "text-gray-500" : "text-[#1e293b]"}`}
                                  >
                                    {n.title}
                                  </h3>
                                  {isRead && (
                                    <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                                      Visualizada
                                    </span>
                                  )}
                                </div>
                                {n.createdAt && (
                                  <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
                                    {new Date(
                                      n.createdAt.toDate
                                        ? n.createdAt.toDate()
                                        : n.createdAt,
                                    ).toLocaleDateString("pt-BR")}
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-600 text-sm whitespace-pre-wrap line-clamp-2">
                                {n.message}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Placholders for empty screens */}
              {activeTab !== "dados_pessoais" &&
                activeTab !== "senha_acesso" &&
                activeTab !== "endereco" &&
                activeTab !== "conjuge" &&
                activeTab !== "notificacoes" && (
                  <div className="p-6 md:p-12 text-center text-gray-500">
                    <p>Essa seção está em desenvolvimento.</p>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* Notification Modal */}
      <AnimatePresence>
        {selectedNotification && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[20px] p-8 max-w-lg w-full shadow-2xl relative"
            >
              <button
                onClick={() => setSelectedNotification(null)}
                className="absolute top-6 right-6 text-gray-400 hover:text-slate-900 transition-colors"
                title="Fechar (ESC)"
              >
                <X size={24} />
              </button>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-blue-50 text-primary-base rounded-full flex items-center justify-center shrink-0">
                  <Bell size={24} />
                </div>
                <h3 className="text-xl font-serif font-bold text-primary-dark">
                  {selectedNotification.title}
                </h3>
              </div>
              <div className="bg-[#f7fafd] p-6 rounded-xl border border-[#e2eaf3] max-h-[60vh] overflow-y-auto">
                <p className="text-text-main whitespace-pre-wrap leading-relaxed">
                  {selectedNotification.message}
                </p>
              </div>
              <div className="mt-6 flex justify-between items-center text-sm font-medium">
                <span className="text-gray-400">
                  Enviado em{" "}
                  {selectedNotification.createdAt?.toDate
                    ? selectedNotification.createdAt
                        .toDate()
                        .toLocaleString("pt-BR")
                    : ""}
                </span>
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="px-6 py-2 bg-primary-base text-white rounded-lg font-bold hover:bg-primary-dark transition-colors cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .form-input {
          width: 100%;
          padding: 0.625rem 1rem;
          border-radius: 0.5rem;
          background-color: white;
          border: 1px solid #d1d5db;
          font-size: 0.875rem;
          color: #111827;
          transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        }
        .form-input:focus {
          outline: none;
          border-color: #3b7197;
          box-shadow: 0 0 0 3px rgba(59, 113, 151, 0.1);
        }
        .form-input::placeholder {
          color: #9ca3af;
        }
      `}</style>
    </>
  );

  return isEmbedded ? innerContent : <DashboardLayout>{innerContent}</DashboardLayout>;
}
