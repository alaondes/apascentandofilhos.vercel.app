import { useState, useEffect } from "react";
import { collection, onSnapshot, doc, setDoc, deleteDoc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../../lib/firebase";
import { 
  Calendar, Plus, Edit, Trash2, MapPin, Check, AlertCircle, 
  Search, RefreshCw, X, Palette, Layout, Eye, Save 
} from "lucide-react";

interface AgendaEvent {
  id: string;
  day: string;
  month: string; // "JAN", "FEV", etc.
  monthNum: number; // 1 to 12
  subtitle: string; // "JUN • 11h" or "JUNHO"
  type: string;
  category: string;
  title: string;
  location: string;
}

interface AgendaConfig {
  watermarkYear: string;
  bannerTitle: string;
  bannerYear: string;
  churchLabel: string;
  sloganTitle: string;
  sloganSub: string;
  gradientFrom: string;
  gradientTo: string;
  activeTabBgHex: string;
  activeTabLineHex: string;
  categories: { code: string; label: string }[];
  eventTypes: { id: string; label: string; colorHex: string }[];
}

const DEFAULT_CONFIG: AgendaConfig = {
  watermarkYear: "2026",
  bannerTitle: "AGENDA",
  bannerYear: "2026",
  churchLabel: "IGREJA DO EVANGELHO QUADRANGULAR",
  sloganTitle: "Avante",
  sloganSub: "e sem parar",
  gradientFrom: "#214fe6",
  gradientTo: "#142fa3",
  activeTabBgHex: "#0e2063",
  activeTabLineHex: "#ffffff",
  categories: [
    { code: "IEQ", label: "IEQ Geral" },
    { code: "CND", label: "CND" },
    { code: "GMM", label: "GMM (Mulheres)" },
    { code: "GMC", label: "GMC (Crianças)" },
    { code: "COMMEQ", label: "COMMEQ (Música)" },
    { code: "GMA", label: "GMA (Adolescentes)" },
    { code: "GMJ", label: "GMJ (Jovens)" },
    { code: "GMH", label: "GMH (Homens)" },
    { code: "KIDS", label: "Kids" },
    { code: "DIACONATO", label: "Diaconato" }
  ],
  eventTypes: [
    { id: "PRESENCIAL", label: "PRESENCIAL (Banner Azul)", colorHex: "#2b56f5" },
    { id: "ONLINE", label: "ONLINE (Banner Roxo)", colorHex: "#7e3af2" },
    { id: "PRESENCIAL / ONLINE", label: "PRESENCIAL + ONLINE (Banner Preto)", colorHex: "#18181a" }
  ]
};

const MONTHS_LIST = [
  { short: "JAN", name: "Janeiro", num: 1 },
  { short: "FEV", name: "Fevereiro", num: 2 },
  { short: "MAR", name: "Março", num: 3 },
  { short: "ABR", name: "Abril", num: 4 },
  { short: "MAI", name: "Maio", num: 5 },
  { short: "JUN", name: "Junho", num: 6 },
  { short: "JUL", name: "Julho", num: 7 },
  { short: "AGO", name: "Agosto", num: 8 },
  { short: "SET", name: "Setembro", num: 9 },
  { short: "OUT", name: "Outubro", num: 10 },
  { short: "NOV", name: "Novembro", num: 11 },
  { short: "DEZ", name: "Dezembro", num: 12 },
];

export default function AgendaPanel() {
  const [activeMainTab, setActiveMainTab] = useState<"events" | "design">("events");
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilterMonth, setSelectedFilterMonth] = useState("TODOS");

  // Config State
  const [config, setConfig] = useState<AgendaConfig>(DEFAULT_CONFIG);
  const [savingConfig, setSavingConfig] = useState(false);

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<AgendaEvent, "id">>({
    day: "",
    month: "JUN",
    monthNum: 6,
    subtitle: "",
    type: "PRESENCIAL",
    category: "",
    title: "",
    location: "",
  });

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const requestConfirmation = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm,
    });
  };

  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    // 1. Listen to agenda events list
    const unsubEvents = onSnapshot(
      collection(db, "agenda_events"),
      (snapshot) => {
        const list: AgendaEvent[] = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...d.data() } as AgendaEvent);
        });
        
        // Sort by Month number then by numerical day (parsed safely)
        list.sort((a, b) => {
          if (a.monthNum !== b.monthNum) {
            return a.monthNum - b.monthNum;
          }
          const dayA = parseInt(a.day.split("-")[0]) || 0;
          const dayB = parseInt(b.day.split("-")[0]) || 0;
          return dayA - dayB;
        });

        setEvents(list);
        setLoading(false);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, "agenda_events");
        } catch (wrappedErr) {
          console.error("Error loading events in panel:", wrappedErr);
        }
        setLoading(false);
      }
    );

    // 2. Listen to agenda configuration
    const unsubConfig = onSnapshot(
      doc(db, "content", "agenda_config"),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setConfig({
            watermarkYear: data.watermarkYear || DEFAULT_CONFIG.watermarkYear,
            bannerTitle: data.bannerTitle || DEFAULT_CONFIG.bannerTitle,
            bannerYear: data.bannerYear || DEFAULT_CONFIG.bannerYear,
            churchLabel: data.churchLabel || DEFAULT_CONFIG.churchLabel,
            sloganTitle: data.sloganTitle || DEFAULT_CONFIG.sloganTitle,
            sloganSub: data.sloganSub || DEFAULT_CONFIG.sloganSub,
            gradientFrom: data.gradientFrom || DEFAULT_CONFIG.gradientFrom,
            gradientTo: data.gradientTo || DEFAULT_CONFIG.gradientTo,
            activeTabBgHex: data.activeTabBgHex || DEFAULT_CONFIG.activeTabBgHex,
            activeTabLineHex: data.activeTabLineHex || DEFAULT_CONFIG.activeTabLineHex,
            categories: data.categories || DEFAULT_CONFIG.categories,
            eventTypes: data.eventTypes || DEFAULT_CONFIG.eventTypes,
          });
        }
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.GET, "content/agenda_config");
        } catch (wrappedErr) {
          console.error("Error loading config:", wrappedErr);
        }
      }
    );

    return () => {
      unsubEvents();
      unsubConfig();
    };
  }, []);

  const triggerNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleMonthChange = (monthShort: string) => {
    const found = MONTHS_LIST.find((m) => m.short === monthShort);
    setFormData((prev) => ({
      ...prev,
      month: monthShort,
      monthNum: found ? found.num : 1,
      subtitle: prev.subtitle === "" || prev.subtitle === `${prev.month}HO` || prev.subtitle === `${prev.month}` 
        ? `${monthShort}HO` 
        : prev.subtitle
    }));
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      day: "",
      month: "JUN",
      monthNum: 6,
      subtitle: "JUNHO",
      type: "PRESENCIAL",
      category: "",
      title: "",
      location: "",
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (ev: AgendaEvent) => {
    setEditingId(ev.id);
    setFormData({
      day: ev.day,
      month: ev.month,
      monthNum: ev.monthNum,
      subtitle: ev.subtitle,
      type: ev.type,
      category: ev.category,
      title: ev.title,
      location: ev.location,
    });
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    requestConfirmation(
      "Confirmar Exclusão de Evento",
      "Deseja realmente remover este evento da agenda?",
      async () => {
        try {
          await deleteDoc(doc(db, "agenda_events", id));
          triggerNotification("success", "Evento excluído com sucesso!");
        } catch (error) {
          try {
            handleFirestoreError(error, OperationType.DELETE, `agenda_events/${id}`);
          } catch (wrappedErr) {
            console.error("Error deleting:", wrappedErr);
          }
          triggerNotification("error", "Erro ao excluir o evento.");
        }
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.day || !formData.category) {
      triggerNotification("error", "Por favor, preencha o título, dia e categoria!");
      return;
    }

    try {
      const docId = editingId || `event-${Date.now()}`;
      await setDoc(doc(db, "agenda_events", docId), formData);
      triggerNotification("success", editingId ? "Evento atualizado com sucesso!" : "Novo evento cadastrado!");
      setIsFormOpen(false);
    } catch (error) {
      try {
        handleFirestoreError(error, editingId ? OperationType.UPDATE : OperationType.CREATE, `agenda_events/${editingId || "new"}`);
      } catch (wrappedErr) {
        console.error("Error saving event:", wrappedErr);
      }
      triggerNotification("error", "Ocorreu um erro ao salvar o evento.");
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      await setDoc(doc(db, "content", "agenda_config"), config);
      triggerNotification("success", "Aparência da Agenda atualizada com sucesso no site!");
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.UPDATE, "content/agenda_config");
      } catch (wrappedErr) {
        console.error("Error saving config:", wrappedErr);
      }
      triggerNotification("error", "Ocorreu um erro ao atualizar as configurações de aparência.");
    } finally {
      setSavingConfig(false);
    }
  };

  const handleResetConfig = () => {
    requestConfirmation(
      "Restaurar Configuração Padrão",
      "Deseja realmente restaurar as cores e textos originais da Agenda?",
      async () => {
        setSavingConfig(true);
        try {
          await setDoc(doc(db, "content", "agenda_config"), DEFAULT_CONFIG);
          setConfig(DEFAULT_CONFIG);
          triggerNotification("success", "Cores e textos padrão restaurados com sucesso!");
        } catch (error) {
          try {
            handleFirestoreError(error, OperationType.UPDATE, "content/agenda_config");
          } catch (wrappedErr) {
            console.error("Error resetting config:", wrappedErr);
          }
          triggerNotification("error", "Erro ao restaurar as configurações padrão.");
        } finally {
          setSavingConfig(false);
        }
      }
    );
  };

  // Filter list
  const filteredList = events.filter((ev) => {
    const matchesSearch =
      ev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesMonth = selectedFilterMonth === "TODOS" || ev.month === selectedFilterMonth;
    
    return matchesSearch && matchesMonth;
  });

  return (
    <div className="bg-white rounded-[14px] border border-[#c8d8e8] shadow-sm overflow-hidden p-6 w-full max-w-full">
      {/* Title */}
      <div className="pb-4 border-b border-[#e2eaf3] mb-6">
        <h2 className="text-xl font-bold text-primary-dark flex items-center gap-2">
          <Calendar className="text-primary-base w-6 h-6" />
          Configuração Customizável da Agenda Geral
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Gerencie o conteúdo de datas e personalize totalmente a aparência visual do cabeçalho da página de Agenda do site.
        </p>
      </div>

      {/* Main Tab Switcher */}
      <div className="flex border-b border-gray-200 mb-6 gap-2">
        <button
          onClick={() => setActiveMainTab("events")}
          className={`px-4 py-2 text-sm font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
            activeMainTab === "events"
              ? "border-primary-base text-primary-base"
              : "border-transparent text-gray-500 hover:text-primary-base"
          }`}
        >
          <Calendar size={16} />
          Eventos e Datas
        </button>
        <button
          onClick={() => setActiveMainTab("design")}
          className={`px-4 py-2 text-sm font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
            activeMainTab === "design"
              ? "border-primary-base text-primary-base"
              : "border-transparent text-gray-500 hover:text-primary-base"
          }`}
        >
          <Palette size={16} />
          Divisão: Design e Aparência
        </button>
      </div>

      {/* Notifications */}
      {notification && (
        <div
          className={`mb-6 p-4 rounded-xl flex items-center gap-3 border ${
            notification.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {notification.type === "success" ? <Check size={18} /> : <AlertCircle size={18} />}
          <span className="font-bold text-sm">{notification.message}</span>
        </div>
      )}

      {/* Tab 1: Events manager */}
      {activeMainTab === "events" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-gray-800">Tabela de Atividades</h3>
              <p className="text-xs text-gray-400 mt-0.5">Clique no botão para adicionar novos eventos ao calendário.</p>
            </div>
            <button
              onClick={handleOpenCreate}
              className="bg-primary-base hover:bg-primary-dark text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
            >
              <Plus size={18} />
              Novo Evento
            </button>
          </div>

          {/* Search/Filter Controls */}
          <div className="flex flex-col md:flex-row items-center gap-4">
            {/* Search */}
            <div className="relative flex-grow w-full md:w-auto">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder="Buscar por título, categoria ou local..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-base"
              />
            </div>

            {/* Filter Month */}
            <div className="w-full md:w-48 shrink-0 flex items-center gap-2">
              <span className="text-xs font-black text-gray-400 uppercase tracking-wider">Mês:</span>
              <select
                value={selectedFilterMonth}
                onChange={(e) => setSelectedFilterMonth(e.target.value)}
                className="flex-grow px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none"
              >
                <option value="TODOS">Todos os meses</option>
                {MONTHS_LIST.map((m) => (
                  <option key={m.short} value={m.short}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* List content */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <RefreshCw className="animate-spin text-primary-base mb-2" size={32} />
              <span className="text-gray-500 text-sm font-bold">Carregando lista da agenda...</span>
            </div>
          ) : filteredList.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-max">
                <thead>
                  <tr className="bg-[#f7fafd] border-b border-[#e2eaf3] text-[10px] font-black uppercase text-gray-400 tracking-wider">
                    <th className="py-4 px-4 w-28">Data / Mês</th>
                    <th className="py-4 px-4 w-40">Tipo / Formato</th>
                    <th className="py-4 px-4 w-32">Categoria</th>
                    <th className="py-4 px-4">Título do Evento</th>
                    <th className="py-4 px-4">Local</th>
                    <th className="py-4 px-4 text-center w-28">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2eaf3] text-sm text-gray-700">
                  {filteredList.map((ev) => {
                    const eventType = config.eventTypes?.find(t => t.id === ev.type);
                    const colorHex = eventType?.colorHex || "#2b56f5";

                    return (
                      <tr key={ev.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-primary-dark">
                          <div className="flex flex-col">
                            <span className="text-lg leading-tight font-black">{ev.day}</span>
                            <span className="text-[10px] font-sans font-black uppercase text-gray-400">
                              {ev.month} ({ev.subtitle || "JUNHO"})
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span style={{ backgroundColor: colorHex + '20', color: colorHex, borderColor: colorHex + '40' }} className={`px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider`}>
                            {ev.type}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-xs font-black uppercase px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                            {ev.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-extrabold max-w-sm truncate uppercase text-primary-dark">
                          {ev.title}
                        </td>
                        <td className="py-3.5 px-4 text-gray-500 font-medium max-w-xs truncate">
                          <div className="flex items-center gap-1.5">
                            <MapPin size={14} className="text-gray-400 shrink-0" />
                            <span>{ev.location}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenEdit(ev)}
                              className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition shrink-0 cursor-pointer"
                              title="Editar"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(ev.id)}
                              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition shrink-0 cursor-pointer"
                              title="Excluir"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
              <Calendar className="text-gray-300 w-12 h-12 mx-auto mb-3" />
              <h4 className="text-base font-bold text-gray-700">Nenhum evento cadastrado</h4>
              <p className="text-xs text-gray-400 mt-1">Nenhum registro para as buscas selecionadas.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Design Editor */}
      {activeMainTab === "design" && (
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2 mb-1">
              <Palette size={18} className="text-primary-base" />
              Customização Completa do Banner
            </h3>
            <p className="text-xs text-gray-500">
              Edite as cores hexadecimais, degrade, textos caligráficos, marca d'água no fundo e veja a prévia instantânea de como ficará na página Agenda.
            </p>
          </div>

          {/* REAL TIME HEADLESS DYNAMIC BANNER PREVIEW */}
          <div className="p-4 bg-gray-100 rounded-xl border border-gray-200">
            <span className="text-[10px] uppercase font-black tracking-wider text-gray-400 flex items-center gap-1 mb-2">
              <Eye size={12} />
              Pré-visualização em Tempo Real (Cabeçalho da Agenda)
            </span>
            <div 
              className="relative w-full text-white p-6 md:p-8 rounded-lg overflow-hidden shadow-sm flex flex-col items-center justify-center text-center transition-all"
              style={{
                background: `linear-gradient(135deg, ${config.gradientFrom} 0%, ${config.gradientTo} 100%)`
              }}
            >
              {/* Background Watermark */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.06] pointer-events-none select-none">
                <span className="text-8xl md:text-[8rem] font-sans font-black leading-none text-white select-none">
                  {config.watermarkYear}
                </span>
              </div>

              {/* Title Stack */}
              <div className="flex flex-col items-center justify-center text-center z-10 select-none">
                <h1 className="text-3xl md:text-5xl font-sans font-black tracking-normal leading-[0.85] text-white uppercase">
                  {config.bannerTitle}
                </h1>
                <h1 className="text-4xl md:text-[3.5rem] font-sans font-black tracking-normal leading-[0.85] text-white mt-0.5">
                  {config.bannerYear}
                </h1>
                <p className="text-[7px] md:text-[9px] font-bold tracking-[0.2em] uppercase text-white/95 mt-1">
                  {config.churchLabel}
                </p>
              </div>
            </div>

            {/* Simulated bar */}
            <div 
              className="mt-2 text-white h-8 rounded-lg flex items-center justify-center shadow-xs text-[10px] font-bold tracking-widest gap-4 px-4 transition-all"
              style={{ backgroundColor: config.activeTabBgHex }}
            >
              <span className="text-white">JAN</span>
              <span className="text-white">FEV</span>
              <div className="h-full flex flex-col justify-between items-center relative py-1.5">
                <span className="text-white">MAR</span>
                <div className="absolute bottom-0 w-3 h-0.5" style={{ backgroundColor: config.activeTabLineHex }}></div>
              </div>
              <span className="text-white/40">ABR</span>
              <span className="text-white/40">MAI</span>
            </div>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-6">
            {/* Grid 1: Textos */}
            <div className="bg-slate-50 p-4 rounded-xl border border-gray-100">
              <h4 className="text-sm font-bold text-gray-700 mb-4 border-b border-gray-200 pb-2">1. Textos e Rótulos do Banner</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase text-gray-500 tracking-wider mb-1">
                    Marca d'água no fundo (Ano)
                  </label>
                  <input
                    type="text"
                    required
                    value={config.watermarkYear}
                    onChange={(e) => setConfig({ ...config, watermarkYear: e.target.value })}
                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-base outline-none"
                    placeholder="Ex: 2026"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-gray-500 tracking-wider mb-1">
                    Título do Banner
                  </label>
                  <input
                    type="text"
                    required
                    value={config.bannerTitle}
                    onChange={(e) => setConfig({ ...config, bannerTitle: e.target.value })}
                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-base outline-none uppercase"
                    placeholder="Ex: AGENDA"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-gray-500 tracking-wider mb-1">
                    Subtítulo do Banner (Ano Principal)
                  </label>
                  <input
                    type="text"
                    required
                    value={config.bannerYear}
                    onChange={(e) => setConfig({ ...config, bannerYear: e.target.value })}
                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-base outline-none"
                    placeholder="Ex: 2026"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-gray-500 tracking-wider mb-1">
                    Nome da Igreja / Instituição
                  </label>
                  <input
                    type="text"
                    required
                    value={config.churchLabel}
                    onChange={(e) => setConfig({ ...config, churchLabel: e.target.value })}
                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-base outline-none uppercase font-bold"
                    placeholder="Ex: IGREJA DO EVANGELHO QUADRANGULAR"
                  />
                </div>


              </div>
            </div>

            {/* Grid 2: Cores */}
            <div className="bg-slate-50 p-4 rounded-xl border border-gray-100">
              <h4 className="text-sm font-bold text-gray-700 mb-4 border-b border-gray-200 pb-2">2. Identidade Visual (Paleta de Cores do Cabeçalho)</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Degradê Cor 1 */}
                <div className="space-y-1">
                  <label className="block text-xs font-black uppercase text-gray-500 tracking-wider">
                    Degradê - Cor Inicial (Esquerda)
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={config.gradientFrom}
                      onChange={(e) => setConfig({ ...config, gradientFrom: e.target.value })}
                      className="w-10 h-10 border border-gray-200 rounded cursor-pointer shrink-0 outline-none"
                    />
                    <input
                      type="text"
                      value={config.gradientFrom}
                      onChange={(e) => setConfig({ ...config, gradientFrom: e.target.value })}
                      className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-mono outline-none"
                    />
                  </div>
                </div>

                {/* Degradê Cor 2 */}
                <div className="space-y-1">
                  <label className="block text-xs font-black uppercase text-gray-500 tracking-wider">
                    Degradê - Cor Final (Direita)
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={config.gradientTo}
                      onChange={(e) => setConfig({ ...config, gradientTo: e.target.value })}
                      className="w-10 h-10 border border-gray-200 rounded cursor-pointer shrink-0 outline-none"
                    />
                    <input
                      type="text"
                      value={config.gradientTo}
                      onChange={(e) => setConfig({ ...config, gradientTo: e.target.value })}
                      className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-mono outline-none"
                    />
                  </div>
                </div>

                {/* Fundo da Barra de Meses */}
                <div className="space-y-1">
                  <label className="block text-xs font-black uppercase text-gray-500 tracking-wider">
                    Fundo da Fita de Meses
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={config.activeTabBgHex}
                      onChange={(e) => setConfig({ ...config, activeTabBgHex: e.target.value })}
                      className="w-10 h-10 border border-gray-200 rounded cursor-pointer shrink-0 outline-none"
                    />
                    <input
                      type="text"
                      value={config.activeTabBgHex}
                      onChange={(e) => setConfig({ ...config, activeTabBgHex: e.target.value })}
                      className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-mono outline-none"
                    />
                  </div>
                </div>

                {/* Indicador Linha Mês Selecionado */}
                <div className="space-y-1">
                  <label className="block text-xs font-black uppercase text-gray-500 tracking-wider">
                    Linha do Mês Ativo
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={config.activeTabLineHex}
                      onChange={(e) => setConfig({ ...config, activeTabLineHex: e.target.value })}
                      className="w-10 h-10 border border-gray-200 rounded cursor-pointer shrink-0 outline-none"
                    />
                    <input
                      type="text"
                      value={config.activeTabLineHex}
                      onChange={(e) => setConfig({ ...config, activeTabLineHex: e.target.value })}
                      className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-mono outline-none"
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Grid 3: Categorias Rápidas */}
            <div className="bg-slate-50 p-4 rounded-xl border border-gray-100">
               <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-2">
                 <h4 className="text-sm font-bold text-gray-700">3. Categorias de Seleção Rápida</h4>
                 <button type="button" onClick={() => setConfig({...config, categories: [...(config.categories || []), {code: '', label: ''}]})} className="text-xs flex items-center gap-1 font-bold text-primary-base hover:text-primary-dark cursor-pointer">
                   <Plus size={14}/> Nova Rápida
                 </button>
               </div>
               
               <div className="space-y-2">
                 {config.categories?.map((cat, i) => (
                    <div key={i} className="flex gap-2 items-center bg-white p-2 border border-gray-200 rounded-xl w-full">
                       <input value={cat.code} onChange={(e) => { const n = [...config.categories]; n[i].code = e.target.value.toUpperCase(); setConfig({...config, categories: n}); }} placeholder="Sigla (Ex: IEQ)" className="w-24 px-3 py-1.5 border border-gray-200 rounded-lg text-sm uppercase font-bold text-blue-600 outline-none focus:border-blue-500"/>
                       <input value={cat.label} onChange={(e) => { const n = [...config.categories]; n[i].label = e.target.value; setConfig({...config, categories: n}); }} placeholder="Descrição Ex: IEQ Geral" className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500"/>
                       <button type="button" onClick={() => { const n = [...config.categories]; n.splice(i, 1); setConfig({...config, categories: n}); }} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer">
                          <Trash2 size={16}/>
                       </button>
                    </div>
                 ))}
               </div>
            </div>

            {/* Grid 4: Formatos (Tipos) de Eventos */}
            <div className="bg-slate-50 p-4 rounded-xl border border-gray-100">
               <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-2">
                 <h4 className="text-sm font-bold text-gray-700">4. Formatos (Tipos de Eventos)</h4>
                 <button type="button" onClick={() => setConfig({...config, eventTypes: [...(config.eventTypes || []), {id: `TIPO_${Date.now()}`, label: 'NOVO TIPO', colorHex: '#4a5568'}]})} className="text-xs flex items-center gap-1 font-bold text-primary-base hover:text-primary-dark cursor-pointer">
                   <Plus size={14}/> Novo Formato
                 </button>
               </div>
               
               <div className="space-y-2">
                 {(config.eventTypes || []).map((t, i) => (
                    <div key={i} className="flex flex-col gap-2 bg-white p-3 border border-gray-200 rounded-xl w-full">
                       <div className="flex gap-2">
                         <input value={t.id} onChange={(e) => { const n = [...config.eventTypes]; n[i].id = e.target.value.toUpperCase(); setConfig({...config, eventTypes: n}); }} placeholder="ID Interno (EX: PRESENCIAL)" className="w-1/3 px-3 py-1.5 border border-gray-200 rounded-lg text-xs uppercase font-bold text-gray-500 outline-none focus:border-blue-500"/>
                         <input value={t.label} onChange={(e) => { const n = [...config.eventTypes]; n[i].label = e.target.value; setConfig({...config, eventTypes: n}); }} placeholder="Descrição no Menu Ex: PRESENCIAL (Banner Azul)" className="w-2/3 px-3 py-1.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500"/>
                         <button type="button" onClick={() => { const n = [...config.eventTypes]; n.splice(i, 1); setConfig({...config, eventTypes: n}); }} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer">
                            <Trash2 size={16}/>
                         </button>
                       </div>
                       <div className="flex gap-2 items-center">
                         <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cor:</span>
                         <input type="color" value={t.colorHex} onChange={(e) => { const n = [...config.eventTypes]; n[i].colorHex = e.target.value; setConfig({...config, eventTypes: n}); }} className="w-8 h-8 rounded shrink-0 cursor-pointer border-0 p-0" />
                         <input type="text" value={t.colorHex} onChange={(e) => { const n = [...config.eventTypes]; n[i].colorHex = e.target.value; setConfig({...config, eventTypes: n}); }} placeholder="Ex: #2b56f5" className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-mono outline-none focus:border-blue-500"/>
                       </div>
                    </div>
                 ))}
               </div>
            </div>

            {/* Save Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleResetConfig}
                className="px-4 py-2.5 border border-gray-200 rounded-xl font-bold text-sm text-gray-500 hover:bg-slate-50 transition cursor-pointer"
              >
                Restaurar Padrão
              </button>
              <button
                type="submit"
                disabled={savingConfig}
                className="px-5 py-2.5 bg-primary-base hover:bg-primary-dark disabled:bg-primary-base/60 text-white rounded-xl font-bold text-sm transition shadow-sm cursor-pointer flex items-center justify-center gap-2"
              >
                <Save size={16} />
                {savingConfig ? "Gravando..." : "Salvar Configuração Visual"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Dialog overlay for Events */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden border border-[#c8d8e8] animate-in fade-in zoom-in-95 duration-200">
            {/* Form Header */}
            <div className="bg-primary-dark text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Calendar size={18} />
                {editingId ? "Editar Evento da Agenda" : "Novo Evento da Agenda"}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto animate-in fade-in duration-300">
              <div className="grid grid-cols-2 gap-4">
                {/* Day Input */}
                <div>
                  <label className="block text-xs font-black uppercase text-gray-500 tracking-wider mb-1">
                    Dia(s) do evento <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 02, 08, 12-14"
                    value={formData.day}
                    onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-base outline-none"
                  />
                </div>

                {/* Month Dropdown */}
                <div>
                  <label className="block text-xs font-black uppercase text-gray-500 tracking-wider mb-1">
                    Mês <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.month}
                    onChange={(e) => handleMonthChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-base outline-none bg-white font-bold"
                  >
                    {MONTHS_LIST.map((m) => (
                      <option key={m.short} value={m.short}>
                        {m.name} ({m.short})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Custom Subtitle Details */}
                <div>
                  <label className="block text-xs font-black uppercase text-gray-500 tracking-wider mb-1">
                    Formatado / Hora (Subtítulo)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: JUN • 11h ou JUNHO"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-base outline-none"
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    Define o texto que vai abaixo da data no banner do card.
                  </span>
                </div>

                {/* Event Type dropdown */}
                <div>
                  <label className="block text-xs font-black uppercase text-gray-500 tracking-wider mb-1">
                    Formato (Tipo) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-base outline-none bg-white font-bold"
                  >
                    {(config.eventTypes || DEFAULT_CONFIG.eventTypes).map(t => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-black uppercase text-gray-500 tracking-wider mb-1">
                  Categoria / Ministério realizador <span className="text-red-500">*</span>
                </label>
                
                {/* Standardized Quick-Select Presets */}
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  <span className="text-[10px] font-bold text-gray-400 self-center mr-1">Rápido:</span>
                  {(config.categories || DEFAULT_CONFIG.categories).map((preset) => (
                    <button
                      key={preset.code}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: preset.code })}
                      className={`px-2 py-0.5 text-[10px] font-black rounded-md border transition-all cursor-pointer ${
                        formData.category.toUpperCase() === preset.code
                          ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                      }`}
                      title={preset.label}
                    >
                      {preset.code}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  required
                  placeholder="Ex: IEQ, CND, GMM, COMMEQ, GMC"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-base outline-none uppercase font-bold text-blue-600"
                />
              </div>

              {/* Event Title */}
              <div>
                <label className="block text-xs font-black uppercase text-gray-500 tracking-wider mb-1">
                  Título do Evento <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: MEGA CULTO DA FAMÍLIA"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-base outline-none uppercase font-extrabold"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-black uppercase text-gray-500 tracking-wider mb-1">
                  Localização / Plataforma <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Online, IEQ - Olavo Bilac SP, São Paulo"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-base outline-none"
                />
              </div>

              {/* Actions Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl font-bold text-sm text-gray-500 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary-base hover:bg-primary-dark text-white rounded-xl font-bold text-sm transition shadow-sm cursor-pointer"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom non-blocking Confirmation Dialog */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 border border-slate-100 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-3 text-amber-500">
              <AlertCircle size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-2">
              {confirmModal.title}
            </h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              {confirmModal.message}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 transition cursor-pointer"
              >
                Não, cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmModal({ ...confirmModal, isOpen: false });
                  confirmModal.onConfirm();
                }}
                className={`px-4 py-2 text-white rounded-lg text-xs font-bold transition cursor-pointer ${
                  confirmModal.title.toLowerCase().includes("exclu") ||
                  confirmModal.title.toLowerCase().includes("remover")
                    ? "bg-rose-500 hover:bg-rose-600 focus:ring-rose-200"
                    : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-100"
                }`}
              >
                Sim, confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
