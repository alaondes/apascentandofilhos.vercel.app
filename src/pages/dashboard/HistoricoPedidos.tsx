import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShoppingBag,
  Search,
  X,
  Package,
  CheckCircle2,
  Loader2,
  Calendar,
  DollarSign,
} from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db, auth } from "../../lib/firebase";

interface OrderItem {
  materialId: string;
  nome: string;
  qty: number;
  preco: number;
  emoji?: string;
  cor?: string;
}

interface Order {
  id: string;
  createdAt: any;
  itens: OrderItem[];
  totalGeral: number;
  observacoes: string;
  liderId: string;
  nomeLider: string;
  cidadeEstado: string;
  grupoNome: string;
}

export default function HistoricoPedidos() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!auth.currentUser) return;
      try {
        const q = query(
          collection(db, "orders"),
          where("liderId", "==", auth.currentUser.uid),
        );
        const querySnapshot = await getDocs(q);
        const fetchedOrders = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Order[];

        // Sort in memory since composite index might be needed for orderBy alongside where
        fetchedOrders.sort((a, b) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return timeB - timeA;
        });

        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Erro ao buscar histórico de pedidos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.cidadeEstado.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.createdAt?.toDate &&
        new Date(order.createdAt.toDate())
          .toLocaleDateString("pt-BR")
          .includes(searchTerm)),
  );

  return (
    <DashboardLayout>
      <section className="bg-gradient-to-br from-primary-base to-primary-light pt-14 pb-10 text-center text-white">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-4"
          >
            <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
              <ShoppingBag size={40} className="text-white" />
            </div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[2.2rem] font-black font-serif tracking-wide mb-3"
          >
            Histórico de Pedidos
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[1.1rem] opacity-90 max-w-[600px] mx-auto font-medium"
          >
            Acompanhe e visualize todos os pedidos de materiais solicitados
          </motion.p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div className="relative w-full md:w-96">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-base"
              size={20}
            />
            <input
              type="text"
              placeholder="Buscar por ID, cidade ou data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border-[1.5px] border-[#c8d8e8] rounded-xl text-sm focus:outline-none focus:border-primary-base focus:ring-[3px] focus:ring-primary-base/10 transition-all font-medium text-text-main shadow-sm"
            />
          </div>
          <div className="text-primary-dark font-medium bg-primary-bg px-4 py-2 rounded-lg border border-[#c8d8e8]">
            <strong className="text-primary-base">
              {filteredOrders.length}
            </strong>{" "}
            pedidos encontrados
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 text-primary-base">
            <Loader2 size={40} className="animate-spin mb-4" />
            <p className="font-bold text-lg font-serif">
              Carregando histórico...
            </p>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="grid gap-4">
            {filteredOrders.map((order, i) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                key={order.id}
                className="bg-white border-[1.5px] border-[#c8d8e8] p-5 rounded-xl shadow-sm hover:shadow-md hover:border-primary-base transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer"
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex items-start gap-4">
                  <div className="bg-[#f7fafd] p-3 rounded-lg border border-[#e2eaf3] text-primary-base mt-1 shrink-0">
                    <Package size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-primary-dark text-lg font-serif">
                      Pedido #{order.id.slice(0, 8).toUpperCase()}
                    </h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#444] mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} className="text-primary-base" />{" "}
                        {order.createdAt?.toMillis
                          ? new Date(
                              order.createdAt.toMillis(),
                            ).toLocaleDateString("pt-BR")
                          : "Data não disponível"}
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle2 size={14} className="text-[#27ae60]" />{" "}
                        {order.itens?.length || 0} itens diferentes
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-start md:items-end w-full md:w-auto">
                  <span className="text-xl font-bold text-primary-base font-mono">
                    {(order.totalGeral || 0).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                  <button className="text-sm font-bold text-primary-light hover:text-primary-base mt-2 transition-colors uppercase tracking-wide">
                    Ver Detalhes
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white border border-dashed border-[#c8d8e8] rounded-xl flex flex-col items-center">
            <ShoppingBag size={48} className="text-[#a0b8cc] mb-4" />
            <h3 className="text-xl font-bold text-primary-dark font-serif mb-2">
              Nenhum pedido encontrado
            </h3>
            <p className="text-[#444] max-w-md mx-auto">
              Você ainda não realizou nenhum pedido de material ou sua busca não
              retornou resultados.
            </p>
          </div>
        )}
      </section>

      {/* Modal Visualização Detalhes do Pedido */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-primary-dark/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[14px] shadow-[0_8px_32px_rgba(0,0,0,0.15)] flex flex-col border border-[#c8d8e8]"
            >
              {/* Sticky Header */}
              <div className="sticky top-0 bg-white border-b border-[#e2eaf3] px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-[1.25rem] font-bold font-serif text-primary-dark flex items-center gap-2">
                  <Package className="text-primary-base" size={22} />
                  Detalhes do Pedido{" "}
                  <span className="text-primary-light">
                    #{selectedOrder.id.slice(0, 8).toUpperCase()}
                  </span>
                </h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="bg-[#f0f7ff] hover:bg-[#d0eaf7] text-primary-base p-2 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-6 md:p-8 flex-grow">
                {/* section: Dados do Pedido */}
                <h2 className="text-[1.15rem] font-bold font-serif text-primary-dark m-0 mb-4 pb-2.5 border-b-2 border-[#e2eaf3] flex items-center gap-2">
                  Informações Iniciais
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border-[1.5px] border-[#c8d8e8] rounded-[10px] overflow-hidden mb-8">
                  <div className="px-4 py-3.5 bg-[#f7fafd] border-b sm:border-b-0 lg:border-r border-[#e2eaf3] sm:col-span-2 lg:col-span-1">
                    <div className="text-[0.76rem] font-bold text-primary-base uppercase tracking-[0.5px] mb-1">
                      Data
                    </div>
                    <div className="text-[0.96rem] font-semibold text-primary-dark">
                      {selectedOrder.createdAt?.toMillis
                        ? new Date(
                            selectedOrder.createdAt.toMillis(),
                          ).toLocaleString("pt-BR")
                        : "—"}
                    </div>
                  </div>
                  <div className="px-4 py-3.5 bg-white border-b sm:border-b-0 sm:border-r border-[#e2eaf3]">
                    <div className="text-[0.76rem] font-bold text-primary-base uppercase tracking-[0.5px] mb-1">
                      Líder
                    </div>
                    <div
                      className="text-[0.96rem] font-semibold text-primary-dark truncate"
                      title={selectedOrder.nomeLider}
                    >
                      {selectedOrder.nomeLider || "—"}
                    </div>
                  </div>
                  <div className="px-4 py-3.5 bg-white border-b sm:border-b-0 sm:border-r border-[#e2eaf3]">
                    <div className="text-[0.76rem] font-bold text-primary-base uppercase tracking-[0.5px] mb-1">
                      Grupo
                    </div>
                    <div
                      className="text-[0.96rem] font-semibold text-primary-dark truncate"
                      title={selectedOrder.grupoNome}
                    >
                      {selectedOrder.grupoNome || "—"}
                    </div>
                  </div>
                  <div className="px-4 py-3.5 bg-white">
                    <div className="text-[0.76rem] font-bold text-primary-base uppercase tracking-[0.5px] mb-1">
                      Cidade / UF
                    </div>
                    <div
                      className="text-[0.96rem] font-semibold text-primary-dark truncate"
                      title={selectedOrder.cidadeEstado}
                    >
                      {selectedOrder.cidadeEstado || "—"}
                    </div>
                  </div>
                </div>

                {/* section: Itens do Pedido */}
                <h2 className="text-[1.15rem] font-bold font-serif text-primary-dark m-0 mb-4 pb-2.5 border-b-2 border-[#e2eaf3] flex items-center gap-2">
                  Itens Solicitados
                </h2>

                <div className="border-[1.5px] border-[#c8d8e8] rounded-xl overflow-hidden mb-8">
                  <div className="bg-primary-base text-white text-[0.8rem] uppercase font-bold tracking-widest px-4 py-3 grid grid-cols-12 gap-2 text-center md:text-left">
                    <div className="col-span-6 md:col-span-8">Produto</div>
                    <div className="col-span-2 hidden md:block text-center">
                      Und.
                    </div>
                    <div className="col-span-6 md:col-span-2 text-right">
                      Subtotal
                    </div>
                  </div>
                  <div className="divide-y divide-[#e2eaf3] bg-white">
                    {selectedOrder.itens?.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="grid grid-cols-12 gap-2 px-4 py-3 items-center text-[0.92rem]"
                      >
                        <div className="col-span-8 md:col-span-8 flex items-center gap-3">
                          <span className="text-xl leading-none hidden sm:inline-block">
                            {item.emoji || "📦"}
                          </span>
                          <div>
                            <p className="font-semibold text-primary-dark leading-tight">
                              {item.nome}
                            </p>
                            {item.cor && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                Cor:{" "}
                                <span className="font-medium text-gray-700">
                                  {item.cor}
                                </span>
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-0.5 block md:hidden">
                              Qtd: {item.qty} un.
                            </p>
                          </div>
                        </div>
                        <div className="col-span-2 text-center text-primary-dark font-medium hidden md:block">
                          {item.qty} un.
                        </div>
                        <div className="col-span-4 md:col-span-2 text-right font-mono font-bold text-primary-dark">
                          {((item.preco || 0) * (item.qty || 0)).toLocaleString(
                            "pt-BR",
                            { style: "currency", currency: "BRL" },
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-primary-bg border-t border-[#c8d8e8] px-4 py-4 flex justify-end items-center gap-4">
                    <span className="uppercase text-[0.85rem] font-bold text-primary-base tracking-wider">
                      Total do Pedido:
                    </span>
                    <span className="text-2xl font-bold text-[#27ae60] font-mono">
                      {(selectedOrder.totalGeral || 0).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                  </div>
                </div>

                {selectedOrder.observacoes && (
                  <>
                    <h2 className="text-[1.15rem] font-bold font-serif text-primary-dark m-0 mb-4 pb-2.5 border-b-2 border-[#e2eaf3] flex items-center gap-2">
                      Observações
                    </h2>
                    <div className="bg-[#fafcff] border border-[#c8d8e8] p-4 rounded-xl text-[0.95rem] text-[#444] min-h-[80px]">
                      {selectedOrder.observacoes}
                    </div>
                  </>
                )}
              </div>

              {/* Sticky Footer */}
              <div className="sticky bottom-0 bg-[#f7fafd] border-t border-[#e2eaf3] p-4 sm:px-6 flex justify-end z-10 rounded-b-[14px]">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-6 py-2.5 bg-white border border-[#c8d8e8] text-primary-dark font-bold rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                >
                  Fechar Visualização
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
