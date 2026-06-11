import { useEffect, useState } from "react";
import { GraduationCap, BookOpen, Users, Compass, CheckCircle, ArrowRight, Check, Heart, Star, Target, Video, FileText, Globe, Trophy, Award, ShieldCheck, PlayCircle } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";

const ICON_MAP: Record<string, any> = {
  BookOpen,
  Users,
  Compass,
  CheckCircle,
  Heart,
  Star,
  Target,
  GraduationCap,
  Video,
  FileText,
  Globe,
  Trophy,
  Award,
  ShieldCheck,
  PlayCircle
};

export default function Cursos() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "content", "cursos"), (snap) => {
      if (snap.exists()) setData(snap.data());
    }, (err) => console.error("Error fetching cursos:", err));
    return () => unsub();
  }, []);

  const [selectedCategory, setSelectedCategory] = useState("Todos");

  const filteredCourses = (data?.cursos || []).filter((c: any) => {
    if (selectedCategory === "Todos") return true;
    return c.tags?.includes(selectedCategory);
  });

  const features = [
    {
      icon: ICON_MAP[data?.featuresData?.[0]?.icon] || BookOpen,
      title: data?.featuresData?.[0]?.title || "Base Bíblica Sólida",
      description: data?.featuresData?.[0]?.description || "Todos os nossos treinamentos são fundamentados nas Escrituras, trazendo princípios eternos para desafios contemporâneos."
    },
    {
      icon: ICON_MAP[data?.featuresData?.[1]?.icon] || Users,
      title: data?.featuresData?.[1]?.title || "Mentoria Especializada",
      description: data?.featuresData?.[1]?.description || "Líderes experientes acompanham sua jornada, oferecendo suporte e sabedoria prática em cada etapa."
    },
    {
      icon: ICON_MAP[data?.featuresData?.[2]?.icon] || Compass,
      title: data?.featuresData?.[2]?.title || "Caminho de Crescimento",
      description: data?.featuresData?.[2]?.description || "Um currículo estruturado que leva você de fundamentos básicos a níveis avançados de liderança e vida familiar."
    }
  ];

  const categories = [
    {
      title: "Vida Matrimonial",
      items: ["Diálogo e Comunicação", "Acordo Financeiro", "Intimidade Bíblica", "Propósito em Unidade"]
    },
    {
      title: "Criação de Filhos",
      items: ["Educação por Princípios", "Proteção Digital", "Legado Geracional", "Cuidado com o Coração"]
    },
    {
      title: "Maturidade Cristã",
      items: ["Fundamentos da Fé", "Mordomia Fiel", "Liderança na Igreja", "Serviço e Ministério"]
    }
  ];

  return (
    <div className="pt-20 min-h-screen bg-white">
      {/* Dynamic Hero Section */}
      <section className="relative py-32 bg-[#0a1e2e] text-white overflow-hidden">
        {data?.heroImage ? (
          <div className="absolute inset-0 z-0">
            <img 
              src={data.heroImage || undefined} 
              alt="Hero Background" 
              className="w-full h-full object-cover opacity-100"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a1e2e]/20 via-[#0a1e2e]/20 to-[#0a1e2e]/90"></div>
          </div>
        ) : (
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_30%,#1a6496_0%,transparent_50%)]"></div>
          </div>
        )}
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#e2eaf3] text-primary-base text-sm font-bold mb-8"
          >
            <GraduationCap size={18} />
            {data?.heroTagline || "MAIS QUE CURSOS, UMA JORNADA"}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black font-serif mb-8 leading-tight max-w-4xl mx-auto"
          >
            {data?.title || "Sua Jornada de Crescimento Começa Aqui"}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto font-medium italic leading-relaxed"
          >
            {data?.subtitle || "Oferecemos mentorias e treinamentos projetados para fortalecer sua vida, família e ministério através de princípios bíblicos práticos."}
          </motion.p>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-12">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="p-8 rounded-3xl bg-[#f7fafd] border border-[#e2eaf3] hover:border-primary-base/30 transition-all group"
            >
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-[#c8d8e8] text-primary-base group-hover:scale-110 transition-transform">
                <feature.icon size={32} />
              </div>
              <h3 className="text-xl font-bold text-primary-dark mb-4">{feature.title}</h3>
              <p className="text-[#2c4a63] leading-relaxed italic">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Methodology Section */}
      <section className="py-24 bg-[#0a1e2e] text-white">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 items-center gap-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-black font-serif mb-8 leading-tight">
              {data?.methodologyTitle || "Metodologia de Ensino Transformadora"}
            </h2>
            <div className="space-y-6">
              {(data?.methodologyItems || [
                "Aulas interativas e práticas",
                "Grupos de discipulado e mentoria",
                "Materiais de apoio exclusivos",
                "Acompanhamento personalizado pós-curso"
              ]).map((item: string, idx: number) => (
                <div key={idx} className="flex items-center gap-4 text-white/90">
                  <div className="w-10 h-10 rounded-full bg-primary-base flex items-center justify-center shrink-0">
                    <CheckCircle size={20} />
                  </div>
                  <span className="text-lg font-medium">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl border-2 border-white/10">
              <img 
                src={data?.methodologyImage || "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=2070"} 
                alt="Mentorship Group" 
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* OS NOSSOS CURSOS Section */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="text-[10px] font-black tracking-[0.2em] text-primary-base uppercase mb-2 block">
            {data?.sectionSubtitle || "CONHEÇA TODOS"}
          </span>
          <h2 className="text-3xl md:text-5xl font-black font-serif text-primary-dark mb-8">
            {data?.sectionTitle || "OS NOSSOS CURSOS"}
          </h2>
          
          {/* Categories Filter */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mb-12 max-w-4xl mx-auto">
            {(data?.categories || [
              "Todos", "Assinatura", "Combos", "Conferências", "Escola Bíblica", 
              "Escola do Espírito", "Família", "Gestão e Comunicação", 
              "Política e Sociedade", "Vida Cristã"
            ]).map((cat: string) => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${
                  selectedCategory === cat ? "text-primary-base border-b-2 border-primary-base pb-1" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course: any, idx: number) => (
            <motion.div
              key={course.id || idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="relative aspect-video rounded-xl overflow-hidden group cursor-pointer shadow-xl border border-white/10"
            >
              <Link to={`/cursos/detalhes/${encodeURIComponent(course.title)}`} className="absolute inset-0 z-20" />
              {course.image && (
                <img 
                  src={course.image || undefined} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  alt={course.title}
                />
              )}
              <div className={`absolute inset-0 ${course.bgColor || "bg-blue-900/40"} mix-blend-multiply opacity-70 transition-opacity group-hover:opacity-50`}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent"></div>
              
              <div className="absolute inset-0 p-8 flex flex-col justify-center text-white">
                <div className="flex-1 flex flex-col justify-center pl-4 border-l-[6px] border-white/30">
                  <h3 className="text-2xl md:text-3xl font-black leading-none tracking-tighter mb-2 max-w-[85%] break-words">
                    {course.title}
                  </h3>
                  
                  {(course.isConferencia || course.isSpecial) ? (
                    <div className="mt-3">
                       <p className="text-[10px] font-black tracking-[0.3em] text-white/60 uppercase">
                         {course.isConferencia ? "CONFERÊNCIA" : "MINISTÉRIO"}
                       </p>
                    </div>
                  ) : (
                    <div className="mt-4">
                       <p className="text-[9px] font-bold text-white/50 uppercase tracking-[0.2em] mb-1">CURSO COM</p>
                       <p className="text-xl md:text-2xl font-black text-primary-light italic leading-none">{course.instructor || "Facilitador"}</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-auto pt-4 flex justify-between items-center border-t border-white/10">
                  <span className="text-[10px] font-black tracking-[0.2em] text-white/60">ORVALHO.COM</span>
                  <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-primary-dark transition-all">
                    <Check size={14} />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 bg-[#f7fafd] border-t border-[#e2eaf3]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-black font-serif text-primary-dark mb-6">
            {data?.bottomTitle || "Pronto para dar o próximo passo?"}
          </h2>
          {data?.bottomSubtitle && (
            <p className="text-lg text-[#2c4a63] mb-10 max-w-2xl mx-auto">
              {data.bottomSubtitle}
            </p>
          )}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              to={data?.bottomButtonLink || "/contato"}
              className="px-10 py-4 bg-primary-base text-white font-bold rounded-full shadow-lg hover:shadow-primary-base/30 hover:-translate-y-1 transition-all flex items-center gap-2"
            >
              {data?.bottomButtonText || "Falar com um Mentor"} <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
