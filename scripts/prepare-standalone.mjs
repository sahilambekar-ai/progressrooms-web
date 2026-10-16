import { cp, access } from "node:fs/promises";
import path from "node:path";

const distDir = process.env.NEXT_DIST_DIR || ".next";
const standalone = path.join(distDir, "standalone");
await access(path.join(standalone, "server.js"));
await cp("public", path.join(standalone, "public"), { recursive: true });
await cp(path.join(distDir, "static"), path.join(standalone, distDir, "static"), { recursive: true });
console.log(`Standalone deployment prepared in ${standalone}`);
