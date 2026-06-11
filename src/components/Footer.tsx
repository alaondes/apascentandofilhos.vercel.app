import { useState, useEffect } from "react";
import {
  Instagram,
  Youtube,
  Facebook,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function Footer() {
  const [contactData, setContactData] = useState<any>(null);
  const [footerContent, setFooterContent] = useState<any>(null);

  useEffect(() => {
    const unsubCont = onSnapshot(doc(db, "content", "contato"), (snap) => {
      if (snap.exists()) setContactData(snap.data());
    }, (err) => console.error("Error loading contato:", err));

    const unsubFoot = onSnapshot(doc(db, "content", "footer"), (snap) => {
      if (snap.exists()) setFooterContent(snap.data());
    }, (err) => console.error("Error loading footer:", err));

    return () => {
      unsubCont();
      unsubFoot();
    }
  }, []);

  const addressText =
    contactData?.addressText ||
    "Atuação em todo o território nacional e extensões internacionais.";
  const emailText =
    contactData?.emailText || "contato@apascentandofilhos.com.br";
  const phoneText = contactData?.phoneText || "+55 (00) 00000-0000";

  return (
    <footer className="bg-footer-bg text-footer-text pt-24 pb-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary-base/5 to-transparent z-0" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 flex items-center justify-center">
                <img
                  src={footerContent?.logoUrl || "/logo.png"}
                  alt="Apascentando Filhos Logo"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://ui-avatars.com/api/?name=MAF&background=ffffff&color=1a6496&rounded=true&bold=true";
                  }}
                />
              </div>
              <div className="shrink-0 flex flex-col mt-1">
                <span className="text-[18px] font-black tracking-tight drop-shadow-sm whitespace-nowrap leading-tight text-footer-text uppercase">
                  {footerContent?.logoTitle || "MINISTÉRIO"}
                </span>
                <span className="text-[18px] font-black tracking-tight drop-shadow-sm whitespace-nowrap leading-tight text-footer-text uppercase">
                  {footerContent?.logoSubtitle || "APASCENTANDO FILHOS"}
                </span>
              </div>
            </div>
            <p className="text-footer-text/80 max-w-md leading-relaxed text-lg italic">
              {footerContent?.description || "Um ministério dedicado a glorificar a Deus através de lares edificados e filhos guiados pela Palavra."}
            </p>
            <div className="flex gap-4 mt-8">
              <a
                href={footerContent?.instagram || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-footer-text/20 flex items-center justify-center hover:bg-primary-base hover:border-transparent transition-all hover:scale-110"
              >
                <Instagram size={20} />
              </a>
              <a
                href={footerContent?.youtube || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-footer-text/20 flex items-center justify-center hover:bg-primary-base hover:border-transparent transition-all hover:scale-110"
              >
                <Youtube size={20} />
              </a>
              <a
                href={footerContent?.facebook || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-footer-text/20 flex items-center justify-center hover:bg-primary-base hover:border-transparent transition-all hover:scale-110"
              >
                <Facebook size={20} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-widest font-bold text-footer-text/50 mb-8">
              Navegação
            </h4>
            <ul className="space-y-4">
              {[
                { name: "Início", path: "/" },
                { name: "Quem Somos", path: "/quem-somos" },
                { name: "Edificado Matrimônio", path: "/edificado-matrimonio" },
                { name: "Escola MAF", path: "/cursos" },
                { name: "Contato", path: "/contato" },
                { name: "Área do Líder", path: "/login" },
                { name: "Área do Colunista", path: "/login" },
              ].map((link) => (
                <li key={link.name}>
                  <NavLink
                    to={link.path}
                    className="text-footer-text/80 hover:text-footer-text transition-colors flex items-center gap-2 group font-medium"
                  >
                    <ChevronRight
                      size={14}
                      className="opacity-0 -ml-4 transition-all group-hover:opacity-100 group-hover:ml-0 text-primary-light"
                    />
                    {link.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-widest font-bold text-footer-text/50 mb-8">
              Informação
            </h4>
            <ul className="space-y-6">
              <li className="flex gap-4">
                <MapPin size={20} className="text-primary-light shrink-0" />
                <span className="text-sm text-footer-text/80">{addressText}</span>
              </li>
              <li className="flex gap-4">
                <Mail size={20} className="text-primary-light shrink-0" />
                <span className="text-sm text-footer-text/80">{emailText}</span>
              </li>
              <li className="flex gap-4">
                <Phone size={20} className="text-primary-light shrink-0" />
                <span className="text-sm text-footer-text/80">{phoneText}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-footer-text/10 flex flex-col md:flex-row justify-center items-center gap-6">
          
          <p className="text-footer-text/50 text-sm font-medium">
            &copy; {new Date().getFullYear()} {footerContent?.copyrightText || "Ministério Apascentando Filhos Brasil. Todos os direitos reservados."}
          </p>
        </div>
      </div>
    </footer>
  );
}
