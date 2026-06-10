import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDoc,
  setDoc,
  updateDoc,
  doc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Plus, Edit2, Trash2, Search, X, Check, Users, Eye, User, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import firebaseConfig from "../../../firebase-applet-config.json";

function cleanOklchInCss(cssText: string): string {
  if (!cssText) return "";
  
  // 1. Core converter for oklch
  let result = cssText.replace(/oklch\(([^)]+)\)/g, (match, p1) => {
    try {
      const parts = p1.trim().split(/[\s,+/]+/);
      if (parts.length < 3) return match;
      
      const L = parseFloat(parts[0]);
      const C = parseFloat(parts[1]);
      let H = parseFloat(parts[2]);
      if (isNaN(L) || isNaN(C) || isNaN(H)) return match;
      
      let A = 1;
      if (parts.length >= 4) {
        const alphaStr = parts[3];
        if (alphaStr.endsWith("%")) {
          A = parseFloat(alphaStr) / 100;
        } else {
          A = parseFloat(alphaStr);
        }
        if (isNaN(A)) A = 1;
      }
      
      const hRad = (H * Math.PI) / 180;
      const cosH = Math.cos(hRad);
      const sinH = Math.sin(hRad);
      
      const aVal = C * cosH;
      const bVal = C * sinH;
      
      const l_ = Math.pow(L + 0.3963377774 * aVal + 0.2158037573 * bVal, 3);
      const m_ = Math.pow(L - 0.1055613458 * aVal - 0.0638541728 * bVal, 3);
      const s_ = Math.pow(L - 0.0894841775 * aVal - 1.2914855480 * bVal, 3);
      
      const r_linear = 4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699294 * s_;
      const g_linear = -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_;
      const b_linear = -0.0041960863 * l_ - 0.7034186145 * m_ + 1.7076147010 * s_;
      
      const linearToSrgb = (x: number) => {
        if (isNaN(x)) return 0;
        return x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
      };
      
      const r = Math.max(0, Math.min(255, Math.round(linearToSrgb(r_linear) * 255)));
      const g = Math.max(0, Math.min(255, Math.round(linearToSrgb(g_linear) * 255)));
      const b = Math.max(0, Math.min(255, Math.round(linearToSrgb(b_linear) * 255)));
      
      return `rgba(${r}, ${g}, ${b}, ${A})`;
    } catch (err) {
      console.error("Erro ao converter oklch:", err);
      return match;
    }
  });

  // 2. Core converter for oklab
  result = result.replace(/oklab\(([^)]+)\)/g, (match, p1) => {
    try {
      const parts = p1.trim().split(/[\s,+/]+/);
      if (parts.length < 3) return match;
      
      const L = parseFloat(parts[0]);
      const aVal = parseFloat(parts[1]);
      const bVal = parseFloat(parts[2]);
      if (isNaN(L) || isNaN(aVal) || isNaN(bVal)) return match;
      
      let A = 1;
      if (parts.length >= 4) {
        const alphaStr = parts[3];
        if (alphaStr.endsWith("%")) {
          A = parseFloat(alphaStr) / 100;
        } else {
          A = parseFloat(alphaStr);
        }
        if (isNaN(A)) A = 1;
      }
      
      const l_ = Math.pow(L + 0.3963377774 * aVal + 0.2158037573 * bVal, 3);
      const m_ = Math.pow(L - 0.1055613458 * aVal - 0.0638541728 * bVal, 3);
      const s_ = Math.pow(L - 0.0894841775 * aVal - 1.2914855480 * bVal, 3);
      
      const r_linear = 4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699294 * s_;
      const g_linear = -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_;
      const b_linear = -0.0041960863 * l_ - 0.7034186145 * m_ + 1.7076147010 * s_;
      
      const linearToSrgb = (x: number) => {
        if (isNaN(x)) return 0;
        return x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
      };
      
      const r = Math.max(0, Math.min(255, Math.round(linearToSrgb(r_linear) * 255)));
      const g = Math.max(0, Math.min(255, Math.round(linearToSrgb(g_linear) * 255)));
      const b = Math.max(0, Math.min(255, Math.round(linearToSrgb(b_linear) * 255)));
      
      return `rgba(${r}, ${g}, ${b}, ${A})`;
    } catch (err) {
      console.error("Erro ao converter oklab:", err);
      return match;
    }
  });

  return result;
}

export default function ManageMembers() {
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [viewingMember, setViewingMember] = useState<any | null>(null);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  const handleOpenFicha = (member: any) => {
    setViewingMember(member);
  };

  const handleCloseFicha = () => {
    setViewingMember(null);
  };
  const [roles, setRoles] = useState<any[]>([
    { id: "membro", label: "Membro", base: "membro" },
    { id: "lider", label: "Líder", base: "leader" },
    { id: "secretaria", label: "Secretaria", base: "secretary" },
    { id: "financeiro", label: "Financeiro", base: "financial" },
    { id: "editor", label: "Editor", base: "editor" },
    { id: "editor_edificado", label: "Editor Edificado Matrimônio", base: "editor_edificado" },
    { id: "editor_maf", label: "Editor Escola MAF", base: "editor_maf" },
    { id: "pastor", label: "Pastor", base: "admin" },
    { id: "obreiro", label: "Obreiro", base: "leader" },
    { id: "admin", label: "Administrador", base: "admin" },
  ]);

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    // Pessoal
    foto: "",
    nome: "",
    cpf: "",
    dataNascimento: "",
    sexo: "",
    estadoCivil: "",
    naturalidade: "",
    naturalidadeEstado: "",
    escolaridade: "",
    profissao: "",
    senha: "",
    // Contato
    email: "",
    telefone: "",
    whatsapp: "",
    // Endereço
    cep: "",
    rua: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    endereco: "",
    // Espiritual
    dataConversao: "",
    dataBatismoAguas: "",
    igrejaAnterior: "",
    membroDesde: "",
    cargosAnteriores: "",
    consagrado: "não",
    cargoConsagracao: "",
    // Família
    nomeConjuge: "",
    dataCasamento: "",
    dataNascimentoConjuge: "",
    cpfConjuge: "",
    celularConjuge: "",
    igrejaConjuge: "",
    conjugeConvertido: "não",
    conjugeBatizado: "não",
    temFilhos: "não",
    quantidadeFilhos: 0,
    listaFilhos: [] as { nome: string; dataNascimento: string; sexo: string }[],
    // Ministérios e Talentos
    ministeriosInteresse: [] as string[],
    talentos: "",
    observacoes: "",
    // Secretaria Ministerial
    categorias: [] as string[],
    cargos: [] as string[],
    camposAdicionais: [] as { id: string; titulo: string; valor: string }[],
    anotacoesSecretaria: "",
    // Status e Permissões
    status: "ativo",
    permissao: "membro",
  });

  useEffect(() => {
    const unsubRoles = onSnapshot(
      collection(db, "custom_roles"),
      (snapshot) => {
        if (!snapshot.empty) {
          const customRoles = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }));
          const defaultRoles = [
            {
              id: "membro",
              label: "Membro",
              base: "membro",
              isProtected: false,
            },
            { id: "lider", label: "Líder", base: "leader", isProtected: false },
            {
              id: "secretaria",
              label: "Secretaria",
              base: "secretary",
              isProtected: false,
            },
            {
              id: "financeiro",
              label: "Financeiro",
              base: "financial",
              isProtected: false,
            },
            {
              id: "editor",
              label: "Editor",
              base: "editor",
              isProtected: false,
            },
            {
              id: "editor_edificado",
              label: "Editor Edificado Matrimônio",
              base: "editor_edificado",
              isProtected: false,
            },
            {
              id: "editor_maf",
              label: "Editor Escola MAF",
              base: "editor_maf",
              isProtected: false,
            },
            {
              id: "pastor",
              label: "Pastor",
              base: "admin",
              isProtected: false,
            },
            {
              id: "obreiro",
              label: "Obreiro",
              base: "leader",
              isProtected: false,
            },
            {
              id: "admin",
              label: "Administrador",
              base: "admin",
              isProtected: false,
            },
          ];
          let merged = [...defaultRoles];
          customRoles.forEach((cr: any) => {
            if (cr.deleted) {
              merged = merged.filter((m) => m.id !== cr.id);
            } else if (!merged.find((m) => m.id === cr.id)) {
              merged.push(cr as any);
            } else {
              const index = merged.findIndex((m) => m.id === cr.id);
              if (index !== -1) merged[index] = { ...merged[index], ...cr };
            }
          });
          setRoles(merged);
        }
      },
      (error) => {
        console.warn("Erro ao ler custom_roles", error);
      },
    );

    const q = query(collection(db, "membros"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const membersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMembers(membersData);
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
      unsubRoles();
    };
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("A foto deve ter no máximo 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, foto: reader.result as string }));
        setErrorMessage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenModal = (member: any = null) => {
    setErrorMessage(null);

    if (member) {
      setEditingMember(member);
      setFormData({
        foto: member.foto || "",
        nome: member.nome || "",
        cpf: member.cpf || "",
        dataNascimento: member.dataNascimento || "",
        sexo: member.sexo || "",
        estadoCivil: member.estadoCivil || "",
        naturalidade: member.naturalidade || "",
        naturalidadeEstado: member.naturalidadeEstado || "",
        escolaridade: member.escolaridade || "",
        profissao: member.profissao || "",
        senha: member.senha || "",
        email: member.email || "",
        telefone: member.telefone || member.celular || "",
        whatsapp: member.whatsapp || "",
        cep: member.cep || "",
        rua: member.rua || "",
        numero: member.numero || "",
        complemento: member.complemento || "",
        bairro: member.bairro || "",
        cidade: member.cidade || "",
        estado: member.estado || "",
        endereco: member.endereco || "",
        dataConversao: member.dataConversao || "",
        dataBatismoAguas: member.dataBatismoAguas || "",
        igrejaAnterior: member.igrejaAnterior || "",
        membroDesde: member.membroDesde || "",
        cargosAnteriores: member.cargosAnteriores || "",
        consagrado: member.consagrado || "não",
        cargoConsagracao: member.cargoConsagracao || "",
        nomeConjuge: member.nomeConjuge || "",
        dataCasamento: member.dataCasamento || "",
        dataNascimentoConjuge: member.dataNascimentoConjuge || "",
        cpfConjuge: member.cpfConjuge || "",
        celularConjuge: member.celularConjuge || "",
        igrejaConjuge: member.igrejaConjuge || "",
        conjugeConvertido: member.conjugeConvertido || "não",
        conjugeBatizado: member.conjugeBatizado || "não",
        temFilhos: member.temFilhos || "não",
        quantidadeFilhos: member.quantidadeFilhos || 0,
        listaFilhos: member.listaFilhos || [],
        ministeriosInteresse: member.ministeriosInteresse || [],
        talentos: member.talentos || "",
        observacoes: member.observacoes || "",
        categorias: member.categorias || [],
        cargos: member.cargos || [],
        camposAdicionais: member.camposAdicionais || [],
        anotacoesSecretaria: member.anotacoesSecretaria || "",
        status: member.status || "ativo",
        permissao: member.permissao || "membro",
      });
    } else {
      setEditingMember(null);
      setFormData({
        foto: "",
        nome: "",
        cpf: "",
        dataNascimento: "",
        sexo: "",
        estadoCivil: "",
        naturalidade: "",
        naturalidadeEstado: "",
        escolaridade: "",
        profissao: "",
        senha: "",
        email: "",
        telefone: "",
        whatsapp: "",
        cep: "",
        rua: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidade: "",
        estado: "",
        endereco: "",
        dataConversao: "",
        dataBatismoAguas: "",
        igrejaAnterior: "",
        membroDesde: "",
        cargosAnteriores: "",
        consagrado: "não",
        cargoConsagracao: "",
        nomeConjuge: "",
        dataCasamento: "",
        dataNascimentoConjuge: "",
        cpfConjuge: "",
        celularConjuge: "",
        igrejaConjuge: "",
        conjugeConvertido: "não",
        conjugeBatizado: "não",
        temFilhos: "não",
        quantidadeFilhos: 0,
        listaFilhos: [],
        ministeriosInteresse: [],
        talentos: "",
        observacoes: "",
        categorias: [],
        cargos: [],
        camposAdicionais: [],
        anotacoesSecretaria: "",
        status: "ativo",
        permissao: "membro",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMember(null);
    setErrorMessage(null);
  };

  const [activeTab, setActiveTab] = useState("pessoal");
  const [novaCategoriaInput, setNovaCategoriaInput] = useState("");
  const [novoCargoInput, setNovoCargoInput] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      const selectedRole = roles.find((r) => r.id === formData.permissao);
      let role = selectedRole?.base || "membro"; // fallback

      const fullNome = formData.nome;

      if (editingMember) {
        let finalUid = editingMember.id;

        // Se a pessoa colocou uma senha no modo de edição e antes não tinha, podemos tentar criar o auth account se não existir (apenas se tiver senha)
        if (
          formData.email &&
          formData.senha &&
          (!editingMember.email || formData.senha !== editingMember.senha)
        ) {
          try {
            const secondaryApp = initializeApp(
              firebaseConfig,
              "SecondaryApp" + Date.now(),
            );
            const secondaryAuth = getAuth(secondaryApp);
            const userCredential = await createUserWithEmailAndPassword(
              secondaryAuth,
              formData.email,
              formData.senha,
            );
            finalUid = userCredential.user.uid;

            await secondaryAuth.signOut();

            // Se gerou um novo UID, precisamos transferir os dados do membro para o novo ID e excluir o antigo se for diferente (apenas se finalUid for diferente)
            if (finalUid !== editingMember.id) {
              await deleteDoc(doc(db, "membros", editingMember.id));
            }
          } catch (authError: any) {
            console.error("Erro ao criar credencial na edição:", authError);
            if (authError.code === "auth/email-already-in-use") {
              // Ignore since it might already exist, and we just proceed to update the existing docs
            } else {
              setErrorMessage("Erro ao criar login. Verifique o email/senha.");
              return;
            }
          }
        }

        const updateData = { ...formData };
        if (editingMember) {
          // Do not overwrite existing permissao if it exists (might be array)
          delete (updateData as any).permissao;
          
          await setDoc(doc(db, "membros", finalUid), {
            ...updateData,
            createdAt: editingMember.createdAt || Timestamp.now(),
            updatedAt: Timestamp.now(),
          }, { merge: true });

          // Atualizar também na tabela de usuários para sincronizar o nível de acesso
          if (formData.email) {
            await setDoc(
              doc(db, "users", finalUid),
              {
                nome: fullNome,
                email: formData.email,
                status: formData.status,
                updatedAt: Timestamp.now(),
              },
              { merge: true },
            );
          }
        } else {
          // New Member - initialize arrays
          updateData.permissao = ["membro"] as any;
          if (formData.email && formData.senha) {
            try {
              const secondaryApp = initializeApp(
                firebaseConfig,
                "SecondaryApp" + Date.now(),
              );
              const secondaryAuth = getAuth(secondaryApp);
              const userCredential = await createUserWithEmailAndPassword(
                secondaryAuth,
                formData.email,
                formData.senha,
              );
              const uid = userCredential.user.uid;

              await setDoc(doc(db, "users", uid), {
                nome: fullNome,
                email: formData.email,
                role: ["membro"],
                papel: ["membro"],
                status: formData.status,
                createdAt: Timestamp.now(),
              });

              await setDoc(doc(db, "membros", uid), {
                ...updateData,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
              });

              await secondaryAuth.signOut();
            } catch (authError: any) {
              console.error("Erro ao criar credencial:", authError);
              if (authError.code === "auth/email-already-in-use") {
                // Try to find the user by email in the users collection and use its ID
                const q = query(
                  collection(db, "users"),
                  where("email", "==", formData.email)
                );
                const snapshot = await getDocs(q);
                
                if (!snapshot.empty) {
                  const existingUid = snapshot.docs[0].id;
                  
                  await setDoc(doc(db, "users", existingUid), {
                    nome: fullNome,
                    email: formData.email,
                    role: ["membro"],
                    papel: ["membro"],
                    status: formData.status,
                    updatedAt: Timestamp.now(),
                  }, { merge: true });

                  await setDoc(doc(db, "membros", existingUid), {
                    ...updateData,
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now(),
                  }, { merge: true });
                } else {
                  setErrorMessage(
                    "O e-mail informado já está cadastrado no Firebase Auth, mas não foi encontrado no banco de dados."
                  );
                  return;
                }
              } else {
                setErrorMessage("Erro ao criar login: " + authError.message);
                return;
              }
            }
          } else {
            await addDoc(collection(db, "membros"), {
              ...updateData,
              createdAt: Timestamp.now(),
              updatedAt: Timestamp.now(),
            });
          }
        }
      }
      handleCloseModal();
    } catch (error: any) {
      console.error("Erro ao salvar membro:", error);
      setErrorMessage(
        "Houve um erro ao salvar o membro. " + (error?.message || ""),
      );
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

  const handleChildChange = (index: number, field: string, value: string) => {
    const newList = [...formData.listaFilhos];
    newList[index] = { ...newList[index], [field]: value };
    setFormData({ ...formData, listaFilhos: newList });
  };

  const handleCheckboxChange = (value: string, checked: boolean) => {
    const ministerios = [...formData.ministeriosInteresse];
    if (checked) {
      ministerios.push(value);
    } else {
      const index = ministerios.indexOf(value);
      if (index > -1) ministerios.splice(index, 1);
    }
    setFormData({ ...formData, ministeriosInteresse: ministerios });
  };

  const handleApproveMember = async (memberId: string) => {
    try {
      const memberSnap = await getDoc(doc(db, "membros", memberId));
      const memberData = memberSnap.data();

      // 1. Update in members collection
      await updateDoc(doc(db, "membros", memberId), {
        status: "ativo",
        permissao: "membro", // Ensure permission is set
        updatedAt: Timestamp.now(),
      });
      
      // 2. Update or Create in users collection to ensure access
      await setDoc(doc(db, "users", memberId), {
        nome: memberData?.nome || "Membro",
        email: memberData?.email || "",
        status: "ativo",
        role: "membro", // Ensure role is set
        updatedAt: Timestamp.now(),
      }, { merge: true });
      
      alert("Membro aprovado com sucesso! Agora ele já pode acessar o sistema.");
    } catch (error: any) {
      console.error("Erro ao aprovar membro:", error);
      alert("Erro ao aprovar membro: " + error.message);
    }
  };

  const confirmDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await deleteDoc(doc(db, "membros", deleteConfirmId));

      // Attempt to delete from users as well, if it exists
      try {
        await deleteDoc(doc(db, "users", deleteConfirmId));
      } catch (e) {
        // Ignore if error or not in users
      }

      setDeleteConfirmId(null);
    } catch (error: any) {
      console.error("Erro ao excluir membro:", error);
      alert("Houve um erro ao excluir o membro: " + error.message);
      setDeleteConfirmId(null);
    }
  };

  const filteredMembers = members.filter(
    (member) =>
      (member.nome || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.email || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="bg-white rounded-[14px] border-[1.5px] border-[#c8d8e8] shadow-sm flex flex-col w-full h-full min-h-[500px]">
      <div className="p-4 sm:p-6 border-b border-[#c8d8e8] flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <div>
          <h2 className="text-xl font-bold font-serif text-primary-dark">
            Membros da Igreja
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Gerencie o cadastro de membros
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={() => {
              const url = window.location.origin + "/cadastro-membro";
              const text = `Olá! Segue o link para realizar o seu cadastro de membro: ${url}`;
              window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
            }}
            className="flex items-center gap-2 bg-white border-2 border-[#25D366] text-[#25D366] hover:bg-green-50 px-4 py-2.5 rounded-lg font-bold transition duration-200"
            title="Compartilhar via WhatsApp"
          >
            <Users size={18} /> Compartilhar Ficha
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handleOpenModal();
            }}
            className="flex items-center gap-2 bg-primary-base hover:bg-primary-dark text-white px-6 py-2.5 rounded-lg font-bold transition duration-200 shadow-lg shadow-primary-base/20 active:scale-95"
          >
            <Plus size={20} /> Novo Membro
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6 pb-2">
        <div className="relative max-w-md w-full">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-[#f7fafd] border border-[#c8d8e8] rounded-lg text-sm text-primary-dark focus:border-primary-base focus:ring-2 focus:ring-primary-base/10 outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-x-auto p-4 sm:p-6 pt-0 custom-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center h-48 text-gray-500">
            Carregando membros...
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-gray-500 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
            <Users size={32} className="text-gray-400 mb-3" />
            <p className="font-medium text-gray-600">
              Nenhum membro encontrado
            </p>
            <p className="text-sm">
              Tente ajustar a sua busca ou adicione um novo membro.
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[#f0f6fb] border-b border-[#c8d8e8]">
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                  Nome
                </th>
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                  Contato
                </th>
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                  Nascimento
                </th>
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                  Perfil/Permissão
                </th>
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr
                  key={member.id}
                  className="border-b border-gray-100 hover:bg-[#f7fafd]/40 transition duration-150"
                >
                  <td className="py-3.5 px-4 font-bold text-gray-900 text-sm">
                    {member.nome}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-gray-600">
                    <div className="font-semibold">{member.email || "-"}</div>
                    <div className="text-gray-400 mt-0.5">{member.telefone || member.whatsapp || "-"}</div>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-gray-500 font-medium whitespace-nowrap">
                    {member.dataNascimento || "-"}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-md text-[9px] bg-sky-50 text-[#1a6496] font-bold uppercase tracking-wider border border-sky-200">
                      {Array.isArray(member.permissao) ? member.permissao.join(', ') : member.permissao || "Membro"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        member.status === "ativo"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : member.status === "pendente_aprovacao"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {member.status === "pendente_aprovacao" ? "Pendente" : member.status || "Ativo"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                    {member.status === "pendente_aprovacao" && (
                      <button
                        onClick={() => handleApproveMember(member.id)}
                        className="p-1 px-2.5 bg-emerald-50 border border-emerald-250 text-emerald-700 hover:bg-emerald-100 rounded-lg transition inline-flex items-center gap-1 text-xs font-bold"
                        title="Aprovar Membro"
                      >
                        <Check size={14} /> <span className="text-[10px]">Aprovar</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenFicha(member)}
                      className="p-1.5 text-[#1a6496] hover:bg-[#1a6496]/5 rounded-lg transition"
                      title="Visualizar Ficha Completa"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleOpenModal(member)}
                      className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                      title="Editar Cadastro"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => confirmDelete(member.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                      title="Remover"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-primary-dark/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden"
            >
              <div className="bg-[#f7fafd] border-b border-[#c8d8e8]">
                <div className="px-6 py-4 flex justify-between items-center">
                  <h3 className="font-bold font-serif text-lg text-primary-dark">
                    {editingMember ? "Ficha do Membro" : "Novo Membro"}
                  </h3>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-500 hover:text-gray-800 transition p-1"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="px-6 flex gap-4 overflow-x-auto custom-scrollbar no-scrollbar-buttons pb-1">
                  {[
                    { id: "pessoal", label: "Pessoal" },
                    { id: "contato", label: "Contato / Endereço" },
                    { id: "espiritual", label: "Cristã" },
                    { id: "familia", label: "Família" },
                    { id: "servico", label: "Serviço" },
                    { id: "ministerial", label: "Ministerial" },
                    { id: "sistema", label: "Sistema" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`pb-3 text-xs font-bold uppercase tracking-widest whitespace-nowrap border-b-2 transition-all ${
                        activeTab === tab.id
                          ? "border-primary-base text-primary-base"
                          : "border-transparent text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col h-[600px] max-h-[80vh]">
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                  {errorMessage && (
                    <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
                      {errorMessage}
                    </div>
                  )}

                  {/* PESSOAL */}
                  {activeTab === "pessoal" && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {formData.foto ? (
                            <img src={formData.foto} alt="Foto" className="w-full h-full object-cover" />
                          ) : (
                            <User size={24} className="text-gray-300" />
                          )}
                        </div>
                        <div className="flex-1">
                          <label htmlFor="modal-foto" className="inline-block px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors">
                            Escolher Foto
                          </label>
                          <input
                            type="file"
                            id="modal-foto"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                          />
                          <p className="text-[10px] text-gray-400 mt-1">Até 5MB. JPEGs ou PNGs.</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Nome Completo*</label>
                          <input type="text" required value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} className="modal-input" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">CPF</label>
                          <input type="text" value={formData.cpf} onChange={(e) => setFormData({ ...formData, cpf: e.target.value })} className="modal-input" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Nascimento*</label>
                          <input type="text" required placeholder="dd/mm/aaaa" value={formData.dataNascimento} onChange={(e) => setFormData({ ...formData, dataNascimento: e.target.value })} className="modal-input" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Sexo</label>
                          <select value={formData.sexo} onChange={(e) => setFormData({ ...formData, sexo: e.target.value })} className="modal-input">
                            <option value="">Selecione</option>
                            <option value="Masculino">Masculino</option>
                            <option value="Feminino">Feminino</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Estado Civil*</label>
                          <select required value={formData.estadoCivil} onChange={(e) => setFormData({ ...formData, estadoCivil: e.target.value })} className="modal-input">
                            <option value="">Selecione</option>
                            <option value="Solteiro(a)">Solteiro(a)</option>
                            <option value="Casado(a)">Casado(a)</option>
                            <option value="Divorciado(a)">Divorciado(a)</option>
                            <option value="Viúvo(a)">Viúvo(a)</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Escolaridade*</label>
                          <input type="text" required value={formData.escolaridade} onChange={(e) => setFormData({ ...formData, escolaridade: e.target.value })} className="modal-input" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Profissão*</label>
                          <input type="text" required value={formData.profissao} onChange={(e) => setFormData({ ...formData, profissao: e.target.value })} className="modal-input" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Naturalidade*</label>
                        <div className="flex gap-2">
                          <input type="text" required placeholder="Cidade" value={formData.naturalidade} onChange={(e) => setFormData({ ...formData, naturalidade: e.target.value })} className="modal-input" style={{ flex: 1, minWidth: 0 }} />
                          <select required value={formData.naturalidadeEstado} onChange={(e) => setFormData({ ...formData, naturalidadeEstado: e.target.value })} className="modal-input" style={{ width: '100px', flex: 'none' }}>
                            <option value="">UF</option>
                            <option value="AC">AC</option>
                            <option value="AL">AL</option>
                            <option value="AP">AP</option>
                            <option value="AM">AM</option>
                            <option value="BA">BA</option>
                            <option value="CE">CE</option>
                            <option value="DF">DF</option>
                            <option value="ES">ES</option>
                            <option value="GO">GO</option>
                            <option value="MA">MA</option>
                            <option value="MT">MT</option>
                            <option value="MS">MS</option>
                            <option value="MG">MG</option>
                            <option value="PA">PA</option>
                            <option value="PB">PB</option>
                            <option value="PR">PR</option>
                            <option value="PE">PE</option>
                            <option value="PI">PI</option>
                            <option value="RJ">RJ</option>
                            <option value="RN">RN</option>
                            <option value="RS">RS</option>
                            <option value="RO">RO</option>
                            <option value="RR">RR</option>
                            <option value="SC">SC</option>
                            <option value="SP">SP</option>
                            <option value="SE">SE</option>
                            <option value="TO">TO</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CONTATO & ENDEREÇO */}
                  {activeTab === "contato" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Email Principal</label>
                          <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="modal-input" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Celular*</label>
                          <input type="tel" required value={formData.telefone} onChange={(e) => setFormData({ ...formData, telefone: e.target.value })} className="modal-input" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">WhatsApp</label>
                          <input type="tel" value={formData.whatsapp} onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })} className="modal-input" />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">CEP</label>
                          <input type="text" value={formData.cep} onChange={(e) => setFormData({ ...formData, cep: e.target.value })} className="modal-input" />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Rua</label>
                          <input type="text" value={formData.rua} onChange={(e) => setFormData({ ...formData, rua: e.target.value })} className="modal-input" />
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Nº</label>
                          <input type="text" value={formData.numero} onChange={(e) => setFormData({ ...formData, numero: e.target.value })} className="modal-input" />
                        </div>
                        <div className="col-span-3">
                          <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Bairro</label>
                          <input type="text" value={formData.bairro} onChange={(e) => setFormData({ ...formData, bairro: e.target.value })} className="modal-input" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Cidade</label>
                          <input type="text" value={formData.cidade} onChange={(e) => setFormData({ ...formData, cidade: e.target.value })} className="modal-input" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Estado</label>
                          <input type="text" value={formData.estado} onChange={(e) => setFormData({ ...formData, estado: e.target.value })} className="modal-input" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* VIDA CRISTA */}
                  {activeTab === "espiritual" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Conversão</label>
                          <input type="text" placeholder="dd/mm/aaaa" value={formData.dataConversao} onChange={(e) => setFormData({ ...formData, dataConversao: e.target.value })} className="modal-input" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Batismo</label>
                          <input type="text" placeholder="dd/mm/aaaa" value={formData.dataBatismoAguas} onChange={(e) => setFormData({ ...formData, dataBatismoAguas: e.target.value })} className="modal-input" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Igreja Anterior</label>
                          <input type="text" value={formData.igrejaAnterior} onChange={(e) => setFormData({ ...formData, igrejaAnterior: e.target.value })} className="modal-input" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Cargos Anteriores</label>
                          <textarea rows={2} value={formData.cargosAnteriores} onChange={(e) => setFormData({ ...formData, cargosAnteriores: e.target.value })} className="modal-input resize-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Membro Desde</label>
                          <input type="text" placeholder="dd/mm/aaaa" value={formData.membroDesde} onChange={(e) => setFormData({ ...formData, membroDesde: e.target.value })} className="modal-input" />
                        </div>
                        <div className="pt-2 border-t">
                          <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Consagração Ministerial?</label>
                          <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer text-sm">
                              <input type="radio" value="sim" checked={formData.consagrado === "sim"} onChange={(e) => setFormData({ ...formData, consagrado: e.target.value })} className="w-4 h-4 text-primary-base focus:ring-primary-base rounded" />
                              <span>Sim</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer text-sm">
                              <input type="radio" value="não" checked={formData.consagrado === "não"} onChange={(e) => setFormData({ ...formData, consagrado: e.target.value })} className="w-4 h-4 text-primary-base focus:ring-primary-base rounded" />
                              <span>Não</span>
                            </label>
                          </div>
                        </div>
                        {formData.consagrado === "sim" && (
                          <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Qual a Consagração?</label>
                            <input type="text" list="consagracoesList" placeholder="Selecione ou digite..." value={formData.cargoConsagracao} onChange={(e) => setFormData({ ...formData, cargoConsagracao: e.target.value })} className="modal-input" />
                            <datalist id="consagracoesList">
                              <option value="Diácono / Diaconisa" />
                              <option value="Presbítero" />
                              <option value="Evangelista" />
                              <option value="Missionário(a)" />
                              <option value="Pastor(a)" />
                              <option value="Bispo(a)" />
                              <option value="Apóstolo(a)" />
                            </datalist>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* FAMILIA */}
                  {activeTab === "familia" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Nome Cônjuge</label>
                        <input type="text" value={formData.nomeConjuge} onChange={(e) => setFormData({ ...formData, nomeConjuge: e.target.value })} className="modal-input" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Nascimento Cônjuge</label>
                          <input type="text" placeholder="dd/mm/aaaa" value={formData.dataNascimentoConjuge} onChange={(e) => setFormData({ ...formData, dataNascimentoConjuge: e.target.value })} className="modal-input" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Data Casamento</label>
                          <input type="text" placeholder="dd/mm/aaaa" value={formData.dataCasamento} onChange={(e) => setFormData({ ...formData, dataCasamento: e.target.value })} className="modal-input" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Celular Cônjuge</label>
                          <input type="text" placeholder="(00) 00000-0000" value={formData.celularConjuge} onChange={(e) => setFormData({ ...formData, celularConjuge: e.target.value })} className="modal-input" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Igreja do Cônjuge</label>
                          <input type="text" placeholder="Igreja" value={formData.igrejaConjuge} onChange={(e) => setFormData({ ...formData, igrejaConjuge: e.target.value })} className="modal-input" />
                        </div>
                      </div>
                       <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">O Cônjuge é Convertido?</label>
                          <select value={formData.conjugeConvertido} onChange={(e) => setFormData({ ...formData, conjugeConvertido: e.target.value })} className="modal-input">
                            <option value="não">Não</option>
                            <option value="sim">Sim</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">O Cônjuge é Batizado?</label>
                          <select value={formData.conjugeBatizado} onChange={(e) => setFormData({ ...formData, conjugeBatizado: e.target.value })} className="modal-input">
                            <option value="não">Não</option>
                            <option value="sim">Sim</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <label className="text-xs font-bold text-gray-600">Possui Filhos?</label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" value="sim" checked={formData.temFilhos === "sim"} onChange={(e) => setFormData({ ...formData, temFilhos: e.target.value })} className="w-4 h-4 text-primary-base" />
                            <span className="text-sm">Sim</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" value="não" checked={formData.temFilhos === "não"} onChange={(e) => setFormData({ ...formData, temFilhos: e.target.value })} className="w-4 h-4 text-primary-base" />
                            <span className="text-sm">Não</span>
                          </label>
                        </div>
                      </div>
                      
                      {formData.temFilhos === "sim" && (
                        <div className="bg-gray-50 p-4 rounded-xl space-y-4">
                           {formData.listaFilhos.map((f, i) => (
                             <div key={i} className="grid grid-cols-3 gap-2 pb-2 border-b last:border-0">
                               <input type="text" placeholder="Nome" value={f.nome} onChange={(e) => handleChildChange(i, "nome", e.target.value)} className="modal-input !py-1 !text-xs" />
                               <input type="text" placeholder="Nasc." value={f.dataNascimento} onChange={(e) => handleChildChange(i, "dataNascimento", e.target.value)} className="modal-input !py-1 !text-xs" />
                               <select value={f.sexo} onChange={(e) => handleChildChange(i, "sexo", e.target.value)} className="modal-input !py-1 !text-xs">
                                 <option value="">Sexo</option>
                                 <option value="M">M</option>
                                 <option value="F">F</option>
                               </select>
                             </div>
                           ))}
                           <button type="button" onClick={() => setFormData({ ...formData, listaFilhos: [...formData.listaFilhos, { nome: "", dataNascimento: "", sexo: "" }] })} className="text-[10px] font-black text-primary-base uppercase hover:underline">+ Adicionar Filho</button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* SERVICO */}
                  {activeTab === "servico" && (
                    <div className="space-y-4">
                       <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Áreas de Interesse</label>
                       <div className="grid grid-cols-2 gap-2">
                         {ministeriosOptions.map((opt) => (
                           <label key={opt} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg cursor-pointer">
                             <input type="checkbox" checked={formData.ministeriosInteresse.includes(opt)} onChange={(e) => handleCheckboxChange(opt, e.target.checked)} className="w-3.5 h-3.5 text-primary-base" />
                             <span className="text-[11px] font-medium text-gray-600">{opt}</span>
                           </label>
                         ))}
                       </div>
                       <div className="pt-4 space-y-4">
                         <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Talentos / Habilidades</label>
                            <textarea rows={2} value={formData.talentos} onChange={(e) => setFormData({ ...formData, talentos: e.target.value })} className="modal-input resize-none" />
                         </div>
                         <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Observações Privadas</label>
                            <textarea rows={2} value={formData.observacoes} onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })} className="modal-input resize-none" />
                         </div>
                       </div>
                    </div>
                  )}

                  {/* MINISTERIAL */}
                  {activeTab === "ministerial" && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1 border-b pb-1">Categorias</label>
                        <div className="flex gap-2 mb-3">
                          <input type="text" placeholder="Adicionar nova categoria..." value={novaCategoriaInput} onChange={(e) => setNovaCategoriaInput(e.target.value)} className="modal-input flex-1 !py-1.5" />
                          <button type="button" onClick={() => {
                            if (novaCategoriaInput.trim()) {
                              setFormData({ ...formData, categorias: [...formData.categorias, novaCategoriaInput.trim()] });
                              setNovaCategoriaInput("");
                            }
                          }} className="px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-200">
                            Adicionar
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {Array.from(new Set([...["Congregado", "Membro Afastado", "Membro Ativo", "Novo Convertido", "Visitante"], ...formData.categorias])).map((cat) => (
                            <label key={cat} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg cursor-pointer">
                              <input type="checkbox" checked={formData.categorias.includes(cat)} onChange={(e) => {
                                const newCats = e.target.checked ? [...formData.categorias, cat] : formData.categorias.filter((c) => c !== cat);
                                setFormData({ ...formData, categorias: newCats });
                              }} className="w-3.5 h-3.5 text-primary-base rounded" />
                              <span className="text-[11px] font-medium text-gray-600">{cat}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1 border-b pb-1">Cargos</label>
                        <div className="flex gap-2 mb-3">
                          <input type="text" placeholder="Adicionar novo cargo..." value={novoCargoInput} onChange={(e) => setNovoCargoInput(e.target.value)} className="modal-input flex-1 !py-1.5" />
                          <button type="button" onClick={() => {
                            if (novoCargoInput.trim()) {
                              setFormData({ ...formData, cargos: [...formData.cargos, novoCargoInput.trim()] });
                              setNovoCargoInput("");
                            }
                          }} className="px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-200">
                            Adicionar
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {Array.from(new Set([
                            "Coordenador de Ministério", "Líder de Departamento", "Líder de Ministério", "Professor",
                            "Músico", "Tesoureiro(a)", "Secretário(a)", "Líder de Célula", "Missionário", "Evangelista",
                            "Obreiro", "Diácono", "Presbítero", "Pastor", "Pastor Auxiliar", "Pastor Presidente",
                            ...formData.cargos
                          ])).map((cargo) => (
                            <label key={cargo} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg cursor-pointer">
                              <input type="checkbox" checked={formData.cargos.includes(cargo)} onChange={(e) => {
                                const newCargos = e.target.checked ? [...formData.cargos, cargo] : formData.cargos.filter((c) => c !== cargo);
                                setFormData({ ...formData, cargos: newCargos });
                              }} className="w-3.5 h-3.5 text-primary-base rounded" />
                              <span className="text-[11px] font-medium text-gray-600">{cargo}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2 pb-1 border-b">
                          <label className="block text-[10px] font-black text-gray-400 uppercase ml-1">+ Campos adicionais</label>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                camposAdicionais: [...formData.camposAdicionais, { id: Math.random().toString(36).substring(7), titulo: "", valor: "" }]
                              });
                            }}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-md"
                          >
                            Adicionar
                          </button>
                        </div>
                        {formData.camposAdicionais && formData.camposAdicionais.length > 0 && (
                          <div className="space-y-3 mb-4">
                            {formData.camposAdicionais.map((campo, index) => (
                              <div key={campo.id || index} className="p-3 bg-gray-50 border border-gray-100 rounded-xl relative group">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newCampos = formData.camposAdicionais.filter((_, i) => i !== index);
                                    setFormData({ ...formData, camposAdicionais: newCampos });
                                  }}
                                  className="absolute -top-2 -right-2 bg-red-100 text-red-500 rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-sm hover:bg-red-200"
                                >
                                  <X size={12} />
                                </button>
                                <div className="space-y-2">
                                  <input
                                    type="text"
                                    placeholder="Nome do Campo (ex: Outros Ministérios)"
                                    value={campo.titulo}
                                    onChange={(e) => {
                                      const newCampos = [...formData.camposAdicionais];
                                      newCampos[index].titulo = e.target.value;
                                      setFormData({ ...formData, camposAdicionais: newCampos });
                                    }}
                                    className="modal-input !text-xs !py-1.5 !bg-white"
                                  />
                                  <div className="flex bg-red-50 text-red-600 text-[9px] font-bold p-1.5 rounded-t-lg border border-red-200 border-b-0 items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                      <AlertCircle size={10} />
                                      Visível para a pessoa
                                    </div>
                                  </div>
                                  <textarea
                                    rows={2}
                                    placeholder="Conteúdo do campo..."
                                    value={campo.valor}
                                    onChange={(e) => {
                                      const newCampos = [...formData.camposAdicionais];
                                      newCampos[index].valor = e.target.value;
                                      setFormData({ ...formData, camposAdicionais: newCampos });
                                    }}
                                    className="modal-input !text-xs !rounded-t-none border-red-200 resize-none focus:border-red-400 !bg-white"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1 flex items-center gap-2">
                          Anotações Relevantes
                        </label>
                        <div className="bg-red-50 text-red-600 text-[10px] font-bold p-2 rounded-t-lg border border-red-200 border-b-0 flex items-center gap-2">
                          <AlertCircle size={14} />
                          Atenção: o conteúdo deste campo pode ser visualizado pela própria pessoa.
                        </div>
                        <textarea rows={4} value={formData.anotacoesSecretaria} onChange={(e) => setFormData({ ...formData, anotacoesSecretaria: e.target.value })} className="modal-input !rounded-t-none border-red-200 resize-none focus:border-red-400" />
                      </div>
                    </div>
                  )}

                  {/* SISTEMA */}
                  {activeTab === "sistema" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Status</label>
                          <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="modal-input">
                            <option value="ativo">Ativo</option>
                            <option value="pendente_aprovacao">Pendente</option>
                            <option value="inativo">Inativo</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Permissão / Perfil</label>
                          <div className="modal-input bg-gray-50 flex items-center text-xs text-gray-500 italic">
                             Acesse "Níveis de Permissão" no menu para alterar.
                          </div>
                        </div>
                      </div>
                      <div className="pt-4 border-t">
                         <label className="block text-[10px] font-black text-primary-base uppercase mb-1 ml-1">Senha de Acesso ao Painel</label>
                         <input type="text" placeholder="Alterar senha..." value={formData.senha} onChange={(e) => setFormData({ ...formData, senha: e.target.value })} className="modal-input border-primary-base/30 bg-primary-base/5" />
                         <p className="text-[9px] text-gray-400 mt-2 px-1">
                           * Se o membro já possui acesso, alterar este campo mudará a senha dele. Se não possui, definirá a primeira senha.
                         </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-6 border-t bg-gray-50 flex justify-between items-center">
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    Preencha as etapas acima
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-6 py-2.5 font-bold text-gray-500 hover:bg-gray-200 rounded-xl transition"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-8 py-2.5 bg-primary-base hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg shadow-primary-base/20 transition flex items-center gap-2"
                    >
                      <Check size={18} /> Salvar Alterações
                    </button>
                  </div>
                </div>
              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 bg-primary-dark/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl w-full max-w-sm shadow-xl p-6 text-center"
            >
              <Trash2
                size={48}
                className="mx-auto text-red-500 mb-4 opacity-80"
              />
              <h3 className="font-bold text-lg text-primary-dark mb-2">
                Excluir Membro
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                Tem certeza que deseja remover este membro? Esta ação não pode
                ser desfeita.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 font-bold text-gray-500 hover:bg-gray-100 rounded-md transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-md transition"
                >
                  Sim, Excluir
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewingMember && (
          <div className="fixed inset-0 bg-primary-dark/55 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col h-[90vh]"
            >
              <div className="bg-[#f7fafd] border-b border-[#c8d8e8] px-6 py-4 flex flex-col md:flex-row justify-between md:items-center gap-4 no-print flex-shrink-0">
                <div className="flex items-center gap-2">
                  <User size={22} className="text-[#1a6496]" />
                  <h3 className="font-bold font-serif text-lg text-primary-dark">
                    Ficha de Membro Oficial
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const memberToEdit = viewingMember;
                      handleCloseFicha();
                      handleOpenModal(memberToEdit);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-bold transition cursor-pointer"
                  >
                    <Edit2 size={13} /> Editar Dados
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const element = document.getElementById("print-membro-ficha-viewport");
                      if (!element) return;

                      // Create a hidden helper iframe securely inside same origin
                      const iframe = document.createElement("iframe");
                      iframe.style.position = "fixed";
                      iframe.style.right = "0";
                      iframe.style.bottom = "0";
                      iframe.style.width = "0";
                      iframe.style.height = "0";
                      iframe.style.border = "0";
                      iframe.setAttribute("id", "print-helper-iframe");
                      document.body.appendChild(iframe);

                      const iframeDoc = iframe.contentWindow?.document || iframe.contentDocument;
                      if (!iframeDoc) {
                        alert("Não foi possível iniciar a visualização de impressão no seu navegador.");
                        return;
                      }

                      // Load style definitions present on current view
                      let cssText = "";
                      try {
                        for (const sheet of Array.from(document.styleSheets)) {
                          try {
                            for (const rule of Array.from(sheet.cssRules)) {
                              cssText += rule.cssText + "\n";
                            }
                          } catch (e) {
                            // Cross-origin styles read protection safe skip
                          }
                        }
                      } catch (err) {
                        console.error("Erro ao extrair estilos:", err);
                      }

                      const cleanedCss = cleanOklchInCss(cssText);

                      iframeDoc.open();
                      iframeDoc.write(`
                        <!DOCTYPE html>
                        <html>
                        <head>
                          <title>Ficha de Membro Oficial - ${viewingMember.nome}</title>
                          <style>
                            ${cleanedCss}
                            @page {
                              size: A4;
                              margin: 15mm;
                            }
                            body {
                              background: white !important;
                              color: black !important;
                              font-family: ui-sans-serif, system-ui, -apple-system, sans-serif !important;
                              padding: 0 !important;
                              margin: 0 !important;
                            }
                            * {
                              -webkit-print-color-adjust: exact !important;
                              print-color-adjust: exact !important;
                            }
                            #print-membro-ficha-viewport {
                              border: none !important;
                              box-shadow: none !important;
                              padding: 0 !important;
                              margin: 0 auto !important;
                            }
                          </style>
                        </head>
                        <body class="bg-white">
                          <div style="width: 100%; max-width: 800px; margin: 0 auto; padding: 10px;">
                            ${element.innerHTML}
                          </div>
                        </body>
                        </html>
                      `);
                      iframeDoc.close();

                      setTimeout(() => {
                        if (iframe.contentWindow) {
                          iframe.contentWindow.focus();
                          iframe.contentWindow.print();
                          setTimeout(() => {
                            document.body.removeChild(iframe);
                          }, 1500);
                        }
                      }, 600);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 border border-sky-200 text-sky-700 hover:bg-sky-100 rounded-lg text-xs font-bold transition cursor-pointer"
                  >
                    <Eye size={13} /> Imprimir Ficha
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      setIsExportingPDF(true);
                      try {
                        const jsPDFModule = await import("jspdf");
                        const jsPDFClass = jsPDFModule.jsPDF || jsPDFModule.default;
                        const html2canvasModule = await import("html2canvas");
                        const html2canvas = (html2canvasModule.default || html2canvasModule) as any;
                        
                        const originalElement = document.getElementById("print-membro-ficha-viewport");
                        if (!originalElement) return;

                        // Extract and clean styles from parent document to avoid html2canvas OKLCH crash
                        let rawCss = "";
                        try {
                          for (const sheet of Array.from(document.styleSheets)) {
                            try {
                              for (const rule of Array.from(sheet.cssRules)) {
                                rawCss += rule.cssText + "\n";
                              }
                            } catch (e) {
                              // Cross-origin styles protection skip
                            }
                          }
                        } catch (err) {
                          console.error("Erro ao extrair estilos para PDF:", err);
                        }
                        const cleanedCss = cleanOklchInCss(rawCss);

                        // Create a hidden helper iframe securely inside same origin to render html2canvas nicely
                        const iframe = document.createElement("iframe");
                        iframe.style.position = "absolute";
                        iframe.style.left = "-9999px";
                        iframe.style.top = "-9999px";
                        iframe.style.width = "750px"; 
                        iframe.style.height = "auto";
                        iframe.style.border = "0";
                        document.body.appendChild(iframe);
                        
                        const iframeDoc = iframe.contentWindow?.document || iframe.contentDocument;
                        if (!iframeDoc) {
                          throw new Error("Não foi possível acessar o documento do iframe para geração de PDF.");
                        }

                        // Write cleaned content to the offscreen iframe
                        iframeDoc.open();
                        iframeDoc.write(`
                          <!DOCTYPE html>
                          <html>
                          <head>
                            <meta charset="utf-8">
                            <title>Ficha de Membro Oficial</title>
                            <style>
                              ${cleanedCss}
                              body {
                                background: white !important;
                                color: black !important;
                                font-family: ui-sans-serif, system-ui, -apple-system, sans-serif !important;
                                padding: 0 !important;
                                margin: 0 !important;
                              }
                              #print-membro-ficha-viewport {
                                border: none !important;
                                box-shadow: none !important;
                                padding: 0 !important;
                                margin: 0 auto !important;
                              }
                            </style>
                          </head>
                          <body class="bg-white">
                            <div id="print-membro-ficha-viewport" style="width: 100%; max-width: 750px; margin: 0 auto; padding: 20px;">
                              ${originalElement.innerHTML}
                            </div>
                          </body>
                          </html>
                        `);
                        iframeDoc.close();

                        // Timeout to lay out elements inside the iframe
                        await new Promise((resolve) => setTimeout(resolve, 350));

                        const targetElement = iframeDoc.getElementById("print-membro-ficha-viewport");
                        if (!targetElement) {
                          throw new Error("Elemento do visualizador não encontrado para renderização do canvas.");
                        }

                        const canvas = await html2canvas(targetElement, {
                          scale: 2, // Retinal display rendering quality
                          useCORS: true,
                          allowTaint: true,
                          backgroundColor: "#ffffff",
                          logging: false,
                          window: iframe.contentWindow || window,
                          document: iframeDoc
                        });
                        
                        // Clean up offscreen iframe
                        document.body.removeChild(iframe);
                        
                        const imgData = canvas.toDataURL("image/png");
                        const pdf = new jsPDFClass("p", "mm", "a4");
                        const imgWidth = 210;
                        const pageHeight = 297;
                        const imgHeight = (canvas.height * imgWidth) / canvas.width;
                        let heightLeft = imgHeight;
                        let position = 0;
                        
                        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
                        heightLeft -= pageHeight;
                        
                        while (heightLeft >= 0) {
                          position = heightLeft - imgHeight;
                          pdf.addPage();
                          pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
                          heightLeft -= pageHeight;
                        }
                        
                        const fileName = `ficha-membro-${viewingMember.nome.toLowerCase().replace(/\s+/g, "-")}.pdf`;
                        pdf.save(fileName);
                      } catch (err) {
                        console.error("Erro ao gerar PDF:", err);
                        alert("Houve uma falha ao renderizar o PDF de forma automatizada. Você pode usar a opção de Imprimir e escolher 'Salvar como PDF' na caixa de diálogo de impressão.");
                      } finally {
                        setIsExportingPDF(false);
                      }
                    }}
                    disabled={isExportingPDF}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition disabled:opacity-50 cursor-pointer"
                  >
                    {isExportingPDF ? "Gerando..." : "Baixar PDF"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseFicha}
                    className="text-gray-500 hover:text-gray-800 transition p-1 cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar bg-gray-50 bg-[#fbfcfd]" id="membro-ficha-container-scroll">
                <div
                  id="print-membro-ficha-viewport"
                  className="bg-white border border-gray-200 rounded-2xl p-6 md:p-10 max-w-3xl mx-auto shadow-sm text-gray-800 leading-relaxed font-sans animate-fade-in"
                >
                  <div className="border-b-2 border-[#1a6496] pb-6 mb-6 flex flex-col md:flex-row items-center md:justify-between gap-4">
                    <div className="text-center md:text-left">
                      <h4 className="text-xs font-black text-[#1a6496] tracking-widest uppercase mb-1">
                        Ministério Apascentando Filhos
                      </h4>
                      <h1 className="text-2xl font-black font-serif text-primary-dark tracking-tight">
                        FICHA DE MEMBRO OFICIAL
                      </h1>
                      <div className="flex flex-wrap gap-2 items-center justify-center md:justify-start mt-2 text-xs text-gray-400 font-bold uppercase tracking-wider">
                        <span>Gerado em: {new Date().toLocaleDateString("pt-BR")}</span>
                        <span>•</span>
                        <span className="uppercase font-bold text-[#1a6496]">
                          Ref: MEM-{viewingMember.id?.substring(0, 8).toUpperCase() || "NOVO"}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center md:items-end">
                      <span
                        className={`px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                          viewingMember.status === "ativo"
                            ? "bg-emerald-50 text-emerald-850 border-emerald-200"
                            : "bg-rose-50 text-rose-850 border-rose-200"
                        }`}
                      >
                        Status: {viewingMember.status === "pendente_aprovacao" ? "Pendente" : viewingMember.status || "Ativo"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 pb-6 border-b border-gray-100">
                    <div className="col-span-1 flex flex-col items-center">
                      <div className="w-32 h-32 rounded-2xl bg-gray-50 border-2 border-gray-150 overflow-hidden shadow-inner flex items-center justify-center relative">
                        {viewingMember.foto ? (
                          <img
                            src={viewingMember.foto}
                            alt={viewingMember.nome}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                            crossOrigin="anonymous"
                          />
                        ) : (
                          <User size={64} className="text-gray-300" />
                        )}
                      </div>
                      <span className="text-[9px] font-black text-gray-400 mt-2 uppercase tracking-wide">
                        Foto do Membro
                      </span>
                    </div>
                    <div className="md:col-span-3 flex flex-col justify-center space-y-4">
                      <div>
                        <span className="text-[10px] uppercase font-black tracking-wider text-gray-400 block">
                          Nome Completo
                        </span>
                        <span className="text-xl font-bold text-gray-900 font-serif">
                          {viewingMember.nome}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-[10px] uppercase font-black tracking-wider text-gray-400 block">
                            Perfil de Acesso
                          </span>
                          <span className="inline-block mt-1 px-2.5 py-0.5 rounded text-[10px] bg-sky-50 text-[#1a6496] font-bold uppercase border border-sky-200">
                            {Array.isArray(viewingMember.permissao)
                              ? viewingMember.permissao.join(", ")
                              : viewingMember.permissao || "Membro"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-black tracking-wider text-gray-400 block">
                            Data de Nascimento
                          </span>
                          <span className="text-sm font-semibold text-gray-800 mt-1 block">
                            {viewingMember.dataNascimento || "-"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-gray-50/55 rounded-xl p-5 border border-gray-100">
                      <h5 className="text-xs font-bold text-[#1a6496] tracking-widest uppercase mb-4 border-b pb-1.5">
                        1. Informações Pessoais
                      </h5>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-2 text-xs">
                        <div>
                          <span className="text-gray-400 font-bold uppercase tracking-wider block text-[9px]">CPF</span>
                          <span className="font-semibold text-gray-800">{viewingMember.cpf || "Não Informado"}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 font-bold uppercase tracking-wider block text-[9px]">Sexo</span>
                          <span className="font-semibold text-gray-800">{viewingMember.sexo || "Não Informado"}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 font-bold uppercase tracking-wider block text-[9px]">Estado Civil</span>
                          <span className="font-semibold text-gray-800">{viewingMember.estadoCivil || "Não Informado"}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 font-bold uppercase tracking-wider block text-[9px]">Escolaridade</span>
                          <span className="font-semibold text-gray-800">{viewingMember.escolaridade || "Não Informado"}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 font-bold uppercase tracking-wider block text-[9px]">Profissão</span>
                          <span className="font-semibold text-gray-800">{viewingMember.profissao || "Não Informado"}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 font-bold uppercase tracking-wider block text-[9px]">Naturalidade</span>
                          <span className="font-semibold text-gray-800">
                            {viewingMember.naturalidade ? `${viewingMember.naturalidade}/${viewingMember.naturalidadeEstado || ""}` : "Não Informado"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50/55 rounded-xl p-5 border border-gray-100">
                      <h5 className="text-xs font-bold text-[#1a6496] tracking-widest uppercase mb-4 border-b pb-1.5">
                        2. Contato e Residência
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-2 text-xs">
                        <div>
                          <span className="text-gray-400 font-bold uppercase tracking-wider block text-[9px]">E-mail</span>
                          <span className="font-semibold text-gray-800">{viewingMember.email || "Não Informado"}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 font-bold uppercase tracking-wider block text-[9px]">Telefone Principal</span>
                          <span className="font-semibold text-gray-805">{viewingMember.telefone || "Não Informado"}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 font-bold uppercase tracking-wider block text-[9px]">WhatsApp</span>
                          <span className="font-semibold text-gray-805">{viewingMember.whatsapp || "Não Informado"}</span>
                        </div>
                        <div className="md:col-span-3">
                          <span className="text-gray-400 font-bold uppercase tracking-wider block text-[9px]">Endereço Completo</span>
                          <span className="font-semibold text-gray-800 block mt-0.5">
                            {viewingMember.rua ? (
                              <>
                                {viewingMember.rua}, {viewingMember.numero || "S/N"}
                                {viewingMember.complemento ? `, ${viewingMember.complemento}` : ""}
                                {viewingMember.bairro ? ` - Bairro: ${viewingMember.bairro}` : ""}
                                {viewingMember.cidade ? ` - ${viewingMember.cidade}/${viewingMember.estado || ""}` : ""}
                                {viewingMember.cep ? ` (CEP: ${viewingMember.cep})` : ""}
                              </>
                            ) : (
                              "Não Informado"
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50/55 rounded-xl p-5 border border-gray-100">
                      <h5 className="text-xs font-bold text-[#1a6496] tracking-widest uppercase mb-4 border-b pb-1.5">
                        3. Histórico Eclesiástico / Espiritual
                      </h5>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-2 text-xs">
                        <div>
                          <span className="text-gray-400 font-bold uppercase tracking-wider block text-[9px]">Conversão</span>
                          <span className="font-semibold text-gray-800">{viewingMember.dataConversao || "Não Informada"}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 font-bold uppercase tracking-wider block text-[9px]">Batismo em Águas</span>
                          <span className="font-semibold text-gray-800">{viewingMember.dataBatismoAguas || "Não Informada"}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 font-bold uppercase tracking-wider block text-[9px]">Membro Desde</span>
                          <span className="font-semibold text-gray-800">{viewingMember.membroDesde || "Não Informado"}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-400 font-bold uppercase tracking-wider block text-[9px]">Igreja de Origem / Anterior</span>
                          <span className="font-semibold text-gray-800">{viewingMember.igrejaAnterior || "Nenhuma"}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 font-bold uppercase tracking-wider block text-[9px]">Consagrado?</span>
                          <span className="font-semibold text-gray-800 uppercase">
                            {viewingMember.consagrado === "sim" ? `Sim (${viewingMember.cargoConsagracao || "Consagração"})` : "Não"}
                          </span>
                        </div>
                        <div className="col-span-2 md:col-span-3">
                          <span className="text-gray-400 font-bold uppercase tracking-wider block text-[9px]">Cargos de Liderança Anteriores</span>
                          <p className="font-medium text-gray-700 italic mt-1">{viewingMember.cargosAnteriores || "Nenhum histórico listado"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50/55 rounded-xl p-5 border border-gray-100">
                      <h5 className="text-xs font-bold text-[#1a6496] tracking-widest uppercase mb-4 border-b pb-1.5">
                        4. Família & Filhos
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-2 text-xs">
                        {viewingMember.nomeConjuge ? (
                          <>
                            <div>
                              <span className="text-gray-400 font-bold uppercase tracking-wider block text-[9px]">Nome do Cônjuge</span>
                              <span className="font-semibold text-gray-800">{viewingMember.nomeConjuge}</span>
                            </div>
                            <div>
                              <span className="text-gray-400 font-bold uppercase tracking-wider block text-[9px]">Data de Casamento</span>
                              <span className="font-semibold text-gray-800">{viewingMember.dataCasamento || "Não Informada"}</span>
                            </div>
                            <div>
                              <span className="text-gray-400 font-bold uppercase tracking-wider block text-[9px]">Contato do Cônjuge</span>
                              <span className="font-semibold text-gray-800">{viewingMember.celularConjuge || "Não Informado"}</span>
                            </div>
                          </>
                        ) : (
                          <div className="col-span-3 font-medium text-gray-500 italic pb-2">Sem informações de cônjuge cadastrado.</div>
                        )}

                        <div className="md:col-span-3 pt-4 border-t border-gray-100">
                          <span className="text-gray-400 font-bold uppercase tracking-wider block text-[9px] mb-2">Filhos Cadastrados ({viewingMember.listaFilhos?.length || 0})</span>
                          {viewingMember.listaFilhos && viewingMember.listaFilhos.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                              {viewingMember.listaFilhos.map((filho: any, fidx: number) => (
                                <div key={fidx} className="bg-white p-2.5 rounded-lg border border-gray-200 flex justify-between items-center text-xs">
                                  <span className="font-bold text-gray-800">{filho.nome}</span>
                                  <div className="text-gray-500 space-x-2">
                                    <span>Nasc: {filho.dataNascimento || "-"}</span>
                                    <span>•</span>
                                    <span className="uppercase font-bold text-gray-400 text-[10px]">{filho.sexo || "-"}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-405 italic5">Não possui filhos cadastrados.</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50/55 rounded-xl p-5 border border-gray-100">
                      <h5 className="text-xs font-bold text-[#1a6496] tracking-widest uppercase mb-4 border-b pb-1.5">
                        5. Atuação Governamental & Serviços
                      </h5>
                      <div className="space-y-4 text-xs">
                        <div>
                          <span className="text-gray-400 font-bold uppercase tracking-wider block text-[9px] mb-2">Interesses Especiais em Departamentos / Ministérios</span>
                          {viewingMember.ministeriosInteresse && viewingMember.ministeriosInteresse.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {viewingMember.ministeriosInteresse.map((m: string) => (
                                <span key={m} className="px-2.5 py-1 bg-sky-50 text-[#1a6496] border border-sky-105 font-bold rounded-md text-[9px] uppercase">
                                  {m}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-400 italic">Nenhum departamento pré-selecionado.</p>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                          <div>
                            <span className="text-gray-400 font-bold uppercase tracking-wider block text-[9px]">Talentário / Aptidões Principais</span>
                            <p className="font-medium text-gray-700 mt-1">{viewingMember.talentos || "Nenhum informado"}</p>
                          </div>
                          <div>
                            <span className="text-gray-400 font-bold uppercase tracking-wider block text-[9px]">Instâncias & Observações Especiais</span>
                            <p className="font-medium text-gray-700 mt-1">{viewingMember.observacoes || "Nenhuma observação privativa cadastrada."}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100 font-sans">
                          <div>
                            <span className="text-gray-400 font-bold uppercase tracking-wider block text-[9px] mb-1">Categorias Vinculadas</span>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {viewingMember.categorias && viewingMember.categorias.length > 0 ? (
                                viewingMember.categorias.map((c: string) => (
                                  <span key={c} className="bg-neutral-100 text-neutral-700 border border-neutral-200 px-2.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
                                    {c}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-400 italic">Membro Padrão</span>
                              )}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-400 font-bold uppercase tracking-wider block text-[9px] mb-1">Cargos Eclesiásticos Oficiais</span>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {viewingMember.cargos && viewingMember.cargos.length > 0 ? (
                                viewingMember.cargos.map((cargo: string) => (
                                  <span key={cargo} className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
                                    {cargo}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-400 italic">Membro Regular</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {viewingMember.camposAdicionais && viewingMember.camposAdicionais.length > 0 && (
                          <div className="pt-4 border-t border-gray-100 space-y-3">
                            <span className="text-gray-400 font-bold uppercase tracking-wider block text-[9px]">Campos Suplementares Extra</span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {viewingMember.camposAdicionais.map((campo: any, idx: number) => (
                                <div key={idx} className="bg-white p-3 rounded-xl border border-gray-150">
                                  <span className="text-[10px] uppercase font-bold text-[#1a6496] block">{campo.titulo}</span>
                                  <span className="text-xs text-gray-700 font-medium mt-1 block whitespace-pre-wrap">{campo.valor}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {viewingMember.anotacoesSecretaria && (
                          <div className="p-3.5 bg-rose-50/40 rounded-xl border border-rose-100/50 mt-4 font-sans">
                            <span className="text-rose-700 font-bold uppercase tracking-wider block text-[9px] mb-1">Anotações Importantes da Secretaria (RESTRITO COORDENAÇÃO)</span>
                            <p className="text-xs text-rose-900 font-semibold whitespace-pre-wrap">{viewingMember.anotacoesSecretaria}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border-t-2 border-[#1a6496] mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[9px] text-gray-400 font-black tracking-widest uppercase mb-1">
                    <span>Secretaria Ministerial</span>
                    <span>© Apascentando Filhos</span>
                    <span>Assinatura do Coordenador _____________________</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 bg-primary-dark/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl w-full max-w-sm shadow-xl p-6 text-center"
            >
              <Trash2
                size={48}
                className="mx-auto text-red-500 mb-4 opacity-80"
              />
              <h3 className="font-bold text-lg text-primary-dark mb-2">
                Excluir Membro
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                Tem certeza que deseja remover este membro? Esta ação não pode
                ser desfeita.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 font-bold text-gray-500 hover:bg-gray-100 rounded-md transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-md transition"
                >
                  Sim, Excluir
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

const styles = `
  @media print {
    body * {
      visibility: hidden !important;
    }
    #membro-ficha-container-scroll, #print-membro-ficha-viewport, #print-membro-ficha-viewport * {
      visibility: visible !important;
    }
    #membro-ficha-container-scroll {
      position: fixed !important;
      left: 0 !important;
      top: 0 !important;
      width: 100% !important;
      height: 100% !important;
      padding: 0 !important;
      margin: 0 !important;
      background: white !important;
      z-index: 9999999 !important;
      overflow: visible !important;
    }
    #print-membro-ficha-viewport {
      display: block !important;
      border: none !important;
      box-shadow: none !important;
      padding: 0 !important;
      margin: 0 !important;
      width: 100% !important;
      max-width: 100% !important;
      position: absolute !important;
      left: 0 !important;
      top: 0 !important;
    }
    .no-print {
      display: none !important;
    }
  }

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
  .modal-input {
    width: 100%;
    background: #ffffff;
    border: 1.5px solid #e2e8f0;
    border-radius: 0.75rem;
    padding: 0.65rem 0.85rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: #1e293b;
    outline: none;
    transition: all 0.2s;
  }
  .modal-input:focus {
    border-color: #1a6496;
    box-shadow: 0 0 0 3px rgba(26, 100, 150, 0.05);
  }
  .no-scrollbar-buttons::-webkit-scrollbar-button {
    display: none;
  }
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
`;

const styleTag = document.createElement("style");
styleTag.innerHTML = styles;
document.head.appendChild(styleTag);

