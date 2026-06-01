import React, { useState, useEffect, useRef } from "react";
import {
  Users,
  Settings,
  Plus,
  Trash2,
  Download,
  Eye,
  Check,
  AlertCircle,
  FileText,
  Save,
  GraduationCap,
  Bell,
  BellRing,
  UserCheck,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  updateDoc,
  query,
  getDocs,
  where
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../../lib/firebase";

interface FormField {
  id: string;
  label: string;
  type: "text" | "number" | "email" | "tel" | "select" | "checkbox";
  required: boolean;
  options?: string[];
  maskType?: "none" | "cpf" | "cep" | "date" | "phone" | "numbers_only" | "email";
  section?: "personal" | "spouse" | "address" | "confirmations";
}

const FIXED_COURSES = [
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
];

export default function ManageCourseRegistrations() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [courseForms, setCourseForms] = useState<any[]>([]);
  const [dynamicCourses, setDynamicCourses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Cursos com investimentos/valores para verificar se é pago ou gratuito
  const [cursosList, setCursosList] = useState<any[]>([]);

  // Filters and navigation
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [adminView, setAdminView] = useState<"registrations" | "forms">("registrations");
  const [showAssigned, setShowAssigned] = useState<boolean>(false);

  // Error/Success messages
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Selected student for details popup
  const [selectedReg, setSelectedReg] = useState<any | null>(null);

  // Form Editor State
  const [formEditorCourse, setFormEditorCourse] = useState<string>("");
  const [editorFields, setEditorFields] = useState<FormField[]>([]);
  const [newField, setNewField] = useState({
    label: "",
    type: "text" as FormField["type"],
    required: false,
    optionsRaw: "",
    maskType: "none" as NonNullable<FormField["maskType"]>,
    section: "personal" as "personal" | "spouse" | "address" | "confirmations",
  });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [deleteFieldConfirmId, setDeleteFieldConfirmId] = useState<string | null>(null);

  // Deletion confirmation state to avoid window.confirm within iframe preview
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Leaders for assignment
  const [leadersList, setLeadersList] = useState<any[]>([]);
  const [assigningRegId, setAssigningRegId] = useState<string | null>(null);
  const [selectedLeaderIdForReg, setSelectedLeaderIdForReg] = useState<string>("");
  const [isAssigning, setIsAssigning] = useState<boolean>(false);

  // Sync users list for assigning leaders
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setLeadersList(list);
    }, (err) => {
      console.error("Erro ao carregar lista de líderes/usuários:", err);
    });
    return () => unsub();
  }, []);

  // Active Session Notifications Tracker
  const [sessionNotifications, setSessionNotifications] = useState<any[]>([]);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [activeAlert, setActiveAlert] = useState<any | null>(null);
  const isFirstLoadRef = useRef(true);

  // Se houver cursos carregados dinamicamente no banco, usamos apenas eles para que cursos excluídos desapareçam das listas.
  // Caso contrário, usamos os FIXED_COURSES como fallback.
  const allAvailableCourses = dynamicCourses.length > 0 
    ? dynamicCourses 
    : FIXED_COURSES;

  // Simple Synthesized Dual Tone Sound chime using Web Audio API to alert audibly when tab is active
  const playRegistrationChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(0, ctx.currentTime + start);
        gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + start + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };

      // Play soft beautiful ascending chime chord (F-major chord)
      playTone(698.46, 0.0, 0.4); // F5
      playTone(880.00, 0.12, 0.4); // A5
      playTone(1046.50, 0.24, 0.5); // C6
    } catch (err) {
      console.warn("Notification audio blocked by client browser autoplay policy.", err);
    }
  };

  const triggerNewRegistrationAlert = (reg: any, id: string) => {
    const rawName = reg.formData?.nome || reg.formData?.nomeCompleto || reg.formData?.name || "Líder/Discipulando";
    const course = reg.courseTitle || "Curso Geral";
    
    const newNotice = {
      id,
      studentName: rawName,
      courseTitle: course,
      receivedAt: new Date(),
      read: false,
      fullReg: { id, ...reg },
    };

    setSessionNotifications((prev) => [newNotice, ...prev]);
    setActiveAlert(newNotice);
    playRegistrationChime();

    // Clear active temporary screen toast after 10 seconds
    setTimeout(() => {
      setActiveAlert((curr) => (curr?.id === id ? null : curr));
    }, 10000);
  };

  // Load registrations and form custom configurations
  useEffect(() => {
    const unsubRegs = onSnapshot(
      collection(db, "course_registrations"),
      (snap) => {
        const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        
        // Notify if it's not the first data stream (which covers past historic loads)
        if (!isFirstLoadRef.current) {
          snap.docChanges().forEach((change) => {
            if (change.type === "added") {
              const data = change.doc.data();
              if (data && data.formData) {
                triggerNewRegistrationAlert(data, change.doc.id);
              }
            }
          });
        } else {
          isFirstLoadRef.current = false;
        }

        setRegistrations(list);
        setLoading(false);
      },
      (err) => {
        console.error("Erro carregando inscrições: ", err);
      }
    );

    const unsubForms = onSnapshot(
      collection(db, "course_forms"),
      (snap) => {
        const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setCourseForms(list);
      },
      (err) => {
        console.error("Erro carregando formulários: ", err);
      }
    );

    const unsubCursos = onSnapshot(
      doc(db, "content", "cursos"),
      (snap) => {
        if (snap.exists() && snap.data().cursos) {
          const list = snap.data().cursos;
          setCursosList(list);
          const titles = list.map((c: any) => c.title).filter(Boolean);
          setDynamicCourses(titles);
          if (titles.length > 0) {
            setFormEditorCourse((curr) => {
              if (!curr || !titles.includes(curr)) {
                return titles[0];
              }
              return curr;
            });
          }
        }
      },
      (err) => {
        console.error("Erro carregando cursos dinâmicos: ", err);
      }
    );

    return () => {
      unsubRegs();
      unsubForms();
      unsubCursos();
    };
  }, []);

  // Update form editor fields when course selection changes
  useEffect(() => {
    const matchedForm = courseForms.find((f) => f.id === formEditorCourse);
    if (matchedForm && matchedForm.fields) {
      setEditorFields(matchedForm.fields);
    } else {
      // Setup default placeholder matching the complete Cadastro de Líder
      setEditorFields([
        { id: "nome", label: "Nome Completo", type: "text", required: true, maskType: "none", section: "personal" },
        { id: "cpf", label: "CPF", type: "text", required: true, maskType: "cpf", section: "personal" },
        { id: "dataNascimento", label: "Data de Nascimento", type: "text", required: true, maskType: "date", section: "personal" },
        { id: "celular", label: "Celular", type: "tel", required: true, maskType: "phone", section: "personal" },
        { id: "email", label: "E-mail", type: "email", required: true, maskType: "none", section: "personal" },
        { id: "igreja", label: "Igreja que frequenta", type: "text", required: true, maskType: "none", section: "personal" },
        
        { id: "nomeEsposa", label: "Nome Completo do Cônjuge", type: "text", required: false, maskType: "none", section: "spouse" },
        { id: "cpfEsposa", label: "CPF do Cônjuge", type: "text", required: false, maskType: "cpf", section: "spouse" },
        { id: "dataNascimentoEsposa", label: "Data de Nascimento do Cônjuge", type: "text", required: false, maskType: "date", section: "spouse" },
        { id: "telefoneEsposa", label: "Celular do Cônjuge", type: "tel", required: false, maskType: "phone", section: "spouse" },
        { id: "emailEsposa", label: "E-mail do Cônjuge", type: "email", required: false, maskType: "none", section: "spouse" },

        { id: "cep", label: "CEP", type: "text", required: true, maskType: "cep", section: "address" },
        { id: "rua", label: "Rua / Logradouro", type: "text", required: true, maskType: "none", section: "address" },
        { id: "numero", label: "Número", type: "text", required: true, maskType: "none", section: "address" },
        { id: "bairro", label: "Bairro", type: "text", required: true, maskType: "none", section: "address" },
        { id: "cidade", label: "Cidade", type: "text", required: true, maskType: "none", section: "address" },
        { id: "estado", label: "Estado", type: "select", required: true, maskType: "none", section: "address", options: ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"] },

        { id: "treinamento", label: "Confirmo ter concluído o treinamento de liderança do ministério", type: "checkbox", required: true, maskType: "none", section: "confirmations" },
        { id: "termos", label: "Declaro aceitar os Termos e Políticas de Privacidade", type: "checkbox", required: true, maskType: "none", section: "confirmations" }
      ]);
    }
    setSaveSuccess(false);
  }, [formEditorCourse, courseForms]);

  const loadCadastroTemplate = () => {
    const template: FormField[] = [
      { id: "nome", label: "Nome Completo", type: "text", required: true, maskType: "none", section: "personal" },
      { id: "cpf", label: "CPF", type: "text", required: true, maskType: "cpf", section: "personal" },
      { id: "dataNascimento", label: "Data de Nascimento", type: "text", required: true, maskType: "date", section: "personal" },
      { id: "celular", label: "Celular", type: "tel", required: true, maskType: "phone", section: "personal" },
      { id: "email", label: "E-mail", type: "email", required: true, maskType: "none", section: "personal" },
      { id: "igreja", label: "Igreja", type: "text", required: true, maskType: "none", section: "personal" },
      
      { id: "nomeEsposa", label: "Nome Completo do Cônjuge", type: "text", required: false, maskType: "none", section: "spouse" },
      { id: "cpfEsposa", label: "CPF do Cônjuge", type: "text", required: false, maskType: "cpf", section: "spouse" },
      { id: "dataNascimentoEsposa", label: "Data de Nascimento do Cônjuge", type: "text", required: false, maskType: "date", section: "spouse" },
      { id: "telefoneEsposa", label: "Celular do Cônjuge", type: "tel", required: false, maskType: "phone", section: "spouse" },
      { id: "emailEsposa", label: "E-mail do Cônjuge", type: "email", required: false, maskType: "none", section: "spouse" },

      { id: "cep", label: "CEP", type: "text", required: true, maskType: "cep", section: "address" },
      { id: "rua", label: "Rua / Logradouro", type: "text", required: true, maskType: "none", section: "address" },
      { id: "numero", label: "Número", type: "text", required: true, maskType: "none", section: "address" },
      { id: "bairro", label: "Bairro", type: "text", required: true, maskType: "none", section: "address" },
      { id: "cidade", label: "Cidade", type: "text", required: true, maskType: "none", section: "address" },
      { id: "estado", label: "Estado", type: "select", required: true, maskType: "none", section: "address", options: ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"] },

      { id: "treinamento", label: "Confirmo ter concluído o treinamento de liderança do ministério", type: "checkbox", required: true, maskType: "none", section: "confirmations" },
      { id: "termos", label: "Declaro aceitar os Termos e Políticas de Privacidade", type: "checkbox", required: true, maskType: "none", section: "confirmations" }
    ];
    setEditorFields(template);
  };

  // Form Editor actions
  const handleAddField = () => {
    if (!newField.label.trim()) return;

    const id = "field_" + Date.now().toString(36);
    
    let finalOptionsRaw = newField.optionsRaw;
    const labelLower = newField.label.toLowerCase();
    const isStateField = newField.type === "select" && (
      labelLower.includes("estado") || 
      labelLower === "uf" || 
      labelLower.includes("u.f.")
    );
    const isYesNoField = newField.type === "select" && (
      labelLower.includes("vez") ||
      labelLower.includes("igreja") ||
      labelLower.includes("primeira") ||
      labelLower.includes("1ª") ||
      labelLower.includes("sim/não") ||
      labelLower.includes("sim ou não")
    );

    if (isStateField && !newField.optionsRaw.trim()) {
      finalOptionsRaw = "AC, AL, AP, AM, BA, CE, DF, ES, GO, MA, MT, MS, MG, PA, PB, PR, PE, PI, RJ, RN, RS, RO, RR, SC, SP, SE, TO";
    } else if (isYesNoField && !newField.optionsRaw.trim()) {
      finalOptionsRaw = "Sim, Não";
    }

    const options = finalOptionsRaw
      ? finalOptionsRaw.split(",").map((o) => o.trim()).filter(Boolean)
      : undefined;

    const fieldToAdd: FormField = {
      id,
      label: newField.label.trim(),
      type: newField.type,
      required: newField.required,
      options,
      maskType: newField.maskType,
      section: newField.section,
    };

    setEditorFields((curr) => [...curr, fieldToAdd]);
    setNewField({
      label: "",
      type: "text",
      required: false,
      optionsRaw: "",
      maskType: "none",
      section: "personal"
    });
  };

  const handleRemoveField = (id: string) => {
    // Keep at least basic tracking or allow complete deletion
    setEditorFields((curr) => curr.filter((f) => f.id !== id));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setEditorFields((curr) => {
      const copy = [...curr];
      const temp = copy[index];
      copy[index] = copy[index - 1];
      copy[index - 1] = temp;
      return copy;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index === editorFields.length - 1) return;
    setEditorFields((curr) => {
      const copy = [...curr];
      const temp = copy[index];
      copy[index] = copy[index + 1];
      copy[index + 1] = temp;
      return copy;
    });
  };

  const handleSaveForm = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setSaveSuccess(false);
    try {
      if (!editorFields || editorFields.length === 0) {
        setErrorMessage("Erro: Você não pode salvar um formulário sem campos ativos.");
        return;
      }

      const docRef = doc(db, "course_forms", formEditorCourse);
      await setDoc(docRef, {
        courseId: formEditorCourse,
        fields: editorFields.map(f => ({
          id: f.id || "field_" + Math.random().toString(36).substring(2, 9),
          label: f.label || "Campo sem nome",
          type: f.type || "text",
          required: !!f.required,
          options: f.options || [],
          maskType: f.maskType || "none",
          section: f.section || "personal"
        })),
        updatedAt: serverTimestamp(),
      });
      
      setSaveSuccess(true);
      setSuccessMessage(`Formulário de "${formEditorCourse}" salvo com sucesso!`);
      setTimeout(() => {
        setSaveSuccess(false);
        setSuccessMessage(null);
      }, 5000);
    } catch (err: any) {
      console.error("Erro ao salvar formulário:", err);
      const msg = err?.message || String(err);
      if (msg.includes("permission") || msg.includes("Permission")) {
        setErrorMessage("Erro de permissão: Você precisa de privilégios de administrador ou editor para salvar configurações de formulário.");
      } else {
        setErrorMessage("Falha ao salvar formulário: " + msg);
      }
      setTimeout(() => setErrorMessage(null), 10000);
    }
  };

  // Manage registrations actions
  const handleDeleteRegistration = async (id: string) => {
    try {
      await deleteDoc(doc(db, "course_registrations", id));
      if (selectedReg?.id === id) {
        setSelectedReg(null);
      }
      setDeletingId(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `course_registrations/${id}`);
    }
  };

  const checkCoursePaidStatus = (courseTitle: string) => {
    const course = cursosList.find((c: any) => c.title === courseTitle);
    if (!course) return false;
    return course.investment && course.investment !== "Gratuito";
  };

  const handleTogglePaymentStatus = async (regId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, "course_registrations", regId), {
        paymentConfirmed: !currentStatus,
      });
      setSuccessMessage(`Pagamento ${!currentStatus ? 'confirmado' : 'marcado como pendente'} com sucesso!`);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      console.error("Erro ao alterar status de pagamento:", err);
      setErrorMessage("Erro ao alterar status de pagamento.");
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  const handleAssignLeader = async (regId: string, leaderId: string) => {
    if (!regId) return;
    setIsAssigning(true);
    setErrorMessage(null);
    try {
      const regObj = registrations.find((r) => r.id === regId);
      if (!regObj) {
        setErrorMessage("Erro: Matrícula não encontrada.");
        setTimeout(() => setErrorMessage(null), 5000);
        setIsAssigning(false);
        return;
      }

      if (leaderId) {
        const isPaid = checkCoursePaidStatus(regObj.courseTitle);
        if (isPaid && !regObj.paymentConfirmed) {
          setErrorMessage(`Atenção: O curso "${regObj.courseTitle}" é pago. É necessário confirmar o pagamento deste estudante antes de vinculá-lo a um líder.`);
          setTimeout(() => setErrorMessage(null), 10000);
          setAssigningRegId(null);
          setIsAssigning(false);
          return;
        }
      }

      if (!leaderId) {
        // Unlink/remove assignment
        await updateDoc(doc(db, "course_registrations", regId), {
          assignedLeaderId: null,
          assignedLeaderName: null,
          assignedLeaderEmail: null,
          assignedAt: null
        });
        if (selectedReg && selectedReg.id === regId) {
          setSelectedReg((prev: any) => ({
            ...prev,
            assignedLeaderId: null,
            assignedLeaderName: null,
            assignedLeaderEmail: null,
            assignedAt: null
          }));
        }
        setSuccessMessage("Vínculo com líder removido com sucesso!");
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        const leader = leadersList.find((u) => u.id === leaderId);
        const name = leader?.nome || leader?.nomeMarido || leader?.email || "Líder";
        const email = leader?.email || "";
        
        await updateDoc(doc(db, "course_registrations", regId), {
          assignedLeaderId: leaderId,
          assignedLeaderName: name,
          assignedLeaderEmail: email,
          assignedAt: serverTimestamp()
        });
        if (selectedReg && selectedReg.id === regId) {
          setSelectedReg((prev: any) => ({
            ...prev,
            assignedLeaderId: leaderId,
            assignedLeaderName: name,
            assignedLeaderEmail: email,
            assignedAt: new Date()
          }));
        }
        setSuccessMessage(`Inscrição encaminhada com sucesso para o líder "${name}"!`);
        setTimeout(() => setSuccessMessage(null), 5000);
      }
      setAssigningRegId(null);
    } catch (err) {
      console.error("Erro ao vincular líder à matrícula:", err);
      setErrorMessage("Erro interno ao vincular líder.");
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setIsAssigning(false);
    }
  };

  // Export registrations data to CSV file
  const handleExportCSV = () => {
    const list = filteredRegistrations;
    if (list.length === 0) return;

    // Build unique CSV headers headers
    // Let's include default fields and dynamic responses mapping
    const headers = ["ID Matrícula", "Curso Selecionado", "Data de Inscrição"];
    
    // Find all custom questions asked in the dataset to build safe columns
    const customKeys = new Set<string>();
    list.forEach((item) => {
      if (item.formData) {
        Object.keys(item.formData).forEach((key) => customKeys.add(key));
      }
    });

    const customKeysArr = Array.from(customKeys);
    const fullHeaders = [...headers, ...customKeysArr];

    // Build CSV Row values
    const rows = list.map((item) => {
      const creationDate = item.createdAt
        ? new Date(item.createdAt.seconds * 1000).toLocaleString("pt-BR")
        : "";
      const baseInfo = [item.id, item.courseTitle, creationDate];
      const customValList = customKeysArr.map((key) => {
        const val = item.formData?.[key];
        if (val === true) return "Sim";
        if (val === false) return "Não";
        return val ? `"${String(val).replace(/"/g, '""')}"` : "";
      });
      return [...baseInfo, ...customValList].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [fullHeaders.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `matriculas_${selectedCourse}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filters based on dynamic course selection and leader assignment toggle
  const filteredRegistrations = registrations.filter((reg) => {
    const matchesCourse = selectedCourse === "all" || reg.courseTitle === selectedCourse;
    const matchesAssigned = showAssigned || !reg.assignedLeaderId;
    return matchesCourse && matchesAssigned;
  });

  // Extract simple readable fields for general table preview
  const getPreviewFieldValue = (reg: any, keyKeywords: string[]) => {
    if (!reg.formData) return "";
    // Check key contains "name","nome","email" or "whatsapp","tel","celular"
    const keys = Object.keys(reg.formData);
    const matchedKey = keys.find((key) =>
      keyKeywords.some((keyword) => key.toLowerCase().includes(keyword))
    );
    if (matchedKey) return reg.formData[matchedKey];
    return "";
  };

  return (
    <div className="bg-white rounded-3xl border border-[#c8d8e8] shadow-sm overflow-hidden font-sans">
      {/* Tab bar header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 bg-[#f7fafd] px-6 py-4">
        <div className="flex items-center gap-3 mb-4 sm:mb-0">
          <GraduationCap className="text-primary-base" size={24} />
          <h3 className="text-lg font-serif font-bold text-primary-dark">
            Central de Matrículas & Formulários
          </h3>
          
          {/* Notification Badge */}
          <div className="relative">
            <button
              onClick={() => setShowNotificationCenter(!showNotificationCenter)}
              className="relative p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 active:scale-95 animate-pulse"
              title="Quantidade de Matrículas Realizadas"
            >
              <BellRing size={15} />
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-600 text-[9px] font-black leading-none text-white ring-2 ring-white shadow-sm">
                {registrations.length}
              </span>
            </button>

            {/* Notification Dropdown List */}
            <AnimatePresence>
              {showNotificationCenter && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute left-0 mt-2 z-50 w-80 rounded-2xl border border-[#c8d8e8] bg-white p-4 shadow-xl text-left"
                >
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3">
                    <span className="text-xs font-serif font-bold text-[#2c4a63] flex items-center gap-1.5">
                      <Bell size={13} className="text-amber-500" /> Matrículas Efetuadas: <span className="bg-amber-100 text-amber-800 font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-amber-200">{registrations.length}</span>
                    </span>
                    {sessionNotifications.length > 0 && (
                      <button
                        onClick={() => {
                          setSessionNotifications(prev => prev.map(n => ({ ...n, read: true })));
                        }}
                        className="text-[9px] bg-gray-50 hover:bg-gray-100 text-primary-base font-bold px-2 py-1 rounded cursor-pointer transition-colors"
                      >
                        Marcar lidas
                      </button>
                    )}
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                    {sessionNotifications.length === 0 ? (
                      <p className="text-[10px] text-gray-400 text-center py-6 leading-relaxed italic">
                        Nenhuma nova inscrição recebida desde que este painel foi aberto.
                      </p>
                    ) : (
                      sessionNotifications.map((note) => (
                        <div
                          key={note.id}
                          onClick={() => {
                            // Mark read
                            setSessionNotifications(prev =>
                              prev.map(n => (n.id === note.id ? { ...n, read: true } : n))
                            );
                            setSelectedReg(note.fullReg);
                            setShowNotificationCenter(false);
                          }}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all hover:translate-x-1 flex flex-col space-y-1 ${
                            note.read
                              ? "bg-gray-50/50 border-gray-100 text-gray-500"
                              : "bg-amber-50/45 border-amber-200/50 hover:bg-amber-50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-primary-dark truncate pr-1">
                              {note.studentName}
                            </span>
                            <span className="text-[9px] font-mono font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded shrink-0">
                              {note.receivedAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                            </span>
                          </div>
                          <span className="text-[10px] font-medium text-gray-500">
                            Matrícula em: <strong className="text-primary-base">{note.courseTitle}</strong>
                          </span>
                          <span className="text-[9px] text-[#2c4a63] font-bold text-right hover:underline">
                            Visualizar ficha →
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="mt-2.5 border-t border-gray-100 pt-2 text-center">
                    <span className="text-[9px] text-gray-400 font-medium">
                      Notificações ativas de tempo real
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white rounded-xl p-1 border border-[#c8d8e8] self-start sm:self-auto">
          <button
            onClick={() => setAdminView("registrations")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              adminView === "registrations"
                ? "bg-primary-base text-white shadow-xs"
                : "text-[#2c4a63] hover:bg-gray-50"
            }`}
          >
            Matrículas Recebidas
          </button>
          <button
            onClick={() => setAdminView("forms")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              adminView === "forms"
                ? "bg-primary-base text-white shadow-xs"
                : "text-[#2c4a63] hover:bg-gray-50"
            }`}
          >
            Personalizar Formulários
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-solid border-primary-base border-t-transparent" />
          <p className="text-sm text-[#2c4a63] font-medium">Carregando informações...</p>
        </div>
      ) : adminView === "registrations" ? (
        /* ================== REGISTRATIONS TAB VIEW ================== */
        <div className="p-6">
          {/* Alertas de Sucesso ou Erro específicos */}
          <AnimatePresence>
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-4 p-4 bg-emerald-50 border-[1.5px] border-emerald-200 text-emerald-850 rounded-2xl flex items-center gap-3 text-xs font-extrabold animate-fade-in"
              >
                <span className="w-2 h-2 bg-emerald-500 rounded-full shrink-0" />
                <span className="flex-1">{successMessage}</span>
              </motion.div>
            )}

            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-4 p-4 bg-rose-50 border-[1.5px] border-rose-200 text-rose-850 rounded-2xl flex items-center gap-3 text-xs font-extrabold animate-fade-in"
              >
                <div className="w-2 h-2 bg-rose-500 rounded-full shrink-0 animate-ping" />
                <span className="flex-1">{errorMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold text-[#2c4a63]">Filtrar por Curso:</span>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="px-4 py-2.5 bg-[#f7fafd] border border-[#c8d8e8] rounded-xl text-xs font-semibold text-primary-dark focus:outline-none focus:border-primary-base transition-all cursor-pointer"
              >
                <option value="all">Todos os Cursos ({registrations.length})</option>
                {allAvailableCourses.map((course) => {
                  const count = registrations.filter((r) => r.courseTitle === course).length;
                  return (
                    <option key={course} value={course}>
                      {course} ({count})
                    </option>
                  );
                })}
              </select>

              <label className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#c8d8e8] hover:border-primary-base rounded-xl text-xs font-bold text-[#2c4a63] cursor-pointer transition-all select-none">
                <input
                  type="checkbox"
                  checked={showAssigned}
                  onChange={(e) => setShowAssigned(e.target.checked)}
                  className="rounded text-primary-base focus:ring-primary-base border-gray-300 cursor-pointer h-4 w-4"
                />
                <span>Exibir alunos já vinculados a líderes</span>
              </label>
            </div>

            {filteredRegistrations.length > 0 && (
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary-base/10 text-primary-base hover:bg-primary-base hover:text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 self-start lg:self-auto"
              >
                <Download size={14} /> Exportar Planilha (CSV)
              </button>
            )}
          </div>

          {filteredRegistrations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-[#e2eaf3] rounded-2xl bg-[#f7fafd]/50">
              <AlertCircle size={40} className="text-[#a0b2c6] mb-3" />
              <h4 className="text-base font-serif font-bold text-[#2c4a63]">
                Nenhuma inscrição encontrada
              </h4>
              <p className="text-xs text-gray-500 max-w-xs mt-1">
                As pessoas que clicarem em "Matricule-se" e completarem os dados aparecerão aqui em tempo real.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-[#e2eaf3] rounded-2xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f7fafd] border-b border-[#e2eaf3] text-[11px] font-bold uppercase tracking-wider text-primary-dark">
                    <th className="px-6 py-4">Data</th>
                    <th className="px-6 py-4">Estudante</th>
                    <th className="px-6 py-4">Curso / Treinamento</th>
                    <th className="px-6 py-4">Pagamento</th>
                    <th className="px-6 py-4">Líder Vinculado</th>
                    <th className="px-6 py-4">Contatos</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2eaf3] text-sm text-[#2c4a63]">
                  {filteredRegistrations.map((reg) => {
                    const name = getPreviewFieldValue(reg, ["nome", "name", "estudante", "completo"]) || "Não especificado";
                    const email = getPreviewFieldValue(reg, ["email", "correio"]) || "Sem e-mail";
                    const whatsapp = getPreviewFieldValue(reg, ["whatsapp", "tel", "cel", "fone", "phone"]) || "Sem whatsapp";
                    const dateStr = reg.createdAt
                      ? new Date(reg.createdAt.seconds * 1000).toLocaleDateString("pt-BR")
                      : "Sem data";

                    return (
                      <tr key={reg.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 text-xs font-mono font-medium text-gray-500">
                          {dateStr}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-primary-dark">{name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-block px-3 py-1 bg-[#f7fafd] text-primary-base border border-[#c8d8e8] rounded-full text-xs font-semibold">
                            {reg.courseTitle}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {(() => {
                            const isPaid = checkCoursePaidStatus(reg.courseTitle);
                            if (!isPaid) {
                              return (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-gray-100 text-gray-500 rounded-md text-[10px] font-black uppercase tracking-wider">
                                  Gratuito
                                </span>
                              );
                            }
                            if (reg.paymentConfirmed) {
                              return (
                                <button
                                  onClick={() => handleTogglePaymentStatus(reg.id, true)}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
                                  title="Pago. Clique para marcar como pendente"
                                >
                                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping animate-pulse" />
                                  Confirmado
                                </button>
                              );
                            } else {
                              return (
                                <button
                                  onClick={() => handleTogglePaymentStatus(reg.id, false)}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 rounded-lg text-xs font-bold transition-all cursor-pointer hover:scale-105"
                                  title="Não Pago. Clique para confirmar pagamento"
                                >
                                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                                  Pendente
                                </button>
                              );
                            }
                          })()}
                        </td>
                        <td className="px-6 py-4">
                          {assigningRegId === reg.id ? (
                            <div className="flex items-center gap-1.5 bg-[#f7fafd] p-1.5 rounded-xl border border-[#c8d8e8]">
                              <select
                                value={selectedLeaderIdForReg}
                                onChange={(e) => setSelectedLeaderIdForReg(e.target.value)}
                                className="px-2 py-1 bg-white border border-[#c8d8e8] rounded-lg text-xs font-bold text-primary-dark focus:outline-none focus:border-primary-base"
                              >
                                <option value="">-- Sem líder / desvincular --</option>
                                {leadersList.map((lead) => {
                                  const leadName = lead.nome || lead.nomeMarido || lead.email || "Líder";
                                  const leadRole = lead.role ? ` (${lead.role})` : "";
                                  return (
                                    <option key={lead.id} value={lead.id}>
                                      {leadName}{leadRole}
                                    </option>
                                  );
                                })}
                              </select>
                              <button
                                onClick={() => handleAssignLeader(reg.id, selectedLeaderIdForReg)}
                                disabled={isAssigning}
                                className="px-2 py-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-200 text-white font-extrabold text-[10px] rounded transition-all cursor-pointer"
                              >
                                OK
                              </button>
                              <button
                                onClick={() => setAssigningRegId(null)}
                                className="px-2 py-1 border border-gray-200 hover:bg-gray-100 text-gray-500 font-extrabold text-[10px] rounded transition-all cursor-pointer"
                              >
                                ×
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              {reg.assignedLeaderId ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-850 border border-emerald-200/60 rounded-xl text-xs font-bold">
                                  <UserCheck size={11} className="text-emerald-600" />
                                  <span className="max-w-[120px] truncate">{reg.assignedLeaderName}</span>
                                </span>
                              ) : (
                                <span className="text-[11px] text-gray-400 italic">Nenhum</span>
                              )}
                              <button
                                onClick={() => {
                                  setAssigningRegId(reg.id);
                                  setSelectedLeaderIdForReg(reg.assignedLeaderId || "");
                                }}
                                className="p-1 px-1.5 hover:bg-primary-base/10 text-primary-base hover:text-primary-dark rounded transition-colors cursor-pointer"
                                title="Vincular líder"
                              >
                                <UserCheck size={13} />
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs space-y-0.5">
                          <div className="font-medium">{whatsapp}</div>
                          <div className="text-gray-400">{email}</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedReg(reg)}
                              title="Ver ficha completa"
                              className="p-1.5 bg-gray-50 hover:bg-primary-base hover:text-white rounded-lg text-[#2c4a63] transition-all"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => setDeletingId(reg.id)}
                              title="Excluir matrícula"
                              className="p-1.5 bg-rose-50 hover:bg-rose-500 hover:text-white rounded-lg text-rose-500 transition-all cursor-pointer"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* ================== CUSTOM FORMS EDITOR VIEW ================== */
        <div className="p-6">
          {/* Alertas de Sucesso ou Erro específicos do Editor de Formulários */}
          <AnimatePresence>
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-4 p-4 bg-emerald-50 border-[1.5px] border-emerald-200 text-emerald-850 rounded-2xl flex items-center gap-3 text-xs font-extrabold animate-fade-in"
              >
                <span className="w-2 h-2 bg-emerald-500 rounded-full shrink-0" />
                <span className="flex-1">{successMessage}</span>
              </motion.div>
            )}

            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-4 p-4 bg-rose-50 border-[1.5px] border-rose-200 text-rose-850 rounded-2xl flex items-center gap-3 text-xs font-extrabold animate-fade-in"
              >
                <div className="w-2 h-2 bg-rose-500 rounded-full shrink-0 animate-ping" />
                <span className="flex-1">{errorMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-[#f7fafd] border border-[#e2eaf3] p-5 rounded-2xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-primary-dark block mb-2">
                Selecione o Curso para Customizar o Formulário:
              </label>
              <select
                value={formEditorCourse}
                onChange={(e) => setFormEditorCourse(e.target.value)}
                className="w-full max-w-md px-4 py-3 bg-white border border-[#c8d8e8] rounded-xl text-sm font-bold text-primary-dark focus:outline-none focus:border-primary-base focus:ring-2 focus:ring-primary-base/10 transition-all cursor-pointer"
              >
                {dynamicCourses.length === 0 ? (
                  <option value="">Nenhum curso cadastrado ainda</option>
                ) : (
                  dynamicCourses.map((course) => (
                    <option key={course} value={course}>
                      {course}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div className="text-xs text-[#2c4a63] max-w-sm italic">
              Configurações salvas serão baixadas em tempo real pelas janelas de matrícula deste curso. Se nenhuma regra personalizada for criada, usaremos o formulário padrão.
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-8">
            {/* Left side: current fields draft layout list */}
            <div className="lg:col-span-7 bg-gray-50 border border-[#e2eaf3] p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
                <h4 className="font-serif font-bold text-primary-dark flex items-center gap-2 text-base">
                  <FileText size={18} /> Campos Ativos no Formulário
                </h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={loadCadastroTemplate}
                    type="button"
                    className="px-3 py-1.5 bg-[#1a6496]/5 hover:bg-[#1a6496]/15 border border-[#1a6496]/20 text-[11px] font-bold text-[#1a6496] rounded-xl transition-all shadow-xs cursor-pointer"
                    title="Preenche o formulário com a estrutura completa e idêntica ao Cadastro"
                  >
                    Carregar Modelo Completo do Cadastre-se
                  </button>
                  <span className="text-xs font-bold text-[#2c4a63]">
                    {editorFields.length} campos
                  </span>
                </div>
              </div>

              {editorFields.length === 0 ? (
                <div className="py-12 text-center text-gray-500 italic text-sm">
                  Sem campos adicionados. O formulário ficará vazio. Adicione pelo menos um campo!
                </div>
              ) : (
                <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                  {editorFields.map((field, index) => {
                    return (
                      <div
                        key={field.id}
                        className="bg-white p-4 border border-[#c8d8e8] rounded-2xl shadow-xs space-y-3 group"
                      >
                        <div className="flex items-start justify-between border-b border-gray-100 pb-2">
                           <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-primary-base/10 text-primary-base flex items-center justify-center text-xs font-mono font-bold">
                              {index + 1}
                            </span>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider font-mono">
                              Campo / {field.type === "tel" ? "Telefone" : field.type === "text" ? "Texto" : field.type === "number" ? "Número" : field.type === "select" ? "Lista" : field.type === "checkbox" ? "Caixa de Seleção" : field.type}
                            </span>
                          </div>
                          {deleteFieldConfirmId === field.id ? (
                            <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200/60 p-1 px-2.5 rounded-xl animate-fade-in select-none">
                              <span className="text-[10px] font-black text-rose-700 uppercase tracking-widest mr-1">
                                Excluir?
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  handleRemoveField(field.id);
                                  setDeleteFieldConfirmId(null);
                                }}
                                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-black text-[9px] uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                              >
                                Sim
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteFieldConfirmId(null)}
                                className="px-2.5 py-1 bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 font-black text-[9px] uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                              >
                                Não
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleMoveUp(index)}
                                disabled={index === 0}
                                className={`p-1.5 rounded-lg transition-all ${
                                  index === 0
                                    ? "text-gray-200 cursor-not-allowed opacity-40"
                                    : "text-gray-400 hover:text-[#1a6496] hover:bg-sky-50 active:scale-90"
                                }`}
                                title="Mover para cima"
                              >
                                <ArrowUp size={15} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveDown(index)}
                                disabled={index === editorFields.length - 1}
                                className={`p-1.5 rounded-lg transition-all ${
                                  index === editorFields.length - 1
                                    ? "text-gray-200 cursor-not-allowed opacity-40"
                                    : "text-gray-400 hover:text-[#1a6496] hover:bg-sky-50 active:scale-90"
                                }`}
                                title="Mover para baixo"
                              >
                                <ArrowDown size={15} />
                              </button>
                              <div className="mx-1 h-4 w-px bg-gray-200" />
                              <button
                                type="button"
                                onClick={() => setDeleteFieldConfirmId(field.id)}
                                className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Remover este campo"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">
                              Rótulo / Pergunta:
                            </label>
                            <input
                              type="text"
                              className="w-full text-xs font-semibold p-2 border border-[#c8d8e8] rounded-lg focus:outline-none focus:border-primary-base"
                              value={field.label}
                              onChange={(e) => {
                                const newLabel = e.target.value;
                                setEditorFields((curr) =>
                                  curr.map((f) =>
                                    f.id === field.id ? { ...f, label: newLabel } : f,
                                  ),
                                );
                              }}
                            />
                          </div>

                          <div>
                            <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">
                              Máscara / Formato:
                            </label>
                            <select
                              className="w-full text-xs font-semibold p-2 border border-[#c8d8e8] rounded-lg focus:outline-none focus:border-primary-base bg-white cursor-pointer"
                              value={field.maskType || "none"}
                              onChange={(e) => {
                                const val = e.target.value as any;
                                setEditorFields((curr) =>
                                  curr.map((f) =>
                                    f.id === field.id ? { ...f, maskType: val } : f,
                                  ),
                                );
                              }}
                            >
                              <option value="none">Sem Formatação</option>
                              <option value="numbers_only">Apenas Números</option>
                              <option value="cpf">CPF (999.999.999-99)</option>
                              <option value="cep">CEP (99999-999)</option>
                              <option value="date">Data (DD/MM/AAAA)</option>
                              <option value="phone">Telefone / WhatsApp</option>
                              <option value="email">E-mail (Formato de e-mail)</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">
                              Seção do Formulário:
                            </label>
                            <select
                              className="w-full text-xs font-semibold p-2 border border-[#c8d8e8] rounded-lg focus:outline-none focus:border-primary-base bg-white cursor-pointer"
                              value={field.section || "personal"}
                              onChange={(e) => {
                                const val = e.target.value as any;
                                setEditorFields((curr) =>
                                  curr.map((f) =>
                                    f.id === field.id ? { ...f, section: val } : f,
                                  ),
                                );
                              }}
                            >
                              <option value="personal">Dados Pessoais</option>
                              <option value="spouse">Dados do Cônjuge</option>
                              <option value="address">Endereço</option>
                              <option value="confirmations">Confirmações</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
                          <label className="inline-flex items-center gap-2 cursor-pointer font-bold text-xs text-[#2c4a63] select-none">
                            <input
                              type="checkbox"
                              checked={!!field.required}
                              className="w-4 h-4 rounded text-primary-base border-[#c8d8e8] focus:ring-primary-base/10 cursor-pointer"
                              onChange={(e) => {
                                const req = e.target.checked;
                                setEditorFields((curr) =>
                                  curr.map((f) =>
                                    f.id === field.id ? { ...f, required: req } : f,
                                  ),
                                );
                              }}
                            />
                            Este campo é de resposta obrigatória
                          </label>

                          {field.type === "select" && (
                            <div className="flex-1 sm:ml-4">
                              <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">
                                Opções (Separadas por vírgula):
                              </label>
                              <input
                                type="text"
                                className="w-full text-xs p-1.5 border border-[#c8d8e8] rounded-md focus:outline-none focus:border-primary-base bg-white font-medium"
                                value={field.options?.join(", ") || ""}
                                onChange={(e) => {
                                  const opts = e.target.value
                                    .split(",")
                                    .map((o) => o.trim())
                                    .filter(Boolean);
                                  setEditorFields((curr) =>
                                    curr.map((f) =>
                                      f.id === field.id ? { ...f, options: opts } : f,
                                    ),
                                  );
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Save template action */}
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <button
                  onClick={handleSaveForm}
                  className={`flex items-center gap-2 px-6 py-3.5 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer ${
                    saveSuccess
                      ? "bg-emerald-600 hover:bg-emerald-750 ring-4 ring-emerald-100"
                      : "bg-[#1a6496] hover:bg-primary-dark"
                  }`}
                >
                  {saveSuccess ? (
                    <>
                      <Check size={16} className="animate-pulse" /> ✓ Formulário Salvo com Sucesso!
                    </>
                  ) : (
                    <>
                      <Save size={16} /> Salvar Formulário para {formEditorCourse}
                    </>
                  )}
                </button>

                <AnimatePresence>
                  {saveSuccess && (
                     <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-full shadow-xs animate-fade-in"
                    >
                      <Check size={14} className="text-emerald-600" /> Configuração gravada nas nuvens!
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right side: Add a field form helper */}
            <div className="lg:col-span-12 xl:col-span-5 bg-white border border-[#c8d8e8] p-6 rounded-2xl h-fit border-b-4 border-b-primary-base">
              <h4 className="font-serif font-bold text-primary-dark mt-1 mb-3 text-base flex items-center gap-1.5">
                <Plus size={18} className="text-primary-base font-black" /> Criar Novo Campo
              </h4>

              {/* Modelos rápidos sugeridos */}
              <div className="bg-[#f0f6fa] border border-[#c8d8e8]/50 p-4 rounded-xl mb-5 text-left">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#1a6496] block mb-2 px-0.5">
                  💡 Modelos de Perguntas Frequentes:
                </span>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setNewField({
                      label: "É a 1ª vez que faz o curso?",
                      type: "select",
                      required: true,
                      optionsRaw: "Sim, Não",
                      maskType: "none",
                      section: "confirmations"
                    })}
                    className="w-full text-left px-3 py-2 bg-white border border-[#c8d8e8]/75 hover:border-primary-base rounded-lg text-xs font-semibold text-[#2c4a63] cursor-pointer hover:bg-neutral-50 active:scale-98 transition-all flex items-center justify-between shadow-xs select-none"
                  >
                    <span className="truncate pr-1">🎯 É a 1ª vez que faz o curso?</span>
                    <span className="text-[9px] shrink-0 bg-[#e1effa] text-[#1a6496] px-1.5 py-0.5 rounded font-black uppercase tracking-wider">Sim/Não</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewField({
                      label: "Frequenta alguma igreja?",
                      type: "select",
                      required: false,
                      optionsRaw: "Sim, Não",
                      maskType: "none",
                      section: "personal"
                    })}
                    className="w-full text-left px-3 py-2 bg-white border border-[#c8d8e8]/75 hover:border-primary-base rounded-lg text-xs font-semibold text-[#2c4a63] cursor-pointer hover:bg-neutral-50 active:scale-98 transition-all flex items-center justify-between shadow-xs select-none"
                  >
                    <span className="truncate pr-1">⛪ Frequenta alguma igreja?</span>
                    <span className="text-[9px] shrink-0 bg-[#e1effa] text-[#1a6496] px-1.5 py-0.5 rounded font-black uppercase tracking-wider">Sim/Não</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewField({
                      label: "Como conheceu o curso?",
                      type: "select",
                      required: false,
                      optionsRaw: "Redes Sociais, Recomendação de Amigos, Cartaz/Banner, Pela Igreja, Outro",
                      maskType: "none",
                      section: "personal"
                    })}
                    className="w-full text-left px-3 py-2 bg-white border border-[#c8d8e8]/75 hover:border-primary-base rounded-lg text-xs font-semibold text-[#2c4a63] cursor-pointer hover:bg-neutral-50 active:scale-98 transition-all flex items-center justify-between shadow-xs select-none"
                  >
                    <span className="truncate pr-1">📣 Como conheceu o curso?</span>
                    <span className="text-[9px] shrink-0 bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">Selecção</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewField({
                      label: "Estado",
                      type: "select",
                      required: true,
                      optionsRaw: "AC, AL, AP, AM, BA, CE, DF, ES, GO, MA, MT, MS, MG, PA, PB, PR, PE, PI, RJ, RN, RS, RO, RR, SC, SP, SE, TO",
                      maskType: "none",
                      section: "address"
                    })}
                    className="w-full text-[#15537a] text-left px-3 py-2 bg-emerald-50 border border-emerald-200/80 hover:border-emerald-400 rounded-lg text-xs font-extrabold cursor-pointer hover:bg-emerald-100/50 active:scale-98 transition-all flex items-center justify-between shadow-xs select-none animate-pulse-once"
                  >
                    <span className="truncate pr-1">📍 Estado (UF)</span>
                    <span className="text-[9px] shrink-0 bg-emerald-600 text-white px-2 py-0.5 rounded font-black uppercase tracking-wider">Todos os Estados</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#2c4a63] block mb-1.5">
                    Nome do Campo / Pergunta:
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: CPF, CEP, Data de Nascimento..."
                    value={newField.label}
                    onChange={(e) => {
                      const value = e.target.value;
                      const valueLower = value.toLowerCase();
                      
                      let type = newField.type;
                      let maskType = newField.maskType;
                      let optionsRaw = newField.optionsRaw;
                      let section = newField.section;

                      if (valueLower === "estado" || valueLower === "uf" || valueLower === "u.f." || valueLower.includes("estado") || valueLower.includes("uf")) {
                        type = "select";
                        optionsRaw = "AC, AL, AP, AM, BA, CE, DF, ES, GO, MA, MT, MS, MG, PA, PB, PR, PE, PI, RJ, RN, RS, RO, RR, SC, SP, SE, TO";
                        section = "address";
                      } else if (valueLower.includes("vez") || valueLower.includes("igreja") || valueLower.includes("primeira") || valueLower.includes("1ª") || valueLower.includes("sim/não") || valueLower.includes("sim ou não") || valueLower.includes("sim / não")) {
                        type = "select";
                        optionsRaw = "Sim, Não";
                      } else if (valueLower.includes("email") || valueLower.includes("e-mail")) {
                        type = "email";
                        maskType = "email";
                      } else if (valueLower.includes("cep")) {
                        type = "text";
                        maskType = "cep";
                        section = "address";
                      } else if (valueLower.includes("tel") || valueLower.includes("cel") || valueLower.includes("whatsapp") || valueLower.includes("fone") || valueLower.includes("phone")) {
                        type = "tel";
                        maskType = "phone";
                      } else if (valueLower.includes("cpf")) {
                        type = "text";
                        maskType = "cpf";
                      } else if (valueLower.includes("nascimento") || valueLower.includes("data")) {
                        type = "text";
                        maskType = "date";
                      }

                      setNewField({
                        ...newField,
                        label: value,
                        type,
                        maskType,
                        optionsRaw,
                        section
                      });
                    }}
                    className="w-full rounded-xl border border-[#c8d8e8] px-4 py-3 text-sm focus:outline-none focus:border-primary-base transition-all text-primary-dark"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#2c4a63] block mb-1.5">
                    Tipo de Resposta:
                  </label>
                  <select
                    value={newField.type}
                    onChange={(e) =>
                      setNewField({ ...newField, type: e.target.value as FormField["type"] })
                    }
                    className="w-full rounded-xl border border-[#c8d8e8] px-4 py-3 text-sm focus:outline-none focus:border-primary-base transition-all text-primary-dark cursor-pointer"
                  >
                    <option value="text">Texto Simples</option>
                    <option value="number">Número</option>
                    <option value="email">E-mail</option>
                    <option value="tel">Telefone / WhatsApp</option>
                    <option value="select">Lista de Seleção (Dropdown)</option>
                    <option value="checkbox">Caixa de Validação (Confirmar)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#2c4a63] block mb-1.5">
                    Máscara de Digitação / Validação Especial:
                  </label>
                  <select
                    value={newField.maskType}
                    onChange={(e) =>
                      setNewField({ ...newField, maskType: e.target.value as any })
                    }
                    className="w-full rounded-xl border border-[#c8d8e8] px-4 py-3 text-sm focus:outline-none focus:border-primary-base transition-all text-primary-dark cursor-pointer bg-white"
                  >
                    <option value="none">Sem Formatação (Texto livre)</option>
                    <option value="numbers_only">Apenas Números</option>
                    <option value="cpf">CPF (999.999.999-99)</option>
                    <option value="cep">CEP (99999-999)</option>
                    <option value="date">Data (DD/MM/AAAA)</option>
                    <option value="phone">Telefone / WhatsApp</option>
                    <option value="email">E-mail (Formato de e-mail)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#2c4a63] block mb-1.5">
                    Seção / Bloco do Formulário:
                  </label>
                  <select
                    value={newField.section}
                    onChange={(e) =>
                      setNewField({ ...newField, section: e.target.value as any })
                    }
                    className="w-full rounded-xl border border-[#c8d8e8] px-4 py-3 text-sm focus:outline-none focus:border-primary-base transition-all text-primary-dark cursor-pointer bg-white"
                  >
                    <option value="personal">Dados Pessoais (Marido/Líder)</option>
                    <option value="spouse">Dados do Cônjuge</option>
                    <option value="address">Endereço</option>
                    <option value="confirmations">Confirmações</option>
                  </select>
                </div>

                {newField.type === "select" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="pt-2"
                  >
                    <label className="text-xs font-bold text-[#2c4a63] block mb-1">
                      Opções da Lista (separadas por vírgula):
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Primeira Vez, Segunda Vez, Mais de 3"
                      value={newField.optionsRaw}
                      onChange={(e) => setNewField({ ...newField, optionsRaw: e.target.value })}
                      className="w-full rounded-xl border border-[#c8d8e8] px-4 py-3 text-sm focus:outline-none focus:border-primary-base transition-all text-primary-dark"
                    />
                    <span className="text-[10px] text-gray-400 italic block mt-1">
                      Insira as respostas possíveis separadas por vírgulas.
                    </span>
                  </motion.div>
                )}

                <div className="flex items-center gap-2.5 py-2">
                  <input
                    type="checkbox"
                    id="field_required"
                    checked={newField.required}
                    onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                    className="h-5 w-5 rounded border-[#c8d8e8] text-primary-base focus:ring-primary-base/20 cursor-pointer"
                  />
                  <label
                    htmlFor="field_required"
                    className="text-xs font-bold text-[#203c54] cursor-pointer"
                  >
                    Este campo é obrigatório responder?
                  </label>
                </div>

                <button
                  type="button"
                  onClick={handleAddField}
                  disabled={!newField.label.trim()}
                  className="w-full py-3.5 bg-primary-base/5 hover:bg-primary-base/15 disabled:bg-gray-100 disabled:text-gray-400 text-primary-base font-bold text-xs rounded-xl border border-primary-base/20 transition-all uppercase tracking-wider shadow-inner"
                >
                  Inserir Campo no Formulário
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================== STUDENT DETAIL POPUP DIALOG ================== */}
      <AnimatePresence>
        {selectedReg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
            >
              <div className="flex justify-between items-center bg-primary-dark px-6 py-4 text-white">
                <div>
                  <span className="text-[10px] text-primary-light uppercase tracking-widest font-black">
                    Ficha de Inscrição Completa
                  </span>
                  <h4 className="text-lg font-serif font-black">{selectedReg.courseTitle}</h4>
                </div>
                <button
                  onClick={() => setSelectedReg(null)}
                  className="p-1 px-2.5 rounded-full hover:bg-white/10 text-white font-bold transition-all"
                >
                  ×
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
                <div className="flex justify-between items-center bg-gray-50 border border-[#e2eaf3] px-4 py-2.5 rounded-xl text-xs text-gray-500 font-mono font-semibold">
                  <span>ID: {selectedReg.id}</span>
                  <span>
                    Recebido:{" "}
                    {selectedReg.createdAt
                      ? new Date(selectedReg.createdAt.seconds * 1000).toLocaleString("pt-BR")
                      : "S/D"}
                  </span>
                </div>

                {/* Status de Pagamento no Modal */}
                {(() => {
                  const isPaidCourse = checkCoursePaidStatus(selectedReg.courseTitle);
                  if (!isPaidCourse) {
                    return (
                      <div className="flex items-center justify-between bg-gray-50 border border-[#e2eaf3] px-4 py-3 rounded-xl">
                        <span className="text-xs font-black uppercase text-gray-400">Investimento</span>
                        <span className="text-[10px] font-black uppercase tracking-wider bg-gray-200/55 text-gray-600 px-2.5 py-0.5 rounded-lg">
                          Curso Gratuito
                        </span>
                      </div>
                    );
                  }
                  return (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-amber-50/40 border border-amber-100 p-4 rounded-xl gap-3">
                      <div>
                        <div className="text-[10px] text-amber-700 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                          🔒 Curso Pago
                        </div>
                        <p className="text-xs font-semibold text-gray-600 mt-1">
                          Status:{" "}
                          <strong className={selectedReg.paymentConfirmed ? "text-emerald-600 text-xs font-black" : "text-amber-600 text-xs font-black"}>
                            {selectedReg.paymentConfirmed ? "Confirmado" : "Pendente de Confirmação"}
                          </strong>
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          handleTogglePaymentStatus(selectedReg.id, !!selectedReg.paymentConfirmed);
                          setSelectedReg((prev: any) => ({
                            ...prev,
                            paymentConfirmed: !prev.paymentConfirmed,
                          }));
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black tracking-wide transition-all cursor-pointer select-none ${
                          selectedReg.paymentConfirmed
                            ? "bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200"
                            : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs"
                        }`}
                      >
                        {selectedReg.paymentConfirmed ? "Marcar como Pendente" : "Confirmar Pagamento"}
                      </button>
                    </div>
                  );
                })()}

                {errorMessage && (
                  <div className="p-3 bg-rose-50 border border-rose-250 text-rose-800 rounded-xl text-xs font-bold leading-relaxed">
                    {errorMessage}
                  </div>
                )}

                <div className="space-y-3.5">
                  {selectedReg.formData ? (
                    Object.entries(selectedReg.formData).map(([keyId, val]: [string, any]) => {
                      const matchedForm = courseForms.find((f) => normalizeCourseTitle(f.id) === normalizeCourseTitle(selectedReg.courseTitle));
                      const displayLabel = matchedForm?.fields?.find((f: any) => String(f.id).toLowerCase() === String(keyId).toLowerCase())?.label || keyId;

                      return (
                        <div
                          key={keyId}
                          className="p-3 border border-[#e2eaf3] rounded-xl bg-white flex flex-col space-y-1.5"
                        >
                          <span className="text-xs font-black uppercase tracking-wider text-gray-400">
                            {displayLabel}
                          </span>
                          <span className="text-sm font-semibold text-primary-dark">
                            {val === true ? (
                              <span className="text-emerald-600 flex items-center gap-1 font-bold">
                                <Check size={14} /> Confirmado
                              </span>
                            ) : val === false ? (
                              <span className="text-rose-500 italic">Não</span>
                            ) : (
                              String(val) || <em className="text-gray-300">Vazio</em>
                            )}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-6 text-gray-400 italic">
                      Nenhum dado cadastrado neste registro.
                    </div>
                  )}
                </div>

                {/* Vinculo do Lider */}
                <div className="p-4 bg-[#f7fafd] border-[1.5px] border-[#c8d8e8]/70 rounded-2xl space-y-3">
                  <h5 className="text-xs font-black uppercase tracking-wider text-[#2c4a63] flex items-center gap-1.5">
                    <UserCheck size={14} className="text-primary-base" /> Direcionar Matrícula ao Painel de um Líder
                  </h5>
                  <p className="text-[10px] text-gray-500 leading-relaxed font-semibold">
                    Selecione um líder para que ele receba e visualize os dados deste aluno no painel dele, possibilitando montar uma nova turma de imediato.
                  </p>
                  <div className="flex flex-col gap-2">
                    <select
                      value={selectedReg.assignedLeaderId || ""}
                      onChange={(e) => handleAssignLeader(selectedReg.id, e.target.value)}
                      disabled={isAssigning}
                      className="w-full px-3 py-2 bg-white border border-[#c8d8e8] rounded-xl text-xs font-bold text-primary-dark focus:outline-none focus:border-primary-base cursor-pointer"
                    >
                      <option value="">-- Sem líder vinculado / Desvincular --</option>
                      {leadersList.map((lead) => {
                        const name = lead.nome || lead.nomeMarido || lead.email || "Líder";
                        const roleLabel = lead.role ? ` (${lead.role})` : "";
                        return (
                          <option key={lead.id} value={lead.id}>
                            {name}{roleLabel}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  {selectedReg.assignedLeaderId && (
                    <div className="bg-emerald-50/50 border border-emerald-100 p-2.5 rounded-xl text-[10px] text-emerald-800 font-medium">
                      O líder <strong className="text-emerald-900">{selectedReg.assignedLeaderName}</strong> já consegue ver este aluno em tempo real no painel do líder para formar a nova turma.
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end gap-2">
                  <button
                    onClick={() => setDeletingId(selectedReg.id)}
                    className="px-4 py-2.5 bg-rose-50 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 border border-rose-100 cursor-pointer"
                  >
                    <Trash2 size={13} /> Excluir Registro
                  </button>
                  <button
                    onClick={() => setSelectedReg(null)}
                    className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#2c4a63] font-bold rounded-xl text-xs transition-colors"
                  >
                    Fechar Ficha
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================== CUSTOM DELETION CONFIRMATION DIALOG MODAL ================== */}
      <AnimatePresence>
        {deletingId && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-rose-100 z-55"
            >
              <div className="bg-rose-50 px-6 py-4 flex items-center gap-3 border-b border-rose-100">
                <div className="p-2 bg-rose-500/10 text-rose-600 rounded-xl">
                  <Trash2 size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-[#5c1c1c] uppercase tracking-wider">Confirmar Exclusão</h4>
                  <p className="text-[10px] text-rose-500 font-semibold">Ação irreversível</p>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-xs text-gray-500 leading-relaxed font-medium">
                  Tem certeza de que deseja excluir permanentemente esta inscrição de matrícula? Todos os dados associados a este aluno serão removidos.
                </p>
                <div className="flex gap-2.5 w-full">
                  <button
                    onClick={() => handleDeleteRegistration(deletingId)}
                    className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs rounded-xl transition-all shadow-xs cursor-pointer text-center"
                  >
                    Sim, Excluir
                  </button>
                  <button
                    onClick={() => setDeletingId(null)}
                    className="flex-1 py-3 border border-gray-200 hover:bg-gray-50 text-gray-500 font-extrabold text-xs rounded-xl transition-all cursor-pointer text-center"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================== REAL-TIME ACTIVE TOAST NOTIFICATION OVERLAY ================== */}
      <AnimatePresence>
        {activeAlert && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-white rounded-2xl border-2 border-amber-300 shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="bg-amber-500/10 px-4 py-3 flex items-center justify-between border-b border-amber-200/40">
              <span className="flex items-center gap-1.5 text-xs font-black text-amber-850 uppercase tracking-wider animate-pulse">
                <BellRing size={14} className="text-amber-600 animate-bounce" /> Nova Matrícula Recebida!
              </span>
              <button
                onClick={() => setActiveAlert(null)}
                className="text-amber-800 hover:bg-amber-100 p-1 rounded-full text-xs font-bold leading-none cursor-pointer"
              >
                ×
              </button>
            </div>
            <div className="p-4 flex flex-col space-y-3 font-sans">
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-black text-primary-dark">
                  {activeAlert.studentName}
                </span>
                <span className="text-xs text-gray-500">
                  Acaba de se inscrever no curso: <strong className="text-primary-base">{activeAlert.courseTitle}</strong>
                </span>
              </div>
              <div className="flex gap-2 w-full pt-1">
                <button
                  onClick={() => {
                    // Mark read
                    setSessionNotifications((prev) =>
                      prev.map((n) => (n.id === activeAlert.id ? { ...n, read: true } : n))
                    );
                    setSelectedReg(activeAlert.fullReg);
                    setActiveAlert(null);
                  }}
                  className="flex-1 py-2 bg-primary-base hover:bg-primary-dark text-white font-bold text-xs rounded-lg transition-colors shadow-xs cursor-pointer text-center"
                >
                  Visualizar Agora
                </button>
                <button
                  onClick={() => setActiveAlert(null)}
                  className="px-3.5 py-2 border border-gray-200 hover:bg-gray-50 text-gray-400 hover:text-gray-600 font-bold text-xs rounded-lg transition-colors cursor-pointer text-center"
                >
                  Ignorar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
