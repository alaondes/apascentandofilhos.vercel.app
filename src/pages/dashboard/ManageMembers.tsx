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
import { Plus, Edit2, Trash2, Search, X, Check, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import firebaseConfig from "../../../firebase-applet-config.json";

export default function ManageMembers() {
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [roles, setRoles] = useState<any[]>([
    { id: "membro", label: "Membro", base: "membro" },
    { id: "lider", label: "Líder", base: "leader" },
    { id: "secretaria", label: "Secretaria", base: "secretary" },
    { id: "financeiro", label: "Financeiro", base: "financial" },
    { id: "editor", label: "Editor", base: "editor" },
    { id: "pastor", label: "Pastor", base: "admin" },
    { id: "obreiro", label: "Obreiro", base: "leader" },
    { id: "admin", label: "Administrador", base: "admin" },
  ]);

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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

  const handleOpenModal = (member: any = null) => {
    setErrorMessage(null);
    if (member) {
      setEditingMember(member);
      setFormData({
        nome: member.nome || "",
        sobrenome: member.sobrenome || "",
        cpf: member.cpf || "",
        dataNascimento: member.dataNascimento || "",
        sexo: member.sexo || "",
        estadoCivil: member.estadoCivil || "",
        naturalidade: member.naturalidade || "",
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
        nomeConjuge: member.nomeConjuge || "",
        dataCasamento: member.dataCasamento || "",
        dataNascimentoConjuge: member.dataNascimentoConjuge || "",
        cpfConjuge: member.cpfConjuge || "",
        celularConjuge: member.celularConjuge || "",
        igrejaConjuge: member.igrejaConjuge || "",
        temFilhos: member.temFilhos || "não",
        quantidadeFilhos: member.quantidadeFilhos || 0,
        listaFilhos: member.listaFilhos || [],
        ministeriosInteresse: member.ministeriosInteresse || [],
        talentos: member.talentos || "",
        observacoes: member.observacoes || "",
        status: member.status || "ativo",
        permissao: member.permissao || "membro",
      });
    } else {
      setEditingMember(null);
      setFormData({
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
        nomeConjuge: "",
        dataCasamento: "",
        dataNascimentoConjuge: "",
        cpfConjuge: "",
        celularConjuge: "",
        igrejaConjuge: "",
        temFilhos: "não",
        quantidadeFilhos: 0,
        listaFilhos: [],
        ministeriosInteresse: [],
        talentos: "",
        observacoes: "",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      const selectedRole = roles.find((r) => r.id === formData.permissao);
      let role = selectedRole?.base || "membro"; // fallback

      const fullNome = formData.sobrenome 
        ? `${formData.nome} ${formData.sobrenome}` 
        : formData.nome;

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

        await setDoc(doc(db, "membros", finalUid), {
          ...formData,
          createdAt: editingMember.createdAt || Timestamp.now(),
          updatedAt: Timestamp.now(),
        });

        // Atualizar também na tabela de usuários para sincronizar o nível de acesso
        if (formData.email) {
          await setDoc(
            doc(db, "users", finalUid),
            {
              nome: fullNome,
              email: formData.email,
              role: role,
              status: formData.status,
              updatedAt: Timestamp.now(),
            },
            { merge: true },
          );
        }
      } else {
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
              role: role,
              status: formData.status,
              createdAt: Timestamp.now(),
            });

            await setDoc(doc(db, "membros", uid), {
              ...formData,
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
                  role: role,
                  status: formData.status,
                  updatedAt: Timestamp.now(),
                }, { merge: true });

                await setDoc(doc(db, "membros", existingUid), {
                  ...formData,
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
            ...formData,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          });
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
                  className="border-b border-gray-100 hover:bg-gray-50/50 transition duration-150"
                >
                  <td className="py-3 px-4 font-medium text-primary-dark">
                    {member.nome}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    <div>{member.email}</div>
                    <div className="text-gray-500">{member.telefone}</div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {member.dataNascimento}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded text-[10px] bg-[#f0f6fb] text-primary-base font-bold uppercase tracking-wider">
                      {member.permissao || "Membro"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                        member.status === "ativo"
                          ? "bg-green-100 text-green-700"
                          : member.status === "pendente_aprovacao"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {member.status === "pendente_aprovacao" ? "Pendente" : member.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    {member.status === "pendente_aprovacao" && (
                      <button
                        onClick={() => handleApproveMember(member.id)}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition"
                        title="Aprovar Membro"
                      >
                        <Check size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenModal(member)}
                      className="p-1.5 text-primary-base hover:bg-blue-50 rounded-md transition"
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => confirmDelete(member.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition"
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
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Nome*</label>
                          <input type="text" required value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} className="modal-input" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Sobrenome*</label>
                          <input type="text" value={formData.sobrenome} onChange={(e) => setFormData({ ...formData, sobrenome: e.target.value })} className="modal-input" />
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
                          <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Estado Civil</label>
                          <select value={formData.estadoCivil} onChange={(e) => setFormData({ ...formData, estadoCivil: e.target.value })} className="modal-input">
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
                          <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Escolaridade</label>
                          <input type="text" value={formData.escolaridade} onChange={(e) => setFormData({ ...formData, escolaridade: e.target.value })} className="modal-input" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Profissão</label>
                          <input type="text" value={formData.profissao} onChange={(e) => setFormData({ ...formData, profissao: e.target.value })} className="modal-input" />
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
                          <select value={formData.permissao} onChange={(e) => setFormData({ ...formData, permissao: e.target.value })} className="modal-input">
                            {roles.map((r) => (
                              <option key={r.id} value={r.id}>{r.label}</option>
                            ))}
                          </select>
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
    </div>
  );
}

const styles = `
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

