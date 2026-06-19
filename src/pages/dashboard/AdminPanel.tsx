import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Users,
  BookOpen,
  FileText,
  Package,
  ShieldCheck,
  Search,
  Calendar,
  AlertCircle,
  Edit,
  X,
  Check,
  Trash2,
  Download,
  ArrowLeft,
  Bell,
  Send,
  Heart,
  MapPin,
  Lock,
  User,
  Ban,
  UserCheck,
  MessageCircle,
  GraduationCap,
  MessageSquare,
  Mail,
  Edit2,
  Palette,
  Image as ImageIcon,
  Layout,
  Home,
  Award,
  Settings,
  LayoutDashboard,
  PlusCircle,
  HelpCircle,
  History,
  UserCircle,
  Edit3,
  DollarSign,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Grid,
  Building,
  Baby,
  Video,
} from "lucide-react";
import {
  collection,
  query,
  orderBy,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { sendPasswordResetEmail } from "firebase/auth";
import { db, auth } from "../../lib/firebase";
import { useFirebase } from "../../context/FirebaseContext";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import ManageCourseRegistrations from "./ManageCourseRegistrations";
import ManageMembers from "./ManageMembers";
import ManagePermissions from "./ManagePermissions";
import MemberDashboardComponent from "./MemberDashboardComponent";
import GlobalContentPanel from "./GlobalContentPanel";
import DashboardHome from "./DashboardHome";
import GruposCadastrados from "./GruposCadastrados";
import CadastrarTurma from "./CadastrarTurma";
import EnviarRelatorio from "./EnviarRelatorio";
import MeusRegistros from "./MeusRegistros";
import PedidoMaterial from "./PedidoMaterial";
import Duvidas from "./Duvidas";
import MeusDados from "./MeusDados";
import RestrictedEditionPanel from "./RestrictedEditionPanel";
import ColunistaPanelComponent from "./ColunistaPanelComponent";
import FilhosDePazPanel from "./FilhosDePazPanel";
import AgendaPanel from "./AgendaPanel";
import MafKidsAdmin from "./MafKidsAdmin";

const COURSES_LIST = [
  "Casados para Sempre",
  "ONE",
  "Crown",
  "Aliança",
  "Veredas Antigas",
  "Liderança MMI",
  "Pais para Toda a Vida",
];

export default function AdminPanel() {
  const { user, profile } = useFirebase();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [registrationsCount, setRegistrationsCount] = useState(0);

  const [usersList, setUsersList] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [notificationsHistory, setNotificationsHistory] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [supportTickets, setSupportTickets] = useState<any[]>([]);

  // WhatsApp State
  const [whatsappData, setWhatsappData] = useState({
    message: "",
    targetType: "user",
    targetUserId: "",
  });

  const [answeringTicketId, setAnsweringTicketId] = useState<string | null>(
    null,
  );
  const [ticketReplyText, setTicketReplyText] = useState("");

  // Notifications State
  const [notificationData, setNotificationData] = useState({
    title: "",
    message: "",
    targetType: "all",
    targetUserId: "",
  });
  const [isSendingNotification, setIsSendingNotification] = useState(false);

  // Edit User State
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [activeModalTab, setActiveModalTab] = useState<
    "marido" | "esposa" | "endereco" | "acesso"
  >("marido");

  // Treinamento State
  const [editingTreinamentoUser, setEditingTreinamentoUser] = useState<
    any | null
  >(null);
  const [treinamentoCourses, setTreinamentoCourses] = useState<string[]>([]);

  // Edit Group State
  const [editingGroup, setEditingGroup] = useState<any | null>(null);
  const [editGroupData, setEditGroupData] = useState<any>({});
  const [activeGroupModalTab, setActiveGroupModalTab] = useState<
    "info" | "lideres" | "endereco" | "igreja" | "casais"
  >("info");

  // Edit Report State
  const [editingReport, setEditingReport] = useState<any | null>(null);
  const [editReportData, setEditReportData] = useState<any>({});

  // Edit Order State
  const [editingOrder, setEditingOrder] = useState<any | null>(null);
  const [editOrderData, setEditOrderData] = useState<any>({});

  // Delete confirm state
  const [resetPasswordConfirm, setResetPasswordConfirm] = useState<string | null>(null);
  const [deleteAnswerConfirm, setDeleteAnswerConfirm] = useState<any | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    collection: string;
    id: string;
  } | null>(null);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  // Dashboard selection state
  const [selectedDashboard, setSelectedDashboard] = useState<string | null>(
    null,
  );

  // Helper for multiple roles
  const hasRole = (roleKeys: string[]) => {
    if (user?.email === "alaondez@gmail.com") return true;

    // Admin check is implicit in multi-roles sometimes
    const checkRole = (val: string | string[]) => {
      if (Array.isArray(val)) {
        return val.some(
          (v) => roleKeys.includes(v) || v === "admin" || v === "super_admin",
        );
      }
      return roleKeys.includes(val) || val === "admin" || val === "super_admin";
    };

    // specific early admin check
    if (roleKeys.includes("admin")) {
      const p = profile?.papel;
      const r = profile?.role;
      if (
        Array.isArray(p)
          ? p.includes("admin") || p.includes("super_admin")
          : p === "admin" || p === "super_admin"
      )
        return true;
      if (
        Array.isArray(r)
          ? r.includes("admin") || r.includes("super_admin")
          : r === "admin" || r === "super_admin"
      )
        return true;
      return false;
    }

    const hasAnyRole = checkRole(profile?.role) || checkRole(profile?.papel);
    return hasAnyRole;
  };

  const isAdmin = hasRole(["admin", "super_admin"]);
  const isEditor = hasRole(["editor"]);
  const isSecretary = hasRole(["secretary", "secretaria"]);
  const isFinancial = hasRole(["financial"]);
  const isMembro = hasRole(["membro", "member"]);
  const isColunista = hasRole(["colunista", "columnist"]);
  const isEditorEdificado = hasRole(["editor_edificado"]);
  const isEditorMaf = hasRole(["editor_maf"]);
  const isEditorFilhosDePaz = hasRole(["editor_filhos_de_paz"]);

  // A leader is someone who specifically has the leader role,
  // OR someone who has a profile but no other specific admin role assigned.
  const isLeader =
    hasRole(["leader", "lider"]) ||
    (profile &&
      !isAdmin &&
      !isEditor &&
      !isEditorEdificado &&
      !isEditorMaf &&
      !isEditorFilhosDePaz &&
      !isSecretary &&
      !isFinancial &&
      !isColunista &&
      !isMembro);

  const availableDashboards = [];
  if (isAdmin || isMembro) {
    availableDashboards.push({
      id: "membro",
      name: "Painel do Membro",
      icon: Users,
    });
  }
  if (isAdmin || isLeader) {
    availableDashboards.push({
      id: "lider",
      name: "Painel do Líder",
      icon: LayoutDashboard,
    });
  }
  if (isAdmin || isSecretary) {
    availableDashboards.push({
      id: "secretaria",
      name: "Painel Secretaria",
      icon: Users,
    });
    availableDashboards.push({
      id: "edicao_restrita",
      name: "Painel Edição Restrita",
      icon: Lock,
    });
  }
  if (isAdmin || isFinancial) {
    availableDashboards.push({
      id: "financeiro",
      name: "Painel Financeiro",
      icon: DollarSign,
    });
  }
  if (isAdmin || isEditor) {
    availableDashboards.push({
      id: "conteudo",
      name: "Painel Conteúdo do Site",
      icon: Layout,
    });
  }
  if (isAdmin || isEditorEdificado) {
    availableDashboards.push({
      id: "edificado_painel",
      name: "Painel Edificado Matrimônio",
      icon: Heart,
    });
  }
  if (isAdmin || isEditorMaf) {
    availableDashboards.push({
      id: "maf_painel",
      name: "Painel Escola MAF",
      icon: BookOpen,
    });
    availableDashboards.push({
      id: "maf_kids_painel",
      name: "Painel MAF Kids",
      icon: Baby,
    });
  }
  if (isAdmin || isEditorFilhosDePaz) {
    availableDashboards.push({
      id: "filhos_de_paz_painel",
      name: "Painel Filhos de Paz",
      icon: Home,
    });
  }
  if (isAdmin || isColunista) {
    availableDashboards.push({
      id: "colunista",
      name: "Painel do Colunista",
      icon: Edit3,
    });
  }

  const [dashboardOrder, setDashboardOrder] = useState<string[]>([]);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [tempOrderList, setTempOrderList] = useState<{id: string, name: string, icon: any}[]>([]);

  useEffect(() => {
    if (user?.uid) {
      const saved = localStorage.getItem(`dashboard_order_${user.uid}`);
      if (saved) {
        try {
          setDashboardOrder(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse dashboard order");
        }
      }
    }
  }, [user]);

  if (dashboardOrder.length > 0) {
    availableDashboards.sort((a, b) => {
      const indexA = dashboardOrder.indexOf(a.id);
      const indexB = dashboardOrder.indexOf(b.id);
      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }

  const handleOpenOrderModal = () => {
    setTempOrderList([...availableDashboards]);
    setIsOrderModalOpen(true);
  };

  const handleSaveOrder = () => {
    const order = tempOrderList.map(item => item.id);
    setDashboardOrder(order);
    if (user?.uid) {
      localStorage.setItem(`dashboard_order_${user.uid}`, JSON.stringify(order));
    }
    setIsOrderModalOpen(false);
  };

  useEffect(() => {
    if (!selectedDashboard && availableDashboards.length > 0) {
      setSelectedDashboard(availableDashboards[0].id);
    }
  }, [availableDashboards.length, selectedDashboard]);

  useEffect(() => {
    if (selectedDashboard) {
      if (selectedDashboard === "membro")
        setActiveTab("member_dashboard_preview" as any);
      else if (selectedDashboard === "lider")
        setActiveTab("leader_overview" as any);
      else if (selectedDashboard === "secretaria") setActiveTab("users" as any);
      else if (selectedDashboard === "edicao_restrita")
        setActiveTab("edicao_restrita" as any);
      else if (selectedDashboard === "financeiro")
        setActiveTab("orders" as any);
      else if (selectedDashboard === "conteudo")
        setActiveTab("aparencia" as any);
      else if (selectedDashboard === "edificado_painel")
        setActiveTab("edificado_matrimonio_hero" as any);
      else if (selectedDashboard === "maf_painel")
        setActiveTab("cursos_geral" as any);
      else if (selectedDashboard === "maf_kids_painel")
        setActiveTab("maf_kids" as any);
      else if (selectedDashboard === "filhos_de_paz_painel")
        setActiveTab("filhos_de_paz_hero" as any);
      else if (selectedDashboard === "colunista")
        setActiveTab("colunista_meus_artigos" as any);
    }
  }, [selectedDashboard]);

  useEffect(() => {
    if (isAdmin || isSecretary || isFinancial) {
      fetchData();
    } else {
      setIsLoading(false);
    }
  }, [isAdmin, isSecretary, isFinancial]);

  useEffect(() => {
    if (isAdmin || isSecretary) {
      const unsub = onSnapshot(
        collection(db, "course_registrations"),
        (snap) => {
          setRegistrationsCount(snap.size);
        },
      );
      return () => unsub();
    }
  }, [isAdmin, isSecretary]);

  const fetchData = async () => {
    setIsLoading(true);

    const safeFetch = async (fetcher: any, setter: any) => {
      try {
        const raw = await fetcher();
        setter(raw);
      } catch (err) {
        console.warn("Permissão negada ou erro ao carregar", err);
      }
    };

    try {
      await Promise.all([
        safeFetch(async () => {
          if (!isAdmin && !isSecretary) return [];
          const snap = await getDocs(query(collection(db, "users")));
          let raw = snap.docs.map((t) => ({ id: t.id, ...t.data() }));
          raw.sort((a: any, b: any) => {
            const tA = a.createdAt?.seconds
              ? a.createdAt.seconds * 1000
              : a.createdAt
                ? new Date(a.createdAt).getTime()
                : 0;
            const tB = b.createdAt?.seconds
              ? b.createdAt.seconds * 1000
              : b.createdAt
                ? new Date(b.createdAt).getTime()
                : 0;
            return tB - tA;
          });
          return raw;
        }, setUsersList),
        safeFetch(async () => {
          const snap = await getDocs(query(collection(db, "groups")));
          let raw = snap.docs.map((t) => ({ id: t.id, ...t.data() }));
          raw.sort(
            (a: any, b: any) =>
              new Date(b.dataInicio || 0).getTime() -
              new Date(a.dataInicio || 0).getTime(),
          );
          return raw;
        }, setGroups),
        safeFetch(async () => {
          const snap = await getDocs(query(collection(db, "reports")));
          let raw = snap.docs.map((t) => ({ id: t.id, ...t.data() }));
          raw.sort((a: any, b: any) => {
            const tA = a.createdAt?.seconds
              ? a.createdAt.seconds * 1000
              : a.createdAt
                ? new Date(a.createdAt).getTime()
                : 0;
            const tB = b.createdAt?.seconds
              ? b.createdAt.seconds * 1000
              : b.createdAt
                ? new Date(b.createdAt).getTime()
                : 0;
            return tB - tA;
          });
          return raw;
        }, setReports),
        safeFetch(async () => {
          const snap = await getDocs(query(collection(db, "orders")));
          let raw = snap.docs.map((t) => ({ id: t.id, ...t.data() }));
          raw.sort((a: any, b: any) => {
            const tA = a.createdAt?.seconds
              ? a.createdAt.seconds * 1000
              : a.createdAt
                ? new Date(a.createdAt).getTime()
                : 0;
            const tB = b.createdAt?.seconds
              ? b.createdAt.seconds * 1000
              : b.createdAt
                ? new Date(b.createdAt).getTime()
                : 0;
            return tB - tA;
          });
          return raw;
        }, setOrders),
        safeFetch(async () => {
          if (!isAdmin && !isSecretary) return [];
          const snap = await getDocs(query(collection(db, "notifications")));
          let raw = snap.docs.map((t) => ({ id: t.id, ...t.data() }));
          raw.sort((a: any, b: any) => {
            const tA = a.createdAt?.seconds
              ? a.createdAt.seconds * 1000
              : a.createdAt
                ? new Date(a.createdAt).getTime()
                : 0;
            const tB = b.createdAt?.seconds
              ? b.createdAt.seconds * 1000
              : b.createdAt
                ? new Date(b.createdAt).getTime()
                : 0;
            return tB - tA;
          });
          return raw;
        }, setNotificationsHistory),
        safeFetch(async () => {
          if (!isAdmin && !isSecretary) return [];
          const snap = await getDocs(query(collection(db, "contact_messages")));
          let raw = snap.docs.map((t) => ({ id: t.id, ...t.data() }));
          raw.sort((a: any, b: any) => {
            const tA = a.createdAt?.seconds
              ? a.createdAt.seconds * 1000
              : a.createdAt
                ? new Date(a.createdAt).getTime()
                : 0;
            const tB = b.createdAt?.seconds
              ? b.createdAt.seconds * 1000
              : b.createdAt
                ? new Date(b.createdAt).getTime()
                : 0;
            return tB - tA;
          });
          return raw;
        }, setMessages),
        safeFetch(async () => {
          if (!isAdmin && !isSecretary) return [];
          const snap = await getDocs(query(collection(db, "support_tickets")));
          let raw = snap.docs.map((t) => ({ id: t.id, ...t.data() }));
          raw.sort((a: any, b: any) => {
            const tA = a.createdAt?.seconds
              ? a.createdAt.seconds * 1000
              : a.createdAt
                ? new Date(a.createdAt).getTime()
                : 0;
            const tB = b.createdAt?.seconds
              ? b.createdAt.seconds * 1000
              : b.createdAt
                ? new Date(b.createdAt).getTime()
                : 0;
            return tB - tA;
          });
          return raw;
        }, setSupportTickets),
      ]);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = usersList.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      !term ||
      `${u.nome || ""} ${u.email || ""} ${u.igreja || ""}`
        .toLowerCase()
        .includes(term)
    );
  });
  const filteredGroups = groups.filter((g) => {
    const term = searchTerm.toLowerCase();
    return (
      !term ||
      `${g.liderMaridoNome || ""} ${g.liderEsposaNome || ""} ${g.igrejaNome || ""} ${g.cidade || ""}`
        .toLowerCase()
        .includes(term)
    );
  });
  const filteredReports = reports.filter((r) => {
    const term = searchTerm.toLowerCase();
    return (
      !term ||
      `${r.licao?.join(", ") || ""} ${r.groupId || ""}`
        .toLowerCase()
        .includes(term)
    );
  });
  const filteredOrders = orders.filter((o) => {
    const term = searchTerm.toLowerCase();
    return (
      !term ||
      `${o.status || ""} ${o.liderId || ""}`.toLowerCase().includes(term)
    );
  });
  const filteredMessages = messages.filter((m) => {
    const term = searchTerm.toLowerCase();
    return (
      !term ||
      `${m.nome || ""} ${m.email || ""} ${m.mensagem || ""}`
        .toLowerCase()
        .includes(term)
    );
  });

  const filteredSupportTickets = supportTickets.filter((t) => {
    const term = searchTerm.toLowerCase();
    return (
      !term ||
      `${t.userName || ""} ${t.userEmail || ""} ${t.question || ""}`
        .toLowerCase()
        .includes(term)
    );
  });

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  const getNewCount = (list: any[]) => {
    return list.filter((item) => {
      const dateVal = item.createdAt || item.dataInicio;
      if (!dateVal) return false;
      const date =
        typeof dateVal.toDate === "function"
          ? dateVal.toDate().getTime()
          : dateVal;
      return date > sevenDaysAgo;
    }).length;
  };

  const newUsersCount = getNewCount(usersList);
  const newGroupsCount = getNewCount(groups);
  const newReportsCount = getNewCount(reports);
  const newOrdersCount = getNewCount(orders);
  const newMessagesCount = getNewCount(messages);

  const handleExportCSV = () => {
    let dataToExport: any[] = [];
    let headers: string[] = [];

    if (activeTab === "users") {
      headers = ["Nome", "Email", "Celular", "Igreja", "Nivel"];
      dataToExport = filteredUsers
        .filter((u) => {
          const role = u.role;
          if (Array.isArray(role)) {
            return role.some(
              (r) =>
                r === "leader" ||
                r === "lider" ||
                r === "lider_de_cursos" ||
                (typeof r === "string" && r.toLowerCase().includes("lider")),
            );
          }
          return (
            role === "leader" ||
            role === "lider" ||
            role === "lider_de_cursos" ||
            (typeof role === "string" && role.toLowerCase().includes("lider"))
          );
        })
        .map((u) => [
          u.nome || "",
          u.email || "",
          u.celular || "",
          u.igreja || "",
          u.role || "",
        ]);
    } else if (activeTab === "groups") {
      headers = ["Lideres", "Turma", "Igreja", "Cidade", "Estado", "Alunos"];
      dataToExport = filteredGroups.map((g) => [
        g.nomesLideres || "",
        g.numeroTurma || "",
        g.igreja || "",
        g.cidade || "",
        g.estado || "",
        g.quantidadeAlunos || "",
      ]);
    } else if (activeTab === "reports") {
      headers = [
        "Data",
        "Licao",
        "Casais Presentes",
        "Solteiros Presentes",
        "Aproveitamento",
      ];
      dataToExport = filteredReports.map((r) => [
        r.dataAvaliada
          ? new Date(r.dataAvaliada).toLocaleDateString("pt-BR")
          : "",
        r.licaoNumero || "",
        r.casaisPresentes || 0,
        r.solteirosPresentes || 0,
        r.aproveitamento || "",
      ]);
    } else if (activeTab === "orders") {
      headers = ["Data", "Status", "Rua", "Bairro", "Cidade"];
      dataToExport = filteredOrders.map((o) => [
        new Date(o.createdAt?.toDate?.() || Date.now()).toLocaleDateString(
          "pt-BR",
        ),
        o.status || "pendente",
        o.deliveryAddress?.rua || "",
        o.deliveryAddress?.bairro || "",
        o.deliveryAddress?.cidade || "",
      ]);
    } else if (activeTab === ("messages" as any)) {
      headers = ["Data", "Nome", "Email", "Mensagem", "Status"];
      dataToExport = filteredMessages.map((m) => [
        new Date(m.createdAt?.toDate?.() || Date.now()).toLocaleDateString(
          "pt-BR",
        ),
        m.nome || "",
        m.email || "",
        m.mensagem || "",
        m.status || "unread",
      ]);
    } else if (activeTab === "treinamento") {
      headers = [
        "Nome Marido",
        "Nome Esposa",
        "Email",
        "Celular",
        "Igreja",
        "Cursos Concluídos",
      ];
      dataToExport = filteredUsers
        .filter((u) => {
          const role = u.role;
          if (Array.isArray(role)) {
            return role.some(
              (r) =>
                r === "leader" ||
                r === "lider" ||
                r === "lider_de_cursos" ||
                (typeof r === "string" && r.toLowerCase().includes("lider")),
            );
          }
          return (
            role === "leader" ||
            role === "lider" ||
            role === "lider_de_cursos" ||
            (typeof role === "string" && role.toLowerCase().includes("lider"))
          );
        })
        .map((u) => [
          u.nome || "",
          u.nomeEsposa || "",
          u.email || "",
          u.celular || "",
          u.igreja || "",
          u.cursosConcluidos && Array.isArray(u.cursosConcluidos)
            ? u.cursosConcluidos.join(", ")
            : "",
        ]);
    }

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(";"), ...dataToExport.map((e) => e.join(";"))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `edificado_${activeTab}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const submitTicketAnswer = async (ticketId: string) => {
    if (!ticketReplyText.trim()) return;
    try {
      await updateDoc(doc(db, "support_tickets", ticketId), {
        answer: ticketReplyText.trim(),
        status: "answered",
        answeredAt: new Date(),
        userRead: false,
      });

      alert("Resposta enviada com sucesso!");
      setAnsweringTicketId(null);
      setTicketReplyText("");
      fetchData(); // Refresh tickets
    } catch (error) {
      console.error("Erro ao enviar resposta do ticket:", error);
      alert("Erro ao enviar resposta.");
    }
  };

  const handleDelete = (collectionName: string, id: string) => {
    setDeleteConfirm({ collection: collectionName, id });
  };

  const confirmDeleteAnswerAction = async () => {
    if(!deleteAnswerConfirm) return;
    await updateDoc(
      doc(db, "support_tickets", deleteAnswerConfirm.id),
      {
        answer: null,
        answeredAt: null,
        status: "pending",
      }
    );
    setDeleteAnswerConfirm(null);
  };
  
  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteDoc(doc(db, deleteConfirm.collection, deleteConfirm.id));
      fetchData();
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Erro ao excluir:", error);
      setDeleteConfirm(null);
    }
  };

  const toggleUserStatus = async (
    userId: string,
    currentStatus: string = "ativo",
  ) => {
    try {
      const novoStatus = currentStatus === "bloqueado" ? "ativo" : "bloqueado";
      await updateDoc(doc(db, "users", userId), { status: novoStatus });
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Erro ao atualizar status do usuário:", error);
      alert("Erro ao atualizar status do usuário.");
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status });
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      alert("Erro ao atualizar status do pedido.");
    }
  };

  const toggleMessageStatus = async (
    messageId: string,
    currentStatus: string,
  ) => {
    try {
      const newStatus = currentStatus === "read" ? "unread" : "read";
      await updateDoc(doc(db, "contact_messages", messageId), {
        status: newStatus,
      });
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Erro ao atualizar status da mensagem:", error);
      alert("Erro ao atualizar status da mensagem.");
    }
  };

  const handleEditTreinamento = (u: any) => {
    setEditingTreinamentoUser(u);
    setTreinamentoCourses(u.cursosConcluidos || []);
  };

  const saveTreinamento = async () => {
    if (!editingTreinamentoUser) return;
    try {
      await updateDoc(doc(db, "users", editingTreinamentoUser.id), {
        cursosConcluidos: treinamentoCourses,
      });
      alert("Cursos registrados com sucesso!");
      setEditingTreinamentoUser(null);
      fetchData(); // Refresh the list
    } catch (error) {
      console.error("Erro ao salvar cursos:", error);
      alert("Erro ao salvar cursos.");
    }
  };

  const handleEditUser = (u: any) => {
    setEditingUser(u);
    setActiveModalTab("marido");
    setEditFormData({
      nome:
        u.nome ||
        (u.nomeMarido ? `${u.nomeMarido} ${u.sobrenome || ""}`.trim() : ""),
      cpf: u.cpf || "",
      dataNascimento: u.dataNascimento || "",
      telefone: u.telefone || "",
      celular: u.celular || "",
      profissao: u.profissao || "",
      igreja: u.igreja || "",
      observacoes: u.observacoes || "",
      role: u.role || "leader",
      // Spouse data
      nomeEsposa:
        u.nomeEsposa ||
        (u.nomeEsposa
          ? `${u.nomeEsposa} ${u.sobrenomeEsposa || ""}`.trim()
          : ""),
      cpfEsposa: u.cpfEsposa || "",
      dataNascimentoEsposa: u.dataNascimentoEsposa || "",
      celularEsposa: u.celularEsposa || "",
      profissaoEsposa: u.profissaoEsposa || "",
      // Address data
      cep: u.cep || "",
      rua: u.rua || "",
      numero: u.numero || "",
      complemento: u.complemento || "",
      bairro: u.bairro || "",
      cidade: u.cidade || "",
      estado: u.estado || "",
    });
  };

  const fetchAddressAdmin = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, "");
    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${cleanCep}/json/`,
      );
      const data = await response.json();
      if (!data.erro) {
        setEditFormData((prev: any) => ({
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

  const saveEditedUser = async () => {
    if (!editingUser) return;
    try {
      const fullName = editFormData.nome?.trim();
      await updateDoc(doc(db, "users", editingUser.id), {
        nome: fullName || editingUser.nome,
        cpf: editFormData.cpf,
        dataNascimento: editFormData.dataNascimento,
        telefone: editFormData.telefone,
        celular: editFormData.celular,
        profissao: editFormData.profissao,
        igreja: editFormData.igreja,
        observacoes: editFormData.observacoes,
        role: editFormData.role,
        // Spouse data
        nomeEsposa: editFormData.nomeEsposa,
        cpfEsposa: editFormData.cpfEsposa,
        dataNascimentoEsposa: editFormData.dataNascimentoEsposa,
        celularEsposa: editFormData.celularEsposa,
        profissaoEsposa: editFormData.profissaoEsposa,
        // Address data
        cep: editFormData.cep,
        rua: editFormData.rua,
        numero: editFormData.numero,
        complemento: editFormData.complemento,
        bairro: editFormData.bairro,
        cidade: editFormData.cidade,
        estado: editFormData.estado,
      });
      alert("Usuário atualizado com sucesso!");
      setEditingUser(null);
      fetchData();
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      alert("Erro ao atualizar usuário.");
    }
  };

  const handleResetPassword = async (email: string) => {
    if (
      window.confirm(
        "Deseja enviar um e-mail de redefinição de senha para este usuário?",
      )
    ) {
      try {
        await sendPasswordResetEmail(auth, email);
        alert("E-mail de redefinição enviado com sucesso para " + email);
      } catch (error) {
        console.error("Erro ao enviar e-mail de redefinição de senha:", error);
        alert("Erro ao enviar e-mail de redefinição.");
      }
    }
  };

  const handleEditGroup = (g: any) => {
    setEditingGroup(g);
    setActiveGroupModalTab("info");
    setEditGroupData({
      curso: g.curso || "",
      dataInicio: g.dataInicio || "",
      diaSemana: g.diaSemana || "",
      horario: g.horario || "",
      local: g.local || "",
      estado: g.estado || "",
      cidade: g.cidade || "",
      // Líderes
      liderMaridoNome: g.liderMaridoNome || "",
      liderMaridoCpf: g.liderMaridoCpf || "",
      liderMaridoEmail: g.liderMaridoEmail || "",
      liderMaridoTel: g.liderMaridoTel || "",
      liderEsposaNome: g.liderEsposaNome || "",
      liderEsposaCpf: g.liderEsposaCpf || "",
      liderEsposaEmail: g.liderEsposaEmail || "",
      liderEsposaTel: g.liderEsposaTel || "",
      // Endereço Líder
      liderCep: g.liderCep || "",
      liderEndereco: g.liderEndereco || "",
      liderNumero: g.liderNumero || "",
      liderBairro: g.liderBairro || "",
      liderCidade: g.liderCidade || "",
      liderEstado: g.liderEstado || "",
      // Igreja
      igrejaNome: g.igrejaNome || "",
      pastorNome: g.pastorNome || "",
      pastorTel: g.pastorTel || "",
      // Treinamento
      treiMaridoNome: g.treiMaridoNome || "",
      treiMaridoEmail: g.treiMaridoEmail || "",
      treiEsposaNome: g.treiEsposaNome || "",
      treiEsposaEmail: g.treiEsposaEmail || "",
      // Casais
      casais: g.casais || [],
    });
  };

  const saveEditedGroup = async () => {
    if (!editingGroup) return;
    try {
      await updateDoc(doc(db, "groups", editingGroup.id), {
        curso: editGroupData.curso,
        dataInicio: editGroupData.dataInicio,
        diaSemana: editGroupData.diaSemana,
        horario: editGroupData.horario,
        local: editGroupData.local,
        estado: editGroupData.estado,
        cidade: editGroupData.cidade,
        liderMaridoNome: editGroupData.liderMaridoNome,
        liderMaridoCpf: editGroupData.liderMaridoCpf,
        liderMaridoEmail: editGroupData.liderMaridoEmail,
        liderMaridoTel: editGroupData.liderMaridoTel,
        liderEsposaNome: editGroupData.liderEsposaNome,
        liderEsposaCpf: editGroupData.liderEsposaCpf,
        liderEsposaEmail: editGroupData.liderEsposaEmail,
        liderEsposaTel: editGroupData.liderEsposaTel,
        liderCep: editGroupData.liderCep,
        liderEndereco: editGroupData.liderEndereco,
        liderNumero: editGroupData.liderNumero,
        liderBairro: editGroupData.liderBairro,
        liderCidade: editGroupData.liderCidade,
        liderEstado: editGroupData.liderEstado,
        igrejaNome: editGroupData.igrejaNome,
        pastorNome: editGroupData.pastorNome,
        pastorTel: editGroupData.pastorTel,
        treiMaridoNome: editGroupData.treiMaridoNome,
        treiMaridoEmail: editGroupData.treiMaridoEmail,
        treiEsposaNome: editGroupData.treiEsposaNome,
        treiEsposaEmail: editGroupData.treiEsposaEmail,
        casais: editGroupData.casais,
      });
      alert("Grupo atualizado com sucesso!");
      setEditingGroup(null);
      fetchData();
    } catch (error) {
      console.error("Erro ao atualizar grupo:", error);
      alert("Erro ao atualizar grupo.");
    }
  };

  const handleEditReport = (r: any) => {
    setEditingReport(r);
    setEditReportData({
      dataReuniao: r.dataReuniao || "",
      horarioInicio: r.horarioInicio || "",
      horarioTermino: r.horarioTermino || "",
      licao: r.licao || [],
      valorOferta: r.valorOferta || "",
      outrosMotivos: r.outrosMotivos || "",
      observacoesGerais: r.observacoesGerais || "",
      casaisReport: r.casaisReport || [],
    });
  };

  const saveEditedReport = async () => {
    if (!editingReport) return;
    try {
      await updateDoc(doc(db, "reports", editingReport.id), {
        dataReuniao: editReportData.dataReuniao,
        horarioInicio: editReportData.horarioInicio,
        horarioTermino: editReportData.horarioTermino,
        licao: editReportData.licao,
        valorOferta: editReportData.valorOferta,
        outrosMotivos: editReportData.outrosMotivos,
        observacoesGerais: editReportData.observacoesGerais,
        casaisReport: editReportData.casaisReport,
      });
      alert("Relatório atualizado com sucesso!");
      setEditingReport(null);
      fetchData();
    } catch (error) {
      console.error("Erro ao atualizar relatório:", error);
      alert("Erro ao atualizar relatório.");
    }
  };

  const handleEditOrder = (o: any) => {
    setEditingOrder(o);
    setEditOrderData({
      status: o.status || "pendente",
      observacoes: o.observacoes || "",
      nomes: o.nomeLider || "",
      email: o.emailLider || "",
      grupo: o.grupoNome || "",
      cidade: o.cidadeEstado || "",
      itens: o.itens || [],
      total: o.total || 0,
      adminNotes: o.adminNotes || "",
    });
  };

  const saveEditedOrder = async () => {
    if (!editingOrder) return;
    try {
      await updateDoc(doc(db, "orders", editingOrder.id), {
        status: editOrderData.status,
        adminNotes: editOrderData.adminNotes,
      });
      alert("Pedido atualizado com sucesso!");
      setEditingOrder(null);
      fetchData();
    } catch (error) {
      console.error("Erro ao atualizar pedido:", error);
      alert("Erro ao atualizar pedido.");
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notificationData.title || !notificationData.message) {
      alert("Por favor, preencha o título e a mensagem.");
      return;
    }
    if (
      notificationData.targetType === "user" &&
      !notificationData.targetUserId
    ) {
      alert("Por favor, selecione um usuário.");
      return;
    }

    setIsSendingNotification(true);
    try {
      await addDoc(collection(db, "notifications"), {
        title: notificationData.title,
        message: notificationData.message,
        targetType: notificationData.targetType,
        targetUserId:
          notificationData.targetType === "user"
            ? notificationData.targetUserId
            : null,
        createdAt: serverTimestamp(),
        readBy: [], // Para notificações enviadas para todos
      });
      alert(
        notificationData.targetType === "all"
          ? "Aviso enviado com sucesso!"
          : "Notificação enviada com sucesso!",
      );
      setNotificationData({
        title: "",
        message: "",
        targetType: activeTab === "avisos" ? "all" : "user",
        targetUserId: "",
      });
      fetchData(); // Recarrega o histórico
    } catch (error) {
      console.error("Erro ao enviar:", error);
      alert(
        notificationData.targetType === "all"
          ? "Erro ao enviar aviso."
          : "Erro ao enviar notificação.",
      );
    } finally {
      setIsSendingNotification(false);
    }
  };

  // Early return for loading
  if (isLoading || (user && !profile)) {
    return (
      <AdminLayout>
        <div className="flex-1 flex flex-col items-center justify-center p-20 text-gray-400 gap-4">
          <div className="w-8 h-8 border-4 border-primary-base border-t-transparent rounded-full animate-spin"></div>
          <p>Carregando informações do perfil...</p>
          {!profile && !isLoading && (
            <p className="text-xs text-gray-500 mt-2">
              Se o carregamento demorar, tente atualizar a página.
            </p>
          )}
        </div>
      </AdminLayout>
    );
  }

  // Early return for pure members
  if (
    !isAdmin &&
    !isLeader &&
    !isSecretary &&
    !isFinancial &&
    !isEditor &&
    !isColunista &&
    !isEditorEdificado &&
    !isEditorMaf &&
    isMembro
  ) {
    return (
      <AdminLayout>
        <section className="bg-gradient-to-br from-[#1a6496] to-[#0d3b5e] pt-10 sm:pt-14 pb-8 sm:pb-10 text-center text-white px-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
            <Users size={32} className="text-[#a5d2ff] sm:w-9 sm:h-9" />
            <h1 className="text-2xl sm:text-[2.2rem] font-black font-serif tracking-wide m-0 leading-tight">
              Painel do Membro
            </h1>
          </div>
          <p className="text-sm sm:text-[1.05rem] opacity-90 max-w-[540px] mx-auto mt-2">
            Sua área exclusiva e individualizada na plataforma
          </p>
        </section>
        <div className="w-full flex-1 flex flex-col pt-6 pb-12 px-4 sm:px-6 bg-[#f4f7f9]">
          <div className="w-full max-w-[1300px] mx-auto h-full min-h-[80vh] flex flex-col">
            <MemberDashboardComponent />
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <section className="bg-gradient-to-br from-[#1e3a5f] to-[#1a6496] pt-10 sm:pt-14 pb-8 sm:pb-10 text-center text-white px-4">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
          <ShieldCheck size={32} className="text-[#a5d2ff] sm:w-9 sm:h-9" />
          <h1 className="text-2xl sm:text-[2.2rem] font-black font-serif tracking-wide m-0 leading-tight">
            Painel de Controle
          </h1>
        </div>
        <p className="text-sm sm:text-[1.05rem] opacity-90 max-w-[540px] mx-auto mt-2">
          {isAdmin
            ? "Visão geral e controle total do sistema"
            : "Gestão e edição de conteúdo do site"}
        </p>
      </section>

      <section className="w-full max-w-[1300px] mx-auto px-4 sm:px-5 py-6 sm:py-10 pb-16 flex flex-col lg:flex-row gap-8">
        {/* Left Sidebar */}
        <div className="w-full lg:w-72 shrink-0 bg-white rounded-[14px] border-[1.5px] border-[#c8d8e8] shadow-sm p-4 h-fit space-y-6">
          {availableDashboards.length > 1 && (
            <div className="mb-4 pb-4 border-b border-[#e2eaf3]">
              <div className="flex items-center justify-between mb-2 px-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                  Trocar Painel
                </label>
                <button
                  onClick={handleOpenOrderModal}
                  className="text-gray-400 hover:text-primary-base transition-colors"
                  title="Organizar Painéis"
                >
                  <Settings size={14} />
                </button>
              </div>
              <select
                value={selectedDashboard || ""}
                onChange={(e) => setSelectedDashboard(e.target.value)}
                className="w-full px-3 py-2 bg-[#f7fafd] border border-[#c8d8e8] rounded-xl text-sm font-bold text-primary-dark focus:outline-none focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10"
              >
                <option value="" disabled>
                  Selecione um painel...
                </option>
                {availableDashboards.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Section: Painel do Membro */}
          {selectedDashboard === "membro" && (isAdmin || isMembro) && (
            <div>
              <h3 className="text-[12px] font-black uppercase tracking-wider text-white bg-primary-base rounded-md mb-4 px-3 py-2 text-center">
                Painel do Membro
              </h3>
              <nav className="space-y-1 mb-4">
                {[
                  {
                    id: "member_dashboard_preview",
                    label: "Visão Geral",
                    icon: LayoutDashboard,
                  },
                  {
                    id: "member_profile",
                    label: "Meus Dados",
                    icon: UserCircle,
                  },
                  { id: "member_pessoas", label: "Pessoas", icon: Users },
                  { id: "member_departamentos", label: "Departamentos", icon: Building },
                  { id: "member_grupos", label: "Grupos", icon: Users },
                  { id: "member_kids", label: "Kids", icon: Baby },
                  { id: "member_ensino", label: "Ensino", icon: BookOpen },
                  { id: "member_agenda", label: "Agenda", icon: Calendar },
                  { id: "member_midias", label: "Mídias", icon: Video },
                  { id: "member_ajuda", label: "Ajuda", icon: HelpCircle },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`flex items-center w-full gap-3 p-2.5 rounded-lg font-bold text-sm transition text-left cursor-pointer ${
                      activeTab === item.id
                        ? "bg-primary-base text-white shadow-md border-transparent"
                        : "text-primary-dark hover:bg-[#f7fafd] border-transparent"
                    }`}
                  >
                    <item.icon
                      size={18}
                      className={
                        activeTab === item.id
                          ? "text-white"
                          : "text-primary-base"
                      }
                    />{" "}
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          )}

          {/* Section: Painel Minha Área (Leader Area) */}
          {selectedDashboard === "lider" && (isAdmin || isLeader) && (
            <div>
              <h3 className="text-[12px] font-black uppercase tracking-wider text-white bg-primary-base rounded-md mb-4 px-3 py-2 text-center">
                Painel do Líder
              </h3>
              <nav className="space-y-1">
                {[
                  {
                    id: "leader_overview",
                    label: "Visão Geral",
                    icon: LayoutDashboard,
                  },
                  {
                    id: "leader_profile",
                    label: "Meus Dados",
                    icon: UserCircle,
                  },
                  { id: "leader_groups", label: "Meus Grupos", icon: Users },
                  {
                    id: "leader_new_group",
                    label: "Cadastrar Turma",
                    icon: PlusCircle,
                  },
                  {
                    id: "leader_reports",
                    label: "Enviar Relatório",
                    icon: Edit2,
                  },
                  {
                    id: "leader_history",
                    label: "Histórico de Registros",
                    icon: History,
                  },
                  {
                    id: "leader_materials",
                    label: "Pedido de Material",
                    icon: Package,
                  },
                  {
                    id: "leader_support",
                    label: "Dúvidas",
                    icon: HelpCircle,
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`flex items-center w-full gap-3 p-2.5 rounded-lg font-bold text-sm transition text-left cursor-pointer ${
                      activeTab === item.id
                        ? "bg-primary-base text-white shadow-md border-transparent"
                        : "text-primary-dark hover:bg-[#f7fafd] border-transparent"
                    }`}
                  >
                    <item.icon
                      size={18}
                      className={
                        activeTab === item.id
                          ? "text-white"
                          : "text-primary-base"
                      }
                    />
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          )}

          {selectedDashboard === "secretaria" && (isAdmin || isSecretary) && (
            <div className="space-y-6">
              <div>
                <h3 className="text-[12px] font-black uppercase tracking-wider text-white bg-primary-base rounded-md mb-4 px-3 py-2 text-center">
                  Painel Secretaria
                </h3>
              </div>

              <div>
                <nav className="space-y-1 mb-4">
                  <button
                    onClick={() => setActiveTab("leader_profile")}
                    className={`flex items-center w-full gap-3 p-2.5 rounded-lg font-bold text-sm transition text-left cursor-pointer ${
                      activeTab === "leader_profile"
                        ? "bg-primary-base text-white shadow-md border-transparent"
                        : "text-primary-dark hover:bg-[#f7fafd] border-transparent"
                    }`}
                  >
                    <UserCircle
                      size={18}
                      className={
                        activeTab === "leader_profile"
                          ? "text-white"
                          : "text-primary-base"
                      }
                    />
                    Meus Dados
                  </button>
                </nav>

                <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2 px-3">
                  Divisão: Membresia
                </h4>
                <nav className="space-y-1">
                  {[
                    {
                      id: "membros",
                      label: "Gestão de Membros",
                      icon: Users,
                    },
                    {
                      id: "permissoes",
                      label: "Níveis de Permissão",
                      icon: ShieldCheck,
                    },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id as any);
                        if (
                          item.id === "avisos" ||
                          item.id === "notifications"
                        ) {
                          setNotificationData({
                            title: "",
                            message: "",
                            targetType: item.id === "avisos" ? "all" : "user",
                            targetUserId: "",
                          });
                        }
                      }}
                      className={`flex items-center justify-between w-full p-2.5 rounded-lg font-bold text-sm transition text-left cursor-pointer ${
                        activeTab === item.id
                          ? "bg-primary-base text-white shadow-md border-transparent"
                          : "text-primary-dark hover:bg-[#f7fafd] border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon
                          size={18}
                          className={
                            activeTab === item.id
                              ? "text-white"
                              : (item as any).iconColor || "text-primary-base"
                          }
                        />
                        <span>{item.label}</span>
                      </div>
                      {(item as any).badge !== undefined && (
                        <span
                          className={`text-[10px] font-bold text-white px-2 py-0.5 rounded-full ${(item as any).badgeColor}`}
                        >
                          {(item as any).badge}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2 px-3 mt-4">
                  Divisão: Cursos
                </h4>
                <nav className="space-y-1">
                  {[
                    { id: "users", label: "Líderes", icon: Users },
                    {
                      id: "groups",
                      label: "Todos os Grupos",
                      icon: BookOpen,
                    },
                    {
                      id: "reports",
                      label: "Relatórios Enviados",
                      icon: FileText,
                    },
                    { id: "avisos", label: "Quadro de Avisos", icon: Bell },
                    {
                      id: "notifications",
                      label: "Notificação Individual",
                      icon: User,
                    },
                    {
                      id: "duvidas_respostas",
                      label: "Dúvidas e Respostas",
                      icon: MessageSquare,
                      badge:
                        supportTickets.filter((t) => t.status === "pending")
                          .length > 0
                          ? supportTickets.filter((t) => t.status === "pending")
                              .length
                          : undefined,
                      badgeColor: "bg-red-500",
                    },
                    {
                      id: "matriculas",
                      label: "Cursos & Matrículas",
                      icon: GraduationCap,
                      badge:
                        registrationsCount > 0 ? registrationsCount : undefined,
                      badgeColor: "bg-amber-500",
                    },
                    { id: "treinamento", label: "Treinamento", icon: Award },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id as any);
                        if (
                          item.id === "avisos" ||
                          item.id === "notifications"
                        ) {
                          setNotificationData({
                            title: "",
                            message: "",
                            targetType: item.id === "avisos" ? "all" : "user",
                            targetUserId: "",
                          });
                        }
                      }}
                      className={`flex items-center justify-between w-full p-2.5 rounded-lg font-bold text-sm transition text-left cursor-pointer ${
                        activeTab === item.id
                          ? "bg-primary-base text-white shadow-md border-transparent"
                          : "text-primary-dark hover:bg-[#f7fafd] border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon
                          size={18}
                          className={
                            activeTab === item.id
                              ? "text-white"
                              : (item as any).iconColor || "text-primary-base"
                          }
                        />
                        <span>{item.label}</span>
                      </div>
                      {(item as any).badge !== undefined && (
                        <span
                          className={`text-[10px] font-bold text-white px-2 py-0.5 rounded-full ${(item as any).badgeColor}`}
                        >
                          {(item as any).badge}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2 px-3 mt-4">
                  Divisão: Atendimento
                </h4>
                <nav className="space-y-1">
                  {[
                    {
                      id: "whatsapp",
                      label: "WhatsApp",
                      icon: MessageCircle,
                      iconColor: "text-[#25D366]",
                    },
                    { id: "messages", label: "Fale Conosco", icon: Send },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id as any);
                        if (
                          item.id === "avisos" ||
                          item.id === "notifications"
                        ) {
                          setNotificationData({
                            title: "",
                            message: "",
                            targetType: item.id === "avisos" ? "all" : "user",
                            targetUserId: "",
                          });
                        }
                      }}
                      className={`flex items-center justify-between w-full p-2.5 rounded-lg font-bold text-sm transition text-left cursor-pointer ${
                        activeTab === item.id
                          ? "bg-primary-base text-white shadow-md border-transparent"
                          : "text-primary-dark hover:bg-[#f7fafd] border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon
                          size={18}
                          className={
                            activeTab === item.id
                              ? "text-white"
                              : (item as any).iconColor || "text-primary-base"
                          }
                        />
                        <span>{item.label}</span>
                      </div>
                      {(item as any).badge !== undefined && (
                        <span
                          className={`text-[10px] font-bold text-white px-2 py-0.5 rounded-full ${(item as any).badgeColor}`}
                        >
                          {(item as any).badge}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2 px-3 mt-4">
                  Divisão: Agenda
                </h4>
                <nav className="space-y-1">
                  {[
                    { id: "agenda_eventos", label: "Eventos e Datas", icon: Calendar },
                    { id: "agenda_design", label: "Design e Aparência", icon: Palette },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`flex items-center w-full gap-3 p-2.5 rounded-lg font-bold text-sm transition text-left cursor-pointer ${
                        activeTab === item.id
                          ? "bg-primary-base text-white shadow-md border-transparent"
                          : "text-primary-dark hover:bg-[#f7fafd] border-transparent"
                      }`}
                    >
                      <item.icon
                        size={18}
                        className={
                          activeTab === item.id
                            ? "text-white"
                            : "text-primary-base"
                        }
                      />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          )}

          {selectedDashboard === "edicao_restrita" &&
            (isAdmin || isSecretary) && (
              <div>
                <h3 className="text-[12px] font-black uppercase tracking-wider text-white bg-primary-base rounded-md mb-4 px-3 py-2 text-center">
                  Painel Edição Restrita
                </h3>
                <nav className="space-y-1 mb-4">
                  <button
                    onClick={() => setActiveTab("edicao_restrita")}
                    className={`flex items-center w-full gap-3 p-2.5 rounded-lg font-bold text-sm transition text-left cursor-pointer ${
                      activeTab === "edicao_restrita"
                        ? "bg-primary-base text-white shadow-md border-transparent"
                        : "text-primary-dark hover:bg-[#f7fafd] border-transparent"
                    }`}
                  >
                    <Edit3 size={18} /> Divisões de Edição
                  </button>
                </nav>
              </div>
            )}

          {selectedDashboard === "financeiro" && (isAdmin || isFinancial) && (
            <div>
              <h3 className="text-[12px] font-black uppercase tracking-wider text-white bg-primary-base rounded-md mb-4 px-3 py-2 text-center">
                Painel Financeiro
              </h3>
              <nav className="space-y-1 mb-4">
                <button
                  onClick={() => setActiveTab("leader_profile")}
                  className={`flex items-center w-full gap-3 p-2.5 rounded-lg font-bold text-sm transition text-left cursor-pointer ${
                    activeTab === "leader_profile"
                      ? "bg-primary-base text-white shadow-md border-transparent"
                      : "text-primary-dark hover:bg-[#f7fafd] border-transparent"
                  }`}
                >
                  <UserCircle
                    size={18}
                    className={
                      activeTab === "leader_profile"
                        ? "text-white"
                        : "text-primary-base"
                    }
                  />
                  Meus Dados
                </button>
              </nav>
              <nav className="space-y-1">
                {[
                  {
                    id: "orders",
                    label: "Pedidos de Material",
                    icon: Package,
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`flex items-center justify-between w-full p-2.5 rounded-lg font-bold text-sm transition text-left cursor-pointer ${
                      activeTab === item.id
                        ? "bg-primary-base text-white shadow-md border-transparent"
                        : "text-primary-dark hover:bg-[#f7fafd] border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon
                        size={18}
                        className={
                          activeTab === item.id
                            ? "text-white"
                            : "text-primary-base"
                        }
                      />
                      <span>{item.label}</span>
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          )}

          {selectedDashboard === "conteudo" && (isAdmin || isEditor) && (
            <div>
              <h3 className="text-[12px] font-black uppercase tracking-wider text-white bg-primary-base rounded-md mb-4 px-3 py-2 text-center">
                Painel Conteúdo do Site
              </h3>
              <nav className="space-y-1 mb-4">
                <button
                  onClick={() => setActiveTab("leader_profile")}
                  className={`flex items-center w-full gap-3 p-2.5 rounded-lg font-bold text-sm transition text-left cursor-pointer ${
                    activeTab === "leader_profile"
                      ? "bg-primary-base text-white shadow-md border-transparent"
                      : "text-primary-dark hover:bg-[#f7fafd] border-transparent"
                  }`}
                >
                  <UserCircle
                    size={18}
                    className={
                      activeTab === "leader_profile"
                        ? "text-white"
                        : "text-primary-base"
                    }
                  />
                  Meus Dados
                </button>
              </nav>
              <nav className="space-y-1">
                {[
                  {
                    id: "aparencia",
                    label: "Aparência e Cores",
                    icon: Settings,
                  },
                  {
                    id: "header_logo",
                    label: "Logo do Topo (Navbar)",
                    icon: ImageIcon,
                  },
                  { id: "inicio", label: "Conteúdo Início", icon: Home },
                  {
                    id: "quem_somos",
                    label: "Conteúdo Quem Somos",
                    icon: Users,
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`flex items-center w-full gap-3 p-2.5 rounded-lg font-bold text-sm transition text-left cursor-pointer ${
                      activeTab === item.id
                        ? "bg-primary-base text-white shadow-md border-transparent"
                        : "text-primary-dark hover:bg-[#f7fafd] border-transparent"
                    }`}
                  >
                    <item.icon
                      size={18}
                      className={
                        activeTab === item.id
                          ? "text-white"
                          : "text-primary-base"
                      }
                    />
                    {item.label}
                  </button>
                ))}

                <h4 className="text-[10px] uppercase font-bold text-gray-400 mt-4 mb-2 pl-2">DIVISÃO: SISTEMA</h4>
                {[
                  { id: "contatos", label: "Conteúdo Contatos", icon: Mail },
                  { id: "footer", label: "Conteúdo Rodapé", icon: Layout },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`flex items-center w-full gap-3 p-2.5 rounded-lg font-bold text-sm transition text-left cursor-pointer ${
                      activeTab === item.id
                        ? "bg-primary-base text-white shadow-md border-transparent"
                        : "text-primary-dark hover:bg-[#f7fafd] border-transparent"
                    }`}
                  >
                    <item.icon
                      size={18}
                      className={
                        activeTab === item.id
                          ? "text-white"
                          : "text-primary-base"
                      }
                    />
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          )}

          {selectedDashboard === "edificado_painel" && (isAdmin || isEditorEdificado) && (
            <div>
              <h3 className="text-[12px] font-black uppercase tracking-wider text-white bg-primary-base rounded-md mb-4 px-3 py-2 text-center">
                Painel Edificado Matrim.
              </h3>
              <nav className="space-y-1 mb-4">
                <button
                  onClick={() => setActiveTab("leader_profile")}
                  className={`flex items-center w-full gap-3 p-2.5 rounded-lg font-bold text-sm transition text-left cursor-pointer ${
                    activeTab === "leader_profile"
                      ? "bg-primary-base text-white shadow-md border-transparent"
                      : "text-primary-dark hover:bg-[#f7fafd] border-transparent"
                  }`}
                >
                  <UserCircle
                    size={18}
                    className={
                      activeTab === "leader_profile"
                        ? "text-white"
                        : "text-primary-base"
                    }
                  />
                  Meus Dados
                </button>
              </nav>
              <h4 className="text-[10px] uppercase font-bold text-gray-400 mt-4 mb-2 pl-2">DIVISÃO: MINISTÉRIOS</h4>
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab("edificado_matrimonio_leader")}
                  className={`flex items-center w-full gap-3 p-2.5 rounded-lg font-bold text-sm transition text-left cursor-pointer ${
                    activeTab === "edificado_matrimonio_leader" || activeTab === "edificado_matrimonio"
                      ? "bg-primary-base text-white shadow-md border-transparent"
                      : "text-primary-dark hover:bg-[#f7fafd] border-transparent"
                  }`}
                >
                  <Lock
                    size={18}
                    className={
                      activeTab === "edificado_matrimonio_leader" || activeTab === "edificado_matrimonio"
                        ? "text-white"
                        : "text-primary-base"
                    }
                  />
                  Cadastro de Líder
                </button>
                <button
                  onClick={() => setActiveTab("edificado_matrimonio_hero")}
                  className={`flex items-center w-full gap-3 p-2.5 rounded-lg font-bold text-sm transition text-left cursor-pointer ${
                    activeTab === "edificado_matrimonio_hero"
                      ? "bg-primary-base text-white shadow-md border-transparent"
                      : "text-primary-dark hover:bg-[#f7fafd] border-transparent"
                  }`}
                >
                  <ImageIcon
                    size={18}
                    className={
                      activeTab === "edificado_matrimonio_hero"
                        ? "text-white"
                        : "text-primary-base"
                    }
                  />
                  Banners
                </button>
                <button
                  onClick={() => setActiveTab("edificado_matrimonio_crencas")}
                  className={`flex items-center w-full gap-3 p-2.5 rounded-lg font-bold text-sm transition text-left cursor-pointer ${
                    activeTab === "edificado_matrimonio_crencas"
                      ? "bg-primary-base text-white shadow-md border-transparent"
                      : "text-primary-dark hover:bg-[#f7fafd] border-transparent"
                  }`}
                >
                  <Heart
                    size={18}
                    className={
                      activeTab === "edificado_matrimonio_crencas"
                        ? "text-white"
                        : "text-primary-base"
                    }
                  />
                  No que Acreditamos
                </button>
                <button
                  onClick={() => setActiveTab("edificado_matrimonio_cursos_editor")}
                  className={`flex items-center w-full gap-3 p-2.5 rounded-lg font-bold text-sm transition text-left cursor-pointer ${
                    activeTab === "edificado_matrimonio_cursos_editor"
                      ? "bg-primary-base text-white shadow-md border-transparent"
                      : "text-primary-dark hover:bg-[#f7fafd] border-transparent"
                  }`}
                >
                  <GraduationCap
                    size={18}
                    className={
                      activeTab === "edificado_matrimonio_cursos_editor"
                        ? "text-white"
                        : "text-primary-base"
                    }
                  />
                  Treinamentos
                </button>
                <button
                  onClick={() => setActiveTab("edificado_matrimonio_cta")}
                  className={`flex items-center w-full gap-3 p-2.5 rounded-lg font-bold text-sm transition text-left cursor-pointer ${
                    activeTab === "edificado_matrimonio_cta"
                      ? "bg-primary-base text-white shadow-md border-transparent"
                      : "text-primary-dark hover:bg-[#f7fafd] border-transparent"
                  }`}
                >
                  <MessageSquare
                    size={18}
                    className={
                      activeTab === "edificado_matrimonio_cta"
                        ? "text-white"
                        : "text-primary-base"
                    }
                  />
                  Rodapé (CTA)
                </button>
              </nav>
            </div>
          )}

          {selectedDashboard === "maf_painel" && (isAdmin || isEditorMaf) && (
            <div>
              <h3 className="text-[12px] font-black uppercase tracking-wider text-white bg-primary-base rounded-md mb-4 px-3 py-2 text-center">
                Painel Escola MAF
              </h3>
              <nav className="space-y-1 mb-4">
                <button
                  onClick={() => setActiveTab("leader_profile")}
                  className={`flex items-center w-full gap-3 p-2.5 rounded-lg font-bold text-sm transition text-left cursor-pointer ${
                    activeTab === "leader_profile"
                      ? "bg-primary-base text-white shadow-md border-transparent"
                      : "text-primary-dark hover:bg-[#f7fafd] border-transparent"
                  }`}
                >
                  <UserCircle
                    size={18}
                    className={
                      activeTab === "leader_profile"
                        ? "text-white"
                        : "text-primary-base"
                    }
                  />
                  Meus Dados
                </button>
              </nav>
              <h4 className="text-[10px] uppercase font-bold text-gray-400 mt-4 mb-2 pl-2">DIVISÃO: MINISTÉRIOS</h4>
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab("cursos_geral")}
                  className={`flex items-center w-full gap-3 p-2.5 rounded-lg font-bold text-sm transition text-left cursor-pointer ${
                    activeTab === "cursos_geral" || activeTab === "cursos"
                      ? "bg-primary-base text-white shadow-md border-transparent"
                      : "text-primary-dark hover:bg-[#f7fafd] border-transparent"
                  }`}
                >
                  <Settings
                    size={18}
                    className={
                      activeTab === "cursos_geral" || activeTab === "cursos"
                        ? "text-white"
                        : "text-primary-base"
                    }
                  />
                  Estrutura da Página
                </button>
                <button
                  onClick={() => setActiveTab("cursos_editor")}
                  className={`flex items-center w-full gap-3 p-2.5 rounded-lg font-bold text-sm transition text-left cursor-pointer ${
                    activeTab === "cursos_editor"
                      ? "bg-primary-base text-white shadow-md border-transparent"
                      : "text-primary-dark hover:bg-[#f7fafd] border-transparent"
                  }`}
                >
                  <Grid
                    size={18}
                    className={
                      activeTab === "cursos_editor"
                        ? "text-white"
                        : "text-primary-base"
                    }
                  />
                  Gestão Visual de Cursos
                </button>
              </nav>
            </div>
          )}

          {selectedDashboard === "maf_kids_painel" && (isAdmin || isEditorMaf) && (
            <div>
              <h3 className="text-[12px] font-black uppercase tracking-wider text-white bg-primary-base rounded-md mb-4 px-3 py-2 text-center">
                Painel MAF Kids
              </h3>
              <nav className="space-y-1 mb-4">
                <button
                  onClick={() => setActiveTab("maf_kids")}
                  className={`flex items-center w-full gap-3 p-2.5 rounded-lg font-bold text-sm transition text-left cursor-pointer ${
                    activeTab === "maf_kids"
                      ? "bg-primary-base text-white shadow-md border-transparent"
                      : "text-primary-dark hover:bg-[#f7fafd] border-transparent"
                  }`}
                >
                  <Baby
                    size={18}
                    className={
                      activeTab === "maf_kids"
                        ? "text-white"
                        : "text-primary-base"
                    }
                  />
                  Conteúdo da Página MAF Kids
                </button>
              </nav>
            </div>
          )}

          {selectedDashboard === "filhos_de_paz_painel" && (isAdmin || isEditorFilhosDePaz) && (
            <div>
              <h3 className="text-[12px] font-black uppercase tracking-wider text-white bg-primary-base rounded-md mb-4 px-3 py-2 text-center">
                Painel Filhos de Paz
              </h3>
              <nav className="space-y-1 mb-4">
                <button
                  onClick={() => setActiveTab("leader_profile")}
                  className={`flex items-center w-full gap-3 p-2.5 rounded-lg font-bold text-sm transition text-left cursor-pointer ${
                    activeTab === "leader_profile"
                      ? "bg-primary-base text-white shadow-md border-transparent"
                      : "text-primary-dark hover:bg-[#f7fafd] border-transparent"
                  }`}
                >
                  <UserCircle
                    size={18}
                    className={
                      activeTab === "leader_profile"
                        ? "text-white"
                        : "text-primary-base"
                    }
                  />
                  Meus Dados
                </button>
              </nav>
              <h4 className="text-[10px] uppercase font-bold text-gray-400 mt-4 mb-2 pl-2">EDIÇÃO DA PÁGINA</h4>
              <nav className="space-y-1">
                {[
                  {
                    id: "filhos_de_paz_hero",
                    label: "Seção Hero (Topo)",
                    icon: ImageIcon,
                  },
                  {
                    id: "filhos_de_paz_main",
                    label: "Conteúdo Principal",
                    icon: FileText,
                  },
                  {
                    id: "filhos_de_paz_visao",
                    label: "Seção Visão de Jesus",
                    icon: Heart,
                  },
                  {
                    id: "filhos_de_paz_redes",
                    label: "Seção Outras Redes e Ministérios",
                    icon: Grid,
                  },
                  {
                    id: "filhos_de_paz_subscribers",
                    label: "Inscritos (Informativo)",
                    icon: Mail,
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`flex items-center w-full gap-3 p-2.5 rounded-lg font-bold text-sm transition text-left cursor-pointer ${
                      activeTab === item.id
                        ? "bg-primary-base text-white shadow-md border-transparent"
                        : "text-primary-dark hover:bg-[#f7fafd] border-transparent"
                    }`}
                  >
                    <item.icon
                      size={18}
                      className={
                        activeTab === item.id
                          ? "text-white"
                          : "text-primary-base"
                      }
                    />
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          )}

          {selectedDashboard === "colunista" && (isAdmin || isColunista) && (
            <div>
              <h3 className="text-[12px] font-black uppercase tracking-wider text-white bg-primary-base rounded-md mb-4 px-3 py-2 text-center">
                Painel do Colunista
              </h3>
              <nav className="space-y-1 mb-4">
                <button
                  onClick={() => setActiveTab("leader_profile")}
                  className={`flex items-center w-full gap-3 p-2.5 rounded-lg font-bold text-sm transition text-left cursor-pointer ${
                    activeTab === "leader_profile"
                      ? "bg-primary-base text-white shadow-md border-transparent"
                      : "text-primary-dark hover:bg-[#f7fafd] border-transparent"
                  }`}
                >
                  <UserCircle
                    size={18}
                    className={
                      activeTab === "leader_profile"
                        ? "text-white"
                        : "text-primary-base"
                    }
                  />
                  Meus Dados
                </button>
              </nav>
              <nav className="space-y-1">
                {[
                  {
                    id: "colunista_meus_artigos",
                    label: "Meus Artigos",
                    icon: Edit3,
                  },
                  {
                    id: "colunista_novo_artigo",
                    label: "Escrever Novo Artigo",
                    icon: PlusCircle,
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`flex items-center w-full gap-3 p-2.5 rounded-lg font-bold text-sm transition text-left cursor-pointer ${
                      activeTab === item.id
                        ? "bg-primary-base text-white shadow-md border-transparent"
                        : "text-primary-dark hover:bg-[#f7fafd] border-transparent"
                    }`}
                  >
                    <item.icon
                      size={18}
                      className={
                        activeTab === item.id
                          ? "text-white"
                          : "text-primary-base"
                      }
                    />
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          )}

          <div className="mt-6 pt-4 border-t space-y-2">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center w-full gap-3 p-2.5 rounded-lg font-bold text-sm text-gray-700 hover:bg-gray-100 transition cursor-pointer"
            >
              <ArrowLeft size={18} />
              Voltar para Painel
            </button>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-grow min-w-0 md:flex-1">
          {!selectedDashboard && availableDashboards.length > 1 ? (
            <div className="w-full h-full min-h-[500px] flex flex-col items-center justify-center p-6 md:p-12 bg-white rounded-[14px] border-[1.5px] border-[#c8d8e8] shadow-sm text-center">
              <div className="w-20 h-20 bg-[#f0f6fb] text-primary-base flex items-center justify-center rounded-full mb-6">
                <LayoutDashboard size={40} />
              </div>
              <h2 className="text-2xl font-bold font-serif text-primary-dark mb-3">
                Seja bem-vindo(a)
              </h2>
              <p className="text-gray-500 max-w-md mb-8">
                Você possui múltiplos níveis de permissão. Selecione abaixo qual
                painel você deseja acessar:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl">
                {availableDashboards.map((dash) => (
                  <button
                    key={dash.id}
                    onClick={() => setSelectedDashboard(dash.id)}
                    className="flex flex-col items-center p-6 bg-white border border-[#c8d8e8] rounded-xl shadow-sm hover:border-primary-base hover:shadow-md transition-all group"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#f0f6fb] text-primary-base flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <dash.icon size={24} />
                    </div>
                    <span className="font-bold text-primary-dark">
                      {dash.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : [
              "aparencia",
              "header_logo",
              "inicio",
              "quem_somos",
              "cursos",
              "cursos_geral",
              "cursos_editor",
              "edificado_matrimonio",
              "edificado_matrimonio_leader",
              "edificado_matrimonio_hero",
              "edificado_matrimonio_crencas",
              "edificado_matrimonio_cursos_editor",
              "edificado_matrimonio_cta",
              "contatos",
              "footer",
            ].includes(activeTab) ? (
            <GlobalContentPanel 
              isEmbedded={true} 
              embedTab={
                activeTab.startsWith("edificado_matrimonio") 
                  ? "edificado_matrimonio" 
                  : activeTab.startsWith("cursos") 
                    ? "cursos" 
                    : (activeTab as any)
              } 
              embedSubTab={
                activeTab.startsWith("edificado_matrimonio_") 
                  ? activeTab.replace("edificado_matrimonio_", "") 
                  : activeTab.startsWith("cursos_") 
                    ? activeTab.replace("cursos_", "") 
                    : undefined
              } 
            />
          ) : [
              "leader_overview",
              "leader_profile",
              "member_profile",
              "leader_groups",
              "leader_new_group",
              "leader_reports",
              "leader_history",
              "leader_materials",
              "leader_support",
            ].includes(activeTab) ? (
            <div className="w-full h-full bg-white rounded-[14px] border-[1.5px] border-[#c8d8e8] shadow-sm overflow-hidden">
              {activeTab === "leader_overview" && (
                <DashboardHome isEmbedded={true} />
              )}
              {(activeTab === "leader_profile" || activeTab === "member_profile") && (
                <MeusDados isEmbedded={true} />
              )}
              {activeTab === "leader_groups" && (
                <GruposCadastrados isEmbedded={true} />
              )}
              {activeTab === "leader_new_group" && (
                <CadastrarTurma isEmbedded={true} />
              )}
              {activeTab === "leader_reports" && (
                <EnviarRelatorio isEmbedded={true} />
              )}
              {activeTab === "leader_history" && (
                <MeusRegistros isEmbedded={true} />
              )}
              {activeTab === "leader_materials" && (
                <PedidoMaterial isEmbedded={true} />
              )}
              {activeTab === "leader_support" && <Duvidas isEmbedded={true} />}
            </div>
          ) : [
              "filhos_de_paz_editor",
              "filhos_de_paz_hero",
              "filhos_de_paz_main",
              "filhos_de_paz_visao",
              "filhos_de_paz_redes",
              "filhos_de_paz_subscribers",
            ].includes(activeTab) ? (
            <div className="w-full bg-[#f4f7f9] min-h-screen p-4 xl:p-8">
              <FilhosDePazPanel activeSection={activeTab} />
            </div>
          ) : activeTab === "agenda_eventos" ? (
            <div className="w-full bg-[#f4f7f9] min-h-screen p-4 xl:p-8">
              <AgendaPanel view="events" />
            </div>
          ) : activeTab === "agenda_design" ? (
            <div className="w-full bg-[#f4f7f9] min-h-screen p-4 xl:p-8">
              <AgendaPanel view="design" />
            </div>
          ) : activeTab === "maf_kids" ? (
            <div className="w-full bg-[#f4f7f9] min-h-screen p-4 xl:p-8">
              <MafKidsAdmin />
            </div>
          ) : [
              "colunista_meus_artigos",
              "colunista_novo_artigo"
            ].includes(activeTab) ? (
            <ColunistaPanelComponent activeTab={activeTab} />
          ) : [
              "member_dashboard_preview",
              "member_pessoas",
              "member_departamentos",
              "member_grupos",
              "member_kids",
              "member_ensino",
              "member_agenda",
              "member_midias",
              "member_ajuda"
            ].includes(activeTab) ? (
            <div className="w-full bg-[#f4f7f9] min-h-screen p-4 lg:p-6">
              <MemberDashboardComponent />
            </div>
          ) : (
            <>
              {/* Stats Cards only shown on system management tabs for Admin */}
              {(isAdmin || isSecretary) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 mb-6 w-full">
                  <div className="bg-white p-4 rounded-[12px] border-[1.5px] border-[#c8d8e8] shadow-sm">
                    <div className="flex items-center gap-3 mb-2 text-primary-base">
                      <Users size={18} />
                      <h3 className="font-bold text-[0.75rem] uppercase tracking-wider text-gray-500">
                        Usuários
                      </h3>
                    </div>
                    <div className="flex items-end justify-between">
                      <p className="text-2xl font-serif font-black text-primary-dark">
                        {usersList.length}
                      </p>
                      {newUsersCount > 0 && (
                        <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full border border-green-100">
                          +{newUsersCount}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-[12px] border-[1.5px] border-[#c8d8e8] shadow-sm">
                    <div className="flex items-center gap-3 mb-2 text-primary-base">
                      <BookOpen size={18} />
                      <h3 className="font-bold text-[0.75rem] uppercase tracking-wider text-gray-500">
                        Grupos
                      </h3>
                    </div>
                    <div className="flex items-end justify-between">
                      <p className="text-2xl font-serif font-black text-primary-dark">
                        {groups.length}
                      </p>
                      {newGroupsCount > 0 && (
                        <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full border border-green-100">
                          +{newGroupsCount}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-[12px] border-[1.5px] border-[#c8d8e8] shadow-sm">
                    <div className="flex items-center gap-3 mb-2 text-primary-base">
                      <FileText size={18} />
                      <h3 className="font-bold text-[0.75rem] uppercase tracking-wider text-gray-500">
                        Relatórios
                      </h3>
                    </div>
                    <div className="flex items-end justify-between">
                      <p className="text-2xl font-serif font-black text-primary-dark">
                        {reports.length}
                      </p>
                      {newReportsCount > 0 && (
                        <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full border border-green-100">
                          +{newReportsCount}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-[12px] border-[1.5px] border-[#c8d8e8] shadow-sm">
                    <div className="flex items-center gap-3 mb-2 text-primary-base">
                      <Package size={18} />
                      <h3 className="font-bold text-[0.75rem] uppercase tracking-wider text-gray-500">
                        Pedidos
                      </h3>
                    </div>
                    <div className="flex items-end justify-between">
                      <p className="text-2xl font-serif font-black text-primary-dark">
                        {orders.length}
                      </p>
                      {newOrdersCount > 0 && (
                        <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full border border-green-100">
                          +{newOrdersCount}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-[12px] border-[1.5px] border-[#c8d8e8] shadow-sm">
                    <div className="flex items-center gap-3 mb-2 text-primary-base">
                      <Send size={18} />
                      <h3 className="font-bold text-[0.75rem] uppercase tracking-wider text-gray-500">
                        Mensagens
                      </h3>
                    </div>
                    <div className="flex items-end justify-between">
                      <p className="text-2xl font-serif font-black text-primary-dark">
                        {messages.length}
                      </p>
                      {newMessagesCount > 0 && (
                        <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full border border-green-100">
                          +{newMessagesCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Filters / Actions Bar for Admin lists */}
              <div className="bg-white rounded-[14px] border-[1.5px] border-[#c8d8e8] shadow-sm p-4 mb-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
                  <div className="relative w-full sm:max-w-md">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder="Buscar nesta seção..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 bg-white border-[1.5px] border-[#c8d8e8] rounded-lg text-[0.92rem] text-text-main focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 outline-none transition-all placeholder:text-[#b0c4d5]"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <button
                      onClick={fetchData}
                      className="flex-1 sm:flex-initial px-4 py-2 bg-white border border-[#c8d8e8] rounded-lg text-sm font-bold text-primary-base hover:bg-[#f7fafd] transition-colors cursor-pointer"
                    >
                      Atualizar
                    </button>
                    <button
                      onClick={handleExportCSV}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-[#f7fafd] border-[1.5px] border-[#c8d8e8] rounded-lg text-sm font-bold text-primary-base hover:bg-[#e2eaf3] whitespace-nowrap transition-all cursor-pointer"
                      title="Exportar dados atuais para CSV"
                    >
                      <Download size={16} />
                      Exportar
                    </button>
                  </div>
                </div>
              </div>

              {/* Main Content Render */}
              {activeTab === "matriculas" ? (
                <div className="w-full">
                  <ManageCourseRegistrations />
                </div>
              ) : activeTab === "membros" ? (
                <div className="w-full">
                  <ManageMembers />
                </div>
              ) : activeTab === "permissoes" ? (
                <div className="w-full">
                  <ManagePermissions />
                </div>
              ) : activeTab === "edicao_restrita" ? (
                <div className="w-full">
                  <RestrictedEditionPanel />
                </div>
              ) : (
                <div className="bg-white rounded-[14px] border-[1.5px] border-[#c8d8e8] shadow-[0_4px_28px_rgba(0,0,0,0.05)] overflow-hidden w-full">
                  {isLoading ? (
                    <div className="flex items-center justify-center p-20 text-gray-400">
                      Carregando dados...
                    </div>
                  ) : (
                    <div className="overflow-x-auto w-full">
                      {activeTab === "users" && (
                        <table className="w-full min-w-[700px] text-left border-collapse">
                          <thead>
                            <tr className="bg-[#f7fafd] border-b border-[#c8d8e8]">
                              <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-[#c8d8e8] bg-[#f0f6fb]">
                                Usuário / E-mail
                              </th>
                              <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-[#c8d8e8] bg-[#f0f6fb]">
                                Igreja
                              </th>
                              <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-[#c8d8e8] bg-[#f0f6fb]">
                                Celular
                              </th>
                              <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-[#c8d8e8] bg-[#f0f6fb]">
                                Nível
                              </th>
                              <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-[#c8d8e8] bg-[#f0f6fb] text-right">
                                Ações
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredUsers.filter((u) => {
                              const role = u.role;
                              if (Array.isArray(role)) {
                                return role.some(
                                  (r) =>
                                    r === "leader" ||
                                    r === "lider" ||
                                    r === "lider_de_cursos" ||
                                    (typeof r === "string" &&
                                      r.toLowerCase().includes("lider")),
                                );
                              }
                              return (
                                role === "leader" ||
                                role === "lider" ||
                                role === "lider_de_cursos" ||
                                (typeof role === "string" &&
                                  role.toLowerCase().includes("lider"))
                              );
                            }).length === 0 ? (
                              <tr>
                                <td
                                  colSpan={5}
                                  className="p-8 text-center text-gray-500"
                                >
                                  Nenhum usuário encontrado.
                                </td>
                              </tr>
                            ) : (
                              filteredUsers
                                .filter((u) => {
                                  const role = u.role;
                                  if (Array.isArray(role)) {
                                    return role.some(
                                      (r) =>
                                        r === "leader" ||
                                        r === "lider" ||
                                        r === "lider_de_cursos" ||
                                        (typeof r === "string" &&
                                          r.toLowerCase().includes("lider")),
                                    );
                                  }
                                  return (
                                    role === "leader" ||
                                    role === "lider" ||
                                    role === "lider_de_cursos" ||
                                    (typeof role === "string" &&
                                      role.toLowerCase().includes("lider"))
                                  );
                                })
                                .map((u) => (
                                  <tr
                                    key={u.id}
                                    className={`border-b border-[#c8d8e8] hover:bg-primary-bg transition-colors group ${u.status === "bloqueado" ? "opacity-60 bg-gray-50" : ""}`}
                                  >
                                    <td className="py-4 px-6">
                                      <p className="font-bold text-primary-dark mb-0.5 flex items-center gap-2">
                                        {u.nome || "Sem nome"}
                                        {u.status === "bloqueado" && (
                                          <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] uppercase font-bold rounded">
                                            Bloqueado
                                          </span>
                                        )}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {u.email}
                                      </p>
                                    </td>
                                    <td className="py-4 px-6 text-sm text-[#2c4a63]">
                                      {u.igreja || "-"}
                                    </td>
                                    <td className="py-4 px-6 text-sm text-[#2c4a63]">
                                      {u.celular || "-"}
                                    </td>
                                    <td className="py-4 px-6 flex flex-wrap gap-1">
                                      {(Array.isArray(u.role)
                                        ? u.role
                                        : [u.role || "membro"]
                                      ).map((r: string) => (
                                        <span
                                          key={r}
                                          className={`px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase ${
                                            r === "admin"
                                              ? "bg-[#fef3c7] text-[#92400e]"
                                              : r === "editor"
                                                ? "bg-[#dbeafe] text-[#1e40af]"
                                                : r === "secretary"
                                                  ? "bg-[#ede9fe] text-[#5b21b6]"
                                                  : r === "financial"
                                                    ? "bg-[#dcfce7] text-[#166534]"
                                                    : "bg-[#f3f4f6] text-[#374151]"
                                          }`}
                                        >
                                          {r === "admin"
                                            ? "Administrador"
                                            : r === "editor"
                                              ? "Editor"
                                              : r === "secretary"
                                                ? "Secretaria"
                                                : r === "financial"
                                                  ? "Financeiro"
                                                  : "Líder"}
                                        </span>
                                      ))}
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                      <div className="flex items-center justify-end gap-1">
                                        <button
                                          onClick={() =>
                                            toggleUserStatus(u.id, u.status)
                                          }
                                          className={`p-2 rounded-lg transition-colors ${
                                            u.status === "bloqueado"
                                              ? "text-red-500 hover:bg-red-50"
                                              : "text-gray-400 hover:text-orange-500 hover:bg-orange-50"
                                          }`}
                                          title={
                                            u.status === "bloqueado"
                                              ? "Desbloquear Usuário"
                                              : "Bloquear Usuário"
                                          }
                                        >
                                          {u.status === "bloqueado" ? (
                                            <UserCheck size={16} />
                                          ) : (
                                            <Ban size={16} />
                                          )}
                                        </button>
                                        <button
                                          onClick={() => handleEditUser(u)}
                                          className="p-2 text-gray-400 hover:text-primary-base hover:bg-[#f0f6fa] rounded-lg transition-colors"
                                          title="Editar Usuário"
                                        >
                                          <Edit size={16} />
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleDelete("users", u.id)
                                          }
                                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                          title="Excluir Usuário"
                                        >
                                          <Trash2 size={16} />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))
                            )}
                          </tbody>
                        </table>
                      )}

                      {activeTab === "groups" && (
                        <table className="w-full min-w-[900px] text-left border-collapse">
                          <thead>
                            <tr className="bg-[#f7fafd]">
                              <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-[#c8d8e8] bg-[#f0f6fb]">
                                Líderes / Turma
                              </th>
                              <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-[#c8d8e8] bg-[#f0f6fb]">
                                Igreja / Local
                              </th>
                              <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-[#c8d8e8] bg-[#f0f6fb]">
                                Alunos
                              </th>
                              <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-[#c8d8e8] bg-[#f0f6fb]">
                                Início
                              </th>
                              <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-[#c8d8e8] bg-[#f0f6fb] text-right">
                                Ações
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredGroups.length === 0 ? (
                              <tr>
                                <td
                                  colSpan={5}
                                  className="p-8 text-center text-gray-500"
                                >
                                  Nenhum grupo encontrado.
                                </td>
                              </tr>
                            ) : (
                              filteredGroups.map((g) => (
                                <tr
                                  key={g.id}
                                  className="border-b border-[#c8d8e8] hover:bg-primary-bg transition-colors group"
                                >
                                  <td className="py-4 px-6">
                                    <p className="font-bold text-primary-dark mb-0.5">
                                      {[g.liderMaridoNome, g.liderEsposaNome]
                                        .filter(Boolean)
                                        .join(" & ") ||
                                        "Líderes não informados"}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      Turma{" "}
                                      {g.id?.substring(0, 6).toUpperCase()}
                                    </p>
                                  </td>
                                  <td className="py-4 px-6 text-sm text-[#2c4a63]">
                                    {g.igreja || "-"}
                                    <br />
                                    <span className="text-xs text-gray-400">
                                      {[g.cidade, g.estado]
                                        .filter(Boolean)
                                        .join("-") || "-"}
                                    </span>
                                  </td>
                                  <td className="py-4 px-6 text-sm font-bold text-[#2c4a63]">
                                    {g.casais?.length || 0} casais
                                  </td>
                                  <td className="py-4 px-6 text-sm text-[#2c4a63]">
                                    {g.dataInicio
                                      ? new Date(
                                          g.dataInicio,
                                        ).toLocaleDateString("pt-BR")
                                      : "-"}
                                  </td>
                                  <td className="py-4 px-6 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      <button
                                        onClick={() => handleEditGroup(g)}
                                        className="p-2 text-gray-400 hover:text-primary-base hover:bg-[#f0f6fa] rounded-lg transition-colors"
                                        title="Editar Grupo"
                                      >
                                        <Edit size={16} />
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleDelete("groups", g.id)
                                        }
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Excluir Grupo"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      )}

                      {activeTab === "reports" && (
                        <table className="w-full min-w-[800px] text-left border-collapse">
                          <thead>
                            <tr className="bg-[#f7fafd]">
                              <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-[#c8d8e8] bg-[#f0f6fb]">
                                Data / Lição
                              </th>
                              <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-[#c8d8e8] bg-[#f0f6fb]">
                                Grupo
                              </th>
                              <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-[#c8d8e8] bg-[#f0f6fb]">
                                Presenças / Oferta
                              </th>
                              <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-[#c8d8e8] bg-[#f0f6fb]">
                                Observações
                              </th>
                              <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-[#c8d8e8] bg-[#f0f6fb] text-right">
                                Ações
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {(() => {
                              if (filteredReports.length === 0) {
                                return (
                                  <tr>
                                    <td
                                      colSpan={5}
                                      className="p-8 text-center text-gray-500"
                                    >
                                      Nenhum relatório encontrado.
                                    </td>
                                  </tr>
                                );
                              }

                              const coursesMap: Record<string, string> = {
                                casados: "Casados por Deus",
                                pais: "Apascentando Filhos",
                                noivos: "Antes do Sim",
                                marido: "Marido de Valor",
                                mulher: "Mulher que Edifica",
                                esposa: "Esposa Sábia",
                              };

                              const groupsWithReports = groups
                                .map((group) => {
                                  const groupReports = filteredReports.filter(
                                    (r) => r.groupId === group.id,
                                  );
                                  groupReports.sort(
                                    (a, b) =>
                                      new Date(b.dataReuniao || 0).getTime() -
                                      new Date(a.dataReuniao || 0).getTime(),
                                  );
                                  return { group, reports: groupReports };
                                })
                                .filter((g) => g.reports.length > 0);

                              const orphanedReports = filteredReports.filter(
                                (r) => !groups.some((g) => g.id === r.groupId),
                              );
                              if (orphanedReports.length > 0) {
                                groupsWithReports.push({
                                  group: {
                                    id: "orphaned",
                                    curso: "Outros",
                                  } as any,
                                  reports: orphanedReports,
                                });
                              }

                              return groupsWithReports.map(
                                ({ group, reports }) => {
                                  const cursoName =
                                    coursesMap[group.curso?.toLowerCase()] ||
                                    group.curso ||
                                    "Grupo Desconhecido";

                                  return (
                                    <React.Fragment key={group.id}>
                                      <tr className="bg-[#e8f4ff] border-b border-[#c8d8e8]">
                                        <td
                                          colSpan={5}
                                          className="py-2.5 px-6 text-primary-base font-bold text-[0.95rem]"
                                        >
                                          <div className="flex items-center gap-3 flex-wrap">
                                            <span>
                                              {cursoName}{" "}
                                              <span className="opacity-70 text-[0.8rem] ml-1">
                                                #
                                                {group.id
                                                  .slice(-6)
                                                  .toUpperCase()}
                                              </span>
                                            </span>
                                            <span className="opacity-70 text-[0.8rem] ml-1 px-2 border-l border-primary-base/20">
                                              Líderes:{" "}
                                              {[
                                                group.liderMaridoNome,
                                                group.liderEsposaNome,
                                              ]
                                                .filter(Boolean)
                                                .join(" & ") ||
                                                "Não informados"}
                                            </span>
                                            {group.status === "finalizado" && (
                                              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[0.7rem] uppercase tracking-wider rounded-md border border-green-200 flex items-center gap-1">
                                                <Check size={12} /> Finalizado
                                              </span>
                                            )}
                                          </div>
                                        </td>
                                      </tr>
                                      {reports.map((r) => (
                                        <tr
                                          key={r.id}
                                          className="border-b border-[#c8d8e8] hover:bg-[#fcfdfef9] transition-colors group bg-white"
                                        >
                                          <td className="py-4 px-6 text-sm">
                                            <p className="font-bold text-primary-dark mb-0.5">
                                              {r.dataReuniao
                                                ? new Date(
                                                    r.dataReuniao,
                                                  ).toLocaleDateString(
                                                    "pt-BR",
                                                    {
                                                      timeZone: "UTC",
                                                    },
                                                  )
                                                : "-"}
                                            </p>
                                            <p className="text-xs text-primary-base max-w-[200px] truncate">
                                              Lição:{" "}
                                              {Array.isArray(r.licao)
                                                ? r.licao.join(", ")
                                                : r.licao || "-"}
                                            </p>
                                          </td>
                                          <td className="py-4 px-6 text-sm text-[#2c4a63]">
                                            ID:{" "}
                                            {r.groupId?.substring(0, 8) || "-"}
                                            ...
                                          </td>
                                          <td className="py-4 px-6 text-sm text-[#2c4a63]">
                                            Casais:{" "}
                                            <strong className="text-primary-dark">
                                              {r.casaisReport?.filter(
                                                (c: any) =>
                                                  c.presente === true ||
                                                  c.status === "presente",
                                              ).length || 0}{" "}
                                              de {r.casaisReport?.length || 0}
                                            </strong>
                                            <br />
                                            Oferta:{" "}
                                            <strong className="text-primary-dark">
                                              R$ {r.valorOferta || "0,00"}
                                            </strong>
                                          </td>
                                          <td className="py-4 px-6 text-xs text-gray-600 max-w-[200px] truncate">
                                            {r.observacoesGerais || "-"}
                                          </td>
                                          <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                              <button
                                                onClick={() =>
                                                  handleEditReport(r)
                                                }
                                                className="p-2 text-gray-400 hover:text-primary-base hover:bg-[#f0f6fa] rounded-lg transition-colors"
                                                title="Editar Relatório"
                                              >
                                                <Edit size={16} />
                                              </button>
                                              <button
                                                onClick={() =>
                                                  handleDelete("reports", r.id)
                                                }
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Excluir Relatório"
                                              >
                                                <Trash2 size={16} />
                                              </button>
                                            </div>
                                          </td>
                                        </tr>
                                      ))}
                                    </React.Fragment>
                                  );
                                },
                              );
                            })()}
                          </tbody>
                        </table>
                      )}

                      {activeTab === "orders" && (
                        <table className="w-full min-w-[800px] text-left border-collapse">
                          <thead>
                            <tr className="bg-[#f7fafd]">
                              <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-[#c8d8e8] bg-[#f0f6fb]">
                                Itens / Data
                              </th>
                              <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-[#c8d8e8] bg-[#f0f6fb]">
                                Líder
                              </th>
                              <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-[#c8d8e8] bg-[#f0f6fb]">
                                Igreja / Local
                              </th>
                              <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-[#c8d8e8] bg-[#f0f6fb]">
                                Status
                              </th>
                              <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-[#c8d8e8] bg-[#f0f6fb] text-right">
                                Ação
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredOrders.length === 0 ? (
                              <tr>
                                <td
                                  colSpan={5}
                                  className="p-8 text-center text-gray-500"
                                >
                                  Nenhum pedido encontrado.
                                </td>
                              </tr>
                            ) : (
                              filteredOrders.map((o) => (
                                <tr
                                  key={o.id}
                                  className="border-b border-[#c8d8e8] hover:bg-primary-bg transition-colors group"
                                >
                                  <td className="py-4 px-6">
                                    <div className="space-y-1">
                                      {o.itens?.map((item: any, i: number) => (
                                        <div
                                          key={i}
                                          className="text-sm font-bold text-primary-dark"
                                        >
                                          {item.qty}x {item.nome}
                                        </div>
                                      ))}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-2 font-medium">
                                      {o.createdAt?.toDate
                                        ? new Date(
                                            o.createdAt.toDate(),
                                          ).toLocaleDateString("pt-BR")
                                        : "-"}{" "}
                                      • R${" "}
                                      {Number(o.total || 0)
                                        .toFixed(2)
                                        .replace(".", ",")}
                                    </div>
                                  </td>
                                  <td className="py-4 px-6 text-sm text-[#2c4a63]">
                                    <div className="font-bold">
                                      {o.nomeLider || "Não informado"}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {o.emailLider || "-"}
                                    </div>
                                  </td>
                                  <td className="py-4 px-6 text-sm text-[#2c4a63]">
                                    <div className="font-bold">
                                      {o.cidadeEstado || "-"}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {o.grupoNome || "-"}
                                    </div>
                                  </td>
                                  <td className="py-4 px-6">
                                    <span
                                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide ${
                                        o.status === "pendente"
                                          ? "bg-yellow-100 text-yellow-700"
                                          : o.status === "aprovado"
                                            ? "bg-blue-100 text-blue-700"
                                            : o.status === "enviado"
                                              ? "bg-purple-100 text-purple-700"
                                              : "bg-green-100 text-green-700"
                                      }`}
                                    >
                                      {o.status || "Pendente"}
                                    </span>
                                  </td>
                                  <td className="py-4 px-6 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <button
                                        onClick={() => handleEditOrder(o)}
                                        className="p-2 text-gray-400 hover:text-primary-base hover:bg-[#f0f6fa] rounded-lg transition-colors"
                                        title="Editar Pedido"
                                      >
                                        <Edit size={16} />
                                      </button>
                                      <select
                                        className="text-xs border border-gray-300 rounded p-1.5 text-gray-600 bg-white"
                                        value={o.status || "pendente"}
                                        onChange={(e) =>
                                          updateOrderStatus(
                                            o.id,
                                            e.target.value,
                                          )
                                        }
                                      >
                                        <option value="pendente">
                                          Pendente
                                        </option>
                                        <option value="aprovado">
                                          Aprovado
                                        </option>
                                        <option value="enviado">Enviado</option>
                                        <option value="concluido">
                                          Concluído
                                        </option>
                                      </select>
                                      <button
                                        onClick={() =>
                                          handleDelete("orders", o.id)
                                        }
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Excluir Pedido"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      )}

                      {activeTab === ("messages" as any) && (
                        <table className="w-full min-w-[800px] text-left border-collapse">
                          <thead>
                            <tr className="bg-[#f7fafd]">
                              <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-[#c8d8e8] bg-[#f0f6fb]">
                                Data / Remetente
                              </th>
                              <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-[#c8d8e8] bg-[#f0f6fb]">
                                Mensagem
                              </th>
                              <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-[#c8d8e8] bg-[#f0f6fb]">
                                Status
                              </th>
                              <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-[#c8d8e8] bg-[#f0f6fb] text-right">
                                Ações
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredMessages.length === 0 ? (
                              <tr>
                                <td
                                  colSpan={4}
                                  className="p-8 text-center text-gray-500"
                                >
                                  Nenhuma mensagem encontrada.
                                </td>
                              </tr>
                            ) : (
                              filteredMessages.map((m) => (
                                <tr
                                  key={m.id}
                                  className={`border-b border-[#c8d8e8] hover:bg-primary-bg transition-colors group ${m.status === "unread" ? "bg-[#f7fbff]" : ""}`}
                                >
                                  <td className="py-4 px-6">
                                    <p
                                      className={`mb-0.5 ${m.status === "unread" ? "font-black text-primary-dark" : "font-bold text-[#2c4a63]"}`}
                                    >
                                      {m.nome || "Sem nome"}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {m.email}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                      {m.createdAt?.toDate
                                        ? new Date(
                                            m.createdAt.toDate(),
                                          ).toLocaleDateString("pt-BR")
                                        : "-"}
                                    </p>
                                  </td>
                                  <td className="py-4 px-6 text-sm text-[#2c4a63] max-w-md">
                                    <div className="whitespace-pre-wrap break-all">
                                      {m.mensagem || "-"}
                                    </div>
                                  </td>
                                  <td className="py-4 px-6">
                                    <span
                                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide cursor-pointer ${
                                        m.status === "read"
                                          ? "bg-gray-100 text-gray-600"
                                          : "bg-blue-100 text-blue-700"
                                      }`}
                                      onClick={() =>
                                        toggleMessageStatus(
                                          m.id,
                                          m.status || "unread",
                                        )
                                      }
                                    >
                                      {m.status === "read"
                                        ? "Lida"
                                        : "Não Lida"}
                                    </span>
                                  </td>
                                  <td className="py-4 px-6 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <button
                                        onClick={() =>
                                          handleDelete("contact_messages", m.id)
                                        }
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Excluir Mensagem"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      )}

                      {activeTab === "duvidas_respostas" && (
                        <div className="flex flex-col gap-4">
                          {filteredSupportTickets.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 bg-white rounded-xl border border-[#c8d8e8]">
                              Nenhuma dúvida encontrada.
                            </div>
                          ) : (
                            filteredSupportTickets.map((t) => (
                              <div
                                key={t.id}
                                className="bg-white border border-[#c8d8e8] rounded-xl overflow-hidden shadow-sm"
                              >
                                <div className="p-4 bg-[#f8fafc] border-b border-[#e2eaf3] flex justify-between items-start gap-4">
                                  <div className="flex-1">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">
                                      Pergunta de {t.userName} ({t.userEmail}) •{" "}
                                      {new Date(
                                        t.createdAt?.toDate?.() || Date.now(),
                                      ).toLocaleDateString("pt-BR")}
                                    </span>
                                    <p className="text-[#1e3a5f] font-medium text-sm leading-relaxed break-all">
                                      {t.question}
                                    </p>
                                  </div>
                                  <div className="flex flex-col items-end gap-2 shrink-0">
                                    <span
                                      className={`px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${
                                        t.status === "answered"
                                          ? "bg-green-100/50 text-green-700 border-green-200"
                                          : "bg-orange-100/50 text-orange-700 border-orange-200"
                                      }`}
                                    >
                                      {t.status === "answered"
                                        ? "Respondido"
                                        : "Pendente"}
                                    </span>
                                    <button
                                      onClick={() =>
                                        handleDelete("support_tickets", t.id)
                                      }
                                      className="text-gray-400 hover:text-red-600 transition-colors"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </div>
                                {t.status === "answered" && t.answer ? (
                                  <div className="p-4 flex gap-3 items-start bg-green-50/30 group">
                                    <MessageSquare
                                      size={16}
                                      className="text-green-600 mt-0.5 shrink-0"
                                    />
                                    <div className="flex-1">
                                      <span className="text-xs font-bold text-green-700 uppercase tracking-widest block mb-1">
                                        Sua Resposta (
                                        {t.answeredAt
                                          ? new Date(
                                              t.answeredAt?.toDate?.() ||
                                                Date.now(),
                                            ).toLocaleDateString("pt-BR")
                                          : ""}
                                        )
                                      </span>
                                      {answeringTicketId === t.id ? (
                                        <div className="flex flex-col gap-3 mt-2">
                                          <textarea
                                            value={ticketReplyText}
                                            onChange={(e) =>
                                              setTicketReplyText(e.target.value)
                                            }
                                            placeholder="Escreva sua resposta para o usuário..."
                                            className="w-full border border-[#c8d8e8] bg-white rounded-lg px-4 py-3 min-h-[100px] text-sm focus:outline-none focus:border-[#2b5c87] focus:ring-2 focus:ring-[#2b5c87]/20 transition-all resize-none"
                                          />
                                          <div className="flex items-center gap-2">
                                            <button
                                              onClick={() =>
                                                submitTicketAnswer(t.id)
                                              }
                                              className="bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-primary-dark transition-colors"
                                            >
                                              Salvar Edição
                                            </button>
                                            <button
                                              onClick={() => {
                                                setAnsweringTicketId(null);
                                                setTicketReplyText("");
                                              }}
                                              className="bg-white border border-[#c8d8e8] text-gray-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors"
                                            >
                                              Cancelar
                                            </button>
                                          </div>
                                        </div>
                                      ) : (
                                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-all">
                                          {t.answer}
                                        </p>
                                      )}
                                    </div>
                                    {answeringTicketId !== t.id && (
                                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                          onClick={() => {
                                            setTicketReplyText(t.answer);
                                            setAnsweringTicketId(t.id);
                                          }}
                                          className="p-1 text-gray-400 hover:text-primary-base transition-colors"
                                          title="Editar Resposta"
                                        >
                                          <Edit2 size={16} />
                                        </button>
                                        <button
                                          onClick={async () => {
                                            if (
                                              window.confirm(
                                                "Deseja excluir esta resposta?",
                                              )
                                            ) {
                                              await updateDoc(
                                                doc(
                                                  db,
                                                  "support_tickets",
                                                  t.id,
                                                ),
                                                {
                                                  answer: "",
                                                  status: "pending",
                                                },
                                              );
                                              fetchData();
                                            }
                                          }}
                                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                          title="Excluir Resposta"
                                        >
                                          <Trash2 size={16} />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="p-4 bg-white">
                                    {answeringTicketId === t.id ? (
                                      <div className="flex flex-col gap-3">
                                        <textarea
                                          value={ticketReplyText}
                                          onChange={(e) =>
                                            setTicketReplyText(e.target.value)
                                          }
                                          placeholder="Escreva sua resposta para o usuário..."
                                          className="w-full border border-[#c8d8e8] bg-[#f7fafd] rounded-lg px-4 py-3 min-h-[100px] text-sm focus:outline-none focus:border-[#2b5c87] focus:ring-2 focus:ring-[#2b5c87]/20 transition-all resize-none"
                                        />
                                        <div className="flex items-center gap-2">
                                          <button
                                            onClick={() =>
                                              submitTicketAnswer(t.id)
                                            }
                                            className="bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-primary-dark transition-colors"
                                          >
                                            Salvar Resposta
                                          </button>
                                          <button
                                            onClick={() => {
                                              setAnsweringTicketId(null);
                                              setTicketReplyText("");
                                            }}
                                            className="bg-white border border-[#c8d8e8] text-gray-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors"
                                          >
                                            Cancelar
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() =>
                                          setAnsweringTicketId(t.id)
                                        }
                                        className="text-primary-base text-sm font-bold flex items-center gap-2 hover:underline"
                                      >
                                        <MessageSquare size={16} /> Responder
                                        Dúvida
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      )}

                      {(activeTab === "avisos" ||
                        activeTab === "notifications") && (
                        <div className="p-8 max-w-2xl mx-auto">
                          <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-blue-50 text-primary-base rounded-full flex items-center justify-center mx-auto mb-4">
                              {activeTab === "avisos" ? (
                                <Bell size={32} />
                              ) : (
                                <User size={32} />
                              )}
                            </div>
                            <h2 className="text-2xl font-serif text-primary-dark font-bold">
                              {activeTab === "avisos"
                                ? "Novo Aviso Geral"
                                : "Nova Notificação Individual"}
                            </h2>
                            <p className="text-gray-500">
                              {activeTab === "avisos"
                                ? "Envie uma mensagem importante para todos os líderes da plataforma."
                                : "Envie uma mensagem direta para um líder específico."}
                            </p>
                          </div>

                          <form
                            onSubmit={handleSendNotification}
                            className="space-y-6 bg-white p-8 rounded-[14px] border border-[#c8d8e8] shadow-sm"
                          >
                            <div className="space-y-4">
                              {activeTab === "notifications" && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                >
                                  <label className="text-sm font-bold text-primary-dark block mb-2">
                                    Selecione o Líder
                                  </label>
                                  <select
                                    value={notificationData.targetUserId}
                                    onChange={(e) =>
                                      setNotificationData({
                                        ...notificationData,
                                        targetUserId: e.target.value,
                                      })
                                    }
                                    className="w-full px-4 py-3 bg-[#f7fafd] border border-[#c8d8e8] rounded-xl focus:outline-none focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all text-primary-dark"
                                    required
                                  >
                                    <option value="">Selecione...</option>
                                    {usersList.map((u) => (
                                      <option key={u.id} value={u.id}>
                                        {u.nome || u.email}{" "}
                                        {u.igreja ? `(${u.igreja})` : ""}
                                      </option>
                                    ))}
                                  </select>
                                </motion.div>
                              )}

                              <div>
                                <label className="text-sm font-bold text-primary-dark block mb-2">
                                  Título{" "}
                                  {activeTab === "avisos"
                                    ? "do Aviso"
                                    : "da Notificação"}
                                </label>
                                <input
                                  type="text"
                                  value={notificationData.title}
                                  onChange={(e) =>
                                    setNotificationData({
                                      ...notificationData,
                                      title: e.target.value,
                                    })
                                  }
                                  className="w-full px-4 py-3 bg-[#f7fafd] border border-[#c8d8e8] rounded-xl focus:outline-none focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all text-primary-dark"
                                  placeholder={
                                    activeTab === "avisos"
                                      ? "Ex: Novo material disponível"
                                      : "Ex: Seu relatório foi recebido"
                                  }
                                  required
                                />
                              </div>

                              <div>
                                <label className="text-sm font-bold text-primary-dark block mb-2">
                                  Mensagem
                                </label>
                                <textarea
                                  value={notificationData.message}
                                  onChange={(e) =>
                                    setNotificationData({
                                      ...notificationData,
                                      message: e.target.value,
                                    })
                                  }
                                  className="w-full px-4 py-3 bg-[#f7fafd] border border-[#c8d8e8] rounded-xl focus:outline-none focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all min-h-[120px] text-primary-dark"
                                  placeholder="Escreva sua mensagem aqui..."
                                  required
                                ></textarea>
                              </div>
                            </div>

                            <button
                              type="submit"
                              disabled={isSendingNotification}
                              className="w-full py-4 bg-primary-base text-white rounded-xl font-bold hover:bg-[#0d4f7a] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                              {isSendingNotification ? (
                                "Enviando..."
                              ) : (
                                <>
                                  <Send size={18} />
                                  {activeTab === "avisos"
                                    ? "Enviar Aviso"
                                    : "Enviar Notificação"}
                                </>
                              )}
                            </button>
                          </form>

                          {/* Notifications History */}
                          <div className="mt-12">
                            <h3 className="text-xl font-serif text-primary-dark font-bold mb-6">
                              Histórico de Envios
                            </h3>
                            {(() => {
                              const historyFiltered =
                                notificationsHistory.filter((n) =>
                                  activeTab === "avisos"
                                    ? n.targetType === "all"
                                    : n.targetType === "user",
                                );

                              return historyFiltered.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">
                                  {activeTab === "avisos"
                                    ? "Nenhum aviso enviado ainda."
                                    : "Nenhuma notificação enviada ainda."}
                                </p>
                              ) : (
                                <div className="space-y-4">
                                  {historyFiltered.map((notif) => (
                                    <div
                                      key={notif.id}
                                      className="bg-white p-5 rounded-[14px] border border-[#c8d8e8] shadow-sm flex flex-col items-start gap-2"
                                    >
                                      <div className="flex justify-between w-full items-start gap-4">
                                        <div>
                                          <h4 className="font-bold text-primary-dark text-[1.05rem]">
                                            {notif.title}
                                          </h4>
                                          <p className="text-sm text-gray-500 mt-1">
                                            {notif.message}
                                          </p>
                                          <div className="text-xs text-gray-400 mt-2 font-medium">
                                            Enviado em:{" "}
                                            {new Date(
                                              notif.createdAt?.toDate?.() ||
                                                Date.now(),
                                            ).toLocaleString("pt-BR")}
                                            {" • "}
                                            Destino:{" "}
                                            {notif.targetType === "all"
                                              ? "Todos os Líderes"
                                              : `Líder: ${usersList.find((u) => u.id === notif.targetUserId)?.nome || "Específico"}`}
                                          </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                          <div className="flex items-center gap-2 text-sm font-medium bg-blue-50 text-primary-base px-3 py-1.5 rounded-full border border-blue-100 whitespace-nowrap">
                                            <Bell size={14} />
                                            {notif.targetType === "user" ? (
                                              notif.readBy &&
                                              notif.readBy.length > 0 ? (
                                                <span className="text-green-600 font-bold">
                                                  Visualizada ✔
                                                </span>
                                              ) : (
                                                <span className="text-gray-500 font-bold">
                                                  Não visualizada ainda
                                                </span>
                                              )
                                            ) : notif.readBy &&
                                              notif.readBy.length > 0 ? (
                                              <span className="text-primary-base font-bold">
                                                {notif.readBy.length}{" "}
                                                Visualizações
                                              </span>
                                            ) : (
                                              <span className="text-gray-500 font-bold">
                                                Nenhuma visualização
                                              </span>
                                            )}
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleDelete(
                                                "notifications",
                                                notif.id,
                                              )
                                            }
                                            className="text-xs text-red-500 hover:text-red-700 underline font-medium mt-1 flex items-center gap-1"
                                          >
                                            <Trash2 size={12} />
                                            Excluir
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      )}

                      {activeTab === "treinamento" && (
                        <div className="p-4 sm:p-6 space-y-6">
                          {filteredUsers
                            .filter((u) => {
                              const role = u.role;
                              if (Array.isArray(role)) {
                                return role.some(
                                  (r) =>
                                    r === "leader" ||
                                    r === "lider" ||
                                    r === "lider_de_cursos" ||
                                    (typeof r === "string" &&
                                      r.toLowerCase().includes("lider")),
                                );
                              }
                              return (
                                role === "leader" ||
                                role === "lider" ||
                                role === "lider_de_cursos" ||
                                (typeof role === "string" &&
                                  role.toLowerCase().includes("lider"))
                              );
                            })
                            .map((u) => (
                              <div
                                key={u.id}
                                className={`border border-primary-base/20 rounded-xl overflow-hidden shadow-sm ${u.status === "bloqueado" ? "opacity-60 bg-gray-50" : ""}`}
                              >
                                <div
                                  className={`text-white text-center font-bold py-2.5 text-[0.85rem] uppercase tracking-wider ${u.status === "bloqueado" ? "bg-red-500" : "bg-[#2c5877]"}`}
                                >
                                  Líderes em Treinamento{" "}
                                  {u.status === "bloqueado"
                                    ? "(BLOQUEADO)"
                                    : ""}
                                </div>
                                <div
                                  className={`p-4 sm:p-5 ${u.status === "bloqueado" ? "bg-gray-50" : "bg-white"}`}
                                >
                                  <div className="space-y-4">
                                    {/* Row Marido */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-[0.85rem] text-primary-dark border-b border-gray-100 pb-4">
                                      <div>
                                        <span className="font-bold">
                                          Nome (Marido):
                                        </span>{" "}
                                        {u.nome || "-"}
                                      </div>
                                      <div>
                                        <span className="font-bold">CPF:</span>{" "}
                                        {u.cpf || "-"}
                                      </div>
                                      <div>
                                        <span className="font-bold">
                                          Email:
                                        </span>{" "}
                                        {u.email
                                          ? String(u.email).toUpperCase()
                                          : "-"}
                                      </div>
                                      <div>
                                        <span className="font-bold">
                                          Telefone:
                                        </span>{" "}
                                        {u.celular || u.telefone || "-"}
                                      </div>
                                    </div>

                                    {/* Row Esposa */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-[0.85rem] text-primary-dark">
                                      <div>
                                        <span className="font-bold">
                                          Nome (Esposa):
                                        </span>{" "}
                                        {u.nomeEsposa || "-"}
                                      </div>
                                      <div>
                                        <span className="font-bold">CPF:</span>{" "}
                                        {u.cpfEsposa || "-"}
                                      </div>
                                      <div>
                                        <span className="font-bold">
                                          Email:
                                        </span>{" "}
                                        {u.emailEsposa
                                          ? String(u.emailEsposa).toUpperCase()
                                          : "-"}
                                      </div>
                                      <div>
                                        <span className="font-bold">
                                          Telefone:
                                        </span>{" "}
                                        {u.telefoneEsposa || "-"}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Histórico em Grupos */}
                                  {(() => {
                                    const traineeGroups = groups.filter((g) => {
                                      if (
                                        !u.email &&
                                        !u.emailEsposa &&
                                        !u.nome &&
                                        !u.nomeEsposa &&
                                        !u.cpf &&
                                        !u.cpfEsposa
                                      )
                                        return false;

                                      const normalize = (
                                        str?: string | undefined,
                                      ) => (str || "").trim().toLowerCase();
                                      const getCpf = (
                                        str?: string | undefined,
                                      ) => (str || "").replace(/\D/g, "");

                                      const uEmailM = normalize(
                                        String(u.email || ""),
                                      );
                                      const uEmailE = normalize(
                                        String(u.emailEsposa || ""),
                                      );
                                      const uNomeM = normalize(u.nome);
                                      const uNomeE = normalize(u.nomeEsposa);
                                      const uCpfM = getCpf(u.cpf);
                                      const uCpfE = getCpf(u.cpfEsposa);

                                      const gEmailM = normalize(
                                        g.treiMaridoEmail,
                                      );
                                      const gEmailE = normalize(
                                        g.treiEsposaEmail,
                                      );
                                      const gNomeM = normalize(
                                        g.treiMaridoNome,
                                      );
                                      const gNomeE = normalize(
                                        g.treiEsposaNome,
                                      );
                                      const gCpfM = getCpf(g.treiMaridoCpf);
                                      const gCpfE = getCpf(g.treiEsposaCpf);

                                      const matchEmail =
                                        (uEmailM &&
                                          (uEmailM === gEmailM ||
                                            uEmailM === gEmailE)) ||
                                        (uEmailE &&
                                          (uEmailE === gEmailM ||
                                            uEmailE === gEmailE));

                                      const matchCpf =
                                        (uCpfM &&
                                          (uCpfM === gCpfM ||
                                            uCpfM === gCpfE)) ||
                                        (uCpfE &&
                                          (uCpfE === gCpfM || uCpfE === gCpfE));

                                      const checkIncludes = (
                                        name1: string,
                                        name2: string,
                                      ) => {
                                        if (!name1 || !name2) return false;
                                        if (
                                          name1.length < 4 ||
                                          name2.length < 4
                                        )
                                          return name1 === name2;
                                        return (
                                          name1.includes(name2) ||
                                          name2.includes(name1)
                                        );
                                      };

                                      const matchNome =
                                        (uNomeM &&
                                          (checkIncludes(uNomeM, gNomeM) ||
                                            checkIncludes(uNomeM, gNomeE))) ||
                                        (uNomeE &&
                                          (checkIncludes(uNomeE, gNomeM) ||
                                            checkIncludes(uNomeE, gNomeE)));

                                      return (
                                        matchEmail || matchCpf || matchNome
                                      );
                                    });

                                    return (
                                      <div className="mt-4 pt-4 border-t border-gray-100">
                                        <h4 className="font-bold text-[0.85rem] text-primary-dark mb-3 opacity-90 uppercase tracking-widest text-primary-base">
                                          Histórico de Participação como Líder
                                          em Trein.
                                        </h4>

                                        {traineeGroups.length === 0 ? (
                                          <div className="p-4 bg-gray-50 border border-gray-200 border-dashed rounded-xl text-center text-gray-500 text-sm">
                                            Nenhum histórico encontrado em
                                            grupos como líder em treinamento
                                            para este usuário.
                                          </div>
                                        ) : (
                                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {traineeGroups.map((g) => {
                                              const coursesMap: Record<
                                                string,
                                                string
                                              > = {
                                                casados: "Casados por Deus",
                                                pais: "Apascentando Filhos",
                                                noivos: "Antes do Sim",
                                                marido: "Marido de Valor",
                                                mulher: "Mulher que Edifica",
                                                esposa: "Esposa Sábia",
                                              };
                                              const cursoName =
                                                coursesMap[
                                                  g.curso?.toLowerCase()
                                                ] ||
                                                g.curso ||
                                                "Desconhecido";

                                              const startDate = g.createdAt
                                                ?.toDate
                                                ? g.createdAt
                                                    .toDate()
                                                    .toLocaleDateString("pt-BR")
                                                : "Sem data";
                                              const endDate =
                                                g.status === "finalizado" &&
                                                g.updatedAt?.toDate
                                                  ? g.updatedAt
                                                      .toDate()
                                                      .toLocaleDateString(
                                                        "pt-BR",
                                                      )
                                                  : g.status === "finalizado"
                                                    ? "Finalizado"
                                                    : "Em andamento";

                                              // Check course completion status from reports
                                              const groupReports =
                                                reports.filter(
                                                  (r) => r.groupId === g.id,
                                                );
                                              groupReports.sort(
                                                (a, b) =>
                                                  new Date(
                                                    b.dataReuniao || 0,
                                                  ).getTime() -
                                                  new Date(
                                                    a.dataReuniao || 0,
                                                  ).getTime(),
                                              );

                                              let concluiuCurso =
                                                "Não avaliado";
                                              let courseCompletionStyle =
                                                "bg-gray-100 text-gray-500 font-medium";

                                              for (const report of groupReports) {
                                                if (
                                                  report.liderTreinamentoReport
                                                    ?.concluiuCurso
                                                ) {
                                                  const status =
                                                    report
                                                      .liderTreinamentoReport
                                                      .concluiuCurso;
                                                  if (status === "Sim") {
                                                    concluiuCurso =
                                                      "Sim, concluído";
                                                    courseCompletionStyle =
                                                      "bg-green-100 text-green-700 font-bold";
                                                  } else if (status === "Não") {
                                                    concluiuCurso =
                                                      "Não concluiu";
                                                    courseCompletionStyle =
                                                      "bg-red-100 text-red-700 font-bold";
                                                  }
                                                  break; // Found the latest evaluation
                                                }
                                              }

                                              return (
                                                <div
                                                  key={g.id}
                                                  className="p-3 bg-[#f7fafd] border border-[#c8d8e8] rounded-xl text-[0.8rem]"
                                                >
                                                  <div className="flex justify-between items-start mb-2 pb-2 border-b border-[#c8d8e8]/50">
                                                    <strong className="text-primary-base font-bold">
                                                      {cursoName}
                                                    </strong>
                                                    <span
                                                      className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${g.status === "finalizado" ? "bg-green-100 text-green-700" : "bg-blue-100 text-primary-base"}`}
                                                    >
                                                      {g.status === "finalizado"
                                                        ? "Finalizado"
                                                        : "Ativo"}
                                                    </span>
                                                  </div>
                                                  <div className="text-primary-dark space-y-1.5">
                                                    <div className="flex justify-between">
                                                      <span className="text-gray-500 font-medium">
                                                        Código da Turma:
                                                      </span>
                                                      <span className="font-mono text-gray-700 font-bold bg-white px-1 py-0.5 rounded border border-[#c8d8e8]">
                                                        #
                                                        {g.id
                                                          .slice(-6)
                                                          .toUpperCase()}
                                                      </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                      <span className="text-gray-500 font-medium">
                                                        Liderança:
                                                      </span>
                                                      <span className="text-right truncate max-w-[130px] font-medium text-gray-700">
                                                        {[
                                                          g.liderMaridoNome,
                                                          g.liderEsposaNome,
                                                        ]
                                                          .filter(Boolean)
                                                          .join(" & ") ||
                                                          "Não inf."}
                                                      </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                      <span className="text-gray-500 font-medium">
                                                        Início:
                                                      </span>
                                                      <span className="font-bold text-gray-700">
                                                        {startDate}
                                                      </span>
                                                    </div>
                                                    <div className="flex justify-between border-b border-gray-200 pb-1.5 mb-1.5">
                                                      <span className="text-gray-500 font-medium">
                                                        Término:
                                                      </span>
                                                      <span className="font-bold text-gray-700">
                                                        {endDate}
                                                      </span>
                                                    </div>
                                                    <div className="flex justify-between items-center bg-white px-2 py-1.5 rounded-md border border-[#c8d8e8] mt-2">
                                                      <span className="text-gray-500 font-bold text-[10px] uppercase tracking-wider">
                                                        Aprovação:
                                                      </span>
                                                      <span
                                                        className={`px-2 py-0.5 rounded text-[10px] tracking-wide inline-block ${courseCompletionStyle}`}
                                                      >
                                                        {concluiuCurso}
                                                      </span>
                                                    </div>
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })()}

                                  {/* Cursos */}
                                  <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="font-bold text-[0.85rem] text-primary-dark mr-1">
                                        Cursos Concluídos:
                                      </span>
                                      {(!u.cursosConcluidos ||
                                        u.cursosConcluidos.length === 0) && (
                                        <span className="text-xs text-gray-400 italic">
                                          Nenhum
                                        </span>
                                      )}
                                      {u.cursosConcluidos?.map(
                                        (c: string, i: number) => (
                                          <span
                                            key={i}
                                            className="px-2 py-1 bg-green-100 text-green-700 font-bold text-[10px] uppercase tracking-wider rounded-md"
                                          >
                                            {c}
                                          </span>
                                        ),
                                      )}
                                    </div>

                                    <div className="flex flex-wrap items-center justify-start xl:justify-end gap-2">
                                      <button
                                        onClick={() =>
                                          toggleUserStatus(u.id, u.status)
                                        }
                                        className={`p-2 rounded-lg transition-colors border bg-white shadow-sm ${
                                          u.status === "bloqueado"
                                            ? "text-red-500 border-red-200 hover:bg-red-50"
                                            : "text-gray-500 border-gray-200 hover:text-orange-500 hover:bg-orange-50"
                                        }`}
                                        title={
                                          u.status === "bloqueado"
                                            ? "Desbloquear Usuário"
                                            : "Bloquear Usuário"
                                        }
                                      >
                                        {u.status === "bloqueado" ? (
                                          <UserCheck size={16} />
                                        ) : (
                                          <Ban size={16} />
                                        )}
                                      </button>

                                      <button
                                        onClick={() => handleEditUser(u)}
                                        className="p-2 border border-gray-200 bg-white shadow-sm text-gray-500 hover:text-primary-base hover:bg-[#f0f6fa] rounded-lg transition-colors"
                                        title="Editar Usuário"
                                      >
                                        <Edit size={16} />
                                      </button>

                                      <button
                                        onClick={() =>
                                          handleDelete("users", u.id)
                                        }
                                        className="p-2 border border-gray-200 bg-white shadow-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Excluir Usuário"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          {filteredUsers.filter((u) => {
                            const role = u.role;
                            if (Array.isArray(role)) {
                              return role.some(
                                (r) =>
                                  r === "leader" ||
                                  r === "lider" ||
                                  r === "lider_de_cursos" ||
                                  (typeof r === "string" &&
                                    r.toLowerCase().includes("lider")),
                              );
                            }
                            return (
                              role === "leader" ||
                              role === "lider" ||
                              role === "lider_de_cursos" ||
                              (typeof role === "string" &&
                                role.toLowerCase().includes("lider"))
                            );
                          }).length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                              Nenhum líder de curso encontrado.
                            </div>
                          )}
                        </div>
                      )}

                      {activeTab === "whatsapp" && (
                        <div className="p-8 max-w-2xl mx-auto">
                          <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-[#25D366]/10 text-[#25D366] rounded-full flex items-center justify-center mx-auto mb-4">
                              <MessageCircle size={32} />
                            </div>
                            <h2 className="text-2xl font-serif text-primary-dark font-bold">
                              Mensagem via WhatsApp
                            </h2>
                            <p className="text-gray-500 max-w-lg mx-auto">
                              Gere links para o WhatsApp Web ou aplicativo. Se
                              for Enviar para Todos, aparecerá uma lista de
                              links para facilitar o contato iterativo.
                            </p>
                          </div>

                          <div className="space-y-6 bg-white p-8 rounded-[14px] border border-[#c8d8e8] shadow-sm">
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-bold text-primary-dark block mb-2">
                                  Destinatário
                                </label>
                                <select
                                  value={whatsappData.targetType}
                                  onChange={(e) =>
                                    setWhatsappData({
                                      ...whatsappData,
                                      targetType: e.target.value as any,
                                      targetUserId: "",
                                    })
                                  }
                                  className="w-full px-4 py-3 bg-[#f7fafd] border border-[#c8d8e8] rounded-xl focus:outline-none focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all text-primary-dark"
                                >
                                  <option value="user">
                                    Usuário Específico
                                  </option>
                                  <option value="all">
                                    Todos os Cadastrados
                                  </option>
                                </select>
                              </div>

                              {whatsappData.targetType === "user" && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                >
                                  <label className="text-sm font-bold text-primary-dark block mb-2 mt-4">
                                    Selecione o Usuário
                                  </label>
                                  <select
                                    value={whatsappData.targetUserId}
                                    onChange={(e) =>
                                      setWhatsappData({
                                        ...whatsappData,
                                        targetUserId: e.target.value,
                                      })
                                    }
                                    className="w-full px-4 py-3 bg-[#f7fafd] border border-[#c8d8e8] rounded-xl focus:outline-none focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all text-primary-dark"
                                  >
                                    <option value="">Selecione...</option>
                                    {usersList.map((u) => (
                                      <option key={u.id} value={u.id}>
                                        {u.nome} ({u.role || "Usuário"}) -{" "}
                                        {u.celular || "Sem Celular"}
                                      </option>
                                    ))}
                                  </select>
                                </motion.div>
                              )}

                              <div>
                                <label className="text-sm font-bold text-primary-dark block mb-2 mt-4">
                                  Mensagem
                                </label>
                                <textarea
                                  value={whatsappData.message}
                                  onChange={(e) =>
                                    setWhatsappData({
                                      ...whatsappData,
                                      message: e.target.value,
                                    })
                                  }
                                  className="w-full px-4 py-3 bg-[#f7fafd] border border-[#c8d8e8] rounded-xl focus:outline-none focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all min-h-[120px] text-primary-dark"
                                  placeholder="Olá, gostaria de comunicar que..."
                                ></textarea>
                              </div>
                            </div>

                            {whatsappData.targetType === "user" ? (
                              <button
                                type="button"
                                onClick={() => {
                                  if (
                                    !whatsappData.targetUserId ||
                                    !whatsappData.message
                                  ) {
                                    alert(
                                      "Preencha a mensagem e selecione o destinatário.",
                                    );
                                    return;
                                  }
                                  const user = usersList.find(
                                    (u) => u.id === whatsappData.targetUserId,
                                  );
                                  if (
                                    !user ||
                                    (!user.celular && !user.celularEsposa)
                                  ) {
                                    alert(
                                      "Usuário não possui número de celular cadastrado.",
                                    );
                                    return;
                                  }
                                  const rawNum =
                                    user.celular || user.celularEsposa;
                                  const cel = rawNum.replace(/\D/g, "");

                                  // Format 55 + DDD + number handling natively if without prefix
                                  const formattedCel = cel.startsWith("55")
                                    ? cel
                                    : "55" + cel;

                                  const url = `https://wa.me/${formattedCel}?text=${encodeURIComponent(whatsappData.message)}`;
                                  window.open(url, "_blank");
                                }}
                                className="w-full mt-6 py-4 bg-[#25D366] text-white rounded-xl font-bold hover:bg-[#20bd5a] transition-all flex items-center justify-center gap-2 shadow-md"
                              >
                                <MessageCircle size={18} />
                                Abrir WhatsApp
                              </button>
                            ) : (
                              <div className="mt-8 pt-6 border-t border-gray-100">
                                <h4 className="text-primary-dark font-bold mb-4 flex items-center gap-2">
                                  <Users size={18} /> Lista de Transmissão
                                  Manual
                                </h4>
                                <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar space-y-3">
                                  {usersList
                                    .filter((u) => u.celular || u.celularEsposa)
                                    .map((u) => {
                                      const rawNum =
                                        u.celular || u.celularEsposa || "";
                                      const cel = rawNum.replace(/\D/g, "");
                                      const formattedCel = cel.startsWith("55")
                                        ? cel
                                        : "55" + cel;
                                      const link = `https://wa.me/${formattedCel}?text=${encodeURIComponent(whatsappData.message || "")}`;

                                      return (
                                        <div
                                          key={u.id}
                                          className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border border-[#e2eaf3] rounded-lg gap-2"
                                        >
                                          <div className="min-w-0">
                                            <div className="font-bold text-primary-dark text-sm truncate">
                                              {u.nome}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                              {rawNum}
                                            </div>
                                          </div>
                                          <a
                                            href={link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366]/10 text-[#17a54a] hover:bg-[#25D366]/20 transition-colors rounded-lg text-xs font-bold whitespace-nowrap"
                                          >
                                            <MessageCircle size={14} /> Enviar
                                          </a>
                                        </div>
                                      );
                                    })}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Treinamento Edit Modal */}
        {editingTreinamentoUser && (
          <div className="fixed inset-0 bg-primary-dark/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-xl"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-serif font-black text-primary-dark">
                    Registrar Cursos Concluídos
                  </h3>
                  <p className="text-gray-500 text-sm mt-1">
                    {editingTreinamentoUser.nome}{" "}
                    {editingTreinamentoUser.nomeEsposa
                      ? ` e ${editingTreinamentoUser.nomeEsposa}`
                      : ""}
                  </p>
                </div>
                <button
                  onClick={() => setEditingTreinamentoUser(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <div className="space-y-3 mb-8">
                {COURSES_LIST.map((course) => {
                  const isSelected = treinamentoCourses.includes(course);
                  return (
                    <label
                      key={course}
                      className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${isSelected ? "border-primary-base bg-[#f0f6fb]" : "border-[#c8d8e8] hover:bg-gray-50"}`}
                    >
                      <div
                        className={`w-6 h-6 rounded border flex items-center justify-center shrink-0 ${isSelected ? "bg-primary-base border-primary-base text-white" : "border-[#c8d8e8] bg-white"}`}
                      >
                        {isSelected && <Check size={16} strokeWidth={3} />}
                      </div>
                      <span
                        className={`font-bold text-sm ${isSelected ? "text-primary-base" : "text-primary-dark"}`}
                      >
                        {course}
                      </span>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setTreinamentoCourses([
                              ...treinamentoCourses,
                              course,
                            ]);
                          } else {
                            setTreinamentoCourses(
                              treinamentoCourses.filter((c) => c !== course),
                            );
                          }
                        }}
                      />
                    </label>
                  );
                })}
              </div>

              <div className="flex gap-3 justify-end mt-4">
                <button
                  onClick={() => setEditingTreinamentoUser(null)}
                  className="px-6 py-2.5 text-[#64748b] font-bold hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveTreinamento}
                  className="px-6 py-2.5 bg-primary-base text-white font-bold rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Salvar Cursos
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Edit User Modal */}
        {editingUser && (
          <div className="fixed inset-0 bg-primary-dark/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-serif text-primary-dark font-bold">
                  Editar Usuário
                </h2>
                <button
                  onClick={() => setEditingUser(null)}
                  className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex border-b border-[#c8d8e8] mb-6">
                <button
                  className={`px-4 py-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeModalTab === "marido" ? "border-primary-base text-primary-base" : "border-transparent text-gray-500 hover:text-gray-800"}`}
                  onClick={() => setActiveModalTab("marido")}
                >
                  <User size={16} /> Marido/Titular
                </button>
                <button
                  className={`px-4 py-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeModalTab === "esposa" ? "border-primary-base text-primary-base" : "border-transparent text-gray-500 hover:text-gray-800"}`}
                  onClick={() => setActiveModalTab("esposa")}
                >
                  <Heart size={16} /> Esposa
                </button>
                <button
                  className={`px-4 py-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeModalTab === "endereco" ? "border-primary-base text-primary-base" : "border-transparent text-gray-500 hover:text-gray-800"}`}
                  onClick={() => setActiveModalTab("endereco")}
                >
                  <MapPin size={16} /> Endereço
                </button>
                <button
                  className={`px-4 py-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeModalTab === "acesso" ? "border-primary-base text-primary-base" : "border-transparent text-gray-500 hover:text-gray-800"}`}
                  onClick={() => setActiveModalTab("acesso")}
                >
                  <Lock size={16} /> Acesso
                </button>
              </div>

              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                {activeModalTab === "marido" && (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-1 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                          Nome Completo do Marido
                        </label>
                        <input
                          type="text"
                          value={editFormData.nome}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              nome: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 text-sm rounded-xl bg-[#f7fafd] border border-[#c8d8e8] focus:outline-none focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                          CPF
                        </label>
                        <input
                          type="text"
                          value={editFormData.cpf}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              cpf: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 text-sm rounded-xl bg-[#f7fafd] border border-[#c8d8e8] focus:outline-none focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                          Data Nascimento
                        </label>
                        <input
                          type="date"
                          value={editFormData.dataNascimento}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              dataNascimento: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 text-sm rounded-xl bg-[#f7fafd] border border-[#c8d8e8] focus:outline-none focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                          Telefone
                        </label>
                        <input
                          type="text"
                          value={editFormData.telefone}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              telefone: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 text-sm rounded-xl bg-[#f7fafd] border border-[#c8d8e8] focus:outline-none focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                          Celular
                        </label>
                        <input
                          type="text"
                          value={editFormData.celular}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              celular: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 text-sm rounded-xl bg-[#f7fafd] border border-[#c8d8e8] focus:outline-none focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                          Profissão
                        </label>
                        <input
                          type="text"
                          value={editFormData.profissao}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              profissao: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 text-sm rounded-xl bg-[#f7fafd] border border-[#c8d8e8] focus:outline-none focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                          Igreja
                        </label>
                        <input
                          type="text"
                          value={editFormData.igreja}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              igreja: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 text-sm rounded-xl bg-[#f7fafd] border border-[#c8d8e8] focus:outline-none focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                        Observações
                      </label>
                      <textarea
                        value={editFormData.observacoes}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            observacoes: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 text-sm rounded-xl bg-[#f7fafd] border border-[#c8d8e8] focus:outline-none focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all min-h-[80px]"
                      ></textarea>
                    </div>
                  </div>
                )}

                {activeModalTab === "esposa" && (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-1 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                          Nome Completo da Esposa
                        </label>
                        <input
                          type="text"
                          value={editFormData.nomeEsposa}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              nomeEsposa: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 text-sm rounded-xl bg-[#f7fafd] border border-[#c8d8e8] focus:outline-none focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                          CPF
                        </label>
                        <input
                          type="text"
                          value={editFormData.cpfEsposa}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              cpfEsposa: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 text-sm rounded-xl bg-[#f7fafd] border border-[#c8d8e8] focus:outline-none focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                          Data Nascimento
                        </label>
                        <input
                          type="date"
                          value={editFormData.dataNascimentoEsposa}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              dataNascimentoEsposa: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 text-sm rounded-xl bg-[#f7fafd] border border-[#c8d8e8] focus:outline-none focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                          Celular
                        </label>
                        <input
                          type="text"
                          value={editFormData.celularEsposa}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              celularEsposa: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 text-sm rounded-xl bg-[#f7fafd] border border-[#c8d8e8] focus:outline-none focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                          Profissão
                        </label>
                        <input
                          type="text"
                          value={editFormData.profissaoEsposa}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              profissaoEsposa: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 text-sm rounded-xl bg-[#f7fafd] border border-[#c8d8e8] focus:outline-none focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeModalTab === "endereco" && (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                          CEP
                        </label>
                        <input
                          type="text"
                          value={editFormData.cep || ""}
                          onChange={(e) => {
                            const val = e.target.value
                              .replace(/\D/g, "")
                              .replace(/(\d{5})(\d)/, "$1-$2")
                              .replace(/(-\d{3})\d+?$/, "$1");
                            setEditFormData({
                              ...editFormData,
                              cep: val,
                            });
                            if (val.replace(/\D/g, "").length === 8) {
                              fetchAddressAdmin(val);
                            }
                          }}
                          className="w-full px-4 py-2 text-sm rounded-xl bg-[#f7fafd] border border-[#c8d8e8] focus:outline-none focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                          Rua
                        </label>
                        <input
                          type="text"
                          value={editFormData.rua}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              rua: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 text-sm rounded-xl bg-[#f7fafd] border border-[#c8d8e8] focus:outline-none focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                          Número
                        </label>
                        <input
                          type="text"
                          value={editFormData.numero}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              numero: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 text-sm rounded-xl bg-[#f7fafd] border border-[#c8d8e8] focus:outline-none focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                          Complemento
                        </label>
                        <input
                          type="text"
                          value={editFormData.complemento}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              complemento: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 text-sm rounded-xl bg-[#f7fafd] border border-[#c8d8e8] focus:outline-none focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                          Bairro
                        </label>
                        <input
                          type="text"
                          value={editFormData.bairro}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              bairro: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 text-sm rounded-xl bg-[#f7fafd] border border-[#c8d8e8] focus:outline-none focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                          Cidade
                        </label>
                        <input
                          type="text"
                          value={editFormData.cidade}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              cidade: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 text-sm rounded-xl bg-[#f7fafd] border border-[#c8d8e8] focus:outline-none focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                          Estado
                        </label>
                        <input
                          type="text"
                          value={editFormData.estado}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              estado: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 text-sm rounded-xl bg-[#f7fafd] border border-[#c8d8e8] focus:outline-none focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeModalTab === "acesso" && (
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-xl space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                          Nível de Acesso
                        </label>
                        <select
                          value={
                            Array.isArray(editFormData.role)
                              ? editFormData.role[0]
                              : editFormData.role || "membro"
                          }
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              role: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 text-sm rounded-xl bg-[#f7fafd] border border-[#c8d8e8] focus:outline-none focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all"
                        >
                          <option value="leader">Líder (Padrão)</option>
                          <option value="editor">Editor (Conteúdo Site)</option>
                          <option value="editor_edificado">Editor Edificado Matrimônio</option>
                          <option value="editor_maf">Editor Escola MAF</option>
                          <option value="secretary">Secretaria (MFD)</option>
                          <option value="financial">
                            Financeiro (Pedidos)
                          </option>
                          <option value="admin">Administrador</option>
                        </select>
                      </div>

                      {editingUser.email && (
                        <button
                          type="button"
                          onClick={() => handleResetPassword(editingUser.email)}
                          className="w-full py-2 bg-white border border-[#c8d8e8] text-primary-dark text-sm font-bold rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Enviar E-mail de Redefinição de Senha
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 mt-6 border-t border-[#c8d8e8] flex justify-end gap-3">
                <button
                  onClick={() => setEditingUser(null)}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveEditedUser}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-primary-base hover:bg-[#0d4f7a] transition-colors flex items-center gap-2"
                >
                  <Check size={18} />
                  Salvar
                </button>
              </div>
            </motion.div>
          </div>
        )}
        {/* Edit Group Modal */}
        {editingGroup && (
          <div className="fixed inset-0 bg-primary-dark/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-6 w-full max-w-2xl shadow-xl max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-serif text-primary-dark font-bold">
                  Editar Turma / Grupo
                </h2>
                <button
                  onClick={() => setEditingGroup(null)}
                  className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex border-b border-[#c8d8e8] mb-6 overflow-x-auto custom-scrollbar pb-1">
                <button
                  className={`px-4 py-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeGroupModalTab === "info" ? "border-primary-base text-primary-base" : "border-transparent text-gray-500 hover:text-gray-800"}`}
                  onClick={() => setActiveGroupModalTab("info")}
                >
                  Informações
                </button>
                <button
                  className={`px-4 py-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeGroupModalTab === "lideres" ? "border-primary-base text-primary-base" : "border-transparent text-gray-500 hover:text-gray-800"}`}
                  onClick={() => setActiveGroupModalTab("lideres")}
                >
                  Líderes
                </button>
                <button
                  className={`px-4 py-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeGroupModalTab === "endereco" ? "border-primary-base text-primary-base" : "border-transparent text-gray-500 hover:text-gray-800"}`}
                  onClick={() => setActiveGroupModalTab("endereco")}
                >
                  Endereço Líder
                </button>
                <button
                  className={`px-4 py-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeGroupModalTab === "igreja" ? "border-primary-base text-primary-base" : "border-transparent text-gray-500 hover:text-gray-800"}`}
                  onClick={() => setActiveGroupModalTab("igreja")}
                >
                  Igreja/Treinamento
                </button>
                <button
                  className={`px-4 py-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeGroupModalTab === "casais" ? "border-primary-base text-primary-base" : "border-transparent text-gray-500 hover:text-gray-800"}`}
                  onClick={() => setActiveGroupModalTab("casais")}
                >
                  Casais ({editGroupData.casais?.length || 0})
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {activeGroupModalTab === "info" && (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                          Curso
                        </label>
                        <input
                          type="text"
                          value={editGroupData.curso}
                          onChange={(e) =>
                            setEditGroupData({
                              ...editGroupData,
                              curso: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 text-sm rounded-xl bg-[#f7fafd] border border-[#c8d8e8] focus:outline-none focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                          Data Início
                        </label>
                        <input
                          type="date"
                          value={editGroupData.dataInicio}
                          onChange={(e) =>
                            setEditGroupData({
                              ...editGroupData,
                              dataInicio: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 text-sm rounded-xl bg-[#f7fafd] border border-[#c8d8e8] focus:outline-none focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all"
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                          Dia da Semana
                        </label>
                        <input
                          type="text"
                          value={editGroupData.diaSemana}
                          onChange={(e) =>
                            setEditGroupData({
                              ...editGroupData,
                              diaSemana: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 text-sm rounded-xl bg-[#f7fafd] border border-[#c8d8e8] focus:outline-none focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                          Horário
                        </label>
                        <input
                          type="time"
                          value={editGroupData.horario}
                          onChange={(e) =>
                            setEditGroupData({
                              ...editGroupData,
                              horario: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 text-sm rounded-xl bg-[#f7fafd] border border-[#c8d8e8] focus:outline-none focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all"
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                          Local
                        </label>
                        <input
                          type="text"
                          value={editGroupData.local}
                          onChange={(e) =>
                            setEditGroupData({
                              ...editGroupData,
                              local: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 text-sm rounded-xl bg-[#f7fafd] border border-[#c8d8e8] focus:outline-none focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                            Estado
                          </label>
                          <input
                            type="text"
                            value={editGroupData.estado}
                            onChange={(e) =>
                              setEditGroupData({
                                ...editGroupData,
                                estado: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 text-sm rounded-xl bg-[#f7fafd] border border-[#c8d8e8] focus:outline-none focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                            Cidade
                          </label>
                          <input
                            type="text"
                            value={editGroupData.cidade}
                            onChange={(e) =>
                              setEditGroupData({
                                ...editGroupData,
                                cidade: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 text-sm rounded-xl bg-[#f7fafd] border border-[#c8d8e8] focus:outline-none focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeGroupModalTab === "lideres" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-bold text-primary-dark mb-3">
                        Líder (Marido)
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                            Nome
                          </label>
                          <input
                            type="text"
                            value={editGroupData.liderMaridoNome}
                            onChange={(e) =>
                              setEditGroupData({
                                ...editGroupData,
                                liderMaridoNome: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 text-sm rounded-xl bg-[#f7fafd] border border-[#c8d8e8] focus:outline-none focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                            CPF
                          </label>
                          <input
                            type="text"
                            value={editGroupData.liderMaridoCpf}
                            onChange={(e) =>
                              setEditGroupData({
                                ...editGroupData,
                                liderMaridoCpf: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 text-sm rounded-xl bg-[#f7fafd] border border-[#c8d8e8] focus:outline-none focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                            E-mail
                          </label>
                          <input
                            type="email"
                            value={editGroupData.liderMaridoEmail}
                            onChange={(e) =>
                              setEditGroupData({
                                ...editGroupData,
                                liderMaridoEmail: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 text-sm rounded-xl bg-[#f7fafd] border border-[#c8d8e8] focus:outline-none focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                            Telefone
                          </label>
                          <input
                            type="tel"
                            value={editGroupData.liderMaridoTel}
                            onChange={(e) =>
                              setEditGroupData({
                                ...editGroupData,
                                liderMaridoTel: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 text-sm rounded-xl bg-[#f7fafd] border border-[#c8d8e8] focus:outline-none focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-[#c8d8e8] pt-6">
                      <h3 className="text-sm font-bold text-primary-dark mb-3">
                        Líder (Esposa)
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                            Nome
                          </label>
                          <input
                            type="text"
                            value={editGroupData.liderEsposaNome}
                            onChange={(e) =>
                              setEditGroupData({
                                ...editGroupData,
                                liderEsposaNome: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 text-sm rounded-xl bg-[#f7fafd] border border-[#c8d8e8] focus:outline-none focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                            CPF
                          </label>
                          <input
                            type="text"
                            value={editGroupData.liderEsposaCpf}
                            onChange={(e) =>
                              setEditGroupData({
                                ...editGroupData,
                                liderEsposaCpf: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 text-sm rounded-xl bg-[#f7fafd] border border-[#c8d8e8] focus:outline-none focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                            E-mail
                          </label>
                          <input
                            type="email"
                            value={editGroupData.liderEsposaEmail}
                            onChange={(e) =>
                              setEditGroupData({
                                ...editGroupData,
                                liderEsposaEmail: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 text-sm rounded-xl bg-[#f7fafd] border border-[#c8d8e8] focus:outline-none focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                            Telefone
                          </label>
                          <input
                            type="tel"
                            value={editGroupData.liderEsposaTel}
                            onChange={(e) =>
                              setEditGroupData({
                                ...editGroupData,
                                liderEsposaTel: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 text-sm rounded-xl bg-[#f7fafd] border border-[#c8d8e8] focus:outline-none focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeGroupModalTab === "endereco" && (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                          CEP
                        </label>
                        <input
                          type="text"
                          value={editGroupData.liderCep}
                          onChange={(e) =>
                            setEditGroupData({
                              ...editGroupData,
                              liderCep: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 text-sm rounded-xl bg-[#f7fafd] border border-[#c8d8e8] focus:outline-none focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                          Endereço
                        </label>
                        <input
                          type="text"
                          value={editGroupData.liderEndereco}
                          onChange={(e) =>
                            setEditGroupData({
                              ...editGroupData,
                              liderEndereco: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 text-sm rounded-xl bg-[#f7fafd] border border-[#c8d8e8] focus:outline-none focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all"
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                          Número
                        </label>
                        <input
                          type="text"
                          value={editGroupData.liderNumero}
                          onChange={(e) =>
                            setEditGroupData({
                              ...editGroupData,
                              liderNumero: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 text-sm rounded-xl bg-[#f7fafd] border border-[#c8d8e8] focus:outline-none focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                          Bairro
                        </label>
                        <input
                          type="text"
                          value={editGroupData.liderBairro}
                          onChange={(e) =>
                            setEditGroupData({
                              ...editGroupData,
                              liderBairro: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 text-sm rounded-xl bg-[#f7fafd] border border-[#c8d8e8] focus:outline-none focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all"
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                          Cidade
                        </label>
                        <input
                          type="text"
                          value={editGroupData.liderCidade}
                          onChange={(e) =>
                            setEditGroupData({
                              ...editGroupData,
                              liderCidade: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 text-sm rounded-xl bg-[#f7fafd] border border-[#c8d8e8] focus:outline-none focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                          Estado
                        </label>
                        <input
                          type="text"
                          value={editGroupData.liderEstado}
                          onChange={(e) =>
                            setEditGroupData({
                              ...editGroupData,
                              liderEstado: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 text-sm rounded-xl bg-[#f7fafd] border border-[#c8d8e8] focus:outline-none focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeGroupModalTab === "igreja" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-bold text-primary-dark mb-3">
                        Igreja que Frequenta
                      </h3>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="md:col-span-3">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                            Nome da Igreja
                          </label>
                          <input
                            type="text"
                            value={
                              editGroupData.igrejaNome || editGroupData.igreja
                            }
                            onChange={(e) =>
                              setEditGroupData({
                                ...editGroupData,
                                igrejaNome: e.target.value,
                                igreja: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 text-sm rounded-xl bg-[#f7fafd] border border-[#c8d8e8] focus:outline-none focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                            Pastor Responsável
                          </label>
                          <input
                            type="text"
                            value={editGroupData.pastorNome}
                            onChange={(e) =>
                              setEditGroupData({
                                ...editGroupData,
                                pastorNome: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 text-sm rounded-xl bg-[#f7fafd] border border-[#c8d8e8] focus:outline-none focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                            Telefone do Pastor
                          </label>
                          <input
                            type="tel"
                            value={editGroupData.pastorTel}
                            onChange={(e) =>
                              setEditGroupData({
                                ...editGroupData,
                                pastorTel: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 text-sm rounded-xl bg-[#f7fafd] border border-[#c8d8e8] focus:outline-none focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-[#c8d8e8] pt-6">
                      <h3 className="text-sm font-bold text-primary-dark mb-3">
                        Quem deu o treinamento MMI?
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                            Nome do Marido
                          </label>
                          <input
                            type="text"
                            value={editGroupData.treiMaridoNome}
                            onChange={(e) =>
                              setEditGroupData({
                                ...editGroupData,
                                treiMaridoNome: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 text-sm rounded-xl bg-[#f7fafd] border border-[#c8d8e8] focus:outline-none focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                            E-mail
                          </label>
                          <input
                            type="email"
                            value={editGroupData.treiMaridoEmail}
                            onChange={(e) =>
                              setEditGroupData({
                                ...editGroupData,
                                treiMaridoEmail: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 text-sm rounded-xl bg-[#f7fafd] border border-[#c8d8e8] focus:outline-none focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                            Nome da Esposa
                          </label>
                          <input
                            type="text"
                            value={editGroupData.treiEsposaNome}
                            onChange={(e) =>
                              setEditGroupData({
                                ...editGroupData,
                                treiEsposaNome: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 text-sm rounded-xl bg-[#f7fafd] border border-[#c8d8e8] focus:outline-none focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                            E-mail
                          </label>
                          <input
                            type="email"
                            value={editGroupData.treiEsposaEmail}
                            onChange={(e) =>
                              setEditGroupData({
                                ...editGroupData,
                                treiEsposaEmail: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 text-sm rounded-xl bg-[#f7fafd] border border-[#c8d8e8] focus:outline-none focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeGroupModalTab === "casais" && (
                  <div className="space-y-4">
                    {!editGroupData.casais ||
                    editGroupData.casais.length === 0 ? (
                      <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-500 text-center">
                        Nenhum casal cadastrado nesta turma.
                      </div>
                    ) : (
                      editGroupData.casais.map((casal: any, index: number) => (
                        <div
                          key={index}
                          className="p-4 border border-[#c8d8e8] rounded-xl bg-[#f7fafd]"
                        >
                          <h4 className="text-xs font-bold text-primary-dark mb-3 uppercase">
                            Casal {index + 1}
                          </h4>
                          <div className="grid md:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10px] font-bold text-gray-400 tracking-widest block mb-1">
                                Marido
                              </label>
                              <input
                                type="text"
                                value={casal.maridoNome}
                                onChange={(e) => {
                                  const newCasais = [...editGroupData.casais];
                                  newCasais[index].maridoNome = e.target.value;
                                  setEditGroupData({
                                    ...editGroupData,
                                    casais: newCasais,
                                  });
                                }}
                                className="w-full px-3 py-1.5 text-sm rounded-lg bg-white border border-[#c8d8e8] focus:outline-none focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-gray-400 tracking-widest block mb-1">
                                Esposa
                              </label>
                              <input
                                type="text"
                                value={casal.esposaNome}
                                onChange={(e) => {
                                  const newCasais = [...editGroupData.casais];
                                  newCasais[index].esposaNome = e.target.value;
                                  setEditGroupData({
                                    ...editGroupData,
                                    casais: newCasais,
                                  });
                                }}
                                className="w-full px-3 py-1.5 text-sm rounded-lg bg-white border border-[#c8d8e8] focus:outline-none focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-gray-400 tracking-widest block mb-1">
                                Telefone/Celular
                              </label>
                              <input
                                type="text"
                                value={casal.celular}
                                onChange={(e) => {
                                  const newCasais = [...editGroupData.casais];
                                  newCasais[index].celular = e.target.value;
                                  setEditGroupData({
                                    ...editGroupData,
                                    casais: newCasais,
                                  });
                                }}
                                className="w-full px-3 py-1.5 text-sm rounded-lg bg-white border border-[#c8d8e8] focus:outline-none focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-gray-400 tracking-widest block mb-1">
                                E-mail
                              </label>
                              <input
                                type="text"
                                value={casal.email}
                                onChange={(e) => {
                                  const newCasais = [...editGroupData.casais];
                                  newCasais[index].email = e.target.value;
                                  setEditGroupData({
                                    ...editGroupData,
                                    casais: newCasais,
                                  });
                                }}
                                className="w-full px-3 py-1.5 text-sm rounded-lg bg-white border border-[#c8d8e8] focus:outline-none focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all"
                              />
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div className="pt-4 mt-6 border-t border-[#c8d8e8] flex justify-end gap-3 shrink-0">
                <button
                  onClick={() => setEditingGroup(null)}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveEditedGroup}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-primary-base hover:bg-[#0d4f7a] transition-colors flex items-center gap-2"
                >
                  <Check size={18} />
                  Salvar
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Edit Report Modal */}
        {editingReport && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingReport(null)}
              className="absolute inset-0 bg-primary-dark/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[14px] shadow-[0_8px_32px_rgba(0,0,0,0.15)] flex flex-col border border-[#c8d8e8]"
            >
              {/* Sticky Header */}
              <div className="sticky top-0 bg-white border-b border-[#e2eaf3] px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-[1.25rem] font-bold font-serif text-primary-dark flex items-center gap-2">
                  <FileText className="text-primary-base" size={22} />
                  Editar Relatório{" "}
                  <span className="text-primary-light">
                    #{editingReport.id.slice(0, 8).toUpperCase()}
                  </span>
                </h2>
                <button
                  onClick={() => setEditingReport(null)}
                  className="bg-[#f0f7ff] hover:bg-[#d0eaf7] text-primary-base p-2 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-6 md:p-8 flex-grow space-y-8">
                {/* section: Header Info */}
                <div>
                  <h2 className="text-[1.15rem] font-bold font-serif text-primary-dark m-0 mb-4 pb-2.5 border-b-2 border-[#e2eaf3] flex items-center gap-2">
                    Dados do Relatório
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 border-[1.5px] border-[#c8d8e8] rounded-[10px] overflow-hidden">
                    <div className="px-4 py-3.5 bg-[#f7fafd] border-b sm:border-b-0 sm:border-r border-[#e2eaf3]">
                      <div className="text-[0.76rem] font-bold text-primary-base uppercase tracking-[0.5px] mb-1">
                        Data da Reunião
                      </div>
                      <input
                        type="date"
                        value={editReportData.dataReuniao || ""}
                        onChange={(e) =>
                          setEditReportData({
                            ...editReportData,
                            dataReuniao: e.target.value,
                          })
                        }
                        className="w-full text-[0.92rem] font-semibold text-primary-dark bg-transparent border-b border-[#c8d8e8] focus:border-primary-base outline-none py-1"
                      />
                    </div>
                    <div className="px-4 py-3.5 bg-white border-b sm:border-b-0 sm:border-r border-[#e2eaf3]">
                      <div className="text-[0.76rem] font-bold text-primary-base uppercase tracking-[0.5px] mb-1">
                        Início
                      </div>
                      <input
                        type="time"
                        value={editReportData.horarioInicio || ""}
                        onChange={(e) =>
                          setEditReportData({
                            ...editReportData,
                            horarioInicio: e.target.value,
                          })
                        }
                        className="w-full text-[0.92rem] font-semibold text-primary-dark bg-transparent border-b border-[#c8d8e8] focus:border-primary-base outline-none py-1"
                      />
                    </div>
                    <div className="px-4 py-3.5 bg-white">
                      <div className="text-[0.76rem] font-bold text-primary-base uppercase tracking-[0.5px] mb-1">
                        Término
                      </div>
                      <input
                        type="time"
                        value={editReportData.horarioTermino || ""}
                        onChange={(e) =>
                          setEditReportData({
                            ...editReportData,
                            horarioTermino: e.target.value,
                          })
                        }
                        className="w-full text-[0.92rem] font-semibold text-primary-dark bg-transparent border-b border-[#c8d8e8] focus:border-primary-base outline-none py-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Lição do Dia Section */}
                <div>
                  <div className="bg-primary-base text-white text-center font-bold font-serif tracking-wide py-1.5 mb-4">
                    Lição Ministrada
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-y-3 gap-x-2 text-[0.8rem] mb-2 text-primary-dark">
                    {[
                      "Semana 01 - Aliança",
                      "Semana 05 - Perdão",
                      "Semana 09 - Fluindo Juntos no Espírito",
                      "Semana 13 - M. de Uma só-carne",
                      "Semana 02 - Uma só carne",
                      "Semana 06 - Visão de fé",
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
                      const isChecked = editReportData.licao?.some(
                        (l: string) => l.startsWith(weekNumber),
                      );

                      const toggleLesson = () => {
                        let currentLicoes = [...(editReportData.licao || [])];
                        if (isChecked) {
                          currentLicoes = currentLicoes.filter(
                            (l) => !l.startsWith(weekNumber),
                          );
                        } else {
                          currentLicoes.push(lesson);
                        }
                        setEditReportData({
                          ...editReportData,
                          licao: currentLicoes,
                        });
                      };

                      return (
                        <div
                          key={lesson}
                          onClick={toggleLesson}
                          className="flex items-center gap-1.5 whitespace-nowrap overflow-hidden text-ellipsis cursor-pointer hover:bg-blue-50 p-1 rounded transition-colors select-none"
                        >
                          <span className="font-mono text-[0.8rem] text-primary-base font-bold">
                            [{isChecked ? "x" : " "}]
                          </span>
                          <span className="truncate">{lesson}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Lider em Treinamento resumidamente */}
                {editReportData.liderTreinamentoReport && (
                  <div className="mt-6">
                    <div className="bg-primary-base text-white px-4 py-2 flex justify-between tracking-wide font-serif text-[0.8rem] font-bold mb-0">
                      <div className="uppercase">
                        ACOMPANHAMENTO: LÍDERES EM TREINAMENTO
                      </div>
                      <div className="uppercase">PRESENÇA</div>
                    </div>

                    <div className="bg-[#f7fafd] border-x border-b border-[#c8d8e8] p-5 text-[0.85rem] space-y-4 text-primary-dark">
                      <div>
                        <div className="flex justify-between font-bold mb-1.5 px-1 text-primary-base">
                          <span className="font-serif flex items-center gap-2 capitalize">
                            {editReportData.liderTreinamentoReport.nome}
                            {editReportData.liderTreinamentoReport
                              .concluiuCurso && (
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-sans uppercase font-bold tracking-wider ${
                                  editReportData.liderTreinamentoReport
                                    .concluiuCurso === "Sim"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {editReportData.liderTreinamentoReport
                                  .concluiuCurso === "Sim"
                                  ? "Concluiu"
                                  : "Não Concluiu"}
                              </span>
                            )}
                          </span>
                          <div className="flex items-center gap-2">
                            <select
                              value={
                                editReportData.liderTreinamentoReport.status
                              }
                              onChange={(e) => {
                                setEditReportData({
                                  ...editReportData,
                                  liderTreinamentoReport: {
                                    ...editReportData.liderTreinamentoReport,
                                    status: e.target.value,
                                  },
                                });
                              }}
                              className="border border-[#c8d8e8] rounded text-xs px-2 py-0.5"
                            >
                              <option value="presente">Presente</option>
                              <option value="ausente">Ausente</option>
                              <option value="desistente">Desistente</option>
                            </select>
                          </div>
                        </div>
                        <div className="bg-white p-3 border border-[#c8d8e8] rounded-md min-h-[60px] text-text-main">
                          <textarea
                            value={
                              editReportData.liderTreinamentoReport
                                .observacao || ""
                            }
                            onChange={(e) => {
                              setEditReportData({
                                ...editReportData,
                                liderTreinamentoReport: {
                                  ...editReportData.liderTreinamentoReport,
                                  observacao: e.target.value,
                                },
                              });
                            }}
                            className="w-full text-[0.9rem] bg-transparent outline-none resize-none"
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Compartilhe resumidamente */}
                <div className="mt-6">
                  <div className="bg-primary-base text-white px-4 py-2 flex justify-between tracking-wide font-serif text-[0.8rem] font-bold mb-0">
                    <div className="uppercase">
                      COMPARTILHE RESUMIDAMENTE SOBRE CADA CASAL
                    </div>
                    <div className="uppercase">PRESENÇA</div>
                  </div>

                  <div className="bg-[#f7fafd] border-x border-b border-[#c8d8e8] p-5 text-[0.85rem] space-y-4 text-primary-dark">
                    {editReportData.casaisReport?.map(
                      (casal: any, i: number) => (
                        <div key={i}>
                          <div className="flex justify-between font-bold mb-1.5 px-1 text-primary-base">
                            <span className="font-serif flex items-center gap-2">
                              Casal {i + 1} - {casal.nome}
                              {casal.concluiuCurso && (
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-sans uppercase font-bold tracking-wider ${
                                    casal.concluiuCurso === "Sim"
                                      ? "bg-green-100 text-green-700"
                                      : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {casal.concluiuCurso === "Sim"
                                    ? "Concluiu"
                                    : "Não Concluiu"}
                                </span>
                              )}
                            </span>
                            <div className="flex items-center gap-2">
                              <select
                                value={casal.presente ? "presente" : "ausente"}
                                onChange={(e) => {
                                  const isPresente =
                                    e.target.value === "presente";
                                  const newCasais = [
                                    ...editReportData.casaisReport,
                                  ];
                                  newCasais[i] = {
                                    ...newCasais[i],
                                    presente: isPresente,
                                    status: e.target.value,
                                  };
                                  setEditReportData({
                                    ...editReportData,
                                    casaisReport: newCasais,
                                  });
                                }}
                                className="border border-[#c8d8e8] rounded text-xs px-2 py-0.5"
                              >
                                <option value="presente">Presente</option>
                                <option value="ausente">Ausente</option>
                              </select>
                            </div>
                          </div>
                          <div className="bg-white p-3 border border-[#c8d8e8] rounded-md min-h-[60px] text-text-main">
                            <textarea
                              value={casal.observacao || ""}
                              onChange={(e) => {
                                const newCasais = [
                                  ...editReportData.casaisReport,
                                ];
                                newCasais[i] = {
                                  ...newCasais[i],
                                  observacao: e.target.value,
                                };
                                setEditReportData({
                                  ...editReportData,
                                  casaisReport: newCasais,
                                });
                              }}
                              className="w-full text-[0.85rem] border-none focus:ring-0 resize-none p-0 bg-transparent min-h-[40px] outline-none"
                              placeholder="Adicionar observações sobre o casal..."
                            />
                          </div>
                        </div>
                      ),
                    )}
                    {(!editReportData.casaisReport ||
                      editReportData.casaisReport.length === 0) && (
                      <div className="text-gray-400 italic text-center py-4">
                        Nenhum casal registrado.
                      </div>
                    )}
                  </div>
                </div>

                {/* Comentários Liderança e Valores */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="bg-primary-base text-white px-4 py-2 font-serif tracking-wide text-[0.8rem] font-bold mb-0 uppercase">
                      COMENTÁRIOS GERAIS
                    </div>
                    <div className="bg-[#f7fafd] border-x border-b border-[#c8d8e8] p-5 min-h-[80px] text-[0.85rem] text-text-main">
                      <textarea
                        value={editReportData.observacoesGerais || ""}
                        onChange={(e) =>
                          setEditReportData({
                            ...editReportData,
                            observacoesGerais: e.target.value,
                          })
                        }
                        className="w-full bg-transparent border-none focus:ring-0 resize-none p-0 min-h-[60px] outline-none"
                        placeholder="Observações ou testemunhos..."
                      />
                    </div>
                  </div>
                  <div>
                    <div className="bg-primary-base text-white px-4 py-2 font-serif tracking-wide text-[0.8rem] font-bold mb-0 uppercase">
                      Valores / Ofertas (R$)
                    </div>
                    <div className="bg-[#f7fafd] border-x border-b border-[#c8d8e8] p-5 space-y-4 text-[0.85rem] text-text-main">
                      <div>
                        <label className="text-[0.76rem] font-bold text-primary-base uppercase tracking-[0.5px] block mb-1">
                          Venda de Manuais
                        </label>
                        <input
                          type="text"
                          value={editReportData.valorOferta || ""}
                          onChange={(e) =>
                            setEditReportData({
                              ...editReportData,
                              valorOferta: e.target.value,
                            })
                          }
                          className="w-full px-3 py-1.5 border border-[#c8d8e8] rounded-md outline-none focus:border-primary-base"
                          placeholder="Ex: 50,00"
                        />
                      </div>
                      <div>
                        <label className="text-[0.76rem] font-bold text-primary-base uppercase tracking-[0.5px] block mb-1">
                          Outros Motivos
                        </label>
                        <input
                          type="text"
                          value={editReportData.outrosMotivos || ""}
                          onChange={(e) =>
                            setEditReportData({
                              ...editReportData,
                              outrosMotivos: e.target.value,
                            })
                          }
                          className="w-full px-3 py-1.5 border border-[#c8d8e8] rounded-md outline-none focus:border-primary-base"
                          placeholder="Motivo..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="sticky bottom-0 bg-white border-t border-[#e2eaf3] px-6 py-4 flex justify-end gap-3 rounded-b-[14px]">
                <button
                  onClick={() => setEditingReport(null)}
                  className="px-5 py-2 rounded-lg text-sm font-semibold text-[#667] border-[1.5px] border-[#c8d8e8] bg-white hover:bg-[#f7fafd] transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveEditedReport}
                  className="px-6 py-2 rounded-lg text-sm font-semibold text-white bg-primary-base hover:bg-[#0d4f7a] shadow-md transition-all flex items-center gap-2"
                >
                  <Check size={16} /> Salvar Relatório
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Edit Order Modal matching HistoricoPedidos styles */}
        {editingOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingOrder(null)}
              className="absolute inset-0 bg-primary-dark/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[14px] shadow-[0_8px_32px_rgba(0,0,0,0.15)] flex flex-col border border-[#c8d8e8]"
            >
              {/* Sticky Header */}
              <div className="sticky top-0 bg-white border-b border-[#e2eaf3] px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-[1.25rem] font-bold font-serif text-primary-dark flex items-center gap-2">
                  <Package className="text-primary-base" size={22} />
                  Editar Pedido{" "}
                  <span className="text-primary-light">
                    #{editingOrder.id.slice(0, 8).toUpperCase()}
                  </span>
                </h2>
                <button
                  onClick={() => setEditingOrder(null)}
                  className="bg-[#f0f7ff] hover:bg-[#d0eaf7] text-primary-base p-2 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-6 md:p-8 flex-grow space-y-8">
                {/* section: Dados do Pedido */}
                <div>
                  <h2 className="text-[1.15rem] font-bold font-serif text-primary-dark m-0 mb-4 pb-2.5 border-b-2 border-[#e2eaf3] flex items-center gap-2">
                    Informações Iniciais
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border-[1.5px] border-[#c8d8e8] rounded-[10px] overflow-hidden">
                    <div className="px-4 py-3.5 bg-[#f7fafd] border-b sm:border-b-0 lg:border-r border-[#e2eaf3] sm:col-span-2 lg:col-span-1">
                      <div className="text-[0.76rem] font-bold text-primary-base uppercase tracking-[0.5px] mb-1">
                        Data
                      </div>
                      <div className="text-[0.96rem] font-semibold text-primary-dark">
                        {editingOrder.createdAt?.toMillis
                          ? new Date(
                              editingOrder.createdAt.toMillis(),
                            ).toLocaleString("pt-BR")
                          : "—"}
                      </div>
                    </div>
                    <div className="px-4 py-3.5 bg-white border-b sm:border-b-0 sm:border-r border-[#e2eaf3]">
                      <div className="text-[0.76rem] font-bold text-primary-base uppercase tracking-[0.5px] mb-1">
                        Líder
                      </div>
                      <div
                        className="text-[0.96rem] font-semibold text-primary-dark truncate"
                        title={editingOrder.nomeLider}
                      >
                        {editOrderData.nomes || editingOrder.nomeLider || "—"}
                      </div>
                    </div>
                    <div className="px-4 py-3.5 bg-white border-b sm:border-b-0 sm:border-r border-[#e2eaf3]">
                      <div className="text-[0.76rem] font-bold text-primary-base uppercase tracking-[0.5px] mb-1">
                        Grupo
                      </div>
                      <div
                        className="text-[0.96rem] font-semibold text-primary-dark truncate"
                        title={editingOrder.grupoNome}
                      >
                        {editOrderData.grupo || editingOrder.grupoNome || "—"}
                      </div>
                    </div>
                    <div className="px-4 py-3.5 bg-white">
                      <div className="text-[0.76rem] font-bold text-primary-base uppercase tracking-[0.5px] mb-1">
                        Cidade / UF
                      </div>
                      <div
                        className="text-[0.96rem] font-semibold text-primary-dark truncate"
                        title={editingOrder.cidadeEstado}
                      >
                        {editOrderData.cidade ||
                          editingOrder.cidadeEstado ||
                          "—"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* section: Itens do Pedido */}
                <div>
                  <h2 className="text-[1.15rem] font-bold font-serif text-primary-dark m-0 mb-4 pb-2.5 border-b-2 border-[#e2eaf3] flex items-center gap-2">
                    Itens Solicitados
                  </h2>

                  <div className="border-[1.5px] border-[#c8d8e8] rounded-xl overflow-hidden">
                    <div className="bg-primary-base text-white text-[0.8rem] uppercase font-bold tracking-widest px-4 py-3 grid grid-cols-12 gap-2 text-center md:text-left">
                      <div className="col-span-6 md:col-span-8">Produto</div>
                      <div className="col-span-2 hidden md:block text-center">
                        Und.
                      </div>
                      <div className="col-span-6 md:col-span-2 text-right">
                        Subtotal
                      </div>
                    </div>
                    <div className="divide-y divide-[#e2eaf3] bg-white">
                      {editOrderData.itens?.map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="grid grid-cols-12 gap-2 px-4 py-3 items-center text-[0.92rem]"
                        >
                          <div className="col-span-8 md:col-span-8 flex items-center gap-3">
                            <span className="text-xl leading-none hidden sm:inline-block">
                              {item.emoji || "📦"}
                            </span>
                            <div>
                              <p className="font-semibold text-primary-dark leading-tight">
                                {item.nome}
                              </p>
                              {item.cor && (
                                <p className="text-xs text-gray-500 mt-0.5">
                                  Cor:{" "}
                                  <span className="font-medium text-gray-700">
                                    {item.cor}
                                  </span>
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="col-span-2 hidden md:block text-center font-bold text-primary-base bg-[#f7fafd] py-1 rounded-md border border-[#e2eaf3]">
                            {item.qty}
                          </div>
                          <div className="col-span-4 md:col-span-2 text-right font-bold text-text-main">
                            R${" "}
                            {(item.precoUnitario * item.qty)
                              .toFixed(2)
                              .replace(".", ",")}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="bg-[#f0f6fb] px-4 py-3.5 border-t border-[#c8d8e8] flex justify-between items-center text-[0.95rem]">
                      <span className="font-semibold text-[#667]">
                        Total Estimado
                      </span>
                      <span className="font-black text-[1.15rem] text-[#2c3e50]">
                        R${" "}
                        {Number(editOrderData.total || 0)
                          .toFixed(2)
                          .replace(".", ",")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Observações do Líder */}
                <div>
                  <h2 className="text-[1.15rem] font-bold font-serif text-primary-dark m-0 mb-4 pb-2.5 border-b-2 border-[#e2eaf3] flex items-center gap-2">
                    Observações do Grupo
                  </h2>
                  <div className="bg-[#f7fafd] border-[1.5px] border-[#c8d8e8] rounded-xl px-4 py-3.5 text-[0.92rem] text-text-main min-h-[60px] whitespace-pre-wrap">
                    {editOrderData.observacoes || (
                      <span className="text-gray-400 italic">
                        Nenhuma observação.
                      </span>
                    )}
                  </div>
                </div>

                {/* Área Administrativa */}
                <div className="bg-[#f0f6fb] border-[1.5px] border-primary-base/30 rounded-xl p-6">
                  <h3 className="text-sm font-bold text-primary-base mb-4 uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck size={16} /> Área Administrativa
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="text-[0.76rem] font-bold text-primary-base uppercase tracking-[0.5px] block mb-1">
                        Status do Pedido
                      </label>
                      <select
                        value={editOrderData.status}
                        onChange={(e) =>
                          setEditOrderData({
                            ...editOrderData,
                            status: e.target.value,
                          })
                        }
                        className="w-full border-[1.5px] border-[#c8d8e8] rounded-lg px-3 py-2 text-[0.92rem] text-text-main bg-white focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 outline-none transition-all"
                      >
                        <option value="pendente">Pendente</option>
                        <option value="aprovado">Aprovado</option>
                        <option value="enviado">Enviado</option>
                        <option value="concluido">Concluído</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[0.76rem] font-bold text-primary-base uppercase tracking-[0.5px] block mb-1">
                        Anotações Privadas (Administração)
                      </label>
                      <textarea
                        value={editOrderData.adminNotes}
                        onChange={(e) =>
                          setEditOrderData({
                            ...editOrderData,
                            adminNotes: e.target.value,
                          })
                        }
                        placeholder="Adicione código de rastreio, notas internas..."
                        className="w-full border-[1.5px] border-primary-base/30 rounded-lg px-3 py-2 text-[0.92rem] text-text-main bg-white focus:border-primary-base min-h-[80px] focus:ring-[3px] focus:ring-primary-base/10 outline-none transition-all"
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="sticky bottom-0 bg-white border-t border-[#e2eaf3] px-6 py-4 flex justify-end gap-3 rounded-b-[14px]">
                <button
                  onClick={() => setEditingOrder(null)}
                  className="px-5 py-2 rounded-lg text-sm font-semibold text-[#667] border-[1.5px] border-[#c8d8e8] bg-white hover:bg-[#f7fafd] transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveEditedOrder}
                  className="px-6 py-2 rounded-lg text-sm font-semibold text-white bg-primary-base hover:bg-[#0d4f7a] shadow-md transition-all flex items-center gap-2"
                >
                  <Check size={16} /> Salvar Pedido
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Delete Confirm Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6 text-center"
            >
              <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-primary-dark mb-2">
                Confirmar Exclusão
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                Tem certeza que deseja excluir este registro? Essa ação não pode
                ser desfeita.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-colors"
                >
                  Excluir
                </button>
              </div>
            </motion.div>
          </div>
        )}
      {isOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[85vh]"
          >
            <div className="p-5 border-b border-[#e2eaf3] flex items-center justify-between bg-[#f7fafd]">
              <h3 className="font-bold text-primary-dark">Organizar Painéis</h3>
              <button
                onClick={() => setIsOrderModalOpen(false)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto flex-1">
              <p className="text-sm text-gray-500 mb-4">
                Use as setas para reordenar a listagem dos painéis no menu lateral.
              </p>
              
              <div className="space-y-2">
                {tempOrderList.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-white border border-[#e2eaf3] rounded-xl">
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => {
                          if (index > 0) {
                            const newList = [...tempOrderList];
                            [newList[index - 1], newList[index]] = [newList[index], newList[index - 1]];
                            setTempOrderList(newList);
                          }
                        }}
                        disabled={index === 0}
                        className={`p-1 rounded-md ${index === 0 ? "text-gray-200" : "text-gray-400 hover:bg-gray-100 hover:text-primary-base"}`}
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        onClick={() => {
                          if (index < tempOrderList.length - 1) {
                            const newList = [...tempOrderList];
                            [newList[index + 1], newList[index]] = [newList[index], newList[index + 1]];
                            setTempOrderList(newList);
                          }
                        }}
                        disabled={index === tempOrderList.length - 1}
                        className={`p-1 rounded-md ${index === tempOrderList.length - 1 ? "text-gray-200" : "text-gray-400 hover:bg-gray-100 hover:text-primary-base"}`}
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>
                    
                    <div className="w-8 h-8 rounded-full bg-[#f0f6fb] text-primary-base flex items-center justify-center shrink-0">
                      <item.icon size={16} />
                    </div>
                    <span className="font-medium text-sm text-gray-700">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-5 border-t border-[#e2eaf3] flex justify-end gap-3 bg-[#f7fafd]">
              <button
                onClick={() => setIsOrderModalOpen(false)}
                className="px-4 py-2 rounded-xl text-sm font-bold text-gray-500 border border-[#e2eaf3] bg-white hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveOrder}
                className="px-6 py-2 rounded-xl text-sm font-bold text-white bg-primary-base hover:bg-primary-dark transition-colors shadow-sm"
              >
                Salvar Ordem
              </button>
            </div>
          </motion.div>
        </div>
      )}
      </section>
    </AdminLayout>
  );
}
