/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Outlet,
  Navigate,
} from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./lib/firebase";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import ThemeProvider from "./components/ThemeProvider";
import Home from "./pages/Home";

// Lazy load pages
import AdminPanel from "./pages/dashboard/AdminPanel";
const QuemSomos = lazy(() => import("./pages/QuemSomos"));
const Noticias = lazy(() => import("./pages/Noticias"));
const EdificadoMatrimonio = lazy(() => import("./pages/EdificadoMatrimonio"));
const Cursos = lazy(() => import("./pages/Cursos"));
const DetalheCurso = lazy(() => import("./pages/DetalheCurso"));
const Contato = lazy(() => import("./pages/Contato"));
const Login = lazy(() => import("./pages/Login"));
const Cadastro = lazy(() => import("./pages/Cadastro"));
const CadastroMembro = lazy(() => import("./pages/CadastroMembro"));
const ColunistaPage = lazy(() => import("./pages/ColunistaPage"));
const ArtigoPage = lazy(() => import("./pages/ArtigoPage"));
const FilhosDePaz = lazy(() => import("./pages/FilhosDePaz"));
const Agenda = lazy(() => import("./pages/Agenda"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <ScrollToTop />
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

function AppContent() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // 1. Migrate header_logo
          const headerRef = doc(db, "content", "header_logo");
          const headerSnap = await getDoc(headerRef);
          if (headerSnap.exists()) {
            const data = headerSnap.data();
            const updates: any = {};
            if (data.logoTitle === "EDIFICADO" || data.title === "EDIFICADO" || !data.logoTitle) {
              updates.logoTitle = "MINISTÉRIO";
              updates.title = "MINISTÉRIO";
            }
            if (data.logoSubtitle === "MATRIMÔNIO" || data.subtitle === "MATRIMÔNIO" || !data.logoSubtitle) {
              updates.logoSubtitle = "APASCENTANDO FILHOS";
              updates.subtitle = "APASCENTANDO FILHOS";
            }
            if (Object.keys(updates).length > 0) {
              await setDoc(headerRef, updates, { merge: true });
              console.log("Database Migration: Header logo updated successfully.");
            }
          }

          // 2. Migrate footer
          const footerRef = doc(db, "content", "footer");
          const footerSnap = await getDoc(footerRef);
          if (footerSnap.exists()) {
            const data = footerSnap.data();
            const updates: any = {};
            if (data.logoTitle === "EDIFICADO" || !data.logoTitle) {
              updates.logoTitle = "MINISTÉRIO";
            }
            if (data.logoSubtitle === "MATRIMÔNIO" || !data.logoSubtitle) {
              updates.logoSubtitle = "APASCENTANDO FILHOS";
            }
            if (
              !data.description ||
              data.description.includes("casamentos e famílias") ||
              data.description.includes("fortalecer casamentos")
            ) {
              updates.description = "Um ministério dedicado a glorificar a Deus através de lares edificados e filhos guiados pela Palavra.";
            }
            if (Object.keys(updates).length > 0) {
              await setDoc(footerRef, updates, { merge: true });
              console.log("Database Migration: Footer content updated successfully.");
            }
          }

          // 3. Migrate contato
          const contatoRef = doc(db, "content", "contato");
          const contatoSnap = await getDoc(contatoRef);
          if (contatoSnap.exists()) {
            const data = contatoSnap.data();
            const updates: any = {};
            if (data.emailText === "contato@edificadomatrimonio.com.br" || !data.emailText) {
              updates.emailText = "contato@apascentandofilhos.com.br";
            }
            if (Object.keys(updates).length > 0) {
              await setDoc(contatoRef, updates, { merge: true });
              console.log("Database Migration: Contato content updated successfully.");
            }
          }
        } catch (err) {
          console.error("Database Migration error:", err);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden w-full">
      {!isDashboard && <Navbar />}
      <main className="flex-grow">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/quem-somos" element={<QuemSomos />} />
            <Route path="/noticias" element={<Noticias />} />
            <Route path="/edificado-matrimonio" element={<EdificadoMatrimonio />} />
            <Route path="/cursos" element={<Cursos />} />
            <Route path="/casas-de-paz" element={<FilhosDePaz />} />
            <Route path="/filhos-de-paz" element={<FilhosDePaz />} />
            <Route path="/filhos de paz" element={<FilhosDePaz />} />
            <Route path="/Filhos de Paz" element={<FilhosDePaz />} />
            <Route path="/Filhos-de-Paz" element={<FilhosDePaz />} />
            <Route path="/FilhosDePaz" element={<FilhosDePaz />} />
            <Route path="/filhosdepaz" element={<FilhosDePaz />} />
            <Route path="/cursos/detalhes/:courseTitle" element={<DetalheCurso />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/agenda-2026" element={<Agenda />} />
            <Route path="/contato" element={<Contato />} />
            <Route path="/colunista/:nome" element={<ColunistaPage />} />
            <Route path="/artigo/:id" element={<ArtigoPage />} />
            <Route path="/estudos" element={<Navigate to="/" replace />} />
  
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro" element={<Cadastro />} />
              <Route path="/cadastro-membro" element={<CadastroMembro />} />
            </Route>
  
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard/admin" element={<AdminPanel />} />
              <Route path="/admin" element={<Navigate to="/dashboard/admin" replace />} />
              <Route path="/dashboard" element={<Navigate to="/dashboard/admin" replace />} />
              <Route path="/dashboard/*" element={<Navigate to="/dashboard/admin" replace />} />
            </Route>
  
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      {!isDashboard && <Footer />}
    </div>
  );
}
