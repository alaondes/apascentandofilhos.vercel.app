import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShoppingBag,
  Search,
  Filter,
  X,
  Plus,
  Minus,
  Trash2,
  Package,
  ShoppingCart,
  CheckCircle2,
  Info,
  Send,
  Loader2,
  ChevronLeft,
  ChevronRight,
  User,
  ArrowLeft,
  AlertTriangle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  writeBatch,
  doc,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import {
  db,
  auth,
  handleFirestoreError,
  OperationType,
} from "../../lib/firebase";
import { useFirebase } from "../../context/FirebaseContext";

interface Material {
  id: string;
  nome: string;
  cod: number;
  preco: number;
  categoria: string;
  emoji: string;
  desc: string;
  cores?: string[];
  fotoUrl?: string;
}

interface CartItem {
  id: string;
  nome: string;
  preco: number;
  qty: number;
  emoji: string;
  fotoUrl?: string;
  cor?: string;
  chave: string;
}

const SEED_MATERIALS = [
  {
    nome: "Copo Fibra de Bambu 2=1 Brasil 350ml",
    cod: 645,
    preco: 20.0,
    categoria: "brindes",
    emoji: "☕",
    desc: "Copo sustentável de fibra de bambu com capacidade de 350ml.",
    fotoUrl:
      "https://images.unsplash.com/photo-1517256064527-09c73fc73e56?auto=format&fit=crop&q=80&w=400",
  },
  {
    nome: "Farol Colorido Tam. G (66x30 cm)",
    cod: 644,
    preco: 130.0,
    categoria: "brindes",
    emoji: "🏠",
    desc: "Farol decorativo colorido tamanho Grande. Perfeito como item decorativo.",
    fotoUrl:
      "https://images.unsplash.com/photo-1534065660851-93e54b6fc090?auto=format&fit=crop&q=80&w=400",
  },
  {
    nome: "Farol Colorido Tam. M (33x16cm)",
    cod: 643,
    preco: 60.0,
    categoria: "brindes",
    emoji: "🏠",
    desc: "Farol decorativo colorido tamanho Médio.",
    fotoUrl:
      "https://images.unsplash.com/photo-1534065660851-93e54b6fc090?auto=format&fit=crop&q=80&w=400",
  },
  {
    nome: "Farol Colorido Tam. P (21x9cm)",
    cod: 642,
    preco: 25.0,
    categoria: "brindes",
    emoji: "🏠",
    desc: "Farol decorativo colorido tamanho Pequeno.",
    fotoUrl:
      "https://images.unsplash.com/photo-1534065660851-93e54b6fc090?auto=format&fit=crop&q=80&w=400",
  },
  {
    nome: "Garrafa Squeeze",
    cod: 454,
    preco: 40.0,
    categoria: "brindes",
    emoji: "🍶",
    desc: "Garrafa squeeze personalizada.",
    fotoUrl:
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=400",
  },
  {
    nome: "Manual Participante – ONE",
    cod: 306,
    preco: 70.0,
    categoria: "livros",
    emoji: "📖",
    desc: "Manual do participante para o curso ONE.",
    fotoUrl:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400",
  },
  {
    nome: "Manual do Líder – Casados para Sempre",
    cod: 301,
    preco: 85.0,
    categoria: "livros",
    emoji: "📙",
    desc: "Guia completo para líderes do curso de casamentos.",
    fotoUrl:
      "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=400",
  },
  {
    nome: "Amor & Respeito",
    cod: 320,
    preco: 45.0,
    categoria: "livros",
    emoji: "📕",
    desc: "Best-seller sobre a dinâmica fundamental entre marido e mulher.",
    fotoUrl:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400",
  },
  {
    nome: "Caneta Personalizada",
    cod: 241,
    preco: 5.0,
    categoria: "papelaria",
    emoji: "🖊️",
    desc: "Caneta personalizada do ministério.",
    cores: ["Azul", "Preta", "Vermelha"],
    fotoUrl:
      "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?auto=format&fit=crop&q=80&w=400",
  },
];

interface PedidoMaterialProps {
  isEmbedded?: boolean;
}

export default function PedidoMaterial({ isEmbedded = false }: PedidoMaterialProps) {
  const navigate = useNavigate();
  const { profile } = useFirebase();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("todos");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [formData, setFormData] = useState({
    nomeLider: "",
    emailLider: "",
    grupoNome: "",
    cidadeEstado: "",
    observacoes: "",
    agreed: false,
    termsAccepted: false,
  });

  useEffect(() => {
    if (profile) {
      const fullName =
        profile.nome ||
        (profile.nomeMarido
          ? `${profile.nomeMarido} ${profile.sobrenome || ""}`.trim()
          : "");
      setFormData((prev) => ({
        ...prev,
        nomeLider: prev.nomeLider || fullName,
        emailLider: prev.emailLider || profile.email || "",
        cidadeEstado:
          prev.cidadeEstado ||
          (profile.cidade && profile.estado
            ? `${profile.cidade} - ${profile.estado}`
            : ""),
      }));
    }
  }, [profile]);

  useEffect(() => {
    const fetchLatestGroup = async () => {
      if (!auth.currentUser) return;
      try {
        const q = query(
          collection(db, "groups"),
          where("liderId", "==", auth.currentUser.uid),
          orderBy("createdAt", "desc"),
          limit(1),
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const groupData = snap.docs[0].data();
          setFormData((prev) => ({
            ...prev,
            nomeLider:
              prev.nomeLider ||
              (groupData.liderMaridoNome
                ? `${groupData.liderMaridoNome} ${groupData.liderEsposaNome ? `e ${groupData.liderEsposaNome}` : ""}`.trim()
                : prev.nomeLider),
            emailLider: prev.emailLider || groupData.liderMaridoEmail || "",
            grupoNome: prev.grupoNome || groupData.curso || "",
            cidadeEstado:
              prev.cidadeEstado ||
              (groupData.liderCidade && groupData.liderEstado
                ? `${groupData.liderCidade} - ${groupData.liderEstado}`
                : prev.cidadeEstado),
          }));
        }
      } catch (error) {
        console.error("Error fetching group Data for autofill:", error);
      }
    };
    fetchLatestGroup();
  }, [auth.currentUser]);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "materials"));
      if (snap.empty) {
        const batch = writeBatch(db);
        SEED_MATERIALS.forEach((mat) => {
          const newDoc = doc(collection(db, "materials"));
          batch.set(newDoc, mat);
        });
        await batch.commit();
        const reSnap = await getDocs(collection(db, "materials"));
        const mats = reSnap.docs.map(
          (d) => ({ id: d.id, ...d.data() }) as Material,
        );
        setMaterials(mats);
      } else {
        const mats = snap.docs.map(
          (d) => ({ id: d.id, ...d.data() }) as Material,
        );
        setMaterials(mats);
      }
    } catch (error) {
      console.error("Erro ao carregar materiais:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const addToCart = (material: Material, qty: number, cor?: string) => {
    const chave = cor ? `${material.id}-${cor}` : material.id;
    setCart((prev) => {
      const existing = prev.find((item) => item.chave === chave);
      if (existing) {
        return prev.map((item) =>
          item.chave === chave ? { ...item, qty: item.qty + qty } : item,
        );
      }
      return [
        ...prev,
        {
          id: material.id,
          nome: material.nome,
          preco: material.preco,
          qty,
          emoji: material.emoji,
          fotoUrl: material.fotoUrl,
          cor,
          chave,
        },
      ];
    });
  };

  const updateCartQty = (chave: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.chave === chave) {
          const newQty = Math.max(1, item.qty + delta);
          return { ...item, qty: newQty };
        }
        return item;
      }),
    );
  };

  const removeFromCart = (chave: string) => {
    setCart((prev) => prev.filter((item) => item.chave !== chave));
  };

  const filteredMaterials = materials.filter((m) => {
    const matchesSearch =
      m.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.categoria.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      activeCategory === "todos" || m.categoria === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredMaterials.length / itemsPerPage);
  const currentMaterials = filteredMaterials.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const total = cart.reduce((sum, item) => sum + item.preco * item.qty, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    if (cart.length === 0) return alert("Seu carrinho está vazio!");
    if (!formData.agreed || !formData.termsAccepted)
      return alert("Você precisa aceitar os termos para continuar.");

    setSubmitting(true);
    const path = "orders";
    try {
      await addDoc(collection(db, path), {
        liderId: auth.currentUser.uid,
        nomeLider: formData.nomeLider,
        emailLider: formData.emailLider,
        grupoNome: formData.grupoNome,
        cidadeEstado: formData.cidadeEstado,
        observacoes: formData.observacoes,
        itens: cart.map((item) => ({
          materialId: item.id,
          nome: item.nome,
          qty: item.qty,
          precoUnitario: item.preco,
          cor: item.cor || null,
        })),
        total,
        status: "Pendente",
        createdAt: serverTimestamp(),
      });
      setOrderSuccess(true);
      setCart([]);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    } finally {
      setSubmitting(false);
    }
  };

  if (orderSuccess) {
    const successContent = (
      <div className="flex-grow flex items-center justify-center p-6 bg-[#f7fafd] w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-12 rounded-[20px] shadow-[0_8px_32px_rgba(26,100,150,0.08)] border-[1.5px] border-[#c8d8e8] text-center max-w-lg space-y-6"
        >
          <div className="w-20 h-20 bg-primary-bg border border-[#c8d8e8] rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={40} className="text-[#27ae60]" />
          </div>
          <h2 className="text-3xl font-serif text-primary-base font-bold">
            Pedido Realizado!
          </h2>
          <p className="text-[#555] font-medium">
            Seu pedido foi registrado com sucesso. Você receberá um e-mail com
            os detalhes em breve.
          </p>
          <button
            onClick={() => setOrderSuccess(false)}
            className="px-8 py-3 bg-primary-base hover:bg-[#155079] text-white rounded-xl font-bold shadow-sm transition-colors cursor-pointer"
          >
            Fazer outro Pedido
          </button>
        </motion.div>
      </div>
    );
    return isEmbedded ? successContent : <DashboardLayout>{successContent}</DashboardLayout>;
  }

  const innerContent = (
    <div className="w-full">
      <section className="bg-gradient-to-br from-primary-base to-primary-light text-white py-14 text-center shadow-inner relative">
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="max-w-5xl mx-auto px-6 relative z-10 space-y-2">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[2.2rem] md:text-4xl font-black font-serif flex justify-center items-center gap-3 text-white"
          >
            <Package size={36} /> Material para Grupos
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-white/90 font-medium max-w-[600px] mx-auto text-[1.1rem]"
          >
            Selecione os materiais para o seu grupo, adicione ao pedido e
            finalize com seus dados.
          </motion.p>
        </div>
      </section>

      <section className="bg-[#f7fafd] min-h-screen py-8">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Left Panel - Catalog */}
            <div className="flex-1 rounded-[20px] bg-white shadow-[0_8px_32px_rgba(26,100,150,0.08)] border-[1.5px] border-[#c8d8e8] p-6 md:p-8">
              {/* Search and Filters */}
              <div className="border-b-2 border-[#e2eaf3] pb-6 mb-6">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <Search className="text-primary-base" size={20} shrink-0 />
                    <span className="font-bold text-primary-dark text-lg font-serif">
                      Buscar material
                    </span>
                  </div>
                  <div className="flex w-full md:w-auto gap-2">
                    <input
                      type="text"
                      placeholder="Buscar material..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full md:w-72 border-[1.5px] border-[#c8d8e8] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary-base bg-[#f7fafd] focus:bg-white focus:ring-[3px] focus:ring-primary-base/10 font-medium text-text-main"
                    />
                    <button className="bg-primary-base text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-[#155079] transition-colors shrink-0 flex items-center gap-2 shadow-sm">
                      <Search size={16} /> Buscar
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "todos", label: "Todos" },
                    { id: "livros", label: "Livros" },
                    { id: "acessorios", label: "Acessórios" },
                    { id: "brindes", label: "Brindes" },
                    { id: "papelaria", label: "Papelaria" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setActiveCategory(cat.id);
                        setCurrentPage(1);
                      }}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border shadow-sm ${
                        activeCategory === cat.id
                          ? "bg-primary-base text-white border-primary-base"
                          : "bg-white text-[#555] border-[#c8d8e8] hover:border-primary-base hover:text-primary-base"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="py-20 flex flex-col items-center gap-4">
                  <Loader2 className="animate-spin text-[#3b7197]" size={40} />
                </div>
              ) : filteredMaterials.length === 0 ? (
                <div className="py-20 text-center text-gray-400">
                  Nenhum material encontrado.
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {currentMaterials.map((mat) => (
                      <MaterialCard
                        key={mat.id}
                        material={mat}
                        onAdd={addToCart}
                      />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-10">
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={currentPage === 1}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border-[1.5px] border-[#c8d8e8] text-[#555] hover:bg-[#f7fafd] disabled:opacity-50 font-bold transition-colors"
                      >
                        <ChevronLeft size={16} />
                      </button>

                      {Array.from({ length: totalPages }).map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentPage(idx + 1)}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors border-[1.5px] ${
                            currentPage === idx + 1
                              ? "bg-primary-base text-white border-primary-base"
                              : "bg-white text-[#555] border-[#c8d8e8] hover:border-primary-base hover:text-primary-base"
                          }`}
                        >
                          {idx + 1}
                        </button>
                      ))}

                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(totalPages, prev + 1),
                          )
                        }
                        disabled={currentPage === totalPages}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border-[1.5px] border-[#c8d8e8] text-[#555] hover:bg-[#f7fafd] disabled:opacity-50 font-bold transition-colors"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Right Panel - Cart Form */}
            <div className="w-full lg:w-[400px] shrink-0 sticky top-6">
              <div className="bg-white rounded-[20px] shadow-[0_8px_32px_rgba(26,100,150,0.08)] border-[1.5px] border-[#c8d8e8] overflow-hidden flex flex-col">
                <div className="bg-primary-base text-white p-5 flex flex-col border-b border-[#155079]">
                  <div className="flex items-center gap-3 mb-1">
                    <ShoppingCart size={22} />
                    <h3 className="font-bold text-lg font-serif">Meu Pedido</h3>
                    <span className="bg-[#eac44e] text-primary-base text-xs font-black px-2 py-0.5 rounded-full min-w-[20px] text-center shadow-sm">
                      {totalItems}
                    </span>
                  </div>
                  <p className="text-white/80 text-sm font-medium">
                    Adicione itens e preencha seus dados para finalizar
                  </p>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(100vh-150px)] no-scrollbar bg-white">
                  {/* Form section */}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <h4 className="flex items-center gap-2 font-black text-primary-base text-sm border-b-2 border-[#e2eaf3] pb-2 mb-4 uppercase tracking-wide">
                        <User size={16} /> Dados do Solicitante
                      </h4>

                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                            Nome completo{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.nomeLider}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                nomeLider: e.target.value,
                              })
                            }
                            placeholder="Seu nome completo"
                            className="w-full border-[1.5px] border-[#c8d8e8] rounded-lg px-3 py-2 text-[0.92rem] text-text-main bg-[#f7fafd] focus:border-primary-base focus:bg-white focus:ring-[3px] focus:ring-primary-base/10 outline-none transition-all placeholder:text-[#b0c4d5]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                            E-mail <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            required
                            value={formData.emailLider}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                emailLider: e.target.value,
                              })
                            }
                            placeholder="seu@email.com"
                            className="w-full border-[1.5px] border-[#c8d8e8] rounded-lg px-3 py-2 text-[0.92rem] text-text-main bg-[#f7fafd] focus:border-primary-base focus:bg-white focus:ring-[3px] focus:ring-primary-base/10 outline-none transition-all placeholder:text-[#b0c4d5]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                            Nome do Grupo / Turma{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.grupoNome}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                grupoNome: e.target.value,
                              })
                            }
                            placeholder="Ex.: Turma Esperança"
                            className="w-full border-[1.5px] border-[#c8d8e8] rounded-lg px-3 py-2 text-[0.92rem] text-text-main bg-[#f7fafd] focus:border-primary-base focus:bg-white focus:ring-[3px] focus:ring-primary-base/10 outline-none transition-all placeholder:text-[#b0c4d5]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                            Cidade / Estado{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.cidadeEstado}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                cidadeEstado: e.target.value,
                              })
                            }
                            placeholder="Ex.: São Paulo - SP"
                            className="w-full border-[1.5px] border-[#c8d8e8] rounded-lg px-3 py-2 text-[0.92rem] text-text-main bg-[#f7fafd] focus:border-primary-base focus:bg-white focus:ring-[3px] focus:ring-primary-base/10 outline-none transition-all placeholder:text-[#b0c4d5]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[0.83rem] font-semibold text-[#2c4a63] mb-1 truncate">
                            Observações
                          </label>
                          <textarea
                            value={formData.observacoes}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                observacoes: e.target.value,
                              })
                            }
                            placeholder="Informações adicionais (opcional)"
                            className="w-full border-[1.5px] border-[#c8d8e8] rounded-lg px-3 py-2 text-[0.92rem] text-text-main bg-[#f7fafd] focus:border-primary-base focus:bg-white focus:ring-[3px] focus:ring-primary-base/10 outline-none transition-all placeholder:text-[#b0c4d5] min-h-[60px]"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="flex items-center gap-2 font-black text-primary-base text-sm border-b-2 border-[#e2eaf3] pb-2 mb-4 uppercase tracking-wide">
                        <ShoppingBag size={16} /> Itens Selecionados
                      </h4>

                      {cart.length === 0 ? (
                        <div className="py-8 text-center text-[#a0b8cc]">
                          <ShoppingCart
                            className="mx-auto text-[#e2eaf3] mb-2"
                            size={40}
                          />
                          <p className="text-sm font-medium">
                            Nenhum item adicionado ainda.
                            <br />
                            Escolha produtos ao lado.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4 mb-6">
                          {cart.map((item) => (
                            <div
                              key={item.chave}
                              className="flex gap-3 items-start border-b border-[#e2eaf3] pb-3 last:border-0 last:pb-0 group"
                            >
                              <div className="w-12 h-12 bg-[#f7fafd] flex items-center justify-center rounded-lg text-xl border border-[#c8d8e8] shrink-0 overflow-hidden">
                                {item.fotoUrl ? (
                                  <img
                                    src={item.fotoUrl || undefined}
                                    alt={item.nome}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  item.emoji
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="text-[0.92rem] font-bold text-primary-dark leading-tight mb-1">
                                  {item.nome}
                                </p>
                                <div className="flex justify-between items-center">
                                  <span className="text-xs font-semibold text-[#555]">
                                    {item.qty} un x R${" "}
                                    {item.preco.toFixed(2).replace(".", ",")}
                                    {item.cor && ` | ${item.cor}`}
                                  </span>
                                  <span className="text-sm font-black text-[#27ae60] font-mono">
                                    R${" "}
                                    {(item.preco * item.qty)
                                      .toFixed(2)
                                      .replace(".", ",")}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                  <div className="flex items-center gap-2 border-[1.5px] border-[#c8d8e8] rounded-md px-2 py-0.5 w-fit bg-[#f7fafd]">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        updateCartQty(item.chave, -1)
                                      }
                                      className="text-[#a0b8cc] hover:text-primary-base"
                                    >
                                      <Minus size={12} />
                                    </button>
                                    <span className="text-xs font-bold w-4 text-center text-primary-dark">
                                      {item.qty}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        updateCartQty(item.chave, 1)
                                      }
                                      className="text-[#a0b8cc] hover:text-primary-base"
                                    >
                                      <Plus size={12} />
                                    </button>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeFromCart(item.chave)}
                                    className="text-red-400 hover:text-red-600 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <Trash2 size={12} /> Remover
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                          <div className="pt-4 border-t-2 border-[#e2eaf3] flex justify-between items-center">
                            <span className="font-bold text-[#2c4a63] font-serif text-[1.1rem]">
                              Total do Pedido:
                            </span>
                            <span className="font-black text-[1.35rem] text-[#27ae60] font-mono">
                              R$ {total.toFixed(2).replace(".", ",")}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="bg-[#fff9e6] border-[1.5px] border-[#f5e6b4] text-[#8a6d3b] p-3 rounded-xl text-xs leading-relaxed flex gap-3 mb-6 shadow-sm">
                        <AlertTriangle
                          size={18}
                          className="shrink-0 mt-0.5 text-[#d0a74b]"
                        />
                        <p className="font-medium">
                          Os pedidos são processados em até 5 dias úteis.
                          Verifique a disponibilidade com o ministério.
                        </p>
                      </div>

                      <div className="space-y-3">
                        <label className="flex items-start gap-2.5 cursor-pointer group">
                          <div className="relative flex items-center">
                            <input
                              type="checkbox"
                              required
                              checked={formData.agreed}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  agreed: e.target.checked,
                                })
                              }
                              className="peer mt-0.5 shrink-0 appearance-none w-4 h-4 border-[1.5px] border-[#c8d8e8] rounded bg-[#f7fafd] checked:bg-primary-base checked:border-primary-base transition-colors"
                            />
                            <CheckCircle2
                              size={12}
                              className="absolute left-[2px] top-[4px] text-white opacity-0 peer-checked:opacity-100 pointer-events-none"
                            />
                          </div>
                          <span className="text-xs text-[#555] font-medium group-hover:text-text-main transition-colors">
                            Confirmo que os itens e dados estão corretos e
                            autorizo o processamento do pedido.
                          </span>
                        </label>

                        <label className="flex items-start gap-2.5 cursor-pointer group">
                          <div className="relative flex items-center">
                            <input
                              type="checkbox"
                              required
                              checked={formData.termsAccepted}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  termsAccepted: e.target.checked,
                                })
                              }
                              className="peer mt-0.5 shrink-0 appearance-none w-4 h-4 border-[1.5px] border-[#c8d8e8] rounded bg-[#f7fafd] checked:bg-primary-base checked:border-primary-base transition-colors"
                            />
                            <CheckCircle2
                              size={12}
                              className="absolute left-[2px] top-[4px] text-white opacity-0 peer-checked:opacity-100 pointer-events-none"
                            />
                          </div>
                          <span className="text-xs text-[#555] font-medium group-hover:text-text-main transition-colors">
                            Li e aceito os{" "}
                            <span className="text-primary-base font-bold underline">
                              Termos de Uso
                            </span>{" "}
                            do ministério.
                          </span>
                        </label>
                      </div>
                    </div>

                    <div className="pt-4 space-y-3 border-t-2 border-[#e2eaf3] mt-6">
                      <button
                        type="submit"
                        disabled={submitting || cart.length === 0}
                        className="w-full py-3.5 bg-primary-base text-white rounded-xl font-bold shadow-md hover:bg-[#155079] hover:shadow-lg disabled:opacity-50 disabled:hover:shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        {submitting ? (
                          <Loader2 className="animate-spin" size={18} />
                        ) : (
                          <Send size={18} />
                        )}
                        Finalizar Pedido
                      </button>

                      <Link
                        to="/dashboard"
                        className="w-full flex items-center justify-center gap-2 text-xs font-bold text-[#a0b8cc] hover:text-primary-base transition-colors py-2 uppercase tracking-wide"
                      >
                        <ArrowLeft size={14} /> Voltar para a Área do Líder
                      </Link>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  return isEmbedded ? innerContent : <DashboardLayout>{innerContent}</DashboardLayout>;
}

// Separate component for the Material card to manage its own state (qty, color)
interface MaterialCardProps {
  material: Material;
  onAdd: (m: Material, q: number, c?: string) => void;
}

const MaterialCard: React.FC<MaterialCardProps> = ({ material, onAdd }) => {
  const [qty, setQty] = useState(1);
  const [selectedColor, setSelectedColor] = useState(
    material.cores ? material.cores[0] : undefined,
  );

  const handleAdd = () => {
    onAdd(material, qty, selectedColor);
    setQty(1); // Reset qty after add
  };

  return (
    <div className="bg-white border-[1.5px] border-[#c8d8e8] rounded-[16px] overflow-hidden shadow-sm hover:shadow-[0_8px_32px_rgba(26,100,150,0.12)] hover:border-primary-base transition-all flex flex-col h-full group">
      {/* Product Image Box */}
      <div className="bg-[#f7fafd] h-48 flex items-center justify-center border-b-[1.5px] border-[#c8d8e8] relative overflow-hidden">
        {material.fotoUrl ? (
          <img
            src={material.fotoUrl || undefined}
            alt={material.nome}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <span className="text-7xl opacity-90 group-hover:scale-110 transition-transform cursor-default drop-shadow-md">
            {material.emoji}
          </span>
        )}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md shadow-sm border border-[#c8d8e8]">
          <span className="text-[10px] font-bold text-primary-base uppercase tracking-wider">
            {material.categoria}
          </span>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-primary-dark text-[1.05rem] leading-tight mb-1.5 group-hover:text-primary-base transition-colors">
          {material.nome}
        </h3>
        <p className="text-[11px] font-bold text-[#a0b8cc] mb-3 uppercase tracking-wider">
          Cod: {material.cod}
        </p>

        <p className="text-xl font-black text-[#27ae60] font-mono mb-4">
          R$ {material.preco.toFixed(2).replace(".", ",")}
        </p>

        {material.cores && (
          <div className="mb-4">
            <div className="flex gap-2 flex-wrap">
              {material.cores.map((cor) => (
                <button
                  key={cor}
                  onClick={() => setSelectedColor(cor)}
                  className={`px-2.5 py-1 rounded-md text-[10px] uppercase font-bold transition-all border ${
                    selectedColor === cor
                      ? "bg-primary-dark text-white border-primary-dark shadow-md"
                      : "bg-[#f7fafd] text-[#555] border-[#c8d8e8] hover:border-primary-base hover:text-primary-base"
                  }`}
                >
                  {cor}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-auto flex gap-3 items-center">
          <div className="flex items-center border-[1.5px] border-[#c8d8e8] rounded-xl h-11 w-28 bg-[#f7fafd]">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="flex-1 flex items-center justify-center text-[#a0b8cc] hover:text-primary-base transition-colors"
            >
              <Minus size={16} />
            </button>
            <span className="w-10 text-center text-[1.05rem] font-bold text-primary-dark">
              {qty}
            </span>
            <button
              onClick={() => setQty(qty + 1)}
              className="flex-1 flex items-center justify-center text-[#a0b8cc] hover:text-primary-base transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>

          <button
            onClick={handleAdd}
            className="flex-1 bg-primary-base text-white h-11 rounded-xl font-bold text-[0.92rem] shadow hover:bg-[#155079] hover:shadow-md transition-all flex items-center justify-center gap-2"
          >
            <ShoppingCart size={18} /> Adicionar
          </button>
        </div>

        <p
          className="mt-4 text-[#555] text-[0.8rem] leading-relaxed line-clamp-2"
          title={material.desc}
        >
          {material.desc}
        </p>
      </div>
    </div>
  );
};
