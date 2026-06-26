import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Save, Loader2, Plus, Trash2, Upload, Image as ImageIcon, Heart, MessageCircle, Book, LayoutPanelLeft } from "lucide-react";
import { motion } from "motion/react";

function darkenColor(hex: string, percent: number): string {
  let num = parseInt(hex.replace("#", ""), 16);
  let r = (num >> 16) - Math.round(2.55 * percent);
  let g = ((num >> 8) & 0x00FF) - Math.round(2.55 * percent);
  let b = (num & 0x0000FF) - Math.round(2.55 * percent);
  r = Math.max(0, r);
  g = Math.max(0, g);
  b = Math.max(0, b);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function mixWithWhite(hex: string, ratio: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  
  const rMix = Math.round(r * (1 - ratio) + 255 * ratio);
  const gMix = Math.round(g * (1 - ratio) + 255 * ratio);
  const bMix = Math.round(b * (1 - ratio) + 255 * ratio);
  
  return `#${((1 << 24) + (rMix << 16) + (gMix << 8) + bMix).toString(16).slice(1)}`;
}

function generateThemeFromBase(name: string, baseColor: string) {
  const cleanHex = baseColor.startsWith("#") ? baseColor : `#${baseColor}`;
  return {
    id: `custom_${Date.now()}`,
    name: name,
    baseColor: cleanHex,
    bg: mixWithWhite(cleanHex, 0.96),
    border: mixWithWhite(cleanHex, 0.65),
    tBg: cleanHex,
    btn: cleanHex,
    btnDark: darkenColor(cleanHex, 15),
    text: darkenColor(cleanHex, 30),
    iconBg: mixWithWhite(cleanHex, 0.90)
  };
}

const SYSTEM_COLORS = [
  { id: "pink", name: "Rosa", emoji: "💖", baseColor: "#e91e63" },
  { id: "orange", name: "Laranja", emoji: "🧡", baseColor: "#ff9800" },
  { id: "green", name: "Verde", emoji: "💚", baseColor: "#4caf50" },
  { id: "blue", name: "Azul", emoji: "💙", baseColor: "#2196f3" },
  { id: "purple", name: "Roxo", emoji: "💜", baseColor: "#9c27b0" },
  { id: "yellow", name: "Amarelo", emoji: "💛", baseColor: "#fbc02d" },
  { id: "red", name: "Vermelho", emoji: "❤️", baseColor: "#f44336" },
  { id: "cyan", name: "Ciano", emoji: "🩵", baseColor: "#00bcd4" },
  { id: "teal", name: "Verde-Água", emoji: "💚", baseColor: "#009688" },
  { id: "brown", name: "Marrom", emoji: "🤎", baseColor: "#795548" },
  { id: "lime", name: "Verde Limão", emoji: "💛", baseColor: "#afb42b" },
  { id: "grape", name: "Uva", emoji: "💜", baseColor: "#8e24aa" }
];

const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const max = 1200;

        if (width > height) {
          if (width > max) {
            height = Math.round((height *= max / width));
            width = max;
          }
        } else {
          if (height > max) {
            width = Math.round((width *= max / height));
            height = max;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        resolve(dataUrl);
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

interface MafKidsAdminProps {
  activeSection?: string;
}

export default function MafKidsAdmin({ activeSection = "maf_kids_header" }: MafKidsAdminProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const activeTab = activeSection === "maf_kids" ? "header" : activeSection.replace("maf_kids_", "");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // States for the custom color manager modal
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);
  const [editingColorId, setEditingColorId] = useState<string | null>(null);
  const [colorFormName, setColorFormName] = useState("");
  const [colorFormHex, setColorFormHex] = useState("#e91e63");
  const [bottomColorName, setBottomColorName] = useState("");
  const [bottomColorHex, setBottomColorHex] = useState("#e91e63");
  const [newRuleInput, setNewRuleInput] = useState("");
  const [newProgramInput, setNewProgramInput] = useState("");

  useEffect(() => {
    async function fetch() {
      const snap = await getDoc(doc(db, "content", "maf_kids"));
      if (snap.exists()) {
        const fetched = snap.data();
        setData({
          ...defaultMafKidsData,
          ...fetched,
          header: { ...defaultMafKidsData.header, ...fetched.header },
          middle1: { ...defaultMafKidsData.middle1, ...fetched.middle1 },
          books: { ...defaultMafKidsData.books, ...fetched.books },
          footer: { ...defaultMafKidsData.footer, ...fetched.footer },
          projectInfo: { ...defaultMafKidsData.projectInfo, ...(fetched.projectInfo || {}) }
        });
      } else {
        setData(defaultMafKidsData);
      }
      setLoading(false);
    }
    fetch();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSuccessMessage(null);
    try {
      await setDoc(doc(db, "content", "maf_kids"), data);
      setSuccessMessage("Sucesso! Alterações salvas com sucesso.");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (e: any) {
      alert("Erro ao salvar: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleNestedChange = (path: string[], value: any) => {
    setData((prev: any) => {
      const copy = { ...prev };
      let current = copy;
      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) current[path[i]] = {};
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      return copy;
    });
  };

  const handleArrayChange = (pathPath: string[], index: number, field: string, value: any) => {
    setData((prev: any) => {
      const copy = { ...prev };
      let current = copy;
      for (let i = 0; i < pathPath.length; i++) {
        if (!current[pathPath[i]]) current[pathPath[i]] = [];
        current = current[pathPath[i]];
      }
      if (current[index]) {
        current[index][field] = value;
      }
      return copy;
    });
  };

  if (loading) {
    return (
      <div className="p-10 flex justify-center items-center min-h-[500px]">
        <Loader2 className="animate-spin text-[#2D6A9F] w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[14px] border-[1.5px] border-[#c8d8e8] shadow-sm overflow-hidden min-h-[500px]">
      {/* 1. Header principal no estilo do Painel Edificado Matrim. */}
      <div className="border-b border-[#e2eaf3] p-6 lg:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-[#f0f6fb] to-white">
        <div>
          <h2 className="text-2xl font-black text-[#2D6A9F] tracking-tight font-serif flex items-center gap-2">
            Painel MAF Kids
          </h2>
          <p className="text-gray-500 text-sm mt-1 font-medium">
            Conteúdo da Página MAF Kids
          </p>
        </div>
        <div className="flex items-center gap-3">
          {successMessage && (
            <motion.span
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-green-600 font-bold text-sm"
            >
              {successMessage}
            </motion.span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-[#2D6A9F] text-white rounded-xl font-bold text-sm hover:bg-[#245785] shadow-md disabled:bg-gray-400 transition transform active:scale-95"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Salvar Alterações
          </button>
        </div>
      </div>

      <div className="p-6 lg:p-8 space-y-6">
        {/* Seções Ativas baseadas na seleção */}

        {/* Abas 1: Cabeçalho (Header) */}
        {activeTab === "header" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white border border-[#e2eaf3] p-6 lg:p-8 rounded-2xl space-y-6 shadow-sm">
              <h4 className="font-bold text-primary-dark mb-1 flex items-center gap-2 text-lg">
                <ImageIcon className="text-[#2D6A9F]" size={20} />
                Configurações do Cabeçalho (Header)
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed italic border-b border-gray-100 pb-4">
                Edite os banners, logos, títulos e selos do topo da página do MAF Kids.
              </p>

              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase pl-1">Imagem de Fundo (Background do Topo)</label>
                  <div className="flex gap-2 items-center">
                    <input 
                      type="text" 
                      className="w-full p-2.5 border border-[#c8d8e8] rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2D6A9F]/20 outline-none transition-all" 
                      placeholder="https://exemplo.com/imagem.jpg" 
                      value={data.header?.bgImageUrl || ""} 
                      onChange={e => handleNestedChange(["header", "bgImageUrl"], e.target.value)} 
                    />
                    <label className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl cursor-pointer font-bold text-sm transition-colors border border-gray-200 whitespace-nowrap">
                      <Upload size={18} />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const base64 = await compressImage(file);
                              handleNestedChange(["header", "bgImageUrl"], base64);
                            } catch (err) {
                              alert("Erro ao processar imagem.");
                            }
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase pl-1">Logo Central com Fundo Transparente (Opcional)</label>
                  <div className="flex gap-2 items-center">
                    <input 
                      type="text" 
                      className="w-full p-2.5 border border-[#c8d8e8] rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2D6A9F]/20 outline-none transition-all" 
                      placeholder="https://exemplo.com/logo.png" 
                      value={data.header?.logoUrl || ""} 
                      onChange={e => handleNestedChange(["header", "logoUrl"], e.target.value)} 
                    />
                    <label className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl cursor-pointer font-bold text-sm transition-colors border border-gray-200 whitespace-nowrap">
                      <Upload size={18} />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const base64 = await compressImage(file);
                              handleNestedChange(["header", "logoUrl"], base64);
                            } catch (err) {
                              alert("Erro ao processar imagem.");
                            }
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase pl-1">Título Principal (Só aparece se não houver imagem de fundo)</label>
                  <input 
                    type="text" 
                    className="w-full p-2.5 border border-[#c8d8e8] rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2D6A9F]/20 outline-none transition-all font-semibold" 
                    value={data.header?.title || ""} 
                    onChange={e => handleNestedChange(["header", "title"], e.target.value)} 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase pl-1">Subtítulo</label>
                  <input 
                    type="text" 
                    className="w-full p-2.5 border border-[#c8d8e8] rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2D6A9F]/20 outline-none transition-all" 
                    value={data.header?.subtitle || ""} 
                    onChange={e => handleNestedChange(["header", "subtitle"], e.target.value)} 
                  />
                </div>

                {/* Selos (Badges) */}
                <div className="space-y-4 pt-6 border-t border-gray-100">
                  <h5 className="font-bold text-primary-dark text-sm uppercase pl-1 tracking-wide">Selos (Badges)</h5>
                  <div className="grid grid-cols-1 gap-4">
                    {data.header?.badges?.map((b: any, i: number) => (
                      <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-[#fcfdfe] rounded-xl border border-[#e2eaf3] shadow-sm">
                        <div className="space-y-1">
                          <label className="text-[9px] text-gray-400 font-bold uppercase">Título do Selo #{i+1}</label>
                          <input 
                            type="text" 
                            className="w-full p-2 border border-[#c8d8e8] rounded-lg text-xs font-semibold bg-white outline-none focus:ring-2 focus:ring-[#2D6A9F]/10 focus:border-[#2D6A9F] transition-all" 
                            placeholder="Título" 
                            value={b.title || ""} 
                            onChange={e => handleArrayChange(["header", "badges"], i, "title", e.target.value)} 
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-gray-400 font-bold uppercase">Descrição</label>
                          <input 
                            type="text" 
                            className="w-full p-2 border border-[#c8d8e8] rounded-lg text-xs bg-white outline-none focus:ring-2 focus:ring-[#2D6A9F]/10 focus:border-[#2D6A9F] transition-all" 
                            placeholder="Descrição" 
                            value={b.desc || ""} 
                            onChange={e => handleArrayChange(["header", "badges"], i, "desc", e.target.value)} 
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-gray-400 font-bold uppercase">Cor do Tema</label>
                          <select 
                            className="w-full p-2 border border-[#c8d8e8] rounded-lg text-xs bg-white outline-none cursor-pointer focus:ring-2 focus:ring-[#2D6A9F]/10 transition-all font-semibold" 
                            value={b.color || "pink"} 
                            onChange={e => handleArrayChange(["header", "badges"], i, "color", e.target.value)}
                          >
                            <option value="pink">Rosa</option>
                            <option value="green">Verde</option>
                            <option value="yellow">Amarelo</option>
                            <option value="purple">Roxo</option>
                            <option value="blue">Azul</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Banners Adicionados aqui no editor de cabeçalho no final de selos */}
                <div className="space-y-4 pt-6 border-t border-gray-100">
                  <h5 className="font-bold text-primary-dark text-sm uppercase pl-1 tracking-wide">Banners de Destaque (Botões Inferiores)</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5 p-4 bg-[#f0f7fc] border border-[#d6e5f3] rounded-xl relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-[#1e88e5]"></div>
                      <label className="text-[10px] text-[#1e88e5] font-black uppercase pl-1">Banner Azul (Topo)</label>
                      <input 
                        type="text" 
                        className="w-full p-2.5 border border-[#c8d8e8] rounded-xl text-sm bg-white focus:ring-2 focus:ring-[#1e88e5]/20 outline-none transition-all font-bold" 
                        value={data.header?.bannerBlue || "TODO DIA TEM ALGO NOVO AQUI!"} 
                        onChange={e => handleNestedChange(["header", "bannerBlue"], e.target.value)} 
                      />
                    </div>
                    <div className="space-y-1.5 p-4 bg-[#fffcf0] border border-[#fbe7a4] rounded-xl relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-[#ffca28]"></div>
                      <label className="text-[10px] text-[#e65100] font-black uppercase pl-1">Banner Amarelo (Topo)</label>
                      <input 
                        type="text" 
                        className="w-full p-2.5 border border-[#fbe7a4] rounded-xl text-sm bg-white focus:ring-2 focus:ring-[#ffca28]/20 outline-none transition-all font-bold" 
                        value={data.header?.bannerYellow || "VENHA FAZER PARTE DESSA FAMÍLIA!"} 
                        onChange={e => handleNestedChange(["header", "bannerYellow"], e.target.value)} 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Seção footer de ações */}
              <div className="flex justify-end pt-6 border-t border-gray-150 align-center gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#2D6A9F] text-white font-bold rounded-xl hover:bg-[#245785] transition shadow-md disabled:bg-gray-400 text-sm"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Salvar Cabeçalho
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Aba 2: A Cor da Criação */}
        {activeTab === "criacao" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white border border-[#e2eaf3] p-6 lg:p-8 rounded-2xl space-y-6 shadow-sm">
              <h4 className="font-bold text-primary-dark mb-1 flex items-center gap-2 text-lg">
                <span className="text-xl">🎨</span>
                Configurações: A Cor da Criação
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed italic border-b border-gray-100 pb-4">
                Edite os textos e mídias de suporte à seção "A Cor da Criação" na página do MAF Kids.
              </p>

              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase pl-1">Título da Seção</label>
                  <input 
                    type="text" 
                    className="w-full p-2.5 border border-[#c8d8e8] rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2D6A9F]/20 outline-none transition-all font-bold text-gray-700" 
                    value={data.middle1?.leftBox?.title || ""} 
                    onChange={e => handleNestedChange(["middle1", "leftBox", "title"], e.target.value)} 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase pl-1">Descrição</label>
                  <textarea 
                    rows={4}
                    className="w-full p-2.5 border border-[#c8d8e8] rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2D6A9F]/20 outline-none transition-all resize-none text-gray-700 leading-relaxed" 
                    value={data.middle1?.leftBox?.desc || ""} 
                    onChange={e => handleNestedChange(["middle1", "leftBox", "desc"], e.target.value)} 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase pl-1">Imagem Principal da Seção (URL ou upload)</label>
                  <div className="flex gap-2 items-center">
                    <input 
                      type="text" 
                      className="w-full p-2.5 border border-[#c8d8e8] rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2D6A9F]/20 outline-none transition-all" 
                      placeholder="https://exemplo.com/imagem.jpg" 
                      value={data.middle1?.leftBox?.imageUrl || ""} 
                      onChange={e => handleNestedChange(["middle1", "leftBox", "imageUrl"], e.target.value)} 
                    />
                    <label className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl cursor-pointer font-bold text-sm transition-colors border border-gray-200 whitespace-nowrap">
                      <Upload size={18} />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const base64 = await compressImage(file);
                              handleNestedChange(["middle1", "leftBox", "imageUrl"], base64);
                            } catch (err) {
                              alert("Erro ao processar imagem.");
                            }
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t border-gray-150">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#2D6A9F] text-white font-bold rounded-xl hover:bg-[#245785] transition shadow-md disabled:bg-gray-400 text-sm"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Salvar A Cor da Criação
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Aba 3: Conselhos aos Pais */}
        {activeTab === "conselhos" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white border border-[#e2eaf3] p-6 lg:p-8 rounded-2xl space-y-6 shadow-sm">
              <h4 className="font-bold text-primary-dark mb-1 flex items-center gap-2 text-lg">
                <span className="text-xl">👨‍👩‍👧‍👦</span>
                Configurações: Conselhos aos Pais
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed italic border-b border-gray-100 pb-4">
                Edite os títulos, descrições e mídias da seção de dicas e diretrizes para apoiar pais e responsáveis.
              </p>

              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase pl-1">Título da Seção</label>
                  <input 
                    type="text" 
                    className="w-full p-2.5 border border-[#c8d8e8] rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2D6A9F]/20 outline-none transition-all font-bold text-gray-700" 
                    value={data.middle1?.rightBox?.title || ""} 
                    onChange={e => handleNestedChange(["middle1", "rightBox", "title"], e.target.value)} 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase pl-1">Descrição</label>
                  <textarea 
                    rows={4}
                    className="w-full p-2.5 border border-[#c8d8e8] rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2D6A9F]/20 outline-none transition-all resize-none text-gray-700 leading-relaxed" 
                    value={data.middle1?.rightBox?.desc || ""} 
                    onChange={e => handleNestedChange(["middle1", "rightBox", "desc"], e.target.value)} 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase pl-1">Imagem Associada da Seção (URL ou upload)</label>
                  <div className="flex gap-2 items-center">
                    <input 
                      type="text" 
                      className="w-full p-2.5 border border-[#c8d8e8] rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2D6A9F]/20 outline-none transition-all" 
                      placeholder="https://exemplo.com/imagem.jpg" 
                      value={data.middle1?.rightBox?.imageUrl || ""} 
                      onChange={e => handleNestedChange(["middle1", "rightBox", "imageUrl"], e.target.value)} 
                    />
                    <label className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl cursor-pointer font-bold text-sm transition-colors border border-gray-200 whitespace-nowrap">
                      <Upload size={18} />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const base64 = await compressImage(file);
                              handleNestedChange(["middle1", "rightBox", "imageUrl"], base64);
                            } catch (err) {
                              alert("Erro ao processar imagem.");
                            }
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t border-gray-150">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#2D6A9F] text-white font-bold rounded-xl hover:bg-[#245785] transition shadow-md disabled:bg-gray-400 text-sm"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Salvar Conselhos aos Pais
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Aba 4: Livrinhos */}
        {activeTab === "livrinhos" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white border border-[#e2eaf3] p-6 lg:p-8 rounded-2xl space-y-6 shadow-sm">
              <h4 className="font-bold text-primary-dark mb-1 flex items-center gap-2 text-lg">
                <span className="text-xl">📖</span>
                Configurações: Editor de Livrinhos e Atividades
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed italic border-b border-gray-100 pb-4">
                Adicione, remova e configure livrinhos e atividades para colorir disponíveis para as crianças.
              </p>

              <div className="grid grid-cols-1 gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-400 font-bold uppercase pl-1">Título do Bloco de Livros</label>
                    <input 
                      type="text" 
                      className="w-full p-2.5 border border-[#c8d8e8] rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2D6A9F]/20 outline-none transition-all font-semibold" 
                      value={data.books?.title || ""} 
                      onChange={e => handleNestedChange(["books", "title"], e.target.value)} 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-400 font-bold uppercase pl-1">Subtítulo</label>
                    <input 
                      type="text" 
                      className="w-full p-2.5 border border-[#c8d8e8] rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2D6A9F]/20 outline-none transition-all" 
                      value={data.books?.subtitle || ""} 
                      onChange={e => handleNestedChange(["books", "subtitle"], e.target.value)} 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase pl-1">Imagem de Fundo (Background dos Livrinhos)</label>
                  <div className="flex gap-2 items-center">
                    <input 
                      type="text" 
                      className="w-full p-2.5 border border-[#c8d8e8] rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2D6A9F]/20 outline-none transition-all" 
                      placeholder="https://exemplo.com/fundo-amarelo.jpg" 
                      value={data.books?.bgImageUrl || ""} 
                      onChange={e => handleNestedChange(["books", "bgImageUrl"], e.target.value)} 
                    />
                    <label className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl cursor-pointer font-bold text-sm transition-colors border border-gray-200 whitespace-nowrap">
                      <Upload size={18} />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const base64 = await compressImage(file);
                              handleNestedChange(["books", "bgImageUrl"], base64);
                            } catch (err) {
                              alert("Erro ao processar imagem.");
                            }
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase pl-1">Logo Superior de Destaque (Fundo Transparente)</label>
                  <div className="flex gap-2 items-center">
                    <input 
                      type="text" 
                      className="w-full p-2.5 border border-[#c8d8e8] rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2D6A9F]/20 outline-none transition-all" 
                      placeholder="https://exemplo.com/logo-livrinhos.png" 
                      value={data.books?.logoUrl || ""} 
                      onChange={e => handleNestedChange(["books", "logoUrl"], e.target.value)} 
                    />
                    <label className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl cursor-pointer font-bold text-sm transition-colors border border-gray-200 whitespace-nowrap">
                      <Upload size={18} />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const base64 = await compressImage(file);
                              handleNestedChange(["books", "logoUrl"], base64);
                            } catch (err) {
                              alert("Erro ao processar imagem.");
                            }
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* Grid de Itens e Criacao de novos itens */}
                <div className="pt-6 border-t border-gray-100 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h5 className="font-bold text-primary-dark text-sm uppercase pl-1 tracking-wide">Itens Cadastrados</h5>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setData((prev: any) => {
                            const books = prev?.books || {};
                            const items = books.items || [];
                            return {
                              ...prev,
                              books: {
                                ...books,
                                items: [
                                  {
                                    type: "LIVRINHO",
                                    label: "LIVRINHO",
                                    title: "NOVO LIVRINHO",
                                    desc: "Uma linda história com valiosas lições!",
                                    btnText: "LER AGORA",
                                    theme: "pink",
                                    imageUrl: "",
                                    pdfUrl: ""
                                  },
                                  ...items
                                ]
                              }
                            };
                          });
                        }}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
                      >
                        <Plus size={14} /> 📖 Criar Livrinho
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setData((prev: any) => {
                            const books = prev?.books || {};
                            const items = books.items || [];
                            return {
                              ...prev,
                              books: {
                                ...books,
                                items: [
                                  {
                                    type: "COLORIR",
                                    label: "PARA COLORIR",
                                    title: "NOVO DESENHO",
                                    desc: "Pinte e divirta-se com esta atividade!",
                                    btnText: "BAIXAR E COLORIR",
                                    theme: "blue",
                                    imageUrl: "",
                                    pdfUrl: ""
                                  },
                                  ...items
                                ]
                              }
                            };
                          });
                        }}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
                      >
                        <Plus size={14} /> 🎨 Criar para Colorir
                      </button>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/70 text-blue-900 text-xs leading-relaxed shadow-sm">
                    <p className="font-bold mb-1 uppercase text-[#1a5f7a] text-[11.5px] tracking-tight">Importante (Google Drive / PDFs):</p>
                    <p>
                      Suba o PDF desejado no Google Drive, configure o compartilhamento para que <strong>Qualquer pessoa com o link</strong> consiga visualizar, e insira o link gerado no campo de destino abaixo.
                    </p>
                  </div>

                  <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                    {data.books?.items?.map((b: any, i: number) => (
                      <div key={i} className="p-5 rounded-2xl border border-gray-150 bg-white shadow-sm flex gap-4 items-start relative hover:shadow-md transition-all">
                        <div className="absolute top-3 right-3 flex items-center gap-1.5">
                          <span className="text-[10px] font-black text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-full">
                            # {i + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Tem certeza que deseja remover o item #${i + 1} ("${b.title}")?`)) {
                                setData((prev: any) => {
                                  const books = prev?.books || {};
                                  const items = books.items || [];
                                  return {
                                    ...prev,
                                    books: {
                                      ...books,
                                      items: items.filter((_: any, idx: number) => idx !== i)
                                    }
                                  };
                                });
                              }
                            }}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all border border-red-100 cursor-pointer"
                            title="Remover Item"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        {/* Thumbnail */}
                        <div className="w-16 h-20 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden shrink-0 shadow-inner self-center">
                          {b.imageUrl ? (
                            <img 
                              src={b.imageUrl} 
                              alt="Capa Livro" 
                              className="w-full h-full object-cover" 
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-center p-1">
                              <span className="text-xl">📖</span>
                              <span className="text-[7.5px] font-bold text-gray-400 mt-1 uppercase leading-none">Vetor</span>
                            </div>
                          )}
                        </div>

                        {/* Controls */}
                        <div className="flex-1 space-y-3 pr-12">
                          <div className="space-y-1">
                            <label className="text-[9px] text-gray-400 font-bold uppercase">Tipo de Recurso</label>
                            <select
                              className="w-full p-2 border border-[#c8d8e8] rounded-lg text-xs font-semibold bg-white cursor-pointer"
                              value={b.type || "LIVRINHO"}
                              onChange={e => {
                                const val = e.target.value;
                                const label = val === "LIVRINHO" ? "LIVRINHO" : "PARA COLORIR";
                                const btnText = val === "LIVRINHO" ? "LER AGORA" : "BAIXAR E COLORIR";
                                
                                setData((prev: any) => {
                                  const copy = { ...prev };
                                  copy.books.items[i].type = val;
                                  copy.books.items[i].label = label;
                                  copy.books.items[i].btnText = btnText;
                                  return copy;
                                });
                              }}
                            >
                              <option value="LIVRINHO">📖 LIVRINHO (História)</option>
                              <option value="COLORIR">🎨 COLORIR (Atividades)</option>
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[9px] text-gray-400 font-bold uppercase">Título</label>
                            <input 
                              type="text" 
                              className="w-full px-2.5 py-1.5 border border-[#c8d8e8] rounded-xl text-xs font-semibold bg-white outline-none" 
                              placeholder="Ex: A Criação" 
                              value={b.title || ""} 
                              onChange={e => handleArrayChange(["books", "items"], i, "title", e.target.value)} 
                            />
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="text-[9px] text-gray-400 font-bold uppercase">Cor do Tema</label>
                              <button
                                type="button"
                                onClick={() => setIsColorModalOpen(true)}
                                className="text-[9px] text-[#2D6A9F] hover:text-[#245785] font-extrabold flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                🎨 CRIAR/EDITAR CORES
                              </button>
                            </div>
                            <select
                              className="w-full px-2.5 py-1.5 border border-[#c8d8e8] rounded-xl text-xs font-semibold bg-white outline-none"
                              value={b.theme || "pink"}
                              onChange={e => handleArrayChange(["books", "items"], i, "theme", e.target.value)}
                            >
                              {SYSTEM_COLORS.filter(sc => !data.deletedSystemColors?.includes(sc.id)).map(sc => {
                                const customOverride = data.customColors?.find((c: any) => c.id === sc.id);
                                const name = customOverride ? `${customOverride.name} (Modificado)` : sc.name;
                                return (
                                  <option key={sc.id} value={sc.id}>
                                    {sc.emoji} {name}
                                  </option>
                                );
                              })}
                              {data.customColors?.filter((c: any) => !SYSTEM_COLORS.some(sc => sc.id === c.id)).map((c: any) => (
                                <option key={c.id} value={c.id}>
                                  🎨 {c.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[9px] text-gray-400 font-bold uppercase">Link de Destino / PDF (Drive, Site)</label>
                            <input 
                              type="text" 
                              className="w-full px-2.5 py-1.5 border border-[#c8d8e8] rounded-xl text-xs bg-white outline-none" 
                              placeholder="https://drive.google.com/file/..." 
                              value={b.pdfUrl || ""} 
                              onChange={e => handleArrayChange(["books", "items"], i, "pdfUrl", e.target.value)} 
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[9px] text-gray-400 font-bold uppercase">Capa do Livro (URL ou upload)</label>
                            <div className="flex gap-2">
                              <input 
                                type="text" 
                                className="w-full px-2.5 py-1.5 border border-[#c8d8e8] rounded-xl text-xs bg-white outline-none" 
                                placeholder="https://..." 
                                value={b.imageUrl || ""} 
                                onChange={e => handleArrayChange(["books", "items"], i, "imageUrl", e.target.value)} 
                              />
                              <label className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl cursor-pointer font-bold text-xs border border-gray-200 transition-all shrink-0">
                                <Upload size={13} />
                                <span>Capa</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      try {
                                        const base64 = await compressImage(file);
                                        handleArrayChange(["books", "items"], i, "imageUrl", base64);
                                      } catch (err) {
                                        alert("Erro ao processar imagem.");
                                      }
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gerenciamento de Cores Personalizadas */}
                <div className="mt-8 pt-6 border-t border-[#e2eaf3] space-y-4">
                  <div className="p-5 rounded-2xl border border-dashed border-[#c8d8e8] bg-[#fcfdfe] space-y-4 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h6 className="font-bold text-gray-700 text-sm flex items-center gap-2">
                        <span>🎨</span> Cores de Tema Personalizadas
                      </h6>
                      <span className="text-[10px] text-gray-400 font-bold uppercase">Crie suas próprias cores para os livrinhos</span>
                    </div>
                    
                    {data.customColors && data.customColors.length > 0 ? (
                      <div className="flex flex-wrap gap-2.5">
                        {data.customColors.map((c: any, cIdx: number) => (
                          <div key={c.id} className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#c8d8e8] bg-white text-xs font-semibold shadow-sm">
                            <span 
                              className="w-4 h-4 rounded-full border border-gray-300" 
                              style={{ backgroundColor: c.baseColor }}
                            />
                            <span className="text-gray-700">{c.name}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setIsColorModalOpen(true);
                                setEditingColorId(c.id);
                                setColorFormName(c.name);
                                setColorFormHex(c.baseColor);
                              }}
                              className="text-blue-500 hover:text-blue-700 ml-1.5 cursor-pointer transition-colors"
                              title="Editar Cor"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Deseja mesmo excluir a cor "${c.name}"?`)) {
                                  setData((prev: any) => {
                                    const updatedColors = (prev.customColors || []).filter((_: any, idx: number) => idx !== cIdx);
                                    // Also reset books that were using this color to "pink"
                                    const books = prev.books || {};
                                    const updatedItems = (books.items || []).map((b: any) => {
                                      if (b.theme === c.id) {
                                        return { ...b, theme: "pink" };
                                      }
                                      return b;
                                    });
                                    return {
                                      ...prev,
                                      customColors: updatedColors,
                                      books: {
                                        ...books,
                                        items: updatedItems
                                      }
                                    };
                                  });
                                }
                              }}
                              className="text-red-500 hover:text-red-700 ml-1 cursor-pointer transition-colors"
                              title="Excluir Cor"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">Nenhuma cor personalizada criada ainda. Adicione uma no formulário abaixo!</p>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-gray-100 items-end">
                      <div className="space-y-1">
                        <label className="text-[9px] text-gray-400 font-bold uppercase pl-1">Nome da Cor</label>
                        <input 
                          type="text"
                          value={bottomColorName}
                          onChange={(e) => setBottomColorName(e.target.value)}
                          placeholder="Ex: Vermelho Rubi"
                          className="w-full px-2.5 py-1.5 border border-[#c8d8e8] rounded-xl text-xs bg-white outline-none font-semibold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-gray-400 font-bold uppercase pl-1">Escolha a Cor Base / Código HEX</label>
                        <div className="flex gap-2 items-center">
                          <input 
                            type="color"
                            value={bottomColorHex.startsWith("#") && bottomColorHex.length === 7 ? bottomColorHex : "#e91e63"}
                            onChange={(e) => setBottomColorHex(e.target.value)}
                            className="w-10 h-8 border border-[#c8d8e8] rounded-xl cursor-pointer bg-transparent"
                          />
                          <input 
                            type="text"
                            value={bottomColorHex}
                            onChange={(e) => {
                              let val = e.target.value;
                              if (!val.startsWith("#") && val.trim().length > 0) {
                                val = "#" + val;
                              }
                              setBottomColorHex(val);
                            }}
                            placeholder="#HEXCODE"
                            className="w-24 px-2 py-1 border border-[#c8d8e8] rounded-xl text-xs font-mono font-bold bg-white text-gray-700 uppercase outline-none"
                            maxLength={7}
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const name = bottomColorName.trim();
                          const baseColor = bottomColorHex.trim();
                          
                          if (!name) {
                            alert("Por favor, digite um nome para a cor!");
                            return;
                          }

                          // Validar formato hexadecimal
                          const hexRegex = /^#[0-9A-Fa-f]{6}$/;
                          if (!hexRegex.test(baseColor)) {
                            alert("Por favor, insira um código HEX válido (ex: #FF00FF) de 7 caracteres!");
                            return;
                          }
                          
                          // Generate the theme
                          const newTheme = generateThemeFromBase(name, baseColor);
                          
                          setData((prev: any) => {
                            const currentColors = prev.customColors || [];
                            return {
                              ...prev,
                              customColors: [...currentColors, newTheme]
                            };
                          });
                          
                          // Limpar campos
                          setBottomColorName("");
                          setBottomColorHex("#e91e63");
                        }}
                        className="px-4 py-2 bg-[#2D6A9F] hover:bg-[#245785] text-white rounded-xl font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 h-[34px] cursor-pointer"
                      >
                        <Plus size={14} /> Adicionar Cor
                      </button>
                    </div>
                  </div>
                </div>

                {/* Banners Adicionados aqui no editor de livrinhos no finao */}
                <div className="mt-8 space-y-4 pt-6 border-t border-[#e2eaf3]">
                  <h5 className="font-bold text-primary-dark text-sm uppercase pl-1 tracking-wide">Banners de Destaque (Livrinhos)</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5 p-4 bg-[#fdf5ff] border border-[#f3e5f5] rounded-xl relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-[#ab47bc]"></div>
                      <label className="text-[10px] text-[#8e24aa] font-black uppercase pl-1">Banner Roxo (Livros/Colorir)</label>
                      <input 
                        type="text" 
                        className="w-full p-2.5 border border-[#e1bee7] rounded-xl text-sm bg-white focus:ring-2 focus:ring-[#ab47bc]/20 outline-none transition-all font-bold" 
                        value={data.header?.bannerPurple || data.books?.bannerLeft || "NOVOS LIVRINHOS TODA SEMANA!"} 
                        onChange={e => handleNestedChange(["header", "bannerPurple"], e.target.value)} 
                      />
                    </div>
                    <div className="space-y-1.5 p-4 bg-[#fffcf0] border border-[#fbe7a4] rounded-xl relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-[#ffca28]"></div>
                      <label className="text-[10px] text-[#e65100] font-black uppercase pl-1">Banner Amarelo Lápis (Livros/Colorir)</label>
                      <input 
                        type="text" 
                        className="w-full p-2.5 border border-[#fbe7a4] rounded-xl text-sm bg-white focus:ring-2 focus:ring-[#ffca28]/20 outline-none transition-all font-bold" 
                        value={data.header?.bannerPencil || data.books?.bannerRight || "LEIA, APRENDA, COLORA E COMPARTILHE O AMOR DE JESUS!"} 
                        onChange={e => handleNestedChange(["header", "bannerPencil"], e.target.value)} 
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t border-gray-150">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#2D6A9F] text-white font-bold rounded-xl hover:bg-[#245785] transition shadow-md disabled:bg-gray-400 text-sm"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Salvar Livrinhos
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Aba 5: Jesus na Minha Casa */}
        {activeTab === "jesus_casa" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white border border-[#e2eaf3] p-6 lg:p-8 rounded-2xl space-y-6 shadow-sm">
              <h4 className="font-bold text-primary-dark mb-1 flex items-center gap-2 text-lg">
                <span className="text-xl">🏠</span>
                Configurações: Jesus na Minha Casa (Culto no Lar)
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed italic border-b border-gray-100 pb-4">
                Edite os textos explicativos, regras de conduta e programa estruturado para o Culto no Lar, bem como o banner especial.
              </p>

              <div className="grid grid-cols-1 gap-6">
                
                {/* TÍTULO E SUBTÍTULO DO RODAPÉ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase">Título da Faixa Final</label>
                    <input
                      type="text"
                      value={data.footer?.finalText || ""}
                      onChange={e => handleNestedChange(["footer", "finalText"], e.target.value)}
                      className="w-full p-2.5 border border-[#c8d8e8] rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#2D6A9F]/20 outline-none transition-all bg-white"
                      placeholder="JESUS NA MINHA CASA"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase">Subtítulo da Faixa Final</label>
                    <input
                      type="text"
                      value={data.footer?.finalSubtext || ""}
                      onChange={e => handleNestedChange(["footer", "finalSubtext"], e.target.value)}
                      className="w-full p-2.5 border border-[#c8d8e8] rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#2D6A9F]/20 outline-none transition-all bg-white"
                      placeholder="UM LUGAR DE AMOR, APRENDIZADO E MUITA ALEGRIA!"
                    />
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-4">
                  <h5 className="text-xs font-bold text-[#2D6A9F] uppercase tracking-wide">📖 Conteúdo do Culto no Lar</h5>
                  
                  {/* IMPORTÂNCIA */}
                  <div className="space-y-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1">
                        <span>❓</span> Título - Importância do Culto
                      </label>
                      <input
                        type="text"
                        value={data.projectInfo?.importanceTitle || ""}
                        onChange={e => handleNestedChange(["projectInfo", "importanceTitle"], e.target.value)}
                        className="w-full p-2.5 border border-[#c8d8e8] rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#2D6A9F]/20 outline-none transition-all bg-white"
                        placeholder="Qual a importância do Culto no Lar?"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1">
                        Texto da Importância (Pressione Enter duas vezes para criar parágrafos)
                      </label>
                      <textarea
                        rows={6}
                        value={data.projectInfo?.importanceText || ""}
                        onChange={e => handleNestedChange(["projectInfo", "importanceText"], e.target.value)}
                        className="w-full p-2.5 border border-[#c8d8e8] rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#2D6A9F]/20 outline-none transition-all bg-white font-sans text-xs sm:text-sm"
                        placeholder="Digite o texto de importância do Culto no Lar..."
                      />
                    </div>
                  </div>

                  {/* REGRAS */}
                  <div className="space-y-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1">
                        <span>📝</span> Título - Regras do Projeto
                      </label>
                      <input
                        type="text"
                        value={data.projectInfo?.rulesTitle || ""}
                        onChange={e => handleNestedChange(["projectInfo", "rulesTitle"], e.target.value)}
                        className="w-full p-2.5 border border-[#c8d8e8] rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#2D6A9F]/20 outline-none transition-all bg-white"
                        placeholder="Regras do Projeto"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1">
                        Gerenciar Regras do Projeto
                      </label>
                      
                      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                        {((data.projectInfo?.rules) || []).length === 0 ? (
                          <p className="text-xs text-gray-400 italic py-2 text-center">Nenhuma regra cadastrada. Adicione uma abaixo!</p>
                        ) : (
                          (data.projectInfo?.rules || []).map((rule: string, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-[#e2eaf3] shadow-sm hover:border-[#2D6A9F]/30 transition-all">
                              <span className="text-xs font-black text-gray-400 w-6 text-center">{idx + 1}</span>
                              <input
                                type="text"
                                value={rule}
                                onChange={(e) => {
                                  const newRules = [...(data.projectInfo?.rules || [])];
                                  newRules[idx] = e.target.value;
                                  handleNestedChange(["projectInfo", "rules"], newRules);
                                }}
                                className="flex-1 bg-transparent text-xs sm:text-sm font-semibold outline-none border-b border-transparent focus:border-blue-300 pb-0.5 text-gray-700 px-1"
                              />
                              
                              <div className="flex items-center gap-1">
                                {/* Up button */}
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => {
                                    if (idx === 0) return;
                                    const newRules = [...(data.projectInfo?.rules || [])];
                                    const temp = newRules[idx];
                                    newRules[idx] = newRules[idx - 1];
                                    newRules[idx - 1] = temp;
                                    handleNestedChange(["projectInfo", "rules"], newRules);
                                  }}
                                  className="p-1 text-gray-400 hover:text-[#2D6A9F] hover:bg-[#2D6A9F]/5 rounded-lg disabled:opacity-30 cursor-pointer transition-all"
                                  title="Subir regra"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                                </button>
                                
                                {/* Down button */}
                                <button
                                  type="button"
                                  disabled={idx === (data.projectInfo?.rules || []).length - 1}
                                  onClick={() => {
                                    if (idx === (data.projectInfo?.rules || []).length - 1) return;
                                    const newRules = [...(data.projectInfo?.rules || [])];
                                    const temp = newRules[idx];
                                    newRules[idx] = newRules[idx + 1];
                                    newRules[idx + 1] = temp;
                                    handleNestedChange(["projectInfo", "rules"], newRules);
                                  }}
                                  className="p-1 text-gray-400 hover:text-[#2D6A9F] hover:bg-[#2D6A9F]/5 rounded-lg disabled:opacity-30 cursor-pointer transition-all"
                                  title="Descer regra"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                </button>

                                {/* Delete button */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newRules = (data.projectInfo?.rules || []).filter((_: any, i: number) => i !== idx);
                                    handleNestedChange(["projectInfo", "rules"], newRules);
                                  }}
                                  className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-all"
                                  title="Remover regra"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Add new rule */}
                      <div className="flex gap-2 pt-2 border-t border-dashed border-gray-200">
                        <input
                          type="text"
                          value={newRuleInput}
                          onChange={(e) => setNewRuleInput(e.target.value)}
                          placeholder="Adicionar nova regra do projeto..."
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              const val = newRuleInput.trim();
                              if (val) {
                                const newRules = [...(data.projectInfo?.rules || []), val];
                                handleNestedChange(["projectInfo", "rules"], newRules);
                                setNewRuleInput("");
                              }
                            }
                          }}
                          className="flex-1 px-3 py-2 border border-[#c8d8e8] rounded-xl text-xs sm:text-sm font-semibold bg-white outline-none focus:ring-2 focus:ring-[#2D6A9F]/20 focus:border-[#2D6A9F]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const val = newRuleInput.trim();
                            if (val) {
                              const newRules = [...(data.projectInfo?.rules || []), val];
                              handleNestedChange(["projectInfo", "rules"], newRules);
                              setNewRuleInput("");
                            }
                          }}
                          className="px-4 py-2 bg-[#4caf50] hover:bg-[#43a047] text-white rounded-xl font-bold text-xs shadow-sm cursor-pointer transition-all flex items-center gap-1"
                        >
                          <Plus size={14} /> Adicionar
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* PROGRAMA */}
                  <div className="space-y-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1">
                        <span>🌟</span> Título - Programa do Culto
                      </label>
                      <input
                        type="text"
                        value={data.projectInfo?.programTitle || ""}
                        onChange={e => handleNestedChange(["projectInfo", "programTitle"], e.target.value)}
                        className="w-full p-2.5 border border-[#c8d8e8] rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#2D6A9F]/20 outline-none transition-all bg-white"
                        placeholder="Programa do Culto"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1">
                        Gerenciar Etapas do Culto
                      </label>
                      
                      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                        {((data.projectInfo?.program) || []).length === 0 ? (
                          <p className="text-xs text-gray-400 italic py-2 text-center">Nenhuma etapa cadastrada. Adicione uma abaixo!</p>
                        ) : (
                          (data.projectInfo?.program || []).map((step: string, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-[#e2eaf3] shadow-sm hover:border-[#2D6A9F]/30 transition-all">
                              <span className="text-xs font-black text-gray-400 w-6 text-center">{idx + 1}</span>
                              <input
                                type="text"
                                value={step}
                                onChange={(e) => {
                                  const newProgram = [...(data.projectInfo?.program || [])];
                                  newProgram[idx] = e.target.value;
                                  handleNestedChange(["projectInfo", "program"], newProgram);
                                }}
                                className="flex-1 bg-transparent text-xs sm:text-sm font-semibold outline-none border-b border-transparent focus:border-blue-300 pb-0.5 text-gray-700 px-1"
                              />
                              
                              <div className="flex items-center gap-1">
                                {/* Up button */}
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => {
                                    if (idx === 0) return;
                                    const newProgram = [...(data.projectInfo?.program || [])];
                                    const temp = newProgram[idx];
                                    newProgram[idx] = newProgram[idx - 1];
                                    newProgram[idx - 1] = temp;
                                    handleNestedChange(["projectInfo", "program"], newProgram);
                                  }}
                                  className="p-1 text-gray-400 hover:text-[#2D6A9F] hover:bg-[#2D6A9F]/5 rounded-lg disabled:opacity-30 cursor-pointer transition-all"
                                  title="Subir etapa"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                                </button>
                                
                                {/* Down button */}
                                <button
                                  type="button"
                                  disabled={idx === (data.projectInfo?.program || []).length - 1}
                                  onClick={() => {
                                    if (idx === (data.projectInfo?.program || []).length - 1) return;
                                    const newProgram = [...(data.projectInfo?.program || [])];
                                    const temp = newProgram[idx];
                                    newProgram[idx] = newProgram[idx + 1];
                                    newProgram[idx + 1] = temp;
                                    handleNestedChange(["projectInfo", "program"], newProgram);
                                  }}
                                  className="p-1 text-gray-400 hover:text-[#2D6A9F] hover:bg-[#2D6A9F]/5 rounded-lg disabled:opacity-30 cursor-pointer transition-all"
                                  title="Descer etapa"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                </button>

                                {/* Delete button */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newProgram = (data.projectInfo?.program || []).filter((_: any, i: number) => i !== idx);
                                    handleNestedChange(["projectInfo", "program"], newProgram);
                                  }}
                                  className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-all"
                                  title="Remover etapa"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Add new step */}
                      <div className="flex gap-2 pt-2 border-t border-dashed border-gray-200">
                        <input
                          type="text"
                          value={newProgramInput}
                          onChange={(e) => setNewProgramInput(e.target.value)}
                          placeholder="Adicionar nova etapa do programa..."
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              const val = newProgramInput.trim();
                              if (val) {
                                const newProgram = [...(data.projectInfo?.program || []), val];
                                handleNestedChange(["projectInfo", "program"], newProgram);
                                setNewProgramInput("");
                              }
                            }
                          }}
                          className="flex-1 px-3 py-2 border border-[#c8d8e8] rounded-xl text-xs sm:text-sm font-semibold bg-white outline-none focus:ring-2 focus:ring-[#2D6A9F]/20 focus:border-[#2D6A9F]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const val = newProgramInput.trim();
                            if (val) {
                              const newProgram = [...(data.projectInfo?.program || []), val];
                              handleNestedChange(["projectInfo", "program"], newProgram);
                              setNewProgramInput("");
                            }
                          }}
                          className="px-4 py-2 bg-[#ff9800] hover:bg-[#f57c00] text-white rounded-xl font-bold text-xs shadow-sm cursor-pointer transition-all flex items-center gap-1"
                        >
                          <Plus size={14} /> Adicionar
                        </button>
                      </div>
                    </div>
                  </div>

                </div>

                {/* BANNER INFERIOR */}
                <div className="space-y-1.5 mt-2 bg-[#f4f7fa] p-4 rounded-xl border border-[#e2eaf3]">
                  <label className="text-xs font-bold text-[#1f2937] uppercase flex items-center gap-2 mb-2">
                    <span className="text-[#3b82f6]">🖼️</span> Imagem do Banner Inferior
                  </label>
                  <p className="text-[11px] text-gray-500 mb-3">Links do Firebase Storage. Dê preferência à proporção 1200x300. Se este campo estiver preenchido, o bloco institucional inferior será substituído completamente por este banner.</p>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex-row items-center pointer-events-none hidden sm:flex">
                        <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"/><line x1="16" y1="5" x2="22" y2="5"/><line x1="19" y1="2" x2="19" y2="8"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                      </div>
                      <input 
                        type="text" 
                        value={data.footer?.imageUrl || ""}
                        onChange={e => handleNestedChange(["footer", "imageUrl"], e.target.value)} 
                        className="sm:pl-9 w-full p-2.5 border border-[#c8d8e8] rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#2D6A9F]/20 outline-none transition-all placeholder-gray-300 bg-white" 
                        placeholder="https://..."
                      />
                    </div>
                    <label className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-xl cursor-pointer font-bold text-sm transition-colors border border-[#c8d8e8] whitespace-nowrap">
                      <Upload size={18} />
                      <span>Galeria / Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const base64 = await compressImage(file);
                              handleNestedChange(["footer", "imageUrl"], base64);
                            } catch (err) {
                              alert("Erro ao processar imagem.");
                            }
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t border-gray-150">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#2D6A9F] text-white font-bold rounded-xl hover:bg-[#245785] transition shadow-md disabled:bg-gray-400 text-sm cursor-pointer"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Salvar Configurações
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* MODAL DE GERENCIAMENTO DE CORES DE TEMA */}
      {isColorModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl border border-[#c8d8e8] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Header do Modal */}
            <div className="bg-gradient-to-r from-[#f0f6fb] to-white px-6 py-4 border-b border-[#e2eaf3] flex justify-between items-center">
              <h3 className="font-serif font-black text-lg text-[#2D6A9F] flex items-center gap-2">
                <span>🎨</span> Gerenciar Cores do Tema
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsColorModalOpen(false);
                  setEditingColorId(null);
                  setColorFormName("");
                }}
                className="text-gray-400 hover:text-gray-600 font-extrabold text-sm p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-6 space-y-6 overflow-y-auto flex-grow">
              
              {/* Formulário de Adicionar / Editar */}
              <div className="p-4 rounded-2xl bg-[#f7fafc] border border-[#e2eaf3] space-y-3.5">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  {editingColorId ? "✏️ Editar Cor Selecionada" : "✨ Criar Nova Cor de Tema"}
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 font-bold uppercase pl-1">Nome da Cor</label>
                    <input
                      type="text"
                      value={colorFormName}
                      onChange={(e) => setColorFormName(e.target.value)}
                      placeholder="Ex: Verde Limão, Rosa Chiclete"
                      className="w-full px-3 py-2 border border-[#c8d8e8] rounded-xl text-xs font-semibold bg-white outline-none"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 font-bold uppercase pl-1">Escolha o Tom Base / Código HEX</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={colorFormHex.startsWith("#") && colorFormHex.length === 7 ? colorFormHex : "#e91e63"}
                        onChange={(e) => setColorFormHex(e.target.value)}
                        className="w-12 h-9 border border-[#c8d8e8] rounded-xl cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={colorFormHex}
                        onChange={(e) => {
                          let val = e.target.value;
                          if (!val.startsWith("#") && val.trim().length > 0) {
                            val = "#" + val;
                          }
                          setColorFormHex(val);
                        }}
                        placeholder="#HEXCODE"
                        className="w-28 px-2 py-1.5 border border-[#c8d8e8] rounded-xl text-xs font-mono font-bold bg-white text-gray-700 uppercase outline-none"
                        maxLength={7}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  {editingColorId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingColorId(null);
                        setColorFormName("");
                        setColorFormHex("#e91e63");
                      }}
                      className="px-3.5 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-bold text-xs transition-all cursor-pointer"
                    >
                      Cancelar Edição
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      const name = colorFormName.trim();
                      if (!name) {
                        alert("Por favor, digite um nome para a cor!");
                        return;
                      }

                      // Validar formato hexadecimal
                      const hexRegex = /^#[0-9A-Fa-f]{6}$/;
                      if (!hexRegex.test(colorFormHex)) {
                        alert("Por favor, insira um código HEX válido (ex: #FF00FF) de 7 caracteres!");
                        return;
                      }

                      setData((prev: any) => {
                        const currentColors = prev.customColors || [];
                        if (editingColorId) {
                          // Edit existing
                          const updated = currentColors.map((c: any) => {
                            if (c.id === editingColorId) {
                              const updatedTheme = generateThemeFromBase(name, colorFormHex);
                              return { ...updatedTheme, id: editingColorId }; // Preserve same ID
                            }
                            return c;
                          });
                          return { ...prev, customColors: updated };
                        } else {
                          // Create new
                          const newTheme = generateThemeFromBase(name, colorFormHex);
                          return { ...prev, customColors: [...currentColors, newTheme] };
                        }
                      });

                      // Reset form
                      setEditingColorId(null);
                      setColorFormName("");
                      setColorFormHex("#e91e63");
                    }}
                    className="px-4 py-2 bg-[#2D6A9F] hover:bg-[#245785] text-white rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1"
                  >
                    {editingColorId ? "Salvar Cor" : "Adicionar Cor"}
                  </button>
                </div>
              </div>

              {/* Lista de Cores Existentes */}
              <div className="space-y-5">
                
                {/* Seção 1: Cores Padrão do Sistema */}
                <div className="space-y-2.5">
                  <h4 className="text-[10px] font-bold text-[#2D6A9F] uppercase tracking-wider pl-1 flex items-center gap-1.5">
                    <span>⚙️</span> Cores Padrão do Sistema (Editáveis)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {SYSTEM_COLORS.filter(sc => !data.deletedSystemColors?.includes(sc.id)).map((sc) => {
                      const customOverride = data.customColors?.find((c: any) => c.id === sc.id);
                      const isModified = !!customOverride;
                      const currentColor = customOverride ? customOverride.baseColor : sc.baseColor;
                      const currentName = customOverride ? customOverride.name : sc.name;

                      return (
                        <div
                          key={sc.id}
                          className={`flex items-center justify-between p-3 rounded-2xl border bg-white shadow-sm transition-all ${
                            isModified ? "border-amber-200 bg-amber-50/5" : "border-[#e2eaf3]"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className="w-4.5 h-4.5 rounded-full border border-gray-200 shadow-inner shrink-0"
                              style={{ backgroundColor: currentColor }}
                            />
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-gray-700">
                                {sc.emoji} {currentName}
                              </span>
                              {isModified && (
                                <span className="text-[8px] text-amber-600 font-extrabold uppercase tracking-widest mt-0.5">
                                  Modificada
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            {/* Botão de Editar */}
                            <button
                              type="button"
                              onClick={() => {
                                setEditingColorId(sc.id);
                                setColorFormName(currentName);
                                setColorFormHex(currentColor);
                              }}
                              className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title={`Editar cor ${sc.name}`}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                            </button>

                            {/* Botão de Restaurar (Somente se modificado) */}
                            {isModified && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`Deseja mesmo restaurar a cor "${sc.name}" para o padrão original?`)) {
                                    setData((prev: any) => {
                                      const updatedColors = (prev.customColors || []).filter((c: any) => c.id !== sc.id);
                                      return {
                                        ...prev,
                                        customColors: updatedColors
                                      };
                                    });
                                    if (editingColorId === sc.id) {
                                      setEditingColorId(null);
                                      setColorFormName("");
                                      setColorFormHex("#e91e63");
                                    }
                                  }
                                }}
                                className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                                title="Restaurar Cor Original"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                              </button>
                            )}

                            {/* Botão de Excluir / Ocultar Cor do Sistema */}
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Deseja mesmo excluir/ocultar a cor do sistema "${currentName}"?`)) {
                                  setData((prev: any) => {
                                    const deletedList = prev.deletedSystemColors || [];
                                    const updatedDeleted = [...deletedList, sc.id];

                                    // Resetar livros usando essa cor para "pink"
                                    const books = prev.books || {};
                                    const updatedItems = (books.items || []).map((b: any) => {
                                      if (b.theme === sc.id) {
                                        return { ...b, theme: "pink" };
                                      }
                                      return b;
                                    });

                                    return {
                                      ...prev,
                                      deletedSystemColors: updatedDeleted,
                                      books: {
                                        ...books,
                                        items: updatedItems
                                      }
                                    };
                                  });
                                  if (editingColorId === sc.id) {
                                    setEditingColorId(null);
                                    setColorFormName("");
                                    setColorFormHex("#e91e63");
                                  }
                                }
                              }}
                              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Excluir Cor"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Seção 2: Cores Criadas por Você */}
                <div className="space-y-2.5 pt-4 border-t border-gray-100">
                  <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider pl-1 flex items-center gap-1.5">
                    <span>✨</span> Suas Cores Personalizadas Adicionais
                  </h4>
                  
                  {data.customColors && data.customColors.filter((c: any) => !SYSTEM_COLORS.some(sc => sc.id === c.id)).length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {data.customColors.filter((c: any) => !SYSTEM_COLORS.some(sc => sc.id === c.id)).map((c: any, idx: number) => (
                        <div
                          key={c.id}
                          className="flex items-center justify-between p-3 rounded-2xl border border-[#e2eaf3] bg-white shadow-sm hover:border-gray-300 transition-all"
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className="w-4.5 h-4.5 rounded-full border border-gray-200 shadow-inner shrink-0"
                              style={{ backgroundColor: c.baseColor }}
                            />
                            <span className="text-xs font-bold text-gray-700">{c.name}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            {/* Botão de Editar */}
                            <button
                              type="button"
                              onClick={() => {
                                setEditingColorId(c.id);
                                setColorFormName(c.name);
                                setColorFormHex(c.baseColor);
                              }}
                              className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Editar Cor"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                            </button>
                            
                            {/* Botão de Excluir */}
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Deseja mesmo excluir a cor "${c.name}"?`)) {
                                  setData((prev: any) => {
                                    const updatedColors = (prev.customColors || []).filter((x: any) => x.id !== c.id);
                                    // Also reset books that were using this color to "pink"
                                    const books = prev.books || {};
                                    const updatedItems = (books.items || []).map((b: any) => {
                                      if (b.theme === c.id) {
                                        return { ...b, theme: "pink" };
                                      }
                                      return b;
                                    });
                                    return {
                                      ...prev,
                                      customColors: updatedColors,
                                      books: {
                                        ...books,
                                        items: updatedItems
                                      }
                                    };
                                  });
                                  if (editingColorId === c.id) {
                                    setEditingColorId(null);
                                    setColorFormName("");
                                    setColorFormHex("#e91e63");
                                  }
                                }
                              }}
                              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Excluir Cor"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-6 rounded-2xl border border-dashed border-[#c8d8e8] bg-gray-50">
                      <p className="text-[11px] text-gray-400 italic">Nenhuma cor personalizada adicional criada ainda.</p>
                    </div>
                  )}
                </div>

                {/* Seção 3: Cores Padrão Ocultadas/Excluídas */}
                {data.deletedSystemColors && data.deletedSystemColors.length > 0 && (
                  <div className="space-y-2.5 pt-4 border-t border-gray-100">
                    <h4 className="text-[10px] font-bold text-red-500 uppercase tracking-wider pl-1 flex items-center gap-1.5">
                      <span>🗑️</span> Cores Padrão Excluídas (Clique para Restaurar)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {SYSTEM_COLORS.filter(sc => data.deletedSystemColors.includes(sc.id)).map(sc => {
                        const customOverride = data.customColors?.find((c: any) => c.id === sc.id);
                        const name = customOverride ? customOverride.name : sc.name;
                        const color = customOverride ? customOverride.baseColor : sc.baseColor;
                        return (
                          <div
                            key={sc.id}
                            className="flex items-center justify-between p-3 rounded-2xl border border-red-100 bg-red-50/5 shadow-sm"
                          >
                            <div className="flex items-center gap-2.5 opacity-60">
                              <span
                                className="w-4 h-4 rounded-full border border-gray-200 shadow-inner shrink-0"
                                style={{ backgroundColor: color }}
                              />
                              <span className="text-xs font-bold text-gray-500 line-through">
                                {sc.emoji} {name}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setData((prev: any) => {
                                  const updatedDeleted = (prev.deletedSystemColors || []).filter((id: string) => id !== sc.id);
                                  return {
                                    ...prev,
                                    deletedSystemColors: updatedDeleted
                                  };
                                });
                              }}
                              className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg font-bold text-[10px] transition-all cursor-pointer flex items-center gap-1"
                              title="Restaurar Cor"
                            >
                              <span>🔄</span> Restaurar
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>

            </div>

            {/* Footer do Modal */}
            <div className="bg-gray-50 px-6 py-4 border-t border-[#e2eaf3] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsColorModalOpen(false);
                  setEditingColorId(null);
                  setColorFormName("");
                }}
                className="px-5 py-2.5 bg-white border border-[#c8d8e8] hover:bg-gray-50 text-gray-700 rounded-xl font-bold text-xs shadow-sm transition-all cursor-pointer"
              >
                Concluir
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

const defaultMafKidsData = {
  header: {
    topImageUrl: "",
    title: "APRENDER É UMA AVENTURA!",
    subtitle: "Descubra, brinque e aprenda com muita diversão!",
    speechBubble: "JESUS É MEU AMIGO PARA SEMPRE! ❤️",
    sign: "DEUS TE AMA DO JEITINHO QUE VOCÊ É!",
    badges: [
      { title: "HISTÓRIAS BÍBLICAS", desc: "Lições que transformam!", icon: "Book", color: "pink" },
      { title: "JOGOS CRISTÃOS", desc: "Divirta-se e aprenda jogando!", icon: "Gamepad2", color: "green" },
      { title: "ATIVIDADES", desc: "Pinte, desenhe e crie com fé!", icon: "Palette", color: "yellow" },
      { title: "VÍDEOS ANIMADOS", desc: "Assista e aprenda com alegria!", icon: "PlaySquare", color: "purple" },
      { title: "DESAFIOS COM JESUS", desc: "Participe e ganhe conquistas!", icon: "Trophy", color: "blue" }
    ]
  },
  middle1: {
    leftBox: {
      title: "A COR DA CRIAÇÃO",
      desc: "Deus criou um mundo lindo e colorido com muito amor e cuidado! Cada cor tem um significado especial na criação que Ele fez para nós.",
      colors: [
        { name: "VERMELHO", meaning: "AMOR DE DEUS", color: "bg-red-500" },
        { name: "LARANJA", meaning: "ALEGRIA", color: "bg-orange-400" },
        { name: "AMARELO", meaning: "LUZ DE DEUS", color: "bg-yellow-400" },
        { name: "VERDE", meaning: "ESPERANÇA", color: "bg-green-500" },
        { name: "AZUL", meaning: "PAZ", color: "bg-blue-500" },
        { name: "ROXO", meaning: "REINO DE DEUS", color: "bg-purple-600" }
      ]
    },
    rightBox: {
      title: "CONSELHOS AOS PAIS",
      desc: "Acompanhe o crescimento espiritual, emotional e o aprendizado do seu filho com conteúdos seguros, cristãos e educativos. Aqui você encontra dicas, devocionais, orientações e apoio para viver a fé em família todos os dias.",
      icons: [
        { title: "DEVOCIONAIS EM FAMÍLIA", icon: "BookOpen" },
        { title: "COMUNICAÇÃO QUE EDIFICA", icon: "MessageCircle" },
        { title: "PRINCÍPIOS E VALORES", icon: "Star" },
        { title: "TEMPO DE QUALIDADE", icon: "Clock" }
      ]
    },
    bannerText: "TODO DIA TEM ALGO NOVO AQUI! | VENHA FAZER PARTE DESSA FAMÍLIA!"
  },
  books: {
    title: "LIVRINHOS",
    subtitle: "PARA LER, APRENDER E SE DIVERTIR!",
    desc: "Histórias que ensinam, edificam e aproximam do amor de Jesus!",
    items: [
      { type: "LIVRINHO", label: "LIVRINHO", title: "A CRIAÇÃO", desc: "Deus criou todas as coisas com amor!", btnText: "LER AGORA", theme: "pink", imageUrl: "" },
      { type: "LIVRINHO", label: "LIVRINHO", title: "A ARCA DE NOÉ", desc: "Deus sempre cuida da gente!", btnText: "LER AGORA", theme: "orange", imageUrl: "" },
      { type: "LIVRINHO", label: "LIVRINHO", title: "DAVI E GOLIAS", desc: "Deus me dá coragem para vencer!", btnText: "LER AGORA", theme: "green", imageUrl: "" },
      { type: "COLORIR", label: "PARA COLORIR", title: "JONAS E O PEIXE", desc: "Deus tem um plano para mim!", btnText: "BAIXAR E COLORIR", theme: "blue", imageUrl: "" },
      { type: "COLORIR", label: "PARA COLORIR", title: "JESUS E AS CRIANÇAS", desc: "Deixem as crianças virem a mim!", btnText: "BAIXAR E COLORIR", theme: "purple", imageUrl: "" }
    ],
    bannerLeft: "NOVOS LIVRINHOS TODA SEMANA!",
    bannerRight: "LEIA, APRENDA, COLORA E COMPARTILHE O AMOR DE JESUS!"
  },
  footer: {
    title: "PROJETO JESUS",
    subtitle: "TUDO VOLTADO PARA CRIANÇAS!",
    findHereTitle: "O QUE VOCÊ ENCONTRA AQUI:",
    findHereItems: [
      { title: "HISTÓRIAS BÍBLICAS", desc: "Aprenda sobre Deus de forma lúdica e criativa.", icon: "BookOpen" },
      { title: "MÚSICAS CRISTÃS", desc: "Cante e louve com músicas para crianças.", icon: "Music" },
      { title: "ATIVIDADES DIVERTIDAS", desc: "Desenhos, jogos e brincabeiras que ensinam valores.", icon: "Palette" },
      { title: "ORAÇÃO E DEVOCIONAIS", desc: "Momentos especiais para falar com Deus todos os dias.", icon: "Heart" },
      { title: "VALORES QUE TRANSFORMAM", desc: "Amor, respeito, solidariedade, obediência e fé!", icon: "Gift" },
    ],
    purposeTitle: "NOSSO PROPÓSITO",
    purposeText: "Levar o amor de Jesus até as crianças e suas famílias, fortalecendo a fé e ensinando que com Jesus em casa, tudo pode ser mais feliz!",
    purposeValues: "Amor, respeito, solidariedade, obediência e fé!",
    badges: ["CONTEÚDO 100% CRISTÃO E SEGURO", "PARA TODAS AS IDADES INFANTIS", "PARTICIPAÇÃO DA FAMÍLIA", "AMBIENTE SEGURO E ACOLHEDOR"],
    finalText: "JESUS NA MINHA CASA",
    finalSubtext: "UM LUGAR DE AMOR, APRENDIZADO E MUITA ALEGRIA!"
  },
  projectInfo: {
    importanceTitle: "Qual a importância do Culto no Lar?",
    importanceText: "Atualmente tantos afazeres diários tem tomado tempo da vida das pessoas, fazendo com que; na maioria das vezes sobre pouquíssimo tempo para dar atenção de qualidade à família. Todos estão cansados depois de um longo dia de trabalho, estudos, etc.\n\nMeses e anos se passando muito rápido, muitos acabam não percebendo que suas relações familiares acabam se fragilizando.\n\nA família é um projeto de Deus para nós e devemos zelar por ela, sendo que uma das formas é realizando o Culto no Lar, que é ordem de Deus aos pais, conforme vemos em Deuteronômio 6:1-7.\n\n“Você as inculcará a seus filhos, e delas falará quando estiver sentado em sua casa, andando pelo caminho, ao deitar-se e ao levantar-se”\n\nAtravés do Culto no Lar tanto casais como seus filhos são abençoados ricamente.",
    rulesTitle: "Regras do Projeto",
    rules: [
      "A criança levará a maleta “Jesus na minha casa” e retornará na no próximo domingo;",
      "A criança ficará uma semana com a pasta e realizará o culto um dia da semana com a família;",
      "O culto no lar não precisa ser longo para não se tornar cansativo, principalmente para as crianças menores. (Faça um culto de até 30 minutos);",
      "No momento da oração lembre-se de agradecer também, é tão importante quanto pedir;",
      "Este deve ser um momento prazeroso para todos e não deve trazer aborrecimentos, brigas ou repreensões;",
      "Somente os pais façam as anotações;",
      "Todos os itens da maleta poderão ser utilizados por todos os membros da família;",
      "Não amassar, não rasgar, não sujar, devolver conforme recebeu (lembre que outra família utilizará);",
      "Entregar a maleta para a pessoa responsável."
    ],
    programTitle: "Programa do Culto",
    program: [
      "Oração inicial",
      "Hinos Cantados",
      "Leitura Bíblica",
      "Leitura do Livro infantil",
      "Oportunidade para falar da leitura",
      "Oração de Agradecimento",
      "Hino Cantado em Agradecimento",
      "Oração em família e término",
      "Nos enviar foto da família no Culto",
      "Preencher o pedido de oração da família, e entregar para a pessoa responsável."
    ]
  }
};
