import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useFirebase } from "../context/FirebaseContext";
import {
  Calendar,
  ChevronRight,
  MoreVertical,
  MessageCircle,
} from "lucide-react";

export default function ColunistaPage() {
  const { nome } = useParams<{ nome: string }>();
  const { profile } = useFirebase();
  const [artigos, setArtigos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [colunistaConfig, setColunistaConfig] = useState<any>(null);

  // Decodifica o nome formatado da URL
  const nomeFormatado = nome ? decodeURIComponent(nome).replace(/-/g, " ") : "";

  useEffect(() => {
    if (!nome) return;
    
    const fetchConfig = async () => {
      try {
        const homeDocRef = doc(db, "content", "home");
        const snapshot = await getDoc(homeDocRef);
        if (snapshot.exists()) {
          const homeData = snapshot.data();
          const bloggers = homeData.bloggers || [];
          
          const normalize = (str: string) => str.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ /g, "-");
          const urlSlug = normalize(nome || "");
          
          const thisBlogger = bloggers.find((b: any) => {
            const bloggerSlug = normalize(b.name || "");
            return bloggerSlug === urlSlug;
          });
          
          if (thisBlogger) {
            setColunistaConfig(thisBlogger);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar configurações da home:", error);
      }
    };

    const fetchArtigos = async () => {
      setLoading(true);
      try {
        if (!nomeFormatado) return;
        const homeDocRef = doc(db, "content", "home");
        const homeSnap = await getDoc(homeDocRef);
        let linkedUserId: string | null = null;
        if (homeSnap.exists()) {
          const bloggers = homeSnap.data().bloggers || [];
          const normalize = (str: string) => str.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ /g, "-");
          const urlSlug = normalize(nome || "");
          
          const thisBlogger = bloggers.find((b: any) => normalize(b.name || "") === urlSlug);
          if (thisBlogger && thisBlogger.userId) {
            linkedUserId = thisBlogger.userId;
          }
        }

        const q = query(collection(db, "artigos"));
        const querySnapshot = await getDocs(q);

        let data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as any),
        }));

        // Filter by autorNome ignoring case, OR by the linkedUserId
        data = data.filter((art) => {
          const matchNome =
            art.autorNome &&
            art.autorNome.toLowerCase().replace(/ /g, "-") ===
              nome?.toLowerCase();
          const matchId = linkedUserId && art.colunistaId === linkedUserId;
          return matchNome || matchId;
        });

        // Filter out drafts
        data = data.filter((a) => a.status === "publicado" || !a.status);

        // Sort by timestamp descending
        data.sort((a, b) => {
          const tA = a.createdAt?.seconds ? a.createdAt.seconds : 0;
          const tB = b.createdAt?.seconds ? b.createdAt.seconds : 0;
          return tB - tA;
        });

        // Filter out drafts if we have status (optional, assuming we only show "publicado", but for now show all if needed or default to publicado later)
        // data = data.filter(a => a.status !== "rascunho");

        setArtigos(data);
      } catch (error) {
        console.error("Erro ao buscar artigos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
    fetchArtigos();
  }, [nome, nomeFormatado]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-10 h-10 border-4 border-blue-900 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Header Banner - Premium Style to match requested image */}
      <div className="relative w-full h-[380px] md:h-[520px] bg-[#0c2d48] overflow-hidden group">
        {/* heavenly Blue Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[5s] group-hover:scale-110"
          style={{ backgroundImage: `url("${colunistaConfig?.bannerImg || 'https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?q=80&w=2500&auto=format&fit=crop'}")` }}
        ></div>
        
        {/* Overlays for depth and text legibility */}
        <div className="absolute inset-0 bg-sky-900/10"></div>

        <div className="max-w-[1240px] mx-auto h-full px-6 md:px-12 relative flex items-center">
          <div className="z-20 w-full md:w-[65%] flex flex-col items-start translate-y-[-10px]">
            {/* Header Tagline */}
            <div className="flex text-white/70 font-black text-[10px] md:text-[13px] tracking-[0.3em] mb-1 uppercase">
              <span className="border-b-2 border-white/30 pb-0.5">{colunistaConfig?.bannerSubtitle || "BLOG OFICIAL"}</span>
            </div>
            
            {/* Main Title - Extreme Scaling */}
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
                    {nomeFormatado.toLowerCase().includes("macedo") ? "BISPO EDIR" : nomeFormatado.split(' ').slice(0, 2).join(' ')}
                  </span>
                  <span className="block transition-transform duration-700 hover:translate-x-2">
                    {nomeFormatado.toLowerCase().includes("macedo") ? "MACEDO" : nomeFormatado.split(' ').slice(2).join(' ')}
                  </span>
                </>
              )}
            </h1>
            
            {/* Quote Section */}
            <div className="relative max-w-[600px] mt-1">
              <p className="text-white font-black text-[15px] md:text-[23px] leading-[1.05] tracking-tight uppercase drop-shadow-xl text-left break-words">
                {colunistaConfig?.bannerQuote || "“NÃO ESCOLHEMOS VIR AO MUNDO, MAS TEMOS O DIREITO DE ESCOLHER ONDE VIVER A ETERNIDADE.”"}
              </p>
            </div>
          </div>
        </div>

        {/* Global Bottom Transition effects */}
        <div className="absolute bottom-[-1px] left-0 right-0 h-10 bg-white z-30"></div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-[1140px] mx-auto px-4 py-12 flex flex-col lg:flex-row gap-12">
        {/* Left Column (Main Feed) */}
        <div className="lg:w-[68%]">
          <div className="relative mb-8 pb-3">
            <h2 className="text-3xl font-bold text-[#142542]">
              {nomeFormatado}
            </h2>
            <div className="absolute bottom-0 left-0 w-8 h-[3px] bg-red-600"></div>
          </div>

          {artigos.length === 0 ? (
            <div className="bg-gray-50 p-10 rounded border border-gray-200 text-center text-gray-500">
              Nenhum artigo publicado ainda por este colunista.
            </div>
          ) : (
            <div className="space-y-6">
              {artigos.map((artigo) => (
                <div
                  key={artigo.id}
                  className="flex flex-col md:flex-row gap-6 bg-white border border-gray-100 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.08)] rounded-[20px] p-2 pr-6 transition-shadow hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.12)] relative"
                >
                  {/* Left: Image */}
                  <div className="w-full md:w-[280px] shrink-0 h-[180px] md:h-[220px] rounded-2xl overflow-hidden relative bg-gray-100 flex items-center justify-center">
                    {artigo.imagemUrl ? (
                      <img src={artigo.imagemUrl} alt={artigo.titulo} className="w-full h-full object-cover" />
                    ) : nomeFormatado.toLowerCase().includes("macedo") ? (
                      <div className="absolute inset-0 flex bg-[#1c1815]">
                        {/* Custom Thumbnail for Macedo */}
                        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-0"></div>
                        <div className="w-[60%] p-4 z-10 flex flex-col justify-center">
                          <h4 className="text-white font-black text-[22px] leading-tight">
                            {artigo.titulo.length > 50
                              ? artigo.titulo.substring(0, 50) + "..."
                              : artigo.titulo}
                          </h4>
                        </div>
                        <div className="w-[40%] h-full relative z-0">
                          <img
                            src="https://images.unsplash.com/photo-1545167622-3a6ac756afa4?q=80&w=400&auto=format&fit=crop"
                            alt="Thumbnail"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute right-2 top-0 bottom-0 flex items-center">
                          <span className="text-[#a48c6b] font-serif text-3xl opacity-30 origin-bottom -rotate-90 whitespace-nowrap">
                            BispoMacedo
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-[#2a241e] to-[#1a1612] flex items-center justify-center p-4 text-center">
                        <h4 className="text-[#e2caab] font-black text-[22px] leading-tight drop-shadow-md tracking-tight">
                          {artigo.titulo.length > 50
                            ? artigo.titulo.substring(0, 50) + "..."
                            : artigo.titulo}
                        </h4>
                      </div>
                    )}
                  </div>

                  {/* Right: Content */}
                  <div className="flex-1 flex flex-col justify-between relative py-3 min-w-0">
                    {/* Three dots icon */}
                    <button className="absolute right-0 top-3 text-gray-400 hover:text-gray-600">
                      <MoreVertical size={20} />
                    </button>

                    <div>
                      <div className="flex items-center mb-3 min-w-0">
                        <span className="bg-red-600 text-white px-3 py-1 rounded-full text-[11px] font-bold truncate max-w-full">
                          {artigo.autorNome || nomeFormatado}
                        </span>
                      </div>

                      <div className="flex items-center text-sm font-semibold text-gray-500 mb-2">
                        <Calendar size={15} className="mr-2" />
                        {artigo.createdAt?.toDate
                          ? artigo.createdAt
                              .toDate()
                              .toLocaleDateString("pt-BR")
                          : "Hoje"}
                      </div>

                      <h3 className="text-xl md:text-[22px] font-bold text-[#1a4a7b] leading-tight mb-2 pr-6 break-words">
                        {artigo.titulo}
                      </h3>

                      <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed pr-6 break-words">
                        "{artigo.conteudo}"
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <Link
                        to={`/artigo/${artigo.id}`}
                        className="bg-[#3b82f6] hover:bg-blue-600 text-white font-bold py-2.5 px-6 rounded-full transition-colors flex-shrink-0"
                      >
                        Continue lendo
                      </Link>

                      <div className="relative flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer shrink-0">
                         <MessageCircle size={20} />
                         <span className="absolute -top-1 -right-1 bg-[#142542] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                           {Math.floor(Math.random() * 5)}
                         </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column (Sidebar) */}
        <div className="lg:w-[32%] space-y-10">
          <div>
            <div className="border-t-4 border-red-600 pt-2 mb-6">
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-widest">
                Mais Lidas
              </h3>
            </div>

            <div className="space-y-6">
              {artigos.slice(0, 5).map((art, idx) => (
                <Link
                  key={art.id}
                  to={`/artigo/${art.id}`}
                  className="group flex gap-4 items-start"
                >
                  <span className="text-4xl font-black text-gray-200 group-hover:text-red-100 transition-colors leading-none font-serif italic mt-1">
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-base sm:text-lg font-serif font-bold text-gray-900 group-hover:text-red-700 transition-colors leading-snug break-words">
                      {art.titulo}
                    </h4>
                  </div>
                </Link>
              ))}
              {artigos.length === 0 && (
                <p className="text-sm text-gray-500">
                  Nenhuma postagem disponível.
                </p>
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 text-center">
            <h4 className="font-bold text-gray-900 mb-4 uppercase tracking-wider text-sm">
              Siga nas redes sociais
            </h4>
            <div className="flex justify-center gap-3">
              {colunistaConfig?.facebook && (
                <a 
                  href={colunistaConfig.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold hover:scale-110 transition-transform"
                >
                  f
                </a>
              )}
              {colunistaConfig?.instagram && (
                <a 
                  href={colunistaConfig.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-pink-600 text-white flex items-center justify-center font-bold hover:scale-110 transition-transform"
                >
                  in
                </a>
              )}
              {colunistaConfig?.twitter && (
                <a 
                  href={colunistaConfig.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold hover:scale-110 transition-transform"
                >
                  tw
                </a>
              )}
              {colunistaConfig?.youtube && (
                <a 
                  href={colunistaConfig.youtube} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-bold hover:scale-110 transition-transform"
                >
                  yt
                </a>
              )}
              {!colunistaConfig?.facebook && !colunistaConfig?.instagram && !colunistaConfig?.twitter && !colunistaConfig?.youtube && (
                <p className="text-xs text-gray-400 italic">Redes sociais não configuradas</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
