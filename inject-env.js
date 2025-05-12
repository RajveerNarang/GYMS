const fs = require("fs");

const env = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

let html = fs.readFileSync("index.html", "utf8");

Object.keys(env).forEach((key) => {
  const placeholder = `__${key.toUpperCase()}__`;
  html = html.replaceAll(placeholder, env[key]);
});

fs.writeFileSync("index.html", html, "utf8");
console.log("✅ Firebase config injected into index.html");
