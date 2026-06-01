import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  BookOpen,
  Award,
  CheckCircle2,
  Users,
  Bookmark,
  Share2,
  Settings,
} from "lucide-react";
import { motion } from "motion/react";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import CourseRegistrationModal from "../components/CourseRegistrationModal";
import { useFirebase } from "../context/FirebaseContext";

// Fallback high-quality curated content for standard courses
const FALLBACK_COURSE_DETAILS: Record<string, {
  detailedContent: string;
  duration?: string;
  encontros?: string;
  publico?: string;
  investment?: string;
  instructor?: string;
}> = {
  "Edificado Matrimônio": {
    detailedContent: `O curso Edificado Matrimônio é composto por encontros práticos focados no fortalecimento da aliança matrimonial. Com metodologia dinâmica, ensinamento bíblico focado e compartilhamento em pequenos grupos estruturados, o treinamento capacita o casal a superar barreiras históricas e construir uma casa verdadeiramente inabalável.

### Principais tópicos abordados:
• **O plano original para a família**: Entenda a perspectiva sagrada da criação do lar.
• **Aliança de Sangue**: O mistério da união indissolúvel até que a morte os separe.
• **Papéis do casal**: Compreenda as responsabilidade práticas do marido e da esposa sob a orientação da Escritura.
• **Comunicação Efetiva**: Como resolver conflitos em paz, eliminando a amargura e os ruídos de palavras.
• **Finanças em Unidade**: Alinhamento econômico completo para prosperar de mãos dadas.
• **Intimidade e Expressão**: Curando bloqueios e construindo conexões emocionais profundas no leito conjugal.
• **O Poder da Oração**: Criando o hábito de buscar a Deus em casal para mover céus e terra.`,
    duration: "10 Semanas",
    encontros: "10 Encontros Semanais",
    publico: "Casados e Noivos",
    investment: "Gratuito (Material Consultar Grupo)"
  },
  "Apascentando Filhos": {
    detailedContent: `Uma mentoria indispensável que fornece aos pais e educadores ferramentas práticas combinadas a insights bíblicos para instruir crianças e adolescentes com autoridade equilibrada, graça e temor ao Senhor.

### Tópicos estratégicos abordados:
• **Coração da Criança**: Indo além das aparências de mau comportamento para moldar o caráter interior do seu filho.
• **Instrução e Autoridade**: Como orientar de forma assertiva sem precisar gritar, irritar ou gerar amargura.
• **Moldando Valores Espirituais**: Práticas recomendadas para fazer do culto doméstico um momento amado por todos.
• **Resiliência Cultural**: Protegendo as crianças de ideologias e do vício prejudicial em telas e mídias sociais.
• **Pontes de Diálogo**: Estratégias de escuta recomendadas para cada fase: da primeira infância à adolescência crítica.`,
    duration: "8 Semanas",
    encontros: "8 Encontros Semanais",
    publico: "Pais, Mães e Guardiões",
    investment: "Gratuito (Material individual)"
  },
  "Alcançando a Liberdade Financeira": {
    detailedContent: `Um minucioso curso de mordomia cristã e planejamento econômico em unidade baseado integralmente nas Sagradas Escrituras. Aprenda a sanar dívidas recorrentes, estabelecer fundos de segurança de longo prazo e trabalhar no mercado com discernimento.

### Conteúdo Programático:
• **A Perspectiva Divina**: O que a Palavra de Deus ensina verdadeiramente sobre conquistas, posses e riqueza.
• **Orçamento Conjugal Prático**: Como elaborar planilhas eficientes e definir orçamentos familiares em paz.
• **Estratégia de Quitação**: Guia prático passo a passo para eliminar juros e quitar dívidas rapidamente.
• **Generosidade Bíblica**: O mistério do dízimo e da partilha alegre como porta de escape para a avareza.
• **Investimento Integrado**: Diretrizes seguras para planejar o futuro, poupar com moderação e deixar um legado seguro para os filhos.`,
    duration: "6 Semanas",
    encontros: "6 Aulas Exclusivas",
    publico: "Casais, Noivos e Solteiros",
    investment: "Gratuito"
  },
  "Marido de Valor": {
    detailedContent: `Curso desenvolvido exclusivamente para o público masculino focado na responsabilidade prática da liderança de serviço, superação de dependências e papel de sacerdote do lar.

### Tópicos centrais:
• **A Verdadeira Masculinidade**: Rompendo com estereótipos culturais destrutivos e adotando o exemplo de Cristo.
• **Sacerdócio Familiar**: Como guiar a esposa e os filhos espiritualmente dando o exemplo pessoal diário.
• **Proteção Emocional**: O dever incondicional do marido em amar e nutrir a esposa com respeito e gentileza.
• **Paternidade Ativa**: O papel vital do pai no desenvolvimento da identidade e autoestima espiritual dos filhos.
• **Trabalho e Integridade**: Como alcançar progresso profissional honesto e ser um referencial inquestionável.`,
    duration: "8 Semanas",
    encontros: "8 Encontros Semanais",
    publico: "Apenas para Homens",
    investment: "Gratuito"
  },
  "Esposa Sábia": {
    detailedContent: `Uma jornada de acolhimento e mentoria para mulheres que desejam crescer fundamentadas na inteligência emocional, sabedoria dos relacionamentos e oração transformadora no lar.

### Assuntos do Treinamento:
• **Edificando com Sabedoria**: Medidas práticas para transformar a atmosfera do lar de um campo de estresse para um santuário de paz.
• **Inteligência Emocional Prática**: Lidando com sentimentos de sobrecarga, ansiedade e frustrações diárias.
• **Comunicação Mansa e Firme**: Como expor opiniões com clareza sem cair na murmuração ou nas críticas invasivas.
• **Sabedoria do Encorajamento**: Despertando o potencial máximo do seu parceiro através da honra e cooperação.
• **O Poder do Altar Fiel**: Segredos da intercessão silenciosa que operam milagres espirituais indescritíveis.`,
    duration: "8 Semanas",
    encontros: "8 Encontros Semanais",
    publico: "Apenas para Mulheres",
    investment: "Gratuito"
  }
};

export default function DetalheCurso() {
  const { courseTitle } = useParams<{ courseTitle: string }>();
  const navigate = useNavigate();
  const { user, profile } = useFirebase();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isGlobalAdmin = profile?.role === "admin" || user?.email === "alaondez@gmail.com";
  const isEditor = profile?.role === "editor";
  const hasGlobalAccess = isGlobalAdmin || isEditor;
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const decodedTitle = decodeURIComponent(courseTitle || "");
    setLoading(true);

    let cursosList: any[] = [];
    let homeList: any[] = [];
    let edificadoCoursesList: any[] = [];

    let edificado_matrimonio: any = null;

    const updateFromLists = () => {
      // Fast path for Edificado Matrimônio
      if (
        decodedTitle.trim().toLowerCase() === "edificado matrimônio" &&
        edificado_matrimonio
      ) {
        setCourse({
          title: edificado_matrimonio.title || "Edificado Matrimônio",
          description: edificado_matrimonio.description || "O treinamento fundamental focado nos alicerces bíblicos para o matrimônio.",
          detailedContent: edificado_matrimonio.detailedContent || FALLBACK_COURSE_DETAILS["Edificado Matrimônio"].detailedContent,
          badge: edificado_matrimonio.badge || "Mais Procurado",
          image: edificado_matrimonio.image || "",
          duration: edificado_matrimonio.duration || "10 Semanas",
          encontros: edificado_matrimonio.encontros || "10 Encontros Semanais",
          publico: edificado_matrimonio.publico || "Casados e Noivos",
          investment: edificado_matrimonio.investment || "Gratuito (Material Consultar Grupo)",
          instructor: edificado_matrimonio.instructor,
        });
        setLoading(false);
        return;
      }
      
      let matchedSourceTab = "cursos"; 
      const cMatch = cursosList.find((c: any) => c.title?.trim().toLowerCase() === decodedTitle.trim().toLowerCase());
      const hMatch = homeList.find((c: any) => c.title?.trim().toLowerCase() === decodedTitle.trim().toLowerCase());
      const eMatch = edificadoCoursesList.find((c: any) => c.title?.trim().toLowerCase() === decodedTitle.trim().toLowerCase());

      if (eMatch) matchedSourceTab = "edificado_matrimonio";
      if (hMatch && !eMatch) matchedSourceTab = "inicio";
      if (cMatch) matchedSourceTab = "cursos";

      // Merge all matched data, prioritizing non-empty fields
      const mergeCourseData = (base: any, override: any) => {
        if (!override) return base;
        if (!base) return override;
        const merged = { ...base };
        for (const key in override) {
          if (override[key] !== undefined && override[key] !== null && override[key] !== "") {
            merged[key] = override[key];
          }
        }
        return merged;
      };

      let matched: any = null;
      matched = mergeCourseData(matched, hMatch);
      matched = mergeCourseData(matched, cMatch);
      matched = mergeCourseData(matched, eMatch);

      if (matched) {
        const titleKey = Object.keys(FALLBACK_COURSE_DETAILS).find(
          (k) => k.toLowerCase() === matched.title?.toLowerCase()
        );
        const fallbackInfo = titleKey ? FALLBACK_COURSE_DETAILS[titleKey] : null;

        setCourse({
          title: matched.title,
          description: matched.description || matched.desc || "Aprenda princípios extraordinários para a sua vida e família neste treinamento ministerial.",
          detailedContent: matched.detailedContent ?? fallbackInfo?.detailedContent ?? "Para dúvidas sobre o cronograma completo das aulas e horários regulares de transmissão, por favor matricule-se ou entre em contato com nossa coordenação nacional.",
          badge: matched.badge || null,
          image: matched.image || "",
          duration: matched.duration ?? fallbackInfo?.duration ?? "Flexível",
          encontros: matched.encontros ?? fallbackInfo?.encontros ?? "Semanal",
          publico: matched.publico ?? fallbackInfo?.publico ?? "Livre",
          investment: matched.investment ?? fallbackInfo?.investment ?? "Gratuito",
          instructor: matched.instructor,
          sourceTab: matchedSourceTab
        });
        setLoading(false);
      } else {
        const fallbackMatchKey = Object.keys(FALLBACK_COURSE_DETAILS).find(
          (k) => k.toLowerCase() === decodedTitle.toLowerCase()
        );

        if (fallbackMatchKey) {
          const fallbackInfo = FALLBACK_COURSE_DETAILS[fallbackMatchKey];
          setCourse({
            title: fallbackMatchKey,
            description: `Participe do curso ${fallbackMatchKey} e reestruture sua vida em união espiritual e alinhamento prático.`,
            detailedContent: fallbackInfo.detailedContent,
            badge: fallbackMatchKey === "Edificado Matrimônio" ? "Mais Procurado" : null,
            image: "",
            duration: fallbackInfo.duration,
            encontros: fallbackInfo.encontros,
            publico: fallbackInfo.publico,
            investment: fallbackInfo.investment,
            instructor: fallbackInfo.instructor
          });
        } else {
          setCourse({
            title: decodedTitle,
            description: "Saiba mais sobre as datas, localizações e líderes locais deste grupo de mentoria e treinamento.",
            detailedContent: "Para maiores dados sobre a ementa de aulas deste curso ministerial, entre em contato direto com a equipe de coordenadores de nossa igreja.",
            duration: "Flexível",
            encontros: "Semanal",
            publico: "Membros e Líderes",
            investment: "Gratuito"
          });
        }
        setLoading(false);
      }
    };

    const unsubCursos = onSnapshot(doc(db, "content", "cursos"), (snapshot) => {
      if (snapshot.exists()) {
        cursosList = snapshot.data().cursos || [];
      } else {
        cursosList = [];
      }
      updateFromLists();
    }, (err) => {
      console.error("Erro no listener de cursos:", err);
      setLoading(false);
    });

    const unsubHome = onSnapshot(doc(db, "content", "home"), (snapshot) => {
      if (snapshot.exists()) {
        homeList = snapshot.data().courses || [];
      } else {
        homeList = [];
      }
      updateFromLists();
    }, (err) => {
      console.error("Erro no listener do home:", err);
      setLoading(false);
    });

    const unsubEdificado = onSnapshot(doc(db, "content", "edificado_matrimonio"), (snapshot) => {
      if (snapshot.exists()) {
        edificado_matrimonio = snapshot.data();
        edificadoCoursesList = edificado_matrimonio?.cursos || [];
      } else {
        edificado_matrimonio = null;
        edificadoCoursesList = [];
      }
      updateFromLists();
    }, (err) => {
      console.error("Erro no listener do edificado:", err);
      // fallback even if err
      edificado_matrimonio = null;
      edificadoCoursesList = [];
      updateFromLists();
    });

  return () => {
      unsubCursos();
      unsubHome();
      unsubEdificado();
    };
  }, [courseTitle]);

  if (loading) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-[#f7fafd] flex flex-col items-center justify-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary-base border-t-transparent" />
        <p className="text-sm font-semibold text-primary-dark">Carregando detalhes do curso...</p>
      </div>
    );
  }

  // Handle share / copy link helper
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Ministério de Família - " + (course?.title || "Treinamento"),
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copiado para a área de transferência!");
      }
    } catch (e: any) {
      console.error("Share failed", e);
      if (e.name !== 'AbortError') {
        alert(window.location.href);
      }
    }
  };

  if (course?.sourceTab === "edificado_matrimonio") {
    return (
      <div className="pt-20 min-h-screen bg-[#f7fafd] font-sans">
        {/* Banner / Header Title Area */}
        <section className="bg-primary-dark text-white py-16 md:py-20 relative overflow-hidden">
          {course.image && !imageError ? (
            <>
              <div 
                className="absolute inset-0 bg-cover bg-center xl:bg-[center_top_-4rem]"
                style={{ backgroundImage: `url(${course.image})` }}
              />
              <div className="absolute inset-0 bg-primary-dark/40 pointer-events-none lg:hidden"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-primary-dark via-primary-dark/60 to-transparent pointer-events-none hidden lg:block w-3/4"></div>
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary-dark to-primary-base"></div>
          )}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-light/20 to-transparent pointer-events-none" />
          
          <div className="max-w-6xl mx-auto px-6 relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
            <div className="flex-1 min-w-0 space-y-5">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-light hover:text-white transition-colors uppercase tracking-widest bg-white/5 px-2.5 py-1.5 rounded-full cursor-pointer"
              >
                <ArrowLeft size={14} /> Voltar para lista
              </button>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-widest bg-primary-light text-white px-3 py-1 rounded-md">
                  Treinamento Oficial
                </span>
                {course.badge && (
                  <span className="text-[10px] font-black uppercase tracking-widest bg-yellow-500 text-primary-dark px-3 py-1 rounded-md">
                    {course.badge}
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-5xl font-black font-serif tracking-tight text-white m-0 break-words break-all">
                {course.title}
              </h1>
              <p className="text-base md:text-lg text-primary-bg font-serif italic max-w-2xl opacity-90 leading-relaxed break-words break-all whitespace-pre-wrap overflow-hidden">
                "{course.description}"
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-8 py-4 bg-white text-primary-dark hover:bg-primary-bg font-black rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 text-sm uppercase tracking-wider cursor-pointer"
                >
                  Matricule-se Agora
                </button>
                {hasGlobalAccess && (
                  <Link
                    to={`/dashboard/global-content?tab=edificado_matrimonio&editCourse=${encodeURIComponent(course.title)}`}
                    className="flex items-center justify-center gap-1.5 px-5 py-4 bg-yellow-400 hover:bg-yellow-500 text-primary-dark font-extrabold rounded-xl shadow-md transition-transform hover:-translate-y-0.5 text-xs uppercase tracking-wide text-center"
                  >
                    <Settings size={15} /> Editar Detalhes
                  </Link>
                )}
                <button
                  onClick={handleShare}
                  className="p-4 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-white transition-colors cursor-pointer"
                  title="Compartilhar"
                >
                  <Share2 size={18} />
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-12 md:py-16">
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 bg-white rounded-2xl border border-[#e2eaf3] p-6 md:p-10 shadow-sm space-y-6">
              <h2 className="text-xl md:text-2xl font-bold font-serif text-primary-dark border-b border-gray-100 pb-4 flex items-center gap-2">
                <BookOpen className="text-primary-base" size={22} />
                Sobre o Treinamento
              </h2>

              <div className="text-[#2c4a63] leading-relaxed text-sm md:text-base whitespace-pre-wrap font-sans space-y-4 break-words overflow-hidden">
                {course.detailedContent.split("\n\n").map((para, pIdx) => {
                  if (para.startsWith("###")) {
                    return (
                      <h3 key={pIdx} className="text-lg font-bold font-serif text-primary-dark pt-4 mb-2">
                        {para.replace("###", "").trim()}
                      </h3>
                    );
                  }
                  if (para.startsWith("•") || para.startsWith("*")) {
                    return (
                      <div key={pIdx} className="pl-4 space-y-2 py-1">
                        {para.split("\n").map((line, lIdx) => {
                          const boldMatch = line.match(/^\s*[•*]\s*\*\*(.*?)\*\*:(.*)$/);
                          if (boldMatch) {
                            return (
                              <div key={lIdx} className="flex items-start gap-2.5 text-sm text-[#2a445a]">
                                <span className="text-primary-base text-lg font-bold shrink-0">•</span>
                                <span>
                                  <strong className="text-primary-dark font-semibold">{boldMatch[1]}:</strong>
                                  {boldMatch[2]}
                                </span>
                              </div>
                            );
                          }
                          return (
                            <div key={lIdx} className="flex items-start gap-2 text-sm text-[#2a445a]">
                              <span className="text-primary-base font-bold shrink-0">•</span>
                              <span>{line.replace(/^[•*]/, "").trim()}</span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  }
                  return <p key={pIdx}>{para}</p>;
                })}
              </div>

              <div className="bg-[#f7fafd] border border-[#e2eaf3] rounded-xl p-5 flex items-start gap-4">
                <div className="p-2 bg-white rounded-lg text-primary-base border border-[#c8d8e8]">
                  <Award size={24} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-primary-dark">Certificação Oficial Edificado Famílias</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Ao concluir todo o plano pedagógico de encontros regulares, sua participação será registrada pelo casal de líderes anfitrião no portal nacional.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-2xl border border-[#e2eaf3] p-6 shadow-sm space-y-5">
                <h3 className="text-base font-bold font-serif text-primary-dark border-b border-gray-100 pb-3 flex items-center gap-1.5">
                  <Bookmark size={18} className="text-primary-base" /> Ficha Técnica
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary-base/5 rounded-xl text-primary-base">
                      <Clock size={18} />
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider">Duração</span>
                      <span className="text-sm font-bold text-primary-dark">{course.duration}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary-base/5 rounded-xl text-primary-base">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider">Periodicidade</span>
                      <span className="text-sm font-bold text-primary-dark">{course.encontros}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary-base/5 rounded-xl text-primary-base">
                      <Users size={18} />
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider">Público Alvo</span>
                      <span className="text-sm font-bold text-primary-dark">{course.publico}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary-base/5 rounded-xl text-primary-base">
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider">Investimento</span>
                      <span className="text-sm font-bold text-primary-dark">{course.investment}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 space-y-3">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full py-4 bg-[#286086] hover:bg-[#1a4b6b] text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Solicitar Matrícula Grátis
                  </button>
                  {hasGlobalAccess && (
                    <Link
                      to={`/dashboard/global-content?tab=edificado_matrimonio&editCourse=${encodeURIComponent(course.title)}`}
                      className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 text-primary-dark font-extrabold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Settings size={14} /> Editar Detalhes do Curso (Admin)
                    </Link>
                  )}
                  <Link
                    to="/contato"
                    className="w-full py-3.5 bg-gray-50 hover:bg-gray-100 border border-[#e2eaf3] text-[#2c4a63] font-bold rounded-xl text-xs transition-colors flex items-center justify-center"
                  >
                    Tem dúvidas? Chame no suporte
                  </Link>
                </div>
              </div>

              <div className="bg-[#fcfdfe] border border-[#e2eaf3] rounded-2xl p-6 text-center space-y-3 shadow-inner">
                <span className="inline-block p-2 bg-emerald-50 rounded-full text-emerald-600 border border-emerald-100 animate-pulse">
                  <CheckCircle2 size={20} />
                </span>
                <h4 className="text-sm font-extrabold text-[#2c4a63]">Vagas Limitadas</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  As turmas acontecem prioritariamente em pequenos grupos nos lares de casais coordenadores habilitados. Garanta hoje mesmo a reserva da sua vaga preenchendo o formulário simplificado.
                </p>
              </div>
            </div>

          </div>
        </section>

        <CourseRegistrationModal
          courseTitle={course.title}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7fafd] font-sans pb-24">
      {/* Banner / Hero Area */}
      <section className="text-white pt-28 pb-32 md:pt-36 md:pb-40 relative overflow-hidden">
        {/* Background Overlay or Image */}
        {course.image && !imageError ? (
          <>
            <div 
              className="absolute inset-0 bg-cover bg-center xl:bg-[center_top_-4rem]"
              style={{ backgroundImage: `url(${course.image})` }}
            />
            <div className="absolute inset-0 bg-primary-dark/40 pointer-events-none lg:hidden"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-primary-dark via-primary-dark/60 to-transparent pointer-events-none hidden lg:block w-3/4"></div>
          </>
        ) : (
          <div className="absolute inset-0 bg-primary-dark"></div>
        )}
        {!course.image && <div className="absolute inset-0 bg-gradient-to-r from-primary-dark/90 to-primary-base/70 pointer-events-none"></div>}
        
        <div className="max-w-6xl mx-auto px-6 relative z-20">
          <div className="grid lg:grid-cols-12 gap-10">
            <div className={`${course.image && !imageError ? "lg:col-span-7" : "lg:col-span-12"} flex flex-col items-start space-y-6 min-w-0`}>
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-1.5 text-[10px] font-bold text-gray-400 hover:text-white transition-colors uppercase tracking-[0.2em]"
              >
                <ArrowLeft size={14} /> Voltar para a lista
              </button>
              
              <div className="flex gap-3 items-center flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-widest bg-white/10 text-white px-3 py-1.5 rounded text-center border border-white/10 shadow-sm">
                  Categoria: {course.category || "Escola Bíblica"}
                </span>
                {course.badge && (
                  <span className="text-[10px] font-black uppercase tracking-widest bg-[#f1c40f] text-primary-dark px-3 py-1.5 rounded shadow-sm">
                    {course.badge}
                  </span>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-serif tracking-tight text-white m-0 leading-[1.1]">
                {course.title}
              </h1>
              
              <div className="flex items-center gap-4 mt-6">
                <div className="w-12 h-12 rounded-full bg-primary-base flex items-center justify-center border-2 border-white/20 shadow-inner">
                  <span className="font-bold text-white uppercase text-xl">{course.instructor ? course.instructor.charAt(0) : "F"}</span>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-0.5">Autor / Instrutor</p>
                  <p className="font-bold text-lg text-white">{course.instructor || "Facilitador"}</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Main Core Content Grid */}
      <section className="max-w-6xl mx-auto px-6 relative z-30 pt-16">
        <div className="grid lg:grid-cols-12 gap-10">
          
          {/* Left Column: Detailed Content */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-[14px] border border-[#e2eaf3] p-8 md:p-12 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
              <div className="flex border-b border-gray-100 mb-8">
                <button className="px-6 py-4 border-b-2 border-primary-base text-primary-dark font-bold uppercase tracking-widest text-[11px] hover:bg-gray-50 transition-colors">
                  Sobre o Curso
                </button>
              </div>

              <h2 className="text-2xl md:text-3xl font-black font-serif text-primary-dark mb-6 break-words">
                Visão Geral
              </h2>

              <p className="text-[#2c4a63] text-lg lg:text-xl font-medium leading-relaxed italic mb-8 p-6 bg-[#f7fafd] border-l-4 border-primary-base rounded-r-xl shadow-sm break-all sm:break-words overflow-hidden">
                "{course.description}"
              </p>

              {/* Custom styled rendering of description body */}
              <div className="text-[#2c4a63] leading-loose text-base whitespace-pre-wrap font-sans space-y-6 break-words overflow-hidden">
                {course.detailedContent.split("\n\n").map((para, pIdx) => {
                  if (para.startsWith("###")) {
                    return (
                      <h3 key={pIdx} className="text-xl font-bold font-serif text-primary-dark pt-6 mb-2">
                        {para.replace("###", "").trim()}
                      </h3>
                    );
                  }
                  if (para.startsWith("•") || para.startsWith("*")) {
                    return (
                      <ul key={pIdx} className="pl-2 space-y-3 py-2">
                        {para.split("\n").map((line, lIdx) => {
                          const boldMatch = line.match(/^\s*[•*]\s*\*\*(.*?)\*\*:(.*)$/);
                          if (boldMatch) {
                            return (
                              <li key={lIdx} className="flex items-start gap-3 text-base text-[#2a445a]">
                                <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={20} />
                                <span>
                                  <strong className="text-primary-dark font-bold">{boldMatch[1]}:</strong>
                                  {boldMatch[2]}
                                </span>
                              </li>
                            );
                          }
                          return (
                            <li key={lIdx} className="flex items-start gap-3 text-base text-[#2a445a]">
                              <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={20} />
                              <span>{line.replace(/^[•*]/, "").trim()}</span>
                            </li>
                          );
                        })}
                      </ul>
                    );
                  }
                  return <p key={pIdx}>{para}</p>;
                })}
              </div>
            </div>
            
            {/* Certificaton Info Option */}
            <div className="bg-[#fcfdfe] border border-[#e2eaf3] rounded-2xl p-6 flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left shadow-sm">
              <div className="p-4 bg-primary-base/10 rounded-full text-primary-base border border-primary-base/20">
                <Award size={32} />
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-bold text-primary-dark font-serif">Certificado de Conclusão</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Ao concluir todo o plano pedagógico e encontros, você receberá um certificado oficial reconhecendo sua participação e capacitação neste treinamento.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Information Course Card */}
          <div className="lg:col-span-4 relative z-50">
            <div className="bg-white rounded-2xl shadow-xl border border-[#e2eaf3] overflow-hidden sticky top-24">

              <div className="p-8 space-y-6">
                {/* Price Display */}
                <div>
                  <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-1.5">Investimento</p>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-black text-[#1d2025] font-serif">{course.investment === "Gratuito" ? "Grátis" : course.investment}</span>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full py-4 bg-[#27ae60] hover:bg-[#219653] text-white rounded-xl font-black text-sm transition-colors flex items-center justify-center gap-2 uppercase tracking-widest shadow-lg hover:shadow-emerald-600/30 cursor-pointer"
                  >
                    Matrícula
                  </button>
                  {hasGlobalAccess && (
                    <Link
                      to={`/dashboard/global-content?tab=${course.sourceTab || 'cursos'}&editCourse=${encodeURIComponent(course.title)}`}
                      className="w-full py-3.5 bg-[#f1c40f] hover:bg-[#f39c12] text-primary-dark font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Settings size={14} /> Editar Detalhes (Admin)
                    </Link>
                  )}
                  <button
                    onClick={handleShare}
                    className="w-full py-3.5 bg-gray-50 hover:bg-gray-100 border border-[#e2eaf3] text-[#2c4a63] font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 uppercase tracking-widest cursor-pointer"
                  >
                    <Share2 size={16} /> Compartilhar
                  </button>
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <p className="font-bold text-primary-dark mb-5 text-sm font-serif">Este curso inclui:</p>
                  <ul className="space-y-4">
                    <li className="flex items-center gap-3 text-sm text-[#2a445a] font-medium">
                      <Clock size={18} className="text-primary-base" />
                      {course.duration} de conteúdo
                    </li>
                    <li className="flex items-center gap-3 text-sm text-[#2a445a] font-medium">
                      <Calendar size={18} className="text-primary-base" />
                      Acesso: {course.encontros}
                    </li>
                    <li className="flex items-center gap-3 text-sm text-[#2a445a] font-medium">
                      <Users size={18} className="text-primary-base" />
                      Público: {course.publico}
                    </li>
                    <li className="flex items-center gap-3 text-sm text-[#2a445a] font-medium">
                      <Award size={18} className="text-primary-base" />
                      Certificado oficial
                    </li>
                  </ul>
                </div>
                
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Embedded enrollment modal component */}
      <CourseRegistrationModal
        courseTitle={course.title}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
