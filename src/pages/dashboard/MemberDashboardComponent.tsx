import React, { useState, useEffect } from "react";
import { useFirebase } from "../../context/FirebaseContext";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { motion } from "framer-motion";
import {
  Bell,
  Calendar,
  Database,
  Edit3,
  Navigation,
  Users,
  Building,
  HelpCircle,
  Video,
  LayoutDashboard,
  Baby,
  BookOpen,
  Gift,
} from "lucide-react";

export default function MemberDashboardComponent({ activeTab }: { activeTab?: string }) {
  const { user } = useFirebase();
  const [annotation, setAnnotation] = useState("");
  const [isEditingAnnotation, setIsEditingAnnotation] = useState(false);
  const [savedAnnotation, setSavedAnnotation] = useState("");

  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  const [events, setEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [agendaConfig, setAgendaConfig] = useState<any>(null);

  const [allMembers, setAllMembers] = useState<any[]>([]);
  const [loadingBirthdays, setLoadingBirthdays] = useState(true);
  const [activeBirthdayMonth, setActiveBirthdayMonth] = useState(String(new Date().getMonth() + 1).padStart(2, "0"));

  const months = [
    { value: "01", label: "jan" },
    { value: "02", label: "fev" },
    { value: "03", label: "mar" },
    { value: "04", label: "abr" },
    { value: "05", label: "mai" },
    { value: "06", label: "jun" },
    { value: "07", label: "jul" },
    { value: "08", label: "ago" },
    { value: "09", label: "set" },
    { value: "10", label: "out" },
    { value: "11", label: "nov" },
    { value: "12", label: "dez" }
  ];

  useEffect(() => {
    if (user) {
      const unsubNotes = onSnapshot(doc(db, "member_notes", user.uid), (docSnap) => {
        if (docSnap.exists()) {
          setSavedAnnotation(docSnap.data().text || "");
          setAnnotation(docSnap.data().text || "");
        }
      });

      const qCourses = query(
        collection(db, "course_registrations"),
        where("userId", "==", user.uid)
      );
      const unsubCourses = onSnapshot(qCourses, (snap) => {
        const courses = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMyCourses(courses);
        setLoadingCourses(false);
      }, (err) => {
        console.error("Erro ao carregar cursos", err);
        setLoadingCourses(false);
      });

      const unsubConfig = onSnapshot(doc(db, "content", "agenda_config"), (docSnap) => {
        if (docSnap.exists()) {
          setAgendaConfig(docSnap.data());
        } else {
          setAgendaConfig({
            eventTypes: [
              { id: "PRESENCIAL", label: "PRESENCIAL (Banner Azul)", colorHex: "#2b56f5" },
              { id: "ONLINE", label: "ONLINE (Banner Roxo)", colorHex: "#7e3af2" },
              { id: "PRESENCIAL / ONLINE", label: "PRESENCIAL + ONLINE (Banner Preto)", colorHex: "#18181a" }
            ]
          });
        }
      });

      const unsubEvents = onSnapshot(collection(db, "agenda_events"), (snap) => {
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Ordenação simples, se necessário:
        list.sort((a: any, b: any) => {
          if (a.monthNum !== b.monthNum) return a.monthNum - b.monthNum;
          return parseInt(a.day) - parseInt(b.day);
        });
        setEvents(list);
        setLoadingEvents(false);
      }, (err) => {
        console.error("Erro ao carregar agenda", err);
        setLoadingEvents(false);
      });

      const unsubMembers = onSnapshot(collection(db, "membros"), (snap) => {
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAllMembers(list);
        setLoadingBirthdays(false);
      }, (err) => {
        console.error("Erro ao carregar aniversariantes", err);
        setLoadingBirthdays(false);
      });

      return () => {
        unsubNotes();
        unsubCourses();
        unsubConfig();
        unsubEvents();
        unsubMembers();
      };
    }
  }, [user]);

  const handleSaveAnnotation = async () => {
    if (user) {
      await setDoc(doc(db, "member_notes", user.uid), { text: annotation });
      setIsEditingAnnotation(false);
    }
  };

  if (activeTab === "member_agenda") {
    return (
      <div className="w-full h-full flex flex-col gap-6">
        <div className="bg-white rounded-[14px] border border-[#c8d8e8] overflow-hidden shadow-sm flex flex-col p-6 min-h-[500px]">
          <div className="w-full flex justify-between items-center border-b border-[#e2eaf3] pb-4 mb-4 pt-2 px-2">
            <h3 className="text-xl font-bold text-primary-dark flex items-center gap-2">
              <Calendar className="text-primary-base" />
              Agenda do Mês
            </h3>
          </div>
          
          <div className="flex-1 flex flex-col w-full h-full">
            {loadingEvents ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-70">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-base border-t-transparent" />
                <p className="mt-4 text-gray-500 font-medium text-sm">Carregando agenda...</p>
              </div>
            ) : events.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-70 my-12">
                <Calendar size={64} className="mb-4 text-[#455a64]" />
                <h4 className="text-xl font-black text-[#455a64]">
                  Nenhum evento na agenda
                </h4>
                <p className="text-gray-500 mt-2 max-w-md mx-auto">
                  Ainda não há eventos programados. Quando novos eventos forem criados na agenda geral, eles aparecerão aqui.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
                {events.map((evento, idx) => {
                  const evtTypeObj = agendaConfig?.eventTypes?.find((t: any) => t.id === evento.type);
                  const colorHex = evtTypeObj?.colorHex || "#2b56f5";
                  
                  return (
                    <div key={idx} className="bg-white rounded-[10px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full min-h-[200px]">
                      {/* Card Header Section */}
                      <div style={{ backgroundColor: colorHex }} className="p-4 text-white flex justify-between items-center shrink-0 select-none">
                        <div className="flex flex-col">
                          <span className="text-3xl font-black tracking-tight leading-none">
                            {evento.day}
                          </span>
                          <span className="text-[10px] font-sans font-black uppercase tracking-widest mt-1 opacity-90">
                            {evento.month}
                          </span>
                        </div>
                        <div className="border border-white/40 px-3 py-1 rounded-[4px] text-[9px] font-black tracking-wider uppercase bg-white/5 max-w-[120px] truncate">
                          {evento.type.replace(/ \(.+\)$/, "").trim()}
                        </div>
                      </div>

                      {/* Card Body Section */}
                      <div className="p-6 flex flex-col justify-between flex-grow">
                        <div>
                          {/* Category Tag */}
                          <div className="text-[10px] font-black tracking-wider text-blue-500 uppercase mb-2">
                            {evento.category || evento.subtitle}
                          </div>
                          {/* Event Title */}
                          <h3 className="text-[15px] font-bold text-[#141b29] leading-tight uppercase tracking-tight line-clamp-2">
                            {evento.title}
                          </h3>
                        </div>

                        {/* Event Location Footer */}
                        {evento.location && (
                          <div className="flex items-center gap-2 mt-5 text-gray-500 border-t border-gray-50 pt-4 shrink-0">
                            <Navigation size={15} className="text-[#8e90a0] shrink-0" />
                            <span className="text-[11px] font-bold text-[#8e90ff] uppercase tracking-wide truncate">
                              {evento.location}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === "member_ensino") {
    return (
      <div className="w-full h-full flex flex-col gap-6">
        <div className="bg-white rounded-[14px] border border-[#c8d8e8] overflow-hidden shadow-sm flex flex-col p-6 min-h-[500px]">
          <div className="w-full flex justify-between items-center border-b border-[#e2eaf3] pb-4 mb-4 pt-2 px-2">
            <h3 className="text-xl font-bold text-primary-dark flex items-center gap-2">
              <BookOpen className="text-primary-base" />
              Meus Cursos e Progresso
            </h3>
          </div>
          
          <div className="flex-1 flex flex-col w-full h-full">
            {loadingCourses ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-70">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-base border-t-transparent" />
                <p className="mt-4 text-gray-500 font-medium text-sm">Carregando seus cursos...</p>
              </div>
            ) : myCourses.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-70 my-12">
                <BookOpen size={64} className="mb-4 text-[#455a64]" />
                <h4 className="text-xl font-black text-[#455a64]">
                  Nenhum curso encontrado
                </h4>
                <p className="text-gray-500 mt-2 max-w-md mx-auto">
                  Você ainda não está matriculado em nenhum curso. Quando se matricular, o andamento de cada um aparecerá aqui.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 w-full">
                {myCourses.map((curso, idx) => {
                  const dataMatricula = curso.createdAt ? new Date(curso.createdAt.seconds * 1000).toLocaleDateString("pt-BR") : "Data indisponível";
                  const status = curso.status || "Em andamento";
                  const progress = curso.progress || 0;
                  
                  return (
                    <div key={idx} className="p-5 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 bg-primary-base/10 text-primary-dark rounded-xl flex items-center justify-center flex-shrink-0">
                          <BookOpen size={24} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-base text-primary-dark line-clamp-2">{curso.courseTitle}</h4>
                          <p className="text-xs text-gray-500 mt-1">
                            Matriculado em: {dataMatricula}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-auto pt-4 border-t border-gray-100 w-full flex flex-col gap-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-gray-700">Progresso</span>
                          <span className="font-bold text-primary-base">{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-primary-base h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                        </div>
                        <div className="mt-2 text-xs text-center font-medium py-1 px-2 rounded-md bg-gray-50 border border-gray-100">
                          Status: <span className={status === "Concluído" ? "text-green-600" : "text-blue-600"}>{status}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Calculate filtered birthdays
  const filteredBirthdays = allMembers.filter((m: any) => {
    if (!m.dataNascimento) return false;
    const parts = m.dataNascimento.split("/");
    if (parts.length === 3) {
      return parts[1] === activeBirthdayMonth;
    }
    return false;
  }).sort((a: any, b: any) => {
    const dayA = parseInt(a.dataNascimento.split("/")[0]);
    const dayB = parseInt(b.dataNascimento.split("/")[0]);
    return dayA - dayB;
  });

  return (
    <div className="w-full h-full flex flex-col gap-6">
      {/* Banner */}
      <div className="w-full h-[120px] bg-gradient-to-r from-blue-500 to-primary-base rounded-[14px] overflow-hidden relative shadow-sm">
        <div className="absolute inset-0 flex items-center justify-center text-white text-3xl font-black italic tracking-wider">
          ANÚNCIO OU BANNER DA IGREJA
        </div>
      </div>

      {/* Alerta de Aniversário para o Membro Logado */}
      {(() => {
        const currentDayStr = String(new Date().getDate()).padStart(2, "0");
        const currentMonthStr = String(new Date().getMonth() + 1).padStart(2, "0");
        const memberBday = allMembers.find(b => b.id === user?.uid);
        if (memberBday && memberBday.dataNascimento?.startsWith(`${currentDayStr}/${currentMonthStr}`)) {
          return (
            <div className="w-full bg-gradient-to-r from-pink-500 to-purple-600 rounded-[14px] p-4 md:p-6 text-white shadow-lg flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-full">
                  <Gift size={32} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-black tracking-tight">Feliz Aniversário!</h3>
                  <p className="text-sm md:text-base opacity-90 mt-1 font-medium">
                    Que Deus abençoe grandemente a sua vida, {memberBday.nome.split(' ')[0]}!
                  </p>
                </div>
              </div>
            </div>
          );
        }
        return null;
      })()}

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Aniversariantes do Mês */}
        <div className="bg-white rounded-[14px] border border-[#c8d8e8] overflow-hidden shadow-sm flex flex-col p-6 min-h-[300px] lg:col-span-2">
          <div className="w-full flex justify-between items-center border-b border-[#e2eaf3] pb-4 mb-4 pt-2 px-2">
            <h3 className="font-bold text-primary-dark flex items-center gap-2">
              <Gift size={20} className="text-pink-500" />
              Aniversariantes do Mês
            </h3>
            
            {/* Month Selector */}
            <div className="flex bg-gray-100/80 p-1 rounded-lg">
              {months.map(m => (
                <button
                  key={m.value}
                  onClick={() => setActiveBirthdayMonth(m.value)}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                    activeBirthdayMonth === m.value 
                      ? 'bg-white text-pink-600 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 flex flex-col w-full h-full max-h-[350px] overflow-y-auto pr-2">
            {loadingBirthdays ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-70">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-pink-500 border-t-transparent" />
              </div>
            ) : filteredBirthdays.length === 0 ? (
              <div className="flex-1 w-full flex flex-col items-center justify-center bg-[#f7fafd] border border-[#e2eaf3] p-4 text-center rounded-xl h-full">
                <Gift size={48} className="mb-4 text-[#455a64] opacity-50" />
                <p className="text-gray-500 font-medium text-sm">
                  Nenhum aniversariante selecionado.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 w-full">
                {filteredBirthdays.map((b, idx) => {
                  const day = b.dataNascimento.split('/')[0];
                  const currentMonthStr = String(new Date().getMonth() + 1).padStart(2, "0");
                  const isToday = day === String(new Date().getDate()).padStart(2, "0") && activeBirthdayMonth === currentMonthStr;
                  return (
                    <div key={idx} className={`p-4 border rounded-xl flex items-center gap-4 transition-shadow ${isToday ? 'border-pink-200 bg-pink-50/50 shadow-sm' : 'border-gray-100 bg-gray-50'}`}>
                      <div className={`w-14 h-14 rounded-full flex flex-col items-center justify-center flex-shrink-0 text-white ${isToday ? 'bg-gradient-to-br from-pink-400 to-pink-600 shadow-md' : 'bg-gray-300 text-gray-700'}`}>
                        <span className="text-xs font-bold uppercase -mb-1 opacity-90">{b.dataNascimento.split('/')[1]}</span>
                        <span className="text-xl font-black">{day}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-bold text-sm truncate ${isToday ? 'text-pink-700' : 'text-gray-800'}`}>
                          {b.nome}
                        </h4>
                        <span className="text-xs text-gray-500 mt-0.5 inline-block bg-white px-2 py-0.5 rounded-full border border-gray-200 shadow-sm">
                          {day}/{b.dataNascimento.split('/')[1]}
                        </span>
                        {isToday && (
                          <span className="text-[10px] font-black uppercase text-pink-600 bg-pink-100 px-2 py-0.5 rounded-full ml-2">
                            Hoje!
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Mural de avisos */}
        <div className="bg-white rounded-[14px] border border-[#c8d8e8] overflow-hidden shadow-sm flex flex-col items-center justify-center p-6 min-h-[300px]">
          <div className="w-full flex justify-between items-center border-b border-[#e2eaf3] pb-4 mb-auto pt-2 px-2">
            <h3 className="font-bold text-primary-dark">Mural de avisos</h3>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-70 my-8">
            <Database size={48} className="mb-4 text-[#455a64]" />
            <h4 className="text-lg font-black text-[#455a64]">
              Não há dados disponíveis
            </h4>
          </div>
        </div>

        {/* Minhas anotações */}
        <div className="bg-white rounded-[14px] border border-[#c8d8e8] overflow-hidden shadow-sm flex flex-col items-center justify-center p-6 min-h-[300px]">
          <div className="w-full flex justify-between items-center border-b border-[#e2eaf3] pb-4 mb-auto pt-2 px-2">
            <h3 className="font-bold text-primary-dark">Minhas anotações</h3>
            <button className="px-3 py-1 bg-primary-dark text-white text-xs font-bold rounded-full">
              Ver mais
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center text-center w-full mt-4">
            {!isEditingAnnotation && !savedAnnotation ? (
              <>
                <Database size={48} className="mb-4 text-[#455a64]" />
                <h4 className="text-lg font-black text-[#455a64] mb-4">
                  Não há dados disponíveis
                </h4>
                <button
                  onClick={() => setIsEditingAnnotation(true)}
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-full text-sm transition-all shadow-sm"
                >
                  + Criar anotação
                </button>
              </>
            ) : isEditingAnnotation ? (
              <div className="w-full h-full flex flex-col gap-2">
                <textarea
                  value={annotation}
                  onChange={(e) => setAnnotation(e.target.value)}
                  className="flex-1 w-full resize-none border border-[#c8d8e8] rounded-xl p-3 text-sm focus:outline-none focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10"
                  placeholder="Sua anotação secreta..."
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => {
                      setIsEditingAnnotation(false);
                      setAnnotation(savedAnnotation);
                    }}
                    className="px-3 py-1 font-bold text-gray-500 hover:bg-gray-100 rounded-md text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveAnnotation}
                    className="px-3 py-1 font-bold text-white bg-primary-base hover:bg-primary-dark rounded-md text-sm shadow-sm"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-start text-left gap-4">
                <div className="flex-1 w-full bg-[#fcfdfe] p-3 rounded-lg border border-gray-100 text-sm text-gray-600 whitespace-pre-wrap overflow-y-auto">
                  {savedAnnotation}
                </div>
                <button
                  onClick={() => setIsEditingAnnotation(true)}
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-full text-sm transition-all shadow-sm self-center"
                >
                  Editar anotação
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
