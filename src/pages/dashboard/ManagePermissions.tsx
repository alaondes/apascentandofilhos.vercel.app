import React, { useState, useEffect, useRef } from "react";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  query,
  orderBy,
  updateDoc,
  deleteDoc,
  getDoc,
  addDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import {
  Lock,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
  Shield,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const DEFAULT_ROLES = [
  { id: "membro", label: "Membro", base: "membro", isProtected: false },
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
  { id: "editor", label: "Editor", base: "editor", isProtected: false },
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
  { id: "pastor", label: "Pastor", base: "admin", isProtected: false },
  { id: "obreiro", label: "Obreiro", base: "leader", isProtected: false },
  { id: "admin", label: "Administrador", base: "admin", isProtected: false },
  {
    id: "colunista",
    label: "Colunista",
    base: "colunista",
    isProtected: false,
  },
];

function MultiSelectRole({
  member,
  roles,
  onUpdate,
}: {
  member: any;
  roles: any[];
  onUpdate: (roles: string[]) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const resolvedPermissao =
    member.permissao || member.role || member.papel || "membro";
  const currentRoles = Array.isArray(resolvedPermissao)
    ? resolvedPermissao
    : typeof resolvedPermissao === "string"
      ? [resolvedPermissao]
      : ["membro"];

  const [isSuccess, setIsSuccess] = useState(false);
  
  const toggleRole = (roleId: string) => {
    const roleDef = roles.find((r) => r.id === roleId);
    let newRoles;
    
    if (currentRoles.includes(roleId) || (roleDef && currentRoles.includes(roleDef.label))) {
      newRoles = currentRoles.filter((r: string) => r !== roleId && r !== roleDef?.label);
      if (newRoles.length === 0) newRoles = ["membro"];
    } else {
      newRoles = [
        ...currentRoles.filter((r: string) => r !== "membro"),
        roleId,
      ];
    }
    
    onUpdate(newRoles);
    
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 2000);
  };

  const currentLabels = currentRoles.map((id: string) => {
    const r = roles.find((r: any) => r.id === id || r.label === id);
    return r ? r.label : id;
  });

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <button
          onClick={() => setIsOpen(true)}
          className="text-white bg-primary-base hover:bg-primary-dark px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shadow-sm text-center"
        >
          Editar Permissões
        </button>
        <div className="flex flex-wrap gap-1">
          {currentLabels.slice(0, 3).map((lbl: string) => (
            <span
              key={lbl}
              className="bg-gray-100 text-gray-700 border border-gray-200 px-2 py-0.5 rounded-md text-[11px] font-medium whitespace-nowrap"
            >
              {lbl}
            </span>
          ))}
          {currentLabels.length > 3 && (
             <span className="bg-gray-100 text-gray-500 border border-gray-200 px-2 py-0.5 rounded-md text-[11px] font-medium whitespace-nowrap">
               +{currentLabels.length - 3}
             </span>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden animate-fade-in">
            <div className="p-4 border-b border-[#e2eaf3] flex justify-between items-center bg-[#f7fafd]">
              <h3 className="font-bold text-primary-dark">Permissões de {member.nome || "Usuário"}</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                 <X size={20} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 space-y-2 bg-white">
               {roles.map((r) => (
                  <div
                     key={r.id}
                     onClick={(e) => {
                       e.preventDefault();
                       toggleRole(r.id);
                     }}
                     className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl cursor-pointer hover:bg-[#f7fafd] hover:border-[#c8d8e8] transition-all"
                   >
                     <input
                       type="checkbox"
                       readOnly
                       className="rounded border-gray-300 w-4 h-4 text-primary-base focus:ring-[3px] focus:ring-primary-base/20 cursor-pointer pointer-events-none"
                       checked={
                         currentRoles.includes(r.id) || currentRoles.includes(r.label)
                       }
                     />
                     <span className="text-sm font-bold text-gray-700 pointer-events-none">{r.label}</span>
                   </div>
               ))}
            </div>
            {isSuccess && (
              <div className="px-4 py-2 bg-green-50 text-green-700 text-xs font-bold text-center border-t border-green-100">
                Permissão atualizada com sucesso!
              </div>
            )}
            <div className="p-4 border-t border-[#e2eaf3] bg-[#f7fafd] flex justify-end">
               <button
                 onClick={() => setIsOpen(false)}
                 className="px-6 py-2 bg-primary-base text-white hover:bg-primary-dark rounded-xl text-sm font-bold shadow-sm transition-colors"
               >
                 Concluir
               </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function ManagePermissions() {
  const [activeTab, setActiveTab] = useState<"users" | "roles">("users");
  const [roles, setRoles] = useState<any[]>(DEFAULT_ROLES);
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Role Form
  const [editingRole, setEditingRole] = useState<any>(null);
  const [roleForm, setRoleForm] = useState({ label: "", base: "membro" });
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Carregar papéis customizados
    const unsubRoles = onSnapshot(
      collection(db, "custom_roles"),
      (snapshot) => {
        if (!snapshot.empty) {
          const customRoles = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }));
          // Mesclar com os defaults se não existirem
          let merged = [...DEFAULT_ROLES];
          customRoles.forEach((cr: any) => {
            if (cr.deleted) {
              merged = merged.filter((m) => m.id !== cr.id);
            } else if (!merged.find((m) => m.id === cr.id)) {
              merged.push(cr as any);
            } else {
              // Update existing default
              const index = merged.findIndex((m) => m.id === cr.id);
              if (index !== -1) merged[index] = { ...merged[index], ...cr };
            }
          });
          setRoles(merged);
        } else {
          setRoles(DEFAULT_ROLES);
        }
      },
      (error) => {
        console.warn("Erro ao ler custom_roles", error);
      },
    );

    let usersMap = new Map();
    let membrosMap = new Map();

    const combineData = () => {
      const merged = new Map();
      usersMap.forEach((u, id) => {
        merged.set(id, { ...u, nome: u.nome || u.name, fromUserTable: true });
      });
      membrosMap.forEach((m, id) => {
        if (merged.has(id)) {
          merged.set(id, { ...merged.get(id), ...m });
        } else {
          merged.set(id, { ...m, fromMembroTable: true });
        }
      });
      const arr = Array.from(merged.values());
      arr.sort((a, b) =>
        (a.nome || a.email || "").localeCompare(b.nome || b.email || ""),
      );
      setMembers(arr);
      setIsLoading(false);
    };

    const unsubUsers = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        usersMap.clear();
        snapshot.docs.forEach((doc) => {
          usersMap.set(doc.id, { id: doc.id, ...doc.data() });
        });
        combineData();
      },
      (error) => console.warn("Erro ao ler users", error),
    );

    const unsubMembers = onSnapshot(
      collection(db, "membros"),
      (snapshot) => {
        membrosMap.clear();
        snapshot.docs.forEach((doc) => {
          membrosMap.set(doc.id, { id: doc.id, ...doc.data() });
        });
        combineData();
      },
      (error) => console.warn("Erro ao ler membros", error),
    );

    return () => {
      unsubRoles();
      unsubUsers();
      unsubMembers();
    };
  }, []);

  const handleUpdateMemberRole = async (
    memberId: string,
    newPermissoes: string[],
  ) => {
    let baseRoles = newPermissoes.map((p) => {
      const roleDef = roles.find((r) => r.id === p || r.label === p);
      return roleDef?.base || "membro";
    });

    // Deduplicate
    baseRoles = Array.from(new Set(baseRoles));

    try {
      // Atualiza na tabela de membros (create if doesn't exist)
      await setDoc(doc(db, "membros", memberId), {
        permissao: newPermissoes,
      }, { merge: true });

      // Atualiza na tabela de users
      await setDoc(doc(db, "users", memberId), { 
        role: baseRoles,
        papel: baseRoles 
      }, { merge: true });
    } catch (e: any) {
      console.error("Erro ao atualizar papel", e);
      alert("Erro ao atualizar permissão: " + e.message);
    }
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      const roleId = editingRole
        ? editingRole.id
        : roleForm.label.toLowerCase().replace(/[^a-z0-9]/g, "_");

      if (roles.find((r) => r.id === roleId) && !editingRole) {
        setErrorMessage("Um nível de permissão com este nome já existe.");
        return;
      }

      await setDoc(doc(db, "custom_roles", roleId), {
        label: roleForm.label,
        base: roleForm.base,
        deleted: false,
      });

      setIsRoleModalOpen(false);
      setEditingRole(null);
      setRoleForm({ label: "", base: "membro" });
    } catch (e: any) {
      setErrorMessage("Erro ao salvar: " + e.message);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    try {
      const defaultRole = DEFAULT_ROLES.find((r) => r.id === roleId);
      if (defaultRole && defaultRole.isProtected) {
        setErrorMessage(
          "Você não pode deletar os níveis protegidos do sistema.",
        );
        setDeleteConfirmId(null);
        return;
      }

      if (defaultRole) {
        await setDoc(doc(db, "custom_roles", roleId), { deleted: true });
      } else {
        await deleteDoc(doc(db, "custom_roles", roleId));
      }
      setDeleteConfirmId(null);
    } catch (e: any) {
      console.error("Erro ao excluir nível:", e);
      setErrorMessage("Erro ao excluir nível: " + e.message);
      setDeleteConfirmId(null);
    }
  };

  const filteredMembers = members.filter((m) => {
    const matchesSearch = (m.nome || m.email || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    
    // Se houver termo de busca, filtra por ele
    if (searchTerm) return matchesSearch;

    // Se não houver busca, mostramos usuários com status pendente ou que já possuem algum nível especial.
    // Mas para atender ao pedido do usuário ("membros cadastrados não estão aparecendo"), 
    // vamos mostrar todos por padrão nesta tela de gestão, ou pelo menos os que não são apenas 'membros ativos' se a lista for muito grande.
    // Como a lista é local no estado, mostrar todos é o comportamento esperado para uma gestão de usuários.
    return true;
  });

  return (
    <div className="bg-white rounded-[14px] border-[1.5px] border-[#c8d8e8] shadow-[0_4px_28px_rgba(0,0,0,0.05)] overflow-hidden w-full flex flex-col min-h-[600px]">
      <div className="bg-gradient-to-r from-[#f7fafd] to-white p-6 border-b border-[#c8d8e8] flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-primary-dark flex items-center gap-2">
            <Shield className="text-primary-base" size={24} /> Níveis de
            Permissão
          </h2>
          <p className="text-sm text-gray-500 font-medium">
            Gerencie quem tem acesso e crie níveis customizados.
          </p>
        </div>
        <div className="flex bg-[#f1f6fb] p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === "users"
                ? "bg-white text-primary-base shadow-sm"
                : "text-gray-500 hover:text-primary-dark"
            }`}
          >
            Conceder/Retirar
          </button>
          <button
            onClick={() => setActiveTab("roles")}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === "roles"
                ? "bg-white text-primary-base shadow-sm"
                : "text-gray-500 hover:text-primary-dark"
            }`}
          >
            Configurar Níveis
          </button>
        </div>
      </div>

      <div className="p-6 flex-1 bg-[#fcfdfe]">
        {activeTab === "users" ? (
          <div className="space-y-6">
            <div className="flex items-center bg-white border border-[#c8d8e8] rounded-xl px-4 py-2.5 shadow-sm">
              <Search className="text-gray-400 mr-2" size={20} />
              <input
                type="text"
                placeholder="Buscar usuário para alterar permissão..."
                className="flex-1 bg-transparent border-none outline-none text-primary-dark text-sm font-medium placeholder:text-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="bg-white border rounded-xl overflow-visible min-h-[380px] shadow-sm">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-[#f7fafd] text-[#2c4a63] text-xs uppercase tracking-wider font-bold">
                    <th className="p-4 border-b border-[#e2eaf3]">Nome</th>
                    <th className="p-4 border-b border-[#e2eaf3]">Email</th>
                    <th className="p-4 border-b border-[#e2eaf3]">
                      Nível de Permissão (Visual)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((member) => (
                    <tr
                      key={member.id}
                      className="border-b last:border-none border-[#e2eaf3] hover:bg-gray-50 transition"
                    >
                      <td className="p-4 text-sm font-bold text-primary-dark">
                        {member.nome}
                      </td>
                      <td className="p-4 text-sm text-gray-500">
                        {member.email || "Sem email"}
                      </td>
                      <td className="p-4">
                        <MultiSelectRole
                          member={member}
                          roles={roles}
                          onUpdate={(newRoles) =>
                            handleUpdateMemberRole(member.id, newRoles)
                          }
                        />
                      </td>
                    </tr>
                  ))}
                  {filteredMembers.length === 0 && !isLoading && (
                    <tr>
                      <td
                        colSpan={3}
                        className="p-8 text-center text-gray-500 font-medium"
                      >
                        Nenhum usuário encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-blue-50/50 p-4 rounded-xl border border-blue-100">
              <p className="text-sm text-[#2c4a63]">
                Crie níveis visuais (como "Tesoureiro" ou "Professor") e associe
                a uma base de acesso do sistema.
              </p>
              <button
                onClick={() => {
                  setEditingRole(null);
                  setRoleForm({ label: "", base: "membro" });
                  setIsRoleModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-primary-base text-white text-sm font-bold rounded-lg shadow hover:-translate-y-0.5 transition"
              >
                <Plus size={16} /> Novo Nível
              </button>
            </div>

            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm font-semibold flex justify-between items-center">
                <span>{errorMessage}</span>
                <button
                  onClick={() => setErrorMessage(null)}
                  className="text-red-400 hover:text-red-700 font-bold p-1"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {roles.map((r) => {
                const isDefault = DEFAULT_ROLES.find((dr) => dr.id === r.id);
                const isProtected = isDefault?.isProtected;
                return (
                  <div
                    key={r.id}
                    className="bg-white border border-[#c8d8e8] p-5 rounded-xl shadow-sm relative group flex flex-col"
                  >
                    {isProtected && (
                      <span className="absolute top-3 right-3 text-[10px] uppercase font-black text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                        Padrão do Sistema
                      </span>
                    )}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-primary-base/10 flex items-center justify-center text-primary-base">
                        <Shield size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-primary-dark">
                          {r.label}
                        </h3>
                        <p className="text-xs text-gray-500">
                          Base de Acesso:{" "}
                          <span className="font-bold text-primary-base uppercase">
                            {r.base}
                          </span>
                        </p>
                      </div>
                    </div>

                    {deleteConfirmId === r.id ? (
                      <div className="mt-auto pt-4 flex flex-col gap-2 border-t border-gray-100">
                        <p className="text-xs text-red-600 font-bold mb-1">
                          Excluir nível? Pode causar perda de acesso.
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="flex-1 py-1.5 text-xs font-bold text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => handleDeleteRole(r.id)}
                            className="flex-1 py-1.5 text-xs font-bold text-white bg-red-600 rounded-md hover:bg-red-700 transition"
                          >
                            Confirmar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-auto pt-4 flex gap-2 border-t border-gray-100">
                        <button
                          onClick={() => {
                            setEditingRole(r);
                            setRoleForm({
                              label: r.label,
                              base: r.base || "membro",
                            });
                            setIsRoleModalOpen(true);
                          }}
                          className="flex-1 py-1.5 text-xs font-bold text-primary-base bg-blue-50 rounded-md hover:bg-blue-100 transition flex items-center justify-center gap-1"
                        >
                          <Edit2 size={13} /> Editar
                        </button>
                        {!isProtected && (
                          <button
                            onClick={() => setDeleteConfirmId(r.id)}
                            className="flex-1 py-1.5 text-xs font-bold text-red-500 bg-red-50 rounded-md hover:bg-red-100 transition flex items-center justify-center gap-1"
                          >
                            <Trash2 size={13} /> Excluir
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isRoleModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-primary-dark/40 backdrop-blur-sm"
              onClick={() => setIsRoleModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden"
            >
              <div className="bg-[#f7fafd] p-6 border-b border-[#e2eaf3] flex justify-between items-center">
                <h2 className="text-xl font-bold text-primary-dark flex items-center gap-2">
                  <Shield className="text-primary-base" />{" "}
                  {editingRole ? "Editar Nível" : "Novo Nível"}
                </h2>
                <button
                  onClick={() => setIsRoleModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSaveRole} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Nome do Nível Visual
                  </label>
                  <input
                    type="text"
                    required
                    value={roleForm.label}
                    onChange={(e) =>
                      setRoleForm({ ...roleForm, label: e.target.value })
                    }
                    placeholder="Ex: Professor da EBD"
                    className="w-full px-3 py-2 border border-[#c8d8e8] rounded-md text-sm focus:border-primary-base"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Base de Acesso ao Sistema
                  </label>
                  <select
                    value={roleForm.base}
                    onChange={(e) =>
                      setRoleForm({ ...roleForm, base: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-[#c8d8e8] rounded-md text-sm focus:border-primary-base"
                  >
                    <option value="membro">
                      Membro (Sem acesso ao painel admin)
                    </option>
                    <option value="leader">
                      Líder (Acesso a Meus Grupos e Relatórios)
                    </option>
                    <option value="secretary">
                      Secretário (Acesso Parcial Admin)
                    </option>
                    <option value="financial">
                      Financeiro (Acesso Parcial Admin)
                    </option>
                    <option value="editor">
                      Editor (Acesso ao Conteúdo/Páginas)
                    </option>
                    <option value="colunista">
                      Colunista (Acesso Individual e Exclusivo)
                    </option>
                    <option value="admin">Administrador (Acesso Total)</option>
                  </select>
                  <p className="mt-2 text-[10px] leading-relaxed text-gray-500">
                    A base de acesso define quais permissões reais o usuário
                    terá dentro do sistema, independentemente de como o nível
                    visual se chama.
                  </p>
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsRoleModalOpen(false)}
                    className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-sm font-bold text-white bg-primary-base rounded-lg hover:bg-primary-dark shadow-md flex items-center gap-2"
                  >
                    <Check size={16} /> Salvar Nível
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
