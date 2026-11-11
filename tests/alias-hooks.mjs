import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function resolveAlias(specifier) {
  const relative = specifier.slice(2);
  const candidates = [
    path.join(root, `${relative}.ts`),
    path.join(root, `${relative}.tsx`),
    path.join(root, relative, "index.ts"),
    path.join(root, relative),
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return pathToFileURL(candidate).href;
    }
  }

  return pathToFileURL(path.join(root, relative)).href;
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    return {
      shortCircuit: true,
      url: resolveAlias(specifier),
    };
  }

  return nextResolve(specifier, context);
}
