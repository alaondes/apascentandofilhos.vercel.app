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
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import ThemeProvider from "./components/ThemeProvider";

import Home from "./pages/Home";
import AdminPanel from "./pages/dashboard/AdminPanel";

// Lazy load pages
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
            <Route path="/cursos/detalhes/:courseTitle" element={<DetalheCurso />} />
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
