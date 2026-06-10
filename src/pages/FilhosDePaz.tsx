import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Link2, Linkedin, Twitter, MessageCircle } from "lucide-react";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { doc, onSnapshot, collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function FilhosDePaz() {
  const [data, setData] = useState<any>({
    heroTitle: "Filhos de Paz",
    heroImage: "https://images.unsplash.com/photo-1544256718-3baf24732b4f?auto=format&fit=crop&q=80&w=2000",
    sectionTitle: "Filhos de Paz",
    text1: "Um filho de paz é um lugar onde se leva a luz, a unção, e a presença Sobrenatural de Deus para uma família, vizinhos e amigos. Muitas pessoas, nos dias de hoje, estão decepcionadas com a igreja no ambiente do prédio.",
    text2: "Os filhos de paz têm como objetivo levar a mesma atmosfera do prédio para dentro da casa das pessoas. É um ambiente de adoração, celebração, oração e vida. Atraindo os sinais, Milagres e Maravilhas que Jesus prometeu em sua palavra para dentro da intimidade do lar.",
    text3: "Um filho de paz é um centro de reconciliação entre Deus e a família!",
    mainImage: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=800",
    visaoTitle: "Filhos de Paz - a Visão de Jesus para Evangelização",
    visaoText1: "Jesus em Lucas 10, deixou a estratégia simples e eficaz no processo de evangelização de casa em casa.\nTodo o processo começa com a preparação dos líderes dos Filhos de Paz. A formação e o treinamento acontecem dentro de um mês aproximadamente.",
    visaoText2: "No treinamento detalhamos toda a estratégia de Jesus para alcançarmos os \"não-crentes\" a partir da casa deles.\nPara participar do treinamento dos Filhos de Paz é preciso ser membro da Abba Church Marlboro, ter frequentado a classe de membresia e a escola de DNA e Fundamentos da Visão e Cultura da Abba Church Marlboro.",
    whatsappLink: "https://wa.me/55000000000",
    redesBgColor: "#d6965f",
    redesTitle: "Temos outras\nredes e ministérios",
    redesSub: "Veja qual delas você mais se identifica",
    redesList: [
      {
        title: "Rede de Mulheres",
        image: "https://images.unsplash.com/photo-1510255562709-322ce64821db?auto=format&fit=crop&q=80&w=600",
        link: "/cursos"
      },
      {
        title: "Rede de Homens",
        image: "https://images.unsplash.com/photo-1506869640319-fea1a2ab8e9c?auto=format&fit=crop&q=80&w=600",
        link: "/cursos"
      },
      {
        title: "Flow Up Rede de Jovens",
        image: "https://images.unsplash.com/photo-1523580456209-567a5b3a32f6?auto=format&fit=crop&q=80&w=600",
        link: "/cursos"
      },
      {
        title: "RISYTH Rede de Adolescentes",
        image: "https://images.unsplash.com/photo-1511632765486-a01c80cb8fa4?auto=format&fit=crop&q=80&w=600",
        link: "/cursos"
      },
    ],
  });

  const [subName, setSubName] = useState("");
  const [subEmail, setSubEmail] = useState("");
  const [subWhatsapp, setSubWhatsapp] = useState("");
  const [agreedLgpd, setAgreedLgpd] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newsletterSuccess, setNewsletterSuccess] = useState("");
  const [newsletterError, setNewsletterError] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "content", "filhos_de_paz"), (snap) => {
      if (snap.exists()) {
        setData((prev: any) => ({ ...prev, ...snap.data() }));
      }
    });
    return () => unsub();
  }, []);

  const handleSubmitNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName || !subEmail || !subWhatsapp) {
      setNewsletterError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    if (!agreedLgpd) {
      setNewsletterError("Você precisa concordar em compartilhar seus dados de acordo com a LGPD.");
      return;
    }

    setIsSubmitting(true);
    setNewsletterError("");
    setNewsletterSuccess("");

    try {
      await addDoc(collection(db, "newsletter_subscribers"), {
        name: subName,
        email: subEmail,
        whatsapp: subWhatsapp,
        createdAt: serverTimestamp(),
        concordoLgpd: true
      });
      setNewsletterSuccess("Inscrição realizada com sucesso! Obrigado por se inscrever.");
      setSubName("");
      setSubEmail("");
      setSubWhatsapp("");
      setAgreedLgpd(false);
    } catch (err) {
      console.error("Error submitting newsletter subscription:", err);
      setNewsletterError("Ocorreu um erro ao enviar sua inscrição. Por favor, tente novamente.");
      handleFirestoreError(err, OperationType.CREATE, "newsletter_subscribers");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-20 bg-[#f7f7f7] min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[400px] w-full bg-black">
        <div className="absolute inset-0 z-10 bg-black/40" />
        <img
          src={data.heroImage}
          alt="Banner background"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 z-20 max-w-6xl mx-auto px-6 pt-16 flex justify-between items-start">
          <h1 className="text-white text-5xl md:text-6xl font-black font-sans tracking-tight whitespace-pre-wrap">
            {data.heroTitle}
          </h1>
          <button className="bg-white rounded-full w-8 h-8 flex items-center justify-center text-black font-bold">
            <Link2 size={16} />
          </button>
        </div>
      </section>

      {/* Main Content Overlapping */}
      <section className="max-w-6xl mx-auto px-6 relative z-30 mt-12">
        <div className="flex flex-col md:flex-row gap-8 items-stretch">
          {/* Text Card */}
          <div className="bg-white p-8 md:p-12 w-full md:w-1/2 shadow-sm rounded-[2px] flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">{data.sectionTitle}</h2>
              <div className="space-y-6 text-sm text-gray-600 leading-relaxed font-medium">
                <p>{data.text1}</p>
                <p>{data.text2}</p>
                <p>{data.text3}</p>
              </div>
            </div>
            
            {/* Share */}
            <div className="mt-8 flex items-center gap-4 text-[10px] font-bold text-gray-300 uppercase tracking-[0.1em]">
              Compartilhe
              <div className="flex items-center gap-3">
                <button className="hover:text-gray-500 transition-colors"><Link2 size={12} /></button>
                <button className="hover:text-gray-500 transition-colors"><Linkedin size={12} /></button>
                <button className="hover:text-gray-500 transition-colors"><Twitter size={12} /></button>
                <button className="hover:text-gray-500 transition-colors"><MessageCircle size={12} /></button>
              </div>
            </div>
          </div>

          {/* Image Overlapping */}
          <div className="w-full md:w-1/2 shadow-sm bg-white rounded-[2px] overflow-hidden flex min-h-[350px] md:min-h-full">
            <img 
              src={data.mainImage} 
              alt="Main Content" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Visão de Jesus section */}
        <div className="mt-16 text-left">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-6 font-sans">
            {data.visaoTitle}
          </h2>
          <div className="space-y-4 text-xs font-medium text-gray-800 leading-relaxed max-w-4xl whitespace-pre-wrap">
            <p>{data.visaoText1}</p>
            <p>{data.visaoText2}</p>
          </div>

          <div className="mt-12 flex justify-center pb-12">
            <a href={data.whatsappLink} target="_blank" rel="noopener noreferrer" className="bg-[#fc5d46] text-white px-8 py-2.5 rounded-full font-bold text-xs hover:bg-[#e04b36] transition-colors shadow-sm">
              Clique aqui e fale com a gente!
            </a>
          </div>
        </div>
      </section>

      {/* Dynamic style tag to dynamically respect user background colors without inline attributes */}
      <style>{`
        .custom-redes-bg {
          background-color: ${data.redesBgColor || '#d6965f'} !important;
        }
      `}</style>
      
      {/* Outras redes section */}
      <section className="mt-16 relative custom-redes-bg py-24">
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-[1.1] whitespace-pre-line">
              {data.redesTitle || "Temos outras\nredes e ministérios"}
            </h2>
            <p className="text-[#333333]/70 font-bold tracking-[0.3em] uppercase text-[9px] mt-6">
              {data.redesSub || "Veja qual delas você mais se identifica"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Dynamic Cards */}
            {data.redesList && data.redesList.map((rede: any, idx: number) => {
              const CardContent = (
                <>
                  <img
                    src={rede.image || "https://images.unsplash.com/photo-1510255562709-322ce64821db?auto=format&fit=crop&q=80&w=600"}
                    className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-75 group-hover:scale-110 transition-all duration-700"
                    alt={rede.title}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-6 z-10 flex flex-col items-center">
                    <h3 className="text-white font-black text-lg text-center px-4 w-full group-hover:-translate-y-1 transition-transform duration-300">
                      {rede.title}
                    </h3>
                    {rede.link && (
                      <span className="text-[10px] font-extrabold text-[#fc5d46] tracking-[0.2em] uppercase mt-2 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-1 select-none">
                        <Link2 size={12} className="inline" /> ver mais
                      </span>
                    )}
                  </div>
                </>
              );

              const cardClasses = "relative h-[340px] group overflow-hidden bg-black flex items-end justify-center rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-white/5";

              if (rede.link) {
                const isExternal = rede.link.startsWith("http") || rede.link.startsWith("wa.me") || rede.link.startsWith("//");
                if (isExternal) {
                  let url = rede.link;
                  if (rede.link.startsWith("wa.me")) {
                    url = "https://" + rede.link;
                  }
                  return (
                    <a
                      key={idx}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cardClasses}
                    >
                      {CardContent}
                    </a>
                  );
                } else {
                  return (
                    <Link
                      key={idx}
                      to={rede.link}
                      className={cardClasses}
                    >
                      {CardContent}
                    </Link>
                  );
                }
              }

              return (
                <div key={idx} className={cardClasses}>
                  {CardContent}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-white py-16 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-6 flex flex-col items-center text-center">
          <h3 className="text-sm font-bold text-gray-800 mb-8 font-sans">
            Receba nosso informativo da semana!
          </h3>
          <form onSubmit={handleSubmitNewsletter} className="w-full flex-col flex items-center gap-6">
            <div className="flex flex-col md:flex-row gap-3 w-full justify-center">
              <input
                type="text"
                placeholder="Nome"
                value={subName}
                onChange={(e) => setSubName(e.target.value)}
                disabled={isSubmitting}
                required
                className="border border-gray-300 px-4 py-2.5 text-xs w-full md:w-56 outline-none focus:border-[#fc5d46] rounded-[2px]"
              />
              <input
                type="email"
                placeholder="E-mail"
                value={subEmail}
                onChange={(e) => setSubEmail(e.target.value)}
                disabled={isSubmitting}
                required
                className="border border-gray-300 px-4 py-2.5 text-xs w-full md:w-56 outline-none focus:border-[#fc5d46] rounded-[2px]"
              />
              <input
                type="tel"
                placeholder="WhatsApp"
                value={subWhatsapp}
                onChange={(e) => setSubWhatsapp(e.target.value)}
                disabled={isSubmitting}
                required
                className="border border-gray-300 px-4 py-2.5 text-xs w-full md:w-56 outline-none focus:border-[#fc5d46] rounded-[2px]"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#fc5d46] hover:bg-[#e04b36] text-white font-bold px-8 py-2.5 text-xs min-w-[120px] rounded-[2px] transition-colors disabled:opacity-55"
              >
                {isSubmitting ? "Enviando..." : "Enviar"}
              </button>
            </div>
            
            <div className="w-full max-w-3xl flex flex-col items-center gap-2">
              <label className="flex items-start gap-3 mt-2 cursor-pointer text-left">
                <input
                  type="checkbox"
                  checked={agreedLgpd}
                  onChange={(e) => setAgreedLgpd(e.target.checked)}
                  disabled={isSubmitting}
                  className="mt-1 border-gray-300 text-[#fc5d46] outline-none rounded-[2px]"
                  required
                />
                <span className="text-[9px] text-gray-500 font-medium leading-tight">
                  Concordo que os dados preenchidos acima serão usados para o envio de conteúdo informativo, analítico e publicitário sobre produtos, serviços e assuntos gerais, nos termos da Lei Geral de Proteção de Dados.
                </span>
              </label>

              {newsletterSuccess && (
                <p className="text-xs font-bold text-green-600 mt-2 p-2 bg-green-50 border border-green-200 rounded w-full max-w-lg text-center">
                  {newsletterSuccess}
                </p>
              )}
              {newsletterError && (
                <p className="text-xs font-bold text-red-600 mt-2 p-2 bg-red-50 border border-red-200 rounded w-full max-w-lg text-center">
                  {newsletterError}
                </p>
              )}
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
