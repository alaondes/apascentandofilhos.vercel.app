import React, { useState, useEffect } from "react";
import { X, Check, User, Heart, MapPin, CheckSquare } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";

interface CourseRegistrationModalProps {
  courseTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

interface FormField {
  id: string;
  label: string;
  type: "text" | "number" | "email" | "tel" | "select" | "checkbox";
  required: boolean;
  options?: string[];
  maskType?: "none" | "cpf" | "cep" | "date" | "phone" | "numbers_only" | "email";
  section?: "personal" | "spouse" | "address" | "confirmations";
}

export default function CourseRegistrationModal({
  courseTitle,
  isOpen,
  onClose,
}: CourseRegistrationModalProps) {
  const [fields, setFields] = useState<FormField[]>([]);
  const [loadingForm, setLoadingForm] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCepLoading, setIsCepLoading] = useState(false);

  const defaultFields: FormField[] = [
    { id: "nome", label: "Nome Completo", type: "text", required: true, maskType: "none", section: "personal" },
    { id: "cpf", label: "CPF", type: "text", required: true, maskType: "cpf", section: "personal" },
    { id: "dataNascimento", label: "Data de Nascimento", type: "text", required: true, maskType: "date", section: "personal" },
    { id: "celular", label: "Celular", type: "tel", required: true, maskType: "phone", section: "personal" },
    { id: "email", label: "E-mail", type: "email", required: true, maskType: "none", section: "personal" },
    { id: "igreja", label: "Igreja que frequenta", type: "text", required: true, maskType: "none", section: "personal" },
    
    { id: "nomeEsposa", label: "Nome Completo do Cônjuge", type: "text", required: false, maskType: "none", section: "spouse" },
    { id: "cpfEsposa", label: "CPF do Cônjuge", type: "text", required: false, maskType: "cpf", section: "spouse" },
    { id: "dataNascimentoEsposa", label: "Data de Nascimento do Cônjuge", type: "text", required: false, maskType: "date", section: "spouse" },
    { id: "telefoneEsposa", label: "Celular do Cônjuge", type: "tel", required: false, maskType: "phone", section: "spouse" },
    { id: "emailEsposa", label: "E-mail do Cônjuge", type: "email", required: false, maskType: "none", section: "spouse" },

    { id: "cep", label: "CEP", type: "text", required: true, maskType: "cep", section: "address" },
    { id: "rua", label: "Rua / Logradouro", type: "text", required: true, maskType: "none", section: "address" },
    { id: "numero", label: "Número", type: "text", required: true, maskType: "none", section: "address" },
    { id: "bairro", label: "Bairro", type: "text", required: true, maskType: "none", section: "address" },
    { id: "cidade", label: "Cidade", type: "text", required: true, maskType: "none", section: "address" },
    { id: "estado", label: "Estado", type: "select", required: true, maskType: "none", section: "address", options: ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"] },

    { id: "treinamento", label: "Confirmo ter concluído o treinamento de liderança do ministério", type: "checkbox", required: true, maskType: "none", section: "confirmations" },
    { id: "termos", label: "Declaro aceitar os Termos e Políticas de Privacidade", type: "checkbox", required: true, maskType: "none", section: "confirmations" }
  ];

  // Helper to determine active mask formatting dynamically
  const getMaskType = (field: FormField): string => {
    if (field.maskType && field.maskType !== "none") {
      return field.maskType;
    }
    // Fallbacks if maskType is not specified on the field directly
    const idLower = field.id.toLowerCase();
    const labelLower = field.label.toLowerCase();
    
    if (
      field.type === "email" ||
      idLower.includes("email") ||
      idLower.includes("e-mail") ||
      labelLower.includes("email") ||
      labelLower.includes("e-mail")
    ) {
      return "email";
    }
    if (
      field.type === "tel" ||
      idLower.includes("whatsapp") ||
      idLower.includes("tel") ||
      labelLower.includes("telefone") ||
      labelLower.includes("celular") ||
      labelLower.includes("whatsapp")
    ) {
      return "phone";
    }
    if (idLower.includes("cpf") || labelLower.includes("cpf")) {
      return "cpf";
    }
    if (idLower.includes("cep") || labelLower.includes("cep")) {
      return "cep";
    }
    if (
      idLower.includes("data") ||
      labelLower.includes("data") ||
      labelLower.includes("nascimento") ||
      idLower.includes("birth")
    ) {
      return "date";
    }
    if (
      field.type === "number" ||
      idLower.includes("numero") ||
      labelLower.includes("número") ||
      labelLower.includes("idade")
    ) {
      return "numbers_only";
    }
    return "none";
  };

  // Format inputs using character and format limits in real-time
  const applyMask = (value: string, maskType?: string): string => {
    if (!maskType || maskType === "none") return value;

    // Filter non-digits
    const digits = value.replace(/\D/g, "");

    switch (maskType) {
      case "numbers_only":
        return digits;

      case "cpf": {
        const val = digits.slice(0, 11);
        if (val.length <= 3) return val;
        if (val.length <= 6) return `${val.slice(0, 3)}.${val.slice(3)}`;
        if (val.length <= 9) return `${val.slice(0, 3)}.${val.slice(3, 6)}.${val.slice(6)}`;
        return `${val.slice(0, 3)}.${val.slice(3, 6)}.${val.slice(6, 9)}-${val.slice(9)}`;
      }

      case "cep": {
        const val = digits.slice(0, 8);
        if (val.length <= 5) return val;
        return `${val.slice(0, 5)}-${val.slice(5)}`;
      }

      case "date": {
        const val = digits.slice(0, 8);
        if (val.length <= 2) return val;
        if (val.length <= 4) return `${val.slice(0, 2)}/${val.slice(2)}`;
        return `${val.slice(0, 2)}/${val.slice(2, 4)}/${val.slice(4)}`;
      }

      case "phone": {
        const val = digits.slice(0, 11);
        if (val.length <= 2) {
          return val.length > 0 ? `(${val}` : "";
        }
        if (val.length <= 6) {
          return `(${val.slice(0, 2)}) ${val.slice(2)}`;
        }
        if (val.length <= 10) {
          return `(${val.slice(0, 2)}) ${val.slice(2, 6)}-${val.slice(6)}`;
        }
        return `(${val.slice(0, 2)}) ${val.slice(2, 7)}-${val.slice(7)}`;
      }

      default:
        return value;
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    setSubmitted(false);
    setLoadingForm(true);
    setErrors({});
    setFormValues({});

    async function loadFormSchema() {
      try {
        const formRef = doc(db, "course_forms", courseTitle);
        const snap = await getDoc(formRef);
        if (snap.exists() && snap.data().fields) {
          setFields(snap.data().fields);
        } else {
          setFields(defaultFields);
        }
      } catch (err) {
        console.error("Erro ao carregar formato do formulário, usando fallback padrão.", err);
        setFields(defaultFields);
      } finally {
        setLoadingForm(false);
      }
    }

    loadFormSchema();
  }, [courseTitle, isOpen]);

  const fetchAddressByCep = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) return;
    setIsCepLoading(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();
      if (data && !data.erro) {
        setFormValues((prev) => {
          const renewed = { ...prev };
          const ruaField = fields.find(
            (f) =>
              f.id === "rua" ||
              f.id.toLowerCase().includes("rua") ||
              f.id.toLowerCase().includes("endereco") ||
              f.id.toLowerCase().includes("endereço") ||
              f.id.toLowerCase().includes("logradouro") ||
              f.label.toLowerCase().includes("rua") ||
              f.label.toLowerCase().includes("logradouro") ||
              f.label.toLowerCase().includes("endereço") ||
              f.label.toLowerCase().includes("endereco")
          );
          const bairroField = fields.find(
            (f) =>
              f.id === "bairro" ||
              f.id.toLowerCase().includes("bairro") ||
              f.label.toLowerCase().includes("bairro")
          );
          const cidadeField = fields.find(
            (f) =>
              f.id === "cidade" ||
              f.id.toLowerCase().includes("cidade") ||
              f.id.toLowerCase().includes("municipio") ||
              f.id.toLowerCase().includes("município") ||
              f.label.toLowerCase().includes("cidade") ||
              f.label.toLowerCase().includes("município") ||
              f.label.toLowerCase().includes("municipio")
          );
          const estadoField = fields.find(
            (f) =>
              f.id === "estado" ||
              f.id.toLowerCase().includes("estado") ||
              f.id.toLowerCase().includes("uf") ||
              f.label.toLowerCase().includes("estado") ||
              f.label.toLowerCase().includes("uf") ||
              f.label.toLowerCase().includes("u.f.")
          );

          if (ruaField && data.logradouro) renewed[ruaField.id] = data.logradouro;
          if (bairroField && data.bairro) renewed[bairroField.id] = data.bairro;
          if (cidadeField && data.localidade) renewed[cidadeField.id] = data.localidade;
          if (estadoField && data.uf) renewed[estadoField.id] = data.uf;

          return renewed;
        });
      }
    } catch (err) {
      console.error("Erro ao buscar dados do CEP:", err);
    } finally {
      setIsCepLoading(false);
    }
  };

  // Handle Input Changes
  const handleInputChange = (fieldId: string, value: any) => {
    setFormValues((prev) => ({
      ...prev,
      [fieldId]: value,
    }));

    if (errors[fieldId]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[fieldId];
        return copy;
      });
    }

    // Auto-fill address on CEP
    const matchedField = fields.find((f) => f.id === fieldId);
    if (matchedField) {
      const mask = getMaskType(matchedField);
      if (mask === "cep") {
        const digits = String(value).replace(/\D/g, "");
        if (digits.length === 8) {
          fetchAddressByCep(digits);
        }
      }
    }
  };

  // Validate form before submission
  const validate = () => {
    const newErrors: Record<string, string> = {};
    fields.forEach((field) => {
      const val = formValues[field.id];
      if (field.required && (val === undefined || val === null || val === "" || val === false)) {
        newErrors[field.id] = `O campo "${field.label}" é obrigatório.`;
        return;
      }

      if (!val) return;

      const mask = getMaskType(field);

      if ((field.type === "email" || mask === "email") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        newErrors[field.id] = "Insira um e-mail válido.";
        return;
      }

      const digits = String(val).replace(/\D/g, "");

      if (mask === "cpf" && digits.length !== 11) {
        newErrors[field.id] = "CPF incompleto ou inválido. Deve ter 11 dígitos.";
      } else if (mask === "cep" && digits.length !== 8) {
        newErrors[field.id] = "CEP incompleto ou inválido. Deve ter 8 dígitos.";
      } else if (mask === "date" && digits.length !== 8) {
        newErrors[field.id] = "Data incompleta. Use o formato DD/MM/AAAA.";
      } else if (mask === "phone" && (digits.length < 10 || digits.length > 11)) {
        newErrors[field.id] = "Telefone incompleto. Deve incluir DDD e ter 10 ou 11 dígitos.";
      } else if (mask === "date" && digits.length === 8) {
        // Date numbers validation
        const day = parseInt(digits.slice(0, 2));
        const month = parseInt(digits.slice(2, 4));
        const year = parseInt(digits.slice(4));
        if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > 2100) {
          newErrors[field.id] = "Data inválida ou fora de alcance.";
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit registration to Firestore
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const path = "course_registrations";

    try {
      // Build dynamic payload mapping
      const payload: Record<string, any> = {
        courseTitle,
        formData: formValues,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, path), payload);
      setSubmitted(true);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Modal body */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl md:max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl z-10 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-primary-dark text-white shadow-md">
            <div>
              <span className="text-[10px] uppercase tracking-widest font-black text-primary-light">
                Matrícula aberta
              </span>
              <h3 className="text-xl font-serif font-bold text-white max-w-xs truncate md:max-w-md">
                {courseTitle}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-white/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form Content area */}
          <div className="flex-1 overflow-y-auto px-6 py-6 bg-gray-50/50 font-sans">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center text-center py-10"
              >
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <Check size={36} />
                </div>
                <h4 className="text-2xl font-serif font-bold text-primary-dark mb-4">
                  Matrícula Realizada!
                </h4>
                <p className="text-[#2c4a63] leading-relaxed max-w-md mb-8">
                  Sua inscrição para o curso <strong>{courseTitle}</strong> foi concluída com sucesso. Nossa equipe entrará em contato em breve.
                </p>
                <button
                  onClick={onClose}
                  className="px-8 py-3 bg-primary-base font-bold text-white rounded-xl shadow-lg hover:bg-primary-dark transition-all transform hover:-translate-y-0.5 cursor-pointer"
                >
                  Concluir
                </button>
              </motion.div>
            ) : loadingForm ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-solid border-primary-base border-t-transparent" />
                <p className="text-sm text-[#2c4a63] font-medium animate-pulse">
                  Carregando formulário...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
                <p className="text-xs font-semibold text-[#1c3c5a] bg-[#f0f6fc] px-4 py-3 rounded-xl border border-[#d2e2f2]">
                  Preencha os dados abaixo agrupados em seções para concluir seu pedido de matrícula para o curso <strong>{courseTitle}</strong>.
                </p>

                {(() => {
                  const personalFields = fields.filter((f) => !f.section || f.section === "personal");
                  const spouseFields = fields.filter((f) => f.section === "spouse");
                  const addressFields = fields.filter((f) => f.section === "address");
                  const confirmationFields = fields.filter((f) => f.section === "confirmations");

                  const renderField = (field: FormField) => {
                    const hasError = !!errors[field.id];
                    const isCheckbox = field.type === "checkbox";

                    return (
                      <div key={field.id} className={`flex flex-col space-y-1.5 ${isCheckbox ? "col-span-full py-1" : ""}`}>
                        {!isCheckbox && (
                          <label className="text-xs font-bold text-primary-dark flex items-center justify-between leading-none w-full">
                            <span className="flex items-center gap-1">
                              {field.label}
                              {field.required && (
                                <span className="text-rose-500 font-bold" title="Obrigatório">
                                  *
                                </span>
                              )}
                            </span>
                            {getMaskType(field) === "cep" && isCepLoading && (
                              <span className="text-[10px] font-black text-[#1a6496] animate-pulse flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#1a6496] animate-ping" />
                                Buscando endereço pelo CEP...
                              </span>
                            )}
                          </label>
                        )}

                        {field.type === "select" ? (
                          <select
                            value={formValues[field.id] || ""}
                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                            className={`w-full rounded-xl border px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-base/10 transition-all font-semibold ${
                              hasError
                                ? "border-rose-400 bg-rose-50/10 focus:border-rose-500"
                                : "border-[#c8d8e8] bg-white focus:border-primary-base"
                            }`}
                          >
                            <option value="">Selecione uma opção...</option>
                             {(() => {
                              const labelLower = field.label.toLowerCase();
                              const isStateField = labelLower.includes("estado") || labelLower === "uf" || labelLower.includes("u.f.") || labelLower.includes("província") || labelLower.includes("região");
                              const isYesNoField = labelLower.includes("vez") || labelLower.includes("igreja") || labelLower.includes("primeira") || labelLower.includes("1ª") || labelLower.includes("sim/não") || labelLower.includes("sim ou não") || labelLower.includes("sim/nao") || labelLower.endsWith("?");
                              
                              let opts = field.options || [];
                              // Remover opções vazias do banco de dados
                              if (Array.isArray(opts)) {
                                opts = opts.filter((o: any) => o && String(o).trim() !== "");
                              } else {
                                opts = [];
                              }

                              if (isStateField && opts.length === 0) {
                                opts = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];
                              } else if (isYesNoField && opts.length === 0) {
                                opts = ["Sim", "Não"];
                              }
                              
                              return opts.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ));
                            })()}
                          </select>
                        ) : field.type === "checkbox" ? (
                          <label className="inline-flex items-start gap-3 py-1.5 cursor-pointer max-w-fit">
                            <input
                              type="checkbox"
                              checked={!!formValues[field.id]}
                              onChange={(e) => handleInputChange(field.id, e.target.checked)}
                              className="h-5 w-5 mt-0.5 rounded border-[#c8d8e8] text-primary-base focus:ring-primary-base/20 cursor-pointer"
                            />
                            <span className="text-xs font-semibold text-[#2c4a63]">
                              {field.label} {field.required && <span className="text-rose-500 font-bold">*</span>}
                            </span>
                          </label>
                        ) : (
                          <input
                            type={(field.type === "tel" || getMaskType(field) !== "none") ? "text" : field.type}
                            placeholder={
                              getMaskType(field) === "cpf"
                                ? "000.000.000-00"
                                : getMaskType(field) === "cep"
                                ? "00000-000"
                                : getMaskType(field) === "date"
                                ? "DD/MM/AAAA"
                                : getMaskType(field) === "phone"
                                ? "(00) 00000-0000"
                                : (field.type === "email" || getMaskType(field) === "email")
                                ? "seu@email.com"
                                : getMaskType(field) === "numbers_only"
                                ? "Apenas números"
                                : `Digite ${field.label.toLowerCase()}`
                            }
                            value={formValues[field.id] || ""}
                            onChange={(e) => {
                              const rawVal = e.target.value;
                              const mask = getMaskType(field);
                              const maskedVal = applyMask(rawVal, mask);
                              handleInputChange(field.id, maskedVal);
                            }}
                            className={`w-full rounded-xl border px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-base/10 transition-all font-semibold ${
                              hasError
                                ? "border-rose-400 bg-rose-50/10 focus:border-rose-500"
                                : "border-[#c8d8e8] bg-white focus:border-primary-base"
                            }`}
                          />
                        )}

                        {hasError && (
                          <span className="text-[11px] font-bold text-rose-500 mt-0.5">
                            {errors[field.id]}
                          </span>
                        )}
                      </div>
                    );
                  };

                  return (
                    <div className="space-y-6">
                      {/* Section 1: Dados Pessoais */}
                      {personalFields.length > 0 && (
                        <div className="bg-white p-5 border border-[#c8d8e8] rounded-2xl shadow-xs space-y-4">
                          <h4 className="font-serif font-bold text-primary-dark text-sm border-b border-gray-100 pb-2 flex items-center gap-2">
                            <User className="text-primary-base animate-pulse" size={18} />
                            Dados Pessoais
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {personalFields.map(renderField)}
                          </div>
                        </div>
                      )}

                      {/* Section 2: Dados do Cônjuge */}
                      {spouseFields.length > 0 && (
                        <div className="bg-white p-5 border border-[#c8d8e8] rounded-2xl shadow-xs space-y-4">
                          <h4 className="font-serif font-bold text-primary-dark text-sm border-b border-gray-100 pb-2 flex items-center gap-2">
                            <Heart className="text-primary-base" size={18} />
                            Dados do Cônjuge
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {spouseFields.map(renderField)}
                          </div>
                        </div>
                      )}

                      {/* Section 3: Endereço Residencial */}
                      {addressFields.length > 0 && (
                        <div className="bg-white p-5 border border-[#c8d8e8] rounded-2xl shadow-xs space-y-4">
                          <h4 className="font-serif font-bold text-[#203c54] text-sm border-b border-gray-100 pb-2 flex items-center gap-2">
                            <MapPin className="text-primary-base" size={18} />
                            Endereço Residencial
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {addressFields.map(renderField)}
                          </div>
                        </div>
                      )}

                      {/* Section 4: Confirmações */}
                      {confirmationFields.length > 0 && (
                        <div className="bg-white p-5 border border-[#c8d8e8] rounded-2xl shadow-xs space-y-4">
                          <h4 className="font-serif font-bold text-[#203c54] text-sm border-b border-gray-100 pb-2 flex items-center gap-2">
                            <CheckSquare className="text-primary-base" size={18} />
                            Confirmações e Declarações
                          </h4>
                          <div className="grid grid-cols-1 gap-3">
                            {confirmationFields.map(renderField)}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Submit button */}
                <div className="pt-4 border-t border-gray-200 flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3.5 border border-[#c8d8e8] hover:bg-gray-50 rounded-xl font-bold text-primary-dark text-sm transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-3 py-3.5 bg-primary-base hover:bg-primary-dark text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-t-transparent" />
                        Processando...
                      </>
                    ) : (
                      "Confirmar Matrícula"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
