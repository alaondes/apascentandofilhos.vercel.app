import React, { useState, useEffect } from "react";
import {
  Edit3,
  PlusCircle,
  Calendar,
  Trash2,
  Tag,
  Loader2,
  Save,
  Layout,
  User,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Image as ImageIcon,
} from "lucide-react";
import { motion } from "motion/react";
import { useFirebase } from "../../context/FirebaseContext";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  orderBy,
  setDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";

const initialBloggers = [
  {
    id: 1,
    img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&h=400&auto=format&fit=crop",
    name: "Bispo Macedo",
  },
  {
    id: 2,
    img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&h=400&auto=format&fit=crop",
    name: "Ester Bezerra",
  },
  {
    id: 3,
    img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&h=400&auto=format&fit=crop",
    name: "Cristiane Cardoso",
  },
];

export default function ColunistaPanelComponent({
  activeTab,
}: {
  activeTab: string;
}) {
  const { user, profile } = useFirebase();
  const [artigos, setArtigos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = profile?.role === "admin" || user?.email === "alaondez@gmail.com";

  // Editor State
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [categoria, setCategoria] = useState("");
  const [status, setStatus] = useState("publicado");
  const [imagemUrl, setImagemUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmA, setDeleteConfirmA] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800; // Resize to max 800px width to save space
        const scaleSize = MAX_WIDTH / img.width;
        
        let newWidth = img.width;
        let newHeight = img.height;
        
        if (img.width > MAX_WIDTH) {
          newWidth = MAX_WIDTH;
          newHeight = img.height * scaleSize;
        }

        canvas.width = newWidth;
        canvas.height = newHeight;

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Compress as JPEG
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        setImagemUrl(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (user?.uid && activeTab === "colunista_meus_artigos") {
      fetchArtigos();
      setEditingId(null);
      setMensagem("");
    }
  }, [user?.uid, activeTab]);

  const fetchArtigos = async () => {
    setLoading(true);
    try {
      if (!user?.uid) return;
      let q;
      if (isAdmin) {
        q = query(collection(db, "artigos"));
      } else {
        q = query(
          collection(db, "artigos"),
          where("colunistaId", "==", user.uid)
        );
      }
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Record<string, any>),
      }));
      // Sort in memory as orderby on different fields might require indexes
      data.sort((a: any, b: any) => {
        const tA = a.createdAt?.seconds ? a.createdAt.seconds : 0;
        const tB = b.createdAt?.seconds ? b.createdAt.seconds : 0;
        return tB - tA;
      });
      setArtigos(data);
    } catch (error) {
      console.error("Erro ao buscar artigos:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteArtigo = async (id: string) => {
    setDeleteConfirmA(id);
  };

  const confirmDeleteArtigoAction = async () => {
    if (!deleteConfirmA) return;
    try {
      await deleteDoc(doc(db, "artigos", deleteConfirmA));
      fetchArtigos();
      setDeleteConfirmA(null);
    } catch (error) {
      console.error("Erro ao deletar:", error);
      setDeleteConfirmA(null);
    }
  };

  const startEdit = (artigo: any) => {
    setTitulo(artigo.titulo);
    setConteudo(artigo.conteudo);
    setCategoria(artigo.categoria || "");
    setStatus(artigo.status || "publicado");
    setImagemUrl(artigo.imagemUrl || "");
    setEditingId(artigo.id);
    setMensagem("");
  };

  const handleUpdateArtigo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo || !conteudo || !editingId) return;

    setIsSaving(true);
    setMensagem("");
    try {
      await updateDoc(doc(db, "artigos", editingId), {
        titulo,
        conteudo,
        categoria,
        status,
        imagemUrl,
        updatedAt: serverTimestamp(),
      });
      setMensagem("Artigo atualizado com sucesso!");
      setTimeout(() => {
        setEditingId(null);
        fetchArtigos();
      }, 1500);
    } catch (error: any) {
      console.error("Erro ao atualizar:", error);
      setMensagem("Erro ao atualizar artigo: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveArtigo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo || !conteudo) return;

    setIsSaving(true);
    setMensagem("");
    try {
      await addDoc(collection(db, "artigos"), {
        titulo,
        conteudo,
        categoria,
        colunistaId: user?.uid,
        autorNome: profile?.nome || profile?.nomeMarido || user?.email,
        imagemUrl,
        createdAt: serverTimestamp(),
        status, // Pode ser rascunho ou publicado
      });
      setMensagem("Artigo salvo com sucesso!");
      setTitulo("");
      setConteudo("");
      setCategoria("");
      setImagemUrl("");
      setStatus("publicado");
    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      setMensagem("Erro ao salvar artigo: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (activeTab === "colunista_meus_artigos") {
    return (
      <div className="w-full h-full bg-white rounded-[14px] border-[1.5px] border-[#c8d8e8] shadow-sm overflow-hidden p-6">
        <div className="flex items-center gap-3 mb-6 relative">
          <Edit3 className="text-primary-base" />
          <h2 className="text-xl font-bold font-serif text-primary-dark">
            {editingId ? "Editar Artigo" : (isAdmin ? "Todos os Artigos" : "Meus Artigos")}
          </h2>
          {editingId && (
            <button
              onClick={() => setEditingId(null)}
              className="absolute right-0 text-sm font-bold text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              Voltar
            </button>
          )}
        </div>

        {editingId ? (
          <div>
            {mensagem && (
              <div
                className={`p-4 rounded-xl mb-6 font-semibold flex items-center gap-2 ${mensagem.includes("sucesso") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}
              >
                {mensagem}
              </div>
            )}

            <form onSubmit={handleUpdateArtigo} className="space-y-5">
              <div>
                <label className="block text-[11px] font-black text-primary-base uppercase mb-1 ml-1 tracking-wide">
                  Título do Artigo
                </label>
                <input
                  required
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="w-full border-[1.5px] border-[#c8d8e8] rounded-xl px-4 py-3 text-sm font-semibold text-primary-dark bg-white focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all outline-none"
                  placeholder="Digite o título do artigo"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black text-primary-base uppercase mb-1 ml-1 tracking-wide">
                    Categoria / Tema
                  </label>
                  <input
                    type="text"
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full border-[1.5px] border-[#c8d8e8] rounded-xl px-4 py-3 text-sm font-medium text-text-main bg-white focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all outline-none"
                    placeholder="Ex: Casamento, Finanças, Comunicação..."
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-primary-base uppercase mb-1 ml-1 tracking-wide">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full border-[1.5px] border-[#c8d8e8] rounded-xl px-4 py-3 text-sm font-medium text-text-main bg-white focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all outline-none"
                  >
                    <option value="publicado">
                      Publicado (Visível para todos)
                    </option>
                    <option value="rascunho">
                      Rascunho (Não será exibido)
                    </option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-[11px] font-black text-primary-base uppercase mb-1 ml-1 tracking-wide">
                  Imagem de Capa (URL ou Buscar na Galeria)
                </label>
                <div className="flex flex-col md:flex-row gap-3">
                  <input
                    type="text"
                    value={imagemUrl}
                    onChange={(e) => setImagemUrl(e.target.value)}
                    className="flex-1 border-[1.5px] border-[#c8d8e8] rounded-xl px-4 py-3 text-sm font-medium text-text-main bg-white focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all outline-none"
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                  <label className="flex items-center justify-center cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl border-[1.5px] border-transparent font-bold text-sm transition-colors whitespace-nowrap">
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    <ImageIcon size={18} className="mr-2" />
                    Buscar na Galeria
                  </label>
                </div>
                {imagemUrl && (
                  <div className="mt-3 w-32 h-20 rounded-lg overflow-hidden border border-gray-200 shadow-sm relative group">
                    <img src={imagemUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setImagemUrl("")} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-black text-primary-base uppercase mb-1 ml-1 tracking-wide">
                  Conteúdo
                </label>
                <textarea
                  required
                  value={conteudo}
                  onChange={(e) => setConteudo(e.target.value)}
                  className="w-full h-[300px] font-serif border-[1.5px] border-[#c8d8e8] rounded-xl px-4 py-3 text-sm text-text-main bg-white focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all outline-none resize-y"
                  placeholder="Escreva o conteúdo completo do seu artigo..."
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full flex justify-center items-center gap-2 bg-primary-base hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-primary-base/20 active:scale-[0.98]"
              >
                {isSaving ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Save size={18} />
                )}
                Atualizar Artigo
              </button>
            </form>
          </div>
        ) : loading ? (
          <div className="flex justify-center p-10">
            <Loader2 className="animate-spin text-primary-base mx-auto" />
          </div>
        ) : artigos.length === 0 ? (
          <div className="text-center p-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500 mb-2">
              Você ainda não escreveu nenhum artigo.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {artigos.map((artigo) => (
              <div
                key={artigo.id}
                className="p-4 bg-[#f7fafd] border border-[#e2eaf3] rounded-xl flex items-center justify-between group hover:border-primary-base hover:shadow-md transition-all"
              >
                <div className="flex-1 pr-4">
                  <h3 className="font-bold text-primary-dark text-lg mb-1 line-clamp-1">
                    {artigo.titulo}
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />{" "}
                      {artigo.createdAt?.toDate
                        ? artigo.createdAt.toDate().toLocaleDateString("pt-BR")
                        : "Recente"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Tag size={12} /> {artigo.categoria || "Sem categoria"}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${artigo.status === "publicado" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}
                    >
                      {artigo.status || "rascunho"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => startEdit(artigo)}
                    className="p-2 text-gray-400 hover:text-primary-base hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button
                    onClick={() => deleteArtigo(artigo.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="pt-6 mt-4 border-t border-[#e2eaf3] flex justify-end">
          <button
            onClick={() => {
              setIsSaving(true);
              setTimeout(() => setIsSaving(false), 500);
            }}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold bg-primary-base text-white hover:bg-[#0d4f7a] transition-all shadow-lg shadow-primary-base/20 disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            Salvar Alterações
          </button>
        </div>
      </div>
    );
  }

  if (activeTab === "colunista_novo_artigo") {
    return (
      <div className="w-full h-full bg-white rounded-[14px] border-[1.5px] border-[#c8d8e8] shadow-sm p-6 overflow-y-auto">
        <div className="flex items-center gap-3 mb-6">
          <PlusCircle className="text-primary-base" />
          <h2 className="text-xl font-bold font-serif text-primary-dark">
            Escrever Novo Artigo
          </h2>
        </div>

        {mensagem && (
          <div
            className={`p-4 rounded-xl mb-6 font-semibold flex items-center gap-2 ${mensagem.includes("sucesso") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}
          >
            {mensagem}
          </div>
        )}

        <form onSubmit={handleSaveArtigo} className="space-y-5">
          <div>
            <label className="block text-[11px] font-black text-primary-base uppercase mb-1 ml-1 tracking-wide">
              Título do Artigo
            </label>
            <input
              required
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full border-[1.5px] border-[#c8d8e8] rounded-xl px-4 py-3 text-sm font-semibold text-primary-dark bg-white focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all outline-none"
              placeholder="Digite o título do artigo"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-black text-primary-base uppercase mb-1 ml-1 tracking-wide">
                Categoria / Tema
              </label>
              <input
                type="text"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full border-[1.5px] border-[#c8d8e8] rounded-xl px-4 py-3 text-sm font-medium text-text-main bg-white focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all outline-none"
                placeholder="Ex: Casamento, Finanças, Comunicação..."
              />
            </div>
            <div>
              <label className="block text-[11px] font-black text-primary-base uppercase mb-1 ml-1 tracking-wide">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border-[1.5px] border-[#c8d8e8] rounded-xl px-4 py-3 text-sm font-medium text-text-main bg-white focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all outline-none"
              >
                <option value="publicado">Publicar Agora</option>
                <option value="rascunho">Salvar como Rascunho</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-[11px] font-black text-primary-base uppercase mb-1 ml-1 tracking-wide">
              Imagem de Capa (URL ou Buscar na Galeria)
            </label>
            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="text"
                value={imagemUrl}
                onChange={(e) => setImagemUrl(e.target.value)}
                className="flex-1 border-[1.5px] border-[#c8d8e8] rounded-xl px-4 py-3 text-sm font-medium text-text-main bg-white focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all outline-none"
                placeholder="https://exemplo.com/imagem.jpg"
              />
              <label className="flex items-center justify-center cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl border-[1.5px] border-transparent font-bold text-sm transition-colors whitespace-nowrap">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                <ImageIcon size={18} className="mr-2" />
                Buscar na Galeria
              </label>
            </div>
            {imagemUrl && (
              <div className="mt-3 w-32 h-20 rounded-lg overflow-hidden border border-gray-200 shadow-sm relative group">
                <img src={imagemUrl} alt="Preview" className="w-full h-full object-cover" />
                <button type="button" onClick={() => setImagemUrl("")} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-black text-primary-base uppercase mb-1 ml-1 tracking-wide">
              Conteúdo do Artigo
            </label>
            <textarea
              required
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              className="w-full min-h-[300px] border-[1.5px] border-[#c8d8e8] rounded-xl px-4 py-3 text-sm text-text-main bg-white focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all outline-none resize-y"
              placeholder="Escreva seu artigo aqui..."
            ></textarea>
          </div>

          <div className="flex justify-end pt-4 border-t border-[#e2eaf3]">
            <button
              disabled={isSaving}
              type="submit"
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-primary-base text-white hover:bg-[#0d4f7a] hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-70"
            >
              {isSaving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {isSaving
                ? "Salvando..."
                : status === "publicado"
                  ? "Publicar Artigo"
                  : "Salvar como Rascunho"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (activeTab === "colunista_gerenciar_home") {
    return <GerenciarColunistasHome />;
  }

  return (
    <>
      {deleteConfirmA && (
        <div className="fixed inset-0 bg-primary-dark/40 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6 text-center">
            <h3 className="text-xl font-bold text-primary-dark mb-2">Excluir Artigo</h3>
            <p className="text-gray-500 text-sm mb-6">Deseja realmente excluir este artigo?</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setDeleteConfirmA(null)}
                className="px-6 py-2.5 font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteArtigoAction}
                className="px-6 py-2.5 font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl shadow-lg shadow-red-500/30 transition"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function GerenciarColunistasHome() {
  const [bloggers, setBloggers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmB, setDeleteConfirmB] = useState<number | null>(null);

  const recompressBase64 = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      if (!base64Str || !base64Str.startsWith("data:image")) {
        return resolve(base64Str);
      }
      if (base64Str.length < 150000) {
        return resolve(base64Str);
      }

      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.6));
      };
      img.onerror = () => resolve(base64Str);
    });
  };
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true);
      try {
        const homeRef = doc(db, "content", "home");
        const homeSnap = await getDoc(homeRef);
        
        if (homeSnap.exists()) {
          const data = homeSnap.data();
          if (data.bloggers && Array.isArray(data.bloggers)) {
            setBloggers(data.bloggers);
          } else {
            // Document exists but no bloggers array
            setBloggers(initialBloggers);
          }
        } else {
          // Document doesn't exist yet
          setBloggers(initialBloggers);
        }
      } catch (err) {
        console.error("Erro ao buscar dados da home", err);
      }

      // Fetch users and membros with colunista role
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        const membrosSnap = await getDocs(collection(db, "membros"));

        let allUsers: any[] = [];

        usersSnap.docs.forEach((doc) => {
          allUsers.push({
            id: doc.id,
            collection: "users",
            ...(doc.data() as any),
          });
        });

        membrosSnap.docs.forEach((doc) => {
          // avoid duplicates if same id
          if (!allUsers.find((u) => u.id === doc.id)) {
            allUsers.push({
              id: doc.id,
              collection: "membros",
              ...(doc.data() as any),
            });
          }
        });

        const usersList = allUsers.filter((u) => {
          const roles = [];
          if (u.role) roles.push(u.role);
          if (u.permissao) roles.push(u.permissao);
          if (u.papel) roles.push(u.papel);

          const rolesStr = JSON.stringify(roles).toLowerCase();
          return (
            rolesStr.includes("colunista") ||
            rolesStr.includes("columnist") ||
            rolesStr.includes("admin") ||
            rolesStr.includes("editor")
          );
        });

        setAvailableUsers(usersList);
      } catch (err) {
        console.error("Erro ao buscar usuários colunistas", err);
      }

      setLoading(false);
    };
    fetchHomeData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const optimizedBloggers = await Promise.all(
        bloggers.map(async (blogger) => ({
          ...blogger,
          img: await recompressBase64(blogger.img || ""),
          bannerImg: await recompressBase64(blogger.bannerImg || ""),
        }))
      );

      await setDoc(doc(db, "content", "home"), {
        bloggers: optimizedBloggers,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      alert("Colunistas salvos com sucesso!");
    } catch (e: any) {
      console.error(e);
      if (
        e.code === "resource-exhausted" ||
        (e.message && e.message.includes("too large"))
      ) {
        alert(
          "Erro: O conteúdo é muito grande (muitas imagens). Tente reduzir o número de colunistas ou usar imagens menores."
        );
      } else {
        alert("Erro ao salvar no banco. Verifique permissões.");
      }
    } finally {
      setSaving(false);
    }
  };

  const updateBlogger = (index: number, field: string, value: string) => {
    const newBloggers = [...bloggers];
    newBloggers[index] = { ...newBloggers[index], [field]: value };
    setBloggers(newBloggers);
  };

  const addBlogger = () => {
    setBloggers([
      ...bloggers,
      {
        name: "",
        img: "",
        bannerImg: "",
        bannerSubtitle: "",
        bannerTitle: "",
        bannerQuote: "",
        facebook: "",
        instagram: "",
        twitter: "",
        youtube: "",
      },
    ]);
  };

  const removeBlogger = (index: number) => {
    setDeleteConfirmB(index);
  };
  
  const confirmRemoveBloggerAction = () => {
    if (deleteConfirmB === null) return;
    const newBloggers = [...bloggers];
    newBloggers.splice(deleteConfirmB, 1);
    setBloggers(newBloggers);
    setDeleteConfirmB(null);
  };

  if (loading)
    return (
      <div className="p-10 flex justify-center">
        <Loader2 className="animate-spin text-primary-base" />
      </div>
    );

  return (
    <div className="w-full h-full bg-white rounded-[14px] border-[1.5px] border-[#c8d8e8] shadow-sm p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-base/10 rounded-lg">
            <Layout className="text-primary-base" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold font-serif text-primary-dark">
              Gerenciar Colunistas da Home
            </h2>
            <p className="text-xs text-gray-500 font-medium">Configure banners and perfis que aparecem na home e nas páginas de colunas</p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {bloggers.map((blogger, idx) => (
          <div
            key={idx}
            className="p-6 border-[1.5px] border-gray-200 rounded-2xl bg-[#fcfdfe] relative overflow-hidden group transition-all hover:border-primary-base/30 hover:shadow-md"
          >
            {/* Index Badge */}
            <div className="absolute top-0 left-0 bg-gray-100 text-gray-400 font-black text-[10px] px-3 py-1 rounded-br-lg uppercase tracking-widest">
              Colunista #{idx + 1}
            </div>

            <div className="flex justify-between items-center mb-6 pt-2">
              <h4 className="font-bold text-primary-dark text-lg flex items-center gap-2">
                <User size={20} className="text-primary-base" />
                {blogger.name || `Novo Colunista ${idx + 1}`}
              </h4>
              <button
                type="button"
                onClick={() => removeBlogger(idx)}
                className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-xl transition-colors flex items-center gap-2 text-xs font-bold"
                title="Deletar este colunista"
              >
                <Trash2 size={16} /> Remover
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Photos and Main Info */}
              <div className="lg:col-span-4 space-y-6">
                {/* Profile Photo */}
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider">
                    Foto de Perfil (Avatar)
                  </label>
                  <div className="flex flex-col items-center gap-4 p-4 bg-white rounded-xl border border-dashed border-gray-300">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary-base/20 bg-gray-50 flex items-center justify-center">
                      {blogger.img ? (
                        <img src={blogger.img} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User size={32} className="text-gray-300" />
                      )}
                    </div>
                    <div className="flex flex-col w-full gap-2">
                      <div className="relative w-full">
                        <button className="w-full py-2 bg-primary-base text-white rounded-lg text-xs font-bold hover:bg-[#0d4f7a] transition-all">
                          Alterar Foto
                        </button>
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                const img = new Image();
                                img.onload = () => {
                                  const canvas = document.createElement("canvas");
                                  const MAX_WIDTH = 400;
                                  const MAX_HEIGHT = 400;
                                  let width = img.width;
                                  let height = img.height;
                                  if (width > height) {
                                    if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
                                  } else {
                                    if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
                                  }
                                  canvas.width = width;
                                  canvas.height = height;
                                  const ctx = canvas.getContext("2d");
                                  ctx?.drawImage(img, 0, 0, width, height);
                                  updateBlogger(idx, "img", canvas.toDataURL("image/jpeg", 0.8));
                                };
                                img.src = event.target?.result as string;
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Ou cole a URL da imagem..."
                        value={blogger.img || ""}
                        onChange={(e) => updateBlogger(idx, "img", e.target.value)}
                        className="w-full text-[11px] border p-2 rounded-md bg-gray-50"
                      />
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                <div className="space-y-3 bg-white p-4 rounded-xl border border-gray-100">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">
                    Redes Sociais
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Facebook size={14} /></div>
                      <input
                        type="text"
                        placeholder="Facebook URL"
                        value={blogger.facebook || ""}
                        onChange={(e) => updateBlogger(idx, "facebook", e.target.value)}
                        className="flex-1 text-xs border-b border-gray-100 py-1 focus:border-blue-300 outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-fuchsia-50 rounded-lg text-fuchsia-600"><Instagram size={14} /></div>
                      <input
                        type="text"
                        placeholder="Instagram URL"
                        value={blogger.instagram || ""}
                        onChange={(e) => updateBlogger(idx, "instagram", e.target.value)}
                        className="flex-1 text-xs border-b border-gray-100 py-1 focus:border-fuchsia-300 outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-sky-50 rounded-lg text-sky-500"><Twitter size={14} /></div>
                      <input
                        type="text"
                        placeholder="Twitter URL"
                        value={blogger.twitter || ""}
                        onChange={(e) => updateBlogger(idx, "twitter", e.target.value)}
                        className="flex-1 text-xs border-b border-gray-100 py-1 focus:border-sky-300 outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-red-50 rounded-lg text-red-600"><Youtube size={14} /></div>
                      <input
                        type="text"
                        placeholder="YouTube URL"
                        value={blogger.youtube || ""}
                        onChange={(e) => updateBlogger(idx, "youtube", e.target.value)}
                        className="flex-1 text-xs border-b border-gray-100 py-1 focus:border-red-300 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Banner and Linking */}
              <div className="lg:col-span-8 space-y-6">
                {/* Linking and Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-1">
                    <label className="block text-[10px] font-black text-primary-base uppercase tracking-wider mb-2">
                      Vincular Usuário do Sistema
                    </label>
                    <select
                      value={blogger.userId || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        const selectedUser = availableUsers.find((u) => u.id === val);
                        if (selectedUser) {
                          const newBloggers = [...bloggers];
                          newBloggers[idx] = {
                            ...newBloggers[idx],
                            userId: val,
                            name: blogger.name || selectedUser.nome || selectedUser.email || "",
                            img: blogger.img || selectedUser.fotoUrl || selectedUser.photoURL || "",
                          };
                          setBloggers(newBloggers);
                        } else {
                          updateBlogger(idx, "userId", val);
                        }
                      }}
                      className="w-full border border-primary-base/20 bg-primary-50/30 p-2.5 rounded-xl text-sm font-bold text-primary-dark focus:ring-2 focus:ring-primary-base/10 transition-all outline-none"
                    >
                      <option value="">-- Sem vínculo / Nome manual --</option>
                      {availableUsers.map((u) => {
                        const r = u.role || u.permissao || u.papel || "colunista";
                        const roleStr = Array.isArray(r) ? r.join(", ") : String(r);
                        return (
                          <option key={u.id} value={u.id}>
                            {u.nome || u.email} ({roleStr})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">
                      Nome Exibido na Home / Aba
                    </label>
                    <input
                      type="text"
                      placeholder="Nome do Colunista"
                      value={blogger.name || ""}
                      onChange={(e) => updateBlogger(idx, "name", e.target.value)}
                      className="w-full border border-gray-200 p-2.5 rounded-xl text-sm font-bold text-gray-700 focus:border-primary-base outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Banner Management */}
                <div className="p-5 bg-white rounded-[20px] border border-gray-200 space-y-5 shadow-sm">
                  <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
                    <Layout size={18} className="text-amber-500" />
                    <h5 className="font-black text-[12px] text-gray-600 uppercase tracking-widest">Configuração do Banner Superior (Aba Colunista)</h5>
                  </div>

                  {/* Banner Image Upload */}
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider">
                      Imagem de Fundo do Banner
                    </label>
                    <div className="relative h-32 w-full rounded-xl overflow-hidden bg-gray-100 border border-gray-200 group/banner">
                      {blogger.bannerImg ? (
                        <img src={blogger.bannerImg} alt="Banner Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-1 bg-gradient-to-br from-gray-50 to-gray-100">
                          <ImageIcon size={24} />
                          <span className="text-[10px] font-bold">SEM IMAGEM DE BANNER</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/banner:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <div className="relative">
                          <button className="bg-white text-primary-dark px-4 py-1.5 rounded-lg text-xs font-black hover:bg-gray-100 transition-all">
                            UPLOAD IMAGEM
                          </button>
                          <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  const img = new Image();
                                  img.onload = () => {
                                    const canvas = document.createElement("canvas");
                                    const MAX_WIDTH = 1920;
                                    let width = img.width;
                                    let height = img.height;
                                    if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
                                    canvas.width = width;
                                    canvas.height = height;
                                    const ctx = canvas.getContext("2d");
                                    ctx?.drawImage(img, 0, 0, width, height);
                                    updateBlogger(idx, "bannerImg", canvas.toDataURL("image/jpeg", 0.7));
                                  };
                                  img.src = event.target?.result as string;
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <input
                      type="text"
                      placeholder="Ou cole o link direto da imagem aqui..."
                      value={blogger.bannerImg || ""}
                      onChange={(e) => updateBlogger(idx, "bannerImg", e.target.value)}
                      className="w-full text-xs border border-gray-100 p-2 rounded-lg bg-gray-50"
                    />
                  </div>

                  {/* Banner Texts */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">
                        Subtítulo (TAG)
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: BLOG OFICIAL"
                        value={blogger.bannerSubtitle || ""}
                        onChange={(e) => updateBlogger(idx, "bannerSubtitle", e.target.value)}
                        className="w-full border border-gray-100 p-2.5 rounded-xl text-xs font-bold bg-gray-50/50"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">
                        Título Principal (Grande)
                      </label>
                      <textarea
                        rows={1}
                        placeholder="Nome do Colunista no Banner"
                        value={blogger.bannerTitle || ""}
                        onChange={(e) => updateBlogger(idx, "bannerTitle", e.target.value)}
                        className="w-full border border-gray-100 p-2.5 rounded-xl text-xs font-bold bg-gray-50/50 resize-none h-[42px]"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">
                        Frase de Impacto (Citação)
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Insira uma frase ou citação curta..."
                        value={blogger.bannerQuote || ""}
                        onChange={(e) => updateBlogger(idx, "bannerQuote", e.target.value)}
                        className="w-full border border-gray-100 p-3 rounded-xl text-xs font-medium italic bg-gray-50/50"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={addBlogger}
          className="w-full py-4 flex items-center justify-center gap-3 text-primary-base font-black text-sm bg-primary-base/5 border-2 border-dashed border-primary-base/20 rounded-2xl hover:bg-primary-base/10 hover:border-primary-base/40 transition-all group"
        >
          <PlusCircle size={20} className="group-hover:scale-110 transition-transform" />
          ADICIONAR NOVO COLUNISTA / BLOG À HOME
        </button>

        {deleteConfirmB !== null && (
          <div className="fixed inset-0 bg-primary-dark/40 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
            <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6 text-center">
              <h3 className="text-xl font-bold text-primary-dark mb-2">Excluir Colunista</h3>
              <p className="text-gray-500 text-sm mb-6">Deseja remover este colunista da home?</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setDeleteConfirmB(null)}
                  className="px-6 py-2.5 font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmRemoveBloggerAction}
                  className="px-6 py-2.5 font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl shadow-lg shadow-red-500/30 transition"
                >
                  Remover
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="pt-6 border-t border-[#e2eaf3] flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold bg-primary-base text-white hover:bg-[#0d4f7a] transition-all shadow-lg shadow-primary-base/20 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
}
