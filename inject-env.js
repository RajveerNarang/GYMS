const fs = require("fs");

const env = {
  FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
};

let html = fs.readFileSync("index.html", "utf8");

Object.keys(env).forEach((key) => {
  const placeholder = `__${key}__`;
  html = html.replaceAll(placeholder, env[key]);
});

fs.writeFileSync("index.html", html, "utf8");
console.log("✅ Firebase config injected into index.html");
