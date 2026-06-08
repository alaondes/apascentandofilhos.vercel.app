import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Calendar, ArrowLeft, MessageCircle } from "lucide-react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const formatUrl = (url?: string) => {
  if (!url) return "#";
  if (!url.startsWith("http") && !url.startsWith("/")) {
    return `https://${url}`;
  }
  return url;
};

export default function Noticias() {
  const [homeData, setHomeData] = useState<any>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "site_content", "home"), (docSnap) => {
      if (docSnap.exists()) {
        setHomeData(docSnap.data());
      }
    });
    return () => unsub();
  }, []);

  const newsItems = homeData?.newsItems || [];

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#f7f9fc]">
      <Navbar />
      <div className="relative pt-[120px] pb-12 bg-[#1b2b4d] text-white">
        <div className="max-w-7xl mx-auto px-6">
          <Link to="/" className="inline-flex items-center text-white/70 hover:text-white transition-colors mb-6 text-sm font-bold">
            <ArrowLeft size={16} className="mr-2" />
            Voltar para Início
          </Link>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">Todas as Notícias</h1>
          <p className="text-lg text-white/80 max-w-2xl text-balance">
            Acompanhe todas as atualizações, eventos e notícias do nosso ministério em um só lugar.
          </p>
        </div>
      </div>

      <main className="flex-grow py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsItems.map((news: any, idx: number) => {
              if (!news.title && !news.imageUrl) return null;
              return (
                <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow group h-full">
                  <div className="w-full aspect-[16/10] relative overflow-hidden shrink-0 bg-gray-100">
                    {news.imageUrl && (
                      <img src={news.imageUrl} alt={news.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    )}
                  </div>
                  
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center gap-3 mb-4 flex-wrap">
                      {news.category && (
                        <span className="text-[10px] sm:text-xs font-bold bg-[#e11d48] text-white px-3 py-1 rounded-full whitespace-nowrap">
                          {news.category}
                        </span>
                      )}
                      <div className="flex items-center text-gray-500 text-xs sm:text-sm font-medium gap-1.5">
                        <Calendar size={14} />
                        <span>{news.date || "Atualizado"}</span>
                      </div>
                    </div>

                    <h4 className="text-lg md:text-xl font-bold text-[#1e3a8a] mb-3 leading-tight">
                      {news.title}
                    </h4>
                    
                    {news.description && (
                      <p className="text-gray-500 text-sm md:text-base line-clamp-3 mb-6">
                        {news.description}
                      </p>
                    )}

                    <div className="mt-auto flex justify-between items-center w-full pt-4 border-t border-gray-100">
                      <a 
                        href={formatUrl(news.linkUrl)}
                        target={formatUrl(news.linkUrl).startsWith("http") ? "_blank" : undefined}
                        className="text-[#3b82f6] hover:text-[#2563eb] text-sm font-bold flex items-center transition-colors group-hover:underline"
                      >
                        Continue lendo <ChevronRight size={16} className="ml-1" />
                      </a>
                      
                      {news.credits && (
                        <div className="text-xs text-gray-400 font-medium">
                          Fonte: {news.credits}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {newsItems.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
              <p className="text-gray-500 font-medium">Nenhuma notícia encontrada no momento.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
