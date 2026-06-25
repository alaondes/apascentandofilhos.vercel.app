const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const indexHtml = fs.readFileSync('dist/index.html', 'utf8');

const virtualConsole = new (require('jsdom')).VirtualConsole();
virtualConsole.on("error", (err) => {
  console.error("JSDOM ERROR:", err);
});
virtualConsole.on("jsdomError", (err) => {
  console.error("JSDOM JSDOMERROR:", err);
});
virtualConsole.on("log", (log) => {
  console.log("JSDOM LOG:", log);
});

const dom = new JSDOM(indexHtml, {
  runScripts: "dangerously",
  resources: "usable",
  url: "http://localhost:3000/",
  virtualConsole
});

setTimeout(() => {
    console.log("BODY CONTENT:", dom.window.document.body.innerHTML);
    process.exit(0);
}, 3000);
