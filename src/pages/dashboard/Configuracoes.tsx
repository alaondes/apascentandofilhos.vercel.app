import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Settings,
  Bell,
  Mail,
  Smartphone,
  Shield,
  Lock,
  Eye,
  Trash2,
  HelpCircle,
  Save,
  CheckCircle2,
  AlertTriangle,
  Key,
} from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import { useFirebase } from "../../context/FirebaseContext";
import { doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../../lib/firebase";

export default function Configuracoes() {
  const { user, profile } = useFirebase();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  // States para configurações
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifWhatsApp, setNotifWhatsApp] = useState(true);
  const [notifPush, setNotifPush] = useState(false);

  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [perfilPublico, setPerfilPublico] = useState(false);

  const [activeTab, setActiveTab] = useState("geral");

  const handleSaveSettings = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    setSuccess(null);
    try {
      // Simular salvamento
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Opcional: Salvar no Firestore no documento do usuário
      // await updateDoc(doc(db, 'users', auth.currentUser.uid), {
      //   settings: {
      //     notifEmail,
      //     notifWhatsApp,
      //     notifPush,
      //     twoFactorAuth,
      //     perfilPublico
      //   }
      // });

      setSuccess("Configurações salvas com sucesso!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Erro ao salvar configurações", error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "geral", label: "Geral", icon: Settings },
    { id: "notificacoes", label: "Notificações", icon: Bell },
    { id: "privacidade", label: "Privacidade & Segurança", icon: Shield },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-serif font-bold text-primary-dark flex items-center gap-3">
              <Settings className="text-primary-base" /> Configurações
            </h1>
            <p className="text-gray-600 mt-1">
              Gerencie as preferências da sua conta.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSaveSettings}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary-base hover:bg-primary-dark text-white rounded-xl font-bold transition-colors disabled:opacity-70"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save size={18} /> Salvar Alterações
              </>
            )}
          </button>
        </div>

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-200 flex items-center gap-3"
          >
            <CheckCircle2 className="text-emerald-500 shrink-0" />
            <p className="font-medium text-sm">{success}</p>
          </motion.div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex overflow-x-auto border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-semibold text-sm whitespace-nowrap transition-colors relative ${
                  activeTab === tab.id
                    ? "text-primary-base"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <tab.icon size={18} /> {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTabConfig"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-base"
                  />
                )}
              </button>
            ))}
          </div>

          <div className="p-6 sm:p-8">
            <div
              className={`space-y-8 ${activeTab === "geral" ? "block" : "hidden"}`}
            >
              <section>
                <h3 className="text-lg font-bold text-primary-dark mb-4">
                  Aparência do Sistema
                </h3>
                <div className="bg-[#f7fafd] border border-[#e2eaf3] rounded-xl p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">Tema</p>
                      <p className="text-sm text-gray-500">
                        Escolha o visual do portal.
                      </p>
                    </div>
                    <select className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:border-primary-base">
                      <option value="light">Claro (Padrão)</option>
                      <option value="auto">Automático (Sistema)</option>
                    </select>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold text-primary-dark mb-4">
                  Idioma
                </h3>
                <div className="bg-[#f7fafd] border border-[#e2eaf3] rounded-xl p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">
                        Idioma da Interface
                      </p>
                      <p className="text-sm text-gray-500">
                        Altere o idioma principal do portal.
                      </p>
                    </div>
                    <select className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:border-primary-base">
                      <option value="pt-BR">Português (Brasil)</option>
                      <option value="en">English</option>
                      <option value="es">Español</option>
                    </select>
                  </div>
                </div>
              </section>
            </div>

            <div
              className={`space-y-8 ${activeTab === "notificacoes" ? "block" : "hidden"}`}
            >
              <section>
                <h3 className="text-lg font-bold text-primary-dark mb-4">
                  Canais de Contato
                </h3>

                <div className="space-y-4">
                  <label className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 hover:border-primary-base/40 hover:bg-[#f7fafd] cursor-pointer transition-colors cursor-pointer cursor-pointer">
                    <div className="mt-0.5">
                      <input
                        type="checkbox"
                        checked={notifEmail}
                        onChange={(e) => setNotifEmail(e.target.checked)}
                        className="w-5 h-5 text-primary-base rounded border-gray-300 focus:ring-primary-base"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Mail size={16} className="text-gray-500" />
                        <p className="font-semibold text-gray-800">
                          Alertas por E-mail
                        </p>
                      </div>
                      <p className="text-sm text-gray-500">
                        Receba resumos semanais, avisos de reuniões e relatórios
                        pendentes no seu e-mail.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 hover:border-primary-base/40 hover:bg-[#f7fafd] cursor-pointer transition-colors cursor-pointer cursor-pointer">
                    <div className="mt-0.5">
                      <input
                        type="checkbox"
                        checked={notifWhatsApp}
                        onChange={(e) => setNotifWhatsApp(e.target.checked)}
                        className="w-5 h-5 text-primary-base rounded border-gray-300 focus:ring-primary-base"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Smartphone size={16} className="text-green-600" />
                        <p className="font-semibold text-gray-800">
                          Alertas por WhatsApp
                        </p>
                      </div>
                      <p className="text-sm text-gray-500">
                        Notificações rápidas e importantes diretamente no seu
                        celular (requer número válido cadastrado).
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 hover:border-primary-base/40 hover:bg-[#f7fafd] cursor-pointer transition-colors cursor-pointer cursor-pointer">
                    <div className="mt-0.5">
                      <input
                        type="checkbox"
                        checked={notifPush}
                        onChange={(e) => setNotifPush(e.target.checked)}
                        className="w-5 h-5 text-primary-base rounded border-gray-300 focus:ring-primary-base"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Bell size={16} className="text-gray-500" />
                        <p className="font-semibold text-gray-800">
                          Notificações no Navegador
                        </p>
                      </div>
                      <p className="text-sm text-gray-500">
                        Seja notificado em tempo real pelo navegador quando
                        houver novidades na plataforma.
                      </p>
                    </div>
                  </label>
                </div>
              </section>
            </div>

            <div
              className={`space-y-8 ${activeTab === "privacidade" ? "block" : "hidden"}`}
            >
              <section>
                <h3 className="text-lg font-bold text-primary-dark mb-4">
                  Segurança da Conta
                </h3>

                <div className="space-y-4 mb-8">
                  <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center p-5 border border-gray-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Key size={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          Senha da Conta
                        </p>
                        <p className="text-sm text-gray-500">
                          Sua senha foi alterada pela última vez há 3 meses.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        (window.location.href =
                          "/dashboard/meus-dados?tab=seguranca")
                      }
                      className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 w-full sm:w-auto"
                    >
                      Alterar Senha
                    </button>
                  </div>

                  <label className="flex items-center justify-between p-5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <Shield size={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          Autenticação em Duas Etapas
                        </p>
                        <p className="text-sm text-gray-500">
                          Adicione uma camada extra de segurança (Recomendado).
                        </p>
                      </div>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={twoFactorAuth}
                        onChange={(e) => setTwoFactorAuth(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-base"></div>
                    </div>
                  </label>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold text-primary-dark mb-4">
                  Privacidade
                </h3>

                <label className="flex items-center justify-between p-5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                      <Eye size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        Perfil Público para Outros Líderes
                      </p>
                      <p className="text-sm text-gray-500">
                        Permitir que outros líderes de grupo vejam seu contato.
                      </p>
                    </div>
                  </div>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={perfilPublico}
                      onChange={(e) => setPerfilPublico(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-base"></div>
                  </div>
                </label>
              </section>

              <section className="pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-red-50 p-5 rounded-xl border border-red-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                      <AlertTriangle size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-red-700">Encerrar Conta</p>
                      <p className="text-sm text-red-600/80">
                        Excluir permanentemente sua conta e seus dados do
                        sistema.
                      </p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-600 hover:text-white transition-colors w-full sm:w-auto">
                    Excluir Conta
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
