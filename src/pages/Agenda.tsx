import { useState, useEffect } from "react";
import { collection, onSnapshot, doc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, Search, Calendar, RefreshCw } from "lucide-react";

interface AgendaEvent {
  id: string;
  day: string;
  month: string; // "JAN", "FEV", etc.
  monthNum: number; // 1 to 12
  subtitle: string; // "JUN • 11h" or "JUNHO"
  type: "PRESENCIAL" | "ONLINE" | "PRESENCIAL / ONLINE";
  category: string; // e.g. "CND", "IEQ", "GMC / GMJR"
  title: string;
  location: string;
}

const MONTHS = [
  { short: "JAN", name: "JANEIRO", num: 1 },
  { short: "FEV", name: "FEVEREIRO", num: 2 },
  { short: "MAR", name: "MARÇO", num: 3 },
  { short: "ABR", name: "ABRIL", num: 4 },
  { short: "MAI", name: "MAIO", num: 5 },
  { short: "JUN", name: "JUNHO", num: 6 },
  { short: "JUL", name: "JULHO", num: 7 },
  { short: "AGO", name: "AGOSTO", num: 8 },
  { short: "SET", name: "SETEMBRO", num: 9 },
  { short: "OUT", name: "OUTUBRO", num: 10 },
  { short: "NOV", name: "NOVEMBRO", num: 11 },
  { short: "DEZ", name: "DEZEMBRO", num: 12 },
];

const DEFAULT_EVENTS: AgendaEvent[] = [
  {
    id: "jun-02",
    day: "02",
    month: "JUN",
    monthNum: 6,
    subtitle: "JUN • 11h",
    type: "ONLINE",
    category: "CND",
    title: "REUNIÃO ONLINE – SUPERINTENDENTES",
    location: "CND"
  },
  {
    id: "jun-04",
    day: "04",
    month: "JUN",
    monthNum: 6,
    subtitle: "JUNHO",
    type: "ONLINE",
    category: "GMM",
    title: "MENTORIA ONLINE GMM",
    location: "Online"
  },
  {
    id: "jun-08",
    day: "08",
    month: "JUN",
    monthNum: 6,
    subtitle: "JUN • 19h30",
    type: "PRESENCIAL / ONLINE",
    category: "IEQ",
    title: "MEGA CULTO",
    location: "IEQ – Olavo Bilac SP"
  },
  {
    id: "jun-12",
    day: "12-14",
    month: "JUN",
    monthNum: 6,
    subtitle: "JUNHO",
    type: "PRESENCIAL",
    category: "GMC / GMJR",
    title: "ENCONTRINHO GMC E GMJR",
    location: "São Paulo"
  },
  {
    id: "jun-16",
    day: "16",
    month: "JUN",
    monthNum: 6,
    subtitle: "JUNHO",
    type: "ONLINE",
    category: "COMMEQ",
    title: "MENTORIA ONLINE",
    location: "Online"
  },
  {
    id: "jun-23",
    day: "23",
    month: "JUN",
    monthNum: 6,
    subtitle: "JUNHO",
    type: "PRESENCIAL",
    category: "IEQ",
    title: "CONFERÊNCIA SANTIDADE / IMAGEM DE UMA HISTÓRIA",
    location: "AL – Maceió"
  },
  {
    id: "may-10",
    day: "10",
    month: "MAI",
    monthNum: 5,
    subtitle: "MAIO • 18h",
    type: "PRESENCIAL",
    category: "GMM",
    title: "REUNIÃO ENCONTRO DE MULHERES",
    location: "Sede Regional"
  },
  {
    id: "jul-15",
    day: "15",
    month: "JUL",
    monthNum: 7,
    subtitle: "JUL • 20h",
    type: "ONLINE",
    category: "COMMEQ",
    title: "AULA DE INTEGRAÇÃO DE NOVOS MEMBROS",
    location: "Online"
  }
];

export default function Agenda() {
  const [selectedMonth, setSelectedMonth] = useState("JUN");
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to agenda collection
    const unsub = onSnapshot(
      collection(db, "agenda_events"),
      async (snapshot) => {
        if (snapshot.empty) {
          // Auto-seed with default elements to match high-fidelity view
          try {
            for (const ev of DEFAULT_EVENTS) {
              await setDoc(doc(db, "agenda_events", ev.id), ev);
            }
          } catch (e) {
            console.error("Error seeding default events:", e);
          }
          setEvents(DEFAULT_EVENTS);
        } else {
          const list: AgendaEvent[] = [];
          snapshot.forEach((doc) => {
            list.push({ id: doc.id, ...doc.data() } as AgendaEvent);
          });
          setEvents(list);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Firestore listening error on agenda:", error);
        // Fallback to static items
        setEvents(DEFAULT_EVENTS);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  const activeMonthData = MONTHS.find((m) => m.short === selectedMonth);
  const activeMonthName = activeMonthData ? activeMonthData.name : "JUNHO";

  // Filter events of selected month
  const filteredEvents = events.filter(
    (ev) => ev.month.toUpperCase() === selectedMonth.toUpperCase()
  );

  return (
    <div className="bg-slate-50 min-h-screen pt-[74px] md:pt-[84px] text-[#222222]">
      {/* 1. Header Hero Banner - Faithful to the image */}
      <section className="relative w-full bg-gradient-to-r from-[#214fe6] to-[#142fa3] text-white py-12 md:py-20 px-4 md:px-12 flex flex-col md:flex-row md:items-center justify-between overflow-hidden shadow-md">
        {/* Background Watermark "2026" */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none select-none">
          <span className="text-[18rem] md:text-[34rem] font-sans font-black tracking-tight leading-none text-white select-none">
            2026
          </span>
        </div>

        {/* Left Side: Quadrangular Shield Logo */}
        <div className="flex items-center gap-4 z-10 shrink-0 mb-8 md:mb-0">
          <div className="flex flex-col items-center">
            {/* Quadrangular SVG Icon */}
            <div className="w-16 h-16 md:w-20 md:h-20 bg-transparent border-2 border-white rounded-[4px] p-1 flex flex-col relative justify-between">
              <div className="grid grid-cols-2 gap-1 flex-grow">
                {/* Cross - Red segment */}
                <div className="bg-white/10 hover:bg-red-500/30 transition-colors flex items-center justify-center rounded-[2px] p-0.5">
                  <svg viewBox="0 0 24 24" className="w-full h-full text-white" fill="currentColor">
                    <path d="M10,2 H14 V6 H18 V10 H14 V22 H10 V10 H6 V6 H10 Z" />
                  </svg>
                </div>
                {/* Crown - Purple segment */}
                <div className="bg-white/10 hover:bg-amber-500/30 transition-colors flex items-center justify-center rounded-[2px] p-0.5">
                  <svg viewBox="0 0 24 24" className="w-full h-full text-white" fill="currentColor">
                    <path d="M5,16 L3,8 L8,11 L12,5 L16,11 L21,8 L19,16 Z M5,18 H19 V20 H5 Z" />
                  </svg>
                </div>
                {/* Chalice - Yellow segment */}
                <div className="bg-white/10 hover:bg-yellow-500/30 transition-colors flex items-center justify-center rounded-[2px] p-0.5">
                  <svg viewBox="0 0 24 24" className="w-full h-full text-white" fill="currentColor">
                    <path d="M6,3 H18 V5 C18,9 15,12 13,12 V18 H17 V20 H7 V18 H11 V12 C9,12 6,9 6,5 Z" />
                  </svg>
                </div>
                {/* Dove - Blue segment */}
                <div className="bg-white/10 hover:bg-blue-500/30 transition-colors flex items-center justify-center rounded-[2px] p-1">
                  <svg viewBox="0 0 24 24" className="w-full h-full text-white" fill="currentColor">
                    <path d="M12,2A3,3,0,0,1,15,5C15,6.5,13.5,8,12,8C10.5,8,9,6.5,9,5A3,3,0,0,1,12,2M12,10C16,10,21,12,21,15V18C21,19.1,20.1,20,19,20H5A2,2,0,0,1,3,18V15C3,12,8,10,12,10Z" />
                  </svg>
                </div>
              </div>
            </div>
            <span className="text-[10px] md:text-xs font-sans font-black tracking-[0.2em] whitespace-nowrap pt-2 text-white h-4 block">
              QUADRANGULAR
            </span>
          </div>
        </div>

        {/* Center: Title Stack */}
        <div className="flex flex-col items-center justify-center text-center z-10 select-none">
          <h1 className="text-[3.5rem] md:text-[5.5rem] font-sans font-black tracking-normal leading-[0.85] text-white">
            AGENDA
          </h1>
          <h1 className="text-[4rem] md:text-[6.2rem] font-sans font-black tracking-normal leading-[0.85] text-white mt-1">
            2026
          </h1>
          <p className="text-[8px] md:text-[11px] font-bold tracking-[0.3em] uppercase text-white/90 mt-4 max-w-md">
            IGREJA DO EVANGELHO QUADRANGULAR
          </p>
        </div>

        {/* Right Side: Cursive brand image style */}
        <div className="hidden md:flex flex-col items-end z-10 shrink-0">
          <div className="text-right">
            <span className="block text-4xl font-serif font-medium tracking-tight text-white/90 hover:scale-105 transition-transform duration-200 cursor-default select-none pt-2 font-mono italic">
              Avante
            </span>
            <span className="block text-[11px] font-black uppercase tracking-[0.14em] text-white/70">
              e sem parar
            </span>
          </div>
        </div>
      </section>

      {/* 2. Months Navigation Bar - Match image perfectly */}
      <section className="bg-[#0e2063] text-white h-12 relative flex items-center shadow-md">
        <div className="max-w-7xl mx-auto w-full px-4 md:px-8 flex overflow-x-auto scrollbar-hide select-none">
          <div className="flex items-center justify-between w-full min-w-max gap-4 md:gap-7 py-3 mx-auto">
            {MONTHS.map((m) => {
              const isActive = m.short === selectedMonth;
              return (
                <button
                  key={m.short}
                  onClick={() => setSelectedMonth(m.short)}
                  className={`text-[11px] md:text-sm font-sans font-black tracking-widest uppercase transition-all duration-200 cursor-pointer h-12 flex items-center relative px-2 hover:text-white/80 ${
                    isActive ? "text-white" : "text-white/50"
                  }`}
                >
                  {m.short}
                  {isActive && (
                    <motion.div
                      layoutId="activeMonthLine"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-white"
                      style={{ bottom: "0px" }}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Main Content Grid & Legends */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Status Legend Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-3 border-b border-gray-200 gap-4">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] md:text-xs font-black tracking-wider text-[#637d94]">
            <div className="flex items-center gap-1.5 uppercase">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2b56f5] block" id="legend-presencial" />
              <span>PRESENCIAL</span>
            </div>
            <div className="flex items-center gap-1.5 uppercase">
              <span className="w-2.5 h-2.5 rounded-full bg-[#7e3af2] block" id="legend-online" />
              <span>ONLINE</span>
            </div>
            <div className="flex items-center gap-1.5 uppercase">
              <span className="w-2.5 h-2.5 rounded-full bg-[#18181a] block" id="legend-hybrid" />
              <span>PRESENCIAL / ONLINE</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[10px] md:text-xs font-black text-blue-500 uppercase tracking-widest">
            <Search size={14} className="text-blue-500 animate-pulse" />
            <span>CLIQUE NOS MESES ACIMA PARA NAVEGAR ENTRE ELES</span>
          </div>
        </div>

        {/* Dynamic Month Header and count */}
        <div className="mb-8 flex items-baseline gap-4">
          <h2 className="text-5xl md:text-6xl font-black tracking-tighter uppercase text-[#1a2f91]">
            {activeMonthName}
          </h2>
          <span className="text-lg font-bold text-[#8fa4cc] tracking-wide" id="event-count">
            {loading ? "carregando..." : `${filteredEvents.length} eventos`}
          </span>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <RefreshCw className="animate-spin text-blue-500 mb-4" size={40} />
            <span className="font-bold text-gray-500">Buscando eventos da agenda...</span>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredEvents.length > 0 ? (
              <motion.div
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                id="events-grid-container"
              >
                {filteredEvents.map((ev) => {
                  // Determine header dynamic colors based on type
                  let headerBgClass = "bg-[#2b56f5]"; // Blue
                  let badgeLabel = "PRESENCIAL";
                  if (ev.type === "ONLINE") {
                    headerBgClass = "bg-[#7e3af2]"; // Purple
                    badgeLabel = "ONLINE";
                  } else if (ev.type === "PRESENCIAL / ONLINE") {
                    headerBgClass = "bg-[#18181a]"; // Dark
                    badgeLabel = "PRES./ONLINE";
                  }

                  return (
                    <motion.div
                      layout
                      key={ev.id}
                      className="bg-white rounded-[10px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full min-h-[200px]"
                      id={`event-card-${ev.id}`}
                    >
                      {/* Card Header Section */}
                      <div className={`${headerBgClass} p-4 text-white flex justify-between items-center shrink-0 select-none`}>
                        <div className="flex flex-col">
                          <span className="text-3xl font-black tracking-tight leading-none">
                            {ev.day}
                          </span>
                          <span className="text-[10px] font-sans font-black uppercase tracking-widest mt-1 opacity-90">
                            {ev.subtitle}
                          </span>
                        </div>
                        <div className="border border-white/40 px-3 py-1 rounded-[4px] text-[9px] font-black tracking-wider uppercase bg-white/5">
                          {badgeLabel}
                        </div>
                      </div>

                      {/* Card Body Section */}
                      <div className="p-6 flex flex-col justify-between flex-grow">
                        <div>
                          {/* Category Tag */}
                          <div className="text-[10px] font-black tracking-wider text-blue-500 uppercase mb-2">
                            {ev.category}
                          </div>
                          {/* Event Title */}
                          <h3 className="text-[15px] font-bold text-[#141b29] leading-tight uppercase tracking-tight line-clamp-2">
                            {ev.title}
                          </h3>
                        </div>

                        {/* Event Location Footer */}
                        <div className="flex items-center gap-2 mt-5 text-gray-500 border-t border-gray-50 pt-4 shrink-0">
                          <MapPin size={15} className="text-[#8e90a0] shrink-0" />
                          <span className="text-[11px] font-bold text-[#8e90ff] uppercase tracking-wide truncate">
                            {ev.location}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-500 flex flex-col items-center justify-center min-h-[300px]"
                id="no-events-indicator"
              >
                <Calendar size={48} className="text-gray-300 mb-4 animate-bounce" />
                <h4 className="text-lg font-black text-gray-700">Nenhum evento agendado</h4>
                <p className="text-sm mt-1 max-w-sm">
                  Não encontramos eventos programados para o mês de{" "}
                  <span className="font-bold text-[#1a2f91]">{activeMonthName}</span>.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </section>
    </div>
  );
}
