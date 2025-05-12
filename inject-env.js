// inject-env.js
const fs = require("fs");

const envMap = {
  __API_KEY__: process.env.API_KEY,
  __AUTH_DOMAIN__: process.env.AUTH_DOMAIN,
  __PROJECT_ID__: process.env.PROJECT_ID,
  __STORAGE_BUCKET__: process.env.STORAGE_BUCKET,
  __MESSAGING_SENDER_ID__: process.env.MESSAGING_SENDER_ID,
  __APP_ID__: process.env.APP_ID,
};

const indexPath = "index.html";
let html = fs.readFileSync(indexPath, "utf-8");

for (const [key, value] of Object.entries(envMap)) {
  html = html.replace(new RegExp(key, "g"), value);
}

fs.writeFileSync(indexPath, html);
console.log("✅ Environment variables injected into index.html");
