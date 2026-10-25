import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const target = args[0] && !args[0].startsWith("-") ? args.shift().toLowerCase() : undefined;
const next = fileURLToPath(new URL("../node_modules/next/dist/bin/next", import.meta.url));
// Preserve conventional `npm start` behavior for deployments with a built app.
if (!target) {
  const child = spawn(process.execPath, [next, "start", ...args], { stdio: "inherit", env: process.env });
  child.on("exit", code => process.exit(code ?? 1));
} else {
  if (!["dev", "uat", "prod"].includes(target)) {
    console.error("Use npm start dev|uat|prod, or npm run start:dev|start:uat|start:prod.");
    process.exit(1);
  }
  const configured = process.env[`PROGRESSROOMS_${target.toUpperCase()}_API_URL`];
  const api = configured || { dev: "http://127.0.0.1:8000/api/v1", uat: "https://uat.progressrooms.com/api/v1", prod: "https://progressrooms.com/api/v1" }[target];
  const url = new URL(api);
  if (!url.pathname.replace(/\/$/, "").endsWith("/api/v1") || !["http:", "https:"].includes(url.protocol) || url.username || url.password || url.search || url.hash || (target !== "dev" && url.protocol !== "https:")) {
    throw new Error("API target must be an HTTP(S) API base ending in /api/v1; remote targets require HTTPS and no embedded credentials.");
  }
  const env = { ...process.env, NODE_ENV: "development", NEXT_PUBLIC_APP_ENV: target, NEXT_PUBLIC_API_URL: "/api/v1", API_URL: api.replace(/\/$/, ""), API_PROXY_TARGET: api.replace(/\/$/, ""), NEXT_DIST_DIR: `.next-${target}` };
  console.log(`Frontend: ${target.toUpperCase()} | API: ${url.origin}${url.pathname} | Developer controls: ${target === "dev" ? "local only" : "hidden"}`);
  if (target === "prod") console.log("This connects to production data. Actions in the UI affect production.");
  if (args.includes("--check")) {
    console.log(JSON.stringify({ target, browserApi: env.NEXT_PUBLIC_API_URL, serverApi: env.API_URL, cache: env.NEXT_DIST_DIR, developerControls: target === "dev" }));
    process.exit(0);
  }
  const child = spawn(process.execPath, [next, "dev", ...args], { stdio: "inherit", env });
  child.on("error", error => { console.error(error.message); process.exit(1); });
  child.on("exit", code => process.exit(code ?? 1));
  for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => child.kill(signal));
}
