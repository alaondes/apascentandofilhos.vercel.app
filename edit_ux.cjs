const fs = require('fs');

let content = fs.readFileSync('src/pages/dashboard/MeusDados.tsx', 'utf8');

if (!content.includes('import toast from "react-hot-toast"')) {
    content = content.replace('import { useLocation } from "react-router-dom";', 'import { useLocation } from "react-router-dom";\nimport toast from "react-hot-toast";');
}

if (!content.includes('const [isEditing, setIsEditing] = useState(false)')) {
    content = content.replace('const [loadingAvatar, setLoadingAvatar] = useState(false);', 'const [loadingAvatar, setLoadingAvatar] = useState(false);\n  const [isEditing, setIsEditing] = useState(false);\n  const [errors, setErrors] = useState<any>({});');
}

const validationCode = `
  const validateField = (id: string, value: string) => {
    let err = "";
    if (id === "email" || id === "emailEsposa") {
      if (value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,4}$/i.test(value)) {
        err = "E-mail inválido";
      }
    }
    setErrors((prev: any) => ({ ...prev, [id]: err }));
  };
`;
if (!content.includes('const validateField')) {
    content = content.replace('const handleInputChange = (', validationCode + '\n  const handleInputChange = (');
}

content = content.replace('setFormData((prev) => ({ ...prev, [id]: value }));', 'setFormData((prev) => ({ ...prev, [id]: value }));\n    validateField(id, value);');

content = content.replace(/setSuccess\("(.+?)"\);/g, 'toast.success("$1");');
content = content.replace(/setError\("(.+?)"\);/g, 'toast.error("$1");');
content = content.replace(/setTimeout\(\(\) => setSuccess\(null\), 3000\);/g, '');

const editBtn = `
                  <div className="flex justify-end mb-4">
                    {!isEditing ? (
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-[#3b7197] text-white text-sm font-bold rounded-lg hover:bg-[#2c5877] transition-colors"
                      >
                        Editar Perfil
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Cancelar Edição
                      </button>
                    )}
                  </div>
`;

content = content.replaceAll('<form onSubmit={handleSaveProfile} className="space-y-6">', editBtn + '\n<form onSubmit={handleSaveProfile} className="space-y-6">');

// We have inputs with ids. Let's do a targeted replace for them.
const ids = ["nome", "cpf", "dataNascimento", "telefone", "celular", "email", "profissao", "igreja", "observacoes", "cep", "endereco", "numero", "bairro", "cidade", "estado", "nomeEsposa", "cpfEsposa", "dataNascimentoEsposa", "telefoneEsposa", "emailEsposa"];

for (const id of ids) {
    const regex1 = new RegExp(`(<input[^>]*id="${id}"[^>]*className="form-input"([^>]*)>)`, "g");
    content = content.replace(regex1, `<input id="${id}" disabled={!isEditing} className={\`form-input \${errors.${id} ? "border-red-500 bg-red-50" : ""} \${!isEditing ? "opacity-70 bg-gray-50 cursor-not-allowed" : ""}\`} $2 />\n                        {errors.${id} && <span className="text-red-500 text-xs mt-1 block">{errors.${id}}</span>}`);
    
    // For inputs with extra classes like pr-10
    const regex2 = new RegExp(`(<input[^>]*id="${id}"[^>]*className="form-input pr-10"([^>]*)>)`, "g");
    content = content.replace(regex2, `<input id="${id}" disabled={!isEditing} className={\`form-input pr-10 \${errors.${id} ? "border-red-500 bg-red-50" : ""} \${!isEditing ? "opacity-70 bg-gray-50 cursor-not-allowed" : ""}\`} $2 />\n                        {errors.${id} && <span className="text-red-500 text-xs mt-1 block">{errors.${id}}</span>}`);
    
    const regex3 = new RegExp(`(<textarea[^>]*id="${id}"[^>]*className="form-input resize-y min-h-\\[100px\\]"([^>]*)>(.*?)</textarea>)`, "g");
    content = content.replace(regex3, `<textarea id="${id}" disabled={!isEditing} className={\`form-input resize-y min-h-[100px] \${!isEditing ? "opacity-70 bg-gray-50 cursor-not-allowed" : ""}\`} $2>$3</textarea>`);

    const regex4 = new RegExp(`(<select[^>]*id="${id}"[^>]*className="form-input"([^>]*)>([\\s\\S]*?)</select>)`, "gi");
    content = content.replace(regex4, `<select id="${id}" disabled={!isEditing} className={\`form-input \${!isEditing ? "opacity-70 bg-gray-50 cursor-not-allowed" : ""}\`} $2>$3</select>`);
}

// Ensure the Save button is also hidden when not editing
content = content.replaceAll('<button\n                        type="submit"\n                        disabled={loading}', '{isEditing && (\n<button\n                        type="submit"\n                        disabled={loading}');

content = content.replaceAll('Salvar Endereço\n                      </button>', 'Salvar Endereço\n                      </button>\n)}');
content = content.replaceAll('Salvar Dados Pessoais\n                      </button>', 'Salvar Dados Pessoais\n                      </button>\n)}');
content = content.replaceAll('Salvar Dados do Cônjuge\n                      </button>', 'Salvar Dados do Cônjuge\n                      </button>\n)}');

fs.writeFileSync('src/pages/dashboard/MeusDados.tsx', content);

// Also update MeusRegistros.tsx
let registros = fs.readFileSync('src/pages/dashboard/MeusRegistros.tsx', 'utf8');
if (!registros.includes('Empty box placeholder')) {
    registros = registros.replace(
        '<div className="bg-white border-x border-b border-[#eee8df] p-20 text-center rounded-b-[14px]">\n            <p className="text-gray-400 italic font-medium">\n              Nenhum relatório encontrado.\n            </p>\n          </div>',
        `<div className="bg-white border-x border-b border-[#eee8df] p-20 text-center rounded-b-[14px] flex flex-col items-center justify-center">
            {/* Empty box placeholder */}
            <div className="w-24 h-24 mb-4 text-gray-300">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
               </svg>
            </div>
            <p className="text-gray-500 font-medium mb-3">
              Você ainda não enviou nenhum relatório ou se inscreveu em nenhum curso. Que tal começar agora?
            </p>
          </div>`
    );
    fs.writeFileSync('src/pages/dashboard/MeusRegistros.tsx', registros);
}
