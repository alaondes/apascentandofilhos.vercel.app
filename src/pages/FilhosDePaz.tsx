import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Link2, Linkedin, Twitter, MessageCircle } from "lucide-react";
import { db } from "../lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

export default function FilhosDePaz() {
  const [data, setData] = useState<any>({
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
  });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "content", "filhos_de_paz"), (snap) => {
      if (snap.exists()) {
        setData((prev: any) => ({ ...prev, ...snap.data() }));
      }
    });
    return () => unsub();
  }, []);

  return (
    <div className="pt-20 bg-[#f7f7f7] min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[400px] w-full bg-black">
        <div className="absolute inset-0 z-10 bg-black/40" />
        <img
          src={data.heroImage}
          alt="Banner background"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 z-20 max-w-6xl mx-auto px-6 pt-16 flex justify-between items-start">
          <h1 className="text-white text-5xl md:text-6xl font-black font-sans tracking-tight whitespace-pre-wrap">
            {data.heroTitle}
          </h1>
          <button className="bg-white rounded-full w-8 h-8 flex items-center justify-center text-black font-bold">
            <Link2 size={16} />
          </button>
        </div>
      </section>

      {/* Main Content Overlapping */}
      <section className="max-w-6xl mx-auto px-6 relative z-30 -mt-36">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Text Card */}
          <div className="bg-white p-8 md:p-12 w-full md:w-1/2 shadow-sm rounded-[2px]">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{data.sectionTitle}</h2>
            <div className="space-y-6 text-sm text-gray-600 leading-relaxed font-medium">
              <p>{data.text1}</p>
              <p>{data.text2}</p>
              <p>{data.text3}</p>
            </div>
            
            {/* Share */}
            <div className="mt-8 flex items-center gap-4 text-[10px] font-bold text-gray-300 uppercase tracking-[0.1em]">
              Compartilhe
              <div className="flex items-center gap-3">
                <button className="hover:text-gray-500 transition-colors"><Link2 size={12} /></button>
                <button className="hover:text-gray-500 transition-colors"><Linkedin size={12} /></button>
                <button className="hover:text-gray-500 transition-colors"><Twitter size={12} /></button>
                <button className="hover:text-gray-500 transition-colors"><MessageCircle size={12} /></button>
              </div>
            </div>
          </div>

          {/* Image Overlapping */}
          <div className="w-full md:w-1/2 border-8 border-white shadow-lg bg-white transform md:-translate-y-6 lg:-translate-y-12">
            <img 
              src={data.mainImage} 
              alt="Main Content" 
              className="w-full h-auto object-cover"
            />
          </div>
        </div>

        {/* Visão de Jesus section */}
        <div className="mt-16 text-left">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-6 font-sans">
            {data.visaoTitle}
          </h2>
          <div className="space-y-4 text-xs font-medium text-gray-800 leading-relaxed max-w-4xl whitespace-pre-wrap">
            <p>{data.visaoText1}</p>
            <p>{data.visaoText2}</p>
          </div>

          <div className="mt-12 flex justify-center pb-12">
            <a href={data.whatsappLink} target="_blank" rel="noopener noreferrer" className="bg-[#fc5d46] text-white px-8 py-2.5 rounded-full font-bold text-xs hover:bg-[#e04b36] transition-colors shadow-sm">
              Clique aqui e fale com a gente!
            </a>
          </div>
        </div>
      </section>

      {/* Outras redes section */}
      <section className="mt-16 relative bg-[#d6965f] pt-[400px]">
        {/* We want the grid to overlap the transition from #f7f7f7 to #d6965f, so we do it with absolute positioning or negative margin */}
      </section>
      
      <section className="relative bg-[#d6965f] pb-20">
        <div className="max-w-6xl mx-auto px-6 relative z-10 -mt-[450px]">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-[1.1]">
              Temos outras<br/>redes e ministérios
            </h2>
            <p className="text-gray-500 font-bold tracking-[0.3em] uppercase text-[9px] mt-6">
              Veja qual delas você mais se identifica
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Cards */}
            <div className="relative h-[340px] group overflow-hidden bg-black flex items-center justify-center">
              <img src="https://images.unsplash.com/photo-1510255562709-322ce64821db?auto=format&fit=crop&q=80&w=600" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" alt="Mulheres" />
              <h3 className="relative z-10 text-white font-black text-lg text-center px-4 w-full">Rede de Mulheres</h3>
            </div>
            <div className="relative h-[340px] group overflow-hidden bg-black flex items-center justify-center">
              <img src="https://images.unsplash.com/photo-1506869640319-fea1a2ab8e9c?auto=format&fit=crop&q=80&w=600" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" alt="Homens" />
              <h3 className="relative z-10 text-white font-black text-lg text-center px-4 w-full">Rede de Homens</h3>
            </div>
            <div className="relative h-[340px] group overflow-hidden bg-black flex items-center justify-center">
              <img src="https://images.unsplash.com/photo-1523580456209-567a5b3a32f6?auto=format&fit=crop&q=80&w=600" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" alt="Jovens" />
              <h3 className="relative z-10 text-white font-black text-lg text-center px-4 w-full">Flow Up Rede de Jovens</h3>
            </div>
            <div className="relative h-[340px] group overflow-hidden bg-black flex items-center justify-center">
              <img src="https://images.unsplash.com/photo-1511632765486-a01c80cb8fa4?auto=format&fit=crop&q=80&w=600" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" alt="Adolescentes" />
              <h3 className="relative z-10 text-white font-black text-lg text-center px-4 w-full">RISYTH Rede de Adolescentes</h3>
            </div>
          </div>

          <div className="mt-12 flex justify-center">
            <button className="bg-[#fc5d46] text-white px-8 py-2.5 rounded-full font-bold text-xs hover:bg-[#e04b36] transition-colors shadow-sm">
              carregar mais
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-white py-16 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-6 flex flex-col items-center text-center">
          <h3 className="text-sm font-bold text-gray-800 mb-8 font-sans">
            Receba nosso informativo da semana!
          </h3>
          <form className="w-full flex-col flex items-center gap-6">
            <div className="flex flex-col md:flex-row gap-3 w-full justify-center">
              <input type="text" placeholder="Nome" className="border border-gray-300 px-4 py-2.5 text-xs w-full md:w-56 outline-none focus:border-[#fc5d46] rounded-[2px]" />
              <input type="email" placeholder="E-mail" className="border border-gray-300 px-4 py-2.5 text-xs w-full md:w-56 outline-none focus:border-[#fc5d46] rounded-[2px]" />
              <input type="tel" placeholder="WhatsApp" className="border border-gray-300 px-4 py-2.5 text-xs w-full md:w-56 outline-none focus:border-[#fc5d46] rounded-[2px]" />
              <button type="submit" className="bg-[#fc5d46] hover:bg-[#e04b36] text-white font-bold px-8 py-2.5 text-xs min-w-[120px] rounded-[2px] transition-colors">
                Enviar
              </button>
            </div>
            <label className="flex items-start gap-3 mt-2 max-w-3xl cursor-pointer text-left">
              <input type="checkbox" className="mt-1 border-gray-300 text-[#fc5d46] outline-none rounded-[2px]" required />
              <span className="text-[9px] text-gray-500 font-medium leading-tight">
                Concordo que os dados preenchidos acima serão usados para o envio de conteúdo informativo, analítico e publicitário sobre produtos, serviços e assuntos gerais, nos termos da Lei Geral de Proteção de Dados.
              </span>
            </label>
          </form>
        </div>
      </section>
    </div>
  );
}
