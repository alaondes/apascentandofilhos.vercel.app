const fs = require('fs');
let content = fs.readFileSync('src/pages/dashboard/MeusDados.tsx', 'utf8');

const ids = ["nome", "cpf", "dataNascimento", "telefone", "celular", "email", "profissao", "igreja", "observacoes", "cep", "endereco", "numero", "bairro", "cidade", "estado", "nomeEsposa", "cpfEsposa", "dataNascimentoEsposa", "telefoneEsposa", "emailEsposa"];

for (const id of ids) {
    const searchStr = `id="${id}" disabled={!isEditing} className={\`form-input \${errors.${id} ? "border-red-500 bg-red-50" : ""} \${!isEditing ? "opacity-70 bg-gray-50 cursor-not-allowed" : ""}\`}`;
    content = content.replace(searchStr, searchStr + ` value={formData.${id}} onChange={handleInputChange}`);

    const searchStrPr10 = `id="${id}" disabled={!isEditing} className={\`form-input pr-10 \${errors.${id} ? "border-red-500 bg-red-50" : ""} \${!isEditing ? "opacity-70 bg-gray-50 cursor-not-allowed" : ""}\`}`;
    content = content.replace(searchStrPr10, searchStrPr10 + ` value={formData.${id}} onChange={handleInputChange}`);

    const searchStrTextarea = `id="${id}" disabled={!isEditing} className={\`form-input resize-y min-h-[100px] \${!isEditing ? "opacity-70 bg-gray-50 cursor-not-allowed" : ""}\`}`;
    content = content.replace(searchStrTextarea, searchStrTextarea + ` value={formData.${id}} onChange={handleInputChange}`);

    const searchStrSelect = `id="${id}" disabled={!isEditing} className={\`form-input \${!isEditing ? "opacity-70 bg-gray-50 cursor-not-allowed" : ""}\`}`;
    content = content.replace(searchStrSelect, searchStrSelect + ` value={formData.${id}} onChange={handleInputChange}`);
}

fs.writeFileSync('src/pages/dashboard/MeusDados.tsx', content);
