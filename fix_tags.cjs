const fs = require('fs');
let content = fs.readFileSync('src/pages/dashboard/MeusDados.tsx', 'utf8');
content = content.replace(/\/ \/>/g, '/>');
fs.writeFileSync('src/pages/dashboard/MeusDados.tsx', content);
