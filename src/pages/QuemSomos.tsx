import { useEffect, useState } from "react";
import { Users, Heart, Target, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function QuemSomos() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "content", "quem_somos"), (docSnap) => {
      if (docSnap.exists()) {
        setData(docSnap.data());
      }
    }, (err) => {
      console.error("Error loading quem_somos data:", err);
    });
    return () => unsub();
  }, []);

  const content = {
    title: data?.title || "Quem Somos",
    subtitle:
      data?.subtitle ||
      "Dedicados a fortalecer os alicerces da sociedade através de famílias estruturadas na Palavra.",
    historyTitle: data?.historyTitle || "Nossa História",
    historyText:
      data?.historyText ||
      "O Ministério Edificado Matrimônio nasceu de um desejo profundo de ver casamentos restaurados e famílias vivendo o propósito original de Deus.\n\nAo longo dos anos, temos visto milhares de vidas transformadas através de nossos cursos, mentorias e grupos de oração que se espalham por todo o Brasil e em outros países.\n\nAcreditamos que o matrimônio não é apenas um contrato social, mas uma aliança sagrada que, quando vivida plenamente, reflete o amor e a união que trazem paz e prosperidade para toda a casa.",
    historyImage:
      data?.historyImage ||
      "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&q=80&w=2070",
    historyVideoUrl: data?.historyVideoUrl || "",
    principlesTitle: data?.principlesTitle || "Missão, Visão e Valores",
    principles:
      data !== null
        ? (data.principles || [])
        : [
            {
              id: 1,
              title: data?.missionTitle || "Nossa Missão",
              description:
                data?.missionText ||
                "Proporcionar ferramentas bíblicas e apoio emocional para que casais possam edificar lares sólidos, baseados no amor, respeito e fidelidade.",
              image: "",
            },
            {
              id: 2,
              title: data?.visionTitle || "Nossa Visão",
              description:
                data?.visionText ||
                "Ser referência global na restauração de casamentos, alcançando cada família com a mensagem de esperança e reconstrução do lar.",
              image: "",
            },
            {
              id: 3,
              title: data?.valuesTitle || "Nossos Valores",
              description:
                data?.valuesText ||
                "Fidelidade às Escrituras, integridade nas relações, compromisso com o próximo e valorização do legado familiar intergeracional.",
              image: "",
            },
          ],
    teamTitle: data?.teamTitle || "Ministério Apascentando Filhos",
    teamLogo: data?.teamLogo || "/logomaf.png",
    teamBoxTitle: data?.teamBoxTitle || "Liderança e Apoio",
    teamBoxText:
      data?.teamBoxText ||
      "Nosso ministério faz parte da rede **Apascentando Filhos**, focada não apenas no casal, mas na formação integral da criança e do adolescente sob a luz do Evangelho. Contamos com líderes treinados e capacitados em todo o país para prestar mentoria e suporte personalizado a cada família que busca nossa ajuda.",
    teamBoxImage: data?.teamBoxImage || "",
  };

  const [isTeamTextExpanded, setIsTeamTextExpanded] = useState(false);

  const formatText = (text: string) => {
    // Simple bold formatting replacement for **text**
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="pt-20 min-h-screen bg-[#f7fafd]">
      {/* Header */}
      <section className="bg-gradient-to-br from-primary-base to-primary-light pt-14 pb-24 text-center text-white">
        <div className="max-w-4xl mx-auto px-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[2.2rem] md:text-5xl font-black font-serif tracking-wide mb-4"
          >
            {content.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[1.1rem] opacity-90 max-w-[600px] mx-auto italic whitespace-pre-line"
          >
            {content.subtitle}
          </motion.p>
        </div>
      </section>

      {/* Story Section */}
      <section className="max-w-7xl mx-auto px-6 -mt-12 relative z-10 mb-16">
        <div className="bg-white rounded-[14px] shadow-[0_4px_28px_rgba(0,0,0,0.10)] p-8 md:p-12 mb-16 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-primary-dark mb-6">
              {content.historyTitle}
            </h2>
            <div className="text-[#2c4a63] text-lg leading-relaxed whitespace-pre-line">
              {content.historyText}
            </div>
          </div>
          <div className="relative">
            {content.historyVideoUrl ? (
              <iframe
                src={(() => {
                  let url = content.historyVideoUrl;
                  try {
                    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|live\/|shorts\/))([\w-]{11})/);
                    if (match && match[1]) {
                      return `https://www.youtube.com/embed/${match[1]}`;
                    }
                  } catch (e) {
                    console.error("Error formatting video url", e);
                  }
                  return url;
                })()}
                title="História Video"
                className="rounded-3xl shadow-xl w-full aspect-[4/3] border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <img
                src={content.historyImage}
                alt="Story Image"
                className="rounded-3xl shadow-xl w-full object-cover aspect-[4/3]"
              />
            )}
          </div>
        </div>

        {/* Principles */}
        <div className="mb-16">
          <h2 className="text-center text-3xl md:text-4xl font-bold font-serif text-primary-dark mb-12">
            {content.principlesTitle}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {content.principles.map((principle: any, idx: number) => {
              let Icon = Target;
              if (idx === 1) Icon = Users;
              if (idx === 2) Icon = ShieldCheck;
              if (idx > 2) Icon = Target;

              return (
                <div
                  key={principle.id || idx}
                  className="bg-white p-8 rounded-2xl border border-[#e2eaf3] hover:shadow-lg transition-shadow text-center flex flex-col items-center"
                >
                  {principle.image ? (
                    <div className="w-full h-48 mb-6 overflow-hidden rounded-xl bg-gray-50 flex items-center justify-center">
                      <img
                        src={principle.image}
                        alt={principle.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 mx-auto bg-[#f7fafd] rounded-full flex items-center justify-center mb-6 border border-[#c8d8e8] text-primary-base">
                      <Icon className="w-8 h-8" />
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-primary-dark mb-4">
                    {principle.title}
                  </h3>
                  <p className="text-[#2c4a63] leading-relaxed">
                    {principle.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team / Ministry */}
        <div>
          <div className="flex flex-col items-center mb-12">
            {content.teamLogo && (
              <img
                src={content.teamLogo}
                alt={content.teamTitle}
                className="h-24 w-auto mb-6 object-contain"
              />
            )}
            {content.teamTitle && (
              <h2 className="text-center text-3xl md:text-4xl font-bold font-serif text-primary-dark">
                {content.teamTitle}
              </h2>
            )}
          </div>
          <div className="flex flex-col md:flex-row gap-10 items-start bg-white p-8 md:p-12 rounded-[14px] shadow-[0_4px_28px_rgba(0,0,0,0.10)] border border-[#e2eaf3]">
            <div className="w-48 h-48 rounded-full overflow-hidden shrink-0 border-4 border-primary-base/20 bg-[#f7fafd] flex items-center justify-center mx-auto md:mx-0">
              {content.teamBoxImage ? (
                <img
                  src={content.teamBoxImage}
                  alt="Feature Box"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Users size={80} className="text-primary-base/50 shadow-sm" />
              )}
            </div>
            <div className="w-full">
              <h3 className="text-2xl font-bold font-serif text-primary-dark mb-4 flex items-center gap-2">
                <Heart className="text-primary-base" size={24} />{" "}
                {content.teamBoxTitle}
              </h3>
              <div className="text-[#2c4a63] text-lg leading-relaxed">
                <div className={isTeamTextExpanded ? "whitespace-pre-line" : "whitespace-pre-line line-clamp-6 md:line-clamp-5 overflow-hidden"}>
                  {formatText(content.teamBoxText)}
                </div>
                {content.teamBoxText.length > 250 && (
                  <button 
                    onClick={() => setIsTeamTextExpanded(!isTeamTextExpanded)}
                    className="mt-4 text-primary-base font-bold hover:text-primary-dark transition-colors"
                  >
                    {isTeamTextExpanded ? "Ler menos" : "Leia mais"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
