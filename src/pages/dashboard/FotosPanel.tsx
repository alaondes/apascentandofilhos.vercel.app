import React from "react";
import { Image as ImageIcon } from "lucide-react";

interface FotosPanelProps {
  isEmbedded?: boolean;
}

const FotosPanel: React.FC<FotosPanelProps> = ({ isEmbedded }) => {
  return (
    <div className={`w-full ${isEmbedded ? "h-full" : "min-h-screen bg-gray-50"} flex flex-col`}>
      <div className="p-6 border-b border-[#e2eaf3] bg-white flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-2xl font-black text-primary-dark flex items-center gap-2 tracking-tight">
            <ImageIcon className="text-primary-base" size={28} />
            Fotos
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Galeria de fotos e álbuns de eventos.
          </p>
        </div>
      </div>
      <div className="flex-1 p-6 flex flex-col items-center justify-center bg-gray-50">
         <div className="bg-white p-8 rounded-xl shadow-sm border border-[#e2eaf3] text-center max-w-md">
            <ImageIcon size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-primary-dark mb-2">Em Desenvolvimento</h3>
            <p className="text-gray-500">
              O módulo de fotos estará disponível em breve. Aqui você poderá ver as fotos dos eventos da igreja.
            </p>
         </div>
      </div>
    </div>
  );
};

export default FotosPanel;
