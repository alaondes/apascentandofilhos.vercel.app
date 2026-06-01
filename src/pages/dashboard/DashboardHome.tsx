import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  Users,
  FileText,
  Package,
  UserCircle,
  Bell,
  X,
  GraduationCap,
  UserCheck,
  Smile,
  ExternalLink,
  UserPlus,
  CheckCircle2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  orderBy,
  limit,
  updateDoc,
  doc,
  arrayUnion,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";
import { db, auth } from "../../lib/firebase";
import { Settings } from "lucide-react";

const bannerImages = [
  {
    url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=2069",
    title: "Seja Bem-vindo ao Painel do Líder",
    subtitle: "Gerencie seus grupos e relatórios com facilidade",
  },
  {
    url: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=2070",
    title: "Novos Materiais Disponíveis",
    subtitle: "Confira as dinâmicas atualizadas na seção de Materiais",
  },
  {
    url: "https://images.unsplash.com/photo-1542037104857-ffbb0b9155fb?auto=format&fit=crop&q=80&w=1954",
    title: "Conferência de Líderes 2026",
    subtitle: "Inscrições abertas no portal do ministério",
  },
];

interface DashboardHomeProps {
  isEmbedded?: boolean;
}

export default function DashboardHome({ isEmbedded = false }: DashboardHomeProps) {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [stats, setStats] = useState({
    grupos: 0,
    relatorios: 0,
    alunos: 0,
    pedidos: 0,
  });
  const [avisos, setAvisos] = useState<any[]>([]);
  const [notificacoes, setNotificacoes] = useState<any[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<any | null>(
    null,
  );

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Linked course registrations states
  const [assignedRegistrations, setAssignedRegistrations] = useState<any[]>([]);
  const [selectedRegDetails, setSelectedRegDetails] = useState<any | null>(null);

  // States for inserting custom student to existing group
  const [myGroups, setMyGroups] = useState<any[]>([]);
  const [insertingReg, setInsertingReg] = useState<any | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [isInserting, setIsInserting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [courseForms, setCourseForms] = useState<any[]>([]);

  useEffect(() => {
    async function fetchForms() {
      try {
        const snap = await getDocs(collection(db, "course_forms"));
        const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setCourseForms(list);
      } catch (err) {
        console.error("Erro ao carregar formulários:", err);
      }
    }
    fetchForms();
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

  const getRegValue = (reg: any, sem: "maridoNome" | "esposaNome" | "email" | "celular" | "cep" | "endereco" | "bairro" | "numero" | "cidade" | "estado" | "complemento"): string => {
    if (!reg || !reg.formData) return "";
    
    let result = "";

    // Find the course form definition matching this registration's course title
    const matchedForm = courseForms.find((f) => normalizeCourseTitle(f.id) === normalizeCourseTitle(reg.courseTitle));
    
    // If we have fields from course form config:
    if (matchedForm && Array.isArray(matchedForm.fields)) {
      const fields = matchedForm.fields;
      let matchedField = null;

      if (sem === "maridoNome") {
        matchedField = fields.find(f => {
          const l = (f.label || "").toLowerCase();
          const i = (f.id || "").toLowerCase();
          return (l.includes("nome") || l.includes("completo") || l.includes("marido") || i.includes("nome") || i.includes("completo") || i.includes("nome_completo") || i.includes("marido")) &&
                 !(l.includes("esposa") || l.includes("mulher") || l.includes("conjuge") || l.includes("cônjuge") || l.includes("spouse") || l.includes("filho") || l.includes("filha") || l.includes("parceiro") || l.includes("parceira"));
        });
        // fallback
        if (!matchedField) {
          matchedField = fields.find(f => {
            const l = (f.label || "").toLowerCase();
            return l.includes("marido") || l.includes("titular");
          });
        }
      } else if (sem === "esposaNome") {
        matchedField = fields.find(f => {
          const l = (f.label || "").toLowerCase();
          const i = (f.id || "").toLowerCase();
          return l.includes("esposa") || l.includes("mulher") || l.includes("conjuge") || l.includes("cônjuge") || l.includes("spouse") || l.includes("parceira") || i.includes("esposa") || i.includes("mulher") || i.includes("conjuge");
        });
      } else if (sem === "email") {
        matchedField = fields.find(f => {
          const l = (f.label || "").toLowerCase();
          const i = (f.id || "").toLowerCase();
          return f.type === "email" || f.maskType === "email" || l.includes("email") || l.includes("e-mail") || i.includes("email") || i.includes("e-mail");
        });
      } else if (sem === "celular") {
        matchedField = fields.find(f => {
          const l = (f.label || "").toLowerCase();
          const i = (f.id || "").toLowerCase();
          return f.type === "tel" || f.maskType === "phone" || l.includes("whatsapp") || l.includes("tel") || l.includes("cel") || l.includes("phone") || l.includes("fone") || i.includes("tel") || i.includes("cel") || i.includes("phone");
        });
      } else if (sem === "cep") {
        matchedField = fields.find(f => {
          const l = (f.label || "").toLowerCase();
          const i = (f.id || "").toLowerCase();
          return f.maskType === "cep" || l.includes("cep") || i.includes("cep");
        });
      } else if (sem === "endereco") {
        matchedField = fields.find(f => {
          const l = (f.label || "").toLowerCase();
          const i = (f.id || "").toLowerCase();
          return l.includes("rua") || l.includes("endereco") || l.includes("endereço") || l.includes("logradouro") || i.includes("rua") || i.includes("endereco") || i.includes("endereço") || i.includes("logradouro");
        });
      } else if (sem === "bairro") {
        matchedField = fields.find(f => {
          const l = (f.label || "").toLowerCase();
          const i = (f.id || "").toLowerCase();
          return l.includes("bairro") || i.includes("bairro");
        });
      } else if (sem === "numero") {
        matchedField = fields.find(f => {
          const l = (f.label || "").toLowerCase();
          const i = (f.id || "").toLowerCase();
          return l.includes("numero") || l.includes("número") || l.includes("nº") || i.includes("numero") || i.includes("número") || i.includes("num");
        });
      } else if (sem === "cidade") {
        matchedField = fields.find(f => {
          const l = (f.label || "").toLowerCase();
          const i = (f.id || "").toLowerCase();
          return l.includes("cidade") || l.includes("municipio") || l.includes("município") || i.includes("cidade") || i.includes("municipio") || i.includes("município");
        });
      } else if (sem === "estado") {
        matchedField = fields.find(f => {
          const l = (f.label || "").toLowerCase();
          const i = (f.id || "").toLowerCase();
          return l.includes("estado") || l.includes("uf") || i.includes("estado") || i.includes("uf");
        });
      } else if (sem === "complemento") {
        matchedField = fields.find(f => {
          const l = (f.label || "").toLowerCase();
          const i = (f.id || "").toLowerCase();
          return l.includes("complemento") || i.includes("complemento");
        });
      }

      if (matchedField) {
        const foundKey = Object.keys(reg.formData).find(k => k.toLowerCase() === String(matchedField.id).toLowerCase());
        const val = foundKey ? reg.formData[foundKey] : undefined;
        if (val !== undefined && val !== null && String(val).trim() !== "") {
          result = String(val);
        }
      }
    }

    // Fallback: If no value was found from the course form fields, or if matchedForm has no fields, do direct keywords mapping
    if (!result) {
      const keywordsMap: Record<string, string[]> = {
        maridoNome: ["nome", "name", "completo", "marido", "titular", "estudante", "usuario", "usuário"],
        esposaNome: ["esposa", "mulher", "conjuge", "cônjuge", "parceira", "esposasabia", "esposa sábia"],
        email: ["email", "correio", "e-mail", "mail"],
        celular: ["whatsapp", "tel", "cel", "fone", "phone", "telefone"],
        cep: ["cep", "postal", "zip"],
        endereco: ["rua", "endereco", "endereço", "logradouro", "avenida", "av", "reside"],
        bairro: ["bairro", "distrito", "subb", "bairro"],
        numero: ["numero", "número", "nº", "num", "no."],
        cidade: ["cidade", "municipio", "município"],
        estado: ["estado", "uf", "u.f."],
        complemento: ["complemento", "comp", "bloco", "apto"]
      };

      const searchWords = keywordsMap[sem];
      if (searchWords) {
        const keys = Object.keys(reg.formData);
        const matchedKey = keys.find((k) => {
          const kLower = k.toLowerCase();
          if (sem === "maridoNome" && (kLower.includes("esposa") || kLower.includes("mulher") || kLower.includes("conjuge") || kLower.includes("cônjuge"))) {
            return false;
          }
          return searchWords.some((w) => kLower.includes(w));
        });
        if (matchedKey && reg.formData[matchedKey] !== undefined && reg.formData[matchedKey] !== null) {
          result = String(reg.formData[matchedKey]);
        }
      }
    }

    // Super fallback: pattern matching (e.g. for unstructured old forms, legacy, or when keys don't match)
    if (!result) {
      const values = Object.entries(reg.formData).map(([_, val]) => String(val || "").trim());
      if (sem === "email") {
        const found = values.find(val => val.includes("@") && val.includes("."));
        if (found) result = found;
      } else if (sem === "cep") {
        const found = values.find(val => /^\d{5}-?\d{3}$/.test(val));
        if (found) result = found;
      } else if (sem === "estado") {
        const found = values.find(val => val.length === 2 && /^[A-Z]{2}$/i.test(val));
        if (found) result = found;
      }
    }

    return result;
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

  // Sync groups of this leader
  useEffect(() => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const q = query(
      collection(db, "groups"),
      where("liderId", "==", uid)
    );
    async function fetchGroups() {
      try {
        const snap = await getDocs(q);
        const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setMyGroups(list);
      } catch (err) {
        console.error("Erro ao carregar os seus grupos:", err);
      }
    }
    fetchGroups();
  }, []);

  // Sync registrations assigned to this leader
  useEffect(() => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    
    const q = query(
      collection(db, "course_registrations"),
      where("assignedLeaderId", "==", uid)
    );
    async function fetchRegs() {
      try {
        const snap = await getDocs(q);
        const list = snap.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((reg: any) => !reg.insertedInGroupId);
        setAssignedRegistrations(list);
      } catch (err) {
        console.error("Erro ao carregar matrículas vinculadas:", err);
      }
    }
    fetchRegs();
  }, [courseForms]); // Depend on courseForms to make sure they are reactive if needed

  const handleInsertIntoGroup = async (registration: any, groupId: string) => {
    if (!registration || !groupId) return;
    setIsInserting(true);
    try {
      const studentName = getRegValue(registration, "maridoNome") || "Não especificado";
      const spouseName = getRegValue(registration, "esposaNome");
      const phone = getRegValue(registration, "celular") || "Sem telefone";
      const email = getRegValue(registration, "email") || "Sem email";
      const cep = getRegValue(registration, "cep");
      const endereco = getRegValue(registration, "endereco");
      const bairro = getRegValue(registration, "bairro");
      const numero = getRegValue(registration, "numero");
      const cidade = getRegValue(registration, "cidade");
      const estado = getRegValue(registration, "estado");
      const complemento = getRegValue(registration, "complemento");

      const coupleObj = {
        maridoNome: studentName,
        esposaNome: spouseName || "",
        email: email,
        celular: phone,
        telefone: phone,
        primeiraVez: true,
        cep: cep || "",
        endereco: endereco || "",
        bairro: bairro || "",
        numero: numero || "",
        cidade: cidade || "",
        estado: estado || "",
        complemento: complemento || "",
        registrationId: registration.id,
        formData: registration.formData || {}
      };

      const groupRef = doc(db, "groups", groupId);
      const groupDoc = await getDoc(groupRef);
      if (groupDoc.exists()) {
        const currentCasais = groupDoc.data().casais || [];
        const updatedCasais = [...currentCasais, coupleObj];
        
        // Update group casais list
        await updateDoc(groupRef, {
          casais: updatedCasais
        });

        // Update registration record to mark it as inserted
        await updateDoc(doc(db, "course_registrations", registration.id), {
          insertedInGroupId: groupId,
          insertedInGroupName: groupDoc.data().curso || "Grupo",
          insertedAt: serverTimestamp()
        });

        setSuccessMsg(`O aluno ${studentName} foi inserido com sucesso na turma!`);
        setTimeout(() => setSuccessMsg(null), 5000);
        setInsertingReg(null);
        setSelectedRegDetails(null);
        setSelectedGroupId("");
      } else {
        alert("Turma não encontrada.");
      }
    } catch (e: any) {
      console.error("Erro ao inserir na turma:", e);
      alert("Erro ao inserir na turma: " + e.message);
    } finally {
      setIsInserting(false);
    }
  };

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

        setAvisos(updateState);
        setNotificacoes(updateState);
      }
    } catch (e) {
      console.error("Erro ao marcar notificação como lida", e);
    }
  };

  const formatTimeAgo = (date: any) => {
    if (!date) return "";
    const now = new Date();
    const then = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} segundos`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} minutos`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} horas`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} dias`;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      if (!auth.currentUser) return;
      const uid = auth.currentUser.uid;

      try {
        const userDoc = await getDoc(doc(db, "users", uid));
        const userData = userDoc.data();
        if (
          userData?.role === "admin" ||
          auth.currentUser.email === "alaondez@gmail.com"
        ) {
          setIsAdmin(true);
        }

        // Fetch groups
        let gruposCount = 0;
        let alunosCount = 0;
        try {
          const groupsQuery = query(
            collection(db, "groups"),
            where("liderId", "==", uid),
          );
          const groupsSnap = await getDocs(groupsQuery);
          gruposCount = groupsSnap.size;
          groupsSnap.forEach((doc) => {
            alunosCount += doc.data().casais?.length || 0;
          });
        } catch (e) {
          console.warn("Could not fetch groups for stats:", e);
        }

        // Fetch reports
        let reportsCount = 0;
        try {
          const reportsQuery = query(
            collection(db, "reports"),
            where("liderId", "==", uid),
          );
          const reportsSnap = await getDocs(reportsQuery);
          reportsCount = reportsSnap.size;
        } catch (e) {
          console.warn("Could not fetch reports for stats:", e);
        }

        // Fetch orders
        let ordersCount = 0;
        try {
          const ordersQuery = query(
            collection(db, "orders"),
            where("liderId", "==", uid),
          );
          const ordersSnap = await getDocs(ordersQuery);
          ordersCount = ordersSnap.size;
        } catch (e) {
          console.warn("Could not fetch orders for stats:", e);
        }

        setStats({
          grupos: gruposCount,
          relatorios: reportsCount,
          alunos: alunosCount * 2, // 2 people per couple
          pedidos: ordersCount,
        });

        // Fetch Notifications and Avisos
        const notifQuery = query(
          collection(db, "notifications"),
          limit(50),
        );
        const notifSnap = await getDocs(notifQuery)
          .catch(e => { 
            console.warn("Could not fetch notifications directly, using fallback.", e);
            return { docs: [] }; 
          });
        const allFetchedNotifs = (notifSnap as any).docs.map((d: any) => ({
          id: d.id,
          ...d.data(),
        }));

        // Sort manually to avoid index requirement
        allFetchedNotifs.sort((a: any, b: any) => {
          const tA = a.createdAt?.seconds || 0;
          const tB = b.createdAt?.seconds || 0;
          return tB - tA;
        });

        setAvisos(
          allFetchedNotifs
            .filter((n: any) => n.targetType === "all")
            .slice(0, 3),
        );
        setNotificacoes(
          allFetchedNotifs
            .filter(
              (n: any) => n.targetType === "user" && n.targetUserId === uid,
            )
            .slice(0, 3),
        );
      } catch (error) {
        console.error("Error fetching stats: ", error);
      }
    };

    fetchStats();
  }, []);

  const innerContent = (
    <div className="w-full flex-1">
      <div className="relative h-[400px] bg-primary-dark overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/90 via-primary-dark/60 to-primary-dark/30 z-10" />
            <img
              src={bannerImages[currentSlide].url}
              alt="Banner"
              className="w-full h-full object-cover mix-blend-overlay"
            />
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6">
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-4xl md:text-5xl lg:text-6xl text-white font-serif font-bold tracking-wide drop-shadow-md"
              >
                {bannerImages[currentSlide].title}
              </motion.h1>
              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-lg text-white/70 mt-4 italic"
              >
                {bannerImages[currentSlide].subtitle}
              </motion.p>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="absolute bottom-6 left-0 right-0 z-30 flex justify-center gap-2">
          {bannerImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-8 h-1 rounded-full transition-all ${
                currentSlide === idx ? "bg-white" : "bg-white/30"
              }`}
            />
          ))}
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-6 py-8 md:py-12 w-full">
        <div className="grid md:grid-cols-4 gap-6 relative z-10">
          {[
            {
              title: "Grupos Ativos",
              value: stats.grupos,
              icon: <Users className="text-primary-base" />,
              color: "bg-primary-bg border-[#c8d8e8]",
            },
            {
              title: "Relatórios Enviados",
              value: stats.relatorios,
              icon: <FileText className="text-primary-base" />,
              color: "bg-primary-bg border-[#c8d8e8]",
            },
            {
              title: "Total de Alunos",
              value: stats.alunos,
              icon: <UserCircle className="text-primary-base" />,
              color: "bg-primary-bg border-[#c8d8e8]",
            },
            {
              title: "Materiais Pedidos",
              value: stats.pedidos,
              icon: <Package className="text-primary-base" />,
              color: "bg-primary-bg border-[#c8d8e8]",
            },
          ].map((stat, idx) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
              className="bg-white p-6 rounded-[20px] border-[1.5px] border-[#c8d8e8] shadow-sm flex items-center gap-4 hover:shadow-md hover:border-primary-base transition-all"
            >
              <div
                className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center shrink-0 border`}
              >
                {stat.icon}
              </div>
              <div>
                <p className="text-xs font-bold text-primary-base uppercase tracking-widest mb-1">
                  {stat.title}
                </p>
                <p className="text-3xl font-serif font-bold text-primary-dark">
                  {stat.value}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-[20px] border-[1.5px] border-[#c8d8e8] p-10 overflow-hidden relative shadow-sm">
            <div className="flex items-center justify-between mb-8 border-b-2 border-[#e2eaf3] pb-4">
              <h3 className="text-[1.5rem] font-bold font-serif text-primary-dark">
                Quadro de Avisos
              </h3>
              <button
                onClick={() => navigate("/dashboard/meus-dados?tab=avisos")}
                className="text-primary-base font-bold text-sm hover:underline cursor-pointer"
              >
                Ver todas
              </button>
            </div>
            <div className="space-y-6 relative z-10">
              {avisos.length > 0 ? (
                avisos.map((update) => {
                  const uid = auth.currentUser?.uid;
                  const isRead =
                    uid && update.readBy && update.readBy.includes(uid);
                  return (
                    <div
                      key={update.id}
                      onClick={() => handleNotificationClick(update)}
                      className="flex gap-4 pb-6 border-b border-[#e2eaf3] last:border-0 last:pb-0 cursor-pointer group hover:bg-[#f7fafd] -mx-4 px-4 rounded-xl transition-colors"
                    >
                      <div
                        className={`w-2 h-2 rounded-full mt-2 shrink-0 ${isRead ? "bg-gray-300" : "bg-primary-base shadow-[0_0_8px_rgba(26,100,150,0.5)]"}`}
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start gap-4">
                          <p
                            className={`font-bold mb-1 text-[1.05rem] group-hover:text-primary-base transition-colors ${isRead ? "text-gray-600" : "text-primary-dark"}`}
                          >
                            {update.title}
                          </p>
                          {isRead && (
                            <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">
                              Visualizada
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mb-2 whitespace-pre-wrap line-clamp-2">
                          {update.message}
                        </p>
                        <p className="text-xs text-gray-400 italic">
                          Há{" "}
                          {formatTimeAgo(
                            update.createdAt?.toDate
                              ? update.createdAt.toDate()
                              : update.createdAt,
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-sm">Nenhum aviso recente.</p>
              )}
            </div>
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#f7fafd] rounded-bl-full z-0 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary-bg rounded-tr-full z-0 pointer-events-none" />
          </div>

          <div className="bg-gradient-to-br from-primary-dark to-primary-base text-white rounded-[20px] p-10 flex flex-col justify-center items-center text-center shadow-[0_8px_32px_rgba(26,100,150,0.2)] relative overflow-hidden">
            <Package className="w-16 h-16 mb-6 text-white/30" />
            <h3 className="text-2xl font-serif font-bold mb-4 tracking-wide relative z-10">
              Precisa de Apostilas?
            </h3>
            <p className="text-white/80 mb-8 leading-relaxed font-medium relative z-10">
              Realize o pedido de material para sua nova turma diretamente pelo
              portal e receba em sua igreja.
            </p>
            <button
              onClick={() => navigate("/dashboard/materiais")}
              className="w-full bg-[#f9bc00] text-primary-dark py-4 rounded-xl font-black text-lg hover:bg-[#e5ae00] transition-all cursor-pointer shadow-lg hover:shadow-xl relative z-10"
            >
              Fazer Pedido
            </button>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-xl pointer-events-none" />
          </div>
        </div>

        {/* NOVAS INSCRIÇÕES VINCULADAS */}
        <div className="mt-12 bg-white rounded-[20px] border-[1.5px] border-[#c8d8e8] p-10 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b-2 border-[#e2eaf3] pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-xl">
                <GraduationCap size={22} />
              </div>
              <div>
                <h3 className="text-xl font-bold font-serif text-primary-dark">
                  Novos Alunos Direcionados para Você
                </h3>
                <p className="text-xs text-gray-500 mt-0.5 font-semibold">
                  Estes alunos foram vinculados por um administrador para você formar uma nova turma.
                </p>
              </div>
            </div>
            
            {assignedRegistrations.length > 0 && (
              <button
                onClick={() => {
                  // Gather all unique student data from assigned registrations and route them directly to forming a class
                  const prepCasais = assignedRegistrations.map((reg) => {
                    const phoneVal = getRegValue(reg, "celular") || "";
                    return {
                      maridoNome: getRegValue(reg, "maridoNome") || "Não especificado",
                      esposaNome: getRegValue(reg, "esposaNome") || "",
                      email: getRegValue(reg, "email") || "",
                      celular: phoneVal,
                      telefone: phoneVal,
                      cep: getRegValue(reg, "cep") || "",
                      endereco: getRegValue(reg, "endereco") || "",
                      bairro: getRegValue(reg, "bairro") || "",
                      numero: getRegValue(reg, "numero") || "",
                      cidade: getRegValue(reg, "cidade") || "",
                      estado: getRegValue(reg, "estado") || "",
                      complemento: getRegValue(reg, "complemento") || "",
                      primeiraVez: true,
                      registrationId: reg.id,
                      formData: reg.formData || {}
                    };
                  });

                  navigate("/dashboard/cadastrar-turma", { 
                    state: { 
                      initialCasais: prepCasais,
                      initialCurso: assignedRegistrations[0].courseTitle,
                      initialRegIds: assignedRegistrations.map((r) => r.id)
                    } 
                  });
                }}
                className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 transition-all shadow-md hover:shadow-lg cursor-pointer"
              >
                <UserCheck size={14} /> Formar Nova Turma com estes Alunos ({assignedRegistrations.length})
              </button>
            )}
          </div>

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-8 p-4 bg-emerald-50 border-[1.5px] border-emerald-200 text-emerald-850 rounded-2xl flex items-center gap-3"
            >
              <CheckCircle2 className="text-emerald-500" size={20} />
              <span className="text-xs font-extrabold">{successMsg}</span>
            </motion.div>
          )}

          {assignedRegistrations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center bg-gray-50/50 rounded-2xl border border-dashed border-[#e2eaf3]">
              <Smile size={32} className="text-[#a0b2c6] mb-2" />
              <h4 className="text-sm font-serif font-bold text-primary-dark">Nenhum aluno vinculado no momento</h4>
              <p className="text-xs text-gray-500 max-w-xs mt-1 leading-relaxed">
                Quando a administração direcionar novos interessados ou matriculados para você, eles aparecerão aqui com todos os dados para que você possa iniciar novos grupos.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              {assignedRegistrations.map((reg) => {
                const studentName = getRegValue(reg, "maridoNome") || "Não especificado";
                const spouseName = getRegValue(reg, "esposaNome");
                const phone = getRegValue(reg, "celular") || "Sem telefone";
                const email = getRegValue(reg, "email") || "Sem email";

                return (
                  <div 
                    key={reg.id} 
                    className="p-5 bg-gradient-to-br from-white to-[#f7fafd]/40 border-[1.5px] border-[#c8d8e8]/70 hover:border-emerald-500 rounded-2xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between animate-fade-in"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-3">
                        <span className="inline-block px-2.5 py-1 bg-[#1a6496]/5 text-[#1a6496] border border-[#1a6496]/20 rounded-lg text-[10px] font-black uppercase tracking-wider">
                          {reg.courseTitle}
                        </span>
                        <span className="text-[9px] font-medium text-gray-400">
                           {reg.createdAt ? new Date(reg.createdAt.seconds * 1000).toLocaleDateString("pt-BR") : "S/D"}
                        </span>
                      </div>

                      <h4 className="text-sm font-extrabold text-primary-dark leading-tight line-clamp-1">{studentName}</h4>
                      {spouseName && (
                        <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                          c/ {spouseName}
                        </p>
                      )}

                      <div className="mt-3 pt-3 border-t border-gray-100 space-y-1 text-[11px] text-[#2c4a63]">
                        <p className="font-semibold">{phone}</p>
                        <p className="text-gray-400 truncate">{email}</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
                      <button
                        onClick={() => setSelectedRegDetails(reg)}
                        className="w-full py-1.5 bg-gray-50 hover:bg-gray-100 text-primary-dark font-extrabold text-[10px] rounded-lg border border-gray-200 transition-all cursor-pointer text-center"
                      >
                        Ver Detalhes do Aluno
                      </button>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => {
                            const singleCouple = {
                              maridoNome: studentName,
                              esposaNome: spouseName || "",
                              email: email,
                              celular: phone,
                              telefone: phone,
                              cep: getRegValue(reg, "cep") || "",
                              endereco: getRegValue(reg, "endereco") || "",
                              bairro: getRegValue(reg, "bairro") || "",
                              numero: getRegValue(reg, "numero") || "",
                              cidade: getRegValue(reg, "cidade") || "",
                              estado: getRegValue(reg, "estado") || "",
                              complemento: getRegValue(reg, "complemento") || "",
                              primeiraVez: true,
                              registrationId: reg.id,
                              formData: reg.formData || {}
                            };
                            navigate("/dashboard/cadastrar-turma", { 
                              state: { 
                                initialCasais: [singleCouple],
                                initialCurso: reg.courseTitle,
                                initialRegIds: [reg.id]
                              } 
                            });
                          }}
                          className="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-500 hover:text-white text-emerald-700 font-extrabold text-[9px] rounded-lg border border-emerald-100 transition-all cursor-pointer flex items-center justify-center gap-0.5"
                        >
                          <ExternalLink size={10} /> Criar Turma
                        </button>
                        <button
                          onClick={() => {
                            setInsertingReg(reg);
                            setSelectedGroupId("");
                          }}
                          className="flex-1 py-1.5 bg-blue-50 hover:bg-blue-500 hover:text-white text-blue-700 font-extrabold text-[9px] rounded-lg border border-blue-100 transition-all cursor-pointer flex items-center justify-center gap-0.5"
                        >
                          <UserPlus size={10} /> Inserir em Turma
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Notification Modal */}
      <AnimatePresence>
        {selectedNotification && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-dark/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[20px] p-8 max-w-lg w-full shadow-2xl relative"
            >
              <button
                onClick={() => setSelectedNotification(null)}
                className="absolute top-6 right-6 text-gray-400 hover:text-primary-dark transition-colors"
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
              <div className="bg-[#f7fafd] p-6 rounded-xl border border-[#e2eaf3]">
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

      {/* Assigned Student Details Modal */}
      <AnimatePresence>
        {selectedRegDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-dark/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[20px] p-8 max-w-lg w-full shadow-2xl relative overflow-hidden"
            >
              <button
                onClick={() => setSelectedRegDetails(null)}
                className="absolute top-6 right-6 text-gray-400 hover:text-primary-dark transition-colors font-bold text-xl"
              >
                <X size={24} />
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                  <GraduationCap size={24} />
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    Matrícula Recebida
                  </span>
                  <h3 className="text-xl font-serif font-bold text-primary-dark">
                    {selectedRegDetails.courseTitle}
                  </h3>
                </div>
              </div>

              <div className="space-y-3.5 max-h-[50vh] overflow-y-auto pr-1">
                {selectedRegDetails.formData ? (
                  Object.entries(selectedRegDetails.formData).map(([key, value]: [string, any]) => (
                    <div key={key} className="p-3 border border-[#e2eaf3] rounded-xl bg-gray-50/30">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1a6496] block mb-1">
                        {getFieldLabel(selectedRegDetails.courseTitle, key)}
                      </span>
                      <span className="text-xs font-bold text-primary-dark">
                        {value === true ? "Sim" : value === false ? "Não" : String(value) || "-"}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic">Nenhum dado adicional.</p>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    const studentName = getRegValue(selectedRegDetails, "maridoNome") || "Estudante";
                    const spouseName = getRegValue(selectedRegDetails, "esposaNome") || "";
                    const phone = getRegValue(selectedRegDetails, "celular") || "";
                    const email = getRegValue(selectedRegDetails, "email") || "";
                    const cep = getRegValue(selectedRegDetails, "cep") || "";
                    const endereco = getRegValue(selectedRegDetails, "endereco") || "";
                    const bairro = getRegValue(selectedRegDetails, "bairro") || "";
                    const numero = getRegValue(selectedRegDetails, "numero") || "";
                    const cidade = getRegValue(selectedRegDetails, "cidade") || "";
                    const estado = getRegValue(selectedRegDetails, "estado") || "";
                    const complemento = getRegValue(selectedRegDetails, "complemento") || "";

                    const singleCouple = {
                      maridoNome: studentName,
                      esposaNome: spouseName,
                      email: email,
                      celular: phone,
                      cep: cep,
                      endereco: endereco,
                      bairro: bairro,
                      numero: numero,
                      cidade: cidade,
                      estado: estado,
                      complemento: complemento,
                      primeiraVez: true,
                      registrationId: selectedRegDetails.id,
                      formData: selectedRegDetails.formData || {}
                    };
                    setSelectedRegDetails(null);
                    navigate("/dashboard/cadastrar-turma", { 
                      state: { 
                        initialCasais: [singleCouple],
                        initialCurso: selectedRegDetails.courseTitle,
                        initialRegIds: [selectedRegDetails.id]
                      } 
                    });
                  }}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl text-center transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <ExternalLink size={14} /> Criar Nova Turma
                </button>
                <button
                  onClick={() => {
                    setInsertingReg(selectedRegDetails);
                    setSelectedRegDetails(null);
                  }}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl text-center transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <UserPlus size={14} /> Inserir em Turma
                </button>
                <button
                  onClick={() => setSelectedRegDetails(null)}
                  className="px-6 py-3 border border-gray-200 hover:bg-gray-50 text-gray-650 font-extrabold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal para Selecionar Turma Existente e Inserir */}
      <AnimatePresence>
        {insertingReg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-dark/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[20px] p-8 max-w-md w-full shadow-2xl relative"
            >
              <button
                onClick={() => setInsertingReg(null)}
                className="absolute top-6 right-6 text-gray-400 hover:text-primary-dark transition-colors font-bold text-xl cursor-pointer"
              >
                <X size={24} />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                  <UserPlus size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-primary-dark">
                    Inserir Aluno em Turma Existente
                  </h3>
                  <p className="text-xs text-gray-400 font-semibold leading-relaxed">
                    Escolha uma de suas turmas para incluir este participante.
                  </p>
                </div>
              </div>

              <div className="mb-6 p-4 bg-[#f7fafd] border border-[#c8d8e8] rounded-xl space-y-1">
                <p className="text-[10px] uppercase font-black tracking-wider text-gray-400">Aluno a Inserir</p>
                <p className="text-sm font-black text-primary-dark">
                  {(insertingReg.formData && (insertingReg.formData.nome || insertingReg.formData.name || insertingReg.formData.nomeCompleto || insertingReg.formData.completo)) || "Estudante"}
                </p>
                {insertingReg.formData && (insertingReg.formData.esposa || insertingReg.formData.nomeEsposa || insertingReg.formData.mulher) && (
                  <p className="text-xs text-gray-500 font-bold">
                    Cônjuge: {insertingReg.formData.esposa || insertingReg.formData.nomeEsposa || insertingReg.formData.mulher}
                  </p>
                )}
                <div className="inline-block mt-2 px-2 py-0.5 bg-[#1a6496]/5 text-[#1a6496] border border-[#1a6496]/20 rounded-md text-[9px] font-black uppercase tracking-wider">
                  {insertingReg.courseTitle}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-primary-dark mb-2">
                    Selecione a Turma
                  </label>
                  {myGroups.length === 0 ? (
                    <div className="p-4 text-center bg-amber-50/50 border border-dashed border-amber-200 rounded-xl">
                      <p className="text-xs text-amber-800 font-bold leading-relaxed">
                        Você ainda não possui nenhuma turma cadastrada no sistema.
                      </p>
                      <button
                        onClick={() => {
                          setInsertingReg(null);
                          navigate("/dashboard/cadastrar-turma");
                        }}
                        className="mt-3 px-4 py-2 bg-[#1a6496] hover:bg-primary-dark text-white rounded-lg text-[10px] font-black tracking-wider uppercase transition-all"
                      >
                        Cadastrar Turma Nova
                      </button>
                    </div>
                  ) : (
                    <select
                      value={selectedGroupId}
                      onChange={(e) => setSelectedGroupId(e.target.value)}
                      disabled={isInserting}
                      className="w-full px-3 py-2 bg-white border border-[#c8d8e8] rounded-xl text-xs font-bold text-primary-dark focus:outline-none focus:border-primary-base cursor-pointer"
                    >
                      <option value="">-- Escolha uma turma --</option>
                      {myGroups.map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.curso} {group.diaSemana ? ` - ${group.diaSemana}` : ""} {group.horario ? ` às ${group.horario}` : ""} {group.local ? ` (${group.local})` : ""} ({group.casais?.length || 0} casais)
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100 flex gap-3">
                  <button
                    disabled={isInserting || !selectedGroupId}
                    onClick={() => handleInsertIntoGroup(insertingReg, selectedGroupId)}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-200 text-white font-extrabold text-xs rounded-xl text-center transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {isInserting ? "Inserindo..." : "Confirmar Inserção"}
                  </button>
                  <button
                    disabled={isInserting}
                    onClick={() => {
                      setInsertingReg(null);
                      setSelectedGroupId("");
                    }}
                    className="px-5 py-3 border border-gray-200 hover:bg-gray-50 text-gray-600 font-extrabold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Re-use main footer if needed or provide a simple dashboard one */}
    </div>
  );

  return isEmbedded ? innerContent : <DashboardLayout>{innerContent}</DashboardLayout>;
}
