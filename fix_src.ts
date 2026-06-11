import fs from 'fs';
import path from 'path';

function fixDir(dir: string) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const fullPath = path.join(dir, f);
    if (fs.statSync(fullPath).isDirectory()) {
      fixDir(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const orig = content;
      content = content.replace(/src=\{([a-zA-Z0-9_.]+(?:\[[^\]]+\])?(?:(?:\?\.|\.)?[a-zA-Z0-9_]*)*)\}/g, "src={$1 || undefined}");
      if (orig !== content) {
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

fixDir('src/pages/dashboard');
