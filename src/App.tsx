/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, ErrorInfo, ReactNode } from "react";
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
import { Toaster } from "react-hot-toast";
import { auth, db } from "./lib/firebase";

export class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "20px", background: "white", color: "red", zIndex: 9999, position: "absolute", inset: 0 }}>
          <h1>Something went wrong in React.</h1>
          <pre>{this.state.error?.toString()}</pre>
          <pre>{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import ThemeProvider from "./components/ThemeProvider";
import Home from "./pages/Home";

// Static imports for pages to prevent duplicated React chunks and Hook issues
import AdminPanel from "./pages/dashboard/AdminPanel";
import QuemSomos from "./pages/QuemSomos";
import Noticias from "./pages/Noticias";
import EdificadoMatrimonio from "./pages/EdificadoMatrimonio";
import Cursos from "./pages/Cursos";
import DetalheCurso from "./pages/DetalheCurso";
import Contato from "./pages/Contato";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import CadastroMembro from "./pages/CadastroMembro";
import ColunistaPage from "./pages/ColunistaPage";
import ArtigoPage from "./pages/ArtigoPage";
import FilhosDePaz from "./pages/FilhosDePaz";
import MafKids from "./pages/MafKids";
import Agenda from "./pages/Agenda";
import NotFound from "./pages/NotFound";

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
      <Toaster position="top-right" />
      <ErrorBoundary>
        <Router>
          <ScrollToTop />
          <AppContent />
        </Router>
      </ErrorBoundary>
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
            if (!data.logoUrl || data.logoUrl === "/logo.png" || data.logoUrl === "") {
              updates.logoUrl = "/logomaf.png";
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
            if (!data.logoUrl || data.logoUrl === "/logo.png" || data.logoUrl === "") {
              updates.logoUrl = "/logomaf.png";
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
            <Route path="/maf-kids" element={<MafKids />} />
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
