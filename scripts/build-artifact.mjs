// Builds the standalone Prosely page (artifact/prosely.html): the engine bundled
// into a single script and inlined into artifact/prosely.template.html.
// Usage: npm run build:artifact
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const tmp = mkdtempSync(join(tmpdir(), "prosely-artifact-"));
const entry = join(tmp, "entry.ts");
const bundle = join(tmp, "engine.iife.js");

writeFileSync(
  entry,
  `export * from "${join(root, "src/lib/engine/index")}";\nexport { diffWords } from "${join(root, "src/lib/diff")}";\n`,
);
execFileSync(
  "npx",
  ["--yes", "esbuild@0.25.9", entry, "--bundle", "--format=iife", "--global-name=Prosely", "--minify", "--target=es2020", `--outfile=${bundle}`],
  { stdio: "inherit", cwd: root },
);

const engine = readFileSync(bundle, "utf8");
if (engine.includes("</script")) throw new Error("engine bundle contains a closing script tag");
const template = readFileSync(join(root, "artifact/prosely.template.html"), "utf8");
if (!template.includes("/*__ENGINE__*/")) throw new Error("template is missing the /*__ENGINE__*/ placeholder");
const out = template.split("/*__ENGINE__*/").join(engine);
writeFileSync(join(root, "artifact/prosely.html"), out);
console.log(`artifact/prosely.html written (${(out.length / 1024).toFixed(0)} KB)`);
