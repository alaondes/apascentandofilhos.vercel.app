import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Calendar, Tag, ChevronLeft, Search, MessageCircle, Share2, Facebook, Twitter, Link as LinkIcon, Download, Smartphone, MoreVertical, Heart } from "lucide-react";

export default function ArtigoPage() {
  const { id } = useParams<{ id: string }>();
  const [artigo, setArtigo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [colunistaConfig, setColunistaConfig] = useState<any>(null);

  useEffect(() => {
    const fetchArtigo = async () => {
      setLoading(true);
      try {
        if (!id) return;
        const docRef = doc(db, "artigos", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const artigoData = { id: docSnap.id, ...data };
          setArtigo(artigoData);
          
          if (data.autorNome || data.colunistaId) {
             const homeDocRef = doc(db, "content", "home");
             const homeSnap = await getDoc(homeDocRef);
             if (homeSnap.exists()) {
                const homeData = homeSnap.data();
                const bloggers = homeData.bloggers || [];
                const normalize = (str: string) => str.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ /g, "-");
                
                const thisBlogger = bloggers.find((b: any) => {
                   // 1. Tenta match por colunistaId
                   if (data.colunistaId && b.userId === data.colunistaId) return true;
                   
                   // 2. Tenta match por nome (exato ou se o autorNome começa com o nome do colunista)
                   if (data.autorNome && b.name) {
                      const bNameN = normalize(b.name);
                      const autorNomeN = normalize(data.autorNome);
                      if (bNameN === autorNomeN) return true;
                      
                      // O autorNome pode estar vindo com parte do título junto ("membro2 aaaaa")
                      if (bNameN && autorNomeN.startsWith(bNameN)) return true;
                   }
                   return false;
                });
                
                if (thisBlogger) {
                   setColunistaConfig(thisBlogger);
                }
             }
          }
        }
      } catch (error) {
        console.error("Erro ao buscar artigo:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchArtigo();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center p-20 min-h-[60vh] items-center">
        <div className="animate-spin w-10 h-10 border-4 border-blue-900 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!artigo) {
    return (
      <div className="text-center p-20 min-h-[60vh] flex flex-col justify-center items-center">
        <h2 className="text-2xl font-bold text-gray-700">Artigo não encontrado.</h2>
        <Link to="/" className="mt-4 text-[#29367c] hover:underline">Voltar para o início</Link>
      </div>
    );
  }

  return (
    <div className="bg-[#f2f4f7] min-h-screen pb-12">
      {/* Header Banner - Premium Style */}
      <div className="relative w-full h-[300px] md:h-[450px] bg-[#0c2d48] overflow-hidden group mb-8">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[5s] group-hover:scale-105"
          style={{ backgroundImage: `url("${colunistaConfig?.bannerImg || 'https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?q=80&w=2500&auto=format&fit=crop'}")` }}
        ></div>
        <div className="absolute inset-0 bg-sky-900/10"></div>
        <div className="max-w-[1240px] mx-auto h-full px-6 md:px-12 relative flex items-center">
          <div className="z-20 w-full md:w-[65%] flex flex-col items-start translate-y-[-10px]">
            <div className="flex text-white/70 font-black text-[10px] md:text-[13px] tracking-[0.3em] mb-1 uppercase">
              <span className="border-b-2 border-white/30 pb-0.5">{colunistaConfig?.bannerSubtitle || "BLOG OFICIAL"}</span>
            </div>
            <h1 className="text-[4rem] md:text-[8rem] lg:text-[9.5rem] font-black text-white leading-[0.85] tracking-[-0.04em] mb-2 uppercase select-none drop-shadow-2xl break-words">
              {colunistaConfig?.bannerTitle ? (
                colunistaConfig.bannerTitle.split('\n').map((line: string, i: number) => (
                  <span key={i} className={`block ${i === 0 ? 'opacity-100' : 'transition-transform duration-700 hover:translate-x-2'}`}>
                    {line}
                  </span>
                ))
              ) : (
                <>
                  <span className="block opacity-100">
                    {(colunistaConfig?.name || artigo.autorNome)?.toLowerCase().includes("macedo") ? "BISPO EDIR" : (colunistaConfig?.name || artigo.autorNome || "").split(' ').slice(0, 2).join(' ')}
                  </span>
                  <span className="block transition-transform duration-700 hover:translate-x-2">
                    {(colunistaConfig?.name || artigo.autorNome)?.toLowerCase().includes("macedo") ? "MACEDO" : (colunistaConfig?.name || artigo.autorNome || "").split(' ').slice(2).join(' ')}
                  </span>
                </>
              )}
            </h1>
            <div className="relative max-w-[600px] mt-1">
              <p className="text-white font-black text-[15px] md:text-[23px] leading-[1.05] tracking-tight uppercase drop-shadow-xl text-left break-words">
                {colunistaConfig?.bannerQuote || "“NÃO ESCOLHEMOS VIR AO MUNDO, MAS TEMOS O DIREITO DE ESCOLHER ONDE VIVER A ETERNIDADE.”"}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-[1240px] mx-auto px-4 md:px-6 flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Article Content */}
        <div className="flex-1 lg:max-w-[800px] w-full pb-10">
          
          <div className="flex items-center text-xs font-bold uppercase tracking-wider mb-2">
             <span className="bg-[#e41e26] text-white px-2.5 py-0.5 rounded-full mr-3 text-[10.5px] font-black">
               {(colunistaConfig?.name || artigo.autorNome || "ESTER BEZERRA").toUpperCase()}
             </span>
             <span className="text-gray-500 flex items-center font-bold text-[11px]">
               <Calendar size={13} className="mr-1.5 opacity-70" />
               {artigo.createdAt?.toDate ? artigo.createdAt.toDate().toLocaleDateString('pt-BR') : '29/08/2026'}
             </span>
          </div>
          
          <div className="flex justify-between items-start mb-0">
             <h1 className="text-[1.7rem] md:text-[2rem] font-bold text-[#1a2d54] leading-[1.1] tracking-tight break-words">
                {artigo.titulo}
             </h1>
             <button className="text-gray-400 hover:text-gray-600 pt-1">
                <MoreVertical size={20} />
             </button>
          </div>
          
          <div className="w-4 h-1 bg-[#e41e26] mb-2 mt-2"></div>
          
          {artigo.resumo && (
            <p className="text-gray-500 font-medium text-[14px] md:text-[15px] leading-snug mb-6 break-words">
              {artigo.resumo}
            </p>
          )}

          {artigo.imagemUrl ? (
            <div className="w-full rounded-[14px] overflow-hidden mb-6 shadow-sm">
              <img src={artigo.imagemUrl || undefined} alt={artigo.titulo} className="w-full h-auto object-cover max-h-[450px]" />
            </div>
          ) : (
            <div className="w-full rounded-[14px] overflow-hidden mb-6 bg-gray-200 h-[300px] md:h-[400px] flex items-center justify-center shadow-sm">
               <span className="text-gray-400 font-bold uppercase tracking-widest text-sm">Sem imagem de capa</span>
            </div>
          )}
          
          <div className="max-w-none text-[#1a2d54] leading-relaxed mb-10 text-[14.5px] break-words">
            {artigo.conteudo.split('\n').map((paragraph: string, idx: number) => {
              if (paragraph.trim() === '') return null;
              
              return (
                <p key={idx} className="mb-5 text-[15px] leading-relaxed">
                  {paragraph}
                </p>
              );
            })}
          </div>
          
          {/* Author footer */}
          <div className="border-t border-b border-gray-200 py-3 mb-8 flex flex-wrap items-center justify-between gap-4">
             <div className="flex items-center gap-3">
                <img 
                  src={colunistaConfig?.img || "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=150&h=150&auto=format&fit=crop"} 
                  alt={colunistaConfig?.name || artigo.autorNome}
                  className="w-[38px] h-[38px] rounded-full object-cover shadow-sm bg-gray-100" 
                />
                <div>
                   <span className="text-[10px] text-gray-500 font-medium block uppercase tracking-wider mb-[1px]">Colaborador</span>
                   <span className="text-[13px] font-bold text-[#1a2d54] leading-none">{colunistaConfig?.name || artigo.autorNome}</span>
                </div>
             </div>
             
             <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#1a2d54] hover:text-red-700 transition-colors">
                   <div className="w-[22px] h-[22px] rounded-full bg-[#1e2a4a] text-white flex items-center justify-center relative overflow-hidden">
                      <div className="w-8 h-px bg-[#e41e26] absolute rotate-45"></div>
                   </div>
                   Reportar erro
                </button>
             </div>
          </div>
          
        </div>
        
        {/* Right Sidebar */}
        <div className="w-full lg:w-[320px] flex-shrink-0 flex flex-col gap-8">
           
           {/* Search */}
           <div className="bg-[#cfd5e1] rounded-lg p-1">
             <div className="bg-white/80 rounded-md flex items-center px-4 py-3">
                <input 
                  type="text" 
                  placeholder="O que você procura?" 
                  className="bg-transparent flex-1 outline-none text-sm font-medium text-gray-700"
                />
                <Search size={18} className="text-gray-400" />
             </div>
           </div>
           
           {/* Ad Block */}
           <div className="bg-[#243356] rounded-xl overflow-hidden shadow-sm">
              <div className="bg-[#142542] text-white text-xs font-bold uppercase tracking-wider px-4 py-2">
                 Anúncio
              </div>
              <div className="w-full aspect-square bg-[#392e2c] relative">
                 <img src="https://images.unsplash.com/photo-1544390623-e18e6101150c?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover opacity-80 mix-blend-overlay" alt="Anúncio" />
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-6 bg-black/40">
                    <span className="text-[10px] font-medium tracking-widest mb-1">O SENHOR</span>
                    <h4 className="text-2xl font-serif font-bold italic text-yellow-500 mb-2">é a serva</h4>
                    <span className="border border-white/30 rounded-full px-4 py-1 text-xs font-bold mt-2 hover:bg-white hover:text-black transition-colors cursor-pointer">Saiba mais</span>
                 </div>
              </div>
           </div>
           
           {/* Mais Lidas */}
           <div>
              <h3 className="text-xl font-bold text-[#142542] mb-4 border-b pb-2">Mais Lidas</h3>
              <div className="flex flex-col gap-4">
                 {[
                   {num: "01", text: "Quem encontra Deus vê o que era mal se transformar"},
                   {num: "02", text: "O que a ciência e a política ensinam sobre os tempos atuais"},
                   {num: "03", text: "Domingo é o Dia do Senhor"},
                   {num: "04", text: "Por que as pessoas mudam?"},
                   {num: "05", text: "Mulher, você pode se livrar das feridas"}
                 ].map((item: any, i: number) => (
                   <div key={i} className="flex gap-4 group cursor-pointer">
                      <div className="w-10 h-10 rounded-full bg-white border-2 border-[#142542] flex items-center justify-center font-bold text-[#142542] shrink-0 group-hover:bg-[#142542] group-hover:text-white transition-colors">
                        {item.num}
                      </div>
                      <p className="text-sm font-bold text-[#142542] leading-tight group-hover:text-red-600 transition-colors pt-1">
                        {item.text}
                      </p>
                   </div>
                 ))}
              </div>
           </div>
           

           
        </div>
        
      </div>
    </div>
  );
}
