import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Menu, X, LayoutDashboard, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useFirebase } from "../context/FirebaseContext";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user, profile } = useFirebase();

  const [headerLogo, setHeaderLogo] = useState<any>(null); // Wait until loaded

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "content", "header_logo"), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setHeaderLogo({
          logoUrl: data.logoUrl || "",
          title: data.logoTitle || data.title || "",
          subtitle: data.logoSubtitle || data.subtitle || "",
          links: data.links && data.links.length > 0 ? data.links : [
            { name: "Início", path: "/" },
            { name: "Quem Somos", path: "/quem-somos" },
            { name: "Edificado Matrimônio", path: "/edificado-matrimonio" },
            { name: "Cursos", path: "/cursos" },
            { name: "Contato", path: "/contato" },
          ],
        });
      } else {
        setHeaderLogo({
          logoUrl: "",
          title: "MINISTÉRIO",
          subtitle: "APASCENTANDO FILHOS",
          links: [
            { name: "Início", path: "/" },
            { name: "Quem Somos", path: "/quem-somos" },
            { name: "Edificado Matrimônio", path: "/edificado-matrimonio" },
            { name: "Cursos", path: "/cursos" },
            { name: "Contato", path: "/contato" },
          ]
        })
      }
    }, (err) => console.error("Error fetching header:", err));
    return () => unsub();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  if (!headerLogo) return null; // Don't render until loaded

  const navLinks = headerLogo.links || [];

  const isTransparent = location.pathname === "/" && !scrolled;

  return (
    <nav
      translate="no"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        !isTransparent
          ? "bg-white/90 backdrop-blur-md shadow-sm py-3"
          : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 flex items-center justify-center transition-transform group-hover:scale-110">
            {headerLogo.logoUrl ? (
              <img
                src={headerLogo.logoUrl}
                alt={headerLogo.title}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://ui-avatars.com/api/?name=EM&background=1a6496&color=fff&rounded=true&bold=true";
                }}
              />
            ) : (
              <div className="w-full h-full bg-primary-base rounded-full flex items-center justify-center text-white font-bold text-xs">
                EM
              </div>
            )}
          </div>
          <div className="flex flex-col shrink-0 justify-center">
            <span
              className={`text-[16px] font-bold whitespace-nowrap leading-tight uppercase ${!isTransparent ? "text-primary-dark" : "text-white"}`}
            >
              {headerLogo.title}
            </span>
            <span
              className={`text-[16px] font-bold whitespace-nowrap leading-tight uppercase ${!isTransparent ? "text-primary-dark" : "text-white"}`}
            >
              {headerLogo.subtitle}
            </span>
          </div>
        </NavLink>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-4 lg:gap-8">
          {navLinks.map((link, idx) => (
            <NavLink
              key={`${link.path}-${idx}`}
              to={link.path}
              className={({ isActive }) =>
                `text-sm font-bold transition-colors hover:opacity-70 ${
                  isActive
                    ? !isTransparent
                      ? "text-primary-base"
                      : "text-white border-b-2 border-white"
                    : !isTransparent
                      ? "text-primary-dark"
                      : "text-white"
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
          {user ? (
            <div className="flex items-center gap-3">
              <NavLink
                to="/dashboard"
                className="btn-primary py-2 px-6 shadow-md hover:-translate-y-0.5 flex items-center gap-2"
              >
                <LayoutDashboard size={18} /> Painel de Controle
              </NavLink>
            </div>
          ) : (
            <NavLink
              to="/login"
              className="btn-primary py-2 px-6 shadow-md hover:-translate-y-0.5"
            >
              Painel de Controle
            </NavLink>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className={`md:hidden p-2 rounded-lg ${!isTransparent ? "text-primary-dark" : "text-white"}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-white shadow-xl p-6 md:hidden flex flex-col gap-4 border-t border-[#e2eaf3]"
          >
            {navLinks.map((link, idx) => (
              <NavLink
                key={`${link.path}-${idx}`}
                to={link.path}
                className={({ isActive }) =>
                  `text-lg font-bold py-2 border-b border-[#e2eaf3] ${isActive ? "text-primary-base" : "text-primary-dark"}`
                }
              >
                {link.name}
              </NavLink>
            ))}

            {user ? (
              <div className="flex flex-col gap-3 mt-4">
                <NavLink
                  to="/dashboard"
                  className="btn-primary flex items-center justify-center gap-2"
                >
                  <LayoutDashboard size={18} /> Painel de Controle
                </NavLink>
              </div>
            ) : (
              <NavLink to="/login" className="btn-primary text-center mt-4">
                Painel de Controle
              </NavLink>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
