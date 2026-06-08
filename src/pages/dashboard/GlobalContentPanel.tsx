import React, { useState, useEffect } from "react";
import {
  Layout,
  FileText,
  Home,
  Users,
  BookOpen,
  Mail,
  ArrowLeft,
  LogOut,
  Save,
  Loader2,
  ShieldCheck,
  Trash2,
  Upload,
  Settings,
  Lock,
  Heart,
  ExternalLink,
  GraduationCap,
  Grid,
  Edit3,
  X,
  ChevronRight,
  Plus,
  ChevronUp,
  ChevronDown,
  Compass,
  Image as ImageIcon,
} from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { auth, db } from "../../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import AdminLayout from "../../components/AdminLayout";
import { useFirebase } from "../../context/FirebaseContext";
import ColunistaPanelComponent, { GerenciarColunistasHome } from "./ColunistaPanelComponent";

interface GlobalContentPanelProps {
  isEmbedded?: boolean;
  embedTab?:
    | "inicio"
    | "quem_somos"
    | "cursos"
    | "edificado_matrimonio"
    | "contatos"
    | "aparencia"
    | "login"
    | "footer"
    | "header_logo";
}

export default function GlobalContentPanel({
  isEmbedded = false,
  embedTab,
}: GlobalContentPanelProps) {
  const navigate = useNavigate();
  const { user, profile } = useFirebase();

  const isGlobalAdmin =
    profile?.role === "admin" || user?.email === "alaondez@gmail.com";
  const isEditor = profile?.role === "editor";
  const hasGlobalAccess = isGlobalAdmin || isEditor;

  useEffect(() => {
    if (profile && !hasGlobalAccess && !isEmbedded) {
      navigate("/dashboard");
    }
  }, [profile, hasGlobalAccess, navigate, isEmbedded]);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tabParam = queryParams.get("tab");
  const editCourseParam = queryParams.get("editCourse");

  const [activeContent, setActiveContent] = useState<
    | "inicio"
    | "quem_somos"
    | "cursos"
    | "edificado_matrimonio"
    | "contatos"
    | "aparencia"
    | "login"
    | "footer"
    | "header_logo"
  >("aparencia");

  useEffect(() => {
    if (isEmbedded && embedTab) {
      setActiveContent(embedTab);
    }
  }, [isEmbedded, embedTab]);

  useEffect(() => {
    if (tabParam && [
        "inicio",
        "quem_somos",
        "cursos",
        "edificado_matrimonio",
        "contatos",
        "aparencia",
        "login",
        "footer",
        "header_logo",
      ].includes(tabParam)) {
      setActiveContent(tabParam as any);
      setEditingCourseIndex(null); // Reset editing state on tab switch for isolation
    }
  }, [tabParam]);

  // Handle activeContent change to reset ALL temporary editing/deletion states for strict isolation
  useEffect(() => {
    setEditingCourseIndex(null);
    setSlideToDelete(null);
    setBeliefToDelete(null);
    setCourseToDelete(null);
    setCoursePageCourseToDelete(null);
    setPrincipleToDelete(null);
  }, [activeContent]);


  const [themeData, setThemeData] = useState({
    primaryBase: "#1a6496",
    primaryLight: "#2d8dc3",
    primaryDark: "#0d2b42",
    primaryBg: "#eaf4fb",
    bgMain: "#f0f4f8",
    textMain: "#222222",
    textMuted: "#6b7c93",
    footerBg: "#1a3a52",
    footerText: "#ffffff",
  });

  const [inicioSubTab, setInicioSubTab] = useState<"hero" | "colunistas" | "noticias" | "videos" | "eventos" | "missao" | "generosidade" | "app">("hero");
  const [quemSomosSubTab, setQuemSomosSubTab] = useState<"historia" | "principios" | "ministerio">("historia");
  const [isLoading, setIsLoading] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<number | null>(null);
  const [genericDeleteConfirm, setGenericDeleteConfirm] = useState<{message: string, action: () => void} | null>(null);
  const [beliefToDelete, setBeliefToDelete] = useState<number | null>(null);
  const [slideToDelete, setSlideToDelete] = useState<number | null>(null);
  const [coursePageCourseToDelete, setCoursePageCourseToDelete] = useState<
    number | null
  >(null);
  const [coursesSubTab, setCoursesSubTab] = useState<"geral" | "editor" | "leader">("geral");
  const [edificadoSubTab, setEdificadoSubTab] = useState<"hero" | "crencas" | "cursos_editor" | "cta">("hero");
  const [editingCourseIndex, setEditingCourseIndex] = useState<number | null>(null);
  const [editingEdificadoCourseIndex, setEditingEdificadoCourseIndex] = useState<number | null>(null);
  const [principleToDelete, setPrincipleToDelete] = useState<number | null>(
    null,
  );
  const [homeData, setHomeData] = useState({
    videos: [] as any[],
    heroTitle: "Edificado Matrimônio",
    heroSubtitle:
      "O treinamento fundamental focado nos alicerces bíblicos para o matrimônio",
    slides: [
      {
        id: 1,
        url: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&q=80&w=2070",
        title: "Edificado Matrimônio",
        subtitle:
          "O treinamento fundamental focado nos alicerces bíblicos para o matrimônio",
      },
      {
        id: 2,
        url: "https://images.unsplash.com/photo-1484665754804-74b091211472?auto=format&fit=crop&q=80&w=2070",
        title: "Apascentando Filhos",
        subtitle:
          "Mentoria estratégica com ferramentas práticas para guiar e instruir seus filhos",
      },
      {
        id: 3,
        url: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=2070",
        title: "Alcançando a Liberdade Financeira",
        subtitle:
          "Alinhamento financeiro do casal para prosperar em unidade dentro do lar",
      },
    ],
    beliefsTitle: "No que Acreditamos!",
    beliefsHighlight:
      "Acreditamos que casamentos fortes constroem sociedades fortes.",
    beliefs: [
      {
        id: 1,
        title: "Restauração",
        description:
          "Ferramentas profundas para curar áreas de conflito e reconectar casais que buscam uma nova jornada juntos.",
      },
      {
        id: 2,
        title: "Prevenção",
        description:
          "Cursos focados em noivos e recém-casados para iniciar a jornada no caminho certo, baseados em valores sólidos.",
      },
      {
        id: 3,
        title: "Legado Familiar",
        description:
          "Princípios aplicados à criação de filhos e finanças familiares estruturadas para durar por gerações.",
      },
    ],
    coursesTitle: "Cursos e Treinamentos",
    coursesSubtitle:
      "Oferecemos trilhas de aprendizado específicas para cada momento da sua vida familiar.",
    courses: [
      {
        id: 1,
        title: "Marido de Valor",
        desc: "Pequenos grupos que se reúnem em lares para orar e estudar a Bíblia. Com o objetivo de restaurar famílias.",
        tags: "Homens, Espiritualidade",
      },
      {
        id: 2,
        title: "Apascentando Filhos",
        desc: "Estratégia voltada a pais. Fornece ferramentas práticas baseadas em princípios bíblicos para a educação cristã.",
        tags: "Pais, Crianças",
      },
      {
        id: 3,
        title: "Esposa Sábia",
        desc: "Curso voltado ao alinhamento financeiro e emocional do casal. Elimina ruídos de comunicação e constrói união.",
        tags: "Mulheres, Finanças",
      },
    ],
    ctaTitle: "Pronto para dar o próximo passo na sua família?",
    ctaDescription:
      "Existem centenas de grupos ativos esperando por você. Encontre apoio e ferramentas para uma vida plena em Jesus.",
    ctaButtonText: "Encontre um Grupo Perto de Você",
    eventos: [] as any[],
    missionTitle1: "Amamos a obra",
    missionTitle2: "missionária!",
    generosityBadge: "Generosidade",
    generosityTitle1: "Adoração através da",
    generosityTitle2: "contribuição.",
    generositySubtitle: "\"Cada um contribua segundo propôs no seu coração; não com tristeza, ou por necessidade; porque Deus ama ao que dá com alegria.\"",
    generosityPixTitle: "Faça um PIX",
    generosityPixSubtitle: "Use a chave CNPJ para ofertar com segurança.",
    generosityPixKey: "32795249000127",
    generosityOtherFormsTitle: "Outras Formas",
    generosityOtherFormsSubtitle: "Para transferências bancárias ou ofertas específicas, entre em contato com nossa tesouraria.",
    generosityOtherFormsBtnText: "Falar no WhatsApp",
    generosityOtherFormsBtnLink: "#",
    appDownloadTitle: "Baixe nosso aplicativo e tenha a igreja 24 horas com você.",
    appDownloadFeature1: "Receba conteúdos exclusivos.",
    appDownloadFeature2: "Tenha a Bíblia no seu bolso.",
    appDownloadFeature3: "Faça contribuições pelo aplicativo.",
    appDownloadFeature4: "Faça inscrições nos eventos.",
    appDownloadPlayStoreUrl: "#",
    appDownloadAppStoreUrl: "#",
    appDownloadBgColor: "#7A8C66",
    appDownloadImage: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80",
    newsTitle: "Blogs e Colunas",
    newsLinkText: "Ultimas atualizações",
    newsItems: [
      { id: 1, title: "", description: "", category: "", date: "", linkUrl: "", imageUrl: "" },
      { id: 2, title: "", description: "", category: "", date: "", linkUrl: "", imageUrl: "" },
      { id: 3, title: "", description: "", category: "", date: "", linkUrl: "", imageUrl: "" }
    ],
    missionImages: [
      { imageUrl: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=600&auto=format&fit=crop", linkUrl: "" },
      { imageUrl: "https://images.unsplash.com/photo-1593113565694-c6c71f4ed6cb?q=80&w=600&auto=format&fit=crop", linkUrl: "" },
      { imageUrl: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=600&auto=format&fit=crop", linkUrl: "" },
      { imageUrl: "https://images.unsplash.com/photo-1627844642677-8b3d6810a4db?q=80&w=600&auto=format&fit=crop", linkUrl: "" },
      { imageUrl: "https://images.unsplash.com/photo-1473649085228-583485e6e4d7?q=80&w=600&auto=format&fit=crop", linkUrl: "" },
      { imageUrl: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=600&auto=format&fit=crop", linkUrl: "" },
    ] as any[],
  });

  const [aboutData, setAboutData] = useState<any>({
    title: "Quem Somos",
    subtitle:
      "Dedicados a fortalecer os alicerces da sociedade através de famílias estruturadas na Palavra.",
    historyTitle: "Nossa História",
    historyText:
      "O Ministério Edificado Matrimônio nasceu de um desejo profundo de ver casamentos restaurados e famílias vivendo o propósito original de Deus.\n\nAo longo dos anos, temos visto milhares de vidas transformadas através de nossos cursos, mentorias e grupos de oração que se espalham por todo o Brasil e em outros países.\n\nAcreditamos que o matrimônio não é apenas um contrato social, mas uma aliança sagrada que, quando vivida plenamente, reflete o amor e a união que trazem paz e prosperidade para toda a casa.",
    historyImage:
      "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&q=80&w=2070",
    principlesTitle: "Missão, Visão e Valores",
    principles: [
      {
        id: 1,
        title: "Nossa Missão",
        description:
          "Proporcionar ferramentas bíblicas e apoio emocional para que casais possam edificar lares sólidos, baseados no amor, respeito e fidelidade.",
        image: "",
      },
      {
        id: 2,
        title: "Nossa Visão",
        description:
          "Ser referência global na restauração de casamentos, alcançando cada família com a mensagem de esperança e reconstrução do lar.",
        image: "",
      },
      {
        id: 3,
        title: "Nossos Valores",
        description:
          "Fidelidade às Escrituras, integridade nas relações, compromisso com o próximo e valorização do legado familiar intergeracional.",
        image: "",
      },
    ],
    teamTitle: "Ministério Apascentando Filhos",
    teamLogo: "/logomaf.png",
    teamBoxTitle: "Liderança e Apoio",
    teamBoxText:
      "Nosso ministério faz parte da rede **Apascentando Filhos**, focada não apenas no casal, mas na formação integral da criança e do adolescente sob a luz do Evangelho. Contamos com líderes treinados e capacitados em todo o país para prestar mentoria e suporte personalizado a cada família que busca nossa ajuda.",
    teamBoxImage: "",
  });

  const [coursesData, setCoursesData] = useState<any>({
    title: "Sua Jornada de Crescimento Começa Aqui",
    subtitle:
      "Oferecemos mentorias e treinamentos projetados para fortalecer sua vida, família e ministério através de princípios bíblicos práticos.",
    sectionTitle: "OS NOSSOS CURSOS",
    sectionSubtitle: "CONHEÇA TODOS",
    heroImage: "",
    featuresData: [
      {
        icon: "BookOpen",
        title: "Base Bíblica Sólida",
        description: "Todos os nossos treinamentos são fundamentados nas Escrituras, trazendo princípios eternos para desafios contemporâneos."
      },
      {
        icon: "Users",
        title: "Mentoria Especializada",
        description: "Líderes experientes acompanham sua jornada, oferecendo suporte e sabedoria prática em cada etapa."
      },
      {
        icon: "Compass",
        title: "Caminho de Crescimento",
        description: "Um currículo estruturado que leva você de fundamentos básicos a níveis avançados de liderança e vida familiar."
      }
    ],
    methodologyImage: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=2070",
    methodologyTitle: "Metodologia de Ensino Transformadora",
    methodologyItems: [
      "Aulas interativas e práticas",
      "Grupos de discipulado e mentoria",
      "Materiais de apoio exclusivos",
      "Acompanhamento personalizado pós-curso"
    ],
    categories: [
      "Assinatura", "Combos", "Conferências", "Escola Bíblica", 
      "Escola do Espírito", "Família", "Gestão e Comunicação", 
      "Política e Sociedade", "Vida Cristã"
    ],
    cursos: [
      {
        id: 1,
        title: "Antes do Sim",
        instructor: "Facilitador",
        image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=1200",
        category: "Família",
        isSpecial: false,
        isConferencia: false
      },
      {
        id: 2,
        title: "Esposa Sábia",
        instructor: "Facilitador",
        image: "https://images.unsplash.com/photo-1516589174184-c685266d4341?auto=format&fit=crop&q=80&w=1200",
        category: "Assinatura",
        isSpecial: false,
        isConferencia: false
      },
      {
        id: 3,
        title: "Marido de Valor",
        instructor: "Facilitador",
        image: "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&q=80&w=1200",
        category: "Assinatura",
        isSpecial: false,
        isConferencia: false
      },
      {
        id: 4,
        title: "Casados por Deus",
        instructor: "Facilitador",
        image: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=1200",
        category: "Família",
        isSpecial: false,
        isConferencia: false
      },
      {
        id: 5,
        title: "Apascentando Filhos",
        instructor: "Facilitador",
        image: "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&q=80&w=1200",
        category: "Vida Cristã",
        isSpecial: false,
        isConferencia: false
      }
    ],
    bottomTitle: "Não sabe por onde começar?",
    bottomSubtitle:
      "Nossa equipe de líderes pode ajudar você a identificar qual curso melhor atende as necessidades atuais da sua família.",
    bottomButtonText: "Falar com um conselheiro",
    bottomButtonLink: "/contato",
  });

  const [loginData, setLoginData] = useState({
    title: "Você já é líder?",
    subtitle: "E ainda não tem acesso, cadastre-se!",
    boxText:
      "Nesta área você poderá enviar os relatórios de cadastros e semanais de forma fácil e prática.",
    warningText:
      "Atenção: antes de se cadastrar, realize o treinamento de líder para ministrar.",
    infoText: "Seus relatórios ficarão armazenados na sua área pessoal.",
  });

  const [footerData, setFooterData] = useState({
    description:
      "Um ministério dedicado a fortalecer casamentos e famílias ao redor do mundo através de ensinamentos bíblicos práticos e vivência em comunidade.",
    instagram: "https://instagram.com/",
    youtube: "https://youtube.com/",
    facebook: "https://facebook.com/",
    copyrightText:
      "Ministério Apascentando Filhos Brasil. Todos os direitos reservados.",
    logoTitle: "EDIFICADO",
    logoSubtitle: "MATRIMÔNIO",
    logoUrl: "/logo.png",
    ministryLogoUrl: "/logomaf.png",
    ministrySubtitle: "Ministério",
    ministryTitle: "Apascentando Filhos",
  });

  const [headerLogoData, setHeaderLogoData] = useState<{
    logoUrl?: string;
    title?: string;
    subtitle?: string;
    links?: { name: string; path: string; subLinks?: { name: string; path: string }[] }[];
  }>({
    logoUrl: "/logo.png",
    title: "MINISTÉRIO",
    subtitle: "APASCENTANDO FILHOS",
    links: [
      { name: "Início", path: "/" },
      { name: "Quem Somos", path: "/quem-somos" },
      { name: "Edificado Matrimônio", path: "/edificado-matrimonio" },
      { name: "Escola MAF", path: "/cursos" },
      { name: "Contato", path: "/contato" },
    ]
  });

  const [edificadoMatrimonioData, setEdificadoMatrimonioData] = useState<any>({
    title: "Edificado Matrimônio",
    description:
      "O treinamento fundamental focado nos alicerces bíblicos para o matrimônio.",
    detailedContent: `O curso Edificado Matrimônio é composto por encontros práticos focados no fortalecimento da aliança matrimonial. Com metodologia dinâmica, ensinamento bíblico focado e compartilhamento em pequenos grupos estruturados, o treinamento capacita o casal a superar barreiras históricas e construir uma casa verdadeiramente inabalável.\n\n### Principais tópicos abordados:\n• **O plano original para a família**: Entenda a perspectiva sagrada da criação do lar.\n• **Aliança de Sangue**: O mistério da união indissolúvel até que a morte os separe.\n• **Papéis do casal**: Compreenda as responsabilidade práticas do marido e da esposa sob a orientação da Escritura.\n• **Comunicação Efetiva**: Como resolver conflitos em paz, eliminando a amargura e os ruídos de palavras.\n• **Finanças em Unidade**: Alinhamento econômico completo para prosperar de mãos dadas.\n• **Intimidade e Expressão**: Curando bloqueios e construindo conexões emocionais profundas no leito conjugal.\n• **O Poder da Oração**: Criando o hábito de buscar a Deus em casal para mover céus e terra.`,
    duration: "10 Semanas",
    encontros: "10 Encontros Semanais",
    publico: "Casados e Noivos",
    investment: "Gratuito (Material Consultar Grupo)",
    badge: "Mais Procurado",
    image: "",
  });

  const [contactData, setContactData] = useState({
    title: "Fale Conosco",
    subtitle:
      "Tire suas dúvidas ou encontre um grupo de mentoria perto de você.",
    formTitle: "Envie sua Mensagem",
    channelsTitle: "Canais de Atendimento",
    emailText: "contato@edificadomatrimonio.com.br",
    phoneText: "+55 (00) 00000-0000",
    addressText:
      "Atendimento nacional e internacional através de núcleos locais.",
    quoteText: `"Transformando lares através da unidade e do amor."`,
    bottomText:
      "Junte-se à nossa comunidade e descubra o plano extraordinário de Deus para sua família.",
  });

    useEffect(() => {
    if (editCourseParam) {
      if (activeContent === "edificado_matrimonio") {
        setTimeout(() => {
          const index = edificadoMatrimonioData?.cursos?.findIndex(
            (c: any) => c.title === editCourseParam
          );
          if (index !== undefined && index !== -1) {
            setEdificadoSubTab("cursos_editor");
            setEditingEdificadoCourseIndex(index);
          }
        }, 500);
      } else if (activeContent === "cursos") {
        setTimeout(() => {
          const index = coursesData?.cursos?.findIndex(
            (c: any) => c.title === editCourseParam
          );
          if (index !== undefined && index !== -1) {
            setEditingCourseIndex(index);
          }
        }, 500);
      }
    }
  }, [activeContent, editCourseParam, edificadoMatrimonioData?.cursos?.length, coursesData?.cursos?.length]);

  useEffect(() => {
    async function loadData() {
      try {
        const [
          homeSnap,
          aboutSnap,
          coursesSnap,
          contactSnap,
          themeSnap,
          loginSnap,
          footerSnap,
          headerLogoSnap,
          edificadoSnap,
        ] = await Promise.all([
          getDoc(doc(db, "content", "home")),
          getDoc(doc(db, "content", "quem_somos")),
          getDoc(doc(db, "content", "cursos")),
          getDoc(doc(db, "content", "contato")),
          getDoc(doc(db, "content", "theme")),
          getDoc(doc(db, "content", "login")),
          getDoc(doc(db, "content", "footer")),
          getDoc(doc(db, "content", "header_logo")),
          getDoc(doc(db, "content", "edificado_matrimonio")),
        ]);

        if (homeSnap.exists()) {
          const data = homeSnap.data();
          
          setHomeData((prev) => {
            let loadedMissionImages = data.missionImages || prev.missionImages;
            loadedMissionImages = loadedMissionImages.map((img: any) => typeof img === "string" ? { imageUrl: img, linkUrl: "" } : img);
            return {
              ...prev,
              ...data,
              missionImages: loadedMissionImages,
              courses: data.courses || prev.courses,
              beliefs: data.beliefs || prev.beliefs,
              slides: data.slides || prev.slides,
            };
          });
        }
        if (aboutSnap.exists()) {
          const data = aboutSnap.data();
          let principles = data.principles;
          if (!principles) {
            principles = [
              {
                id: 1,
                title: data.missionTitle || "Nossa Missão",
                description:
                  data.missionText ||
                  "Proporcionar ferramentas bíblicas e apoio emocional para que casais possam edificar lares sólidos, baseados no amor, respeito e fidelidade.",
                image: "",
              },
              {
                id: 2,
                title: data.visionTitle || "Nossa Visão",
                description:
                  data.visionText ||
                  "Ser referência global na restauração de casamentos, alcançando cada família com a mensagem de esperança e reconstrução do lar.",
                image: "",
              },
              {
                id: 3,
                title: data.valuesTitle || "Nossos Valores",
                description:
                  data.valuesText ||
                  "Fidelidade às Escrituras, integridade nas relações, compromisso com o próximo e valorização do legado familiar intergeracional.",
                image: "",
              },
            ];
          }
          setAboutData((prev) => ({ ...prev, ...data, principles }));
        }
        if (coursesSnap.exists()) {
          const data = coursesSnap.data();
          setCoursesData((prev) => ({
            ...prev,
            ...data,
            cursos: data.cursos || prev.cursos,
          }));
        }
        if (contactSnap.exists()) {
          setContactData((prev) => ({ ...prev, ...contactSnap.data() }));
        }
        if (themeSnap.exists() && themeSnap.data().colors) {
          setThemeData((prev) => ({ ...prev, ...themeSnap.data().colors }));
        }
        if (loginSnap.exists()) {
          setLoginData((prev) => ({ ...prev, ...loginSnap.data() }));
        }
        if (footerSnap.exists()) {
          setFooterData((prev) => ({ ...prev, ...footerSnap.data() }));
        }
        if (headerLogoSnap.exists()) {
          setHeaderLogoData((prev) => ({ ...prev, ...headerLogoSnap.data() }));
        }
        if (edificadoSnap.exists()) {
          setEdificadoMatrimonioData((prev: any) => ({
            ...prev,
            ...edificadoSnap.data(),
          }));
        }
      } catch (err) {
        console.error("Erro ao carregar os dados das páginas:", err);
      }
    }
    loadData();
  }, []);

  const addCourse = () => {
    setHomeData((prev) => ({
      ...prev,
      courses: [
        {
          id: Date.now(),
          title: "Novo Curso",
          desc: "Descrição...",
          tags: "Tags...",
          link: "/cursos",
        },
        ...(prev.courses || []),
      ],
    }));
  };

  const addPrinciple = () => {
    setAboutData((prev: any) => ({
      ...prev,
      principles: [
        {
          id: Date.now(),
          title: "Novo Princípio",
          description: "Descrição...",
          image: "",
        },
        ...(prev.principles || []),
      ],
    }));
  };

  const addBelief = () => {
    setHomeData((prev) => ({
      ...prev,
      beliefs: [
        { id: Date.now(), title: "Novo Item", description: "Descrição..." },
        ...(prev.beliefs || []),
      ],
    }));
  };

  const addEdificadoSlide = () => {
    setEdificadoMatrimonioData((prev: any) => ({
      ...prev,
      slides: [
        ...(prev.slides || []),
        {
          id: Date.now(),
          url: "",
          title: "Novo Slide",
          subtitle: "Descrição...",
          button1Text: "",
          button1Link: "",
          button2Text: "",
          button2Link: "",
        },
      ],
    }));
  };

  const addEdificadoBelief = () => {
    setEdificadoMatrimonioData((prev: any) => ({
      ...prev,
      beliefs: [
        ...(prev.beliefs || []),
        {
          id: Date.now(),
          title: "Novo Tópico",
          description: "Descreva o tópico",
        },
      ],
    }));
  };

  const addSlide = () => {
    setHomeData((prev) => ({
      ...prev,
      slides: [
        {
          id: Date.now(),
          url: "",
          title: "Novo Slide",
          subtitle: "Subtítulo...",
        },
        ...(prev.slides || []),
      ],
    }));
  };

  const addNewsItem = () => {
    setHomeData((prev) => ({
      ...prev,
      newsItems: [
        { id: Date.now(), title: "Nova Notícia", description: "Descrição...", category: "NOVO", date: new Date().toLocaleDateString('pt-BR'), linkUrl: "", imageUrl: "" },
        ...(prev.newsItems || [])
      ]
    }));
  };

const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/webp", 0.6));
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

const handleImageUpload = async (
  e: React.ChangeEvent<HTMLInputElement>,
  slideIdx: number,
  target: "home" | "edificado" = "home"
) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    alert("A imagem é muito grande. Escolha uma imagem de até 5MB.");
    return;
  }

  try {
    const base64String = await compressImage(file);
    if (target === "home") {
      setHomeData((prev) => ({
        ...prev,
        slides: prev.slides.map((s, i) =>
          i === slideIdx ? { ...s, url: base64String } : s
        ),
      }));
    } else {
      setEdificadoMatrimonioData((prev: any) => ({
        ...prev,
        slides: prev.slides.map((s: any, i: number) =>
          i === slideIdx ? { ...s, url: base64String } : s
        ),
      }));
    }
  } catch (e) {
    console.error("Failed to compress image", e);
  }
};

const handleEdificadoCourseImageUpload = async (
  e: React.ChangeEvent<HTMLInputElement>,
  idx: number,
) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    alert("A imagem é muito grande. Escolha uma imagem de até 5MB.");
    return;
  }

  try {
    const base64String = await compressImage(file);
    setEdificadoMatrimonioData((prev) => ({
      ...prev,
      cursos: prev.cursos.map((c, i) =>
        i === idx ? { ...c, image: base64String } : c,
      ),
    }));
  } catch (e) {
    console.error("Failed to compress image", e);
  }
};

const handleCoursePageCourseImageUpload = async (
  e: React.ChangeEvent<HTMLInputElement>,
  idx: number,
) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    alert("A imagem é muito grande. Escolha uma imagem de até 5MB.");
    return;
  }

  try {
    const base64String = await compressImage(file);
    setCoursesData((prev) => ({
      ...prev,
      cursos: prev.cursos.map((c, i) =>
        i === idx ? { ...c, image: base64String } : c,
      ),
    }));
  } catch (e) {
    alert("Erro ao processar imagem.");
  }
};

const handleCoursesGeneralImageUpload = async (
  e: React.ChangeEvent<HTMLInputElement>,
  field: "heroImage" | "methodologyImage"
) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    alert("A imagem é muito grande. Escolha uma imagem de até 5MB.");
    return;
  }

  try {
    const base64String = await compressImage(file);
    setCoursesData((prev: any) => ({
      ...prev,
      [field]: base64String,
    }));
  } catch (e) {
    alert("Erro ao processar imagem.");
  }
};

const handleBeliefImageUpload = async (
  e: React.ChangeEvent<HTMLInputElement>,
  beliefIdx: number,
  target: "home" | "edificado" = "home"
) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    alert("A imagem é muito grande. Escolha uma imagem de até 5MB.");
    return;
  }

  try {
    const base64String = await compressImage(file);
    if (target === "home") {
      setHomeData((prev) => ({
        ...prev,
        beliefs: (prev.beliefs || []).map((b, i) =>
          i === beliefIdx ? { ...b, image: base64String } : b,
        ),
      }));
    } else {
      setEdificadoMatrimonioData((prev: any) => ({
        ...prev,
        beliefs: (prev.beliefs || []).map((b: any, i: number) =>
          i === beliefIdx ? { ...b, image: base64String } : b,
        ),
      }));
    }
  } catch (e) {
    console.error("Failed to compress image", e);
  }
};

const handleCourseImageUpload = async (
  e: React.ChangeEvent<HTMLInputElement>,
  courseIdx: number,
) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    alert("A imagem é muito grande. Escolha uma imagem de até 5MB.");
    return;
  }

  try {
    const base64String = await compressImage(file);
    setHomeData((prev) => ({
      ...prev,
      courses: prev.courses.map((c, i) =>
        i === courseIdx ? { ...c, image: base64String } : c,
      ),
    }));
  } catch (e) {
    console.error("Failed to compress image", e);
  }
};

const recompressBase64 = (base64Str: string): Promise<string> => {
  return new Promise((resolve) => {
    if (!base64Str || !base64Str.startsWith("data:image")) {
      return resolve(base64Str); // Empty or standard URL
    }

    // Check string length. > 50kb will be compressed.
    if (base64Str.length < 50000) {
      return resolve(base64Str);
    }

    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;
      const MAX_WIDTH = 400;
      const MAX_HEIGHT = 400;
      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/webp", 0.6));
    };
    img.onerror = () => resolve(base64Str); // Fallback to original
  });
};

const handleSaveHome = async () => {
  setIsLoading(true);
  try {
    // Auto-recompress any huge existing base64 images before saving
    const optimizedSlides = await Promise.all(
      (homeData.slides || []).map(async (slide: any) => ({
        ...slide,
        url: await recompressBase64(slide.url),
      })),
    );

    const optimizedBeliefs = await Promise.all(
      (homeData.beliefs || []).map(async (belief: any) => ({
        ...belief,
        image: await recompressBase64(belief.image),
      })),
    );

    const optimizedCourses = await Promise.all(
      (homeData.courses || []).map(async (course: any) => ({
        ...course,
        image: await recompressBase64(course.image),
      })),
    );

    const optimizedVideos = await Promise.all(
      (homeData.videos || []).map(async (video: any) => ({
        ...video,
        thumbnail: await recompressBase64(video.thumbnail),
      })),
    );

    const optimizedEventos = await Promise.all(
      (homeData.eventos || []).map(async (evt: any) => ({
        ...evt,
        imageUrl: await recompressBase64(evt.imageUrl),
      })),
    );

    const optimizedMissionImages = await Promise.all(
      (homeData.missionImages || []).map(async (img: any) => {
        let finalImgUrl = "";
        try {
          finalImgUrl = await recompressBase64(typeof img === "string" ? img : img.imageUrl);
        } catch (e) {
          finalImgUrl = typeof img === "string" ? img : img.imageUrl;
        }
        return {
           imageUrl: finalImgUrl,
           linkUrl: img.linkUrl || ""
        };
      })
    );

    const optimizedNewsItems = await Promise.all(
      (homeData.newsItems || []).map(async (news: any) => ({
        ...news,
        imageUrl: await recompressBase64(news.imageUrl || ""),
      }))
    );

    const optimizedAppDownloadImage = homeData.appDownloadImage 
      ? await recompressBase64(homeData.appDownloadImage) 
      : homeData.appDownloadImage;

    const optimizedData = JSON.parse(JSON.stringify({
      ...homeData,
      slides: optimizedSlides,
      beliefs: optimizedBeliefs,
      courses: optimizedCourses,
      videos: optimizedVideos,
      eventos: optimizedEventos,
      missionImages: optimizedMissionImages,
      newsItems: optimizedNewsItems,
      appDownloadImage: optimizedAppDownloadImage,
    }));

    await setDoc(doc(db, "content", "home"), optimizedData, { merge: true });
    alert("Sucesso: Alterações da página Início foram salvas no site!");
  } catch (e: any) {
    console.error(e);
    alert(
      `Erro ao salvar no banco de dados: ${e.message || "Tamanho excedido ou erro de conexão."}`,
    );
  } finally {
    setIsLoading(false);
  }
};

const handleSaveAbout = async () => {
  setIsLoading(true);
  try {
    const optimizedPrinciples = await Promise.all(
      (aboutData.principles || []).map(async (p: any) => ({
        ...p,
        image: await recompressBase64(p.image),
      })),
    );

    const optimizedData = JSON.parse(JSON.stringify({
      ...aboutData,
      principles: optimizedPrinciples,
      historyImage: await recompressBase64(aboutData.historyImage || ""),
      teamLogo: await recompressBase64(aboutData.teamLogo || ""),
      teamBoxImage: await recompressBase64(aboutData.teamBoxImage || ""),
    }));
    await setDoc(doc(db, "content", "quem_somos"), optimizedData, { merge: true });
    alert("Sucesso: Alterações da página Quem Somos foram salvas!");
  } catch (e: any) {
    console.error(e);
    alert(`Erro: ${e.message}`);
  } finally {
    setIsLoading(false);
  }
};

const handleSaveEdificadoMatrimonio = async () => {
  setIsLoading(true);
  try {
    const optimizedImage = await recompressBase64(edificadoMatrimonioData.image || "");
    const optimizedHeroImage = await recompressBase64(edificadoMatrimonioData.heroImage || "");

    const optimizedSlides = await Promise.all(
      (edificadoMatrimonioData.slides || []).map(async (s: any) => ({
        ...s,
        url: await recompressBase64(s.url),
      }))
    );

    const optimizedBeliefs = await Promise.all(
      (edificadoMatrimonioData.beliefs || []).map(async (b: any) => ({
        ...b,
        image: await recompressBase64(b.image),
      }))
    );

    const optimizedCursos = await Promise.all(
      (edificadoMatrimonioData.cursos || []).map(async (c: any) => ({
        ...c,
        image: await recompressBase64(c.image),
      }))
    );

    const dataToSave = JSON.parse(JSON.stringify({
      ...edificadoMatrimonioData,
      image: optimizedImage || "",
      heroImage: optimizedHeroImage || "",
      slides: optimizedSlides,
      beliefs: optimizedBeliefs,
      cursos: optimizedCursos,
    }));

    // EXCLUSIVE ACTION: Only edificado_matrimonio document
    await setDoc(doc(db, "content", "edificado_matrimonio"), dataToSave, { merge: true });
    alert("Sucesso: Conteúdo do Edificado Matrimônio foi salvo com exclusividade!");
  } catch (e: any) {
    console.error(e);
    alert("Erro: Não foi possível salvar o conteúdo do Edificado.");
  } finally {
    setIsLoading(false);
  }
};

const handleSaveLeaderRegistration = async () => {
  setIsLoading(true);
  try {
    // STRICT ISOLATION: Only login document
    await setDoc(doc(db, "content", "login"), loginData, { merge: true });
    alert("Sucesso: Configurações de Cadastro de Líder foram salvas!");
  } catch (e: any) {
    console.error(e);
    alert("Erro: Não foi possível salvar o cadastro de líder.");
  } finally {
    setIsLoading(false);
  }
};

const handleSaveCursos = async () => {
  setIsLoading(true);
  try {
    // Auto-recompress base64 images to prevent Document Size limit issues
    const optimizedHeroImage = await recompressBase64(coursesData.heroImage || "");
    const optimizedMethodologyImage = await recompressBase64(coursesData.methodologyImage || "");
    
    const optimizedCursos = await Promise.all(
      (coursesData.cursos || []).map(async (curso: any) => ({
        ...curso,
        image: await recompressBase64(curso.image),
      }))
    );

    const optimizedData = JSON.parse(JSON.stringify({
      ...coursesData,
      heroImage: optimizedHeroImage || "",
      methodologyImage: optimizedMethodologyImage || "",
      cursos: optimizedCursos
    }));

    // STRICT ISOLATION: Only saves to the "cursos" document.
    await setDoc(doc(db, "content", "cursos"), optimizedData, { merge: true });
    
    alert("Sucesso: Alterações de Treinamentos (Cursos) foram salvas!");
  } catch (e: any) {
    console.error(e);
    alert("Erro: Não foi possível salvar os treinamentos. " + (e.message || ""));
  } finally {
    setIsLoading(false);
  }
};

const handleSaveContact = async () => {
  setIsLoading(true);
  try {
    await setDoc(doc(db, "content", "contato"), contactData, { merge: true });
    alert("Sucesso: Alterações da página Contato foram salvas!");
  } catch (e: any) {
    console.error(e);
    alert(`Erro: ${e.message}`);
  } finally {
    setIsLoading(false);
  }
};

const handleSaveFooter = async () => {
  setIsLoading(true);
  try {
    const optimizedFooter = {
      ...footerData,
      logoUrl: footerData.logoUrl ? await recompressBase64(footerData.logoUrl) : footerData.logoUrl,
      ministryLogoUrl: footerData.ministryLogoUrl ? await recompressBase64(footerData.ministryLogoUrl) : footerData.ministryLogoUrl,
    };
    await setDoc(doc(db, "content", "footer"), optimizedFooter, { merge: true });
    alert("Sucesso: Alterações do Rodapé foram salvas!");
  } catch (e: any) {
    console.error(e);
    alert(`Erro: ${e.message}`);
  } finally {
    setIsLoading(false);
  }
};

const handleSaveHeaderLogo = async () => {
  setIsLoading(true);
  try {
    const optimizedHeaderLogo = {
      ...headerLogoData,
      logoUrl: headerLogoData.logoUrl ? await recompressBase64(headerLogoData.logoUrl) : headerLogoData.logoUrl,
    };
    await setDoc(doc(db, "content", "header_logo"), optimizedHeaderLogo, { merge: true });
    alert("Sucesso: Alterações do Logo do Topo foram salvas!");
  } catch (e: any) {
    console.error(e);
    alert(`Erro: ${e.message}`);
  } finally {
    setIsLoading(false);
  }
};

const handleSaveTheme = async () => {
  setIsLoading(true);
  try {
    await setDoc(doc(db, "content", "theme"), { colors: themeData }, { merge: true });
    alert("Sucesso: Alterações de Aparência foram salvas!");
    // Option to reload page to ensure theme provider captures the changes correctly if it's outside tree context or just rely on onSnapshot. The ThemeProvider already uses onSnapshot.
  } catch (e: any) {
    console.error(e);
    alert(`Erro: ${e.message}`);
  } finally {
    setIsLoading(false);
  }
};

const addCoursePageCourse = () => {
  setCoursesData((prev) => ({
    ...prev,
    cursos: [
      {
        id: Date.now(),
        title: "Novo Treinamento",
        instructor: "Instrutor",
        category: "Assinatura",
        bgColor: "bg-blue-900/40",
        isSpecial: false,
        isConferencia: false,
        badge: "",
        tags: "",
        description: "Descrição do treinamento...",
        detailedContent: "",
        duration: "Flexível",
        encontros: "Semanal",
        publico: "Membros e Líderes",
        investment: "Gratuito",
        iconName: "arrowRight",
        image: "",
        isPinned: false,
      },
      ...(prev.cursos || []),
    ],
  }));
};

const addEdificadoCourse = () => {
  setEdificadoMatrimonioData((prev) => ({
    ...prev,
    cursos: [
      {
        id: Date.now(),
        title: "Novo Treinamento",
        instructor: "Instrutor",
        badge: "NOVO",
        description: "",
        image: ""
      },
      ...(prev.cursos || []),
    ]
  }));
};

const renderIconSelector = (curso: any, idx: number) => {
  return (
    <div className="flex gap-2 items-center">
      <label className="text-[10px] text-gray-400 font-bold uppercase">
        Ícone:
      </label>
      <select
        className="text-xs border border-[#c8d8e8] rounded p-1"
        value={curso.iconName || "arrowRight"}
        onChange={(e) => {
          setCoursesData((prev) => ({
            ...prev,
            cursos: prev.cursos.map((c, i) =>
              i === idx ? { ...c, iconName: e.target.value } : c,
            ),
          }));
        }}
      >
        <option value="star">Estrela</option>
        <option value="arrowRight">Seta Direita</option>
      </select>
    </div>
  );
};

// if (!hasGlobalAccess) return null;

const innerContent = (
  <>
    {activeContent === "inicio" ? (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#e2eaf3] shadow-sm">
          <div>
            <h3 className="text-2xl font-black text-[#2D6A9F] tracking-tight">
              Página Início
            </h3>
            <p className="text-sm text-gray-500 font-medium mt-1">Gerencie todo o conteúdo que aparece na página principal do site</p>
          </div>
          <button
            onClick={handleSaveHome}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-[#2D6A9F] text-white rounded-xl font-bold text-sm hover:bg-[#245785] shadow-md disabled:bg-gray-400 transition"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Save size={18} />
            )}
            Salvar Alterações
          </button>
        </div>

        {/* Sub-tabs Navigation */}
        <div className="flex flex-wrap gap-2 p-2 bg-white border border-[#e2eaf3] shadow-sm rounded-2xl w-full">
          {[
            { id: "hero", label: "Hero Banners", icon: "Image" },
            { id: "colunistas", label: "Colunistas", icon: "Users" },
            { id: "noticias", label: "Notícias", icon: "FileText" },
            { id: "videos", label: "Vídeos", icon: "Video" },
            { id: "eventos", label: "Eventos", icon: "Calendar" },
            { id: "missao", label: "Missões", icon: "Heart" },
            { id: "generosidade", label: "Generosidade", icon: "Gift" },
            { id: "app", label: "Aplicativo", icon: "Smartphone" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setInicioSubTab(tab.id as any)}
              className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                inicioSubTab === tab.id
                  ? "bg-[#2D6A9F] text-white shadow-md drop-shadow-sm"
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-[#2D6A9F] border border-transparent hover:border-[#c8d8e8]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {inicioSubTab === "hero" && (
        <div className="animate-fade-in space-y-6">
          <div className="bg-[#f8fafc] border border-[#e2eaf3] rounded-2xl overflow-hidden shadow-sm">
            {/* Header section matching image style */}
            <div className="bg-[#2D6A9F] text-white p-8 space-y-3 flex flex-col items-center justify-center text-center">
              <h2 className="text-2xl font-black tracking-tight drop-shadow-sm">Carrossel de Banners (Hero)</h2>
              <p className="text-sm font-medium text-white/80 max-w-md">
                Altere as imagens e textos que aparecem no topo do site oficial.
              </p>
            </div>
            
            <div className="p-6 md:p-8 space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {(homeData.slides || []).map((slide: any, idx: number) => (
                  <div
                    key={slide.id ? `slide-${slide.id}` : `idx-${idx}`}
                    className="border border-[#c8d8e8] rounded-2xl bg-white shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md"
                  >
                    {/* Card Header matching image style */}
                    <div className="p-4 md:p-5 border-b border-[#e2eaf3] flex justify-between items-center bg-[#fcfdfe]">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 border border-[#c8d8e8] rounded-xl flex justify-center items-center text-[#2D6A9F] bg-white shadow-sm">
                          <ImageIcon size={18} strokeWidth={2.5} />
                        </div>
                        <h3 className="font-bold text-[#2D6A9F] text-base md:text-lg">Banner #{idx + 1}</h3>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg border border-[#e2eaf3] mr-1 md:mr-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (idx === 0) return;
                              setHomeData((prev: any) => {
                                const slides = [...(prev.slides || [])];
                                const temp = slides[idx];
                                slides[idx] = slides[idx - 1];
                                slides[idx - 1] = temp;
                                return { ...prev, slides };
                              });
                            }}
                            disabled={idx === 0}
                            className="p-1.5 text-gray-500 hover:text-[#2D6A9F] hover:bg-white rounded disabled:opacity-30 disabled:hover:bg-transparent transition"
                            title="Mover para Cima"
                          >
                            <ChevronUp size={16} strokeWidth={2.5} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (idx === (homeData.slides || []).length - 1) return;
                              setHomeData((prev: any) => {
                                const slides = [...(prev.slides || [])];
                                const temp = slides[idx];
                                slides[idx] = slides[idx + 1];
                                slides[idx + 1] = temp;
                                return { ...prev, slides };
                              });
                            }}
                            disabled={idx === (homeData.slides || []).length - 1}
                            className="p-1.5 text-gray-500 hover:text-[#2D6A9F] hover:bg-white rounded disabled:opacity-30 disabled:hover:bg-transparent transition"
                            title="Mover para Baixo"
                          >
                            <ChevronDown size={16} strokeWidth={2.5} />
                          </button>
                        </div>

                        <button
                          onClick={() => setSlideToDelete(idx)}
                          className="text-gray-400 hover:text-red-500 transition border border-transparent hover:border-red-100 hover:bg-red-50 p-2 rounded-lg group"
                          type="button"
                          title="Excluir banner"
                        >
                          <Trash2 size={18} className="group-hover:scale-110 transition-transform" />
                        </button>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6">
                      <div className="grid lg:grid-cols-12 gap-8">
                        
                        {/* Imagem do Banner (Left/Top) */}
                        <div className="lg:col-span-5 flex flex-col gap-3 max-w-full">
                          <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-1">
                            Imagem do Banner (1920x600)
                          </label>
                          <div className="relative w-full aspect-[21/9] rounded-xl overflow-hidden bg-gray-50 border-2 border-dashed border-[#c8d8e8] group flex flex-col items-center justify-center text-center">
                            {slide.url ? (
                              <>
                                <img
                                  src={slide.url}
                                  alt="Preview"
                                  className="absolute inset-0 w-full h-full object-cover"
                                />
                                <label className="absolute inset-0 bg-[#2D6A9F]/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center cursor-pointer text-white text-sm font-bold gap-2">
                                  <Upload size={24} />
                                  Trocar Imagem
                                  <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload(e, idx, "home")}
                                  />
                                </label>
                              </>
                            ) : (
                              <label className="absolute inset-0 flex flex-col justify-center items-center cursor-pointer text-[#2D6A9F] hover:bg-[#2D6A9F]/5 transition-colors gap-2">
                                <ImageIcon size={28} className="text-[#2D6A9F]/50" />
                                <span className="text-xs font-bold uppercase px-4">Adicionar Imagem</span>
                                <input
                                  type="file"
                                  className="hidden"
                                  accept="image/*"
                                  onChange={(e) => handleImageUpload(e, idx, "home")}
                                />
                              </label>
                            )}
                          </div>
                          
                          <div className="pt-2">
                            <input
                              type="text"
                              className="w-full p-2.5 text-xs text-gray-500 border border-[#c8d8e8] rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2D6A9F]/20 outline-none transition-all placeholder:text-gray-400"
                              placeholder="Ou cole a URL da imagem aqui..."
                              value={slide.url || ""}
                              onChange={(e) => {
                                const newUrl = e.target.value;
                                setHomeData((prev: any) => ({
                                  ...prev,
                                  slides: prev.slides.map((s: any, i: number) =>
                                    i === idx ? { ...s, url: newUrl } : s,
                                  ),
                                }));
                              }}
                            />
                          </div>
                        </div>

                        {/* Conteudo de Texto (Right/Bottom) */}
                        <div className="lg:col-span-7 flex flex-col justify-center gap-5">
                          <div className="space-y-2 relative group focus-within:z-10">
                            <div className="absolute -left-2 top-0 bottom-0 w-1 bg-[#2D6A9F] rounded-r opacity-50 group-focus-within:opacity-100 transition-opacity"></div>
                            <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-2 block">
                              Título Principal *
                            </label>
                            <input
                              type="text"
                              className="w-full p-3.5 border border-[#c8d8e8] rounded-xl font-black text-lg text-gray-800 bg-gray-50 focus:bg-white focus:border-[#2D6A9F] focus:ring-2 focus:ring-[#2D6A9F]/10 outline-none transition-all"
                              placeholder="Ex: Novo Slide"
                              value={slide.title || ""}
                              onChange={(e) => {
                                const newTitle = e.target.value;
                                setHomeData((prev: any) => ({
                                  ...prev,
                                  slides: prev.slides.map((s: any, i: number) =>
                                    i === idx ? { ...s, title: newTitle } : s,
                                  ),
                                }));
                              }}
                            />
                          </div>
                          <div className="space-y-2 relative group focus-within:z-10">
                            <div className="absolute -left-2 top-0 bottom-0 w-1 bg-[#2D6A9F] rounded-r opacity-50 group-focus-within:opacity-100 transition-opacity"></div>
                            <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-2 block">
                              Subtítulo / Texto de Apoio *
                            </label>
                            <textarea
                              className="w-full p-3.5 border border-[#c8d8e8] rounded-xl text-sm text-gray-600 bg-gray-50 focus:bg-white focus:border-[#2D6A9F] focus:ring-2 focus:ring-[#2D6A9F]/10 outline-none transition-all h-[96px] resize-none"
                              placeholder="Escreva um texto de apoio aqui..."
                              value={slide.subtitle || ""}
                              onChange={(e) => {
                                const newSubtitle = e.target.value;
                                setHomeData((prev: any) => ({
                                  ...prev,
                                  slides: prev.slides.map((s: any, i: number) =>
                                    i === idx ? { ...s, subtitle: newSubtitle } : s,
                                  ),
                                }));
                              }}
                            />
                          </div>
                        </div>
                        
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={addSlide}
                className="w-full py-5 border-2 border-dashed border-[#c8d8e8] bg-gray-50 text-gray-500 rounded-2xl font-bold text-sm hover:border-[#2D6A9F] hover:bg-[#2D6A9F]/5 hover:text-[#2D6A9F] transition-all flex items-center justify-center gap-2 group shadow-sm drop-shadow-sm"
              >
                <div className="p-1.5 bg-white rounded-full group-hover:bg-[#2D6A9F] group-hover:text-white transition-colors border border-[#e2eaf3] group-hover:border-[#2D6A9F]">
                  <Plus size={18} strokeWidth={3} />
                </div>
                <span>Adicionar Novo Banner</span>
              </button>
            
              {/* Footer Section */}
              <div className="pt-6 mt-2 border-t border-[#e2eaf3] flex flex-col-reverse md:flex-row justify-between items-center gap-4">
                <button 
                   onClick={() => {/* no-op for visual back */}} 
                   className="w-full md:w-auto px-8 py-3 bg-white border border-[#c8d8e8] text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition drop-shadow-sm flex items-center justify-center gap-2"
                >
                   <ArrowLeft size={16} /> Voltar
                </button>
                <button 
                   onClick={handleSaveHome} 
                   disabled={isLoading} 
                   className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-[#2D6A9F] text-white rounded-xl font-bold text-sm hover:bg-[#245785] shadow-md disabled:bg-gray-400 transition"
                >
                   {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Salvar Configuração
                </button>
              </div>
            </div>
          </div>
        </div>
        )}

        {inicioSubTab === "colunistas" && (
        <div className="animate-fade-in space-y-6">
<GerenciarColunistasHome />
<div className="h-4" />
<ColunistaPanelComponent activeTab="colunista_meus_artigos" />
        </div>
        )}

        {inicioSubTab === "noticias" && (
        <div className="animate-fade-in space-y-6">
          <div className="bg-[#f8fafc] border border-[#e2eaf3] rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-[#2D6A9F] text-white p-8 space-y-3 flex flex-col items-center justify-center text-center">
              <h2 className="text-2xl font-black tracking-tight drop-shadow-sm">Seção de Notícias</h2>
              <p className="text-sm font-medium text-white/80 max-w-md">
                Últimas Atualizações
              </p>
            </div>
            
            <div className="p-6 md:p-8 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-1">
                    Título da Seção
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 border border-[#c8d8e8] rounded-xl font-bold text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2D6A9F]/20 outline-none transition-all"
                    value={homeData.newsTitle || ""}
                    onChange={(e) =>
                      setHomeData({ ...homeData, newsTitle: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-1">
                    Texto do Link
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 border border-[#c8d8e8] rounded-xl font-bold text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2D6A9F]/20 outline-none transition-all"
                    value={homeData.newsLinkText || ""}
                    onChange={(e) =>
                      setHomeData({ ...homeData, newsLinkText: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="mt-8 space-y-6">
                <div className="flex justify-between items-center">
                  <h5 className="font-bold text-lg text-[#2D6A9F]">Notícias Cadastradas</h5>
                  <button
                    onClick={addNewsItem}
                    className="bg-[#2D6A9F] text-white px-4 py-2 text-sm font-bold rounded-xl flex items-center gap-2 hover:bg-[#245785] transition-colors"
                  >
                    <Plus size={16} /> Nova Notícia
                  </button>
                </div>
                {(homeData.newsItems || []).map((newsItem: any, idx: number) => (
                  <div key={idx} className="border border-[#c8d8e8] rounded-2xl bg-white shadow-sm overflow-hidden flex gap-0 relative flex-col md:flex-row">
                    <div className="flex-1 p-6 space-y-6">
                      <div className="flex justify-between items-center border-b border-[#e2eaf3] pb-4 mb-2">
                        <h4 className="font-bold text-[#2D6A9F] text-md">Notícia #{idx + 1}</h4>
                        <button
                          onClick={() => {
                            setGenericDeleteConfirm({ message: "Tem certeza que deseja excluir esta notícia?", action: () => {
                              const newItems = [...(homeData.newsItems || [])];
                              newItems.splice(idx, 1);
                              setHomeData({ ...homeData, newsItems: newItems });
                            } });
                          }}
                          className="text-gray-400 hover:text-red-500 transition border border-transparent hover:border-red-100 hover:bg-red-50 p-2 rounded-lg"
                          title="Excluir Notícia"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-1">Título</label>
                          <input 
                            className="w-full p-3 border border-[#c8d8e8] rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2D6A9F]/20 outline-none transition-all" 
                            value={newsItem.title || ""} 
                            onChange={(e) => {
                              const newItems = [...(homeData.newsItems || [])];
                              newItems[idx].title = e.target.value;
                              setHomeData({...homeData, newsItems: newItems});
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-1">Categoria</label>
                          <input 
                            className="w-full p-3 border border-[#c8d8e8] rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2D6A9F]/20 outline-none transition-all" 
                            placeholder="Ex: NOVO, BLOG"
                            value={newsItem.category || ""} 
                            onChange={(e) => {
                              const newItems = [...(homeData.newsItems || [])];
                              newItems[idx].category = e.target.value;
                              setHomeData({...homeData, newsItems: newItems});
                            }}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-1">Descrição (Subtítulo)</label>
                        <input 
                          className="w-full p-3 border border-[#c8d8e8] rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2D6A9F]/20 outline-none transition-all" 
                          placeholder="Breve resumo..."
                          value={newsItem.description || ""} 
                          onChange={(e) => {
                            const newItems = [...(homeData.newsItems || [])];
                            newItems[idx].description = e.target.value;
                            setHomeData({...homeData, newsItems: newItems});
                          }}
                        />
                      </div>
                      <div className="grid md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-1">Data</label>
                          <input 
                            className="w-full p-3 border border-[#c8d8e8] rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2D6A9F]/20 outline-none transition-all" 
                            placeholder="Ex: 29/05/2026"
                            value={newsItem.date || ""} 
                            onChange={(e) => {
                              const newItems = [...(homeData.newsItems || [])];
                              newItems[idx].date = e.target.value;
                              setHomeData({...homeData, newsItems: newItems});
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-1">Link URL</label>
                          <input 
                            className="w-full p-3 border border-[#c8d8e8] rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2D6A9F]/20 outline-none transition-all" 
                            placeholder="Ex: https://..."
                            value={newsItem.linkUrl || ""} 
                            onChange={(e) => {
                              const newItems = [...(homeData.newsItems || [])];
                              newItems[idx].linkUrl = e.target.value;
                              setHomeData({...homeData, newsItems: newItems});
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-1">Créditos/Fonte</label>
                          <input 
                            className="w-full p-3 border border-[#c8d8e8] rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2D6A9F]/20 outline-none transition-all" 
                            placeholder="Ex: Nome do Site"
                            value={newsItem.credits || ""} 
                            onChange={(e) => {
                              const newItems = [...(homeData.newsItems || [])];
                              (newItems[idx] as any).credits = e.target.value;
                              setHomeData({...homeData, newsItems: newItems});
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="md:w-64 md:border-l border-t md:border-t-0 border-[#e2eaf3] bg-[#f8fafc] p-6 space-y-4 flex flex-col items-center justify-center">
                      <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Imagem / Capa</label>
                      {newsItem.imageUrl ? (
                        <div className="relative aspect-video rounded-xl overflow-hidden border border-[#c8d8e8] shadow-sm w-full">
                          <img src={newsItem.imageUrl} className="w-full h-full object-cover" alt="" />
                          <button 
                            onClick={() => {
                              const newItems = [...(homeData.newsItems || [])];
                              newItems[idx].imageUrl = "";
                              setHomeData({...homeData, newsItems: newItems});
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-lg p-1.5 shadow"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3 w-full">
                          <div className="aspect-video bg-white rounded-xl border-2 border-dashed border-[#c8d8e8] flex items-center justify-center hover:border-[#2D6A9F] transition-colors">
                            <label className="cursor-pointer text-gray-400 hover:text-[#2D6A9F] flex flex-col items-center w-full h-full justify-center">
                              <Upload size={20} />
                              <span className="text-[10px] font-bold uppercase mt-2">Upload File</span>
                              <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  try {
                                     const base64 = await compressImage(file);
                                     const newItems = [...(homeData.newsItems || [])];
                                     newItems[idx].imageUrl = base64;
                                     setHomeData({...homeData, newsItems: newItems});
                                  } catch(err) {
                                     console.error(err);
                                     alert("Erro ao enviar imagem.");
                                  }
                                }}
                              />
                            </label>
                          </div>
                          <div className="text-center text-[10px] text-gray-400 font-bold uppercase relative">
                             <div className="absolute inset-x-0 top-1/2 h-px bg-[#e2eaf3] -z-10"></div>
                             <span className="bg-[#f8fafc] px-2 text-[#2D6A9F]">ou</span>
                          </div>
                          <input 
                            type="text" 
                            className="w-full p-2.5 border border-[#c8d8e8] rounded-xl text-xs bg-white focus:bg-white focus:ring-2 focus:ring-[#2D6A9F]/20 outline-none transition-all" 
                            placeholder="Link da imagem..."
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val) {
                                const newItems = [...(homeData.newsItems || [])];
                                newItems[idx].imageUrl = val;
                                setHomeData({...homeData, newsItems: newItems});
                              }
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6 mt-6 border-t border-[#e2eaf3] flex flex-col-reverse md:flex-row justify-between items-center gap-4">
                <button 
                   onClick={() => {/* no-op for visual back */}} 
                   className="w-full md:w-auto px-8 py-3 bg-white border border-[#c8d8e8] text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition drop-shadow-sm flex items-center justify-center gap-2"
                >
                   <ArrowLeft size={16} /> Voltar
                </button>
                <button 
                   onClick={handleSaveHome} 
                   disabled={isLoading} 
                   className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-[#2D6A9F] text-white rounded-xl font-bold text-sm hover:bg-[#245785] shadow-md disabled:bg-gray-400 transition"
                >
                   {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Salvar Configuração
                </button>
              </div>
            </div>
          </div>
        </div>
        )}

        {inicioSubTab === "videos" && (
        <div className="animate-fade-in space-y-6">
          <div className="bg-[#f8fafc] border border-[#e2eaf3] rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-[#2D6A9F] text-white p-8 space-y-3 flex flex-col items-center justify-center text-center">
              <h2 className="text-2xl font-black tracking-tight drop-shadow-sm">Vídeos Destacados</h2>
              <p className="text-sm font-medium text-white/80 max-w-md">
                Gerencie os vídeos que aparecem na tela inicial. Use URLs de Embed de vídeo (Ex: Youtube Embed URL).
              </p>
            </div>
            
            <div className="p-6 md:p-8 space-y-6">
              
              <div className="border border-[#c8d8e8] rounded-2xl bg-white shadow-sm overflow-hidden mb-8">
                <div className="p-5 border-b border-[#e2eaf3] bg-[#fcfdfe]">
                  <h3 className="font-bold text-[#2D6A9F] text-lg">Textos da Seção</h3>
                </div>
                <div className="p-6 md:p-8 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-1">
                        Título da Seção
                      </label>
                      <input
                        type="text"
                        className="w-full p-3 border border-[#c8d8e8] rounded-xl font-bold text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2D6A9F]/20 outline-none transition-all"
                        placeholder="Ex: VÍDEOS"
                        value={homeData?.videosTitle || ""}
                        onChange={(e) => setHomeData({ ...homeData, videosTitle: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-1">
                        Texto do Botão
                      </label>
                      <input
                        type="text"
                        className="w-full p-3 border border-[#c8d8e8] rounded-xl font-bold text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2D6A9F]/20 outline-none transition-all"
                        placeholder="Ex: VER MAIS"
                        value={homeData?.videosButtonText || ""}
                        onChange={(e) => setHomeData({ ...homeData, videosButtonText: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-1">
                      Link do Botão
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 border border-[#c8d8e8] rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2D6A9F]/20 outline-none transition-all"
                      placeholder="Ex: /videos"
                      value={homeData?.videosButtonLink || ""}
                      onChange={(e) => setHomeData({ ...homeData, videosButtonLink: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mb-2">
                <h5 className="font-bold text-lg text-[#2D6A9F]">Vídeos Adicionados</h5>
                <button
                  onClick={() => {
                    setHomeData((prev: any) => ({
                      ...prev,
                      videos: [
                        ...(prev.videos || []),
                        {
                          id: `v${Date.now()}`,
                          title: "Novo Vídeo",
                          thumbnail: "",
                          url: ""
                        }
                      ]
                    }));
                  }}
                  className="bg-[#2D6A9F] text-white px-4 py-2 text-sm font-bold rounded-xl flex items-center gap-2 hover:bg-[#245785] transition-colors"
                >
                  <Plus size={16} /> Adicionar Vídeo
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {(homeData.videos || []).map((vid: any, idx: number) => (
                  <div
                    key={vid.id || idx}
                    className="border border-[#c8d8e8] rounded-2xl bg-white shadow-sm overflow-hidden"
                  >
                    <div className="p-5 border-b border-[#e2eaf3] flex justify-between items-center bg-[#fcfdfe]">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 border border-[#c8d8e8] rounded-xl flex justify-center items-center text-[#2D6A9F] bg-white shadow-sm">
                          <ImageIcon size={18} strokeWidth={2.5} />
                        </div>
                        <h3 className="font-bold text-[#2D6A9F] text-lg">Vídeo #{idx + 1}</h3>
                      </div>
                      <button
                        onClick={() => {
                          setGenericDeleteConfirm({ message: "Excluir este vídeo?", action: () => {
                            setHomeData((prev: any) => ({
                              ...prev,
                              videos: prev.videos.filter((_: any, i: number) => i !== idx)
                            }));
                          } });
                        }}
                        className="text-gray-400 hover:text-red-500 transition border border-transparent hover:border-red-100 hover:bg-red-50 p-2 rounded-lg"
                        type="button"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    
                    <div className="p-6">
                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-1">
                              Título do Vídeo *
                            </label>
                            <input
                              type="text"
                              className="w-full p-3 border border-[#c8d8e8] rounded-xl font-bold text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2D6A9F]/20 outline-none transition-all"
                              value={vid.title || ""}
                              onChange={(e) => {
                                const newVideos = [...(homeData.videos || [])];
                                newVideos[idx].title = e.target.value;
                                setHomeData({ ...homeData, videos: newVideos });
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-1">
                              URL do Vídeo (Embed) *
                            </label>
                            <input
                              type="url"
                              className="w-full p-3 border border-[#c8d8e8] rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2D6A9F]/20 outline-none transition-all"
                              placeholder="https://www.youtube.com/embed/..."
                              value={vid.url || ""}
                              onChange={(e) => {
                                const newVideos = [...(homeData.videos || [])];
                                let newUrl = e.target.value;
                                let newThumbnail = newVideos[idx].thumbnail;
                                
                                // Auto-fill thumbnail and convert to Embed URL for YouTube URLs
                                const match = newUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
                                if (match && match[1]) {
                                  newThumbnail = `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
                                  newUrl = `https://www.youtube.com/embed/${match[1]}`;
                                }

                                newVideos[idx] = {
                                  ...newVideos[idx],
                                  url: newUrl,
                                  thumbnail: newThumbnail || newVideos[idx].thumbnail
                                };
                                setHomeData({ ...homeData, videos: newVideos });
                              }}
                            />
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-1">
                              Imagem de Capa (URL ou Upload)
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="url"
                                className="flex-1 p-3 border border-[#c8d8e8] rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2D6A9F]/20 outline-none transition-all"
                                placeholder="https://exemplo.com/imagem.jpg"
                                value={vid.thumbnail || ""}
                                onChange={(e) => {
                                  const newVideos = [...(homeData.videos || [])];
                                  newVideos[idx].thumbnail = e.target.value;
                                  setHomeData({ ...homeData, videos: newVideos });
                                }}
                              />
                              <label className="shrink-0 cursor-pointer px-4 bg-[#f8fafc] border border-[#c8d8e8] rounded-xl text-[#2D6A9F] hover:bg-[#eef4f9] transition flex items-center gap-2 text-[11px] font-bold uppercase overflow-hidden">
                                <Upload size={14} /> Upload
                                <input
                                  type="file"
                                  className="hidden"
                                  accept="image/*"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    if (file.size > 5 * 1024 * 1024) return alert("Máximo 5MB");
                                    try {
                                      const base64String = await compressImage(file);
                                      const newVideos = [...(homeData.videos || [])];
                                      newVideos[idx].thumbnail = base64String;
                                      setHomeData({ ...homeData, videos: newVideos });
                                    } catch (error) {
                                      console.error("Failed to compress image", error);
                                    }
                                  }}
                                />
                              </label>
                            </div>
                            {(() => {
                              let displayThumbnail = vid.thumbnail;
                              if (!displayThumbnail && vid.url) {
                                const match = vid.url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
                                if (match && match[1]) {
                                  displayThumbnail = `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
                                }
                              }
                              return displayThumbnail ? (
                                <div className="pt-2 border-t border-[#e2eaf3] mt-4 relative">
                                  <img src={displayThumbnail} referrerPolicy="no-referrer" alt="Thumbnail preview" className="h-24 w-full object-cover rounded-lg border border-[#e2eaf3] shadow-sm" />
                                  <div className="absolute top-4 right-2 bg-black/60 text-white text-[9px] px-2 py-0.5 rounded uppercase font-bold tracking-wider pointer-events-none">Capa</div>
                                </div>
                              ) : null;
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {(!homeData.videos || homeData.videos.length === 0) && (
                <div className="text-center py-6 text-gray-500 text-sm italic border-2 border-dashed border-[#e2eaf3] rounded-2xl">
                  Nenhum vídeo customizado cadastrado. O site exibirá os vídeos padrão.
                </div>
              )}
              
              <div className="pt-6 mt-6 border-t border-[#e2eaf3] flex flex-col-reverse md:flex-row justify-between items-center gap-4">
                <button 
                   onClick={() => {/* no-op for visual back */}} 
                   className="w-full md:w-auto px-8 py-3 bg-white border border-[#c8d8e8] text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition drop-shadow-sm flex items-center justify-center gap-2"
                >
                   <ArrowLeft size={16} /> Voltar
                </button>
                <button 
                   onClick={handleSaveHome} 
                   disabled={isLoading} 
                   className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-[#2D6A9F] text-white rounded-xl font-bold text-sm hover:bg-[#245785] shadow-md disabled:bg-gray-400 transition"
                >
                   {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Salvar Configuração
                </button>
              </div>
            </div>
          </div>
        </div>
        )}

        {inicioSubTab === "eventos" && (
        <div className="animate-fade-in space-y-6">
          <div className="bg-[#f8fafc] border border-[#e2eaf3] rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-[#2D6A9F] text-white p-8 space-y-3 flex flex-col items-center justify-center text-center">
              <h2 className="text-2xl font-black tracking-tight drop-shadow-sm">Nossos Eventos</h2>
              <p className="text-sm font-medium text-white/80 max-w-md">
                Gerencie os cards de eventos que aparecem na tela inicial.
              </p>
            </div>
            
            <div className="p-6 md:p-8 space-y-6">
              <div className="flex justify-between items-center mb-2">
                <h5 className="font-bold text-lg text-[#2D6A9F]">Eventos Cadastrados</h5>
                <button
                  onClick={() => {
                    setHomeData((prev: any) => ({
                      ...prev,
                      eventos: [
                        ...(prev.eventos || []),
                        {
                          id: `evt${Date.now()}`,
                          title: "Novo Evento",
                          subtitle: "",
                          description: "",
                          badge: "",
                          linkText: "SAIBA MAIS",
                          linkUrl: "",
                          imageUrl: "",
                          theme: "brown"
                        }
                      ]
                    }));
                  }}
                  className="bg-[#2D6A9F] text-white px-4 py-2 text-sm font-bold rounded-xl flex items-center gap-2 hover:bg-[#245785] transition-colors"
                >
                  <Plus size={16} /> Adicionar Evento
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {(homeData.eventos || []).map((evt: any, idx: number) => (
                  <div key={evt.id || idx} className="border border-[#c8d8e8] rounded-2xl bg-white shadow-sm overflow-hidden text-left">
                    <div className="p-5 border-b border-[#e2eaf3] flex justify-between items-center bg-[#fcfdfe]">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 border border-[#c8d8e8] rounded-xl flex justify-center items-center text-[#2D6A9F] bg-white shadow-sm">
                          <Compass size={18} strokeWidth={2.5} />
                        </div>
                        <h3 className="font-bold text-[#2D6A9F] text-lg">Evento #{idx + 1}</h3>
                      </div>
                      <button
                        onClick={() => {
                          setGenericDeleteConfirm({ message: "Tem certeza que deseja excluir este evento?", action: () => {
                            const newEventos = [...(homeData.eventos || [])];
                            newEventos.splice(idx, 1);
                            setHomeData({ ...homeData, eventos: newEventos });
                          } });
                        }}
                        className="text-gray-400 hover:text-red-500 transition border border-transparent hover:border-red-100 hover:bg-red-50 p-2 rounded-lg"
                        title="Remover Evento"
                        type="button"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    
                    <div className="p-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="col-span-2">
                          <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-1 mb-1 block">Título *</label>
                          <input
                            type="text"
                            value={evt.title || ""}
                            onChange={(e) => {
                              const newEventos = [...(homeData.eventos || [])];
                              newEventos[idx].title = e.target.value;
                              setHomeData({ ...homeData, eventos: newEventos });
                            }}
                            className="w-full p-3 text-sm border border-[#c8d8e8] rounded-xl font-bold bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2D6A9F]/20 outline-none transition-all"
                            placeholder="Ex: EBD"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-1 mb-1 block">Subtítulo / Linha 2</label>
                          <input
                            type="text"
                            value={evt.subtitle || ""}
                            onChange={(e) => {
                              const newEventos = [...(homeData.eventos || [])];
                              newEventos[idx].subtitle = e.target.value;
                              setHomeData({ ...homeData, eventos: newEventos });
                            }}
                            className="w-full p-3 text-sm border border-[#c8d8e8] rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2D6A9F]/20 outline-none transition-all"
                            placeholder="Ex: Escola Bíblica Dominical"
                          />
                        </div>
                        
                        <div className="col-span-4">
                          <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-1 mb-1 block">Descrição *</label>
                          <textarea
                            value={evt.description || ""}
                            onChange={(e) => {
                              const newEventos = [...(homeData.eventos || [])];
                              newEventos[idx].description = e.target.value;
                              setHomeData({ ...homeData, eventos: newEventos });
                            }}
                            className="w-full p-3 text-sm border border-[#c8d8e8] rounded-xl h-24 resize-none bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2D6A9F]/20 outline-none transition-all"
                            placeholder="Breve descrição sobre o evento..."
                          />
                        </div>

                        <div className="col-span-2 md:col-span-1">
                          <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-1 mb-1 block">Badge / Categoria</label>
                          <input
                            type="text"
                            value={evt.badge || ""}
                            onChange={(e) => {
                              const newEventos = [...(homeData.eventos || [])];
                              newEventos[idx].badge = e.target.value;
                              setHomeData({ ...homeData, eventos: newEventos });
                            }}
                            className="w-full p-3 text-sm border border-[#c8d8e8] rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2D6A9F]/20 outline-none transition-all"
                            placeholder="Ex: Cursos Online"
                          />
                        </div>

                        <div className="col-span-2 md:col-span-1">
                          <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-1 mb-1 block">Cor do Card</label>
                          <div className="flex items-center gap-3 p-1.5 border border-[#c8d8e8] rounded-xl bg-gray-50">
                            <input
                              type="color"
                              value={evt.theme === "brown" ? "#5d4633" : (evt.theme || "#5d4633")}
                              onChange={(e) => {
                                const newEventos = [...(homeData.eventos || [])];
                                newEventos[idx].theme = e.target.value;
                                setHomeData({ ...homeData, eventos: newEventos });
                              }}
                              className="w-10 h-10 rounded-lg border-none cursor-pointer p-0 bg-transparent"
                            />
                            <span className="text-sm font-mono font-bold text-gray-600 uppercase">{evt.theme === "brown" ? "#5D4633" : (evt.theme || "#5D4633")}</span>
                          </div>
                        </div>

                        <div className="col-span-2 md:col-span-1">
                          <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-1 mb-1 block">Texto do Botão</label>
                          <input
                            type="text"
                            value={evt.linkText || "SAIBA MAIS"}
                            onChange={(e) => {
                              const newEventos = [...(homeData.eventos || [])];
                              newEventos[idx].linkText = e.target.value;
                              setHomeData({ ...homeData, eventos: newEventos });
                            }}
                            className="w-full p-3 text-sm border border-[#c8d8e8] rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2D6A9F]/20 outline-none transition-all"
                            placeholder="Ex: SAIBA MAIS"
                          />
                        </div>

                        <div className="col-span-2 md:col-span-1">
                          <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-1 mb-1 block">URL do Botão</label>
                          <input
                            type="text"
                            value={evt.linkUrl || ""}
                            onChange={(e) => {
                              const newEventos = [...(homeData.eventos || [])];
                              newEventos[idx].linkUrl = e.target.value;
                              setHomeData({ ...homeData, eventos: newEventos });
                            }}
                            className="w-full p-3 text-sm border border-[#c8d8e8] rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2D6A9F]/20 outline-none transition-all"
                            placeholder="Ex: https://..."
                          />
                        </div>
                        
                        <div className="col-span-4 pt-4 border-t border-[#e2eaf3] mt-2">
                          <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-1 mb-3 block">Imagem Fundo/Perfil (Opcional) *</label>
                          <div className="flex items-center gap-4">
                            <label className="cursor-pointer px-5 py-3 bg-[#f8fafc] border border-[#c8d8e8] rounded-xl text-[#2D6A9F] hover:bg-[#eef4f9] transition flex items-center gap-2 text-[11px] font-bold uppercase overflow-hidden">
                              <Upload size={14} /> Upload Imagem
                              <input
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  if (file.size > 5 * 1024 * 1024) return alert("Máximo 5MB");
                                  try {
                                    const reader = new FileReader();
                                    reader.onload = (ev) => {
                                      const newEventos = [...(homeData.eventos || [])];
                                      newEventos[idx].imageUrl = ev.target?.result as string;
                                      setHomeData({ ...homeData, eventos: newEventos });
                                    };
                                    reader.readAsDataURL(file);
                                  } catch (error) {
                                    console.error("Failed to read image", error);
                                  }
                                }}
                                className="hidden"
                              />
                            </label>
                            {evt.imageUrl && (
                               <div className="flex items-center gap-4 bg-gray-50 p-2 pr-4 rounded-xl border border-[#c8d8e8]">
                                 <img src={evt.imageUrl} alt="preview" className="h-12 w-20 object-cover rounded-lg shadow-sm border border-[#e2eaf3]" />
                                 <button className="text-red-500 text-xs font-bold hover:text-red-700 bg-red-100/50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1" onClick={() => {
                                   const newEventos = [...(homeData.eventos || [])];
                                   newEventos[idx].imageUrl = "";
                                   setHomeData({ ...homeData, eventos: newEventos });
                                 }}>
                                   <Trash2 size={12}/> Remover
                                 </button>
                               </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {(!homeData.eventos || homeData.eventos.length === 0) && (
                <div className="text-center py-6 text-gray-500 text-sm italic border-2 border-dashed border-[#e2eaf3] rounded-2xl">
                  Nenhum evento customizado. O site exibirá os eventos padrão.
                </div>
              )}
              
              <div className="pt-6 mt-6 border-t border-[#e2eaf3] flex flex-col-reverse md:flex-row justify-between items-center gap-4">
                <button 
                   onClick={() => {/* no-op for visual back */}} 
                   className="w-full md:w-auto px-8 py-3 bg-white border border-[#c8d8e8] text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition drop-shadow-sm flex items-center justify-center gap-2"
                >
                   <ArrowLeft size={16} /> Voltar
                </button>
                <button 
                   onClick={handleSaveHome} 
                   disabled={isLoading} 
                   className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-[#2D6A9F] text-white rounded-xl font-bold text-sm hover:bg-[#245785] shadow-md disabled:bg-gray-400 transition"
                >
                   {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Salvar Configuração
                </button>
              </div>
            </div>
          </div>
        </div>
        )}

        {inicioSubTab === "missao" && (
        <div className="animate-fade-in space-y-6">
          <div className="bg-[#f8fafc] border border-[#e2eaf3] rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-[#2D6A9F] text-white p-8 space-y-3 flex flex-col items-center justify-center text-center">
              <h2 className="text-2xl font-black tracking-tight drop-shadow-sm">Amamos a Obra Missionária</h2>
              <p className="text-sm font-medium text-white/80 max-w-md">
                Gerencie as informações e imagens da seção de missões da tela inicial.
              </p>
            </div>
            
            <div className="p-6 md:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-2xl border border-[#c8d8e8] shadow-sm">
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-1 mb-1 block">
                    Título Linha 1 *
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 text-sm border border-[#c8d8e8] rounded-xl font-bold bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2D6A9F]/20 outline-none transition-all"
                    value={homeData.missionTitle1 || ""}
                    onChange={(e) =>
                      setHomeData({ ...homeData, missionTitle1: e.target.value })
                    }
                    placeholder="Amamos a obra"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-1 mb-1 block">
                    Título Linha 2 (Laranja) *
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 text-sm border border-[#c8d8e8] rounded-xl font-bold bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2D6A9F]/20 outline-none transition-all"
                    value={homeData.missionTitle2 || ""}
                    onChange={(e) =>
                      setHomeData({ ...homeData, missionTitle2: e.target.value })
                    }
                    placeholder="missionária!"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-[#e2eaf3] space-y-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <h5 className="font-bold text-lg text-[#2D6A9F]">Imagens da Missão</h5>
                    <p className="text-xs text-gray-500">Adicione imagens que representam as ações missionárias.</p>
                  </div>
                  <button
                    onClick={() => {
                      setHomeData({
                        ...homeData,
                        missionImages: [
                          ...(homeData.missionImages || []),
                          { imageUrl: "", linkUrl: "" }
                        ]
                      });
                    }}
                    className="bg-[#2D6A9F] text-white px-4 py-2 text-sm font-bold rounded-xl flex items-center gap-2 hover:bg-[#245785] transition-colors whitespace-nowrap"
                  >
                    <Plus size={16} /> Adicionar Imagem
                  </button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {(homeData.missionImages || []).map((imgObj: any, idx: number) => {
                    const imgUrl = typeof imgObj === 'string' ? imgObj : imgObj?.imageUrl;
                    const linkUrl = typeof imgObj === 'string' ? '' : (imgObj?.linkUrl || '');
                    
                    return (
                    <div key={idx} className="relative flex flex-col gap-3 p-4 bg-white border border-[#c8d8e8] rounded-2xl shadow-sm">
                      <div className="aspect-square border-2 border-dashed border-[#c8d8e8] rounded-xl overflow-hidden group relative bg-gray-50">
                      {imgUrl ? (
                        <>
                          <img src={imgUrl} alt={`Missão ${idx + 1}`} className="w-full h-full object-cover" />
                          <label className="absolute inset-0 bg-[#2D6A9F]/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center cursor-pointer text-white text-xs font-bold gap-2">
                            <Upload size={20} />
                            Trocar Imagem
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (ev) => {
                                    let newImgs = [...(homeData.missionImages || [])];
                                    if (typeof newImgs[idx] === 'string') {
                                       newImgs[idx] = { imageUrl: ev.target?.result as string, linkUrl: '' };
                                    } else {
                                       newImgs[idx] = { ...newImgs[idx], imageUrl: ev.target?.result as string };
                                    }
                                    setHomeData({ ...homeData, missionImages: newImgs });
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                        </>
                      ) : (
                        <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer text-[#2D6A9F] hover:bg-[#2D6A9F] hover:text-white transition-colors">
                          <Upload size={24} className="mb-2" />
                          <span className="text-[10px] font-bold uppercase transition-colors">Nova Imagem</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                  let newImgs = [...(homeData.missionImages || [])];
                                  if (typeof newImgs[idx] === 'string') {
                                     newImgs[idx] = { imageUrl: ev.target?.result as string, linkUrl: '' };
                                  } else {
                                     newImgs[idx] = { ...newImgs[idx], imageUrl: ev.target?.result as string };
                                  }
                                  setHomeData({ ...homeData, missionImages: newImgs });
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      )}
                      </div>
                      
                      <div className="space-y-2">
                        <input 
                          type="text" 
                          placeholder="Título (opcional)" 
                          className="w-full text-xs p-2.5 border border-[#c8d8e8] rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2D6A9F]/20 outline-none transition-all"
                          value={typeof imgObj === 'string' ? '' : (imgObj?.title || '')}
                          onChange={(e) => {
                            let newImgs = [...(homeData.missionImages || [])];
                            if (typeof newImgs[idx] === 'string') {
                               newImgs[idx] = { imageUrl: newImgs[idx], title: e.target.value };
                            } else {
                               newImgs[idx] = { ...newImgs[idx], title: e.target.value };
                            }
                            setHomeData({ ...homeData, missionImages: newImgs });
                          }}
                        />
                        <input 
                          type="text" 
                          placeholder="URL do Link (opcional)" 
                          className="w-full text-xs p-2.5 border border-[#c8d8e8] rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2D6A9F]/20 outline-none transition-all"
                          value={linkUrl}
                          onChange={(e) => {
                            let newImgs = [...(homeData.missionImages || [])];
                            if (typeof newImgs[idx] === 'string') {
                               newImgs[idx] = { imageUrl: newImgs[idx], linkUrl: e.target.value };
                            } else {
                               newImgs[idx] = { ...newImgs[idx], linkUrl: e.target.value };
                            }
                            setHomeData({ ...homeData, missionImages: newImgs });
                          }}
                        />
                      </div>
                      
                      <button
                         onClick={() => {
                           setGenericDeleteConfirm({ message: "Tem certeza que deseja excluir esta imagem?", action: () => {
                             let newImgs = [...(homeData.missionImages || [])];
                             newImgs.splice(idx, 1);
                             setHomeData({ ...homeData, missionImages: newImgs });
                           } });
                         }}
                         className="w-full text-[10px] font-bold text-red-500 hover:text-red-700 uppercase bg-red-50 hover:bg-red-100 p-2 rounded-xl transition-colors mt-1"
                      >
                        Remover
                      </button>
                    </div>
                  )})}
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-[#e2eaf3] flex flex-col-reverse md:flex-row justify-between items-center gap-4">
                <button 
                   onClick={() => {/* no-op for visual back */}} 
                   className="w-full md:w-auto px-8 py-3 bg-white border border-[#c8d8e8] text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition drop-shadow-sm flex items-center justify-center gap-2"
                >
                   <ArrowLeft size={16} /> Voltar
                </button>
                <button 
                   onClick={handleSaveHome} 
                   disabled={isLoading} 
                   className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-[#2D6A9F] text-white rounded-xl font-bold text-sm hover:bg-[#245785] shadow-md disabled:bg-gray-400 transition"
                >
                   {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Salvar Configuração
                </button>
              </div>
            </div>
          </div>
        </div>
        )}

        {inicioSubTab === "generosidade" && (
        <div className="animate-fade-in space-y-6">
          <div className="bg-[#f8fafc] border border-[#e2eaf3] rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-[#2D6A9F] text-white p-8 space-y-3 flex flex-col items-center justify-center text-center">
              <h2 className="text-2xl font-black tracking-tight drop-shadow-sm">Generosidade</h2>
              <p className="text-sm font-medium text-white/80 max-w-md">
                Gerencie os textos e informações de contribuição, como PIX e WhatsApp.
              </p>
            </div>
            
            <div className="p-6 md:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-2xl border border-[#c8d8e8] shadow-sm">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-1 mb-1 block">
                      Etiqueta *
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 text-sm border border-[#c8d8e8] rounded-xl font-bold bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2D6A9F]/20 outline-none transition-all"
                      value={homeData.generosityBadge || ""}
                      onChange={(e) => setHomeData({ ...homeData, generosityBadge: e.target.value })}
                      placeholder="Generosidade"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-1 mb-1 block">
                      Linha Título 1 *
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 text-sm border border-[#c8d8e8] rounded-xl font-bold bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2D6A9F]/20 outline-none transition-all"
                      value={homeData.generosityTitle1 || ""}
                      onChange={(e) => setHomeData({ ...homeData, generosityTitle1: e.target.value })}
                      placeholder="Adoração através da"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-1 mb-1 block">
                      Linha Título 2 *
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 text-sm border border-[#c8d8e8] rounded-xl font-bold bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2D6A9F]/20 outline-none transition-all"
                      value={homeData.generosityTitle2 || ""}
                      onChange={(e) => setHomeData({ ...homeData, generosityTitle2: e.target.value })}
                      placeholder="contribuição."
                    />
                  </div>
                </div>
                
                <div className="space-y-2 h-full flex flex-col items-start bg-gray-50/50 p-4 rounded-xl border border-[#e2eaf3]">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-1 block">
                    Subtítulo / Descrição (Opcional)
                  </label>
                  <textarea
                    className="w-full p-3 text-sm border border-[#c8d8e8] rounded-xl h-full min-h-[140px] resize-none bg-white focus:ring-2 focus:ring-[#2D6A9F]/20 outline-none transition-all"
                    value={homeData.generositySubtitle || ""}
                    onChange={(e) => setHomeData({ ...homeData, generositySubtitle: e.target.value })}
                    placeholder='"Cada um contribua..."'
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Box PIX */}
                <div className="border border-[#c8d8e8] bg-white p-6 rounded-2xl shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#32BCAD]"></div>
                  <h5 className="font-bold text-base mb-5 text-[#32BCAD] flex items-center gap-2">
                    Opção PIX
                  </h5>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-1 block">Título</label>
                      <input type="text" className="w-full p-3 bg-gray-50 border border-[#c8d8e8] rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#32BCAD]/20 outline-none transition-all" value={homeData.generosityPixTitle || ""} onChange={(e) => setHomeData({ ...homeData, generosityPixTitle: e.target.value })} placeholder="Faça um PIX" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-1 block">Subtítulo</label>
                      <input type="text" className="w-full p-3 bg-gray-50 border border-[#c8d8e8] rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#32BCAD]/20 outline-none transition-all" value={homeData.generosityPixSubtitle || ""} onChange={(e) => setHomeData({ ...homeData, generosityPixSubtitle: e.target.value })} placeholder="Use a chave CNPJ..." />
                    </div>
                    <div className="space-y-1 pt-2">
                      <label className="text-[10px] text-[#32BCAD] font-bold uppercase tracking-widest pl-1 block">Chave PIX *</label>
                      <input type="text" className="w-full p-3 bg-white border-2 border-[#32BCAD]/30 focus:border-[#32BCAD] rounded-xl text-lg font-mono font-bold tracking-wider outline-none transition-all text-gray-700" value={homeData.generosityPixKey || ""} onChange={(e) => setHomeData({ ...homeData, generosityPixKey: e.target.value })} placeholder="32795249000127" />
                    </div>
                  </div>
                </div>

                {/* Box Outras Formas */}
                <div className="border border-[#c8d8e8] bg-white p-6 rounded-2xl shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#25D366]"></div>
                  <h5 className="font-bold text-base mb-5 text-[#25D366] flex items-center gap-2">
                    Outras Formas (WhatsApp)
                  </h5>
                  <div className="space-y-4 flex flex-col h-[calc(100%-2.5rem)]">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-1 block">Título</label>
                      <input type="text" className="w-full p-3 bg-gray-50 border border-[#c8d8e8] rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#25D366]/20 outline-none transition-all" value={homeData.generosityOtherFormsTitle || ""} onChange={(e) => setHomeData({ ...homeData, generosityOtherFormsTitle: e.target.value })} placeholder="Outras Formas" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-1 block">Subtítulo</label>
                      <textarea className="w-full p-3 bg-gray-50 border border-[#c8d8e8] rounded-xl text-sm h-full min-h-[80px] resize-none focus:bg-white focus:ring-2 focus:ring-[#25D366]/20 outline-none transition-all" value={homeData.generosityOtherFormsSubtitle || ""} onChange={(e) => setHomeData({ ...homeData, generosityOtherFormsSubtitle: e.target.value })} placeholder="Para transferências bancárias..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="space-y-1">
                        <label className="text-[10px] text-[#25D366] font-bold uppercase tracking-widest pl-1 block">Texto do Botão</label>
                        <input type="text" className="w-full p-3 bg-white border border-[#25D366]/30 focus:border-[#25D366] rounded-xl text-sm font-bold outline-none transition-all text-gray-700" value={homeData.generosityOtherFormsBtnText || ""} onChange={(e) => setHomeData({ ...homeData, generosityOtherFormsBtnText: e.target.value })} placeholder="Falar no WhatsApp" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-[#25D366] font-bold uppercase tracking-widest pl-1 block whitespace-nowrap overflow-hidden text-ellipsis">Link / Número WhatsApp</label>
                        <input type="text" className="w-full p-3 bg-white border-2 border-[#25D366]/30 focus:border-[#25D366] rounded-xl text-sm font-mono outline-none transition-all text-gray-700" value={homeData.generosityOtherFormsBtnLink || ""} onChange={(e) => setHomeData({ ...homeData, generosityOtherFormsBtnLink: e.target.value })} placeholder="Ex: 5511999999999" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-[#e2eaf3] flex flex-col-reverse md:flex-row justify-between items-center gap-4">
                <button 
                   onClick={() => {/* no-op for visual back */}} 
                   className="w-full md:w-auto px-8 py-3 bg-white border border-[#c8d8e8] text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition drop-shadow-sm flex items-center justify-center gap-2"
                >
                   <ArrowLeft size={16} /> Voltar
                </button>
                <button 
                   onClick={handleSaveHome} 
                   disabled={isLoading} 
                   className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-[#2D6A9F] text-white rounded-xl font-bold text-sm hover:bg-[#245785] shadow-md disabled:bg-gray-400 transition"
                >
                   {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Salvar Configuração
                </button>
              </div>
            </div>
          </div>
        </div>
        )}

        {inicioSubTab === "app" && (
        <div className="animate-fade-in space-y-6">
          <div className="bg-[#f8fafc] border border-[#e2eaf3] rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-[#2D6A9F] text-white p-8 space-y-3 flex flex-col items-center justify-center text-center">
              <h2 className="text-2xl font-black tracking-tight drop-shadow-sm">Download do Aplicativo</h2>
              <p className="text-sm font-medium text-white/80 max-w-md">
                Gerencie as informações e links da seção de download do app da igreja.
              </p>
            </div>
            
            <div className="p-6 md:p-8 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-[#c8d8e8] shadow-sm space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-1 mb-1 block">
                    Título Principal *
                  </label>
                  <textarea
                    className="w-full p-4 text-lg border border-[#c8d8e8] rounded-xl font-bold h-24 resize-none bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2D6A9F]/20 outline-none transition-all"
                    value={homeData.appDownloadTitle || ""}
                    onChange={(e) => setHomeData({ ...homeData, appDownloadTitle: e.target.value })}
                    placeholder="Baixe nosso aplicativo e..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-y-6 pt-2">
                  <div className="space-y-2 relative group">
                    <div className="absolute -left-2 top-0 bottom-0 w-1 bg-[#2D6A9F] rounded-r opacity-50 group-focus-within:opacity-100 transition-opacity"></div>
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-2 mb-1 block">
                      Recurso 1 (TV)
                    </label>
                    <textarea
                      className="w-full p-3 text-sm border border-[#c8d8e8] rounded-xl h-20 resize-none bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2D6A9F]/20 outline-none transition-all"
                      value={homeData.appDownloadFeature1 || ""}
                      onChange={(e) => setHomeData({ ...homeData, appDownloadFeature1: e.target.value })}
                      placeholder="Receba conteúdos..."
                    />
                  </div>
                  <div className="space-y-2 relative group">
                    <div className="absolute -left-2 top-0 bottom-0 w-1 bg-[#2D6A9F] rounded-r opacity-50 group-focus-within:opacity-100 transition-opacity"></div>
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-2 mb-1 block">
                      Recurso 2 (Bíblia)
                    </label>
                    <textarea
                      className="w-full p-3 text-sm border border-[#c8d8e8] rounded-xl h-20 resize-none bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2D6A9F]/20 outline-none transition-all"
                      value={homeData.appDownloadFeature2 || ""}
                      onChange={(e) => setHomeData({ ...homeData, appDownloadFeature2: e.target.value })}
                      placeholder="Tenha a Bíblia..."
                    />
                  </div>
                  <div className="space-y-2 relative group">
                    <div className="absolute -left-2 top-0 bottom-0 w-1 bg-[#2D6A9F] rounded-r opacity-50 group-focus-within:opacity-100 transition-opacity"></div>
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-2 mb-1 block">
                      Recurso 3 (Coração)
                    </label>
                    <textarea
                      className="w-full p-3 text-sm border border-[#c8d8e8] rounded-xl h-20 resize-none bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2D6A9F]/20 outline-none transition-all"
                      value={homeData.appDownloadFeature3 || ""}
                      onChange={(e) => setHomeData({ ...homeData, appDownloadFeature3: e.target.value })}
                      placeholder="Faça contribuições..."
                    />
                  </div>
                  <div className="space-y-2 relative group">
                    <div className="absolute -left-2 top-0 bottom-0 w-1 bg-[#2D6A9F] rounded-r opacity-50 group-focus-within:opacity-100 transition-opacity"></div>
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-2 mb-1 block">
                      Recurso 4 (Inscrições)
                    </label>
                    <textarea
                      className="w-full p-3 text-sm border border-[#c8d8e8] rounded-xl h-20 resize-none bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2D6A9F]/20 outline-none transition-all"
                      value={homeData.appDownloadFeature4 || ""}
                      onChange={(e) => setHomeData({ ...homeData, appDownloadFeature4: e.target.value })}
                      placeholder="Faça inscrições..."
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-6 bg-white p-6 rounded-2xl border border-[#c8d8e8] shadow-sm">
                  <h5 className="font-bold text-sm text-gray-600 border-b border-[#e2eaf3] pb-2">Links das Lojas</h5>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-1 mb-1 flex items-center gap-2">
                        Link Google Play
                      </label>
                      <input
                        type="text"
                        className="w-full p-3 text-sm border border-[#c8d8e8] rounded-xl bg-gray-50 focus:bg-white focus:border-[#3bcc8d] focus:ring-2 focus:ring-[#3bcc8d]/20 outline-none transition-all"
                        value={homeData.appDownloadPlayStoreUrl || ""}
                        onChange={(e) => setHomeData({ ...homeData, appDownloadPlayStoreUrl: e.target.value })}
                        placeholder="https://play.google.com/..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-1 mb-1 flex items-center gap-2">
                        Link App Store
                      </label>
                      <input
                        type="text"
                        className="w-full p-3 text-sm border border-[#c8d8e8] rounded-xl bg-gray-50 focus:bg-white focus:border-[#007aff] focus:ring-2 focus:ring-[#007aff]/20 outline-none transition-all"
                        value={homeData.appDownloadAppStoreUrl || ""}
                        onChange={(e) => setHomeData({ ...homeData, appDownloadAppStoreUrl: e.target.value })}
                        placeholder="https://apps.apple.com/..."
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6 bg-white p-6 rounded-2xl border border-[#c8d8e8] shadow-sm">
                  <h5 className="font-bold text-sm text-gray-600 border-b border-[#e2eaf3] pb-2">Visual</h5>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-1 mb-1 block">
                        Cor de Fundo da Seção
                      </label>
                      <div className="flex items-center gap-3 p-1.5 border border-[#c8d8e8] rounded-xl bg-gray-50">
                        <input
                          type="color"
                          className="w-10 h-10 rounded-lg border-none cursor-pointer p-0 bg-transparent"
                          value={homeData.appDownloadBgColor || "#7A8C66"}
                          onChange={(e) => setHomeData({ ...homeData, appDownloadBgColor: e.target.value })}
                        />
                        <input
                          type="text"
                          className="flex-1 p-2 text-sm font-mono font-bold uppercase tracking-wider bg-transparent border-0 outline-none"
                          value={homeData.appDownloadBgColor || "#7A8C66"}
                          onChange={(e) => setHomeData({ ...homeData, appDownloadBgColor: e.target.value })}
                          placeholder="#7A8C66"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-1 mb-1 block">
                        Imagem do Celular (URL ou Upload)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          className="flex-1 p-3 text-sm border border-[#c8d8e8] rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2D6A9F]/20 outline-none transition-all overflow-hidden text-ellipsis"
                          value={homeData.appDownloadImage || "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?... "}
                          onChange={(e) => setHomeData({ ...homeData, appDownloadImage: e.target.value })}
                          placeholder="URL da imagem..."
                        />
                        <label className="shrink-0 cursor-pointer px-4 bg-[#f8fafc] border border-[#c8d8e8] rounded-xl text-[#2D6A9F] hover:bg-[#eef4f9] transition flex items-center gap-2 text-[11px] font-bold uppercase overflow-hidden">
                          <Upload size={14} /> Upload
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              if (file.size > 5 * 1024 * 1024) {
                                alert("A imagem é muito grande. Escolha uma imagem de até 5MB.");
                                return;
                              }
                              try {
                                const base64String = await compressImage(file);
                                setHomeData({ ...homeData, appDownloadImage: base64String });
                              } catch (error) {
                                console.error("Erro ao processar imagem", error);
                                alert("Erro ao processar imagem.");
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-[#e2eaf3] flex flex-col-reverse md:flex-row justify-between items-center gap-4">
                <button 
                   onClick={() => {/* no-op for visual back */}} 
                   className="w-full md:w-auto px-8 py-3 bg-white border border-[#c8d8e8] text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition drop-shadow-sm flex items-center justify-center gap-2"
                >
                   <ArrowLeft size={16} /> Voltar
                </button>
                <button 
                   onClick={handleSaveHome} 
                   disabled={isLoading} 
                   className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-[#2D6A9F] text-white rounded-xl font-bold text-sm hover:bg-[#245785] shadow-md disabled:bg-gray-400 transition"
                >
                   {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Salvar Configuração
                </button>
              </div>
            </div>
          </div>
        </div>
        )}

      </div>
    ) : activeContent === "quem_somos" ? (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#e2eaf3] shadow-sm">
          <div>
            <h3 className="text-2xl font-black text-[#2D6A9F] tracking-tight">
              Página Quem Somos
            </h3>
            <p className="text-sm text-gray-500 font-medium mt-1">Gerencie a história, princípios e liderança da igreja</p>
          </div>
          <button
            onClick={handleSaveAbout}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-[#2D6A9F] text-white rounded-xl font-bold text-sm hover:bg-[#245785] shadow-md disabled:bg-gray-400 transition"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Save size={18} />
            )}
            Salvar Alterações
          </button>
        </div>

        {/* Sub-tabs Navigation */}
        <div className="flex flex-wrap gap-2 p-2 bg-white border border-[#e2eaf3] shadow-sm rounded-2xl w-full">
          {[
            { id: "historia", label: "Nossa História", icon: "BookOpen" },
            { id: "principios", label: "Princípios e Valores", icon: "Star" },
            { id: "ministerio", label: "Equipe Ministerial", icon: "Users" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setQuemSomosSubTab(tab.id as any)}
              className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                quemSomosSubTab === tab.id
                  ? "bg-[#2D6A9F] text-white shadow-md drop-shadow-sm"
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-[#2D6A9F] border border-transparent hover:border-[#c8d8e8]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {quemSomosSubTab === "historia" && (
        <div className="animate-fade-in space-y-6">
        <div className="bg-[#fcfdfe] border border-[#e2eaf3] p-8 rounded-2xl space-y-6">
          <h4 className="font-bold text-primary-base mb-2 flex items-center gap-2">
            Cabeçalho (Hero)
          </h4>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-bold uppercase">
                Título Principal
              </label>
              <input
                type="text"
                className="w-full p-2 border border-[#c8d8e8] rounded-lg font-bold text-sm"
                value={aboutData.title || ""}
                onChange={(e) =>
                  setAboutData({ ...aboutData, title: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-bold uppercase">
                Subtítulo
              </label>
              <textarea
                className="w-full p-2 border border-[#c8d8e8] rounded-lg text-xs h-16"
                value={aboutData.subtitle || ""}
                onChange={(e) =>
                  setAboutData({
                    ...aboutData,
                    subtitle: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <button
            onClick={handleSaveAbout}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-base text-white rounded-lg font-bold text-sm hover:bg-primary-dark shadow-sm disabled:bg-gray-400 transition mt-6"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Save size={18} />
            )}{" "}
            Salvar Alterações
          </button>
        </div>

        <div className="bg-[#fcfdfe] border border-[#e2eaf3] p-8 rounded-2xl space-y-6">
          <h4 className="font-bold text-primary-base mb-2 flex items-center gap-2">
            Nossa História
          </h4>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-bold uppercase">
                Imagem (Recomendado: 800x600px)
              </label>
              <div className="flex gap-4 items-center">
                {aboutData.historyImage && (
                  <img
                    src={aboutData.historyImage}
                    alt="Preview"
                    className="h-40 w-60 object-cover rounded-md border shadow-sm p-1 bg-white shrink-0"
                  />
                )}
                <input
                  type="text"
                  className="flex-1 p-2 border border-[#c8d8e8] rounded-lg text-xs"
                  placeholder="URL da Imagem"
                  value={aboutData.historyImage || ""}
                  onChange={(e) =>
                    setAboutData({
                      ...aboutData,
                      historyImage: e.target.value,
                    })
                  }
                />
                <label className="shrink-0 cursor-pointer p-2 bg-[#f7fafd] border border-[#c8d8e8] rounded-lg text-primary-base hover:bg-primary-bg transition flex items-center gap-1 text-[10px] font-bold uppercase overflow-hidden">
                  <Upload size={14} /> Upload
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 5 * 1024 * 1024)
                        return alert("Imagem muito grande.");
                      const b64 = await compressImage(file);
                      setAboutData({ ...aboutData, historyImage: b64 });
                    }}
                  />
                </label>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-bold uppercase">
                Título da Seção História
              </label>
              <input
                type="text"
                className="w-full p-2 border border-[#c8d8e8] rounded-lg font-bold text-sm"
                value={aboutData.historyTitle || ""}
                onChange={(e) =>
                  setAboutData({
                    ...aboutData,
                    historyTitle: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-bold uppercase">
                Texto da História (separe os parágrafos com pular linha)
              </label>
              <textarea
                className="w-full p-2 border border-[#c8d8e8] rounded-lg text-sm h-64 leading-relaxed"
                value={aboutData.historyText || ""}
                onChange={(e) =>
                  setAboutData({
                    ...aboutData,
                    historyText: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <button
            onClick={handleSaveAbout}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-base text-white rounded-lg font-bold text-sm hover:bg-primary-dark shadow-sm disabled:bg-gray-400 transition mt-6"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Save size={18} />
            )}{" "}
            Salvar Alterações
          </button>
        </div>
        </div>
        )}

        {quemSomosSubTab === "principios" && (
        <div className="animate-fade-in space-y-6">
        <div className="bg-[#fcfdfe] border border-[#e2eaf3] p-8 rounded-2xl space-y-6">
          <h4 className="font-bold text-primary-base mb-2 flex items-center gap-2">
            Princípios (Missão, Visão e Valores)
          </h4>
          <div className="space-y-1 pb-4 border-b border-[#e2eaf3]">
            <label className="text-[10px] text-gray-400 font-bold uppercase">
              Título da Seção
            </label>
            <input
              type="text"
              className="w-full p-2 border border-[#c8d8e8] rounded-lg font-bold text-sm"
              value={aboutData.principlesTitle || ""}
              onChange={(e) =>
                setAboutData({
                  ...aboutData,
                  principlesTitle: e.target.value,
                })
              }
            />
          </div>
          <div className="space-y-4">
            {(aboutData.principles || []).map((principle: any, idx: number) => (
              <div
                key={principle.id || idx}
                className="p-4 border border-[#e2eaf3] rounded-xl bg-white relative"
              >
                <button
                  onClick={() => setPrincipleToDelete(idx)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700 bg-red-50 p-1 rounded-md transition"
                  title="Remover"
                >
                  <Trash2 size={16} />
                </button>
                <div className="grid md:grid-cols-[1fr_2fr] gap-6">
                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      Imagem (Opcional - Recomendado: 800x600px - Exibe no lugar
                      do ícone se preenchida)
                    </label>
                    {principle.image && (
                      <img
                        src={principle.image}
                        alt="Preview"
                        className="h-40 w-full object-cover rounded-lg mt-2 border shadow-sm mx-auto"
                      />
                    )}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="flex-1 p-2 border border-[#c8d8e8] rounded-lg text-xs"
                        placeholder="URL da Imagem (Opcional)"
                        value={principle.image || ""}
                        onChange={(e) => {
                          const newUrl = e.target.value;
                          setAboutData((prev: any) => ({
                            ...prev,
                            principles: prev.principles.map(
                              (p: any, i: number) =>
                                i === idx ? { ...p, image: newUrl } : p,
                            ),
                          }));
                        }}
                      />
                      <label className="shrink-0 cursor-pointer p-2 bg-[#f7fafd] border border-[#c8d8e8] rounded-lg text-primary-base hover:bg-primary-bg transition flex items-center gap-1 text-[10px] font-bold uppercase overflow-hidden">
                        <Upload size={14} />
                        Upload
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (file.size > 5 * 1024 * 1024)
                              return alert(
                                "A imagem não pode ter mais que 5MB.",
                              );
                            try {
                              const base64String = await compressImage(file);
                              setAboutData((prev: any) => ({
                                ...prev,
                                principles: prev.principles.map(
                                  (p: any, i: number) =>
                                    i === idx
                                      ? { ...p, image: base64String }
                                      : p,
                                ),
                              }));
                            } catch (err) {
                              console.error("Failed to compress image", err);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">
                        Título
                      </label>
                      <input
                        type="text"
                        className="w-full p-2 border border-[#c8d8e8] rounded-lg font-bold text-sm"
                        value={principle.title || ""}
                        onChange={(e) => {
                          const newTitle = e.target.value;
                          setAboutData((prev: any) => ({
                            ...prev,
                            principles: prev.principles.map(
                              (p: any, i: number) =>
                                i === idx ? { ...p, title: newTitle } : p,
                            ),
                          }));
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">
                        Descrição
                      </label>
                      <textarea
                        className="w-full p-2 border border-[#c8d8e8] rounded-lg text-xs h-20"
                        value={principle.description || ""}
                        onChange={(e) => {
                          const newDesc = e.target.value;
                          setAboutData((prev: any) => ({
                            ...prev,
                            principles: prev.principles.map(
                              (p: any, i: number) =>
                                i === idx ? { ...p, description: newDesc } : p,
                            ),
                          }));
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={addPrinciple}
            className="w-full py-3 border-2 border-dashed border-primary-base text-primary-base rounded-xl font-bold text-sm hover:bg-primary-bg transition"
          >
            + Adicionar Novo Item
          </button>

          <button
            onClick={handleSaveAbout}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-base text-white rounded-lg font-bold text-sm hover:bg-primary-dark shadow-sm disabled:bg-gray-400 transition mt-6"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Save size={18} />
            )}{" "}
            Salvar Alterações
          </button>
        </div>
        </div>
        )}

        {quemSomosSubTab === "ministerio" && (
        <div className="animate-fade-in space-y-6">
        <div className="bg-[#fcfdfe] border border-[#e2eaf3] p-8 rounded-2xl space-y-6">
          <h4 className="font-bold text-primary-base mb-2 flex items-center gap-2">
            Ministério (Liderança e Apoio)
          </h4>
          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase">
                  Título Seção Inferior
                </label>
                <input
                  type="text"
                  className="w-full p-2 border border-[#c8d8e8] rounded-lg font-bold text-sm"
                  value={aboutData.teamTitle || ""}
                  onChange={(e) =>
                    setAboutData({
                      ...aboutData,
                      teamTitle: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase">
                  Logo (Recomendado: 200x200px)
                </label>
                <div className="flex gap-3 items-center">
                  {aboutData.teamLogo && (
                    <img
                      src={aboutData.teamLogo}
                      alt="Preview Logo"
                      className="h-16 w-16 object-contain rounded-md border shadow-sm p-1 bg-white shrink-0"
                    />
                  )}
                  <input
                    type="text"
                    className="flex-1 p-2 border border-[#c8d8e8] rounded-lg text-xs"
                    placeholder="URL ou Upload"
                    value={aboutData.teamLogo || ""}
                    onChange={(e) =>
                      setAboutData({
                        ...aboutData,
                        teamLogo: e.target.value,
                      })
                    }
                  />
                  <label className="shrink-0 cursor-pointer p-2 bg-[#f7fafd] border border-[#c8d8e8] rounded-lg text-primary-base hover:bg-primary-bg transition flex items-center gap-1 text-[10px] font-bold uppercase overflow-hidden">
                    <Upload size={14} /> Upload
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 5 * 1024 * 1024)
                          return alert("Imagem muito grande.");
                        const b64 = await compressImage(file);
                        setAboutData({ ...aboutData, teamLogo: b64 });
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-bold uppercase">
                Título Caixa de Destaque
              </label>
              <input
                type="text"
                className="w-full p-2 border border-[#c8d8e8] rounded-lg font-bold text-sm"
                value={aboutData.teamBoxTitle || ""}
                onChange={(e) =>
                  setAboutData({
                    ...aboutData,
                    teamBoxTitle: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-bold uppercase">
                Texto Caixa de Destaque (Use **texto** para negrito)
              </label>
              <textarea
                className="w-full p-2 border border-[#c8d8e8] rounded-lg text-xs h-24"
                value={aboutData.teamBoxText || ""}
                onChange={(e) =>
                  setAboutData({
                    ...aboutData,
                    teamBoxText: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-bold uppercase">
                Imagem Caixa de Destaque (Opcional - Recomendado: 400x400px -
                Ícone ou Foto)
              </label>
              <div className="flex gap-4 items-center">
                {aboutData.teamBoxImage && (
                  <img
                    src={aboutData.teamBoxImage}
                    alt="Preview"
                    className="h-40 w-40 object-cover rounded-md border shadow-sm p-1 bg-white shrink-0"
                  />
                )}
                <input
                  type="text"
                  className="flex-1 p-2 border border-[#c8d8e8] rounded-lg text-xs"
                  placeholder="URL ou Upload"
                  value={aboutData.teamBoxImage || ""}
                  onChange={(e) =>
                    setAboutData({
                      ...aboutData,
                      teamBoxImage: e.target.value,
                    })
                  }
                />
                <label className="shrink-0 cursor-pointer p-2 bg-[#f7fafd] border border-[#c8d8e8] rounded-lg text-primary-base hover:bg-primary-bg transition flex items-center gap-1 text-[10px] font-bold uppercase overflow-hidden">
                  <Upload size={14} /> Upload
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 5 * 1024 * 1024)
                        return alert("Imagem muito grande.");
                      const b64 = await compressImage(file);
                      setAboutData({ ...aboutData, teamBoxImage: b64 });
                    }}
                  />
                </label>
              </div>
            </div>
          </div>
          <button
            onClick={handleSaveAbout}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-base text-white rounded-lg font-bold text-sm hover:bg-primary-dark shadow-sm disabled:bg-gray-400 transition mt-6"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Save size={18} />
            )}{" "}
            Salvar Alterações
          </button>
        </div>
        </div>
        )}
      </div>
    ) : activeContent === "edificado_matrimonio" ? (
      <div className="aba-edificado-matrimonio space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#e2eaf3] shadow-sm">
          <div>
            <h3 className="text-2xl font-black text-[#2D6A9F] tracking-tight">
              Edificado Matrimônio
            </h3>
            <p className="text-sm text-gray-500 font-medium mt-1">Gerencie banners, crenças e treinamentos desta página especial</p>
          </div>
          <button
            onClick={handleSaveEdificadoMatrimonio}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-[#2D6A9F] text-white rounded-xl font-bold text-sm hover:bg-[#245785] shadow-md disabled:bg-gray-400 transition transform active:scale-95"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Save size={18} />
            )}
            {edificadoSubTab === "cursos_editor" ? "Salvar Lista de Cursos" : "Salvar Conteúdo"}
          </button>
        </div>

        <div className="flex flex-wrap gap-2 p-2 bg-white border border-[#e2eaf3] shadow-sm rounded-2xl w-full">
          {[
            { id: "hero", label: "Banners" },
            { id: "crencas", label: "No que Acreditamos" },
            { id: "cursos_editor", label: "Treinamentos" },
            { id: "cta", label: "Rodapé (CTA)" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setEdificadoSubTab(tab.id as any)}
              className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                edificadoSubTab === tab.id
                  ? "bg-[#2D6A9F] text-white shadow-md drop-shadow-sm"
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-[#2D6A9F] border border-transparent hover:border-[#c8d8e8]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {edificadoSubTab === "hero" && (
          <div className="animate-fade-in space-y-6">

          {/* Carousel Section */}
          <div className="bg-[#f8fafc] border border-[#e2eaf3] rounded-2xl overflow-hidden shadow-sm">
            {/* Header section matching image style */}
            <div className="bg-[#2D6A9F] text-white p-8 space-y-3 flex flex-col items-center justify-center text-center">
              <h2 className="text-2xl font-black tracking-tight drop-shadow-sm">Carrossel de Banners (Hero)</h2>
              <p className="text-sm font-medium text-white/80 max-w-md">
                Altere as imagens e textos que aparecem no topo do site oficial.
              </p>
            </div>

            <div className="p-6 md:p-8 space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {(edificadoMatrimonioData.slides || []).map(
                  (slide: any, idx: number) => (
                    <div
                      key={slide.id ? `slide-${slide.id}` : `idx-${idx}`}
                      className="border border-[#c8d8e8] rounded-2xl bg-white shadow-sm overflow-hidden"
                    >
                      {/* Card Header matching image style */}
                      <div className="p-5 border-b border-[#e2eaf3] flex justify-between items-center bg-[#fcfdfe]">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 border border-[#c8d8e8] rounded-xl flex justify-center items-center text-[#2D6A9F] bg-white shadow-sm">
                            <ImageIcon size={18} strokeWidth={2.5} />
                          </div>
                          <h3 className="font-bold text-[#2D6A9F] text-lg">{idx + 1}. Configuração do Slide</h3>
                        </div>
                        <button
                          onClick={() => setSlideToDelete(idx)}
                          className="text-gray-400 hover:text-red-500 transition border border-transparent hover:border-red-100 hover:bg-red-50 p-2 rounded-lg"
                          type="button"
                          title="Excluir slide"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      {/* Card Body */}
                      <div className="p-6 space-y-6">
                        <div className="grid md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-1">
                                Imagem (Max 5MB) *
                              </label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  className="flex-1 p-3 border border-[#c8d8e8] rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2D6A9F]/20 outline-none transition-all"
                                  placeholder="URL da Imagem"
                                  value={slide.url}
                                  onChange={(e) => {
                                    const newUrl = e.target.value;
                                    setEdificadoMatrimonioData((prev) => ({
                                      ...prev,
                                      slides: prev.slides.map((s, i) =>
                                        i === idx ? { ...s, url: newUrl } : s,
                                      ),
                                    }));
                                  }}
                                />
                                <label className="shrink-0 cursor-pointer px-4 bg-[#f8fafc] border border-[#c8d8e8] rounded-xl text-[#2D6A9F] hover:bg-[#eef4f9] transition flex items-center gap-2 text-[11px] font-bold uppercase overflow-hidden">
                                  <Upload size={14} /> Upload
                                  <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload(e, idx, "edificado")}
                                  />
                                </label>
                              </div>
                              <p className="text-[10px] text-gray-500 pl-1">
                                Tamanho recomendado: 1920x1080 px (Proporção 16:9)
                              </p>
                              {slide.url && (
                                <div className="pt-2 border-t border-[#e2eaf3] mt-4">
                                  <img
                                    src={slide.url}
                                    alt="Preview"
                                    className="h-24 w-full object-cover rounded-lg border border-[#e2eaf3] shadow-sm"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-1">
                                Título Principal *
                              </label>
                              <input
                                type="text"
                                className="w-full p-3 border border-[#c8d8e8] rounded-xl font-bold text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2D6A9F]/20 outline-none transition-all"
                                value={slide.title || ""}
                                onChange={(e) => {
                                  const newTitle = e.target.value;
                                  setEdificadoMatrimonioData((prev) => ({
                                    ...prev,
                                    slides: prev.slides.map((s, i) =>
                                      i === idx ? { ...s, title: newTitle } : s,
                                    ),
                                  }));
                                }}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-1">
                                Subtítulo / Texto de Apoio *
                              </label>
                              <textarea
                                className="w-full p-3 border border-[#c8d8e8] rounded-xl text-sm h-24 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#2D6A9F]/20 outline-none transition-all resize-none"
                                value={slide.subtitle || ""}
                                onChange={(e) => {
                                  const newSubtitle = e.target.value;
                                  setEdificadoMatrimonioData((prev) => ({
                                    ...prev,
                                    slides: prev.slides.map((s, i) =>
                                      i === idx ? { ...s, subtitle: newSubtitle } : s,
                                    ),
                                  }));
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#e2eaf3]">
                          <div className="border border-[#e2eaf3] rounded-xl p-4 bg-[#fcfdfe] space-y-4">
                            <h5 className="text-[11px] font-bold text-[#2D6A9F] uppercase tracking-wider">
                              Botão 1 (Principal)
                            </h5>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-[9px] text-gray-400 font-bold uppercase">Texto</label>
                                <input
                                  type="text"
                                  placeholder="Ex: Nossos Cursos"
                                  className="w-full p-2 border border-[#c8d8e8] rounded-lg text-xs bg-gray-50 focus:bg-white"
                                  value={slide.button1Text || ""}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setEdificadoMatrimonioData((prev) => ({
                                      ...prev,
                                      slides: prev.slides.map((s, i) =>
                                        i === idx ? { ...s, button1Text: val } : s,
                                      ),
                                    }));
                                  }}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] text-gray-400 font-bold uppercase">Link</label>
                                <input
                                  type="text"
                                  placeholder="Ex: /cursos"
                                  className="w-full p-2 border border-[#c8d8e8] rounded-lg text-xs bg-gray-50 focus:bg-white"
                                  value={slide.button1Link || ""}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setEdificadoMatrimonioData((prev) => ({
                                      ...prev,
                                      slides: prev.slides.map((s, i) =>
                                        i === idx ? { ...s, button1Link: val } : s,
                                      ),
                                    }));
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div className="border border-[#e2eaf3] rounded-xl p-4 bg-[#fcfdfe] space-y-4">
                            <h5 className="text-[11px] font-bold text-[#2D6A9F] uppercase tracking-wider">
                              Botão 2 (Secundário)
                            </h5>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-[9px] text-gray-400 font-bold uppercase">Texto</label>
                                <input
                                  type="text"
                                  placeholder="Ex: Saiba Mais"
                                  className="w-full p-2 border border-[#c8d8e8] rounded-lg text-xs bg-gray-50 focus:bg-white"
                                  value={slide.button2Text || ""}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setEdificadoMatrimonioData((prev) => ({
                                      ...prev,
                                      slides: prev.slides.map((s, i) =>
                                        i === idx ? { ...s, button2Text: val } : s,
                                      ),
                                    }));
                                  }}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] text-gray-400 font-bold uppercase">Link</label>
                                <input
                                  type="text"
                                  placeholder="Ex: /quem-somos"
                                  className="w-full p-2 border border-[#c8d8e8] rounded-lg text-xs bg-gray-50 focus:bg-white"
                                  value={slide.button2Link || ""}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setEdificadoMatrimonioData((prev) => ({
                                      ...prev,
                                      slides: prev.slides.map((s, i) =>
                                        i === idx ? { ...s, button2Link: val } : s,
                                      ),
                                    }));
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>

              <button
                onClick={addEdificadoSlide}
                className="w-full py-4 border-2 border-dashed border-[#2D6A9F] text-[#2D6A9F] rounded-2xl font-bold text-sm hover:bg-[#2D6A9F]/5 transition-colors"
              >
                + Adicionar Novo Slide ao Carrossel
              </button>

              {/* Footer Section */}
              <div className="pt-6 mt-2 border-t border-[#e2eaf3] flex flex-col-reverse md:flex-row justify-between items-center gap-4">
                <button 
                   onClick={() => {/* no-op for visual back */}} 
                   className="w-full md:w-auto px-8 py-3 bg-white border border-[#c8d8e8] text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition drop-shadow-sm flex items-center justify-center gap-2"
                >
                   <ArrowLeft size={16} /> Voltar
                </button>
                <button 
                   onClick={handleSaveEdificadoMatrimonio} 
                   disabled={isLoading} 
                   className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-[#2D6A9F] text-white rounded-xl font-bold text-sm hover:bg-[#245785] shadow-md disabled:bg-gray-400 transition"
                >
                   {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Salvar Configuração
                </button>
              </div>
            </div>
          </div>
          </div>
        )}

        {edificadoSubTab === "crencas" && (
          <div className="animate-fade-in space-y-10">

          {/* Beliefs Section */}
          <div id="section-beliefs" className="bg-[#fcfdfe] border border-[#e2eaf3] p-8 rounded-2xl space-y-6 scroll-mt-6">
            <h4 className="font-bold text-primary-dark mb-2 flex items-center gap-2">
              Seção: No que Acreditamos
            </h4>
            <div className="grid md:grid-cols-2 gap-6 pb-4 border-b border-[#e2eaf3]">
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Título da Seção
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-[#c8d8e8] rounded-xl font-bold text-primary-dark"
                  value={edificadoMatrimonioData.beliefsTitle || ""}
                  onChange={(e) =>
                    setEdificadoMatrimonioData({
                      ...edificadoMatrimonioData,
                      beliefsTitle: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Frase de Destaque
                </label>
                <textarea
                  className="w-full p-3 border border-[#c8d8e8] rounded-xl h-[52px] text-[#2c4a63]"
                  value={edificadoMatrimonioData.beliefsHighlight || ""}
                  onChange={(e) =>
                    setEdificadoMatrimonioData({
                      ...edificadoMatrimonioData,
                      beliefsHighlight: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(edificadoMatrimonioData.beliefs || []).map(
                (belief: any, idx: number) => (
                  <div
                    key={belief.id ? `belief-${belief.id}` : `idx-${idx}`}
                    className="p-5 border border-[#e2eaf3] rounded-xl bg-white space-y-3 relative shadow-sm"
                  >
                    <button
                      onClick={() => setBeliefToDelete(idx)}
                      className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition"
                      type="button"
                      title="Excluir item"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">
                        Ícone/Imagem (Max 5MB)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          className="flex-1 p-2 border border-[#c8d8e8] rounded-lg text-xs"
                          placeholder="URL da Imagem (Opcional)"
                          value={belief.image || ""}
                          onChange={(e) => {
                            const newUrl = e.target.value;
                            setEdificadoMatrimonioData((prev) => ({
                              ...prev,
                              beliefs: prev.beliefs.map((b, i) =>
                                i === idx ? { ...b, image: newUrl } : b,
                              ),
                            }));
                          }}
                        />
                        <label className="shrink-0 cursor-pointer p-2 bg-[#f7fafd] border border-[#c8d8e8] rounded-lg text-primary-base hover:bg-primary-bg transition flex items-center gap-1 text-[10px] font-bold uppercase overflow-hidden">
                          <Upload size={14} />
                          Upload
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleBeliefImageUpload(e, idx, "edificado")}
                          />
                        </label>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1">
                        Tamanho recomendado: 500x250 px (Proporção 2:1)
                      </p>
                      {belief.image && (
                        <img
                          src={belief.image}
                          alt="Preview"
                          className="h-24 w-full object-cover rounded-lg mt-2 border shadow-sm mx-auto"
                        />
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">
                        Título
                      </label>
                      <input
                        type="text"
                        className="w-full p-2 border border-[#c8d8e8] rounded-lg font-bold text-sm"
                        value={belief.title || ""}
                        onChange={(e) => {
                          const newTitle = e.target.value;
                          setEdificadoMatrimonioData((prev) => ({
                            ...prev,
                            beliefs: prev.beliefs.map((b, i) =>
                              i === idx ? { ...b, title: newTitle } : b,
                            ),
                          }));
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">
                        Descrição
                      </label>
                      <textarea
                        className="w-full p-2 border border-[#c8d8e8] rounded-lg text-xs h-20"
                        value={belief.description || ""}
                        onChange={(e) => {
                          const newDesc = e.target.value;
                          setEdificadoMatrimonioData((prev) => ({
                            ...prev,
                            beliefs: prev.beliefs.map((b, i) =>
                              i === idx ? { ...b, description: newDesc } : b,
                            ),
                          }));
                        }}
                      />
                    </div>
                  </div>
                ),
              )}
            </div>

            <button
              onClick={addEdificadoBelief}
              className="w-full py-3 border-2 border-dashed border-primary-base text-primary-base rounded-xl font-bold text-sm hover:bg-primary-bg transition"
            >
              + Adicionar Novo Item (Crença)
            </button>
            <button
              onClick={handleSaveEdificadoMatrimonio}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-base text-white rounded-lg font-bold text-sm hover:bg-primary-dark shadow-sm disabled:bg-gray-400 transition"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              Salvar Alterações
            </button>
          </div>

        </div>
        )}
        
        {edificadoSubTab === "cta" && (
          <div className="animate-fade-in space-y-10">
            {/* CTA Section Config */}
            <div id="section-cta" className="bg-[#fcfdfe] border border-[#e2eaf3] p-8 rounded-2xl space-y-6">
              <h4 className="font-bold text-primary-dark mb-2 flex items-center gap-2">
                Seção: Chamada para Ação (Rodapé)
              </h4>
              <div className="grid grid-cols-1 gap-6 pb-4">
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    Texto Principal
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 border border-[#c8d8e8] rounded-xl font-bold text-primary-dark"
                    value={edificadoMatrimonioData.ctaTitle || ""}
                    onChange={(e) =>
                      setEdificadoMatrimonioData({
                        ...edificadoMatrimonioData,
                        ctaTitle: e.target.value,
                      })
                    }
                    placeholder="Interessado em saber mais sobre o treinamento?"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    Texto do Botão
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 border border-[#c8d8e8] rounded-xl font-bold text-primary-dark"
                    value={edificadoMatrimonioData.ctaButtonText || ""}
                    onChange={(e) =>
                      setEdificadoMatrimonioData({
                        ...edificadoMatrimonioData,
                        ctaButtonText: e.target.value,
                      })
                    }
                    placeholder="Fale Conosco"
                  />
                </div>
              </div>
              <button
                onClick={handleSaveEdificadoMatrimonio}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-base text-white rounded-lg font-bold text-sm hover:bg-primary-dark shadow-sm disabled:bg-gray-400 transition"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Save size={18} />
                )}
                Salvar Chamada para Ação
              </button>
            </div>
          </div>
        )}
        
        {edificadoSubTab === "cursos_editor" && (
          <div className="aba-gestao-cursos animate-fade-in space-y-6">
            <div className="bg-[#fcfdfe] border border-[#e2eaf3] rounded-2xl p-8 shadow-sm text-left">
              <div className="mb-8 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Título da Seção de Treinamentos</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-[#c8d8e8] rounded-lg font-bold text-sm"
                    value={edificadoMatrimonioData.cursosSectionTitle || ""}
                    onChange={(e) => setEdificadoMatrimonioData({...edificadoMatrimonioData, cursosSectionTitle: e.target.value})}
                    placeholder="Nossos Cursos e Treinamentos"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Subtítulo</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-[#c8d8e8] rounded-lg text-sm"
                    value={edificadoMatrimonioData.cursosSectionSubtitle || ""}
                    onChange={(e) => setEdificadoMatrimonioData({...edificadoMatrimonioData, cursosSectionSubtitle: e.target.value})}
                    placeholder="Encontre a mentoria ideal..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mb-8">
                <div>
                  <h4 className="text-lg font-black text-primary-dark">Lista de Treinamentos (Edificado Matrimônio)</h4>
                  <p className="text-xs text-gray-500">Clique em um card para editar suas informações.</p>
                </div>
                <button
                  onClick={addEdificadoCourse}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-base text-white rounded-lg font-bold text-xs hover:bg-primary-dark transition shadow-sm"
                >
                  <Plus size={16} /> Adicionar Novo
                </button>
              </div>

              {/* Visual Card Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {edificadoMatrimonioData?.cursos?.map((curso: any, idx: number) => (
                  <div
                    key={idx}
                    onClick={() => setEditingEdificadoCourseIndex(idx)}
                    className="group relative rounded-2xl overflow-hidden shadow-lg cursor-pointer transform hover:scale-[1.02] transition-all duration-300 border-2 border-transparent hover:border-primary-base"
                  >
                    <div className="aspect-[4/5] relative">
                      {curso.image ? (
                        <img src={curso.image} alt={curso.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-primary-dark/80 flex items-center justify-center">
                          <ImageIcon size={40} className="text-white/20" />
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                      
                      <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                        <h5 className="text-2xl font-black mb-1 leading-tight break-words">{curso.title || "Sem Título"}</h5>
                        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">TREINAMENTO</p>
                        <p className="text-base font-bold italic mb-4">{curso.instructor || "Facilitador"}</p>
                      </div>
                    </div>

                    <div className="absolute inset-0 bg-primary-base/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <div className="bg-white text-primary-base px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2 shadow-xl scale-90 group-hover:scale-100 transition-transform">
                         <Edit3 size={14} /> Editar Dados
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          
<div className="pt-6 mt-4 border-t border-[#e2eaf3] flex justify-end"><button onClick={handleSaveCursos} disabled={isLoading} className="flex items-center gap-2 px-6 py-2 bg-primary-base text-white rounded-lg font-bold text-sm hover:bg-primary-dark shadow-sm disabled:bg-gray-400 transition">{isLoading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Salvar Configuração</button></div>
</div>
        )}
      </div>
    ) : activeContent === "login" ? (
      <div className="aba-login space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#e2eaf3] shadow-sm">
          <div>
            <h3 className="text-2xl font-black text-[#2D6A9F] tracking-tight">
              Página de Login
            </h3>
            <p className="text-sm text-gray-500 font-medium mt-1">Configure o visual e os textos da tela de login do aplicativo</p>
          </div>
          <button
            onClick={handleSaveLeaderRegistration}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-[#2D6A9F] text-white rounded-xl font-bold text-sm hover:bg-[#245785] shadow-md disabled:bg-gray-400 transition"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Save size={18} />
            )}
            Salvar Cadastro de Líder
          </button>
        </div>

        <div id="section-leader-dedicated" className="bg-[#fcfdfe] border border-[#e2eaf3] p-8 rounded-2xl space-y-6 scroll-mt-6">
          <h4 className="font-bold text-primary-dark mb-2 flex items-center gap-2">
            <Lock className="text-primary-base" size={20} />
            Configurações: Cadastro de Líder
          </h4>
          <p className="text-xs text-gray-500 mb-4 italic">
            Edite os textos que aparecem na tela de login/cadastro para novos líderes.
          </p>
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-bold uppercase">Título</label>
              <input
                type="text"
                className="w-full p-2 border border-[#c8d8e8] rounded-lg font-bold text-sm"
                value={loginData.title || ""}
                onChange={(e) =>
                  setLoginData({ ...loginData, title: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-bold uppercase">Subtítulo</label>
              <input
                type="text"
                className="w-full p-2 border border-[#c8d8e8] rounded-lg text-sm"
                value={loginData.subtitle || ""}
                onChange={(e) =>
                  setLoginData({
                    ...loginData,
                    subtitle: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-bold uppercase">Texto do Quadro Informativo</label>
              <textarea
                rows={3}
                className="w-full p-2 border border-[#c8d8e8] rounded-lg text-xs"
                value={loginData.boxText || ""}
                onChange={(e) =>
                  setLoginData({
                    ...loginData,
                    boxText: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-bold uppercase">Texto de Aviso (Atenção)</label>
              <textarea
                rows={2}
                className="w-full p-2 border border-[#c8d8e8] rounded-lg text-xs"
                value={loginData.warningText || ""}
                onChange={(e) =>
                  setLoginData({
                    ...loginData,
                    warningText: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-bold uppercase">Texto Secundário (Armazenamento)</label>
              <textarea
                rows={2}
                className="w-full p-2 border border-[#c8d8e8] rounded-lg text-xs"
                value={loginData.infoText || ""}
                onChange={(e) =>
                  setLoginData({
                    ...loginData,
                    infoText: e.target.value,
                  })
                }
              />
            </div>
          </div>
        
<div className="pt-6 mt-4 border-t border-[#e2eaf3] flex justify-end"><button onClick={handleSaveCursos} disabled={isLoading} className="flex items-center gap-2 px-6 py-2 bg-primary-base text-white rounded-lg font-bold text-sm hover:bg-primary-dark shadow-sm disabled:bg-gray-400 transition">{isLoading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Salvar Configuração</button></div>
</div>
      </div>
    ) : activeContent === "cursos" ? (
      <div className="aba-gestao-cursos space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#e2eaf3] shadow-sm">
          <div>
            <h3 className="text-2xl font-black text-[#2D6A9F] tracking-tight">
              Página de Cursos
            </h3>
            <p className="text-sm text-gray-500 font-medium mt-1">Configure a estrutura da página e gerencie seus treinamentos</p>
          </div>
          <button
            onClick={handleSaveCursos}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-[#2D6A9F] text-white rounded-xl font-bold text-sm hover:bg-[#245785] shadow-md disabled:bg-gray-400 transition"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Save size={18} />
            )}
            Salvar Configurações
          </button>
        </div>

        {/* Sub-tabs Navigation */}
        <div className="flex flex-wrap gap-2 p-2 bg-white border border-[#e2eaf3] shadow-sm rounded-2xl w-full md:w-fit">
          {[
            { id: "geral", label: "Estrutura da Página", icon: "Settings" },
            { id: "editor", label: "Gestão Visual de Cursos", icon: "Grid" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setCoursesSubTab(tab.id as any)}
              className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                coursesSubTab === tab.id
                  ? "bg-[#2D6A9F] text-white shadow-md drop-shadow-sm"
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-[#2D6A9F] border border-transparent hover:border-[#c8d8e8]"
              }`}
            >
              <span className="flex items-center justify-center -ml-1">
                {/* Visual align */}
              </span>
              {tab.label}
            </button>
          ))}
        </div>

        {coursesSubTab === "geral" ? (
          <div className="space-y-8 animate-fade-in">
            <div id="section-trainings" className="space-y-6 scroll-mt-6">
              <div className="bg-[#fcfdfe] border border-[#e2eaf3] p-8 rounded-2xl space-y-6 text-left">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-primary-base flex items-center gap-2">
                    <ImageIcon size={18} /> Página de Cursos: Cabeçalho (Hero)
                  </h4>
                </div>
                <div className="space-y-1 mb-4">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">
                    Etiqueta Superior (Tagline)
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-[#c8d8e8] rounded-lg font-bold text-sm"
                    value={coursesData.heroTagline || ""}
                    onChange={(e) =>
                      setCoursesData({
                        ...coursesData,
                        heroTagline: e.target.value,
                      })
                    }
                    placeholder="MAIS QUE CURSOS, UMA JORNADA"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase">
                      Título Principal
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border border-[#c8d8e8] rounded-lg font-bold text-sm"
                      value={coursesData.title || ""}
                      onChange={(e) =>
                        setCoursesData({
                          ...coursesData,
                          title: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase">
                      Subtítulo
                    </label>
                    <textarea
                      className="w-full p-2 border border-[#c8d8e8] rounded-lg text-xs h-16"
                      value={coursesData.subtitle || ""}
                      onChange={(e) =>
                        setCoursesData({
                          ...coursesData,
                          subtitle: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-8 pt-6 border-t border-[#e2eaf3]">
                  <div className="space-y-3">
                    <label className="text-[10px] text-gray-400 font-bold uppercase block">
                      Capa Principal (Banner Hero)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="flex-1 p-2 border border-[#c8d8e8] rounded-lg text-xs"
                        placeholder="URL da Imagem (Opcional)"
                        value={coursesData.heroImage || ""}
                        onChange={(e) => setCoursesData({ ...coursesData, heroImage: e.target.value })}
                      />
                      <label className="shrink-0 cursor-pointer p-2 bg-[#f7fafd] border border-[#c8d8e8] rounded-lg text-primary-base hover:bg-primary-bg transition flex items-center gap-1 text-[10px] font-bold uppercase overflow-hidden">
                        <Upload size={14} />
                        Upload
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => handleCoursesGeneralImageUpload(e, "heroImage")}
                        />
                      </label>
                    </div>
                    {coursesData.heroImage && (
                      <div className="mt-2 relative group">
                        <img
                          src={coursesData.heroImage}
                          alt="Banner Preview"
                          className="w-full h-32 object-cover rounded-lg border shadow-sm"
                        />
                        <button
                          onClick={() => setGenericDeleteConfirm({ message: "Tem certeza que deseja remover esta imagem?", action: () => setCoursesData({ ...coursesData, heroImage: "" }) })}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                    <p className="text-[10px] text-gray-400">Recomendado: 1920x600 px (Dê preferência para imagens escuras para leitura do texto sobreposto)</p>
                  </div>
                </div>
              
<div className="pt-6 mt-4 border-t border-[#e2eaf3] flex justify-end"><button onClick={handleSaveCursos} disabled={isLoading} className="flex items-center gap-2 px-6 py-2 bg-primary-base text-white rounded-lg font-bold text-sm hover:bg-primary-dark shadow-sm disabled:bg-gray-400 transition">{isLoading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Salvar Configuração</button></div>
</div>

              <div className="bg-[#fcfdfe] border border-[#e2eaf3] p-8 rounded-2xl space-y-6 text-left">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-primary-base flex items-center gap-2">
                    <Grid size={18} /> Características do Treinamento
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[0, 1, 2].map((index) => (
                    <div key={index} className="space-y-4 p-4 border border-[#e2eaf3] rounded-xl bg-white">
                      <h5 className="font-bold text-sm text-primary-dark">Card {index + 1}</h5>
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-400 font-bold uppercase">Ícone</label>
                        <select
                          className="w-full p-2 border border-[#c8d8e8] rounded-lg text-xs"
                          value={coursesData.featuresData?.[index]?.icon || (index === 0 ? "BookOpen" : index === 1 ? "Users" : "Compass")}
                          onChange={(e) => {
                             const newFeatures = [...(coursesData.featuresData || Array(3).fill({}))];
                             newFeatures[index] = { ...newFeatures[index], icon: e.target.value };
                             setCoursesData({ ...coursesData, featuresData: newFeatures });
                          }}
                        >
                          <option value="BookOpen">Livro (Base Bíblica)</option>
                          <option value="Users">Pessoas (Mentoria)</option>
                          <option value="Compass">Bússola (Caminho)</option>
                          <option value="CheckCircle">Check (Concluído)</option>
                          <option value="Heart">Coração (Apoio)</option>
                          <option value="Star">Estrela (Excelência)</option>
                          <option value="Target">Alvo (Objetivo)</option>
                          <option value="GraduationCap">Capelo (Treinamento)</option>
                          <option value="Video">Vídeo (Aulas)</option>
                          <option value="FileText">Arquivo (Materiais)</option>
                          <option value="Globe">Mundo (Global)</option>
                          <option value="Trophy">Troféu (Vitória)</option>
                          <option value="Award">Medalha (Recompensa)</option>
                          <option value="ShieldCheck">Escudo (Segurança)</option>
                          <option value="PlayCircle">Play (Vídeo)</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-400 font-bold uppercase">Título</label>
                        <input
                          type="text"
                          className="w-full p-2 border border-[#c8d8e8] rounded-lg text-xs font-bold"
                          value={coursesData.featuresData?.[index]?.title || ""}
                          onChange={(e) => {
                             const newFeatures = [...(coursesData.featuresData || Array(3).fill({}))];
                             newFeatures[index] = { ...newFeatures[index], title: e.target.value };
                             setCoursesData({ ...coursesData, featuresData: newFeatures });
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-400 font-bold uppercase">Descrição</label>
                        <textarea
                          className="w-full p-2 border border-[#c8d8e8] rounded-lg text-xs h-24"
                          value={coursesData.featuresData?.[index]?.description || ""}
                          onChange={(e) => {
                             const newFeatures = [...(coursesData.featuresData || Array(3).fill({}))];
                             newFeatures[index] = { ...newFeatures[index], description: e.target.value };
                             setCoursesData({ ...coursesData, featuresData: newFeatures });
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-6 mt-4 border-t border-[#e2eaf3] flex justify-end">
                  <button onClick={handleSaveCursos} disabled={isLoading} className="flex items-center gap-2 px-6 py-2 bg-primary-base text-white rounded-lg font-bold text-sm hover:bg-primary-dark shadow-sm disabled:bg-gray-400 transition">
                    {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Salvar Configuração
                  </button>
                </div>
              </div>

              <div className="bg-[#fcfdfe] border border-[#e2eaf3] p-8 rounded-2xl space-y-6 text-left">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-primary-base flex items-center gap-2">
                    <ShieldCheck size={18} /> Metodologia de Ensino
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] text-gray-400 font-bold uppercase block">
                      Imagem de Metodologia (Seção do Meio)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="flex-1 p-2 border border-[#c8d8e8] rounded-lg text-xs"
                        placeholder="URL da Imagem (Opcional)"
                        value={coursesData.methodologyImage || ""}
                        onChange={(e) => setCoursesData({ ...coursesData, methodologyImage: e.target.value })}
                      />
                      <label className="shrink-0 cursor-pointer p-2 bg-[#f7fafd] border border-[#c8d8e8] rounded-lg text-primary-base hover:bg-primary-bg transition flex items-center gap-1 text-[10px] font-bold uppercase overflow-hidden">
                        <Upload size={14} />
                        Upload
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => handleCoursesGeneralImageUpload(e, "methodologyImage")}
                        />
                      </label>
                    </div>
                    {coursesData.methodologyImage && (
                      <div className="mt-2 relative group">
                        <img
                          src={coursesData.methodologyImage}
                          alt="Methodology Preview"
                          className="w-full h-32 object-cover rounded-lg border shadow-sm"
                        />
                        <button
                          onClick={() => setGenericDeleteConfirm({ message: "Tem certeza que deseja remover esta imagem?", action: () => setCoursesData({ ...coursesData, methodologyImage: "" }) })}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                    <p className="text-[10px] text-gray-400">Recomendado: 800x800 px (Quadrado)</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">Título da Metodologia</label>
                      <input
                        type="text"
                        className="w-full p-2 border border-[#c8d8e8] rounded-lg font-bold text-sm"
                        value={coursesData.methodologyTitle || ""}
                        onChange={(e) => setCoursesData({ ...coursesData, methodologyTitle: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">Itens da Metodologia (Um por linha)</label>
                      <textarea
                        rows={4}
                        className="w-full p-2 border border-[#c8d8e8] rounded-lg text-xs"
                        value={coursesData.methodologyItems?.join("\n") || ""}
                        onChange={(e) => setCoursesData({ 
                          ...coursesData, 
                          methodologyItems: e.target.value.split("\n").filter(item => item.trim() !== "") 
                        })}
                        placeholder="Certifique-se de colocar um item por linha"
                      />
                    </div>
                  </div>
                </div>
                <div className="pt-6 mt-4 border-t border-[#e2eaf3] flex justify-end">
                  <button onClick={handleSaveCursos} disabled={isLoading} className="flex items-center gap-2 px-6 py-2 bg-primary-base text-white rounded-lg font-bold text-sm hover:bg-primary-dark shadow-sm disabled:bg-gray-400 transition">
                    {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Salvar Configuração
                  </button>
                </div>
              </div>

              <div className="bg-[#fcfdfe] border border-[#e2eaf3] p-8 rounded-2xl space-y-6 text-left">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-primary-base flex items-center gap-2">
                    Seção Inferior (Cursos)
                  </h4>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">
                        Título Inferior
                      </label>
                      <input
                        type="text"
                        className="w-full p-2 border border-[#c8d8e8] rounded-lg font-bold text-sm"
                        value={coursesData.bottomTitle || ""}
                        onChange={(e) =>
                          setCoursesData({
                            ...coursesData,
                            bottomTitle: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">
                        Subtítulo Inferior
                      </label>
                      <input
                        type="text"
                        className="w-full p-2 border border-[#c8d8e8] rounded-lg text-sm"
                        value={coursesData.bottomSubtitle || ""}
                        onChange={(e) =>
                          setCoursesData({
                            ...coursesData,
                            bottomSubtitle: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">
                        Texto do Botão
                      </label>
                      <input
                        type="text"
                        className="w-full p-2 border border-[#c8d8e8] rounded-lg text-xs font-bold"
                        value={coursesData.bottomButtonText || ""}
                        onChange={(e) =>
                          setCoursesData({
                            ...coursesData,
                            bottomButtonText: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">
                        Link do Botão
                      </label>
                      <input
                        type="text"
                        className="w-full p-2 border border-[#c8d8e8] rounded-lg text-xs"
                        value={coursesData.bottomButtonLink || ""}
                        onChange={(e) =>
                          setCoursesData({
                            ...coursesData,
                            bottomButtonLink: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="pt-6 mt-4 border-t border-[#e2eaf3] flex justify-end">
                  <button onClick={handleSaveCursos} disabled={isLoading} className="flex items-center gap-2 px-6 py-2 bg-primary-base text-white rounded-lg font-bold text-sm hover:bg-primary-dark shadow-sm disabled:bg-gray-400 transition">
                    {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Salvar Configuração
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* NEW AND EXCLUSIVE VISUAL EDITOR */
          <div className="aba-gestao-cursos animate-fade-in space-y-6">
            <div className="bg-[#fcfdfe] border rounded-2xl p-6 shadow-sm text-left mb-6">
              <h4 className="text-lg font-black text-primary-dark mb-4">Gestão Visual de Cursos</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">
                    Título da Seção de Cursos (Ex: OS NOSSOS CURSOS)
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-[#c8d8e8] rounded-lg font-bold text-sm"
                    value={coursesData.sectionTitle || ""}
                    onChange={(e) =>
                      setCoursesData({
                        ...coursesData,
                        sectionTitle: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">
                    Subtítulo da Seção (Ex: CONHEÇA TODOS)
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-[#c8d8e8] rounded-lg text-sm"
                    value={coursesData.sectionSubtitle || ""}
                    onChange={(e) =>
                      setCoursesData({
                        ...coursesData,
                        sectionSubtitle: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">
                    Categorias de Filtro (Separadas por vírgula)
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-[#c8d8e8] rounded-lg text-sm"
                    value={coursesData.categories?.join(", ") || ""}
                    onChange={(e) =>
                      setCoursesData({
                        ...coursesData,
                        categories: e.target.value.split(",").map(c => c.trim()).filter(c => !!c),
                      })
                    }
                  />
                </div>
              </div>
            
<div className="pt-6 mt-4 border-t border-[#e2eaf3] flex justify-end"><button onClick={handleSaveCursos} disabled={isLoading} className="flex items-center gap-2 px-6 py-2 bg-primary-base text-white rounded-lg font-bold text-sm hover:bg-primary-dark shadow-sm disabled:bg-gray-400 transition">{isLoading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Salvar Configuração</button></div>
</div>

            <div className="bg-white border rounded-2xl p-6 shadow-sm text-left">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h4 className="text-lg font-black text-primary-dark">Editor Visual de Treinamentos</h4>
                  <p className="text-xs text-gray-500">Clique em um card para editar suas informações exclusivas</p>
                </div>
                <button
                  onClick={addCoursePageCourse}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-base text-white rounded-lg font-bold text-xs hover:bg-primary-dark transition shadow-sm"
                >
                  <Plus size={16} /> Adicionar Novo
                </button>
              </div>

              {/* Visual Card Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {coursesData.cursos.map((curso: any, idx: number) => (
                  <div
                    key={idx}
                    onClick={() => setEditingCourseIndex(idx)}
                    className="group relative rounded-2xl overflow-hidden shadow-lg cursor-pointer transform hover:scale-[1.02] transition-all duration-300 border-2 border-transparent hover:border-primary-base"
                  >
                    {/* Simulator of the site card */}
                    <div className="aspect-[4/5] relative">
                      {curso.image ? (
                        <img src={curso.image} alt={curso.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-primary-dark/80 flex items-center justify-center">
                          <ImageIcon size={40} className="text-white/20" />
                        </div>
                      )}
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                      
                      {/* Content */}
                      <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                        <h5 className="text-2xl font-black mb-1 leading-tight break-words">{curso.title || "Sem Título"}</h5>
                        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">CURSO COM</p>
                        <p className="text-base font-bold italic mb-4">{curso.instructor || "Facilitador"}</p>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-white/20">
                          <span className="text-[10px] font-bold tracking-widest opacity-80 uppercase">ORVALHO.COM</span>
                          <div className="w-6 h-6 rounded-full border border-white/40 flex items-center justify-center">
                            <ShieldCheck size={12} className="text-white/60" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Editor Overlay */}
                    <div className="absolute inset-0 bg-primary-base/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <div className="bg-white text-primary-base px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2 shadow-xl scale-90 group-hover:scale-100 transition-transform">
                         <Edit3 size={14} /> Editar Dados Exclusivos
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    ) : activeContent === "contatos" ? (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#e2eaf3] shadow-sm">
          <div>
            <h3 className="text-2xl font-black text-[#2D6A9F] tracking-tight">
              Página Contatos
            </h3>
            <p className="text-sm text-gray-500 font-medium mt-1">Gerencie as informações de contato, mapa e redes sociais</p>
          </div>
          <button
            onClick={handleSaveContact}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-[#2D6A9F] text-white rounded-xl font-bold text-sm hover:bg-[#245785] shadow-md disabled:bg-gray-400 transition"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Save size={18} />
            )}
            Salvar Alterações
          </button>
        </div>

        <div className="bg-[#fcfdfe] border border-[#e2eaf3] p-8 rounded-2xl space-y-6">
          <h4 className="font-bold text-primary-base mb-2 flex items-center gap-2">
            Cabeçalho e Informações
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-bold uppercase">
                Título Principal
              </label>
              <input
                type="text"
                className="w-full p-2 border border-[#c8d8e8] rounded-lg font-bold text-sm"
                value={contactData.title || ""}
                onChange={(e) =>
                  setContactData({
                    ...contactData,
                    title: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-bold uppercase">
                Subtítulo
              </label>
              <input
                type="text"
                className="w-full p-2 border border-[#c8d8e8] rounded-lg text-sm"
                value={contactData.subtitle || ""}
                onChange={(e) =>
                  setContactData({
                    ...contactData,
                    subtitle: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-bold uppercase">
                Título Formulário
              </label>
              <input
                type="text"
                className="w-full p-2 border border-[#c8d8e8] rounded-lg font-bold text-sm"
                value={contactData.formTitle || ""}
                onChange={(e) =>
                  setContactData({
                    ...contactData,
                    formTitle: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-bold uppercase">
                Título Canais de Atendimento
              </label>
              <input
                type="text"
                className="w-full p-2 border border-[#c8d8e8] rounded-lg font-bold text-sm"
                value={contactData.channelsTitle || ""}
                onChange={(e) =>
                  setContactData({
                    ...contactData,
                    channelsTitle: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-bold uppercase">
                E-mail de Contato
              </label>
              <input
                type="text"
                className="w-full p-2 border border-[#c8d8e8] rounded-lg text-sm"
                value={contactData.emailText || ""}
                onChange={(e) =>
                  setContactData({
                    ...contactData,
                    emailText: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 font-bold uppercase">
                WhatsApp / Telefone
              </label>
              <input
                type="text"
                className="w-full p-2 border border-[#c8d8e8] rounded-lg text-sm"
                value={contactData.phoneText || ""}
                onChange={(e) => {
                  let v = e.target.value.replace(/\D/g, "");
                  if (v.length > 13) v = v.substring(0, 13);

                  if (v.length > 12) {
                    v = v.replace(
                      /^(\d{2})(\d{2})(\d{5})(\d{4}).*/,
                      "+$1 ($2) $3-$4",
                    );
                  } else if (v.length > 11) {
                    v = v.replace(
                      /^(\d{2})(\d{2})(\d{4})(\d{4}).*/,
                      "+$1 ($2) $3-$4",
                    );
                  } else if (v.length > 10) {
                    v = v.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
                  } else if (v.length > 6) {
                    v = v.replace(/^(\d{2})(\d{4,5})(\d{0,4}).*/, "($1) $2-$3");
                  } else if (v.length > 2) {
                    v = v.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
                  } else if (v.length > 0) {
                    v = v.replace(/^(\d*)/, "($1");
                  }

                  setContactData({ ...contactData, phoneText: v });
                }}
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] text-gray-400 font-bold uppercase">
                Endereço / Localização
              </label>
              <input
                type="text"
                className="w-full p-2 border border-[#c8d8e8] rounded-lg text-sm"
                value={contactData.addressText || ""}
                onChange={(e) =>
                  setContactData({
                    ...contactData,
                    addressText: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] text-gray-400 font-bold uppercase">
                Frase de Efeito (Citação)
              </label>
              <input
                type="text"
                className="w-full p-2 border border-[#c8d8e8] rounded-lg italic text-sm"
                value={contactData.quoteText || ""}
                onChange={(e) =>
                  setContactData({
                    ...contactData,
                    quoteText: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] text-gray-400 font-bold uppercase">
                Texto Inferior Adicional
              </label>
              <textarea
                className="w-full p-2 border border-[#c8d8e8] rounded-lg text-xs h-16"
                value={contactData.bottomText || ""}
                onChange={(e) =>
                  setContactData({
                    ...contactData,
                    bottomText: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <button
            onClick={handleSaveContact}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-base text-white rounded-lg font-bold text-sm hover:bg-primary-dark shadow-sm disabled:bg-gray-400 transition mt-6"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Save size={18} />
            )}{" "}
            Salvar Alterações
          </button>
        </div>
      </div>
    ) : activeContent === "aparencia" ? (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#e2eaf3] shadow-sm">
          <div>
            <h3 className="text-2xl font-black text-[#2D6A9F] tracking-tight">
              Aparência e Cores
            </h3>
            <p className="text-sm text-gray-500 font-medium mt-1">Personalize a identidade visual e as cores do aplicativo</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => {
                setThemeData({
                  primaryBase: "#1a6496",
                  primaryLight: "#2d8dc3",
                  primaryDark: "#0d2b42",
                  primaryBg: "#eaf4fb",
                  bgMain: "#f0f4f8",
                  textMain: "#222222",
                  textMuted: "#6b7c93",
                  footerBg: "#1a3a52",
                  footerText: "#ffffff",
                });
              }}
              disabled={isLoading}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 shadow-sm border border-[#c8d8e8] hover:text-[#2D6A9F] hover:border-[#2D6A9F] disabled:opacity-50 transition drop-shadow-sm"
            >
              Restaurar Padrão
            </button>
            <button
              onClick={handleSaveTheme}
              disabled={isLoading}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-[#2D6A9F] text-white rounded-xl font-bold text-sm hover:bg-[#245785] shadow-md disabled:bg-gray-400 transition"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Save size={18} />
              )}
              Salvar Cores
            </button>
          </div>
        </div>

        <div className="bg-[#fcfdfe] border border-[#e2eaf3] p-8 rounded-2xl space-y-6">
          <h4 className="font-bold text-primary-base mb-2 flex items-center gap-2">
            Paleta de Cores do Site
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Cor Principal */}
            <div className="flex flex-col form-group border border-[#e2eaf3] p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition">
              <label className="!mb-3 text-sm font-bold text-primary-dark">
                Cor Principal (Botões e Destaques)
              </label>
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden shadow-sm border-2 border-gray-100 shrink-0">
                  <input
                    type="color"
                    className="absolute inset-[-10px] w-20 h-20 cursor-pointer"
                    value={themeData.primaryBase}
                    onChange={(e) =>
                      setThemeData({
                        ...themeData,
                        primaryBase: e.target.value,
                      })
                    }
                  />
                </div>
                <input
                  type="text"
                  className="uppercase font-mono text-sm w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-base focus:ring-1 focus:ring-primary-base"
                  value={themeData.primaryBase}
                  onChange={(e) =>
                    setThemeData({
                      ...themeData,
                      primaryBase: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {/* Cor Secundária */}
            <div className="flex flex-col form-group border border-[#e2eaf3] p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition">
              <label className="!mb-3 text-sm font-bold text-primary-dark">
                Cor Secundária (Gradients)
              </label>
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden shadow-sm border-2 border-gray-100 shrink-0">
                  <input
                    type="color"
                    className="absolute inset-[-10px] w-20 h-20 cursor-pointer"
                    value={themeData.primaryLight}
                    onChange={(e) =>
                      setThemeData({
                        ...themeData,
                        primaryLight: e.target.value,
                      })
                    }
                  />
                </div>
                <input
                  type="text"
                  className="uppercase font-mono text-sm w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-base focus:ring-1 focus:ring-primary-base"
                  value={themeData.primaryLight}
                  onChange={(e) =>
                    setThemeData({
                      ...themeData,
                      primaryLight: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {/* Cor Escura */}
            <div className="flex flex-col form-group border border-[#e2eaf3] p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition">
              <label className="!mb-3 text-sm font-bold text-primary-dark">
                Cor Escura (Cabeçalhos)
              </label>
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden shadow-sm border-2 border-gray-100 shrink-0">
                  <input
                    type="color"
                    className="absolute inset-[-10px] w-20 h-20 cursor-pointer"
                    value={themeData.primaryDark}
                    onChange={(e) =>
                      setThemeData({
                        ...themeData,
                        primaryDark: e.target.value,
                      })
                    }
                  />
                </div>
                <input
                  type="text"
                  className="uppercase font-mono text-sm w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-base focus:ring-1 focus:ring-primary-base"
                  value={themeData.primaryDark}
                  onChange={(e) =>
                    setThemeData({
                      ...themeData,
                      primaryDark: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {/* Fundo Principal */}
            <div className="flex flex-col form-group border border-[#e2eaf3] p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition">
              <label className="!mb-3 text-sm font-bold text-primary-dark">
                Fundo Principal do Site
              </label>
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden shadow-sm border-2 border-gray-100 shrink-0">
                  <input
                    type="color"
                    className="absolute inset-[-10px] w-20 h-20 cursor-pointer"
                    value={themeData.bgMain}
                    onChange={(e) =>
                      setThemeData({
                        ...themeData,
                        bgMain: e.target.value,
                      })
                    }
                  />
                </div>
                <input
                  type="text"
                  className="uppercase font-mono text-sm w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-base focus:ring-1 focus:ring-primary-base"
                  value={themeData.bgMain}
                  onChange={(e) =>
                    setThemeData({
                      ...themeData,
                      bgMain: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {/* Fundo Faixas */}
            <div className="flex flex-col form-group border border-[#e2eaf3] p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition">
              <label className="!mb-3 text-sm font-bold text-primary-dark">
                Fundo das Faixas Claras
              </label>
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden shadow-sm border-2 border-gray-100 shrink-0">
                  <input
                    type="color"
                    className="absolute inset-[-10px] w-20 h-20 cursor-pointer"
                    value={themeData.primaryBg}
                    onChange={(e) =>
                      setThemeData({
                        ...themeData,
                        primaryBg: e.target.value,
                      })
                    }
                  />
                </div>
                <input
                  type="text"
                  className="uppercase font-mono text-sm w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-base focus:ring-1 focus:ring-primary-base"
                  value={themeData.primaryBg}
                  onChange={(e) =>
                    setThemeData({
                      ...themeData,
                      primaryBg: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {/* Texto Principal */}
            <div className="flex flex-col form-group border border-[#e2eaf3] p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition">
              <label className="!mb-3 text-sm font-bold text-primary-dark">
                Cor do Texto Principal
              </label>
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden shadow-sm border-2 border-gray-100 shrink-0">
                  <input
                    type="color"
                    className="absolute inset-[-10px] w-20 h-20 cursor-pointer"
                    value={themeData.textMain}
                    onChange={(e) =>
                      setThemeData({
                        ...themeData,
                        textMain: e.target.value,
                      })
                    }
                  />
                </div>
                <input
                  type="text"
                  className="uppercase font-mono text-sm w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-base focus:ring-1 focus:ring-primary-base"
                  value={themeData.textMain}
                  onChange={(e) =>
                    setThemeData({
                      ...themeData,
                      textMain: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {/* Texto Muted */}
            <div className="flex flex-col form-group border border-[#e2eaf3] p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition">
              <label className="!mb-3 text-sm font-bold text-primary-dark">
                Cor do Texto Secundário
              </label>
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden shadow-sm border-2 border-gray-100 shrink-0">
                  <input
                    type="color"
                    className="absolute inset-[-10px] w-20 h-20 cursor-pointer"
                    value={themeData.textMuted}
                    onChange={(e) =>
                      setThemeData({
                        ...themeData,
                        textMuted: e.target.value,
                      })
                    }
                  />
                </div>
                <input
                  type="text"
                  className="uppercase font-mono text-sm w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-base focus:ring-1 focus:ring-primary-base"
                  value={themeData.textMuted}
                  onChange={(e) =>
                    setThemeData({
                      ...themeData,
                      textMuted: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {/* Fundo Rodapé */}
            <div className="flex flex-col form-group border border-[#e2eaf3] p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition">
              <label className="!mb-3 text-sm font-bold text-primary-dark">
                Fundo do Rodapé
              </label>
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden shadow-sm border-2 border-gray-100 shrink-0">
                  <input
                    type="color"
                    className="absolute inset-[-10px] w-20 h-20 cursor-pointer"
                    value={themeData.footerBg}
                    onChange={(e) =>
                      setThemeData({
                        ...themeData,
                        footerBg: e.target.value,
                      })
                    }
                  />
                </div>
                <input
                  type="text"
                  className="uppercase font-mono text-sm w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-base focus:ring-1 focus:ring-primary-base"
                  value={themeData.footerBg}
                  onChange={(e) =>
                    setThemeData({
                      ...themeData,
                      footerBg: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {/* Texto Rodapé */}
            <div className="flex flex-col form-group border border-[#e2eaf3] p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition">
              <label className="!mb-3 text-sm font-bold text-primary-dark">
                Cor do Texto do Rodapé
              </label>
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden shadow-sm border-2 border-gray-100 shrink-0">
                  <input
                    type="color"
                    className="absolute inset-[-10px] w-20 h-20 cursor-pointer"
                    value={themeData.footerText}
                    onChange={(e) =>
                      setThemeData({
                        ...themeData,
                        footerText: e.target.value,
                      })
                    }
                  />
                </div>
                <input
                  type="text"
                  className="uppercase font-mono text-sm w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-base focus:ring-1 focus:ring-primary-base"
                  value={themeData.footerText}
                  onChange={(e) =>
                    setThemeData({
                      ...themeData,
                      footerText: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4 leading-relaxed">
            Nota: Ao alterar e salvar, o site passará a adotar as novas cores
            automaticamente. Dê preferência a cores de contraste adequado (Ex:
            Textos escuros para fundos claros, e textos claros para fundos
            escuros) para não inviabilizar a leitura.
          </p>

          {/* LIVE PREVIEW SECTION */}
          <div className="mt-10 pt-8 border-t border-[#e2eaf3]">
            <h4 className="font-bold text-primary-dark mb-6">
              Visualização / Preview
            </h4>
            <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div
                style={{ backgroundColor: themeData.primaryBg }}
                className="p-8"
              >
                <div
                  style={{ backgroundColor: themeData.bgMain }}
                  className="rounded-2xl p-8 max-w-xl mx-auto shadow-md"
                >
                  <h5
                    style={{ color: themeData.primaryDark }}
                    className="text-2xl font-black mb-3"
                  >
                    Exemplo de Título Destaque
                  </h5>
                  <p
                    style={{ color: themeData.textMuted }}
                    className="mb-8 leading-relaxed"
                  >
                    Este é um exemplo de como o texto secundário aparecerá no
                    site, sobre o Fundo Principal. Ajuste as cores para garantir
                    que o contraste fique confortável para a leitura de seus
                    usuários.
                  </p>
                  <div className="flex items-center gap-4">
                    <button
                      style={{
                        backgroundColor: themeData.primaryBase,
                        color: "#ffffff",
                      }}
                      className="px-6 py-3 rounded-xl font-bold shadow-md hover:opacity-90 transition"
                    >
                      Botão Principal
                    </button>
                    <span
                      style={{ color: themeData.textMain }}
                      className="font-semibold cursor-pointer hover:underline"
                    >
                      Link secundário
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        
<div className="pt-6 mt-4 border-t border-[#e2eaf3] flex justify-end"><button onClick={handleSaveTheme} disabled={isLoading} className="flex items-center gap-2 px-6 py-2 bg-primary-base text-white rounded-lg font-bold text-sm hover:bg-primary-dark shadow-sm disabled:bg-gray-400 transition">{isLoading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Salvar Configuração</button></div>
</div>
      </div>
    ) : activeContent === "header_logo" ? (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#e2eaf3] shadow-sm">
          <div>
            <h3 className="text-2xl font-black text-[#2D6A9F] tracking-tight">
              Logo e Menu (Navbar)
            </h3>
            <p className="text-sm text-gray-500 font-medium mt-1">Configure o logotipo principal e os links de navegação do topo</p>
          </div>
          <button
            onClick={handleSaveHeaderLogo}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-[#2D6A9F] text-white rounded-xl font-bold text-sm hover:bg-[#245785] shadow-md disabled:bg-gray-400 transition"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Save size={18} />
            )}
            Salvar Alterações
          </button>
        </div>

        <div className="bg-[#fcfdfe] border border-[#e2eaf3] p-8 rounded-2xl space-y-6">
          <h4 className="font-bold text-primary-dark mb-2 flex items-center gap-2">
            <FileText className="text-primary-base" size={20} />
            Logo & Identidade do Topo
          </h4>
          <p className="text-xs text-gray-500">
            Aqui você pode personalizar o logotipo e os títulos que são exibidos
            na barra de navegação superior (Navbar) de todas as páginas públicas
            do site.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">
                Título Principal (Em Destaque)
              </label>
              <input
                type="text"
                className="w-full p-2.5 border border-[#c8d8e8] rounded-lg text-xs font-medium"
                value={headerLogoData.title || ""}
                onChange={(e) =>
                  setHeaderLogoData({
                    ...headerLogoData,
                    title: e.target.value,
                  })
                }
              />
            </div>
            <div className="form-group">
              <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">
                Subtítulo (Embaixo do Título)
              </label>
              <input
                type="text"
                className="w-full p-2.5 border border-[#c8d8e8] rounded-lg text-xs font-medium"
                value={headerLogoData.subtitle || ""}
                onChange={(e) =>
                  setHeaderLogoData({
                    ...headerLogoData,
                    subtitle: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-group md:col-span-2">
              <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">
                Imagem do Logotipo do Topo
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 p-2 border border-[#c8d8e8] rounded-lg text-xs"
                  placeholder="Ex: /logo.png"
                  value={headerLogoData.logoUrl || ""}
                  onChange={(e) =>
                    setHeaderLogoData({
                      ...headerLogoData,
                      logoUrl: e.target.value,
                    })
                  }
                />
                <label className="shrink-0 cursor-pointer p-2 bg-[#f7fafd] border border-[#c8d8e8] rounded-lg text-primary-base hover:bg-primary-bg transition flex items-center gap-1 text-[10px] font-bold uppercase overflow-hidden font-bold">
                  <Upload size={14} />
                  Upload
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        const r = new FileReader();
                        r.onloadend = () => {
                          if (typeof r.result === "string") {
                            setHeaderLogoData({
                              ...headerLogoData,
                              logoUrl: r.result,
                            });
                          }
                        };
                        r.readAsDataURL(f);
                      }
                    }}
                  />
                </label>
              </div>
              <p className="text-[10px] text-gray-500 mt-1">
                Formato ideal: PNG transparente ou SVG quadrado.
              </p>

              {headerLogoData.logoUrl && (
                <div className="mt-4 p-4 bg-gray-50 border rounded-lg flex items-center justify-center">
                  <div className="flex items-center gap-2 bg-white/95 p-3 rounded-xl shadow-sm border">
                    <img
                      src={headerLogoData.logoUrl}
                      alt="Logo Topo Preview"
                      className="h-10 w-auto object-contain"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-serif font-black tracking-tight text-primary-dark uppercase">
                        {headerLogoData.title || "EDIFICADO"}
                      </span>
                      <span className="text-[8px] uppercase tracking-[0.2em] font-bold text-gray-500 leading-none">
                        {headerLogoData.subtitle || "MATRIMÔNIO"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-[#e2eaf3] mt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-primary-dark">Links do Menu Principal</h4>
              <button
                onClick={() => {
                  setHeaderLogoData({
                    ...headerLogoData,
                    links: [...(headerLogoData.links || []), { name: "Novo", path: "/" }]
                  });
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-base/10 text-primary-base hover:bg-primary-base hover:text-white rounded text-xs font-bold transition-colors"
                type="button"
              >
                <Plus size={14} /> Adicionar Link
              </button>
            </div>
            
            <div className="space-y-3">
              {(headerLogoData.links || []).map((link, idx) => (
                <div key={idx} className="bg-white border border-[#c8d8e8] p-3 rounded-xl shadow-sm group">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => {
                          const newLinks = [...(headerLogoData.links || [])];
                          [newLinks[idx - 1], newLinks[idx]] = [newLinks[idx], newLinks[idx - 1]];
                          setHeaderLogoData({ ...headerLogoData, links: newLinks });
                        }}
                        className="text-gray-400 hover:text-primary-base disabled:opacity-30 p-1"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        type="button"
                        disabled={idx === (headerLogoData.links?.length || 0) - 1}
                        onClick={() => {
                          const newLinks = [...(headerLogoData.links || [])];
                          [newLinks[idx], newLinks[idx + 1]] = [newLinks[idx + 1], newLinks[idx]];
                          setHeaderLogoData({ ...headerLogoData, links: newLinks });
                        }}
                        className="text-gray-400 hover:text-primary-base disabled:opacity-30 p-1"
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 flex-1">
                      <div>
                        <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Nome</label>
                        <input
                          type="text"
                          className="w-full p-2 border border-[#c8d8e8] rounded-lg text-xs"
                          value={link.name}
                          onChange={(e) => {
                            const newLinks = [...(headerLogoData.links || [])];
                            newLinks[idx] = { ...newLinks[idx], name: e.target.value };
                            setHeaderLogoData({ ...headerLogoData, links: newLinks });
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Caminho (URL)</label>
                        <input
                          type="text"
                          className="w-full p-2 border border-[#c8d8e8] rounded-lg text-xs"
                          value={link.path}
                          onChange={(e) => {
                            const newLinks = [...(headerLogoData.links || [])];
                            newLinks[idx] = { ...newLinks[idx], path: e.target.value };
                            setHeaderLogoData({ ...headerLogoData, links: newLinks });
                          }}
                        />
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setGenericDeleteConfirm({ message: "Tem certeza que deseja excluir este link?", action: () => {
                          const newLinks = [...(headerLogoData.links || [])];
                          newLinks.splice(idx, 1);
                          setHeaderLogoData({ ...headerLogoData, links: newLinks });
                        } });
                      }}
                      className="p-2 text-red-400 bg-red-50 hover:bg-red-500 hover:text-white rounded-lg transition-colors ml-2"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  {/* SubLinks */}
                  <div className="mt-3 pl-8 ml-3 border-l-2 border-gray-100 flex flex-col gap-2">
                    {link.subLinks && link.subLinks.length > 0 && (
                      <div className="space-y-2 mb-2 pt-2">
                        {link.subLinks.map((subLink: any, subIdx: number) => (
                          <div key={subIdx} className="flex flex-col bg-gray-50 p-2 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
                                <ChevronDown size={10} /> Sub-link {subIdx + 1}
                              </span>
                              <div className="flex gap-1 items-center">
                                <button
                                  type="button"
                                  disabled={subIdx === 0}
                                  onClick={() => {
                                    const newLinks = [...(headerLogoData.links || [])];
                                    const newSubLinks = [...(newLinks[idx].subLinks || [])];
                                    [newSubLinks[subIdx - 1], newSubLinks[subIdx]] = [newSubLinks[subIdx], newSubLinks[subIdx - 1]];
                                    newLinks[idx] = { ...newLinks[idx], subLinks: newSubLinks };
                                    setHeaderLogoData({ ...headerLogoData, links: newLinks });
                                  }}
                                  className="text-gray-400 hover:text-primary-base disabled:opacity-30 p-1 bg-white border border-gray-200 rounded"
                                >
                                  <ChevronUp size={10} />
                                </button>
                                <button
                                  type="button"
                                  disabled={subIdx === (link.subLinks?.length || 0) - 1}
                                  onClick={() => {
                                    const newLinks = [...(headerLogoData.links || [])];
                                    const newSubLinks = [...(newLinks[idx].subLinks || [])];
                                    [newSubLinks[subIdx], newSubLinks[subIdx + 1]] = [newSubLinks[subIdx + 1], newSubLinks[subIdx]];
                                    newLinks[idx] = { ...newLinks[idx], subLinks: newSubLinks };
                                    setHeaderLogoData({ ...headerLogoData, links: newLinks });
                                  }}
                                  className="text-gray-400 hover:text-primary-base disabled:opacity-30 p-1 bg-white border border-gray-200 rounded"
                                >
                                  <ChevronDown size={10} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newLinks = [...(headerLogoData.links || [])];
                                    const newSubLinks = [...(newLinks[idx].subLinks || [])];
                                    newSubLinks.splice(subIdx, 1);
                                    newLinks[idx] = { ...newLinks[idx], subLinks: newSubLinks };
                                    setHeaderLogoData({ ...headerLogoData, links: newLinks });
                                  }}
                                  className="p-1 text-red-400 hover:text-red-600 bg-white border border-gray-200 rounded transition-colors"
                                >
                                  <Trash2 size={10} />
                                </button>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                className="w-full p-2 bg-white border border-gray-200 rounded text-xs"
                                placeholder="Nome. Ex: MAF Kids"
                                value={subLink.name}
                                onChange={(e) => {
                                  const newLinks = [...(headerLogoData.links || [])];
                                  const newSubLinks = [...(newLinks[idx].subLinks || [])];
                                  newSubLinks[subIdx] = { ...newSubLinks[subIdx], name: e.target.value };
                                  newLinks[idx] = { ...newLinks[idx], subLinks: newSubLinks };
                                  setHeaderLogoData({ ...headerLogoData, links: newLinks });
                                }}
                              />
                              <input
                                type="text"
                                className="w-full p-2 bg-white border border-gray-200 rounded text-xs"
                                placeholder="Caminho. Ex: /maf-kids"
                                value={subLink.path}
                                onChange={(e) => {
                                  const newLinks = [...(headerLogoData.links || [])];
                                  const newSubLinks = [...(newLinks[idx].subLinks || [])];
                                  newSubLinks[subIdx] = { ...newSubLinks[subIdx], path: e.target.value };
                                  newLinks[idx] = { ...newLinks[idx], subLinks: newSubLinks };
                                  setHeaderLogoData({ ...headerLogoData, links: newLinks });
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <button
                      type="button"
                      onClick={() => {
                        const newLinks = [...(headerLogoData.links || [])];
                        newLinks[idx] = { 
                          ...newLinks[idx], 
                          subLinks: [...(newLinks[idx].subLinks || []), { name: "Novo Submenu", path: "/" }] 
                        };
                        setHeaderLogoData({ ...headerLogoData, links: newLinks });
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 w-fit text-gray-500 hover:text-primary-base hover:bg-primary-base/5 rounded text-[10px] font-bold transition-colors uppercase border border-dashed border-gray-300"
                    >
                      <Plus size={12} /> Adicionar Submenu
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
<div className="pt-6 mt-4 border-t border-[#e2eaf3] flex justify-end"><button onClick={handleSaveHeaderLogo} disabled={isLoading} className="flex items-center gap-2 px-6 py-2 bg-primary-base text-white rounded-lg font-bold text-sm hover:bg-primary-dark shadow-sm disabled:bg-gray-400 transition">{isLoading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Salvar Configuração</button></div>
</div>
      </div>
    ) : activeContent === "footer" ? (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#e2eaf3] shadow-sm">
          <div>
            <h3 className="text-2xl font-black text-[#2D6A9F] tracking-tight">
              Conteúdo do Rodapé
            </h3>
            <p className="text-sm text-gray-500 font-medium mt-1">Gerencie os links e informações institucionais do final da página</p>
          </div>
          <button
            onClick={handleSaveFooter}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-[#2D6A9F] text-white rounded-xl font-bold text-sm hover:bg-[#245785] shadow-md disabled:bg-gray-400 transition"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Save size={18} />
            )}
            Salvar Alterações
          </button>
        </div>

        {/* Seção 1: Institucional do Rodapé */}
        <div className="bg-[#fcfdfe] border border-[#e2eaf3] p-8 rounded-2xl space-y-6">
          <h4 className="font-bold text-primary-dark mb-2 flex items-center gap-2">
            <FileText className="text-primary-base" size={20} />
            Institucional & Logo Principal
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label>Logo Título Principal (Ex: EDIFICADO)</label>
              <input
                type="text"
                className="w-full p-2.5 border border-[#c8d8e8] rounded-lg text-xs font-medium"
                value={footerData.logoTitle || ""}
                onChange={(e) =>
                  setFooterData({
                    ...footerData,
                    logoTitle: e.target.value,
                  })
                }
              />
            </div>
            <div className="form-group">
              <label>Logo Subtítulo (Ex: MATRIMÔNIO)</label>
              <input
                type="text"
                className="w-full p-2.5 border border-[#c8d8e8] rounded-lg text-xs font-medium"
                value={footerData.logoSubtitle || ""}
                onChange={(e) =>
                  setFooterData({
                    ...footerData,
                    logoSubtitle: e.target.value,
                  })
                }
              />
            </div>
            <div className="form-group md:col-span-2">
              <label>URL ou Base64 da Imagem do Logo Principal</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 p-2 border border-[#c8d8e8] rounded-lg text-xs"
                  placeholder="Ex: /logo.png"
                  value={footerData.logoUrl || ""}
                  onChange={(e) =>
                    setFooterData({
                      ...footerData,
                      logoUrl: e.target.value,
                    })
                  }
                />
                <label className="shrink-0 cursor-pointer p-2 bg-[#f7fafd] border border-[#c8d8e8] rounded-lg text-primary-base hover:bg-primary-bg transition flex items-center gap-1 text-[10px] font-bold uppercase overflow-hidden">
                  <Upload size={14} />
                  Upload
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        const r = new FileReader();
                        r.onloadend = () => {
                          if (typeof r.result === "string") {
                            setFooterData({
                              ...footerData,
                              logoUrl: r.result,
                            });
                          }
                        };
                        r.readAsDataURL(f);
                      }
                    }}
                  />
                </label>
              </div>
            </div>
            <div className="form-group md:col-span-2">
              <label>Texto Descritivo / Sobre Nós do Rodapé</label>
              <textarea
                rows={3}
                className="w-full p-2.5 border border-[#c8d8e8] rounded-lg text-xs font-medium"
                value={footerData.description || ""}
                onChange={(e) =>
                  setFooterData({
                    ...footerData,
                    description: e.target.value,
                  })
                }
              />
            </div>
          </div>
        
<div className="pt-6 mt-4 border-t border-[#e2eaf3] flex justify-end"><button onClick={handleSaveFooter} disabled={isLoading} className="flex items-center gap-2 px-6 py-2 bg-primary-base text-white rounded-lg font-bold text-sm hover:bg-primary-dark shadow-sm disabled:bg-gray-400 transition">{isLoading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Salvar Configuração</button></div>
</div>

        {/* Seção 3: Conexões Sociais */}
        <div className="bg-[#fcfdfe] border border-[#e2eaf3] p-8 rounded-2xl space-y-6">
          <h4 className="font-bold text-primary-dark mb-2 flex items-center gap-2">
            <Settings className="text-primary-base" size={20} />
            Redes Sociais & Rodapé de Copyright
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label>Link do Instagram</label>
              <input
                type="text"
                className="w-full p-2.5 border border-[#c8d8e8] rounded-lg text-xs font-medium"
                placeholder="https://instagram.com/..."
                value={footerData.instagram || ""}
                onChange={(e) =>
                  setFooterData({
                    ...footerData,
                    instagram: e.target.value,
                  })
                }
              />
            </div>
            <div className="form-group">
              <label>Link do YouTube</label>
              <input
                type="text"
                className="w-full p-2.5 border border-[#c8d8e8] rounded-lg text-xs font-medium"
                placeholder="https://youtube.com/..."
                value={footerData.youtube || ""}
                onChange={(e) =>
                  setFooterData({
                    ...footerData,
                    youtube: e.target.value,
                  })
                }
              />
            </div>
            <div className="form-group">
              <label>Link do Facebook</label>
              <input
                type="text"
                className="w-full p-2.5 border border-[#c8d8e8] rounded-lg text-xs font-medium"
                placeholder="https://facebook.com/..."
                value={footerData.facebook || ""}
                onChange={(e) =>
                  setFooterData({
                    ...footerData,
                    facebook: e.target.value,
                  })
                }
              />
            </div>
            <div className="form-group">
              <label>Texto de Direitos Autorais (Copyright)</label>
              <input
                type="text"
                className="w-full p-2.5 border border-[#c8d8e8] rounded-lg text-xs font-medium"
                placeholder="Ex: Ministério Apascentando Filhos Brasil. Todos os direitos reservados."
                value={footerData.copyrightText || ""}
                onChange={(e) =>
                  setFooterData({
                    ...footerData,
                    copyrightText: e.target.value,
                  })
                }
              />
            </div>
          </div>
        
<div className="pt-6 mt-4 border-t border-[#e2eaf3] flex justify-end"><button onClick={handleSaveFooter} disabled={isLoading} className="flex items-center gap-2 px-6 py-2 bg-primary-base text-white rounded-lg font-bold text-sm hover:bg-primary-dark shadow-sm disabled:bg-gray-400 transition">{isLoading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Salvar Configuração</button></div>
</div>
      </div>
    ) : null}

    {/* modal de genericDeleteConfirm */}
    {genericDeleteConfirm && (
      <div className="fixed inset-0 bg-primary-dark/40 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
        <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 size={32} />
          </div>
          <h3 className="text-xl font-bold text-primary-dark mb-2">Excluir Item</h3>
          <p className="text-sm text-gray-500 mb-6">{genericDeleteConfirm.message}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setGenericDeleteConfirm(null)}
              className="px-6 py-2 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                genericDeleteConfirm.action();
                setGenericDeleteConfirm(null);
              }}
              className="px-6 py-2 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 shadow-lg shadow-red-500/30 transition"
            >
              Excluir
            </button>
          </div>
        </div>
      </div>
    )}
    
    {/* Modal de Confirmação de Exclusão de Curso */}
    {courseToDelete !== null && (
      <div className="fixed inset-0 bg-primary-dark/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full">
          <h3 className="text-lg font-black text-primary-dark mb-2 flex items-center gap-2">
            <Trash2 className="text-red-500" size={20} />
            Excluir Curso
          </h3>
          <p className="text-sm text-[#2c4a63] mb-6">
            Tem certeza que deseja excluir este curso? Esta ação o removerá da
            lista (lembre-se de salvar depois).
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setCourseToDelete(null)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-bold text-sm transition"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                setHomeData((prev) => ({
                  ...prev,
                  courses: (prev.courses || []).filter(
                    (_: any, i: number) => i !== courseToDelete,
                  ),
                }));
                setCourseToDelete(null);
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-bold text-sm transition"
            >
              Excluir
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Modal de Confirmação de Exclusão de Crença */}
    {beliefToDelete !== null && (
      <div className="fixed inset-0 bg-primary-dark/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full">
          <h3 className="text-lg font-black text-primary-dark mb-2 flex items-center gap-2">
            <Trash2 className="text-red-500" size={20} />
            Excluir Item
          </h3>
          <p className="text-sm text-[#2c4a63] mb-6">
            Tem certeza que deseja excluir este item da seção "No que
            Acreditamos"?
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setBeliefToDelete(null)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-bold text-sm transition"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                if (activeContent === "inicio") {
                  setHomeData((prev) => ({
                    ...prev,
                    beliefs: (prev.beliefs || []).filter(
                      (_: any, i: number) => i !== beliefToDelete,
                    ),
                  }));
                } else if (activeContent === "edificado_matrimonio") {
                  setEdificadoMatrimonioData((prev: any) => ({
                    ...prev,
                    beliefs: (prev.beliefs || []).filter(
                      (_: any, i: number) => i !== beliefToDelete,
                    ),
                  }));
                }
                setBeliefToDelete(null);
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-bold text-sm transition"
            >
              Excluir
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Modal de Confirmação de Exclusão de Slide */}
    {slideToDelete !== null && (
      <div className="fixed inset-0 bg-primary-dark/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full">
          <h3 className="text-lg font-black text-primary-dark mb-2 flex items-center gap-2">
            <Trash2 className="text-red-500" size={20} />
            Excluir Slide
          </h3>
          <p className="text-sm text-[#2c4a63] mb-6">
            Tem certeza que deseja excluir este slide do carrossel?
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setSlideToDelete(null)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-bold text-sm transition"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                if (activeContent === "inicio") {
                  setHomeData((prev) => ({
                    ...prev,
                    slides: (prev.slides || []).filter(
                      (_: any, i: number) => i !== slideToDelete,
                    ),
                  }));
                } else if (activeContent === "edificado_matrimonio") {
                  setEdificadoMatrimonioData((prev: any) => ({
                    ...prev,
                    slides: (prev.slides || []).filter(
                      (_: any, i: number) => i !== slideToDelete,
                    ),
                  }));
                }
                setSlideToDelete(null);
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-bold text-sm transition"
            >
              Excluir
            </button>
          </div>
        </div>
      </div>
    )}
    {coursePageCourseToDelete !== null && (
      <div className="fixed inset-0 bg-primary-dark/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full">
          <h3 className="text-lg font-black text-primary-dark mb-2 flex items-center gap-2">
            <Trash2 className="text-red-500" size={20} />
            Excluir Treinamento
          </h3>
          <p className="text-sm text-[#2c4a63] mb-6">
            Tem certeza que deseja excluir este treinamento?
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setCoursePageCourseToDelete(null)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-bold text-sm transition"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                setCoursesData((prev) => ({
                  ...prev,
                  cursos: (prev.cursos || []).filter(
                    (_, i) => i !== coursePageCourseToDelete,
                  ),
                }));
                setCoursePageCourseToDelete(null);
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-bold text-sm transition"
            >
              Excluir
            </button>
          </div>
        </div>
      </div>
    )}
    {principleToDelete !== null && (
      <div className="fixed inset-0 bg-primary-dark/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full">
          <h3 className="text-lg font-black text-primary-dark mb-2 flex items-center gap-2">
            <Trash2 className="text-red-500" size={20} />
            Excluir Item
          </h3>
          <p className="text-sm text-[#2c4a63] mb-6">
            Tem certeza que deseja excluir este item?
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setPrincipleToDelete(null)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-bold text-sm transition"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                setAboutData((prev: any) => ({
                  ...prev,
                  principles: (prev.principles || []).filter(
                    (_: any, i: number) => i !== principleToDelete,
                  ),
                }));
                setPrincipleToDelete(null);
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-bold text-sm transition"
            >
              Excluir
            </button>
          </div>
        </div>
      </div>
    )}

                {/* SIDE PANEL EDITOR - EDIFICADO MATRIMONIO CURSOS */}
        {editingEdificadoCourseIndex !== null && (
          <div className="fixed inset-0 z-[70] flex justify-end">
            <div 
              className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
              onClick={() => setEditingEdificadoCourseIndex(null)}
            />
            <div className="aba-gestao-cursos relative w-full max-w-lg bg-white shadow-2xl transform transition-transform duration-300 translate-x-0 overflow-y-auto">
              <div className="flex flex-col h-full text-left">
                <div className="bg-primary-dark p-6 text-white sticky top-0 z-10 flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-xl flex items-center gap-2">
                       Editar Treinamento (Edificado)
                    </h3>
                  </div>
                  <button onClick={() => setEditingEdificadoCourseIndex(null)} className="p-2 hover:bg-white/10 rounded-full transition">
                    <X size={20} />
                  </button>
                </div>
                <div className="p-8 space-y-8 flex-1 aba-gestao-cursos">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Título do Treinamento</label>
                      <input
                        type="text"
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-black text-lg focus:ring-2 focus:ring-primary-base/20 outline-none"
                        value={edificadoMatrimonioData.cursos?.[editingEdificadoCourseIndex]?.title || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEdificadoMatrimonioData((prev) => ({
                            ...prev,
                            cursos: prev.cursos.map((c, i) =>
                              i === editingEdificadoCourseIndex ? { ...c, title: val } : c
                            ),
                          }));
                        }}
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Descrição</label>
                      <textarea
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-base/20 outline-none h-24"
                        value={edificadoMatrimonioData.cursos?.[editingEdificadoCourseIndex]?.description || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEdificadoMatrimonioData((prev) => ({
                            ...prev,
                            cursos: prev.cursos.map((c, i) =>
                              i === editingEdificadoCourseIndex ? { ...c, description: val } : c
                            ),
                          }));
                        }}
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Instrutor / Formador</label>
                      <input
                        type="text"
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm italic focus:ring-2 focus:ring-primary-base/20 outline-none"
                        value={edificadoMatrimonioData.cursos?.[editingEdificadoCourseIndex]?.instructor || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEdificadoMatrimonioData((prev) => ({
                            ...prev,
                            cursos: prev.cursos.map((c, i) =>
                              i === editingEdificadoCourseIndex ? { ...c, instructor: val } : c
                            ),
                          }));
                        }}
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Badge</label>
                      <input
                        type="text"
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-base/20 outline-none"
                        value={edificadoMatrimonioData.cursos?.[editingEdificadoCourseIndex]?.badge || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEdificadoMatrimonioData((prev) => ({
                            ...prev,
                            cursos: prev.cursos.map((c, i) =>
                              i === editingEdificadoCourseIndex ? { ...c, badge: val } : c
                            ),
                          }));
                        }}
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">URL da Imagem / Foto do Card</label>
                      <div className="flex gap-3">
                        <input
                          type="text"
                          className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-base/20 outline-none"
                          placeholder="Cole a URL ou faça um upload ->"
                          value={edificadoMatrimonioData.cursos?.[editingEdificadoCourseIndex]?.image || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEdificadoMatrimonioData((prev) => ({
                              ...prev,
                              cursos: prev.cursos.map((c, i) =>
                                i === editingEdificadoCourseIndex ? { ...c, image: val } : c
                              ),
                            }));
                          }}
                        />
                        <label className="shrink-0 cursor-pointer p-3 bg-primary-bg border border-primary-base/20 rounded-xl text-primary-base hover:bg-primary-base hover:text-white transition flex items-center gap-2 text-xs font-bold uppercase overflow-hidden">
                          <Upload size={16} />
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleEdificadoCourseImageUpload(e, editingEdificadoCourseIndex!)}
                          />
                        </label>
                      </div>
                      {edificadoMatrimonioData.cursos?.[editingEdificadoCourseIndex]?.image && (
                        <div className="relative rounded-2xl overflow-hidden border shadow-inner mt-4">
                          <img src={edificadoMatrimonioData.cursos[editingEdificadoCourseIndex].image} className="w-full h-64 object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Conteúdo Detalhado (O que vai aprender?)</label>
                      <textarea
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-base/20 outline-none min-h-[200px]"
                        placeholder={"Para formatar tópicos use asterisco:\n* **Ponto 1**: Descrição"}
                        value={edificadoMatrimonioData.cursos?.[editingEdificadoCourseIndex]?.detailedContent || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEdificadoMatrimonioData((prev) => ({
                            ...prev,
                            cursos: prev.cursos.map((c, i) =>
                              i === editingEdificadoCourseIndex ? { ...c, detailedContent: val } : c
                            ),
                          }));
                        }}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Duração</label>
                        <input
                          type="text"
                          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-base/20 outline-none"
                          placeholder="Ex: 10 Semanas"
                          value={edificadoMatrimonioData.cursos?.[editingEdificadoCourseIndex]?.duration || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEdificadoMatrimonioData((prev) => ({
                              ...prev,
                              cursos: prev.cursos.map((c, i) =>
                                i === editingEdificadoCourseIndex ? { ...c, duration: val } : c
                              ),
                            }));
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Periodicidade</label>
                        <input
                          type="text"
                          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-base/20 outline-none"
                          placeholder="Ex: 1x por semana"
                          value={edificadoMatrimonioData.cursos?.[editingEdificadoCourseIndex]?.encontros || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEdificadoMatrimonioData((prev) => ({
                              ...prev,
                              cursos: prev.cursos.map((c, i) =>
                                i === editingEdificadoCourseIndex ? { ...c, encontros: val } : c
                              ),
                            }));
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Público Alvo</label>
                        <input
                          type="text"
                          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-base/20 outline-none"
                          placeholder="Ex: Casados"
                          value={edificadoMatrimonioData.cursos?.[editingEdificadoCourseIndex]?.publico || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEdificadoMatrimonioData((prev) => ({
                              ...prev,
                              cursos: prev.cursos.map((c, i) =>
                                i === editingEdificadoCourseIndex ? { ...c, publico: val } : c
                              ),
                            }));
                          }}
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Tipo de Investimento</label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEdificadoMatrimonioData((prev) => ({
                                ...prev,
                                cursos: prev.cursos.map((c, i) =>
                                  i === editingEdificadoCourseIndex ? { ...c, investment: "Gratuito" } : c
                                ),
                              }));
                            }}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-colors ${edificadoMatrimonioData.cursos?.[editingEdificadoCourseIndex]?.investment === "Gratuito" || !edificadoMatrimonioData.cursos?.[editingEdificadoCourseIndex]?.investment ? "bg-primary-base text-white border-primary-base" : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"}`}
                          >
                            Gratuito
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const current = edificadoMatrimonioData.cursos?.[editingEdificadoCourseIndex]?.investment;
                              setEdificadoMatrimonioData((prev) => ({
                                ...prev,
                                cursos: prev.cursos.map((c, i) =>
                                  i === editingEdificadoCourseIndex ? { ...c, investment: current !== "Gratuito" && current ? current : "R$ 0,00" } : c
                                ),
                              }));
                            }}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-colors ${edificadoMatrimonioData.cursos?.[editingEdificadoCourseIndex]?.investment !== "Gratuito" && edificadoMatrimonioData.cursos?.[editingEdificadoCourseIndex]?.investment ? "bg-primary-base text-white border-primary-base" : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"}`}
                          >
                            Pago
                          </button>
                        </div>
                        {edificadoMatrimonioData.cursos?.[editingEdificadoCourseIndex]?.investment !== "Gratuito" && edificadoMatrimonioData.cursos?.[editingEdificadoCourseIndex]?.investment && (
                          <div className="pt-2">
                            <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2 block">Valor do Curso</label>
                            <input
                              type="text"
                              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-base/20 outline-none"
                              placeholder="Ex: R$ 150,00"
                              value={edificadoMatrimonioData.cursos?.[editingEdificadoCourseIndex]?.investment || ""}
                              onChange={(e) => {
                                let val = e.target.value;
                                const numeric = val.replace(/\D/g, "");
                                if (numeric) {
                                  const numValue = (parseInt(numeric, 10) / 100).toFixed(2);
                                  val = 'R$ ' + numValue.replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                                } else {
                                  val = 'R$ 0,00';
                                }
                                setEdificadoMatrimonioData((prev) => ({
                                  ...prev,
                                  cursos: prev.cursos.map((c, i) =>
                                    i === editingEdificadoCourseIndex ? { ...c, investment: val } : c
                                  ),
                                }));
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="pt-8 border-t flex gap-4">
                    <button
                      onClick={() => {
                        setGenericDeleteConfirm({ message: "Tem certeza que deseja excluir este curso?", action: () => {
                          setEdificadoMatrimonioData((prev) => ({
                            ...prev,
                            cursos: prev.cursos.filter((_, i) => i !== editingEdificadoCourseIndex)
                          }));
                          setEditingEdificadoCourseIndex(null);
                          handleSaveEdificadoMatrimonio();
                        } });
                      }}
                      className="flex-1 py-4 bg-red-50 text-red-600 rounded-2xl font-bold text-xs hover:bg-red-100 transition flex items-center justify-center gap-2"
                    >
                      <Trash2 size={16} /> Excluir
                    </button>
                    <button
                      onClick={() => {
                         setEditingEdificadoCourseIndex(null);
                         handleSaveEdificadoMatrimonio();
                      }}
                      className="flex-[2] py-4 bg-primary-base text-white rounded-2xl font-bold text-sm hover:bg-primary-dark transition shadow-lg flex items-center justify-center gap-2"
                    >
                      <Save size={18} /> Salvar & Fechar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

{/* SIDE PANEL EDITOR - EXCLUSIVE MODE */}
        {editingCourseIndex !== null && (
          <div className="fixed inset-0 z-[70] flex justify-end">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
              onClick={() => setEditingCourseIndex(null)}
            />
            {/* Side Panel */}
            <div className="aba-gestao-cursos relative w-full max-w-lg bg-white shadow-2xl transform transition-transform duration-300 translate-x-0 overflow-y-auto">
              <div className="flex flex-col h-full text-left">
                {/* Header */}
                <div className="p-6 border-b sticky top-0 bg-white z-10 flex items-center justify-between">
                  <div>
                    <h4 className="font-black text-primary-dark uppercase text-sm tracking-widest">Editor de Treinamento</h4>
                    <p className="text-[10px] text-gray-400 font-bold">Informações Detalhadas do Curso</p>
                  </div>
                  <button 
                    onClick={() => setEditingCourseIndex(null)}
                    className="p-2 hover:bg-gray-100 rounded-full transition"
                  >
                    <X size={20} className="text-gray-400" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-8 space-y-8 flex-1 aba-gestao-cursos">
                  {editingCourseIndex !== null && coursesData.cursos[editingCourseIndex] && (
                    <>
                      {/* Photo Section */}
                      <div className="space-y-3">
                        <label className="text-[10px] text-gray-400 font-bold uppercase block tracking-widest">Capa do Treinamento</label>
                        <div className="flex gap-3">
                          <input
                            type="text"
                            className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-primary-base/20 outline-none transition"
                            placeholder="URL da Imagem"
                            value={coursesData.cursos[editingCourseIndex].image || ""}
                            onChange={(e) => {
                              const newUrl = e.target.value;
                              setCoursesData((prev) => ({
                                ...prev,
                                cursos: prev.cursos.map((c, i) =>
                                  i === editingCourseIndex ? { ...c, image: newUrl } : c
                                ),
                              }));
                            }}
                          />
                          <label className="shrink-0 cursor-pointer p-3 bg-primary-bg border border-primary-base/20 rounded-xl text-primary-base hover:bg-primary-base hover:text-white transition flex items-center gap-2 text-xs font-bold uppercase overflow-hidden">
                            <Upload size={16} />
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => handleCoursePageCourseImageUpload(e, editingCourseIndex!)}
                            />
                          </label>
                        </div>
                        {coursesData.cursos[editingCourseIndex].image && (
                          <div className="relative rounded-2xl overflow-hidden border shadow-inner">
                            <img src={coursesData.cursos[editingCourseIndex].image} className="w-full h-64 object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                          </div>
                        )}
                      </div>

                      {/* Main Info */}
                      <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Categoria do Curso</label>
                          <select
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm focus:ring-2 focus:ring-primary-base/20 outline-none appearance-none cursor-pointer"
                            value={coursesData.cursos[editingCourseIndex].category || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCoursesData((prev) => ({
                                ...prev,
                                cursos: prev.cursos.map((c, i) =>
                                  i === editingCourseIndex ? { ...c, category: val } : c
                                ),
                              }));
                            }}
                          >
                            <option value="">Selecione uma Categoria</option>
                            {coursesData.categories.map((cat, i) => (
                              <option key={i} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Título do Curso</label>
                          <input
                            type="text"
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm focus:ring-2 focus:ring-primary-base/20 outline-none"
                            value={coursesData.cursos[editingCourseIndex].title || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCoursesData((prev) => ({
                                ...prev,
                                cursos: prev.cursos.map((c, i) =>
                                  i === editingCourseIndex ? { ...c, title: val } : c
                                ),
                              }));
                            }}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Instrutor / Ministrante</label>
                          <input
                            type="text"
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm focus:ring-2 focus:ring-primary-base/20 outline-none"
                            value={coursesData.cursos[editingCourseIndex].instructor || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCoursesData((prev) => ({
                                ...prev,
                                cursos: prev.cursos.map((c, i) =>
                                  i === editingCourseIndex ? { ...c, instructor: val } : c
                                ),
                              }));
                            }}
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Resumo / Descrição Curta</label>
                        <textarea
                          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-base/20 outline-none h-24"
                          value={coursesData.cursos[editingCourseIndex].description || coursesData.cursos[editingCourseIndex].desc || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCoursesData((prev) => ({
                              ...prev,
                              cursos: prev.cursos.map((c, i) =>
                                i === editingCourseIndex ? { ...c, description: val } : c
                              ),
                            }));
                          }}
                        />
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Conteúdo Detalhado (O que vai aprender?)</label>
                        <textarea
                          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-base/20 outline-none min-h-[200px]"
                          placeholder={"Para formatar tópicos use asterisco:\n* **Ponto 1**: Descrição"}
                          value={coursesData.cursos[editingCourseIndex].detailedContent || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCoursesData((prev) => ({
                              ...prev,
                              cursos: prev.cursos.map((c, i) =>
                                i === editingCourseIndex ? { ...c, detailedContent: val } : c
                              ),
                            }));
                          }}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Duração</label>
                          <input
                            type="text"
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-base/20 outline-none"
                            placeholder="Ex: Flexível"
                            value={coursesData.cursos[editingCourseIndex].duration || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCoursesData((prev) => ({
                                ...prev,
                                cursos: prev.cursos.map((c, i) =>
                                  i === editingCourseIndex ? { ...c, duration: val } : c
                                ),
                              }));
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Periodicidade</label>
                          <input
                            type="text"
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-base/20 outline-none"
                            placeholder="Ex: Semanal"
                            value={coursesData.cursos[editingCourseIndex].encontros || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCoursesData((prev) => ({
                                ...prev,
                                cursos: prev.cursos.map((c, i) =>
                                  i === editingCourseIndex ? { ...c, encontros: val } : c
                                ),
                              }));
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Público Alvo</label>
                          <input
                            type="text"
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-base/20 outline-none"
                            placeholder="Ex: Membros e Líderes"
                            value={coursesData.cursos[editingCourseIndex].publico || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCoursesData((prev) => ({
                                ...prev,
                                cursos: prev.cursos.map((c, i) =>
                                  i === editingCourseIndex ? { ...c, publico: val } : c
                                ),
                              }));
                            }}
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Tipo de Investimento</label>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setCoursesData((prev) => ({
                                  ...prev,
                                  cursos: prev.cursos.map((c, i) =>
                                    i === editingCourseIndex ? { ...c, investment: "Gratuito" } : c
                                  ),
                                }));
                              }}
                              className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-colors ${coursesData.cursos[editingCourseIndex].investment === "Gratuito" || !coursesData.cursos[editingCourseIndex].investment ? "bg-primary-base text-white border-primary-base" : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"}`}
                            >
                              Gratuito
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const current = coursesData.cursos[editingCourseIndex].investment;
                                setCoursesData((prev) => ({
                                  ...prev,
                                  cursos: prev.cursos.map((c, i) =>
                                    i === editingCourseIndex ? { ...c, investment: current !== "Gratuito" && current ? current : "R$ 0,00" } : c
                                  ),
                                }));
                              }}
                              className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-colors ${coursesData.cursos[editingCourseIndex].investment !== "Gratuito" && coursesData.cursos[editingCourseIndex].investment ? "bg-primary-base text-white border-primary-base" : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"}`}
                            >
                              Pago
                            </button>
                          </div>
                          {coursesData.cursos[editingCourseIndex].investment !== "Gratuito" && coursesData.cursos[editingCourseIndex].investment && (
                            <div className="pt-2">
                              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2 block">Valor do Curso</label>
                              <input
                                type="text"
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-base/20 outline-none"
                                placeholder="Ex: R$ 150,00"
                                value={coursesData.cursos[editingCourseIndex].investment || ""}
                                onChange={(e) => {
                                  let val = e.target.value;
                                  const numeric = val.replace(/\D/g, "");
                                  if (numeric) {
                                    const numValue = (parseInt(numeric, 10) / 100).toFixed(2);
                                    val = 'R$ ' + numValue.replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                                  } else {
                                    val = 'R$ 0,00';
                                  }
                                  setCoursesData((prev) => ({
                                    ...prev,
                                    cursos: prev.cursos.map((c, i) =>
                                      i === editingCourseIndex ? { ...c, investment: val } : c
                                    ),
                                  }));
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Appearance */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Cor de Fundo (Card)</label>
                          <input
                            type="text"
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-primary-base/20 outline-none"
                            placeholder="Ex: bg-blue-900/40"
                            value={coursesData.cursos[editingCourseIndex].bgColor || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCoursesData((prev) => ({
                                ...prev,
                                cursos: prev.cursos.map((c: any, i: number) =>
                                  i === editingCourseIndex ? { ...c, bgColor: val } : c
                                ),
                              }));
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Selo / Badge</label>
                          <input
                            type="text"
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary-base/20 outline-none"
                            placeholder="Ex: NOVO"
                            value={coursesData.cursos[editingCourseIndex].badge || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCoursesData((prev) => ({
                                ...prev,
                                cursos: prev.cursos.map((c: any, i: number) =>
                                  i === editingCourseIndex ? { ...c, badge: val } : c
                                ),
                              }));
                            }}
                          />
                        </div>
                      </div>

                      {/* Settings */}
                      <div className="bg-gray-50 p-6 rounded-2xl space-y-4 border border-gray-100">
                        <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Configurações Especiais</h5>
                        <div className="flex flex-wrap gap-6">
                          <label className="flex items-center gap-3 cursor-pointer group">
                            <div className={`w-10 h-5 rounded-full relative transition-colors ${coursesData.cursos[editingCourseIndex].isSpecial ? 'bg-primary-base' : 'bg-gray-300'}`}>
                              <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${coursesData.cursos[editingCourseIndex].isSpecial ? 'left-6' : 'left-1'}`} />
                            </div>
                            <input
                              type="checkbox"
                              className="hidden"
                              checked={!!coursesData.cursos[editingCourseIndex].isSpecial}
                              onChange={(e) => {
                                const val = e.target.checked;
                                setCoursesData((prev) => ({
                                  ...prev,
                                  cursos: prev.cursos.map((c, i) =>
                                    i === editingCourseIndex ? { ...c, isSpecial: val } : c
                                  ),
                                }));
                              }}
                            />
                            <span className="text-xs font-bold text-gray-700">Selo Ministério</span>
                          </label>

                          <label className="flex items-center gap-3 cursor-pointer group">
                            <div className={`w-10 h-5 rounded-full relative transition-colors ${coursesData.cursos[editingCourseIndex].isConferencia ? 'bg-orange-500' : 'bg-gray-300'}`}>
                              <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${coursesData.cursos[editingCourseIndex].isConferencia ? 'left-6' : 'left-1'}`} />
                            </div>
                            <input
                              type="checkbox"
                              className="hidden"
                              checked={!!coursesData.cursos[editingCourseIndex].isConferencia}
                              onChange={(e) => {
                                const val = e.target.checked;
                                setCoursesData((prev) => ({
                                  ...prev,
                                  cursos: prev.cursos.map((c, i) =>
                                    i === editingCourseIndex ? { ...c, isConferencia: val } : c
                                  ),
                                }));
                              }}
                            />
                            <span className="text-xs font-bold text-gray-700">Selo Conferência</span>
                          </label>

                          <label className="flex items-center gap-3 cursor-pointer group">
                            <div className={`w-10 h-5 rounded-full relative transition-colors ${coursesData.cursos[editingCourseIndex].isPinned ? 'bg-yellow-500' : 'bg-gray-300'}`}>
                              <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${coursesData.cursos[editingCourseIndex].isPinned ? 'left-6' : 'left-1'}`} />
                            </div>
                            <input
                              type="checkbox"
                              className="hidden"
                              checked={!!coursesData.cursos[editingCourseIndex].isPinned}
                              onChange={(e) => {
                                const val = e.target.checked;
                                setCoursesData((prev) => ({
                                  ...prev,
                                  cursos: prev.cursos.map((c: any, i: number) =>
                                    i === editingCourseIndex ? { ...c, isPinned: val } : c
                                  ),
                                }));
                              }}
                            />
                            <span className="text-xs font-bold text-gray-700">📌 Fixar na Home</span>
                          </label>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="pt-8 border-t flex gap-4">
                        <button
                          onClick={() => {
                            setCoursePageCourseToDelete(editingCourseIndex!);
                            setEditingCourseIndex(null);
                          }}
                          className="flex-1 py-4 bg-red-50 text-red-600 rounded-2xl font-bold text-xs hover:bg-red-100 transition flex items-center justify-center gap-2"
                        >
                          <Trash2 size={16} /> Excluir
                        </button>
                        <button
                          onClick={() => {
                            setEditingCourseIndex(null);
                            handleSaveCursos();
                          }}
                          className="flex-1 py-4 bg-primary-base text-white rounded-2xl font-bold text-xs hover:bg-primary-dark transition shadow-lg shadow-primary-base/20 flex items-center justify-center gap-2"
                        >
                          <Save size={16} /> Salvar
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

  </>
);

if (isEmbedded) {
  return innerContent;
}

return (
  <AdminLayout>
    <section className="bg-white border-b border-[#e2eaf3] pt-12 pb-10 text-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50/50 via-transparent to-transparent pointer-events-none"></div>
      <div className="relative flex flex-col sm:flex-row items-center justify-center gap-3">
        <div className="p-3 bg-[#2D6A9F]/10 rounded-2xl text-[#2D6A9F]">
          <ShieldCheck size={32} />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#1a3d5c] tracking-tight m-0 leading-tight">
          Painel de Conteúdo
        </h1>
      </div>
      <p className="relative text-sm sm:text-base text-gray-500 font-medium max-w-[540px] mx-auto mt-3">
        Gerencie e edite todos os textos, seções e imagens do site
      </p>
    </section>

    <section className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-8 pb-20 flex flex-col lg:flex-row gap-8">
      {/* Sidebar for Navigation within Global Content */}
      <div className="w-full lg:w-72 shrink-0 bg-white rounded-2xl border border-[#e2eaf3] shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-5 h-fit lg:sticky lg:top-8 z-10">
        <nav className="space-y-1">
          {[
            { id: "aparencia", label: "Aparência e Cores", icon: Settings },
            {
              id: "header_logo",
              label: "Logo e Navbar",
              icon: ImageIcon,
            },
            { id: "inicio", label: "Página Início", icon: Home },
            { id: "quem_somos", label: "Página Quem Somos", icon: Users },
            {
              id: "edificado_matrimonio",
              label: "Edificado Matrimônio",
              icon: Heart,
            },
            { id: "cursos", label: "Página de Cursos", icon: BookOpen },
            { id: "contatos", label: "Contatos e Redes", icon: Mail },
            { id: "login", label: "Página de Login", icon: Lock },
            { id: "footer", label: "Conteúdo Rodapé", icon: Layout },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveContent(item.id as any)}
              className={`flex items-center w-full gap-3 p-3.5 rounded-xl font-bold text-sm transition-all border border-transparent ${
                activeContent === item.id
                  ? "bg-[#2D6A9F] text-white shadow-md drop-shadow-sm"
                  : "bg-transparent text-gray-600 hover:bg-gray-50 hover:text-[#2D6A9F] hover:border-[#e2eaf3]"
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-6 pt-6 border-t border-[#e2eaf3] space-y-2">
          <button
            onClick={() => navigate("/dashboard/admin")}
            className="flex items-center justify-center w-full gap-2 p-3.5 rounded-xl font-bold text-sm bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-all border border-[#e2eaf3] shadow-sm"
          >
            <ArrowLeft size={18} />
            Voltar ao Dashboard
          </button>
        </div>
      </div>

      {/* Content Editor Area */}
      <div className="flex-1 min-w-0">
        {innerContent}
      </div>
    </section>
  </AdminLayout>
);
}
