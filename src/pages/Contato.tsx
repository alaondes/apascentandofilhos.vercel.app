import React, { useState, useEffect } from "react";
import { Mail, Phone, MapPin, Send, Heart } from "lucide-react";
import { motion } from "motion/react";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../lib/firebase";

export default function Contato() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const docRef = doc(db, "content", "contato");
    const unsub = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setData(docSnap.data());
      }
    });
    return () => unsub();
  }, []);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !email || !mensagem) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "contact_messages"), {
        nome,
        email,
        mensagem,
        status: "unread",
        createdAt: serverTimestamp(),
      });
      alert("Mensagem enviada com sucesso! Logo entraremos em contato.");
      setNome("");
      setEmail("");
      setMensagem("");
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      alert(
        "Houve um erro ao enviar sua mensagem. Tente novamente mais tarde.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const content = {
    title: data?.title || "Fale Conosco",
    subtitle:
      data?.subtitle ||
      "Tire suas dúvidas ou encontre um grupo de mentoria perto de você.",
    formTitle: data?.formTitle || "Envie sua Mensagem",
    channelsTitle: data?.channelsTitle || "Canais de Atendimento",
    emailText: data?.emailText || "contato@apascentandofilhos.com.br",
    phoneText: data?.phoneText || "+55 (00) 00000-0000",
    addressText:
      data?.addressText ||
      "Atendimento nacional e internacional através de núcleos locais.",
    quoteText:
      data?.quoteText || `"Transformando lares através da unidade e do amor."`,
    bottomText:
      data?.bottomText ||
      "Junte-se à nossa comunidade e descubra o plano extraordinário de Deus para sua família.",
  };

  return (
    <div className="pt-20 min-h-screen bg-[#f7fafd]">
      {/* Header */}
      <section className="bg-gradient-to-br from-primary-base to-primary-light pt-14 pb-24 text-center text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[2.2rem] md:text-5xl font-black font-serif tracking-wide mb-4"
          >
            {content.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[1.1rem] opacity-90 max-w-[600px] mx-auto italic"
          >
            {content.subtitle}
          </motion.p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-12 relative z-10 mb-20 grid md:grid-cols-2 gap-8 lg:gap-16">
        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-5 sm:p-8 md:p-12 rounded-[14px] shadow-[0_4px_28px_rgba(0,0,0,0.10)] border border-[#e2eaf3] w-full"
        >
          <h2 className="text-2xl md:text-3xl font-bold font-serif text-primary-dark mb-8">
            {content.formTitle}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="nome"
                className="text-xs font-bold text-[#2c4a63] uppercase tracking-wider"
              >
                Nome Completo
              </label>
              <input
                type="text"
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                disabled={isSubmitting}
                placeholder="Digite seu nome"
                className="w-full px-4 py-3.5 text-[0.92rem] rounded-xl bg-[#f7fafd] border border-[#c8d8e8] focus:outline-none focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all text-text-main"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-xs font-bold text-[#2c4a63] uppercase tracking-wider"
              >
                E-mail
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
                placeholder="exemplo@email.com"
                className="w-full px-4 py-3.5 text-[0.92rem] rounded-xl bg-[#f7fafd] border border-[#c8d8e8] focus:outline-none focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all text-text-main"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="mensagem"
                className="text-xs font-bold text-[#2c4a63] uppercase tracking-wider"
              >
                Mensagem ou Curso de Interesse
              </label>
              <textarea
                id="mensagem"
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                rows={5}
                required
                disabled={isSubmitting}
                placeholder="Escreva como podemos ajudar você e sua família..."
                className="w-full px-4 py-3.5 text-[0.92rem] rounded-xl bg-[#f7fafd] border border-[#c8d8e8] focus:outline-none focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all text-text-main resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary-base hover:bg-primary-dark text-white rounded-xl font-bold transition-all shadow-md disabled:opacity-50"
            >
              <Send size={18} />{" "}
              {isSubmitting ? "Enviando..." : "Enviar Solicitação"}
            </button>
          </form>
        </motion.div>

        {/* Contact Info */}
        <div className="flex flex-col justify-center space-y-8 md:space-y-12 w-full">
          <div className="bg-white p-5 sm:p-8 md:p-12 rounded-[14px] shadow-[0_4px_28px_rgba(0,0,0,0.10)] border border-[#e2eaf3] w-full">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-serif text-primary-dark mb-8 md:mb-10">
              {content.channelsTitle}
            </h2>
            <div className="space-y-6 md:space-y-8">
              <div className="flex gap-3 sm:gap-4 items-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-[#f7fafd] border border-[#c8d8e8] rounded-full flex items-center justify-center shrink-0">
                  <Mail className="text-primary-base w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-primary-dark text-sm sm:text-base">
                    E-mail
                  </h4>
                  <p
                    className="text-[#2c4a63] text-sm md:text-base break-all"
                    title={content.emailText}
                  >
                    {content.emailText}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 sm:gap-4 items-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-[#f7fafd] border border-[#c8d8e8] rounded-full flex items-center justify-center shrink-0">
                  <Phone className="text-primary-base w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-primary-dark text-sm sm:text-base">
                    Telefone / WhatsApp
                  </h4>
                  <p className="text-[#2c4a63] text-sm md:text-base">
                    {content.phoneText}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 sm:gap-4 items-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-[#f7fafd] border border-[#c8d8e8] rounded-full flex items-center justify-center shrink-0">
                  <MapPin className="text-primary-base w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-primary-dark text-sm sm:text-base">
                    Localização
                  </h4>
                  <p className="text-[#2c4a63] text-sm md:text-base">
                    {content.addressText}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 md:p-10 bg-gradient-to-br from-primary-base to-primary-light text-white rounded-[14px] shadow-xl relative overflow-hidden w-full">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Heart size={120} />
            </div>
            <h3 className="text-2xl mb-4 italic font-serif leading-relaxed relative z-10">
              {content.quoteText}
            </h3>
            <p className="text-white/80 relative z-10 font-medium">
              {content.bottomText}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
