import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Save, Loader2, Plus, Trash2, Upload, Image as ImageIcon } from "lucide-react";
import { motion } from "motion/react";

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

export default function MafKidsAdmin() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"header" | "criacao" | "conselhos" | "livrinhos" | "rodape">("header");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetch() {
      const snap = await getDoc(doc(db, "content", "maf_kids"));
      if (snap.exists()) {
        setData(snap.data());
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
        {/* 2. Menu de Navegacao por Sub-abas (Header, Criação, Conselhos, Livrinhos, Rodapé) */}
        <div className="flex flex-wrap gap-2 p-2 bg-white border border-[#e2eaf3] shadow-sm rounded-2xl w-full">
          {[
            { id: "header", label: "Cabeçalho (Header)" },
            { id: "criacao", label: "A Cor da Criação" },
            { id: "conselhos", label: "Conselhos aos Pais" },
            { id: "livrinhos", label: "Livrinhos" },
            { id: "rodape", label: "Rodapé (Projeto e Propósito)" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-[#2D6A9F] text-white shadow-md drop-shadow-sm"
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-[#2D6A9F] border border-transparent hover:border-[#c8d8e8]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 3. Seções Ativas baseadas na seleção */}

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
                            <label className="text-[9px] text-gray-400 font-bold uppercase">Cor do Tema</label>
                            <select
                              className="w-full px-2.5 py-1.5 border border-[#c8d8e8] rounded-xl text-xs font-semibold bg-white outline-none"
                              value={b.theme || "pink"}
                              onChange={e => handleArrayChange(["books", "items"], i, "theme", e.target.value)}
                            >
                              <option value="pink">💖 Rosa</option>
                              <option value="orange">🧡 Laranja</option>
                              <option value="green">💚 Verde</option>
                              <option value="blue">💙 Azul</option>
                              <option value="purple">💜 Roxo</option>
                              <option value="yellow">💛 Amarelo</option>
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

        {/* Aba 5: Rodapé */}
        {activeTab === "rodape" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white border border-[#e2eaf3] p-6 lg:p-8 rounded-2xl space-y-6 shadow-sm">
              <h4 className="font-bold text-primary-dark mb-1 flex items-center gap-2 text-lg">
                <span className="text-xl">📋</span>
                Configurações: Rodapé (Projeto e Propósito)
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed italic border-b border-gray-100 pb-4">
                Edite os títulos, valores institucionais e missão exibidos no rodapé especial da página MAF Kids.
              </p>

              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase pl-1">Projeto Título Principal</label>
                  <input 
                    type="text" 
                    className="w-full p-2.5 border border-[#c8d8e8] rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2D6A9F]/20 outline-none transition-all font-bold text-gray-700" 
                    value={data.footer?.title || ""} 
                    onChange={e => handleNestedChange(["footer", "title"], e.target.value)} 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase pl-1">Texto Propósito</label>
                  <textarea 
                    rows={4}
                    className="w-full p-2.5 border border-[#c8d8e8] rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2D6A9F]/20 outline-none transition-all resize-none text-gray-700 leading-relaxed" 
                    value={data.footer?.purposeText || ""} 
                    onChange={e => handleNestedChange(["footer", "purposeText"], e.target.value)} 
                  />
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t border-gray-150">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#2D6A9F] text-white font-bold rounded-xl hover:bg-[#245785] transition shadow-md disabled:bg-gray-400 text-sm"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Salvar Rodapé
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
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
  }
};
