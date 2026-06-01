import React from "react";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import { motion } from "motion/react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#fcfaf7] px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-8xl font-serif text-[#4a3f35] font-bold mb-4">
          404
        </h1>
        <h2 className="text-2xl font-serif text-gray-700 mb-6">
          Página não encontrada
        </h2>
        <p className="text-gray-500 mb-10 max-w-md mx-auto">
          A página que você está procurando pode ter sido removida, mudou de
          nome ou está temporariamente indisponível.
        </p>
        <Link
          to="/"
          className="btn-primary inline-flex items-center gap-2 px-8 py-4"
        >
          <Home size={20} />
          Voltar para o Início
        </Link>
      </motion.div>
    </div>
  );
}
