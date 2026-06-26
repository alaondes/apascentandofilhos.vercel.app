import React from "react";
import { DollarSign } from "lucide-react";

interface FinanceiroPanelProps {
  isEmbedded?: boolean;
}

const FinanceiroPanel: React.FC<FinanceiroPanelProps> = ({ isEmbedded }) => {
  return (
    <div className={`w-full ${isEmbedded ? "h-full" : "min-h-screen bg-gray-50"} flex flex-col`}>
      <div className="p-6 border-b border-[#e2eaf3] bg-white flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-2xl font-black text-primary-dark flex items-center gap-2 tracking-tight">
            <DollarSign className="text-primary-base" size={28} />
            Financeiro
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Gerencie suas contribuições, dízimos e ofertas.
          </p>
        </div>
      </div>
      <div className="flex-1 p-6 flex flex-col items-center justify-center bg-gray-50">
         <div className="bg-white p-8 rounded-xl shadow-sm border border-[#e2eaf3] text-center max-w-md">
            <DollarSign size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-primary-dark mb-2">Em Desenvolvimento</h3>
            <p className="text-gray-500">
              O módulo financeiro estará disponível em breve. Aqui você poderá acompanhar suas contribuições, gerar relatórios e fazer doações de forma segura.
            </p>
         </div>
      </div>
    </div>
  );
};

export default FinanceiroPanel;
