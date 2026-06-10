import { useState, useEffect } from "react";
import { collection, onSnapshot, doc, setDoc, deleteDoc, addDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Calendar, Plus, Edit, Trash2, MapPin, Check, AlertCircle, Search, RefreshCw, X } from "lucide-react";

interface AgendaEvent {
  id: string;
  day: string;
  month: string; // "JAN", "FEV", etc.
  monthNum: number; // 1 to 12
  subtitle: string; // "JUN • 11h" or "JUNHO"
  type: "PRESENCIAL" | "ONLINE" | "PRESENCIAL / ONLINE";
  category: string;
  title: string;
  location: string;
}

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
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilterMonth, setSelectedFilterMonth] = useState("TODOS");

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

  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    // Listen to firestore events list
    const unsub = onSnapshot(
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
        console.error("Error loading events in panel:", error);
        setLoading(false);
      }
    );

    return () => unsub();
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
      // Autofill subtitle helper if empty
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

  const handleDelete = async (id: string) => {
    if (window.confirm("Deseja realmente remover este evento da agenda?")) {
      try {
        await deleteDoc(doc(db, "agenda_events", id));
        triggerNotification("success", "Evento excluído com sucesso!");
      } catch (error) {
        console.error("Error deleting:", error);
        triggerNotification("error", "Erro ao excluir o evento.");
      }
    }
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
      console.error("Error saving event:", error);
      triggerNotification("error", "Ocorreu um erro ao salvar o evento.");
    }
  };

  // Filter events based on search term and selected month dropdown
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
      {/* Header and Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#e2eaf3] mb-6">
        <div>
          <h2 className="text-xl font-bold text-primary-dark flex items-center gap-2">
            <Calendar className="text-primary-base w-6 h-6" />
            Gerenciador da Agenda Geral
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Cadastre os cultos, reuniões e eventos públicos. Os visitantes poderão filtrar por mês no site.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-primary-base hover:bg-primary-dark text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus size={18} />
          Novo Evento
        </button>
      </div>

      {/* Notifications bar */}
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

      {/* Filter and Search Controls */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
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
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-base focus:border-transparent"
          />
        </div>

        {/* Month Dropdown Filter */}
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

      {/* Modal/Form section - Elegant overlays */}
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
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
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
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-base focus:border-transparent outline-none"
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
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-base focus:border-transparent outline-none bg-white font-bold"
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
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-base focus:border-transparent outline-none"
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
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-base focus:border-transparent outline-none bg-white font-bold"
                  >
                    <option value="PRESENCIAL">PRESENCIAL (Banner Azul)</option>
                    <option value="ONLINE">ONLINE (Banner Roxo)</option>
                    <option value="PRESENCIAL / ONLINE">PRESENCIAL + ONLINE (Banner Preto)</option>
                  </select>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-black uppercase text-gray-500 tracking-wider mb-1">
                  Categoria / Ministério realizador <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: IEQ, CND, GMM, COMMEQ, GMC"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-base focus:border-transparent outline-none uppercase font-bold text-blue-600"
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
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-base focus:border-transparent outline-none uppercase font-extrabold"
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
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-base focus:border-transparent outline-none"
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

      {/* Main Table / Grid of Events */}
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
                let badgeStyle = "bg-blue-50 text-blue-700 border-blue-200";
                if (ev.type === "ONLINE") {
                  badgeStyle = "bg-purple-50 text-purple-700 border-purple-200";
                } else if (ev.type === "PRESENCIAL / ONLINE") {
                  badgeStyle = "bg-slate-100 text-slate-800 border-slate-300";
                }

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
                      <span className={`px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${badgeStyle}`}>
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
          <h4 className="text-base font-bold text-gray-700">Nenhum evento encontrado</h4>
          <p className="text-xs text-gray-400 mt-1">
            Modifique os filtros acima ou cadastre um novo evento para vê-lo aqui.
          </p>
        </div>
      )}
    </div>
  );
}
