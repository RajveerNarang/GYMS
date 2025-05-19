require("dotenv").config();
const fs = require("fs");

const replacements = {
  __FIREBASE_API_KEY__: process.env.FIREBASE_API_KEY,
  __FIREBASE_AUTH_DOMAIN__: process.env.FIREBASE_AUTH_DOMAIN,
  __FIREBASE_PROJECT_ID__: process.env.FIREBASE_PROJECT_ID,
  __FIREBASE_STORAGE_BUCKET__: process.env.FIREBASE_STORAGE_BUCKET,
  __FIREBASE_MESSAGING_SENDER_ID__: process.env.FIREBASE_MESSAGING_SENDER_ID,
  __FIREBASE_APP_ID__: process.env.FIREBASE_APP_ID,
};

let html = fs.readFileSync("index.html", "utf8");
for (const [key, value] of Object.entries(replacements)) {
  html = html.replace(new RegExp(key, "g"), value || "");
}
fs.writeFileSync("index.html", html);
console.log("✅ Firebase config injected.");
