import React, { useState, useEffect } from "react";
import { Save, Upload, Plus, Trash2, Search, Mail, Download, RefreshCw, FileText } from "lucide-react";
import { db, handleFirestoreError, OperationType } from "../../lib/firebase";
import { doc, getDoc, setDoc, collection, query, orderBy, onSnapshot, deleteDoc } from "firebase/firestore";
import { motion } from "motion/react";

interface RedeItem {
  title: string;
  image: string;
  link?: string;
}

interface FilhosDePazData {
  heroTitle: string;
  heroImage: string;
  sectionTitle: string;
  text1: string;
  text2: string;
  text3: string;
  mainImage: string;
  visaoTitle: string;
  visaoText1: string;
  visaoText2: string;
  whatsappLink: string;
  whatsappText: string;
  redesBgColor: string;
  redesTitle: string;
  redesSub: string;
  redesList: RedeItem[];
}

const defaultData: FilhosDePazData = {
  heroTitle: "Filhos de Paz",
  heroImage: "https://images.unsplash.com/photo-1544256718-3baf24732b4f?auto=format&fit=crop&q=80&w=2000",
  sectionTitle: "Filhos de Paz",
  text1: "Um filho de paz é um lugar onde se leva a luz, a unção, e a presença Sobrenatural de Deus para uma família, vizinhos e amigos. Muitas pessoas, nos dias de hoje, estão decepcionadas com a igreja no ambiente do prédio.",
  text2: "Os filhos de paz têm como objetivo levar a mesma atmosfera do prédio para dentro da casa das pessoas. É um ambiente de adoração, celebração, oração e vida. Atraindo os sinais, Milagres e Maravilhas que Jesus prometeu em sua palavra para dentro da intimidade do lar.",
  text3: "Um filho de paz é um centro de reconciliação entre Deus e a família!",
  mainImage: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=800",
  visaoTitle: "Filhos de Paz - a Visão de Jesus para Evangelização",
  visaoText1: "Jesus em Lucas 10, deixou a estratégia simples e eficaz no processo de evangelização de casa em casa.\nTodo o processo começa com a preparação dos líderes dos Filhos de Paz. A formação e o treinamento acontecem dentro de um mês aproximadamente.",
  visaoText2: "No treinamento detalhamos toda a estratégia de Jesus para alcançarmos os \"não-crentes\" a partir da casa deles.\nPara participar do treinamento dos Filhos de Paz é preciso ser membro da Abba Church Marlboro, ter frequentado a classe de membresia e a escola de DNA e Fundamentos da Visão e Cultura da Abba Church Marlboro.",
  whatsappLink: "https://wa.me/55000000000",
  whatsappText: "Clique aqui e fale com a gente!",
  redesBgColor: "#d6965f",
  redesTitle: "Temos outras\nredes e ministérios",
  redesSub: "Veja qual delas você mais se identifica",
  redesList: [
    {
      title: "Rede de Mulheres",
      image: "https://images.unsplash.com/photo-1510255562709-322ce64821db?auto=format&fit=crop&q=80&w=600",
      link: "/cursos"
    },
    {
      title: "Rede de Homens",
      image: "https://images.unsplash.com/photo-1506869640319-fea1a2ab8e9c?auto=format&fit=crop&q=80&w=600",
      link: "/cursos"
    },
    {
      title: "Flow Up Rede de Jovens",
      image: "https://images.unsplash.com/photo-1523580456209-567a5b3a32f6?auto=format&fit=crop&q=80&w=600",
      link: "/cursos"
    },
    {
      title: "RISYTH Rede de Adolescentes",
      image: "https://images.unsplash.com/photo-1511632765486-a01c80cb8fa4?auto=format&fit=crop&q=80&w=600",
      link: "/cursos"
    },
  ],
};

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
        const MAX_WIDTH = 1200; // Allow slightly larger images for this page
        const MAX_HEIGHT = 1200;
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
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        resolve(dataUrl);
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

interface FilhosDePazPanelProps {
  activeSection?: string;
}

export default function FilhosDePazPanel({ activeSection = "filhos_de_paz_hero" }: FilhosDePazPanelProps) {
  const [data, setData] = useState<FilhosDePazData>(defaultData);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Subscribers states
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoadingSubs, setIsLoadingSubs] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activeSection === "filhos_de_paz_subscribers") {
      setIsLoadingSubs(true);
      const q = query(collection(db, "newsletter_subscribers"), orderBy("createdAt", "desc"));
      const unsub = onSnapshot(q, (snapshot) => {
        const subsList: any[] = [];
        snapshot.forEach((doc) => {
          subsList.push({ id: doc.id, ...doc.data() });
        });
        setSubscribers(subsList);
        setIsLoadingSubs(false);
      }, (error) => {
         console.error("Error setting up subscribers listener:", error);
         setIsLoadingSubs(false);
         handleFirestoreError(error, OperationType.LIST, "newsletter_subscribers");
      });
      return () => unsub();
    }
  }, [activeSection]);

  const handleDeleteSubscriber = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDeleteSubscriber = async () => {
    if (!deleteConfirmId) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "newsletter_subscribers", deleteConfirmId));
      setDeleteConfirmId(null);
    } catch (error) {
      console.error("Error deleting subscriber:", error);
      handleFirestoreError(error, OperationType.DELETE, `newsletter_subscribers/${deleteConfirmId}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportCSV = () => {
    if (subscribers.length === 0) {
      alert("Nenhum inscrito para exportar.");
      return;
    }
    const headers = ["Nome", "E-mail", "WhatsApp", "Data de Cadastro"];
    const rows = subscribers.map((sub) => {
      const dateStr = sub.createdAt?.seconds 
        ? new Date(sub.createdAt.seconds * 1000).toLocaleString("pt-BR") 
        : "";
      return [sub.name, sub.email, sub.whatsapp, dateStr];
    });

    const csvContent = "\uFEFF" + [headers, ...rows]
      .map((e) => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `inscritos_informativo_filhos_de_paz_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchData = async () => {
    try {
      const docRef = doc(db, "content", "filhos_de_paz");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setData({ ...defaultData, ...docSnap.data() } as FilhosDePazData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleAddRede = () => {
    setData((prev) => ({
      ...prev,
      redesList: [...(prev.redesList || []), { title: "", image: "" }],
    }));
  };

  const handleDeleteRede = (index: number) => {
    setData((prev) => {
      const newList = [...(prev.redesList || [])];
      newList.splice(index, 1);
      return { ...prev, redesList: newList };
    });
  };

  const handleRedeChange = (index: number, field: keyof RedeItem, value: string) => {
    setData((prev) => {
      const newList = [...(prev.redesList || [])];
      newList[index] = { ...newList[index], [field]: value };
      return { ...prev, redesList: newList };
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSuccessMessage("");
    try {
      await setDoc(doc(db, "content", "filhos_de_paz"), data);
      setSuccessMessage("Conteúdo salvo com sucesso!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Erro ao salvar. Verifique se o usuário tem permissão.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Carregando painel...</div>;

  const showHero = activeSection === "filhos_de_paz_hero" || activeSection === "filhos_de_paz_editor";
  const showMain = activeSection === "filhos_de_paz_main";
  const showVisao = activeSection === "filhos_de_paz_visao";
  const showRedes = activeSection === "filhos_de_paz_redes";
  const showSubscribers = activeSection === "filhos_de_paz_subscribers";

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h2 className="text-xl font-bold text-primary-dark">Painel Filhos de Paz</h2>
        <p className="text-gray-500 text-sm mt-1">
          {showHero && "Gerencie o banner principal e a imagem de fundo do topo."}
          {showMain && "Gerencie o conteúdo principal, títulos e imagem auxiliar."}
          {showVisao && "Gerencie a estratégia e textos explicativos da Visão de Jesus."}
          {showRedes && "Gerencie outras redes, ministérios e links correspondentes."}
          {showSubscribers && "Gerencie a lista de contatos inscritos pelo formulário informativo."}
        </p>
      </div>

      {showHero && (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Seção Hero (Topo)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input
                  type="text"
                  name="heroTitle"
                  value={data.heroTitle}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-base focus:border-transparent outline-none"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL da Imagem de Fundo (Topo)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="heroImage"
                    value={data.heroImage}
                    onChange={handleChange}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-base focus:border-transparent outline-none"
                    placeholder="Cole a URL ou faça um upload"
                  />
                  <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer font-bold text-sm transition-colors cursor-pointer border border-gray-200 whitespace-nowrap">
                    <Upload size={16} />
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
                            setData({ ...data, heroImage: base64 });
                          } catch (err) {
                            alert("Erro ao processar imagem.");
                          }
                        }
                      }}
                    />
                  </label>
                </div>
                {data.heroImage && (
                  <div className="mt-3">
                     <span className="block text-xs font-bold text-gray-400 uppercase mb-2">Visualização</span>
                     <img src={data.heroImage || "https://images.unsplash.com/photo-1544256718-3baf24732b4f?auto=format&fit=crop&q=80&w=2000"} alt="Preview Fundo" className="h-32 w-full object-cover rounded-lg border border-gray-200 shadow-sm" />
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-4 mt-4 border-t border-gray-100 items-center gap-4">
            {successMessage && <span className="text-green-600 font-medium text-sm">{successMessage}</span>}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-primary-base hover:bg-primary-dark text-white px-6 py-2 rounded-lg font-bold shadow-sm transition-colors flex items-center gap-2 text-sm"
            >
              {isSaving ? "Salvando..." : <><Save size={16} /> Salvar Alterações</>}
            </button>
          </div>
        </div>
      )}

      {showMain && (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Conteúdo Principal</h3>
          <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título da Seção</label>
                <input
                  type="text"
                  name="sectionTitle"
                  value={data.sectionTitle}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-base focus:border-transparent outline-none"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Texto Principal 1</label>
                <textarea
                  name="text1"
                  value={data.text1}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-base focus:border-transparent outline-none"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Texto Principal 2</label>
                <textarea
                  name="text2"
                  value={data.text2}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-base focus:border-transparent outline-none"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Texto Principal 3 (Destaque)</label>
                <textarea
                  name="text3"
                  value={data.text3}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-base focus:border-transparent outline-none"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL Imagem Principal (Família)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="mainImage"
                    value={data.mainImage}
                    onChange={handleChange}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-base focus:border-transparent outline-none"
                    placeholder="Cole a URL ou faça um upload"
                  />
                  <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer font-bold text-sm transition-colors cursor-pointer border border-gray-200 whitespace-nowrap">
                    <Upload size={16} />
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
                            setData({ ...data, mainImage: base64 });
                          } catch (err) {
                            alert("Erro ao processar imagem.");
                          }
                        }
                      }}
                    />
                  </label>
                </div>
                {data.mainImage && (
                  <div className="mt-3">
                     <span className="block text-xs font-bold text-gray-400 uppercase mb-2">Visualização</span>
                     <img src={data.mainImage || "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=800"} alt="Preview Principal" className="h-40 w-auto object-cover rounded-lg border border-gray-200 shadow-sm" />
                  </div>
                )}
            </div>
          </div>
          <div className="flex justify-end pt-4 mt-4 border-t border-gray-100 items-center gap-4">
            {successMessage && <span className="text-green-600 font-medium text-sm">{successMessage}</span>}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-primary-base hover:bg-primary-dark text-white px-6 py-2 rounded-lg font-bold shadow-sm transition-colors flex items-center gap-2 text-sm"
            >
              {isSaving ? "Salvando..." : <><Save size={16} /> Salvar Alterações</>}
            </button>
          </div>
        </div>
      )}

       {showVisao && (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Seção Visão de Jesus</h3>
          <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input
                  type="text"
                  name="visaoTitle"
                  value={data.visaoTitle}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-base focus:border-transparent outline-none"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Texto 1</label>
                <textarea
                  name="visaoText1"
                  value={data.visaoText1}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-base focus:border-transparent outline-none"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Texto 2</label>
                <textarea
                  name="visaoText2"
                  value={data.visaoText2}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-base focus:border-transparent outline-none"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link WhatsApp</label>
                <input
                  type="text"
                  name="whatsappLink"
                  value={data.whatsappLink}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-base focus:border-transparent outline-none"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Texto do Botão WhatsApp</label>
                <input
                  type="text"
                  name="whatsappText"
                  value={data.whatsappText || ""}
                  onChange={handleChange}
                  placeholder="Ex: Clique aqui e fale com a gente!"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-base focus:border-transparent outline-none"
                />
            </div>
          </div>
          <div className="flex justify-end pt-4 mt-4 border-t border-gray-100 items-center gap-4">
            {successMessage && <span className="text-green-600 font-medium text-sm">{successMessage}</span>}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-primary-base hover:bg-primary-dark text-white px-6 py-2 rounded-lg font-bold shadow-sm transition-colors flex items-center gap-2 text-sm"
            >
              {isSaving ? "Salvando..." : <><Save size={16} /> Salvar Alterações</>}
            </button>
          </div>
        </div>
      )}

      {showRedes && (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Seção Outras Redes e Ministérios</h3>
          
          {/* Background Color Picker & Titles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cor de Fundo da Seção</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  name="redesBgColor"
                  value={data.redesBgColor || "#d6965f"}
                  onChange={handleChange}
                  className="w-10 h-10 border border-gray-200 rounded-lg cursor-pointer p-1"
                />
                <input
                  type="text"
                  name="redesBgColor"
                  value={data.redesBgColor || "#d6965f"}
                  onChange={handleChange}
                  placeholder="#d6965f"
                  className="flex-1 px-3 py-1 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-base focus:border-transparent outline-none uppercase font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título da Seção</label>
              <input
                type="text"
                name="redesTitle"
                value={data.redesTitle || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-base focus:border-transparent outline-none"
                placeholder="Ex: Temos outras\nredes e ministérios"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo da Seção</label>
              <input
                type="text"
                name="redesSub"
                value={data.redesSub || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-base focus:border-transparent outline-none"
                placeholder="Ex: Veja qual delas você mais se identifica"
              />
            </div>
          </div>

          {/* List of networks */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-bold text-gray-700">Lista de Redes/Ministérios ({data.redesList?.length || 0})</h4>
              <button
                type="button"
                onClick={handleAddRede}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-bold transition-colors"
              >
                <Plus size={14} />
                Adicionar Rede
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.redesList?.map((rede, idx) => (
                <div key={idx} className="p-4 border border-gray-100 rounded-lg bg-gray-50/50 space-y-3 relative">
                  <button
                    type="button"
                    onClick={() => handleDeleteRede(idx)}
                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                    title="Excluir"
                  >
                    <Trash2 size={16} />
                  </button>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Título da Rede #{idx + 1}</label>
                    <input
                      type="text"
                      value={rede.title}
                      onChange={(e) => handleRedeChange(idx, "title", e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-base outline-none bg-white"
                      placeholder="Ex: Rede de Mulheres"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Link de Redirecionamento #{idx + 1}</label>
                    <input
                      type="text"
                      value={rede.link || ""}
                      onChange={(e) => handleRedeChange(idx, "link", e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-base outline-none bg-white font-mono text-xs"
                      placeholder="Ex: /cursos, /galeria ou link completo (https://...)"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Imagem da Rede #{idx + 1}</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={rede.image}
                        onChange={(e) => handleRedeChange(idx, "image", e.target.value)}
                        className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-base outline-none bg-white"
                        placeholder="Cole a URL ou faça um upload"
                      />
                      <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-700 rounded-lg hover:bg-gray-100 cursor-pointer text-xs font-bold transition-colors border border-gray-200 whitespace-nowrap">
                        <Upload size={14} />
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
                                handleRedeChange(idx, "image", base64);
                              } catch (err) {
                                alert("Erro ao processar imagem.");
                              }
                            }
                          }}
                        />
                      </label>
                    </div>
                    {rede.image && (
                      <div className="mt-2 text-center">
                        <img src={rede.image} alt={rede.title} className="h-20 max-w-full mx-auto object-cover rounded border border-gray-200 shadow-xs" referrerPolicy="no-referrer" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4 mt-4 border-t border-gray-100 items-center gap-4">
            {successMessage && <span className="text-green-600 font-medium text-sm">{successMessage}</span>}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-primary-base hover:bg-primary-dark text-white px-6 py-2 rounded-lg font-bold shadow-sm transition-colors flex items-center gap-2 text-sm"
            >
              {isSaving ? "Salvando..." : <><Save size={16} /> Salvar Alterações</>}
            </button>
          </div>
        </div>
      )}

      {showSubscribers && (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Contatos do Informativo</h3>
              <p className="text-gray-500 text-xs mt-1">
                Total de inscritos: <span className="font-bold text-primary-base">{subscribers.length}</span>
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleExportCSV}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Download size={14} /> Exportar CSV
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome, e-mail ou whatsapp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-full text-xs border border-gray-200 bg-gray-50/50 rounded-lg focus:bg-white focus:ring-2 focus:ring-primary-base outline-none transition-all"
            />
          </div>

          {isLoadingSubs ? (
            <div className="p-12 text-center text-gray-500 flex flex-col items-center gap-3">
              <RefreshCw className="animate-spin text-primary-base" size={24} />
              <span>Carregando inscrições...</span>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-100">
              <table className="min-w-full divide-y divide-gray-100 text-left text-sm">
                <thead className="bg-gray-50 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3">Inscrito</th>
                    <th className="px-6 py-3">E-mail</th>
                    <th className="px-6 py-3">WhatsApp</th>
                    <th className="px-6 py-3">Data de Cadastro</th>
                    <th className="px-6 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {subscribers.filter(sub => {
                    const term = searchTerm.toLowerCase();
                    return (
                      sub.name?.toLowerCase().includes(term) ||
                      sub.email?.toLowerCase().includes(term) ||
                      sub.whatsapp?.toLowerCase().includes(term)
                    );
                  }).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-400 font-medium">
                        <div className="flex flex-col items-center gap-2">
                          <Mail size={32} className="text-gray-300" />
                          <span>Nenhum inscrito correspondente encontrado.</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    subscribers.filter(sub => {
                      const term = searchTerm.toLowerCase();
                      return (
                        sub.name?.toLowerCase().includes(term) ||
                        sub.email?.toLowerCase().includes(term) ||
                        sub.whatsapp?.toLowerCase().includes(term)
                      );
                    }).map((sub) => {
                      const rawPhone = sub.whatsapp || "";
                      const formattedPhone = rawPhone.replace(/\D/g, "");
                      const waUrl = formattedPhone ? `https://wa.me/${formattedPhone}` : null;
                      const dateStr = sub.createdAt?.seconds 
                        ? new Date(sub.createdAt.seconds * 1000).toLocaleString("pt-BR") 
                        : "Sem data";

                      return (
                        <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="whitespace-nowrap px-6 py-4 font-bold text-gray-900">
                            {sub.name}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-gray-600 font-medium font-mono text-xs">
                            {sub.email}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            {waUrl ? (
                              <a
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-primary-base hover:text-primary-dark font-semibold text-xs bg-primary-light/10 px-2 py-1 rounded"
                              >
                                {sub.whatsapp}
                              </a>
                            ) : (
                              <span className="text-gray-400 italic text-xs">{sub.whatsapp || "-"}</span>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-gray-500 text-xs">
                            {dateStr}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-right">
                            <button
                              onClick={() => handleDeleteSubscriber(sub.id)}
                              className="text-gray-400 hover:text-red-500 p-1.5 rounded hover:bg-red-50/80 transition-all inline-flex items-center"
                              title="Remover inscrito"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" id="delete-confirm-modal-overlay">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6 text-center"
            id="delete-confirm-modal-box"
          >
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4" id="delete-confirm-modal-icon">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2" id="delete-confirm-modal-heading">
              Confirmar Exclusão
            </h3>
            <p className="text-gray-500 text-sm mb-6" id="delete-confirm-modal-description">
              Tem certeza que deseja excluir este inscrito? Essa ação não pode ser desfeita.
            </p>
            <div className="flex gap-3" id="delete-confirm-modal-buttons">
              <button
                id="delete-confirm-modal-cancel-btn"
                disabled={isDeleting}
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                id="delete-confirm-modal-confirm-btn"
                disabled={isDeleting}
                onClick={confirmDeleteSubscriber}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
              >
                {isDeleting ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
