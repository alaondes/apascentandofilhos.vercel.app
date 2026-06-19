import React, { useEffect, useState } from "react";
import { 
  Heart, Star, ShieldCheck, Check, Search, Brush, ChevronLeft, ChevronRight
} from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import {
  CriacaoCover,
  ArcaNoeCover,
  DaviGoliasCover,
  JonasPeixeCover,
  JesusCriancasCover
} from "../components/KidsIllustrations";

const themeMap: Record<string, { bg: string; border: string; tBg: string; btn: string; text: string; iconBg: string }> = {
  pink: { 
    bg: "bg-[#fff8f9]", 
    border: "border-[#fcc5d1]", 
    tBg: "bg-[#e91e63]", 
    btn: "bg-[#e91e63] hover:bg-[#d81b60] shadow-[0_5px_0_#9d0a3d] hover:shadow-[0_2px_0_#9d0a3d] hover:translate-y-[3px]", 
    text: "text-[#d81b60]", 
    iconBg: "bg-[#fff0f2]" 
  },
  orange: { 
    bg: "bg-[#fffbf2]", 
    border: "border-[#ffe082]", 
    tBg: "bg-[#ffa100]", 
    btn: "bg-[#ff9800] hover:bg-[#f57c00] shadow-[0_5px_0_#e65100] hover:shadow-[0_2px_0_#e65100] hover:translate-y-[3px]", 
    text: "text-[#e65100]", 
    iconBg: "bg-[#fffdf0]" 
  },
  green: { 
    bg: "bg-[#f9fdf8]", 
    border: "border-[#ccebce]", 
    tBg: "bg-[#4caf50]", 
    btn: "bg-[#4caf50] hover:bg-[#43a047] shadow-[0_5px_0_#2e7d32] hover:shadow-[0_2px_0_#2e7d32] hover:translate-y-[3px]", 
    text: "text-[#2e7d32]", 
    iconBg: "bg-[#f5fcf4]" 
  },
  blue: { 
    bg: "bg-[#f5fbfe]", 
    border: "border-[#c4e3fc]", 
    tBg: "bg-[#2196f3]", 
    btn: "bg-[#2196f3] hover:bg-[#1e88e5] shadow-[0_5px_0_#1565c0] hover:shadow-[0_2px_0_#1565c0] hover:translate-y-[3px]", 
    text: "text-[#1565c0]", 
    iconBg: "bg-[#f0f9ff]" 
  },
  purple: { 
    bg: "bg-[#faf7fe]", 
    border: "border-[#e6cff1]", 
    tBg: "bg-[#9c27b0]", 
    btn: "bg-[#9c27b0] hover:bg-[#8e24aa] shadow-[0_5px_0_#6a1b9a] hover:shadow-[0_2px_0_#6a1b9a] hover:translate-y-[3px]", 
    text: "text-[#6a1b9a]", 
    iconBg: "bg-[#f6effc]" 
  },
  yellow: { 
    bg: "bg-[#fffdf0]", 
    border: "border-[#ffe082]", 
    tBg: "bg-[#fbc02d]", 
    btn: "bg-[#fbc02d] hover:bg-[#f9a825] shadow-[0_5px_0_#f57f17] hover:shadow-[0_2px_0_#f57f17] hover:translate-y-[3px]", 
    text: "text-[#e56c00]", 
    iconBg: "bg-[#fffde7]" 
  },
  red: { 
    bg: "bg-[#fffaf9]", 
    border: "border-[#ffccd1]", 
    tBg: "bg-[#f44336]", 
    btn: "bg-[#f44336] hover:bg-[#e53935] shadow-[0_5px_0_#b71c1c] hover:shadow-[0_2px_0_#b71c1c] hover:translate-y-[3px]", 
    text: "text-[#b71c1c]", 
    iconBg: "bg-[#ffebee]" 
  },
  cyan: { 
    bg: "bg-[#f4fcfe]", 
    border: "border-[#b2ebf2]", 
    tBg: "bg-[#00bcd4]", 
    btn: "bg-[#00bcd4] hover:bg-[#00acc1] shadow-[0_5px_0_#006064] hover:shadow-[0_2px_0_#006064] hover:translate-y-[3px]", 
    text: "text-[#006064]", 
    iconBg: "bg-[#e0f7fa]" 
  },
  teal: { 
    bg: "bg-[#f4fbf9]", 
    border: "border-[#b2dfdb]", 
    tBg: "bg-[#009688]", 
    btn: "bg-[#009688] hover:bg-[#00897b] shadow-[0_5px_0_#004d40] hover:shadow-[0_2px_0_#004d40] hover:translate-y-[3px]", 
    text: "text-[#004d40]", 
    iconBg: "bg-[#e0f2f1]" 
  },
  brown: { 
    bg: "bg-[#fdfaf7]", 
    border: "border-[#d7ccc8]", 
    tBg: "bg-[#795548]", 
    btn: "bg-[#795548] hover:bg-[#6d4c41] shadow-[0_5px_0_#3e2723] hover:shadow-[0_2px_0_#3e2723] hover:translate-y-[3px]", 
    text: "text-[#3e2723]", 
    iconBg: "bg-[#efebe9]" 
  },
  lime: { 
    bg: "bg-[#fcfdf2]", 
    border: "border-[#e6ee9c]", 
    tBg: "bg-[#afb42b]", 
    btn: "bg-[#afb42b] hover:bg-[#9e9d24] shadow-[0_5px_0_#827717] hover:shadow-[0_2px_0_#827717] hover:translate-y-[3px]", 
    text: "text-[#827717]", 
    iconBg: "bg-[#f9fbe7]" 
  },
  grape: { 
    bg: "bg-[#faf5ff]", 
    border: "border-[#e1bee7]", 
    tBg: "bg-[#8e24aa]", 
    btn: "bg-[#8e24aa] hover:bg-[#7b1fa2] shadow-[0_5px_0_#4a148c] hover:shadow-[0_2px_0_#4a148c] hover:translate-y-[3px]", 
    text: "text-[#6a1b9a]", 
    iconBg: "bg-[#f3e5f5]" 
  }
};

export default function MafKids() {
  const [data, setData] = useState<any>(null);
  const [booksStartIndex, setBooksStartIndex] = useState<number>(0);
  const [visibleCount, setVisibleCount] = useState<number>(4);
  const [kidsAlert, setKidsAlert] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const snap = await getDoc(doc(db, "content", "maf_kids"));
      if (snap.exists()) {
        setData(snap.data());
      } else {
        setData(defaultData);
      }
    }
    load();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setVisibleCount(4);
      } else if (window.innerWidth >= 640) {
        setVisibleCount(2);
      } else {
        setVisibleCount(1);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const booksList = data?.books?.items || defaultData.books.items;

  useEffect(() => {
    if (booksList) {
      setBooksStartIndex(prev => Math.min(prev, Math.max(0, booksList.length - visibleCount)));
    }
  }, [visibleCount, booksList?.length]);

  if (!data) return (
    <div className="flex items-center justify-center min-h-screen bg-[#cbf3f0]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#ff9f1c]"></div>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-white font-sans overflow-x-hidden flex flex-col items-center pt-24 pb-12">
      <div className="w-full max-w-[1200px] border-[10px] border-white shadow-2xl rounded-3xl overflow-hidden bg-white flex flex-col">
        
        {/* --- 1 & 2. UNIFIED TOP CONTAINER (HEADER & MIDDLE) --- */}
        <div 
          className="w-full relative flex flex-col bg-no-repeat bg-cover bg-center rounded-b-[32px] overflow-hidden shadow-sm"
          style={data.header?.bgImageUrl ? { backgroundImage: `url(${data.header.bgImageUrl})` } : {}}
        >
            {/* --- 1. HEADER SECTION --- */}
          <div 
            className={`w-full relative px-4 flex flex-col items-center overflow-hidden ${data.header?.bgImageUrl ? "bg-transparent pt-32 pb-6 min-h-[350px] md:min-h-[480px] justify-end" : "bg-gradient-to-b from-[#b3e5fc] to-[#e1f5fe] pt-10 pb-6"}`}
          >
            {/* Dark overlay if we have a background image, optional for readability, let's just make sure it's visible */}
            
            {/* Header images (Placeholders with emojis matching the drawing) */}
            {!data.header?.bgImageUrl && (
              <div className="absolute top-4 left-4 lg:left-12 flex flex-col items-center z-10 w-48 text-center hidden md:flex">
                 <div className="bg-white rounded-2xl rounded-br-none px-3 py-2 shadow-sm border-2 border-gray-100 relative mb-3">
                   <p className="text-[#0d47a1] font-black text-[11px] leading-tight text-center">
                     {data.header?.speechBubble?.split("\n").map((l: string, i: number) => <span key={i}>{l}<br/></span>)}
                   </p>
                   <div className="absolute -bottom-2 right-4 w-3 h-3 bg-white border-b-2 border-r-2 border-gray-100 transform rotate-45"></div>
                 </div>
                 <div className="text-8xl drop-shadow-md z-10 relative">👦🏻
                   <span className="absolute bottom-2 right-0 text-3xl">📘</span>
                 </div>
                 <div className="text-5xl absolute bottom-0 left-0 drop-shadow-md">🌻</div>
              </div>
            )}

            {!data.header?.bgImageUrl && (
              <div className="absolute top-4 right-4 lg:right-12 flex flex-col items-center z-10 w-48 text-center hidden md:flex">
                 <div className="text-8xl drop-shadow-md relative z-10">
                   👧🏻
                   <span className="absolute top-0 right-0 text-5xl">🔎</span>
                 </div>
                 <div className="text-5xl absolute bottom-10 right-0 drop-shadow-md">🐑</div>
                 <div className="bg-[#ffca28] rounded-2xl px-3 py-2 shadow-sm border-2 border-[#ffb300] transform rotate-3 mt-2">
                   <p className="text-[#bf360c] font-black text-[11px] leading-tight text-center">
                     {data.header?.sign?.split("\n").map((l: string, i: number) => <span key={i}>{l}<br/></span>)}
                   </p>
                 </div>
              </div>
            )}

            {!data.header?.bgImageUrl && (
              <div className="absolute top-0 right-0 w-full h-full opacity-30 select-none pointer-events-none">
                 <div className="absolute top-10 left-[20%] text-white text-6xl">☁️</div>
                 <div className="absolute top-20 right-[30%] text-white text-8xl">☁️</div>
                 <div className="absolute top-[80%] left-[10%] text-5xl">🌸</div>
                 <div className="absolute top-[75%] right-[15%] text-4xl">🌻</div>
              </div>
            )}

            {/* Title Area */}
            <div className="relative z-20 flex flex-col items-center w-full max-w-3xl">
              {data.header?.logoUrl && (
                <img 
                  src={data.header.logoUrl} 
                  alt="Logo" 
                  className="max-h-[160px] md:max-h-[220px] object-contain mb-6 drop-shadow-md select-none pointer-events-none"
                  referrerPolicy="no-referrer"
                />
              )}
              {!data.header?.bgImageUrl && (
                <>
                  <h1 className="text-[#0d47a1] font-black text-2xl md:text-4xl lg:text-5xl tracking-tight uppercase shadow-white drop-shadow-[0_2px_0_rgba(255,255,255,1)] mb-1 text-center" style={{ WebkitTextStroke: "1.5px #fff" }}>
                    {data.header?.title?.split(" A")[0] || "APRENDER É UMA"}
                  </h1>
                  
                  <div className="flex justify-center items-center -mt-2 mb-3">
                    {("AVENTURA!").split('').map((letter, i) => {
                      const colors = ['text-[#29b6f6]', 'text-[#ffa726]', 'text-[#ec407a]', 'text-[#29b6f6]', 'text-[#66bb6a]', 'text-[#ffa726]', 'text-[#ec407a]', 'text-[#ab47bc]', 'text-[#29b6f6]'];
                      return (
                        <span key={i} className={`text-6xl md:text-7xl lg:text-[7.5rem] font-black uppercase ${colors[i % colors.length]} drop-shadow-md transform -rotate-1`} style={{ WebkitTextStroke: "2.5px white" }}>
                          {letter}
                        </span>
                      );
                    })}
                  </div>
                </>
              )}
              
              {data.header?.subtitle && (
                <div className="bg-[#1565c0] text-white px-8 py-2 rounded-full font-black text-[10px] md:text-sm uppercase tracking-wider border-[3px] border-[#1976d2] shadow-[0_4px_0_#0d47a1] text-center max-w-[90%] font-sans">
                  {data.header?.subtitle}
                </div>
              )}
            </div>

            {/* Badges Row */}
            <div className="mt-12 grid grid-cols-2 lg:grid-cols-5 gap-2 w-full max-w-[1000px] z-20 px-2 lg:px-0">
              {(data.header?.badges || defaultData.header.badges).map((badge: any, idx: number) => {
                const th = [
                  { bg: "bg-[#f8bbd0]", border: "border-[#f06292]", text: "text-[#c2185b]", iconBg: "bg-[#f48fb1]", emoji: "📖" },
                  { bg: "bg-[#c8e6c9]", border: "border-[#81c784]", text: "text-[#1b5e20]", iconBg: "bg-[#a5d6a7]", emoji: "🎮" },
                  { bg: "bg-[#fff9c4]", border: "border-[#fff176]", text: "text-[#f57f17]", iconBg: "bg-[#fff59d]", emoji: "🎨" },
                  { bg: "bg-[#e1bee7]", border: "border-[#ba68c8]", text: "text-[#6a1b9a]", iconBg: "bg-[#ce93d8]", emoji: "▶️" },
                  { bg: "bg-[#bbdefb]", border: "border-[#64b5f6]", text: "text-[#0d47a1]", iconBg: "bg-[#90caf9]", emoji: "🏆" }
                ][idx % 5];

                return (
                  <div key={idx} className={`${th.bg} rounded-[20px] shadow-sm border-[4px] ${th.border} flex flex-col overflow-hidden text-center pb-2 h-full transform hover:-translate-y-1 transition-transform`}>
                    <div className={`${th.iconBg} h-16 sm:h-24 flex items-center justify-center relative border-b-4 ${th.border}`}>
                      <span className="text-4xl sm:text-5xl drop-shadow-md z-10">{th.emoji}</span>
                      <div className="absolute w-[60%] h-[60%] bg-white/30 rounded-xl transform rotate-12 z-0"></div>
                    </div>
                    <div className={`p-2 flex flex-col items-center justify-center flex-grow ${th.text}`}>
                      <h3 className="font-black text-[12px] sm:text-[14px] uppercase leading-tight mb-1 px-1">{badge.title}</h3>
                      <p className="text-[10px] text-black font-extrabold leading-tight px-1 opacity-80">{badge.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* --- 2. MIDDLE (COR DA CRIAÇÃO & CONSELHOS) --- */}
          <div 
            className={`pt-6 pb-6 px-4 w-full flex flex-col items-center relative ${data.header?.bgImageUrl ? "bg-transparent border-t-0" : "bg-white border-t border-gray-100"}`}
          >
          <div className="w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* Cor da Criação */}
            <div 
              className="bg-[#f1f8e9] rounded-[24px] border-4 border-[#dcedc8] p-4 flex flex-col relative w-full h-auto shadow-sm"
            >
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-[#1b5e20] font-black text-xl md:text-2xl uppercase tracking-tighter" style={{ WebkitTextStroke: "1px white" }}>
                  {data.middle1?.leftBox?.title || "A COR DA CRIAÇÃO"}
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                <div className="md:col-span-3 flex flex-col justify-between h-full">
                  <p className="text-[#2e7d32] font-semibold text-[11px] lg:text-[12px] leading-tight mb-3">
                    {data.middle1?.leftBox?.desc}
                  </p>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 w-full mt-auto pt-2">
                    {(data.middle1?.leftBox?.colors || defaultData.middle1.leftBox.colors).map((c: any, i: number) => {
                      const isBgClass = c.color?.startsWith('bg-');
                      return (
                        <div key={i} className="flex flex-col items-center">
                          <div 
                            className={`w-9 h-9 md:w-10 md:h-10 rounded-full border-2 border-white shadow flex items-center justify-center mb-0.5 transform hover:scale-115 transition-transform ${isBgClass ? c.color : ''}`} 
                            style={isBgClass ? {} : { backgroundColor: c.color }}
                          >
                             <span className="text-white font-black text-[5px] uppercase tracking-tighter leading-none px-0.5 text-center drop-shadow-md">{c.name}</span>
                          </div>
                          <span className="text-[6px] font-black text-[#1b5e20] uppercase text-center leading-[1.1]">{c.meaning}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="md:col-span-2 flex items-center justify-center w-full">
                  {data.middle1?.leftBox?.imageUrl ? (
                    <img 
                      src={data.middle1.leftBox.imageUrl} 
                      alt="Cor da Criação" 
                      className="w-full h-auto rounded-xl shadow-sm border-2 border-white animate-fade-in" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full aspect-[4/3] rounded-xl border-2 border-[#dcedc8] border-dashed flex items-center justify-center bg-white/50 text-6xl py-6">
                      🌈🖌️
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Conselhos aos Pais */}
            <div 
              className="bg-[#fffde7] rounded-[24px] border-4 border-[#fff59d] p-4 flex flex-col relative w-full h-auto shadow-sm"
            >
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-[#e65100] font-black text-xl md:text-2xl uppercase tracking-tighter" style={{ WebkitTextStroke: "1px white" }}>
                  {data.middle1?.rightBox?.title || "CONSELHOS AOS PAIS"}
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                <div className="md:col-span-3 flex flex-col justify-between h-full">
                  <p className="text-[#5d4037] font-semibold text-[11px] lg:text-[12px] leading-tight mb-3">
                    {data.middle1?.rightBox?.desc}
                  </p>

                  <div className="grid grid-cols-4 gap-1 bg-white/90 rounded-2xl p-1.5 border-2 border-[#fffdb7] w-full mt-auto shadow-sm">
                    {(data.middle1?.rightBox?.icons || defaultData.middle1.rightBox.icons).map((item: any, i: number) => {
                      const emojis = ["📖", "💬", "⭐", "⏰"];
                      return (
                        <div key={i} className="flex flex-col items-center">
                          <div className="w-7 h-7 md:w-8 md:h-8 bg-[#5c6bc0] rounded-lg border-b-[2px] border-[#3949ab] flex items-center justify-center mb-0.5 shadow-sm transform hover:scale-110 transition-transform">
                            <span className="text-white text-[10px] md:text-xs">{emojis[i]}</span>
                          </div>
                          <span className="text-[6px] md:text-[7px] font-bold text-[#5d4037] text-center whitespace-pre-line leading-none">
                            {item.title}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="md:col-span-2 flex items-center justify-center w-full">
                  {data.middle1?.rightBox?.imageUrl ? (
                    <img 
                      src={data.middle1.rightBox.imageUrl} 
                      alt="Conselhos Pais" 
                      className="w-full h-auto rounded-xl shadow-sm border-2 border-white animate-fade-in" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full aspect-[4/3] rounded-xl border-2 border-[#fff59d] border-dashed flex items-center justify-center bg-white/50 text-6xl py-6">
                      👨‍👩‍👧‍👦
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="w-full flex flex-col md:flex-row justify-center items-center mt-6 lg:mt-4 relative gap-0">
            <div className="bg-[#1e88e5] text-white px-6 md:px-8 py-2 md:py-2.5 rounded-full md:rounded-r-none font-black uppercase text-[11px] md:text-[13px] flex items-center justify-center gap-2 shadow-[0_4px_0_#1565c0] border-2 border-[#1976d2] md:border-r-0 z-10 w-full md:w-auto relative mb-2 md:mb-0">
              TODO DIA TEM ALGO NOVO AQUI! <Heart className="text-[#f44336] fill-current" size={16} />
            </div>
            <div className="bg-[#ffca28] text-[#e65100] px-6 md:px-8 py-2 md:py-2.5 rounded-full md:rounded-l-none md:rounded-r-full font-black uppercase text-[11px] md:text-[13px] flex items-center justify-center gap-2 shadow-[0_4px_0_#ffb300] border-2 border-[#ffb300] z-0 w-full md:w-auto md:-ml-2">
              VENHA FAZER PARTE DESSA FAMÍLIA! <Star className="text-[#e65100] fill-current" size={16} />
            </div>
          </div>
        </div>
      </div>

        {/* --- 3. LIVRINHOS --- */}
        <div 
          id="livrinhos" 
          className={`w-full rounded-[32px] my-6 pt-6 pb-10 px-4 flex flex-col items-center border-[6px] border-dashed relative shadow-md overflow-visible bg-no-repeat bg-cover bg-center transition-all ${data.books?.bgImageUrl ? "border-transparent" : "bg-[#fff9c4] border-[#ffee58]"}`}
          style={data.books?.bgImageUrl ? { backgroundImage: `url(${data.books.bgImageUrl})` } : {}}
        >
          
          {/* Responsive Header Container containing Title */}
          <div className="w-full max-w-[800px] flex flex-col items-center justify-center gap-2 mb-6 z-10">
            {/* Bubble Title and Pill */}
            <div className="flex flex-col items-center text-center w-full">
              {data.books?.logoUrl && (
                <img 
                  src={data.books.logoUrl} 
                  alt="Logo Livrinhos" 
                  className="max-h-[120px] md:max-h-[180px] object-contain mb-4 drop-shadow-md select-none pointer-events-none"
                  referrerPolicy="no-referrer"
                />
              )}

              <div className="bg-[#1b5ec5] text-white px-7 py-2 md:py-2.5 rounded-full font-black text-[13px] md:text-[15.5px] tracking-wider mb-4 flex items-center justify-center gap-3 relative z-10 w-full max-w-[480px] shadow-[0_6px_0_#0d3980] border-2 border-white/20">
                 <span className="w-2.5 h-2.5 bg-[#ffa100] rounded-full border-2 border-white/80 shrink-0 shadow-sm animate-pulse"></span>
                 PARA LER, APRENDER E SE DIVERTIR!
                 <span className="w-2.5 h-2.5 bg-[#ffa100] rounded-full border-2 border-white/80 shrink-0 shadow-sm animate-pulse"></span>
              </div>

              <p className="text-[#37474f] font-extrabold text-[12px] md:text-[13px] uppercase flex items-center justify-center gap-1 mt-1">
                Histórias que ensinam, edificam e aproximam do amor de Jesus! <Heart className="text-[#e53935] fill-current shrink-0" size={14} />
              </p>
            </div>
          </div>

          {/* Book Cards Carousel Container */}
          <div className="w-full max-w-[1240px] relative px-4 md:px-14 z-10">
            {/* Left Button */}
            {booksStartIndex > 0 && (
              <button 
                type="button"
                onClick={() => setBooksStartIndex(prev => Math.max(0, prev - 1))}
                className="absolute left-1 md:left-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white border-4 border-[#ff9800] text-[#ff9800] hover:bg-[#ff9800] hover:text-white flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all z-35 cursor-pointer"
                title="Anterior"
              >
                <ChevronLeft size={28} strokeWidth={3.5} />
              </button>
            )}

            {/* Right Button */}
            {booksStartIndex + visibleCount < booksList.length && (
              <button 
                type="button"
                onClick={() => setBooksStartIndex(prev => Math.min(booksList.length - visibleCount, prev + 1))}
                className="absolute right-1 md:right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white border-4 border-[#ff9800] text-[#ff9800] hover:bg-[#ff9800] hover:text-white flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all z-35 cursor-pointer"
                title="Próximo"
              >
                <ChevronRight size={28} strokeWidth={3.5} />
              </button>
            )}

            {/* Book Cards Grid - Shows dynamic visible count */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 w-full">
              {booksList.slice(booksStartIndex, booksStartIndex + visibleCount).map((book: any, currentIdxInSlice: number) => {
                const idx = booksStartIndex + currentIdxInSlice;
                const defaultThemesKeys = ["pink", "orange", "green", "blue", "purple", "yellow", "red", "cyan", "teal", "brown", "lime", "grape"];
                const themeKey = book.theme || defaultThemesKeys[idx % defaultThemesKeys.length];
                const th = themeMap[themeKey] || themeMap.pink;
                
                const isColoring = book.type === "COLORIR";
                
                // Custom inline vector renderer for book illustrations when no imageUrl is provided
                const renderBookIllustration = (index: number, currentBook: any) => {
                  if (currentBook.imageUrl) {
                    return (
                      <img 
                        src={currentBook.imageUrl} 
                        alt={currentBook.title} 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                      />
                    );
                  }
                  switch (index % 5) {
                    case 0: return <CriacaoCover />;
                    case 1: return <ArcaNoeCover />;
                    case 2: return <DaviGoliasCover />;
                    case 3: return <JonasPeixeCover />;
                    case 4: return <JesusCriancasCover />;
                    default: return (
                      <div className="absolute w-full h-full flex items-center justify-center bg-white text-5xl">
                         📖
                       </div>
                    );
                  }
                };

                return (
                  <div key={idx} className={`${th.bg} rounded-[28px] border-[5px] ${th.border} flex flex-col items-center text-center shadow-md relative border-b-[8px] transform hover:-translate-y-1 transition-all duration-200 h-[350px] justify-between p-3.5 pt-7 overflow-visible`}>
                    
                    {/* Absolute Cover Image when custom image exists */}
                    {book.imageUrl && (
                      <div className="absolute inset-0 rounded-[23px] overflow-hidden z-0">
                        <img 
                          src={book.imageUrl} 
                          alt={book.title || "Capa Customizada"} 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                        {/* Subtle elegant gradient overlay to ensure buttons pop beautifully and remain readable */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
                      </div>
                    )}

                    {/* Top Header Badge */}
                    <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 ${th.btn.split(" ")[0]} text-white border-2 border-white px-3.5 py-0.5 rounded-full font-black text-[10px] uppercase flex items-center gap-1 shadow-md whitespace-nowrap z-20`}>
                      <Star size={9} fill="currentColor" /> {book.label} <Star size={9} fill="currentColor" />
                    </div>

                    {book.imageUrl ? (
                      /* If custom image exists, we just render an empty spacer so the button stays aligned at the bottom */
                      <div className="flex-grow z-10 w-full" />
                    ) : (
                      /* If no custom image exists, render default vector style card with only the mini illustration box */
                      <div className="w-full flex-grow flex flex-col justify-center items-center z-10 min-h-0 pt-1">
                        {/* Outer Frame with inner image container - Portrait fixed dimensions for perfect alignment and zero overflow */}
                        <div className={`w-[145px] h-[195px] mx-auto rounded-2xl border-3 ${th.border} flex items-center justify-center overflow-hidden relative shadow-inner p-0 bg-white shrink-0`}>
                          {renderBookIllustration(idx, book)}
                        </div>
                      </div>
                    )}

                    {/* Glass Glossy 3D Link */}
                    <a 
                      href={book.pdfUrl || undefined}
                      target={book.pdfUrl ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        if (!book.pdfUrl) {
                          e.preventDefault();
                          setKidsAlert(
                            isColoring 
                              ? "Obba! Este desenho para colorir estará pronto para baixar e imprimir em breve! Prepare seus lápis de cor! 🎨🖍️"
                              : "Obba! Esta linda história com lições bíblicas estará disponível para leitura em breve! Fique de olho! 📖❤️"
                          );
                        }
                      }}
                      className={`w-full py-2.5 rounded-full text-white font-black text-[12px] uppercase flex items-center justify-center gap-1.5 ${th.btn} active:translate-y-[4px] active:shadow-none transition-all duration-150 z-10 cursor-pointer select-none`}
                    >
                      {isColoring ? (
                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current shrink-0">
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.42l-2.34-2.34c-.39-.39-1.02-.39-1.42 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current shrink-0">
                          <path d="M12 21c-1.2-1.2-3.5-1.5-5-1.5H3v-13h4c1.5 0 3.8.3 5 1.5 1.2-1.2 3.5-1.5 5-1.5h4v13h-4c-1.5 0-3.8.3-5 1.5zm0-2.3c1.3-1 3.5-1.2 5-1.2h2v-9.5h-2c-1.5 0-3.7.2-5 1.2V18.7z"/>
                        </svg>
                      )}
                      <span className="tracking-wide">{book.btnText || (isColoring ? "BAIXAR" : "LER AGORA")}</span>
                    </a>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Badges with absolutely positioned smiling star and coloring crayon decorations */}
          <div className="w-full flex flex-col md:flex-row justify-center items-center mt-10 lg:mt-8 gap-4 md:gap-8 relative z-10 max-w-[900px] px-4">
            
            {/* Left Purple Badge with Overlapping Smiling Star */}
            <div className="relative w-full md:w-auto">
              {/* Smiling Star */}
              <div className="absolute -left-5 -top-5 w-12 h-12 rotate-[-12deg] select-none hover:scale-110 active:scale-95 transition-transform z-20">
                <svg viewBox="0 0 50 50" className="w-full h-full drop-shadow-md">
                  <path d="M25,2 L32,16 L48,18 L36,29 L40,45 L25,37 L10,45 L14,29 L2,18 L18,16 Z" fill="#ffca28" stroke="#f57c00" strokeWidth="2.5" />
                  {/* Rosy blush */}
                  <circle cx="16" cy="25" r="3.5" fill="#ef5350" opacity="0.6" />
                  <circle cx="34" cy="25" r="3.5" fill="#ef5350" opacity="0.6" />
                  {/* Eyes */}
                  <circle cx="21" cy="23" r="2" fill="#2d1d17" />
                  <circle cx="29" cy="23" r="2" fill="#2d1d17" />
                  {/* Smile */}
                  <path d="M22,28 Q25,31 28,28" stroke="#2d1d17" strokeWidth="2" strokeLinecap="round" fill="none" />
                </svg>
              </div>
              <div className="bg-[#ab47bc] text-white pl-9 pr-6 py-2 md:py-2.5 rounded-full font-black uppercase text-[11px] md:text-[13px] flex items-center justify-center gap-2 border-2 border-[#ce93d8] shadow-[0_4px_0_#8e24aa]">
                 NOVOS LIVRINHOS TODA SEMANA!
              </div>
            </div>

            {/* Right Yellow Badge with Overlapping Blue/Red Pencil Crayon */}
            <div className="relative w-full md:w-auto">
              <div className="bg-[#ffca28] text-[#c62828] pl-6 pr-10 py-2 md:py-2.5 rounded-full font-black uppercase text-[11px] md:text-[13px] flex items-center justify-center gap-2 border-2 border-[#ffe082] shadow-[0_4px_0_#ffb300]">
                 LEIA, APRENDA, COLORA E COMPARTILHE O AMOR DE JESUS!
              </div>
              {/* Blue and Red Crayon/Pencil */}
              <div className="absolute -right-5 -bottom-5 w-12 h-12 rotate-[42deg] select-none hover:scale-110 active:scale-95 transition-transform z-20">
                <svg viewBox="0 0 50 50" className="w-full h-full drop-shadow-md">
                  {/* Crayon main body (blue) */}
                  <rect x="18" y="6" width="13" height="28" rx="2.5" fill="#2196f3" stroke="#0d47a1" strokeWidth="2.5" />
                  {/* Crayon sleeve wrapper decoration in white/black */}
                  <rect x="18" y="15" width="13" height="10" fill="#ffffff" stroke="#0d47a1" strokeWidth="1.5" />
                  <circle cx="24.5" cy="20" r="2.5" fill="#2196f3" />
                  {/* Crayon colored tip (red) */}
                  <path d="M18,34 L24.5,45 L31,34 Z" fill="#e53935" stroke="#b71c1c" strokeWidth="2.5" />
                  {/* Shiny stroke highlight */}
                  <line x1="21" y1="10" x2="21" y2="30" stroke="#bbdefb" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* --- 4. BOTTOM (PROJETO JESUS) --- */}
        <div className="bg-[#f1f8e9] w-full rounded-[32px] mb-6 pt-10 pb-6 px-4 flex flex-col lg:flex-row items-stretch justify-center relative overflow-hidden shadow-md">
          
          <div className="absolute top-10 right-10 text-4xl opacity-50">☁️</div>
          <div className="absolute bottom-20 left-10 text-5xl opacity-50">🌻</div>

          <div className="w-full max-w-[1150px] flex flex-col lg:flex-row gap-6 lg:gap-8 z-10">
            
            {/* Left side */}
            <div className="lg:w-[32%] flex flex-col items-center lg:items-start relative w-full text-center lg:text-left">
              <div className="bg-white px-5 py-1 rounded-full text-[#42a5f5] font-black text-[12px] uppercase border-[3px] border-[#bbdefb] mb-1 flex items-center gap-1.5 self-center lg:self-start shadow-sm">
                PROJETO <span className="text-[12px] bg-[#ffeb3b] text-white rounded-full p-0.5 shadow-sm">⭐</span>
              </div>
              
              <div className="flex justify-center lg:justify-start items-center -ml-1 mb-2">
                {("JESUS").split('').map((letter, i) => {
                  const colors = ['text-[#2196f3]', 'text-[#f44336]', 'text-[#ff9800]', 'text-[#4caf50]', 'text-[#f44336]'];
                  return (
                    <span key={i} className={`text-7xl md:text-[6.5rem] lg:text-[6rem] xl:text-[6.5rem] font-black uppercase ${colors[i % colors.length]} drop-shadow-md tracking-tighter`} style={{ WebkitTextStroke: "2.5px white" }}>
                      {letter}
                    </span>
                  );
                })}
              </div>

              <div className="bg-[#1a237e] text-white px-5 py-2.5 rounded-full font-black text-[16px] md:text-[18px] uppercase border-[3px] border-[#3949ab] mb-2 relative flex justify-center items-center gap-3 w-full max-w-[320px] shadow-[0_4px_0_#0d47a1] z-10">
                <Star size={16} fill="white" />
                NA MINHA CASA
                <Star size={16} fill="white" />
              </div>

              <div className="bg-[#e53935] text-white px-4 py-2 font-black text-[12px] uppercase transform -skew-x-12 border-b-4 border-r-4 border-[#b71c1c] mb-6 self-center lg:self-start z-20 shadow-md">
                TUDO VOLTADO PARA CRIANÇAS!
              </div>

              <div className="w-full max-w-[320px] h-40 bg-white/40 border-4 border-white rounded-[24px] flex items-end justify-center relative shadow-inner overflow-hidden">
                 <div className="text-[7rem] absolute -bottom-6">👨‍👩‍👧‍👦</div>
              </div>
            </div>

            {/* Right side */}
            <div className="lg:w-[68%] w-full bg-white rounded-[32px] border-[6px] border-[#c8e6c9] p-5 lg:p-6 flex flex-col shadow-xl relative">
               
               <div className="bg-[#512da8] text-white px-6 py-2 rounded-full font-black text-[12px] md:text-[13px] uppercase self-center mb-6 border-[3px] border-[#7e57c2] shadow-[0_4px_0_#311b92]">
                 O QUE VOCÊ ENCONTRA AQUI:
               </div>

               <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 border-b-4 border-dashed border-[#c8e6c9] pb-6 mb-6">
                 {(data.footer?.findHereItems || defaultData.footer.findHereItems).map((item: any, idx: number) => {
                   const c = [
                     { bg: "bg-[#1e88e5]", em: "📖", border: "border-[#0d47a1]" },
                     { bg: "bg-[#7cb342]", em: "🎵", border: "border-[#33691e]" },
                     { bg: "bg-[#ffb300]", em: "🎨", border: "border-[#e65100]" },
                     { bg: "bg-[#7e57c2]", em: "🙏", border: "border-[#4527a0]" },
                     { bg: "bg-[#ef5350]", em: "🎁", border: "border-[#c62828]" }
                   ][idx % 5];
                   return (
                     <div key={idx} className="flex flex-col items-center text-center">
                       <div className={`w-12 h-12 rounded-full ${c.bg} flex items-center justify-center border-b-[4px] ${c.border} mb-1.5 shadow-sm transform hover:-translate-y-1 transition-transform`}>
                         <span className="text-2xl text-white">{c.em}</span>
                       </div>
                       <h4 className="text-[9px] font-black text-[#1b5e20] uppercase leading-tight mb-0.5">{item.title}</h4>
                       <p className="text-[8px] font-bold text-[#388e3c] leading-tight px-1">{item.desc}</p>
                     </div>
                   );
                 })}
               </div>

               <div className="flex flex-col lg:flex-row gap-5 flex-grow items-center lg:items-stretch mb-4">
                 
                 <div className="bg-[#fff8e1] rounded-[24px] border-[4px] border-[#ffecb3] p-4 pt-6 relative flex-1 w-full lg:w-auto shadow-sm">
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#ffc107] text-[#e65100] px-4 py-1 rounded-full font-black text-[10px] uppercase flex items-center gap-1 border-b-[3px] border-[#ffa000] whitespace-nowrap shadow-sm">
                      <Star size={12} fill="#e65100" /> NOSSO PROPÓSITO <Star size={12} fill="#e65100" />
                    </div>
                    <p className="text-[12px] font-bold text-[#455a64] mt-1 mb-3 leading-snug">
                      {data.footer?.purposeText}
                    </p>
                    <p className="text-[#d84315] font-black text-[11px] uppercase flex items-center gap-1.5">
                      <Heart size={14} fill="#f44336" className="text-[#f44336] flex-shrink-0" />
                      {data.footer?.purposeValues}
                    </p>
                 </div>
                 
                 <div className="w-full lg:w-36 bg-[#e3f2fd] rounded-[24px] border-4 border-[#bbdefb] h-32 lg:h-auto flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                    <div className="text-[5rem] absolute -bottom-4">👦🏻📖</div>
                 </div>
               </div>

               <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-[#512da8] text-white px-8 py-2.5 rounded-full font-black text-[13px] md:text-[14px] uppercase flex items-center justify-center gap-2 border-[3px] border-[#7e57c2] whitespace-nowrap z-20 shadow-[0_4px_0_#311b92]">
                 AQUI, A FÉ GANHA VIDA! <span className="text-[#ce93d8]">💜</span>
               </div>
            </div>

          </div>

          <p className="text-center text-[#2e7d32] font-black text-[12px] md:text-[13px] uppercase mt-12 mb-4 w-full">
            Crianças aprendendo sobre Jesus, construindo um futuro de amor e esperança!
          </p>

          <div className="flex flex-wrap justify-center gap-2 md:gap-3 max-w-[1000px] w-full px-2">
            {(data.footer?.badges || defaultData.footer.badges).map((b: string, idx: number) => {
               let icn = null;
               switch (idx % 4) {
                 case 0: icn = <span className="text-[#00bcd4] font-black text-[12px] leading-none text-center block w-full">★</span>; break;
                 case 1: icn = <span className="text-[#00bcd4] font-black text-[12px] leading-none text-center block w-full">+</span>; break;
                 case 2: icn = <span className="text-[#00bcd4] font-black text-[10px] leading-none text-center block w-full tracking-tighter">👨‍👩‍👧‍👦</span>; break;
                 case 3: icn = <span className="text-[#00bcd4] font-black text-[10px] leading-none text-center block w-full">🔒</span>; break;
               }

               return (
                <div key={idx} className="bg-[#00bcd4] text-white px-2 py-2 sm:px-4 sm:py-2.5 rounded-[12px] font-black text-[9px] sm:text-[11px] uppercase border-[3px] border-[#0097a7] border-t-[#4dd0e1] flex items-center justify-center gap-1.5 shadow-sm flex-1 md:flex-none text-center">
                  <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden shadow-inner border border-gray-100">
                    {icn}
                  </div>
                  <span className="leading-tight">{b}</span>
                </div>
               );
            })}
          </div>
        </div>

        {/* --- 5. DARK BLUE FOOTER BAR --- */}
        <div className="bg-[#1565c0] w-full pt-6 pb-6 lg:pb-8 px-4 flex flex-col items-center justify-center text-center">
          <h2 className="text-[#ffeb3b] font-black text-[24px] md:text-[32px] lg:text-[40px] uppercase tracking-tighter mb-1 leading-none shadow-sm drop-shadow-md">
            JESUS NA MINHA CASA
          </h2>
          <p className="text-white font-black text-[11px] md:text-[14px] uppercase tracking-wider drop-shadow-sm">
            UM LUGAR DE AMOR, APRENDIZADO E MUITA ALEGRIA!
          </p>
        </div>

      </div>

      {/* Kids custom sweet 3D alert modal */}
      {kidsAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] border-[6px] border-[#ff9800] p-6 max-w-md w-full text-center shadow-2xl relative border-b-[12px] transform scale-100 transition-all select-none">
            {/* Top decorative badge */}
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#ef5350] border-4 border-white text-white font-black px-5 py-1 rounded-full text-xs uppercase shadow-md flex items-center gap-1.5 whitespace-nowrap">
              🌈 RECURSO CHEGANDO! ⭐️
            </div>
            
            <div className="pt-4 pb-2">
              <span className="text-5xl block mb-4 animate-bounce">🎈🎉</span>
              <p className="text-[#37474f] font-black text-lg md:text-xl leading-snug px-2" style={{ fontFamily: '"Outfit", sans-serif' }}>
                {kidsAlert}
              </p>
            </div>
            
            <button
              onClick={() => setKidsAlert(null)}
              className="mt-5 px-8 py-3 bg-[#4caf50] hover:bg-[#43a047] text-white font-black text-sm uppercase rounded-full shadow-[0_5px_0_#2e7d32] border-2 border-white hover:translate-y-[2px] hover:shadow-[0_3px_0_#2e7d32] active:translate-y-[5px] active:shadow-none transition-all cursor-pointer"
            >
              EBA, ENTENDI! ❤️
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const defaultData = {
  header: {
    topImageUrl: "",
    title: "APRENDER É UMA AVENTURA!",
    subtitle: "Descubra, brinque e aprenda com muita diversão!",
    speechBubble: "JESUS\nÉ MEU\nAMIGO\nPARA\nSEMPRE! ❤️",
    sign: "DEUS TE AMA\nDO JEITINHO\nQUE VOCÊ É!",
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
        { name: "VERMELHO", meaning: "AMOR DE DEUS", color: "#f44336" },
        { name: "LARANJA", meaning: "ALEGRIA", color: "#ff9800" },
        { name: "AMARELO", meaning: "LUZ DE DEUS", color: "#ffeb3b" },
        { name: "VERDE", meaning: "ESPERANÇA", color: "#4caf50" },
        { name: "AZUL", meaning: "PAZ", color: "#2196f3" },
        { name: "ROXO", meaning: "REINO DE DEUS", color: "#9c27b0" }
      ]
    },
    rightBox: {
      title: "CONSELHOS AOS PAIS",
      desc: "Acompanhe o crescimento espiritual, emocional e o aprendizado do seu filho com conteúdos seguros, cristãos e educativos. Aqui você encontra dicas, devocionais, orientações e apoio para viver a fé em família todos os dias.",
      icons: [
        { title: "DEVOCIONAIS\nEM FAMÍLIA", icon: "BookOpen" },
        { title: "COMUNICAÇÃO\nQUE EDIFICA", icon: "MessageCircle" },
        { title: "PRINCÍPIOS\nE VALORES", icon: "Star" },
        { title: "TEMPO DE\nQUALIDADE", icon: "Clock" }
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
      { title: "HISTÓRIAS BÍBLICAS", desc: "Aprenda sobre Deus de forma lúdica", icon: "BookOpen" },
      { title: "MÚSICAS CRISTÃS", desc: "Cante e louve com músicas", icon: "Music" },
      { title: "ATIVIDADES DIVERTIDAS", desc: "Desenhos e brincadeiras", icon: "Smile" },
      { title: "ORAÇÃO E DEVOCIONAIS", desc: "Momentos especiais para orar", icon: "Heart" },
      { title: "VALORES QUE TRANSFORMAM", desc: "Amor, respeito, solidariedade e fé!", icon: "Gift" },
    ],
    purposeTitle: "NOSSO PROPÓSITO",
    purposeText: "Levar o amor de Jesus até as crianças e suas famílias, fortalecendo a fé e ensinando que com Jesus em casa, tudo pode ser mais feliz!",
    purposeValues: "Amor, respeito, solidariedade, obediência e fé!",
    badges: ["CONTEÚDO 100% CRISTÃO\nE SEGURO", "PARA TODAS\nAS IDADES\nINFANTIS", "PARTICIPAÇÃO\nDA FAMÍLIA", "AMBIENTE\nSEGURO E\nACOLHEDOR"],
    finalText: "JESUS NA MINHA CASA",
    finalSubtext: "UM LUGAR DE AMOR, APRENDIZADO E MUITA ALEGRIA!"
  }
};
