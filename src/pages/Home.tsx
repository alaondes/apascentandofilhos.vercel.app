import { useState, useEffect } from "react";
import {
  Heart,
  GraduationCap,
  Users,
  ChevronRight,
  Settings,
  BookOpen,
  Globe,
  Play,
  ChevronLeft,
  X,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  ArrowLeft,
  ArrowRight,
  Copy,
  Smartphone,
  MonitorPlay,
  Ticket,
  Search,
  Bell,
  SkipBack,
  PlayCircle,
  SkipForward,
  Calendar,
  MessageCircle,
  MoreVertical,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import {
  doc,
  getDoc,
  getDocs,
  query,
  collection,
  where,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import CourseRegistrationModal from "../components/CourseRegistrationModal";
import { useFirebase } from "../context/FirebaseContext";

const heroImages = [
  {
    url: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&q=80&w=2070",
    title: "Edificado Matrimônio",
    subtitle:
      "O treinamento fundamental focado nos alicerces bíblicos para o matrimônio",
  },
  {
    url: "https://images.unsplash.com/photo-1484665754804-74b091211472?auto=format&fit=crop&q=80&w=2070",
    title: "Apascentando Filhos",
    subtitle:
      "Mentoria estratégica com ferramentas práticas para guiar e instruir seus filhos",
  },
  {
    url: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=2070",
    title: "Alcançando a Liberdade Financeira",
    subtitle:
      "Alinhamento financeiro do casal para prosperar em unidade dentro do lar",
  },
];

const _videos = [
  {
    id: "v1",
    title: "Identidade Visual da Temática IELB 2023-2026",
    thumbnail:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    id: "v2",
    title: "2013 - CPT 04 - Política e Religião",
    thumbnail:
      "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=600&auto=format&fit=crop",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    id: "v3",
    title: "Vivendo em Cristo - Confirmados na Fé em Cristo",
    thumbnail:
      "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?q=80&w=600&auto=format&fit=crop",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    id: "v4",
    title: "VIVENDO EM CRISTO | Canção tema do quadriênio 2023-2026",
    thumbnail:
      "https://images.unsplash.com/photo-1438283173091-5dbf5c5a3206?q=80&w=600&auto=format&fit=crop",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    id: "v5",
    title: "Edificado Matrimônio - Teaser Oficial",
    thumbnail:
      "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=600&auto=format&fit=crop",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
];

const _bloggers = [
  {
    img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&h=400&auto=format&fit=crop",
    name: "Bispo Macedo",
  },
  {
    img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&h=400&auto=format&fit=crop",
    name: "Ester Bezerra",
  },
  {
    img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&h=400&auto=format&fit=crop",
    name: "Cristiane Cardoso",
  },
  {
    img: "https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=400&h=400&auto=format&fit=crop",
    name: "Renato Cardoso",
  },
  {
    img: "https://images.unsplash.com/photo-1598550874175-4d0ef43ee90d?q=80&w=400&h=400&auto=format&fit=crop",
    name: "Núbia Siqueira",
  },
  {
    img: "https://images.unsplash.com/photo-1593104547489-5cfb3839a3b5?q=80&w=400&h=400&auto=format&fit=crop",
    name: "Viviane Freitas",
  },
];

const _missionImages = [
  "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1593113565694-c6c71f4ed6cb?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1627844642677-8b3d6810a4db?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1473649085228-583485e6e4d7?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=600&auto=format&fit=crop",
];

export default function Home({
  hideHero = false,
  useEdificadoSlides = false,
}: {
  hideHero?: boolean;
  useEdificadoSlides?: boolean;
} = {}) {
  const { user, profile } = useFirebase();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [videoScrollPos, setVideoScrollPos] = useState(0);
  const [homeData, setHomeData] = useState<any>(null);
  const [edificadoData, setEdificadoData] = useState<any>(null);
  const [coursesData, setCoursesData] = useState<any>(null);
  const [latestArtigos, setLatestArtigos] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [youtubeVideos, setYoutubeVideos] = useState<any[]>([]);

  useEffect(() => {
    if (homeData?.youtubeChannelId) {
      const fetchYoutubeVideos = async () => {
        try {
          const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=https://www.youtube.com/feeds/videos.xml?channel_id=${homeData.youtubeChannelId}`);
          const data = await response.json();
          if (data?.status === 'ok' && data.items) {
            const formatted = data.items.map((item: any) => ({
              id: item.guid,
              title: item.title,
              url: item.link.replace('watch?v=', 'embed/'),
              thumbnail: item.thumbnail
            }));
            setYoutubeVideos(formatted);
          }
        } catch (error) {
          console.error("Error fetching latest youtube videos: ", error);
        }
      };
      fetchYoutubeVideos();
    } else {
      setYoutubeVideos([]);
    }
  }, [homeData?.youtubeChannelId]);

  const isGlobalAdmin =
    profile?.role === "admin" || user?.email === "alaondez@gmail.com";
  const isEditor = profile?.role === "editor";
  const hasGlobalAccess = isGlobalAdmin || isEditor;

  const formatUrl = (url: string | undefined) => {
    if (!url) return "#";
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/") || url.startsWith("#")) return url;
    return `https://${url}`;
  };

  useEffect(() => {
    setIsDataLoading(true);
    let loadedCount = 0;
    const checkLoaded = () => {
      loadedCount++;
      if (loadedCount >= 4) setIsDataLoading(false);
    };

    const unsubHome = onSnapshot(doc(db, "content", "home"), (snap) => {
      if (snap.exists()) setHomeData(snap.data());
      else setHomeData({});
      checkLoaded();
    });

    const unsubEdif = onSnapshot(doc(db, "content", "edificado_matrimonio"), (snap) => {
      if (snap.exists()) setEdificadoData(snap.data());
      else setEdificadoData({});
      checkLoaded();
    });

    const unsubCursos = onSnapshot(doc(db, "content", "cursos"), (snap) => {
      if (snap.exists()) setCoursesData(snap.data());
      else setCoursesData({});
      checkLoaded();
    });

    const q = query(
      collection(db, "artigos"),
      where("status", "==", "publicado"),
      orderBy("createdAt", "desc"),
      limit(3)
    );
    const unsubArtigos = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setLatestArtigos(data);
      checkLoaded();
    }, (error) => {
      console.error("Erro ao buscar últimos artigos:", error);
      checkLoaded();
    });

    return () => {
      unsubHome();
      unsubEdif();
      unsubCursos();
      unsubArtigos();
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const slidesCount = displaySlides.length;
      if (slidesCount > 0) {
        setCurrentSlide((prev) => (prev + 1) % slidesCount);
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [edificadoData]);

  // Auto-scroll videos
  useEffect(() => {
    const el = document.getElementById("videos-container");
    if (!el) return;

    let isPaused = false;
    const handleEnter = () => (isPaused = true);
    const handleLeave = () => (isPaused = false);

    el.addEventListener("mouseenter", handleEnter);
    el.addEventListener("mouseleave", handleLeave);
    el.addEventListener("touchstart", handleEnter);
    el.addEventListener("touchend", handleLeave);

    const timer = setInterval(() => {
      if (!isPaused && el) {
        if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 10) {
          el.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          el.scrollBy({ left: 320, behavior: "smooth" });
        }
      }
    }, 4000);

    return () => {
      clearInterval(timer);
      el.removeEventListener("mouseenter", handleEnter);
      el.removeEventListener("mouseleave", handleLeave);
      el.removeEventListener("touchstart", handleEnter);
      el.removeEventListener("touchend", handleLeave);
    };
  }, [homeData?.videos]);

  // Garantir dados padrão caso o Firestore não tenha slides
  const currentSlidesSource = useEdificadoSlides
    ? edificadoData?.slides
    : homeData?.slides;
  const displaySlides = currentSlidesSource || [];

  const displayBeliefsTitle =
    edificadoData?.beliefsTitle || "No que Acreditamos!";
  const displayBeliefsHighlight =
    edificadoData?.beliefsHighlight ||
    "Acreditamos que casamentos fortes constroem sociedades fortes.";
  const displayCoursesTitle = homeData?.coursesTitle || "Cursos e Treinamentos";
  const displayCoursesSubtitle =
    homeData?.coursesSubtitle ||
    "Oferecemos trilhas de aprendizado específicas para cada momento da sua vida familiar.";

  // Garantir dados padrão caso o Firestore não tenha crenças
  const displayBeliefs = edificadoData?.beliefs || [];

  const homeCoursesList = homeData?.courses || [];
  const globalCoursesList = coursesData?.cursos || [];

  // Combinar listas: cursos criados/editados no painel global ("cursos") vêm sempre em primeiro, com os mais recentes primeiro
  const displayCoursesAll: any[] = [];
  const seenTitles = new Set<string>();

  // Adicionar os cursos criados no painel global ("cursos") vêm sempre em primeiro, mantendo a ordem do painel (mais novos no topo)
  globalCoursesList.forEach((c: any) => {
    if (c && c.title) {
      const normalizedTitle = c.title.trim().toLowerCase();
      if (!seenTitles.has(normalizedTitle)) {
        displayCoursesAll.push(c);
        seenTitles.add(normalizedTitle);
      }
    }
  });

  homeCoursesList.forEach((c: any) => {
    if (c && c.title) {
      const normalizedTitle = c.title.trim().toLowerCase();
      if (!seenTitles.has(normalizedTitle)) {
        displayCoursesAll.push(c);
        seenTitles.add(normalizedTitle);
      }
    }
  });

  // Ordenar para garantir que todos os cursos fixados (isPinned: true) fiquem no início da lista
  const sortedDisplayCoursesAll = [
    ...displayCoursesAll.filter((c: any) => c.isPinned === true),
    ...displayCoursesAll.filter((c: any) => c.isPinned !== true),
  ];

  // Mostrar apenas os 3 primeiros cursos na página inicial (onde os fixados têm prioridade)
  const displayCourses = sortedDisplayCoursesAll.slice(0, 3);
  const displayCtaTitle =
    homeData?.ctaTitle || "Pronto para dar o próximo passo na sua família?";
  const displayCtaDescription =
    homeData?.ctaDescription ||
    "Existem centenas de grupos ativos esperando por você. Encontre apoio e ferramentas para uma vida plena em Jesus.";
  const displayCtaButtonText =
    homeData?.ctaButtonText || "Encontre um Grupo Perto de Você";

  const {
    generosityBadge = "",
    generosityTitle1 = "",
    generosityTitle2 = "",
    generositySubtitle = "",
    generosityPixTitle = "",
    generosityPixSubtitle = "",
    generosityPixKey = "",
    generosityOtherFormsTitle = "",
    generosityOtherFormsSubtitle = "",
    generosityOtherFormsBtnText = "",
    generosityOtherFormsBtnLink = "",
    appDownloadBgColor = "",
    appDownloadTitle = "",
    appDownloadFeature1 = "",
    appDownloadFeature2 = "",
    appDownloadFeature3 = "",
    appDownloadFeature4 = "",
    appDownloadPlayStoreUrl = "",
    appDownloadAppStoreUrl = "",
    appDownloadImage = "",
  } = homeData || {};
  const displayBloggers = homeData?.bloggers || [];

  if (isDataLoading) {
    return (
      <div className="flex bg-[#f2f4f7] items-center justify-center min-h-screen">
        <div className="animate-spin w-10 h-10 border-4 border-[#0c2d48] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section */}
      {!hideHero && (
        <section className="relative h-[90vh] min-h-[600px] overflow-hidden bg-primary-dark">
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
                  src={displaySlides[currentSlide]?.url || undefined}
                  alt="Hero"
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6">
                <motion.h1
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="text-4xl md:text-6xl lg:text-7xl text-white font-serif font-black tracking-wide max-w-4xl leading-tight drop-shadow-xl"
                >
                  {displaySlides[currentSlide]?.title}
                </motion.h1>
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="text-lg md:text-xl text-white/90 mt-6 max-w-2xl italic drop-shadow-md font-medium"
                >
                  {displaySlides[currentSlide]?.subtitle}
                </motion.p>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                  className="mt-10 flex flex-wrap justify-center gap-4"
                >
                  <Link
                    to={displaySlides[currentSlide]?.button1Link || "/cursos"}
                    className="px-8 py-4 rounded-full bg-primary-base hover:bg-primary-dark text-white font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                  >
                    {displaySlides[currentSlide]?.button1Text ||
                      "Nossos Cursos"}
                  </Link>
                  <Link
                    to={
                      displaySlides[currentSlide]?.button2Link || "/quem-somos"
                    }
                    className="px-8 py-4 border-2 border-white text-white rounded-full font-bold transition-all hover:bg-white/10 text-center hover:-translate-y-1"
                  >
                    {displaySlides[currentSlide]?.button2Text || "Saiba Mais"}
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Slide Indicators */}
          <div className="absolute bottom-10 left-0 right-0 z-30 flex justify-center gap-3">
            {displaySlides.map((_: any, idx: number) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-12 h-1 rounded-full transition-all ${
                  currentSlide === idx ? "bg-white" : "bg-white/30"
                }`}
              />
            ))}
          </div>
        </section>
      )}

      {/* Colunistas Section */}
      <section className="bg-[#fafbfb] py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div className="relative">
              <h1 className="text-3xl font-extrabold text-[#112a40] tracking-tight">
                Nossos{" "}
                <span className="text-[#112a40]">Colunistas</span>
              </h1>
              <div className="absolute -bottom-2 left-0 w-12 h-1 bg-red-600"></div>
            </div>

            <div className="flex items-center gap-4">
              <button
                className="text-[#1b3d5b] hover:text-[#0b1c2b] transition-colors"
                aria-label="Anterior"
                onClick={() => {
                  const el = document.getElementById("bloggers-container");
                  if (el) el.scrollBy({ left: -220, behavior: "smooth" });
                }}
              >
                <ArrowLeft size={24} />
              </button>
              <button
                className="text-[#1b3d5b] hover:text-[#0b1c2b] transition-colors"
                aria-label="Próximo"
                onClick={() => {
                  const el = document.getElementById("bloggers-container");
                  if (el) el.scrollBy({ left: 220, behavior: "smooth" });
                }}
              >
                <ArrowRight size={24} />
              </button>
            </div>
          </div>

          <div
            id="bloggers-container"
            className="flex overflow-x-auto gap-6 pb-6 snap-x snap-mandatory scrollbar-hide pt-4"
            style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
          >
            {displayBloggers.map((blogger: any, idx: number) => {
              const bloggerSlug = (blogger.name || "colunista").toLowerCase().trim().replace(/ /g, "-");
              return (
                <div
                  key={`${blogger.id || blogger.name || 'blogger'}-${idx}-${blogger.img?.substring(0, 30)}`}
                  className="snap-start shrink-0 w-[180px] min-w-[180px] flex flex-col group cursor-pointer"
                >
                  <Link
                    to={`/colunista/${bloggerSlug}`}
                    className="w-[180px] h-[180px] rounded-2xl overflow-hidden mb-4 shadow-sm group-hover:shadow-md transition-shadow relative block"
                  >
                    <img
                      src={blogger.img || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&h=400&auto=format&fit=crop"}
                      alt={blogger.name || "Colunista"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                  </Link>
                  <h3 className="text-[#1b3d5b] font-bold text-[15px] mb-3 break-words line-clamp-2">
                    <Link
                      to={`/colunista/${bloggerSlug}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {blogger.name || "Colunista sem nome"}
                    </Link>
                  </h3>
                  <div className="flex items-center gap-2">
                  {blogger.facebook && (
                    <a
                      href={blogger.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-6 h-6 rounded-full bg-[#1877F2] flex items-center justify-center text-white hover:bg-[#0d65d9] transition-colors"
                    >
                      <Facebook size={12} fill="currentColor" strokeWidth={0} />
                    </a>
                  )}
                  {blogger.instagram && (
                    <a
                      href={blogger.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-6 h-6 rounded-full bg-[#E4405F] flex items-center justify-center text-white hover:bg-[#d62976] transition-colors"
                    >
                      <Instagram size={12} />
                    </a>
                  )}
                  {blogger.twitter && (
                    <a
                      href={blogger.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-6 h-6 rounded-full bg-[#1DA1F2] flex items-center justify-center text-white hover:bg-[#0c85d0] transition-colors"
                    >
                      <Twitter size={12} fill="currentColor" strokeWidth={0} />
                    </a>
                  )}
                  {blogger.youtube && (
                    <a
                      href={blogger.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-6 h-6 rounded-full bg-[#FF0000] flex items-center justify-center text-white hover:bg-[#cc0000] transition-colors"
                    >
                      <Youtube size={12} fill="currentColor" strokeWidth={0} />
                    </a>
                  )}
                  {!blogger.facebook &&
                    !blogger.instagram &&
                    !blogger.twitter &&
                    !blogger.youtube && (
                      <>
                        <a
                          href="#"
                          className="w-6 h-6 rounded-full bg-[#407bf6] flex items-center justify-center text-white hover:bg-[#205de6] transition-colors"
                        >
                          <Facebook
                            size={12}
                            fill="currentColor"
                            strokeWidth={0}
                          />
                        </a>
                        <a
                          href="#"
                          className="w-6 h-6 rounded-full bg-[#407bf6] flex items-center justify-center text-white hover:bg-[#205de6] transition-colors"
                        >
                          <Instagram size={12} />
                        </a>
                        <a
                          href="#"
                          className="w-6 h-6 rounded-full bg-[#407bf6] flex items-center justify-center text-white hover:bg-[#205de6] transition-colors"
                        >
                          <Twitter
                            size={12}
                            fill="currentColor"
                            strokeWidth={0}
                          />
                        </a>
                        <a
                          href="#"
                          className="w-6 h-6 rounded-full bg-[#407bf6] flex items-center justify-center text-white hover:bg-[#205de6] transition-colors"
                        >
                          <Youtube
                            size={12}
                            fill="currentColor"
                            strokeWidth={0}
                          />
                        </a>
                      </>
                    )}
                </div>
              </div>
            );
          })}
        </div>
        </div>
      </section>

      {/* Blogs Section */}
      <section className="bg-[#e9e9e9] py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center mb-8">
            <h2 className="text-3xl font-extrabold text-[#2a2a2a]">{homeData?.newsTitle || "Blogs e Colunas"}</h2>
            <div className="flex-grow h-px bg-[#8a8a8a] mx-6"></div>
            <button 
              onClick={() => window.location.href = homeData?.olderNewsButtonLink || '/noticias'}
              className="px-6 py-2.5 bg-[#1e3a8a] text-white text-sm font-bold rounded-full hover:bg-[#152c6f] transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap"
            >
              {homeData?.olderNewsButtonText || "Ver Notícias Antigas"} <ChevronRight size={16} />
            </button>
          </div>

          {(!homeData) ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Fallback to original hardcoded content if no config found */}
              <div className="lg:col-span-2 relative rounded-xl overflow-hidden group cursor-pointer aspect-video">
                <img
                  src="https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=1200&auto=format&fit=crop"
                  alt="O amor colocado à prova"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent mix-blend-multiply"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center gap-2 text-white mb-2">
                    <Play size={18} className="fill-white" />
                    <span className="text-sm font-bold">Acesse o Blog</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                    Conteúdo Edificante para sua Família
                  </h3>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div className="relative rounded-xl overflow-hidden group cursor-pointer aspect-video">
                  <img
                    src="https://images.unsplash.com/photo-1438283173091-5dbf5c5a3206?q=80&w=600&auto=format&fit=crop"
                    alt="Culto ConexCena"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent mix-blend-multiply"></div>
                </div>

                <div className="relative rounded-xl overflow-hidden group cursor-pointer aspect-video">
                  <img
                    src="https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=600&auto=format&fit=crop"
                    alt="Presença de Deus + Família"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent mix-blend-multiply"></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Configured News */}
              {homeData.newsItems[0] && homeData.newsItems[0].title && (
                <a
                  href={formatUrl(homeData.newsItems[0].linkUrl)}
                  target={formatUrl(homeData.newsItems[0].linkUrl).startsWith("http") ? "_blank" : undefined}
                  className="lg:col-span-2 relative rounded-xl overflow-hidden group cursor-pointer aspect-[16/10] sm:aspect-video lg:aspect-auto lg:h-full shadow-lg bg-black block"
                >
                  <div className="absolute inset-0 z-0">
                    {homeData.newsItems[0].imageUrl ? (
                      <img src={homeData.newsItems[0].imageUrl} alt={homeData.newsItems[0].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full bg-[#1c1815]"></div>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none z-0"></div>
                  
                  <div className="absolute bottom-6 left-6 right-6 z-10 pointer-events-none flex flex-col items-start gap-2">
                    <h3 className="text-white text-2xl md:text-3xl lg:text-4xl font-extrabold leading-snug drop-shadow-lg">
                      {homeData.newsItems[0].title}
                    </h3>
                    
                    {homeData.newsItems[0].description && (
                      <p className="text-white/90 text-sm md:text-base font-medium drop-shadow-md line-clamp-2 max-w-3xl">
                        {homeData.newsItems[0].description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-3 text-white mt-1">
                      {homeData.newsItems[0].category && (
                        <span className="text-[10px] font-black uppercase tracking-widest text-white bg-red-600 px-2 py-1 rounded">
                          {homeData.newsItems[0].category}
                        </span>
                      )}
                      <span className="text-xs font-bold opacity-90 drop-shadow-md">
                        {homeData.newsItems[0].date}
                      </span>
                      {homeData.newsItems[0].credits && (
                        <span className="text-xs font-medium opacity-80 border-l border-white/50 pl-3 drop-shadow-md">
                          Fonte: {homeData.newsItems[0].credits}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 text-white bg-[#701620] hover:bg-[#851b27] px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 pointer-events-auto transition shadow-lg">
                      Leia mais <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </a>
              )}

              {/* Side Configured News */}
              <div className="flex flex-col gap-6">
                {[1, 2].map((idx) => {
                  const news = homeData.newsItems[idx];
                  if (!news || (!news.title && !news.imageUrl)) {
                    return (
                      <div key={`empty-${idx}`} className="relative rounded-xl overflow-hidden aspect-[16/10] sm:aspect-video flex-1 border-2 border-dashed border-gray-300 bg-gray-100/50 flex flex-col items-center justify-center opacity-70">
                        <span className="text-gray-400 font-medium text-sm">Espaço para novas publicações</span>
                      </div>
                    );
                  }
                  return (
                    <a
                      key={idx}
                      href={formatUrl(news.linkUrl)}
                      target={formatUrl(news.linkUrl).startsWith("http") ? "_blank" : undefined}
                      className="relative rounded-xl overflow-hidden group cursor-pointer aspect-[16/10] sm:aspect-video flex-1 shadow-md bg-black block"
                    >
                      <div className="absolute inset-0 z-0">
                        {news.imageUrl ? (
                          <img src={news.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={news.title || ""} />
                        ) : (
                          <div className="w-full h-full bg-[#1c1815]"></div>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none z-0"></div>
                      
                      <div className="absolute bottom-4 left-4 right-4 z-10 pointer-events-none flex flex-col items-start gap-1">
                        {news.title && (
                          <h3 className="text-lg md:text-xl font-bold text-white leading-tight line-clamp-3 drop-shadow-md">
                            {news.title}
                          </h3>
                        )}
                        {news.description && (
                          <p className="text-white/80 text-xs line-clamp-2 drop-shadow-md mb-1">
                            {news.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-white w-full">
                          {news.category && (
                            <span className="text-[9px] font-black uppercase tracking-widest text-white bg-red-600 px-2 py-1 rounded">
                              {news.category}
                            </span>
                          )}
                          <span className="text-[10px] font-bold opacity-90 drop-shadow-md">
                            {news.date}
                          </span>
                          {news.credits && (
                            <span className="text-[10px] font-medium opacity-80 border-l border-white/50 pl-2 drop-shadow-md">
                              Fonte: {news.credits}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center text-white bg-[#701620]/80 rounded-full px-3 py-1 mt-1 text-xs font-bold gap-1 group-hover:bg-[#851b27] transition-colors pointer-events-auto">
                          Leia mais <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </section>

      {/* Videos Section */}
      <section className="bg-[#fafbfb] py-16 border-t border-[#e2eaf3] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Culto Ao Vivo / Featured Video */}
          <div className="mb-16 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-stretch">
            <div className="flex flex-col justify-between lg:col-span-5 py-2">
              <div className="space-y-6">
                <h2 className="text-5xl md:text-7xl font-black text-[#2a2a2a] tracking-tighter leading-tight">
                  {homeData?.liveStreamTitle || "Ao vivo"}
                  <span className="text-[#a42b2b]">.</span>
                </h2>
                
                <div className="text-lg md:text-xl font-light text-gray-500 space-y-4">
                  {homeData?.liveStreamDescription ? (
                    <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{__html: homeData.liveStreamDescription}}></div>
                  ) : (
                    <>
                      <p>Você pode acompanhar as transmissões<br/>da nossa Igreja pelo <strong>canal 31.1</strong></p>
                      <p>Caso prefira, você pode acessar<br/>e ouvir os sermões no <strong>Spotify!</strong></p>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col gap-3 pt-6 items-start mt-auto">
                {(homeData?.liveStreamBtn1Text && homeData?.liveStreamBtn1Url) && (
                  <a href={homeData.liveStreamBtn1Url} target="_blank" rel="noreferrer" className="px-6 py-3 bg-primary-base text-white rounded-full font-medium hover:bg-primary-dark transition-colors shadow-sm text-sm">
                    {homeData.liveStreamBtn1Text}
                  </a>
                )}
                {(homeData?.liveStreamBtn2Text && homeData?.liveStreamBtn2Url) && (
                  <a href={homeData.liveStreamBtn2Url} target="_blank" rel="noreferrer" className="px-6 py-3 bg-primary-base text-white rounded-full font-medium hover:bg-primary-dark transition-colors shadow-sm text-sm">
                    {homeData.liveStreamBtn2Text}
                  </a>
                )}
                {(homeData?.liveStreamBtn3Text && homeData?.liveStreamBtn3Url) && (
                  <a href={homeData.liveStreamBtn3Url} target="_blank" rel="noreferrer" className="px-6 py-3 bg-primary-base text-white rounded-full font-medium hover:bg-primary-dark transition-colors shadow-sm text-sm">
                    {homeData.liveStreamBtn3Text}
                  </a>
                )}
                
                {(!homeData?.liveStreamBtn1Text && !homeData?.liveStreamBtn2Text && !homeData?.liveStreamBtn3Text) && null}
              </div>
            </div>
            
            <div 
              className="lg:col-span-7 w-full h-full min-h-[300px] bg-black rounded-2xl overflow-hidden shadow-2xl relative group cursor-pointer"
              onClick={() => setSelectedVideo(homeData?.liveStreamUrl || "https://www.youtube.com/embed/jNQXAC9IVRw")}
            >
              {(() => {
                let url = homeData?.liveStreamUrl || "https://www.youtube.com/embed/jNQXAC9IVRw";
                let videoId = "";
                try {
                  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
                  if (match && match[1]) {
                    videoId = match[1];
                  }
                } catch (e) {
                  console.error("Error formatting youtube url", e);
                }
                
                if (videoId) {
                  return (
                    <>
                      <img 
                        src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`} 
                        alt={homeData?.liveStreamTitle || "Culto ao Vivo"}
                        className="w-full h-full absolute inset-0 object-cover transition-transform duration-500 group-hover:scale-105" 
                        onError={(e) => {
                          if (e.currentTarget.src.includes('maxresdefault')) {
                            e.currentTarget.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity group-hover:bg-black/40">
                        <div className="w-20 h-20 bg-primary-base rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(48,51,135,0.4)] backdrop-blur-sm group-hover:scale-110 transition-transform">
                          <Play size={32} className="text-white ml-2" fill="currentColor" />
                        </div>
                      </div>
                    </>
                  );
                }
                
                return (
                  <iframe
                    src={(() => {
                      try {
                        if (url.includes("youtube.com/embed/")) {
                          const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
                          const id = urlObj.pathname.split("/embed/")[1];
                          urlObj.searchParams.set('autoplay', '1');
                          urlObj.searchParams.set('mute', '1');
                          urlObj.searchParams.set('loop', '1');
                          urlObj.searchParams.set('playlist', id);
                          urlObj.searchParams.set('controls', '0');
                          return urlObj.toString();
                        }
                      } catch (e) {
                        console.error("Error formatting youtube url", e);
                      }
                      return url;
                    })()}
                    title={homeData?.liveStreamTitle || "Culto ao Vivo"}
                    className="w-full h-full absolute inset-0 border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                );
              })()}
            </div>
          </div>

          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-[#303387] tracking-tight">
              {homeData?.videosTitle || "VÍDEOS"}
            </h2>
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  className="w-10 h-10 bg-[#303387] text-white flex items-center justify-center hover:bg-[#25286a] transition-colors"
                  aria-label="Anterior"
                  onClick={() => {
                    const el = document.getElementById("videos-container");
                    if (el) el.scrollBy({ left: -320, behavior: "smooth" });
                  }}
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  className="w-10 h-10 bg-[#303387] text-white flex items-center justify-center hover:bg-[#25286a] transition-colors"
                  aria-label="Próximo"
                  onClick={() => {
                    const el = document.getElementById("videos-container");
                    if (el) el.scrollBy({ left: 320, behavior: "smooth" });
                  }}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
              {homeData?.videosButtonLink ? (
                <a href={homeData.videosButtonLink} className="px-6 py-2.5 bg-[#303387] text-white text-sm font-bold tracking-wider hover:bg-[#25286a] transition-colors inline-block">
                  {homeData?.videosButtonText || "VER MAIS"}
                </a>
              ) : (
                <button className="px-6 py-2.5 bg-[#303387] text-white text-sm font-bold tracking-wider hover:bg-[#25286a] transition-colors">
                  {homeData?.videosButtonText || "VER MAIS"}
                </button>
              )}
            </div>
          </div>

          <div
            id="videos-container"
            className="flex overflow-x-auto gap-6 pb-6 snap-x snap-mandatory scrollbar-hide"
            style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
          >
            {((homeData?.youtubeChannelId && youtubeVideos.length > 0) 
              ? youtubeVideos 
              : ((homeData !== null) ? (homeData.videos || []) : _videos)).map((vid: any, idx: number) => {
              let displayThumbnail = vid.thumbnail;
              if (!displayThumbnail && vid.url) {
                const match = vid.url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
                if (match && match[1]) {
                  displayThumbnail = `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
                }
              }
              return (
              <div
                key={vid.id || idx}
                className="snap-start shrink-0 w-[280px] md:w-[320px] group cursor-pointer"
                onClick={() => setSelectedVideo(vid.url)}
              >
                <div className="relative w-full aspect-video bg-black mb-4 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <img
                    src={displayThumbnail || undefined}
                    referrerPolicy="no-referrer"
                    alt={vid.title}
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-300"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Play
                      size={48}
                      className="text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all drop-shadow-md fill-white"
                    />
                  </div>
                </div>
                <h3 className="text-[#1e293b] font-medium leading-snug line-clamp-2">
                  {vid.title}
                </h3>
              </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="bg-[#f0f2f5] py-20 border-t border-[#e2eaf3] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-primary-dark tracking-wide font-serif">
              NOSSOS EVENTOS
            </h2>
          </div>

          <div className="flex overflow-x-auto pb-8 -mx-6 px-6 md:mx-0 md:px-0 md:grid md:grid-cols-5 gap-4 lg:gap-6 snap-x snap-mandatory scrollbar-hide">
            {(homeData !== null) ? (
              homeData.eventos.map((evt: any, idx: number) => {
                const bgColor = evt.theme === "brown" ? "#5d4633" : (evt.theme || "#5d4633");
                return (
                  <div key={evt.id || idx} className="snap-center shrink-0 w-[260px] md:w-auto h-[400px] rounded-2xl flex flex-col relative overflow-hidden group shadow-md hover:shadow-xl transition-all cursor-pointer" style={{ backgroundColor: bgColor }} onClick={() => evt.linkUrl && window.open(evt.linkUrl, "_blank")}>
                    
                    {evt.imageUrl ? (
                      <>
                        <div className="absolute inset-0 bg-cover bg-center z-0" style={{ backgroundImage: `url('${evt.imageUrl}')` }} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/60 z-10" />
                      </>
                    ) : (
                      <div className="absolute inset-0 z-0" style={{ backgroundColor: bgColor }}>
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/30" />
                      </div>
                    )}

                    <div className="relative z-20 p-6 flex flex-col h-full text-center justify-between">
                      <div className="pt-4">
                        {evt.badge && (
                          <p className="text-[#e2dac6] text-[11px] font-bold mb-4 drop-shadow-md uppercase tracking-[0.15em]">
                            {evt.badge}
                          </p>
                        )}
                        <h3 className="text-white text-2xl font-serif mb-2 leading-snug drop-shadow-lg">
                          {evt.title}
                        </h3>
                        <p className="text-[#e2dac6] text-sm drop-shadow-md">{evt.subtitle}</p>
                      </div>
                      
                      <div className="mt-auto pt-4">
                        <button className="w-full py-3.5 bg-[#e8cda8] hover:bg-[#d6ba94] text-[#5d4633] rounded-full font-bold text-sm transition-colors shadow-lg shadow-black/30">
                          {evt.linkText || "SAIBA MAIS"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <>
                {/* Card 1: EBD */}
                <div className="snap-center shrink-0 w-[260px] md:w-auto h-[400px] bg-gradient-to-b from-[#346dc0] to-[#467fd8] rounded-2xl p-6 flex flex-col items-center justify-between text-center relative overflow-hidden group shadow-md hover:shadow-xl transition-all">
                  <div className="text-white space-y-3 pt-6 flex flex-col items-center">
                    <BookOpen
                      size={48}
                      strokeWidth={1.5}
                      className="mb-2 text-[#aedaff]"
                    />
                    <h3 className="text-5xl font-extrabold tracking-tight text-[#aedaff] leading-none mb-1">
                      EBD
                    </h3>
                    <p className="text-xs font-semibold uppercase tracking-widest opacity-90 mb-4">
                      Escola Bíblica
                      <br />
                      Dominical
                    </p>
                    <p className="text-[15px] font-medium leading-relaxed px-2">
                      Conheça as classes da EBD e faça sua inscrição para o 1º
                      semestre.
                    </p>
                  </div>
                  <button className="w-full py-3.5 bg-[#89cbed] hover:bg-[#72b8df] text-[#1c4b7b] rounded-full font-bold text-sm transition-colors mt-auto shadow-md">
                    Acessar página da EBD
                  </button>
                </div>

                {/* Card 2: Ore pelo missionário */}
                <div className="snap-center shrink-0 w-[260px] md:w-auto h-[400px] rounded-2xl flex flex-col relative overflow-hidden group shadow-md hover:shadow-xl transition-all">
                  <div className="absolute inset-0 bg-gradient-to-b from-[#1b507b] via-[#143d60] to-[#0d2a45] z-0" />
                  <div
                    className="absolute bottom-0 left-0 right-0 h-[60%] z-10 opacity-70"
                    style={{
                      backgroundImage:
                        "url('https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&q=80&w=600')",
                      backgroundSize: "cover",
                      backgroundPosition: "center bottom",
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d2a45] via-transparent to-transparent z-10" />

                  <div className="relative z-20 p-6 flex flex-col items-center text-center h-full pt-8">
                    <h3 className="text-[#a4e0ff] text-2xl font-bold mt-2">
                      Ore pelo
                    </h3>
                    <h4 className="text-white text-3xl font-black mb-1 leading-none tracking-tight">
                      missionário
                    </h4>
                    <p className="text-[#a4e0ff] text-base font-bold">da semana</p>

                    <div className="mt-auto pb-4 flex flex-col items-center">
                      <Globe size={24} className="text-white mb-2 opacity-80" />
                      <p className="text-[10px] text-white font-bold leading-tight uppercase tracking-widest opacity-90">
                        Ministério de
                        <br />
                        MISSÕES
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card 3: Geografia e História Bíblica */}
                <div className="snap-center shrink-0 w-[260px] md:w-auto h-[400px] rounded-2xl flex flex-col relative overflow-hidden group shadow-md hover:shadow-xl transition-all bg-[#3a2d21]">
                  
                  <div className="absolute inset-0 bg-cover bg-center z-0" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1549460592-cd53a633baeb?auto=format&fit=crop&q=80&w=600')" }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/60 z-10" />

                  <div className="relative z-20 p-6 flex flex-col h-full text-center justify-between">
                    <div className="pt-4">
                      <p className="text-[#e2dac6] text-[11px] font-bold mb-4 drop-shadow-md uppercase tracking-[0.15em]">
                        Cursos online Gratuitos
                      </p>
                      <h3 className="text-white text-2xl font-serif mb-2 leading-snug drop-shadow-lg">
                        Geografia e<br />História Bíblica
                      </h3>
                      <p className="text-[#e2dac6] text-sm drop-shadow-md">(Sérgio Horst)</p>
                    </div>
                    <div className="mt-auto pt-4">
                      <button className="w-full py-3.5 bg-[#e8cda8] hover:bg-[#d6ba94] text-[#5d4633] rounded-full font-bold text-sm transition-colors shadow-lg shadow-black/30">
                        ACESSAR CURSO
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card 4: Teologia Bíblica da Família */}
                <div className="snap-center shrink-0 w-[260px] md:w-auto h-[400px] bg-[#071926] rounded-2xl p-6 flex flex-col relative overflow-hidden group shadow-md hover:shadow-xl transition-all">
                  <div className="flex flex-col text-center h-full z-20 relative pt-2">
                    <div className="bg-[#f28627] text-white text-[11px] font-bold py-1.5 px-4 rounded-md inline-block mx-auto mb-6">
                      Cursos Online Gratuitos
                    </div>

                    <h3 className="text-[#f28627] text-sm font-medium tracking-widest uppercase mb-3">
                      Teologia Bíblica da
                    </h3>
                    <h4 className="text-white font-serif text-[28px] tracking-[0.15em] font-light border-y border-white/20 py-3 mb-6">
                      FAMÍLIA
                    </h4>

                    <div className="flex items-center justify-center gap-3 mt-auto mb-8 text-left">
                      <img
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150"
                        alt="Preletor"
                        className="w-12 h-12 rounded-full border-2 border-[#f28627] object-cover"
                      />
                      <div>
                        <p className="text-gray-400 text-xs mb-0.5">Preletor:</p>
                        <p className="text-[#f28627] font-bold text-sm">
                          Pr. Dennis Pires
                        </p>
                      </div>
                    </div>

                    <button className="w-full py-3.5 bg-[#f28627] hover:bg-[#d9751e] text-white rounded-full font-bold text-sm transition-colors mt-auto shadow-lg">
                      ACESSAR CURSO
                    </button>
                  </div>
                </div>

                {/* Card 5: Grupo de Gestantes */}
                <div className="snap-center shrink-0 w-[260px] md:w-auto h-[400px] bg-[#c3e0cf] rounded-2xl p-6 flex flex-col relative overflow-hidden group shadow-md hover:shadow-xl transition-all items-center justify-between text-center">
                  <div className="relative w-44 h-44 mt-4 mb-4 flex items-center justify-center">
                    <div className="absolute inset-0 border-[3px] border-[#41624b] rounded-full opacity-30 border-dashed" />
                    <h3 className="absolute -top-1 bg-[#c3e0cf] text-[#2c4735] font-bold tracking-widest uppercase text-xs px-2 z-10">
                      CRISTÃO
                    </h3>
                    <h3 className="absolute -bottom-1 bg-[#c3e0cf] text-[#2c4735] font-bold tracking-widest uppercase text-xs px-2 z-10">
                      GESTANTES
                    </h3>
                    <div className="absolute rotate-[-90deg] left-[-6px] origin-center z-10 text-[#2c4735] font-bold tracking-widest text-[10px] uppercase bg-[#c3e0cf] px-2 py-0.5">
                      DE
                    </div>
                    <div className="absolute rotate-[90deg] right-[-14px] origin-center z-10 text-[#2c4735] font-bold tracking-widest text-[10px] uppercase bg-[#c3e0cf] px-2 py-0.5">
                      GRUPO
                    </div>
                    <img
                      src="https://images.unsplash.com/photo-1555243896-771a8230238e?auto=format&fit=crop&q=80&w=300"
                      alt="Gestante"
                      className="w-[124px] h-[124px] rounded-full object-cover z-0"
                    />
                  </div>

                  <p className="text-[#355240] text-[12px] font-medium leading-relaxed px-1 mt-auto mx-auto mb-6">
                    Espaço de convivência gratuito criado para casais à espera de
                    seus bebês. Independente do estágio da gravidez, este grupo é
                    pra vocês!
                  </p>

                  <button className="w-full py-3 bg-white hover:bg-gray-50 text-[#355240] rounded-full font-bold text-xs transition-colors shadow-md hover:shadow-lg mt-auto">
                    SAIBA MAIS
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="bg-[#e9e9e9] py-16 flex flex-col items-center">
        <div className="max-w-7xl mx-auto w-full px-6">
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-extrabold text-black tracking-tight leading-none mb-1">
              {homeData?.missionTitle1 || "Amamos a obra"}
            </h2>
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#f25c27] tracking-tight leading-none">
              {homeData?.missionTitle2 || "missionária!"}
            </h2>
          </div>

          <div className="w-full relative group">
            <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-black/50 to-transparent w-16 z-10 flex items-center justify-start px-2 opacity-80 hover:opacity-100 transition-opacity rounded-l-2xl pointer-events-none">
              <button 
                className="text-white bg-black/30 backdrop-blur-sm rounded-full p-1 hover:bg-black/50 hover:scale-105 transition-all shadow-md pointer-events-auto"
                onClick={() => {
                  const el = document.getElementById("mission-slider");
                  if (el) el.scrollBy({ left: -320, behavior: "smooth" });
                }}
                aria-label="Imagem Anterior"
              >
                <ChevronLeft size={28} />
              </button>
            </div>

            <div
              id="mission-slider"
              className="flex w-full overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-2 px-1 py-1"
              style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
            >
              {(homeData?.missionImages || _missionImages).map((item: any, idx: number) => {
                const isString = typeof item === "string";
                const src = isString ? item : item.imageUrl;
                const link = isString ? "" : item.linkUrl;
                
                const title = isString ? "" : item.title;
                
                if (!src) return null;
                
                const wrapperClasses = "snap-start shrink-0 w-[calc(50%-0.25rem)] md:w-[calc(33.333%-0.33rem)] lg:w-[calc(16.666%-0.416rem)] aspect-square relative rounded-xl overflow-hidden shadow-sm group cursor-pointer block hover:shadow-md transition-shadow";

                const content = (
                  <>
                    <img
                      src={src}
                      alt={title || `Missão ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    {title && (
                      <div className="absolute bottom-0 left-0 right-0 p-2 text-white bg-black/40 backdrop-blur-xs translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <p className="text-[10px] font-bold uppercase tracking-wider truncate text-center">{title}</p>
                      </div>
                    )}
                  </>
                );
                
                return link ? (
                  <a key={idx} href={link} target="_blank" rel="noopener noreferrer" className={wrapperClasses}>
                    {content}
                  </a>
                ) : (
                  <div key={idx} className={wrapperClasses}>
                    {content}
                  </div>
                );
              })}
            </div>

            <div className="absolute inset-y-0 right-0 bg-gradient-to-l from-black/50 to-transparent w-16 z-10 flex items-center justify-end px-2 opacity-80 hover:opacity-100 transition-opacity rounded-r-2xl pointer-events-none">
              <button 
                className="text-white bg-black/30 backdrop-blur-sm rounded-full p-1 hover:bg-black/50 hover:scale-105 transition-all shadow-md pointer-events-auto"
                onClick={() => {
                  const el = document.getElementById("mission-slider");
                  if (el) el.scrollBy({ left: 320, behavior: "smooth" });
                }}
                aria-label="Próxima Imagem"
              >
                <ChevronRight size={28} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Generosity Section */}
      <section className="bg-[#fafafa] py-24 px-6 font-sans">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <div className="inline-block px-5 py-1.5 rounded-full bg-[#efefef] text-gray-500 text-[11px] font-bold uppercase tracking-widest mb-8">
            {generosityBadge}
          </div>

          <h2 className="text-4xl md:text-[3.2rem] font-extrabold text-black text-center leading-[1.1] tracking-tight mb-8">
            {generosityTitle1}
            <br />
            {generosityTitle2}
          </h2>

          <p className="text-gray-500 text-lg md:text-[19px] text-center max-w-3xl mb-16 font-light leading-relaxed px-4 whitespace-pre-line">
            {generositySubtitle}
          </p>

          <div className="w-full max-w-4xl bg-white rounded-[1.75rem] p-8 md:p-14 shadow-[0_8px_30px_rgb(0,0,0,0.03)] grid md:grid-cols-2 gap-8 md:gap-16 items-center relative overflow-hidden">
            {/* Background shape */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#fef6e7] rounded-full blur-[64px] origin-top-right -translate-y-12 translate-x-12 z-0 opacity-70"></div>

            {/* Left Column (PIX) */}
            <div className="relative z-10">
              <h3 className="text-[1.75rem] font-bold text-black mb-2 leading-tight">
                {generosityPixTitle}
              </h3>
              <p className="text-gray-500 mb-8 text-[15px]">
                {generosityPixSubtitle}
              </p>

              <div className="relative w-full mb-3">
                <input
                  type="text"
                  readOnly
                  value={generosityPixKey}
                  className="w-full bg-[#fafafa] border border-[#f0f0f0] text-black font-bold rounded-xl py-4 flex items-center px-4 pr-12 focus:outline-none text-[15px]"
                />
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() =>
                    navigator.clipboard.writeText(generosityPixKey)
                  }
                  title="Copiar Chave PIX"
                >
                  <Copy size={20} strokeWidth={1.5} />
                </button>
              </div>
              <p className="text-[11px] text-gray-400 font-medium">
                Clique para copiar a chave
              </p>
            </div>

            {/* Right Column (Outras Formas / Box) */}
            <div className="relative z-10 w-full h-full">
              <div className="bg-[#1f1a17] rounded-2xl p-8 flex flex-col items-center text-center shadow-lg h-full justify-center">
                <div className="mb-4 text-[#f58428]">
                  <Smartphone size={28} strokeWidth={1.5} />
                </div>
                <h3 className="text-white font-bold text-lg mb-3">
                  {generosityOtherFormsTitle}
                </h3>
                <p className="text-gray-400/90 text-[13px] mb-8 leading-relaxed max-w-[240px]">
                  {generosityOtherFormsSubtitle}
                </p>
                <a
                  href={
                    homeData?.generosityOtherFormsBtnLink 
                      ? (!homeData.generosityOtherFormsBtnLink.startsWith('http') && !homeData.generosityOtherFormsBtnLink.startsWith('mailto:') 
                        ? `https://wa.me/${homeData.generosityOtherFormsBtnLink.replace(/\D/g, '')}` 
                        : homeData.generosityOtherFormsBtnLink) 
                      : "#"
                  }
                  target={homeData?.generosityOtherFormsBtnLink && !homeData?.generosityOtherFormsBtnLink.startsWith('mailto:') ? "_blank" : "_self"}
                  rel="noopener noreferrer"
                  className="w-full bg-white text-black font-bold py-3.5 rounded-xl hover:bg-gray-100 transition-colors text-[14px]"
                >
                  {generosityOtherFormsBtnText}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* App Download Section */}
      <section className="pt-16 pb-16 px-6 font-sans overflow-hidden" style={{ backgroundColor: homeData?.appDownloadBgColor || '#7A8C66' }}>
        <div className="max-w-[70rem] mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-8">
          <div className="flex-1 text-white md:pr-10 lg:pl-10">
            <h2 className="text-3xl md:text-[2.2rem] font-bold leading-[1.2] mb-12 max-w-md whitespace-pre-line">
              {appDownloadTitle}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-10 mb-14">
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect
                      x="2"
                      y="3"
                      width="20"
                      height="14"
                      rx="2"
                      ry="2"
                    ></rect>
                    <polygon points="10 8 15 10 10 12 10 8"></polygon>
                    <path d="M8 21h8"></path>
                    <path d="M12 17v4"></path>
                  </svg>
                </div>
                <div>
                  <h4 className="text-[16px] leading-tight mb-2 whitespace-pre-line">
                    {appDownloadFeature1}
                  </h4>
                  <div className="w-4 h-[2px] bg-white mt-3"></div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-1">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
                    <path d="M8 7h8"></path>
                    <path d="M12 4v7"></path>
                  </svg>
                </div>
                <div>
                  <h4 className="text-[16px] leading-tight mb-2 whitespace-pre-line">
                    {appDownloadFeature2}
                  </h4>
                  <div className="w-4 h-[2px] bg-white mt-3"></div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-1">
                  <Heart size={32} strokeWidth={1.5} fill="currentColor" />
                </div>
                <div>
                  <h4 className="text-[16px] leading-tight mb-2 whitespace-pre-line">
                    {appDownloadFeature3}
                  </h4>
                  <div className="w-4 h-[2px] bg-white mt-3"></div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-1">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2.5 8.5h19M2.5 15.5h19"></path>
                    <rect
                      x="2"
                      y="4"
                      width="20"
                      height="16"
                      rx="2"
                      ry="2"
                    ></rect>
                    <path
                      d="M12 9l.9 2.8H16l-2.5 1.8.9 2.9-2.4-1.7-2.4 1.7.9-2.9-2.5-1.8h3.1Z"
                      stroke="none"
                      fill="currentColor"
                    ></path>
                  </svg>
                </div>
                <div>
                  <h4 className="text-[16px] leading-tight mb-2 whitespace-pre-line">
                    {appDownloadFeature4}
                  </h4>
                  <div className="w-4 h-[2px] bg-white mt-3"></div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <a href={appDownloadPlayStoreUrl} target={homeData?.appDownloadPlayStoreUrl && homeData.appDownloadPlayStoreUrl !== "#" ? "_blank" : undefined} rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                  alt="Get it on Google Play"
                  className="h-12 object-contain"
                />
              </a>
              <a
                href={appDownloadAppStoreUrl}
                target={homeData?.appDownloadAppStoreUrl && homeData.appDownloadAppStoreUrl !== "#" ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity bg-black rounded-xl overflow-hidden flex items-center px-1"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                  alt="Download on the App Store"
                  className="h-[44px] object-contain px-2"
                />
              </a>
            </div>
          </div>

          <div className="flex-1 flex justify-center md:justify-end relative h-[500px]">
            {/* Phone Mockup Frame */}
            <div className="w-[280px] h-[550px] bg-white rounded-[3rem] absolute bottom-[-150px] shadow-2xl border-[10px] border-[#222] shadow-[0_30px_60px_rgba(0,0,0,0.4)] flex flex-col overflow-hidden relative z-10">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[24px] bg-[#222] rounded-b-[1rem] z-20 flex justify-center items-end pb-1.5 gap-2">
                <div className="w-1.5 h-1.5 bg-[#111] rounded-full border border-gray-700"></div>
                <div className="w-8 h-1.5 bg-gray-900 rounded-full border border-gray-700"></div>
              </div>

              {/* Status Bar */}
              <div className="flex justify-between items-center px-6 pt-2 pb-1 text-[10px] font-medium text-black">
                <span>9:30</span>
                <div className="flex items-center gap-1">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 21L23.6 7c-3.1-2.9-7-4.6-11.6-4.6S3.5 4.1.4 7L12 21z" />
                  </svg>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M22 2v20h-20l20-20z" />
                  </svg>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <rect x="2" y="7" width="16" height="10" rx="2" ry="2" />
                    <rect x="18" y="10" width="4" height="4" rx="1" ry="1" />
                  </svg>
                </div>
              </div>

              {/* Header Logo */}
              <div className="flex justify-center items-center py-2 h-12">
                <img
                  src="/logo.png"
                  alt="Logo"
                  className="h-6 object-contain"
                />
              </div>

              {/* User Bar */}
              <div className="px-5 py-3 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center bg-gray-50 text-gray-400">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] text-gray-500 leading-tight">
                      Olá,
                    </span>
                    <span className="text-[13px] font-bold text-black leading-tight flex items-center gap-1">
                      Bem-vindo! <span className="text-[10px]">👋</span>
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 text-black">
                  <Search size={18} strokeWidth={1.5} />
                  <Bell size={18} strokeWidth={1.5} />
                </div>
              </div>

              {/* Content Area */}
              <div className="px-5 flex-1 relative bg-white pb-6 overflow-y-auto scrollbar-hide">
                <div className="w-full bg-white border border-gray-200 rounded-full py-2.5 px-4 flex justify-between items-center shadow-[0_2px_10px_rgba(0,0,0,0.02)] mb-4">
                  <span className="text-[11px] text-black font-medium flex items-center gap-2">
                    <span className="text-sm">🙂</span> Como está se sentindo
                    hoje?
                  </span>
                  <ChevronRight size={14} className="text-gray-400" />
                </div>

                <div className="w-full h-[180px] rounded-xl overflow-hidden mb-3 relative">
                  <img
                    src={appDownloadImage}
                    alt="Mountain"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex gap-1 justify-center mb-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                </div>

                <div className="w-full flex items-center justify-between pb-4">
                  <div className="flex items-center gap-2 text-black">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="2" y="3" width="20" height="18" rx="2" ry="2" />
                      <path d="M12 8v8" />
                      <path d="M8 12h8" />
                    </svg>
                    <span className="text-xs font-bold text-black">Label</span>
                  </div>
                  <div className="flex items-center gap-3 text-black">
                    <SkipBack
                      size={16}
                      strokeWidth={1.5}
                      className="fill-black"
                    />
                    <PlayCircle
                      size={20}
                      strokeWidth={1.5}
                      className="fill-black text-white"
                    />
                    <SkipForward
                      size={16}
                      strokeWidth={1.5}
                      className="fill-black"
                    />
                  </div>
                </div>

                <div className="w-full flex justify-between items-center pt-2">
                  <span className="text-xs font-bold text-black border-b border-black pb-0.5">
                    Playlists
                  </span>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500">
                    EXPANDIR <ChevronRight size={12} strokeWidth={2} />
                  </div>
                </div>
              </div>
            </div>

            {/* Outline to hide the bottom part outside the section */}
          </div>
        </div>
      </section>

      <CourseRegistrationModal
        courseTitle={selectedCourse || ""}
        isOpen={!!selectedCourse}
        onClose={() => setSelectedCourse(null)}
      />

      {/* Video Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pb-20 sm:pb-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedVideo(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-5xl bg-black rounded-2xl overflow-hidden shadow-2xl z-10 aspect-video flex flex-col"
            >
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute top-4 right-4 z-20 w-10 h-10 bg-black/50 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-md"
              >
                <X size={24} />
              </button>
              <iframe
                src={(() => {
                  let embedUrl = selectedVideo;
                  if (selectedVideo.includes("youtube.com/watch")) {
                    const urlParams = new URL(selectedVideo).searchParams;
                    embedUrl = `https://www.youtube.com/embed/${urlParams.get("v")}`;
                  } else if (selectedVideo.includes("youtu.be/")) {
                    const id = selectedVideo.split("youtu.be/")[1]?.split("?")[0];
                    embedUrl = `https://www.youtube.com/embed/${id}`;
                  } else if (selectedVideo.includes("vimeo.com/")) {
                    const id = selectedVideo.split("vimeo.com/")[1];
                    embedUrl = `https://player.vimeo.com/video/${id}`;
                  }
                  
                  return embedUrl.includes("?") 
                    ? `${embedUrl}&autoplay=1` 
                    : `${embedUrl}?autoplay=1`;
                })()}
                title="Video"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
