import React, { useState, useEffect } from "react";
import { Save, Upload } from "lucide-react";
import { db } from "../../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

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
};

export default function FilhosDePazPanel() {
  const [data, setData] = useState<FilhosDePazData>(defaultData);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

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

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-primary-dark">Painel Filhos de Paz</h2>
        <p className="text-gray-500 text-sm mt-1">Gerencie os textos e a imagem da página Filhos de Paz.</p>
      </div>

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
              <label className="block text-sm font-medium text-gray-700 mb-1">URL Imagem Fundo</label>
              <input
                type="text"
                name="heroImage"
                value={data.heroImage}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-base focus:border-transparent outline-none"
              />
            </div>
          </div>
        </div>
      </div>

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
              <input
                type="text"
                name="mainImage"
                value={data.mainImage}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-base focus:border-transparent outline-none"
              />
          </div>
        </div>
      </div>

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
        </div>
      </div>

      <div className="flex justify-end gap-4">
         {successMessage && (
          <span className="text-green-600 font-medium self-center">{successMessage}</span>
        )}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-primary-base hover:bg-primary-dark text-white px-6 py-2.5 rounded-lg font-bold shadow-md transition-colors flex items-center gap-2"
        >
          {isSaving ? "Salvando..." : (
            <>
              <Save size={20} />
              Salvar Alterações
            </>
          )}
        </button>
      </div>

    </div>
  );
}
