import fs from "fs";
import path from "path";

import deepMerge from "./deepMerge";
import sortDependencies from "./sortDependencies";

export default async function renderTemplate(src: string, dest: string) {
  const stats = fs.statSync(src);

  if (stats.isDirectory()) {
    // skip node_module
    if (path.basename(src) === "node_modules") {
      return;
    }

    // if it's a directory, render its subdirectories and files recursively
    fs.mkdirSync(dest, { recursive: true });
    for (const file of fs.readdirSync(src)) {
      await renderTemplate(path.resolve(src, file), path.resolve(dest, file));
    }
    return;
  }

  const filename = path.basename(src);

  if (filename === "package.json" && fs.existsSync(dest)) {
    // merge instead of overwriting
    const newPackage = JSON.parse(fs.readFileSync(src, "utf8"));
    renderPackageJson(newPackage, dest);
    return;
  }
  // copy file
  fs.copyFileSync(src, dest);
}

export function renderPackageJson(json: Record<string, any>, dest: string) {
  if (fs.existsSync(dest)) {
    const existing = JSON.parse(fs.readFileSync(dest, "utf8"));
    const newPackage = json;
    const pkg = sortDependencies(deepMerge(existing, newPackage));
    fs.writeFileSync(dest, JSON.stringify(pkg, null, 2) + "\n");
  } else {
    fs.writeFileSync(dest, JSON.stringify(json, null, 2) + "\n");
  }
}
