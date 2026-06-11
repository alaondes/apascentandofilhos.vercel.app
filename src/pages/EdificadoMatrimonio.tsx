import { useState, useEffect } from "react";
import { Heart, GraduationCap, Users, Star, ArrowRight, Settings, AlertTriangle, Database, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import CourseRegistrationModal from "../components/CourseRegistrationModal";
import { useFirebase } from "../context/FirebaseContext";

export default function EdificadoMatrimonio() {
  const { user, profile } = useFirebase();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [edificadoData, setEdificadoData] = useState<any>(null);
  const [coursesData, setCoursesData] = useState<any>(null);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  const [loginData, setLoginData] = useState({
    title: "Você já é líder?",
    subtitle: "E ainda não tem acesso, cadastre-se!",
    boxText:
      "Nesta área você poderá enviar os relatórios de cadastros e semanais de forma fácil e prática.",
    warningText:
      "Atenção: antes de se cadastrar, realize o treinamento de líder para ministrar.",
    infoText: "Seus relatórios ficarão armazenados na sua área pessoal.",
  });

  const isGlobalAdmin = profile?.role === "admin" || user?.email === "alaondez@gmail.com";
  const isEditor = profile?.role === "editor";
  const hasGlobalAccess = isGlobalAdmin || isEditor;

  useEffect(() => {
    const unsubEd = onSnapshot(doc(db, "content", "edificado_matrimonio"), (snap) => {
      if (snap.exists()) setEdificadoData(snap.data());
    }, (err) => console.error("Error loading edificado matrimonio data:", err));

    const unsubCursos = onSnapshot(doc(db, "content", "cursos"), (snap) => {
      if (snap.exists()) setCoursesData(snap.data());
    }, (err) => console.error("Error loading cursos data:", err));

    const unsubLogin = onSnapshot(doc(db, "content", "login"), (snap) => {
      if (snap.exists()) setLoginData((prev) => ({ ...prev, ...snap.data() }));
    }, (err) => console.error("Error loading login data:", err));

    return () => {
      unsubEd();
      unsubCursos();
      unsubLogin();
    }
  }, []);

  const displaySlides = edificadoData !== null
    ? (edificadoData.slides || [])
    : [
        {
          url: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&q=80&w=2070",
          title: "Edificado Matrimônio",
          subtitle: "O treinamento fundamental focado nos alicerces bíblicos para o matrimônio",
        }
      ];

  useEffect(() => {
    if (displaySlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % displaySlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [displaySlides]);

  const displayBeliefs = edificadoData !== null
    ? (edificadoData.beliefs || [])
    : [
        {
          id: 1,
          title: "Restauração",
          description: "Ferramentas profundas para curar áreas de conflito e reconectar casais que buscam uma nova jornada juntos.",
        },
        {
          id: 2,
          title: "Prevenção",
          description: "Cursos focados em noivos e recém-casados para iniciar a jornada no caminho certo, baseados em valores sólidos.",
        },
        {
          id: 3,
          title: "Legado Familiar",
          description: "Princípios aplicados à criação de filhos e finanças familiares estruturadas para durar por gerações.",
        },
      ];

  const defaultCursos = [
    {
      id: 1,
      title: "Edificado Matrimônio",
      badge: "Mais Procurado",
      description: "O treinamento fundamental focado nos alicerces bíblicos para o matrimônio.",
      iconName: "star",
    },
    {
      id: 2,
      title: "Apascentando Filhos",
      description: "Uma mentoria estratégica voltada a pais e educadores.",
      iconName: "arrowRight",
    },
    {
      id: 3,
      title: "Alcançando a Liberdade Financeira",
      description: "Curso voltado ao alinhamento financeiro do casal.",
      iconName: "arrowRight",
    },
  ];

  const coursesList = edificadoData !== null
    ? (edificadoData.cursos || [])
    : defaultCursos;

  const renderIcon = (iconName: string) => {
    if (iconName === "star") return <Star className="text-yellow-500" />;
    return <ArrowRight className="text-primary-base" />;
  };

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[500px] overflow-hidden bg-primary-dark">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            <div className="absolute inset-0 bg-[#0a1e2e]/50 z-10" />
            {displaySlides[currentSlide]?.url && (
              <img
                src={displaySlides[currentSlide]?.url}
                alt="Hero"
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6">
              <motion.h1
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="text-4xl md:text-6xl text-white font-serif font-black tracking-wide max-w-4xl leading-tight drop-shadow-xl"
              >
                {displaySlides[currentSlide]?.title}
              </motion.h1>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-lg md:text-xl text-white/90 mt-6 max-w-2xl italic drop-shadow-md font-medium whitespace-pre-line"
              >
                {displaySlides[currentSlide]?.subtitle}
              </motion.p>
              {displaySlides[currentSlide]?.reference && (
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  className="text-sm md:text-base text-white/70 mt-3 max-w-2xl italic font-light drop-shadow"
                >
                  {displaySlides[currentSlide]?.reference}
                </motion.p>
              )}
              {(displaySlides[currentSlide]?.button1Text || displaySlides[currentSlide]?.button2Text) && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                  className="mt-10 flex flex-wrap justify-center gap-4"
                >
                  {displaySlides[currentSlide]?.button1Text && (
                    <Link
                      to={displaySlides[currentSlide]?.button1Link || "/cursos"}
                      className="px-8 py-4 rounded-full bg-primary-base hover:bg-primary-dark text-white font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                    >
                      {displaySlides[currentSlide]?.button1Text}
                    </Link>
                  )}
                  {displaySlides[currentSlide]?.button2Text && (
                    <Link
                      to={displaySlides[currentSlide]?.button2Link || "/quem-somos"}
                      className="px-8 py-4 border-2 border-white text-white rounded-full font-bold transition-all hover:bg-white/10 text-center hover:-translate-y-1"
                    >
                      {displaySlides[currentSlide]?.button2Text}
                    </Link>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* Leader Registration / Info Section */}
      <section className="py-20 md:py-32 relative overflow-hidden bg-gradient-to-br from-[#0b2158] via-primary-dark to-primary-base text-white">
        {/* Decorative Grid Pattern for Full Banner */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        
        {/* Ambient Lights */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-white/5 blur-[100px]"></div>
          <div className="absolute bottom-[10%] -right-[10%] w-[40%] h-[60%] rounded-full bg-white/5 blur-[100px]"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Text Content Area */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-7 flex flex-col justify-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 Backdrop-blur-md w-fit mb-6 shadow-inner">
               <Star size={14} className="text-amber-300" />
               <span className="text-xs font-bold uppercase tracking-widest text-blue-100">Área Exclusiva</span>
            </div>

            <h2 className="font-serif text-[2.4rem] md:text-[3.5rem] font-bold mb-4 drop-shadow-sm leading-tight text-white">
              {loginData.title}
            </h2>
            <p className="text-[1.2rem] md:text-[1.4rem] opacity-90 font-medium mb-10 text-blue-100/90 leading-relaxed max-w-2xl">
              {loginData.subtitle}
            </p>

            {loginData.boxText && (
              <div className="relative mb-8 max-w-2xl">
                <div className="absolute inset-0 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 transform -skew-x-2"></div>
                <p className="relative z-10 text-base md:text-lg opacity-100 p-6 md:p-8 leading-relaxed whitespace-pre-line text-blue-50/90 font-medium">
                  {loginData.boxText}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-5 mt-2 max-w-2xl">
              {loginData.warningText && (
                <div className="flex-1 flex gap-4 items-start bg-black/20 p-5 rounded-2xl border border-white/5 Backdrop-blur-sm">
                  <AlertTriangle size={24} className="shrink-0 text-amber-400 mt-1" />
                  <span className="text-sm leading-relaxed text-blue-50/80">
                    {loginData.warningText}
                  </span>
                </div>
              )}

              {loginData.infoText && (
                <div className="flex-1 flex gap-4 items-start bg-black/20 p-5 rounded-2xl border border-white/5 Backdrop-blur-sm">
                  <Database size={24} className="shrink-0 text-blue-300 mt-1" />
                  <span className="text-sm leading-relaxed text-blue-50/80">
                    {loginData.infoText}
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Action Area / Buttons */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="lg:col-span-5 flex flex-col items-center justify-center lg:items-end w-full"
          >
            <div className="w-full max-w-md bg-white/5 p-8 md:p-10 rounded-[2rem] border border-white/10 backdrop-blur-xl shadow-2xl flex flex-col gap-5">
              <h3 className="text-xl font-bold mb-2 text-center text-white">Acesse o seu portal</h3>
              
              <Link
                to="/cadastro"
                className="w-full group relative inline-flex items-center justify-center gap-3 bg-white text-primary-dark px-8 py-5 rounded-2xl font-bold md:text-lg hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></span>
                <UserPlus size={24} className="text-primary-base group-hover:scale-110 transition-transform duration-300 relative z-10" />
                <span className="relative z-10">Sou um Líder</span>
              </Link>
              
              <div className="flex items-center gap-4 my-2 opacity-50">
                <div className="h-px bg-white/30 flex-1"></div>
                <span className="text-xs font-bold uppercase tracking-wider text-white">OU</span>
                <div className="h-px bg-white/30 flex-1"></div>
              </div>

              <Link
                to="/cadastro-membro"
                className="w-full inline-flex items-center justify-center gap-3 bg-transparent text-white border-2 border-white/20 px-8 py-5 rounded-2xl font-bold md:text-lg hover:bg-white/10 hover:border-white/40 transition-all duration-300"
              >
                <Users size={24} className="text-blue-200" />
                <span>Sou um Membro</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary-dark mb-8">
            {edificadoData?.beliefsTitle || "Edificado Matrimônio"}
          </h2>
          <p className="text-xl text-[#2c4a63] italic leading-relaxed">
            "{edificadoData?.beliefsHighlight || "Acreditamos que casamentos fortes constroem sociedades fortes."}"
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-[#f7fafd]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black font-serif text-primary-dark mb-4">No que Acreditamos</h2>
            <div className="w-24 h-1 bg-primary-base mx-auto rounded-full"></div>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {displayBeliefs.map((belief: any, idx: number) => {
              let Icon = Heart;
              if (idx === 1) Icon = GraduationCap;
              if (idx === 2) Icon = Users;

              return (
                <div
                  key={belief.id || idx}
                  className="bg-white p-8 rounded-2xl border border-[#e2eaf3] text-center hover:shadow-lg transition-all group flex flex-col items-center"
                >
                  {belief.image ? (
                    <div className="w-full h-40 mb-6 overflow-hidden rounded-xl bg-gray-50 flex items-center justify-center">
                      <img
                        src={belief.image}
                        alt={belief.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-[#f7fafd] mx-auto rounded-full flex items-center justify-center mb-6 border border-[#c8d8e8] group-hover:scale-110 transition-transform text-primary-base">
                      <Icon size={32} />
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-primary-dark mb-4 group-hover:text-primary-base transition-colors">
                    {belief.title}
                  </h3>
                  <p className="text-[#2c4a63] leading-relaxed">
                    {belief.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Courses Section Integrated */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black font-serif text-primary-dark mb-4">
              {edificadoData?.cursosSectionTitle || "Nossos Treinamentos"}
            </h2>
            <p className="text-[#2c4a63] max-w-2xl mx-auto italic">
              {edificadoData?.cursosSectionSubtitle || "Conheça nossas formações e mentoriais disponíveis."}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coursesList.map((curso: any, idx: number) => (
              <motion.div
                key={curso.id || idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-10 rounded-[14px] shadow-[0_4px_28px_rgba(0,0,0,0.10)] border border-[#e2eaf3] hover:shadow-[0_8px_30px_rgba(30,105,155,0.15)] transition-all duration-300 flex flex-col relative group"
              >
                <Link to={`/cursos/detalhes/${encodeURIComponent(curso.title)}`} className="absolute inset-0 z-10 rounded-[14px]" />
                {curso.badge && (
                  <div className="absolute top-8 right-8 bg-primary-base text-white text-[10px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-full shadow-sm z-20">
                    {curso.badge}
                  </div>
                )}
                {curso.image ? (
                  <div className="mb-6 w-full aspect-[2/3] overflow-hidden rounded-[14px] bg-gray-50 flex items-center justify-center shadow-inner">
                    <img
                      src={curso.image}
                      alt={curso.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ) : (
                  <div className="mb-8 w-14 h-14 bg-[#f7fafd] rounded-full flex items-center justify-center border border-[#c8d8e8] group-hover:scale-110 transition-transform">
                    {renderIcon(curso.iconName)}
                  </div>
                )}
                <h3 className="text-2xl text-primary-dark font-bold mb-6 font-serif break-words">
                  {curso.title}
                </h3>
                <p className="text-[#2c4a63] leading-relaxed mb-10 flex-grow italic relative z-20 pointer-events-none break-all sm:break-words overflow-hidden">
                  "{curso.description || curso.desc}"
                </p>
                <div className="flex flex-col gap-3 w-full mt-auto relative z-30">
                  <Link
                    to={`/cursos/detalhes/${encodeURIComponent(curso.title)}`}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-primary-base text-white border-2 border-primary-base rounded-xl font-bold hover:bg-[#154f77] hover:border-[#154f77] transition-colors text-center shadow-sm"
                  >
                    Ver Detalhes
                  </Link>
                  {hasGlobalAccess && (
                    <Link
                      to={`/dashboard/global-content?tab=cursos&editCourse=${encodeURIComponent(curso.title)}`}
                      className="w-full flex items-center justify-center gap-2 px-6 py-2.5 bg-yellow-400 text-primary-dark rounded-xl font-bold hover:bg-yellow-500 transition-colors text-center text-xs shadow-sm border border-yellow-300"
                    >
                      <Settings size={14} /> Editar (Admin)
                    </Link>
                  )}
                  <button
                    onClick={() => setSelectedCourse(curso.title)}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-white border-2 border-[#1a6496]/20 text-[#1a6496] rounded-xl font-bold hover:bg-[#1a6496]/5 transition-colors cursor-pointer"
                  >
                    Quero Me Matricular <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      <section className="py-20 bg-primary-base text-white text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold font-serif mb-8 leading-tight">
            {edificadoData?.ctaTitle || "Interessado em saber mais sobre o treinamento?"}
          </h2>
          <Link
            to="/contato"
            className="inline-flex items-center justify-center px-10 py-4 bg-white text-primary-base font-bold rounded-full text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
          >
            {edificadoData?.ctaButtonText || "Fale Conosco"}
          </Link>
        </div>
      </section>

      <CourseRegistrationModal
        courseTitle={selectedCourse || ""}
        isOpen={!!selectedCourse}
        onClose={() => setSelectedCourse(null)}
      />
    </div>
  );
}
